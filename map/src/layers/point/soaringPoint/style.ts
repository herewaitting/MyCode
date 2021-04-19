
export interface ILayerStyle {
    color: string; // 颜色
    imgUrl: string;
    speed: number; // 动画速度
    height: number; // 高度
    lineWidth: number; // 线宽
    bloom: boolean;
    brightness: number;
    randomHeight: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    imgUrl: require("../../../../static/img/shuliuguang.png"),
    speed: 1,
    height: 200,
    lineWidth: 6,
    bloom: false,
    brightness: 1,
    randomHeight: 0,
    condition: [],
};
