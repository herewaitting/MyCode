import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

export interface IScanEllipseMaterialOpt {
    color: string;
    speed: number;
    imgUrl: string;
    brightness: number;
}

export class ScanEllipseMaterial implements IMaterial<IScanEllipseMaterialOpt> {
    public material: Cesium.Material;
    constructor(style: IScanEllipseMaterialOpt) {
        const speed1  = style.speed;
        const color1 = transformColor(style.color) || Cesium.Color.RED;
        this.material = new Cesium.ScanEllipsePrimitiveMaterial({
            color: color1,
            speed: speed1,
            imgUrl: style.imgUrl,
            brightness: style.brightness,
        }) as any;
    }
    public reset(style: IScanEllipseMaterialOpt) {
        this.material.uniforms.speed = style.speed;
        this.material.uniforms.brightness = style.brightness;
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.color;
        this.material.uniforms.imgUrl = style.imgUrl || this.material.uniforms.imgUrl;
    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
