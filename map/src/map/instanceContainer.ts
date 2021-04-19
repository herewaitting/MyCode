import * as Cesium from "cesium";
import { IRealTimePath } from "../layers/point/point";
import { ILayerStyle as LabelStyle } from "../layers/point/textLabel/style";
import { adjustCartesina3Height, setCartesian3Height, transformColor } from "../util";
import { IWorldPos } from "./sceneServer";
export const InstanceContainerMap: {[key: string]: string} = {
    billboard: "BillboardCollection",
    point: "PointPrimitiveCollection",
    label: "LabelCollection",
    primitive: "PrimitiveCollection",
};

// 几何实体集合对象
export class InstanceContainer {
    public static changeBillboardStyle(billboard: any, style: any) {
        if (!billboard) {
            return;
        }
        style = {...{}, ...style};
        const currScale = style.scale || 1;
        // tslint:disable-next-line: max-line-length
        billboard.scaleByDistance = new Cesium.NearFarScalar(style.near || 0, currScale, style.far || Infinity, currScale * (style.ratio || 2));
        // tslint:disable-next-line: max-line-length
        billboard.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(style.near || 0, style.far || Infinity);
    }
    /**
     * @description: 更新实时点位置
     * @param {point} 点实体对象
     * @param {IRealTimePath} 点实体对象的路径对象
     */
    public static updatePointPosition(point: any, path: IRealTimePath) {
        if (!point || !path || !point.position && !point.modelMatrix) {
            return;
        }
        if (point.position && !point.modelMatrix) {
            point.position = path.pathPoints[path.index];
            point.oldPosition = path.pathPoints[path.index];
        }
        if (point.modelMatrix && !point.position) {
            // const mat = Cesium.Transforms.eastNorthUpToFixedFrame(path.pathPoints[path.index]);
            const modelMatrix = InstanceContainer.getModelMatrix(path.pathPoints as any, path.index);
            if (!modelMatrix) {
                return;
            }
            point.oldMat = Cesium.clone(modelMatrix);
            if (point.shapeMat) {
                Cesium.Matrix4.multiply(modelMatrix, point.shapeMat, modelMatrix);
            }
            point.modelMatrix = modelMatrix;
            path.index++;
        }
    }
    /**
     * @description: 获取路径上模型矩阵
     * @param {Cesium.Cartesian3[]} path
     * @param {number} 索引
     */
    public static getModelMatrix(path: Cesium.Cartesian3[], index: number) {
        const maxIndex = 30;
        const firstPos = path[index];
        const nextPos =  path[index + maxIndex] || path[index + 1];
        if (!firstPos || !nextPos || firstPos === nextPos) { return; }
        const currAngle = this.getAngle(
            Cesium.Cartographic.fromCartesian(firstPos),
            Cesium.Cartographic.fromCartesian(nextPos),
        );
        return this.computedMatrix(firstPos, currAngle);
    }
    /**
     * @description: 根据两点获取角度
     * @param {Cesium.Cartographic} p1
     * @param {Cesium.Cartographic} p2
     */
    public static getAngle(p1: Cesium.Cartographic, p2: Cesium.Cartographic) {
        const carP1 = Cesium.Cartesian3.fromRadians(p1.longitude, p1.latitude);
        const carP2 = Cesium.Cartesian3.fromRadians(p2.longitude, p2.latitude);
        const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(carP1);
        // tslint:disable-next-line: max-line-length
        const northDir = Cesium.Matrix4.multiplyByPointAsVector(matrix, new Cesium.Cartesian3(0, 1, 0), new Cesium.Cartesian3());
        const currDir = Cesium.Cartesian3.subtract(carP2, carP1, new Cesium.Cartesian3());
        Cesium.Cartesian3.normalize(currDir, currDir);
        // tslint:disable-next-line: max-line-length
        const cosNum = Cesium.Cartesian3.dot(northDir, currDir) / Cesium.Cartesian3.magnitude(northDir) / Cesium.Cartesian3.magnitude(currDir);
        const trueCos = Cesium.Math.acosClamped(cosNum);
        let resNum = Cesium.Math.toDegrees(trueCos);
        if (p2.longitude < p1.longitude) {
            resNum *= -1;
        }
        return resNum;
    }
    /**
     * @description: 根据一个点与角度，获取矩阵
     * @param {Cesium.Cartesian3} 位置
     * @param {angle} 角度
     */
    public static computedMatrix(origin: Cesium.Cartesian3, angle: number) {
        if (!origin) { return; }
        const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
        const matrix1 = new Cesium.Matrix3();
        Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(90 - angle), matrix1);
        Cesium.Matrix4.multiplyByMatrix3(matrix, matrix1, matrix);
        return matrix;
    }
    /**
     * @description: 更换广告牌图片
     * @param {billboard} 广告牌实体
     * @param {string} 图片url
     */
    public static changeBillboardImg(billboard: any, img: string) {
        if (!img || !billboard) {
            return;
        }
        billboard.image = img;
    }
    /**
     * @description: 更改广告牌点位置
     * @param {billboard} 广告牌对象
     * @param {IWorldPos} 世界坐标
     */
    public static changeBillboardPosition(billboard: any, center: IWorldPos) {
        if (!billboard || !center) {
            return;
        }
        billboard.position = center;
    }
    /**
     * @description: 高亮模型
     * @param {collection} 模型实体集合
     * @param {number} 亮度值
     */
    public static highLightModel(collection: any, num: number) {
        if (collection && (collection as any)._primitives
        && (collection as any)._primitives[0]) {
            const model = (collection as any)._primitives[0];
            model.luminanceAtZenith = num;
        }
    }
    /**
     * @description: 设置模型颜色
     * @param {collection} 模型实体集合
     * @param {string} 颜色值
     */
    public static setModelColor(collection: any, color: string) {
        if (collection && (collection as any)._primitives
        && (collection as any)._primitives[0]) {
            const model = (collection as any)._primitives[0];
            model.color = transformColor(color) || Cesium.Color.WHITE;
        }
    }
    /**
     * @description: 重置白膜属性
     * @param {collection} 白膜实体集合
     * @param {style} 颜色，泛光等属性
     */
    public static resetTileProp(collection: any, style: any) {
        // tslint:disable-next-line: max-line-length
        if (!collection || !collection.collection || !collection.collection._primitives || !collection.collection._primitives[0]) {
            return;
        }
        const tile = collection.collection._primitives[0];
        tile.maximumScreenSpaceError = style.maximumScreenSpaceError;
        tile.maximumMemoryUsage = style.maximumMemoryUsage || 2048;
        tile.skipLevelOfDetail = style.skipLevelOfDetail || false;
        tile.baseScreenSpaceError = style.baseScreenSpaceError || 1024;
        tile.skipScreenSpaceErrorFactor = style.skipScreenSpaceErrorFactor || 16;
        tile.skipLevels = style.skipLevels || 1;
        if (Cesium.ExpandBySTC) {
            (Cesium.ExpandBySTC as any).bloomTiles.ableBloom = style.bloom;
        }
        const color = transformColor(style.baseColor);
        if (style.useColor && color) {
            tile.style = new Cesium.Cesium3DTileStyle({
                color: {
                    conditions: [["true", color.toCssColorString()]],
                },
            });
        }
        if (style.luminanceAtZenith) {
            tile.luminanceAtZenith = style.luminanceAtZenith;
        }
    }
    /**
     * @description: 调整白膜高度相对于当前高度
     * @param {collection} 白膜实体集合
     * @param {number} 调整的高度值
     */
    public static offsetTileHeight(collection: any, height: number) {
        // tslint:disable-next-line: max-line-length
        if (!collection || !collection.collection || !collection.collection._primitives || !collection.collection._primitives[0]) {
            return;
        }
        const tile = collection.collection._primitives[0];
        if (tile.ready) {
            InstanceContainer.resetBMHeight(tile, height);
        } else {
            tile.readyPromise.then((tileset: any) => {
                InstanceContainer.resetBMHeight(tile, height);
            });
        }
    }
    /**
     * @description: 重置白膜高度，相对于地面
     * @param {tileset} 白膜对象
     * @param {number} 高度值
     */
    public static resetBMHeight(tileset: Cesium.Cesium3DTileset, height: number) {
        const boundingSphere = (tileset as any).boundingSphere;
        const cartographic = Cesium.Cartographic.fromCartesian(
            boundingSphere.center,
        );
        const surface = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            0.0,
        );
        const offset = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            height,
        );
        const translation = Cesium.Cartesian3.subtract(
            offset,
            surface,
            new Cesium.Cartesian3(),
        );
        (tileset as any).modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }
    /**
     * @description: 改变广告牌缩放
     * @param {billboard} 广告牌
     * @param {number} 缩放值
     */
    public static changeBillboardScale(billboard: any, scale: number) {
        if (!scale || !billboard) {
            return;
        }
        billboard.scale = scale;
    }
    /**
     * @description: 改变广告牌高度
     * @param {billboard} 广告牌
     * @param {number} 高度值
     */
    public static changeBillboardHeight(billboard: any, height: number) {
        if (!billboard) {
            return;
        }
        const oldPosition = billboard.position;
        const newP = setCartesian3Height(oldPosition, height || 0);
        billboard.position = newP;
        billboard.oldPosition = Object.assign({}, newP);
    }
    /**
     * @description: 获取广告牌实体集合
     * @param {collection}
     * @return {billboards}
     */
    public static getBills(collection: any) {
        if (collection && collection.collection && collection.collection._billboards) {
            return collection.collection._billboards;
        }
    }
    /**
     * @description: 获取纯色点实体集合
     * @param {collection}
     * @return {pointPrimitives}
     */
    public static getPoints(collection: any) {
        if (collection && collection.collection && collection.collection._pointPrimitives) {
            return collection.collection._pointPrimitives;
        }
    }
    /**
     * @description: 获取几何体集合
     * @param {collection}
     * @return {primitives}
     */
    public static getPrimitives(collection: any) {
        if (collection && collection.collection && collection.collection._primitives) {
            return collection.collection._primitives;
        }
    }
    /**
     * @description: 控制几何体显示隐藏
     * @param {primitive}
     * @return {bool}
     */
    public static setPrimitiveShow(primitive: any, bool: boolean) {
        if (primitive) {
            primitive.show = bool;
        }
    }
    /**
     * @description: 控制几何体泛光
     * @param {primitive}
     * @return {bool}
     */
    public static setPrimitiveBloom(primitive: any, bool: boolean) {
        if (primitive) {
            primitive.ableBloom = bool;
        }
    }
    /**
     * @description: 获取文本标注实体集合
     * @param {collection}
     * @return {labels}
     */
    public static getLabels(collection: any) {
        if (collection && collection.collection && collection.collection._labels) {
            return collection.collection._labels;
        }
    }
    /**
     * @description: 更新文本标注样式
     * @param {labels}
     * @param {LabelStyle}
     */
    public static updateLabelStyle(labels: any, style: LabelStyle) {
        if (!labels) {
            return;
        }
        (labels as any[]).forEach((label) => {
            label.fillColor = transformColor(style.fillColor) || label.fillColor;
            label.scale = style.scale || label.scale;
            label.backgroundColor = transformColor(style.backgroundColor) || label.backgroundColor;
            label.showBackground = style.showBackground;
            label.backgroundPadding = new Cesium.Cartesian2(style.bgPX, style.bgPY);
            const oldPosition = label.oldPosition;
            const newPosition = adjustCartesina3Height(oldPosition, style.height);
            label.position = newPosition;
            label.pixelOffset = new Cesium.Cartesian2(style.offsetX, style.offsetY);
        });
    }
    public type!: string;
    public collection: any;
    public commands: any;
    constructor(type: string) {
        if ((!type || !InstanceContainerMap[type]) && type !== "command") {
            return;
        }
        this.type = type;
        if (type === "command") {
            // this.collection = {};
        } else {
            this.collection = new (Cesium as any)[InstanceContainerMap[type]]();
        }
    }
    /**
     * @description: 获取集合里的点
     * @param {*}
     * @return {*}
     */
    public getLabels() {
        if (this.type === "command") {
            return this.commands;
        }
        return this.collection._billboards || this.collection._labels;
    }
    public show() {
        this.showCollection(true);
    }
    public hide() {
        this.showCollection(false);
    }
    public add(item: any) {
        // 3Dtiles图层
        if (item.tiles3D) {
            return this.collection.add(new Cesium.Cesium3DTileset(item));
        }
        if (item && item.primitive) {
            return this.collection.add(item.primitive);
        }
        // 广告牌，文本标注等图层
        if (item && !item.primitive) {
            return this.collection.add(item);
        }
    }
    /**
     * @description: 改变集合泛光与否
     * @param {boolean} 是否泛光
     * @param {boolean} 是否是白膜
     */
    public changeBloom(bloom: boolean | undefined, tile3D?: boolean) {
        if (!this.collection) {
            return;
        }
        if (tile3D && Cesium.ExpandBySTC) {
            (Cesium.ExpandBySTC as any).bloomTiles.ableBloom = bloom;
        }
        if (this.type === "primitive") {
            ((this.collection as any)._primitives as any[]).forEach((item) => {
                item.ableBloom = Boolean(bloom);
            });
            return;
        }
        if (this.type === "billboard" || this.type === "point") {
            if ((this.collection as any)._colorCommands && (this.collection as any)._colorCommands[0]) {
                (this.collection as any)._colorCommands[0].owner.ableBloom = bloom;
            }
            return;
        }
    }
    /**
     * @description: 获取白膜中心点
     */
    public getTilesCenter() {
        const tile = this.collection._primitives[0];
        if (tile && tile.boundingSphere.center) {
            return tile.boundingSphere.center;
        }
    }
    /**
     * @description: 更新点数据里的kd_info信息
     * @param {type} 点信息数组
     */
    public updateInfo(updateArr: any[]) {
        const pots = this.collection._billboards || this.collection._pointPrimitives || this.collection._primitives
        || this.collection._labels;
        const newLen = updateArr.length;
        for (const point of pots) {
            if (!point) {
                continue;
            }
            for (let i = 0; i < newLen; i ++) {
                const newPoint = updateArr[i];
                if (point.kd_info && point.kd_info.id === newPoint.id) {
                    point.kd_info = newPoint;
                    continue;
                }
            }
        }
    }
    /**
     * @description: 删除不要的点
     * @param {type} 点信息数组
     */
    public remove(delArr: any[]) {
        // tslint:disable-next-line: max-line-length
        const pots = this.collection._billboards || this.collection._pointPrimitives || this.collection._primitives || this.collection._labels;
        if (!pots) {
            return;
        }
        const idArr: any[] = [];
        delArr.forEach((point) => {
            idArr.push(point.id);
        });
        const needDelIndex: number[] = [];
        (pots as any[]).forEach((point, index) => {
            if (idArr.indexOf(point.kd_info && point.kd_info.id) >= 0) {
                needDelIndex.push(index);
            }
        });
        needDelIndex.reverse().forEach((num) => {
            this.collection.remove(this.collection.get(num));
        });
    }
    /**
     * @description: 批量控制点的显示隐藏
     * @param {string[]} id 数组
     * @param {boolean} 显示或者隐藏
     */
    public showPointsById(idArr: string[], show: boolean) {
        // tslint:disable-next-line: max-line-length
        const pots = this.collection._billboards || this.collection._pointPrimitives || this.collection._primitives || this.collection._labels;
        (pots as any[]).forEach((point, index) => {
            if (idArr.indexOf(point.kd_info && point.kd_info.id) >= 0) {
                point.show = show;
            }
        });
    }
    /**
     * @description: 通过id获取实体对象
     * @param {string} id 字段
     * @return {any} 点对象
     */
    public getPrimitiveById(id: string) {
        // tslint:disable-next-line: max-line-length
        const pots = this.collection._billboards || this.collection._pointPrimitives || this.collection._primitives || this.collection._labels;
        let primitive;
        for (const point of pots as any[]) {
            if ((point.kd_info && point.kd_info.id).indexOf(id) >= 0) {
                primitive = point;
            }
        }
        return primitive;
    }
    /**
     * @description: 渐隐渐现
     * @param {string[]} id 数组
     * @param {number} alphaNum 渐变alpha值
     */
    public fadePointsById(idArr: string[], alphaNum: number) {
        // tslint:disable-next-line: max-line-length
        const pots = this.collection._billboards || this.collection._pointPrimitives || this.collection._primitives || this.collection._labels;
        (pots as any[]).forEach((point, index) => {
            if (point) {
                if (idArr.indexOf(point.kd_info && point.kd_info.id) >= 0) {
                    if (point.alpha) {
                        point.alpha += alphaNum;
                    }
                    // tslint:disable-next-line: max-line-length
                    if (point.appearance && point.appearance.material && point.appearance.material.uniforms.alpha >= 0) {
                        point.appearance.material.uniforms.alpha += alphaNum;
                        if (point.appearance.material.uniforms.alpha >= 1) {
                            point.appearance.material.uniforms.alpha = 1;
                        }
                        if (point.appearance.material.uniforms.alpha <= 0) {
                            point.appearance.material.uniforms.alpha = 0;
                        }
                    }

                    if (point.appearance && point.appearance.material && point.appearance.material.uniforms.color) {
                        point.appearance.material.uniforms.color.alpha += alphaNum;
                        if (point.appearance.material.uniforms.color.alpha >= 1) {
                            point.appearance.material.uniforms.color.alpha = 1;
                        }
                        if (point.appearance.material.uniforms.color.alpha <= 0) {
                            point.appearance.material.uniforms.color.alpha = 0;
                        }
                    }
                }
            }
        });
    }
    /**
     * @description: 改变实时路径点位置
     * @param {pathObj} {[key: string]: IRealTimePath;}
     */
    public updateRealTimePosition(pathObj: {
        [key: string]: IRealTimePath;
    }) {
        if (!pathObj) {
            return;
        }
        for (const idStr of Object.keys(pathObj)) {
            const path = pathObj[idStr];
            if (!path.primitive) {
                path.primitive = this.getPrimitiveById(idStr);
            }
            if (path.primitive) {
                InstanceContainer.updatePointPosition(path.primitive, path);
            }
        }
    }
    /**
     * @description: 控制集合显示隐藏
     * @param {boolean}
     */
    private showCollection(bool: boolean) {
        this.collection.show = bool;
        if (this.type === "primitive") {
            return;
        }
        const bills = this.collection._billboards || this.collection._pointPrimitives || this.collection._labels;
        (bills as any[]).forEach((element) => {
            setTimeout(() => {
                element.show = Boolean(bool);
            }, 0);
        });
    }
}
