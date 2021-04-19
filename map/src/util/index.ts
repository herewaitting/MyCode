// tslint:disable: jsdoc-format
import * as Cesium from "cesium";
import { ILonLatHeight } from "../interface";

// 传入CSS字符串颜色，输出Color
export const transformColor = (
    color: string,
    alpha?: number,
): Cesium.Color | undefined => {
    if (!color) {
        return;
    }
    const czmColor: Cesium.Color = Cesium.Color.fromCssColorString(color);
    if (alpha && alpha !== 0) {
        czmColor.alpha = alpha;
    }
    return czmColor;
};

// 输入点对象数组，返回一维经纬度高度数组集合
export const transformLonLatData = (data: ILonLatHeight[], height?: number): number[] => {
    const dataArr: number[] = [];
    data.forEach((item) => {
        let resHeight = 0;
        if (!item.height) {
            item.height = 0;
        }
        if (Cesium.defined(item.height)) {
            resHeight = item.height + height! || 0.1;
        } else {
            resHeight = height || 0.5;
        }
        dataArr.push(item.longitude, item.latitude, resHeight);
    });
    return dataArr;
};

// 调整一个Cartesian3点数据的高度
export const adjustCartesina3Height = (point: Cesium.Cartesian3, height: number): Cesium.Cartesian3 | undefined => {
    if (!point || !height && height !== 0) {
        return;
    }
    const cart = Cesium.Cartographic.fromCartesian(point);
    // const norDir = Cesium.Cartesian3.normalize(point, new Cesium.Cartesian3());
    // if (!norDir) {
    //     return;
    // }
    // const currRay = new Cesium.Ray(point, norDir);
    // return Cesium.Ray.getPoint(currRay, height);
    const newP = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, height || 0);
    return newP;
};

// 设置一个Cartesian3点数据的高度
export const setCartesian3Height = (point: Cesium.Cartesian3, height: number): Cesium.Cartesian3 | undefined => {
    if (!point || !height && height !== 0) {
        return;
    }
    const cart = Cesium.Cartographic.fromCartesian(point);
    if (!cart) {
        return;
    }
    return Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, height);
};

// 根据两点和分隔距离计算新点
export const getPointByDis = (point: Cesium.Cartesian3, dirPos: Cesium.Cartesian3, dis: number) => {
    const dirNew = Cesium.Cartesian3.subtract(dirPos, point, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(dirNew, dirNew);
    return getPointByPointDirDis(point, dirNew, dis);
};

// 根据一点、方向、和距离输出该射线上的点
// tslint:disable-next-line: max-line-length
export const getPointByPointDirDis = (point: Cesium.Cartesian3, dir: Cesium.Cartesian3, dis: number): Cesium.Cartesian3 | undefined => {
    if (!point || !dir || !dis) {
        return;
    }
    const norDir = Cesium.Cartesian3.normalize(dir, new Cesium.Cartesian3());
    if (!norDir) {
        return;
    }
    const ray = new Cesium.Ray(point, norDir);
    return Cesium.Ray.getPoint(ray, dis);
};

// 根据位置点和目标点，计算相机的参数
export const computedCameraByTarget = (position: Cesium.Cartesian3, target: Cesium.Cartesian3): any => {
    const viewRes: any = {
        position: undefined,
        direction: undefined,
        up: undefined,
        right: undefined,
    };
    if (!position || !target) {
        return viewRes;
    }
    viewRes.position = position;
    const dirTarget = Cesium.Cartesian3.subtract(target, position, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(dirTarget, dirTarget);
    viewRes.direction = dirTarget;
    const norPos = Cesium.Cartesian3.normalize(position, new Cesium.Cartesian3());
    viewRes.right = Cesium.Cartesian3.cross(dirTarget, norPos, new Cesium.Cartesian3());
    viewRes.up = Cesium.Cartesian3.cross(viewRes.right, viewRes.direction, new Cesium.Cartesian3());
    return viewRes;
};

export interface IGeojsonLineData {
    id: string;
    points: ILonLatHeight[];
}

export enum EFILETYPE {
    GEOMETRY = "GeometryCollection",
    FEATURE = "FeatureCollection",
}

export enum EDATATYPE {
    MULITYLINE = "MultiLine",
    LINESTRING = "LineString",
    LINE = "Line",
    MULITYPOINT = "MultiPoint",
    POINTSTRING = "PointString",
    POINT = "Point",
    MULITYPOLYGON = "MultiPolygon",
    POLYGONSTRING = "PolygonString",
    POLYGON = "Polygon",
}

/**
 * @name: wp2c3
 * @description: 获取鼠标当前的屏幕坐标位置的三维Cesium坐标
 * @param {Cartesian2} windowPosition 二维屏幕坐标位置
 * @param {Scene} scene
 * @param {Entity} noPickEntity 排除的对象（主要用于绘制中，排除对自己本身的拾取）
 * @return: cartesian3 世界坐标
 */
export function wp2c3(
    windowPosition: Cesium.Cartesian2,
    scene: any,
    noPickEntity?: any,
): Cesium.Cartesian3 {
    let cartesian3: Cesium.Cartesian3;

    //  在模型上提取坐标
    const pickedPrimitive = scene.pick(windowPosition);
    if (scene.pickPositionSupported && Cesium.defined(pickedPrimitive)) {
        //  pickPositionSupported :判断是否支持深度拾取,不支持时无法进行鼠标交互绘制
        const entity = pickedPrimitive.id;
        if (!noPickEntity || entity !== noPickEntity) {
            const cartesian = scene.pickPosition(windowPosition);
            if (Cesium.defined(cartesian)) {
                const cartographic = Cesium.Cartographic.fromCartesian(
                    cartesian,
                );
                const height = cartographic.height; //  模型高度
                if (height >= 0) {
                    return (cartesian3 = cartesian);
                }

                if (Cesium.defined(pickedPrimitive.id) && height >= -500) {
                    //  不是entity时，支持3dtiles地下
                    return (cartesian3 = cartesian);
                }
            }
        }
    }

    //  测试scene.pickPosition和globe.pick的适用场景 https://zhuanlan.zhihu.com/p/44767866
    //  1. globe.pick的结果相对稳定准确，不论地形深度检测开启与否，不论加载的是默认地形还是别的地形数据；
    //  2. scene.pickPosition只有在开启地形深度检测，且不使用默认地形时是准确的。
    //  注意点： 1. globe.pick只能求交地形； 2. scene.pickPosition不仅可以求交地形，还可以求交除地形以外其他所有写深度的物体。

    if (scene.mode === Cesium.SceneMode.SCENE3D) {
        //  三维模式下
        const pickRay = scene.camera.getPickRay(windowPosition);
        cartesian3 = scene.globe.pick(pickRay, scene);
    } else {
        cartesian3 = scene.camera.pickEllipsoid(
            windowPosition,
            scene.globe.ellipsoid,
        );
    }
    return cartesian3;
}

/**
 * @name: pos2Cgh
 * @description: 二维坐标或者三维坐标转地理坐标 支持模型高度
 * @param {Cartesian2 | Cartesian3} position 二维坐标或者三维坐标
 * @param {Scene} scene
 * @param {boolean} flag 是否转成角度制
 * @return {Cartographic} 地理坐标
 */
export function pos2Cgh(position: Cesium.Cartesian2, scene: any, flag?: boolean): Cesium.Cartographic {
    const cartographic = new Cesium.Cartographic();
    let cartesian3: Cesium.Cartesian3 = undefined as any;
    if (position.x >= -1000 && position.y >= -1000) {
        cartesian3 = wp2c3(position, scene);
        Cesium.Cartographic.fromCartesian(cartesian3, scene.globe.ellipsoid, cartographic);
    }
    if (cartesian3.x >= -999999999 && cartesian3.y >= -999999999 && cartesian3.z >= -999999999 ) {
        Cesium.Cartographic.fromCartesian(cartesian3, scene.globe.ellipsoid, cartographic);
    }
    if (flag) {
        cartographic.longitude = Cesium.Math.toDegrees(cartographic.longitude);
        cartographic.latitude = Cesium.Math.toDegrees(cartographic.latitude);
    }
    cartographic.height = +cartographic.height.toFixed(2);
    return cartographic;
}

/**
 * @description: 根据两点计算相机标准姿态（没有roll）
 * @param {targetPos} 目标点
 * @param {cameraPos} 相机点
 * @return: {direction:"", right: "", up: ""}
 */
// tslint:disable-next-line: max-line-length
export function adjustCameraNoRoll(targetPos: Cesium.Cartesian3, cameraPos: Cesium.Cartesian3): ICameraStatusNoRoll | undefined {
    const resStatus: ICameraStatusNoRoll = {
        direction: new Cesium.Cartesian3(),
        right: new Cesium.Cartesian3(),
        up: new Cesium.Cartesian3(),
    };
    if (!targetPos || !cameraPos) {
        return;
    }
    Cesium.Cartesian3.subtract(targetPos, cameraPos, resStatus.direction);
    Cesium.Cartesian3.normalize(resStatus.direction, resStatus.direction);
    Cesium.Cartesian3.normalize(cameraPos, resStatus.up);
    Cesium.Cartesian3.cross(resStatus.direction, resStatus.up, resStatus.right);
    Cesium.Cartesian3.normalize(resStatus.right, resStatus.right);
    Cesium.Cartesian3.cross(resStatus.right, resStatus.direction, resStatus.up);
    Cesium.Cartesian3.normalize(resStatus.up, resStatus.up);
    return resStatus;
}

export interface ICameraStatusNoRoll {
    direction: Cesium.Cartesian3;
    up: Cesium.Cartesian3;
    right: Cesium.Cartesian3;
}

// 判断对象类型
export const isType = (type: string) => (obj: any) => Object.prototype.toString.call(obj) === `[object ${type}]`;

// 本地坐标系中，分隔圆，返回顶点数据
export const SplitCircle = (num: number) => {
    const vertexArr = [];
    for (let i = 0; i <= num; i++) { // 自动闭合，第一个点和最后一个点重合
        const currAngle = (360 / num) * i;
        const currRad = Cesium.Math.toRadians(currAngle);
        const currX = Math.cos(currRad);
        const currY = Math.sin(currRad);
        vertexArr.push(currX, currY, 0);
    }
    return vertexArr;
};

// 比较数组区分出相对于第一个数据参数的已有，没有，新增, 闪烁
export const compareArray = (oldArr: any[], newArr: any[], filterKey: string, style?: any) => {
    const havedArr: any[] = [];
    const delArr: any[] = [];
    const appendArr: any[] = [];
    const flashArr: any[] = [];
    if (filterKey) {
        oldArr.forEach((item) => {
            const oldValue = item[filterKey];
            const currHave = newArr.find((newItem) => {
                return newItem[filterKey] === oldValue;
            });
            if (currHave) {
                havedArr.push(currHave);
            } else {
                delArr.push(item);
            }
        });
        newArr.forEach((item) => {
            const newValue = item[filterKey];
            const newCurr = oldArr.find((oldItem) => {
                return oldItem[filterKey] === newValue;
            });
            if (!newCurr) {
                appendArr.push(item);
            }
        });
    } else {
        oldArr.forEach((item) => {
            const currHave = newArr.find((newItem) => {
                return newItem === item;
            });
            if (currHave) {
                havedArr.push(currHave);
            } else {
                delArr.push(item);
            }
        });
        newArr.forEach((item) => {
            const newCurr = oldArr.find((oldItem) => {
                return oldItem === item;
            });
            if (!newCurr) {
                appendArr.push(item);
            }
        });
    }
    if (style && style.condition) {
// oldArr.forEach((item) => {
//     const currStyle = judgeItemStyleType(item, style.condition);
//     // tslint:disable-next-line: max-line-length
// tslint:disable-next-line: max-line-length
//     if (judgeItemFlash(currStyle, style.condition) && delArr.indexOf(item) === -1 && flashArr.indexOf(item[filterKey]) === -1) {
//         flashArr.push(item[filterKey]);
//     }
// });
        newArr.forEach((item) => {
            const currStyle = judgeItemStyleType(item, style.condition);
            // tslint:disable-next-line: max-line-length
            if (judgeItemFlash(currStyle, style.condition) && delArr.indexOf(item) === -1 && flashArr.indexOf(item[filterKey]) === -1) {
                flashArr.push(item[filterKey]);
            }
        });
    }
    return {
        have: havedArr,
        del: delArr,
        append: appendArr,
        flash: flashArr,
    };
};

export const judgeItemStyleType = (info: any, condition: any[]): string => {
    if (!condition || !condition.length) {
        return "default";
    }
    let resStr = "default";
    if (!info) {
        return resStr;
    }
    const re = /(\{\{)(\s*\w+\s*)(\}\})/gm;
    const tConditions = [...condition];
    if (tConditions && tConditions.length) {
        for (const c of tConditions) {
            if (resStr !== "default") {
                break;
            }
            if (c.condition) {
                const oldCond = c.condition;
                let newCond = c.condition;
                const variables = c.condition.match(re); //  ["{{  variable  }}", "{{ variable}}"] || null
                if (variables) {
                   for (const variable of variables) {
                       const execArr = re.exec(variable);
                       re.lastIndex = 0;
                       const dataKey = execArr ? execArr[2].trim() : "";
                       if (info[dataKey]) {
                            newCond = newCond.replace(new RegExp(variable), "'" + info[dataKey] + "'");
                            try {
                                // tslint:disable-next-line: no-eval
                                if (eval(newCond)) {
                                    resStr = oldCond;
                                    break;
                                }
                            } catch (err) {
                                resStr = "default";
                            }
                       }
                    }
                } else {
                    continue;
                }
            } else {
                continue;
            }
        }
    }
    return resStr;
};

export const judgeItemFlash = (condTxt: string, condition: any[]) => {
    if (!condition || !condition.length) {
        return false;
    }
    let resBool = false;
    const tConditions = [...condition];
    if (tConditions && tConditions.length) {
        for (const c of tConditions) {
            const oldCond = c.condition;
            if (oldCond === condTxt) {
                const style = c.style;
                resBool = style.flash;
                break;
            }
        }
    }
    return resBool;
};

export const ToRadians = (deg: number) => {
    return deg * Math.PI / 180;
};

export const ToDegrees = (rad: number) => {
    return rad * 180 / Math.PI;
};

// tslint:disable-next-line: max-line-length
export const offsetPoint = (point: Cesium.Cartesian3, northOffset: number, eastOffset: number, heightOffset?: number) => {
    if (!northOffset && !eastOffset && !heightOffset) {
        return point;
    }
    const trans = Cesium.Transforms.eastNorthUpToFixedFrame(point);
    const oriP = new Cesium.Cartesian3(eastOffset, northOffset, heightOffset || 0);
    const newP = Cesium.Matrix4.multiplyByPoint(trans, oriP, new Cesium.Cartesian3());
    return newP;
};
