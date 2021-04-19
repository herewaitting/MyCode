
import * as Cesium from "cesium";
export interface IVideo2TextureOpt {
    video: string;
    muted: boolean;
    autoplay: boolean;
    loop: boolean;
}

export class Video2Texture {
    public video: string;
    public texture!: Cesium.Texture;
    public dom!: Element;
    public muted!: boolean;
    public autoplay!: boolean;
    public loop!: boolean;
    constructor(option: IVideo2TextureOpt) {
        option = {...{
            name: "v2t_" + String(Math.random()).slice(3),
        }, ...option};
        this.video = option.video;
        this.muted = option.muted;
        this.autoplay = option.autoplay;
        this.loop = option.loop;
        this.init();
    }
    public prepareDom() {
        if (!this.video) {
            return;
        }
        const videoDom = document.createElement("video");
        // videoDom.setAttribute("autoplay", true as any);
        // videoDom.setAttribute("loop", "loop");
        // videoDom.setAttribute("muted", "muted");
        videoDom.muted = this.muted;
        videoDom.autoplay = this.autoplay;
        videoDom.loop = this.loop;
        // videoDom.style.display = "none";
        videoDom.style.position = "absolute";
        videoDom.style.top = "0";
        videoDom.style.zIndex = "-1";
        videoDom.src = this.video;
        document.body.appendChild(videoDom);
        this.dom = videoDom;
    }
    public setVideo(video: string) {
        if (!video || !this.judgeVideo(video)) {
            return;
        }
        this.video = video;
        this.prepareDom();
    }
    public resetVideo(video: string) {
        if (!video || !this.judgeVideo(video)) {
            return;
        }
        this.video = video;
        (this.dom as any).src = video;
    }
    public getTexture(viewer: Cesium.Viewer) {
        if (!viewer) {
            return;
        }
        if (this.texture) {
            (this.texture as any).destroy();
            this.texture = null as any;
        }
        this.texture = new Cesium.Texture({
            context: (viewer.scene as any).context,
            source: this.dom,
            pixelFormat: Cesium.PixelFormat.RGBA,
            pixelDatatype: Cesium.PixelDatatype.FLOAT,
        });
        return this.texture;
    }
    public destroy() {
        if (this.texture) {
            (this.texture as any).destroy();
        }
        document.body.removeChild(this.dom);
    }
    private init() {
        if (!this.judgeVideo(this.video)) {
            console.warn("传入了非mp4格式文件！");
            return;
        }
        this.prepareDom();
    }
    private judgeVideo(video: string) {
        if (!video) {
            return false;
        }
        const pat = /.mp4$/;
        if (video.match(pat)) {
            return true;
        } else {
            return false;
        }
    }
}
