import * as Cesium from "cesium";
import { IMaterial } from "./Material";

export interface ITornadoMtlOpt {
    imgUrl: string;
    speed: number;
    reverse: boolean;
    brightness: number;
}

export class TornadoMaterial implements IMaterial<ITornadoMtlOpt> {
    public material: Cesium.Material;
    constructor(style: ITornadoMtlOpt) {
        this.material = new Cesium.TurnadoPrimitiveMaterial({
            imgUrl: Cesium.defaultValue(style.imgUrl, ""),
            speed: Cesium.defaultValue(style.speed, 1),
            brightness: Cesium.defaultValue(style.brightness, 1),
            reverse: style.reverse,
        }) as any;
    }
    public reset(style: ITornadoMtlOpt) {
        this.material.uniforms.speed = style.speed || this.material.uniforms.speed;
        this.material.uniforms.brightness = style.brightness || this.material.uniforms.brightness;
        this.material.uniforms.imgUrl = style.imgUrl || this.material.uniforms.imgUrl;
        this.material.uniforms.reverse = style.reverse;
    }
    public destroy() {
        if (this.material) {
            this.material.destroy();
        }
        this.material = null as any;
    }
}
