import { ILayerOption } from "../../../layerManager";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { WaveCircleMaterial } from "../../../map/material/WaveCircleMaterial";
import { CustomGeometry } from "../../../map/primitive/customGeometry";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { offsetPoint } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle} from "./style";

export class WaveCircle extends Point<ILayerStyle> {
    public workerFunName!: string;
    public appearance: any;
    public VAO: any;
    private material!: WaveCircleMaterial;
    private conditionMaterial!: {
        [key: string]: WaveCircleMaterial;
    };
    private conditionAppearance!: any;
    private addedPri: any = [];
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
        this.addedPri = [];
    }
    public updateStyle(style: ILayerStyle): void {
        this.dealCondition(style);
        this.createConditionApp();
        this.resetMaterial(style);
        this.resetShape();
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
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
        this.workerFunName = "PointWorkerFun";
        this.appearance = {};
        this.conditionMaterial = {};
        this.conditionAppearance = {};
        this.VAO = {};
        this.prepareVAO();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.material = new WaveCircleMaterial(this.style);
        this.appearance.default = this.style;
        this.dealCondition(this.style, true);
        this.conditionAppearance.default = new KVAppearance({
            type: "MaterialAppearance",
            material: this.material,
        });
        this.createConditionApp();
        this.changeBloom(this.style.bloom);
    }
    protected updatePointStyle(point: any) {
        const type = this.judgeItemStyleType(point.kd_info, this.style.condition);
        const appearance = this.conditionAppearance[type];
        CustomPrimitive.updatePriAppearance(point, appearance);
    }
    protected createAppearance<ILayerStyle>(condition: string, style: ILayerStyle) {
        if (!condition || !style) {
            return;
        }
        this.conditionMaterial[condition] = new WaveCircleMaterial(style as any);
    }
    protected onData(option: IWorkerMsg): void {
        const style = this.style;
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        let currRing = option.dataArr as any;
        const baseCfg = this.baseCfg;
        currRing = offsetPoint(currRing, (baseCfg as any).northOffset, (baseCfg as any).eastOffset);
        if (!this.locatedPos) {
            this.locatedPos = currRing as any;
        }
        const appearance = this.conditionAppearance[option.currStyle];
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;
        let currMat = Transforms.eastNorthUpToFixedFrame(currRing as any);
        const cloneMat = Object.assign({}, currMat);
        const scaleM = Matrix4.fromScale(currStyle.radius, currStyle.radius,  currStyle.radius);
        currMat = Matrix4.multiply(currMat, scaleM);
        const geometry = new CustomGeometry(this.VAO);
        const primitive = new CustomPrimitive(geometry.geometry as any, appearance) as any;
        primitive.setMatrix(currMat, scaleM);
        // const currOpts = {
        //     center: currRing,
        //     semiMajorAxis: currStyle.radius,
        //     semiMinorAxis: currStyle.radius,
        // };
        // const ellipseGeo = new EllipseGeometry(currOpts);
        // const primitive = new CustomPrimitive(ellipseGeo.geometry as any, appearance.appearance);
        (primitive as any).primitive.kd_info = kdinfo;
        (primitive as any).primitive.kd_style = Object.assign({}, style);
        primitive.primitive.oldMat = cloneMat;
        primitive.setBloom(style.bloom);
        primitive.customStyle = option.currStyle;
        this.addedPri.push(primitive);
        if (this.collection) {
            this.collection.add(primitive);
        }
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
        this.addedPri = null;
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
    protected deleteAppearance(condTxt: string) {
        if (this.conditionAppearance[condTxt]) {
            this.conditionAppearance[condTxt].destroy();
        }
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
    private resetShape() {
        (this.addedPri as any[]).forEach((pri) => {
            const oldMat  = pri.primitive.oldMat;
            const currStyle = this.appearance[pri.customStyle];
            const scaleM = Matrix4.fromScale(currStyle.radius, currStyle.radius,  currStyle.radius);
            const currMat = Matrix4.multiply(oldMat, scaleM);
            pri.setMatrix(currMat, scaleM);
        });
    }
}
