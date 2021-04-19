export interface ILayerStyle {
    lineWidth: number; // 线宽
    // alpha?: number; // 透明度
    speed: number; // 流动速度
    repeat: number;
    baseColor: string; // 线基础颜色,
    floodColor: string; // 流动颜色
    bloom: boolean; // 泛光
    height: number;
    brightness: number;
    groundLine: boolean;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    lineWidth: 6,
    speed: 1,
    repeat: 1,
    baseColor: "red",
    floodColor: "yellow",
    bloom: false,
    height: 0.5,
    brightness: 1,
    groundLine: false,
    condition: [],
};
