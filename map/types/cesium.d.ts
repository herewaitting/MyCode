declare module "cesium" {
    export class LineFlowMaterial {
        color: Color;
        url: string;
        duration: number;
        constructor(options: { url?: string; color?: Cesium.Color });
        getType(time: JulianDate): string;
        getValue(time: JulianDate, result?: any): any;
        equals(right?: LineFlowMaterial): boolean;
    }

    export class EntityScanMaterial {
        color: Color;
        url: string;
        constructor(options: { url?: string; color?: Cesium.Color });
        getType(time: JulianDate): string;
        getValue(time: JulianDate, result?: any): any;
        equals(right?: EntityScanMaterial): boolean;
    }

    export class CircleWaveMaterial {
        color: Color;
        gradient: number;
        duration: number;
        count: number;
        constructor(options: {
            gradient?: number;
            color?: Cesium.Color;
            duration?: number;
            count?: number;
        });
        getType(time: JulianDate): string;
        getValue(time: JulianDate, result?: any): any;
        equals(right?: CircleWaveMaterial): boolean;
    }

    export class Cesium3DTileset {
        constructor(Cesium3DTilesetItem: {
            url: string;
            maximumScreenSpaceError: number;
            maximumNumberOfLoadedTiles: number;
            offset: number;
            style: string;
        });
    }

    export class ExpandBySTC {
        static shaderOfBM: string;
        static styleBM: boolean;
        static ableTilesFbo: boolean;
        static tilesFbo: any;
        static tilesFboClear: any;
        static newFrame: boolean;
        static depthStencilTexture: any;
        static colorTexture: any;
        static bmScaleZNum: number;
        static bloomElse: any;
        static primitiveBloomFBO: any;
        static baseMap: any;
        static appearTiles: boolean;
        static gltfScaleZNum: number;
        static limitPitch: number;
    }

    export class LineFloodMaterial {
        constructor(opts: any);
    }

    export function defaultValue(a: any, b: any): any;

    export class RenderState {
        constructor(opts: any);
        static fromCache(): any;
    }

    export class Cesium3DTileStyle {
        constructor(opts: any);
    }

    export class Texture {
        constructor(opts: any);
    }
    export class Sampler {
        constructor(opts: any);
    }
    export class ClearCommand {
        constructor(opts: any);
    }
    export enum PixelDatatype {
        FLOAT,
        UNSIGNED_INT_24_8
    }
    export class TextureWrap {
        static CLAMP_TO_EDGE: any;
    }

    export class TextureMinificationFilter {
        static NEAREST: any;
    }

    export class TextureMagnificationFilter {
        static NEAREST: any;
    }

    export class Framebuffer {
        constructor(opts: any);
    }

    export class WishPointMaterial {
        constructor(opts: any);
    }
    export class LinePrimitiveColorFlowMaterial {
        constructor(opts: any);
    }
    export class LinePrimitiveImageFlowMaterial {
        constructor(opts: any);
    }
    export class MagicCircleMaterial {
        constructor(opts: any);
    }
    export class RenderState {
        constructor(opts: any);
    }
    export class CommandPrimitive {
        constructor(opts: any);
    }
    export class Ray {
        origin: Cartesian3;
        direction: Cartesian3;
        constructor(origin?: Cartesian3, direction?: Cartesian3);
        static getPoint(ray:Ray,t: number, result?: Cartesian3): Cartesian3;
    }
    export class CirclePrimitiveWaveMaterial {
        constructor(opts: any);
    }
    export class MagicCirclePrimitiveMaterial {
        constructor(opts: any);
    }
    export class WishPointPrimitiveMaterial {
        constructor(opts: any);
    }
    export class ScanEllipsePrimitiveMaterial {
        constructor(opts: any);
    }
    export class TurnadoPrimitiveMaterial {
        constructor(opts: any);
    }
    export class ClearCommand {
        constructor(opts: any);
    }

    export class mulityLineWallMaterial {
        constructor(opts: any);
    }
    export class LinePrimitiveImageColorFlowMaterial {
        constructor(opts: any);
    }
}
