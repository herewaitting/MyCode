
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
    text1Top: number;
    text1Left: number;
}

export interface IDrawBackground {
    bgImg: ImageBitmap;
    top: number;
    left: number;
    txtWidth: number;
    txtHeight: number;
    paddingTop: number;
    paddingLeft: number;
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
        // this.drawBackground(bgStyle);
    }
    /**
     * @description: 绘制背景图
     * @param {IDrawBackground} option
     * @return {*}
     */
    public drawBackground(option: IDrawBackground) {
        return;
        if (!option || !option.bgImg) {
            return;
        }
        const targetWidth = option.txtWidth;
        const targetHeight = option.txtHeight;
        // tslint:disable-next-line: max-line-length
        this.currContext.drawImage(option.bgImg, 0, 0, option.bgImg.width, option.bgImg.height, option.left, option.top, targetWidth, targetHeight);
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
        this.currContext.font = `${option.size}px ${option.font}`;
        this.currContext.fillStyle = `${option.color}`;
        this.currContext.textBaseline = "top";
        this.currContext.textAlign = "left";
        this.currContext.globalCompositeOperation = "destination-over";
        // tslint:disable-next-line: max-line-length
        this.currContext.fillText(text, option.left + option.text1Left, option.top + option.text1Top); // 加上文本尺寸的十分之一，调整上偏移
    }
    private drawNextText() {
        this.drawing = true;
        const currText = this.drawQueue[this.queueIndex];
        if (!currText) {
            this.drawing = false;
            return;
        }
        this.currContext = this.canvasArr[currText.canvasIndex];
        const size = this.computedSize(currText.text, currText.style);
        const bgStyle = {...size, ...currText.style};
        this.drawCurrText(currText.text, bgStyle);
        this.drawBackground(bgStyle);
        this.queueIndex++;
        this.drawNextText();
    }
}
