import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
// import { LinePrimitiveImageFlowMaterial } from "../../../map/material/LinePrimitiveImageFlowMaterial";
import { SoaringPointMaterial } from "../../../map/material/SoaringPointMaterial";
import { CreatePolylineGeometry, CreatePolylinePrimitive } from "../../../map/primitive/createPolyline";
import { SceneServer } from "../../../map/sceneServer";
import { KvLog } from "../../../tools/log";
import { adjustCartesina3Height, offsetPoint } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class SoaringPoint extends Point<ILayerStyle> {
    public workerFunName!: string;
    private temparr: any;
    private material: any;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, initOpts);
        if (!this.viewer) { return; }
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
        this.temparr = [];
    }
    public updateStyle(style: ILayerStyle): void {
        if (this.receivingData) {
            console.warn("正在接收数据，请稍后重试！");
            return;
        }
        if (style.lineWidth && style.lineWidth !== this.style.lineWidth
            || style.height && style.height !== this.style.height) {
            this.style = {...this.style, ...style};
            this.removeData();
            this.postWorkerData();
            return;
        }
        this.style = {...this.style, ...style};
        this.resetMaterial();
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "PointWorkerFun";
        this.temparr = [];
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        const newStyle = {...this.style, ...style};
        newStyle.repeat = 1;
        this.style = {...this.style, ...style};
        this.style.brightness = this.baseCfg.brightness;
        this.material = new SoaringPointMaterial(newStyle);
        this.appearance = {};
        this.appearance.default = new KVAppearance({
            type: "PolylineMaterial",
            material: this.material,
        });
        this.changeBloom(this.style.bloom);
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
        if (!option || !option.dataArr) {
            KvLog.warn({
                msg: "子线程传回的数据有误！",
                layerName: this.layerName,
            });
            return;
        }
        const baseCfg = this.baseCfg;
        const points = option.dataArr;
        let data;
        if (!points.length && (points as any).x && (points as any).y) {
            const p1 = Object.assign({}, points);
            const p11 = offsetPoint(p1 as any, (baseCfg as any).northOffset, (baseCfg as any).eastOffset) as any;
            let resHeight = this.style.height;
            if (this.style.randomHeight) {
                resHeight = resHeight + (Math.random() - 0.5) * this.style.randomHeight;
            }
            const p2 = adjustCartesina3Height(p11 as any, resHeight);
            data = [p11, p2];
        } else {
            data = option.dataArr;
        }
        const done = option.done;
        const currData = option.currData;
        if (!data || !data.length) {
            return;
        }
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, data[0]);
        }
        const style = this.style;
        const currWidth = style.lineWidth || 2;

        // const firstP = offsetPoint(data[0] as any, (baseCfg as any).northOffset, (baseCfg as any).eastOffset) as any;
        // const nextP = offsetPoint(data[1] as any, (baseCfg as any).northOffset, (baseCfg as any).eastOffset) as any;
        const line = CreatePolylineGeometry({
            data,
            width: currWidth,
        });
        // new Cesium.GeometryInstance({
        //     geometry: new Cesium.PolylineGeometry({
        //         positions: data,
        //         width: currWidth,
        //     }),
        // });
        if (!this.baseCfg.mergeDraw) {
            const kdinfo = Object.assign({}, currData);
            delete kdinfo.points;
            const primitive = new CreatePolylinePrimitive({
                data: line,
            });
            primitive.setAppearance(this.appearance.default);
            primitive.setBloom(style.bloom);
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
        });
        primitive.setAppearance(this.appearance.default);
        primitive.setBloom(style.bloom);
        // (primitive as any).ableBloom = style.bloom;
        this.collection.add(primitive);
        this.temparr = [];
    }
    protected onDestroy(): void {
        if (this.viewer) {
            this.viewer.removePrimitive(this.collection);
            (this.collection as any) = null;
            if (this.appearance) {
                Object.keys(this.appearance).forEach((item) => {
                    this.appearance[item].material.destroy();
                    this.appearance[item] = null;
                });
            }
            this.appearance = null;
        }
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
    private collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
        this.temparr = [];
    }
    /**
     * @description: 更新样式之后重置材质
     * @return: void
     */
    private resetMaterial() {
        this.material.reset(this.style);
        this.changeBloom(this.style.bloom);
    }
}
