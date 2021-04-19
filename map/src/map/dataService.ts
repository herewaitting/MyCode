import { ILayer } from "../layers/layer";
const ParseDataWorker = require( "../worker/workerManagerMy.worker.ts");
const Compare = require( "../worker/compareMyData.worker.ts");

export interface IPostMsgOpt {
    style: any;
    data: string | any[];
    funName: string;
    layerType: string;
    [key: string]: any;
}

let worker: Worker;

const layerObj: any = {};
// export const PostMessage = (entityLayer: any, option: IPostMsgOpt) => {
//     const layerName = "layer_" + new Date().getTime();
//     layerObj[layerName] = entityLayer;
//     option.layerName = layerName;
//     worker.postMessage(JSON.stringify(option));
// };

let compareWorker: Worker;
interface ICompareData {
    old: any[];
    new: any[];
    [key: string]: any;
}

export const CompareData = (entityLayer: any, option: ICompareData) => {
    if (!option.new || !option.old || !entityLayer) {
        return;
    }
    const layerName = "layer_" + String(Math.random()).slice(2, 20);
    layerObj[layerName] = entityLayer;
    option.layerName = layerName;
    compareWorker.postMessage(option);
};

export class DataService {
    public layer: ILayer;
    public name!: string;
    constructor(layer: ILayer) {
        this.layer = layer;
        if (!worker) {
            worker = new ParseDataWorker();
            worker!.onerror = (e: any) => {
                console.log(e.error);
            };
            worker!.onmessage = (e: any) => {
                const data = e.data;
                layerObj[data.layerName].dealData(e.data);
            };
        }
        if (!compareWorker) {
            compareWorker = new Compare();
            compareWorker!.onerror = (e: any) => {
                console.log(e.error);
            };
            compareWorker!.onmessage = (e: any) => {
                const data = e.data;
                const compareRes = data.result;
                layerObj[data.layerName].dealComparedData(compareRes);
            };
        }
    }
    public PostMessage(option: IPostMsgOpt) {
        const layerName = "layer_" + String(Math.random()).slice(2, 20);
        this.name = layerName;
        layerObj[layerName] = this.layer;
        option.layerName = layerName;
        worker.postMessage(JSON.stringify(option));
    }
    public endWorker() {
        delete layerObj[this.name];
    }
    public destroy() {
        this.endWorker();
        this.name = null as any;
    }
}
