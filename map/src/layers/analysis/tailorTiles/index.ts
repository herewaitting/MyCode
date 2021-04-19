import * as Cesium from "cesium";
import { InstanceContainer } from "../../../map/instanceContainer";
import { SceneServer } from "../../../map/sceneServer";
import { KvLog } from "../../../tools/log";
import { IWorkerMsg } from "../../layer";
import { Analysis } from "../analysis";
import { DefaultStyle, ILayerStyle } from "./style";

export class TailorTiles extends Analysis<ILayerStyle> {
    public layerType: string = "Polygon";
    public workerFunName!: string;
    private trans!: Cesium.Matrix4;
    private inverTrans!: Cesium.Matrix4;
    private ratio!: number;
    private localPos: any;
    private drawAreaCommand!: any;
    private ortCamera: any;
    private yanmoFbo: any;
    private yanmoTex: any;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerStyle) {
        super(viewer, layerName, initOpts as any);
    }
    public removeData(): void {
        this.onHide();
    }
    public updateStyle(style: any): void {
        //
    }
    public setData(oriData: any) {
        if (!oriData) {
            return;
        }
        if (oriData instanceof Array) {
            const posArr = oriData.reduce((a, b) => a.concat(b));
            const data = Cesium.Cartesian3.fromDegreesArray(posArr);
            if (!this.locatedPos) {
                this.locatedPos = Object.assign({}, data[0]);
                const context = (this.viewer.scene as any).context;
                let polygon = new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(data),
                });
                polygon = Cesium.PolygonGeometry.createGeometry(polygon) as any;
                const center = (polygon as any).boundingSphere.center;
                this.trans = Cesium.Transforms.eastNorthUpToFixedFrame(center);
                this.inverTrans = Cesium.Matrix4.inverse(this.trans, new Cesium.Matrix4());
                const indexs = (polygon as any).indices;
                const positionVal = (polygon as any).attributes.position.values;
                const len = positionVal.length;
                const localPos = [];
                const localVertex = [];
                let minX = 9999999;
                let minY = 9999999;
                let maxX = -9999999;
                let maxY = -9999999;
                for (let i = 0; i < len; i += 3) {
                    const currx = positionVal[i];
                    const curry = positionVal[i + 1];
                    const currz = positionVal[i + 2];
                    const currCar = new Cesium.Cartesian3(currx, curry, currz);
                    const localp = Cesium.Matrix4.multiplyByPoint(this.inverTrans, currCar, new Cesium.Cartesian3());
                    localp.z = 0;
                    localPos.push(localp);
                    localVertex.push(localp.x);
                    localVertex.push(localp.y);
                    localVertex.push(localp.z);
                    if (minX >= localp.x) {
                        minX = localp.x;
                    }
                    if (minY >= localp.y) {
                        minY = localp.y;
                    }
                    if (maxX <= localp.x) {
                        maxX = localp.x;
                    }
                    if (maxY <= localp.y) {
                        maxY = localp.y;
                    }
                }
                this.ratio = (maxY - minY) / (maxX - minX);
                this.localPos = localPos;
                const lps = new Float64Array(localVertex);
                const bs = Cesium.BoundingSphere.fromVertices(lps as any);
                const localGeo = new Cesium.Geometry({
                    attributes : {
                        position : new Cesium.GeometryAttribute({
                            componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                            componentsPerAttribute : 3,
                            values : lps as any,
                        }),
                    },
                    indices : indexs,
                    primitiveType : Cesium.PrimitiveType.TRIANGLES,
                    boundingSphere : bs,
                } as any);

                const sp = (Cesium as any).ShaderProgram.fromCache({
                    context,
                    vertexShaderSource: PolygonVS,
                    fragmentShaderSource: PolygonFS,
                    attributeLocations: {
                        position: 0,
                    },
                });
                const vao = (Cesium as any).VertexArray.fromGeometry({
                    context,
                    geometry: localGeo,
                    attributeLocations: sp._attributeLocations,
                    bufferUsage: (Cesium as any).BufferUsage.STATIC_DRAW,
                    interleave: true,
                });

                const rs = new (Cesium as any).RenderState();
                rs.depthRange.near = -1000000.0;
                rs.depthRange.far = 1000000.0;
                this.drawAreaCommand = new (Cesium as any).DrawCommand({
                    boundingVolume: bs,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    vertexArray: vao,
                    shaderProgram: sp,
                    renderState: rs,
                    pass : (Cesium as any).Pass.TRANSLUCENT,
                });
            }
            this.onDataOver();
        } else {
            super.setData(oriData);
        }
    }
    protected onHide(): void {
        (Cesium.ExpandBySTC as any).enableTailorTiles = false;
    }
    protected onShow(): void {
        (Cesium.ExpandBySTC as any).enableTailorTiles = true;
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.collection = new InstanceContainer("primitive");
        this.workerFunName = "PolygonWorkerFun";
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        //
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

        const context = (this.viewer.scene as any).context;
        let polygon = new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(data),
        });
        polygon = Cesium.PolygonGeometry.createGeometry(polygon) as any;
        const center = (polygon as any).boundingSphere.center;
        this.trans = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        this.inverTrans = Cesium.Matrix4.inverse(this.trans, new Cesium.Matrix4());
        const indexs = (polygon as any).indices;
        const positionVal = (polygon as any).attributes.position.values;
        const len = positionVal.length;
        const localPos = [];
        const localVertex = [];
        let minX = 9999999;
        let minY = 9999999;
        let maxX = -9999999;
        let maxY = -9999999;
        for (let i = 0; i < len; i += 3) {
            const currx = positionVal[i];
            const curry = positionVal[i + 1];
            const currz = positionVal[i + 2];
            const currCar = new Cesium.Cartesian3(currx, curry, currz);
            const localp = Cesium.Matrix4.multiplyByPoint(this.inverTrans, currCar, new Cesium.Cartesian3());
            localp.z = 0;
            localPos.push(localp);
            localVertex.push(localp.x);
            localVertex.push(localp.y);
            localVertex.push(localp.z);
            if (minX >= localp.x) {
                minX = localp.x;
            }
            if (minY >= localp.y) {
                minY = localp.y;
            }
            if (maxX <= localp.x) {
                maxX = localp.x;
            }
            if (maxY <= localp.y) {
                maxY = localp.y;
            }
        }
        this.ratio = (maxY - minY) / (maxX - minX);
        this.localPos = localPos;
        const lps = new Float64Array(localVertex);
        const bs = Cesium.BoundingSphere.fromVertices(lps as any);
        const localGeo = new Cesium.Geometry({
            attributes : {
                position : new Cesium.GeometryAttribute({
                    componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute : 3,
                    values : lps as any,
                }),
            },
            indices : indexs,
            primitiveType : Cesium.PrimitiveType.TRIANGLES,
            boundingSphere : bs,
        } as any);

        const sp = (Cesium as any).ShaderProgram.fromCache({
            context,
            vertexShaderSource: PolygonVS,
            fragmentShaderSource: PolygonFS,
            attributeLocations: {
                position: 0,
            },
        });
        const vao = (Cesium as any).VertexArray.fromGeometry({
            context,
            geometry: localGeo,
            attributeLocations: sp._attributeLocations,
            bufferUsage: (Cesium as any).BufferUsage.STATIC_DRAW,
            interleave: true,
        });

        const rs = new (Cesium as any).RenderState();
        rs.depthRange.near = -1000000.0;
        rs.depthRange.far = 1000000.0;
        this.drawAreaCommand = new (Cesium as any).DrawCommand({
            boundingVolume: bs,
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            vertexArray: vao,
            shaderProgram: sp,
            renderState: rs,
            pass : (Cesium as any).Pass.TRANSLUCENT,
        });
    }
    protected onDestroy(): void {
        if (this.yanmoTex && this.yanmoTex.destroy) {
            this.yanmoTex.destroy();
        }
        this.yanmoFbo = null;
        (Cesium.ExpandBySTC as any).enableTailorTiles = false;
        (Cesium.ExpandBySTC as any).inverTailorTilesCenterMat = Cesium.Matrix4.IDENTITY;
        (Cesium.ExpandBySTC as any).tailorTilesArea = undefined;
    }
    protected onDataOver(): void {
        this.prepareCamera();
        this.prepareFBO();
        this.drawPolygon();
        this.beginTailor();
        if (this.baseCfg.visible) {
            this.onShow();
        } else {
            this.onHide();
        }
    }

    private prepareCamera() {
        const maxDis = 120000;
        this.ortCamera = {
            viewMatrix: Cesium.Matrix4.IDENTITY,
            inverseViewMatrix: Cesium.Matrix4.IDENTITY,
            frustum: new (Cesium as any).OrthographicOffCenterFrustum(),
            positionCartographic: {
                height: 0,
                latitude: 0,
                longitude: 0,
            },
            positionWC: new Cesium.Cartesian3(0, 0, maxDis / 2),
            directionWC: new Cesium.Cartesian3(0, 0, -1),
            upWC: new Cesium.Cartesian3(0, 1, 0),
            rightWC: new Cesium.Cartesian3(1, 0, 0),
            viewProjectionMatrix: Cesium.Matrix4.IDENTITY,
        };
        const bg = Cesium.BoundingRectangle.fromPoints(this.localPos, new Cesium.BoundingRectangle());
        this.ortCamera.frustum.left = bg.x;
        this.ortCamera.frustum.top = bg.y + bg.height;
        this.ortCamera.frustum.right = bg.x + bg.width;
        this.ortCamera.frustum.bottom = bg.y;
        this.ortCamera.frustum.near = 0.1;
        this.ortCamera.frustum.far = -maxDis;
        (Cesium.ExpandBySTC as any).tailorTilesRect = new Cesium.Cartesian4(bg.x, bg.y, bg.width, bg.height);
    }
    private prepareFBO() {
        const context = (this.viewer.scene as any).context;
        const yanmoTex = new Cesium.Texture({
            context,
            width: 512,
            height: 512 * this.ratio,
            pixelFormat : Cesium.PixelFormat.RGBA,
            pixelDatatype : Cesium.PixelDatatype.FLOAT,
            flipY : false,
        });
        this.yanmoTex = yanmoTex;
        this.yanmoFbo = new Cesium.Framebuffer({
            context,
            colorTextures: [yanmoTex],
            destroyAttachments : false,
        });
    }

    private drawPolygon() {
        const context = (this.viewer.scene as any).context;
        const width = 512;
        const height = width * this.ratio;
        const passState = new (Cesium as any).PassState(context);
        passState.viewport = new Cesium.BoundingRectangle(0, 0, width, height);
        const us = context.uniformState;
        us.updateCamera(this.ortCamera);
        us.updatePass(this.drawAreaCommand.pass);
        this.drawAreaCommand.framebuffer = this.yanmoFbo;
        this.drawAreaCommand.execute(context, passState);
    }

    private beginTailor() {
        (Cesium.ExpandBySTC as any).inverTailorTilesCenterMat = this.inverTrans;
        (Cesium.ExpandBySTC as any).tailorTilesArea = this.yanmoFbo;
        (Cesium.ExpandBySTC as any).enableTailorTiles = true;
    }
}

const PolygonVS =
"attribute vec3 position;\n\
void main()\n\
{\n\
    vec4 pos = vec4(position.xyz,1.0);\n\
    gl_Position = czm_projection*pos;\n\
}";
const PolygonFS =
"\n\
#ifdef GL_FRAGMENT_PRECISION_HIGH\n\
    precision highp float;\n\
#else\n\
    precision mediump float;\n\
#endif\n\
void main()\n\
{\n\
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n\
}\n\
";
