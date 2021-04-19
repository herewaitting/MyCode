precision highp float;
uniform vec4 u_baseColorFactor;
uniform float u_metallicFactor;
uniform float u_roughnessFactor;
uniform vec3 u_emissiveFactor;
uniform vec4 floodVar;
uniform vec4 floodColor;
varying vec3 v_normalECSTC;
varying vec3 v_stcVertex;
uniform sampler2D u_styleBmImg;
varying float v_isFlat;
uniform bvec4 IsYaPing;
uniform bvec4 editVar;
varying vec3 v_normal;
varying vec3 v_positionEC;
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
    if (!gl_FrontFacing)
    {
        n = -n;
    }
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
                const float maxDis = 1000.0;
                const float constantAtt = 1.0;
                const float linearAtt = 10.0/maxDis;
                const float quadraticAtt = 3.0 * linearAtt / maxDis; 
                float cosNum = dot(stcDir, stcPotDir);
                vec3 dgyc = vec3(1.0,1.0,1.0);
                float dis = length(stcPot.xyz - v_positionEC);
                float jgdDot = max(dot(cameraToPot, stcPotDir),0.0);
                float sinNum = sqrt(1.0 - jgdDot * jgdDot);
                float disToLine = dis * sinNum;
                float jmfsDot = max(dot(reflectN, vveDir),0.0);
                float att = 1.0/(constantAtt + linearAtt*disToLine + quadraticAtt * disToLine * disToLine);
                vec3 diffuseStc = att * dgyc;
                float mfsDotNum = max(dot(reflectN, v_normalECSTC),0.0);
                vec3 mfsColor = dgyc * mfsDotNum * att;
                vec3 jmfsC = 100.0 * att * dgyc * pow(jmfsDot, 32.0);
                if (disToLine < maxDis) {
                    baseColor = mix((diffuseStc + jmfsC + mfsColor) , baseColor, pow(disToLine/maxDis, 2.0));
                    // baseColor = (diffuseStc + jmfsC + mfsColor) * baseColor;
                    // baseColor = normalize(baseColor);
                    // baseColor = (diffuseStc);
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
    if(IsYaPing[3]){
        float posHeight = v_stcVertex.z;
        if(posHeight<floodVar[1]&&posHeight>=floodVar[0]){
        if(editVar[1]){gl_FragColor.xyz = mix(gl_FragColor.xyz,floodColor.rgb,floodColor.a);return;}
        if(v_isFlat<1.0){return;}
            float r;
            float g;
            float b = 0.0;
            if(length(floodColor.rgb)>0.01){
                r = floodColor.r;
                g = floodColor.g;
                b = floodColor.b;
            }else{
                g = (posHeight - floodVar[0])/floodVar[3];
                r = 1.0 - g;
            }
            gl_FragColor.xyz = mix(gl_FragColor.xyz,vec3(r,g,b),floodColor.a);
        }
    }
}















#extension GL_EXT_draw_buffers : enable 
#extension GL_EXT_frag_depth : enable 
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

#define LOG_DEPTH
#define OES_texture_float_linear

const float czm_epsilon2 = 0.01;

uniform mat4 czm_viewportTransformation;
uniform float czm_log2NearDistance;
uniform float czm_log2FarDistance;
uniform vec3 czm_lightColor;
float czm_getSpecular(vec3 lightDirectionEC, vec3 toEyeEC, vec3 normalEC, float shininess)
{
vec3 toReflectedLight = reflect(-lightDirectionEC, normalEC);
float specular = max(dot(toReflectedLight, toEyeEC), 0.0);
return pow(specular, max(shininess, czm_epsilon2));
}

const float czm_sceneMode3D = 3.0;

uniform float czm_sceneMode;
float czm_getLambertDiffuse(vec3 lightDirectionEC, vec3 normalEC)
{
return max(dot(lightDirectionEC, normalEC), 0.0);
}

struct czm_material
{
vec3 diffuse;
float specular;
float shininess;
vec3 normal;
vec3 emission;
float alpha;
};

struct czm_materialInput
{
float s;
vec2 st;
vec3 str;
vec3 normalEC;
mat3 tangentToEyeMatrix;
vec3 positionToEyeEC;
float height;
float slope;
float aspect;
};

float czm_alphaWeight(float a)
{
float z = (gl_FragCoord.z - czm_viewportTransformation[3][2]) / czm_viewportTransformation[2][2];
return pow(a + 0.01, 4.0) + max(1e-2, min(3.0 * 1e3, 0.003 / (1e-5 + pow(abs(z) / 200.0, 4.0))));
}

#ifdef LOG_DEPTH
varying float v_logZ;
#endif
void czm_writeLogDepth(float logZ)
{
#if defined(GL_EXT_frag_depth) && defined(LOG_DEPTH) && !defined(DISABLE_LOG_DEPTH_FRAGMENT_WRITE)
float halfLogFarDistance = czm_log2FarDistance * 0.5;
float depth = log2(logZ);
if (depth < czm_log2NearDistance) {
discard;
}
gl_FragDepthEXT = depth * halfLogFarDistance;
#endif
}
void czm_writeLogDepth() {
#ifdef LOG_DEPTH
czm_writeLogDepth(v_logZ);
#endif
}

uniform vec3 czm_lightDirectionEC;
vec4 czm_translucentPhong(vec3 toEye, czm_material material, vec3 lightDirectionEC)
{
float diffuse = czm_getLambertDiffuse(vec3(0.0, 0.0, 1.0), material.normal);
if (czm_sceneMode == czm_sceneMode3D) {
diffuse += czm_getLambertDiffuse(vec3(0.0, 1.0, 0.0), material.normal);
}
diffuse = clamp(diffuse, 0.0, 1.0);
float specular = czm_getSpecular(lightDirectionEC, toEye, material.normal, material.shininess);
vec3 materialDiffuse = material.diffuse * 0.5;
vec3 ambient = materialDiffuse;
vec3 color = ambient + material.emission;
color += materialDiffuse * diffuse * czm_lightColor;
color += material.specular * specular * czm_lightColor;
return vec4(color, material.alpha);
}

mat3 czm_tangentToEyeSpaceMatrix(vec3 normalEC, vec3 tangentEC, vec3 bitangentEC)
{
vec3 normal = normalize(normalEC);
vec3 tangent = normalize(tangentEC);
vec3 bitangent = normalize(bitangentEC);
return mat3(tangent.x  , tangent.y  , tangent.z,
bitangent.x, bitangent.y, bitangent.z,
normal.x   , normal.y   , normal.z);
}

uniform vec4 czm_viewport;
vec4 czm_getWaterNoise(sampler2D normalMap, vec2 uv, float time, float angleInRadians)
{
float cosAngle = cos(angleInRadians);
float sinAngle = sin(angleInRadians);
vec2 s0 = vec2(1.0/17.0, 0.0);
vec2 s1 = vec2(-1.0/29.0, 0.0);
vec2 s2 = vec2(1.0/101.0, 1.0/59.0);
vec2 s3 = vec2(-1.0/109.0, -1.0/57.0);
s0 = vec2((cosAngle * s0.x) - (sinAngle * s0.y), (sinAngle * s0.x) + (cosAngle * s0.y));
s1 = vec2((cosAngle * s1.x) - (sinAngle * s1.y), (sinAngle * s1.x) + (cosAngle * s1.y));
s2 = vec2((cosAngle * s2.x) - (sinAngle * s2.y), (sinAngle * s2.x) + (cosAngle * s2.y));
s3 = vec2((cosAngle * s3.x) - (sinAngle * s3.y), (sinAngle * s3.x) + (cosAngle * s3.y));
vec2 uv0 = (uv/103.0) + (time * s0);
vec2 uv1 = uv/107.0 + (time * s1) + vec2(0.23);
vec2 uv2 = uv/vec2(897.0, 983.0) + (time * s2) + vec2(0.51);
vec2 uv3 = uv/vec2(991.0, 877.0) + (time * s3) + vec2(0.71);
uv0 = fract(uv0);
uv1 = fract(uv1);
uv2 = fract(uv2);
uv3 = fract(uv3);
vec4 noise = (texture2D(normalMap, uv0)) +
(texture2D(normalMap, uv1)) +
(texture2D(normalMap, uv2)) +
(texture2D(normalMap, uv3));
return ((noise / 4.0) - 0.5) * 2.0;
}

uniform float czm_frameNumber;
czm_material czm_getDefaultMaterial(czm_materialInput materialInput)
{
czm_material material;
material.diffuse = vec3(0.0);
material.specular = 0.0;
material.shininess = 1.0;
material.normal = materialInput.normalEC;
material.emission = vec3(0.0);
material.alpha = 1.0;
return material;
}



#line 0

#line 0

vec4 czm_gl_FragColor;
bool czm_discard = false;

#line 0
varying vec4 v_pickColor;
#define FACE_FORWARD
uniform float height_6;uniform float width_5;
uniform sampler2D specularMap_0;
uniform sampler2D normalMap_1;
uniform vec4 baseWaterColor_7;
uniform vec4 blendColor_8;
uniform float frequency_2;
uniform float animationSpeed_3;
uniform float amplitude_4;
uniform float specularIntensity_9;
uniform float fadeFactor_10;
uniform vec4 sizeAndVelocity_11;

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    float width_5 = sizeAndVelocity_11.x;
    float height_6 = sizeAndVelocity_11.y;
    float vx = sizeAndVelocity_11.z;
    float vy = sizeAndVelocity_11.w;
    czm_material material = czm_getDefaultMaterial(materialInput);

    float time = czm_frameNumber * animationSpeed_3;

    
    float fade = max(1.0, (length(materialInput.positionToEyeEC) / 10000000000.0) * frequency_2 * fadeFactor_10);

    
    vec2 st = materialInput.st * vec2(width_5, height_6) / 100.0 * frequency_2;
    st -= vec2(vx*time, vy*time);
    vec4 noise = czm_getWaterNoise(normalMap_1, st, time, 0.0);
    vec3 normalTangentSpace = noise.xyz * vec3(1.0, 1.0, (1.0 / amplitude_4));

    
    normalTangentSpace.xy /= fade;
    normalTangentSpace = normalize(normalTangentSpace);

    
    float tsPerturbationRatio = clamp(dot(normalTangentSpace, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);

    
    
    vec2 v = gl_FragCoord.xy / czm_viewport.zw;
    v.y = 1.0 - v.y;
    material.diffuse = texture2D(specularMap_0, v + noise.xy*0.03).rgb;

    
    material.diffuse += (0.1 * tsPerturbationRatio);

    material.diffuse = mix(baseWaterColor_7.rgb, material.diffuse, blendColor_8.rgb);
    material.normal = normalize(materialInput.tangentToEyeMatrix * normalTangentSpace);

    material.specular = specularIntensity_9;
    material.shininess = 10.0;
    material.alpha = baseWaterColor_7.a * blendColor_8.a;

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
czm_material material = czm_getMaterial(materialInput);
#ifdef FLAT
czm_gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
#else
czm_gl_FragColor = czm_translucentPhong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
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
    if (czm_discard)
    {
        discard;
    }
    vec3 Ci = czm_gl_FragColor.rgb * czm_gl_FragColor.a;
    float ai = czm_gl_FragColor.a;
    float wzi = czm_alphaWeight(ai);
    gl_FragData[0] = vec4(Ci * wzi, ai);
    gl_FragData[1] = vec4(ai * wzi);
}









