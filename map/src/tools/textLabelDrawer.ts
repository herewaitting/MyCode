
export interface IDrawTextOption {
    top: number;
    left: number;
    color: string;
    size: number;
    font: string;
    bgImg: ImageBitmap;
    paddingTop: number;
    paddingLeft: number;
    bgWidth: number;
    bgHeight: number;
    txtWidth: number;
    txtHeight: number;
    canvasIndex: number;
    fixedWidth: number;
    fixedHeight: number;
    bold: boolean;
}

export interface ITextQueue {
    text: string;
    style: IDrawTextOption;
    canvasIndex: number;
}

export class CanvasDrawer {
    // public canvas!: OffscreenCanvas;
    public canvas!: Element;
    public currContext: any;
    public drawQueue: ITextQueue[] = [];
    public queueIndex: number = 0;
    private drawing: boolean = false;
    private canvasArr: any;
    constructor(canvas: Element) {
        if (!canvas) {
            return;
        }
        this.canvasArr = [];
        this.canvas = canvas;
        const context = (this.canvas as any).getContext("2d");
        this.canvasArr.push(context);
        this.currContext = this.canvasArr[0];
    }
    public reset() {
        this.canvas = null as any;
        this.canvasArr = [];
        this.currContext = null;
        this.drawQueue = null as any;
        this.queueIndex = 0;
    }
    /**
     * @description: 绘制文本
     * @param {IDrawTextOption} option
     */
    public drawText(text: string, option: IDrawTextOption) {
        if (!text) {
            return;
        }
        this.pushTextToQueue(text, option);
        if (this.drawing) {
            if (this.queueIndex === 0) {
                this.drawNextText();
            }
        } else {
            this.drawNextText();
        }
    }
    public pushTextToQueue(text: string, style: IDrawTextOption) {
        if (!text) {
            return;
        }
        this.drawQueue.push({
            text,
            style,
            canvasIndex: style.canvasIndex,
        });
    }
    public computedSize(text: string, style: IDrawTextOption) {
        const textWidth = this.mesureTextLength(text, style);
        const width = textWidth + style.paddingLeft * 2;
        const height = style.size + 2 * style.paddingTop;
        return {
            txtWidth: width,
            txtHeight: height,
        };
    }
    public pushContext(canvas: Element) {
        this.canvasArr.push((canvas as any).getContext("2d"));
    }
    private mesureTextLength(text: string, style: IDrawTextOption) {
        this.currContext.font = `${style.size}px ${style.font}`;
        return this.currContext.measureText(text).width;
    }
    private drawCurrText(text: string, option: IDrawTextOption) {
        if (option.bold) {
            this.currContext.font = `bold ${option.size}px ${option.font}`;
        } else {
            this.currContext.font = `${option.size}px ${option.font}`;
        }
        this.currContext.fillStyle = `${option.color}`;
        this.currContext.textBaseline = "middle";
        this.currContext.textAlign = "center";
        this.currContext.globalCompositeOperation = "destination-over";
        // tslint:disable-next-line: max-line-length
        this.currContext.fillText(text, option.left + option.fixedWidth / 2, option.top + option.paddingTop + option.size / 2); // 加上文本尺寸的十分之一，调整上偏移
    }
    private drawNextText() {
        this.drawing = true;
        const currText = this.drawQueue[this.queueIndex];
        if (!currText) {
            this.drawing = false;
            return;
        }
        this.currContext = this.canvasArr[currText.canvasIndex];
        const bgStyle = {...{}, ...currText.style};
        this.drawCurrText(currText.text, bgStyle);
        this.queueIndex++;
        this.drawNextText();
    }
}
