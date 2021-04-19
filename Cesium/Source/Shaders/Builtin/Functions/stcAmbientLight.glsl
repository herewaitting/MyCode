vec3 czm_stcAmbientLight(vec3 baseColor) {
    vec3 newColor = baseColor;
    if (czm_extendLightSwitch.x) {
        newColor = baseColor * czm_extendAmbientLightColor * czm_extendAmbientLightBrightness;
    }
    return newColor;
}