import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

export interface IWaveCircleMaterialOpt {
    color: string;
    speed: number; // 动画时长
    count: number; // 扩散圈数
    gradient: number; // 渐变系数
    brightness: number;
}

export class WaveCircleMaterial implements IMaterial<IWaveCircleMaterialOpt> {
    public material: Cesium.Material;
    constructor(style: IWaveCircleMaterialOpt) {
        const speed1  = style.speed;
        const color1 = transformColor(style.color) || Cesium.Color.RED;
        const gradient1 = style.gradient;
        const count1 = style.count;
        this.material = new Cesium.CirclePrimitiveWaveMaterial({
            color: color1,
            speed: speed1 || 1,
            count: count1 || 3,
            gradient: gradient1 || 5,
            brightness: style.brightness || 1,
        }) as any;
    }
    public reset(style: IWaveCircleMaterialOpt) {
        this.material.uniforms.speed = style.speed;
        this.material.uniforms.brightness = style.brightness;
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.color;
        this.material.uniforms.count = style.count;
        this.material.uniforms.gradient = style.gradient;
    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
