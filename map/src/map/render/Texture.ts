import * as Cesium from "cesium";
import { SceneServer } from "../sceneServer";

export interface TextureOpt {
    width?: number;
    height?: number;
    pixelFormat?: string;
    pixelDatatype?: string;
    [key: string]: any;
}

export class Texture {
    public texture!: Cesium.Texture;
    constructor(viewer: SceneServer, option: TextureOpt) {
        if (!viewer || !(viewer as any).scene) {
            return;
        }
        const context = (viewer as any).scene.context;
        let newOpt: TextureOpt = {
            context,
        } as any;
        newOpt = {...newOpt, ...option};
        newOpt.pixelFormat = Cesium.PixelFormat[option.pixelFormat as any];
        newOpt.pixelDatatype = Cesium.PixelDatatype[option.pixelDatatype as any];
        this.texture = new Cesium.Texture(newOpt);
    }
    public destroy() {
        (this.texture as any).destroy();
    }
}
