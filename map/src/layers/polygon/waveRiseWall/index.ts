import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { MulityLineWallMaterial } from "../../../map/material/MulityLineWallMaterial";
import { WallGeometryPrimitive } from "../../../map/primitive/WallGeometry";
import { SceneServer } from "../../../map/sceneServer";
import { KvLog } from "../../../tools/log";
import { IWorkerMsg } from "../../layer";
import { Polygon } from "../polygon";
import { DefaultStyle, ILayerStyle } from "./style";

export class WaveRiseWall extends Polygon<ILayerStyle> {
    public workerFunName!: string;
    public customWorkerOpts: any;
    private material!: MulityLineWallMaterial;
    private conditionMaterial: any;
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
    public updateStyle(style: ILayerStyle): void {
        if (!style) {
            return;
        }
        this.dealCondition(style);
        this.createConditionApp();
        this.resetMaterial(style);
        if (style.height && style.height !== this.style.height) {
            this.style = {...this.style, ...style};
            this.customWorkerOpts.wallHeight = this.style.height;
            this.removeData();
            this.postWorkerData();
        }
        this.style = {...this.style, ...style};
        this.customWorkerOpts.wallHeight = this.style.height;
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "WallWorkerFun";
        this.collection = new InstanceContainer("primitive");
        this.customWorkerOpts = {
            wallHeight: 0,
        };
        this.appearance = {};
        this.conditionMaterial = {};
        this.conditionAppearance = {};
        this.collectionToScene();
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
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.dealCondition(this.style);
        this.material = new MulityLineWallMaterial(this.style);
        this.conditionAppearance.default = new KVAppearance({
            type: "PolylineMaterial",
            material: this.material,
        });
        this.customWorkerOpts.wallHeight = this.style.height;
        this.createConditionApp();
        this.changeBloom(this.style.bloom);
    }
    protected onData(option: IWorkerMsg): void {
        if (!option || !option.dataArr) {
            KvLog.warn({
                msg: "子线程传回的数据有误！",
                layerName: this.layerName,
            });
            return;
        }
        const data = option.dataArr;
        const currData = option.currData;
        if (!data || !data.length) {
            return;
        }
        const minHeight = [];
        const maxHeight = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
            if (this.style.height < 0) {
                maxHeight.push(this.style.minimumHeights);
                minHeight.push(this.style.minimumHeights + this.style.height);
            } else {
                minHeight.push(this.style.minimumHeights);
                maxHeight.push(this.style.minimumHeights + this.style.height);
            }
        }
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, data[0]);
        }
        const style = this.style;
        const wall = new WallGeometryPrimitive({
            data,
            minimumHeights: minHeight,
            maximumHeights: maxHeight,
        });
        const kdinfo = Object.assign({}, currData);
        delete kdinfo.points;
        wall.setAppearance(this.conditionAppearance.default);
        wall.setBloom(style.bloom);
        this.collection.add(wall);
        wall.primitive.kd_info = kdinfo;
    }
    /**
     * @description: 图层销毁
     * @return: void
     */
    protected onDestroy() {
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
     * @description: 控制图层是否开启泛光
     * @param {bloom} true 或者 false
     */
    protected changeBloom(bloom: boolean | undefined) {
        this.collection.changeBloom(bloom);
    }
    protected onDataOver() {
        // this.collectionToScene();
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
    protected deleteAppearance(condTxt: string) {
        if (this.conditionAppearance[condTxt]) {
            this.conditionAppearance[condTxt].destroy();
        }
    }
    protected createAppearance<ILayerStyle>(condition: string, style: ILayerStyle) {
        if (!condition || !style) {
            return;
        }
        this.conditionMaterial[condition] = new MulityLineWallMaterial(style as any);
    }
    private collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    private resetMaterial(style: ILayerStyle) {
        // this.material.reset({...this.style, ...style});
        this.conditionAppearance.default.resetMaterial({...this.style, ...style});
        const {condition, ...defaultStyle} = style;
        if (condition && condition.forEach) {
            condition.forEach((item: any) => {
                const currStyle = {...this.style, ...{...defaultStyle, ...item.style}};
                this.conditionAppearance[item.condition].resetMaterial(currStyle);
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
