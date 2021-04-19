/*
 * @Author: your name
 * @Date: 2020-03-20 09:31:25
 * @LastEditTime: 2020-09-16 14:02:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesiumExtension\Source\STC\feature\material\ScanEllipseMaterial.js
 */
// import * as Cesium from "cesium";

import defaultValue from "../../Core/defaultValue";
import Color from "../../Core/Color";

import Material from "../../Scene/Material";

var FragmentShaders = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    vec2 st = materialInput.st;st-=.5;\n\
    float rad = czm_frameNumber*speed /1000.0 * 3.141592653 * 2.0;\n\
    mat2 m = mat2(cos(rad), -sin(rad), sin(rad), cos(rad));\n\
    st  = m * st; st+=.5;\n\
    vec4 imgC = texture2D(imgUrl,st);\n\
    if(imgC.a>.0){\n\
        material.diffuse = color.rgb * brightness;\n\
    }\n\
    float dis = distance(st, vec2(0.5, 0.5));\n\
    material.alpha = imgC.a * alpha;\n\
    if(abs(dis - 0.5)<=0.005){material.diffuse = color.rgb * brightness;material.alpha = 1.0 * alpha;}\n\
    return material;\n\
}";

//贴地线线 流动效果 材质
function ScanEllipsePrimitiveMaterial(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    if (!options.imgUrl) {
        return;
    }
    var imgUrl = options.imgUrl;
    var speed = defaultValue(options.speed, 1);//速度建议1-10
    var color = defaultValue(options.color, new Color(1,1,0,1));//系数1-10
    var brightness = defaultValue(options.brightness, 1);
    return new Material({
        fabric: {
            uniforms: {
                imgUrl: imgUrl,
                speed: speed,
                color: color,
                brightness: brightness,
                alpha: 1.0
            },
            source: FragmentShaders
        }
    });
}

export default ScanEllipsePrimitiveMaterial;
