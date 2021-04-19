---
sidebar: auto
---
# cameraControl

`为场景提供各种相机定位、飞行等功能`

## 属性<Badge text="member"/>

## 方法<Badge text="method"/>

### setMaxLimitDis

#### setMaxLimitDis(distance)

::: warning 注意
要使此方法生效，需要先调用setSceneCenter方法设置场景的中心点位置，设置相机远离场景中心最大距离，如果当相机位置超出了设置的范围，则相机会强制飞回到边缘的某个点
:::

* 参数
    * `{number}: distance`

#### 调用

``` js
earthMap.cameraControl.setMaxLimitDis(50000)
```

### setSceneCenter

#### setSceneCenter(point, radius)

`设置场景的中心点`

* 参数
    * `{ILonLatHeight}: point`
    * `ILonLatHeight类型说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | longitude | `number` | 经度 |
        | latitude | `number` | 纬度 |
        | height | `number` | `optional`高度 |
    * `{number}: optional radius`

#### 调用

``` js
earthMap.cameraControl.setSceneCenter({
    longitude: 110.032,
    latitude: 30.11235,
    height: 0,
})
```

### setLimitEvent

#### setLimitEvent()

`绑定相机区域限制事件`

#### 调用

``` js
earthMap.cameraControl.setLimitEvent()
```

### roamOnLine

#### roamOnLine(lineData, options)

`镜头漫游，相据提供的路线进行飞行，调用quitRoamOnLine方法退出漫游行为`

* 参数
    * `{ILonLatHeight[]}: lineData`
    * `ILonLatHeight类型同`[setSceneCenter](#setSceneCenter)
    * `{IRoamOption}: options`
        | Name | Type | Description |
        |:-|:-|:-|
        | speed | `number` | 相机漫游速度 |
        | height | `number` | `optional`忽略数据点中的height，设置统一的相机漫游高度 |

#### 调用

``` js
earthMap.cameraControl.roamOnLine([
    {...},
    {...},
    {...},
    {...},
    {...},
], {
    speed: 10,
})
```

### quitRoamOnLine

#### quitRoamOnLine()

`退出相机漫游行为`

#### 调用

``` js
earthMap.cameraControl.quitRoamOnLine();
```

### enableKeyboardRoam

#### enableKeyboardRoam()

`开启键盘控制相机行为，方法内置设定为：W向前移动、S向后移动、Q向上移动、E向下移动、D向右移动、A向左移动，目前自定义按键暂未对外开放`

#### 调用

``` js
earthMap.cameraControl.enableKeyboardRoam();
```

### zoomTargetPot

#### zoomTargetPot(point, type): Promise

`镜头切换动画`

* 参数
    * `{ILonLatHeight}: point` 目标点
    * `ILonLatHeight类型同`[setSceneCenter](#setSceneCenter)
    * `{string}: type` 离目标点远近类型

#### 调用

``` js
earthMap.cameraControl.zoomTargetPot({
    longitude: 120.3131
    latitude: 28.32541
    height: 0,
}, "mid");
```

### rotatePoint

#### rotatePoint(options)

`相机先飞到目标点的位置，然后相机绕给目标点旋转，或者相机自转，`

* 参数
    * `{IRotatePointOpts}: options`
    * `IRotatePointOpts类型说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | type | `string` | 旋转类型`self`or`else` |
        | lon | `number` | 经度 |
        | lat | `number` | 纬度 |
        | height | `number` | 高度 |
        | distance | `number` | 相机与目标点的距离 |
        | pitch | `number` | 相机的俯仰角度 |
        | speed | `number` | 旋转的速度 |
        | time | `number` | 飞到目标点的时间 |

#### 调用

``` js
earthMap.cameraControl.rotatePoint({
    type: "else",
    lon: 110.32644,
    lat: 29.15244,
    height: 0,
    distance: 1000,
    pitch: 60,
    speed: 5,
    time: 2
})
```

### stopRotatePoint

#### stopRotatePoint()

`停止绕点旋转或者相机自转`

#### 调用

``` js
earthMap.cameraControl.stopRotatePoint()
```

### disableKeyboardRoam

#### disableKeyboardRoam()

`关闭通过键盘控制相机的行为`

#### 调用

``` js
earthMap.cameraControl.disableKeyboardRoam()
```

### controlCamera

#### controlCamera(flag)

`是否允许鼠标对相机进行控制`

* 参数
    * `{boolean}: flag`

#### 调用

``` js
earthMap.cameraControl.controlCamera(false)
```

### viewerFlyTo

#### viewerFlyTo(viewCfg)

`相机以给定的姿态，飞行到目标点`

* 参数
    * `{IviewerCfg}: viewCfg`
    * `IviewerCfg类型说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | lon | `number` | 目标点经度 |
        | lat | `number` | 目标点纬度 |
        | height | `number` | 目标点高度 |
        | heading | `number` | 相机航向角 |
        | pitch | `number` | 相机俯仰角 |
        | duration | `number` | 相机飞行时间 |

#### 调用

``` js
earthMap.cameraControl.viewerFlyTo({
    lon: 110.2354,
    lat: 28.3244,
    height: 0,
    heading: 0,
    ptich: 60,
    duration: 2
})
```

### lookAtPoint

#### lookAtPoint(options)

`相机以给定的姿态看向给定点`

* 参数
    * `{IRotatePointOpts}: options`
    * `IRotatePointOpts类型同`[rotatePoint](#rotatePoint)

#### 调用

``` js
earthMap.cameraControl.lookAtPoint({
    type: "else",
    lon: 110.2354,
    lat: 28.3244,
    height: 0,
    heading: 0,
    ptich: 60,
    duration: 2
})
```

### getCameraInfo

#### getCameraInfo()

`返回当前相机的位置信息`

#### 调用

``` js
const cameraInfo = earthMap.cameraControl.getCameraInfo()
console.log(cameraInfo)
```
