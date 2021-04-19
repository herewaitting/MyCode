
export interface ILayerStyle {
    radius: number;
    spaceRatio: number;
    height: number;
    speed: number;
    outImg: string; // 外圈图片
    midImg: string; // 中间圈图片
    innerImg: string; // 内圈图片
    bloom: boolean;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    radius: 100,
    spaceRatio: 0.2,
    height: 100,
    speed: 1,
    outImg: require("../../../../static/img/line02.png"),
    midImg: require("../../../../static/img/line02.png"),
    innerImg: require("../../../../static/img/line02.png"),
    bloom: false,
    brightness: 1,
    condition: [],
};
