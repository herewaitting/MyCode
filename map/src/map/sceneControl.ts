import * as Cesium from "cesium";
import * as EventEmitter from "eventemitter3";
import { BrightTiles } from "../layers/analysis/brightTiles";
import { FocusArea } from "../layers/analysis/focusArea";
import { TailorEarth } from "../layers/analysis/tailorEarth";
import { TailorTiles } from "../layers/analysis/tailorTiles";
import { pos2Cgh, transformColor } from "../util/index";
import { SceneServer } from "./sceneServer";

export interface IDepthFiledOpts {
    focalDistance: number; // 深度
    delta: number; // delta
    sigma: number; // sigma
    stepSize: number; // 步长
}

// 场景泛光接口
export interface ISceneBloomOpts {
    contrast: number;
    brightness: number;
    delta: number;
    sigma: number;
    stepSize: number;
}

export interface IZoomOpt {
    near: number;
    far: number;
}

// 初始化动画
export interface IinitAnimation {
    flyTo: boolean;
    earthRotate: boolean;
}

// 底图配置
export interface IImageryProvider {
    type: string;
    providerIndex: number;
    server: string;
    minimumLevel: number;
    maximumLevel: number;
    isLimit: boolean;
    rectangle: {
        west: number,
        south: number,
        east: number,
        north: number,
    };
}

// 镜头初始化设置
export interface IviewerCfg {
    lon: number;
    lat: number;
    height: number;
    heading: number;
    pitch: number;
    duration: number;
}

// 天空盒接口
export interface ISkyBoxImg {
    positiveX: string;
    negativeX: string;
    positiveY: string;
    negativeY: string;
    positiveZ: string;
    negativeZ: string;
}
export interface ISkyBoxOpts {
    divisionHeight: number;
    near: ISkyBoxImg;
    far?: ISkyBoxImg;
}

export interface IFogCfg {
    ableFog: boolean;
    x: number;
    y: number;
    color: string;
    strength: number;
}

// hdr、景深
export class SceneControl extends EventEmitter {
    private viewer!: SceneServer;
    private depthOfField: any;
    private initRotating: boolean = false;
    private initFlying: boolean = false;
    private earthRotateFun: any;
    private mouseClickHandler: any;
    private fogPost: any;
    private mouseHandler: any;
    private listenError: any;
    private managerLayersFun: any;
    private computedLevl: any;
    private skyBoxDivisiveHeight: any;
    private nearSkyBox: any;
    private farSkyBox: any;
    private tailor: any;
    private tailorTiles: any;
    private brightTiles: any;
    private focus: any;
    private canvasScale: {
        x: number;
        y: number;
    } = {
        x: 1,
        y: 1,
    };
    constructor(viewer: SceneServer) {
        super();
        if (!viewer) {
            return;
        }
        this.viewer = viewer;
        this.setEmit();
    }
    public destroy() {
        if (this.fogPost) {
            this.viewer.scene.postProcessStages.remove(this.fogPost);
            this.fogPost = null as any;
        }
        if (this.tailor) {
            this.tailor.destroy();
        }
        this.removeEmit();
        this.depthOfField = null as any;
        this.initRotating = null as any;
        this.initFlying = null as any;
        this.earthRotateFun = null as any;
        this.mouseClickHandler = null as any;
        this.fogPost = null as any;
        this.mouseHandler = null as any;
        this.listenError = null as any;
        this.managerLayersFun = null as any;
        this.viewer.camera.changed.removeEventListener(this.computedLevl);
        this.computedLevl = null as any;
    }
    /**
     * @description: 更换单张底图服务
     * @param {string} url 图片链接
     */
    public changeSingleImagery(url: string) {
        if (!url) {
            return;
        }
        this.viewer.changeSingleImagery(url);
    }
    /**
     * @description: 重置canvas缩放比例，解决缩放拾取问题
     * @param {number} x 比例
     * @param {number} y 比例
     */
    public resizeScale(x: number, y: number) {
        this.canvasScale.x = x || 1;
        this.canvasScale.y = y || 1;
    }
    /**
     * @description: SMAA抗锯齿
     * @param {boolean} bool
     * @return {*}
     */
    public enableSMAA(bool: boolean) {
        if (Cesium.ExpandBySTC && (Cesium.ExpandBySTC as any).SMAA) {
            (Cesium.ExpandBySTC as any).SMAA.enable = bool;
        }
    }
    /**
     * @description: 开启关闭场景HDR
     */
    public setSceneHDR(val: boolean) {
        this.viewer.scene.highDynamicRange = Boolean(val);
    }
    /**
     * @description: 开启景深
     */
    public ableDepthField() {
        if (!this.depthOfField) {
            // tslint:disable-next-line: max-line-length
            this.depthOfField = this.viewer.scene.postProcessStages.add((Cesium.PostProcessStageLibrary as any).createDepthOfFieldStage());
        }
    }
    /**
     * @description: 设置场景缩放距离
     * @param {IZoomOpt} 近和远数值
     */
    public setZoomDistance(distance: IZoomOpt) {
        if (this.viewer && distance) {
            this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = distance.near || 1;
            this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = distance.far || Infinity;
        }
    }
    /**
     * @description: 关闭景深
     */
    public enableDepthField() {
        if (this.depthOfField) {
            this.viewer.scene.postProcessStages.remove(this.depthOfField);
        }
        this.depthOfField = null;
    }
    /**
     * @description: 配置景深效果
     * @param {IDepthFiledOpts} options
     * @return: void
     */
    public setDepthField(options: IDepthFiledOpts) {
        if (!options || !this.depthOfField) {
            return;
        }
        if (options.focalDistance || options.focalDistance === 0) {
            this.depthOfField.focalDistance = options.focalDistance;
        }
        if (options.delta || options.delta === 0) {
            this.depthOfField.delta = options.delta;
        }
        if (options.sigma || options.sigma === 0) {
            this.depthOfField.sigma = options.sigma;
        }
        if (options.stepSize || options.stepSize === 0) {
            this.depthOfField.stepSize = options.stepSize;
        }
    }
    /**
     * @description: 开启关闭场景全局泛光
     */
    public setSceneBloom(val: boolean) {
        (this.viewer.scene.postProcessStages as any).bloom.enabled = val;
    }
    /**
     * @description: 配置场景泛光效果
     * @param {ISceneBloomOpts} options
     * @return: void
     */
    public setSceneBloomOpts(options: ISceneBloomOpts) {
        const uniforms = (this.viewer.scene.postProcessStages as any).bloom.uniforms;
        if (options.contrast || options.contrast === 0) {
            uniforms.contrast = options.contrast;
        }
        if (options.brightness || options.brightness === 0) {
            uniforms.brightness = options.brightness;
        }
        if (options.delta || options.delta === 0) {
            uniforms.delta = options.delta;
        }
        if (options.sigma || options.sigma === 0) {
            uniforms.sigma = options.sigma;
        }
        if (options.stepSize || options.stepSize === 0) {
            uniforms.stepSize = options.stepSize;
        }
    }
    /**
     * @description: 设置入场动画
     * @return: Promise<void>
     */
    public async setAnimation(animation: IinitAnimation, cameraOpts: IviewerCfg): Promise<void> {
        if (this.initRotating || this.initFlying) {return; }
        if (animation.earthRotate) {
            this.initRotating = true;
            await this.earthRotate();
            this.initRotating = false;
        }
        this.initFlying = true;
        await this.setCamera(animation, cameraOpts);
        const removeLayerFun = () => {
            const layers = (this.viewer as any).imageryLayers._layers as any[];
            if (layers[0].alpha <= 0) {
                this.viewer.clock.onTick.removeEventListener(removeLayerFun);
                this.viewer.imageryLayers.removeAll();
            } else {
                layers.forEach((layer) => {
                    layer.alpha -= 0.01;
                });
            }
        };
        this.initFlying = false;
    }
    /**
     * @description: 地球自转
     */
    public earthRotate() {
        const viewer = this.viewer;
        let previousTime = new Date().getTime();

        // return new Promise((resolve) => {
        this.earthRotateFun = () => {
            const spinRate = 1;
            const currentTime = new Date().getTime();
            const delta = (currentTime - previousTime) / 1000;
            previousTime = currentTime;
            // if (this.clickForStart) {
            //     // console.log(currentTime);
            //     viewer.clock.onTick.removeEventListener(this.earthRotateFun);
            //     resolve();
            // }

            viewer.scene.camera.rotate(
                Cesium.Cartesian3.UNIT_Z,
                -spinRate * delta,
            );
        };
        viewer.clock.onTick.addEventListener(this.earthRotateFun);
    }
    /**
     * @description: 定位相机
     */
    public setCamera(animation: IinitAnimation, cameraOpts: IviewerCfg) {
        const targetPos = Cesium.Cartesian3.fromDegrees(
            cameraOpts.lon,
            cameraOpts.lat,
            cameraOpts.height,
        );
        const headingNum = Cesium.Math.toRadians(cameraOpts.heading) + 0.00000000000001;
        const pitchNum = Cesium.Math.toRadians(cameraOpts.pitch) + 0.00000000000001;
        if (!targetPos || !headingNum || !pitchNum) {return; }
        return new Promise((resolve, reject) => {
            const settings = {
                destination: targetPos,
                duration: cameraOpts.duration || 2,
                orientation: {
                    heading: headingNum,
                    pitch: pitchNum,
                    roll: 0,
                },
            };
            if (!animation.flyTo) {
                this.viewer.scene.camera.setView(settings);
                resolve();
            } else {
                (settings as any).complete = () => {
                    return resolve();
                };
                this.viewer.scene.camera.flyTo(settings);
            }
        });
    }
    /**
     * @description: 取消拾取坐标
     */
    public enableClickPos() {
        if (this.mouseClickHandler) {
            this.mouseClickHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.mouseClickHandler.destroy();
        }
    }
    /**
     * @description: 停止地球自转
     */
    public disableEarthRotate() {
        this.viewer.clock.onTick.removeEventListener(this.earthRotateFun);
    }
    /**
     * @description: 配置场景底图
     * @param {IImageryProvider} providerArr
     * @return: void
     */
    public setImageryProvider(providerArr: IImageryProvider[]) {
        if (!providerArr || !providerArr.length) { return; }
        const providerMap: {[key: string]: any} = {
            TMS: {
                providerConstructor: Cesium.TileMapServiceImageryProvider,
                url(provider: IImageryProvider) {
                    return provider.server;
                },
            },
            UrlTemplate: {
                providerConstructor: Cesium.UrlTemplateImageryProvider,
                url(provider: IImageryProvider) {
                    return provider.server;
                },
            },
        };
        providerArr.sort((a, b) => a.providerIndex - b.providerIndex);
        const imgLen = this.viewer.imageryLayers.length;
        for (let i = imgLen - 1; i >= 0; i--) {
            if (!(this.viewer.imageryLayers.get(i) as any).kvBase) {
                this.viewer.imageryLayers.remove(this.viewer.imageryLayers.get(i));
            }
        }
        for (const provider of providerArr) {
            if (!provider || !provider.server || !provider.type) { continue; }
            let imgProvider: any = null;
            let rect;
            if (provider.isLimit &&
                provider.rectangle.east
                && provider.rectangle.north
                && provider.rectangle.south
                && provider.rectangle.west
            ) {
                rect = Cesium.Rectangle.fromDegrees(
                    Number(provider.rectangle.west),
                    Number(provider.rectangle.south),
                    Number(provider.rectangle.east),
                    Number(provider.rectangle.north),
                );
            }
            const cfg = {
                url: providerMap[provider.type].url(provider),
                maximumLevel: provider.maximumLevel,
                minimumLevel: provider.minimumLevel || 0,
                hasAlphaChannel: false,
            };
            if (rect) {
                (cfg as any).rectangle = rect;
            }
            imgProvider = new providerMap[provider.type].providerConstructor(cfg);
            // tslint:disable-next-line: no-unused-expression
            imgProvider && this.viewer.imageryLayers.addImageryProvider(imgProvider);
        }
    }
    /**
     * @description: 设置小场景天空盒
     * @param {ISkyBoxImg} 天空盒6张图片
     */
    public initSingleSkyBox(skybox: ISkyBoxImg) {
        if (this.viewer.scene.skyBox) {
            this.viewer.scene.skyBox.destroy();
            this.viewer.scene.skyBox = new Cesium.SkyBox({
                sources : skybox,
            });
            (this.viewer.scene.skyBox as any).nearGround = true;
        }
    }
    /**
     * @description: 控制太阳图片显示隐藏
     * @param {boolean} bool 真假值
     */
    public showSun(bool: boolean) {
        if (this.viewer.scene && this.viewer.scene.sun) {
            this.viewer.scene.sun.show = bool;
        }
    }
    /**
     * @description: 控制月亮图片显示隐藏
     * @param {boolean} bool 真假值
     */
    public showMoon(bool: boolean) {
        if (this.viewer.scene && this.viewer.scene.moon) {
            this.viewer.scene.moon.show = bool;
        }
    }
    /**
     * @description: 控制大气层显示隐藏
     * @param {boolean} bool 真假值
     */
    public showAtomsquere(bool: boolean) {
        if (this.viewer.scene && this.viewer.scene.skyAtmosphere) {
            this.viewer.scene.skyAtmosphere.show = bool;
        }
    }
    /**
     * @description: 控制地球显示隐藏
     * @param {boolean} bool 真假值
     */
    public showGlobe(bool: boolean) {
        if (this.viewer.scene && this.viewer.scene.globe) {
            this.viewer.scene.globe.show = bool;
        }
    }
    /**
     * @description: 控制天空盒显示隐藏
     * @param {boolean} bool 真假值
     */
    public showSkyBox(bool: boolean) {
        if (this.viewer.scene && this.viewer.scene.skyBox) {
            this.viewer.scene.skyBox.show = bool;
        }
    }
    /**
     * @description: 添加雾化边缘后处理
     * @param {IFogCfg} 雾化参数
     */
    public setFogPost(option: IFogCfg) {
        if (option && option.ableFog && (option.x || option.y)) {
            if (this.fogPost) {
                if (option.x || option.y) {
                    this.fogPost.uniforms.u_fogNum = new Cesium.Cartesian2(option.x, option.y);
                }
                if (option.color) {
                    this.fogPost.uniforms.u_fogColor = transformColor(option.color) || this.fogPost.uniforms.u_fogColor;
                }
                if (Cesium.defined(option.strength)) {
                    this.fogPost.uniforms.u_strength = option.strength / 100 || this.fogPost.uniforms.u_strength;
                }
                return;
            }
            const fragmentShaderSource =
            `uniform sampler2D colorTexture;
            uniform sampler2D depthTexture;
            uniform vec4 u_fogColor;
            uniform float u_strength;
            uniform vec2 u_fogNum;
            varying vec2 v_textureCoordinates;
            void main(void)
            {
                vec2 st = v_textureCoordinates;
                vec4 oldColor = texture2D(colorTexture, v_textureCoordinates);
                vec4 currD = texture2D(depthTexture, v_textureCoordinates);
                if (st.s > u_fogNum.s && st.s < 1.0 - u_fogNum.s && st.t > u_fogNum.t && st.t < 1.0 - u_fogNum.t) {
                    gl_FragColor = oldColor;
                } else {
                    float minx = .0;
                    float miny = .0;
                    if(st.s<u_fogNum.s){minx = (u_fogNum.s - st.s) / u_fogNum.s;}else if (st.s > 1.0 - u_fogNum.s){minx = (st.s - (1.0 - u_fogNum.s)) / u_fogNum.s;}
                    if(st.t<u_fogNum.t){miny = (u_fogNum.t - st.t) / u_fogNum.t;}else if (st.t > 1.0 - u_fogNum.t){miny = (st.t - (1.0 - u_fogNum.t)) / u_fogNum.t;}
                    float fogStrength = (minx + miny) * distance(st, vec2(0.5));
                    gl_FragColor = vec4(mix(oldColor.rgb, u_fogColor.rgb, fogStrength), oldColor.a);
                }
            }`;
            const minX = Math.min(option.x / 100 || 0, 0.3);
            const minY = Math.min(option.y / 100 || 0, 0.3);
            this.fogPost = this.viewer.scene.postProcessStages.add(
            new Cesium.PostProcessStage({
                fragmentShader: fragmentShaderSource,
                uniforms: {
                    u_fogNum: () => {
                        return new Cesium.Cartesian2(minX, minY);
                    },
                    u_fogColor: () => {
                        return transformColor(option.color) || new Cesium.Color(0.3, 0.3, 0.3, 0.3);
                    },
                    u_strength: () => {
                        return option.strength / 100 || 0.5;
                    },
                },
            }));
        } else {
            this.viewer.scene.postProcessStages.remove(this.fogPost);
            this.fogPost = null;
        }
    }
    /**
     * @description: 设置地球基底色
     * @param {string} color 颜色字符串
     * @return: void
     */
    public setBaseColor(color: string) {
        const czmcolor = transformColor(color);
        if (!czmcolor) {
            return;
        }
        this.viewer.scene.globe.baseColor = czmcolor as any;
    }
    /**
     * @description: 限制相机进入地下，新版本已经遗弃
     */
    public limitCameraToGround() {
        const limitFun = () => {
            if (this.viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
                (this.viewer.camera as any)._suspendTerrainAdjustment = false;
                (this.viewer.camera as any)._adjustOrthographicFrustum(!0);
            }
        };
        this.viewer.camera.changed.addEventListener(limitFun);
    }
    /**
     * @description: 内部使用，用来拾取坐标存到文档
     * @param {cb} 用来处理拾取的点函数
     */
    public ableClickPos(cb: (p: any) => void) {
        if (!this.mouseClickHandler) {
            this.mouseClickHandler = new Cesium.ScreenSpaceEventHandler(
                this.viewer.scene.canvas as any,
            );
            this.mouseClickHandler.setInputAction((
                movement: any,
            ) => {
                const newPos = {
                    x: movement.position.x / this.canvasScale.x,
                    y: movement.position.y / this.canvasScale.y,
                };
                const worldpos = pos2Cgh(newPos as any, this.viewer.scene, true);
                if (!worldpos) {
                    return;
                }
                console.log(JSON.stringify(worldpos));
                // tslint:disable-next-line: no-unused-expression
                cb && cb(worldpos);
            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }
    /**
     * @description: 重点区域高亮
     * @param {*}
     * @return {*}
     */
    public focusArea(option: any) {
        if (!option || !option.area) {
            return;
        }
        const url = option.area;
        if (this.focus) {
            this.focus.destroy();
            this.focus = null;
        }
        const clipObj = new FocusArea(this.viewer, "FocusArea", {} as any);
        clipObj.setData(url);
        this.focus = clipObj;
    }

    /**
     * @description: 取消重点区域高亮
     */
    public disFocusArea() {
        if (this.focus) {
            this.focus.destroy();
        }
        this.focus = null;
    }
    /**
     * @description: 初始化内置天空盒
     */
    public setSkyBox(urlObj: ISkyBoxOpts) {
        if (!urlObj) {
            return;
        }

        if (urlObj.divisionHeight && urlObj.divisionHeight >= 200000) {
            this.skyBoxDivisiveHeight = urlObj.divisionHeight;
        }

        if (urlObj.near) {
            if (this.nearSkyBox) {
                this.nearSkyBox.destroy();
            }
            this.nearSkyBox = new Cesium.SkyBox({
                sources : urlObj.near,
            });
        }

        if (urlObj.far) {
            if (this.farSkyBox) {
                this.farSkyBox.destroy();
            }
            this.farSkyBox = new Cesium.SkyBox({
                sources : urlObj.far,
            });
        } else {
            this.farSkyBox = this.viewer.scene.skyBox;
        }
        this.viewer.clock.onTick.removeEventListener(this.skyBoxEvent);
        this.viewer.clock.onTick.addEventListener(this.skyBoxEvent.bind(this));
    }
    /**
     * @description: 批量获取高程数据
     * @param {ILonLatHeight[]} positions  经纬度点
     * @return {Cesium.Cartographic[]}
     */
    public async getBatchHeight(datas: any[], transFun?: (data: any) => {
        longitude: number;
        latitude: number;
        [k: string]: any;
    }) {
        const newDatas = [...datas];
        if (!newDatas) {
            return [];
        }
        for (let data of newDatas) {
            if (transFun) {
                data = transFun(data);
            }
            const radianPos = Cesium.Cartographic.fromDegrees(data.longitude, data.latitude, 0);
            const newPos = await Cesium.sampleTerrainMostDetailed(this.viewer.scene.terrainProvider, [radianPos]);
            data.height = newPos[0].height;
        }
        return newDatas;
    }
    // public async getBatchHeight(positions: any[], transFun?: (pot: any) => ILonLatHeight) {
    //     let resArr: Cesium.Cartographic[] = [];
    //     if (!positions) {
    //         return resArr;
    //     }

    //     const radianPos: Cesium.Cartographic[] = [];
    //     positions.forEach((pos) => {
    //         if (transFun) {
    //             pos = transFun(pos);
    //         }
    //         radianPos.push(Cesium.Cartographic.fromDegrees(pos.longitude, pos.latitude));
    //     });
    //     const promise = Cesium.sampleTerrainMostDetailed(this.viewer.scene.terrainProvider, radianPos);
    //     await promise.then((updatedPositions) => {
    //         resArr = updatedPositions;
    //     });
    //     return resArr;
    // }
    /**
     * @description: 开启地形挖掘
     * @param {option} area 区域边界数据
     */
    public terrainClip(option: any) {
        if (!option || !option.area) {
            return;
        }
        if (this.tailor) {
            this.tailor.destroy();
            this.tailor = null;
        }
        const url = option.area;
        const clipObj = new TailorEarth(this.viewer, "TerrainClip", {
            style: {
                canvasWidth: option.precision || 2048,
            }
        } as any);
        clipObj.setData(url);
        this.tailor = clipObj;
    }
    /**
     * @description: 销毁地形挖掘
     */
    public destroyClip() {
        if (this.tailor) {
            this.tailor.destroy();
        }
    }
    /**
     * @description: 开启模型裁剪
     * @param {option} area 区域边界数据
     */
    public tiles3DClip(option: any) {
        if (!option || !option.area) {
            return;
        }
        if (this.tailorTiles) {
            this.tailorTiles.destroy();
            this.tailorTiles = null;
        }
        const url = option.area;
        const clipObj = new TailorTiles(this.viewer, "TailorTiles", {} as any);
        clipObj.setData(url);
        this.tailorTiles = clipObj;
    }
    /**
     * @description: 销毁地形挖掘
     */
    public destroyTiles3DClip() {
        if (this.tailorTiles) {
            this.tailorTiles.destroy();
            this.tailorTiles = null;
        }
    }
    /**
     * @description: 开启模型裁剪
     * @param {option} area 区域边界数据
     */
    public bright3dTiles(option: any) {
        if (!option || !option.area) {
            return;
        }
        if (this.brightTiles) {
            this.brightTiles.destroy();
            this.brightTiles = null;
        }
        const url = option.area;
        const clipObj = new BrightTiles(this.viewer, "BrightTiles", {} as any);
        clipObj.setData(url);
        this.brightTiles = clipObj;
    }
    /**
     * @description: 销毁地形挖掘
     */
    public destroyBright3dTiles() {
        if (this.brightTiles) {
            this.brightTiles.destroy();
            this.brightTiles = null;
        }
    }
    /**
     * @description: 绑定点击和鼠标移动事件，供监听使用
     */
    private setEmit() {
        this.listenRenderErr();
        this.addClickEvent();
        // this.addMouseMoveEvent();
        this.emitPreUpdate();
    }
    /**
     * @description: 移除emit事件
     */
    private removeEmit() {
        this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.mouseHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.viewer.scene.renderError.removeEventListener(this.listenError);
        (this.viewer.scene as any)._preUpdate.removeEventListener(this.managerLayersFun);
    }
    /**
     * @description: 绑定点击事件
     */
    private addClickEvent() {
        if (!this.mouseHandler) {
            this.mouseHandler = new Cesium.ScreenSpaceEventHandler(
                this.viewer.scene.canvas as any,
            );
        }
        const that = this;
        this.mouseHandler.setInputAction(function onMouseMove(
            movement: any,
        ) {
            const newPos = {
                x: movement.position.x / that.canvasScale.x,
                y: movement.position.y / that.canvasScale.y,
            } as any;
            const pickedFeature = that.viewer.scene.pick(newPos);
            that.emit("sceneClick", [pickedFeature]);
            // const pickedFeature = that.viewer.scene.drillPick(newPos);
            // that.emit("sceneClick", pickedFeature);
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    // /**
    //  * @description: 添加鼠标移动监听事件
    //  */
    // private addMouseMoveEvent() {
    //     if (!this.mouseHandler) {
    //         this.mouseHandler = new Cesium.ScreenSpaceEventHandler(
    //             this.viewer.scene.canvas as any,
    //         );
    //     }
    //     const that = this;
    //     this.mouseHandler.setInputAction(function onMouseMove(
    //         movement: any,
    //     ) {
    //         const newPos = {
    //             x: movement.endPosition.x / that.canvasScale.x,
    //             y: movement.endPosition.y / that.canvasScale.y,
    //         } as any;
    //         const pickedFeature = that.viewer.scene.drillPick(newPos);
    //         that.emit("sceneMousemove", pickedFeature);
    //     },
    //     Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // }
    /**
     * @description: 每帧渲染前
     */
    private emitPreUpdate() {
        this.managerLayersFun = () => {
            this.emit("preUpdate", {});
        };
        (this.viewer.scene as any)._preUpdate.addEventListener(this.managerLayersFun);
    }
    // 监听场景报错
    private listenRenderErr() {
        this.listenError = (e: any) => {this.emit("renderError", e); };
        this.viewer.scene.renderError.addEventListener(this.listenError);
    }
    /**
     * @description: 近地天空盒与远地天空盒切换
     */
    private skyBoxEvent() {
        const height = Cesium.Cartographic.fromCartesian(this.viewer.scene.camera.position).height;
        if (height <= this.skyBoxDivisiveHeight && this.nearSkyBox) {
            this.viewer.scene.skyBox = this.nearSkyBox;
            (this.viewer.scene.skyBox as any).nearGround = true;
        } else if (height > this.skyBoxDivisiveHeight && this.farSkyBox) {
            this.viewer.scene.skyBox = this.farSkyBox;
            (this.viewer.scene.skyBox as any).nearGround = false;
        }
    }
}
