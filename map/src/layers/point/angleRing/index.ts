import * as Cesium from "cesium";
import { ILayerOption } from "../../../layerManager";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { AngleRingMaterial } from "../../../map/material/AngleRingMaterial";
import { KVAppearance } from "../../../map/material/Appearance";
import { CustomGeometry } from "../../../map/primitive/customGeometry";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { SplitCircle } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class AngleRing extends Point<ILayerStyle> {
    public workerFunName!: string;
    public appearance: any;
    public VAO: any;
    private material!: AngleRingMaterial;
    private conditionMaterial!: {
        [key: string]: AngleRingMaterial;
    };
    private conditionAppearance!: any;
    // private addedPri: any = [];
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
        if (style.topRatio && style.topRatio !== this.style.topRatio) {
            this.style = {...this.style, ...style};
            this.removeData();
            this.prepareVAO();
            this.postWorkerData();
        }
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
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.style.brightness = this.baseCfg.brightness;
        this.material = new AngleRingMaterial(this.style);
        this.appearance.default = this.style;
        this.dealCondition(this.style, true);
        this.conditionAppearance.default = new KVAppearance({
            type: "MaterialAppearance",
            material: this.material,
        });
        this.createConditionApp();
        this.changeBloom(this.style.bloom);
        this.prepareVAO();
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
        const scaleM = Matrix4.fromScale(currStyle.radius, currStyle.radius, currStyle.radius * (currStyle.ratio || 1));
        currMat = Matrix4.multiply(cloneMat, scaleM);
        const geometry = new CustomGeometry(this.VAO);
        const primitive = new CustomPrimitive(geometry.geometry as any, appearance) as any;
        primitive.setMatrix(currMat, scaleM);
        primitive.primitive.id = currPoint.id;
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
        this.conditionMaterial[condition] = new AngleRingMaterial(style as any);
    }
    private prepareVAO() {
        const splitNum = 30;
        const baseVertexs = SplitCircle(splitNum);
        const topVertexs: any[] = [];
        baseVertexs.forEach((item, index) => { // 组织离地圆顶点
            if (index % 3 === 2) {
                topVertexs.push(1);
            } else {
                topVertexs.push(item * this.style.topRatio);
            }
        });
        const vertexs = baseVertexs.concat(topVertexs);
        const indexs: any[] = [];
        const uvs: any[] = [];
        for (let index = 0; index <= splitNum; index ++) {
            uvs.push(index / splitNum);
            uvs.push(0);
            if (index < splitNum) { // 四边形左下角开始，顺时针
                const v0 = index;
                const v1 = index + (splitNum + 1);
                const v2 = (index + 1) + (splitNum + 1);
                const v3 = index + 1;
                indexs.push(v0, v2, v1);
                indexs.push(v0, v3, v2);
            }
        }
        for (let index = 0; index <= splitNum; index ++) {
            uvs.push(index / splitNum);
            uvs.push(1);
        }
        // this.VAO = {
        //     vertexs,
        //     indexs,
        //     uvs,
        // };
        this.VAO = {
            type: "TRIANGLES",
            position: {
                values: new Float32Array(vertexs),
                componentDatatype: "DOUBLE",
                componentsPerAttribute: 3,
            },
            indexs: new Uint16Array(indexs),
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
        this.changeBloom(style.bloom);
    }
    private resetShape(style: ILayerStyle) {
        const newStyle = {...this.style, ...style};
        const pris = InstanceContainer.getPrimitives(this.collection) as any[];
        pris.forEach((item) => {
            const radius = newStyle.radius;
            const oldMat = Cesium.clone(item.oldMat);
            const scaleM = Matrix4.fromScale(radius, radius,  newStyle.radius * (newStyle.ratio || 1));
            const resMat = Matrix4.multiply(oldMat, scaleM);
            item.modelMatrix = resMat;
            item.shapeMat = resMat;
        });
    }
}
