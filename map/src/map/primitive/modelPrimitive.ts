import * as Cesium from "cesium";

export interface IModelPrimitive {
    primitive: Cesium.Model;
    setMatrix: (mat: any) => void;
    setBrightness: (brightness: number) => void;
}
export class ModelPrimitive implements IModelPrimitive {
    public primitive: Cesium.Model;
    constructor(modelUrl: string) {
        this.primitive = Cesium.Model.fromGltf({
            url : modelUrl,
        });
    }
    public setMatrix(mat: Cesium.Matrix4, shapeMat?: Cesium.Matrix4) {
        (this as any).primitive.modelMatrix = mat;
        (this as any).primitive.shapeMat = shapeMat;
    }
    public setBrightness(brightness: number) {
        (this.primitive as any).luminanceAtZenith = brightness || (this.primitive as any).luminanceAtZenith;
    }
    public setCustomProp(option: any) {
        Object.keys(option).forEach((key) => {
            (this.primitive as any)[key] = option[key];
        });
    }
}
