import * as Cesium from "cesium";
import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { SceneServer } from "../../../map/sceneServer";
import { transformColor } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Building } from "../building";
import { DefaultStyle, ILayerStyle } from "./style";
// import { Cartesian3 } from "cesium";

export class WhiteTiles extends Building<ILayerStyle> {
    public workerFunName!: string;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, initOpts);
        if (!this.viewer) { return; }
    }
    public removeData(): void {
        this.viewer.removePrimitive(this.collection);
        (this.collection as any) = null;
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        if (style.style !== this.style.style || style.url !== this.style.url) {
            this.style = {...this.style, ...style};
            this.removeData();
            this.add3Dtiles();
        }
        this.style = {...this.style, ...style};
        this.offsetTileHeight();
        this.resetTileProp();
    }
    public located() {
        this.locatedPos = this.collection.getTilesCenter();
        super.located();
    }
    public setData<T>(data: string | T[]) {
        if (this.hooks && this.hooks.startDealData) {
            this.hooks.startDealData.call(this, data as any);
        }
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.appearance.default = {...this.appearance.default, ...style};
        this.add3Dtiles();
        this.offsetTileHeight();
        this.resetTileProp();
        if (this.baseCfg.visible) {
            this.onShow();
        } else {
            this.onHide();
        }
    }
    protected onData(data: IWorkerMsg): void {
        // throw new Error("Method not implemented.");
    }
    protected onDestroy(): void {
        this.viewer.removePrimitive(this.collection);
        (this.collection as any) = null;
    }
    protected onDataOver(): void {
        // this.collectionToScene();
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
    }
    protected collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    private add3Dtiles() {
        const url = this.style.url;
        if (!url) {
            return;
        }
        const newStyle = Object.assign({}, this.style);
        newStyle.tiles3D = true;
        const tiles = this.collection.add(newStyle);
        tiles.ableCustomLight = this.style.ableCustomLight;
        tiles.useGradient = this.style.useGradient;
        tiles.mixColor = transformColor(this.style.mixColor);
        tiles.baseColor = transformColor(this.style.baseColor);
        tiles.mixNum = this.style.mixNum;
        tiles.appear = this.style.appearMove;
        this.addEnvironment(tiles);
        this.setMaterial(tiles);
    }
    private offsetTileHeight() {
        InstanceContainer.offsetTileHeight(this.collection, this.style.height);
    }
    private resetTileProp() {
        const style = this.style;
        this.viewer.setStyleShader(style.style);
        InstanceContainer.resetTileProp(this.collection, style);
        if (style.appearMove) {
            this.viewer.addAppearEvent();
        } else {
            this.viewer.removeAppearEvent();
        }
    }
    private addEnvironment(model: any) {
        if (!this.style.ableEnvironment || !this.style.KTXUrl || !model) {
            return;
        }
        const L00 = new Cesium.Cartesian3(
        0.422893140324417,  0.523445331193193,  0.600458758093589
        );
        const L1_1 = new Cesium.Cartesian3(
        0.208535945828143,  0.344735740024713,  0.430506963266327
        );
        const L10 = new Cesium.Cartesian3(
        0.160201040476682,  0.089331981906026,  0.028824584053831
        );
        const L11 = new Cesium.Cartesian3(
        0.004113592348149,  0.004160829901330, -0.000740648239336
        );
        const L2_2 = new Cesium.Cartesian3(
        -0.000212564047688,  0.002972228631110,  0.000776743025578
        );
        const L2_1 = new Cesium.Cartesian3(
        0.082178032387250,  0.029691568218979, -0.016718759807700
        );
        const L20 = new Cesium.Cartesian3(
        0.034560617182071,  0.021087579239499,  0.011723391123972
        );
        const L21 = new Cesium.Cartesian3(
        0.005749407929939,  0.003202307450189,  0.012591614039401
        );
        const L22 = new Cesium.Cartesian3(
        0.025067200631683,  0.032214087100091,  0.021653131208534
        );
        const coefficients = [L00, L1_1, L10, L11, L2_2, L2_1, L20, L21, L22];
        model.specularEnvironmentMaps = this.style.KTXUrl;
        model.sphericalHarmonicCoefficients = coefficients;
    }
    private setMaterial(model: any) {
        model.customMetalness = this.style.customMetalness;
        model.customRoughness = this.style.customRoughness;
    }
}
