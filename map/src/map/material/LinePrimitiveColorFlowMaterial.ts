import * as Cesium from "cesium";
import { transformColor } from "../../util/";
import { IMaterial } from "./Material";

export interface ILinePrimitiveMtlOpt {
    baseColor: string;
    repeat: number;
    speed: number;
    floodColor: string;
    brightness: number;
}
// export const LinePrimitiveColorFlowMaterial = (style: ILinePrimitiveMtlOpt) => {
//     if (!style) {
//         style = {} as ILinePrimitiveMtlOpt;
//     }
//     return new Cesium.LinePrimitiveColorFlowMaterial({
//         baseColor: Cesium.defaultValue(transformColor(style.baseColor), Cesium.Color.RED),
//         repeat: Cesium.defaultValue(style.repeat, 1),
//         speed: Cesium.defaultValue(style.speed, 1),
//         floodColor: Cesium.defaultValue(transformColor(style.floodColor), Cesium.Color.RED),
//         brightness: Cesium.defaultValue(style.brightness, 1),
//     });
// };

export class LinePrimitiveColorFlowMaterial implements IMaterial<ILinePrimitiveMtlOpt> {
    public material: Cesium.Material;
    constructor(style: ILinePrimitiveMtlOpt) {
        this.material = new Cesium.LinePrimitiveColorFlowMaterial({
            baseColor: transformColor(style.baseColor),
            repeat: style.repeat,
            speed: style.speed,
            floodColor: transformColor(style.floodColor),
            brightness: style.brightness,
        }) as any;
    }
    public reset(style: ILinePrimitiveMtlOpt) {
        let repeat;
        if (style.repeat) {
            repeat = {x: style.repeat, y: 1};
        }
        this.material.uniforms.floodColor = transformColor(style.floodColor) || this.material.uniforms.floodColor;
        this.material.uniforms.baseColor = transformColor(style.baseColor) || this.material.uniforms.baseColor;
        this.material.uniforms.brightness = style.brightness || this.material.uniforms.brightness;
        this.material.uniforms.speed = style.speed || this.material.uniforms.speed;
        this.material.uniforms.repeat = repeat || this.material.uniforms.repeat;
    }
    public destroy() {
        if (this.material) {
            this.material.destroy();
        }
        this.material = null as any;
    }
}
