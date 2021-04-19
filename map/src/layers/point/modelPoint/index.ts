import { ILayerOption } from "../../../layerManager";
import { Cartesian3 } from "../../../map/core/Cartesian3";
import { Matrix3 } from "../../../map/core/Matrix3";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Quaternion } from "../../../map/core/Quaternion";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { ModelPrimitive } from "../../../map/primitive/modelPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { judgeItemStyleType, ToRadians, transformColor } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class ModelPoint extends Point<ILayerStyle> {
    public workerFunName!: string;
    private addedPri: any;
    private rotateAngle: number = 0;
    private rotating!: boolean;
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
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.dealCondition(style);
        this.style = {...this.style, ...style};
        this.resetShape(this.style);
        this.bindRotate();
        if (style.modelUrl && style.modelUrl !== this.style.modelUrl || style.brightness !== this.style.brightness) {
            this.style = {...this.style, ...style};
            this.removeData();
            this.postWorkerData();
            return;
        }
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.addedPri = [];
        this.workerFunName = "PointWorkerFun";
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.appearance.default = {...this.appearance.default, ...this.style};
        this.dealCondition(this.style);
        if (this.baseCfg.visible) {
            if (this.judgeCurrLevlShow()) {
                this.onShow();
            } else {
                this.onHide();
            }
        } else {
            this.onHide();
        }
    }
    protected onData(option: IWorkerMsg): void {
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        const origin = option.dataArr as any;
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;
        if (!this.locatedPos) {
            this.locatedPos = origin as any;
        }
        let currMat = Transforms.eastNorthUpToFixedFrame(origin as any);
        const cloneMat = Object.assign({}, currMat);
        const scaleM = this.computedMatrix();
        currMat = Matrix4.multiply(currMat, scaleM);
        const currModelPri = new ModelPrimitive(currStyle.modelUrl);
        currModelPri.setMatrix(currMat, scaleM);
        currModelPri.setBrightness(currStyle.brightness);
        (currModelPri as any).primitive.kd_info = Object.assign({}, currPoint);
        (currModelPri as any).primitive.uvMove = currStyle.uvMove;
        (currModelPri as any).primitive.ableCustomLight = currStyle.ableCustomLight;
        (currModelPri as any).primitive.kd_style = Object.assign({}, currStyle);
        (currModelPri as any).primitive.id = kdinfo.id;
        (currModelPri as any).primitive.oldModelMatrix = cloneMat;
        (currModelPri as any).primitive.color = transformColor(currStyle.color);
        this.addEnvironment((currModelPri as any).primitive);
        this.collection.add(currModelPri);
        this.addedPri.push(currModelPri);
    }
    protected onDestroy(): void {
        this.viewer.removeEvent(this.layerName, "preUpdate");
        this.viewer.removePrimitive(this.collection);
        (this.collection as any) = null;
        (this.appearance as any) = null;
        this.addedPri = null;
    }
    protected onDataOver(): void {
        // this.collectionToScene();
        this.bindRotate();
    }
    protected collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    private resetShape(style: ILayerStyle) {
        (this.addedPri as any[]).forEach((item) => {
            const kd_info = item.primitive.kd_info;
            const currStyle = this.appearance[judgeItemStyleType(kd_info, style.condition) || "default"];
            const color = transformColor(currStyle.color);
            const oldMat = item.primitive.oldModelMatrix;
            item.primitive.color = color || item.primitive.color;
            const tMat = this.computedMatrix();
            item.setMatrix(Matrix4.multiply(oldMat, tMat), tMat);
        });
    }
    private computedMatrix() {
        const transform = this.style;
        const scale = new Cartesian3(transform.scale, transform.scale, transform.scale);
        const translation = new Cartesian3(transform.tX, transform.tY, transform.tZ);
        const rotateMat = Matrix3.fromRotationZ(ToRadians(this.rotateAngle || transform.angle));
        const rotation = Quaternion.fromRotationMatrix(rotateMat);
        return Matrix4.fromTranslationRotationScale(translation, rotation, scale);
    }
    private bindRotate() {
        if (!this.style.ableRotate) {
            this.viewer.removeEvent(this.layerName, "preUpdate");
            this.rotating = false;
            return;
        }
        if (this.rotating) {
            return;
        }
        this.viewer.bindEvent(this.layerName, "preUpdate", this.rotateModel.bind(this));
        this.rotating = true;
    }
    private rotateModel() {
        this.rotateAngle -= this.style.speed;
        this.resetShape(this.style);
        if ((this.style.angle - this.rotateAngle) % 360 === 0) {
            this.rotateAngle = this.style.angle;
        }
    }
    private addEnvironment(model: any) {
        if (!this.style.ableEnvironment || !this.style.KTXUrl || !model) {
            return;
        }
        model.specularEnvironmentMaps = this.style.KTXUrl;
    }
}
