import { ILayerOption } from "../../../layerManager";
import { Cartesian3 } from "../../../map/core/Cartesian3";
import { Matrix3 } from "../../../map/core/Matrix3";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Quaternion } from "../../../map/core/Quaternion";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { ModelPrimitive } from "../../../map/primitive/modelPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { ToRadians } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Building } from "../building";
import { DefaultStyle, ILayerStyle } from "./style";

export class ModelCity extends Building<ILayerStyle> {
    public workerFunName!: string;
    private addedPri: any;
    private rotateAngle: number = 0;
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
        if (!style) {
            style = {} as ILayerStyle;
        }
        let needReset = false;
        // tslint:disable-next-line: max-line-length
        if (style.modelUrl && style.modelUrl !== this.style.modelUrl || style.styleType && style.styleType !== this.style.styleType) {
            needReset = true;
        }
        if (style.appear && this.style.appear !== style.appear
        || style.styleType && this.style.styleType !== style.styleType
        || style.uvMove && this.style.uvMove !== style.uvMove) {
            needReset = true;
        }
        this.style = {...this.style, ...style};
        if (needReset) {
            this.removeData();
            this.setLocatedPos();
            this.addCity();
            return;
        }
        this.resetShape();
    }
    public setData<T>(data: string | T[]) {
        if (this.hooks && this.hooks.startDealData) {
            this.hooks.startDealData.call(this, data as any[]);
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
        this.collection = new InstanceContainer("primitive");
        if (this.baseCfg.visible) {
            this.collection.show();
        } else {
            this.collection.hide();
        }
        this.collectionToScene();
        this.appearance = {};
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.setLocatedPos();
        this.setAppear();
        this.setColor();
        this.addCity();
        if (this.baseCfg.visible) {
            this.onShow();
        } else {
            this.onHide();
        }
    }
    protected onData(option: IWorkerMsg): void {
        //
    }
    protected onDestroy(): void {
        this.viewer.removePrimitive(this.collection);
        (this.collection as any) = null;
        (this.appearance as any) = null;
        this.addedPri = null;
    }
    protected onDataOver(): void {
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
    }
    protected collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    private resetShape() {
        (this.addedPri as any[]).forEach((item) => {
            const oldMat = item.primitive.oldModelMatrix;
            const tMat = this.computedMatrix();
            item.setMatrix(Matrix4.multiply(oldMat, tMat));
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
    private setAppear() {
        const style = this.style;
        if ((style as any).appear) {
            this.viewer.addGltfAppearEvent();
        } else {
            this.viewer.removeGltfAppearEvent();
        }
    }
    private setLocatedPos() {
        const style = this.style;
        this.locatedPos = Cartesian3.fromDegrees(style.longitude, style.latitude, style.height || 0);
    }
    private addCity() {
        let currMat = Transforms.eastNorthUpToFixedFrame(this.locatedPos as any);
        const scaleM = this.computedMatrix();
        currMat = Matrix4.multiply(currMat, scaleM);
        const currModelPri = new ModelPrimitive(this.style.modelUrl);
        currModelPri.setMatrix(currMat);
        currModelPri.setCustomProp({
            appear: this.style.appear,
            uvMove: this.style.uvMove,
            styleBM: this.style.styleBM,
            ableCustomLight: this.style.ableCustomLight,
            ableBloom: this.style.ableBloom,
        });
        (currModelPri.primitive as any).oldModelMatrix = currMat;
        this.addEnvironment(currModelPri.primitive);
        this.collection.add(currModelPri);
        this.addedPri.push(currModelPri);
    }
    private setColor() {
        // InstanceContainer.setModelColor(this.collection, this.style.color);
    }
    private addEnvironment(model: any) {
        if (!this.style.ableEnvironment || !this.style.KTXUrl || !model) {
            return;
        }
        model.specularEnvironmentMaps = this.style.KTXUrl;
    }
}
