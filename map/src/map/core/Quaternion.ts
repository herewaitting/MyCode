import * as Cesium from "cesium";

export const Quaternion = {
    IDENTITY: Cesium.Matrix4.IDENTITY,
    fromRotationMatrix: (mat: any) => {
        return Cesium.Quaternion.fromRotationMatrix(mat);
    },
};
