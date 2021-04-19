/*
 * @Descripttion: 
 * @version: 
 * @Author: STC
 * @Date: 2020-03-02 14:03:07
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-11-16 17:17:56
 */
import defaultValue from "../../Core/defaultValue";
import Color from "../../Core/Color";

import Material from "../../Scene/Material";


var fragmentShaderText = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    vec2 st = repeat * materialInput.st;\n\
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
        material.alpha = colorImage.a * alpha;\n\
        material.diffuse = u_color.rgb * brightness; \n\
    }\n\
    return material;\n\
}";

//贴地线线 流动效果 材质
function LinePrimitiveImageColorFlowMaterial(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    // var image = options.url || options.image; //必须是png
    var repeat = {
        x: options.repeat || 1,
        y: 1
    };
    var axisY = defaultValue(options.axisY, false);
    if(!options.imgUrl)return;
    var speed = defaultValue(options.speed, 1);//速度建议1-10
    var brightness = defaultValue(options.brightness, 1.0);
    var color = defaultValue(options.color, Color.RED);
    return new Material({
        fabric: {
            uniforms: {
                imgUrl: options.imgUrl,
                repeat: repeat,
                axisY: axisY,
                speed:speed,
                brightness: brightness,
                u_color: color,
                alpha: 1.0
            },
            source: fragmentShaderText
        }
    });
}

export default LinePrimitiveImageColorFlowMaterial;