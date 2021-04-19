import * as Cesium from "cesium";
import { transformColor } from "../../util/";
import { IMaterial } from "./Material";

export interface IDomeCoverMtlOpt {
    color: string;
    speed: number;
    brightness: number;
}

const ShaderText = `
#define tau 6.2831853
mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
float noise( in vec2 x ){return texture2D(rectImg, x*.01).x;}
float fbm(in vec2 p, in float time)
{
	float z=2.;
	float rz = 0.;
	vec2 bp = p;
	for (float i= 1.;i < 6.;i++)
	{
		rz+= abs((noise(p)-0.5)*2.)/z;
		z = z*2.;
		p = p*2.;
	}
	return rz;
}

float dualfbm(in vec2 p, in float time)
{
	vec2 p2 = p*.7;
	vec2 basis = vec2(fbm(p2-time*1.6, time),fbm(p2+time*1.7, time));
	basis = (basis-.5)*.2;
	p += basis;
	return fbm(p*makem2(time*0.2), time);
}

float circ(vec2 p)
{
	float r = length(p);
	r = log(sqrt(r));
	return abs(mod(r*4.,tau)-3.14)*3.+.2;

}
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = abs(sin(czm_frameNumber / 10000.0 * speed));
    vec2 p = abs(st - 0.5);
    // p.x *= czm_viewport.z/czm_viewport.w;
    float rz = dualfbm(p, time);
	p /= exp(mod(time*10.,3.14159));
	rz *= pow(abs((0.1-circ(p))),.5);
	// vec3 col = vec3(.2,0.1,0.4)/rz;
	vec3 col = color.rgb/rz;
	col=pow(abs(col),vec3(.99));
    material.diffuse = col * brightness;
    material.alpha = 0.5;
    return material;
}
`;

export class DomeCoverMaterial implements IMaterial<IDomeCoverMtlOpt> {
    public material: Cesium.Material;
    constructor(style: IDomeCoverMtlOpt) {
        const color = transformColor(style.color) || new Cesium.Color(1.0, 0.0, 1.0, 1.0);
        this.material = new Cesium.Material({
            fabric: {
                uniforms: {
                    color,
                    speed: style.speed || 1.0,
                    rectImg: require("../../../static/img/domeNoise.png"),
                    brightness: style.brightness || 1,
                },
                source: ShaderText,
            },
        });
    }
    public reset(style: IDomeCoverMtlOpt) {
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
