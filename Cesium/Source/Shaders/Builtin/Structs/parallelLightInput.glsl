/**\n\
 *\n\
 * @name czm_parallelLightInput\n\  平行光输入
 * @glslStruct\n\
 *\n\
 * @property {vec3} color 光颜色.\n\
 * @property {float} intensity 光强度.\n\
 * @property {float} dis 光有效距离.\n\
 * @property {bool} enable 是否激活.\n\
 * @property {vec3} direction 方向， 视角空间下.\n\
 */
struct czm_parallelLightInput
{
    vec3 color;
    float intensity;
    // float dis;
    bool enable;
    vec3 direction;
};