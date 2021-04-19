---
sidebar: auto
---
# layerManager

`图层管理器，负责图层的增删改查`

## 示例

### 创建图层

``` js
const layer = earthMap.layerManager.addLayer("firstLayer", "modelPoint")
layer.setData([{lon: 110.254, lat: 30.2546, height: 0, id: "model1"}])
```

## 属性<Badge text="member"/>

### UseableLayer<Badge type="warning" text="static"/>

`所有能够被使用的图层清单， 类型为一个对象，key为图层类型，value为该类型对应的图层构造函数`

### addedLayers

`保存了所有当前已创建的图层，按照点、线、面进行存储`

### viewer

`场景对象，类型为SceneServer，具体请查看` [SceneServer](./viewer/)

## 方法<Badge text="method"/>

### addLayer

#### addLayer(layerName, layerType, opts)

`添加图层`

* 参数
    * `{string}: layerName`
    * `{string}: layerType`
    * `{object}: opts`
* `opts 参数说明`
    | Name | Type | Description |
    |:-|:-|:-|
    | [baseCfg](../layer) | `object` | `optional` 图层公共配置 |
    | style | `object` | `optional` 图层样式配置 |
    | hooks | `object` | `optional` 图层声明周期函数对象 |

### removeLayer

#### removeLayer(layerName)

`移除单个图层，图层一旦被移除就无法在继续使用`

* 参数
    * `{string}: layerName`

#### 调用示例

``` js
earthMap.layerManager.removeLayer("firstLayer")
```

### removeAll

#### removeAll()

`移除所有图层, 只是移除图层，不会移除图层在场景内已经绑定的事件`

#### 调用示例

``` js
earthMap.layerManager.removeAll()
```

### destroy

#### destroy()

`移除所有图层，并移除所有图层订阅的场景事件`

#### 调用示例

``` js
earthMap.layerManager.destroy()
```

### getLayerByName

#### getLayerByName(layerName)

`根据图层名，获取对应图层`

* 参数
    * `{string} layerName`

#### 调用示例

``` js
const layer = earthMap.layerManager.getLayerByName("firstLayer")
```

### getParabolaMid

#### getParabolaMid(layerName)

`获取抛物线图层的所有抛物线的中点`

* 参数
    * `{string}: layerName`

#### 调用示例

``` js
const midPointArr = earthMap.layerManager.getLayerByName("parabolaLayer")
```

### updateData

#### updateData(layerName, data)

`更新某个图层数据`

* 参数
    * `{string}: layerName`
    * `{Array}: data`

#### 调用示例

``` js
earthMap.layerManager.updateData("firstLayer", [{...}, {...}, {...}])
```

### locatedLayer

#### locatedLayer(layerName)

`定位到某个图层，由于图层的数据可能很多，相机会飞到盖图层第一个点、线、或者面的位置`

* 参数
    * `{string}: layerName`

#### 调用示例

``` js
earthMap.layerManager.locatedLayer("firstLayer")
```
