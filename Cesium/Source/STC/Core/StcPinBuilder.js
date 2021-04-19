/*
 * @Descripttion:
 * @version:
 * @Author: STC
 * @Date: 2020-06-01 10:02:23
 * @LastEditors: STC
 * @LastEditTime: 2020-06-03 10:20:45
 */

import PinBuilder from "../../Core/PinBuilder.js";
import defined from "../../Core/defined.js";
import Resource from "../../Core/Resource.js";
import Color from "../../Core/Color.js";
import writeTextToCanvas from "../../Core/writeTextToCanvas.js";

function StcPinBuilder() {}
StcPinBuilder.prototype = new PinBuilder();

StcPinBuilder.prototype.fromIconAndText = function (
    bgImg,
    imgUrl,
    text,
    textColor,
    size
) {
    return createPin(bgImg, imgUrl, text, textColor, size, this._cache);
};

// var arrowNum = 0.33; // 底部箭头占比
var iconWid = 0.323; // 类型icon占比
var numWid = 0.25; // 文本icon占比

var numTop = 0.12;
var iconTop = 0.448;

var stringifyScratch = new Array(4);
// 背景图， 类型图片， 文字， 文字颜色， 尺寸， 缓存
function createPin(bgImg, url, label, color, size, cache) {
    //Use the parameters as a unique ID for caching.
    stringifyScratch[0] = url;
    stringifyScratch[1] = label;
    stringifyScratch[2] = color;
    stringifyScratch[3] = size;
    var id = JSON.stringify(stringifyScratch);

    var item = cache[id];
    if (defined(item)) {
        return item;
    }

    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    var context2D = canvas.getContext("2d");
    // 绘制广告牌背景
    var img1 = new Image();
    img1.onload = function () {
        context2D.drawImage(img1, 1, 1, size, size);
        if (defined(url)) {
            var resource = Resource.createIfNeeded(url);
            // 绘制类型图片
            var promise = resource.fetchImage().then(function (image) {
                drawType(context2D, image, size);
                if (defined(label)) {
                    // 绘制聚合数量文本
                    var image = writeTextToCanvas(label, {
                        font: "normal 400 " + size + "px sans-serif"
                    });
                    drawNumber(context2D, image, size);
                }
                cache[id] = canvas;
                return canvas;
            });
            cache[id] = promise;
        }
    };
    img1.src = bgImg;
    cache[id] = canvas;
    return canvas;
}

function drawType(context2D, image, size) {
    //Size is the largest image that looks good inside of pin box.
    var imageSize = Math.round(size  * iconWid);
    var sizeX = imageSize;
    var sizeY = imageSize;

    if (image.width > image.height) {
        sizeY = imageSize * (image.height / image.width);
    } else if (image.width < image.height) {
        imageSize -= 4;
        sizeX = imageSize;
        sizeY = imageSize;
        sizeX = imageSize * (image.width / image.height);
    }

    //x and y are the center of the pin box
    // var x = Math.round((size - sizeX) / 2);
    // var y = Math.round((7 / 24) * size - sizeY / 2);
    var x = Math.round((size - sizeX) / 2) + 1;
    var y = Math.round(size * iconTop);

    context2D.drawImage(image, x - 1, y, sizeX, sizeY);
    context2D.drawImage(image, x, y - 1, sizeX, sizeY);
    context2D.drawImage(image, x + 1, y, sizeX, sizeY);
    context2D.drawImage(image, x, y + 1, sizeX, sizeY);
}

function drawNumber(context2D, image, size) {
    //Size is the largest image that looks good inside of pin box.
    var imageSize = Math.round(size  * numWid);
    var sizeX = imageSize;
    var sizeY = imageSize;

    if (image.width > image.height) {
        sizeY = imageSize * (image.height / image.width);
    } else if (image.width < image.height) {
        sizeX = imageSize * (image.width / image.height);
    }

    //x and y are the center of the pin box
    // var x = Math.round((size - sizeX) / 2);
    // var y = Math.round((7 / 24) * size - sizeY / 2);
    var x = Math.round((size - sizeX) / 2) + 1;
    var y = Math.round(size * numTop);

    context2D.drawImage(image, x - 1, y, sizeX, sizeY);
    context2D.drawImage(image, x, y - 1, sizeX, sizeY);
    context2D.drawImage(image, x + 1, y, sizeX, sizeY);
    context2D.drawImage(image, x, y + 1, sizeX, sizeY);
}

export default StcPinBuilder;
