import * as Cesium from "cesium";
// tslint:disable-next-line: max-line-length
import { adjustCartesina3Height, computedCameraByTarget, getPointByDis, getPointByPointDirDis, setCartesian3Height } from "./index";

// 视角跟随类型
export enum EVIEWFLLOWTYPES {
    GOD = "god", // 上帝视角
    FIRST = "first", // 第一视角
}

export const defaultFllowHeight = 10;
export const defaultFloowDistance = 50;
export interface IGodViewOpts {
    targetPoint: Cesium.Cartesian3;
    height?: number;
    upNorth?: boolean;
    fllowRotate?: boolean;
}

export interface IFirstViewOpts {
    targetPoint: Cesium.Cartesian3;
    nextPoint: Cesium.Cartesian3;
    height?: number;
    distance?: number;
    fllowRotate?: boolean;
    cameraPos: Cesium.Cartesian3;
}

export interface IViewCameraOpts {
    position: Cesium.Cartesian3 | undefined;
    direction?: Cesium.Cartesian3 | undefined;
    up?: Cesium.Cartesian3 | undefined;
    right?: Cesium.Cartesian3 | undefined;
}

export const computedGodViewOpts = (option: IGodViewOpts): IViewCameraOpts | undefined => {
    const viewRes: IViewCameraOpts = {
        position: undefined,
        direction: undefined,
        up: undefined,
        right: undefined,
    };
    if (!option || !option.targetPoint) {
        return viewRes;
    }
    viewRes.position = adjustCartesina3Height(option.targetPoint as any, option.height || defaultFllowHeight) as any;
    return viewRes;
};

export const computedFirstViewOpts = (option: IFirstViewOpts, newFly: boolean): IViewCameraOpts | undefined => {
    const viewRes: IViewCameraOpts = {
        position: undefined,
        direction: undefined,
        up: undefined,
        right: undefined,
    };
    if (!option || !option.targetPoint || !option.nextPoint) {
        return viewRes;
    }
    const cameraPos = option.cameraPos;
    const oriDir = Cesium.Cartesian3.subtract(option.targetPoint, option.nextPoint, new Cesium.Cartesian3());
    const randomPoint = getPointByPointDirDis(option.targetPoint as any, oriDir as any, 10);
    if (!randomPoint) {
        return viewRes;
    }
    const currHeight = Cesium.Cartographic.fromCartesian(option.targetPoint).height;
    const newHeightPoint = setCartesian3Height(randomPoint, currHeight);
    if (!newHeightPoint) {
        return viewRes;
    }
    // tslint:disable-next-line: max-line-length
    const trueDisPoint = getPointByPointDirDis(option.targetPoint as any, Cesium.Cartesian3.subtract(newHeightPoint as any, option.targetPoint, new Cesium.Cartesian3()) as any, option.distance || defaultFloowDistance);
    if (!trueDisPoint) {
        return viewRes;
    }
    viewRes.position = adjustCartesina3Height(trueDisPoint, option.height || defaultFllowHeight) as any;
    const currDis = Cesium.Cartesian3.distance(viewRes.position as Cesium.Cartesian3, cameraPos);
    if (!newFly) {
        // tslint:disable-next-line: max-line-length
        viewRes.position = getPointByDis(cameraPos as any, viewRes.position as Cesium.Cartesian3 as any, currDis / 30) as any;
    }
    if (!viewRes.position) {
        return viewRes;
    }
    const newViewRes = computedCameraByTarget(viewRes.position as any, option.targetPoint as any);
    return newViewRes;
};

export interface IGetNextPointOnCircleOpts {
    center: Cesium.Cartesian3;
    camera: Cesium.Camera;
    speed: number;
    right?: boolean;
}

export interface INextPointReturnOpts {
    position: Cesium.Cartesian3;
    direction: Cesium.Cartesian3;
    up: Cesium.Cartesian3;
    right: Cesium.Cartesian3;
}

// 镜头绕点旋转，计算下一帧相机的方向，上方向，和右方向参数
let defaultStepLength = 1;
export const getNextPointOnCircle = (options: IGetNextPointOnCircleOpts): INextPointReturnOpts|undefined => {
    if ( !options || !options.center || !options.camera ) {return; }
    const point = options.camera.position;
    const radius = Cesium.Cartesian3.distance(options.center, point);
    const right = options.camera.right;
    const dirRightRay = new Cesium.Ray(point, right);
    const nextPoint = new Cesium.Cartesian3();
    defaultStepLength = radius / 1000;
    Cesium.Ray.getPoint(dirRightRay , options.speed * defaultStepLength, nextPoint);
    const nextDirCenter = new Cesium.Cartesian3();
    const nextPointOnCircle = new Cesium.Cartesian3();
    Cesium.Cartesian3.subtract(nextPoint, options.center, nextDirCenter);
    Cesium.Cartesian3.normalize(nextDirCenter, nextDirCenter);
    const nextDirCenterRay = new Cesium.Ray(options.center, nextDirCenter);
    Cesium.Ray.getPoint(nextDirCenterRay , radius, nextPointOnCircle);
    const nextDirRight = new Cesium.Cartesian3();
    const nextDirUp = new Cesium.Cartesian3();
    Cesium.Cartesian3.negate(nextDirCenter, nextDirCenter);
    Cesium.Cartesian3.cross(nextDirCenter, nextPointOnCircle, nextDirRight);
    Cesium.Cartesian3.cross(nextDirRight, nextDirCenter, nextDirUp);
    return {
        position: nextPointOnCircle,
        direction: nextDirCenter,
        up: nextDirUp,
        right: nextDirRight,
    };

    // const nextPointOnCircle = new Cesium.Cartesian3();
    // const right = new Cesium.Cartesian3();
    // const dirCenter = new Cesium.Cartesian3();
    // Cesium.Cartesian3.subtract(options.center, point, dirCenter);
    // Cesium.Cartesian3.cross(dirCenter, point, right);
    // Cesium.Cartesian3.normalize(right, right);
    // const nextPoint = new Cesium.Cartesian3();
    // const dirRightRay = new Cesium.Ray(options.center, right);
};
