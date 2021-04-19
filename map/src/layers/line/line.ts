import { ILayerOption } from "../../layerManager";
import { Cartesian3 } from "../../map/core/Cartesian3";
import { InstanceContainer } from "../../map/instanceContainer";
import { ILonLatHeight } from "../../map/interface";
import { CreatePolylineGeometry, CreatePolylinePrimitive } from "../../map/primitive/createPolyline";
import { CustomPrimitive } from "../../map/primitive/customPrimitive";
import { SceneServer } from "../../map/sceneServer";
import { transformLonLatData } from "../../util";
import * as Ray from "../../worker/czmCore/Ray.js";
import { Layer } from "../layer";

export abstract class Line<D> extends Layer<D> {
    public layerType: string = "Line";
    public layerSign!: string;
    protected conditionAppearance: any;
    private delLine: any;
    private runingLine: any;
    private newLine: any;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<D>) {
        super(viewer, layerName, initOpts);
    }
    public dealCondition(style: any, mtlType?: boolean) {
        if (!style) {
            return;
        }
        const {condition, ...defaultStyle} = style;
        this.appearance.default = {...this.appearance.default, ...defaultStyle};
        if (condition && condition.forEach) {
            condition.forEach((item: any) => {
                if (!this.appearance[item.condition]) {
                    const conStr = item.condition;
                    const conditionStyle = item.style;
                    const newStyle = {...style, ...conditionStyle};
                    this.createAppearance(conStr, newStyle);
                }
                this.appearance[item.condition] = {
                    ...this.appearance.default,
                    ...item.style,
                };
            });
        }
        // if (mtlType) {
        //     (condition as any[]).forEach((item) => {
        //         const conStr = item.condition;
        //         const conditionStyle = item.style;
        //         const newStyle = {...style, ...conditionStyle};
        //         this.createAppearance(conStr, newStyle);
        //     });
        // }
        // 删除遗弃的条件样式
        Object.keys(this.appearance).forEach((condTxt) => {
            let contain = false;
            if (condition && condition.forEach) {
                condition.forEach((item: any) => {
                    if (item.condition === condTxt) {
                        contain = true;
                    }
                });
                if (!contain && condTxt !== "default") {
                    this.appearance[condTxt] = null;
                    delete this.appearance[condTxt];
                    this.deleteAppearance(condTxt);
                }
            }
        });
    }
    public updateRealTimePath(option: {dataArr: ILonLatHeight[]}) {
        if (!option || !option.dataArr || option.dataArr.length < 2) {
            return;
        }
        const newLineData = option.dataArr.slice(option.dataArr.length - 2);
        if (this.delLine) {
            this.collection.remove([this.delLine]);
            this.delLine = this.runingLine;
        }
        if (this.newLine) {
            // this.runingLine = this.newLine;
            this.delLine = this.newLine;
        }
        this.newLine = this.createOneLine(newLineData);
    }
    /**
     * @description: 控制图层是否开启泛光
     * @param {bloom} true 或者 false
     */
    protected changeBloom(bloom: boolean | undefined) {
        this.collection.changeBloom(bloom);
        // if (this.collection) {
        //     ((this.collection as any)._primitives as any[]).forEach((item) => {
        //         item.ableBloom = Boolean(bloom);
        //     });
        // }
    }
    protected createAppearance<S>(condition: string, newStyle: S) {
        //
    }
    protected deleteAppearance(condTxt: string) {
        //
    }
    protected delHaved(delArr: any) {
        if ( !delArr ) {
            return;
        }
        this.onDel(delArr);
    }
    protected updateHaved(updateArr: any[]) {
        if ( !updateArr ) {
            return;
        }
        const needUpdateId: any[] = [];
        updateArr.forEach((line) => {
            needUpdateId.push(line.id);
        });
        this.collection.updateInfo(updateArr);
        const pots = InstanceContainer.getPrimitives(this.collection);
        (pots as any[]).forEach((line) => {
            if (needUpdateId.indexOf(line.kd_info && line.kd_info.id) >= 0) {
                this.updateLineStyle(line);
            }
        });
    }
    protected appendData(newArr: any) {
        if ( !newArr ) {
            return;
        }
        const style = this.style;
        const lineIDManager: any = {};
        (newArr as any[]).forEach((point) => {
            if (!point.longitude) {
                if (point.lon) {
                    point.longitude = point.lon;
                    point.latitude = point.lat;
                }
            }
            if (point.longitude) {
                const id = point.id;
                if (!lineIDManager[id]) {
                    lineIDManager[id] = {};
                    lineIDManager[id].pots = [];
                }
                lineIDManager[id].pots.push(point);
            }
        });
        const lineArr = Object.keys(lineIDManager);
        lineArr.forEach((id, index) => {
            const line = lineIDManager[id].pots;
            if (this.layerSign === "Parabola") {
                const parabolaArr = getBesselPointsList({
                    start: line[0],
                    end: line[1],
                    splitNum: this.style.num || this.style.splitNum || 50,
                    clutchDistance: this.style.clutchDistance || 0,
                    curvature: this.style.curvature || 1,
                });
                this.onData({
                    dataArr: parabolaArr,
                    kdinfo: line,
                    currStyle: "default",
                } as any);
            } else {
                const currPoints: number[] = transformLonLatData(line as ILonLatHeight[], style.height || 0.5);
                const posArr = Cartesian3.fromDegreesArrayHeights(
                    currPoints,
                );
                this.onData({
                    layerName: this.layerName,
                    dataArr: posArr,
                    done: index === lineArr.length,
                    currData: line[0],
                });
            }
        });
    }
    protected onDel(delArr: any) {
        this.collection.remove(delArr);
    }
    protected updateLineStyle(line: any) {
        const type = this.judgeItemStyleType(line.kd_info, this.style.condition);
        const appearance = this.conditionAppearance[type];
        CustomPrimitive.updatePriAppearance(line, appearance);
    }
    protected createOneLine(data: ILonLatHeight[]) {
        const currStyle = this.appearance.default;
        const currWidth = currStyle.lineWidth || this.style.lineWidth;
        const carData: Cartesian3[] = [];
        data.forEach((llh) => {
            carData.push(Cartesian3.fromDegrees(llh.longitude, llh.latitude, llh.height || 0.5));
        });
        const line = CreatePolylineGeometry({
            data: carData,
            width: currWidth,
            groundLine: this.style.groundLine,
        });
        const primitive = new CreatePolylinePrimitive({
            data: line,
            groundLine: this.style.groundLine,
        });
        primitive.primitive.id = data[0].id;
        primitive.primitive.kd_info = data[0];
        const appearance = this.conditionAppearance.default;
        primitive.setAppearance(appearance);
        if (!this.style.groundLine) {
            primitive.setBloom(currStyle.bloom);
        }
        return this.collection.add(primitive);
    }
}

export interface IBesselOpts {
    start: ILonLatHeight;
    end: ILonLatHeight;
    splitNum: number;
    clutchDistance: number;
    curvature: number;
}

const getBesselPointsList = (option: IBesselOpts) => {
    const startP = option.start;
    const endP = option.end;
    const splitNum = option.splitNum;
    const clutchDistance = option.clutchDistance;
    const curvature = option.curvature;
    const controlP = computedControlPoint(startP, endP, curvature, clutchDistance);
    const car1 = Cartesian3.fromDegrees(startP.longitude, startP.latitude, startP.height || 0);
    const car2 = Cartesian3.fromDegrees(endP.longitude, endP.latitude, endP.height || 0);
    // tslint:disable-next-line: max-line-length
    return ComputedBesselArr([car1.x, car1.y, car1.z], [car2.x, car2.y, car2.z], [controlP.x, controlP.y, controlP.z], splitNum);
};

// tslint:disable-next-line: max-line-length
export const computedControlPoint = (startP: ILonLatHeight, endP: ILonLatHeight, curvature: number, clutchDistance: number) => {
    const midLLH = {
        longitude: (startP.longitude + endP.longitude) / 2,
        latitude: (startP.latitude + endP.latitude) / 2,
        height: (startP.height || 0 + endP.height || 0) / 2,
    };
    const car1 = Cartesian3.fromDegrees(startP.longitude, startP.latitude, startP.height || 0);
    const car2 = Cartesian3.fromDegrees(endP.longitude, endP.latitude, endP.height || 0);
    const distance = Cartesian3.distance(car1, car2);
    const midCar = Cartesian3.fromDegrees(midLLH.longitude, midLLH.latitude, midLLH.height || 0);
    let dir = Cartesian3.subtract(car2, car1);
    dir = Cartesian3.normalize(dir);
    const midUp = Cartesian3.normalize(midCar);
    const offsetDir = Cartesian3.cross(midUp, dir);
    const wanduHeight = distance / 2 * curvature;
    const tempMid = Cartesian3.fromDegrees(midLLH.longitude, midLLH.latitude, midLLH.height || 0 + wanduHeight);
    const offsetRay = new Ray(tempMid as any, offsetDir as any);
    return Ray.getPoint(offsetRay, clutchDistance);
};

const ComputedBesselArr = (p1: number[], p2: number[], cp: number[], ci: number) => {
    const bseArr: any[] = [];
    for (let i = 0; i < ci; i++) {
        const t = i / ci;
        const x = (1 - t) * (1 - t) * p1[0] + 2 * t * (1 - t) * cp[0] + t * t * p2[0];
        const y = (1 - t) * (1 - t) * p1[1] + 2 * t * (1 - t) * cp[1] + t * t * p2[1];
        const z = (1 - t) * (1 - t) * p1[2] + 2 * t * (1 - t) * cp[2] + t * t * p2[2];
        bseArr.push({
            x,
            y,
            z,
        });
    }
    return bseArr;
};
