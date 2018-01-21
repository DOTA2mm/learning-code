/**
 * @desc: ES6 中创建私有数据的方法
 * @since: 2018年1月21日
 */
let Person = (function () {
  let privateData = new WeakMap();

  function Person (name) {
    // 换成由 WeakMap 类型来保存私有数据
    privateData.set(this, {name: name});
  }

  Person.prototype.getName = function () {
    return privateData.get(this).name;
  }

  return Person;
}());
/**
 * IIFE 创建的闭包中保存的 WeakMap 的实例 privateData
 * 使得 Person 实例被销毁时，privateData 作为对 Person 实例最后的引用，也随之销毁
 * 完美解决 ES5 中使用 对象保存私有数据带来的内存不被回收的问题
 */
