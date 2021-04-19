export interface ILayerStyle {
    radius: number;
    color: string;
    brightness: number;
    bloom: boolean;
    ratio: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    radius: 50,
    brightness: 1,
    color: "red",
    bloom: true,
    ratio: 2,
    condition: [],
};
