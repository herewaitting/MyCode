uniform vec3 czm_encodedCameraPositionMCLow;
uniform vec3 czm_encodedCameraPositionMCHigh;
varying highp float v_logZ;
uniform mat4 czm_modelViewProjectionRelativeToEye;
uniform mat3 czm_normal;
uniform mat4 czm_modelViewRelativeToEye;
attribute vec3 compressedAttributes;
attribute vec3 position3DHigh;
attribute vec3 position3DLow;
attribute float batchId;
varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec3 v_tangentEC;
varying vec3 v_bitangentEC;
varying vec2 v_st;
uniform sampler2D batchTexture;
uniform vec4 batchTextureStep;
varying lowp vec4 v_pickColor;
void main ()
{
  float tmpvar_1;
  tmpvar_1 = floor((compressedAttributes.x / 4096.0));
  vec2 tmpvar_2;
  tmpvar_2.x = (tmpvar_1 / 4095.0);
  tmpvar_2.y = ((compressedAttributes.x - (tmpvar_1 * 4096.0)) / 4095.0);
  float encodedFloat2_3;
  float temp_4;
  float tmpvar_5;
  tmpvar_5 = (compressedAttributes.y / 65536.0);
  float tmpvar_6;
  tmpvar_6 = floor(tmpvar_5);
  temp_4 = (compressedAttributes.z / 65536.0);
  float tmpvar_7;
  tmpvar_7 = floor(temp_4);
  encodedFloat2_3 = ((temp_4 - tmpvar_7) * 65536.0);
  float tmpvar_8;
  tmpvar_8 = (((tmpvar_5 - tmpvar_6) * 65536.0) / 256.0);
  float tmpvar_9;
  tmpvar_9 = floor(tmpvar_8);
  vec2 tmpvar_10;
  tmpvar_10.x = tmpvar_9;
  tmpvar_10.y = ((tmpvar_8 - tmpvar_9) * 256.0);
  vec2 encoded_11;
  encoded_11 = tmpvar_10;
  vec3 tmpvar_12;
  vec3 v_13;
  if (((tmpvar_9 == 0.0) && (tmpvar_10.y == 0.0))) {
    tmpvar_12 = vec3(0.0, 0.0, 0.0);
  } else {
    encoded_11 = (((tmpvar_10 / 255.0) * 2.0) - 1.0);
    vec3 tmpvar_14;
    tmpvar_14.xy = encoded_11;
    tmpvar_14.z = ((1.0 - abs(encoded_11.x)) - abs(encoded_11.y));
    v_13 = tmpvar_14;
    if ((tmpvar_14.z < 0.0)) {
      vec2 tmpvar_15;
      tmpvar_15 = abs(encoded_11.yx);
      float tmpvar_16;
      if ((encoded_11.x >= 0.0)) {
        tmpvar_16 = 1.0;
      } else {
        tmpvar_16 = -1.0;
      };
      float tmpvar_17;
      if ((encoded_11.y >= 0.0)) {
        tmpvar_17 = 1.0;
      } else {
        tmpvar_17 = -1.0;
      };
      vec2 tmpvar_18;
      tmpvar_18.x = tmpvar_16;
      tmpvar_18.y = tmpvar_17;
      v_13.xy = ((1.0 - tmpvar_15) * tmpvar_18);
    };
    tmpvar_12 = normalize(v_13);
  };
  float tmpvar_19;
  tmpvar_19 = (encodedFloat2_3 / 256.0);
  float tmpvar_20;
  tmpvar_20 = floor(tmpvar_19);
  vec2 tmpvar_21;
  tmpvar_21.x = tmpvar_20;
  tmpvar_21.y = ((tmpvar_19 - tmpvar_20) * 256.0);
  vec2 encoded_22;
  encoded_22 = tmpvar_21;
  vec3 tmpvar_23;
  vec3 v_24;
  if (((tmpvar_20 == 0.0) && (tmpvar_21.y == 0.0))) {
    tmpvar_23 = vec3(0.0, 0.0, 0.0);
  } else {
    encoded_22 = (((tmpvar_21 / 255.0) * 2.0) - 1.0);
    vec3 tmpvar_25;
    tmpvar_25.xy = encoded_22;
    tmpvar_25.z = ((1.0 - abs(encoded_22.x)) - abs(encoded_22.y));
    v_24 = tmpvar_25;
    if ((tmpvar_25.z < 0.0)) {
      vec2 tmpvar_26;
      tmpvar_26 = abs(encoded_22.yx);
      float tmpvar_27;
      if ((encoded_22.x >= 0.0)) {
        tmpvar_27 = 1.0;
      } else {
        tmpvar_27 = -1.0;
      };
      float tmpvar_28;
      if ((encoded_22.y >= 0.0)) {
        tmpvar_28 = 1.0;
      } else {
        tmpvar_28 = -1.0;
      };
      vec2 tmpvar_29;
      tmpvar_29.x = tmpvar_27;
      tmpvar_29.y = tmpvar_28;
      v_24.xy = ((1.0 - tmpvar_26) * tmpvar_29);
    };
    tmpvar_23 = normalize(v_24);
  };
  vec2 tmpvar_30;
  tmpvar_30.x = tmpvar_6;
  tmpvar_30.y = tmpvar_7;
  vec2 encoded_31;
  encoded_31 = tmpvar_30;
  vec3 tmpvar_32;
  vec3 v_33;
  if (((tmpvar_6 == 0.0) && (tmpvar_7 == 0.0))) {
    tmpvar_32 = vec3(0.0, 0.0, 0.0);
  } else {
    encoded_31 = (((tmpvar_30 / 255.0) * 2.0) - 1.0);
    vec3 tmpvar_34;
    tmpvar_34.xy = encoded_31;
    tmpvar_34.z = ((1.0 - abs(encoded_31.x)) - abs(encoded_31.y));
    v_33 = tmpvar_34;
    if ((tmpvar_34.z < 0.0)) {
      vec2 tmpvar_35;
      tmpvar_35 = abs(encoded_31.yx);
      float tmpvar_36;
      if ((encoded_31.x >= 0.0)) {
        tmpvar_36 = 1.0;
      } else {
        tmpvar_36 = -1.0;
      };
      float tmpvar_37;
      if ((encoded_31.y >= 0.0)) {
        tmpvar_37 = 1.0;
      } else {
        tmpvar_37 = -1.0;
      };
      vec2 tmpvar_38;
      tmpvar_38.x = tmpvar_36;
      tmpvar_38.y = tmpvar_37;
      v_33.xy = ((1.0 - tmpvar_35) * tmpvar_38);
    };
    tmpvar_32 = normalize(v_33);
  };
  vec4 tmpvar_39;
  tmpvar_39.w = 1.0;
  tmpvar_39.xyz = ((position3DHigh - czm_encodedCameraPositionMCHigh) + (position3DLow - czm_encodedCameraPositionMCLow));
  v_positionEC = (czm_modelViewRelativeToEye * tmpvar_39).xyz;
  v_normalEC = (czm_normal * tmpvar_12);
  v_tangentEC = (czm_normal * tmpvar_23);
  v_bitangentEC = (czm_normal * tmpvar_32);
  v_st = tmpvar_2;
  gl_Position = (czm_modelViewProjectionRelativeToEye * tmpvar_39);
  vec2 tmpvar_40;
  tmpvar_40.y = 0.5;
  tmpvar_40.x = (batchTextureStep.y + (batchId * batchTextureStep.x));
  v_pickColor = texture2D (batchTexture, tmpvar_40);
  v_logZ = (1.0 + gl_Position.w);
  gl_Position.z = 0.0;
}


































precision highp float;
uniform vec4 u_baseColorFactor;
uniform float u_metallicFactor;
uniform float u_roughnessFactor;
uniform vec3 u_emissiveFactor;
varying vec3 v_normalECSTC;
varying vec3 v_stcVertex;
uniform sampler2D u_styleBmImg;
varying vec3 v_normal;
varying vec3 v_positionEC;
varying vec2 v_texcoord_0;
const float M_PI = 3.141592653589793;
vec3 lambertianDiffuse(vec3 diffuseColor) 
{
    return diffuseColor / M_PI;
}

vec3 fresnelSchlick2(vec3 f0, vec3 f90, float VdotH) 
{
    return f0 + (f90 - f0) * pow(clamp(1.0 - VdotH, 0.0, 1.0), 5.0);
}

vec3 fresnelSchlick(float metalness, float VdotH) 
{
    return metalness + (vec3(1.0) - metalness) * pow(1.0 - VdotH, 5.0);
}

float smithVisibilityG1(float NdotV, float roughness) 
{
    float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
}

float smithVisibilityGGX(float roughness, float NdotL, float NdotV) 
{
    return smithVisibilityG1(NdotL, roughness) * smithVisibilityG1(NdotV, roughness);
}

float GGX(float roughness, float NdotH) 
{
    float roughnessSquared = roughness * roughness;
    float f = (NdotH * roughnessSquared - NdotH) * NdotH + 1.0;
    return roughnessSquared / (M_PI * f * f);
}

vec3 SRGBtoLINEAR3(vec3 srgbIn) 
{
    return pow(srgbIn, vec3(2.2));
}

vec4 SRGBtoLINEAR4(vec4 srgbIn) 
{
    vec3 linearOut = pow(srgbIn.rgb, vec3(2.2));
    return vec4(linearOut, srgbIn.a);
}

vec3 applyTonemapping(vec3 linearIn) 
{
#ifndef HDR 
    return czm_acesTonemapping(linearIn);
#else 
    return linearIn;
#endif 
}

vec3 LINEARtoSRGB(vec3 linearIn) 
{
#ifndef HDR 
    return pow(linearIn, vec3(1.0/2.2));
#else 
    return linearIn;
#endif 
}

vec2 computeTexCoord(vec2 texCoords, vec2 offset, float rotation, vec2 scale) 
{
    rotation = -rotation; 
    mat3 transform = mat3(
        cos(rotation) * scale.x, sin(rotation) * scale.x, 0.0, 
       -sin(rotation) * scale.y, cos(rotation) * scale.y, 0.0, 
        offset.x, offset.y, 1.0); 
    vec2 transformedTexCoords = (transform * vec3(fract(texCoords), 1.0)).xy; 
    return transformedTexCoords; 
}

#ifdef USE_IBL_LIGHTING 
uniform vec2 gltf_iblFactor; 
#endif 
#ifdef USE_CUSTOM_LIGHT_COLOR 
uniform vec3 gltf_lightColor; 
#endif 
void main(void) 
{
    vec3 ng = normalize(v_normal);
    vec3 positionWC = vec3(czm_inverseView * vec4(v_positionEC, 1.0));
    vec3 n = ng;
    vec4 baseColorWithAlpha = u_baseColorFactor;
    vec3 baseColor = baseColorWithAlpha.rgb;

            vec4 stcPot = czm_view * vec4(czm_pointLightPosWC, 1.0);
            stcPot = stcPot / stcPot.w;
            vec3 stcPotDir = czm_viewRotation * -normalize(czm_pointLightPosWC);
            stcPotDir = normalize(stcPotDir);
            vec3 cameraToPot = normalize(v_positionEC.xyz - stcPot.xyz);
            vec3 stcDir = stcPot.xyz - v_positionEC;
            stcDir = normalize(stcDir);
            float nDotSTC = max(dot(stcDir,v_normalECSTC), 0.0);
            vec3 reflectN = normalize(reflect(-stcDir, v_normalECSTC));
            vec3 vveDir = -normalize(v_positionEC);
            const float maxDis = 10000.0;
            const float constantAtt = 1.0;
            const float linearAtt = 1.0/maxDis;
            const float quadraticAtt = 5.0/maxDis/maxDis; 
            float cosNum = dot(stcDir, stcPotDir);
            vec3 dgyc = vec3(1.0,0.0,1.0);
            float dis = length(stcPot.xyz - v_positionEC);
            float jmfsDot = max(dot(reflectN, vveDir),0.0);
            float att = 1.0/(constantAtt + linearAtt*dis + quadraticAtt * dis * dis);
            vec3 diffuseStc = att * dgyc;
            vec3 jmfsC = 100.0 * att * dgyc * pow(jmfsDot, 32.0);
            float jgdDot = max(dot(cameraToPot, stcPotDir),0.0);
            float sinNum = sqrt(1.0 - jgdDot * jgdDot);
            float disToLine = dis * sinNum;
            if (disToLine < maxDis) {
                baseColor = mix((diffuseStc + jmfsC) , baseColor, pow( disToLine/maxDis, 2.0));
                baseColor = normalize(baseColor);
            }
            float metalness = clamp(u_metallicFactor, 0.0, 1.0);
    float roughness = clamp(u_roughnessFactor, 0.04, 1.0);
    vec3 v = -normalize(v_positionEC);
#ifndef USE_CUSTOM_LIGHT_COLOR 
    vec3 lightColor = vec3(1.5, 1.4, 1.2);
#else 
    vec3 lightColor = gltf_lightColor;
#endif 
    vec3 l = normalize(czm_sunDirectionEC);
    vec3 h = normalize(v + l);
    float NdotL = clamp(dot(n, l), 0.001, 1.0);
    float NdotV = abs(dot(n, v)) + 0.001;
    float NdotH = clamp(dot(n, h), 0.0, 1.0);
    float LdotH = clamp(dot(l, h), 0.0, 1.0);
    float VdotH = clamp(dot(v, h), 0.0, 1.0);
    vec3 f0 = vec3(0.04);
    vec3 diffuseColor = baseColor * (1.0 - metalness) * (1.0 - f0);
    vec3 specularColor = mix(f0, baseColor, metalness);
    float alpha = roughness * roughness;
    float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);
    vec3 r90 = vec3(clamp(reflectance * 25.0, 0.0, 1.0));
    vec3 r0 = specularColor.rgb;
    vec3 F = fresnelSchlick2(r0, r90, VdotH);
    float G = smithVisibilityGGX(alpha, NdotL, NdotV);
    float D = GGX(alpha, NdotH);
    vec3 diffuseContribution = (1.0 - F) * lambertianDiffuse(diffuseColor);
    vec3 specularContribution = F * G * D / (4.0 * NdotL * NdotV);
    vec3 color = NdotL * lightColor * (diffuseContribution + specularContribution);
#if defined(USE_IBL_LIGHTING) && !defined(DIFFUSE_IBL) && !defined(SPECULAR_IBL) 
    vec3 r = normalize(czm_inverseViewRotation * normalize(reflect(v, n)));
    float vertexRadius = length(positionWC);
    float horizonDotNadir = 1.0 - min(1.0, czm_ellipsoidRadii.x / vertexRadius);
    float reflectionDotNadir = dot(r, normalize(positionWC));
    r.x = -r.x;
    r = -normalize(czm_temeToPseudoFixed * r);
    r.x = -r.x;
    float inverseRoughness = 1.04 - roughness;
    inverseRoughness *= inverseRoughness;
    vec3 sceneSkyBox = textureCube(czm_environmentMap, r).rgb * inverseRoughness;
    float atmosphereHeight = 0.05;
    float blendRegionSize = 0.1 * ((1.0 - inverseRoughness) * 8.0 + 1.1 - horizonDotNadir);
    float blendRegionOffset = roughness * -1.0;
    float farAboveHorizon = clamp(horizonDotNadir - blendRegionSize * 0.5 + blendRegionOffset, 1.0e-10 - blendRegionSize, 0.99999);
    float aroundHorizon = clamp(horizonDotNadir + blendRegionSize * 0.5, 1.0e-10 - blendRegionSize, 0.99999);
    float farBelowHorizon = clamp(horizonDotNadir + blendRegionSize * 1.5, 1.0e-10 - blendRegionSize, 0.99999);
    float smoothstepHeight = smoothstep(0.0, atmosphereHeight, horizonDotNadir);
    vec3 belowHorizonColor = mix(vec3(0.1, 0.15, 0.25), vec3(0.4, 0.7, 0.9), smoothstepHeight);
    vec3 nadirColor = belowHorizonColor * 0.5;
    vec3 aboveHorizonColor = mix(vec3(0.9, 1.0, 1.2), belowHorizonColor, roughness * 0.5);
    vec3 blueSkyColor = mix(vec3(0.18, 0.26, 0.48), aboveHorizonColor, reflectionDotNadir * inverseRoughness * 0.5 + 0.75);
    vec3 zenithColor = mix(blueSkyColor, sceneSkyBox, smoothstepHeight);
    vec3 blueSkyDiffuseColor = vec3(0.7, 0.85, 0.9);
    float diffuseIrradianceFromEarth = (1.0 - horizonDotNadir) * (reflectionDotNadir * 0.25 + 0.75) * smoothstepHeight;
    float diffuseIrradianceFromSky = (1.0 - smoothstepHeight) * (1.0 - (reflectionDotNadir * 0.25 + 0.25));
    vec3 diffuseIrradiance = blueSkyDiffuseColor * clamp(diffuseIrradianceFromEarth + diffuseIrradianceFromSky, 0.0, 1.0);
    float notDistantRough = (1.0 - horizonDotNadir * roughness * 0.8);
    vec3 specularIrradiance = mix(zenithColor, aboveHorizonColor, smoothstep(farAboveHorizon, aroundHorizon, reflectionDotNadir) * notDistantRough);
    specularIrradiance = mix(specularIrradiance, belowHorizonColor, smoothstep(aroundHorizon, farBelowHorizon, reflectionDotNadir) * inverseRoughness);
    specularIrradiance = mix(specularIrradiance, nadirColor, smoothstep(farBelowHorizon, 1.0, reflectionDotNadir) * inverseRoughness);
#ifdef USE_SUN_LUMINANCE 
    float LdotZenith = clamp(dot(normalize(czm_inverseViewRotation * l), normalize(positionWC * -1.0)), 0.001, 1.0);
    float S = acos(LdotZenith);
    float NdotZenith = clamp(dot(normalize(czm_inverseViewRotation * n), normalize(positionWC * -1.0)), 0.001, 1.0);
    float gamma = acos(NdotL);
    float numerator = ((0.91 + 10.0 * exp(-3.0 * gamma) + 0.45 * pow(NdotL, 2.0)) * (1.0 - exp(-0.32 / NdotZenith)));
    float denominator = (0.91 + 10.0 * exp(-3.0 * S) + 0.45 * pow(LdotZenith,2.0)) * (1.0 - exp(-0.32));
    float luminance = gltf_luminanceAtZenith * (numerator / denominator);
#endif 
    vec2 brdfLut = texture2D(czm_brdfLut, vec2(NdotV, roughness)).rg;
    vec3 IBLColor = (diffuseIrradiance * diffuseColor * gltf_iblFactor.x) + (specularIrradiance * SRGBtoLINEAR3(specularColor * brdfLut.x + brdfLut.y) * gltf_iblFactor.y);
#ifdef USE_SUN_LUMINANCE 
    color += IBLColor * luminance;
#else 
    color += IBLColor; 
#endif 
#elif defined(DIFFUSE_IBL) || defined(SPECULAR_IBL) 
    mat3 fixedToENU = mat3(gltf_clippingPlanesMatrix[0][0], gltf_clippingPlanesMatrix[1][0], gltf_clippingPlanesMatrix[2][0], 
                           gltf_clippingPlanesMatrix[0][1], gltf_clippingPlanesMatrix[1][1], gltf_clippingPlanesMatrix[2][1], 
                           gltf_clippingPlanesMatrix[0][2], gltf_clippingPlanesMatrix[1][2], gltf_clippingPlanesMatrix[2][2]); 
    const mat3 yUpToZUp = mat3(-1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0); 
    vec3 cubeDir = normalize(yUpToZUp * fixedToENU * normalize(reflect(-v, n))); 
#ifdef DIFFUSE_IBL 
#ifdef CUSTOM_SPHERICAL_HARMONICS 
    vec3 diffuseIrradiance = czm_sphericalHarmonics(cubeDir, gltf_sphericalHarmonicCoefficients); 
#else 
    vec3 diffuseIrradiance = czm_sphericalHarmonics(cubeDir, czm_sphericalHarmonicCoefficients); 
#endif 
#else 
    vec3 diffuseIrradiance = vec3(0.0); 
#endif 
#ifdef SPECULAR_IBL 
    vec2 brdfLut = texture2D(czm_brdfLut, vec2(NdotV, roughness)).rg;
#ifdef CUSTOM_SPECULAR_IBL 
    vec3 specularIBL = czm_sampleOctahedralProjection(gltf_specularMap, gltf_specularMapSize, cubeDir,  roughness * gltf_maxSpecularLOD, gltf_maxSpecularLOD);
#else 
    vec3 specularIBL = czm_sampleOctahedralProjection(czm_specularEnvironmentMaps, czm_specularEnvironmentMapSize, cubeDir,  roughness * czm_specularEnvironmentMapsMaximumLOD, czm_specularEnvironmentMapsMaximumLOD);
#endif 
    specularIBL *= F * brdfLut.x + brdfLut.y;
#else 
    vec3 specularIBL = vec3(0.0); 
#endif 
    color += diffuseIrradiance * diffuseColor + specularColor * specularIBL;
#endif 
    color += u_emissiveFactor;
    color = applyTonemapping(color);
    color = LINEARtoSRGB(color);
    gl_FragColor = vec4(color, 1.0);
}
}
