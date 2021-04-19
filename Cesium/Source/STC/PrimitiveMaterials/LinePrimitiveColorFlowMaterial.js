/*
 * @Author: your name
 * @Date: 2020-01-20 13:13:56
 * @LastEditTime: 2021-03-09 09:57:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesiumExtension\Source\STC\lines\LinePrimitiveColorFlowMaterial.js
 */
import defaultValue from "../../Core/defaultValue";
import Color from "../../Core/Color";

import Material from "../../Scene/Material";


var fragmentShaderText = "czm_material czm_getMaterial(czm_materialInput materialInput) \n\
{ \n\
    czm_material material = czm_getDefaultMaterial(materialInput); \n\
    vec2 st = repeat * materialInput.st;\n\
    material.diffuse = baseColor.rgb;\n\
    float temp = fract(st.s + beginNum - czm_frameNumber*speed/600.0);\n\
    material.alpha = clamp(temp,0.3,1.0);\n\
    material.diffuse = mix(baseColor.rgb,floodColor.rgb,pow(temp,10.0)) * brightness;\n\
    // float powNum1 = 1.0-abs(st.t - 0.5)/0.5;\n\
    // material.alpha = material.alpha * powNum1 * alpha;\n\
    // float uvc = clamp(temp - powNum1,0.0,1.0);\n\
    // material.alpha = material.alpha * pow(1.0-uvc,3.0);\n\
    return material; \n\
}";


// "czm_material czm_getMaterial(czm_materialInput materialInput) \n\
// { \n\
//     czm_material material = czm_getDefaultMaterial(materialInput); \n\
//     vec2 st = repeat * materialInput.st;\n\
//     material.diffuse = baseColor.rgb;\n\
//     float temp = fract(st.s - fract(czm_frameNumber*speed/100.0));\n\
//     temp = pow(temp, 20.0);\n\
//     if (false) {\n\
//       material.alpha = clamp(temp,0.3,1.0);\n\
//       material.alpha = temp;\n\
//       material.diffuse = mix(baseColor.rgb,floodColor.rgb,pow(temp,10.0)) * brightness;\n\
//     } else {\n\
//       material.alpha = temp;\n\
//       material.diffuse = floodColor.rgb * brightness;\n\
//     }\n\
//     // float powNum1 = 1.0-abs(st.t - 0.5)/0.5;\n\
//     // material.alpha = material.alpha * powNum1 * alpha;\n\
//     // float uvc = clamp(temp - powNum1,0.0,1.0);\n\
//     // material.alpha = material.alpha * pow(1.0-uvc,3.0);\n\
//     return material; \n\
// }";


//贴地线线 流动效果 材质
function LinePrimitiveColorFlowMaterial(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    var baseColor = defaultValue(options.baseColor, new Color(1, 0, 0, 1.0));
    var floodColor = defaultValue(options.floodColor, new Color(1, 1, 0, 1.0));
    // var image = options.url || options.image; //必须是png
    var repeat = {
        x: options.repeat || 1,
        y: 1
    };
    // var axisY = defaultValue(options.axisY, false);
    var speed = defaultValue(options.speed, 1);//速度建议1-10
    var brightness = defaultValue(options.brightness, 1.0);
    return new Material({
        fabric: {
            uniforms: {
                baseColor: baseColor,
                // image: image,
                repeat: repeat,
                // axisY: axisY,
                speed: speed + Math.random() * 3,
                floodColor:floodColor,
                brightness: brightness,
                alpha: 1.0,
                beginNum: Math.random()
            },
            source: fragmentShaderText
        }
    });
}

export default LinePrimitiveColorFlowMaterial;