import * as Cesium from "cesium";
// import Cartesian2 from "cesium/Source/Core/Cartesian2";
import * as SuperGif from "libgif";
// import { throttle } from "lodash";
import { ILayerOption } from "../../../layerManager";
import { Cartesian3 } from "../../../map/core/Cartesian3";
import { InstanceContainer } from "../../../map/instanceContainer";
import { SceneServer } from "../../../map/sceneServer";
import { offsetPoint } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle} from "./style";

export class GifBillboard extends Point<ILayerStyle> {
    public workerFunName!: string;
    public gifManager: any;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
        this.hideDom();
    }
    public updateStyle(style: ILayerStyle): void {
        this.dealCondition(style);
        this.changeBloom(style.bloom);
        const bills = InstanceContainer.getBills(this.collection) as any[];
        bills.forEach((element) => {
            let currStyle = this.appearance[this.judgeItemStyleType(element.kd_info, style.condition)];
            currStyle = {...style, ...currStyle};
            if (style.imgUrl) {
                InstanceContainer.changeBillboardImg(element, currStyle.imgUrl);
            }
            if (style.scale) {
                InstanceContainer.changeBillboardScale(element, currStyle.scale);
            }
            InstanceContainer.changeBillboardHeight(element, currStyle.height);
            InstanceContainer.changeBillboardStyle(element, currStyle);
        });
        this.style = {...this.style, ...style};
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
        this.gifManager = {};
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.appearance.default = {...this.appearance.default, ...this.style};
        this.dealCondition(this.style);
        if (this.style.imageCollection) {
            this.collectPictures();
        } else {
            this.prepareGif();
        }
    }
    protected onData(option: IWorkerMsg): void {
        const data = option.dataArr;
        if (!data) {
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
            id: currPoint.id || option.layerName + String(Math.random()).slice(2, 20),
            position: center,
            image: currUrl,
            scale: currScale,
            // tslint:disable-next-line: max-line-length
            scaleByDistance: new Cesium.NearFarScalar(style.near || 0, currScale, style.far || Infinity, currScale * (style.ratio || 1)),
            disableDepthTestDistance: Number(style.disableDepthTestDistance),
            // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(style.near || 0, style.far || Infinity),

        };
        // 添加像素偏移
        if (style.offsetX || style.offsetY) {
            try {
                currEntity.pixelOffset = new Cesium.Cartesian2(style.offsetX, style.offsetY);
            } catch (e) {
                console.warn("像素线性偏移解析错误");
            }
        }
        const currBill = this.collection.add(currEntity as any);
        currBill.show = this.baseCfg.visible;
        currBill.oldPosition = Object.assign({}, center);
        (currBill as any).kd_style = Object.assign({}, style);
        (currBill as any).kd_info = kdinfo;
        (currBill as any).conditionTxt = option.currStyle;
        (this.collection as any).ableBloom = style.bloom;
    }
    protected onDestroy(): void {
        this.viewer.removeEvent(`${this.layerName}_gif`, "preUpdate");
        this.viewer.removeEvent(`${this.layerName}_float`, "preUpdate");
        this.viewer.removePrimitive(this.collection);
        (this.collection as any) = null;
    }
    protected onDataOver(): void {
        // this.collectionToScene();
        this.bindUpdate();
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
        setTimeout(() => {
            that.changeBloom(that.style.bloom);
        }, 1000);
    }
    protected updatePointStyle(point: any) {
        const currStyle = this.appearance[this.judgeItemStyleType(point.kd_info, this.style.condition)];
        if (currStyle.imgUrl) {
            InstanceContainer.changeBillboardImg(point, currStyle.imgUrl);
        }
        if (currStyle.scale) {
            InstanceContainer.changeBillboardScale(point, currStyle.scale);
        }
    }
    private prepareGif() {
        Object.keys(this.appearance).forEach((condTxt) => {
            if (!this.gifManager[condTxt]) {
                this.gifManager[condTxt] = {};
                this.gifManager[condTxt].imgArr = [];
                this.gifManager[condTxt].index = 0;
                this.gifManager[condTxt].newUpdate = true;
            }
            const currStyle = this.appearance[condTxt];
            this.parseGif(currStyle.imgUrl, this.gifManager[condTxt].imgArr).then(() => {
                const gifDom = document.getElementsByClassName("jsgif");
                const gifDomArr = Array.from(gifDom);
                for (const dom of gifDomArr) {
                    document.body.removeChild(dom);
                }
            });
        });
    }
    private parseGif(url: string, imgArr: any[]) {
        const img = document.createElement("img");
        img.style.display = "none";
        img.style.position = "float";
        img.src = url;
        // gif库需要img标签配置下面两个属性
        img.setAttribute("rel:animated_src", url);
        img.setAttribute("rel:auto_play", "0");
        document.body.appendChild(img);
        // 新建gif实例
        const rub = new SuperGif({ gif: img });
        return new Promise((resolve) => {
            rub.load(() => {
                for (let i = 1; i <= rub.get_length(); i++) {
                    // 遍历gif实例的每一帧
                    rub.move_to(i);
                    imgArr.push(rub.get_canvas().toDataURL());
                }
                // document.body.removeChild(img);
                resolve(imgArr);
            });
        });
    }
    private bindUpdate() {
        this.viewer.bindEvent(`${this.layerName}_gif`, "preUpdate", this.updateGif.bind(this));
    }
    private updateGif() {
        // throttle(() => {
        //     console.log(66666666);
        //     const bills = InstanceContainer.getBills(this.collection) as any[];
        //     let newUpdate = true;
        //     bills.forEach((element) => {
        //         const currStyle = element.conditionTxt;
        //         if (newUpdate) {
        //             this.gifManager[currStyle].index++;
        //         }
        //         newUpdate = false;
        //         const currImg = this.gifManager[currStyle];
        //         InstanceContainer.changeBillboardImg(element, currImg.imgArr[currImg.index]);
        //         if (currImg.index >= currImg.imgArr.length) {
        //             currImg.index = 0;
        //         }
        //     });
        // }, 16);
        const bills = InstanceContainer.getBills(this.collection) as any[];
        bills.forEach((element) => {
            const currStyle = element.conditionTxt;
            const currImg = this.gifManager[currStyle];
            const floorIndex = Math.floor(currImg.index / this.style.frameSpace); // 实际索引
            if (currImg.newUpdate) {
                currImg.newUpdate = false;
                currImg.index++;
                if (floorIndex >= currImg.imgArr.length - 1) {
                    currImg.index = 0;
                }
            }
            // if (currImg.index % this.style.frameSpace === 0) {
            //     // tslint:disable-next-line: max-line-length
            //     InstanceContainer.changeBillboardImg(element, currImg.imgArr[floorIndex]);
            // }
            InstanceContainer.changeBillboardImg(element, currImg.imgArr[floorIndex]);

        });
        // tslint:disable-next-line: forin
        for (const gifObj in this.gifManager) {
            this.gifManager[gifObj].newUpdate = true;
        }
    }
    private addFloat() {
        // this.viewer?.clock.onTick.addEventListener(this.floatFun);
        this.viewer.bindEvent(`${this.layerName}_float`, "preUpdate", this.floatFun.bind(this));
    }
    private floatFun() {
        const bills: any[] = InstanceContainer.getBills(this.collection);
        // tslint:disable-next-line: max-line-length
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
    private collectPictures() {
        // const firstImg = this.style.imgUrl;
        // const noPngUrl = firstImg.slice(0, -4);
    }
    private hideDom() {
        const styleDom = document.createElement("style");
        styleDom.innerHTML = `
        .jsgif {
            display: none;
        }`;
        document.head.appendChild(styleDom);
    }
}
