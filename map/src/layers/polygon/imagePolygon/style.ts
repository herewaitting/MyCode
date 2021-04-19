export interface ILayerStyle {
    imgUrl: string;
    alpha: number;
    brightness: number;
    color: string;
    stickGround: boolean;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    imgUrl: require("../../../../static/img/green.jpg"),
    alpha: 1.0,
    brightness: 1.0,
    color: "white",
    stickGround: false,
    condition: [],
};
