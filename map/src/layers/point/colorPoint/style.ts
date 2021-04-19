export interface ILayerStyle {
    color: string; // 颜色
    pixelSize: number; // 像素大小
    bloom: boolean;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    pixelSize: 6,
    bloom: false,
    condition: [],
};
