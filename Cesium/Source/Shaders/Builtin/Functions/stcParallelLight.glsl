// vec3 czm_stcSpotLight(vec3 oldColor, vec3 stc_normal, vec3 stc_positionEC, float jmfsNum, vec2 material) {
//     vec3 newColor = oldColor;
//     if (czm_extendLightSwitch.z) {
//         vec3 spotLightToPot = normalize(stc_positionEC.xyz - czm_extendSpotLightPositionEC);
//         vec3 spotLightDir = czm_extendSpotLightPositionEC - stc_positionEC;
//         spotLightDir = normalize(spotLightDir);
//         float nDotSTC = max(dot(spotLightDir,stc_normal), 0.0);
//         vec3 reflectN = normalize(reflect(-spotLightDir, stc_normal));
//         vec3 potToEye = -normalize(stc_positionEC);
//         const float constantAttenuation = 1.0;
//         const float linearAttenuation = 1.0;
//         const float quadraticAttenuation = 1.0;
//         float dis = length(czm_extendSpotLightPositionEC - stc_positionEC); 
//         float bfbdis = dis / czm_extendSpotLightDistance; 
//         float jmfsDot = max(dot(reflectN, potToEye),0.0); 
//         float att = 1.0/(constantAttenuation + linearAttenuation*bfbdis + quadraticAttenuation * bfbdis * bfbdis); 
//         float SpotFactor = dot(spotLightDir, czm_extendSpotLightDirectionEC); 
//         if (SpotFactor > czm_extendSpotLightCosNum) {
//             float soptSJ = (1.0 - (1.0 - SpotFactor) * 1.0/(1.0 - czm_extendSpotLightCosNum)); 
//             vec3 diffuseStc = czm_extendSpotLightBrightness * att * czm_extendSpotLightColor * soptSJ * 2.0; 
//             vec3 jmfsC = jmfsNum * att * czm_extendSpotLightColor * pow(jmfsDot, 64.0) * soptSJ * czm_extendSpotLightBrightness; 
//             newColor = diffuseStc + jmfsC + oldColor; 
//         }
//     }
//     return newColor;
// }


vec3 fresnelSchlick24(vec3 f0, vec3 f90, float VdotH) 
{
    return f0 + (f90 - f0) * pow(clamp(1.0 - VdotH, 0.0, 1.0), 5.0);
}

float smithVisibilityG14(float NdotV, float roughness) 
{
    float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
}

float smithVisibilityGGX4(float roughness, float NdotL, float NdotV) 
{
    return smithVisibilityG14(NdotL, roughness) * smithVisibilityG14(NdotV, roughness);
}

float GGX4(float roughness, float NdotH) 
{
    float roughnessSquared = roughness * roughness;
    float f = (NdotH * roughnessSquared - NdotH) * NdotH + 1.0;
    return roughnessSquared / (3.141592653589793 * f * f);
}


vec3 czm_stcParallelLight(vec3 positionEC, czm_geometryInput geometry, czm_parallelLightInput light) {
    vec3 newColor = vec3(0.0);
    if (light.enable) {
        vec3 pointl = -normalize(light.direction);
        vec3 v = -normalize(positionEC);
        vec3 n = geometry.normal;
        const float constantAttenuation = 1.0;
        const float linearAttenuation = 1.0;
        const float quadraticAttenuation = 1.0;
        float metalness = geometry.metalness;
        float roughness = geometry.roughness;
        float alpha = roughness * roughness;
        vec3 pointh = normalize(v + pointl);
        float pNdotL = clamp(dot(n, pointl), 0.001, 1.0);
        float pNdotV = abs(dot(n, v)) + 0.001;
        float pNdotH = clamp(dot(n, pointh), 0.0, 1.0);
        float pLdotH = clamp(dot(pointl, pointh), 0.0, 1.0);
        float pVdotH = clamp(dot(v, pointh), 0.0, 1.0);
        vec3 pdiffuseColor = geometry.color * (1.0 - metalness) * (1.0 - vec3(0.04));
        vec3 pspecularColor = mix(vec3(0.04), geometry.color, metalness);
        float preflectance = max(max(pspecularColor.r, pspecularColor.g), pspecularColor.b);
        vec3 pr90 = vec3(clamp(preflectance * 25.0, 0.0, 1.0));
        vec3 pr0 = pspecularColor.rgb;
        vec3 pF = fresnelSchlick24(pr0, pr90, pVdotH);
        float pG = smithVisibilityGGX4(alpha, pNdotL, pNdotV);
        float pD = GGX4(alpha, pNdotH);
        vec3 pdiffuseContribution = (1.0 - pF) * pdiffuseColor / 3.141592653589793;
        vec3 pspecularContribution = pF * pG * pD / (4.0 * pNdotL * pNdotV);
        newColor = pNdotL * light.color * (pdiffuseContribution + pspecularContribution) * light.intensity;
    }
    return newColor;
}
