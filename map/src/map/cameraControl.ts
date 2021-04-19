import * as Cesium from "cesium";
import { ILonLatHeight } from "../interface";
import { IRealTimePath, ITrackedObj } from "../layers/point/point";
import { adjustCameraNoRoll, adjustCartesina3Height, computedCameraByTarget, setCartesian3Height } from "../util/";
import { computedFirstViewOpts, computedGodViewOpts, getNextPointOnCircle, IGetNextPointOnCircleOpts } from "../util/viewAngleControl";

const enum EZOOMSTATUS {
    NEAR = "near",
    MID = "mid",
    FAR = "far",
}

const enum EROTATETARGET {
    SELF = "self", // 自转
    ELSE = "else", // 绕点飞行
}

export enum EVIEWFLLOWTYPES {
    GOD = "god", // 上帝视角
    FIRST = "first", // 第一视角
}

export interface ILocatePointCollection {
    heading: number;
    pitch: number;
    range: number; // 距离
    duration: number; // 动画时长
}

// 镜头定位接口
export interface IviewerCfg {
    lon: number;
    lat: number;
    height: number;
    heading: number;
    pitch: number;
    duration: number;
}

// 路径漫游接口
export interface IRoamOption {
    speed: number;
    height: number;
}

// 围绕点旋转
export interface IRotatePointOpts {
    type: string;
    lon: number;
    lat: number;
    height: number;
    distance: number;
    pitch: number;
    speed: number;
    time: number;
    // param: {
    //     point: IlonLatHeight;
    //     height: number;
    //     distance: number;
    // };
}

export interface ILocatedOpt {
    center: Cesium.Cartesian3;
    points: Cesium.Cartesian3[];
    pitch: number;
    duration: number;
    winRatio: number; // 宽高比，宽比上高
    nearFar: number; // 定位远近调整参数，默认2.5，值越大越近，越小越远
    callback: ()=>{};
}

export interface IGKFirstViewOpt {
    lon: number;
    lat: number;
    height: number;
    duration: number; // 定位飞行时长，单位/秒
    fov: number; // 水平张角
    aspectRatio: number; // 宽高比
    heading: number;
    pitch: number;
    roll: number;
    callback: ()=>{};
}

// const enum EUPDATETYPES {
//     BEAUTIFYFILTER = "beautifyFilter",
//     CAMERA = "angleOfViewCfg",
//     IMAGERYPROVIDER = "imageryProvider",
//     ANIMATION = "animation",
// }
export class CameraControl {
    public viewer: Cesium.Viewer;
    public rotateSelfFun: any;
    public rotateElseFun: any;
    public romaHandler: any;
    public flags = {
        looking : false,
        moveForward : false,
        moveBackward : false,
        moveUp : false,
        moveDown : false,
        moveLeft : false,
        moveRight : false,
    };
    public keyDownFun: any;
    public keyUpFun: any;
    public keyboardRoamFun: any;
    public roamEventFun: any;
    public pathNodes: any;
    public roamSpeed!: number;
    public limitCameraFun: any;
    public sceneCenter!: Cesium.Cartesian3;
    public sceneRdius!: number;
    public maxLimitDis: number = 5000;
    constructor(viewer: Cesium.Viewer) {
        this.viewer = viewer;
    }
    public destroy() {
        this.disableKeyboardRoam();
        this.stopRotatePoint();
        this.viewer.clock.onTick.removeEventListener(this.rotateElseFun);
        this.viewer.clock.onTick.removeEventListener(this.rotateSelfFun);
        (this.rotateSelfFun as any) = null;
        (this.rotateElseFun as any) = null;
        (this.romaHandler as any) = null;
        (this.keyUpFun as any) = null;
        (this.keyDownFun as any) = null;
        (this.keyboardRoamFun as any) = null;
        (this.flags as any) = null;
        (this.viewer as any) = null;
    }
    /**
     * @description: 只能点群定位
     * @param {ILocatedOpt} option
     * @return {*}
     */
    public intellectLocated(option: ILocatedOpt) {
        if (!option || !option.center || !option.points || !option.points.length || option.points.length < 3) {
            console.warn("智能定位数据有误！");
            return;
        }
        const transMat = Cesium.Transforms.eastNorthUpToFixedFrame(option.center);
        const ntransMat = Cesium.Matrix4.inverse(transMat, new Cesium.Matrix4());
        if (!transMat) {
            console.warn("智能定位数据中心点有误！");
            return;
        }
        const localPos: Cesium.Cartesian3[] = [];
        option.points.forEach((pot) => {
            const lpos = Cesium.Matrix4.multiplyByPoint(ntransMat, pot, new Cesium.Cartesian3());
            if (lpos) {
                localPos.push(lpos);
            }
        });
        const info = this.computedBoundInfo(localPos, option.winRatio, option.nearFar || 2.5) as any;
        if (!info || !info.radius) {
            return;
        }
        const newCenter = Cesium.Matrix4.multiplyByPoint(transMat, new Cesium.Cartesian3(info.center.x, info.center.y, 0), new Cesium.Cartesian3());
        const dis = this.distanceToBoundingSphere3D(info.radius);
        const heading = Cesium.Math.toRadians(info.deg || 0);
        // const pitch = Cesium.Math.toRadians(option.pitch || -45);
        const pitch = Cesium.Math.toRadians(-45);
        // const hpr = new Cesium.HeadingPitchRange(heading, pitch, dis);
        const bd = Cesium.BoundingSphere.fromPoints(option.points);
        bd.center = newCenter;
        const dir = new Cesium.Cartesian3(Math.sin(heading), Math.cos(heading), Math.sin(pitch));
        Cesium.Cartesian3.normalize(dir, dir);
        Cesium.Matrix4.multiplyByPointAsVector(transMat, dir, dir);
        const up = Cesium.Cartesian3.normalize(newCenter, new Cesium.Cartesian3());
        const right = Cesium.Cartesian3.cross(dir, up, new Cesium.Cartesian3());
        Cesium.Cartesian3.cross(right, dir, up);
        const ray = new Cesium.Ray(newCenter, dir);
        const cameraPos = Cesium.Ray.getPoint(ray, -dis);
        this.viewer.camera.flyTo({
            destination: cameraPos,
            duration: option.duration,
            orientation : {
                direction: dir,
                up,
            },
            complete: option.callback,
            easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        });
        // this.viewer.camera.flyToBoundingSphere(bd, {
        //     duration: option.duration,
        //     offset: hpr,
        //     complete: option.callback,
        //     easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        // });
    }
    /**
     * @description: 定位高空监控第一视角
     * @param {IGKFirstViewOpt} option
     * @return {*}
     */
    public locateGKFirstView(option: IGKFirstViewOpt) {
        if (!option || !option.lon || !option.lat || !option.height) {
            console.warn("高空监控点位信息不完整！");
            return;
        }
        const gkOpt = {...{
            heading: 0,
            pitch: 0,
            roll: 0,
            duration: 2,
        }, ...option};
        const cpos = Cesium.Cartesian3.fromDegrees(gkOpt.lon, gkOpt.lat, gkOpt.height);
        const hd = Cesium.Math.toRadians(gkOpt.heading);
        const ph = Cesium.Math.toRadians(gkOpt.pitch);
        const rl = Cesium.Math.toRadians(gkOpt.roll);
        const hpr = new Cesium.HeadingPitchRoll(hd, ph, rl);
        const targetFov = Cesium.Math.toRadians(gkOpt.fov);
        const targetRatio = gkOpt.aspectRatio;
        const initFov = (this.viewer.camera.frustum as any).fov;
        const initRatio = (this.viewer.camera.frustum as any).aspectRatio;
        const steps = 25 * gkOpt.duration;
        const stepFov = (targetFov - initFov) / steps;
        const stepRatio = (targetRatio - initRatio) / steps;
        const syncCamera = () => {
            const currFov = (this.viewer.camera.frustum as any).fov;
            const currRatio = (this.viewer.camera.frustum as any).aspectRatio;
            if (Math.abs(targetFov - currFov) > Math.abs(stepFov)) {
                (this.viewer.camera.frustum as any).fov += stepFov;
            }
            if (Math.abs(targetRatio - currRatio) > Math.abs(stepRatio)) {
                (this.viewer.camera.frustum as any).aspectRatio += stepRatio;
            }
        }
        this.viewer.clock.onTick.addEventListener(syncCamera);
        this.viewer.camera.flyTo({
            destination: cpos,
            duration: gkOpt.duration || 2,
            orientation: hpr,
            complete: () => {
                this.viewer.clock.onTick.removeEventListener(syncCamera);
                gkOpt.callback && gkOpt.callback();
            },
        });
    }
    /**
     * @description: 设置允许相机远离场景中心最大距离，建议此最大距离比重点区域包围球半径大一些，留有相机移动缓冲区
     * @param {number} distance 距离
     */
    public setMaxLimitDis(distance: number) {
        this.maxLimitDis = Math.min(distance || this.maxLimitDis, 5000);
    }
    /**
     * @description: 相机视野缩放因子,值越小相机张角越小，反之越大
     * @param {number} fovNum 缩放因子
     */
    public setCameraFov(fovNum: number) {
        if (fovNum) {
            (this.viewer.camera.frustum as any).fov = Cesium.Math.toRadians(fovNum);
        }
    }
    /**
     * @description: 设置场景重点区域包围球，当相机距离大于最大允许距离，相机自动飞回重点区域包围球面上
     * @param {ILonLatHeight} point 场景中心点
     * @param {number} radius 场景半径
     */
    public setSceneBoundingSphere(point: ILonLatHeight, radius: number) {
        if (!point) { return; }
        this.sceneCenter = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.height || 0.5);
        this.sceneRdius = radius || this.sceneRdius || 1000;
    }
    /**
     * @description: 开启相机限制区域
     */
    public setLimitEvent() {
        if (!this.limitCameraFun) {
            const camera = this.viewer.camera;
            this.limitCameraFun = () => {
                const cameraPos = camera.position;
                const cameraDir = camera.direction;
                Cesium.Cartesian3.normalize(cameraDir, cameraDir);
                let visibleDis = 0;
                const disCenter = Cesium.Cartesian3.distance(cameraPos, this.sceneCenter);
                if (disCenter > this.maxLimitDis) {
                    visibleDis = this.maxLimitDis;
                } else {
                    const cameraRay = new Cesium.Ray(cameraPos, cameraDir);
                    const sphere = new Cesium.BoundingSphere(this.sceneCenter, this.sceneRdius);
                    const rayRes = Cesium.IntersectionTests.raySphere(cameraRay, sphere);
                    if (!rayRes) {
                        visibleDis = disCenter;
                    }
                }
                if (visibleDis) {
                    // tslint:disable-next-line: max-line-length
                    const dirCamera = Cesium.Cartesian3.subtract(cameraPos, this.sceneCenter, new Cesium.Cartesian3());
                    Cesium.Cartesian3.normalize(dirCamera, dirCamera);
                    const rayCamera = new Cesium.Ray(this.sceneCenter, dirCamera);
                    const visiblePos = Cesium.Ray.getPoint(rayCamera, visibleDis);
                    const newCamera = computedCameraByTarget(visiblePos as any, this.sceneCenter as any);
                    this.viewer.scene.camera.flyTo({
                        destination : visiblePos,
                        orientation : {
                            direction : newCamera.direction as any,
                            up : newCamera.up as any,
                        },
                    });
                }
            };
        }
        this.viewer.scene.camera.moveEnd.addEventListener(this.limitCameraFun);
    }
    // 退出漫游
    public quitRoamOnLine() {
        this.viewer.clock.onTick.removeEventListener(this.roamEventFun);
    }
    /**
     * @description: 镜头切换动画
     * @param {ILonLatHeight} point 目标点
     * @param {string} type 离目标点远近类型
     * @return: Promise
     */
    public zoomTargetPot(point: ILonLatHeight, type: string): Promise<void> {
        if (!point || !point.lon || !point.lat) {
            return Promise.resolve();
        }
        return new Promise( async (resolve) => {
            const statusArr = this.computedZoomStatus(point, type);
            const statusNum = 0;
            await this.flytoCallBack(statusArr, statusNum);
            resolve();
        });
    }
    /**
     * @description: 绕点飞行
     * @param {option} IRotatePointOpts 绕点飞行类型及对应的点
     */
    public async rotatePoint(option: IRotatePointOpts): Promise<void> {
        if (!option || !option.type || !option.lon || !option.lat) { return; }
        this.disableKeyboardRoam();
        this.viewer.clock.onTick.removeEventListener(this.rotateElseFun);
        this.viewer.clock.onTick.removeEventListener(this.rotateSelfFun);
        this.rotateSelfFun = null;
        this.rotateElseFun = null;
        this.addRotateSelfFun(option);
        await this.lookAtPoint(option);
        switch (option.type) {
            case EROTATETARGET.SELF:
                // totalRotate = 0;
                this.viewer.clock.onTick.addEventListener(this.rotateSelfFun);
                break;
            case EROTATETARGET.ELSE:
                this.viewer.clock.onTick.addEventListener(this.rotateElseFun);
                break;
        }
        return Promise.resolve();
    }
    /**
     * @description: 取消键盘漫游后恢复场景默认操作
     */
    public setDefaultController(bool: boolean) {
        this.viewer.scene.screenSpaceCameraController.enableRotate = bool;
        this.viewer.scene.screenSpaceCameraController.enableTranslate = bool;
        this.viewer.scene.screenSpaceCameraController.enableZoom = bool;
        this.viewer.scene.screenSpaceCameraController.enableTilt = bool;
        this.viewer.scene.screenSpaceCameraController.enableLook = bool;
    }
    /**
     * @description: 关闭键盘漫游
     */
    public disableKeyboardRoam() {
        this.viewer.clock.onTick.removeEventListener(this.rotateElseFun);
        this.viewer.clock.onTick.removeEventListener(this.rotateSelfFun);
        document.removeEventListener("keydown", this.keyDownFun , false);
        document.removeEventListener("keyup", this.keyUpFun , false);
        if (this.romaHandler) {
            this.romaHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
            this.romaHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
            this.romaHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
            this.romaHandler.destroy();
            (this.romaHandler as any) = null;
        }
        this.viewer.clock.onTick.removeEventListener(this.keyboardRoamFun);
        this.setDefaultController(true);
    }
    /**
     * @description: 停止绕点飞行或者镜头自转
     */
    public stopRotatePoint() {
        this.viewer.clock.onTick.removeEventListener(this.rotateElseFun);
        this.viewer.clock.onTick.removeEventListener(this.rotateSelfFun);
    }
    /**
     * @description: 开启键盘漫游
     */
    public enableKeyboardRoam() {
        this.stopRotatePoint();
        const flags = this.flags;
        const scene = this.viewer.scene;
        const canvas = this.viewer.canvas;
        const ellipsoid = scene.globe.ellipsoid;

        canvas.setAttribute("tabindex", "0"); // needed to put focus on the canvas
        canvas.onclick = () => {
            canvas.focus();
        };

        this.setDefaultController(false);
        let startMousePosition: Cesium.Cartesian2 = new Cesium.Cartesian2();
        let mousePosition: Cesium.Cartesian2 = new Cesium.Cartesian2();

        this.romaHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

        this.romaHandler.setInputAction((movement: any) => {
            flags.looking = true;
            startMousePosition = Cesium.Cartesian2.clone(movement.position);
            mousePosition = Cesium.Cartesian2.clone(movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this.romaHandler.setInputAction((movement: any) => {
            mousePosition = movement.endPosition;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.romaHandler.setInputAction(() => {
            flags.looking = false;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        this.addDomEvent(flags);
        if (!this.keyboardRoamFun) {
            this.keyboardRoamFun = () => {
                const camera = this.viewer.camera;

                if (flags.looking) {
                    const width = canvas.clientWidth;
                    const height = canvas.clientHeight;

                    // Coordinate (0.0, 0.0) will be where the mouse was clicked.
                    const x = (mousePosition.x - startMousePosition.x) / width;
                    const y = -(mousePosition.y - startMousePosition.y) / height;
                    const lookFactor = 0.05;
                    camera.lookRight(x * lookFactor);
                    camera.lookUp(y * lookFactor);
                }

                // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
                const cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
                const moveRate = cameraHeight / 100.0;

                if (flags.moveForward) {
                    camera.moveForward(moveRate);
                }
                if (flags.moveBackward) {
                    camera.moveBackward(moveRate);
                }
                if (flags.moveUp) {
                    camera.moveUp(moveRate);
                }
                if (flags.moveDown) {
                    camera.moveDown(moveRate);
                }
                if (flags.moveLeft) {
                    camera.moveLeft(moveRate);
                }
                if (flags.moveRight) {
                    camera.moveRight(moveRate);
                }
            };
        }

        this.viewer.clock.onTick.addEventListener(this.keyboardRoamFun);
    }
    /**
     * @description: 镜头路径漫游
     * @param {ILonLatHeight[]} line 漫游路径
     * @param {IRoamOption} option 漫游参数
     * @return: Promise
     */
    public async roamOnLine(line: ILonLatHeight[], option: IRoamOption) {
        if (!line || line.length < 2) {
            return;
        }
        if (this.roamEventFun) {
            this.viewer.clock.onTick.removeEventListener(this.roamEventFun);
            this.roamEventFun = null;
        }
        this.pathNodes = this.fillRoamPath(line, option);
        let currNum = 0;
        // tslint:disable-next-line: one-variable-per-declaration
        let oldDir: Cesium.Cartesian3, oldUp: Cesium.Cartesian3, oldRight: Cesium.Cartesian3;
        this.roamSpeed = option.speed;
        this.roamEventFun = () => {
            if (this.pathNodes[currNum]) {
                if (this.pathNodes[currNum + 60]) {
                    const status = adjustCameraNoRoll(this.pathNodes[currNum + 60], this.pathNodes[currNum]);
                    if (status) {
                        oldDir = status.direction as any;
                        oldUp = status.up as any;
                        oldRight = status.right as any;
                    }
                }
                this.viewer.camera.position = this.pathNodes[currNum];
                if (oldUp) {
                    this.viewer.camera.direction = oldDir;
                    this.viewer.camera.right = oldRight;
                    this.viewer.camera.up = oldUp;
                }
            } else {
                this.viewer.clock.onTick.removeEventListener(this.roamEventFun);
                this.roamSpeed = 1;
            }
            currNum = currNum + Math.max(Math.floor(this.roamSpeed), 1);
        };
        await this.boforeRoamFly();
        this.viewer.clock.onTick.addEventListener(this.roamEventFun);
    }
    /**
     * @description: 添加键盘监听事件
     * @param {flags} 移动方向对象
     */
    public addDomEvent(flags: any) {
        function getFlagForKeyCode(keyCode: number) {
            switch (keyCode) {
            case "W".charCodeAt(0):
                return "moveForward";
            case "S".charCodeAt(0):
                return "moveBackward";
            case "Q".charCodeAt(0):
                return "moveUp";
            case "E".charCodeAt(0):
                return "moveDown";
            case "D".charCodeAt(0):
                return "moveRight";
            case "A".charCodeAt(0):
                return "moveLeft";
            default:
                return undefined;
            }
        }
        this.keyDownFun = (e: any) => {
            const flagName = getFlagForKeyCode(e.keyCode);
            if (typeof flagName !== "undefined") {
                flags[flagName] = true;
            }
        };
        this.keyDownFun = document.addEventListener("keydown", this.keyDownFun , false);

        this.keyUpFun = (e: any) => {
            const flagName = getFlagForKeyCode(e.keyCode);
            if (typeof flagName !== "undefined") {
                flags[flagName] = false;
            }
        };
        this.keyUpFun = document.addEventListener("keyup", this.keyUpFun, false);
    }
    /**
     * @description: 控制场景是否允许手动操作
     * @param {boolean} able 真假
     * @return: void
     */
    public controlCamera(able: boolean) {
        const scene = this.viewer.scene;
        // 如果为真，则允许用户旋转相机。如果为假，相机将锁定到当前标题。此标志仅适用于2D和3D。
        scene.screenSpaceCameraController.enableRotate = able;
        // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
        scene.screenSpaceCameraController.enableTranslate = able;
        // 如果为真，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
        scene.screenSpaceCameraController.enableZoom = able;
        // 如果为真，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。
        scene.screenSpaceCameraController.enableTilt = able;
    }
    public viewerFlyTo(viewCfg: IviewerCfg) {
        if (!viewCfg || !viewCfg.lon || !viewCfg.lat) {
            return Promise.resolve();
        }
        const pos = Cesium.Cartesian3.fromDegrees(viewCfg.lon, viewCfg.lat, viewCfg.height || 1000);
        const heading = Cesium.Math.toRadians(viewCfg.heading);
        const pitch = Cesium.Math.toRadians(viewCfg.pitch);
        return new Promise((resolve) => {
            if (!viewCfg.duration) {
                this.viewer.scene.camera.setView({
                    destination: pos,
                    orientation: new Cesium.HeadingPitchRoll(heading, pitch, 0),
                });
            } else {
                this.viewer.camera.flyTo({
                    destination: pos,
                    duration: viewCfg.duration || 2,
                    orientation: new Cesium.HeadingPitchRoll(heading, pitch, 0),
                    complete: () => {
                        resolve();
                    },
                });
            }
        });
    }
    /**
     * @description: 围绕目标点飞行
     * @param {option} IRotatePointOpts 飞行类型及目标点
     * @return: Promise<void>
     */
    public lookAtPoint(option: IRotatePointOpts): Promise<any> {
        return new Promise((resolve, rejects) => {
            // let viewer = this.viewer;
            const camera = this.viewer.camera;
            let origin: Cesium.Cartesian3 = Cesium.Cartesian3.fromDegrees(
                option.lon,
                option.lat,
                option.height,
            );
            let initCameraPos = Cesium.Cartesian3.clone(origin);
            let orientationSelf:
                | Cesium.HeadingPitchRoll
                | {
                      direction: Cesium.Cartesian3;
                      up: Cesium.Cartesian3;
                  } = new Cesium.HeadingPitchRoll();

            switch (option.type) {
                case EROTATETARGET.SELF:
                    orientationSelf = new Cesium.HeadingPitchRoll();
                    // orientationSelf.pitch = Cesium.Math.toRadians(option.pitch || -45);
                    if (!option.height) {
                        origin = setCartesian3Height(origin as any, option.height) as any;
                    }
                    break;
                case EROTATETARGET.ELSE:
                    const currCameraPos = Cesium.clone(camera.position);
                    const sameHeightPos = setCartesian3Height(currCameraPos, option.height);
                    // tslint:disable-next-line: max-line-length
                    const dirSameHighPos = Cesium.Cartesian3.subtract(sameHeightPos as any, origin, new Cesium.Cartesian3());
                    Cesium.Cartesian3.normalize(dirSameHighPos, dirSameHighPos);
                    const newDistance = option.distance * Math.cos(Cesium.Math.toRadians(option.pitch || 45));
                    const newRay = new Cesium.Ray(origin, dirSameHighPos);
                    const newTemp = Cesium.Ray.getPoint(newRay, newDistance, new Cesium.Cartesian3());
                    // tslint:disable-next-line: max-line-length
                    initCameraPos = adjustCartesina3Height(newTemp as any, option.distance * Math.sin(Cesium.Math.toRadians(option.pitch || 45))) as any;
                    let initDir = Cesium.Cartesian3.subtract(
                        origin,
                        initCameraPos as Cesium.Cartesian3,
                        new Cesium.Cartesian3(),
                    );
                    if (initDir.x === 0 && initDir.y === 0) {
                        initDir = new Cesium.Cartesian3(10, 10, -13);
                    }
                    Cesium.Cartesian3.normalize(initDir, initDir);
                    const right = Cesium.Cartesian3.normalize(
                        Cesium.Cartesian3.cross(
                            initDir,
                            (initCameraPos as any),
                            new Cesium.Cartesian3(),
                        ),
                        new Cesium.Cartesian3(),
                    );
                    orientationSelf = {
                        direction: initDir,
                        up: Cesium.Cartesian3.normalize(
                            Cesium.Cartesian3.cross(
                                right,
                                initDir,
                                new Cesium.Cartesian3(),
                            ),
                            new Cesium.Cartesian3(),
                        ),
                    };
                    break;
            }
            camera.flyTo({
                destination: initCameraPos,
                orientation: orientationSelf,
                duration: option.time,
                complete: () => {
                    resolve();
                },
            });
        });
    }
    /**
     * @description: 围绕目标点飞行
     * @param {option} IRotatePointOpts 飞行类型及目标点
     * @return: Promise<void>
     */
    public addRotateSelfFun(option: IRotatePointOpts) {
        // let viewer = this.viewer;
        const camera = this.viewer.camera;
        const origin: Cesium.Cartesian3 = Cesium.Cartesian3.fromDegrees(
            option.lon,
            option.lat,
            option.height || 0,
        );
        const speedNew = option.speed;
        const rotateRad = 0.005;
        this.rotateSelfFun = () => {
            // if (totalRotate > Cesium.Math.TWO_PI) {
            //     this.viewer.clock.onTick.removeEventListener(this.rotateSelfFun);
            // }
            camera.position = Cesium.Cartesian3.fromDegrees(
                option.lon,
                option.lat,
                option.height || 50,
            );
            camera.lookRight(rotateRad);
            // totalRotate += rotateRad;
        };
        // let closeNum = 0;
        this.rotateElseFun = () => {
            // const distance = Cesium.Cartesian3.distance(initCameraPos, camera.position);
            // if (distance < (option.param as IRotateElseOpts).stepLength) {
            //     closeNum++;
            //     if (closeNum > 2) {
            //         this.viewer.clock.onTick.removeEventListener(this.rotateElseFun);
            //     }
            // }
            const getNextOpts: IGetNextPointOnCircleOpts = {
                center: origin,
                camera: this.viewer.camera,
                speed: speedNew || 1,
            };
            const nextOpts = getNextPointOnCircle(getNextOpts);
            if (!nextOpts) { return; }
            camera.position = nextOpts.position;
            camera.direction = nextOpts.direction;
            camera.up = nextOpts.up;
            camera.right = nextOpts.right;
        };
    }
    /**
     * @description: 获取当前视角信息
     */
    public getCameraInfo() {
        const camera = this.viewer.camera;
        const cameraInfo = {
            lon: 0,
            lat: 0,
            height: 0,
            heading: 0,
            pitch: 0,
            roll: 0,
        };
        const cart = Cesium.Cartographic.fromCartesian(camera.position);
        cameraInfo.lon = Cesium.Math.toDegrees(cart.longitude);
        cameraInfo.lat = Cesium.Math.toDegrees(cart.latitude);
        cameraInfo.height = cart.height;
        cameraInfo.heading = Cesium.Math.toDegrees(camera.heading);
        cameraInfo.pitch = Cesium.Math.toDegrees(camera.pitch);
        cameraInfo.roll = Cesium.Math.toDegrees(camera.roll);
        return cameraInfo;
    }
    /**
     * @description: 飞向点集
     * @param {*}
     * @return {*}
     */
    // tslint:disable-next-line: max-line-length
    public flytoPointCollection(pointsArr: Cesium.Cartesian3[], cameraStatus: ILocatePointCollection, callBack: () => {}) {
        if (!pointsArr) {
            return;
        }
        const bs = Cesium.BoundingSphere.fromPoints(pointsArr, new Cesium.BoundingSphere());
        const heading = Cesium.Math.toRadians(cameraStatus.heading) || 0;
        const pitch = Cesium.Math.toRadians(cameraStatus.pitch) || Cesium.Math.toRadians(-45);
        this.viewer.camera.flyToBoundingSphere(bs, {
            duration: cameraStatus.duration || 2,
            offset: new Cesium.HeadingPitchRange(heading, pitch, cameraStatus.range || 5000),
            complete: callBack,
        });
    }
    /**
     * @description: 跟踪路径点
     * @param {IRealTimePath}
     * @param {ITrackedObj}
     */
    public followTracked(pathManager: { [key: string]: IRealTimePath}, trackOpt: ITrackedObj) {
        const currPoint = pathManager[trackOpt.id];
        if (!currPoint) {
            return;
        }
        const index = currPoint.index;
        const path = currPoint.pathPoints;
        // index = index % path.length;
        // if (path.length <= index + 1) {
        //     return;
        // }
        const options: any = {};
        options.targetPoint = path[index];
        options.cameraPos = Cesium.clone((this.viewer as Cesium.Viewer).scene.camera.position);
        options.distance = trackOpt.horizontalDistance || 100; // 水平距离
        options.height = trackOpt.verticalDistance || 61.8;
        options.distance = Math.sqrt(options.distance * options.distance + options.height * options.height); // 斜边距离
        let viewRes;
        switch (trackOpt.type) {
            case EVIEWFLLOWTYPES.GOD:
                viewRes = computedGodViewOpts(options as any);
                break;
            case EVIEWFLLOWTYPES.FIRST:
                const maxIndex = 30;
                options.nextPoint = path[index + maxIndex] || path[index + 1];
                viewRes = computedFirstViewOpts(options as any, trackOpt.newTarget);
                break;
            default:
                viewRes = computedGodViewOpts(options as any);
                break;
        }
        if (!viewRes) {
            return;
        }
        if (viewRes.position) {
            const settings = {
                destination: viewRes.position,
                orientation: {
                    heading: 0,
                    pitch: Cesium.Math.toRadians(-90),
                    roll: 0,
                },
            };
            // (this.viewer as Cesium.Viewer).scene.camera.position = viewRes.position;
            this.viewer.scene.camera.setView(settings);
        }
        if (viewRes.direction) {
            this.viewer.scene.camera.direction = viewRes.direction;
        }
        if (viewRes.right) {
            this.viewer.scene.camera.right = viewRes.right;
        }
        if (viewRes.up) {
            this.viewer.scene.camera.up = viewRes.up;
        }
        trackOpt.newTarget = false;
    }
    /**
     * @description: 根据距离计算相机跟踪状态
     * @param {ILonLatHeight} 目标点
     * @return {string} 跟踪方式
     */
    private computedZoomStatus(point: ILonLatHeight, type: string): any {
        const potHeight = point.height || 0;
        const targetPos = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, potHeight);
        let cameraPos = Cesium.clone(this.viewer.scene.camera.position);
        cameraPos = setCartesian3Height(cameraPos, potHeight);
        const dirBack = Cesium.Cartesian3.subtract(cameraPos, targetPos, new Cesium.Cartesian3());
        Cesium.Cartesian3.normalize(dirBack, dirBack);
        const rayBack = new Cesium.Ray(targetPos, dirBack);
        let distance = 0;
        switch (type) {
            case EZOOMSTATUS.NEAR:
                distance = 100;
                break;
            case EZOOMSTATUS.MID:
                distance = 400;
                break;
            case EZOOMSTATUS.FAR:
                distance = 1000;
                break;
            default:
                distance = 100;
                break;
        }
        let temp2Pos = Cesium.Ray.getPoint(rayBack, distance);
        temp2Pos = setCartesian3Height(temp2Pos as any, potHeight + distance * 1.5) as any;
        const temp2PosStatus = adjustCameraNoRoll(targetPos as any, temp2Pos as any);
        const temp3Pos = setCartesian3Height(temp2Pos as any, potHeight + distance) as any;
        const temp3PosStatus = adjustCameraNoRoll(targetPos as any, temp3Pos);
        return [
            {
                pos: temp2Pos,
                status: temp2PosStatus,
                easyFun: Cesium.EasingFunction.SINUSOIDAL_OUT,
                duration: 3,
            },
            {
                pos: temp3Pos,
                status: temp3PosStatus,
                easyFun: Cesium.EasingFunction.SINUSOIDAL_OUT,
                duration: 1,
            },
        ];
    }
    private async flytoCallBack(arr: any[], num: number) {
        // if (arr && arr[num]) {
        //     this.viewer.camera.flyTo({
        //         destination: arr[num].pos,
        //         orientation: arr[num].status,
        //         complete: () => {
        //             this.flytoCallBack(arr, num++);
        //         },
        //     });
        // }
        for (const p of arr) {
            await this.viewerFlyTo(p);
        }
        // arr.forEach(async (p) => {
        //     await this.viewerFlyTo(p);
        // });
    }
    private fillRoamPath(line: ILonLatHeight[], option: IRoamOption) {
        const nodesArr: Cesium.Cartesian3[] = [];
        line.forEach((point, index) => {
            const firstPot = point;
            const nextPot = line[index + 1];
            const roamHeight = option && option.height || 500;
            if (nextPot) {
                const firstCar = Cesium.Cartesian3.fromDegrees(firstPot.lon, firstPot.lat, roamHeight);
                const nextCar = Cesium.Cartesian3.fromDegrees(nextPot.lon, nextPot.lat, roamHeight);
                const currDis = Cesium.Cartesian3.distance(firstCar, nextCar);
                const currNum = Math.floor(currDis) + 1;
                for (let i = 0; i < currNum; i++) {
                    const currLon = Cesium.Math.lerp(firstPot.lon, nextPot.lon, i / currNum);
                    const currLat = Cesium.Math.lerp(firstPot.lat, nextPot.lat, i / currNum);
                    nodesArr.push(Cesium.Cartesian3.fromDegrees(currLon, currLat, roamHeight));
                }
            }
            const finalPos = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, roamHeight);
            nodesArr.push(finalPos);
        });
        return nodesArr;
    }
    private async boforeRoamFly() {
        return new Promise((resolve) => {
            this.viewer.camera.flyTo({
                destination: this.pathNodes[0],
                orientation: adjustCameraNoRoll(this.pathNodes[1], this.pathNodes[0]) as any,
                complete: () => {
                    resolve();
                },
            });
        });
    }
    private computedBoundInfo(points: Cesium.Cartesian3[], ratio: number, nearFar: number) {
        if (!points || !points.length || points.length <= 3) {
            return;
        }
        if (!nearFar) {
            nearFar = 2.5;
        }
        const perDeg = 0.5;
        const len = points.length;
        let radius = 5000;
        let minAreaDeg = 0;
        let minArea = 99999999999;
        let minDis = 999;
        let centerX = 0;
        let centerY = 0;
        if (!ratio) {
            ratio = (this.viewer.camera.frustum as any).aspectRatio;
        }
        for (let i = 0; i <= 90; i += perDeg) {
            const rad = Cesium.Math.toRadians(i);
            const rMat = Cesium.Matrix3.fromRotationZ(rad, new Cesium.Matrix3());
            let minX = 9999999999;
            let minY = 9999999999;
            let maxX = -9999999999;
            let maxY = -9999999999;
            for (let j = 0; j < len; j ++) {
                const currP = points[j];
                const newP = Cesium.Matrix3.multiplyByVector(rMat, currP, new Cesium.Cartesian3());
                if (minX > newP.x) {
                    minX = newP.x;
                }
                if (minY > newP.y) {
                    minY = newP.y;
                }
                if (maxX < newP.x) {
                    maxX = newP.x;
                }
                if (maxY < newP.y) {
                    maxY = newP.y;
                }
            }
            const disX = maxX - minX;
            const disY = maxY - minY;
            const area = disX * disY;
            if (ratio) {
                const disAbs = Math.abs(disX / disY - ratio);
                if (disAbs < minDis) {
                    minDis = disAbs;
                    minAreaDeg = i;
                    radius = Math.sqrt(disX * disX + disY * disY) / nearFar;
                    centerX = (maxX + minX) / 2;
                    centerY = (maxY + minY) / 2;
                }
            } else {
                if (minArea > area) {
                    minArea = area;
                    minAreaDeg = i;
                    if (disX < disY) {
                        minAreaDeg += 90;
                    }
                    radius = Math.sqrt(disX * disX + disY * disY) / nearFar;
                    const minRad = 300;
                    if (radius <= minRad) {
                        radius = minRad + minRad * radius / minRad;
                    }
                }
            }
        }
        return {
            deg: minAreaDeg,
            radius,
            center: {
                x: centerX,
                y: centerY
            }
        };
    }
    private distanceToBoundingSphere3D(radius: number) {
        const camera = this.viewer.camera;
        var frustum = camera.frustum as any;
        var tanPhi = Math.tan(frustum.fovy * 0.5);
        var tanTheta = frustum.aspectRatio * tanPhi;
        return Math.max(radius / tanTheta, radius / tanPhi);
    }
}
