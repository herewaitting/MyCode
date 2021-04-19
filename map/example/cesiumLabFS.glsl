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
}
;
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
    }
;
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














































// Thanks for the contribution Jonas\n\
// http://29a.ch/2012/7/19/webgl-terrain-rendering-water-fog\n\
\n\
uniform sampler2D specularMap;\n\
uniform sampler2D normalMap;\n\
uniform vec4 baseWaterColor;\n\
uniform vec4 blendColor;\n\
uniform float frequency;\n\
uniform float animationSpeed;\n\
uniform float amplitude;\n\
uniform float specularIntensity;\n\
uniform float fadeFactor;\n\
\n\
czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
\n\
    float time = czm_frameNumber * animationSpeed;\n\
\n\
    // fade is a function of the distance from the fragment and the frequency of the waves\n\
    float fade = max(1.0, (length(materialInput.positionToEyeEC) / 10000000000.0) * frequency * fadeFactor);\n\
\n\
    float specularMapValue = texture2D(specularMap, materialInput.st).r;\n\
\n\
    // note: not using directional motion at this time, just set the angle to 0.0;\n\
    vec4 noise = czm_getWaterNoise(normalMap, materialInput.st * frequency, time, 0.0);\n\
    vec3 normalTangentSpace = noise.xyz * vec3(1.0, 1.0, (1.0 / amplitude));\n\
\n\
    // fade out the normal perturbation as we move further from the water surface\n\
    normalTangentSpace.xy /= fade;\n\
\n\
    // attempt to fade out the normal perturbation as we approach non water areas (low specular map value)\n\
    normalTangentSpace = mix(vec3(0.0, 0.0, 50.0), normalTangentSpace, specularMapValue);\n\
\n\
    normalTangentSpace = normalize(normalTangentSpace);\n\
\n\
    // get ratios for alignment of the new normal vector with a vector perpendicular to the tangent plane\n\
    float tsPerturbationRatio = clamp(dot(normalTangentSpace, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);\n\
\n\
    // fade out water effect as specular map value decreases\n\
    material.alpha = specularMapValue;\n\
\n\
    // base color is a blend of the water and non-water color based on the value from the specular map\n\
    // may need a uniform blend factor to better control this\n\
    material.diffuse = mix(blendColor.rgb, baseWaterColor.rgb, specularMapValue);\n\
\n\
    // diffuse highlights are based on how perturbed the normal is\n\
    material.diffuse += (0.1 * tsPerturbationRatio);\n\
\n\
    material.diffuse = material.diffuse;\n\
\n\
    material.normal = normalize(materialInput.tangentToEyeMatrix * normalTangentSpace);\n\
\n\
    material.specular = specularIntensity;\n\
    material.shininess = 10.0;\n\
\n\
    return material;\n\
}\n\