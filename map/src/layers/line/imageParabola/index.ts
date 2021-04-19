import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { LinePrimitiveImageFlowMaterial } from "../../../map/material/LinePrimitiveImageFlowMaterial";
import { SceneServer } from "../../../map/sceneServer";
// import { KvLog } from "../../../tools/log";
import { IWorkerMsg } from "../../layer";
import { Line } from "../line";
// tslint:disable-next-line: max-line-length
import { CreatePolylineGeometry, CreatePolylinePrimitive, KVAppearance } from "./config";
import { DefaultData } from "./data";
import { DefaultStyle, ILayerStyle } from "./style";

/**
 * 自定义抛物线图层    仅支持抛物线两个点相同高度
 */
export class ImageParabola<D> extends Line<D> {
    public static DefaultData = DefaultData;
    public workerFunName = "BesselWorkerFun";
    public layerSign = "Parabola";
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
        if (style.lineWidth && style.lineWidth !== this.style.lineWidth
            || style.curvature && style.curvature !== this.style.curvature
            || style.splitNum && style.splitNum !== this.style.splitNum) {
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
    public receiveMsg(data: any) {
        console.log(data);
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
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "BesselWorkerFun";
        this.temparr = [];
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.conditionMaterial = {};
        this.conditionAppearance = {};
        if (this.baseCfg.visible) {
            this.onShow();
        } else {
            this.onHide();
        }
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
        // this.appearance = {};
        // this.appearance.default = new KVAppearance({
        //     type: "PolylineMaterial",
        //     material: this.material,
        // });

        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.material = new LinePrimitiveImageFlowMaterial(this.style);
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
        });
        if (!this.baseCfg.mergeDraw) {
            const kdinfo = Object.assign({}, currData);
            delete kdinfo.points;
            const primitive = new CreatePolylinePrimitive({
                data: line,
            });
            primitive.setAppearance(appearance);
            primitive.setBloom(currStyle.bloom);
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
        });
        primitive.setAppearance(appearance);
        primitive.setBloom(currStyle.bloom);
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

// export const PwxlaLayer: IKVMapLayer = {
//     key: "pwxlayer",
//     create(kvMap:any, data: IPwxOpts) {
//         if(kvMap.addedLayers[data.layerId]){
//             console.log("已存在同ID图层！！！");
//             return new Promise((resolve, reject) => {
//                 resolve();
//             });
//         }
//         kvMap.addedLayers[data.layerId] = new ParabolaLayer(kvMap, data);
//         return new Promise((resolve, reject) => {
//             resolve();
//         });
//     }
// };
