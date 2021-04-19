export interface ILayerStyle {
    lineWidth: number; // 线宽
    speed: number; // 流动速度
    repeat: number;
    imgUrl: string; // 流动颜色
    bloom: boolean;
    brightness: number;
    groundLine: boolean;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    lineWidth: 2,
    speed: 1,
    repeat: 1,
    imgUrl: require("../../../../static/img/arrow0.png"),
    bloom: false,
    brightness: 1,
    groundLine: false,
    condition: [],
};
