/*
 * @Descripttion: 
 * @version: 
 * @Author: STC
 * @Date: 2020-03-05 15:45:50
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-09-16 14:03:16
 */
// import * as Cesium from "cesium";

import defaultValue from "../../Core/defaultValue";

import Material from "../../Scene/Material";

var FragmentShaders = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    vec2 st = materialInput.st;\n\
    float stc_pl = fract(czm_frameNumber / 1200.0 * speed);\n\
    float tempNum = abs(stc_pl-st.s);\n\
    material.alpha = 0.3 * alpha;\n\
    material.diffuse = color.rgb * brightness;\n\
    if(tempNum<=0.005){material.alpha = 1.0 * alpha;}\n\
    return material;\n\
}";

//许愿点 材质效果
function WishPointPrimitiveMaterial(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    var color = defaultValue(options.color, new Cesium.Color(1.0,0.0,0.0,1.0));
    var speed = defaultValue(options.speed, 1);//速度建议1 - 10
    var brightness = defaultValue(options.brightness, 1);
    return new Material({
        fabric: {
            uniforms: {
                color: color,
                speed:speed,
                brightness: brightness,
                alpha: 1.0
            },
            source: FragmentShaders
        }
    });
}

export default WishPointPrimitiveMaterial;
