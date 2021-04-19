export interface ILayerStyle {
    [key: string]: any;
    canvasWidth: number;
}

export const DefaultStyle: ILayerStyle = {
    canvasWidth: 2048,
};
