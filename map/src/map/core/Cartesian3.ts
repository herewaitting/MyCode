import * as cesium from "cesium";
const Cesium = cesium;

export interface ICartesian3 {
    x: number;
    y: number;
    z: number;
}

export class Cartesian3 {
    public static UNIT_X: {x: 1, y: 0, z: 0};
    public static UNIT_Y: {x: 1, y: 0, z: 0};
    public static UNIT_Z: {x: 1, y: 0, z: 0};
    public static add(c1: ICartesian3, c2: ICartesian3) {
        return Cesium.Cartesian3.add(c1 as any, c2 as any, new Cesium.Cartesian3());
    }
    public static normalize(c1: ICartesian3) {
        return Cesium.Cartesian3.normalize(c1 as any, new Cesium.Cartesian3());
    }
    public static multiplyByScalar(c1: ICartesian3, c2: number) {
        return Cesium.Cartesian3.multiplyByScalar(c1 as any, c2, new Cesium.Cartesian3());
    }
    public static fromDegrees(lon: number, lat: number, height?: number) {
        return Cesium.Cartesian3.fromDegrees(lon, lat, height || 0);
    }
    public static distance(c1: ICartesian3, c2: ICartesian3) {
        return Cesium.Cartesian3.distance(c1 as any, c2 as any);
    }
    public static subtract(c1: ICartesian3, c2: ICartesian3) {
        return Cesium.Cartesian3.subtract(c1 as any, c2 as any, new Cesium.Cartesian3());
    }
    public static cross(c1: ICartesian3, c2: ICartesian3) {
        return Cesium.Cartesian3.cross(c1 as any, c2 as any, new Cesium.Cartesian3());
    }
    public static fromDegreesArrayHeights(pointArr: any) {
        return Cesium.Cartesian3.fromDegreesArrayHeights(pointArr);
    }
    public x: number;
    public y: number;
    public z: number;
    constructor(x?: number, y?: number, z?: number) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
}
