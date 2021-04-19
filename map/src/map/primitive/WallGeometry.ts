import * as Cesium from "cesium";
import { ICreatePrimitiveOpt } from "../interface";

export interface IPrimitive {
    setAppearance: (appearance: any) => void;
    // setMatrix: (mat: any) => void;
    setBloom: (bool: boolean) => void;
}

export class WallGeometryPrimitive implements IPrimitive {
    public primitive: any;
    public appearance: any;
    constructor(option: ICreatePrimitiveOpt) {
        const geometry = new Cesium.WallGeometry({
            positions: option.data,
            minimumHeights: option.minimumHeights,
            maximumHeights: option.maximumHeights,
        });
        const geometry1 = Cesium.WallGeometry.createGeometry(geometry);
        const instance = new Cesium.GeometryInstance({
            geometry: geometry1,
        } as any);
        this.primitive = new Cesium.Primitive({
            geometryInstances: instance,
        });
    }
    public setAppearance(appearance: any) {
        if (!appearance) {
            console.warn("createPolyline.ts:传入的图层材质外观为undefined!");
            return;
        }
        this.primitive.appearance = appearance.appearance;
    }
    public setBloom(bool: boolean) {
        this.primitive.ableBloom = bool;
    }
}
