export interface ILayerStyle {
    color: string; // 颜色
    radius: number; // 方形边长
    potNum: number; // 点数量
    limitHeight: number; // 氛围点厚度
    brightness: number; // 亮度
    longitude: number;
    latitude: number;
    height: number;
    floatDis: number;
    speed: number;
    maxDis: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    radius: 5000,
    potNum: 100000,
    limitHeight: 500,
    brightness: 1,
    longitude: 120,
    latitude: 30,
    height: 0,
    floatDis: 500,
    speed: 1,
    maxDis: 10000,
    condition: [],
};
