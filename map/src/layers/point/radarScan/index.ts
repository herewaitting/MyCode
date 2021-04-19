import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { ScanEllipseMaterial } from "../../../map/material/ScanEllipseMaterial";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { EllipseGeometry } from "../../../map/primitive/EllipseGeometry";
import { SceneServer } from "../../../map/sceneServer";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class RadarScan extends Point<ILayerStyle> {
    public workerFunName!: string;
    private addedPri: any;
    private conditionMaterial: any;
    private conditionAppearance: any;
    private material: any;
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
        this.dealCondition(style);
        this.createConditionApp();
        this.resetMaterial(style);
        this.resetShape(style);
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
        this.collection = new InstanceContainer("primitive");
        this.workerFunName = "PointWorkerFun";
        this.appearance = {};
        this.addedPri = [];
        this.conditionMaterial = {};
        this.conditionAppearance = {};
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.style.brightness = this.baseCfg.brightness;
        this.material = new ScanEllipseMaterial(this.style);
        this.dealCondition(this.style, true);
        this.conditionAppearance.default = new KVAppearance({
            type: "MaterialAppearance",
            material: this.material,
        });
        this.createConditionApp();
        this.changeBloom(this.style.bloom);
    }
    protected onData(option: IWorkerMsg): void {
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        const appearance = this.conditionAppearance[option.currStyle];
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;
        const origin = option.dataArr as any;
        if (!this.locatedPos) {
            this.locatedPos = origin as any;
        }
        const geometry = new EllipseGeometry({
            center: origin,
            semiMajorAxis: currStyle.radius,
            semiMinorAxis: currStyle.radius,
        });
        const primitive = new CustomPrimitive(geometry.geometry as any, appearance, true) as any;
        primitive.primitive.id = kdinfo.id;
        primitive.primitive.kd_info = kdinfo;
        primitive.primitive.oldPosition = Object.assign({}, origin);
        primitive.customStyle = option.currStyle;
        this.collection.add(primitive);
        this.addedPri.push(primitive);
    }
    protected onDestroy(): void {
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
    protected updatePointStyle(point: any) {
        const type = this.judgeItemStyleType(point.kd_info, this.style.condition);
        const appearance = this.conditionAppearance[type];
        CustomPrimitive.updatePriAppearance(point, appearance);
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
    protected deleteAppearance(condTxt: string) {
        if (this.conditionAppearance[condTxt]) {
            this.conditionAppearance[condTxt].destroy();
        }
    }
    protected createAppearance<ILayerStyle>(condition: string, style: ILayerStyle) {
        if (!condition || !style) {
            return;
        }
        this.conditionMaterial[condition] = new ScanEllipseMaterial(style as any);
    }
    private createConditionApp() {
        Object.keys(this.conditionMaterial).forEach((item) => {
            this.conditionAppearance[item] = new KVAppearance({
                type: "MaterialAppearance",
                material: this.conditionMaterial[item],
            });
        });
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
    }
    private resetShape(style: ILayerStyle) {
        if (style.radius && style.radius !== this.style.radius) {
            this.removeData();
            this.postWorkerData();
        }
    }
}
