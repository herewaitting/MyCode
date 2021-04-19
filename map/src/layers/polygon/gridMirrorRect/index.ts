import * as Cesium from "cesium";
import { ILayerOption } from "../../../layerManager";
import { Transforms } from "../../../map/core/Transforms";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { GridMaterial } from "../../../map/material/GridMaterial";
import { CreatePolygonGeometry, PolygonGeometryPrimitive } from "../../../map/primitive/PolygonGeometry";
import { SceneServer } from "../../../map/sceneServer";
import Cartesian3 from "../../../worker/czmCore/Cartesian3.js";
import { IWorkerMsg } from "../../layer";
import { Polygon } from "../polygon";
import { DefaultStyle, ILayerStyle } from "./style";

export class GridMirrorRect extends Polygon<ILayerStyle> {
    public workerFunName!: string;
    public modelMatrix: any;
    private material: any;
    private rectPoints: any;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, initOpts);
        if (!this.viewer) { return; }
    }
    public removeData(): void {
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
    }
    public setData<T>(data: string | T[]) {
      if (this.hooks && this.hooks.startDealData) {
          this.hooks.startDealData.call(this, data as any[]);
      }
    }
    public updateStyle(style: ILayerStyle): void {
        this.style = {...this.style, ...style};
        this.resetMaterial();
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
        this.appearance = {};
        if (this.baseCfg.visible) {
            this.onShow();
        } else {
            this.onHide();
        }
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        this.style = {...this.style, ...style};
        this.setLocatedPos();
        this.modelMatrix = Transforms.eastNorthUpToFixedFrame(this.locatedPos);
        if (!this.modelMatrix) { return; }
        this.material = new GridMaterial(this.style);
        (this.material.material as any)._updateFunctions = [(material: any, context: any) => {
            material._uniforms.specularMap_5 = () => {
                // tslint:disable-next-line: max-line-length
                return (Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer && (Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer._colorTextures[0] || context.defaultTexture;
            };
            material._uniforms.mirrorDefinition_6 = () => {
                return this.style.mirrorDefinition;
            };
        }];
        this.appearance = {};
        this.appearance.default = new KVAppearance({
            type: "EllipsoidSurfaceAppearance",
            material: this.material,
            fragmentShaderSource: MirrorFS,
            vertexShaderSource: MirrorVS,
        });
        this.prepareRect();
        const rect = CreatePolygonGeometry({
            data: this.rectPoints,
        });
        const water = new PolygonGeometryPrimitive({
            data: rect,
        });
        water.setAppearance(this.appearance.default);
        this.collection.add(water);
        this.collectionToScene();
        (Cesium.ExpandBySTC as any).mirror.MirrorEnable = true;
        if (this.baseCfg.visible) {
            this.onShow();
        } else {
            this.onHide();
        }
    }
    protected onData(data: IWorkerMsg): void {
        //
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
      if (Cesium.ExpandBySTC && (Cesium.ExpandBySTC as any).mirror) {
          (Cesium.ExpandBySTC as any).mirror.MirrorEnable = false;
          if ((Cesium.ExpandBySTC as any).mirror.colorTexture) {
              (Cesium.ExpandBySTC as any).mirror.colorTexture.destroy();
              (Cesium.ExpandBySTC as any).mirror.colorTexture = null;
          }
          if ((Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer) {
              (Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer.destroy();
              (Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer = null;
          }
          (Cesium.ExpandBySTC as any).mirror.MirrorEnable = false;
      }
    }
    protected onDataOver(): void {
        if (this.baseCfg.visible) {
            this.onShow();
        } else {
            this.onHide();
        }
    }
    private setLocatedPos() {
        this.locatedPos = Cartesian3.fromDegrees(this.style.longitude, this.style.latitude);
    }
    private resetMaterial() {
        this.material.reset(this.style);
    }
    private collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
    private prepareRect() {
        const width = this.style.width;
        const firstP = new Cesium.Cartesian3(-width, -width, 0);
        const sceondP = new Cesium.Cartesian3(-width, width, 0);
        const thirdP = new Cesium.Cartesian3(width, width, 0);
        const forthP = new Cesium.Cartesian3(width, -width, 0);
        Cesium.Matrix4.multiplyByPoint(this.modelMatrix, firstP, firstP);
        Cesium.Matrix4.multiplyByPoint(this.modelMatrix, sceondP, sceondP);
        Cesium.Matrix4.multiplyByPoint(this.modelMatrix, thirdP, thirdP);
        Cesium.Matrix4.multiplyByPoint(this.modelMatrix, forthP, forthP);
        this.rectPoints = [firstP, sceondP, thirdP, forthP];
    }
}

const MirrorVS = `
attribute vec3 compressedAttributes;
attribute vec3 position3DHigh;
attribute vec3 position3DLow;
attribute float batchId;
varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec3 v_tangentEC;
varying vec3 v_bitangentEC;
varying vec2 v_st;
void main ()
{
  float tmpvar_1;
  tmpvar_1 = floor((compressedAttributes.x / 4096.0));
  vec2 tmpvar_2;
  tmpvar_2.x = (tmpvar_1 / 4095.0);
  tmpvar_2.y = ((compressedAttributes.x - (tmpvar_1 * 4096.0)) / 4095.0);
  float encodedFloat2_3;
  float temp_4;
  float tmpvar_5;
  tmpvar_5 = (compressedAttributes.y / 65536.0);
  float tmpvar_6;
  tmpvar_6 = floor(tmpvar_5);
  temp_4 = (compressedAttributes.z / 65536.0);
  float tmpvar_7;
  tmpvar_7 = floor(temp_4);
  encodedFloat2_3 = ((temp_4 - tmpvar_7) * 65536.0);
  float tmpvar_8;
  tmpvar_8 = (((tmpvar_5 - tmpvar_6) * 65536.0) / 256.0);
  float tmpvar_9;
  tmpvar_9 = floor(tmpvar_8);
  vec2 tmpvar_10;
  tmpvar_10.x = tmpvar_9;
  tmpvar_10.y = ((tmpvar_8 - tmpvar_9) * 256.0);
  vec2 encoded_11;
  encoded_11 = tmpvar_10;
  vec3 tmpvar_12;
  vec3 v_13;
  if (((tmpvar_9 == 0.0) && (tmpvar_10.y == 0.0))) {
    tmpvar_12 = vec3(0.0, 0.0, 0.0);
  } else {
    encoded_11 = (((tmpvar_10 / 255.0) * 2.0) - 1.0);
    vec3 tmpvar_14;
    tmpvar_14.xy = encoded_11;
    tmpvar_14.z = ((1.0 - abs(encoded_11.x)) - abs(encoded_11.y));
    v_13 = tmpvar_14;
    if ((tmpvar_14.z < 0.0)) {
      vec2 tmpvar_15;
      tmpvar_15 = abs(encoded_11.yx);
      float tmpvar_16;
      if ((encoded_11.x >= 0.0)) {
        tmpvar_16 = 1.0;
      } else {
        tmpvar_16 = -1.0;
      };
      float tmpvar_17;
      if ((encoded_11.y >= 0.0)) {
        tmpvar_17 = 1.0;
      } else {
        tmpvar_17 = -1.0;
      };
      vec2 tmpvar_18;
      tmpvar_18.x = tmpvar_16;
      tmpvar_18.y = tmpvar_17;
      v_13.xy = ((1.0 - tmpvar_15) * tmpvar_18);
    };
    tmpvar_12 = normalize(v_13);
  };
  float tmpvar_19;
  tmpvar_19 = (encodedFloat2_3 / 256.0);
  float tmpvar_20;
  tmpvar_20 = floor(tmpvar_19);
  vec2 tmpvar_21;
  tmpvar_21.x = tmpvar_20;
  tmpvar_21.y = ((tmpvar_19 - tmpvar_20) * 256.0);
  vec2 encoded_22;
  encoded_22 = tmpvar_21;
  vec3 tmpvar_23;
  vec3 v_24;
  if (((tmpvar_20 == 0.0) && (tmpvar_21.y == 0.0))) {
    tmpvar_23 = vec3(0.0, 0.0, 0.0);
  } else {
    encoded_22 = (((tmpvar_21 / 255.0) * 2.0) - 1.0);
    vec3 tmpvar_25;
    tmpvar_25.xy = encoded_22;
    tmpvar_25.z = ((1.0 - abs(encoded_22.x)) - abs(encoded_22.y));
    v_24 = tmpvar_25;
    if ((tmpvar_25.z < 0.0)) {
      vec2 tmpvar_26;
      tmpvar_26 = abs(encoded_22.yx);
      float tmpvar_27;
      if ((encoded_22.x >= 0.0)) {
        tmpvar_27 = 1.0;
      } else {
        tmpvar_27 = -1.0;
      };
      float tmpvar_28;
      if ((encoded_22.y >= 0.0)) {
        tmpvar_28 = 1.0;
      } else {
        tmpvar_28 = -1.0;
      };
      vec2 tmpvar_29;
      tmpvar_29.x = tmpvar_27;
      tmpvar_29.y = tmpvar_28;
      v_24.xy = ((1.0 - tmpvar_26) * tmpvar_29);
    };
    tmpvar_23 = normalize(v_24);
  };
  vec2 tmpvar_30;
  tmpvar_30.x = tmpvar_6;
  tmpvar_30.y = tmpvar_7;
  vec2 encoded_31;
  encoded_31 = tmpvar_30;
  vec3 tmpvar_32;
  vec3 v_33;
  if (((tmpvar_6 == 0.0) && (tmpvar_7 == 0.0))) {
    tmpvar_32 = vec3(0.0, 0.0, 0.0);
  } else {
    encoded_31 = (((tmpvar_30 / 255.0) * 2.0) - 1.0);
    vec3 tmpvar_34;
    tmpvar_34.xy = encoded_31;
    tmpvar_34.z = ((1.0 - abs(encoded_31.x)) - abs(encoded_31.y));
    v_33 = tmpvar_34;
    if ((tmpvar_34.z < 0.0)) {
      vec2 tmpvar_35;
      tmpvar_35 = abs(encoded_31.yx);
      float tmpvar_36;
      if ((encoded_31.x >= 0.0)) {
        tmpvar_36 = 1.0;
      } else {
        tmpvar_36 = -1.0;
      };
      float tmpvar_37;
      if ((encoded_31.y >= 0.0)) {
        tmpvar_37 = 1.0;
      } else {
        tmpvar_37 = -1.0;
      };
      vec2 tmpvar_38;
      tmpvar_38.x = tmpvar_36;
      tmpvar_38.y = tmpvar_37;
      v_33.xy = ((1.0 - tmpvar_35) * tmpvar_38);
    };
    tmpvar_32 = normalize(v_33);
  };
  vec4 tmpvar_39;
  tmpvar_39.w = 1.0;
  tmpvar_39.xyz = ((position3DHigh - czm_encodedCameraPositionMCHigh) + (position3DLow - czm_encodedCameraPositionMCLow));
  v_positionEC = (czm_modelViewRelativeToEye * tmpvar_39).xyz;
  v_normalEC = (czm_normal * tmpvar_12);
  v_tangentEC = (czm_normal * tmpvar_23);
  v_bitangentEC = (czm_normal * tmpvar_32);
  v_st = tmpvar_2;
  gl_Position = (czm_modelViewProjectionRelativeToEye * tmpvar_39);
  vec2 tmpvar_40;
  tmpvar_40.y = 0.5;
  tmpvar_40.x = (batchTextureStep.y + (batchId * batchTextureStep.x));
  gl_Position.z = 0.0;
}
`;

const MirrorFS = `
#ifdef GL_OES_standard_derivatives\n\
    #extension GL_OES_standard_derivatives : enable\n\
#endif\n\
uniform sampler2D specularMap_5;
uniform float mirrorDefinition_6;
czm_material czm_getMaterial1(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    float fade = max(1.0, (length(materialInput.positionToEyeEC) / 10000000000.0));
    vec2 st = materialInput.st;
    float scaledWidth = fract(lineCount_0.s * st.s - lineOffset_1.s);\n\
    scaledWidth = abs(scaledWidth - floor(scaledWidth + 0.5));\n\
    float scaledHeight = fract(lineCount_0.t * st.t - lineOffset_1.t);\n\
    scaledHeight = abs(scaledHeight - floor(scaledHeight + 0.5));\n\
\n\
    float value;\n\
#ifdef GL_OES_standard_derivatives\n\
    // Fuzz Factor - Controls blurriness of lines\n\
    const float fuzz = 1.2;\n\
    vec2 thickness = (lineThickness_2 * czm_pixelRatio) - 1.0;\n\
\n\
    // From \"3D Engine Design for Virtual Globes\" by Cozzi and Ring, Listing 4.13.\n\
    vec2 dx = abs(dFdx(st));\n\
    vec2 dy = abs(dFdy(st));\n\
    vec2 dF = vec2(max(dx.s, dy.s), max(dx.t, dy.t)) * lineCount_0;\n\
    value = min(\n\
        smoothstep(dF.s * thickness.s, dF.s * (fuzz + thickness.s), scaledWidth),\n\
        smoothstep(dF.t * thickness.t, dF.t * (fuzz + thickness.t), scaledHeight));\n\
#else\n\
    // Fuzz Factor - Controls blurriness of lines\n\
    const float fuzz = 0.05;\n\
\n\
    vec2 range = 0.5 - (lineThickness_2 * 0.05);\n\
    value = min(\n\
        1.0 - smoothstep(range.s, range.s + fuzz, scaledWidth),\n\
        1.0 - smoothstep(range.t, range.t + fuzz, scaledHeight));\n\
#endif\n\
\n\
    // Edges taken from RimLightingMaterial.glsl\n\
    // See http://www.fundza.com/rman_shaders/surface/fake_rim/fake_rim1.html\n\
    float dRim = 1.0 - abs(dot(materialInput.normalEC, normalize(materialInput.positionToEyeEC)));\n\
    float sRim = smoothstep(0.8, 1.0, dRim);\n\
    value *= (1.0 - sRim);\n\
\n\
    vec4 halfColor;\n\
    halfColor.rgb = color_3.rgb * 0.5;\n\
    halfColor.a = color_3.a * (1.0 - ((1.0 - cellAlpha_4) * value));\n\
    halfColor = czm_gammaCorrect(halfColor);\n\
    vec3 normalTangentSpace = vec3(1.0, 1.0, 1.0);
    normalTangentSpace.xy /= fade;
    normalTangentSpace = normalize(normalTangentSpace);
    vec2 v = gl_FragCoord.xy / czm_viewport.zw;
    v.x = 1.0 - v.x;
    vec4 sceneColor = texture2D(specularMap_5, v);
    vec3 resColor = mix(sceneColor.rgb * mirrorDefinition_6, halfColor.rgb, halfColor.a);
    material.diffuse = resColor;\n\
    material.alpha = halfColor.a;\n\
\n\
    return material;\n\
}
varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec3 v_tangentEC;
varying vec3 v_bitangentEC;
varying vec2 v_st;
void log_depth_main()
{
    vec3 positionToEyeEC = -v_positionEC;
    mat3 tangentToEyeMatrix = czm_tangentToEyeSpaceMatrix(v_normalEC, v_tangentEC, v_bitangentEC);
    vec3 normalEC = normalize(v_normalEC);
    #ifdef FACE_FORWARD
    normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
    #endif
    czm_materialInput materialInput;
    materialInput.normalEC = normalEC;
    materialInput.tangentToEyeMatrix = tangentToEyeMatrix;
    materialInput.positionToEyeEC = positionToEyeEC;
    materialInput.st = v_st;
    czm_material material = czm_getMaterial1(materialInput);
    gl_FragColor = vec4(material.diffuse, material.alpha);
}
#line 0
#ifdef GL_EXT_frag_depth
#endif
#line 0
void main()
{
    log_depth_main();
}
`;
