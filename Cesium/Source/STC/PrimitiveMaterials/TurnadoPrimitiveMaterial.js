/*
 * @Descripttion: 类龙卷风效果
 * @version: 1
 * @Author: STC
 * @Date: 2020-04-13 11:48:20
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-09-16 14:02:48
 */

import defaultValue from "../../Core/defaultValue";

import Material from "../../Scene/Material";

var FragmentShaders = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    vec2 st = materialInput.st;\n\
    vec4 colorImage;\n\
    float temp = czm_frameNumber / 500.0 * speed;\n\
    float tempt = fract(st.t - temp);\n\
    if (!reverse) {\n\
        float stc_pl = fract(st.s - temp);\n\
        colorImage = texture2D(imgUrl, vec2(1.0 - stc_pl, tempt));\n\
    } else {\n\
        float stc_pl = fract(st.s + temp);\n\
        colorImage = texture2D(imgUrl, vec2(stc_pl, tempt));\n\
    }\n\
    material.diffuse = colorImage.rgb * brightness;\n\
    material.alpha = colorImage.a * alpha;\n\
    return material;\n\
}";

//许愿点 材质效果
function TurnadoPrimitiveMaterial(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    if (!options.imgUrl) {
        return;
    }
    var imgUrl = options.imgUrl;
    var speed = defaultValue(options.speed, 1);//速度建议1 - 10
    var alpha = defaultValue(options.alpha, 1);
    var brightness = defaultValue(options.brightness, 1);
    return new Material({
        fabric: {
            uniforms: {
                speed: speed,
                imgUrl: imgUrl,
                alpha: alpha,
                reverse: Boolean(options.reverse),
                brightness: brightness
            },
            source: FragmentShaders
        }
    });
}

export default TurnadoPrimitiveMaterial;
