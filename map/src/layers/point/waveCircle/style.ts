export interface ILayerStyle {
    color: string;
    speed: number; // 动画时长
    count: number; // 扩散圈数
    gradient: number; // 渐变系数
    radius: number;
    bloom: boolean;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    speed: 1, // 动画时长
    count: 3, // 扩散圈数
    gradient: 5, // 渐变系数
    radius: 50,
    bloom: false,
    brightness: 1,
    condition: [],
};
