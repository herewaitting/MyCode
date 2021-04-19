export interface ILayerStyle {
    imgUrl: string; // 图片
    scale: number; // 缩放
    height: number;
    bloom: boolean;
    near: number;
    far: number;
    ratio: number;
    condition: any[];
    floatHeight: number; // 浮动高度
    featuresType: string;
    disableDepthTestDistance: number;
    pixelOffset: string;
    pixelOffsetScaleByDistance: string;
    verticalOrigin: string; // 垂直基线
    horizontalOrigin: string; // 水平基线
    offsetX: number; // 像素偏移值
    offsetY: number;
    animateVideo: string;
    ableAnimate: boolean;
}

export const DefaultStyle: ILayerStyle = {
    imgUrl: require("../../../../static/img/icon-device-wran.png"),
    scale: 1,
    height: 0,
    bloom: false,
    near: 1,
    ratio: 1,
    far: Number.MAX_VALUE,
    condition: [],
    floatHeight: 10,
    featuresType: "none",
    disableDepthTestDistance: Infinity,
    pixelOffset: "",
    pixelOffsetScaleByDistance: "",
    verticalOrigin: "CENTER",
    horizontalOrigin: "CENTER",
    offsetX: 0,
    offsetY: 0,
    animateVideo: "../../../../static_stc/video/ccc.mp4",
    ableAnimate: false,
};
