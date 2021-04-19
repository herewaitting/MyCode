import * as Cesium from "cesium";

import { CustomGeometry, KVAppearance } from "../../layers/point/domeCover/config";

export interface ICustomPrimitive {
    primitive: Cesium.Primitive | Cesium.GroundPrimitive;
    setMatrix: (mat: any) => void;
}
export class CustomPrimitive implements ICustomPrimitive {
    public static updatePriAppearance(pri: any, appearance: any) {
        if (pri && appearance) {
            pri.appearance = appearance.appearance || appearance;
        }
    }
    public primitive: Cesium.Primitive | Cesium.GroundPrimitive;
    constructor(geometry: CustomGeometry, appearance: KVAppearance, ground?: boolean, model?: true) {
        const instance = new Cesium.GeometryInstance({
            geometry,
        });
        if (model && typeof geometry === "string") {
            this.primitive = Cesium.Model.fromGltf({
                url : geometry as any,
            }) as any;
        }
        if (ground) {
            this.primitive = new Cesium.GroundPrimitive({
                geometryInstances: instance,
                appearance: appearance.appearance,
            });
        } else {
            this.primitive = new Cesium.Primitive({
                geometryInstances: instance,
                appearance: appearance.appearance,
            });
        }
    }
    public setMatrix(mat: Cesium.Matrix4, shapeMat?: Cesium.Matrix4) {
        (this as any).primitive.modelMatrix = mat;
        (this as any).primitive.shapeMat = shapeMat;
    }
    public setBloom(bloom: boolean) {
        (this.primitive as any).ableBloom = bloom;
    }
}
