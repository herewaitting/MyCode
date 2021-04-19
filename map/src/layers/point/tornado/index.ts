import * as Cesium from "cesium";
import { ILayerOption } from "../../../layerManager";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { TornadoMaterial } from "../../../map/material/TornadoMaterial";
import { CustomGeometry } from "../../../map/primitive/customGeometry";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { SplitCircle } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class Tornado extends Point<ILayerStyle> {
    public workerFunName!: string;
    private outMaterial!: TornadoMaterial;
    private midMaterial!: TornadoMaterial;
    private innerMaterial!: TornadoMaterial;
    private VAO: any;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
        if (!this.viewer) { return; }
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        this.resetMaterial(style);
        this.changeShape(style);
        this.style = {...this.style, ...style};
        this.changeBloom(this.style.bloom);
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
        this.appearance = {};
        this.prepareTornado();
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.prepareMaterial();
    }
    protected onData(option: IWorkerMsg): void {
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        const origin = option.dataArr as any;
        if (!this.locatedPos) {
            this.locatedPos = origin as any;
        }
        const currMat = Transforms.eastNorthUpToFixedFrame(origin as any);
        const cloneMat = Object.assign({}, currMat);
        this.addOut(cloneMat, kdinfo);
        this.addMid(cloneMat, kdinfo);
        this.addInner(cloneMat, kdinfo);
    }
    protected onDestroy(): void {
        this.viewer.removePrimitive(this.collection);
        this.outMaterial.destroy();
        this.midMaterial.destroy();
        this.innerMaterial.destroy();
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
    private prepareTornado() {
        const splitNum = 30;
        const baseVertexs = SplitCircle(splitNum);
        const topVertexs: any[] = [];
        baseVertexs.forEach((item, index) => { // 组织离地圆顶点
            if (index % 3 === 2) {
                topVertexs.push(1);
            } else {
                topVertexs.push(item * 0.6);
            }
        });
        const vertexs = baseVertexs.concat(topVertexs);
        const indexs: any[] = [];
        const uvs: any[] = [];
        for (let index = 0; index <= splitNum; index ++) {
            uvs.push(index / splitNum);
            uvs.push(0);
            if (index < splitNum) { // 四边形左下角开始，顺时针
                const v0 = index;
                const v1 = index + (splitNum + 1);
                const v2 = (index + 1) + (splitNum + 1);
                const v3 = index + 1;
                indexs.push(v0, v2, v1);
                indexs.push(v0, v3, v2);
            }
        }
        for (let index = 0; index <= splitNum; index ++) {
            uvs.push(index / splitNum);
            uvs.push(1);
        }
        // this.VAO = {
        //     vertexs,
        //     indexs,
        //     uvs,
        // };
        this.VAO = {
            type: "TRIANGLES",
            position: {
                values: new Float32Array(vertexs),
                componentDatatype: "DOUBLE",
                componentsPerAttribute: 3,
            },
            indexs: new Uint16Array(indexs),
            st: {
                values: new Float32Array(uvs),
                componentDatatype: "FLOAT",
                componentsPerAttribute: 2,
            },
        };
    }
    private resetMaterial(style: ILayerStyle) {
        const newStyle = {
            imgUrl: style.outImg,
            speed: style.speed,
            reverse: false,
            brightness: style.brightness,
        };
        this.outMaterial.reset(newStyle);
        newStyle.imgUrl = style.midImg;
        newStyle.reverse = true;
        this.midMaterial.reset(newStyle);
        newStyle.imgUrl = style.innerImg;
        newStyle.reverse = false;
        this.innerMaterial.reset(newStyle);
    }
    private prepareMaterial() {
        const style = this.style;
        const newStyle = {
            imgUrl: style.outImg,
            speed: style.speed,
            alpha: style.alpha,
            reverse: false,
            brightness: style.brightness,
        };
        this.outMaterial = new TornadoMaterial(newStyle);
        newStyle.imgUrl = style.midImg;
        newStyle.reverse = true;
        this.midMaterial = new TornadoMaterial(newStyle);
        newStyle.imgUrl = style.innerImg;
        newStyle.reverse = false;
        this.innerMaterial = new TornadoMaterial(newStyle);
        this.appearance.out = new KVAppearance({
            type: "MaterialAppearance",
            material: this.outMaterial,
        });
        this.appearance.mid = new KVAppearance({
            type: "MaterialAppearance",
            material: this.midMaterial,
        });
        this.appearance.inner = new KVAppearance({
            type: "MaterialAppearance",
            material: this.innerMaterial,
        });
    }
    private changeShape(style: ILayerStyle) {
        const newStyle = {...this.style, ...style};
        const pris = InstanceContainer.getPrimitives(this.collection) as any[];
        pris.forEach((item) => {
            const id = item.id.split("_")[0];
            let ratio = 0;
            if (id === "out") {
                ratio = 1.0 + newStyle.spaceRatio;
            }
            if (id === "mid") {
                ratio = 1.0;
            }
            if (id === "inner") {
                ratio = 1.0 - newStyle.spaceRatio;
            }
            const radius = newStyle.radius;
            const oldMat = Cesium.clone(item.oldMat);
            const scaleM = Matrix4.fromScale(radius * ratio, radius * ratio,  newStyle.height);
            const resMat = Matrix4.multiply(oldMat, scaleM);
            item.modelMatrix = resMat;
            item.shapeMat = scaleM;
        });
    }
    private addOut(cloneMat: any, kdinfo: any) {
        const ratio = 1.0 + this.style.spaceRatio;
        const id = `out_${String(Math.random()).slice(2, 20)}`;
        this.addPrimitive(ratio, this.appearance.out, cloneMat, kdinfo, id);
    }
    private addMid(cloneMat: any, kdinfo: any) {
        const ratio = 1.0;
        const id = `mid_${String(Math.random()).slice(2, 20)}`;
        this.addPrimitive(ratio, this.appearance.mid, cloneMat, kdinfo, id);
    }
    private addInner(cloneMat: any, kdinfo: any) {
        const ratio = 1.0 - this.style.spaceRatio;
        const id = `inner_${String(Math.random()).slice(2, 20)}`;
        this.addPrimitive(ratio, this.appearance.inner, cloneMat, kdinfo, id);
    }
    private addPrimitive(ratio: number, appearance: KVAppearance, cloneMat: any, kdinfo: any, id: string) {
        const scaleM = Matrix4.fromScale(this.style.radius * ratio, this.style.radius * ratio,  this.style.height);
        const currMat = Matrix4.multiply(cloneMat, scaleM);
        const geometry = new CustomGeometry(this.VAO);
        const primitive = new CustomPrimitive(geometry.geometry as any, appearance) as any;
        primitive.setMatrix(currMat, scaleM);
        primitive.primitive.id = id;
        primitive.primitive.kd_info = kdinfo;
        primitive.primitive.oldMat = cloneMat;
        primitive.primitive.oldPosition = Object.assign({}, origin);
        this.collection.add(primitive);
    }
}
