import { ITextDrawInfo } from "../layers/point/customTextLabel";
import { CanvasDrawer } from "./textLabelDrawer";

export interface ITextStyle {
    width: number;
    height: number;
    color: string;
    size: number;
    bgImg: string;
    font: string;
    paddingTop: number;
    paddingLeft: number;
    bgWidth: number;
    bgHeight: number;
    naturalWidth: number;
    naturalHeight: number;
    naturalRatio: number;
}

export interface IOffScreenCanvas {
    dom: Element;
    user: OffscreenCanvas;
}

export interface ITextQueue {
    text: string;
    style: ITextStyle;
}

const textWorker = require( "../worker/drawText.worker.ts");

const drawWorker = new textWorker();

drawWorker.onmessage = (async (e: any) => {
    let data;
    try {
        data = JSON.parse(e.data);
    } catch (e) {
        throw new Error(`${e.message} in parse data worker`);
    }
    if (data) {
        //
    }
});

export class CustomHtmlDraw {
    public width: number;
    public height: number;
    public currTop: number = 0; // 记录当前像素的上距离
    public currLeft: number = 0; // 记录像素的左距离
    public canvasIndex: number = 0;
    public canvasObj: {[key: string]: IOffScreenCanvas} = {};
    public drawQueue: ITextQueue[] = [];
    public worker!: Worker;
    public textStyle: ITextStyle;
    public changeUser: boolean = true;
    public drawTool!: CanvasDrawer;
    // private firstPost: boolean = true;
    private currMaxHeight: number = 0;
    constructor(option: ITextStyle) {
        option = {...{
            width: 2000,
            height: 2000,
            color: "#ffffff",
            size: 20,
            bgImg: require("../../static/img/labelBg.png"),
            font: "微软雅黑",
            paddingTop: 5,
            paddingLeft: 10,
            bgWidth: 0,
            bgHeight: 0,
        }, ...option};
        this.width = option.width;
        this.height = option.height;
        this.textStyle = option;
        this.init();
    }
    // 绘制文本，返回起点和终点的UV，以及当前canvas的索引，注意区分文字与英文字母长度
    public drawText(text: string, style: ITextStyle): ITextDrawInfo | undefined {
        if (!text || !text.length) {
            return;
        }
        const currStyle = {...this.textStyle, ...style};
        currStyle.size = currStyle.size;
        // const currTextWidth = this.mesureTextLength(text, currStyle.size);
        // if (!currTextWidth) {
        //     return;
        // }
        this.judgeVolume(currStyle);
        this.postText(text, currStyle, this.currTop, this.currLeft);
        const returnUV = this.computedUV(currStyle);
        this.currLeft = this.currLeft + currStyle.naturalWidth + 4;
        return {
            dom: this.canvasObj[`canvas_${this.canvasIndex}`].dom,
            uvs: returnUV.uvs,
            // ratio: returnUV.ratio,
            domId: `canvas_${this.canvasIndex}`,
            txtWidth: returnUV.txtWidth,
        };
    }
    public getCanvasImg(index: number) {
        if (!this.canvasObj[`canvas_${index}`]) {
            return;
        }
        return (this.canvasObj[`canvas_${index}`] as any).toDataURL("image/png");
    }
    // 判断当前canvas是否还有足够空间
    private judgeVolume(style: ITextStyle) {
        if (this.currLeft + style.naturalWidth >= this.width) {
            this.currLeft = 0;
            if (this.currTop + this.currMaxHeight >= this.height) {
                this.currTop = 0;
                this.canvasIndex++;
                this.changeUser = true;
                this.createOffScreenCanvas(this.canvasIndex);
            } else {
                this.currTop = this.currTop + this.currMaxHeight + 4;
                this.changeUser = false;
            }
            this.currMaxHeight = 0;
        } else {
            if (this.currTop + style.naturalHeight >= this.height) {
                this.currMaxHeight = 0;
                this.currTop = 0;
                this.currLeft = 0;
                this.canvasIndex++;
                this.changeUser = true;
                this.createOffScreenCanvas(this.canvasIndex);
            } else {
                this.changeUser = false;
            }
        }
        if (style.naturalHeight > this.currMaxHeight) {
            this.currMaxHeight = style.naturalHeight;
        }
    }
    private init() {
        // html里head中添加样式节点，隐藏创建的canvas
        this.insertStyleDom();
        // 创建离屏canvas
        this.createOffScreenCanvas(this.canvasIndex);
        // 创建绘制工具
        this.drawTool = new CanvasDrawer(this.canvasObj[`canvas_${this.canvasIndex}`].dom);
    }
    // 根据索引创建离屏canvas
    private createOffScreenCanvas(index: number) {
        if (this.canvasObj[`canvas_${index}`]) {
            return;
        }
        this.canvasObj[`canvas_${index}`] = {} as any;
        this.canvasObj[`canvas_${index}`].dom = document.createElement("canvas");
        this.canvasObj[`canvas_${index}`].dom.classList.add("CustomTextCanvas");
        document.body.appendChild(this.canvasObj[`canvas_${index}`].dom);
        (this.canvasObj[`canvas_${index}`].dom as any).width = this.width;
        (this.canvasObj[`canvas_${index}`].dom as any).height = this.height;
        // tslint:disable-next-line: max-line-length
        // this.canvasObj[`canvas_${index}`].user = (this.canvasObj[`canvas_${index}`].dom as any).transferControlToOffscreen();
    }
    private postText(text: string, style: ITextStyle, top: number, left: number) {
        const postOpt = {
            type: "drawText",
            canvas: this.canvasObj[`canvas_${this.canvasIndex}`].dom,
            text,
            style,
            top,
            left,
            layerName: (style as any).layerName,
            canvasIndex: this.canvasIndex,
        };
        if (this.changeUser) {
            this.drawTool.pushContext(this.canvasObj[`canvas_${this.canvasIndex}`].dom);
            // this.firstPost = false;
        }
        const drawOpt = {...{
            top: postOpt.top,
            left: postOpt.left,
            canvasIndex: postOpt.canvasIndex,
        }, ...postOpt.style};
        this.drawTool.drawText(postOpt.text, drawOpt as any);
    }
    // private postText(text: string, style: ITextStyle, top: number, left: number) {
    //     if (this.firstPost || this.changeUser) {
    //         drawWorker.postMessage({
    //             type: "drawText",
    //             canvas: this.canvasObj[`canvas_${this.canvasIndex}`].user,
    //             text,
    //             style,
    //             top,
    //             left,
    //             layerName: (style as any).layerName,
    //             canvasIndex: this.canvasIndex,
    //         }, [this.canvasObj[`canvas_${this.canvasIndex}`].user]);
    //         this.firstPost = false;
    //     } else {
    //         drawWorker.postMessage({
    //             type: "drawText",
    //             text,
    //             style,
    //             top,
    //             left,
    //             layerName: (style as any).layerName,
    //             canvasIndex: this.canvasIndex,
    //         });
    //     }
    // }
    // private mesureTextLength(text: string, size: number) {
    //     const canvas = document.createElement("canvas");
    //     const ctx = canvas.getContext("2d");
    //     if (!ctx) {
    //         return;
    //     }
    //     ctx.font = `${size}px ${this.textStyle.font}`;
    //     return ctx.measureText(text).width;
    // }
    // html中插入style标签，用于隐藏绘制文本添加的canvas标签
    private insertStyleDom() {
        const styleDom = document.createElement("style");
        styleDom.innerHTML = `
            .CustomTextCanvas {
                display: none;
            }
        `;
        document.head.appendChild(styleDom);
    }
    // 计算应该返回给图层的uv值，从左下角点开始，顺时针
    private computedUV(style: ITextStyle) {
        const uv1x = this.currLeft;
        const uv1y = this.height - style.naturalHeight - this.currTop;
        const uv3x = this.currLeft + style.naturalWidth;
        const uv3y = this.height - this.currTop;
        // return [
        //     [uv1x, uv1y],
        //     [uv1x, uv3y],
        //     [uv3x, uv3y],
        //     [uv3x, uv1y],
        // ];
        const ratio = (uv3y - uv1y) / (uv3x - uv1x);
        return {
            uvs: [
                [uv1x / this.width, uv1y / this.height],
                [uv1x / this.width, uv3y / this.height],
                [uv3x / this.width, uv3y / this.height],
                [uv3x / this.width, uv1y / this.height],
            ],
            ratio,
            txtWidth: uv3x - uv1x,
        };
    }
}
