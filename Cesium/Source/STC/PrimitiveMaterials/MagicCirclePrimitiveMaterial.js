/*
 * @Descripttion: 
 * @version: 
 * @Author: STC
 * @Date: 2020-03-05 13:01:27
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-09-16 14:01:29
 */
// import * as Cesium from "cesium";

import defaultValue from "../../Core/defaultValue";

import Material from "../../Scene/Material";

var FragmentShaders = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    vec2 st = materialInput.st;\n\
    material.diffuse = texture2D(imgUrl,st).rgb * brightness;\n\
    float dis = distance(st, vec2(0.5, 0.5));\n\
    float temp = fract(czm_frameNumber/45.0*speed)/1.5;\n\
    temp = abs(temp-dis);\n\
    float circleDis = 0.06;\n\
    if(temp<circleDis){\n\
        material.alpha = pow((circleDis-temp)/circleDis,1.5) * alpha;\n\
    }else{\n\
        material.alpha = 0.0;\n\
    }\n\
    if(dis>0.5){material.alpha = 0.0;}\n\
    return material;\n\
}";

//贴地线线 流动效果 材质
function MagicCirclePrimitiveMaterial(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    var imgUrl = defaultValue(options.imgUrl, 1);
    var speed = defaultValue(options.speed, 0.02);
    var brightness = defaultValue(options.brightness, 1);
    return new Material({
        fabric: {
            uniforms: {
                imgUrl: imgUrl,
                speed: speed,
                brightness: brightness,
                alpha: 1.0
            },
            source: FragmentShaders
        }
    });
}

export default MagicCirclePrimitiveMaterial;
