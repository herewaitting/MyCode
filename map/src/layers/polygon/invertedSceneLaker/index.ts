import * as Cesium from "cesium";
import { ILayerOption } from "../../../layerManager";
import { InstanceContainer } from "../../../map/instanceContainer";
import { KVAppearance } from "../../../map/material/Appearance";
import { CreatePolygonGeometry, PolygonGeometryPrimitive } from "../../../map/primitive/PolygonGeometry";
import { SceneServer } from "../../../map/sceneServer";
import { KvLog } from "../../../tools/log";
import { transformColor } from "../../../util";
import { IWorkerMsg } from "../../layer";
import { Polygon } from "../polygon";
import { DefaultStyle, ILayerStyle } from "./style";

export class InvertedSceneLaker extends Polygon<ILayerStyle> {
    public workerFunName!: string;
    private temparr: any[] = [];
    // private skyTexture: any;
    constructor(viewer: SceneServer, layerName: string, initOpts: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, initOpts);
        if (!this.viewer) { return; }
    }
    public removeData(): void {
        this.viewer.removePrimitive(this.collection);
        this.collection = new InstanceContainer("primitive");
        this.collectionToScene();
    }
    public updateStyle(style: { [k: string]: any; }): void {
        this.dealCondition(style);
        // this.createConditionApp();
        // this.resetMaterial(style);
        this.style = {...this.style, ...style};
    }
    protected onHide(): void {
      (Cesium.ExpandBySTC as any).mirror.MirrorEnable = false;
      this.collection.hide();
    }
    protected onShow(): void {
      (Cesium.ExpandBySTC as any).mirror.MirrorEnable = true;
      this.collection.show();
    }
    protected onInit(): void {
        this.style = DefaultStyle;
        this.workerFunName = "PolygonWorkerFun";
        this.collection = new InstanceContainer("primitive");
        this.appearance = {};
        this.conditionAppearance = {};
        this.collectionToScene();
    }
    protected onStyle<ILayerStyle>(style: ILayerStyle): void {
        if (!style) {
            style = {} as ILayerStyle;
        }
        this.style = {...this.style, ...style};
        this.dealCondition(this.style);
        const color = transformColor(this.style.color) || new Cesium.Color(0.0, 0.3, 0.7);
        // if (this.appearance) {
        //     if (this.style.baseWaterColor) {
        //         this.appearance.material.uniforms.baseWaterColor = color;
        //     }
        //     if (this.style.animationSpeed) {
        //         this.appearance.material.uniforms.animationSpeed = this.style.animationSpeed;
        //     }
        //     if (this.style.efinition) {
        //         this.appearance.material.uniforms.efinition = this.style.efinition / 100.0;
        //     }
        //     return;
        // }
        (this.viewer.scene as any).context.defaultTexture.type = "sampler2D";
        const material = new Cesium.Material({
            fabric: {
                type: "Water",
                uniforms: {
                    baseWaterColor: color,
                    frequency: 125000,
                    normalMap: this.style.normalMap,
                    animationSpeed: this.style.animationSpeed,
                    amplitude: 1,
                    // tslint:disable-next-line: max-line-length
                    specularMap: (Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer && (Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer._colorTextures[0] || (this.viewer.scene as any).context.defaultTexture,
                    efinition: this.style.efinition,
                    skyimg: this.style.skyImg,
                    alpha: this.style.alpha,
                },
            },
        });
        const that = this;
        const customMaterial: any = {};
        customMaterial.material = material;
        // tslint:disable-next-line: only-arrow-functions
        (material as any)._updateFunctions = [function(material: any, context: any) {
            // material.uniforms.normalMap = that.style.normalMap;
            material._uniforms.normalMap_2 = () => {
                return that.style.normalMap;
            };
            // material.uniforms.specularMap = (Cesium.ExpandBySTC as any).mirror.stcTex || context.defaultTexture;
            material._uniforms.specularMap_5 = () => {
                // tslint:disable-next-line: max-line-length
                return (Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer && (Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer._colorTextures[0] || context.defaultTexture;
                // return (Cesium.ExpandBySTC as any).mirror.stcTex || context.defaultTexture;
            };
            // material._uniforms.skyimg_7 = () => {
            //     return that.skyTexture;
            // };
        }];

        // this.skyTexture = null;

        // const img = new Image();
        // img.onload = () => {
        //     this.skyTexture = new Cesium.Texture({
        //         context: (that.viewer.scene as any).context,
        //         source: img,
        //         pixelFormat: Cesium.PixelFormat.RGBA,
        //         pixelDatatype: Cesium.PixelDatatype.FLOAT,
        //     });
        // };
        // img.src = this.style.skyImg;
        this.appearance.default = new KVAppearance({
            type: "EllipsoidSurfaceAppearance",
            material: customMaterial,
            // material: customMaterial,
            fragmentShaderSource: labFS,
            vertexShaderSource: labVS,
        });
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
            holes: option.holes,
        });
        if (!this.baseCfg.mergeDraw) {
            const appearance = this.appearance[option.currStyle];
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
        const appearance = this.appearance.default;
        // const currStyle = this.appearance[option.currStyle];
        const primitive = new PolygonGeometryPrimitive({
            data: this.temparr,
            ground: false,
        });
        primitive.setAppearance(appearance);
        this.collection.add(primitive);
        this.temparr = [];
    }
    protected onDestroy(): void {
        if (this.viewer) {
            this.viewer.removePrimitive(this.collection);
            (this.collection as any) = null;
            if (this.appearance) {
                Object.keys(this.appearance).forEach((item) => {
                    this.appearance[item].destroy();
                    this.appearance[item] = null;
                });
            }
            this.appearance = null;
        }
        if ((Cesium.ExpandBySTC as any).mirror.colorTexture) {
            (Cesium.ExpandBySTC as any).mirror.colorTexture.destroy();
            (Cesium.ExpandBySTC as any).mirror.colorTexture = null;
        }
        if ((Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer) {
            (Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer.destroy();
            (Cesium.ExpandBySTC as any).mirror.MirrorFrameBuffer = null;
        }
    }
    protected onDataOver(): void {
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
    private collectionToScene() {
        this.viewer.renderPrimitive(this.collection);
    }
}

const labVS = `
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

const labFS = `
czm_material czm_getMaterial1(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    float time = czm_frameNumber * animationSpeed_3;
    float fade = max(1.0, (length(materialInput.positionToEyeEC) / 10000000000.0) * frequency_1);
    vec2 st = materialInput.st* frequency_1;
    vec4 noise = czm_getWaterNoise(normalMap_2, st, time, 0.0);
    vec3 normalTangentSpace = noise.xyz * vec3(1.0, 1.0, (1.0 / amplitude_4));
    normalTangentSpace.xy /= fade;
    normalTangentSpace = normalize(normalTangentSpace);
    float tsPerturbationRatio = clamp(dot(normalTangentSpace, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    vec2 v = gl_FragCoord.xy / czm_viewport.zw;
    v.x = 1.0 - v.x;
    vec2 nosize1 = noise.xy * 0.005;

    float r = sqrt((v.x-0.8)*(v.x-0.8) + (v.y-0.8)*(v.y-0.8));
    float r2 = sqrt((v.x-0.2)*(v.x-0.2) + (v.y-0.2)*(v.y-0.2));
    float z = cos(200.0*r + time / 100.0)/250.0;
    float z2 = cos(200.0*r2 + time /100.0)/250.0;
    // v += sqrt(z*z+z2*z2);
    // vec3 skyColor = texture2D(skyimg_7, v).rgb;
    // material.diffuse = texture2D(specularMap_5, v + nosize1).rgb;
    material.diffuse = texture2D(specularMap_5, v).rgb;
    // float mixNum = clamp(material.diffuse.r + material.diffuse.g + material.diffuse.b, 0.0, 1.0);
    material.diffuse += (0.1 * tsPerturbationRatio);
    material.diffuse = mix(baseWaterColor_0.rgb, material.diffuse, efinition_6);
    material.normal = normalize(materialInput.tangentToEyeMatrix * normalTangentSpace);
    // material.diffuse = mix(material.diffuse, skyColor, 1.0 - mixNum);
    material.shininess = 10.0;
    material.alpha = alpha_8;
    return material;
}

varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec3 v_tangentEC;
varying vec3 v_bitangentEC;
varying vec2 v_st;
void czm_log_depth_main()
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
    #ifdef FLAT
    gl_FragColor = vec4(material.diffuse, material.alpha);
    #else
    gl_FragColor = czm_translucentPhong(normalize(positionToEyeEC), material,vec3(0.7));
    #endif
    czm_geometryInput geometry;
    geometry.normal = normalEC;
    geometry.metalness = 1.0;
    geometry.roughness = 0.2;
    geometry.color = material.diffuse;

    czm_pointLightInput light;
    light.position = czm_extendPointLightPositionEC;
    light.intensity = czm_extendPointLightBrightness;
    light.dis = czm_extendPointLightDistance;
    light.color = czm_extendPointLightColor;
    material.diffuse += czm_stcPointLight(positionToEyeEC, geometry, light);
    gl_FragColor = vec4(material.diffuse, material.alpha);
}
#line 0
#ifdef GL_EXT_frag_depth
#endif
void czm_translucent_main()
{
    czm_log_depth_main();
    czm_writeLogDepth();
}
#line 0
void main()
{
    czm_translucent_main();
}
`;
