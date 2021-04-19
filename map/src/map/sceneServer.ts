import * as Cesium from "cesium";
import { ILonLatHeight } from "../interface";
import { InstanceContainer } from "./instanceContainer";

export interface IWorldPos {
    x: number;
    y: number;
    z: number;
}

export interface IWindowPos {
    x: number;
    y: number;
}

export interface ISceneServer {
    bindEvent: (name: string, time: string, callBack: (item: any) => void) => void;
    removeEvent: (name: string, time: string) => void;
    init: () => void;
    cgh2wp: (lon: number, lat: number, height: number) => IWindowPos;
    wp2cgh: (position: IWorldPos) => ILonLatHeight | undefined;
    // cameraChange: (cb: (item: any) => void) => void;
    renderPrimitive: (primitive: InstanceContainer) => void;
    removePrimitive: (primitive: InstanceContainer) => void;
}

export const EventMap: {[key: string]: string} = {
    preUpdate: "preUpdate",
    cameraChange: "cameraChange",
};

// Cesium.Viewer中的各种参数
export interface IviewerOptions {
    homeButton?: boolean; // 返回初始视角按钮
    infoBox?: boolean; // 操作提示按钮
    animation?: boolean; // 下方时间轴插件
    vrButton?: boolean; // VR按钮
    geocoder?: boolean; // 坐标定位按钮
    fullscreenButton?: boolean; // 全屏按钮
    baseLayerPicker?: boolean; // 底图选择器
    selectionIndicator?: boolean; // 单双击信息提示
    timeline?: boolean; // 下方时间轴插件
    navigationHelpButton?: boolean;
    navigationInstructionsInitiallyVisible?: boolean;
    sceneModePicker?: boolean;
    scene3DOnly?: boolean;
    creditContainer?: string | Element;
    imageryProvider?: any;
    shouldAnimate?: boolean;
    showRenderLoopErrors?: boolean;
}

const DefaultCfg: IviewerOptions = {
    homeButton: false,
    imageryProvider: new Cesium.SingleTileImageryProvider({
        url: require("../../static/img/earthbump.jpg"),
    }),
    infoBox: false,
    animation: false,
    shouldAnimate: true,
    vrButton: false,
    geocoder: false,
    fullscreenButton: false,
    baseLayerPicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    sceneModePicker: false,
    scene3DOnly: false,
    showRenderLoopErrors: true,
    creditContainer: document.createElement("div"),
    // contextOptions: {
    //     requestWebgl2: true,
    // },
} as any;

export class SceneServer extends Cesium.Viewer implements ISceneServer {
    public bindedEvent: {[key: string]: (item: any) => any} = {};
    public computedLevl!: (item: (item: any) => void) => void;
    private appearDirection!: string;
    private appearing: boolean = false;
    private gltfAppearing: boolean = false;
    constructor(el: Element | string, options: IviewerOptions) {
        super(el, {...DefaultCfg, ...options});
        this.camera.percentageChanged = 0.1; // 设置相机改变的灵敏度，数值越大触发的越懒惰
        this.bindCameraMoveEVT();
    }
    /**
     * @description: 设置是否允许栅格瓦片在相机移动时请求
     * @param {boolean} bool
     * @return {*}
     */
    public setGridTileRequest(bool: boolean) {
        (Cesium.ExpandBySTC as any).GridTileOpt.allowRequestImg = bool;
    }
    /**
     * @description: 更换单张底图服务
     * @param {string} url 图片链接
     */
    public changeSingleImagery(url: string) {
        if (!url) {
            return;
        }
        this.imageryLayers.remove(this.imageryLayers.get(0));
        const newImg = new Cesium.SingleTileImageryProvider({
            url,
        });
        (newImg as any).kvBase = true;
        this.imageryLayers.addImageryProvider(newImg);
        let newL = [(this.imageryLayers as any)._layers[(this.imageryLayers as any)._layers.length - 1]];
        // tslint:disable-next-line: max-line-length
        newL = newL.concat((this.imageryLayers as any)._layers.slice(0, (this.imageryLayers as any)._layers.length - 1));
        (this.imageryLayers as any)._layers = newL;
    }
    /**
     * @description: 场景绑定事件
     * @param {string} 名称
     * @return {string} 事件方式
     * @return {function} 监听执行函数
     */
    public bindEvent(name: string, time: string, callBack: (item: any) => void) {
        if (EventMap[time]) {
            if (time === "cameraChange") {
                // this.cameraChange(callBack);
                this.camera.changed.addEventListener(callBack);
                return;
            }
            if (this.bindedEvent[name]) {
                console.warn(`已存在名为${name}的事件！`);
                return;
            } else {
                (this.scene as any)[EventMap[time]].addEventListener(callBack);
                this.bindedEvent[name] = callBack;
            }
        }
    }
    /**
     * @description: 移除监听事件
     * @param {string} 名称
     * @param {string} 事件方式
     */
    public removeEvent(name: string, time: string) {
        (this.scene as any)[EventMap[time]].removeEventListener(this.bindedEvent[name]);
        delete this.bindedEvent[name];
    }
    /**
     * @description: 更改相机俯仰角限制
     * @param {number} angle 角度，默认-30度，0度为平行于地面
     */
    public changeCameraLimitPitch(angle: number) {
        if (!angle && angle !== 0) {
            return;
        }
        Cesium.ExpandBySTC.limitPitch = angle;
    }
    /**
     * @description: 初始化设置
     */
    public init() {
        // 隐藏大气层
        if (this.scene.skyAtmosphere) {
            this.scene.skyAtmosphere.show = false;
        }
        // 标记基础底图供组件使用
        (this.imageryLayers.get(0) as any).kvBase = true;
        // 隐藏月亮
        (this as any).scene.moon.show = false;
        // 根据设备像素比率设置场景比率
        if (window && window.devicePixelRatio) {
            this.resolutionScale = window.devicePixelRatio;
        }
        // 隐藏太阳
        (this as any).scene.sun.show = false;
    }
    /**
     * @description: 经纬度转屏幕坐标
     * @param {number} 精度
     * @param {number} 纬度
     * @param {number} 高度
     */
    public cgh2wp(lon: number, lat: number, height: number) {
        const car3 = Cesium.Cartesian3.fromDegrees(lon, lat, height || 0);
        const winPos = new Cesium.Cartesian2();
        Cesium.SceneTransforms.wgs84ToWindowCoordinates((this as any).scene, car3, winPos);
        return winPos;
    }
    /**
     * @description: 世界坐标转经纬度
     * @param {IWorldPos} 世界坐标
     * @return {ILonLatHeight | undefined} 经纬度对象
     */
    public wp2cgh(position: IWorldPos): ILonLatHeight | undefined {
        if (!position) { return; }
        const llh: ILonLatHeight = {
            longitude: 0,
            latitude: 0,
            height: 0,
        };
        const cgh = Cesium.Cartographic.fromCartesian(position as Cesium.Cartesian3);
        llh.longitude = Cesium.Math.toDegrees(cgh.longitude);
        llh.latitude = Cesium.Math.toDegrees(cgh.latitude);
        llh.height = cgh.height;
        return llh;
    }
    // /**
    //  * @description: 监听相机移动结束事件，并计算当前底图层级
    //  * @return: void
    //  */
    // public cameraChange(cb: (item: any) => void) {
    //     this.computedLevl = () => {
    //         if (this && this.scene.globe && (this.scene.globe as any)._surface._tilesToRender) {
    //             const renderTiles = (this.scene.globe as any)._surface._tilesToRender as any[];
    //             let maxLevl = 0;
    //             for (let i = 0; i < 10; i++) {
    //                 const currL = renderTiles[i] && renderTiles[i].level || 0;
    //                 if (maxLevl < currL) {
    //                     maxLevl = currL;
    //                 }
    //             }
    //             cb(maxLevl);
    //         }
    //     };
    //     this.camera.changed.addEventListener(this.computedLevl);
    // }
    /**
     * @description: 场景渲染集合
     * @param {InstanceContainer}
     */
    public renderPrimitive(primitive: InstanceContainer) {
        if (primitive && primitive.collection) {
            this.scene.primitives.add(primitive.collection);
        }
    }
    public getLevel() {
        const height = Cesium.Cartographic.fromCartesian(this.camera.position).height;
        const A = 40487.57;
        const B = 0.00007096758;
        const C = 91610.74;
        const D = -40467.74;
        return Math.round(D + (A - D) / (1 + Math.pow(height / C, B)));
    }
    /**
     * @description: 场景基础集合
     * @param {InstanceContainer}
     */
    public removePrimitive(primitive: InstanceContainer) {
        if (primitive && primitive.collection) {
            this.scene.primitives.remove(primitive.collection);
        }
    }
    /**
     * @description: 辅助功能，点定位
     * @return: void
     */
    public located(locatedPos: IWorldPos) {
        if (locatedPos) {
            const centerRad = Cesium.Cartographic.fromCartesian(locatedPos as Cesium.Cartesian3);
            const height = 1000;
            const newCenter = Cesium.Cartesian3.fromRadians(centerRad.longitude, centerRad.latitude, height);
            this.camera.flyTo({
                destination : newCenter,
                orientation : new Cesium.HeadingPitchRoll(0, -Cesium.Math.PI_OVER_TWO, 0),
            });
        }
    }
    /**
     * @description: 绑定白膜拔高动画
     */
    public addAppearEvent() {
        if (this.appearing) {
            return;
        }
        (this.scene as any)._preUpdate.addEventListener(this.appearEffect.bind(this));
        this.appearing = true;
        Cesium.ExpandBySTC.bmScaleZNum = 1.0;
    }
    /**
     * @description: 添加gltf拔高动画
     */
    public addGltfAppearEvent() {
        if (this.gltfAppearing) {
            return;
        }
        (this.scene as any)._preUpdate.addEventListener(this.appearGltfEffect.bind(this));
        this.appearing = true;
        Cesium.ExpandBySTC.gltfScaleZNum = 1.0;
    }
    /**
     * @description: 设置栅格底图瓦片最大缓存数
     * @param {number} num
     * @return {*}
     */
    public setImgTileCache(num: number) {
        if (!num || num < 100) {
            return;
        }
        this.scene.globe.tileCacheSize = num;
    }
    /**
     * @description: 移除白膜拔高动画
     */
    public removeAppearEvent() {
        (this.scene as any)._preUpdate.removeEventListener(this.appearEffect.bind(this));
        this.appearing = false;
        if (!Cesium.ExpandBySTC) {
            return;
        }
        Cesium.ExpandBySTC.bmScaleZNum = 1.0;
    }
    /**
     * @description: 移除gltf拔高动画
     */
    public removeGltfAppearEvent() {
        (this.scene as any)._preUpdate.removeEventListener(this.appearGltfEffect.bind(this));
        this.appearing = false;
        if (!Cesium.ExpandBySTC) {
            return;
        }
        Cesium.ExpandBySTC.gltfScaleZNum = 1.0;
    }
    /**
     * @description: 给3Dtiles白模加样式
     * @param {style} string 白模样式
     */
    public setStyleShader(style: string) {
        switch (style) {
            case IBMStyleType.BREATH_LAMP:
                Cesium.ExpandBySTC.appearTiles = true;
                Cesium.ExpandBySTC.styleBM = true;
                Cesium.ExpandBySTC.shaderOfBM = breathShaderText;
                break;
            case IBMStyleType.INTERVAL_LINES:
                Cesium.ExpandBySTC.appearTiles = true;
                Cesium.ExpandBySTC.styleBM = true;
                Cesium.ExpandBySTC.shaderOfBM = IntervalLineShaderText;
                break;
            // case IBMStyleType.RAINBOW_LINES:
            //     Cesium.ExpandBySTC.appearTiles = true;
            //     Cesium.ExpandBySTC.styleBM = true;
            //     Cesium.ExpandBySTC.shaderOfBM = RainbowShaderText;
            //     break;
            default:
                Cesium.ExpandBySTC.appearTiles = true;
                Cesium.ExpandBySTC.styleBM = false;
                Cesium.ExpandBySTC.shaderOfBM = "";
        }
    }
    /**
     * @description: 拔高执行函数
     */
    private appearEffect() {
        if (!Cesium.ExpandBySTC) {
            return;
        }
        const dotNum = Cesium.Cartesian3.dot(
            this.camera.direction,
            Cesium.Cartesian3.normalize(
                this.camera.position,
                new Cesium.Cartesian3(),
            ),
        );
        if (dotNum <= -0.85) {
            this.appearDirection = "down";
        } else {
            this.appearDirection = "up";
        }
        if (this.appearDirection === "up") {
            Cesium.ExpandBySTC.bmScaleZNum += 0.03;
        }
        if (this.appearDirection === "down") {
            Cesium.ExpandBySTC.bmScaleZNum -= 0.06;
        }
        if (Cesium.ExpandBySTC.bmScaleZNum <= 0.05) {
            Cesium.ExpandBySTC.bmScaleZNum = 0.05;
        }
        if (Cesium.ExpandBySTC.bmScaleZNum >= 1.0) {
            Cesium.ExpandBySTC.bmScaleZNum = 1.0;
        }
    }
    /**
     * @description: gltf拔高执行函数
     */
    private appearGltfEffect() {
        if (!Cesium.ExpandBySTC) {
            return;
        }
        const dotNum = Cesium.Cartesian3.dot(
            this.camera.direction,
            Cesium.Cartesian3.normalize(
                this.camera.position,
                new Cesium.Cartesian3(),
            ),
        );
        if (dotNum <= -0.85) {
            this.appearDirection = "down";
        } else {
            this.appearDirection = "up";
        }
        if (this.appearDirection === "up") {
            Cesium.ExpandBySTC.gltfScaleZNum += 0.03;
        }
        if (this.appearDirection === "down") {
            Cesium.ExpandBySTC.gltfScaleZNum -= 0.06;
        }
        if (Cesium.ExpandBySTC.gltfScaleZNum <= 0.05) {
            Cesium.ExpandBySTC.gltfScaleZNum = 0.05;
        }
        if (Cesium.ExpandBySTC.gltfScaleZNum >= 1.0) {
            Cesium.ExpandBySTC.gltfScaleZNum = 1.0;
        }
    }
    /**
     * @description: 绑定相机移动开始和相机移动事件，记录相机状态
     * @param {*}
     * @return {*}
     */
    private bindCameraMoveEVT() {
        this.camera.moveStart.addEventListener(this.unableRequestImg);
        this.camera.moveEnd.addEventListener(this.ableRequestImg);
    }
    private ableRequestImg() {
        if (Cesium.ExpandBySTC && (Cesium.ExpandBySTC as any).GridTileOpt) {
            (Cesium.ExpandBySTC as any).GridTileOpt.cameraMoving = false;
        }
    }
    private unableRequestImg() {
        if (Cesium.ExpandBySTC && (Cesium.ExpandBySTC as any).GridTileOpt) {
            (Cesium.ExpandBySTC as any).GridTileOpt.cameraMoving = true;
        }
    }
}

export enum IBMStyleType {
    BREATH_LAMP = "breath_lamp", // 呼吸灯效果
    INTERVAL_LINES = "interval_lines", // 等高线效果
    // RAINBOW_LINES = "rainbow_lines", // 彩虹条带效果
}
const breathShaderText =
"float stc_pl = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;\n" +
"float stc_sd = (abs(v_stcVertex.z) + 150.0) / 200.0 + sin(stc_pl) * 0.2;\n" +
"gl_FragColor *= vec4(stc_sd, stc_sd, stc_sd, 1.0);\n" +

"gl_FragColor *= vec4(1.2);\n" +
"float stc_a13 = fract(czm_frameNumber / 360.0);\n" +
"float stc_h = clamp(abs(v_stcVertex.z) / 110.0, 0.0, 1.0);\n" +
"stc_a13 = abs(stc_a13 - 0.5) * 2.0;\n" +
"float stc_diff = step(0.005, abs(stc_h - stc_a13));\n" +
"float stc_diff1 = step(0.005, abs(stc_h - stc_a13));\n" +
"gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - stc_diff);\n";

const IntervalLineShaderText =
// "float stc_pl = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;\n" +
// "float stc_sd = (abs(v_stcVertex.z) + 150.0) / 200.0 + sin(stc_pl) * 0.2;\n" +
// "gl_FragColor *= vec4(stc_sd, stc_sd, stc_sd, 1.0);\n" +
"float stc_sd = (abs(v_stcVertex.z) + 200.0) / 300.0;\n" +
"gl_FragColor *= vec4(stc_sd, stc_sd, stc_sd, 1.0);\n" +

"gl_FragColor *= vec4(1.2);\n" +
"float stc_a13 = fract(czm_frameNumber / 360.0);\n" +
"float stc_h = fract(abs(v_stcVertex.z) / 50.0);\n" +
"if(stc_h>0.05)return;\n" +
"gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - stc_h);\n";

// const RainbowShaderText =
// // "float stc_pl = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;\n" +
// // "float stc_sd = (abs(v_stcVertex.z) + 150.0) / 200.0 + sin(stc_pl) * 0.2;\n" +
// // "gl_FragColor *= vec4(stc_sd, stc_sd, stc_sd, 1.0);\n" +

// "float stc_sd = (abs(v_stcVertex.z) + 150.0) / 200.0;\n" +
// "gl_FragColor *= vec4(stc_sd, stc_sd, stc_sd, 1.0);\n" +

// "gl_FragColor *= vec4(1.2);\n" +
// "float stc_num = fract(czm_frameNumber / 5000.0);\n" +
// "float stc_v = fract(abs(v_stcVertex.z) / 500.0);\n" +
// "float stc_u = stc_num * v_stcVertex.x/50.0 * 3.14159265 * 2.0 ;" +
// "vec4 bmimg = texture2D(u_styleBmImg, vec2(stc_num * v_stcVertex.x/50.0,stc_v));\n" +
// `if(bmimg.a>0.0){
//     if(distance(bmimg.rgb,vec3(.0))<0.3){
//         return;
//     }
//     gl_FragColor = bmimg;
// }`;
