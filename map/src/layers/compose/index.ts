import { ILayerOption } from "../../layerManager";
import { LayerManager } from "../../layerManager";
import { SceneServer } from "../../map/sceneServer";
import { ICompareResult, Layer } from "../layer";
import { IWorkerMsg } from "../layer";

interface IComposeStyle {
    [k: string]: any;
}

export class ComposeLayer extends Layer<IComposeStyle> {
    public layerType!: string;
    public workerFunName!: string;
    public subLayers!: {[k: string]: any};
    constructor(viewer: SceneServer, layerName: string, initOpts: Partial<ILayerOption<IComposeStyle>> = {}) {
        super(viewer, layerName, initOpts);
    }
    public addSubLayer<T>(layerName: string, layerType: string, initOpts: Partial<ILayerOption<T>> = {}) {
        const subLayer = LayerManager.addLayer(this.viewer, layerName, layerType, initOpts);
        this.subLayers[layerName] = subLayer;
        subLayer.data = this.data;
        return subLayer;
    }
    public removeData() {
        // ...
        if (this.subLayers && Object.values(this.subLayers).length) {
            for (const subLayer of Object.values(this.subLayers)) {
                subLayer.removeData();
            }
        }
    }
    // 重写dealComparedData方法
    public dealComparedData(compareRes: ICompareResult) {
        for ( const subLayer of Object.values(this.subLayers)) {
            if (subLayer.shapeType && subLayer.shapeType === "CustomTextLabel") {
                subLayer.removeData();
                subLayer.data = compareRes.append.concat(compareRes.have);
                subLayer.postWorkerData();
            } else {
                subLayer.delHaved(compareRes.del);
                subLayer.updateHaved(compareRes.have);
                subLayer.appendData(compareRes.append);
                subLayer.activeFlash(compareRes.flash);
            }
        }
    }
    public async updateData(data: any[]) {
        this.emit("updateData", data);
        if (this.hooks.startDealData) {
            data = this.hooks.startDealData.call(this, data) || data;
        }
        if (this.subLayers && Object.values(this.subLayers).length) {
            for (const subLayer of Object.values(this.subLayers)) {
                console.warn("复合图层移除重建中...");
                subLayer.removeData();
                subLayer.data = data;
                subLayer.postWorkerData();
            }
        }
    }
    public updateStyle(style: {[k: string]: any}) {
        // const styleKeys = Object.keys(style);
        this.onDestroy();
        const subLayerCfg = style.subLayerCfg;
        if (!subLayerCfg.length) {
            return;
        }
        for (const cfg of subLayerCfg) {
            const {
                minVisibleLevel,
                maxVisibleLevel,
                eastOffset,
                northOffset,
                visible,
                enableLevlControl,
                mergeDraw,
                tags,
                isTemplate,
                ...layerStyle
            } = cfg.style;
            const baseCfg = {
               minVisibleLevel,
               maxVisibleLevel,
               visible,
               enableLevlControl,
               mergeDraw,
               tags,
               eastOffset,
               northOffset,
               isTemplate,
            };
            this.addSubLayer(cfg.layerName, cfg.layerType, {
                baseCfg,
                style: layerStyle,
            });
            // if (this.subLayers[cfg.layerName]) {
            //     this.subLayers[cfg.layerName].updateStyle(layerStyle);
            // } else {
            //     this.addSubLayer(cfg.layerName, cfg.layerType, {
            //         baseCfg,
            //         style: layerStyle,
            //     });
            // }
        }
        this.setData(this.data);
    }
    protected onData(data: IWorkerMsg) {
        for ( const subLayer of Object.values(this.subLayers)) {
            subLayer.onData(data);
        }
    }
    protected onDataOver() {
        for ( const subLayer of Object.values(this.subLayers)) {
            subLayer.onDataOver();
        }
    }
    protected onHide() {
        // ...
        for ( const subLayer of Object.values(this.subLayers)) {
            subLayer.hide();
        }
    }
    protected onShow() {
        for ( const subLayer of Object.values(this.subLayers)) {
            subLayer.show();
        }
    }
    protected onDestroy() {
        for ( const key of Object.keys(this.subLayers)) {
            this.subLayers[key].destroy();
            delete this.subLayers[key];
        }
        this.subLayers = {};
    }
    protected onInit() {
        this.style = {};
        this.subLayers = {};
        this.layerType = "Point";
        this.workerFunName = "PointWorkerFun";
    }
    protected onStyle(style: any) {
        // ...
        this.style = { ...this.style, ...style };
    }
}
