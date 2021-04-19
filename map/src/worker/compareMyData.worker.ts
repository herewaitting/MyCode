import { compareArray } from "./workerUtil";
const ctx: Worker = self as any;
ctx.onmessage = (async (e) => {
    const data = e.data;
    const res = compareArray(data.old, data.new, "id", data.style);
    ctx.postMessage({
        layerName: data.layerName,
        result: res,
    });
});
