import * as Cesium from "cesium";
import { IMaterial } from "./Material";
export interface ILightBeamMtlOpt {
    speed: number;
    brightness: number;
    particleImg: string;
}

export class LightBeamParticlesMaterial implements IMaterial<ILightBeamMtlOpt> {
    public material: Cesium.Material;
    constructor(style: ILightBeamMtlOpt) {
        if (!style) {
            style = {} as ILightBeamMtlOpt;
        }
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    speed: style.speed || 1,
                    brightness: style.brightness || 1,
                    alpha: 1,
                    particleImg: style.particleImg
                },
                source: beamParticlesShaderText,
            },
        });
    }
    public reset(style: ILightBeamMtlOpt) {
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

const beamParticlesShaderText = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float tt = 1.0 - st.t;
    st.s = st.s * 3.0;
    st.t = st.t * 3.0;
    st = fract(st - vec2(czm_frameNumber/1000.0 * speed));
    vec4 part = texture2D(particleImg, st);
    material.diffuse = part.rgb * brightness;
    material.alpha = part.a * pow(tt, 3.0);
    return material;
}
`;
