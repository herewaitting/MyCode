import * as Cesium from "cesium";
import { ILayerOption } from "../../../layerManager";
import { Cartesian3 } from "../../../map/core/Cartesian3";
import { InstanceContainer } from "../../../map/instanceContainer";
import { SceneServer } from "../../../map/sceneServer";
import { offsetPoint, transformColor } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class TextLabel extends Point<ILayerStyle> {
    public workerFunName!: string;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
        if (!this.viewer) { return; }
    }
    public collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("label");
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        if (style.fontSize && style.fontSize !== this.style.fontSize) {
            this.style = {...this.style, ...style};
            this.removeData();
            this.postWorkerData();
            return;
        }
        this.style = {...this.style, ...style};
        const labels = InstanceContainer.getLabels(this.collection);
        InstanceContainer.updateLabelStyle(labels, this.style);
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
        this.collection = new InstanceContainer("label");
        this.appearance = {};
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.appearance.default = {...this.appearance.default, ...this.style};
        this.style.windowWidth = this.style.size;
    }
    protected onData(option: IWorkerMsg): void {
        const data = option.dataArr;
        if (!data || !(data as any).x) {
            console.warn(`${this.layerName}:worker传递数据有误！`);
            return;
        }
        const style = this.style;
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        // const currStyle = this.appearance[option.currStyle];
        const center = data;
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, center) as any;
        }
        const text = kdinfo[this.style.fieldKey || "name"];
        const position = Cartesian3.fromDegrees(kdinfo.longitude, kdinfo.latitude, kdinfo.height || 0.5);
        // tslint:disable-next-line: max-line-length
        // const currPosition = Cartesian3.fromDegrees(kdinfo.longitude, kdinfo.latitude, kdinfo.height || 0.5 + style.height);

        const baseCfg = this.baseCfg;
        // tslint:disable-next-line: max-line-length
        const currPosition = offsetPoint(center as any, (baseCfg as any).northOffset, (baseCfg as any).eastOffset, style.height || 0.0) as any;

        const label = this.collection.add({
            text,
            position: currPosition,
            fillColor: transformColor(style.fillColor),
            scale: style.scale,
            font: `${style.fontSize}px ${style.fontType}`,
            showBackground: style.showBackground,
            backgroundColor: transformColor(style.backgroundColor),
            backgroundPadding: {x: style.bgPX, y: style.bgPY},
            pixelOffset: {x: style.offsetX, y: style.offsetY},
            disableDepthTestDistance: Number(style.disableDepthTestDistance),
            // tslint:disable-next-line: max-line-length
            scaleByDistance: new Cesium.NearFarScalar(style.near || 0, style.scale, style.far || Infinity, style.scale * (style.ratio || 1)),
            horizontalOrigin: Cesium.HorizontalOrigin[style.horizontalOrigin],
            verticalOrigin: Cesium.VerticalOrigin[style.verticalOrigin],
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(style.near || 0, style.far || Infinity),
        });
        label.show = this.baseCfg.visible;
        (label as any).kd_info = kdinfo;
        (label as any).kd_style = Object.assign({}, style);
        (label as any).oldPosition = position;
    }
    protected onDestroy(): void {
        this.viewer.removePrimitive(this.collection);
        (this.collection as any) = null;
    }
    protected onDataOver(): void {
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
}
