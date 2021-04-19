import * as Cesium from "cesium";
import { IMaterial } from "./Material";

export interface ILinePrimitiveImageMtlOpt {
    imgUrl: string;
    repeat: number;
    speed: number;
    brightness: number;
}

export class LinePrimitiveImageFlowMaterial implements IMaterial<ILinePrimitiveImageMtlOpt> {
    public material: Cesium.Material;
    constructor(style: ILinePrimitiveImageMtlOpt) {
        this.material = new Cesium.LinePrimitiveImageFlowMaterial({
            imgUrl: Cesium.defaultValue(style.imgUrl, ""),
            repeat: Cesium.defaultValue(style.repeat, 1),
            speed: Cesium.defaultValue(style.speed, 1),
            brightness: Cesium.defaultValue(style.brightness, 1),
        }) as any;
    }
    public reset(style: ILinePrimitiveImageMtlOpt) {
        this.material.uniforms.speed = style.speed;
        this.material.uniforms.brightness = style.brightness;
        this.material.uniforms.imgUrl = style.imgUrl;
        this.material.uniforms.repeat = {x: style.repeat, y: 1};
    }
    public destroy() {
        if (this.material) {
            this.material.destroy();
        }
        this.material = null as any;
    }
}
