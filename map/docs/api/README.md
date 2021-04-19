---
sidebar: auto
---

# KVScene3D

`三维地球的构造函数`
::: warning 友情提示
在使用`kvscene`之前，你首先应该对`Cesium`有所了解，需要知道`Cesium`的常用`api`的使用，以及一些`webgl`的基础知识，`kvscene`中很多功能是直接调用`Cesium`的接口，因此了解`Cesium`，并且会使用它是必须的
:::

## 初始化

### new KVScene3D([opts])

* **参数**
    * `{Object} [opts]`

#### `opts说明`

| Name | Type | Description |
|:-|:-|:-|
| el |`string | HTMLElement` | DOM元素或ID |
| sceneCfg | [`Cesium.ConstructorOptions`](https://cesium.com/docs/cesiumjs-ref-doc/Viewer.html#.ConstructorOptions) | `optional` 创建地球时的场景配置 |
| hooks | `Object` | `optional` 生命周期函数, `beforeInit`、`afterInit` 、`beforeDestroy`、`afterDestroy`|

#### 用法

``` js
const earthMap = new KVScene3D({
    el: "app",
    sceneCfg: {
        baseLayerPicker: true
    },
    hooks: {
        afterInit() {
            console.log(this)
        }
    }
})

```

## 属性<Badge text="member"/>

### viewer

> 继承自`Cesium.Viewer`, 在此基础上扩展了一些功能，参见[viewer](./viewer.md)

### layerManager

> 图层图层管理器，管理图层的增删改查，参见[layerManager](./layerManager.md)

### sceneControl

> 场景控制器，主要提供控制场景的方法，参见[sceneControl](./sceneControl.md)

### baseMap

> 地图底图的一些控制方法，参见[baseMap](./baseMap.md)

### cameraControl

> 相机控制器，提供各种相机运动的方法，参见[cameraControl](./cameraControl.md)

### lightManager

> 光源控制器，提供光源控制方法，参见[lightManager](./lightManager.md)

## 方法<Badge text="method"/>

### cgh2wp

#### cgh2wp(lon, lat, height): [Cesium.Cartesian2](https://cesium.com/docs/cesiumjs-ref-doc/Cartesian2.html?classFilter=car)

`经纬度三维坐标转到屏幕二维坐标的一个快捷方法`

* 参数
    * `{number}: lon`
    * `{number}: lat`
    * `{number}: height`

``` js
const cgh = [110.4521, 30.5684, 1000];
const wp = earthMap.cgh2wp(...cgh)
// wp -> {"x":2284.7657392103456,"y":760.1517212480028}
```

### wp2cgh

#### wp2cgh(position): [Cesium.Cartographic](https://cesium.com/docs/cesiumjs-ref-doc/Cartographic.html?classFilter=car)

`三维世界坐标转三维地理坐标的一个快捷方法`

* 参数
    * `{x: number, y: number, z: number}: position`

``` js
const wp = [2285, 760];
const cgh = earthMap.cgh2wp({
    x: wp[0],
    y: wp[1],
    z: 0
})
// cgh -> {longitude: 110.4521, latitude:30.5684, height: 0}
```

### destroy

#### destroy()

`销毁场景`

``` js
earthMap.destroy()
```
