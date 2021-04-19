import { ILayerOption } from "../../layerManager";
import { CameraControl } from "../../map/cameraControl";
import { Cartesian3 } from "../../map/core/Cartesian3";
import { InstanceContainer } from "../../map/instanceContainer";
import { SceneServer } from "../../map/sceneServer";
import { ILayer, Layer } from "../layer";

export interface IPathManager {
    index: number;
    points: Cartesian3[];
    pathPoints: Cartesian3[];

}

export interface IRealTimePath extends IPathManager {
    initPath: boolean;
    changed: boolean; // 记录push点状态，防止实时更新点
    primitive: any;
    linePrimitive: ILayer;
    oldLine: ILayer;
}

export interface ITrackedObj {
    id: string;
    type?: string; // "first"  "god"
    verticalDistance?: number; // 垂直距离
    horizontalDistance?: number; // 水平距离
    // newTarget: boolean;
    [key: string]: any;
}

export abstract class Point<D> extends Layer<D> {
    public layerType: string = "Point";
    public relationTemplate!: any[];
    public trackedPoint: ITrackedObj | undefined;
    protected PathManager: {
        [key: string]: IRealTimePath;
    } = {};
    private currFPS: number = 60;
    private cameraControl!: CameraControl;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<D>) {
        super(viewer, layerName, initOpts);
        this.cameraControl = new CameraControl(this.viewer);
        this.enableRealTimeUpdate();
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
            } else {
                if (condTxt !== "default") {
                    delete this.appearance[condTxt];
                    this.deleteAppearance(condTxt);
                }
            }
        });
    }
    public flashPrimitive() {
        //
    }
    public pushData<T>(data: T[]) {
        if (!data) {
            return;
        }
        this.resetCurrFPS();
        data.forEach((point) => {
            const id = (point as any).id;
            if (!this.PathManager[id]) {
                this.PathManager[id] = {} as IRealTimePath;
                this.PathManager[id].points = [];
                this.PathManager[id].pathPoints = [];
                this.PathManager[id].index = 0;
                this.PathManager[id].initPath = true;
                this.PathManager[id].changed = false;
                this.PathManager[id].primitive = this.collection.getPrimitiveById(id);
            }
            this.addRealTimePoint(this.PathManager[id], point as any);
        });
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
    protected dealHistoryData<T>(data: T[]) {
        this.pushData(data);
    }
    protected addRealTimePoint(pathObj: IRealTimePath, points: any) {
        if (!pathObj || !points) {
            return;
        }
        // (points.points as ILonLatHeight[]).forEach((llh) => {
        //     pathObj.points.push(Cartesian3.fromDegrees(llh.longitude, llh.latitude, llh.height || 0.5));
        // });
        pathObj.points = pathObj.points.concat(points.points);
        pathObj.changed = true;
        const avgFrame = this.computedFrames(points.points.length, pathObj.initPath);
        (points.points as any[]).forEach((point) => {
            const currCar3 = Cartesian3.fromDegrees(point.longitude, point.latitude, point.height || 0.5);
            this.fillPath(pathObj.pathPoints, currCar3, avgFrame);
        });
        pathObj.initPath = false;
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
        updateArr.forEach((point) => {
            needUpdateId.push(point.id);
        });
        this.collection.updateInfo(updateArr);
        const pots = InstanceContainer.getBills(this.collection) || InstanceContainer.getLabels(this.collection)
        || InstanceContainer.getPoints(this.collection) || InstanceContainer.getPrimitives(this.collection);
        (pots as any[]).forEach((point) => {
            if (needUpdateId.indexOf(point && point.kd_info && point.kd_info.id) >= 0) {
                this.updatePointStyle(point);
            }
        });
    }
    protected appendData(newArr: any) {
        if ( !newArr ) {
            return;
        }
        (newArr as any[]).forEach((point, index) => {
            const center = Cartesian3.fromDegrees(point.longitude, point.latitude, point.height || 0);
            this.onData({
                dataArr: center as any,
                kdinfo: point,
                currStyle: this.judgeItemStyleType(point, this.style.condition),
                done: index === newArr.length,
            } as any);
        });
    }
    protected onDel(delArr: any) {
        this.collection.remove(delArr);
    }
    protected updatePointStyle(point: any) {
        //
    }
    private fillPath(path: Cartesian3[], point: Cartesian3, avgFrame: number) {
        if (!path.length) {
            path.push(point);
            return;
        }
        const firstP = path[path.length - 1];
        const sceondP = point;
        for (let i = 1; i < avgFrame; i++) {
            const x = firstP.x + (sceondP.x - firstP.x) / avgFrame * i;
            const y = firstP.y + (sceondP.y - firstP.y) / avgFrame * i;
            const z = firstP.z + (sceondP.z - firstP.z) / avgFrame * i;
            path.push(new Cartesian3(x, y, z));
        }
    }
    /**
     * @description: 计算每两点之间帧数
     * @param {number} length 数组长度
     * @param {boolean} initPath 是否线路初始化
     */
    private computedFrames(length: number, initPath: boolean) {
        let totalFrames = this.style.delayTime * this.currFPS;
        totalFrames = Math.round(totalFrames);
        if (initPath) { // 如果是初始化路径，就多延迟一秒钟，即多填充1秒钟的帧数
            totalFrames += this.currFPS;
        }
        return Math.round(totalFrames / length);
    }
    private resetCurrFPS() {
        if ((this.viewer.scene as any)._performanceDisplay) {
            this.currFPS = (this.viewer.scene as any)._performanceDisplay._fpsText.textContent.split(" ")[0] * 1;
        } else {
            this.currFPS = 60;
        }
    }
    private enableRealTimeUpdate() {
        this.viewer.bindEvent(this.layerName + "_realTime", "preUpdate", this.updatePositionFun.bind(this));
    }
    /**
     * @description: 相机跟踪入口
     */
    private updatePositionFun() {
        this.collection.updateRealTimePosition(this.PathManager);
        this.updatePathLine();
        if (this.trackedPoint) {
            this.cameraControl.followTracked(this.PathManager, this.trackedPoint);
        }
    }
    /**
     * @description: 更新实时路径显示
     */
    private updatePathLine() {
        if (!this.PathManager) {
            return;
        }
        const pathObj = this.PathManager;
        for (const idStr of Object.keys(pathObj)) {
            const path = pathObj[idStr];
            const asideLayers = this.templateLayer;
            if (!asideLayers || !asideLayers.length) {
                return;
            }
            asideLayers.forEach((layer) => {
                if (path.changed) {
                    (layer as any).updateRealTimePath({
                        dataArr: path.points,
                    });
                }
                path.changed = false;
            });
        }
    }
}
