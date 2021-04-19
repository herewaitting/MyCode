
export interface ILayerStyle {
    color: string;
    speed: number; // 动画时长
    imgUrl: string; // 扩散圈数
    radius: number;
    bloom: boolean;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    speed: 1,
    imgUrl: require("../../../../static/img/magicCircle.png"),
    radius: 20,
    bloom: false,
    brightness: 1,
    condition: [],
};
