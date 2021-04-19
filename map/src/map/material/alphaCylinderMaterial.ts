import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

export interface IAlphaCylinderMaterialOpt {
    color: string;
    brightness: number;
}

const ShaderText = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    material.diffuse = color.rgb * brightness;
    material.alpha = pow((1.0 - st.t) * 0.5, 2.0) * alpha;
    return material;
}
`;

export class AlphaCylinderMaterial implements IMaterial<IAlphaCylinderMaterialOpt> {
    public material: Cesium.Material;
    constructor(style: IAlphaCylinderMaterialOpt) {
        const color = transformColor(style.color) || Cesium.Color.RED;
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    color,
                    brightness: style.brightness || 1,
                    alpha: 1.0,
                },
                source: ShaderText,
            },
        });
    }
    public reset(style: IAlphaCylinderMaterialOpt) {
        this.material.uniforms.brightness = style.brightness;
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.color;
    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
