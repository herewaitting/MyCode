
export interface ILayerStyle {
    curvature: number; // 弯度
    clutchDistance: number; // 左右偏离距离
    color: string;
    imgUrl: string;
    speed: number;
    bloom: boolean;
    splitNum: number;
    lineWidth: number;
    repeat: number;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    curvature: 1.0,
    clutchDistance: 100,
    color: "red",
    imgUrl: require("../../../../static/img/arrow3.png"),
    speed: 10,
    bloom: false,
    splitNum: 50,
    lineWidth: 6,
    repeat: 20,
    brightness: 1,
    condition: [],
};
