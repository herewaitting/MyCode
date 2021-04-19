import * as Cesium from "cesium";
import { ILayerOption } from "../../../layerManager";
import { Cartesian3 } from "../../../map/core/Cartesian3";
// import { Transforms } from "../../../map/core/Transforms";
// import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { SceneServer } from "../../../map/sceneServer";
import { CustomLabel } from "../../../tools/CustomLabel";
import { Video2Texture } from "../../../tools/Video2Texture";
import { offsetPoint } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Point } from "../point";
import { DefaultStyle, ILayerStyle } from "./style";

export interface ITextDrawInfo {
    ratio: number; // 高比宽，
    uvs: number[][]; // 四个顶点的uv，从左下角顺时针
    dom: Element; // 当前文本所在的canvas元素
    domId: string; // 当前dom编号
    txtWidth: number; // 当前文本宽度，含内边距
}

export interface IBillDrawInfo {
    index: number[];
    uvs: number[];
    dirs: number[];
    VAO: any;
    commands: any[];
    pickCommand: any[];
    [key: string]: any;
}

export interface IBillMergeDrawInfo {
    [key: string]: any;
}

export class VideoBillboard extends Point<ILayerStyle> {
    public workerFunName!: string;
    public tool!: CustomLabel;
    public mergeDraw!: IBillMergeDrawInfo;
    public singleDraw!: IBillDrawInfo;
    public textureManager: any = {};
    public v2tManager!: {[key: string]: Video2Texture};
    private fragmentShader!: string;
    private fboVertexShader!: string;
    // private mergeVS!: string;
    private bgTexture: any;
    // private lastStatus: boolean = true;
    // private showNum: number = 1;
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
    }
    public removeData(): void {
        this.singleDraw.commands = [];
        this.singleDraw.pickCommand = [];
        this.singleDraw.VAO = [];
        this.mergeDraw.commands = [];
        this.mergeDraw.VAOManager = {};
    }
    public updateStyle(style: any): void {
        //
    }
    public update(frameState: any) {
        if (!this.visible) {
            return;
        }
        this.updateVideoTexture();
        const commandList = frameState.commandList;
        if (commandList) {
            if (frameState.passes.render) {
                if (this.baseCfg.mergeDraw) {
                    for (const command of this.mergeDraw.commands) {
                        frameState.commandList.push(command);
                    }
                } else {
                    for (const command of this.singleDraw.commands) {
                        frameState.commandList.push(command);
                    }
                }
            } else if (frameState.passes.pick) {
                if (this.baseCfg.mergeDraw) {
                    //
                } else {
                    for (const command of this.singleDraw.pickCommand) {
                        frameState.commandList.push(command);
                    }
                }
            }
        }
    }
    protected onHide(): void {
        this.visible = false;
        // this.lastStatus = false;
    }
    protected onShow(): void {
        this.visible = true;
        // this.lastStatus = true;
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "PointWorkerFun";
        this.collection = new InstanceContainer("command");
        this.appearance = {};
        this.initShader();
        this.singleDraw = {} as any;
        this.singleDraw.commands = [];
        this.singleDraw.pickCommand = [];
        this.mergeDraw = {};
        this.mergeDraw.VAOManager = {};
        this.mergeDraw.commands = [];
        this.bgTexture = {};
        this.v2tManager = {};
        this.viewer.scene.primitives.add(this);
    }
    protected async onStyle<ILayerStyle>(style: ILayerStyle) {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.appearance.default = {...this.appearance.default, ...this.style};
        this.dealCondition(this.style);
        this.style.layerName = this.layerName;
        this.prepareBgTexture();
        this.prepareBgVideo();
    }
    protected prepareBgVideo() {
        const cons = Object.keys(this.appearance);
        const that = this;
        for (const con of cons) {
            that.v2tManager[con] = new Video2Texture(that.appearance[con]);
        }
    }
    protected prepareBgTexture() {
        const cons = Object.keys(this.appearance);
        const that = this;
        for (const con of cons) {
            const currBgImg = that.appearance[con].imgUrl;
            const img = new Image();
            img.onload = () => {
                that.bgTexture[con] = new Cesium.Texture({
                    context: (that.viewer.scene as any).context,
                    source: img,
                    pixelFormat: Cesium.PixelFormat.RGBA,
                    pixelDatatype: Cesium.PixelDatatype.FLOAT,
                });
            };
            img.src = currBgImg;
        }
    }
    protected onData(option: IWorkerMsg): void {
        const data = (option as any).dataArr;
        if (!data) {
            return;
        }
        if (!this.locatedPos) {
            this.locatedPos = Object.assign({}, data) as any;
        }
        const currStyle = this.appearance[option.currStyle] || this.appearance.default;
        this.prepareDraw(option, currStyle);
    }
    protected onDestroy(): void {
        this.viewer.scene.primitives.remove(this);
        this.destroyTexture();
    }
    protected onDataOver(): void {
        const that = this;
        // if (this.baseCfg.mergeDraw) {
        //     this.prepareMergeVAO();
        // }
        that.prepareCommand();
        that.playVideo();
        // that.prepareMergeCommand();
        // if (this.baseCfg.visible) {
        //     if (this.judgeCurrLevlShow()) {
        //         this.onShow();
        //     } else {
        //         this.onHide();
        //     }
        // } else {
        //     this.onHide();
        // }
    }
    private playVideo() {
        const conArr = Object.keys(this.v2tManager);
        conArr.forEach((con) => {
            if (this.v2tManager[con] && this.v2tManager[con].dom) {
                (this.v2tManager[con].dom as any).play();
            }
        });
    }
    private updateVideoTexture() {
        const conArr = Object.keys(this.v2tManager);
        conArr.forEach((con) => {
            if (this.v2tManager[con] && this.v2tManager[con].getTexture) {
                this.v2tManager[con].getTexture(this.viewer);
            }
        });
    }
    private prepareDraw(option: IWorkerMsg, style: ILayerStyle) {
        if (this.baseCfg.mergeDraw) {
            // this.prepareMerge(option, style);
        } else {
            this.prepareSingle(option, style);
        }
    }
    // private prepareMergeVAO() {
    //     const domids = Object.keys(this.mergeDraw.VAOManager);
    //     for (const domId of domids) {
    //         const curr = this.mergeDraw.VAOManager[domId];
    //         this.mergeDraw.VAOManager[domId].VAO = {
    //             index: new Uint16Array(curr.indexs),
    //             vertex_H: {
    //                 values: new Float32Array(curr.vertexs_H),
    //                 componentDatatype: "DOUBLE",
    //                 componentsPerAttribute: 3,
    //             },
    //             vertex_L: {
    //                 values: new Float32Array(curr.vertexs_L),
    //                 componentDatatype: "DOUBLE",
    //                 componentsPerAttribute: 3,
    //             },
    //             uv: {
    //                 values: new Float32Array(curr.uv),
    //                 componentDatatype: "FLOAT",
    //                 componentsPerAttribute: 4,
    //             },
    //             color: {
    //                 values: new Float32Array(curr.color),
    //                 componentDatatype: "FLOAT",
    //                 componentsPerAttribute: 4,
    //             },
    //             texture: domId,
    //         };
    //     }
    // }
    private prepareSingle(option: IWorkerMsg, style: ILayerStyle) {
        let point = option.dataArr as any;
        const baseCfg = this.baseCfg;
        // tslint:disable-next-line: max-line-length
        point = offsetPoint(point as any, (baseCfg as any).northOffset, (baseCfg as any).eastOffset, (this.style as any).heightOffset || 0.0) as any;
        // tslint:disable-next-line: variable-name
        const vertexs_H = [];
        // tslint:disable-next-line: variable-name
        const vertexs_L = [];
        const indexs = [];
        const uvs = [];
        const colors = [];
        indexs.push(0);
        indexs.push(2);
        indexs.push(1);
        indexs.push(0);
        indexs.push(3);
        indexs.push(2);
        const currDF = computedDoubleFloat(point);
        vertexs_H.push(currDF[0]);
        vertexs_H.push(currDF[2]);
        vertexs_H.push(currDF[4]);
        vertexs_L.push(currDF[1]);
        vertexs_L.push(currDF[3]);
        vertexs_L.push(currDF[5]);

        vertexs_H.push(currDF[0]);
        vertexs_H.push(currDF[2]);
        vertexs_H.push(currDF[4]);
        vertexs_L.push(currDF[1]);
        vertexs_L.push(currDF[3]);
        vertexs_L.push(currDF[5]);

        vertexs_H.push(currDF[0]);
        vertexs_H.push(currDF[2]);
        vertexs_H.push(currDF[4]);
        vertexs_L.push(currDF[1]);
        vertexs_L.push(currDF[3]);
        vertexs_L.push(currDF[5]);

        vertexs_H.push(currDF[0]);
        vertexs_H.push(currDF[2]);
        vertexs_H.push(currDF[4]);
        vertexs_L.push(currDF[1]);
        vertexs_L.push(currDF[3]);
        vertexs_L.push(currDF[5]);

        uvs.push(0, 0);
        uvs.push(0, 1);
        uvs.push(1, 1);
        uvs.push(1, 0);
        // const trans = Cesium.Transforms.eastNorthUpToFixedFrame(point as any);
        // const trans = Cesium.Matrix4.IDENTITY;
        // let currMat = trans;
        const ratio = style.ratio || 1.0;
        const zxj = new Cesium.Cartesian3(-1, -ratio, 0);
        // Cesium.Matrix4.multiplyByPointAsVector(trans, zxj, zxj);
        // Cesium.Cartesian3.normalize(zxj, zxj);
        colors.push(zxj.x, zxj.y, zxj.z);

        const zsj = new Cesium.Cartesian3(-1, ratio, 0);
        // Cesium.Matrix4.multiplyByPointAsVector(trans, zsj, zsj);
        // Cesium.Cartesian3.normalize(zsj, zsj);
        colors.push(zsj.x, zsj.y, zsj.z);

        const ysj = new Cesium.Cartesian3(1, ratio, 0);
        // Cesium.Matrix4.multiplyByPointAsVector(trans, ysj, ysj);
        // Cesium.Cartesian3.normalize(ysj, ysj);
        colors.push(ysj.x, ysj.y, ysj.z);

        const yxj = new Cesium.Cartesian3(1, -ratio, 0);
        // Cesium.Matrix4.multiplyByPointAsVector(trans, yxj, yxj);
        // Cesium.Cartesian3.normalize(yxj, yxj);
        colors.push(yxj.x, yxj.y, yxj.z);

        const VAO = {
            index: new Uint16Array(indexs),
            vertex_H: {
                values: new Float32Array(vertexs_H),
                componentDatatype: "DOUBLE",
                componentsPerAttribute: 3,
            },
            vertex_L: {
                values: new Float32Array(vertexs_L),
                componentDatatype: "DOUBLE",
                componentsPerAttribute: 3,
            },
            uv: {
                values: new Float32Array(uvs),
                componentDatatype: "FLOAT",
                componentsPerAttribute: 2,
            },
            color: {
                values: new Float32Array(colors),
                componentDatatype: "FLOAT",
                componentsPerAttribute: 3,
            },
            txtWidth: style.size,
            id: option.kdinfo.id,
            kdinfo: option.kdinfo,
            option,
        };

        if (!this.singleDraw.VAO) {
            this.singleDraw.VAO = [];
        }
        this.singleDraw.VAO.push(VAO);
    }
    private prepareCommand() {
        if (this.baseCfg.mergeDraw) {
            return;
        }
        const context = (this.viewer.scene as any).context;
        const vs = this.fboVertexShader;
        const fs = this.fragmentShader;
        const width = context.drawingBufferWidth;
        const height = context.drawingBufferHeight;
        const sp = (Cesium as any).ShaderProgram.fromCache({
            context,
            vertexShaderSource : vs,
            fragmentShaderSource : fs,
            attributeLocations: {
                position3DHigh: 0,
                position3DLow: 1,
                color: 2,
                st: 3,
            },
        });
        for (const VAO of this.singleDraw.VAO) {
            const indexBuffer = (Cesium as any).Buffer.createIndexBuffer({
                context,
                typedArray : VAO.index,
                usage : (Cesium as any).BufferUsage.STATIC_DRAW,
                indexDatatype : Cesium.IndexDatatype.UNSIGNED_SHORT,
            });

            const va = new (Cesium as any).VertexArray({
                context,
                attributes : [
                    {
                        index : 0,
                        vertexBuffer : (Cesium as any).Buffer.createVertexBuffer({
                            context,
                            typedArray : VAO.vertex_H.values,
                            usage : (Cesium as any).BufferUsage.STATIC_DRAW,
                        }),
                        componentsPerAttribute : 3,
                    },
                    {
                        index : 1,
                        vertexBuffer : (Cesium as any).Buffer.createVertexBuffer({
                            context,
                            typedArray : VAO.vertex_L.values,
                            usage : (Cesium as any).BufferUsage.STATIC_DRAW,
                        }),
                        componentsPerAttribute : 3,
                    },
                    {
                        index : 2,
                        vertexBuffer : (Cesium as any).Buffer.createVertexBuffer({
                            context,
                            typedArray : VAO.color.values,
                            usage : (Cesium as any).BufferUsage.STATIC_DRAW,
                        }),
                        componentsPerAttribute : 3,
                    },
                    {
                        index : 3,
                        vertexBuffer : (Cesium as any).Buffer.createVertexBuffer({
                            context,
                            typedArray : VAO.uv.values,
                            usage : (Cesium as any).BufferUsage.STATIC_DRAW,
                        }),
                        componentsPerAttribute : 2,
                    },
                ],
                indexBuffer,
            });

            const rs = Cesium.RenderState.fromCache();
            const that = this;
            const bs = Cesium.BoundingSphere.fromVertices(VAO.vertex_H.values);
            const command = new (Cesium as any).DrawCommand({
                primitiveType : Cesium.PrimitiveType.TRIANGLES,
                shaderProgram : sp,
                vertexArray : va,
                modelMatrix : Cesium.Matrix4.IDENTITY,
                pickOnly: true,
                renderState: rs,
                boundingVolume: bs,
                uniformMap: {
                    mm() {
                        return (that.viewer.scene.camera.frustum as any)._offCenterFrustum._perspectiveMatrix;
                    },
                    vv() {
                        // return that.viewer.scene.camera._viewMatrix;
                        return that.viewer.scene.camera.viewMatrix;
                    },
                    resolution() {
                        return new Cesium.Cartesian2(width, height);
                    },
                    billWidth() {
                        let width = 0;
                        if (that.style.billWidth) {
                            width = that.style.billWidth;
                        } else {
                            width = VAO.txtWidth;
                        }
                        return width;
                    },
                    scaleByDistance() {
                        const style = that.style;
                        return new Cesium.Cartesian4(style.near, style.scale, style.far, style.ratio);
                    },
                    cameraPosition() {
                        return that.viewer.camera.position;
                    },
                    bgVideo() {
                        return that.v2tManager[VAO.option.currStyle].texture || context.defaultTexture;
                    },
                    distanceDisplay() {
                        return that.style.distanceDisplay;
                    },
                    bgTexture() {
                        return that.bgTexture[VAO.option.currStyle || "default"] || context.defaultTexture;
                    },
                    imgScale() {
                        return 1.0 / (that.appearance[VAO.option.currStyle].imgScale || 1.0);
                    },
                    offsetXY() {
                        return new Cesium.Cartesian2(that.style.offsetX || 0, that.style.offsetY || 0);
                    },
                },
                castShadows: false,
                receiveShadows: false,
                pass : (Cesium as any).Pass.TRANSLUCENT,
            });
            command.id = VAO.id;
            command.kd_info = VAO.kdinfo;
            command.kd_style = this.style;
            this.singleDraw.commands.push(command);

            const pickCommand = new (Cesium as any).DrawCommand({
                owner : command,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                pickOnly : true,
            });
            pickCommand.vertexArray = va;
            pickCommand.renderState = rs;
            const sp1 = (Cesium as any).ShaderProgram.fromCache({
                context,
                vertexShaderSource : vs,
                fragmentShaderSource : (Cesium as any).ShaderSource.createPickFragmentShaderSource(fs, "uniform"),
                attributeLocations: {
                    position3DHigh: 0,
                    position3DLow: 1,
                    color: 2,
                    st: 3,
                },
            });
            command.pickId = context.createPickId({
                primitive : command,
                id : VAO.domId,
            });
            pickCommand.shaderProgram = sp1;
            pickCommand.uniformMap = command.uniformMap;
            pickCommand.uniformMap.czm_pickColor = () => {
                return command.pickId.color;
            };
            pickCommand.pass = (Cesium as any).Pass.TRANSLUCENT;
            pickCommand.boundingVolume = bs;
            pickCommand.modelMatrix = Cesium.Matrix4.IDENTITY;
            this.singleDraw.pickCommand.push(pickCommand);
        }
    }
    private initShader() {
        this.fragmentShader = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        uniform sampler2D bgVideo;
        uniform sampler2D bgTexture;
        uniform float imgScale;
        varying vec2 v_st;
        void main() {
            mat3 m = mat3(imgScale, 0.0,      0.5 * (1.0 - imgScale),
                          0.0,      imgScale, 0.5 * (1.0 - imgScale),
                          0.0,      0.0,      1.0);\n\
            vec3 imgSt  = vec3(v_st,1.0) * m;\n\
            vec4 bgcolor = texture2D(bgTexture,imgSt.xy);
            vec4 videoColor = texture2D(bgVideo,v_st.xy);
            float resNum = step(0.1,distance(videoColor.rgb,vec3(0.0)));
            videoColor = videoColor * resNum;
            gl_FragColor = mix(bgcolor, videoColor, videoColor.a);
        }
        `;

        this.fboVertexShader = `
        attribute vec3 position3DHigh;
        attribute vec3 position3DLow;
        attribute vec3 color;
        attribute vec2 st;
        attribute float batchId;
        uniform mat4 mm;
        uniform mat4 vv;
        uniform vec2 resolution;
        uniform vec2 offsetXY;
        uniform float billWidth;
        uniform vec4 scaleByDistance;
        uniform vec3 cameraPosition;
        uniform bool distanceDisplay;
        varying vec2 v_st;
        vec4 transform(mat4 m,mat4 v,vec3 coord) {
            return m * v * vec4(coord, 1.0);
        }
        vec2 project(vec4 device) {
            vec3 device_normal = device.xyz / device.w;
            vec2 clip_pos = (device_normal * 0.5 + 0.5).xy;
            return clip_pos * resolution;
        }
        vec4 unproject(vec2 screen, float z, float w) {
            vec2 clip_pos = screen / resolution;
            vec2 device_normal = clip_pos * 2.0 - 1.0;
            return vec4(device_normal * w, z, w);
        }
        void main() {
            v_st = st;
            vec3 currP = position3DHigh.xyz + position3DLow.xyz;
            float dis = distance(currP, cameraPosition);
            if (distanceDisplay) {
                if (dis<scaleByDistance.x || dis > scaleByDistance.z) {
                    return;
                }
            }
            float currScale = scaleByDistance.y + (scaleByDistance.w - scaleByDistance.y) * (dis - scaleByDistance.x) / (scaleByDistance.z - scaleByDistance.x);
            currScale = clamp(currScale, scaleByDistance.w, scaleByDistance.y);
            vec4 eyeCurrP = transform(mm,vv,currP);
            vec2 winCurrP = project(eyeCurrP);
            vec3 dirEye = color;
            dirEye = normalize(dirEye);
            vec2 newWinCurrP = winCurrP + dirEye.xy * billWidth * currScale;
            newWinCurrP = offsetXY + newWinCurrP;
            gl_Position = unproject(newWinCurrP, eyeCurrP.z, eyeCurrP.w);
            gl_PointSize = billWidth;
        }
        `;

        // this.mergeVS = `
        // attribute vec3 position3DHigh;
        // attribute vec3 position3DLow;
        // attribute vec4 color;
        // attribute vec4 st;
        // attribute float batchId;
        // uniform mat4 mm;
        // uniform mat4 vv;
        // uniform vec2 resolution;
        // uniform vec2 offsetXY;
        // uniform vec4 scaleByDistance;
        // uniform vec3 cameraPosition;
        // uniform bool distanceDisplay;
        // varying vec4 v_st;
        // vec4 transform(mat4 m,mat4 v,vec3 coord) {
        //     return m * v * vec4(coord, 1.0);
        // }
        // vec2 project(vec4 device) {
        //     vec3 device_normal = device.xyz / device.w;
        //     vec2 clip_pos = (device_normal * 0.5 + 0.5).xy;
        //     return clip_pos * resolution;
        // }
        // vec4 unproject(vec2 screen, float z, float w) {
        //     vec2 clip_pos = screen / resolution;
        //     vec2 device_normal = clip_pos * 2.0 - 1.0;
        //     return vec4(device_normal * w, z, w);
        // }
        // void main() {
        //     v_st = st;
        //     vec3 currP = position3DHigh.xyz + position3DLow.xyz;
        //     float dis = distance(currP, cameraPosition);
        //     if (distanceDisplay) {
        //         if (dis<scaleByDistance.x || dis > scaleByDistance.z) {
        //             return;
        //         }
        //     }
        // tslint:disable-next-line: max-line-length
        //     float currScale = scaleByDistance.y + (scaleByDistance.w - scaleByDistance.y) * (dis - scaleByDistance.x) / (scaleByDistance.z - scaleByDistance.x);
        //     currScale = clamp(currScale, scaleByDistance.w, scaleByDistance.y);
        //     vec4 eyeCurrP = transform(mm,vv,currP);
        //     vec2 winCurrP = project(eyeCurrP);
        //     vec3 dirEye = color.xyz;
        //     dirEye = normalize(dirEye);
        //     vec2 newWinCurrP = winCurrP + dirEye.xy * color.w * currScale;
        //     newWinCurrP = offsetXY + newWinCurrP;
        //     gl_Position = unproject(newWinCurrP, eyeCurrP.z, eyeCurrP.w);
        // }
        // `;
    }
    // private createImageBitmap() {
    //     return new Promise((resolve, reject) => {
    //         const image = new Image();
    //         image.onload = () => {
    //             resolve(Promise.all([
    //                 createImageBitmap(image, 0, 0, image.width, image.height),
    //             ]).then((sprites) => {
    //                 this.style.bgImg = sprites[0];
    //                 this.dealCondition(this.style);
    //             }));
    //         };
    //         image.src = this.style.imgUrl;
    //     });
    // }
    private destroyTexture() {
        Object.keys(this.textureManager).forEach((domId) => {
            if (this.textureManager[domId]) {
                if (this.textureManager[domId].texture) {
                    this.textureManager[domId].texture.destroy();
                }
            }
        });
    }
    // private prepareMerge(option: IWorkerMsg, style: ILayerStyle) {
    //     this.prepareTexture(option, style);
    //     let point = option.dataArr as any;
    //     const baseCfg = this.baseCfg;
        // tslint:disable-next-line: max-line-length
    //     point = offsetPoint(point as any, (baseCfg as any).northOffset, (baseCfg as any).eastOffset, (this.style as any).heightOffset || 0.0) as any;
    //     if (!this.mergeDraw.VAOManager[info.domId]) {
    //         this.mergeDraw.VAOManager[info.domId] = {
    //             vertexs_H: [],
    //             vertexs_L: [],
    //             color: [],
    //             uv: [],
    //             indexs: [],
    //             VAO: {},
    //             option,
    //         };
    //     }
    //     // tslint:disable-next-line: variable-name
    //     const vertexs_H = this.mergeDraw.VAOManager[info.domId].vertexs_H;
    //     // tslint:disable-next-line: variable-name
    //     const vertexs_L = this.mergeDraw.VAOManager[info.domId].vertexs_L;
    //     const indexs = this.mergeDraw.VAOManager[info.domId].indexs;
    //     const uvs = this.mergeDraw.VAOManager[info.domId].uv;
    //     const colors = this.mergeDraw.VAOManager[info.domId].color;
    //     const lastNum = indexs[indexs.length - 1] || 0;
    //     if (!lastNum) {
    //         indexs.push(0);
    //         indexs.push(2);
    //         indexs.push(1);
    //         indexs.push(0);
    //         indexs.push(3);
    //         indexs.push(2);
    //     } else {
    //         indexs.push(lastNum + 1 + 1 + 0);
    //         indexs.push(lastNum + 1 + 1 + 2);
    //         indexs.push(lastNum + 1 + 1 + 1);
    //         indexs.push(lastNum + 1 + 1 + 0);
    //         indexs.push(lastNum + 1 + 1 + 3);
    //         indexs.push(lastNum + 1 + 1 + 2);
    //     }
    //     const currDF = computedDoubleFloat(point);
    //     vertexs_H.push(currDF[0]);
    //     vertexs_H.push(currDF[2]);
    //     vertexs_H.push(currDF[4]);
    //     vertexs_L.push(currDF[1]);
    //     vertexs_L.push(currDF[3]);
    //     vertexs_L.push(currDF[5]);

    //     vertexs_H.push(currDF[0]);
    //     vertexs_H.push(currDF[2]);
    //     vertexs_H.push(currDF[4]);
    //     vertexs_L.push(currDF[1]);
    //     vertexs_L.push(currDF[3]);
    //     vertexs_L.push(currDF[5]);

    //     vertexs_H.push(currDF[0]);
    //     vertexs_H.push(currDF[2]);
    //     vertexs_H.push(currDF[4]);
    //     vertexs_L.push(currDF[1]);
    //     vertexs_L.push(currDF[3]);
    //     vertexs_L.push(currDF[5]);

    //     vertexs_H.push(currDF[0]);
    //     vertexs_H.push(currDF[2]);
    //     vertexs_H.push(currDF[4]);
    //     vertexs_L.push(currDF[1]);
    //     vertexs_L.push(currDF[3]);
    //     vertexs_L.push(currDF[5]);

    //     uvs.push(info.uvs[0][0], info.uvs[0][1], 0, 0);
    //     uvs.push(info.uvs[1][0], info.uvs[1][1], 0, 1);
    //     uvs.push(info.uvs[2][0], info.uvs[2][1], 1, 1);
    //     uvs.push(info.uvs[3][0], info.uvs[3][1], 1, 0);
    //     // const trans = Cesium.Transforms.eastNorthUpToFixedFrame(point as any);
    //     // const trans = Cesium.Matrix4.IDENTITY;
    //     // let currMat = trans;
    //     const ratio = info.ratio || 1.0;
    //     const zxj = new Cesium.Cartesian3(-1, -ratio, 0);
    //     // Cesium.Matrix4.multiplyByPointAsVector(trans, zxj, zxj);
    //     // Cesium.Cartesian3.normalize(zxj, zxj);
    //     colors.push(zxj.x, zxj.y, zxj.z, info.txtWidth);

    //     const zsj = new Cesium.Cartesian3(-1, ratio, 0);
    //     // Cesium.Matrix4.multiplyByPointAsVector(trans, zsj, zsj);
    //     // Cesium.Cartesian3.normalize(zsj, zsj);
    //     colors.push(zsj.x, zsj.y, zsj.z, info.txtWidth);

    //     const ysj = new Cesium.Cartesian3(1, ratio, 0);
    //     // Cesium.Matrix4.multiplyByPointAsVector(trans, ysj, ysj);
    //     // Cesium.Cartesian3.normalize(ysj, ysj);
    //     colors.push(ysj.x, ysj.y, ysj.z, info.txtWidth);

    //     const yxj = new Cesium.Cartesian3(1, -ratio, 0);
    //     // Cesium.Matrix4.multiplyByPointAsVector(trans, yxj, yxj);
    //     // Cesium.Cartesian3.normalize(yxj, yxj);
    //     colors.push(yxj.x, yxj.y, yxj.z, info.txtWidth);
    // }

    // private prepareMergeCommand() {
    //     if (!this.baseCfg.mergeDraw) {
    //         return;
    //     }
    //     const context = (this.viewer.scene as any).context;
    //     const vs = this.mergeVS;
    //     const fs = this.fragmentShader;
    //     const width = context.drawingBufferWidth;
    //     const height = context.drawingBufferHeight;
    //     const mergeKey = Object.keys(this.mergeDraw.VAOManager);
    //     const sp = (Cesium as any).ShaderProgram.fromCache({
    //         context,
    //         vertexShaderSource : vs,
    //         fragmentShaderSource : fs,
    //         attributeLocations: {
    //             position3DHigh: 0,
    //             position3DLow: 1,
    //             color: 2,
    //             st: 3,
    //         },
    //     });
    //     for (const domId of mergeKey) {
    //         const VAO = this.mergeDraw.VAOManager[domId].VAO;
    //         const indexBuffer = (Cesium as any).Buffer.createIndexBuffer({
    //             context,
    //             typedArray : VAO.index,
    //             usage : (Cesium as any).BufferUsage.STATIC_DRAW,
    //             indexDatatype : Cesium.IndexDatatype.UNSIGNED_SHORT,
    //         });

    //         const va = new (Cesium as any).VertexArray({
    //             context,
    //             attributes : [
    //                 {
    //                     index : 0,
    //                     vertexBuffer : (Cesium as any).Buffer.createVertexBuffer({
    //                         context,
    //                         typedArray : VAO.vertex_H.values,
    //                         usage : (Cesium as any).BufferUsage.STATIC_DRAW,
    //                     }),
    //                     componentsPerAttribute : 3,
    //                 },
    //                 {
    //                     index : 1,
    //                     vertexBuffer : (Cesium as any).Buffer.createVertexBuffer({
    //                         context,
    //                         typedArray : VAO.vertex_L.values,
    //                         usage : (Cesium as any).BufferUsage.STATIC_DRAW,
    //                     }),
    //                     componentsPerAttribute : 3,
    //                 },
    //                 {
    //                     index : 2,
    //                     vertexBuffer : (Cesium as any).Buffer.createVertexBuffer({
    //                         context,
    //                         typedArray : VAO.color.values,
    //                         usage : (Cesium as any).BufferUsage.STATIC_DRAW,
    //                     }),
    //                     componentsPerAttribute : 4,
    //                 },
    //                 {
    //                     index : 3,
    //                     vertexBuffer : (Cesium as any).Buffer.createVertexBuffer({
    //                         context,
    //                         typedArray : VAO.uv.values,
    //                         usage : (Cesium as any).BufferUsage.STATIC_DRAW,
    //                     }),
    //                     componentsPerAttribute : 4,
    //                 },
    //             ],
    //             indexBuffer,
    //         });

    //         const rs = Cesium.RenderState.fromCache();
    //         const that = this;
    //         const bs = Cesium.BoundingSphere.fromVertices(VAO.vertex_H.values);
    //         const command = new (Cesium as any).DrawCommand({
    //             primitiveType : Cesium.PrimitiveType.TRIANGLES,
    //             shaderProgram : sp,
    //             vertexArray : va,
    //             modelMatrix : Cesium.Matrix4.IDENTITY,
    //             pickOnly: true,
    //             renderState: rs,
    //             boundingVolume: bs,
    //             uniformMap: {
    //                 mm() {
    //                     return (that.viewer.scene.camera.frustum as any)._offCenterFrustum._perspectiveMatrix;
    //                 },
    //                 vv() {
    //                     // return that.viewer.scene.camera._viewMatrix;
    //                     return that.viewer.scene.camera.viewMatrix;
    //                 },
    //                 resolution() {
    //                     return new Cesium.Cartesian2(width, height);
    //                 },
    //                 billWidth() {
    //                     let width = 0;
    //                     if (that.style.billWidth) {
    //                         width = that.style.billWidth;
    //                     } else {
    //                         width = VAO.txtWidth;
    //                     }
    //                     return width;
    //                 },
    //                 scaleByDistance() {
    //                     const style = that.style;
    //                     return new Cesium.Cartesian4(style.near, style.scale, style.far, style.ratio);
    //                 },
    //                 cameraPosition() {
    //                     return that.viewer.camera.position;
    //                 },
    //                 billImg() {
    //                     // tslint:disable-next-line: max-line-length
    //                     return that.textureManager && that.textureManager[VAO.texture] && that.textureManager[VAO.texture].texture || context.defaultTexture;
    //                 },
    //                 distanceDisplay() {
    //                     return that.style.distanceDisplay;
    //                 },
    //                 bgTexture() {
    //                     // tslint:disable-next-line: max-line-length
    //                     return that.bgTexture[that.mergeDraw.VAOManager[domId].option.currStyle || "default"] || context.defaultTexture;
    //                 },
    //                 offsetXY() {
    //                     return new Cesium.Cartesian2(that.style.offsetX || 0, that.style.offsetY || 0);
    //                 },
    //             },
    //             castShadows: false,
    //             receiveShadows: false,
    //             pass : (Cesium as any).Pass.TRANSLUCENT,
    //         });
    //         command.id = VAO.id;
    //         this.mergeDraw.commands.push(command);
    //     }
    // }
}

// 伪造双精度数据
const computedDoubleFloat = (car: Cartesian3) => {
    const fa = new Float32Array(6);
    fa[0] = car.x;
    fa[1] = car.x - fa[0];
    fa[2] = car.y;
    fa[3] = car.y - fa[2];
    fa[4] = car.z;
    fa[5] = car.z - fa[4];
    return fa;
};

// 二维基于某点进行缩放
// mat3 m = mat3(imgScale, 0.0,      0.5 * (1.0 - imgScale),
//                           0.0,      imgScale, 0.5 * (1.0 - imgScale),
//                           0.0,      0.0,      1.0);\n\
