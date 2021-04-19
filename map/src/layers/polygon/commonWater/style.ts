export interface ILayerStyle {
    normalMap: string; // 法线贴图
    baseWaterColor: string; // 水面基础颜色
    animationSpeed: number; // 水流速度
    amplitude: number; // 波浪大小
    frequency: number; // 波浪数
    // brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    normalMap: require("../../../../static/img/waterNormals.jpg"),
    baseWaterColor: "blue",
    animationSpeed: 1,
    amplitude: 10,
    frequency: 100,
    // brightness: 1,
    condition: [],
};
