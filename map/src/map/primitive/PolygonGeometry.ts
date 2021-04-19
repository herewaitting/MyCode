import * as Cesium from "cesium";
import { ICreatePrimitiveOpt } from "../interface";

export interface IPrimitive {
    setAppearance: (appearance: any) => void;
    // setMatrix: (mat: any) => void;
    setBloom: (bool: boolean) => void;
}

export class PolygonGeometryPrimitive implements IPrimitive {
    public primitive: any;
    public appearance: any;
    constructor(option: ICreatePrimitiveOpt) {
        const instance = option.data;
        if (option.ground) {
            this.primitive = new Cesium.GroundPrimitive({
                geometryInstances: instance,
            });
        } else {
            this.primitive = new Cesium.Primitive({
                geometryInstances: instance,
            });
        }
    }
    public setAppearance(appearance: any) {
        if (!appearance || !appearance.appearance) {
            console.warn("PolygonGeometryPrimitive.ts:传入的图层材质外观为undefined!");
            return;
        }
        // const newApp = {
        //     material: appearance.material,
        // };
        this.primitive.appearance = appearance.appearance;
    }
    public setBloom(bool: boolean) {
        this.primitive.ableBloom = bool;
    }
}

export const CreatePolygonGeometry = (option: ICreatePrimitiveOpt) => {
    let holes;
    if (option.holesArr && option.holesArr.length) {
        holes = [];
        option.holesArr.forEach((item: any) => {
            holes.push(new Cesium.PolygonHierarchy(item));
        });
    }
    return new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
            polygonHierarchy : new Cesium.PolygonHierarchy(option.data, holes),
        }),
    });
};
