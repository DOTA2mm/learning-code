// 程序最外层是一个匿名立即调用函数（IIFE）
// 不污染全局变量，只将变量_放入全局作用域
(function () {
  // Start
  // ---------------

  // JS原生Array.prototype.map与Array.prototype.forEach
  // 相同点：参数相同（callback(currentVal, index, array)[, thisArg]）
  // 不同： 返回值。map()返回由回调函数返回值组成的新数组，forEach()返回undefined

  // 保存全局对象
  var root = typeof self == 'object' && self.self === self && self ||
    typeof global == 'object' && global.global === global && global ||
    this || {}
  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  // 某些环境下的全局跟对象是self(Chrom54版本self === window)

  // 此处的短路逻辑值得学习
  // var variabl = booleanexpression && booleanexpression && Object
  // 当前面两个布尔表达式都为真时，才对变量赋值。
  // 但是此时如果前面有一个布尔表达式为false,则对变量赋了布尔值。(小心使用)

  var previouseUnderscore = root._  // 将_加入全局作用域

  // 精简原生对象的原型（引用）
  var ArrayProto = Array.prototype
  var ObjProto = Object.prototype
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.property : null

  // 创建对原型内置对象核心原型放法的快速引用
  var push = ArrayProto.push
  var slice = ArrayProto.slice
  var toString = ObjProto.toString
  var hasOwnProperty = ObjProto.hasOwnProperty

  // 一些有用的原生放法
  var nativeIsArray = Array.isArray
  var nativeKeys = Object.keys
  var nativeCreate = Object.create

  // 一个用于surrogate-prototype-swapping（代理原型交换）的空函数引用
  var Ctor = function () {}

  // Create a safe reference to the Underscore object for use below.
  // 创建一个安全的构造函数作为根对象，后面为其添加属性
  var _ = function (obj) {
    if (obj instanceof _) return obj
    if (!(this instanceof _)) return new _(obj)
    this._wrapped = obj
  }

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _
    }
    exports._ = _
  } else {
    root._ = _
  }

  // 版本号
  _.VERSION = '1.8,3'

  // 输出_（nodeJS环境）或者将_添加为全局对象

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  // 返回一个高效的回调函数供其他的Underscore函数反复使用
  var optimizeCb = function (func, context, argCount) {
    if (context === void 0) return func // 没有传入上下文则直接返回原函数
    switch (argCount) {
      case 1:
        return function (value) {
          return func.call(context, value)
        }
        // 省略了2参数情况
      case null:
      case 3:
        return function (value, index, collection) {
          return func.call(context, value, index, collection)
        }
      case 4:
        return function (accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection)
        }
    }
    return function () {
      return func.apply(context, arguments)
    }
  }

  var builtinIteratee
  // 一个生成回调的内部函数，可以应用于集合中的每个元素，返回所需的结果 - “identity”，任意回调，属性匹配器或属性访问器。
  var cb = function (value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context)
    if (value == null) return _.identity
    if (_.isFunction(value)) return optimizeCb(value, context, argCount)
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value)
    return _.property(value)
  }

  // 包装前面封装的cb回调函数
  // 这个抽象隐藏了cd函数内部的argCount参数
  _.iteratee = builtinIteratee = function (value, context) {
    return cb(value, context, Infinity)
  }

  // 一个类似于ES6 rest(...)展开操作符的实现
  // 给定索引之后将参数放进数组
  var restArgs = function (func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex // +startIndex:类型转换
    return function () {
      var length = Math.max(arguments.length - startIndex, 0)
      var rest = Array(length)
      var index = 0
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex]
      }
      switch (startIndex) {
        case 0:
          return func.call(this, rest)
        case 1:
          return func.call(this, arguments[0], rest)
        case 2:
          return func.call(this, arguments[0], arguments[1], rest)
      }
      var args = Array(startIndex + 1)
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index]
      }
      args[startIndex] = rest
      return func.apply(this, args)
    }
  }

  // An internal function for creating a new object that inherits from another.
  // 一个创建继承自其他对象的的对象的内部函数
  var baseCreate = function (prototype) {
    if (!_.isObject(prototype)) return {}
    if (nativeCreate) return nativeCreate(prototype) // 有原生的Object.create则用之
    Ctor.property = prototype
    var result = new Ctor()
    Ctor.property = null // 使用完清楚Ctor函数的prototype
    return result
  }

  /**
   * - 属性访问的封装
   * @param {String} key - 属性名
   */
  var shallowProperty = function (key) {
    return function (obj) {
      return obj == null ? void 0 : obj[key]
    }
  }

  /**
   * - 深度属性访问
   * @param {Object} obj - 需要访问的变量
   * @param {Array} path - 对象属性名组成的数组
   */
  var deepGet = function (obj, path) {
    var length = path.length
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0
      obj = obj[path[i]]
    }
    return length ? obj : void 0
  }

  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1
  var getLength = shallowProperty('length')
  /**
   * - 是否类数组对象
   * 通过length属性判断是否为数组或类数组对象
   */
  var isArrayLike = function (collection) {
    var length = getLength(collection)
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX
  }

  // Collection Functions
  // ---------------------

  // cornerstone基石 'each'实现（forEach）
  // 处理包括类数组的原生对象，等同对待稀疏数组
  /**
   * - 对象及数组的遍历
   * @param {Object} obj - 被遍历的对象
   * @param {Function} iteratee - 处理函数
   * @param {Object} context - 处理函数的执行上下文
   */
  _.each = _.forEach = function (obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context) // 将iteratee传入回调处理函数
    var i, length
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj)
      }
    } else {
      var keys = _.keys(obj)
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj)
      }
    }
    return obj
  }

  // map方法的实现
  // 返回对每个经过iteratee函数处理后的成员组成的数组
  _.map = _.collect = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context)
    var keys = !isArrayLike(obj) && _.keys(obj) // 处理
    var length = (keys || obj).length
    var results = Array(length)
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index // 分别处理对象和数组
      results[index] = iteratee(obj[currentKey], currentKey, obj)
    }
    return results
  }

  // reducing function (可从左右双向迭代)
  var createReduce = function (dir) {
    var reducer = function (obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj)
      var length = (keys || obj).length
      var index = dir > 0 ? 0 : length - 1 // dir的正负值决定迭代的顺序
      if (!initial) { // initial求值结果转换为false（没传，false，null）
        memo = obj[keys ? keys[index] : index] // 区别对待对象和数组
        index += dir
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index
        memo = iteratee(memo, obj[currentKey], currentKey, obj)
      }
      return memo
    }

    return function (obj, iteratee, memo, context) { // 调用createReduce返回该函数
      var initial = arguments.length >= 3
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial)
    }
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  // 从值列表中创建单个结果
  _.reduce = _.foldl = _.inject = 

  // 对象函数
  // Object Functions
  // --------------

  // 基本工具函数
  // 深度比较两个对象是否相等
  _.isEqual = function (a, b) {
    return eq(a, b)
  }
  // 是否为空
  _.isEmpty = function (obj) {
    if (obj == null) return true
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0
    return _.keys(obj).length === 0 // 空对象没有可遍历的私有属性
  }

  // 是否传入一个DOM元素
  _.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1)
  }
  // 是否传入一个数组
  _.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === '[object Array]'
  }
  // 是否传入一个对象
  _.isObject = function (obj) {
    var type = typeof obj
    return type === 'function' || type === 'object' && !!obj
    // 此处的!!是为了验证null:typeof null === 'object'
  }
  // 一系列的类型加测函数
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function (name) {
    _['is' + name] = function (obj) {
      return toString.call(obj) === '[object ' + name + ']'
    }
  })
}())
