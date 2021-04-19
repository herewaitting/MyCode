import * as Cesium from "cesium";
import { transformColor } from "../../util/";
import { IMaterial } from "./Material";
export interface ILightBeamMtlOpt {
    color: string;
    speed: number;
    brightness: number;
}

export class LightBeamMaterial implements IMaterial<ILightBeamMtlOpt> {
    public material: Cesium.Material;
    constructor(style: ILightBeamMtlOpt) {
        if (!style) {
            style = {} as ILightBeamMtlOpt;
        }
        const color = transformColor(style.color) || new Cesium.Color(1.0, 0, 0);
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    color,
                    speed: style.speed || 1,
                    brightness: style.brightness || 1,
                    alpha: 1,
                },
                source: beamShaderText,
            },
        });
    }
    public reset(style: ILightBeamMtlOpt) {
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.color;
        this.material.uniforms.speed = style.speed;
        this.material.uniforms.brightness = style.brightness;
    }
    public destroy() {
        if (this.material) {
            this.material.destroy();
        }
        this.material = null as any;
    }
}

const beamShaderText = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    material.diffuse = color.rgb * brightness;
    float temp = 1.0 - st.t;
    float stc_pl = fract(czm_frameNumber/100.0 * speed) * 3.14159265 * 2.0;
    material.alpha = pow(temp,2.0 + abs(sin(stc_pl)) * 2.0) * alpha;
    return material;
}
`;
