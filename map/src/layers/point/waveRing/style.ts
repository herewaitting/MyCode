export interface ILayerStyle {
    imgUrl: string; // 背景图片
    speed: number; // 动画速度
    radius: number; // 扩散半径
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    imgUrl: require("../../../../static/img/space001.jpg"),
    speed: 1,
    radius: 1000,
    brightness: 1,
    condition: [],
};
