export interface ILayerStyle {
    speed: number; // 动画速度
    imgUrl: string; // 图片路径
    height: number; // 高度
    repeat: number; // 流动重复次数
    bloom: boolean;
    brightness: number;
    minimumHeights: number; // 底部高度
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    speed: 1,
    imgUrl: require("../../../../static/img/circular2.png"),
    height: 100,
    repeat: 10,
    bloom: false,
    brightness: 1,
    minimumHeights: 0,
    condition: [],
};
