export interface ILayerStyle {
    color: string;
    modelUrl: string; // 模型
    appear: boolean;
    uvMove: boolean;
    styleType: string;
    tX: number;
    tY: number;
    tZ: number;
    angle: number;
    scale: number;
    longitude: number;
    latitude: number;
    ableEnvironment: boolean;
    KTXUrl: string;
    condition: any[];
    ableCustomLight: boolean;
}

export const DefaultStyle: ILayerStyle = {
    color: "",
    modelUrl: "",
    appear: false,
    uvMove: false,
    styleType: "",
    tX: 0,
    tY: 0,
    tZ: 0,
    angle: 0,
    scale: 1,
    longitude: 120,
    latitude: 30,
    condition: [],
    ableCustomLight: true,
    ableEnvironment: false,
    KTXUrl: "",
};
