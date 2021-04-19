import * as Cesium from "cesium";
import { transformColor } from "../../util/";
import { IMaterial } from "./Material";
export interface ICommonWaterMtlOpt {
    baseWaterColor: string;
    frequency: number;
    normalMap: string;
    animationSpeed: number;
    amplitude: number;
    brightness: number;
}

export class CommonWaterMaterial implements IMaterial<ICommonWaterMtlOpt> {
    public material: Cesium.Material;
    constructor(style: ICommonWaterMtlOpt) {
        if (!style) {
            style = {} as ICommonWaterMtlOpt;
        }
        const color = transformColor(style.baseWaterColor) || new Cesium.Color(1.0, 0, 0);
        this.material = new Cesium.Material({
            fabric: {
                type: "Water",
                uniforms: {
                    baseWaterColor: color,
                    frequency: style.frequency,
                    normalMap: require("../../../static/img/waterNormals.jpg"),
                    animationSpeed: style.animationSpeed / 100,
                    amplitude: style.amplitude,
                    // brightness: style.brightness,
                },
            },
        });
    }
    public reset(style: ICommonWaterMtlOpt) {
        // tslint:disable-next-line: max-line-length
        this.material.uniforms.baseWaterColor = transformColor(style.baseWaterColor) || this.material.uniforms.baseWaterColor;
        this.material.uniforms.frequency = style.frequency || this.material.uniforms.frequency;
        // this.material.uniforms.brightness = style.brightness || this.material.uniforms.brightness;
        // tslint:disable-next-line: max-line-length
        this.material.uniforms.animationSpeed = style.animationSpeed / 100 || this.material.uniforms.animationSpeed / 100;
        this.material.uniforms.amplitude = style.amplitude || this.material.uniforms.amplitude;
    }
    public destroy() {
        if (this.material) {
            this.material.destroy();
        }
        this.material = null as any;
    }
}
