import { ILayerOption } from "../../../layerManager";
import { Matrix3 } from "../../../map/core/Matrix3";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { ColorMaterial } from "../../../map/material/ColorMaterial";
import { CustomGeometry } from "../../../map/primitive/customGeometry";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { offsetPoint } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class MultiPyramid extends Point<ILayerStyle> {
    public workerFunName!: string;
    private material: any;
    private VAO: any;
    private frameVAO: any;
    private addedPri: any;
    private currHeight!: number;
    private lineMaterial: any;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.addedPri = [];
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        this.resetMaterial(style);
        this.changeBloom(style.bloom);
        if (style.num && style.num !== this.style.num) {
            this.style = {...this.style, ...style};
            this.removeData();
            this.prepareVAO();
            this.postWorkerData();
            return;
        }
        this.style = {...this.style, ...style};
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "PointWorkerFun";
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
        this.appearance = {};
        this.addedPri = [];
        this.currHeight = 0;
        this.bindFloat();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.style.brightness = this.baseCfg.brightness;
        this.material = new ColorMaterial({
            color: this.style.color,
            alpha: this.style.alpha,
            brightness: this.style.brightness,
        });
        this.lineMaterial = new ColorMaterial({
            color: this.style.frameColor,
            alpha: 1.0,
            brightness: this.style.brightness,
        });
        this.appearance.default = new KVAppearance({
            type: "MaterialAppearance",
            material: this.material,
        });
        this.appearance.frameLine = new KVAppearance({
            type: "MaterialAppearance",
            material: this.lineMaterial,
        });
        this.prepareVAO();
    }
    protected onData(option: IWorkerMsg): void {
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        const appearance = this.appearance.default;
        let origin = option.dataArr as any;
        if (!this.locatedPos) {
            this.locatedPos = origin as any;
        }
        const baseCfg = this.baseCfg;
        // tslint:disable-next-line: max-line-length
        origin = offsetPoint(origin as any, (baseCfg as any).northOffset, (baseCfg as any).eastOffset, this.style.height || 0.0) as any;
        let currMat = Transforms.eastNorthUpToFixedFrame(origin as any);
        const cloneMat = Object.assign({}, currMat);
        const scaleM = Matrix4.fromScale(this.style.size, this.style.size,  this.style.size);
        currMat = Matrix4.multiply(currMat, scaleM);
        const geometry = new CustomGeometry(this.VAO);
        const primitive = new CustomPrimitive(geometry.geometry as any, appearance) as any;
        primitive.setMatrix(currMat, scaleM);
        primitive.primitive.id = kdinfo.id;
        primitive.primitive.kd_info = kdinfo;
        primitive.primitive.oldMat = cloneMat;
        primitive.primitive.oldPosition = Object.assign({}, origin);
        this.collection.add(primitive);

        const geometry1 = new CustomGeometry(this.frameVAO);
        const primitive1 = new CustomPrimitive(geometry1.geometry as any, this.appearance.frameLine) as any;
        primitive1.setMatrix(currMat, scaleM);
        primitive1.primitive.id = kdinfo.id;
        primitive1.primitive.kd_info = kdinfo;
        primitive1.primitive.oldMat = cloneMat;
        primitive1.primitive.oldPosition = Object.assign({}, origin);
        this.collection.add(primitive1);

        this.addedPri.push(primitive);
        this.addedPri.push(primitive1);
    }
    protected onDestroy(): void {
        this.viewer.removeEvent(this.layerName, "preUpdate");
        this.viewer.removePrimitive(this.collection);
        this.material.destroy();
        this.VAO = null;
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
    private prepareVAO() {
        const vertex = this.prepareVertex(this.style.num);
        const indices = this.prepareTriangleIndex(this.style.num);
        const lineIndex = this.prepareLineIndex(this.style.num);
        this.VAO = {
            type: "TRIANGLES",
            position: {
                values: new Float32Array(vertex),
                componentDatatype: "DOUBLE",
                componentsPerAttribute: 3,
            },
            indexs: new Uint16Array(indices),
        };
        this.frameVAO = {
            type: "LINES",
            position: {
                values: new Float32Array(vertex),
                componentDatatype: "DOUBLE",
                componentsPerAttribute: 3,
            },
            indexs: new Uint16Array(lineIndex),
        };
    }
    private resetMaterial(style: ILayerStyle) {
        this.material.reset({
            color: style.color || this.style.color,
            alpha: style.alpha || this.style.alpha,
            brightness: style.brightness || this.style.brightness,
        });
        this.lineMaterial.reset({
            color: style.frameColor || this.style.frameColor,
            alpha: 1.0,
            brightness: style.brightness || this.style.brightness,
        });
    }
    private prepareTriangleIndex(num: number): number[] {
        const sjxArr = [];
        for (let i = 1; i <= num; i++) {
            let nextI = i + 1;
            let nextII = i + 2;
            nextI = nextI > num ? nextI % num : nextI;
            sjxArr.push(0, nextI, i);
            if (nextII <= num + 1) {
                nextII = nextII > num ? nextII % num : nextII;
                sjxArr.push(1, nextI, nextII);
            }
        }
        return sjxArr;
    }
    private prepareLineIndex(num: number): number[] {
        const lineArr: number[] = [];
        for (let i = 1; i <= num; i++) {
            let nextI = i + 1;
            nextI = nextI > num ? 1 : nextI;
            lineArr.push(0, i);
            lineArr.push(i, nextI);
        }
        return lineArr;
    }
    private prepareVertex(num: number): number[] {
        const vertexArr = [];
        // vertexArr.push(origin.x, origin.y, origin.z);
        vertexArr.push(0.0000000001, 0.0000000001, 0.0000000001);
        for (let i = 0; i < num; i++) {
            const currAngle = (360 / num) * i;
            const currRad = currAngle / 180 * Math.PI;
            const currX = Math.cos(currRad);
            const currY = Math.sin(currRad);
            vertexArr.push(currX, currY, 1);
        }
        return vertexArr;
    }
    private computedMatrix() {
        const fheight = this.style.floatHeight;
        const nowTime = Math.sin(new Date().getTime() / 10000 * this.style.speed);
        const floatHeight = nowTime * fheight;
        const floatMat = Matrix4.fromTranslation(0, 0, this.currHeight + floatHeight);
        // rotateAngle += 0.1;
        const currRad = Math.PI * 2 * floatHeight;
        const rotateM = Matrix3.fromRotationZ(currRad);
        const absNum = Math.abs(nowTime) / 2.0 + 0.5;
        // tslint:disable-next-line: max-line-length
        const scaleM = Matrix4.fromScale(absNum * this.style.size, absNum * this.style.size, absNum * this.style.size * this.style.ratio);
        return Matrix4.multiply(Matrix4.multiplyByMatrix3(floatMat, rotateM), scaleM);
    }
    private bindFloat() {
        this.viewer.bindEvent(this.layerName, "preUpdate", this.rotateAndFloat.bind(this));
    }
    private rotateAndFloat() {
        (this.addedPri as any[]).forEach((item) => {
            const oldMat = item.primitive.oldMat;
            const tMat = this.computedMatrix();
            item.setMatrix(Matrix4.multiply(oldMat, tMat), tMat);
        });
    }
}
