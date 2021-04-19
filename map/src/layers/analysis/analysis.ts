import { ILayerOption } from "../../layerManager";
import { SceneServer } from "../../map/sceneServer";
import { Layer } from "../layer";

export abstract class Analysis<D> extends Layer<D> {
    public layerType: string = "Analysis";
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<D>) {
        super(viewer, layerName, initOpts);
    }
}
