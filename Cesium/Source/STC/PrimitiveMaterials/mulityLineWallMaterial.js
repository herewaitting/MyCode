/*
 * @Descripttion: 
 * @version: 
 * @Author: STC
 * @Date: 2020-03-16 14:58:35
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-09-03 13:38:18
 */
import defaultValue from "../../Core/defaultValue";
import Color from "../../Core/Color";

import Material from "../../Scene/Material";


var fragmentShaderText = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    vec2 st = materialInput.st;\n\
    material.diffuse = color.rgb * brightness;\n\
    material.alpha = (1.0 - st.t) * 0.3 * alpha;\n\
    float tempFlood = fract(czm_frameNumber*speed/500.0);\n\
    float temp = 1.0/repeat;\n\
    temp = (st.t - tempFlood)/temp;\n\
    float powNum = fract(temp);\n\
    float stcNum = 0.4;\n\
    if(powNum<stcNum * 2.0){\n\
        float midNum = abs(powNum - stcNum)/stcNum;\n\
        material.alpha = pow(material.alpha,midNum);\n\
        material.alpha = material.alpha * (1.0 - st.t) * alpha;\n\
    }\n\
    return material;\n\
}";

//贴地线线 流动效果 材质
function mulityLineWallMaterial(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    var color = defaultValue(options.color, new Color(1, 0, 0, 1.0));
    var speed = defaultValue(options.speed, 1);//速度建议1-10
    var repeat = defaultValue(options.repeat, 1);
    var alpha = defaultValue(options.alpha, 1);
    var brightness = defaultValue(options.brightness, 1);
    return new Material({
        fabric: {
            uniforms: {
                color: color,
                speed:speed,
                repeat: repeat,
                alpha: alpha,
                brightness: brightness
            },
            source: fragmentShaderText
        }
    });
}

export default mulityLineWallMaterial;