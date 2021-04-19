---
sidebar: auto
---
# 图层列表

## 点图层

`由Point基类派生出的子类`

### Billboard

`广告牌图层，图元形态为一张贴图，能表示各种点类型的业务数据，如POI等hkjhkjhkhkjh`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| imgUrl | `string` | 图元贴图 |
| scale | `number` | 图元缩放 |
| height | `number` | 图元偏移高度 |
| bloom | `boolean` | 图元是否泛光 |
| floatHeight | `number` | 图元浮动高度 |
| condition | `any[]` | 条件样式数组，当前图元数据满足条件时，会采用该条件对应的样式 |
[案例地址](https://10.67.24.183/show.html?sid=0d1951b1-c498-466f-826e-50421addfdcb&projectMarker=PhdNhPHk)

### ColorPoint

`纯色点图层，图元形态为一个纯色圆点，可用于场景打点标记`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| color | `string` | 图元颜色 |
| pixelSize | `number` | 图元的像素大小 |
| bloom | `boolean` | 图元是否泛光 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=77e88e61-08ec-48e7-b37c-fa5d693ae49c&projectMarker=PhdNhPHk)

### DomeCover

`科幻风的半圆形包围效果，可以表示重点区域保护范围，是一种范围效果类增强图层`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| color | `string` | 图元颜色 |
| speed | `number` | 图元表面流动效果速度参数 |
| radius | `number` | 图元范围半径 |
| brightness | `number` | 图元亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=a6002717-899b-440f-8d9f-14b2fc4b7ad5&projectMarker=PhdNhPHk)

### GifBillboard

`同上面的Billboard图层，区别在于这次层支持图片是gif格式，并且不会上下浮动`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| imgUrl | `string` | 图元贴图 |
| scale | `number` | 图元缩放 |
| height | `number` | 图元偏移高度 |
| bloom | `boolean` | 图元是否泛光 |
| featuresType | `string` | 未知 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=54f833b6-f4fa-4527-a021-e699b065b7e4&projectMarker=PhdNhPHk)

### HotMap2D

`热力图图层，正常热力图业务都能使用`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| colorCard | `string` | 色卡图片地址 |
| pointSize | `number` | 热力点像素尺寸 |
| alpha | `number` | 热力图透明度 |
| showNum | `number` | 显示比例 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=0118b9b1-f817-4232-8967-d178712f0fe8&projectMarker=PhdNhPHk)

### LightBeam

`光柱图层，点数据的一种效果增强展示`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| color | `string` | 图元颜色 |
| radius | `number` | 光柱底部半径 |
| baseRadiusScale | `number` | 光柱底盘半径比例 |
| ratio | `number` | 光柱高宽比例 |
| speed | `number` | 动画速度 |
| imgUrl | `string` | 光柱底盘背景贴图 |
| bloom | `boolean` | 是否泛光 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=3c34cf2b-d6c5-41ed-bb3b-5e244199eb27&projectMarker=PhdNhPHk)

### ModelPoint

`模型点图层，用于模型展示`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| modelUrl | `string` | 模型地址 |
| ableRotate | `boolean` | 是否自转 |
| color | `string` | 图元颜色 |
| speed | `number` | 自转速度 |
| brightness | `number` | 亮度 |
| tX | `number` | X轴平移量 |
| tY | `number` | Y轴平移量 |
| tZ | `number` | Z轴平移量 |
| angle | `number` | 模型旋转角度 |
| scale | `number` | 模型缩放 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=0b2bafe5-5b42-456f-a0de-42a81afe63f0&projectMarker=PhdNhPHk)

### MultiPyramid

`棱锥体图层，图层以棱锥体的形态展现，自带上下浮动效果`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| num | `number` | 棱锥棱数 |
| color | `string` | 椎体颜色 |
| frameColor | `string` | 边框颜色 |
| size | `number` | 椎体尺寸 |
| ratio | `number` | 椎体比例 |
| height | `number` | 椎体高度 |
| alpha | `number` | 透明度 |
| speed | `number` | 浮动速度 |
| floatHeight | `number` | 浮动高度 |
| bloom | `number` | 泛光 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=75a27f9e-643f-470c-8edd-9efc6360db3c&projectMarker=PhdNhPHk)

### RadarScan

`圆形纹理扫描图层, 贴地，默认效果雷达扫描的效果贴图，不同的贴图可以有不同的效果，但是纹理始终是做圆周运动`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| color | `string` | 图元颜色 |
| speed | `number` | 运动速度 |
| imgUrl | `number` | 纹理贴图 |
| radius | `number` | 图元半径 |
| brightness | `number` | 图元亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=1d342be2-d2d8-4236-9191-8d2d1b0e72a8&projectMarker=PhdNhPHk)

### RandomFloatPoint

`氛围点图层，纯效果图层，只需创建，无法设置数据源，内部根据参数随机生成一定数量的效果点，烘托氛围`
| Name | Type | Description |
|:-|:-|:-|
| color | `string` | 颜色 |
| radius | `number` | 覆盖范围 |
| potNum | `number` | 需要生成点的数量 |
| limitHeight | `number` | 氛围点厚度 |
| brightness | `number` | 氛围点亮度 |
| longitude | `number` | 范围中点经度 |
| latitude | `number` | 范围中点纬度 |
| height | `number` | 范围中点高度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=3e367311-ecba-4fd6-8759-186b1d1f07a0&projectMarker=PhdNhPHk)

### RotateImage

`圆形纹理扫描图层，同RadarScan图层，区别在于该图层的图元补贴地`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| color | `string` | 图元颜色 |
| speed | `number` | 运动速度 |
| imgUrl | `number` | 纹理贴图 |
| radius | `number` | 图元半径 |
| brightness | `number` | 图元亮度 |
| bloom | `boolean` | 泛光 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=70fa305d-3827-4daf-877e-ef4d8ead4cff&projectMarker=PhdNhPHk)

### TextLabel

`文字标题图层，为数据点创建标题`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| fontSize | `number` | 字体大小 |
| fontType | `string` | 字体类型 |
| fillColor | `string` | 字体颜色 |
| scale | `number` | 字体缩放 |
| height | `number` | 偏移高度 |
| showBackground | `boolean` | 显示背景 |
| backgroundColor | `string` | 背景色 |
| bgPX | `number` | 左右内边距 |
| bgPY | `number` | 上下内边距 |
| offsetX | `number` | X方向偏移量 |
| offsetY | `number` | Y方向偏移量 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=d3c11976-d85f-44ee-b4c2-e5b587369210&projectMarker=PhdNhPHk)

### Tornado

`立体环绕效果图层，该图层图元形态由3个圆型柱体组成，每个柱体做纹理螺旋上升运动，有类似龙卷风的效果，点数据的特效图层`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| radius | `number` | 柱体半径 |
| spaceRatio | `number` | 空间比例 |
| height | `number` | 高度 |
| speed | `number` | 速度 |
| outImg | `string` | 最外柱体的纹理贴图 |
| midImg | `string` | 中间柱体的纹理贴图 |
| innerImg | `string` | 最里柱体的纹理贴图 |
| bloom | `boolean` | 图元泛光 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=3d32b369-3c80-45c0-a9b6-9bc809112b53&projectMarker=PhdNhPHk)

### WaveCircle

`波浪圆外扩效果图层，该图元形态为多个圆从中心点向外慢慢扩散的效果，一般用于点位告警类`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| color | `string` | 图元颜色 |
| speed | `number` | 扩散速度 |
| count | `number` | 扩散圆数量 |
| gradient | `number` | 扩散圆颜色渐变系数 |
| radius | `number` | 整体扩散半径 |
| bloom | `boolean` | 泛光 |
| brightness | `number` | 图元亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=fc5d40fb-0be6-406c-a70f-c1cfa06241e6&projectMarker=PhdNhPHk)

### WaveRect

`方形扩散效果图层，图元形态为一个正方形慢慢向外扩散的效果`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| color | `string` | 颜色 |
| speed | `number` | 扩散速度 |
| radius | `number` | 扩散半径 |
| maxScale | `number` | 最大缩放值 |
| brightness | `number` | 亮度 |
| bloom | `boolean` | 泛光 |
| condition | `any[]` | `同上` |
<!-- [案例地址](https://10.67.24.183/show.html?sid=fc5d40fb-0be6-406c-a70f-c1cfa06241e6&projectMarker=PhdNhPHk) -->

### WaveRing

`贴图扩散圆环图层，贴地，图元形态为一个向外扩散的圆环，圆环可配置贴图`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| imgUrl | `string` | 纹理图片地址 |
| speed | `number` | 扩散速度 |
| radius | `number` | 扩散半径 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=2cc240ba-1e96-48ac-9535-bd2bfd267416&projectMarker=PhdNhPHk)

### WishPoint

`许愿点图层， 图元形态为一跟垂直地面的线上有一个点在运动，可以理解为一根垂直的流动线`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| baseColor | `string` | 线的颜色 |
| floodColor | `string` | 流动颜色 |
| speed | `number` | 流动速度 |
| height | `number` | 离地高度 |
| lineWidth | `number` | 线宽 |
| brightness | `number` | 亮度 |
| bloom | `boolean` | 泛光 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=fddc7334-9d6a-4dbf-a8b6-4641df77ab32&projectMarker=PhdNhPHk)

### AlphaCylinder

`渐变圆柱图层，图元形态是一个圆柱，颜色是从底部纯色到上的一个透明渐变`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| radius | `number` | 圆柱半径 |
| ratio | `number` | 通过半径计算圆柱高度的系数 |
| color | `string` | 圆柱颜色 |
| brightness | `number` | 亮度 |
| bloom | `boolean` | 泛光 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=b8e601bf-b10a-48ff-a7a1-a68f487cb59b&projectMarker=PhdNhPHk)

### AngleRing

`圆环上升效果图层，图元形态为多个圆环垂直上升，并同时缓慢扩散的效果`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| radius | `number` | 圆环半径 |
| ratio | `number` | 通过半径计算圆柱高度的系数 |
| topRatio | `number` | 顶部半径的缩放 |
| color | `string` | 圆环颜色 |
| brightness | `number` | 亮度 |
| bloom | `boolean` | 泛光 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=b19f28cb-4ba1-4551-af94-85666da330e6&projectMarker=PhdNhPHk)

### SimulateHalo

`圆形模糊效果图层，图元形态为一个模糊的纯色圆形范围点，类型一个热力点，只不过是纯色的`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| radius | `number` | 圆的半径 |
| color | `string` | 圆的颜色 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=ac84d216-10b1-4b0e-81e4-ff6e1aff50df&projectMarker=PhdNhPHk)

## 线图层

### ColorLine

`颜色流动线图层，图元形态为一根线，线上会有流动特效`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| lineWidth | `number` | 线宽度 |
| speed | `number` | 流动速度 |
| repeat | `number` | 流动特效的个数 |
| baseColor | `string` | 线颜色 |
| floodColor | `string` | 流动特效颜色 |
| bloom | `boolean` | 泛光 |
| height | `number` | 线的整体偏移高度 |
| brightness | `number` | 亮度 |
| groundLine | `boolean` | 贴地 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=7c15a919-6207-4b6e-aaf3-3f0731e19b29&projectMarker=PhdNhPHk)

### ImageLine

`贴图流动线，与颜色流动线类似，只不过把线的纹理从纯色换为贴图纹理，并做纹理运动`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| lineWidth | `number` | 线宽度 |
| speed | `number` | 流动速度 |
| repeat | `number` | 流动特效的个数 |
| imgUrl | `string` | 纹理贴图路径 |
| bloom | `boolean` | 泛光 |
| brightness | `number` | 亮度 |
| groundLine | `boolean` | 贴地 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=60a7d7bd-581c-44cb-8b72-12cecd0b2043&projectMarker=PhdNhPHk)

### Parabola

`颜色流动抛物线，与颜色流动线图层相同，线是抛物线而已`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| lineWidth | `number` | 线宽度 |
| speed | `number` | 流动速度 |
| repeat | `number` | 流动特效的个数 |
| baseColor | `string` | 线颜色 |
| floodColor | `string` | 流动特效颜色 |
| bloom | `boolean` | 泛光 |
| curvature | `number` | 线的弯度 |
| splitNum | `number` | 线分段数 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=4bde7f18-f832-4ed5-a278-f1ba901c28a3&projectMarker=PhdNhPHk)

### ImageParabola

`贴图流动抛物线，与颜色流动抛物线图层类似`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| lineWidth | `number` | 线宽度 |
| speed | `number` | 流动速度 |
| repeat | `number` | 贴图重复个数 |
| imgUrl | `string` | 贴图路径 |
| bloom | `boolean` | 泛光 |
| curvature | `number` | 线的弯度 |
| splitNum | `number` | 线分段数 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=2ea49f51-f450-4d55-9941-1238ebae4240&projectMarker=PhdNhPHk)

### ElectricIndustryColorLine

`也是属于颜色流动的抛物线线图层，区别在于改图层的线会有一个偏移量，当两条线数据起点终点一样时，为避免重合，进而进行偏移，多用于电力潮流图的潮流线，存在有多条线会起点终点相同的情况`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| lineWidth | `number` | 线宽度 |
| speed | `number` | 流动速度 |
| repeat | `number` | 流动特效的个数 |
| baseColor | `string` | 线颜色 |
| floodColor | `string` | 流动特效颜色 |
| bloom | `boolean` | 泛光 |
| curvature | `number` | 线的弯度 |
| clutchDistance | `number` | 左右偏移距离 |
| splitNum | `number` | 线分段数 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=17024591-0541-43c9-a746-92b796a22712&projectMarker=PhdNhPHk)

### ElectricIndustryLine

`同上，不同的是该图层的线可以贴图`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| lineWidth | `number` | 线宽度 |
| speed | `number` | 流动速度 |
| repeat | `number` | 流动特效的个数 |
| color | `string` | 线颜色 |
| imgUrl | `string` | 线贴图 |
| bloom | `boolean` | 泛光 |
| curvature | `number` | 线的弯度 |
| clutchDistance | `number` | 左右偏移距离 |
| splitNum | `number` | 线分段数 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=4e69402e-416a-4547-8899-42200b2d9f1c&projectMarker=PhdNhPHk)

## 面图层

### CommonWater

`水面图层，就是做水效果的图层`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| normalMap | `string` | 法线贴图 |
| baseWaterColor | `string` | 水面基础颜色 |
| animationSpeed | `number` | 水流速度 |
| amplitude | `number` | 波浪大小 |
| frequency | `number` | 波浪数 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=701124cd-d688-4d77-b7af-6bc18e6a99fe&projectMarker=PhdNhPHk)

### GridMirrorRect

`方形栅格镜面图层，无需设置数据源，通过提供一个中心点和一个边长创建一个镜面平面`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| color | `string` | 平面颜色 |
| width | `number` | 平面宽度 |
| longitude | `number` | 平面中点经度 |
| latitude | `number` | 平面中点纬度 |
| lineCount | `number` | 网格数量 |
| cellAlpha | `number` | 网格透明度 |
| mirrorDefinition | `number` | 倒影清晰度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=1f9e69af-5aa5-41b1-bf1d-0a0a1d89859c&projectMarker=PhdNhPHk)

### ImagePolygon

`贴图面图层，图元形态为根据多边形的点创建一个可以贴图的面`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| imgUrl | `string` | 贴图地址 |
| alpha | `number` | 透明度 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=31fa5212-3785-4b7b-ac73-2e6342e63f21&projectMarker=PhdNhPHk)

### ImageWall

`贴图墙体图层，图元形态为垂直于地面的墙体，墙体可用贴图纹理，有纹理动画`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| imgUrl | `string` | 贴图地址 |
| speed | `number` | 纹理动画速度 |
| height | `number` | 墙体高度 |
| repeat | `number` | 墙体纹理重复次数 |
| bloom | `boolean` | 泛光 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=579c1f49-ad90-495c-b755-e6f5618d737d&projectMarker=PhdNhPHk)

### WaveRiseWall

`颜色墙体图层，图元形态为一个垂直于地面的墙体，墙体上面自带波浪线条，并且线条会有向上升起的动画`

#### style 样式

| Name | Type | Description |
|:-|:-|:-|
| color | `string` | 墙体颜色 |
| speed | `number` | 动画速度 |
| height | `number` | 墙体高度 |
| repeat | `number` | 墙体纹理重复次数 |
| bloom | `boolean` | 泛光 |
| brightness | `number` | 亮度 |
| condition | `any[]` | `同上` |
[案例地址](https://10.67.24.183/show.html?sid=7ec86c67-b2df-4398-8862-cecd2539329e&projectMarker=PhdNhPHk)
