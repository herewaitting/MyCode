export interface ILayerStyle {
    color: string; // 网格颜色
    width: number; // 宽度高度
    longitude: number;
    latitude: number;
    condition: any[];
    lineCount: number; // 网格数量
    cellAlpha: number; // 网格透明度
    mirrorDefinition: number; // 倒影清晰度
}

export const DefaultStyle: ILayerStyle = {
    color: "#333333",
    width: 1000,
    longitude: 120,
    latitude: 30,
    condition: [],
    lineCount: 20,
    cellAlpha: 0.5,
    mirrorDefinition: 1.0,
};
