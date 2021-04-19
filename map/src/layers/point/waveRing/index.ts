import { ILayerOption } from "../../../layerManager";
// import { Matrix4 } from "../../../map/core/Matrix4";
// import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { WaveRingMaterial } from "../../../map/material/WaveRingMaterial";
// import { CustomGeometry } from "../../../map/primitive/customGeometry";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { EllipseGeometry } from "../../../map/primitive/EllipseGeometry";
import { SceneServer } from "../../../map/sceneServer";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class WaveRing extends Point<ILayerStyle> {
    public workerFunName!: string;
    private material: any;
    // private VAO: any;
    private addedPri: any = [];
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
        this.addedPri = [];
    }
    public updateStyle(style: ILayerStyle): void {
        this.resetMaterial(style);
        this.resetShape(style);
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
        // this.prepareVAO();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.material = new WaveRingMaterial(this.style);
        this.appearance.default = new KVAppearance({
            type: "MaterialAppearance",
            material: this.material,
        });
    }
    protected onData(option: IWorkerMsg): void {
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        const appearance = this.appearance.default;
        const origin = option.dataArr as any;
        if (!this.locatedPos) {
            this.locatedPos = origin as any;
        }
        const geometry = new EllipseGeometry({
            center: origin,
            semiMajorAxis: this.style.radius,
            semiMinorAxis: this.style.radius,
        });
        // let currMat = Transforms.eastNorthUpToFixedFrame(origin as any);
        // const cloneMat = Object.assign({}, currMat);
        // const scaleM = Matrix4.fromScale(this.style.radius, this.style.radius,  this.style.radius);
        // currMat = Matrix4.multiply(currMat, scaleM);
        // const geometry = new CustomGeometry(this.VAO);
        const primitive = new CustomPrimitive(geometry.geometry as any, appearance, true) as any;
        primitive.primitive.classificationType = 1;
        // primitive.setMatrix(currMat);
        primitive.primitive.id = kdinfo.id;
        primitive.primitive.kd_info = kdinfo;
        // primitive.primitive.oldMat = cloneMat;
        primitive.primitive.oldPosition = Object.assign({}, origin);
        this.collection.add(primitive);
        this.addedPri.push(primitive);
    }
    protected onDestroy(): void {
        this.viewer.removePrimitive(this.collection);
        (this.collection as any) = null;
        (this.appearance as any) = null;
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
        this.addedPri = null;
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
    protected updatePointStyle(point: any) {
        const type = this.judgeItemStyleType(point.kd_info, this.style.condition);
        const appearance = this.appearance[type];
        CustomPrimitive.updatePriAppearance(point, appearance);
    }
    // private prepareVAO() {
    //     const vertex = [
    //         -0.5, -0.5, 0,
    //         -0.5, 0.5, 0,
    //         0.5, 0.5, 0,
    //         0.5, -0.5, 0,
    //     ];
    //     const indices = [
    //         0, 2, 1,
    //         0, 3, 2,
    //     ];
    //     const uvs = [
    //         0, 0,
    //         0, 1,
    //         1, 1,
    //         1, 0,
    //     ];
    //     this.VAO = {
    //         type: "TRIANGLES",
    //         position: {
    //             values: new Float32Array(vertex),
    //             componentDatatype: "DOUBLE",
    //             componentsPerAttribute: 3,
    //         },
    //         indexs: new Uint16Array(indices),
    //         st: {
    //             values: new Float32Array(uvs),
    //             componentDatatype: "FLOAT",
    //             componentsPerAttribute: 2,
    //         },
    //     };
    // }
    private resetMaterial(style: ILayerStyle) {
        this.material.reset({...this.style, ...style});
    }
    private resetShape(style: ILayerStyle) {
        if (this.style.radius !== style.radius && style.radius) {
            this.removeData();
            this.collection = null as any;
            this.collection = new InstanceContainer("primitive");
            this.postWorkerData();
        }
        // const radius = style.radius || this.style.radius;
        // (this.addedPri as any[]).forEach((pri) => {
        //     const oldMat  = pri.primitive.oldMat;
        //     const scaleM = Matrix4.fromScale(radius, radius,  radius);
        //     const currMat = Matrix4.multiply(oldMat, scaleM);
        //     pri.setMatrix(currMat);
        // });
    }
}
