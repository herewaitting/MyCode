import * as Cesium from "cesium";
import { Cartesian3 } from "./Cartesian3";

export const Matrix4 = {
    IDENTITY: Cesium.Matrix4.IDENTITY,
    fromScale: (scaleX: number, scaleY: number, scaleZ: number) => {
        return Cesium.Matrix4.fromScale(new Cesium.Cartesian3(scaleX, scaleY, scaleZ));
    },
    multiply: (mat1: Cesium.Matrix4, mat2: Cesium.Matrix4) => {
        return Cesium.Matrix4.multiply(mat1, mat2, new Cesium.Matrix4());
    },
    fromTranslationRotationScale: (translation: any, rotation: any, scale: any) => {
        const temp = new (Cesium as any).TranslationRotationScale(translation, rotation, scale);
        return (Cesium.Matrix4 as any).fromTranslationRotationScale(temp);
    },
    fromTranslation: (tx: number, ty: number, tz: number) => {
        return Cesium.Matrix4.fromTranslation(
            new Cesium.Cartesian3(tx, ty, tz),
        );
    },
    multiplyByMatrix3: (mat1: Cesium.Matrix4, mat2: Cesium.Matrix3) => {
        return Cesium.Matrix4.multiplyByMatrix3(mat1, mat2, new Cesium.Matrix4());
    },
    inverse: (mat4: Cesium.Matrix4) => {
        return Cesium.Matrix4.inverse(mat4, new Cesium.Matrix4());
    },
    multiplyByPoint: (mat4: Cesium.Matrix4, point: Cartesian3) => {
        return Cesium.Matrix4.multiplyByPoint(mat4, point as any, new Cartesian3() as any);
    },
};
