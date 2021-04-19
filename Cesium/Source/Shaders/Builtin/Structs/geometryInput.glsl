/**\n\
 *\n\
 * @name czm_geometryInput\n\
 * @glslStruct\n\
 *\n\
 * @property {vec3} color 基础颜色.\n\
 * @property {vec3} normal 视角空间下的法线.\n\
 * @property {float} metalness 反射强度，金属度.\n\
 * @property {float} roughness 粗糙度.\n\
 */
struct czm_geometryInput
{
    vec3 normal;
    vec3 color;
    float metalness;
    float roughness;
};
