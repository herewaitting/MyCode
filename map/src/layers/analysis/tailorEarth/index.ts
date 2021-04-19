import * as Cesium from "cesium";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KvLog } from "../../../tools/log";
import { IWorkerMsg } from "../../layer";
import { Analysis } from "../analysis";
import { DefaultStyle, ILayerStyle } from "./style";

export class TailorEarth extends Analysis<ILayerStyle> {
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
    public removeData(): void {
        this.onHide();
    }
    public updateStyle(style: any): void {
        //
    }
    protected onHide(): void {
        (this.viewer.scene.globe as any)._surface.tileProvider.applyTailor = false;
        (Cesium.ExpandBySTC as any).enableTailor = false;
    }
    protected onShow(): void {
        (this.viewer.scene.globe as any)._surface.tileProvider.applyTailor = true;
        (Cesium.ExpandBySTC as any).enableTailor = true;
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.collection = new InstanceContainer("primitive");
        this.workerFunName = "PolygonWorkerFun";
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        this.style = {...this.style, ...(style || {})};
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
        (this.viewer.scene.globe as any)._surface.tileProvider.applyTailor = false;
        (Cesium.ExpandBySTC as any).enableTailor = false;
        (Cesium.ExpandBySTC as any).inverTailorCenterMat = Cesium.Matrix4.IDENTITY;
        (Cesium.ExpandBySTC as any).tailorArea = undefined;
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
        (Cesium.ExpandBySTC as any).tailorRect = new Cesium.Cartesian4(bg.x, bg.y, bg.width, bg.height);
    }
    private prepareFBO() {
        const context = (this.viewer.scene as any).context;
        const width = this.style.canvasWidth || 512;
        const yanmoTex = new Cesium.Texture({
            context,
            width: width,
            height: width * this.ratio,
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
        const width = this.style.canvasWidth || 512;
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
        (this.viewer.scene.globe as any)._surface.tileProvider.applyTailor = true;
        (Cesium.ExpandBySTC as any).inverTailorCenterMat = this.inverTrans;
        (Cesium.ExpandBySTC as any).tailorArea = this.yanmoFbo;
        (Cesium.ExpandBySTC as any).enableTailor = true;
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

// var points = [
//     new Cesium.Cartesian3(-1715292.6999753984, 4993153.157628936, 3566663.752912529),
//     new Cesium.Cartesian3(-1715285.8150713604, 4993167.072601330,3566647.6921528564),
//     new Cesium.Cartesian3(-1715286.5985765400, 4993181.309761941, 3566627.519787549),
//     new Cesium.Cartesian3(-1715299.0249209427, 4993191.177501195, 3566607.861264360),
//     new Cesium.Cartesian3(-1715349.5762367432, 4993176.675656664, 3566603.878289345),
//     new Cesium.Cartesian3(-1715375.5538853381, 4993159.990032478, 3566614.671147202),
//     new Cesium.Cartesian3(-1715370.1945772346, 4993141.041835706, 3566643.580587877),
//     new Cesium.Cartesian3(-1715359.7019716015, 4993131.063945592, 3566662.468046927),
//     new Cesium.Cartesian3(-1715321.9141253997, 4993137.762602262, 3566671.205164391)
//    ];

//    var pointsLength = points.length;
// var clippingPlanes = []; // 存储ClippingPlane集合
// for (var i = 0; i < pointsLength; ++i) {
//  var nextIndex = (i + 1) % pointsLength;
//  var midpoint = Cesium.Cartesian3.add(points[i], points[nextIndex], new Cesium.Cartesian3());
//   midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);
//  var up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
//  var right = Cesium.Cartesian3.subtract(points[nextIndex], midpoint, new Cesium.Cartesian3());
//  right = Cesium.Cartesian3.normalize(right, right);
//  var normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
//   normal = Cesium.Cartesian3.normalize(normal, normal);
//  var originCenteredPlane = new Cesium.Plane(normal, 0.0);
//  var distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);
//   clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
// }

// tslint:disable-next-line: max-line-length
// 注： 这里要特别注意一点，为了下面的计算 ClippingPlane 方便，采集点顺序最好是 逆时针，如果点集的组织是顺时针，需要首先逆序成逆时针，关于如果判断一个点集是否是顺时针或者是逆时针，可以用向量法求多边形面积的方式，如果为正，则为顺时针，否者为逆时针。或者使用JS插件计算，比如turf.js。
