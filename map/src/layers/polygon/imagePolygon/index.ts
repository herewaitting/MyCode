import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { ImageMaterial } from "../../../map/material/ImageMaterial";
import { CreatePolygonGeometry, PolygonGeometryPrimitive } from "../../../map/primitive/PolygonGeometry";
import { SceneServer } from "../../../map/sceneServer";
import { KvLog } from "../../../tools/log";
import { IWorkerMsg } from "../../layer";
import { Polygon } from "../polygon";
import { DefaultStyle, ILayerStyle } from "./style";

export class ImagePolygon extends Polygon<ILayerStyle> {
    public workerFunName!: string;
    private temparr: any;
    private material!: ImageMaterial;
    private conditionMaterial: any;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, initOpts);
        if (!this.viewer) { return; }
    }
    public removeData(): void {
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        this.dealCondition(style);
        this.createConditionApp();
        if (style.stickGround !== this.style.stickGround) {
            this.removeData();
            this.postWorkerData();
        }
        this.style = {...this.style, ...style};
        this.resetMaterial(this.style);
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "PolygonWorkerFun";
        this.temparr = [];
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.conditionMaterial = {};
        this.conditionAppearance = {};
        this.collectionToScene();
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.dealCondition(this.style);
        this.material = new ImageMaterial(this.style);
        this.conditionAppearance.default = new KVAppearance({
            type: "EllipsoidSurfaceAppearance",
            material: this.material,
        });
        this.createConditionApp();
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
        const done = option.done;
        if (!data || !data.length) {
            return;
        }
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, data[0]);
        }
        const style = this.style;
        const line = CreatePolygonGeometry({
            data,
            holes: option.holes,
        });
        this.temparr.push(line);
        if (!done) {
            return;
        }
        const primitive = new PolygonGeometryPrimitive({
            data: this.temparr,
            ground: this.style.stickGround,
        });
        primitive.setAppearance(this.conditionAppearance.default);
        primitive.setBloom(style.bloom);
        this.collection.add(primitive);
        this.temparr = [];
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
    protected onDataOver() {
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
    protected createAppearance<ILayerStyle>(condition: string, style: ILayerStyle) {
        if (!condition || !style) {
            return;
        }
        this.conditionMaterial[condition] = new ImageMaterial(style as any);
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
