import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

const FragmentShaders = `
czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    vec2 st = materialInput.st;\n\
    float temp = fract(czm_frameNumber*speed/500.0);\n\
    vec2 stcTemp = vec2(fract(st.s - temp), st.t);\n\
    vec4 colorImage = texture2D(imgUrl, stcTemp);\n\
    if(colorImage.a == 0.0)\n\
    {\n\
        material.alpha = 0.0;\n\
        material.diffuse = vec3(0.0); \n\
    }\n\
    else\n\
    {\n\
        material.alpha = colorImage.a * alpha * (0.5 - abs(0.5 - st.s));\n\
        material.diffuse = u_color.rgb * brightness; \n\
    }\n\
    return material;\n\
}
`;

// const FragmentShaders = `
// czm_material czm_getMaterial(czm_materialInput materialInput)\n\
// {\n\
//     czm_material material = czm_getDefaultMaterial(materialInput);\n\
//     vec2 st = repeat * materialInput.st;\n\
//     float temp = fract(czm_frameNumber*speed/500.0);\n\
//     vec2 stcTemp = vec2(fract(st.s - temp), st.t);\n\
//     vec4 colorImage = texture2D(imgUrl, stcTemp);\n\
//     if(colorImage.a == 0.0)\n\
//     {\n\
//         material.alpha = 0.0;\n\
//         material.diffuse = vec3(0.0); \n\
//     }\n\
//     else\n\
//     {\n\
//         material.alpha = colorImage.a * alpha;\n\
//         material.diffuse = u_color.rgb * brightness; \n\
//     }\n\
//     return material;\n\
// }
// `;

export interface ISoaringPointMtlOpt {
    imgUrl: string;
    brightness: number;
    alpha: number;
    color: string;
    speed: number;
}

export class SoaringPointMaterial implements IMaterial<ISoaringPointMtlOpt> {
    public material: Cesium.Material;
    constructor(style: ISoaringPointMtlOpt) {
        const color = transformColor(style.color);
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    brightness: style.brightness || 1,
                    imgUrl: style.imgUrl,
                    alpha: style.alpha || 1.0,
                    u_color: color,
                    speed: style.speed || 1,
                },
                source: FragmentShaders,
            },
        });
    }
    public reset(style: ISoaringPointMtlOpt) {
        this.material.uniforms.imgUrl = style.imgUrl || this.material.uniforms.imgUrl;
        this.material.uniforms.brightness = style.brightness || 1;
        this.material.uniforms.alpha = style.alpha || 1;
        this.material.uniforms.u_color = transformColor(style.color) || this.material.uniforms.u_color;
    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
