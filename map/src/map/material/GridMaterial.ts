import * as Cesium from "cesium";
import { transformColor } from "../../util";
import { IMaterial } from "./Material";

export interface IGridMtlOpt {
    lineCount: number;
    lineThickness: number;
    color: string;
    cellAlpha: number;
}

export class GridMaterial implements IMaterial<IGridMtlOpt> {
    public material: Cesium.Material;
    constructor(style: IGridMtlOpt) {
        const lineCount = style.lineCount || 10;
        const lineThickness = style.lineThickness || 1.0;
        this.material = new Cesium.Material({
            fabric: {
                type: "Grid",
                uniforms: {
                    lineCount: new Cesium.Cartesian2(lineCount, lineCount),
                    lineOffset: new Cesium.Cartesian2(0.0, 0.0),
                    lineThickness: new Cesium.Cartesian2(lineThickness, lineThickness),
                    color: transformColor(style.color) || Cesium.Color.GREY,
                    cellAlpha: style.cellAlpha || 0,
                },
            },
        });
    }
    public reset(style: IGridMtlOpt) {
        const lineCount = style.lineCount || this.material.uniforms.lineCount.x;
        const lineThickness = style.lineThickness || this.material.uniforms.lineThickness.x;
        this.material.uniforms.lineCount = new Cesium.Cartesian2(lineCount, lineCount);
        this.material.uniforms.lineThickness = new Cesium.Cartesian2(lineThickness, lineThickness);
        this.material.uniforms.color = transformColor(style.color) || this.material.uniforms.color;
        this.material.uniforms.cellAlpha = style.cellAlpha || this.material.uniforms.cellAlpha;
    }
    public destroy() {
        // tslint:disable-next-line: no-unused-expression
        this.material && this.material.destroy();
        this.material = null as any;
    }
}
