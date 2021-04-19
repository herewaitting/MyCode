import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { CommonWaterMaterial } from "../../../map/material/CommonWater";
import { CreatePolygonGeometry, PolygonGeometryPrimitive } from "../../../map/primitive/PolygonGeometry";
import { SceneServer } from "../../../map/sceneServer";
import { KvLog } from "../../../tools/log";
import { IWorkerMsg } from "../../layer";
import { Polygon } from "../polygon";
import { DefaultStyle, ILayerStyle } from "./style";

export class CommonWater extends Polygon<ILayerStyle> {
    public workerFunName!: string;
    private material: any;
    private temparr: any;
    private conditionMaterial: any;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, initOpts);
        if (!this.viewer) { return; }
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        this.dealCondition(style);
        // this.createConditionApp();
        this.resetMaterial(style);
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
        this.workerFunName = "PolygonWorkerFun";
        this.temparr = [];
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.conditionMaterial = {};
        this.conditionAppearance = {};
        this.collectionToScene();
        if (this.baseCfg.visible) {
            if (this.judgeCurrLevlShow()) {
                this.onShow();
            } else {
                this.onHide();
            }
        } else {
            this.onHide();
        }
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.dealCondition(this.style);
        this.material = new CommonWaterMaterial(this.style);
        this.appearance.default = this.style;
        this.conditionAppearance.default = new KVAppearance({
            type: "EllipsoidSurfaceAppearance",
            material: this.material,
            fragmentShaderSource: waterShader,
        });
        // this.createConditionApp();
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
        const done = option.done;
        if (!data || !data.length) {
            return;
        }
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, data[0]);
        }
        const line = CreatePolygonGeometry({
            data,
            holes: option.holesArr,
        });
        if (!this.baseCfg.mergeDraw) {
            // const appearance = this.conditionAppearance[option.currStyle];
            const appearance = this.conditionAppearance.default;
            const primitive = new PolygonGeometryPrimitive({
                data: line,
                ground: true,
            });
            primitive.setAppearance(appearance);
            this.collection.add(primitive);
            return;
        }
        this.temparr.push(line);
        if (!done) {
            return;
        }
        const appearance = this.conditionAppearance.default;
        // const currStyle = this.appearance[option.currStyle];
        const primitive = new PolygonGeometryPrimitive({
            data: this.temparr,
            ground: true,
        });
        primitive.setAppearance(appearance);
        this.collection.add(primitive);
        this.temparr = [];
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
        if (this.baseCfg.visible) {
            if (this.judgeCurrLevlShow()) {
                this.onShow();
            } else {
                this.onHide();
            }
        } else {
            this.onHide();
        }
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
        this.conditionMaterial[condition] = new CommonWaterMaterial(style as any);
    }
    private collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    private resetMaterial(style: ILayerStyle) {
        // this.material.reset({...this.style, ...style});
        this.conditionAppearance.default.resetMaterial({...this.style, ...style});
        // const {condition, ...defaultStyle} = style;
        // if (condition && condition.forEach) {
        //     condition.forEach((item: any) => {
        //         const currStyle = {...this.style, ...{...defaultStyle, ...item.style}};
        //         this.conditionAppearance[item.condition].resetMaterial(currStyle);
        //     });
        // }
    }
    // private createConditionApp() {
    //     Object.keys(this.conditionMaterial).forEach((item) => {
    //         this.conditionAppearance[item] = new KVAppearance({
    //             type: "PolylineMaterial",
    //             material: this.conditionMaterial[item],
    //         });
    //     });
    // }
}

const waterShader = `varying vec3 v_positionMC;\n
varying vec3 v_positionEC;\n
varying vec2 v_st;\n
void main()\n
{\n
    czm_materialInput materialInput;\n
    vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n
    #ifdef FACE_FORWARD\n
    normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n
    #endif\n
    materialInput.s = v_st.s;\n
    materialInput.st = v_st;\n
    materialInput.str = vec3(v_st, 0.0);\n
    materialInput.normalEC = normalEC;\n
    materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\n
    vec3 positionToEyeEC = -v_positionEC;\n
    materialInput.positionToEyeEC = positionToEyeEC;\n
    czm_material material = czm_getMaterial(materialInput);\n
    #ifdef FLAT\n
    gl_FragColor = vec4(material.diffuse + material.emission, 0.5);\n
    #else\n
    gl_FragColor = czm_phong(normalize(positionToEyeEC), material,vec3(0.7));\
    gl_FragColor.a=0.5;\n
    #endif\n
}\n`;
