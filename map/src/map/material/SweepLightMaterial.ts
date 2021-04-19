import * as Cesium from "cesium";
import { transformColor } from "../../util/";
import { IMaterial } from "./Material";

export interface ISweepLightMtlOpt {
    color: string;
    speed: number;
    brightness: number;
}

const ShaderText = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = fract(czm_frameNumber / 1000.0 * speed);
    float dis = abs(st.s - time);
    float disy = abs(st.t - time);
    if(dis <= 0.005){
        float bfb = dis / 0.005;
        material.diffuse = color.rgb * brightness;
        material.alpha = pow(1.0 - bfb, 3.0);
    } else {
        material.alpha = 0.0;
    }
    // else if(disy <= 0.005) {
    //     float bfby = disy / 0.005;
    //     material.diffuse = color.rgb * brightness;
    //     material.alpha = pow(1.0 - bfby, 3.0);
    // }
    return material;
}
`;

export class SweepLightMaterial implements IMaterial<ISweepLightMtlOpt> {
    public material: Cesium.Material;
    constructor(style: ISweepLightMtlOpt) {
        const color = transformColor(style.color) || new Cesium.Color(1.0, 0.0, 1.0, 1.0);
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    color,
                    speed: style.speed || 1.0,
                    brightness: style.brightness || 1,
                },
                source: ShaderText,
            },
        });
    }
    public reset(style: ISweepLightMtlOpt) {
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.floodColor;
        this.material.uniforms.speed = style.speed;
        this.material.uniforms.brightness = style.brightness || 1;
    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
