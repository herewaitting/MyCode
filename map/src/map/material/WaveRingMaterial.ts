import * as Cesium from "cesium";
import { IMaterial } from "./Material";

export interface IWaveRingMtlOpt {
    imgUrl: string;
    speed: number;
    brightness: number;
}

export class WaveRingMaterial implements IMaterial<IWaveRingMtlOpt> {
    public material: Cesium.Material;
    constructor(style: IWaveRingMtlOpt) {
        this.material = new Cesium.MagicCirclePrimitiveMaterial({
            imgUrl: style.imgUrl,
            speed: style.speed,
            brightness: style.brightness,
        }) as any;
    }
    public reset(style: IWaveRingMtlOpt) {
        this.material.uniforms.imgUrl = style.imgUrl || this.material.uniforms.imgUrl;
        this.material.uniforms.speed = style.speed;
        this.material.uniforms.brightness = style.brightness || 1;
    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
