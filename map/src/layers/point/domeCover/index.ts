import { cloneDeep } from "lodash";
import { ILayerOption } from "../../../layerManager";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { CustomPrimitive } from "../../../map/primitive/customPrimitive";
import { SceneServer } from "../../../map/sceneServer";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { CustomGeometry, DomeCoverMaterial, KVAppearance } from "./config";
import { DefaultStyle, ILayerStyle} from "./style";

export class DomeCover extends Point<ILayerStyle> {
    public workerFunName: string = "PointWorkerFun";
    private rectVAO: any;
    private material!: DomeCoverMaterial;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
        if (!this.viewer) { return; }
    }

    public removeData() {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        this.resetMaterial(style);
        if (this.style.radius !== style.radius) {
            this.changeShape(style.radius);
        }
        this.style = {...this.style, ...style};
        this.changeBloom(this.style.bloom);
        // this.dealCondition(this.style, true);
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
        this.prepareDome();
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.material = new DomeCoverMaterial(this.style);
        this.appearance.default = new KVAppearance({
            type: "MaterialAppearance",
            material: this.material,
        });
    }
    protected onData(option: IWorkerMsg): void {
        const currPoint = option.kdinfo;
        const kdinfo = Object.assign({}, currPoint);
        const appearance = this.appearance.default;
        const origin = option.dataArr as any;
        if (!this.locatedPos) {
            this.locatedPos = origin as any;
        }
        let currMat = Transforms.eastNorthUpToFixedFrame(origin as any);
        const cloneMat = Object.assign({}, currMat);
        const scaleM = Matrix4.fromScale(this.style.radius, this.style.radius,  this.style.radius);
        currMat = Matrix4.multiply(currMat, scaleM);
        const geometry = new CustomGeometry(this.rectVAO);
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
        this.material.destroy();
        this.rectVAO = null;
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
    private resetMaterial(style: ILayerStyle) {
        this.material.reset(style);
    }

    private prepareDome() {
        const gridNum = 30;
        const vertex = [];
        const indices = [];
        const uvs: number[] = [];
        for (let j = 0; j <= gridNum; j++) {// gridNum为经纬线数
            const aj = j / gridNum * Math.PI;
            const sj = Math.sin(aj);
            const cj = Math.cos(aj);
            for (let i = 0; i <= gridNum; i++) {
                const ai = i / gridNum * Math.PI;
                const si = Math.sin(ai);
                const ci = Math.cos(ai);
                vertex.push(cj); // 2
                vertex.push(ci * sj); // 3
                vertex.push(si * sj); // point为顶点坐标  1
                uvs.push(ai / Math.PI); // 1
                uvs.push(aj / Math.PI); // 2
            }
        }

        for (let j = 0; j < gridNum; j++) {
            for (let i = 0; i < gridNum; i++) {
                const p1 = j * (gridNum + 1) + i;
                const p2 = p1 + (gridNum + 1);

                indices.push(p1); // indices为顶点的索引
                indices.push(p1 + 1);
                indices.push(p2);

                indices.push(p1 + 1);
                indices.push(p2 + 1);
                indices.push(p2);
            }
        }
        this.rectVAO = {
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

    private changeShape(radius: number) {
        const pris = InstanceContainer.getPrimitives(this.collection) as any[];
        pris.forEach((item) => {
            const oldMat = cloneDeep(item.oldMat);
            const scaleM = Matrix4.fromScale(radius, radius,  radius);
            const resMat = Matrix4.multiply(oldMat, scaleM);
            item.modelMatrix = resMat;
            item.shapeMat = resMat;
        });
    }

    private collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }

}
