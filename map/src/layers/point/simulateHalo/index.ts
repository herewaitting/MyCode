import * as Cesium from "cesium";
import { cloneDeep } from "lodash";
import { ILayerOption } from "../../../layerManager";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { SimulateHaloMaterial } from "../../../map/material/SimulateHaloMaterial";
import { CustomGeometry } from "../../../map/primitive/customGeometry";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class SimulateHalo extends Point<ILayerStyle> {
    public workerFunName!: string;
    private conditionMaterial: any;
    private conditionAppearance: any;
    private VAO: any;
    private material: any;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
        if (!this.viewer) { return; }
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
        // this.addedPri = [];
    }
    public updateStyle(style: any): void {
        this.dealCondition(style);
        this.createConditionApp();
        this.resetMaterial(style);
        this.resetShape(style);
        this.style = {...this.style, ...style};
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "PointWorkerFun";
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.conditionMaterial = {};
        this.conditionAppearance = {};
        this.VAO = {};
        this.prepareVAO();
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.material = new SimulateHaloMaterial(this.style);
        this.appearance.default = this.style;
        this.dealCondition(this.style, true);
        var renderState = new Cesium.RenderState({}) as any;
        renderState.blending.enabled = true;
        renderState.blending.color = new Cesium.Color(1,1,1,1);
        renderState.blending.equationAlpha = 32774;
        renderState.blending.equationRgb = 32774;
        renderState.blending.functionDestinationAlpha = 0;
        renderState.blending.functionDestinationRgb = 0;
        renderState.blending.functionSourceAlpha = 1;
        renderState.blending.functionSourceRgb = 1;
        this.conditionAppearance.default = new KVAppearance({
            type: "MaterialAppearance",
            material: this.material,
            renderState: renderState,
        });
        this.createConditionApp();
    }
    protected onData(option: IWorkerMsg): void {
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        const origin = option.dataArr as any;
        if (!this.locatedPos) {
            this.locatedPos = origin as any;
        }
        const appearance = this.conditionAppearance[option.currStyle];
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;
        let currMat = Transforms.eastNorthUpToFixedFrame(origin as any);
        const cloneMat = Object.assign({}, currMat);
        const blnum = currStyle.radius;
        const scaleM = Matrix4.fromScale(blnum, blnum,  blnum);
        currMat = Matrix4.multiply(currMat, scaleM);
        const geometry = new CustomGeometry(this.VAO);
        const primitive = new CustomPrimitive(geometry.geometry as any, appearance) as any;
        primitive.setMatrix(currMat, scaleM);
        primitive.primitive.id = kdinfo.id;
        primitive.primitive.kd_info = kdinfo;
        primitive.primitive.oldMat = cloneMat;
        primitive.primitive.oldPosition = Object.assign({}, origin);
        this.collection.add(primitive);
    }
    protected onDestroy(): void {
        this.viewer.removePrimitive(this.collection);
        (this.collection as any) = null;
        (this.appearance as any) = null;
        Object.keys(this.conditionAppearance).forEach((item) => {
            this.conditionAppearance[item].destroy();
        });
        this.conditionMaterial = null as any;
        this.conditionAppearance = null as any;
        this.material = null as any;
        // this.addedPri = null;
    }
    protected updatePointStyle(point: any) {
        const type = this.judgeItemStyleType(point.kd_info, this.style.condition);
        const appearance = this.conditionAppearance[type];
        CustomPrimitive.updatePriAppearance(point, appearance);
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
    protected createAppearance<ILayerStyle>(condition: string, style: ILayerStyle) {
        if (!condition || !style) {
            return;
        }
        this.conditionMaterial[condition] = new SimulateHaloMaterial(style as any);
    }
    private prepareVAO() {
        const vertex = [
            -0.5, -0.5, 0,
            -0.5, 0.5, 0,
            0.5, 0.5, 0,
            0.5, -0.5, 0,
        ];
        const indices = [
            0, 2, 1,
            0, 3, 2,
        ];
        const uvs = [
            0, 0,
            0, 1,
            1, 1,
            1, 0,
        ];
        this.VAO = {
            type: "TRIANGLES",
            position: {
                values: new Float32Array(vertex),
                componentDatatype: "DOUBLE",
                componentsPerAttribute: 3,
            },
            indexs: new Uint16Array(indices),
            st: {
                values: new Float32Array(uvs),
                componentDatatype: "FLOAT",
                componentsPerAttribute: 2,
            },
        };
    }
    private createConditionApp() {
        Object.keys(this.conditionMaterial).forEach((item) => {
            this.conditionAppearance[item] = new KVAppearance({
                type: "MaterialAppearance",
                material: this.conditionMaterial[item],
            });
        });
    }
    private resetMaterial(style: ILayerStyle) {
        this.material.reset({...this.style, ...style});
        const {condition, ...defaultStyle} = style;
        if (condition && condition.forEach) {
            condition.forEach((item: any) => {
                const currStyle = {...this.style, ...{...defaultStyle, ...item.style}};
                this.conditionAppearance[item.condition].resetMaterial(currStyle);
            });
        }
    }
    private resetShape(style: ILayerStyle) {
        const newStyle = {...this.style, ...style};
        const pris = InstanceContainer.getPrimitives(this.collection) as any[];
        pris.forEach((item) => {
            const radius = newStyle.radius || 0.00001;
            const oldMat = cloneDeep(item.oldMat);
            const scaleM = Matrix4.fromScale(radius, radius, 1);
            const resMat = Matrix4.multiply(oldMat, scaleM);
            item.modelMatrix = resMat;
            item.shapeMat = scaleM;
        });
    }
}
