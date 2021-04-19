import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

export interface IAngleRingMaterialOpt {
    color: string;
    brightness: number;
    speed: number;
    repeat: number;
}

const ShaderText = `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    material.diffuse = color.rgb * brightness;
    material.alpha = (1.0 - st.t) * 0.01;
    float tempFlood = fract(czm_frameNumber*speed/500.0);
    float temp = 1.0/repeat;
    temp = (st.t - tempFlood)/temp;
    float powNum = fract(temp);
    float stcNum = 0.4;
    if(powNum<stcNum * 2.0){
        float midNum = abs(powNum - stcNum)/stcNum;
        material.alpha = pow(material.alpha,midNum);
        material.alpha = material.alpha * (1.0 - st.t) * alpha;
    }
    return material;
}
`;

export class AngleRingMaterial implements IMaterial<IAngleRingMaterialOpt> {
    public material: Cesium.Material;
    constructor(style: IAngleRingMaterialOpt) {
        const color = transformColor(style.color) || Cesium.Color.RED;
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    color,
                    brightness: style.brightness || 1,
                    speed: style.speed || 1,
                    repeat: style.repeat || 3,
                    alpha: 1.0,
                },
                source: ShaderText,
            },
        });
    }
    public reset(style: IAngleRingMaterialOpt) {
        this.material.uniforms.brightness = style.brightness || this.material.uniforms.brightness;
        this.material.uniforms.speed = style.speed || this.material.uniforms.speed;
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.color;
    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
