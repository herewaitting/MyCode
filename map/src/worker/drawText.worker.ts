import { CanvasDrawer } from "../tools/textLabelDrawer";

// let DrawTool: CanvasDrawer;

const drawerManager: any = {};

const DrawText: Worker = self as any;
DrawText.onmessage = (async (e) => {
    const msg = e.data;
    if (!drawerManager[msg.layerName]) {
        drawerManager[msg.layerName] = new CanvasDrawer(msg.canvas);
    }
    if (msg.canvas && drawerManager[msg.layerName].canvas !== msg.canvas) {
        drawerManager[msg.layerName].pushContext(msg.canvas);
    }
    // if (!DrawTool) {
    //     DrawTool = new CanvasDrawer(msg.canvas);
    // }
    // if (msg.canvas && DrawTool.canvas !== msg.canvas) {
    //     DrawTool.resetContext(msg.canvas);
    // }
    if (msg.type === "drawText") {
        const option = {...{
            top: msg.top,
            left: msg.left,
            canvasIndex: msg.canvasIndex,
        }, ...msg.style};
        drawerManager[msg.layerName].drawText(msg.text, option);
    }
});
