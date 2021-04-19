---
sidebar: auto
---
# baseMap

`提供底图的各种属性配置和方法`

## 属性<Badge text="member"/>

### brightness

`底图的亮度，类型为number`

### contrast

`底图的对比度，类型为number`

### hue

`底图颜色的色调，类型为number`

### saturation

`底图颜色的饱和度，类型为number`

### gamma

`底图颜色的灰度系数，类型为number`

## 方法<Badge text="method"/>

### setBlend

#### setBlend(blendOpts)

`为底图叠加颜色`

* 参数
    * `{IBeautifyFilter}: blendOpts`
    * `IBeautifyFilter类型说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | blend | `boolean` | 是否开启叠加 |
        | blendColor | `string` | 叠加颜色 |
        | alpha | `number` | 颜色透明度 |

#### 调用

``` js
earthMap.baseMap.setBlend({
    blend: true,
    blendColor: "yellow",
    alpha: 1
})
```
