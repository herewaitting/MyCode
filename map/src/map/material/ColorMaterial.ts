import * as Cesium from "cesium";
import { transformColor } from "../../util/";
import { IMaterial } from "./Material";

const FragmentShaders = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    material.alpha = alpha;\n\
    material.diffuse = color.rgb * brightness;\n\
    return material;\n\
}";

export interface IColorMtlOpt {
    color: string;
    alpha: number;
    brightness: number;
    floatDis?: number;
    speed?: number;
    pointSize?: number;
    maxDis?: number;

}

export class ColorMaterial implements IMaterial<IColorMtlOpt> {
    public material: Cesium.Material;
    constructor(style: IColorMtlOpt) {
        const color = transformColor(style.color) || new Cesium.Color(1.0, 0.0, 1.0, 1.0);
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    color,
                    brightness: style.brightness || 1,
                    alpha: style.alpha,
                    floatDis: style.floatDis || 500,
                    speed: style.speed || 1,
                    pointSize: style.pointSize || 10,
                    maxDis: style.maxDis || Infinity,

                },
                source: FragmentShaders,
            },
        });
    }
    public reset(style: IColorMtlOpt) {
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.floodColor;
        this.material.uniforms.alpha = style.alpha;
        this.material.uniforms.brightness = style.brightness || 1;
        this.material.uniforms.floatDis = style.floatDis || 500;
        this.material.uniforms.speed = style.speed || 1;
        this.material.uniforms.pointSize = style.pointSize || 10;
        this.material.uniforms.maxDis = style.maxDis || Infinity;

    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
