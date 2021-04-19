/*
 * @Author: your name
 * @Date: 2020-01-22 11:32:13
 * @LastEditTime: 2020-03-18 13:20:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesiumExtension\Source\STC\scene\CommandPrimitive.js
 */


//自定义 指令图元


function CommandPrimitive(command) {
    if(!command)return;
    this.command = command;
}

//========== 对外属性 ==========  
//更新
CommandPrimitive.prototype.update = function (frameState) {
    if(!this.command) {
        return;
    }
    frameState.commandList.push(this.command);
}
// 销毁
CommandPrimitive.prototype.destroy = function () {
    this.command = null;
}
export default CommandPrimitive;



