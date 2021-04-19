import { Cartesian3 } from "../core/Cartesian3";
import { Matrix4 } from "../core/Matrix4";
import { OrthographicOffCenterFrustum } from "../core/OrthographicOffCenterFrustum";

export const OrthographicCamera = {
    viewMatrix: Matrix4.IDENTITY,
    inverseViewMatrix: Matrix4.IDENTITY,
    frustum: OrthographicOffCenterFrustum,
    positionCartographic: {
        height: 0,
        latitude: 0,
        longitude: 0,
    },
    positionWC: new Cartesian3(),
    directionWC: Cartesian3.UNIT_Z,
    upWC: Cartesian3.UNIT_Y,
    rightWC: Cartesian3.UNIT_X,
    viewProjectionMatrix: Matrix4.IDENTITY,
};
