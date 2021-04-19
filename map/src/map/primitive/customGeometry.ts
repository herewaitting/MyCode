import * as Cesium from "cesium";

export interface IAttributeOpt {
    componentDatatype: string;
    componentsPerAttribute: number;
    values: any;
}

export interface ICustomGeometryOpt {
    type: string;
    position: IAttributeOpt;
    st?: IAttributeOpt;
    color: IAttributeOpt;
    normal?: IAttributeOpt;
    indexs: Uint16Array | Uint32Array;
}

export const CreateAttribute = (attr: IAttributeOpt) => {
    const dataType = attr.componentDatatype;
    return new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype[dataType as any] as any,
        componentsPerAttribute: attr.componentsPerAttribute,
        values: attr.values,
    });
};

export interface ICustomGeometry {
    geometry: Cesium.Geometry;
}

export class CustomGeometry implements ICustomGeometry {
    public geometry!: Cesium.Geometry;
    constructor(option: ICustomGeometryOpt) {
        if (!option) {
            return;
        }
        const attributes = new Cesium.GeometryAttributes();
        if (option.position) {
            attributes.position = CreateAttribute(option.position);
        }
        if (option.st) {
            attributes.st = CreateAttribute(option.st);
        }
        if (option.color) {
            attributes.color = CreateAttribute(option.color);
        }
        if (option.normal) {
            attributes.normal = CreateAttribute(option.normal);
        }
        this.geometry = new Cesium.Geometry({
            attributes,
            indices: option.indexs,
            primitiveType: Cesium.PrimitiveType[option.type as any] as any,
            boundingSphere: Cesium.BoundingSphere.fromVertices(
                option.position.values as any,
            ),
        });
        (this.geometry as any).rectangle = new Cesium.Rectangle();
    }
}
