import { ILayerOption } from "../../layerManager";
import { Cartesian3 } from "../../map/core/Cartesian3";
import { InstanceContainer } from "../../map/instanceContainer";
import { ILonLatHeight } from "../../map/interface";
import { CustomPrimitive } from "../../map/primitive/customPrimitive";
import { SceneServer } from "../../map/sceneServer";
import { transformLonLatData } from "../../util";
import { Layer } from "../layer";

export abstract class Polygon<D> extends Layer<D> {
    public layerType: string = "Polygon";
    public layerSign!: string;
    protected conditionAppearance: any;
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
                this.updatePolygonStyle(line);
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
        let height = 0.5;
        if (this.layerSign === "wall") {
            height = style.height || 200;
        }
        const polygonArr = Object.keys(lineIDManager);
        polygonArr.forEach((id, index) => {
            const polygonPots = lineIDManager[id].pots;
            const currPoints: number[] = transformLonLatData(polygonPots as ILonLatHeight[], height);
            const posArr = Cartesian3.fromDegreesArrayHeights(currPoints);
            const currStyle = this.judgeItemStyleType(polygonPots[0], style.condition);
            this.onData({
                layerName: this.layerName,
                dataArr: posArr,
                done: index === polygonArr.length,
                currData: polygonPots[0],
                currStyle,
            });
        });
    }
    protected onDel(delArr: any) {
        this.collection.remove(delArr);
    }
    protected updatePolygonStyle(line: any) {
        const type = this.judgeItemStyleType(line.kd_info, this.style.condition);
        const appearance = this.conditionAppearance[type];
        CustomPrimitive.updatePriAppearance(line, appearance);
    }
}
