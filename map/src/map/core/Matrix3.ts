import * as Cesium from "cesium";

export const Matrix3 = {
    IDENTITY: Cesium.Matrix4.IDENTITY,
    fromRotationZ: (rad: number) => {
        return Cesium.Matrix3.fromRotationZ(rad);
    },
};
