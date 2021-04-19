export interface ILayerStyle {
    speed: number; // 动画速度
    radius: number; // 扫描半径
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    // imgUrl: require("../../../../static/img/space001.jpg"),
    speed: 1,
    radius: 1000,
    brightness: 1,
    condition: [],
};
