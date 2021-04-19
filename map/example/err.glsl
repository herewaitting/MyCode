
varying vec4 v_pickColor;
uniform float efinition_6;


uniform sampler2D specularMap_5;
uniform sampler2D normalMap_2;
uniform vec4 baseWaterColor_0;
uniform vec4 blendColor_7;
uniform float frequency_1;
uniform float animationSpeed_3;
uniform float amplitude_4;
uniform float specularIntensity_8;
uniform float fadeFactor_9;

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);

    float time = czm_frameNumber * animationSpeed_3;

    
    float fade = max(1.0, (length(materialInput.positionToEyeEC) / 10000000000.0) * frequency_1 * fadeFactor_9);

    float specularMapValue = texture2D(specularMap_5, materialInput.st).r;

    
    vec4 noise = czm_getWaterNoise(normalMap_2, materialInput.st * frequency_1, time, 0.0);
    vec3 normalTangentSpace = noise.xyz * vec3(1.0, 1.0, (1.0 / amplitude_4));

    
    normalTangentSpace.xy /= fade;

    
    normalTangentSpace = mix(vec3(0.0, 0.0, 50.0), normalTangentSpace, specularMapValue);

    normalTangentSpace = normalize(normalTangentSpace);

    
    float tsPerturbationRatio = clamp(dot(normalTangentSpace, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);

    
    material.alpha = specularMapValue;

    
    
    material.diffuse = mix(blendColor_7.rgb, baseWaterColor_0.rgb, specularMapValue);

    
    material.diffuse += (0.1 * tsPerturbationRatio);

    material.diffuse = material.diffuse;

    material.normal = normalize(materialInput.tangentToEyeMatrix * normalTangentSpace);

    material.specular = specularIntensity_8;
    material.shininess = 10.0;

    return material;
}



czm_material czm_getMaterial1(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    float time = czm_frameNumber * animationSpeed_3;
    float fade = max(1.0, (length(materialInput.positionToEyeEC) / 10000000000.0) * frequency_1);
    vec2 st = materialInput.st* frequency_1;
    vec4 noise = czm_getWaterNoise(normalMap_2, st, time, 0.0);
    vec3 normalTangentSpace = noise.xyz * vec3(1.0, 1.0, (1.0 / amplitude_4));
    normalTangentSpace.xy /= fade;
    normalTangentSpace = normalize(normalTangentSpace);
    float tsPerturbationRatio = clamp(dot(normalTangentSpace, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    vec2 v = gl_FragCoord.xy / czm_viewport.zw;
    v.x = 1.0 - v.x;
    vec2 nosize1 = noise.xy * 0.005;

    float r = sqrt((v.x-0.8)*(v.x-0.8) + (v.y-0.8)*(v.y-0.8));
    float r2 = sqrt((v.x-0.2)*(v.x-0.2) + (v.y-0.2)*(v.y-0.2));
    float z = cos(200.0*r + time / 100.0)/250.0;
    float z2 = cos(200.0*r2 + time /100.0)/250.0;
    v += sqrt(z*z+z2*z2);

    material.diffuse = texture2D(specularMap_5, v + nosize1).rgb;
    material.diffuse += (0.1 * tsPerturbationRatio);
    material.diffuse = mix(baseWaterColor_0.rgb, material.diffuse, efinition);
    material.normal = normalize(materialInput.tangentToEyeMatrix * normalTangentSpace);
    material.shininess = 10.0;
    material.alpha = baseWaterColor_0.a;
    return material;
}
varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec3 v_tangentEC;
varying vec3 v_bitangentEC;
varying vec2 v_st;
void czm_log_depth_main()
{
    vec3 positionToEyeEC = -v_positionEC;
    mat3 tangentToEyeMatrix = czm_tangentToEyeSpaceMatrix(v_normalEC, v_tangentEC, v_bitangentEC);
    vec3 normalEC = normalize(v_normalEC);
    #ifdef FACE_FORWARD
    normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
    #endif
    czm_materialInput materialInput;
    materialInput.normalEC = normalEC;
    materialInput.tangentToEyeMatrix = tangentToEyeMatrix;
    materialInput.positionToEyeEC = positionToEyeEC;
    materialInput.st = v_st;
    czm_material material = czm_getMaterial1(materialInput);
    #ifdef FLAT
    gl_FragColor = vec4(material.diffuse, material.alpha);
    #else
    gl_FragColor = czm_translucentPhong(normalize(positionToEyeEC), material);
    #endif
}
#line 0
#ifdef GL_EXT_frag_depth
#endif
void czm_translucent_main()
{
    czm_log_depth_main();
    czm_writeLogDepth();
}
#line 0
void main()
{
    czm_translucent_main();
}
"