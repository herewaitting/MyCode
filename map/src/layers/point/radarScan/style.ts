
export interface ILayerStyle {
    color: string;
    speed: number;
    imgUrl: string;
    radius: number;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    color: "red",
    speed: 1,
    imgUrl: require("../../../../static/img/circle.png"),
    radius: 200,
    brightness: 1,
    condition: [],
};
