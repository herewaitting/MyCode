# 基于cesium的三维可视化开发框架

## 功能特性

1. 整体地球展示
2. 自定义地球底图，可叠加多层底图（可接第三方）
3. 底图颜色叠加滤镜 （如果对原始底图整体色调不满意，可以采用滤镜修改）
4. 自定义天空盒，远近天空盒切换
5. 三维模型展示，模型动画，360度全视角观察
6. 城市级大型白模制作，展示，效果增强。
7. 道路模拟，支持大数据道路绘制，流动
8. 根据地理信息文件（geojson）进行行政区块划分，可采用特效墙体，特效流线展示
9. 告警点模拟，告警效果增强
10. 人员车辆实时动态定位，数据展示
11. 无人机航拍，航拍范围实时模拟
12. POI兴趣点大数据展示，拥有聚合算法
13. 地图高程数据展示，展示地形的高低起伏变化
14. 地形裁剪，能只展示想展示的区域地形
15. 三维潮流图业务集成，能直接对接电力潮流图业务
16. 支持光源添加，目前支持的光源有环境光、点光源、聚光灯（遗憾：目前每种光源场景内只能添加一个，光源只作用于对光敏感的图层，并不是所有图层都能被光源影响）
17. 支持对相机的各种控制，支持相机动画，路径漫游，支持自定义绑定相机控制按键
18. 支持自定义图层

> 目前所有可创建的图层请参考
[图层清单](https://10.67.24.188:8081/kvsceneDocs/layerList/#%E7%82%B9%E5%9B%BE%E5%B1%82)

## 常用API

### 安装

```shell
npm i @ksh/kvscene --registry=https://dolphin-dev.kedacom.com/ty-knpm/
or
yarn add @ksh/kvscene --registry=https://dolphin-dev.kedacom.com/ty-knpm/

```

### 使用

> 因为kvscene基于cesium所以在使用之前应该先引入cesium相关

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="./Cesium/Widgets/widgets.css">
  <script src="./Cesium/Cesium.js"></script>
  <script src="kvscene.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
  <script>
    const earthMap = new kvmap.KVScene3D({
      el: "app",
      sceneCfg: {},
      hooks:{
        async afterInit(){
          console.log("inited")
        }
      }
    })
  </script>
</html>

```

### 创建图层

> 详细参数参考接口文档
[传送门](https://10.67.24.188:8081/kvsceneDocs)

```javascript
const myModel = earthMap.layerManager.addLayer("myModel", "model", {
  baseCfg: {},
  style: {},
  hooks: {}
})
myModel.setData([{"lon": "111.21", "lat": "30.2534", "height": 0, "id": "model1"}])

```

## 更新历史

> 见
[changeLog.md](https://szgitlab.kedacom.com/kdksh/kvmap/blob/newKvmap/changelog.md)
