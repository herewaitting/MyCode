import * as Cesium from "cesium";
import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { CreatePolylineGeometry, CreatePolylinePrimitive } from "../../../map/primitive/createPolyline";
import { CreatePolygonGeometry, PolygonGeometryPrimitive } from "../../../map/primitive/PolygonGeometry";
import { SceneServer } from "../../../map/sceneServer";
import { KvLog } from "../../../tools/log";
import { transformColor } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Polygon } from "../polygon";
import { DefaultStyle, ILayerStyle } from "./style";

export class InnerGlowPolygon extends Polygon<ILayerStyle> {
    public workerFunName!: string;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, initOpts);
        if (!this.viewer) { return; }
    }
    public removeData(): void {
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        this.dealCondition(style);
        this.style = {...this.style, ...style};
        (Cesium.ExpandBySTC as any).bloomInside.brightStrength = this.style.brightStrength;
        (Cesium.ExpandBySTC as any).bloomInside.blurRadius = this.style.blurRadius;
        (Cesium.ExpandBySTC as any).bloomInside.fgNum = this.style.fgNum;
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "PolygonWorkerFun";
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.conditionAppearance = {};
        this.collectionToScene();
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.dealCondition(this.style);
        const mat = Cesium.Material.fromType("Color");
        mat.uniforms.color = transformColor(this.style.color);
        // this.conditionAppearance.default = app;
        this.conditionAppearance.default = new KVAppearance({
            type: "EllipsoidSurfaceAppearance",
            material: mat,
        });

        this.conditionAppearance.line = new KVAppearance({
            type: "PolylineMaterial",
            material: mat,
        });

        this.conditionAppearance.default.appearance.material.uniforms.color = mat.uniforms.color;
        this.conditionAppearance.line.appearance.material.uniforms.color = mat.uniforms.color;

        (Cesium.ExpandBySTC as any).bloomInside.brightStrength = this.style.brightStrength;
        (Cesium.ExpandBySTC as any).bloomInside.blurRadius = this.style.blurRadius;
        (Cesium.ExpandBySTC as any).bloomInside.fgNum = this.style.fgNum;
    }
    protected onData(option: IWorkerMsg): void {
        if (!option || !option.dataArr) {
            KvLog.warn({
                msg: "子线程传回的数据有误！",
                layerName: this.layerName,
            });
            return;
        }
        const data = option.dataArr;
        if (!data || !data.length) {
            return;
        }
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, data[0]);
        }
        const polygon = CreatePolygonGeometry({
            data,
        });
        const line = CreatePolylineGeometry({
            data,
            width: 3,
        });
        const primitive = new PolygonGeometryPrimitive({
            data: [polygon],
        });
        primitive.primitive.bloomInside = true;
        primitive.primitive.insideArea = true;
        primitive.setAppearance(this.conditionAppearance.default);
        this.collection.add(primitive);

        const linePrimitive = new CreatePolylinePrimitive({
            data: line,
        });
        linePrimitive.primitive.bloomInside = true;
        linePrimitive.setAppearance(this.conditionAppearance.line);

        this.collection.add(linePrimitive);
    }
    protected onDestroy(): void {
        if (this.viewer) {
            this.viewer.removePrimitive(this.collection);
            (this.collection as any) = null;
            if (this.conditionAppearance) {
                Object.keys(this.conditionAppearance).forEach((item) => {
                    this.conditionAppearance[item].destroy();
                    this.conditionAppearance[item] = null;
                });
            }
            this.appearance = null;
            this.conditionAppearance = null;
        }
    }
    protected onDataOver() {
        // this.collectionToScene();
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
    }
    protected deleteAppearance(condTxt: string) {
        if (this.conditionAppearance[condTxt]) {
            this.conditionAppearance[condTxt].destroy();
        }
    }
    protected createAppearance<ILayerStyle>(condition: string, style: ILayerStyle) {
        if (!condition || !style) {
            return;
        }
    }
    private collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    // private resetMaterial(style: ILayerStyle) {
    //     // this.material.reset({...this.style, ...style});
    //     this.conditionAppearance.default.resetMaterial({...this.style, ...style});
    // }
}
