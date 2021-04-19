import * as Cesium from "cesium";
import { IWorldPos } from "../sceneServer";

export interface IEllipseGeometryOpt {
    center: IWorldPos;
    semiMajorAxis: number;
    semiMinorAxis: number;
}
export class EllipseGeometry {
    public geometry!: Cesium.EllipseGeometry;
    constructor(option: IEllipseGeometryOpt) {
        this.geometry = new Cesium.EllipseGeometry(option as any);
    }
}
