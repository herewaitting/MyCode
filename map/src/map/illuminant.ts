import * as Cesium from "cesium";
import { ILonLatHeight } from "../interface";
import { transformColor } from "../util/";

export interface IAmbientLightOpt {
    color: string;
    brightness: number;
    enable: boolean;
}

/**
 * @description: 设置环境光
 * @param {IAmbientLightOpt}
 */
export const SetAmbientLight = (option: IAmbientLightOpt) => {
    if (Cesium.ExpandBySTC) {
        (Cesium.ExpandBySTC as any).lightObj.extendLightSwitch.x = option.enable;
        (Cesium.ExpandBySTC as any).lightObj.extendAmbientLightBrightness = option.brightness;
        // tslint:disable-next-line: max-line-length
        (Cesium.ExpandBySTC as any).lightObj.extendAmbientLightColor = transformColor(option.color) || new Cesium.Color(1, 1, 1);
    }
};

export interface IPointLightOpt {
    color: string;
    brightness: number;
    enable: boolean;
    position: ILonLatHeight;
    distance: number;
}

/**
 * @description: 设置点光源
 * @param {IPointLightOpt}
 */

export const SetPointLight = (option: IPointLightOpt) => {
    if (Cesium.ExpandBySTC) {
        (Cesium.ExpandBySTC as any).lightObj.extendLightSwitch.y = option.enable;
        (Cesium.ExpandBySTC as any).lightObj.extendPointLightBrightness = option.brightness;
        // tslint:disable-next-line: max-line-length
        (Cesium.ExpandBySTC as any).lightObj.extendPointLightColor = transformColor(option.color) || new Cesium.Color(1, 1, 1);
        // tslint:disable-next-line: max-line-length
        const position = Cesium.Cartesian3.fromDegrees(option.position.lon, option.position.lat, option.position.height || 100);
        (Cesium.ExpandBySTC as any).lightObj.extendPointLightPositionWC = position;
        (Cesium.ExpandBySTC as any).lightObj.extendPointLightDistance = option.distance;
    }
};

export interface ISpotLightOpt {
    color: string;
    brightness: number;
    enable: boolean;
    position: ILonLatHeight;
    distance: number;
    target: ILonLatHeight;
    angle: number;
}

/**
 * @description: 设置聚光灯
 * @param {ISpotLightOpt}
 */
export const SetSpotLight = (option: ISpotLightOpt) => {
    if (Cesium.ExpandBySTC) {
        (Cesium.ExpandBySTC as any).lightObj.extendLightSwitch.z = option.enable;
        (Cesium.ExpandBySTC as any).lightObj.extendSpotLightBrightness = option.brightness;
        // tslint:disable-next-line: max-line-length
        (Cesium.ExpandBySTC as any).lightObj.extendSpotLightColor = transformColor(option.color) || new Cesium.Color(1, 1, 1);
        // tslint:disable-next-line: max-line-length
        const position = Cesium.Cartesian3.fromDegrees(option.position.lon, option.position.lat, option.position.height || 100);
        (Cesium.ExpandBySTC as any).lightObj.extendSpotLightPositionWC = position;
        (Cesium.ExpandBySTC as any).lightObj.extendSpotLightDistance = option.distance;
        // tslint:disable-next-line: max-line-length
        const targetPos = Cesium.Cartesian3.fromDegrees(option.target.lon, option.target.lat, option.target.height || 0);
        // tslint:disable-next-line: max-line-length
        const dir = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(targetPos, position, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        (Cesium.ExpandBySTC as any).lightObj.extendSpotLightDirectionWC = dir;
        (Cesium.ExpandBySTC as any).lightObj.extendSpotLightAngle = option.angle;
    }
};

export interface IParallelLightOpt {
    color: string;
    brightness: number;
    enable: boolean;
    position: ILonLatHeight;
    target: ILonLatHeight;
    index: number;
}

/**
 * @description: 设置平行光
 * @param {ISpotLightOpt}
 */
export const SetParallelLight = (option: IParallelLightOpt) => {
    if (Cesium.ExpandBySTC) {
        if (option.index === 1) {
            (Cesium.ExpandBySTC as any).lightObj.extendParallelLight1Enable = option.enable;
            (Cesium.ExpandBySTC as any).lightObj.extendParallelLight1Brightness = option.brightness;
            // tslint:disable-next-line: max-line-length
            (Cesium.ExpandBySTC as any).lightObj.extendParallelLight1Color = transformColor(option.color) || new Cesium.Color(1, 1, 1);
            // tslint:disable-next-line: max-line-length
            const position = Cesium.Cartesian3.fromDegrees(option.position.lon, option.position.lat, option.position.height || 100);
            // tslint:disable-next-line: max-line-length
            const targetPos = Cesium.Cartesian3.fromDegrees(option.target.lon, option.target.lat, option.target.height || 0);
            // tslint:disable-next-line: max-line-length
            const dir = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(targetPos, position, new Cesium.Cartesian3()), new Cesium.Cartesian3());
            (Cesium.ExpandBySTC as any).lightObj.extendParallelLight1Direction = dir;
        }
        if (option.index === 2) {
            (Cesium.ExpandBySTC as any).lightObj.extendParallelLight2Enable = option.enable;
            (Cesium.ExpandBySTC as any).lightObj.extendParallelLight2Brightness = option.brightness;
            // tslint:disable-next-line: max-line-length
            (Cesium.ExpandBySTC as any).lightObj.extendParallelLight2Color = transformColor(option.color) || new Cesium.Color(1, 1, 1);
            // tslint:disable-next-line: max-line-length
            const position = Cesium.Cartesian3.fromDegrees(option.position.lon, option.position.lat, option.position.height || 100);
            // tslint:disable-next-line: max-line-length
            const targetPos = Cesium.Cartesian3.fromDegrees(option.target.lon, option.target.lat, option.target.height || 0);
            // tslint:disable-next-line: max-line-length
            const dir = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(targetPos, position, new Cesium.Cartesian3()), new Cesium.Cartesian3());
            (Cesium.ExpandBySTC as any).lightObj.extendParallelLight2Direction = dir;
        }
    }
};

export const LightSource = {
    SetAmbientLight,
    SetPointLight,
    SetSpotLight,
    SetParallelLight,
};

/**
 * @description: 光源管理
 */

export class LightManager {
    public viewer: Cesium.Viewer;
    constructor(viewer: Cesium.Viewer) {
        this.viewer = viewer;
    }
    /**
     * @description: 设置光源
     * @param {string, IAmbientLightOpt | IPointLightOpt | ISpotLightOpt | IParallelLightOpt} 光源类型, 光源属性
     * @return: void
     */
    public setLight(type: string, option: IAmbientLightOpt | IPointLightOpt | ISpotLightOpt | IParallelLightOpt) {
        if (!Cesium.ExpandBySTC) { return; }
        if ((LightSource as any)[`Set${type}Light`]) {
            (LightSource as any)[`Set${type}Light`](option);
        } else {
            console.warn("请确认光源类型正确！");
        }
    }
}
