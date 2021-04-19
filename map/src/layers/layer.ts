import * as EventEmitter from "eventemitter3";
import { cloneDeep } from "lodash";
import { merge } from "lodash";
import { ILonLatHeight } from "../interface";
import { ILayerOption } from "../layerManager";
import { DataService, IPostMsgOpt } from "../map/dataService";
// import { CompareData } from "../map/dataService";
import { InstanceContainer } from "../map/instanceContainer";
import { SceneServer } from "../map/sceneServer";
import { IWorldPos } from "../scene";
// import { Dep, IChangePropsParams } from "./Dep";
import { Line } from "./line/line";

export interface ILayer {
    style: any;
    data: any;
    locatedPos: IWorldPos;
    appearance: any;
    layerName: string; // 组件传来的图层名称
    layerType: string; // Point、Line、Polygon
    customWorkerOpts: any;
    hooks: Partial<ILayerHooks>;
    baseCfg: IBaseCfg;
    collection: InstanceContainer;
    hide: (auto: boolean | undefined) => void;
    show: (auto: boolean | undefined) => void;
    destroy: () => void;
}

// export interface ILayerStatus {
//     inited: boolean;
//     [key: string]: any;
// }

// 基础配置，层级显示隐藏
export interface IBaseCfg {
    minVisibleLevel: number;
    maxVisibleLevel: number;
    visible: boolean;
    enableLevlControl: boolean;
    mergeDraw: boolean;
    tags: string;
    northOffset: number;
    eastOffset: number;
    brightness: number;
}

// 默认基础配置
export const DefaultBaseCfg: IBaseCfg = {
    minVisibleLevel: 0,
    maxVisibleLevel: 25,
    visible: true,
    enableLevlControl: false,
    mergeDraw: false,
    tags: "",
    northOffset: 0,
    eastOffset: 0,
    brightness: 1,
};

// webworker传回的数据类型接口
export interface IWorkerMsg {
    layerName: string;
    dataArr: any[];
    done: boolean;
    currData: any;
    [key: string]: any;
}

// 图层生命周期钩子
export interface ILayerHooks {
    startInit?: () => void;
    endInit?: () => void;
    startDealStyle?: () => void;
    endDealStyle?: () => void;
    startDealData?: (data: any[]) => any[] | undefined;
    endDealData?: () => void;
    startDestroy?: () => void;
    endDestroy?: () => void;
}

export interface ICompareResult {
    del: any[];
    have: any[];
    append: any[];
    flash: any[];
}
export abstract class Layer<D> extends EventEmitter implements ILayer {
    public get visible() {
        return this._visible;
    }
    public set visible(val) {
        if (val === this._visible) {
            return;
        }
        this._visible = val;
        this.emit("visibleChange", val);
    }
    public static layerType: string;
    public static layerName: string;
    public layerName!: string;
    public viewer: SceneServer;
    public minWorkerNum: number = 100;
    public customWorkerOpts: any = {};
    public abstract workerFunName: string;
    public abstract layerType: string;
    public style: any;
    public data: any;
    public appearance: any;
    public locatedPos!: IWorldPos;
    public baseCfg: IBaseCfg = DefaultBaseCfg;
    public hooks: Partial<ILayerHooks> = {};
    public dataService!: DataService;
    // public depService!: Dep;
    public hideByHand: boolean = false;
    public collection!: InstanceContainer;
    public flashFrames: number = 30;
    public templateLayer!: Array<Line<D>>;
    public shapeType: string = "";
    protected receivingData: boolean = false;
    // tslint:disable-next-line: variable-name
    private _visible: boolean = true;
    private flashIndex: number = 0;
    private flashIdData: any;
    private initLayer: boolean = true;
    constructor(viewer: SceneServer, name: string, initOpts: Partial<ILayerOption<D>> = {}) {
        super();
        this.viewer = viewer;
        this.layerName = name;
        this.templateLayer = initOpts.templateLayer || [];
        this.init(initOpts);
    }
    public abstract removeData(): void;
    public abstract updateStyle(style: {[k: string]: any}): void;
    public updateRealTimePath(option: {dataArr: ILonLatHeight[]}) {
        //
    }
    /**
     * @description: 显示图层
     * @param {boolean} 自动控制或者手动控制
     * @return: void
     */
    public show(auto: boolean | undefined) {
        if (typeof auto === "undefined") {
            this.hideByHand = false;
        } else {
            return;
        }
        this.baseCfg.visible = true;
        this.visible = true;
        this.onShow();
    }
    /**
     * @description: 隐藏图层
     * @param {boolean} 自动控制或者手动控制
     * @return: void
     */
    public hide(auto: boolean | undefined) {
        if (typeof auto === "undefined") {
            this.hideByHand = true;
        } else {
            this.hideByHand = false;
        }
        this.baseCfg.visible = false;
        this.visible = false;
        this.onHide();
    }
    /**
     * @description: 设置图层样式
     * @param {T} 泛型样式
     * @return: void
     */
    public async setStyle<T>(style: T) {
        if (this.hooks && this.hooks.startDealStyle) {
            this.hooks.startDealStyle.call(this);
        }
        await this.onStyle(style);
        if (this.hooks && this.hooks.endDealStyle) {
            this.hooks.endDealStyle.call(this);
        }
    }
    public destroy() {
        this.viewer.removeEvent(this.layerName + "_realTime", "preUpdate");
        if (this.hooks && this.hooks.startDestroy) {
            this.hooks.startDestroy.call(this);
        }
        (this as any).workerFunName = null;
        (this as any).layerType = null;
        (this as any).style = null;
        (this as any).data = null;
        (this as any).locatedPos = null;
        this.onDestroy();
        if (this.hooks && this.hooks.endDestroy) {
            this.hooks.endDestroy.call(this);
        }
    }
    /**
     * @description: 图层定位
     * @return: void
     */
    public located() {
        if (this.locatedPos) {
            this.viewer.located(this.locatedPos);
            // const centerRad = Cesium.Cartographic.fromCartesian(this.locatedPos);
            // const height = 1000;
            // const newCenter = Cesium.Cartesian3.fromRadians(centerRad.longitude, centerRad.latitude, height);
            // this.viewer?.camera.flyTo({
            //     destination : newCenter,
            //     orientation : new Cesium.HeadingPitchRoll(0, -Cesium.Math.PI_OVER_TWO, 0),
            // });
        }
    }
    /**
     * @description: 激活闪烁
     * @param {string[]} id 数组
     */
    public activeFlash(idArr: string[]) {
        this.flashIndex = 0;
        this.flashIdData = idArr;
        this.viewer.removeEvent(this.layerName + "_flash", "preUpdate");
        // this.viewer.bindEvent(this.layerName + "_flash", "preUpdate", this.flashFuntion.bind(this));
        this.viewer.bindEvent(this.layerName + "_flash", "preUpdate", this.fadeFuntion.bind(this));
    }
    /**
     * @description: 取消闪烁
     */
    public deactiveFlash() {
        this.flashIndex = 0;
        this.viewer.removeEvent(this.layerName + "_flash", "preUpdate");
        this.collection.showPointsById(this.flashIdData, true);
    }
    /**
     * @description: 设置基础设置
     * @param {IBaseCfg} 基础设置
     * @return: void
     */
    public setBaseCfg(config?: Partial<IBaseCfg>) {
        this.baseCfg = {...this.baseCfg, ...(config || {})};
        this.visible = this.baseCfg.visible;
        (this as any)._initVisible = !!this.baseCfg.visible; // 保存初始化时的显示状态
    }
    /**
     * @description: 判断当前点信息，属于条件样式哪一条
     * @param {info} 当前信息
     * @param {condition} 当前条件
     * @return: void
     */
    public judgeItemStyleType(info: any, condition: any[]) {
        if (!condition || !condition.length) {
            return "default";
        }
        let resStr = "default";
        if (!info) {
            return resStr;
        }
        const re = /(\{\{)(\s*\w+\s*)(\}\})/gm;
        const tConditions = cloneDeep(condition);
        if (tConditions && tConditions.length) {
            for (const c of tConditions) {
                if (resStr !== "default") {
                    break;
                }
                if (c.condition) {
                    const oldCond = cloneDeep(c.condition);
                    const variables = c.condition.match(re); //  ["{{  variable  }}", "{{ variable }}"] || null
                    if (variables) {
                       for (const variable of variables) {
                           const execArr = re.exec(variable);
                           re.lastIndex = 0;
                           const dataKey = execArr ? execArr[2].trim() : "";
                           if (info[dataKey]) {
                               c.condition = c.condition.replace(new RegExp(variable), "'" + info[dataKey] + "'");
                               try {
                                   // tslint:disable-next-line: no-eval
                                   if (eval(c.condition)) {
                                       resStr = oldCond;
                                       break;
                                   }
                               } catch (err) {
                                   resStr = "default";
                               }
                           }
                        }
                    } else {
                        continue;
                    }
                } else {
                    continue;
                }
            }
        }
        return resStr;
    }
    // public judgeItemStyleType(info: any, condition: any[]) {
    //     if (!condition || !condition.length) {
    //         return "default";
    //     }
    //     let resStr = "default";
    //     if (!info) {
    //         return resStr;
    //     }
    //     const dataKeys = Object.keys(info);
    //     const rg = dataKeys.map((k) => {
    //         return {
    //             str: `{{${k}}}`,
    //             value: info[k],
    //         };
    //     });
    //     condition.forEach((item) => {
    //         let evalStr = "";
    //         rg.forEach((obj) => {
    //             if (item.condition.includes(obj.str)) {
    //                 evalStr = item.condition.replace(obj.str, `"${obj.value}"`);
    //             }
    //         });
    //         try {
    //             // tslint:disable-next-line: no-eval
    //             if (eval(evalStr)) {
    //                 resStr = item.condition;
    //             }
    //         } catch (err) {
    //             resStr = "default";
    //         }
    //     });
    //     return resStr;
    // }
    /**
     * @description: 初始化设置数据
     * @param {string | T[]} geojson 文件路径 或者指标数组
     * @return: void
     */
    public setData<T>(data: string | T[]) {
        if (this.hooks && this.hooks.startDealData) {
            data = this.hooks.startDealData.call(this, data as any[]) || data;
            this.emit("startDealData", data);
        }
        this.data = data;
        this.postWorkerData();
        // if (this.judgeUseWorker()) {
        //     this.postWorkerData();
        //     return;
        // }
        // this.onData(data);
        // if (this.hooks && this.hooks.endDealData) {
        //     this.hooks.endDealData(this);
        // }
    }
    /**
     * @description: webworker数据传输结束
     * @return: void
     */
    public dataOver() {
        this.receivingData = false;
        this.onDataOver();
        if (this.hooks && this.hooks.endDealData) {
            this.hooks.endDealData.call(this);
        }
    }
    /**
     * @description: 更新数据
     * @param {T[]} 指标数组
     * @return: void
     */
    public async updateData<T>(data: T[]) {
        this.emit("updateData", data);
        if (this.hooks.startDealData) {
            data = this.hooks.startDealData.call(this, data) || data;
        }
        // if (this.judgeResetLayerData(data)) {
        if (true) {
            this.data = data;
            this.removeData();
            this.postWorkerData();
            return;
        }
        // if (this.layerType === "Point" && this.templateLayer && this.templateLayer.length) {
        //     const style = this.style;
        //     let defaultOpt: IPostMsgOpt = {
        //         data,
        //         style,
        //         funName: this.workerFunName,
        //         layerType: "Line",
        //         realTime: true,
        //     };
        //     defaultOpt = {...defaultOpt, ...this.customWorkerOpts};
        //     this.dataService.PostMessage(defaultOpt);
        //     this.receivingData = true;
        // } else {
        //     CompareData(this, {
        //         old: this.data,
        //         new: data,
        //         style: this.style,
        //     });
        //     this.data = data;
        // }
    }
    /**
     * @description: 处理比对过后的数据
     * @param {ICompareResult} compareRes
     */
    public dealComparedData(compareRes: ICompareResult) {
        this.delHaved(compareRes.del);
        this.updateHaved(compareRes.have);
        this.appendData(compareRes.append);
        this.activeFlash(compareRes.flash);
    }
    /**
     * @description: 数据处理入口
     * @return: void
     */
    public postWorkerData() {
        if (this.layerType === "Building" && !this.workerFunName) {
            return;
        }
        const data = this.data;
        const style = this.style;
        let defaultOpt: IPostMsgOpt = {
            data,
            style,
            funName: this.workerFunName,
            layerType: (this.style.realTime || this.style.history) ? "Line" : this.layerType,
            initLayer: this.initLayer,
        };
        defaultOpt = {...defaultOpt, ...this.customWorkerOpts};
        this.dataService.PostMessage(defaultOpt);
        this.receivingData = true;
        this.initLayer = false;
    }
    /**
     * @description: 设置生命周期回调
     * @param {ILayerHooks} hooks
     * @return: void
     */
    public setHooks(hooks?: Partial<ILayerHooks>) {
        this.hooks = {...this.hooks, ...(hooks || {})};
    }
    protected delHaved(data: any) {
        //
    }
    protected updateHaved(data: any) {
        //
    }
    protected appendData(data: any) {
        //
    }
    protected abstract onHide(): void;
    protected abstract onShow(): void;
    protected abstract onInit(): void;
    protected abstract onStyle<T>(style: T): void;
    protected abstract onData(data: IWorkerMsg): void;
    protected abstract onDestroy(): void;
    protected abstract onDataOver(): void;
    protected dealData(data: IWorkerMsg) {
        if (!data) {
            console.warn("webworker传回数据有误！");
        }
        if (data.realTime) {
            this.pushData(data.currData);
        } else if (data.history) {
            this.dealHistoryData(data.currData);
        } else {
            this.onData(data);
        }
        if (data.done && !data.realTime) {
            console.log("传输结束");
            this.dataOver();
        }
    }
    protected judgeCurrLevlShow() {
        if (!this.baseCfg.enableLevlControl) {
            return true;
        }
        const lv = this.viewer.getLevel();
        if (lv >= this.baseCfg.minVisibleLevel && lv < this.baseCfg.maxVisibleLevel) {
            return true;
        } else {
            return false;
        }
    }
    protected dealHistoryData<T>(data: T[]) {
        //
    }
    protected pushData<T>(data: T[]) {
        //
    }
    // // baseCfg属性改变事件
    // protected onchangeProps(v: IChangePropsParams): void {
    //     // ..
    // }
    // private judgeResetLayerData(data: any) {
    //     if (this.shapeType === "CustomTextLabel") {
    //         return true;
    //     }
    //     if (typeof data === "string" || this.baseCfg.mergeDraw || typeof this.data === "string") {
    //         return true;
    //     }
    //     if (this.layerType !== "Point" && this.layerType !== "Line") {
    //         return true;
    //     }
    //     return false;
    // }
    private getDefautInitOpts() {
        return  {
            hooks: {},
            baseCfg: {},
            style: {},
        };
    }
    /**
     * @description: 图层初始化
     * @param {ILayerOption} 初始化参数
     * @return: void
     */
    private async init(initOpts: Partial<ILayerOption<any>>) {
        const opts = merge({}, this.getDefautInitOpts(), initOpts);
        this.data = [];
        this.setHooks(opts.hooks);
        if (this.hooks && this.hooks.startInit) {
            this.hooks.startInit.call(this);
        }
        this.dataService = new DataService(this as any);
        // // 初始化代理服务 由于目前所有显示隐藏的地方都是调用show和hide，暂时通过改变初始配置baseCfg的visible来标记当前图层的显示状态
        // this.depService = new Dep({
        //     isProxy: true,
        //     proxyTarget: this,
        // });
        // // 添加监听函数
        // this.depService.add(this.onchangeProps.bind(this));
        // // 监听 this.props 的变化，并把里面的属性全部代理到当前图层上
        // this.depService.observer(this.baseCfg, this);
        this.setBaseCfg(opts.baseCfg);
        this.onInit();
        await this.setStyle(opts.style);
        if (this.hooks && this.hooks.endInit) {
            this.hooks.endInit.call(this);
            this.emit("endInit");
        }
    }
    // private flashFuntion() {
    //     const flashSceond = 20;
    //     if (this.flashIndex % flashSceond === 0) {
    //         if (this.flashIndex / flashSceond % 2 === 0) {
    //             this.collection.showPointsById(this.flashIdData, true);
    //         } else {
    //             this.collection.showPointsById(this.flashIdData, false);
    //         }
    //     }
    //     this.flashIndex++ ;
    //     if (this.flashIndex >= 1000000) {
    //         this.flashIndex = 0;
    //     }
    // }
    private fadeFuntion() {
        let alphaNum = 1 / this.flashFrames;
        // if (this.flashIndex % flashSceond === 0) {
        if (Math.floor(this.flashIndex / this.flashFrames) % 2 === 0) {
            // this.collection.fadePointsById(this.flashIdData, alphaNum);
        } else {
            alphaNum = -alphaNum;
        }
        // }
        this.collection.fadePointsById(this.flashIdData, alphaNum);
        this.flashIndex++ ;
        if (this.flashIndex >= 1000000) {
            this.flashIndex = 0;
        }
    }
}
