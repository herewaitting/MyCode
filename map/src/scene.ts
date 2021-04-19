import * as EventEmitter from "eventemitter3";
import { ILonLatHeight } from "./interface";
import { LayerManager } from "./layerManager";
import { BaseMap } from "./map/baseMap";
import { CameraControl } from "./map/cameraControl";
import { LightManager } from "./map/illuminant";
import { SceneControl } from "./map/sceneControl";
import { SceneServer } from "./map/sceneServer";
export { UseableLayers } from "./map/setting/useableLayer";
export { LayerManager };
export { Dantihua } from "./tools/dantihua";
import * as Cesium from "cesium";

// import * as WebpInfo from "./tools/webpinfo";
// console.log(WebpInfo);

export interface IKVSceneHooks {
    beforeInit?: () => void;
    afterInit?: () => void;
    beforeDestroy?: () => void;
    afterDestroy?: () => void;
}

export interface IKVScene3D {
    el: HTMLElement | string;
    sceneCfg: {
        [key: string]: any;
    };
    hooks: IKVSceneHooks;
}

export interface IWorldPos {
    x: number;
    y: number;
    z: number;
}

export interface IWindowPos {
    x: number;
    y: number;
}
export class KVScene3D extends EventEmitter {
    public viewer: SceneServer;
    public layerManager!: LayerManager;
    public sceneControl!: SceneControl;
    public baseMap!: BaseMap;
    public cameraControl!: CameraControl;
    public lightManager!: LightManager;
    public hooks: IKVSceneHooks = {};
    constructor(options: IKVScene3D) {
        super();
        const {el, sceneCfg, hooks} = {...options};
        this.hooks = {...this.hooks, ...hooks};
        if (this.hooks.beforeInit) {
            this.hooks.beforeInit.call(this);
        }
        Cesium.ExpandBySTC.limitPitch = -15;
        // tslint:disable-next-line: max-line-length
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = new Cesium.Rectangle(1.7829973881398438, 0.3842196387115912, 2.2272832685785895, 0.6985528496801465);
        this.viewer = new SceneServer(el, sceneCfg);
        if (!this.viewer) {
            return;
        }
        this.init();
        if (this.hooks.afterInit) {
            this.hooks.afterInit.call(this);
        }
    }
    public destroy() {
        if (this.hooks.beforeDestroy) {
            this.hooks.beforeDestroy.call(this);
        }
        this.cameraControl.destroy();
        this.unSubscribeEvent();
        (this.baseMap as any) = null;
        (this.sceneControl as any) = null;
        this.layerManager.destroy();
        this.layerManager = null as any;
        this.cameraControl.destroy();
        this.cameraControl = null as any;
        this.viewer.destroy();
        this.viewer = null as any;
        if (this.hooks.afterDestroy) {
            this.hooks.afterDestroy.call(this);
        }
    }
    public cgh2wp(lon: number, lat: number, height: number) {
        return this.viewer.cgh2wp(lon, lat, height);
    }
    public wp2cgh(position: IWorldPos): ILonLatHeight | undefined {
        return this.viewer.wp2cgh(position);
    }
    /**
     * subscribe
     */
    public subscribeEvent() {
        this.viewer.camera.changed.addEventListener(this.getLevel);
        this.viewer.camera.moveEnd.addEventListener(this.getLevel);
    }
    /**
     * unSubscribeEvent
     */
    public unSubscribeEvent() {
        this.viewer.camera.changed.removeEventListener(this.getLevel);
        this.viewer.camera.moveEnd.removeEventListener(this.getLevel);
    }
    /**
     * getLevel
     */
    public getLevel = () => {
        const level = this.viewer.getLevel();
        this.emit("mapLevelChange", level);
    }
    private init() {
        this.viewer.init();
        this.subscribeEvent();
        // 初始化图层管理器
        this.layerManager = new LayerManager(this.viewer);
        // 初始化场景控制对象
        this.sceneControl = new SceneControl(this.viewer);
        // 初始化底图配置对象
        this.baseMap = new BaseMap(this.viewer);
        // 初始化相机控制对象
        this.cameraControl = new CameraControl(this.viewer);
        // 初始化光源控制对象
        this.lightManager = new LightManager(this.viewer);
    }
}
