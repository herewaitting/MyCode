export interface ILayerStyle {
    imgUrl: string; // 图片
    scale: number; // 缩放
    height: number;
    bloom: boolean;
    layerShow: boolean;
    imageCollection: boolean;
    floatHeight: number;
    disableDepthTestDistance: number;
    frameSpace: number;
    condition: any[];
    near: number;
    far: number;
    ratio: number;
    featuresType: string;
    offsetX: number; // 像素偏移值
    offsetY: number;
}

export const DefaultStyle: ILayerStyle = {
    imgUrl: require("../../../../static/img/police.gif"),
    scale: 1,
    height: 0,
    floatHeight: 0,
    bloom: false,
    layerShow: true,
    disableDepthTestDistance: Infinity,
    imageCollection: false,
    frameSpace: 1,
    near: 0,
    ratio: 1,
    far: Infinity,
    condition: [],
    featuresType: "none",
    offsetX: 0,
    offsetY: 0,
};
