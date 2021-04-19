import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

export interface ISimulateHaloMaterialOpt {
    color: string;
    brightness: number;
}

const ShaderText = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    material.diffuse = brightness * color.rgb;
    vec2 st = materialInput.st;
    float dis = distance(st, vec2(0.5, 0.5));
    if(dis >0.5){
        discard;
    }else {
        // material.alpha = pow((0.5 - dis),0.5) * alpha;
        material.alpha = alpha;
    }
    return material;
}
`;

export class SimulateHaloMaterial implements IMaterial<ISimulateHaloMaterialOpt> {
    public material: Cesium.Material;
    constructor(style: ISimulateHaloMaterialOpt) {
        const color = transformColor(style.color) || Cesium.Color.RED;
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    color,
                    brightness: style.brightness || 1,
                    alpha: 1,
                },
                source: ShaderText,
            },
        });
    }
    public reset(style: ISimulateHaloMaterialOpt) {
        this.material.uniforms.brightness = style.brightness;
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.color;
    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
