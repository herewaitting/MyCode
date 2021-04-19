export interface ILonLatHeight {
    longitude: number;
    latitude: number;
    height?: number;
    [key: string]: any;
}

// 底图调色设置
export interface IBeautifyFilter {
    blend: boolean;
    blendColor: string;
    alpha: number;
}
