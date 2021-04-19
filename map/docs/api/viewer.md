---
sidebar: auto
---
# viewer

`由内部类SceneServer构造而来，SceneServer继承自Cesium.Viewer，因此viewer拥有Cesium.Viewer的所有属性和方法`[Cesium.Viewer](https://cesium.com/docs/cesiumjs-ref-doc/Viewer.html?classFilter=viewer)

## 扩展方法

### bindEvent

#### bindEvent(name, eventType, cb)

`订阅场景事件`

* 参数
    * `{string}: name`
    * `{string}: eventType`
    * `{Function}: cb`

### removeEvent

#### removeEvent(name, eventType)

`移除场景事件`

* 参数
    * `{string}: name`
    * `{string}: eventType`

### init

#### init()

`初始化一些场景配置`

### cgh2wp

#### cgh2wp(lon, lat, height)

`三维地理坐标转二维屏幕坐标，KVScene3D的cgh2wp方法内部调用的viewer.cgh2wp`

### wp2cgh

#### wp2cgh(position)

`三维世界坐标转三维地理坐标，KVScene3D的wp2cgh方法内部调用的viewer.wp2cgh`

### cameraChange

#### cameraChange(cb)

`订阅相机的运动事件, 获取地图的层级`

* 参数
    * `{Function}: cb`

### renderPrimitive

#### renderPrimitive(primitiveContainer)

`渲染场景元素`

* 参数
    * `{Object} primitiveContainer`

### removePrimitive

#### removePrimitive(primitiveContainer)

`移除场景元素`

* 参数
    * `{Object} primitiveContainer`

### changeCameraLimitPitch

#### changeCameraLimitPitch(angle)

`改变相机俯仰角限制`

* 参数
    * `{number} angle`
