import * as Cesium from "cesium";
import { IMaterial } from "./Material";
export interface IHotMapMtlOpt {
    image: any;
    sedai: string;
    alpha: number;
    showNum: number;
}

export class HotMapMaterial implements IMaterial<IHotMapMtlOpt> {
    public material: Cesium.Material;
    constructor(style: IHotMapMtlOpt) {
        if (!style) {
            style = {} as IHotMapMtlOpt;
        }
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    image: style.image,
                    sedai: style.sedai,
                    alpha: style.alpha || 1,
                    showNum: style.showNum || 0,
                },
                source: beamShaderText,
            },
        });
    }
    public reset(style: IHotMapMtlOpt) {
        this.material.uniforms.image = style.image || this.material.uniforms.image;
        this.material.uniforms.sedai = style.sedai || this.material.uniforms.sedai;
        this.material.uniforms.sedai = style.alpha || this.material.uniforms.alpha;
        this.material.uniforms.showNum = style.showNum || this.material.uniforms.showNum;
    }
    public destroy() {
        if (this.material) {
            this.material.destroy();
        }
        this.material = null as any;
    }
    public setUpdateFun(funs: Array<(material: any, owner: any) => void>) {
        (this.material as any)._updateFunctions = funs;
    }
}

const beamShaderText = `czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    vec4 colorImage = texture2D(image, st);
    if(colorImage.r>showNum){
        vec4 newColor = texture2D(sedai, vec2(colorImage.r, 0.5));
        material.alpha = clamp(0.0,alpha, colorImage.a * 20.0);
        material.diffuse = newColor.rgb;
    }else {
        material.alpha = 0.0;
        material.diffuse = vec3(0.0);
    }
    return material;
}`;
