import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

const FragmentShaders = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    material.diffuse = texture2D(imgUrl, st).rgb * brightness;
    material.diffuse = material.diffuse * color.rgb;
    material.alpha = alpha;
    return material;
}
`;

export interface IImageMtlOpt {
    imgUrl: string;
    brightness: number;
    alpha: number;
    color: string;
}

export class ImageMaterial implements IMaterial<IImageMtlOpt> {
    public material: Cesium.Material;
    constructor(style: IImageMtlOpt) {
        const color = transformColor(style.color);
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    brightness: style.brightness || 1,
                    imgUrl: style.imgUrl,
                    alpha: style.alpha,
                    color,
                },
                source: FragmentShaders,
            },
        });
    }
    public reset(style: IImageMtlOpt) {
        this.material.uniforms.imgUrl = style.imgUrl || this.material.uniforms.imgUrl;
        this.material.uniforms.brightness = style.brightness || 1;
        this.material.uniforms.alpha = style.alpha || 1;
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.color;
    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
