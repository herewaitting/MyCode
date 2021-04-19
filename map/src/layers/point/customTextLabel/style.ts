export interface ILayerStyle {
    width: number; // canvas宽度
    height: number; // canvas高度
    billWidth: number; // 广告牌尺寸
    color: string; // 字体颜色
    size: number; // 字体尺寸
    imgUrl: string; // 背景图片链接
    font: string; // 字体类型
    paddingTop: number; // 上边距
    near: number;
    far: number;
    ratio: number; // 远处比例
    distanceDisplay: boolean; // 如果开启，则只在near与far区间里展示，否则一直展示
    condition: any[];
    bgImg: any; // 传给offscreenCanvas的图片形式，程序自动根据图片地址生成，无需人工传递
    alpha: number; // 透明度
    floatHeight: number; // 浮动高度
    bloom: boolean; // 泛光
    brightness: number; // 亮度
    northOffset: number;
    eastOffset: number;
    heightOffset: number;
    offsetX: number;
    offsetY: number;
    scale: number;
    fieldKey: string;
    fixedWidth: number; // 固定宽度
    fixedHeight: number; // 固定高度
    bold: boolean;
    verticalOrigin: string;
    horizontalOrigin: string;
    animateVideo: string;
    ableAnimate: boolean;
}

export const DefaultStyle: ILayerStyle = {
    width: 500,
    height: 500,
    billWidth: 0,
    color: "#000000",
    size: 20,
    imgUrl: require("../../../../static/img/labelBg.png"),
    font: "微软雅黑",
    paddingTop: 5,
    alpha: 1,
    floatHeight: 10,
    bloom: false,
    brightness: 1,
    near: 0,
    far: Infinity,
    ratio: 1, // 远近缩放比例
    scale: 1,
    distanceDisplay: false,
    condition: [],
    bgImg: "",
    northOffset: 0,
    eastOffset: 0,
    offsetX: 0,
    offsetY: 0,
    heightOffset: 0,
    fieldKey: "text",
    fixedWidth: 100,
    fixedHeight: 40,
    bold: true,
    verticalOrigin: "CENTER", // 垂直基准线
    horizontalOrigin: "CENTER", // 水平基准线
    animateVideo: "../../../../static_stc/video/ccc.mp4",
    ableAnimate: false,
};
