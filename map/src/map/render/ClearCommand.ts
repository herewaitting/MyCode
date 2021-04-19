import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { SceneServer } from "../sceneServer";
import { Framebuffer } from "./Framebuffer";

export class ClearCommand {
    public clearCommand: Cesium.ClearCommand;
    constructor(claerOpt: any) {
        this.clearCommand = new Cesium.ClearCommand({
            color: transformColor(claerOpt.color) || Cesium.Color.BLACK,
        });
    }
    public execute(viewer: SceneServer) {
        if (!viewer || !viewer.scene || !(viewer.scene as any).context) {
            return;
        }
        (this.clearCommand as any).execute((viewer.scene as any).context);
    }
    public setFBO(fbo: Framebuffer) {
        if (!fbo || !fbo.framebuffer) {
            return;
        }
        (this.clearCommand as any).framebuffer = fbo.framebuffer;
    }
}
