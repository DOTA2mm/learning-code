/** !
 * Simple promise
 * 简单的 Promise 实现
 * 原作者：https://github.com/Lellansin
 * 文档：https://github.com/ElemeFE/node-practice/blob/master/control/promise/README.md
 * 视频：http://v.youku.com/v_show/id_XMjY4MjM4MjA2MA==.html
 */

'use strict';

const PENDING = Symbol('PENDING'); // 表示（未决）pending 状态
const FULFILLED = Symbol('FULFILLED'); // 表示（已决）fulfilled 状态
const REJECTED = Symbol('REJECTED'); // 表示（拒绝）rejected 状态

function Promisee (fn) {
  if (typeof fn !== 'function') { // 入参类型检测
    throw new Error('resolver should be a function.');
  }

  let state = PENDING; // Promise 内部状态初始化
  let value = null; // Promsie 返回值
  let handler = []; // 一个 promise 实例可以被掉调用多次

  // 状态处理函数
  function fulfill (result) {
    state = FULFILLED;
    value = result;
    handler.forEach(next);
    handler = [];
  }
  function reject (err) {
    state = REJECTED;
    value = err;
    handler.forEach(next);
    handler = [];
  }
  // fulfill 的调用可能会出错，resolve 包一层接 fulfill 的错
  function resolve (result) {
    try {
      // 判断 promise 调用返回的结果是否是一个新的 promise (thenalbel)
      let then = typeof result.then === 'function' ? result.then : null;
      // 如果是promise, 则把 result 绑给 then,再执行这个 promise
      if (then) {
        then.bind(result)(resolve, reject);
        return;
      }
      fulfill(result);
    } catch (err) {
      reject(err);
    }
  }
  function next ({onFulfill, onReject}) {
    switch (state) {
      case FULFILLED:
        onFulfill && onFulfill(value);
        break;
      case REJECTED:
        onReject && onReject(value);
        break;
      case PENDING:
        handler.push({onFulfill, onReject});
    }
  }
  this.then = function (onFulfill, onReject) {
    return new Promisee((resolve, reject) => {
      // next 实际调用要在返回下一个 promise 之后
      next({ // 需要劫持下 外层 onFulfill ，将上一步的调用结果传入
        onFulfill: (val) => {
          try {
            resolve(onFulfill(val));
          } catch (err) {

          }
        },
        onReject: (err) => {
          reject(onReject(err)); // 当前的 onReject
        }
      });
    });
  }
  // 调用传给构造函数的处理函数
  fn(resolve, reject);
}

// #region 测试用例

// 测试用例 1
let p0 = new Promisee((resolve, reject) => {
  // resolve('hello');
  setTimeout(() => resolve('hello'), 1000);
});

p0.then((val) => {
  console.log(val);
  return sleep(1);
}).then((val) => {
  return 'world';
}).then((val) => {
  console.log(val);
  return sleep(1);
}).then((val) => {
  console.log('over');
});

// 测试用例 2
function sleep (sec) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(sec), sec * 1000);
  });
}

// let p1 = new Promisee((resolve, reject) => {
//   resolve('hello ' + Math.random());
// });
// p1.then((val) => {
//   console.log(val);
//   return sleep(1); // 返回一个新的 promise
// }).then(console.log);

// #endregion
