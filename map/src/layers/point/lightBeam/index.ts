import { cloneDeep } from "lodash";
import { ILayerOption } from "../../../layerManager";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { LightBeamParticlesMaterial } from "../../../map/material/LightBeamParticlesMaterial";
import { ScanEllipseMaterial } from "../../../map/material/ScanEllipseMaterial";
import { SceneServer } from "../../../map/sceneServer";
import { SplitCircle } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { CustomGeometry, CustomPrimitive, KVAppearance, LightBeamMaterial } from "./config";
import { DefaultStyle, ILayerStyle } from "./style";

export class LightBeam extends Point<ILayerStyle> {
    public workerFunName!: string;
    private bottomVAO: any;
    private beamVAO: any;
    private material: any;
    private defaultSplitNum: number = 20;
    private bottomMaterial: any;
    private cylinderVAO: any;
    private particleMaterial: any;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        this.style = {...this.style, ...style};
        // this.changeBloom(this.style.bloom);
        this.resetMaterial();
        this.changeChape();
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
        this.defaultSplitNum = 20;
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.prepareVAO();
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.material = new LightBeamMaterial(this.style);
        this.appearance.default = new KVAppearance({
            type: "MaterialAppearance",
            material: this.material,
        });
        this.bottomMaterial = new ScanEllipseMaterial(this.style);
        this.appearance.bottom = new KVAppearance({
            type: "MaterialAppearance",
            material: this.bottomMaterial,
        });

        this.particleMaterial = new LightBeamParticlesMaterial(this.style);
        this.appearance.particle = new KVAppearance({
            type: "MaterialAppearance",
            material: this.particleMaterial,
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
        const blnum = this.style.radius * this.style.baseRadiusScale * 2;
        const scaleM = Matrix4.fromScale(blnum, blnum,  blnum);
        currMat = Matrix4.multiply(currMat, scaleM);
        const geometry = new CustomGeometry(this.bottomVAO);
        const primitive = new CustomPrimitive(geometry.geometry as any, this.appearance.bottom) as any;
        primitive.setMatrix(currMat, scaleM);
        primitive.primitive.id = "bottom_" + kdinfo.id;
        primitive.primitive.kd_info = kdinfo;
        primitive.primitive.oldMat = cloneMat;
        primitive.primitive.oldPosition = Object.assign({}, origin);
        this.collection.add(primitive);

        const geometry1 = new CustomGeometry(this.beamVAO);
        const primitive1 = new CustomPrimitive(geometry1.geometry as any, appearance) as any;
        const blnum1 = this.style.radius * this.style.ratio;
        const beamScaleMat = Matrix4.fromScale(this.style.radius, this.style.radius,  blnum1);
        primitive1.setMatrix(Matrix4.multiply(cloneMat, beamScaleMat), beamScaleMat);
        primitive1.primitive.id = "beam_" + kdinfo.id;
        primitive1.primitive.kd_info = kdinfo;
        primitive1.primitive.oldMat = cloneMat;
        primitive1.primitive.oldPosition = Object.assign({}, origin);
        this.collection.add(primitive1);


        const geometry2 = new CustomGeometry(this.cylinderVAO);
        const primitive2 = new CustomPrimitive(geometry2.geometry as any, this.appearance.particle) as any;
        const blnum2 = this.style.radius * this.style.ratio;
        const beamScaleMat2 = Matrix4.fromScale(this.style.radius, this.style.radius,  blnum2);
        primitive2.setMatrix(Matrix4.multiply(cloneMat, beamScaleMat2), beamScaleMat2);
        primitive2.primitive.id = "beam_part" + kdinfo.id;
        primitive2.primitive.kd_info = kdinfo;
        primitive2.primitive.oldMat = cloneMat;
        primitive2.primitive.oldPosition = Object.assign({}, origin);
        this.collection.add(primitive2);
    }
    protected onDestroy(): void {
        this.viewer.removePrimitive(this.collection);
        this.workerFunName = null as any;
        this.collection = null as any;
        this.bottomVAO = null as any;
        this.beamVAO = null as any;
        this.material = null as any;
        this.defaultSplitNum = null as any;
        this.bottomMaterial = null as any;
    }
    protected onDataOver(): void {
        // this.collectionToScene();
        // this.changeBloom(this.style.bloom);
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
    }
    protected collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    private prepareVAO() {
        this.beamVAO = {
            type: "TRIANGLES",
            indexs: this.formTriangleIndex(this.defaultSplitNum),
            position: {
                values: this.formVertex(this.defaultSplitNum),
                componentDatatype: "DOUBLE",
                componentsPerAttribute: 3,
            },
            st: {
                values: this.formUVS(this.defaultSplitNum),
                componentDatatype: "FLOAT",
                componentsPerAttribute: 2,
            },
        };
        this.bottomVAO = this.prepareBottomVAO();


        const splitNum = 30;
        const baseVertexs = SplitCircle(splitNum);
        const topVertexs: any[] = [];
        baseVertexs.forEach((item, index) => { // 组织离地圆顶点
            if (index % 3 === 2) {
                topVertexs.push(1);
            } else {
                topVertexs.push(item);
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
        this.cylinderVAO = {
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
    private formTriangleIndex(num: number) {
        const sjxArr = [];
        for (let i = 1; i <= num; i++) {
            let nextI = i + 1;
            nextI = nextI > num ? nextI % num : nextI;
            sjxArr.push(0, i, nextI);
        }
        return new Uint16Array(sjxArr);
    }
    private formUVS(num: number)  {
        const uvsArr = [];
        uvsArr.push(1, 1);
        for (let i = 0; i < num; i++) {
            uvsArr.push(0, 0);
        }
        return new Float32Array(uvsArr);
    }
    private formVertex(num: number) {
        const vertexArr = [];
        vertexArr.push(0, 0, 1);
        for (let i = 0; i < num; i++) {
            const currAngle = (360 / num) * i;
            const currRad = currAngle / 180 * Math.PI;
            const currX = Math.cos(currRad);
            const currY = Math.sin(currRad);
            vertexArr.push(currX, currY, 0);
        }
        return new Float32Array(vertexArr);
    }
    private prepareBottomVAO() {
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
        return {
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
    private resetMaterial() {
        this.material.reset(this.style);
        this.bottomMaterial.reset(this.style);
        this.particleMaterial.reset(this.style);
        this.changeBloom(this.style.bloom);
    }
    private changeChape() {
        const pris = InstanceContainer.getPrimitives(this.collection) as any[];
        pris.forEach((item) => {
            const id  = item.id.split("_")[0];
            const oldMat = cloneDeep(item.oldMat);
            if (id === "bottom") {
                const blnum = this.style.radius * this.style.baseRadiusScale * 2;
                const scaleM = Matrix4.fromScale(blnum, blnum,  blnum);
                const resMat = Matrix4.multiply(oldMat, scaleM);
                item.modelMatrix = resMat;
            } else if (id === "beam") {
                const blnum1 = this.style.radius * this.style.ratio;
                const beamScaleMat = Matrix4.fromScale(this.style.radius, this.style.radius,  blnum1);
                item.modelMatrix = Matrix4.multiply(oldMat, beamScaleMat);
            }
        });
    }
}
