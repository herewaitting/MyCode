import { Cartesian3 } from "cesium";
import { ILayerOption } from "../../../layerManager";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { ColorMaterial } from "../../../map/material/ColorMaterial";
import { CustomGeometry } from "../../../map/primitive/customGeometry";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class RandomFloatPoint extends Point<ILayerStyle> {
    public workerFunName!: string;
    private material: any;
    private VAO: any;
    private primitive: any;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        this.resetMaterial(style);
        if (style.potNum && style.potNum !== this.style.potNum) {
            this.style = {...this.style, ...style};
            this.removeData();
            this.postWorkerData();
            return;
        }
        this.style = {...this.style, ...style};
        this.resetFloat(style);
    }
    // public setData<T>(data: string | T[]) {
    //     if (this.hooks && this.hooks.startDealData) {
    //         this.hooks.startDealData.call(this);
    //     }
    // }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "RandWorkerFun";
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.style.brightness = this.baseCfg.brightness;
        this.material = new ColorMaterial({
            color: this.style.color,
            alpha: 1.0,
            brightness: this.style.brightness,
            floatDis: this.style.floatDis || 500,
            speed: this.style.speed || 1,
            pointSize: this.style.pointSize || 10,
            maxDis: this.style.maxDis || Infinity,
        } as any);
        this.appearance.default = new KVAppearance({
            type: "MaterialAppearance",
            material: this.material,
            vertexShaderSource,
            fragmentShaderSource,
        });
        this.postWorkerData();
    }
    protected onData(option: IWorkerMsg): void {
        const resData = option.dataArr as any;
        this.VAO = {
            type: "POINTS",
            position: {
                values: resData.vertex,
                componentDatatype: "DOUBLE",
                componentsPerAttribute: 3,
            },
            color: {
                values: resData.color,
                componentDatatype: "FLOAT",
                componentsPerAttribute: 4,
            },
            indexs: resData.index,
        };
        this.setLocatedPos(this.style.lon, this.style.lat, this.style.height);
        let currMat = Transforms.eastNorthUpToFixedFrame(this.locatedPos as any);
        const cloneMat = Object.assign({}, currMat);
        const tMat = this.computedMat();
        currMat = Matrix4.multiply(currMat, tMat);
        const geometry = new CustomGeometry(this.VAO);
        const primitive = new CustomPrimitive(geometry.geometry as any, this.appearance.default) as any;
        primitive.setMatrix(currMat);
        primitive.primitive.oldMat = cloneMat;
        primitive.primitive.oldPosition = Object.assign({}, this.locatedPos);
        this.collection.add(primitive);
        this.primitive = primitive;
    }
    protected onDestroy(): void {
        this.viewer.removeEvent(this.layerName, "preUpdate");
        this.viewer.removePrimitive(this.collection);
        this.material.destroy();
        (this.collection as any) = null;
    }
    protected onDataOver(): void {
        // this.collectionToScene();
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
    }
    protected collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    private resetMaterial(style: ILayerStyle) {
        this.material.reset({...this.style, ...style});
    }
    private setLocatedPos(lon: number, lat: number, height?: number) {
        this.locatedPos = Cartesian3.fromDegrees(lon, lat, height || 0);
    }
    private computedMat() {
        const floatMat = Matrix4.fromTranslation(0, 0, this.style.height + 0.0000001);
        // tslint:disable-next-line: max-line-length
        const scaleM = Matrix4.fromScale(this.style.radius + 0.0000001, this.style.radius + 0.0000001,  this.style.limitHeight + 0.0000001);
        return Matrix4.multiply(floatMat, scaleM);
    }
    private resetFloat(style: ILayerStyle) {
        const newStyle = {...this.style, ...style};
        this.setLocatedPos(newStyle.lon, newStyle.lat, newStyle.height);
        const currMat = Transforms.eastNorthUpToFixedFrame(this.locatedPos as any);
        this.primitive.primitive.oldMat = currMat;
        const tMat = this.computedMat();
        this.primitive.setMatrix(Matrix4.multiply(currMat, tMat));
    }
}

const vertexShaderSource = `
attribute vec3 position3DHigh;
attribute vec3 position3DLow;
attribute vec4 color;
attribute float batchId;
varying vec3 v_positionEC;
varying vec3 v_positionMC;
varying vec4 randomColor;
uniform float floatDis_3;
uniform float speed_4;
uniform float pointSize_5;
uniform float maxDis_6;
void main()
{
    vec4 p = czm_computePosition();
    float num = czm_frameNumber * 1.4 / 1000.0;
    float nosizex = sin(color.r * num) * floatDis_3;
    float nosizey = sin(color.g * num) * floatDis_3;
    float nosizez = sin(color.b * num) * floatDis_3;
    float nw = sin(color.a * num * 50.0);
    randomColor = vec4(nosizex,nosizey,nosizez,nw);
    v_positionMC = position3DHigh + position3DLow;
    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;
    vec4 p2 = czm_modelView * p;
    float disEye = distance(p2.xyz, vec3(0.0));
    if (disEye > maxDis_6) {
        return;
    }
    gl_Position = czm_modelViewProjectionRelativeToEye * p;
    gl_Position.xyz += randomColor.xyz * speed_4;
    randomColor = abs(randomColor);
    gl_PointSize = pointSize_5 * color.a;
}`;

const fragmentShaderSource = `
varying vec3 v_positionMC;
varying vec3 v_positionEC;
varying vec4 randomColor;
void main(){
    czm_materialInput materialInput;
    czm_material material = czm_getMaterial(materialInput);
    float dist = distance(gl_PointCoord, vec2(0.5));
    float alpha = 0.0;
    vec3 constColor = vec3(0.0,0.53,1.0);
    if (dist < 0.5) {
        alpha = (0.5 - dist) / 0.5;
        material.diffuse = mix(constColor, material.diffuse, randomColor.a);
    }
    gl_FragColor = vec4(material.diffuse, alpha * randomColor.a);
}`;
