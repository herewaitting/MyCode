
export interface ILayerStyle {
    radius: number;
    color: string;
    brightness: number;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    radius: 100,
    color: "red",
    brightness: 1,
    condition: [],
};
