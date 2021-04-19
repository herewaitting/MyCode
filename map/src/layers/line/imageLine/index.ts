import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { SceneServer } from "../../../map/sceneServer";
// import { KvLog } from "../../../tools/log";
// import { transformColor } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Line } from "../line";
// tslint:disable-next-line: max-line-length
import { CreatePolylineGeometry, CreatePolylinePrimitive, KVAppearance, LinePrimitiveImageFlowMaterial } from "./config";
import { DefaultData } from "./data";
import { DefaultStyle, ILayerStyle } from "./style";

export class ImageLine<D> extends Line<D> {
    public static DefaultData = DefaultData;
    public workerFunName = "LineWorkerFun";
    public temparr: any[] = [];
    private material!: LinePrimitiveImageFlowMaterial;
    private conditionMaterial: any;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<D>) {
        super(viewer, layerName, initOpts);
        if (!this.viewer) { return; }
    }
    public updateStyle(style: any): void {
        this.dealCondition(style);
        this.createConditionApp();
        this.resetMaterial(style);
        let needReset = false;
        if (style.groundLine !== this.style.groundLine) {
            needReset = true;
        }
        if (needReset || style.lineWidth && style.lineWidth !== this.style.lineWidth) {
            this.style = {...this.style, ...style};
            this.removeData();
            this.postWorkerData();
        }
        this.style = {...this.style, ...style};
    }
    public collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
        this.temparr = [];
    }
    // 图层销毁
    public onDestroy() {
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
    /**
     * @description: 移除场景添加的实体
     */
    public removeData() {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public showEnties(idArr: string[], show: boolean) {
        const lines = (this.collection as any)._primitives as any[];
        lines.forEach((line) => {
            if (!line.kd_info) {
                return;
            }
            if (idArr.indexOf(line.kd_info.id) >= 0 ) {
                line.show = show;
            }
        });
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "LineWorkerFun";
        this.temparr = [];
        this.collection = new InstanceContainer("primitive");
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
    protected onDataOver() {
        // this.collectionToScene();
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
    }
    protected createAppearance<ILayerStyle>(condition: string, style: ILayerStyle) {
        if (!condition || !style) {
            return;
        }
        this.conditionMaterial[condition] = new LinePrimitiveImageFlowMaterial(style as any);
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        // if (!style) {
        //     style = {} as ILayerStyle;
        // }
        // this.style = {...this.style, ...style};
        // this.material = new LinePrimitiveImageFlowMaterial(this.style);
        // this.appearance.default = new KVAppearance({
        //     type: "PolylineMaterial",
        //     material: this.material,
        // });

        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.style.brightness = this.baseCfg.brightness;
        this.material = new LinePrimitiveImageFlowMaterial(this.style);
        this.appearance.default = this.style;
        this.dealCondition(this.style, true);
        this.conditionAppearance.default = new KVAppearance({
            type: "PolylineMaterial",
            material: this.material,
        });
        this.createConditionApp();
    }
    protected onData(option: IWorkerMsg): void {
        const data = option.dataArr;
        const done = option.done;
        const currData = option.currData;
        if (!data || !data.length) {
            return;
        }
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, data[0]);
        }
        const appearance = this.conditionAppearance[option.currStyle];
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;
        const currWidth = currStyle.lineWidth || this.style.lineWidth;
        const line = CreatePolylineGeometry({
            data,
            width: currWidth,
            groundLine: this.style.groundLine,
        });
        if (!this.baseCfg.mergeDraw) {
            const kdinfo = Object.assign({}, currData);
            const primitive = new CreatePolylinePrimitive({
                data: line,
                groundLine: this.style.groundLine,
            });
            primitive.setAppearance(appearance);
            if (!this.style.groundLine) {
                primitive.setBloom(currStyle.bloom);
            }
            // primitive.appearance = this.appearance.default;
            const curr = this.collection.add(primitive);
            curr.kd_info = kdinfo;
            // (primitive as any).ableBloom = style.bloom;
            return;
        }
        this.temparr.push(line);
        if (!done) {
            return;
        }
        const primitive = new CreatePolylinePrimitive({
            data: this.temparr,
            groundLine: this.style.groundLine,
        });
        primitive.setAppearance(appearance);
        if (!this.style.groundLine) {
            primitive.setBloom(currStyle.bloom);
        }
        // primitive.appearance = this.appearance.default;
        // (primitive as any).ableBloom = style.bloom;
        this.collection.add(primitive);
        this.temparr = [];
    }
    protected deleteAppearance(condTxt: string) {
        if (this.conditionAppearance[condTxt]) {
            this.conditionAppearance[condTxt].destroy();
        }
    }
    private resetMaterial(style: ILayerStyle) {
        this.material.reset({...this.style, ...style});
        const {condition, ...defaultStyle} = style;
        if (condition && condition.forEach) {
            condition.forEach((item: any) => {
                const currStyle = {...this.style, ...{...defaultStyle, ...item.style}};
                if (this.conditionAppearance[item.condition]) {
                    this.conditionAppearance[item.condition].resetMaterial(currStyle);
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
