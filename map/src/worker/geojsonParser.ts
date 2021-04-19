export interface IGeojson {
    type: string;
    features?: any[];
    geometries?: any[];
}
class GeojsonParser {
    public getDataFromLayerType(layerType: string, geojson: IGeojson) {
        if (geojson.type === "FeatureCollection" || !geojson.type) {
            const dataCollection = this.parseFeatures(geojson.features as any, layerType) as any;
            return dataCollection[layerType] || [];
        } else if (geojson.type === "GeometryCollection") {
            const dataCollection = this.parseGeometries(geojson.geometries as any) as any;
            return dataCollection[layerType] || [];
        }
        return [];
    }
    public parseFeatures(features: any[], layerType: string) {
        let Point: any[] = [];
        let Line: any[] = [];
        let Polygon: any[] = [];
        features.forEach((feature, i) => {
            if (feature.geometry.type.includes("Point")) {
               const pointData = this.formatPointData(feature, i);
               Point = Point.concat(pointData);
            } else if (feature.geometry.type.includes("LineString")) {
                const lineData = this.formatLineData(feature, i);
                Line = Line.concat(lineData);
            } else if (feature.geometry.type.includes("Polygon")) {
                if (layerType === "Line") {
                    const lineData = this.formatLineDataFromPolygon(feature, i);
                    Line = Line.concat(lineData);
                } else {
                    const polygonData = this.formatPolygonData(feature, i);
                    Polygon = Polygon.concat(polygonData);
                }
            }
        });

        return {
            Point,
            Line,
            Polygon,
        };
    }
    public parseGeometries(geometries: any[]) {
        let Point: any[] = [];
        let Line: any[] = [];
        let Polygon: any[] = [];
        geometries.forEach((geometryObj, i) => {
            const feature = {
                geometry: {
                    ...geometryObj,
                },
            };
            if (feature.geometry.type.includes("Point")) {
                const pointData = this.formatPointData(feature, i);
                Point = Point.concat(pointData);
             } else if (feature.geometry.type.includes("LineString")) {
                 const lineData = this.formatLineData(feature, i);
                 Line = Line.concat(lineData);
             } else if (feature.geometry.type.includes("Polygon")) {
                 const polygonData = this.formatPolygonData(feature, i);
                 Polygon = Polygon.concat(polygonData);
             }
        });
        return {
            Point,
            Line,
            Polygon,
        };
    }
    // 格式化点
    public formatPointData(feature: {[k: string]: any}, i: number) {
        const data: any[] = [];
        if (feature.geometry.type === "Point") {
            data.push({
                id: `point_f${i}`,
                longitude: Number(feature.geometry.coordinates[0]),
                latitude: Number(feature.geometry.coordinates[1]),
                height:  Number(feature.geometry.coordinates[2] || 0),
                ...(feature.properties || {}),
            });
        }

        if (feature.geometry.type === "MultiPoint") {
            feature.geometry.coordinates.forEach((p: number[], j: number) => {
                data.push({
                    id: `point_f${i}_p${j}`,
                    longitude: Number(p[0]),
                    latitude: Number(p[1]),
                    height: Number(p[2] || 0),
                    ...(feature.properties || {}),
                });
            });
        }

        return data;
    }
    // 格式化线
    public formatLineData(feature: {[k: string]: any}, i: number) {
        const data: any[] = [];
        if (feature.geometry.type === "LineString") {
            const lineData = feature.geometry.coordinates.map((p: number[], j: number) => {
                return {
                    id: `linePoint_f${i}_p${j}`,
                    longitude: Number(p[0]),
                    latitude: Number(p[1]),
                    height: Number(p[2] || 0),
                };
            });
            data.push({
                id: `line_f${i}`,
                points: lineData,
                ...(feature.properties || {}),
            });
        }
        if (feature.geometry.type === "MultiLineString") {
            feature.geometry.coordinates.forEach((line: Array<[]>, j: number) => {
                const lineData = line.map((p: number[], k: number) => {
                    return {
                        id: `linePoint_f${i}_l${j}_p${k}`,
                        longitude: Number(p[0]),
                        latitude: Number(p[1]),
                        height: Number(p[2] || 0),
                    };
                });
                data.push({
                    id: `line_f${i}_l${j}`,
                    points: lineData,
                    ...(feature.properties || {}),
                });
            });
        }

        return data;
    }
    // 格式化面
    public formatPolygonData(feature: {[k: string]: any}, i: number) {
        const data: any[] = [];
        if (feature.geometry.type === "Polygon") {
            let polygon: {[k: string]: any} = {};
            const [polygonCoordinates, ...holes] = feature.geometry.coordinates;
            const polygonData = polygonCoordinates.map((p: number[], j: number) => {
                return {
                    id: `polygon_f${i}_p${j}`,
                    longitude: Number(p[0]),
                    latitude: Number(p[1]),
                    height: Number(p[2] || 0),
                };
            });
            polygon = {
                id: `polygon_f${i}`,
                points: polygonData,
                ...(feature.properties || {}),
            };
            if (holes && holes.length) { // 如果带孔
                polygon.holes = [];
                // throw new Error("暂不支持带孔的Polygon数据");
                holes.forEach((hole: any, h: number) => {
                    const holeData = hole.map((p: number[], k: number) => {
                        return {
                            id: `${polygon.id}_hole${h}_p${k}`,
                            longitude: Number(p[0]),
                            latitude: Number(p[1]),
                        };
                    });
                    polygon.holes.push({
                        id: `${polygon.id}_hole${h}`,
                        points: holeData,
                    });
                });
            }
            data.push(polygon);
        }
        if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach((polygons: any[], j: number) => {
                let polygon: {[k: string]: any} = {};
                const [polygonCoordinates, ...holes] = polygons;
                const polygonData = polygonCoordinates.map((p: number[], k: number) => {
                    return {
                        id: `polygon_f${i}_plg${j}_p${k}`,
                        longitude: Number(p[0]),
                        latitude: Number(p[1]),
                        height: Number(p[2] || 0),
                    };
                });
                polygon = {
                    id: `polygon_f${i}_plg${j}`,
                    points: polygonData,
                    ...(feature.properties || {}),
                };
                if (holes && holes.length) {
                    // throw new Error("暂不支持带孔的MultiPolygon数据");
                    polygon.holes = [];
                    holes.forEach((hole: any, h: number) => {
                        const holeData = hole.map((p: number[], m: number) => {
                            return {
                                id: `${polygon.id}_hole${h}_p${m}`,
                                longitude: Number(p[0]),
                                latitude: Number(p[1]),
                            };
                        });
                        polygon.holes.push({
                            id: `${polygon.id}_hole${h}`,
                            points: holeData,
                        });
                    });
                }
                data.push(polygon);
            });
        }
        return data;
    }
    public formatLineDataFromPolygon(feature: {[k: string]: any}, i: number) {
        const data: any[] = [];
        if (feature.geometry.type === "Polygon") {
            feature.geometry.coordinates.forEach((line: Array<[]>, j: number) => {
                const lineData = line.map((p: number[], k: number) => {
                    return {
                        id: `linePoint_f${i}_l${j}_p${k}`,
                        longitude: Number(p[0]),
                        latitude: Number(p[1]),
                        height: Number(p[2] || 0),
                    };
                });
                data.push({
                    id: `line_f${i}_l${j}`,
                    points: lineData,
                    ...(feature.properties || {}),
                });
            });
        }
        if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach((multiLines: any[], j: number) => {
                multiLines.forEach((line: Array<[]>, k: number) => {
                    const lineData = line.map((p: number[], l: number) => {
                        return {
                            id: `linePoint_f${i}_m${j}_l${k}_p${l}`,
                            longitude: Number(p[0]),
                            latitude: Number(p[1]),
                            height: Number(p[2] || 0),
                        };
                    });
                    data.push({
                        id: `line_f${i}_l${j}`,
                        points: lineData,
                        ...(feature.properties || {}),
                    });
                });
            });
        }
        return data;
    }
}

export default GeojsonParser;
