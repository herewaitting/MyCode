/*
 * @Author: your name
 * @Date: 2020-03-02 18:17:41
 * @LastEditTime: 2020-09-22 17:02:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \kvmap\src\settings\baseMap.ts
 */
import * as Cesium from "cesium";
import { IBeautifyFilter } from "../interface";
import { transformColor } from "../util";

// 用于调整场景里底图颜色、颜色校正
export class BaseMap {
    private viewer!: Cesium.Viewer;
    private selfBlend: boolean = false; // 是否开启混合颜色
    private selfBlendColor: Cesium.Color = new Cesium.Color(0, 0, 0, 0); // 混合颜色
    private selfBrightness: number = 1; // 亮度
    private selfContrast: number = 1; // 对比度
    private selfHue: number = 0; // 色调
    private selfSaturation: number = 1; // 饱和度
    private selfGamma: number = 1; // 伽马
    constructor(viewer: Cesium.Viewer) {
        if (!viewer) {
            return;
        }
        this.viewer = viewer;
    }
    get blend(): boolean {
        return this.selfBlend;
    }
    /**
     * @description: 是否开启底图颜色混合
     * @param {boolean}
     */
    set blend(val: boolean) {
        this.selfBlend = Boolean(val);
        Cesium.ExpandBySTC.baseMap.blend = Boolean(val);
    }

    get blendColor(): Cesium.Color {
        return this.selfBlendColor;
    }
    /**
     * @description: 设置混合颜色
     * @param {Cesium.Color}
     */
    set blendColor(val: Cesium.Color) {
        this.selfBlendColor = val;
        Cesium.ExpandBySTC.baseMap.color = val;
    }

    get brightness(): number {
        return this.selfBrightness;
    }
    /**
     * @description: 设置底图亮度
     * @param {number}
     */
    set brightness(val: number) {
        this.selfBrightness = Number(val);
        this.effectViewer("brightness", this.brightness);
    }

    get contrast(): number {
        return this.selfContrast;
    }
    /**
     * @description: 设置 对比度
     * @param {number}
     */
    set contrast(val: number) {
        this.selfContrast = Number(val);
        this.effectViewer("contrast", this.contrast);
    }

    get hue(): number {
        return this.selfHue;
    }
    /**
     * @description: 设置hue
     * @param {number}
     */
    set hue(val: number) {
        this.selfHue = Number(val);
        this.effectViewer("hue", this.hue);
    }

    get saturation(): number {
        return this.selfSaturation;
    }
    /**
     * @description: 设置饱和度
     * @param {number}
     */
    set saturation(val: number) {
        this.selfSaturation = Number(val);
        this.effectViewer("saturation", this.saturation);
    }

    get gamma(): number {
        return this.selfGamma;
    }
    /**
     * @description: 设置伽马值
     * @param {number}
     */
    set gamma(val: number) {
        this.selfGamma = Number(val);
        this.effectViewer("gamma", this.gamma);
    }
    /**
     * @description: 设置底图调色
     * @param {IBeautifyFilter}
     * @return:
     */
    public setBlend(blendOpts: IBeautifyFilter) {
        if (blendOpts.blend) {
            // tslint:disable-next-line: max-line-length
            const color: Cesium.Color | undefined = transformColor(blendOpts.blendColor) || Cesium.Color.BLUE;
            if (color) {
                color.alpha = blendOpts.alpha / 100 || color.alpha;
                this.blend = true;
                this.blendColor = color;
            }
        } else {
            this.blend = false;
            this.blendColor = new Cesium.Color(0, 0, 0, 0);
        }
    }
    private effectViewer(type: string, val: number) {
        if (this.viewer.imageryLayers && (this.viewer.imageryLayers as any)._layers) {
            const layers = (this.viewer.imageryLayers as any)._layers;
            (layers as any[]).forEach((layer) => {
                layer[type] = val;
            });
        }
    }
}
