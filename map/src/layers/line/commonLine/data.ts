import { ILonLatHeight } from "../../../map/interface";

export interface IColorLineData {
    id: string;
    points: ILonLatHeight[];
}

export const DefaultData: IColorLineData[] = [{
    id: `ColorLine_${String(Math.random()).slice(2, 20)}`,
    points: [
        {
            id: "color_001",
            longitude: 120,
            latitude: 30,
            height: 0,
        },
        {
            id: "color_001",
            longitude: 121,
            latitude: 31,
            height: 0,
        },
    ],
}];
