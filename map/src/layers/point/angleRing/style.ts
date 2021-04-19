
export interface ILayerStyle {
    radius: number;
    color: string;
    brightness: number;
    bloom: boolean;
    ratio: number;
    topRatio: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    radius: 50,
    brightness: 1,
    color: "red",
    bloom: true,
    ratio: 2,
    topRatio: 1.5,
    condition: [],
};
