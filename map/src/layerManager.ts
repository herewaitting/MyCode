import * as Cesium from "cesium";
import * as EventEmitter from "eventemitter3";
import { IBaseCfg, ILayer, ILayerHooks } from "./layers/layer";
import { SceneServer } from "./map/sceneServer";
import { UseableLayers } from "./map/setting/useableLayer";

export interface ILayerOption <T> {
    baseCfg: Partial<IBaseCfg>;
    style: T;
    hooks: Partial<ILayerHooks>;
    templateLayer: any[];
}

export interface ILayerCollection {
    "Point": {
        [key: string]: any;
    };
    "Line": {
        [key: string]: any;
    };
    "Polygon": {
        [key: string]: any;
    };
    "Building": {
        [key: string]: any;
    };
    "Analysis": {
        [key: string]: any;
    };
}

const SupportAvoid: {[key: string]: boolean} = {
    Billboard: true,
    CustomTextLabel: true,
    GifBillboard: true,
    TextLabel: true,
}

const DefaultLayerCollection: ILayerCollection = {
    Point: {},
    Line: {},
    Polygon: {},
    Building: {},
    Analysis: {},
};

export class LayerManager extends EventEmitter {
    public static UseableLayer: any = {};
    public static registerLayer(type: string, layer: ILayer) {
        LayerManager.UseableLayer[type] = layer;
    }
    // tslint:disable-next-line: max-line-length
    public static addLayer<T>(viewer: SceneServer, layerName: string, layerType: string, initOpts: Partial<ILayerOption<T>> = {}) {
        const layer = new LayerManager.UseableLayer[layerType](viewer, layerName, initOpts);
        layer.shapeType = layerType;
        return layer;
    }
    public addedLayers: ILayerCollection = DefaultLayerCollection;
    public viewer!: SceneServer;
    public avoidLayers: {[key: string]: ILayer} = {};
    public ableAvoid: boolean = false;
    private layerNames: string[] = [];
    private context2D: any;
    constructor(viewer: SceneServer) {
        super();
        this.viewer = viewer;
        this.viewer.bindEvent("qj_avoid", "cameraChange", this.avoidLayerPoint.bind(this));
        // this.viewer.bindEvent("qj_avoid", "preUpdate", this.avoidLayerPoint.bind(this));
        const canvas = document.createElement("canvas");
        this.context2D = canvas.getContext("2d");
    }
    /**
     * @description: 图层管理销毁
     * @return: void
     */
    public destroy() {
        this.removeAll();
        this.addedLayers = null as any;
        this.viewer.destroy();
        (this.viewer as any) = null;
    }
    // 获取所有图层实例
    public getAllLayers() {
        const pointLayers = Object.values(this.addedLayers.Point);
        const LineLayers = Object.values(this.addedLayers.Line);
        const polygonLayers = Object.values(this.addedLayers.Polygon);
        const analysisLayers = Object.values(this.addedLayers.Analysis);
        const buildingLayers = Object.values(this.addedLayers.Building);
        const allLayers = pointLayers.concat(LineLayers, polygonLayers, analysisLayers, buildingLayers);
        return allLayers;
    }
    /**
     * @description: 移除所有图层
     * @return: void
     */
    public removeAll() {
        Object.keys(this.addedLayers.Point).forEach((name) => {
            this.addedLayers.Point[name].destroy();
        });
        Object.keys(this.addedLayers.Line).forEach((name) => {
            this.addedLayers.Line[name].destroy();
        });
        Object.keys(this.addedLayers.Polygon).forEach((name) => {
            this.addedLayers.Polygon[name].destroy();
        });
        Object.keys(this.addedLayers.Building).forEach((name) => {
            this.addedLayers.Building[name].destroy();
        });
        Object.keys(this.addedLayers.Analysis).forEach((name) => {
            this.addedLayers.Analysis[name].destroy();
        });
        this.layerNames = [];
    }
    /**
     * 添加图层
     * @method addLayer
     * @param  {name} 图层名称
     * @param  {type} 图层类型
     * @return  promise
     * Partial --> 把当前接口内的所有参数转换成可选参数
     */
    public addLayer<T>(layerName: string, layerType: string, initOpts: Partial<ILayerOption<T>> = {}) {
        if (!LayerManager.UseableLayer[layerType]) {
            return;
        }
        if (this.layerNames.indexOf(layerName) >= 0) {
            console.warn("已添加该名称图层，请更换图层名称！");
            return;
        }
        if (!LayerManager.UseableLayer[layerType]) {
            console.warn("图层类型有误！");
            return;
        }
        const relationTemplateArr: any[] = [];
        if (initOpts && initOpts.style && (initOpts.style as any).relationTemplate) {
            // ((initOpts.style as any).relationTemplate as any[]).forEach((name) => {
            const temLay = this.getLayerByName((initOpts.style as any).relationTemplate);
            if (temLay) {
                relationTemplateArr.push(temLay);
            }
            // });
            initOpts.templateLayer = relationTemplateArr;
        }
        const layer = new LayerManager.UseableLayer[layerType](this.viewer, layerName, initOpts);
        (this.addedLayers as any)[layer.layerType][layerName] = layer;
        layer.shapeType = layerType;
        this.layerNames.push(layerName);
        this.emit("added", layer);
        if (SupportAvoid[layerType] && layer.style.ableAvoid) {
            this.avoidLayers[layerName] = layer;
        }
        return layer;
    }
    /**
     * @description: 根据图层名称获取图层
     * @param {string} layerName 图层名称
     * @return: void
     */
    public getLayerByName(layerName: string) {
        return this.addedLayers.Point[layerName]
        || this.addedLayers.Line[layerName]
        || this.addedLayers.Polygon[layerName]
        || this.addedLayers.Building[layerName]
        || this.addedLayers.Analysis[layerName];
    }
    /**
     * @description: 根据图层名移除图层
     * @param {string} layerName 图层名称
     * @return: void
     */
    public removeLayer(layerName: string) {
        const layer = this.getLayerByName(layerName);
        this.emit("delete", layer);
        if (layer) {
            layer.destroy();
        }
        delete this.addedLayers.Point[layerName];
        delete this.addedLayers.Line[layerName];
        delete this.addedLayers.Polygon[layerName];
        delete this.addedLayers.Building[layerName];
        delete this.addedLayers.Analysis[layerName];
        const index = this.layerNames.indexOf(layerName);
        this.layerNames.splice(index, 1);
        if (this.avoidLayers[layerName]) {
            delete this.avoidLayers[layerName];
        }
    }
    /**
     * @description: 获取抛物线图层的中点集合
     * @param {layerName} 图层名称
     * @return {Object}
     */
    public getParabolaMid(layerName: string) {
        const layer = this.getLayerByName(layerName);
        if (!layer) {
            return;
        }
        return layer.midPointObj;
    }
    /**
     * @description: 更新图层数据
     * @param {layerName} 图层名称
     * @param {data} 图层数据
     */
    public updateData(layerName: string, data: any) {
        const layer = this.getLayerByName(layerName);
        if (!layer) {
            return;
        }
        layer.updateData(data);
    }
    /**
     * @description: 根据图层名定位图层
     * @param {string} layerName 图层名称
     * @return: void
     */
    public locatedLayer(layerName: string) {
        const layer = this.getLayerByName(layerName);
        layer.located();
    }
    /**
     * @description: 遍历允许避让图层，实时避让
     */
    private avoidLayerPoint() {
        if (!this.ableAvoid) {
            return;
        }
        const winPosArr: IPosOfWindow[] = [];
        const names = Object.keys(this.avoidLayers);
        const windowWidth = (this.viewer.scene as any).context.drawingBufferWidth;
        const windowHeight = (this.viewer.scene as any).context.drawingBufferHeight;
        const context = this.context2D;
        for (let i = 0, len = names.length; i < len; i++) {
            const layer = this.avoidLayers[names[i]];
            // 如果图层隐藏了，直接跳过
            if (layer.collection && layer.collection.collection && !layer.collection.collection.show) {
                continue;
            }
            const pots = layer.collection.getLabels();
            if (!pots) {
                continue;
            }
            for (let point of pots) {
                let worldPos = point.position;
                if (point instanceof (Cesium as any).DrawCommand) {
                    worldPos = point._boundingVolume.center;
                }
                if (!worldPos) {
                    continue;
                }
                const winPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, worldPos);
                if (!winPos) {
                    continue;
                }
                winPos.x = winPos.x + layer.style.offsetX || 0;
                winPos.y = winPos.y + layer.style.offsetY || 0;
                const size = {
                    width: 0,
                    height: 0,
                }
                const scale = layer.style.scale;
                // 如果是广告牌，用广告牌图片的宽高乘以样式里缩放系数
                if (point instanceof Cesium.Billboard) {
                    const imgWidth = (point as any)._imageWidth;
                    const imgHeight = (point as any)._imageHeight;
                    size.width = scale * imgWidth;
                    size.height = scale * imgHeight;
                }
                // 如果是Cesium内置文本
                if (point instanceof Cesium.Label) {
                    context.font = `${layer.style.fontSize}px ${layer.style.fontType}`;
                    size.height = scale * layer.style.fontSize;
                    const messureRes = context.measureText(point.text);
                    if (messureRes && messureRes.width) {
                        size.width = scale * context.measureText(point.text).width;
                        if (layer.style.showBackground) {
                            size.width += layer.style.bgPX * 2;
                            size.height += layer.style.bgPY * 2;
                        }
                    }
                }
                // 如果是自定义文本
                if (layer.style.fixedWidth) {
                    size.width = scale * layer.style.fixedWidth;
                    size.height = scale * layer.style.fixedHeight;
                }
                // 过滤掉四个角落都不落在屏幕内， 此方法有问题：原本不会绘制到屏幕的点也会进行遍历
                if (winPos.x <= 0 - size.width) {
                    continue
                }
                if (winPos.y <= 0 - size.height) {
                    continue;
                }
                if (winPos.x >= windowWidth + size.width) {
                    continue;
                }
                if (winPos.y >= windowHeight + size.height) {
                    continue;
                }

                const winP: IPosOfWindow = {
                    center: winPos,
                    width: size.width,
                    height: size.height,
                }
                let overlay = false;
                point.show = true;
                // 遍历绘制到屏幕里的点，任意一个点与改点距离小于两者的宽高和，则视为遮挡
                for (let wpos of winPosArr) {
                    if (Math.abs(wpos.center.x - winP.center.x) < (wpos.width + winP.width) / 2 && 
                    Math.abs(wpos.center.y - winP.center.y) < (wpos.height + winP.height) / 2) {
                        point.show = false;
                        overlay = true;
                    }
                }
                if (!overlay) {
                    winPosArr.push(winP);
                }
            }
        }
    }
}

interface IPosOfWindow {
    center: Cesium.Cartesian2;
    width: number;
    height: number;
}

// 所有图层在这边注册
Object.keys(UseableLayers).forEach((layerType) => {
    const useableArr = (UseableLayers as any )[layerType] as any[];
    useableArr.forEach((layerInfo) => {
        LayerManager.registerLayer(layerInfo.type, layerInfo.layer);
    });
});
