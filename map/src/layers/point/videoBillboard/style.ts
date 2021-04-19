export interface ILayerStyle {
    video: string; // 视频
    imgUrl: string;
    scale: number; // 缩放
    height: number;
    bloom: boolean;
    size: number;
    imgScale: number;
    near: number;
    far: number;
    ratio: number;
    disableDepthTestDistance: number;
    pixelOffset: string;
    pixelOffsetScaleByDistance: string;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    video: "../../../../static/video/circle.mp4",
    imgUrl: require("../../../../static/img/beam.png"),
    scale: 1,
    height: 0,
    bloom: false,
    size: 20,
    imgScale: 0.5,
    near: 1,
    ratio: 1, // 宽高比例
    far: Number.MAX_VALUE,
    condition: [],
    disableDepthTestDistance: Number.MAX_VALUE,
    pixelOffset: "",
    pixelOffsetScaleByDistance: "",
};
