import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

export interface IMulityLineWallMtlOpt {
    color: string;
    speed: number;
    repeat: number;
    brightness: number;
}

export class MulityLineWallMaterial implements IMaterial<IMulityLineWallMtlOpt> {
    public material: Cesium.Material;
    constructor(style: IMulityLineWallMtlOpt) {
        this.material = new Cesium.mulityLineWallMaterial({
            color: transformColor(style.color) || Cesium.Color.RED,
            repeat: style.repeat || 1,
            speed: Cesium.defaultValue(style.speed, 1),
            brightness: Cesium.defaultValue(style.brightness, 1),
        }) as any;
    }
    public reset(style: IMulityLineWallMtlOpt) {
        this.material.uniforms.speed = style.speed;
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.color;
        this.material.uniforms.brightness = style.brightness;
        this.material.uniforms.repeat = style.repeat || this.material.uniforms.repeat;
    }
    public destroy() {
        if (this.material) {
            this.material.destroy();
        }
        this.material = null as any;
    }
}
