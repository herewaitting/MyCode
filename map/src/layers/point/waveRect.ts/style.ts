export interface ILayerStyle {
    color: string;
    speed: number; // 动画速度
    radius: number;
    bloom: boolean;
    maxScale: number;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    speed: 1.0,
    radius: 200,
    bloom: false,
    brightness: 1,
    maxScale: 2,
    condition: [],
};
