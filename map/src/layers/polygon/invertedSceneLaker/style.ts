export interface ILayerStyle {
    color: string;
    normalMap: string;
    animationSpeed: number;
    efinition: number;
    skyImg: string;
    alpha: number;
}

export const DefaultStyle: ILayerStyle = {
    color: "rgba(1,81,117,1)", // 颜色
    skyImg: require("../../../../static/img/sky.jpg"), // 天空贴图
    normalMap: require("../../../../static/img/waterNormals.jpg"),
    animationSpeed: 5,
    efinition: 0.5,
    alpha: 0.5,
};