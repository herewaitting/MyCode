---
sidebar: auto
---
# sceneControl

`提供场景的各种配置方法`

## 功能方法

### destroy

#### destroy()

`重置所有场景配置，移除绑定的场景事件`

#### 调用

``` js
earthMap.sceneControl.destroy()
```

### resizeScale

#### resizeScale(x, y)

`调整鼠标拾取的坐标`
::: warning 注意
如果当前应用页面被css的transform scale缩放，就必须调用此方法进行矫正，否则点击场景将无法拾取到正确的位置
:::

* 参数
    * `{number}: x`
    * `{number}: y`

#### 调用

``` js
// 如果页面缩放为原来的一半
earthMap.sceneControl.resizeScale(0.5, 0.5)
```

### setSceneHDR

#### setSceneHDR(flag)

`场景HDR效果的开关`

* 参数
    * `{boolean}: flag`

#### 调用

``` js
earthMap.sceneControl.setSceneHDR(true)
```

### ableDepthField

#### ableDepthField()

`开启场景景深效果`

#### 调用

``` js
earthMap.sceneControl.ableDepthField()
```

### enableDepthField

#### enableDepthField()

`关闭场景景深效果`

#### 调用

``` js
earthMap.sceneControl.enableDepthField()
```

### setDepthField

#### setDepthField(options)

`配置场景景深效果`

* 参数
    * `{IDepthFiledOpts}: options`
    * `IDepthFiledOpts类型说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | focalDistance | `number` | `optional` 深度 |
        | delta | `number` | `optional` delta |
        | sigma | `number` | `optional` sigma |
        | stepSize | `number` | `optional` 步长 |

#### 调用

``` js
earthMap.sceneControl.setDepthField({
    focalDistance: 1,
    delta: 2,
    sigma: 1,
    stepSize: 2
})
```

### setZoomDistance

#### setZoomDistance(distance)

`设置场景缩放范围`

* 参数
    * `{near: number, far: number}: distance`

#### 调用

``` js
earthMap.sceneControl.setZoomDistance({near: 1000, far: 100000})
```

### setSceneBloom

#### setSceneBloom(flag)

`场景泛光效果开关`

* 参数
    * `{boolean}: flag`

#### 调用

``` js
earthMap.sceneControl.setSceneBloom(true)
```

### setSceneBloomOpts

#### setSceneBloomOpts(options)

`配置场景泛光效果`

* 参数
    * `{ISceneBloomOpts}: options`
    * `ISceneBloomOpts类型介绍`
        | Name | Type | Description |
        |:-|:-|:-|
        | contrast | `number` | `optional` 对比度 |
        | brightness | `number` | `optional` 亮度 |
        | delta | `number` | `optional` delta |
        | sigma | `number` | `optional` sigma |
        | stepSize | `number` | `optional` 步长 |

#### 调用

``` js
earthMap.sceneControl.setSceneBloomOpts({
    contrast: 1,
    brightness: 10,
    delta: 1,
    sigma: 1,
    stepSize: 5,
})
```

### earthRotate

#### earthRotate()

`开启地球自转`

#### 调用

``` js
earthMap.sceneControl.earthRotate()
```

### disableEarthRotate

#### disableEarthRotate()

`关闭地球自转`

#### 调用

``` js
earthMap.sceneControl.disableEarthRotate();
```

### setImageryProvider

#### setImageryProvider(providerArr)

`配置场景底图`

* 参数
    * `{IImageryProvider[]}: providerArr`
    * `IImageryProvider类型讲解`
        | Name | Type | Description |
        |:-|:-|:-|
        | type | `string` | 底图的协议类型`TMS`或者`UrlTemplate` |
        | server | `string` | 底图的服务地址 |
        | minimumLevel | `number` | 底图的最小级别 |
        | maximumLevel | `number` | 底图的最大级别 |
        | isLimit | `boolean` | 区域限制的开关，开启后可以设置底图的加载区域 |
        | rectangle<Badge text="object"/> | `object` | 限制区域范围，`isLimit`为`true`时有用 |

    * `object`说明
        | Name | Type | Description |
        |:-|:-|:-|
        | west | `number` | 不如如何描述 |
        | south | `number` | 不如如何描述 |
        | east | `number` | 不如如何描述 |
        | north | `number` | 不如如何描述 |

#### 调用

``` js
earthMap.sceneControl.setImageryProvider([
    {
        type: "UrlTemplate",
        server: "http://xx.xx.xx.xx:xxxx/map"
        minimumLevel: 0,
        maximumLevel: 18,
        isLimit: true,
        rectangle: {
            west: 109.6964554,
            south: 28.8726569350672,
            east: 111.333418290625,
            north: 29.79210953
        }
    }
])
```

### showSun

#### showSun(flag)

`太阳显示隐藏`

* 参数
    * `{boolean}: flag`

#### 调用

``` js
earthMap.sceneControl.showSun(true)
```

### showMoon

#### showMoon(flag)

`月亮显示隐藏`

* 参数
    * `{boolean}: flag`

#### 调用

``` js
earthMap.sceneControl.showMoon(true)
```

### showAtomsquere

#### showAtomsquere(flag)

`大气显示隐藏`

* 参数
    * `{boolean}: flag`

#### 调用

``` js
earthMap.sceneControl.showAtomsquere(true)
```

### showGlobe

#### showGlobe(flag)

`地球球体显示隐藏`

* 参数
    * `{boolean}: flag`

#### 调用

``` js
earthMap.sceneControl.showGlobe(true)
```

### showSkyBox

#### showSkyBox(flag)

`天空盒显示隐藏`

* 参数
    * `{boolean}: flag`

#### 调用

``` js
earthMap.sceneControl.showSkyBox(true)
```

### setFogPost

#### setFogPost(options)

`雾的边缘后处理设置`

* 参数
    * `{IFogCfg}: flag`
    * `IFogCfg参数说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | ableFog | `boolean` | 开启 |
        | x | `number` | x轴维度阈值 |
        | y | `number` | y轴维度阈值 |
        | color | `string` | 颜色 |
        | strength | `number` | 强度 |

#### 调用

``` js
earthMap.sceneControl.setFogPost({
    ableFog: true,
    x: 5,
    y: 5,
    color: "yellow",
    strength: 2
})
```

### setBaseColor

#### setBaseColor(color)

`设置地球基底颜色`

* 参数
    * `{string}: color`

#### 调用

``` js
earthMap.sceneControl.setBaseColor("red")
```

### ableClickPos

#### ableClickPos(cb)

`开启坐标拾取，返回一个经纬度坐标的点`

* 参数
    * `{Function}: cb`

#### 调用

``` js
earthMap.sceneControl.ableClickPos((pos) => {
    console.log(pos.longitude, pos.latitude, pos.height)
})
```

### enableClickPos

#### enableClickPos()

`关闭坐标拾取`

#### 调用

``` js
earthMap.sceneControl.enableClickPos()
```

### setSkyBox

#### setSkyBox(options)

`设置天空盒， 可以根据相机离地面的距离设置近远2套天空盒自动切换`

* 参数
    * `{ISkyBoxOpts}: options`
    * `ISkyBoxOpts类型说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | divisionHeight | `number` | 相机离地距离 |
        | near<Badge text="ISkyBoxImg"/> | `ISkyBoxImg` | 近地天空盒 |
        | far<Badge text="ISkyBoxImg"/> | `ISkyBoxImg` | 远地天空盒 |
    * `ISkyBoxImg类型说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | positiveX | `string` | px图片地址 |
        | negativeX | `string` | nx图片地址 |
        | positiveY | `string` | py图片地址 |
        | negativeY | `string` | ny图片地址 |
        | positiveZ | `string` | pz图片地址 |
        | negativeZ | `string` | nz图片地址 |

#### 调用

``` js
earthMap.sceneControl.setSkyBox({
    divisionHeight: 300000,
    near: {
       positiveX: "xxx.png",
       negativeX: "xxx.png",
       positiveY: "xxx.png",
       negativeY: "xxx.png",
       positiveZ: "xxx.png",
       negativeZ: "xxx.png",
    },
    far: {
       positiveX: "xxx.png",
       negativeX: "xxx.png",
       positiveY: "xxx.png",
       negativeY: "xxx.png",
       positiveZ: "xxx.png",
       negativeZ: "xxx.png",
    },
})
```

### getBatchHeight

#### getBatchHeight(datas, transFun)

`在有地图有高程数据的情况下，可以查找到某个经纬度点对应的海拔高度height, datas是一个经纬度坐标点数组，tranFun为自定义的字段转换函数，非必传，默认内部取点的longitude和latitude字段, 返回一个Promise`

* 参数
    * `{Array}: datas`
    * `{Function}: transFun`

#### 调用

``` js
earthMap.sceneControl.getBatchHeight(
    [
        {lon: 110.154, lat: 30.251, id: "a1"}
    ],
    (data) => {
        data.longitude = data.lon
        data.latitude = data.lat
        return data;
    }
).then(datas => {
    console.log(datas) // [{longitude: 110.154,latitude: 30.251, lon: 110.154, lat: 30.251, height: 102,id: "a1"}]
})
```

### terrainClip

#### terrainClip(options)

`地形裁剪，`

* 参数
    * `{object}: options`
    * `object说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | area | `string` | 一个geojson文件 |

#### 调用

``` js
earthMap.sceneControl.terrainClip({
    area: "xxx.geojson"
})
```

### destroyClip

#### destroyClip()

`取消地形裁剪`

#### 调用

``` js
earthMap.sceneControl.destroyClip()
```


### focusArea

#### focusArea(options)

`地形裁剪，`

* 参数
    * `{object}: options`
    * `object说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | area | `string` | 一个geojson文件 |

#### 调用

``` js
earthMap.sceneControl.focusArea({
    area: "xxx.geojson"
})
```

### disFocusArea

#### disFocusArea()

`取消聚焦区域`

#### 调用

``` js
earthMap.sceneControl.disFocusArea()
```


### changeSingleImagery

#### changeSingleImagery(url)

`更换单张底图服务`

* 参数
    * `{string}: url`

``` js
earthMap.sceneControl.changeSingleImagery(url)
```

### tiles3DClip

#### tiles3DClip(options)

`模型裁剪`

* 参数
    * `{object}: options`
    * `object说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | area | `string` | 一个geojson文件 |

#### 调用

``` js
earthMap.sceneControl.tiles3DClip({
    area: "xxx.geojson"
})
```

### destroyTiles3DClip

#### destroyTiles3DClip()

`取消模型裁剪`

#### 调用

``` js
earthMap.sceneControl.destroyTiles3DClip()
```

### bright3dTiles

#### bright3dTiles(options)

`区域高亮白膜`

* 参数
    * `{object}: options`
    * `object说明`
        | Name | Type | Description |
        |:-|:-|:-|
        | area | `string` | 一个geojson文件 |

#### 调用

``` js
earthMap.sceneControl.bright3dTiles({
    area: "xxx.geojson"
})
```

### destroyBright3dTiles

#### destroyBright3dTiles()

`取消区域高亮白膜`

#### 调用

``` js
earthMap.sceneControl.destroyBright3dTiles()
```
