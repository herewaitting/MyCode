import * as Cesium from "cesium";
import { ICreatePrimitiveOpt } from "../interface";

export interface IPrimitive {
    setAppearance: (appearance: any) => void;
    setBloom: (bool: boolean) => void;
}

export class CreatePolylinePrimitive implements IPrimitive {
    public primitive: any;
    public appearance: any;
    constructor(option: ICreatePrimitiveOpt) {
        if (!option || !option.data) {
            return;
        }
        // const instance = new Cesium.GeometryInstance({
        //     geometry: new Cesium.PolylineGeometry({
        //         positions: option.data,
        //         width: option.width,
        //     }),
        // });
        if (option.groundLine) {
            this.primitive = new (Cesium as any).GroundPolylinePrimitive({
                geometryInstances: option.data,
            });
        } else {
            this.primitive = new Cesium.Primitive({
                geometryInstances: option.data,
            });
        }
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

// export const CreatePolylinePrimitive = (option: ICreatePrimitiveOpt) => {
//     return new Cesium.Primitive({
//         geometryInstances: option.data,
//     });
// };

export const CreatePolylineGeometry = (option: ICreatePrimitiveOpt) => {
    if (!option || !option.data) {
        return;
    }
    if (option.groundLine) {
        return new Cesium.GeometryInstance({
            geometry: new (Cesium as any).GroundPolylineGeometry({
                positions: option.data,
                width: option.width,
            }),
        });
    } else {
        return new Cesium.GeometryInstance({
            geometry: new (Cesium as any).PolylineGeometry({
                positions: option.data,
                width: option.width,
            }),
        });
    }
};
