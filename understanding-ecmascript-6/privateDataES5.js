/**
 * @desc: ES5 中创建私有数据的方法
 * @since: 2018年1月21日
 */

var Person = (function () {
  var privateData = {};
  var privateId = 0;

  function Person (name) {
    // 属性描述只提供 value 则该成员不可枚举、不可配置、不可写入
    Object.defineProperty(this, '_id', {value: privateId++});
    privateData[this._id] = {
      name: name
    }
  }

  Person.prototype.getName = function () {
    return privateData[this._id].name;
  }

  return Person;
}());
/**
 * 实际上是通过 IIFE 创建的闭包来保存 privateData
 * 此处的问题是 privateData 中的数据永远不会消失，因为对象的实例被销毁时没有任何方法获知该数据
 */
