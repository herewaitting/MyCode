export interface ILayerStyle {
    colorCard: string; // 色卡图片
    pointSize: number; // 热力点尺寸，像素
    alpha: number; // 热力图透明度
    showNum: number; // 显示比例
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    colorCard: require("../../../../static/img/sedai.png"), // 色卡图片
    pointSize: 10, // 热力点尺寸，像素
    alpha: 1.0, // 热力图透明度
    showNum: 0, // 显示比例
    condition: [],
};
