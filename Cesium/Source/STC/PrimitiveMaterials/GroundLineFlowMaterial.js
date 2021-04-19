/*
 * @Descripttion: 
 * @version: 
 * @Author: STC
 * @Date: 2020-05-07 11:11:11
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-09-16 14:00:23
 */
// import * as Cesium from "cesium";

import defaultValue from "../../Core/defaultValue";
import Color from "../../Core/Color";

import Material from "../../Scene/Material";



var GroundLineShader = "czm_material czm_getMaterial(czm_materialInput materialInput) \n\
{ \n\
    czm_material material = czm_getDefaultMaterial(materialInput); \n\
    vec2 st = repeat * materialInput.st;\n\
    // vec4 color = texture2D(image, materialInput.st/repeat); \n\
    vec4 colorImage = texture2D(image, vec2(fract((axisY?st.t:st.s) - czm_frameNumber*speed/100.0), st.t));\n\
    if(color.a == 0.0)\n\
    {\n\
        material.alpha = colorImage.a;\n\
        material.diffuse = colorImage.rgb; \n\
    }\n\
    else\n\
    {\n\
        material.alpha = colorImage.a * color.a * alpha;\n\
        material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb) * brightness; \n\
    }\n\
    return material; \n\
}";

//贴地线线 流动效果 材质
function GroundLineFlowMaterial(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    var color = defaultValue(options.color, new Color(1, 0, 0, 1.0));
    var image = options.url || options.image; //必须是png
    var repeat = defaultValue(options.repeat, {
        x: 10,
        y: 1
    });
    var axisY = defaultValue(options.axisY, false);
    var speed = defaultValue(options.speed, 1);//速度建议1-10
    var brightness = defaultValue(options.brightness, 1);
    return new Material({
        fabric: {
            uniforms: {
                color: color,
                image: image,
                repeat: repeat,
                axisY: axisY,
                speed: speed,
                brightness: brightness,
                alpha: 1.0
            },
            source: GroundLineShader
        }
    });
}

export default GroundLineFlowMaterial;
