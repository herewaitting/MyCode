import * as Cesium from "cesium";
export interface IAppearanceOpts {
    type: string;
    material: any;
    [key: string]: any;
}

export const AppraranceMap: {[key: string]: any} = {
    PolylineMaterial: "PolylineMaterialAppearance",
    MaterialAppearance: "MaterialAppearance",
    EllipsoidSurfaceAppearance: "EllipsoidSurfaceAppearance",
};

export class KVAppearance {
    public appearance!: Cesium.Appearance;
    public material: any;
    constructor(option: IAppearanceOpts) {
        if (!option || !option.type || !AppraranceMap[option.type]) {
            return;
        }
        this.material = option.material;
        const mtlOpt = Object.assign({}, option);
        mtlOpt.material = option.material.material;
        this.appearance = new (Cesium as any)[AppraranceMap[option.type]](mtlOpt);
    }
    public destroy() {
        if (this.appearance && this.appearance.material) {
            this.appearance.material.destroy();
        }
        this.appearance = null as any;
    }
    public resetMaterial<T>(style: T) {
        this.material.reset(style);
    }
}
