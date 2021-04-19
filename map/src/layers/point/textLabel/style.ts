export interface ILayerStyle {
    fontSize: number;
    fontType: string;
    fillColor: string;
    scale: number;
    height: number;
    backgroundColor: string;
    showBackground: boolean; // 是否展示背景框
    bgPX: number; // 背景框内边距
    bgPY: number;
    offsetX: number; // 像素偏移值
    offsetY: number;
    near: number;
    far: number;
    ratio: number;
    disableDepthTestDistance: number;
    condition: any[];
    verticalOrigin: string; // 垂直基线
    horizontalOrigin: string; // 水平基线
    fieldKey: string;
}

export const DefaultStyle: ILayerStyle = {
    fontSize: 10,
    fontType: "sans-serif",
    fillColor: "red",
    scale: 1,
    height: 0,
    showBackground: false,
    backgroundColor: "black",
    bgPX: 3,
    bgPY: 5,
    offsetX: 0,
    offsetY: 0,
    near: 0,
    ratio: 1,
    far: Infinity,
    disableDepthTestDistance: Infinity,
    condition: [],
    verticalOrigin: "CENTER",
    horizontalOrigin: "CENTER",
    fieldKey: "text",
};
