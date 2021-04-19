export interface ILayerStyle {
    num: number; // 棱锥棱数，支持任意棱锥
    color: string;
    frameColor: string;
    size: number;
    ratio: number;
    height: number;
    alpha: number;
    speed: number;
    floatHeight: number;
    bloom: boolean;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    num: 4,
    color: "red",
    frameColor: "yellow",
    size: 1,
    ratio: 1,
    height: 0,
    alpha: 0.5,
    speed: 1,
    floatHeight: 10,
    bloom: false,
    brightness: 1,
    condition: [],
};
