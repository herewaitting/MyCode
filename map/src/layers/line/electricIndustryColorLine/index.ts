import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { LinePrimitiveColorFlowMaterial } from "../../../map/material/LinePrimitiveColorFlowMaterial";
import { CreatePolylineGeometry, CreatePolylinePrimitive } from "../../../map/primitive/createPolyline";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { IWorkerMsg } from "../../layer";
import { Line } from "../line";
import { DefaultStyle, ILayerStyle } from "./style";

export class ElectricIndustryColorLine extends Line<ILayerStyle> {
    public workerFunName!: string;
    public layerSign = "Parabola";
    private material: any;
    private conditionMaterial: any;
    private midPointObj: any = {};
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, initOpts);
        if (!this.viewer) { return; }
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: any): void {
        this.dealCondition(style);
        this.createConditionApp();
        if (style.lineWidth && style.lineWidth !== this.style.lineWidth
            || style.curvature && style.curvature !== this.style.curvature
            || style.splitNum && style.splitNum !== this.style.splitNum
            || style.clutchDistance && style.clutchDistance !== this.style.clutchDistance) {
            this.style = {...this.style, ...style};
            this.removeData();
            this.postWorkerData();
        }
        this.resetMaterial(style);
        this.style = {...this.style, ...style};
    }
    protected updateLineStyle(line: any) {
        const type = this.judgeItemStyleType(line.kd_info, this.style.condition);
        const appearance = this.conditionAppearance[type];
        CustomPrimitive.updatePriAppearance(line, appearance);
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "BesselWorkerFun";
        this.collection = new InstanceContainer("primitive");
        this.customWorkerOpts = {};
        this.appearance = {};
        this.conditionMaterial = {};
        this.conditionAppearance = {};
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
        this.collectionToScene();
    }
    protected createAppearance<ILayerStyle>(condition: string, style: ILayerStyle) {
        if (!condition || !style) {
            return;
        }
        this.conditionMaterial[condition] = new LinePrimitiveColorFlowMaterial(style as any);
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        // if (!style) {
        //     style = {} as ILayerStyle;
        // }
        // this.style = {...this.style, ...style};
        // this.customWorkerOpts.splitNum = this.style.splitNum;
        // this.customWorkerOpts.clutchDistance = this.style.clutchDistance;
        // this.customWorkerOpts.curvature = this.style.curvature;
        // this.material = new LinePrimitiveColorFlowMaterial(this.style);
        // this.appearance = {};
        // this.appearance.default = new KVAppearance({
        //     type: "PolylineMaterial",
        //     material: this.material,
        // });

        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.material = new LinePrimitiveColorFlowMaterial(this.style);
        this.appearance.default = this.style;
        this.dealCondition(this.style, true);
        this.conditionAppearance.default = new KVAppearance({
            type: "PolylineMaterial",
            material: this.material,
        });
        this.createConditionApp();
        this.changeBloom(this.style.bloom);
    }
    protected onData(option: IWorkerMsg): void {
        const data = option.dataArr;
        const currData = option.currData;
        if (!data || !data.length) {
            return;
        }
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, data[0]);
        }
        let lineId = "";
        if (currData.fromId) {
            lineId = currData.id + "_" + currData.fromId;
        } else {
            lineId = currData.id;
        }
        this.midPointObj[lineId] = option.midPoint;
        const appearance = this.conditionAppearance[option.currStyle];
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;
        const currWidth = currStyle.lineWidth || 2;
        const line = CreatePolylineGeometry({
            data,
            width: currWidth,
        });
        const kdinfo = Object.assign({}, currData);
        const primitive = new CreatePolylinePrimitive({
            data: line,
        });
        primitive.setAppearance(appearance);
        primitive.setBloom(currStyle.bloom);
        // primitive.appearance = this.appearance.default;
        const curr = this.collection.add(primitive);
        curr.kd_info = kdinfo;
        curr.id = lineId;
    }
    protected onDestroy(): void {
        if (this.viewer) {
            this.viewer.removePrimitive(this.collection);
            (this.collection as any) = null;
            if (this.conditionAppearance) {
                Object.keys(this.conditionAppearance).forEach((item) => {
                    this.conditionAppearance[item].destroy();
                    this.conditionAppearance[item] = null;
                });
            }
            this.appearance = null;
            this.conditionAppearance = null;
        }
    }
    protected onDataOver(): void {
        // this.collectionToScene();
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
    }
    protected deleteAppearance(condTxt: string) {
        if (this.conditionAppearance[condTxt]) {
            this.conditionAppearance[condTxt].destroy();
        }
    }
    private collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    private resetMaterial(style: ILayerStyle) {
        // this.material.reset(this.style);
        this.material.reset({...this.style, ...style});
        const {condition, ...defaultStyle} = style;
        if (this.conditionMaterial) {
            Object.keys(this.conditionMaterial).forEach((item: any) => {
                if (this.appearance[item]) {
                    const currStyle = {...this.style, ...{...defaultStyle, ...this.appearance[item]}};
                    if (this.conditionAppearance[item]) {
                        this.conditionAppearance[item].resetMaterial(currStyle);
                    }
                }
            });
        }
        this.changeBloom(style.bloom);
    }
    private createConditionApp() {
        Object.keys(this.conditionMaterial).forEach((item) => {
            this.conditionAppearance[item] = new KVAppearance({
                type: "PolylineMaterial",
                material: this.conditionMaterial[item],
            });
        });
    }
}
