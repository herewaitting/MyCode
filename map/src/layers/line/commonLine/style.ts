export interface ILayerStyle {
    color: string;
    lineWidth: number; // 线宽
    // alpha?: number; // 透明度
    height: number;
    brightness: number;
    groundLine: boolean;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    lineWidth: 6,
    height: 0.5,
    brightness: 1,
    groundLine: false,
    condition: [],
};
