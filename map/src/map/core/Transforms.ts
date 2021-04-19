import * as Cesium from "cesium";
import { IWorldPos } from "../sceneServer";

export const Transforms = {
    eastNorthUpToFixedFrame: (position: IWorldPos) => {
        return Cesium.Transforms.eastNorthUpToFixedFrame(position as any);
    },
};
