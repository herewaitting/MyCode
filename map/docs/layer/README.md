---
sidebar: auto
---
# 图层

## 原理介绍

### 添加一个图层

::: tip
以添加一个模型点图层为例，我们通过layerManager来添加一个图层，模型点图层的类型为`ModelPoint`, 了解更多类型图层，请参考[图层列表](./)
:::

``` js
const layer = earthMap.layerManager.addLayer("firstLayer", "modelPoint", {
    baseCfg: { // 图层的公共配置，所有图层的baseCfg都一样
        enableLevlControl: false, // 是否开启通过地图层级显示或隐藏图层，默认false
        tags: "", // 为该图层自定义标签
        visible: true, // 图层起始显示或隐藏状态
        maxVisibleLevel: 18, // 最大地图层级 配合enableLevlControl使用
        minVisibleLevel: 1, // 最小地图层级 配合enableLevlControl使用
        mergeDraw: false, // 是否把图元合并成一个绘制
    },
    style: { // 图层的样式，每个图层的样式不相同
        color: "white",
        modelUrl: "", // 模型地址，如果为空，则会使用默认的模型
        ableRotate: false,
        speed: 1,
        scale: 1,
        angle: 0,
        tX: 0,
        tY: 0,
        tZ: 0,
        tplCfg: {},
        condition: [],,
    },
    hooks: {
        startInit() {
            console.log("before init")
        },
        endInit() {
            console.log("inited")
        },
        startDealStyle() {
            console.log("before style update")
        },
        endDealStyle() {
            console.log("style updated")
        },
        startDealData() {
            cosole.log("Data not yet processed")
        },
        endDealData() {
            cosole.log("Data has been rendered")
        },
        startDestroy() {
            console.log("before destroy")
        }，
        endDestroy() {
            console.log("destroyed")
        }
    }
})
// 设置数据
layer.setData([{lon: 110.254, lat: 30.2546, height: 0, id: "model1"}])

// 更新样式
layer.updateStyle({
    color: "red"
})

// 更新数据
layer.updateData([{lon: 110.254, lat: 30.2546, height: 0, id: "model1"}, {lon: 120.254, lat: 29.2546, height: 100, id: "model2"}])

// 图层销毁
layer.destroy()
```

`以上代码会在场景添加一个模型，参数都完整的传了进去，layerManager的addLayer方法内部会根据第二个参数layerType找得对应的图层，并实例化出来，初始化开始到结束会执行startInit、startDealStyle、endDealStyle和endInit生命周期函数，当调用图层实例的setData方法后，执行startDealData和endDealData声明周期函数，之后每次更新图层样式或者数据时都会触发对应生命周期函数`

### 图层的基类与继承

`在上面，我们创建了一个模型点图层的示例，看一下该模型点图层的部分源码实现`

``` js
export class ModelPoint extends Point<ILayerStyle> {
    // someProperty
    ...
    ...
    constructor(viewer: SceneServer, layerName: string, option: ILayerOption<ILayerStyle>) {
        super(viewer, layerName, option);
    }
    // someMethods
    ...
    ...
    ...
}
```

`由此可见，模型点图层ModelPoint，是继承Point类的，这也是kvscene所有点图层的基类，所有点图层都是基于Point基类进行分装，相同的还有Line基类和Polygon基类，点线面三大图层构成了目前kvscene的主要功能，但是Point、Line以及Polygon并不是最底层，他们全部继承自Layer基类，由Layer基类完成整个图层的生命周期，初始化，创建、渲染、销毁等过程，Point、Line以及Polygon基于Layer扩展对应点线面的一些功能，最后再由点线面基类派生对应的业务图层，比如ModelPoint模型点图层，了解更多业务图层请参考`[图层列表](./)

<!-- ### Layer抽象基类

`Layer是所有图层的最底层基类，基于layer之上封装的有Point，Line和Polygon三大图层基类类，然后是基于Point、Line和Polygon之上封装的业务图层。因为是抽象类，因此Layer除了有自身的方法外还有抽象属性和方法，定义抽象方法的主要目的是让派生子类去实现自己的逻辑，主要的抽象属性和方法如下：`

#### 主要抽象接口

``` js
abstract class Layer {
    public abstract layerType: string; // 图层类型，每个图层都不同
    public abstract layerType: string; // 图层类型，每个图层都不同
}
``` -->
