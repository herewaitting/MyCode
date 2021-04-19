export interface ILayerStyle {
    url: string; // 白膜路径
    height: number; // 模型高度
    style: string; // 炫彩风格
    maximumScreenSpaceError: number;
    baseColor: string; // 基础颜色
    // styleBM: boolean; // 是否炫彩白膜
    // fgNum: number; // 泛光界限值
    // blurRadius: number; // 泛光半径
    // brightStrength: number; // 泛光强度
    appearMove: boolean;
    useColor: boolean;
    bloom: boolean;
    ableCustomLight: boolean; // 是否允许接收自定义光照
    useGradient: boolean; // 是否使用渐变色
    mixColor: string; // 渐变时的混合色
    mixNum: number; // 渐变时的混合系数
    luminanceAtZenith: number; // 对比度
    customMetalness: number;
    customRoughness: number;
    maximumMemoryUsage: number; // 最大允许使用的内存大小
    skipLevelOfDetail: boolean;
    baseScreenSpaceError: number;
    skipScreenSpaceErrorFactor: number;
    skipLevels: number;
    loadSiblings: boolean;
    ableEnvironment: boolean;
    KTXUrl: string;
    condition: any[];
}

export const DefaultStyle: ILayerStyle = {
    url: "",
    height: 0,
    style: "",
    maximumScreenSpaceError: 10,
    baseColor: "blue",
    useColor: false,
    // styleBM: boolean; // 是否炫彩白膜
    // fgNum: number; // 泛光界限值
    // blurRadius: number; // 泛光半径
    // brightStrength: number; // 泛光强度
    appearMove: false,
    bloom: false,
    ableCustomLight: false,
    useGradient: false, // 是否使用渐变色
    mixColor: "white", // 渐变时的混合色
    mixNum: 1.0, // 渐变时的混合系数
    luminanceAtZenith: 0.2, // 对比度
    customMetalness: 0.0, // 金属度
    customRoughness: 0.0, // 粗糙度
    maximumMemoryUsage: 2048,
    skipLevelOfDetail: false,
    baseScreenSpaceError: 1024,
    skipScreenSpaceErrorFactor: 16,
    skipLevels: 1,
    loadSiblings: true,
    ableEnvironment: false,
    KTXUrl: "",
    condition: [],
};



// skipLevelOfDetail： 是否跳层级请求瓦片,这个应对大幅度拉近拉远视角效果较好
// baseScreenSpaceError： 数值越小越容易跳层级请求
// skipScreenSpaceErrorFactor： 这个数值会与baseScreenSpaceError相乘，待追源码验证
// skipLevels： 允许跳过几个层级，白膜瓦片是ADD方式，且精细模型也就40KB左右大小，理论上数值设多少，不会有什么特别现象，倾斜模型如果跳跃层级大，会出现渲染慢，因为它遍历过滤要时间和精细模型瓦片大小高达500KB一个，请求加渲染都相对比较耗时
// loadSiblings： 在遍历瓦片期间是否下载屏幕外同级瓦片（开启可以优化视角平移时，白膜渲染速度）
// immediatelyLoadDesiredLevelOfDetail： 开启则不仅下载视口所需瓦片，还会下载满足误差的瓦片    同loadSiblings类似功能，牺牲当前视角内存，优化视角平移效果
