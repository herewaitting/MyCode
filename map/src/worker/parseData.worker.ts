import ParserManager from "./layeDataParser";
const parserManager = new ParserManager();
const ctx: Worker = self as any;
// 响应父线程的消息
ctx.addEventListener("message", async (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
        // tslint:disable-next-line: no-console
        // console.log(data);
    } catch (e) {
        throw new Error(`${e.message} in parse data worker`);
    }
    if (data) {
        const tData = await parserManager.parse(data.layerType, data.layerData);
        ctx.postMessage(JSON.stringify({
            isInit: data.isInit,
            layerName: data.layerName,
            data: tData,
        }));
    }
});
