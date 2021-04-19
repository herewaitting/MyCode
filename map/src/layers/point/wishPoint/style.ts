
export interface ILayerStyle {
    baseColor: string; // 颜色
    floodColor: string;
    speed: number; // 动画速度
    height: number; // 高度
    lineWidth: number; // 线宽
    bloom: boolean;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    baseColor: "red",
    floodColor: "yellow",
    speed: 1,
    height: 200,
    lineWidth: 6,
    bloom: false,
    brightness: 1,
    condition: [],
};
