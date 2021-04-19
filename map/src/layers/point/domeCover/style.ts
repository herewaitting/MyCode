export interface ILayerStyle {
    color: string;
    speed: number; // 动画速度
    radius: number;
    bloom: boolean;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    bloom: false,
    speed: 1, // 动画速度
    radius: 100,
    brightness: 1,
    condition: [],
};
