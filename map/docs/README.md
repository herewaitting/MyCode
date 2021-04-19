---
heroText: 基于Cesium的三维可视化框架
home: true
heroImage: /mapLogo.png
actionText: 快速上手 →
actionLink: /api/
features:
- title: 简洁至上
  details: 简单易于理解的api调用。
- title: 大数据渲染
  details: 以最小的性能损耗处理更大的数据展示。
- title: 特效加持
  details: 内置多种特效效果。
footer: 创建属于自己的三维世界
---

## 创建你的第一个地球

``` bash
# npm安装
npm i @ksh/kvscene --registry=https://dolphin-dev.kedacom.com/ty-knpm/

# yarn 安装
yarn config set registry https://dolphin-dev.kedacom.com/ty-knpm/
yarn add @ksh/kvscene

```

### html代码

::: warning 敲黑板
因为kvscene是基于Cesium的二次开发，因此项目页面的头部应该先引入Cesium库，以及它的样式文件,如下高亮部分
:::

``` html {7,8}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="./Cesium/Widgets/widgets.css">
  <script src="./Cesium/Cesium.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>

```

### js代码

``` javascript
import * as kvscene from "@ksh/kvscene"
const earthMap = new kvscene.KVScene3D({
    el: "app",
})
```

### 页面

![地球](earthMap.png)
