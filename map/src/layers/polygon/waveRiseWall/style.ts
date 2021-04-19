
export interface ILayerStyle {
    color: string; // 基础颜色
    speed: number; // 动画速度
    height: number; // 墙高
    repeat: number; // 流动重复次数
    bloom: boolean;
    brightness: number;
    condition: any[];
    minimumHeights: number; // 底部高度
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    speed: 1,
    height: 100,
    repeat: 1,
    bloom: false,
    brightness: 1,
    condition: [],
    minimumHeights: 0,
};
