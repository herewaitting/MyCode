import * as Cesium from "cesium";

export interface IdantihuaOpt {
    color: Cesium.Color;
}

const sanyuan = {
        1: {
            positions: [
                {longitude: 120.56963896478256, latitude: 31.30494925642953, height: 10.88},
                {longitude: 120.56957766022511, latitude: 31.30512376381687, height: 14.29},
                {longitude: 120.56981167306982, latitude: 31.305183032099503, height: 25.29},
                {longitude: 120.56985740236615, latitude: 31.30499784647706, height: 11.26},
            ],
        },
        2: {
            positions: [
                {longitude: 120.56986524350141, latitude: 31.305017890639498, height: 10.98},
                {longitude: 120.56983314612435, latitude: 31.305173583899524, height: 24.24},
                {longitude: 120.5700442365064, latitude: 31.305218616116274, height: 28.91},
                {longitude: 120.5701112177901, latitude: 31.305047202917883, height: 10.84},
            ],
        },
        3: {
            positions: [
                {longitude: 120.56966298217418, latitude: 31.304715508084378, height: 17.38},
                {longitude: 120.56962955870362, latitude: 31.304872858113402, height: 11.26},
                {longitude: 120.57011193101017, latitude: 31.304986960903616, height: 17.38},
                {longitude: 120.57016165139733, latitude: 31.304815723105385, height: 13.73},
            ],
        },
        4: {
            positions: [
                {longitude: 120.56974636776901, latitude: 31.3044494742472, height: 14.25},
                {longitude: 120.56971685191124, latitude: 31.304579072816693, height: 12.76},
                {longitude: 120.57017232640847, latitude: 31.304686327977144, height: 23.75},
                {longitude: 120.57021254960051, latitude: 31.304560209791436, height: 18.78},
            ],
        },
        5: {
            positions: [
                {longitude: 120.56984038775991, latitude: 31.304203118610317, height: 11.05},
                {longitude: 120.56980247660522, latitude: 31.30434111624456, height: 10.94},
                {longitude: 120.57025269816148, latitude: 31.30443250790401, height: 22.09},
                {longitude: 120.57029920458908, latitude: 31.304310239363296, height: 14.75},
            ],
        },
        6: {
            positions: [
                {longitude: 120.57012305078526, latitude: 31.305064659557225, height: 10.97},
                {longitude: 120.57008271846135, latitude: 31.30522656655717, height: 26.54},
                {longitude: 120.57028866035114, latitude: 31.305271727860433, height: 25.78},
                {longitude: 120.57036183470203, latitude: 31.305099347159448, height: 10.78},
            ],
        },
        7: {
            positions: [
                {longitude: 120.57037047947475, latitude: 31.3051120871439, height: 10.81},
                {longitude: 120.57032040241637, latitude: 31.305282981422437, height: 24.81},
                {longitude: 120.57053535412918, latitude: 31.30532771558913, height: 22.59},
                {longitude: 120.5705789355952, latitude: 31.30516250064407, height: 20.74},
            ],
        },
        8: {
            positions: [
                {longitude: 120.57020263312937, latitude: 31.30484699885213, height: 13.76},
                {longitude: 120.57015544828184, latitude: 31.304982476077313, height: 11.52},
                {longitude: 120.57062149489744, latitude: 31.305097997868632, height: 12.17},
                {longitude: 120.5706771972026, latitude: 31.304930720440357, height: 11.07},
            ],
        },
        9: {
            positions: [
                {longitude: 120.57026974682223, latitude: 31.304604167972528, height: 22.78},
                {longitude: 120.57024234609358, latitude: 31.30471104042522, height: 23.48},
                {longitude: 120.57064385490315, latitude: 31.304809096869743, height: 10.95},
                {longitude: 120.57067955270655, latitude: 31.304691973779388, height: 10.95},
            ],
        },
        10: {
            positions: [
                {longitude: 120.5703081961422, latitude: 31.304461333278397, height: 25.56},
                {longitude: 120.57028705752059, latitude: 31.3045621099012, height: 24.64},
                {longitude: 120.57068906325796, latitude: 31.30465618289639, height: 10.95},
                {longitude: 120.57072485238615, latitude: 31.304546568862907, height: 10.82},
            ],
        },
        11: {
            positions: [
                {longitude: 120.57036924285198, latitude: 31.304307729211033, height: 11.33},
                {longitude: 120.57032273529076, latitude: 31.3044357236097, height: 20.69},
                {longitude: 120.57071822248318, latitude: 31.30452843598095, height: 10.81},
                {longitude: 120.57077161789938, latitude: 31.304398277156842, height: 12.56},
            ],
        },
    }
;

export class Dantihua {
    public viewer!: Cesium.Viewer;
    public hideColor!: Cesium.Color;
    public showColor!: Cesium.Color;
    public option!: IdantihuaOpt;
    public entityArr!: any[];
    constructor(viewer: Cesium.Viewer, option: IdantihuaOpt) {
        if (!viewer) {
            return;
        }
        this.viewer = viewer;
        this.option = {...{
            color: Cesium.Color.YELLOW.withAlpha(0.5),
        }, ...option};
        this.init();
    }
    public init() {
        this.hideColor = Cesium.Color.RED.withAlpha(0.001);
        this.showColor = this.option.color;
        this.entityArr = [];
    }
    public addPolygon(data: any) {
        if (!data) {
            data = sanyuan;
        }
        Object.keys(data).forEach((pid) => {
            const oriPos = data[pid].positions;
            const lonlatArr: any[] = [];
            (oriPos as any[]).forEach((pot) => {
                lonlatArr.push(pot.longitude);
                lonlatArr.push(pot.latitude);
            });
            const polygon = this.viewer.entities.add({
                id: "" + pid,
                polygon: {
                    hierarchy: Cesium.Cartesian3.fromDegreesArray(lonlatArr),
                    material: this.hideColor,
                    classificationType: Cesium.ClassificationType.BOTH,
                } as any,
            });
            this.entityArr.push(polygon);
        });
    }
    public activePolygon(id: string) {
        this.entityArr.forEach((entity) => {
            if (entity.id === id) {
                entity.polygon.material = this.showColor;
            } else {
                entity.polygon.material = this.hideColor;
            }
        });
    }
}
