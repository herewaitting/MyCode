// // 点图层
import { AlphaCylinder } from "../../layers/point/alphaCylinder";
import { AngleRing } from "../../layers/point/angleRing";
import { Billboard } from "../../layers/point/billboard/";
import { ColorPoint } from "../../layers/point/colorPoint";
import { CustomTextLabel } from "../../layers/point/customTextLabel/";
import { DomeCover } from "../../layers/point/domeCover";
import { GifBillboard } from "../../layers/point/gifBillboard";
import { HotMap2D } from "../../layers/point/hotMap2D";
import { LightBeam } from "../../layers/point/lightBeam";
import { ModelPoint } from "../../layers/point/modelPoint";
import { MultiPyramid } from "../../layers/point/multiPyramid/";
// import { SearchLight } from "../../layers/point/searchLight";
import { RadarScan } from "../../layers/point/radarScan/";
// import { Polymerize } from "../../layers/point/polymerize";
import { RandomFloatPoint } from "../../layers/point/randomFloatPoint/";
import { RotateImage } from "../../layers/point/rotateImage";
import { SimulateHalo } from "../../layers/point/simulateHalo";
import { SoaringPoint } from "../../layers/point/soaringPoint";
import { SweepLight } from "../../layers/point/sweepLight";
import { TextLabel } from "../../layers/point/textLabel";
import { Tornado } from "../../layers/point/tornado";
import { VideoBillboard } from "../../layers/point/videoBillboard";
import { WaveCircle } from "../../layers/point/waveCircle";
import { WaveRect } from "../../layers/point/waveRect.ts";
import { WaveRing } from "../../layers/point/waveRing/";
import { WishPoint } from "../../layers/point/wishPoint";

// 线图层
import { ColorLine } from "../../layers/line/colorLine";
import { CommonLine } from "../../layers/line/commonLine";
import { ElectricIndustryColorLine } from "../../layers/line/electricIndustryColorLine";
import { ElectricIndustryLine } from "../../layers/line/electricIndustryLine";
import { ImageLine } from "../../layers/line/imageLine";
import { ImageParabola } from "../../layers/line/imageParabola";
import { Parabola } from "../../layers/line/parabola/";
// import { PathAnimation } from "../../layers/line/PathAnimation";
// import { RealTimePath } from "../../layers/line/realTimePath";

// // 面图层
// import { CubePolygon } from "../../layers/polygon/cubePolygon";
import { ImagePolygon } from "../../layers/polygon//imagePolygon";
import { CommonWater } from "../../layers/polygon/commonWater";
import { GridMirrorRect } from "../../layers/polygon/gridMirrorRect";
import { ImageWall } from "../../layers/polygon/imageWall";
import { InnerGlowPolygon } from "../../layers/polygon/innerGlowPolygon";
import { InvertedSceneLaker } from "../../layers/polygon/invertedSceneLaker";
import { WaveRiseWall } from "../../layers/polygon/waveRiseWall";
// import { ShaderWall } from "../../layers/polygon/shaderWall";
// import { SingleBody } from "../../layers/polygon/singleBody";

// // 建筑图层
import { ModelCity } from "../../layers/building/modelCity";
import { WhiteTiles } from "../../layers/building/whiteTiles/";

// 分析图层
// import { ViewShed } from "../../layers/analysis/viewShed";
import { FocusArea } from "../../layers/analysis/focusArea";
import { TailorEarth } from "../../layers/analysis/tailorEarth";
import { TailorTiles } from "../../layers/analysis/tailorTiles";

// 复合图层
import { ComposeLayer } from "../../layers/compose";

export const UseableLayers = {
    Point: [
        {
            name: "",
            type: "Billboard",
            img: "",
            layer: Billboard,
        },
        {
            name: "",
            type: "ColorPoint",
            img: "",
            layer: ColorPoint,
        },
        {
            name: "",
            type: "DomeCover",
            img: "",
            layer: DomeCover,
        },
        {
            name: "",
            type: "WishPoint",
            img: "",
            layer: WishPoint,
        },
        {
            name: "",
            type: "WaveRing",
            img: "",
            layer: WaveRing,
        },
        {
            name: "",
            type: "GifBillboard",
            img: "",
            layer: GifBillboard,
        },
        {
            name: "",
            type: "ModelPoint",
            img: "",
            layer: ModelPoint,
        },
        {
            name: "",
            type: "WaveCircle",
            img: "",
            layer: WaveCircle,
        },
        {
            name: "",
            type: "MultiPyramid",
            img: "",
            layer: MultiPyramid,
        },
        {
            name: "",
            type: "RadarScan",
            img: "",
            layer: RadarScan,
        },
        {
            name: "",
            type: "LightBeam",
            img: "",
            layer: LightBeam,
        },
        {
            name: "",
            type: "RotateImage",
            img: "",
            layer: RotateImage,
        },
        // {
        //     name: "",
        //     type: "info",
        //     img: "",
        // },
        {
            name: "",
            type: "Tornado",
            img: "",
            layer: Tornado,
        },
        {
            name: "",
            type: "TextLabel",
            img: "",
            layer: TextLabel,
        },
        {
            name: "",
            type: "WaveRect",
            img: "",
            layer: WaveRect,
        },
        {
            name: "",
            type: "HotMap2D",
            img: "",
            layer: HotMap2D,
        },
        {
            name: "",
            type: "RandomFloatPoint",
            img: "",
            layer: RandomFloatPoint,
        },
        {
            name: "",
            type: "AlphaCylinder",
            img: "",
            layer: AlphaCylinder,
        },
        {
            name: "",
            type: "SimulateHalo",
            img: "",
            layer: SimulateHalo,
        },
        {
            name: "",
            type: "AngleRing",
            img: "",
            layer: AngleRing,
        },
        {
            name: "",
            type: "CustomTextLabel",
            img: "",
            layer: CustomTextLabel,
        },
        {
            name: "",
            type: "Compose",
            img: "",
            layer: ComposeLayer,
        },
        {
            name: "",
            type: "SweepLight",
            img: "",
            layer: SweepLight,
        },
        {
            name: "",
            type: "SoaringPoint",
            img: "",
            layer: SoaringPoint,
        },
        {
            name: "",
            type: "VideoBillboard",
            img: "",
            layer: VideoBillboard,
        },
        // {
        //     name: "",
        //     type: "Polymerize",
        //     img: "",
        //     layer: Polymerize,
        // },
        // {
        //     name: "",
        //     type: "searchLight",
        //     img: "",
        //     layer: SearchLight,
        // },
    ],
    Line: [
        {
            name: "",
            type: "Parabola",
            img: "",
            layer: Parabola,
        },
        {
            name: "",
            type: "ImageLine",
            img: "",
            layer: ImageLine,
        },
        {
            name: "",
            type: "ColorLine",
            img: "",
            layer: ColorLine,
        },
        {
            name: "",
            type: "ImageParabola",
            img: "",
            layer: ImageParabola,
        },
        {
            name: "",
            type: "ElectricIndustryLine",
            img: "",
            layer: ElectricIndustryLine,
        },
        {
            name: "",
            type: "ElectricIndustryColorLine",
            img: "",
            layer: ElectricIndustryColorLine,
        },
        {
            name: "",
            type: "CommonLine",
            img: "",
            layer: CommonLine,
        },
        // {
        //     name: "",
        //     type: "PathAnimation",
        //     img: "",
        //     layer: PathAnimation,
        // },
        // {
        //     name: "",
        //     type: "RealTimePath",
        //     img: "",
        //     layer: RealTimePath,
        // },
    ],
    Polygon: [
        // {
        //     name: "",
        //     type: "CubePolygon",
        //     img: "",
        //     layer: CubePolygon,
        // },
        {
            name: "",
            type: "CommonWater",
            img: "",
            layer: CommonWater,
        },
        {
            name: "",
            type: "ImageWall",
            img: "",
            layer: ImageWall,
        },
        // {
        //     name: "",
        //     type: "SingleBody",
        //     img: "",
        //     layer: SingleBody,
        // },
        {
            name: "",
            type: "WaveRiseWall",
            img: "",
            layer: WaveRiseWall,
        },
        {
            name: "",
            type: "ImagePolygon",
            img: "",
            layer: ImagePolygon,
        },
        // {
        //     name: "",
        //     type: "shaderWall",
        //     img: "",
        //     layer: ShaderWall,
        // },
        {
            name: "",
            type: "GridMirrorRect",
            img: "",
            layer: GridMirrorRect,
        },
        {
            name: "",
            type: "InnerGlowPolygon",
            img: "",
            layer: InnerGlowPolygon,
        },
        {
            name: "",
            type: "InvertedSceneLaker",
            img: "",
            layer: InvertedSceneLaker,
        },
    ],
    Building: [
        {
            name: "",
            type: "WhiteTiles",
            img: "",
            layer: WhiteTiles,
        },
        {
            name: "",
            type: "ModelCity",
            img: "",
            layer: ModelCity,
        },
    ],
    Analysis: [
        // {
        //     name: "",
        //     type: "ViewShed",
        //     img: "",
        //     layer: ViewShed,
        // },
        {
            name: "",
            type: "TailorEarth",
            img: "",
            layer: TailorEarth,
        },
        {
            name: "",
            type: "FocusArea",
            img: "",
            layer: FocusArea,
        },
        {
            name: "",
            type: "TailorTiles",
            img: "",
            layer: TailorTiles,
        },
    ],
};
