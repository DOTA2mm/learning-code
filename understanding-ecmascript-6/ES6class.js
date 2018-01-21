/**
 * @desc: ES6 中的类及其模拟实现
 * @since: 2018年1月21日
 */

 /**
  * ES6 中的类
  */
class PersonClass {
  constructor(name) {
    this.name = name;
  }
  sayName() {
    console.log(this.name);
  }
}

let person = new PersonClass('Chuck');
person.sayName(); // 'Chuck'

/**
 * 按照类的特性，模拟 Class 实现
 */
// Class 没有声明提前，故使用 let
let PersonType = (function () {
  // 类声明中的所有代码会自动运行并锁定在严格模式下
  'use strict';
  // 类名不能在类的方法内被重写
  const PersonType = function (name) {
    // 调用类构造器时不使用 new ，会抛出错误
    if (typeof new.target === 'undefined') {
      throw new Error('Constructor must be called with new.');
    }

    this.name = name;
  }
  // 类的所有方法都是不可枚举的
  Object.defineProperty(PersonType.prototype, 'sayName', {
    value: function () {
      // 类的所有方法内部都没有 [[Construct]] ，因此使用 new 来调用它们会抛出错误
      if (typeof new.target !== 'undefined') {
        throw new Error('Method cannot be called with new.');
      }
      console.log(this.name);
    },
    enumerable: false,
    writable: true,
    configurable: true
  });

  return PersonType;
}());

let person2 = new PersonType('Chuck');
person2.sayName(); // 'Chuck'
console.log(person2 instanceof PersonType); // true
