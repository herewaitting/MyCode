import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { SceneServer } from "../../../map/sceneServer";
import { KvLog } from "../../../tools/log";
import { IWorkerMsg } from "../../layer";
import { Line } from "../line";
// tslint:disable-next-line: max-line-length
import { ColorMaterial, CreatePolylineGeometry, CreatePolylinePrimitive, KVAppearance } from "./config";
import { DefaultData } from "./data";
import { DefaultStyle, ILayerStyle } from "./style";

export class CommonLine<D> extends Line<D> {
    public static DefaultData = DefaultData;
    public workerFunName!: string;
    public temparr!: any[];
    private material!: ColorMaterial;
    private conditionMaterial: any;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<D>) {
        super(viewer, layerName, initOpts);
        if (!this.viewer) { return; }
    }
    public onStyle<ILayerStyle>(style: ILayerStyle): void {
        // if (!style) {
        //     style = {} as ILayerStyle;
        // }
        // this.style = {...this.style, ...style};
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
        this.style.brightness = this.baseCfg.brightness;
        this.material = new ColorMaterial(this.style);
        this.appearance.default = this.style;
        this.dealCondition(this.style, true);
        this.conditionAppearance.default = new KVAppearance({
            type: "PolylineMaterial",
            material: this.material,
        });
        this.createConditionApp();
    }
    public onData(option: IWorkerMsg): void {
        if (!option || !option.dataArr) {
            KvLog.warn({
                msg: "子线程传回的数据有误！",
                layerName: this.layerName,
            });
            return;
        }
        const data = option.dataArr;
        const done = option.done;
        const currData = option.currData;
        if (!data || !data.length) {
            return;
        }
        const appearance = this.conditionAppearance[option.currStyle];
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, data[0]);
        }
        const currWidth = currStyle.lineWidth || this.style.lineWidth;
        const line = CreatePolylineGeometry({
            data,
            width: currWidth,
            groundLine: this.style.groundLine,
        });
        // new Cesium.GeometryInstance({
        //     geometry: new Cesium.PolylineGeometry({
        //         positions: data,
        //         width: currWidth,
        //     }),
        // });
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
        // const primitive = new Cesium.Primitive({
        //     geometryInstances: this.temparr,
        //     appearance: this.appearance.default,
        // });
        const primitive = new CreatePolylinePrimitive({
            data: this.temparr,
            groundLine: this.style.groundLine,
        });
        primitive.setAppearance(appearance);
        if (!this.style.groundLine) {
            primitive.setBloom(currStyle.bloom);
        }
        // (primitive as any).ableBloom = style.bloom;
        this.collection.add(primitive);
        this.temparr = [];
    }
    /**
     * @description: 更新样式
     * @param {ILayerStyle} 新图层样式
     * @return: void
     */
    public updateStyle(style: ILayerStyle): void {
        if (this.receivingData) {
            console.warn("正在接收数据，请稍后重试！");
            return;
        }
        this.dealCondition(style);
        this.createConditionApp();
        let needReset = false;
        if (style.groundLine !== this.style.groundLine) {
            needReset = true;
        }
        if (needReset || style.lineWidth && style.lineWidth !== this.style.lineWidth
            || style.height && style.height !== this.style.height) {
            this.style = {...this.style, ...style};
            this.removeData();
            this.postWorkerData();
        }
        this.resetMaterial(style);
        this.style = {...this.style, ...style};
    }
    /**
     * @description: 图层销毁
     * @return: void
     */
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
        this.temparr = [];
    }
    // protected createOneLine(data: Cartesian3[]) {
    //     // const currStyle = this.appearance.default;
    //     // if (!this.locatedPos) {
    //     //     this.locatedPos = Object.assign({}, data[0]);
    //     // }
    //     // const currWidth = currStyle.lineWidth || this.style.lineWidth;
    //     // const line = CreatePolylineGeometry({
    //     //     data,
    //     //     width: currWidth,
    //     //     groundLine: this.style.groundLine,
    //     // });
    //     // const primitive = new CreatePolylinePrimitive({
    //     //     data: line,
    //     //     groundLine: this.style.groundLine,
    //     // });
    //     // const appearance = this.conditionAppearance.default;
    //     // primitive.setAppearance(appearance);
    //     // if (!this.style.groundLine) {
    //     //     primitive.setBloom(currStyle.bloom);
    //     // }
    //     // return this.collection.add(primitive);
    // }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected createAppearance<ILayerStyle>(condition: string, style: ILayerStyle) {
        if (!condition || !style) {
            return;
        }
        this.conditionMaterial[condition] = new ColorMaterial(style as any);
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "LineWorkerFun";
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
        this.collectionToScene();
    }
    protected onDataOver() {
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
        this.temparr = [];
    }
    /**
     * @description: 更新样式之后重置材质
     * @return: void
     */
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
