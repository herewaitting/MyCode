export interface ILayerStyle {
    modelUrl: string; // 模型
    ableRotate: boolean;
    // uvMove: boolean;
    color: string;
    speed: number;
    condition: any[];
    brightness: number;
    tX: number;
    tY: number;
    tZ: number;
    angle: number;
    scale: number;
    ableEnvironment: boolean;
    KTXUrl: string;
    ableCustomLight: boolean;
}

export const DefaultStyle: ILayerStyle = {
    modelUrl: require("../../../../static/gltf/CesiumMilkTruck.glb"),
    ableRotate: false,
    // uvMove: false,
    speed: 0,
    color: "white",
    tX: 0,
    tY: 0,
    tZ: 0,
    angle: 0,
    scale: 1,
    condition: [],
    brightness: 1,
    ableCustomLight: true,
    ableEnvironment: false,
    KTXUrl: "",
};
