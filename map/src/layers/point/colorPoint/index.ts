import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { SceneServer } from "../../../map/sceneServer";
import { offsetPoint, transformColor } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle} from "./style";

/**
 * 正常的颜色点
 */
export class ColorPoint extends Point<ILayerStyle> {
    public appearance: any;
    public workerFunName = "PointWorkerFun";
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
        if (!this.viewer) { return; }
    }
    public collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    public updateStyle(style: ILayerStyle): void {
        this.dealCondition(style);
        const points = InstanceContainer.getPoints(this.collection) as any[];
        this.changeBloom(style.bloom);
        points.forEach((element) => {
            const type = this.judgeItemStyleType(element.kd_info, style.condition);
            const currStyle = this.appearance[type];
            const newStyle = {...style, ...currStyle};
            // let newStyle = {} as ILayerStyle;
            // if (type === "default") {
            //     newStyle = {...currStyle, ...style};
            // } else {
            //     newStyle = {...style, ...currStyle};
            // }
            if (style.color) {
                element.color = transformColor(newStyle.color);
            }
            if (style.pixelSize) {
                element.pixelSize = newStyle.pixelSize;
            }
        });
        this.style = {...this.style, ...style};
    }
    public removeData() {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("point");
        this.collectionToScene();
    }
    public showEnties(idArr: string[], show: boolean) {
        const points = (this.collection as any)._pointPrimitives as any[];
        if (show) { // 如果有显示的目标， 先显示集合
            (this.collection as any).show = true;
            for (const point of points) {
                if (!point.kd_info) {
                    break;
                }
                const flag = idArr.includes(point.kd_info.id.split("#")[0]);
                point.show = flag;
            }
        } else { // 如果隐藏目标
            for (const point of points) {
                if (!point.kd_info) {
                    break;
                }
                const flag = idArr.includes(point.kd_info.id.split("#")[0]);
                point.show = !flag;
            }
        }
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
        this.collection = new InstanceContainer("point");
        this.appearance = {};
        this.collectionToScene();
    }
    protected updatePointStyle(point: any) {
        const currStyle = this.appearance[this.judgeItemStyleType(point.kd_info, this.style.condition)];
        if (currStyle.color) {
            point.color = transformColor(currStyle.color);
        }
        if (currStyle.pixelSize) {
            point.pixelSize = currStyle.pixelSize;
        }
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.appearance.default = {...this.appearance.default, ...this.style};
        this.dealCondition(this.style);
    }
    protected onData(option: IWorkerMsg): void {
        let data = option.dataArr;
        if (!data) {
            return;
        }
        if (!this.locatedPos) {
            this.locatedPos = data as any;
        }
        const style = this.style;
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;

        const baseCfg = this.baseCfg;
        // tslint:disable-next-line: max-line-length
        data = offsetPoint(data as any, (baseCfg as any).northOffset, (baseCfg as any).eastOffset, currStyle.height || 0.0) as any;
        const currEntity = {
            id: currPoint.id || option.layerName + String(Math.random()).slice(2, 20),
            position: data,
            pixelSize: currStyle.pixelSize,
            color: transformColor(currStyle.color),
        };
        // const points = data;
        // for (let i = 0, len = points.length; i < len; i++) {
        //     const currPoint = (points as IlonLatHeight[])[i];
        //     const currStyle = this.appearance[this.judgeItemStyleType(currPoint, style.condition)];
        //     const color1 = transformColor(currStyle.color) || defaultColor;
        //     const size = currStyle.pixelSize || defaultPixelSize;
        //     const center = Cesium.Cartesian3.fromDegrees(
        //         currPoint.lon,
        //         currPoint.lat,
        //         currPoint.height || defaultHeight,
        //     );
        //     const currEntity = {
        //         id: currPoint.id || "colorPoint_" + i,
        //         position: center,
        //         pixelSize: size,
        //         color: color1,
        //     };
        //     (this.collection.add(currEntity) as any).kd_info = Cesium.clone(currPoint as any);
        //     (this.collection.add(currEntity) as any).kd_style = Cesium.clone(style);
        // }
        const currP = this.collection.add(currEntity);
        InstanceContainer.setPrimitiveShow(currP, this.baseCfg.visible);
        InstanceContainer.setPrimitiveBloom(currP, style.bloom);
        currP.kd_info = kdinfo;
        currP.kd_style = currStyle;
    }
    protected onDestroy(): void {
        if (this.viewer) {
            this.viewer.removePrimitive(this.collection);
        }
        (this.collection as any) = null;
    }
    protected onDataOver(): void {
        // this.collectionToScene();
        // if (this.baseCfg.visible) {
        //     if (this.judgeCurrLevlShow()) {
        //         this.onShow();
        //     } else {
        //         this.onHide();
        //     }
        // } else {
        //     this.onHide();
        // }
    }
}
