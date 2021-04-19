export interface ILayerStyle {
    lineWidth: number; // 线宽
    // alpha?: number; // 透明度
    speed: number; // 流动速度
    repeat: number;
    baseColor: string; // 线基础颜色,
    floodColor: string; // 流动颜色
    bloom: boolean; // 泛光
    curvature: number; // 弯度
    brightness: number;
    splitNum: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    lineWidth: 2,
    speed: 1,
    repeat: 1,
    baseColor: "red",
    floodColor: "yellow",
    bloom: false,
    curvature: 1,
    brightness: 1,
    splitNum: 30,
    condition: [],
};
