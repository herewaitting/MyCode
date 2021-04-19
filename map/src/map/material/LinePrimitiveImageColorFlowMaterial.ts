import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

export interface ILinePrimitiveImageColorMtlOpt {
    imgUrl: string;
    repeat: number;
    speed: number;
    brightness: number;
    color: string;
}

export class LinePrimitiveImageColorFlowMaterial implements IMaterial<ILinePrimitiveImageColorMtlOpt> {
    public material: Cesium.Material;
    constructor(style: ILinePrimitiveImageColorMtlOpt) {
        this.material = new Cesium.LinePrimitiveImageColorFlowMaterial({
            imgUrl: Cesium.defaultValue(style.imgUrl, ""),
            repeat: Cesium.defaultValue(style.repeat, 1),
            speed: Cesium.defaultValue(style.speed, 1),
            brightness: Cesium.defaultValue(style.brightness, 1),
            color: transformColor(style.color),
        }) as any;
    }
    public reset(style: ILinePrimitiveImageColorMtlOpt) {
        this.material.uniforms.speed = style.speed;
        this.material.uniforms.brightness = style.brightness;
        this.material.uniforms.imgUrl = style.imgUrl;
        this.material.uniforms.u_color = transformColor(style.color) || this.material.uniforms.u_color;
        this.material.uniforms.repeat = {x: style.repeat, y: 1};
    }
    public destroy() {
        if (this.material) {
            this.material.destroy();
        }
        this.material = null as any;
    }
}
