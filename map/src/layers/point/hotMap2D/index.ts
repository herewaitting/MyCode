import * as Cesium from "cesium";

import { ILayerOption } from "../../../layerManager";
import { Cartesian3 } from "../../../map/core/Cartesian3";
import { Matrix4 } from "../../../map/core/Matrix4";
import { Transforms } from "../../../map/core/Transforms";
// import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { HotMapMaterial } from "../../../map/material/HotMapMaterial";
import { ClearCommand } from "../../../map/render/ClearCommand";
import { Framebuffer } from "../../../map/render/Framebuffer";
import { Texture } from "../../../map/render/Texture";
import { OrthographicCamera } from "../../../map/scene/OrthographicCamera";
import { SceneServer } from "../../../map/sceneServer";
import { IWorkerMsg } from "../../layer";
import { KVAppearance } from "../domeCover/config";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export class HotMap2D extends Point<ILayerStyle> {
    public workerFunName: string = "HotMapFun";
    private ortCamera: any;
    private fboClearCommand: any;
    private hotArea: any;
    private sedaiTexture: any;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
    }
    public collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    public removeData(): void {
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: ILayerStyle): void {
        this.style.alpha = style.alpha;
        this.style.showNum = style.showNum;
        if (this.sedaiTexture) {
            if (style.colorCard && style.colorCard !== this.style.colorCard) {
                const img = new Image();
                img.onload = () => {
                    this.sedaiTexture.destroy();
                    this.sedaiTexture = null;
                    this.sedaiTexture = new Texture(this.viewer, {
                        source: img,
                    });
                };
                this.style.colorCard = style.colorCard;
                img.src = style.colorCard;
            }
            if (style.pointSize && this.style.pointSize !== style.pointSize) {
                this.style.pointSize = style.pointSize;
                this.destroyFbo();
                this.createTexture();
                this.drawRed();
            }
            return;
        }
        this.style.colorCard = style.colorCard || this.style.colorCard;
        this.style.pointSize = style.pointSize || this.style.pointSize;
    }
    protected onHide(): void {
        this.collection.hide();
    }
    protected onShow(): void {
        this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "HotMapFun";
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.beforeWorker();
        this.fboClearCommand = new ClearCommand({
            color: "rgba(0,0,0,0)",
        });
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.appearance.default = {...this.appearance.default, ...this.style};
    }
    protected onData(message: IWorkerMsg): void {
        const data = message.dataArr as any[];
        if (!data || !data.length) { return; }
        this.hotArea = {};
        let totalLon = 0;
        let totalLat = 0;
        this.hotArea.points = [];
        data.forEach((point) => {
            totalLat += point.latitude;
            totalLon += point.longitude;
            const worldPos = Cartesian3.fromDegrees(point.longitude, point.latitude);
            (worldPos as any).weight = point.weight || 1.0;
            this.hotArea.points.push(worldPos);
        });
        totalLon = totalLon / data.length;
        totalLat = totalLat / data.length;
        this.hotArea.center = {
            lon: totalLon,
            lat: totalLat,
        };
        const centerCar = Cartesian3.fromDegrees(totalLon, totalLat);
        this.hotArea.trans = Transforms.eastNorthUpToFixedFrame(centerCar);
        this.hotArea.inverTrans =
        Matrix4.inverse(this.hotArea.trans);
    }
    protected onDestroy(): void {
        this.destroyFbo();
        this.locatedPos = null as any;
        this.viewer.removePrimitive(this.collection);
    }
    protected onDataOver(): void {
        this.afterWorker();
        // this.collectionToScene();
        // if (this.baseCfg.visible) {
        //     this.onShow();
        // } else {
        //     this.onHide();
        // }
    }
    private beforeWorker() {
        this.createCamera();
    }
    private afterWorker() {
        this.prepareVAO();
        this.createTexture();
        this.createCommand();
        this.drawRed();
        this.prepareApperance();
        this.createPrimitive();
    }
    private createCamera() {
        this.ortCamera =  OrthographicCamera;
    }
    private createTexture() {
        const width = 4096;
        const currArea = this.hotArea;
        const height = width * currArea.ratio;
        const tt = new Texture(this.viewer, {
            width,
            height,
            pixelFormat: "RGBA",
            pixelDatatype: "FLOAT",
        });

        currArea.framebuffer = new Framebuffer(this.viewer, {
            colorTextures: [tt],
            destroyAttachments: true,
        });
    }
    private prepareApperance() {
        const currArea = this.hotArea;
        const currTexture = currArea.framebuffer.framebuffer._colorTextures[0];
        currTexture.type = "sampler2D";
        const img = new Image();
        img.onload = () => {
            this.sedaiTexture = new Texture(this.viewer, {
                source: img,
            });
        };
        img.src = this.style.colorCard;
        const material = new HotMapMaterial({
            image: currTexture,
            sedai: this.style.colorCard,
            alpha: this.style.alpha,
            showNum: 0.0,
        });
        const owner = this;
        material.setUpdateFun([(material: any, context: any) => {
            material.uniforms.alpha = owner.style.alpha;
            material.uniforms.showNum = owner.style.showNum;
            material._uniforms.image_0 = () => {
                return this.hotArea.framebuffer.framebuffer._colorTextures[0];
            };
            material._uniforms.sedai_1 = () => {
                return owner.sedaiTexture.texture;
            };
        }]);
        currArea.appearance = new KVAppearance({
            type: "MaterialAppearance",
            material,
        });
    }
    private prepareVAO() {
        const currTrans = this.hotArea.trans;
        const inverTrans = this.hotArea.inverTrans;
        let minX = 999999;
        let minY = 999999;
        let maxX = -999999;
        let maxY = -999999;
        const indexArr: number[] = [];
        const vertexArr: number[] = [];
        const localPosArr: Cartesian3[] = [];
        (this.hotArea.points as Cartesian3[]).forEach((point, index) => {
            indexArr.push(index);
            let lpoint: Cartesian3 = new Cartesian3();
            lpoint = Matrix4.multiplyByPoint(inverTrans, point);
            localPosArr.push(lpoint);
            vertexArr.push(lpoint.x, lpoint.y, 0, (point as any).weight);
            if (minX >= lpoint.x) {
                minX = lpoint.x;
            }
            if (minY >= lpoint.y) {
                minY = lpoint.y;
            }
            if (maxX <= lpoint.x) {
                maxX = lpoint.x;
            }
            if (maxY <= lpoint.y) {
                maxY = lpoint.y;
            }
        });
        const llb = new Cartesian3(minX, minY, 0);
        const llt = new Cartesian3(minX, maxY, 0);
        const lrt = new Cartesian3(maxX, maxY, 0);
        const lrb = new Cartesian3(maxX, minY, 0);
        const wlb = Matrix4.multiplyByPoint(currTrans, llb);
        const wlt = Matrix4.multiplyByPoint(currTrans, llt);
        const wrt = Matrix4.multiplyByPoint(currTrans, lrt);
        const wrb = Matrix4.multiplyByPoint(currTrans, lrb);
        this.hotArea.carps = [wlb, wlt, wrt, wrb];
        this.hotArea.indexs = indexArr;
        this.hotArea.ratio = (maxY - minY) / (maxX - minX);
        this.hotArea.vertexs = vertexArr;
        this.hotArea.localPosArr = localPosArr;
    }
    private createGeometry = (vertexs: number[], indexs: number[]) => {// 创建geometry
        const positions = new Float64Array(vertexs) as any;
        const bs = Cesium.BoundingSphere.fromVertices(positions as any);
        return new Cesium.Geometry({
            attributes : {
              position : new Cesium.GeometryAttribute({
                componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute : 4,
                values : positions,
              }),
            },
            indices : new Uint16Array(indexs),
            primitiveType : Cesium.PrimitiveType.POINTS,
            boundingSphere : bs,
        } as any);
    }
    private createCommand() {
        const context = (this.viewer.scene as any).context;
        const currArea = this.hotArea;
        const geometry = this.createGeometry(currArea.vertexs, currArea.indexs);
        const sp = (Cesium as any).ShaderProgram.fromCache({
            context,
            vertexShaderSource: HotMapVS,
            fragmentShaderSource: HotMapFS,
            attributeLocations: {
                position: 0,
            },
        });
        const vao = (Cesium as any).VertexArray.fromGeometry({
            context,
            geometry,
            attributeLocations: sp._attributeLocations,
            bufferUsage: (Cesium as any).BufferUsage.STATIC_DRAW,
            interleave: true,
        });

        const rs = new (Cesium as any).RenderState();
        rs.depthRange.near = -1000000.0;
        rs.depthRange.far = 1000000.0;
        rs.blending.enabled = true;
        rs.blending.functionSourceAlpha = context._gl.ONE;
        rs.blending.functionSourceRgb = context._gl.ONE;
        rs.blending.functionDestinationRgb = context._gl.ONE;
        rs.blending.functionDestinationAlpha = context._gl.ONE;
        currArea.drawCommand = new (Cesium as any).DrawCommand({
            boundingVolume: geometry.boundingSphere,
            primitiveType: Cesium.PrimitiveType.POINTS,
            vertexArray: vao,
            shaderProgram: sp,
            renderState: rs,
            uniformMap: {
                u_pointSize: () => {
                    return this.style.pointSize;
                },
            },
            pass : (Cesium as any).Pass.TRANSLUCENT,
        });
    }
    private drawRed() {
        const width = 4096;
        const context = (this.viewer.scene as any).context;
        const currArea = this.hotArea;
        this.fboClearCommand.setFBO(currArea.framebuffer);
        this.fboClearCommand.execute(this.viewer);
        const height = width * currArea.ratio;
        if (!currArea._passState) {
            currArea._passState = new (Cesium as any).PassState(context);
        }
        currArea._passState.viewport = new Cesium.BoundingRectangle(0, 0, width, height);
        const us = context.uniformState;
        const bg = Cesium.BoundingRectangle.fromPoints(currArea.localPosArr, new Cesium.BoundingRectangle());
        this.ortCamera.frustum.left = bg.x;
        this.ortCamera.frustum.top = bg.y + bg.height;
        this.ortCamera.frustum.right = bg.x + bg.width;
        this.ortCamera.frustum.bottom = bg.y;
        us.updateCamera(this.ortCamera);
        currArea.drawCommand.framebuffer = currArea.framebuffer.framebuffer;
        us.updatePass(currArea.drawCommand.pass);
        currArea.drawCommand.execute(context, currArea._passState);
    }
    private createPrimitive() {
        const currArea = this.hotArea;
        const rectangle = new Cesium.PolygonGeometry({
            polygonHierarchy : new Cesium.PolygonHierarchy(currArea.carps),
        });
        const instance = new Cesium.GeometryInstance({
            geometry: rectangle,
        });
        currArea.primitive = new Cesium.GroundPrimitive({
            geometryInstances: instance,
            appearance: currArea.appearance.appearance,
        });
        this.collection.add(currArea.primitive);
    }
    private destroyFbo() {
        const currArea = this.hotArea;
        const fbo = currArea.framebuffer.framebuffer;
        fbo._colorTextures[0].destroy();
        fbo.destroy();
        currArea.framebuffer = null;
    }
}

const HotMapVS = `
uniform float u_pointSize;
attribute vec4 position;
varying float weightNum;
void main()
{
    weightNum = position.w;
    vec4 pos = vec4(position.xyz,1.0);
    gl_Position = czm_projection*pos;
    gl_PointSize = u_pointSize;
}
`;

const HotMapFS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

#define OES_texture_float_linear
varying float weightNum;
void main()
{
    float d = length(gl_PointCoord * 2.0 - vec2(1.0));
    if(1.0 - d > 0.0){
        float rnum = pow(1.0 - d, 2.0) * weightNum;
        gl_FragColor = vec4(rnum, 0.0, 0.0, rnum);
    }
}
`;
