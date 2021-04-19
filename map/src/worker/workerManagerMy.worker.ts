import { ILonLatHeight } from "../interface";
import Cartesian3 from "./czmCore/Cartesian3.js";
import Cartographic from "./czmCore/Cartographic.js";
import clone from "./czmCore/clone.js";
import Ray from "./czmCore/Ray.js";
import ParserManager from "./layeDataParser";
import { judgeItemStyleType, transformLonLatData } from "./workerUtil";

const parserManager = new ParserManager();
const ctx: Worker = self as any;
ctx.onmessage = (async (e) => {
    let data;
    try {
        data = JSON.parse(e.data);
    } catch (e) {
        throw new Error(`${e.message} in parse data worker`);
    }
    if (data) {
        let tData = null;
        if (data.data) {
            tData = await parserManager.parse(data.layerType, data.data);
        }
        if (!data.initLayer && tData && data.style && data.style.realTime) {
            const layerName = data.layerName;
            ctx.postMessage({
                layerName,
                done: true,
                currData: tData,
                realTime: data.style.realTime,
            });
            return;
        }
        if (tData && data.style && data.style.history) {
            const layerName = data.layerName;
            ctx.postMessage({
                layerName,
                done: true,
                currData: tData,
                history: data.style.history,
            });
            // return;
        }
        const option = clone(data) as any;
        option.data = tData;
        WorkerManagerObj[data.funName](option);
    }
});

// const AverageLerpLine = (line: ILonLatHeight[], height: number) => {
//     if (!line || !line.length) {
//         return;
//     }
//     const avgDis = 20;
//     const lerpedArr = [];
//     const firstP = line[0];
//     const len = line.length;
//     lerpedArr.push(Cartesian3.fromDegrees(firstP.longitude, firstP.latitude, firstP.height || 0 + height));
//     for (let i = 1; i < len; i++) {
//         const prevP = line[i - 1];
//         const currP = line[i];
//         const prevCP = Cartesian3.fromDegrees(prevP.longitude, prevP.latitude, prevP.height || 0 + height);
//         const currCP = Cartesian3.fromDegrees(currP.longitude, currP.latitude, currP.height || 0 + height);
//         const currAllDis = Cartesian3.distance(prevCP, currCP);
//         const lerpNum = Math.floor(currAllDis / avgDis);
//         const currDir = Cartesian3.subtract(currCP, prevCP, new Cartesian3());
//         Cartesian3.normalize(currDir, currDir);
//         const currRay = new Ray(prevCP, currDir);
//         for (let j = 0; j <= lerpNum; j++) {
//             lerpedArr.push(Ray.getPoint(currRay, j * avgDis));
//         }
//     }
//     const lastP = line[len - 1];
//     lerpedArr.push(Cartesian3.fromDegrees(lastP.longitude, lastP.latitude, lastP.height || 0 + height));
//     return lerpedArr;
// };

const WorkerManagerObj: any = {
    LineWorkerFun: (option: any) => {
        const data = option.data;
        const style = option.style;
        const layerName = option.layerName;
        if (!data || !data.length) {
            return;
        }
        if (!style) {
            (style as any) = {};
        }
        // const currWidth = style.lineWidth || 2;
        const len = (data as any).length;
        for (let i = 0, leni = len; i < leni; i++) {
            const currLine = data[i].points;
            const currStyle = judgeItemStyleType(currLine[0], style.condition);
            // tslint:disable-next-line: max-line-length
            const currPoints: number[] = transformLonLatData(currLine as ILonLatHeight[], style.height || 0.5);
            const posArr = Cartesian3.fromDegreesArrayHeights(
                currPoints,
            );
            // const posArr = AverageLerpLine(currLine, style.height || 0.5);
            ctx.postMessage({
                layerName,
                dataArr: posArr,
                done: Number(i) === (len - 1),
                currData: clone(data[i]),
                currStyle,
            });
        }
    },
    RandWorkerFun: (option: any) => {
        const style = option.style;
        const layerName = option.layerName;
        const vertexArr = [];
        const indexArr = [];
        const colorArr = [];
        for (let i = 0; i < style.potNum; i++) {
            vertexArr.push(Math.random() - 0.5);
            vertexArr.push(Math.random() - 0.5);
            vertexArr.push(Math.random());
            indexArr.push(i);
            colorArr.push(Math.random() - 0.5);
            colorArr.push(Math.random() - 0.5);
            colorArr.push(Math.random() - 0.5);
            colorArr.push(Math.random() - 0.5);
        }
        ctx.postMessage({
            layerName,
            dataArr: {
                vertex: new Float64Array(vertexArr),
                index: new Uint32Array(indexArr),
                color: new Float32Array(colorArr),
            },
            done: true,
        });
    },
    ParabolaWorkerFun: (option: any) => {
        const data = option.data;
        const style = option.style;
        const layerName = option.layerName;
        if (!data || !data.length) {
            return;
        }
        if (!style) {
            (style as any) = {};
        }
        const points = data;
        // const resarr = [];
        if (!points || points.length === 0) { return; }
        const currHeight = style.height || 0.5;
        const currNum = style.num || 20;
        for (let i = 0, dataLen = points.length; i < dataLen; i++) {
            const currPwx = points[i];
            if (!currPwx.points) { continue; }
            const currOri = currPwx.points[0];
            const currTargetPot = currPwx.points[1];
            if (!currOri || !currTargetPot) { continue; }
            const currPwxPots = getLinkedPointList(currOri, currTargetPot, currHeight * 5000, currNum);
            const currData = clone(points[i]) as any;
            delete currData.points;
            // resarr.push(currPwxPots);
            ctx.postMessage({
                layerName,
                dataArr: currPwxPots,
                done: Number(i) === (dataLen - 1),
                currData,
            });
        }
        // ctx.postMessage({
        //     name: layerName,
        //     dataArr: resarr,
        //     // done: Number(i) === (dataLen - 1),
        // });
    },
    PointWorkerFun: (option: any) => {
        const data = option.data;
        const style = option.style;
        const layerName = option.layerName;
        if (!data || !data.length) {
            return;
        }
        if (!style) {
            (style as any) = {};
        }
        const points = data;
        const dataLen = (points as any).length;
        const existedId: string[] = [];
        for (let i = 0, len = dataLen; i < len; i++) {
            const currPoint = (points as ILonLatHeight[])[i];
            if (existedId.indexOf(currPoint.id) >= 0) {
                continue;
            }
            const kdinfo = clone(currPoint as any);
            const currStyle = judgeItemStyleType(currPoint, style.condition);
            const currHeight = currPoint.height || 0.0;
            currPoint.longitude = currPoint.longitude ? Number(currPoint.longitude) : Number(currPoint.lon);
            currPoint.latitude = currPoint.latitude ? Number(currPoint.latitude) : Number(currPoint.lat);
            if (!judgeLonLat(currPoint.longitude, currPoint.latitude)) {
                ctx.postMessage({
                    layerName,
                    dataArr: undefined,
                    done: Number(i) === (dataLen - 1),
                    kdinfo,
                    currStyle,
                });
                continue;
            }
            const center = Cartesian3.fromDegrees(
                currPoint.longitude * 1,
                currPoint.latitude * 1,
                currHeight * 1,
            );
            ctx.postMessage({
                layerName,
                dataArr: center,
                done: Number(i) === (dataLen - 1),
                kdinfo,
                currStyle,
            });
            existedId.push(currPoint.id);
        }
    },
    WishPointWorkerFun: (option: any) => {
        const data = option.data;
        const style = option.style;
        const layerName = option.layerName;
        if (!data || !data.length) {
            return;
        }
        if (!style) {
            (style as any) = {};
        }
        const dataLen = (data as any).length;
        for (let i = 0, len = dataLen; i < len; i++) {
            const currPoint = (data as ILonLatHeight[])[i];
            const currHeight = style.height || 100;
            currPoint.longitude = currPoint.longitude ? Number(currPoint.longitude) : Number(currPoint.lon);
            currPoint.latitude = currPoint.latitude ? Number(currPoint.latitude) : Number(currPoint.lat);
            const center = Cartesian3.fromDegreesArrayHeights([
                currPoint.longitude * 1,
                currPoint.latitude * 1,
                0,
                currPoint.longitude * 1,
                currPoint.latitude * 1,
                currHeight,
            ]);
            const kdinfo = clone(currPoint);
            const currStyle = clone(style);
            ctx.postMessage({
                layerName,
                dataArr: center,
                done: Number(i) === (dataLen - 1),
                kdinfo,
                currStyle,
            });
        }
    },
    HotMapFun: (option: any) => {
        const data = option.data;
        const layerName = option.layerName;
        if (!data || !data.length) {
            return;
        }
        // const dataLen = (data as any).length;
        // // const hotArea = {};
        // const vertexArr = [];
        // const indexArr = [];
        // const colorArr = [];
        // let totalX = 0;
        // let totalY = 0;
        // let totalZ = 0;
        // for (let i = 0, len = dataLen; i < len; i++) {
        //     const currPoint = (data as ILonLatHeight[])[i];
        //     const center = Cartesian3.fromDegrees(
        //         currPoint.longitude,
        //         currPoint.latitude,
        //         0,
        //     );
        //     totalX += center.x;
        //     totalY += center.y;
        //     totalZ += center.z;
        //     vertexArr.push(center.x);
        //     vertexArr.push(center.y);
        //     vertexArr.push(center.z);
        //     indexArr.push(i);
        //     colorArr.push(Math.random() - 0.5);
        //     colorArr.push(Math.random() - 0.5);
        //     colorArr.push(Math.random() - 0.5);
        //     colorArr.push(Math.random() - 0.5);
        // }
        ctx.postMessage({
            layerName,
            dataArr: data,
            done: true,
        });
    },
    PolygonWorkerFun: (option: any) => {
        const data = option.data as any[];
        const layerName = option.layerName;
        if (!data || !data.length) {
            return;
        }
        const len = data.length;
        data.forEach((waterPots, i) => {
            const dataArr: number[] = transformLonLatData(waterPots.points, 0.5);
            const holesArr: any[] = [];
            if (waterPots.holes && waterPots.holes.length) {
                (waterPots.holes as any[]).forEach((hole) => {
                    const holesPos = transformLonLatData(hole.points, 0.5);
                    holesArr.push(Cartesian3.fromDegreesArrayHeights(holesPos));
                });
            }
            const currStyle = judgeItemStyleType(waterPots.points[0], option.style.condition);
            ctx.postMessage({
                layerName,
                dataArr: Cartesian3.fromDegreesArrayHeights(dataArr),
                holesArr,
                done: Number(i) === (len - 1),
                currStyle,
            });
        });
    },
    WallWorkerFun: (option: any) => {
        const data = option.data as any[];
        const layerName = option.layerName;
        if (!data || !data.length) {
            return;
        }
        const len = data.length;
        data.forEach((waterPots, i) => {
            const headP = Object.assign({}, waterPots.points[0]);
            headP.longitude = headP.longitude + 0.000001;
            waterPots.points.push(headP);
            const dataArr: number[] = transformLonLatData(waterPots.points);
            const currStyle = judgeItemStyleType(waterPots.points[0], option.style.condition);
            ctx.postMessage({
                layerName,
                dataArr: Cartesian3.fromDegreesArrayHeights(dataArr),
                done: Number(i) === (len - 1),
                currStyle,
            });
        });
    },
    BesselWorkerFun: (option: any) => {
        const data = option.data;
        const style = option.style;
        const layerName = option.layerName;
        if (!data || !data.length) {
            return;
        }
        if (!style) {
            (style as any) = {};
        }
        const points = data;
        // const resarr = [];
        if (!points || points.length === 0) { return; }
        const splitNum = style.splitNum || 40;
        const clutchDistance = style.clutchDistance || 0;
        const curvature = style.curvature || 1;
        for (let i = 0, dataLen = points.length; i < dataLen; i++) {
            const currPwx = points[i];
            if (!currPwx.points) { continue; }
            const currOri = currPwx.points[0];
            const currTargetPot = currPwx.points[1];
            const currStyle = judgeItemStyleType(currOri, style.condition);
            if (!currOri || !currTargetPot) { continue; }
            const currPwxPots = getBesselPointsList({
                start: currOri,
                end: currTargetPot,
                splitNum,
                clutchDistance,
                curvature,
            });
            if (!currPwxPots) {
                continue;
            }
            const currData = clone(points[i]) as any;
            delete currData.points;
            // resarr.push(currPwxPots);
            ctx.postMessage({
                layerName,
                dataArr: currPwxPots,
                done: Number(i) === (dataLen - 1),
                currData,
                midPoint: currPwxPots[Math.floor(currPwxPots.length / 2)],
                currStyle,
            });
        }
    },
};

// tslint:disable-next-line: max-line-length
const getLinkedPointList = (startPointllh: ILonLatHeight, endPointllh: ILonLatHeight, angularityFactor: number, numOfSingleLine: number): any[] => {
    startPointllh.longitude = startPointllh.longitude ? Number(startPointllh.longitude) : Number(startPointllh.lon);
    startPointllh.latitude = startPointllh.latitude ? Number(startPointllh.latitude) : Number(startPointllh.lat);
    endPointllh.longitude = endPointllh.longitude ? Number(endPointllh.longitude) : Number(endPointllh.lon);
    endPointllh.latitude = endPointllh.latitude ? Number(endPointllh.latitude) : Number(endPointllh.lat);
    const result: any[] = [];
    // tslint:disable-next-line: max-line-length
    const startPoint = Cartesian3.fromDegrees(startPointllh.longitude * 1, startPointllh.latitude * 1, startPointllh.height || 0);
    // tslint:disable-next-line: max-line-length
    const endPoint = Cartesian3.fromDegrees(endPointllh.longitude * 1, endPointllh.latitude * 1, endPointllh.height || 0);
    const startPosition = Cartographic.fromCartesian(startPoint);
    const endPosition = Cartographic.fromCartesian(endPoint);

    const startLon = startPosition.longitude * 180 / Math.PI;
    const startLat = startPosition.latitude * 180 / Math.PI;
    const endLon = endPosition.longitude * 180 / Math.PI;
    const endLat = endPosition.latitude * 180 / Math.PI;

    const dist = Math.sqrt((startLon - endLon) * (startLon - endLon) + (startLat - endLat) * (startLat - endLat));

    // var dist = Cartesian3.distance(startPoint, endPoint);
    const angularity = dist * angularityFactor;

    const startVec = Cartesian3.clone(startPoint);
    const endVec = Cartesian3.clone(endPoint);

    const startLength = Cartesian3.distance(startVec, Cartesian3.ZERO);
    const endLength = Cartesian3.distance(endVec, Cartesian3.ZERO);

    Cartesian3.normalize(startVec, startVec);
    Cartesian3.normalize(endVec, endVec);

    if (Cartesian3.distance(startVec, endVec) === 0) {
        return result;
    }

    // var cosOmega = Cartesian3.dot(startVec, endVec);
    // var omega = Math.acos(cosOmega);

    const omega = Cartesian3.angleBetween(startVec, endVec);

    result.push(startPoint);
    for (let i = 1; i < numOfSingleLine - 1; i++) {
        const t = i * 1.0 / (numOfSingleLine - 1);
        const invT = 1 - t;

        const startScalar = Math.sin(invT * omega) / Math.sin(omega);
        const endScalar = Math.sin(t * omega) / Math.sin(omega);

        const startScalarVec = Cartesian3.multiplyByScalar(startVec, startScalar, new Cartesian3());
        const endScalarVec = Cartesian3.multiplyByScalar(endVec, endScalar, new Cartesian3());

        let centerVec = Cartesian3.add(startScalarVec, endScalarVec, new Cartesian3());

        const ht = t * Math.PI;
        const centerLength = startLength * invT + endLength * t + Math.sin(ht) * angularity;
        centerVec = Cartesian3.multiplyByScalar(centerVec, centerLength, centerVec);

        result.push(centerVec);
    }

    result.push(endPoint);

    return result;
};

export interface IBesselOpts {
    start: ILonLatHeight;
    end: ILonLatHeight;
    splitNum: number;
    clutchDistance: number;
    curvature: number;
}

const getBesselPointsList = (option: IBesselOpts) => {
    const startP = option.start;
    const endP = option.end;
    const splitNum = option.splitNum;
    const clutchDistance = option.clutchDistance;
    const curvature = option.curvature;
    const controlP = computedControlPoint(startP, endP, curvature, clutchDistance);
    if (!controlP) {
        return;
    }
    const car1 = Cartesian3.fromDegrees(startP.longitude * 1, startP.latitude * 1, startP.height || 0);
    const car2 = Cartesian3.fromDegrees(endP.longitude * 1, endP.latitude * 1, endP.height || 0);
    // tslint:disable-next-line: max-line-length
    return ComputedBesselArr([car1.x, car1.y, car1.z], [car2.x, car2.y, car2.z], [controlP.x, controlP.y, controlP.z], splitNum);
};

// tslint:disable-next-line: max-line-length
export const computedControlPoint = (startP: ILonLatHeight, endP: ILonLatHeight, curvature: number, clutchDistance: number) => {
    startP.longitude = startP.longitude ? Number(startP.longitude) : Number(startP.lon);
    startP.latitude = startP.latitude ? Number(startP.latitude) : Number(startP.lat);
    endP.longitude = endP.longitude ? Number(endP.longitude) : Number(endP.lon);
    endP.latitude = endP.latitude ? Number(endP.latitude) : Number(endP.lat);
    if (startP.longitude === endP.longitude && startP.latitude === endP.latitude
        && (startP.height || 0) === (endP.height || 0)) {
        return;
    }
    if (!startP.height) {
        startP.height = 0;
    }
    if (!endP.height) {
        endP.height = 0;
    }
    const midLLH = {
        longitude: (startP.longitude + endP.longitude) / 2,
        latitude: (startP.latitude + endP.latitude) / 2,
        height: (startP.height || 0 + endP.height || 0) / 2,
    };
    const car1 = Cartesian3.fromDegrees(startP.longitude * 1, startP.latitude * 1, startP.height || 0);
    const car2 = Cartesian3.fromDegrees(endP.longitude * 1, endP.latitude * 1, endP.height || 0);
    const distance = Cartesian3.distance(car1, car2);
    const midCar = Cartesian3.fromDegrees(midLLH.longitude * 1, midLLH.latitude * 1, midLLH.height || 0);
    const dir = Cartesian3.subtract(car2, car1, new Cartesian3());
    Cartesian3.normalize(dir, dir);
    const midUp = Cartesian3.normalize(midCar, new Cartesian3());
    const offsetDir = Cartesian3.cross(midUp, dir, new Cartesian3());
    const wanduHeight = distance / 2 * curvature;
    // tslint:disable-next-line: max-line-length
    const tempMid = Cartesian3.fromDegrees(midLLH.longitude * 1, midLLH.latitude * 1, (midLLH.height || 0) + wanduHeight);
    const offsetRay = new Ray(tempMid, offsetDir);
    return Ray.getPoint(offsetRay, clutchDistance);
};

const ComputedBesselArr = (p1: number[], p2: number[], cp: number[], ci: number) => {
    const bseArr: any[] = [];
    for (let i = 0; i <= ci; i++) {
        const t = i / ci;
        const x = (1 - t) * (1 - t) * p1[0] + 2 * t * (1 - t) * cp[0] + t * t * p2[0];
        const y = (1 - t) * (1 - t) * p1[1] + 2 * t * (1 - t) * cp[1] + t * t * p2[1];
        const z = (1 - t) * (1 - t) * p1[2] + 2 * t * (1 - t) * cp[2] + t * t * p2[2];
        bseArr.push({
            x,
            y,
            z,
        });
    }
    return bseArr;
};

const judgeLonLat = (lon: number, lat: number) => {
    if (!lon || !lat) {
        return false;
    }
    if (Math.abs(lon) > 180 || Math.abs(lat) > 90) {
        return false;
    }
    return true;
};
