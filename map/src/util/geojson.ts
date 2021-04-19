interface IGeojson {
    type: string;
    features: any[];
}
class GeojsonParser {
    public getDataFromLayerType(layerType: string, geojson: IGeojson) {
        if (geojson.type === "FeatureCollection") {
            const dataCollection = this.parseFeatures(geojson.features) as any;
            return dataCollection[layerType] || [];
        }
        return [];
    }
    public parseFeatures(features: any[]) {
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
                lon: feature.geometry.coordinates[0],
                lat: feature.geometry.coordinates[1],
                height:  feature.geometry.coordinates[2] || 0,
                ...(feature.properties || {}),
                index: `${i + 1}`,
                name: `设备${i + 1}`,
                videoId: "32050500001320000071",
                websocketUrl: "wss://10.68.0.121",
            });
        }

        if (feature.geometry.type === "MultiPoint") {
            feature.geometry.coordinates.forEach((p: number[], j: number) => {
                data.push({
                    id: `point_f${i}_p${j}`,
                    lon: p[0],
                    lat: p[1],
                    height: p[2] || 0,
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
                    lon: p[0],
                    lat: p[1],
                    height: p[2] || 0,
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
                        lon: p[0],
                        lat: p[1],
                        height: p[2] || 0,
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
                    lon: p[0],
                    lat: p[1],
                    height: p[2] || 0,
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
                            lon: p[0],
                            lat: p[1],
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
                        lon: p[0],
                        lat: p[1],
                        height: p[2] || 0,
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
                                lon: p[0],
                                lat: p[1],
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
}

export default GeojsonParser;
