import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

export interface IWaveImageMaterialOpt {
    color: string;
    speed: number;
    imgUrl: string;
    // scale: number;
    brightness: number;
}

const ShaderText = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    // float time = fract(abs(czm_frameNumber / 1000.0 * speed));
    vec2 st = materialInput.st;
    // st = st / time;
    vec4 rectColor = texture2D(imgUrl, st);
    material.diffuse = color.rgb * brightness;
    // float stca = pow(2.0 - scale, 1.0);
    material.alpha = rectColor.a * alpha;
    if (st.s > 1.0 || st.t > 1.0) {
        material.alpha = .0;
    }
    return material;
}
`;

export class WaveImageMaterial implements IMaterial<IWaveImageMaterialOpt> {
    public material: Cesium.Material;
    constructor(style: IWaveImageMaterialOpt) {
        const color = transformColor(style.color) || Cesium.Color.RED;
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    color,
                    speed: style.speed || 1,
                    imgUrl: style.imgUrl,
                    // scale: this.currScale,
                    brightness: style.brightness || 1,
                    alpha: 1,
                },
                source: ShaderText,
            },
        });
    }
    public reset(style: IWaveImageMaterialOpt) {
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
