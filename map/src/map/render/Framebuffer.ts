import * as Cesium from "cesium";
import { SceneServer } from "../sceneServer";
import { Texture } from "./Texture";

export interface IFramebufferOpt {
    colorTextures: Texture[];
    destroyAttachments: false;
    [key: string]: any;
}

export class Framebuffer {
    public framebuffer!: Cesium.Framebuffer;
    constructor(viewer: SceneServer, option: any) {
        if (!viewer || !(viewer as any).scene) {
            return;
        }
        const context = (viewer as any).scene.context;
        let newOpt: any = {
            context,
        };
        const colorTs: Cesium.Texture[] = [];
        (option.colorTextures as Texture[]).forEach((ct) => {
            colorTs.push(ct.texture);
        });
        newOpt = {...newOpt, ...option};
        newOpt.colorTextures = colorTs;
        this.framebuffer = new Cesium.Framebuffer(newOpt);
    }
}
