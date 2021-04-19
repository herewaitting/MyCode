export interface ILayerStyle {
    color: string; // 颜色
    radius: number; // 光柱底部半径
    baseRadiusScale: number; // 光柱底盘半径比例
    ratio: number; // 光柱高宽比例
    speed: number; // 动画速度
    imgUrl: string; // 光柱底盘背景图
    bloom: boolean;
    particleImg: string;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    radius: 10,
    baseRadiusScale: 2,
    ratio: 30,
    speed: 1,
    imgUrl: require("../../../../static/img/beam.png"),
    particleImg: require("../../../../static/img/particles.png"),
    bloom: false,
    brightness: 1,
    condition: [],
};
