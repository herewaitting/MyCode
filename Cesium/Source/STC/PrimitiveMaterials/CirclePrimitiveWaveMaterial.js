/*
 * @Descripttion: 
 * @version: 
 * @Author: STC
 * @Date: 2020-03-05 11:15:50
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-09-16 13:59:58
 */
// import * as Cesium from "cesium";

import defaultValue from "../../Core/defaultValue";
import Color from "../../Core/Color";

import Material from "../../Scene/Material";

var FragmentShaders = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    material.diffuse = brightness * color.rgb;\n\
    vec2 st = materialInput.st;\n\
    vec3 str = materialInput.str;\n\
    float dis = distance(st, vec2(0.5, 0.5));\n\
    float per = fract(czm_frameNumber*speed/500.0);\n\
    if(abs(str.z)>0.001){\n\
        discard;\n\
    }\n\
    if(dis >0.5){\n\
        discard;\n\
    }else {\n\
        float perDis = 0.5/count;\n\
        float disNum;\n\
        float bl = .0;\n\
        for(int i=0;i<=99;i++){\n\
            if(float(i)<=count){\n\
                disNum = perDis*float(i) - dis + per/count;\n\
                if(disNum>0.0){\n\
                    if(disNum<perDis){\n\
                        bl = 1.0-disNum/perDis;\n\
                    }\n\
                    else if(disNum-perDis<perDis){\n\
                        bl = 1.0 - abs(1.0-disNum/perDis);\n\
                    }\n\
                    material.alpha = pow(bl,gradient) * alpha;\n\
                }\n\
            }\n\
        }\n\
    }\n\
    return material;\n\
}";

//贴地线线 流动效果 材质
function CirclePrimitiveWaveMaterial(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    var color = defaultValue(options.color, new Color(1, 0, 0, 1.0));
    var count = defaultValue(options.count, 1);
    var speed = defaultValue(options.speed, 1);//速度建议1-10
    var gradient = defaultValue(options.gradient, 5);//系数1-10
    var brightness = defaultValue(options.brightness, 1);
    return new Material({
        fabric: {
            uniforms: {
                color: color,
                speed: speed,
                count: count,
                gradient: gradient,
                brightness: brightness,
                alpha: 1.0,
            },
            source: FragmentShaders
        }
    });
}

export default CirclePrimitiveWaveMaterial;
