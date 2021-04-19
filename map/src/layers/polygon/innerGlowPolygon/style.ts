export interface ILayerStyle {
    fgNum: number; // 泛光系数
    blurRadius: number; // 泛光半径
    brightStrength: number; // 泛光强弱，值越大越弱
    color: string; // 泛光颜色
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    fgNum: 0,
    blurRadius: 2,
    brightStrength: 12,
    color: "red",
    condition: [],
};
