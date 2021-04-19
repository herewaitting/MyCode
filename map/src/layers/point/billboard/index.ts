import * as Cesium from "cesium";
// import Cartesian2 from "cesium/Source/Core/Cartesian2";
import { ILayerOption } from "../../../layerManager";
import { Cartesian3 } from "../../../map/core/Cartesian3";
import { InstanceContainer } from "../../../map/instanceContainer";
import { SceneServer } from "../../../map/sceneServer";
import { Video2Texture } from "../../../tools/Video2Texture";
import { offsetPoint } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle} from "./style";


/**
 * 广告牌点
 */
// 同步
export class Billboard extends Point<ILayerStyle> {
    public appearance: any;
    public workerFunName: string = "PointWorkerFun";
    public v2tTool!: Video2Texture;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
        if (!this.viewer) { return; }
    }
    public updateStyle(style: ILayerStyle) {
        this.dealCondition(style);
        this.changeBloom(style.bloom);
        const bills = InstanceContainer.getBills(this.collection) as any[];
        bills.forEach((element) => {
            let currStyle = this.appearance[this.judgeItemStyleType(element.kd_info, style.condition)];
            currStyle = {...style, ...currStyle};
            if (style.imgUrl) {
                InstanceContainer.changeBillboardImg(element, currStyle.imgUrl);
                // element.image = currStyle.imgUrl;
            }
            if (style.scale) {
                InstanceContainer.changeBillboardScale(element, currStyle.scale);
                // element.scale = currStyle.scale;
            }
            InstanceContainer.changeBillboardStyle(element, currStyle);
        });
        this.style = {...this.style, ...style};
    }
    /**
     * @description: 播放动画
     */
    public playAnimate() {
        if (this.v2tTool && this.v2tTool.dom) {
            (this.v2tTool.dom as any).play()
        }
    }
    public collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    public removeData() {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("billboard");
        this.collectionToScene();
    }
    public palyAnimate() {
        (this.v2tTool.dom as any).play();
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
        this.collection = new InstanceContainer("billboard");
        this.appearance = {};
        this.v2tTool = new Video2Texture({
            video: "",
            muted: true,
            autoplay: false,
            loop: false,
        });
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.appearance.default = {...this.appearance.default, ...this.style};
        this.dealCondition(this.style);
        this.collection.collection.ableAnimate = this.style.ableAnimate;
        if (this.style.ableAnimate) {
            this.v2tTool.setVideo(this.style.animateVideo);
        }
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
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;
        const currUrl = currStyle.imgUrl;
        const currScale = currStyle.scale;
        let center = data;
        const baseCfg = this.baseCfg;
        // tslint:disable-next-line: max-line-length
        center = offsetPoint(center as any, (baseCfg as any).northOffset, (baseCfg as any).eastOffset, currStyle.height || 0.0) as any;
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, center) as any;
        }
        const currEntity: any = {
            show: this.baseCfg.visible,
            id: currPoint.id || option.layerName + String(Math.random()).slice(2, 20),
            position: center,
            image: currUrl,
            scale: currScale,
            disableDepthTestDistance: Number(style.disableDepthTestDistance),
            // tslint:disable-next-line: max-line-length
            scaleByDistance: new Cesium.NearFarScalar(style.near, currScale, style.far, currScale * (style.ratio || 1)),
            // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(style.near, style.far),
            horizontalOrigin: Cesium.HorizontalOrigin[style.horizontalOrigin],
            verticalOrigin: Cesium.VerticalOrigin[style.verticalOrigin],
            // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            // scaleByDistance: new Cesium.NearFarScalar(5000, currScale, 20000, currScale * 0.5),
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 60000),
            // translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 6.0e5, 0.0),
        };
        // 添加像素偏移
        if (style.pixelOffset) {
            let pixelOffset;
            try {
                pixelOffset = JSON.parse(style.pixelOffset);
                currEntity.pixelOffset = new Cesium.Cartesian2(...pixelOffset);
            } catch (e) {
                console.warn("像素线性偏移解析错误");
            }
        }
        // 添加像素偏移
        if (style.offsetX || style.offsetY) {
            try {
                currEntity.pixelOffset = new Cesium.Cartesian2(style.offsetX, style.offsetY);
            } catch (e) {
                console.warn("像素线性偏移解析错误");
            }
        }
        // 添加像素线性偏移
        if (style.pixelOffsetScaleByDistance) {
            let pixelOffsetScaleByDistance;
            try {
                pixelOffsetScaleByDistance = JSON.parse(style.pixelOffsetScaleByDistance);
                currEntity.pixelOffsetScaleByDistance = new Cesium.NearFarScalar(...pixelOffsetScaleByDistance);
            } catch (e) {
                console.warn("像素线性偏移解析错误");
            }
        }
        const currBill = this.collection.add(currEntity as any);
        currBill.show = this.baseCfg.visible;
        currBill.oldPosition = Object.assign({}, center);
        (currBill as any).kd_style = Object.assign({}, style);
        (currBill as any).kd_info = kdinfo;
        (this.collection as any).ableBloom = style.bloom;
    }
    protected onDestroy(): void {
        this.viewer.removeEvent(this.layerName, "preUpdate");
        this.viewer.removePrimitive(this.collection);
        (this.collection as any) = null;
    }
    protected onDataOver(): void {
        this.addFloat();
        if (this.baseCfg.visible) {
            if (this.judgeCurrLevlShow()) {
                this.onShow();
            } else {
                this.onHide();
            }
        } else {
            this.onHide();
        }
        const that = this;
        // setTimeout(() => {
        that.changeBloom(that.style.bloom);
        setTimeout(() => {
            this.playAnimate();
        }, 500);
        // this.palyAnimate();
        // }, 1000);
    }
    protected updatePointStyle(point: any) {
        const currStyle = this.appearance[this.judgeItemStyleType(point.kd_info, this.style.condition)];
        if (currStyle.imgUrl) {
            InstanceContainer.changeBillboardImg(point, currStyle.imgUrl);
        }
        if (currStyle.scale) {
            InstanceContainer.changeBillboardScale(point, currStyle.scale);
        }
        // tslint:disable-next-line: max-line-length
        let center = Cartesian3.fromDegrees(point.kd_info.longitude || point.kd_info.lon, point.kd_info.latitude || point.kd_info.lat, point.kd_info.height || 0);
        if (!center || !center.x || !center.y) {
            console.log(point.kd_info);
            return;
        }
        center = offsetPoint(center, this.baseCfg.northOffset, this.baseCfg.eastOffset, this.style.height);
        InstanceContainer.changeBillboardPosition(point, center);
    }
    private updateVT() {
        if (!this.v2tTool || !this.v2tTool.dom) {
            return;
        }
        this.collection.collection.animateVT = this.v2tTool.getTexture(this.viewer);
    }
    private addFloat() {
        // this.viewer?.clock.onTick.addEventListener(this.floatFun);
        this.viewer.bindEvent(this.layerName, "preUpdate", this.floatFun);
        this.viewer.bindEvent(this.layerName + "_bill_animate", "preUpdate", this.updateVT.bind(this));
    }
    private floatFun = () => {
        if (!this.style.floatHeight) {
            return;
        }
        const bills: any[] = InstanceContainer.getBills(this.collection);
        // tslint:disable-next-line: max-line-length
        // const currDistance = this.style.floatHeight * Math.sin(new Date().getTime() / 500) + this.style.height;
        const currDistance = this.style.floatHeight * Math.sin(new Date().getTime() / 500) + this.style.height;
        bills.forEach((bill) => {
            if (!bill) { return; }
            if (!bill.oldPosition) {
                bill.oldPosition = Object.assign({}, bill.position);
            }
            if (!bill.kd_normal) {
                bill.kd_normal = Cartesian3.normalize(bill.oldPosition);
            }
            bill.image = bill._imageId;
            const scaleDis = Cartesian3.multiplyByScalar(bill.kd_normal, currDistance);
            bill.position = Cartesian3.add(bill.oldPosition, scaleDis);
            // bill.pixelOffset = new Cartesian2(0, currDistance);
        });
    }
}
