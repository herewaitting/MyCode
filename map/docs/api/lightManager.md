---
sidebar: auto
---
# lightManager

`场景光源管理器`

## 方法<Badge text="method"/>

### setLight

#### setLight(type, options)

`设置光源，根据给定的type类型设置不同类型的光源，目前只支持三种光源，分别为环境光、点光源、聚光灯光源`

::: warning 限制
目前每种光源只能创建一个，场景内同一个光源无法创建多次
:::

* 参数
    * `{string}: type` 光源类型`Ambient、Point、Spot`
    * `{IAmbientLightOpt | IPointLightOpt | ISpotLightOpt}: options`
    * `IAmbientLightOpt环境光配置类型说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | color | `string` | 环境光颜色 |
        | brightness | `number` | 环境光亮度 |
        | enable | `boolean` | 环境光开关 |
    * `IPointLightOpt点光源配置类型说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | color | `string` | 点光源颜色 |
        | brightness | `number` | 点光源亮度 |
        | enable | `boolean` | 点光源开关 |
        | position | `ILonLatHeight` | 点光源位置，经度纬度高度 |
        | distance | `number` | 点光源照射距离|
    * `ISpotLightOpt聚光灯光源配置类型说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | color | `string` | 聚光灯光源颜色 |
        | brightness | `number` | 聚光灯光源亮度 |
        | enable | `boolean` | 聚光灯光源开关 |
        | position | `ILonLatHeight` | 聚光灯光源位置，经度纬度高度 |
        | target | `ILonLatHeight` | 聚光灯光照目标点 |
        | angle | `number` | 聚光灯光源照射角度 |
        | distance | `number` | 聚光灯光源照射距离 |

#### 调用

``` js
earthMap.lightManager.setLight("Point", {
    color: "white",
    brightness: 10,
    enable: true,
    position: {
        longitude: 110.2354,
        latitude: 29.2541,
        height: 2000
    },
    distance: 2000
})
```
