import { ILayerOption } from "../../../layerManager";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { WaveImageMaterial } from "../../../map/material/WaveImageMaterial";
import { CustomGeometry } from "../../../map/primitive/customGeometry";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class WaveRect extends Point<ILayerStyle> {
    public workerFunName!: string;
    private VAO: any;
    private conditionMaterial: any;
    private conditionAppearance: any;
    private addedPri: any;
    private imgUrl!: string;
    private material: any;
    private currScale: number = 1;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.addedPri = [];
    }
    public updateStyle(style: ILayerStyle): void {
        this.dealCondition(style);
        this.createConditionApp();
        this.resetMaterial(style);
        this.resetShape();
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
        this.imgUrl = require("../../../../static/img/rect.png");
        this.collection = new InstanceContainer("primitive");
        this.workerFunName = "PointWorkerFun";
        this.appearance = {};
        this.conditionMaterial = {};
        this.conditionAppearance = {};
        this.addedPri = [];
        this.VAO = {};
        this.prepareVAO();
        this.bindWaveFun();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        const waveStyle = Object.assign({}, this.style);
        waveStyle.imgUrl = this.imgUrl;
        this.material = new WaveImageMaterial(waveStyle);
        this.appearance.default = this.style;
        this.dealCondition(this.style, true);
        this.conditionAppearance.default = new KVAppearance({
            type: "MaterialAppearance",
            material: this.material,
        });
        this.createConditionApp();
        this.changeBloom(this.style.bloom);
    }
    protected onData(option: IWorkerMsg): void {
        const style = this.style;
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        const currRing = option.dataArr as any;
        if (!this.locatedPos) {
            this.locatedPos = currRing as any;
        }
        const appearance = this.conditionAppearance[option.currStyle];
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;
        let currMat = Transforms.eastNorthUpToFixedFrame(currRing as any);
        const cloneMat = Object.assign({}, currMat);
        const scaleM = Matrix4.fromScale(currStyle.radius, currStyle.radius,  currStyle.radius);
        currMat = Matrix4.multiply(currMat, scaleM);
        const geometry = new CustomGeometry(this.VAO);
        const primitive = new CustomPrimitive(geometry.geometry as any, appearance) as any;
        primitive.setMatrix(currMat, scaleM);
        (primitive as any).primitive.kd_info = kdinfo;
        (primitive as any).primitive.kd_style = Object.assign({}, style);
        primitive.primitive.oldMat = cloneMat;
        primitive.setBloom(style.bloom);
        primitive.customStyle = option.currStyle;
        this.addedPri.push(primitive);
        if (this.collection) {
            this.collection.add(primitive);
        }
    }
    protected onDestroy(): void {
        this.viewer.removeEvent(this.layerName, "preUpdate");
        this.viewer.removePrimitive(this.collection);
        (this.collection as any) = null;
        (this.appearance as any) = null;
        Object.keys(this.conditionAppearance).forEach((item) => {
            this.conditionAppearance[item].destroy();
        });
        this.conditionMaterial = null as any;
        this.conditionAppearance = null as any;
        this.material = null as any;
        this.addedPri = null;
    }
    protected onDataOver(): void {
        this.collectionToScene();
        if (this.baseCfg.visible) {
            this.onShow();
        } else {
            this.onHide();
        }
    }
    protected collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    protected createAppearance<ILayerStyle>(condition: string, style: ILayerStyle) {
        if (!condition || !style) {
            return;
        }
        const waveStyle = Object.assign(this.style, style);
        waveStyle.imgUrl = this.imgUrl;
        this.conditionMaterial[condition] = new WaveImageMaterial(waveStyle as any);
    }
    protected deleteAppearance(condTxt: string) {
        if (this.conditionAppearance[condTxt]) {
            this.conditionAppearance[condTxt].destroy();
        }
    }
    protected updatePointStyle(point: any) {
        const type = this.judgeItemStyleType(point.kd_info, this.style.condition);
        const appearance = this.conditionAppearance[type];
        CustomPrimitive.updatePriAppearance(point, appearance);
    }
    private createConditionApp() {
        Object.keys(this.conditionMaterial).forEach((item) => {
            this.conditionAppearance[item] = new KVAppearance({
                type: "MaterialAppearance",
                material: this.conditionMaterial[item],
            });
        });
    }
    private prepareVAO() {
        const vertex = [
            -0.5, -0.5, 0,
            -0.5, 0.5, 0,
            0.5, 0.5, 0,
            0.5, -0.5, 0,
        ];
        const indices = [
            0, 2, 1,
            0, 3, 2,
        ];
        const uvs = [
            0, 0,
            0, 1,
            1, 1,
            1, 0,
        ];
        this.VAO = {
            type: "TRIANGLES",
            position: {
                values: new Float32Array(vertex),
                componentDatatype: "DOUBLE",
                componentsPerAttribute: 3,
            },
            indexs: new Uint16Array(indices),
            st: {
                values: new Float32Array(uvs),
                componentDatatype: "FLOAT",
                componentsPerAttribute: 2,
            },
        };
    }
    private resetMaterial(style: ILayerStyle) {
        this.material.reset({...this.style, ...style});
        const {condition, ...defaultStyle} = style;
        if (condition && condition.forEach) {
            condition.forEach((item: any) => {
                const currStyle = {...this.style, ...{...defaultStyle, ...item.style}};
                this.conditionAppearance[item.condition].resetMaterial(currStyle);
            });
        }
        this.changeBloom(style.bloom);
    }
    private resetShape() {
        (this.addedPri as any[]).forEach((pri) => {
            const oldMat  = pri.primitive.oldMat;
            const currStyle = this.appearance[pri.customStyle];
            const scaleM = Matrix4.fromScale(currStyle.radius, currStyle.radius,  currStyle.radius);
            const currMat = Matrix4.multiply(oldMat, scaleM);
            pri.setMatrix(currMat, scaleM);
        });
    }
    private bindWaveFun() {
        this.viewer.bindEvent(this.layerName, "preUpdate", this.WaveFun.bind(this));
    }
    private WaveFun() {
        (this.addedPri as any[]).forEach((item) => {
            const oldMat = item.primitive.oldMat;
            if (this.currScale > this.style.maxScale) {
                this.currScale = 0.01;
            } else {
                this.currScale += this.style.speed * 0.001;
            }
            const scale = this.currScale;
            const tMat = Matrix4.fromScale(this.style.radius * scale, this.style.radius * scale,  1);
            item.setMatrix(Matrix4.multiply(oldMat, tMat));
        });
    }
}
