import GeojsonParser, { IGeojson } from "./geojsonParser";
import wrapFetch from "./wrap_fetch";

const fetch = wrapFetch(self);
interface IPreParseData {
    layerType: string; // 要解析数据的图层类型
    type: string; // 数据来源类型
    data: any[] | string | IGeojson; // 数据
}

class ParserManager {
    public preParseData: IPreParseData | null = null;
    public geojsonParser: GeojsonParser;
    constructor() {
        this.geojsonParser = new GeojsonParser();
    }
    public Point(data: any[]) {
        return data.map((item, i) => {
            return {
                id: item.id || `point_${i}`,
                longitude: Number(item.lon || item.longitude),
                latitude: Number(item.lat || item.latitude),
                ...item,
            };
        });
    }
    // 普通线数据封装
    public line_common(data: any[]) {
        const arr: any[] = [];
        if (data.length) {
            data.reduce((prev, cur, index, originData) => {
                cur.longitude = Number(cur.lon || cur.longitude);
                cur.latitude = Number(cur.lat || cur.latitude);
                if (!prev.length) {
                    prev.push({
                        ...cur,
                        id: cur.lineId || cur.id,
                        points: [cur],
                    });
                    return prev;
                } else {
                    for (const [i, subObj] of Object.entries(prev)) {
                        const ii = Number(i);
                        if ((subObj as any).id === cur.lineId) {
                            (subObj as any).points.push(cur);
                            break;
                        } else {
                            if (ii === prev.length - 1) {
                                prev[ii + 1] = {
                                    ...cur,
                                    id: cur.lineId || cur.id,
                                    points: [cur],
                                };
                            }
                        }
                    }
                    return prev;
                }
            }, arr);
        }
        return arr;
    }
    // 线图层数据收口封装
    public Line(data: any[]) {
        const pData = this.line_common(data);
        const types = ["start", "end"]; // 如果是抛物线数据，则应该有type字段
        if (pData.length) {
            pData.forEach((d: any) => {
                d.points.sort((a: any, b: any) => {
                    if (a.type && b.type && types.includes(a.type) && types.includes(b.type)) {
                        return b.type.toString().length - a.type.toString().length;
                    }
                    return false;
                });
            });
        }
        return pData;
    }
    // 封装面数据
    public Polygon(data: any[]) {
        const arr: any[] = [];
        if (data.length) {
            data.reduce((prev, cur, index, originData) => {
                cur.longitude = Number(cur.lon || cur.longitude);
                cur.latitude = Number(cur.lat || cur.latitude);
                if (!prev.length) {
                    prev.push({
                        id: cur.polygonId,
                        points: [cur],
                    });
                    return prev;
                } else {
                    prev.forEach((subObj: any, i: number) => {
                        if (subObj.id === cur.polygonId) {
                            subObj.points.push(cur);
                        } else {
                            if (i === prev.length - 1) {
                                prev[i + 1] = {
                                    id: cur.polygonId,
                                    points: [cur],
                                };
                            }
                        }
                    });
                    return prev;
                }
            }, arr);
        }
        return arr;
    }
    // 解析geo数据
    public async parseGeo(preParseData: IPreParseData, isFile: boolean = true) {
        let geojson;
        if (isFile) {
            const res = await fetch(preParseData.data as string);
            geojson = await res.json();
        } else {
            geojson = preParseData.data;
        }
        const data = this.geojsonParser.getDataFromLayerType(preParseData.layerType, geojson);
        return data;
    }
    // 解析txt文件数据
    public async parseTxt(preParseData: IPreParseData) {
        const res = await fetch(preParseData.data as string);
        let data = await res.text();
        data = JSON.parse(data.toString());
        if ((this as any)[preParseData.layerType]) {
            data = (this as any)[preParseData.layerType](data);
            return data;
        }
        return data;
    }
    // 接收数据
    public receive(layerType: string, data: any[] | string | IGeojson) {
        const preParseData: IPreParseData = {
            layerType,
            type: "",
            data,
        };
        if (typeof data === "string") { // 如果data是一个文件路径
            if (/\.geojson|.geoJson|json$/.test(data)) { // geojson
                preParseData.type = "geojsonFile";
            } else if (/\.txt|.text$/.test(data)) { // txt格式
                preParseData.type = "txt";
            }
        } else if (typeof data === "object" && !(data instanceof Array)) {
            preParseData.type = "geojsonObj";
        } else {
            preParseData.type = "array";
        }
        // this.preParseData = preParseData;
        return preParseData;
    }
    public async parse(layerType: string, data: any[] | string) {
        const preParseData = this.receive(layerType, data);
        let returnData: any = [];
        if (preParseData.type === "geojsonFile") {
            returnData = await this.parseGeo(preParseData);
        } else if (preParseData.type === "geojsonObj") {
            returnData = await this.parseGeo(preParseData, false);
        } else if (preParseData.type === "txt") {
            returnData = await this.parseTxt(preParseData);
        } else if (preParseData.type === "array") {
            if ((this as any)[preParseData.layerType]) {
                returnData = (this as any)[preParseData.layerType](preParseData.data);
            } else {
                returnData = preParseData.data;
            }
        }
        return returnData;
    }
}

export default ParserManager;
