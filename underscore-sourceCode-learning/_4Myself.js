// 程序最外层是一个匿名立即调用函数（IIFE）
// 不污染全局变量，只将变量_放入全局作用域
(function () {
  // Start
  // ---------------

  // JS原生Array.prototype.map与Array.prototype.forEach
  // 相同点：参数相同（callback(currentVal, index, array)[, thisArg]）
  // 不同： 返回值。map()返回由回调函数返回值组成的新数组，forEach()返回undefined

  // 保存全局对象
  var root = typeof self === 'object' && self.self === self && self ||
    typeof global === 'object' && global.global === global && global ||
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
  if (typeof exports !== 'undefined' && !exports.nodeType) {
    if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
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
  /**
   * @param {Function} func
   * @param {Number} startIndex
   */
  var restArgs = function (func, startIndex) { // func.length - func参数的个数
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
    return typeof length === 'number' && length >= 0 && length <= MAX_ARRAY_INDEX
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
    var keys = !isArrayLike(obj) && _.keys(obj) // 处理对象
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
      var keys = !isArrayLike(obj) && _.keys(obj) // 处理对象
      var length = (keys || obj).length
      var index = dir > 0 ? 0 : length - 1 // dir的正负值决定迭代的顺序
      if (!initial) { // initial求值结果转换为false（没传，false，null）
        memo = obj[keys ? keys[index] : index] // 区别对待对象和数组
        index += dir // 从第二项开始迭代
      }
      for (; index >= 0 && index < length; index += dir) { // 巧妙使用dir作为迭代变量递增值
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
  // 从值列表中创建单个结果 (别名：左折叠)
  _.reduce = _.foldl = _.inject = createReduce(1)

  // 从右向左缩容 (别名：右折叠)
  _.reduceRight = _.foldr = createReduce(-1)

  // 返回通过真值测试的第一个值
  _.find = _.detect = function (obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey
    var key = keyFinder(obj, predicate, context)
    if (key !== void 0 && key !== -1) return obj[key]
  }

  // 返回通过真值测试的所有元素
  _.filter = _.select = function (obj, predicate, context) {
    var results = []
    predicate = cb(predicate, context)
    _.each(obj, function (value, index, list) {
      if (predicate(value, index, list)) results.push(value)
    })
    return results
  }

  // 返回所有没有通过真值测试的元素
  _.reject = function (obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context)
  }

  // every - 验证所有项是否都通过真值测试
  _.every = _.all = function (obj, predicate, context) {
    predicate = cb(predicate, context)
    var keys = !isArrayLike(obj) && _.keys(obj)
    var length = (keys || obj).length
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index
      if (!predicate(obj[currentKey], currentKey, obj)) return false
    }
    return true
  }

  // some - 验证至少有一项通过真值测试
  _.some = _.any = function (obj, predicate, context) {
    predicate = cb(predicate, context)
    var keys = !isArrayLike(obj) && _.keys(obj)
    var length = (keys || obj).length
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index
      if (predicate(obj[currentKey], currentKey, obj)) return true
    }
    return false
  }

  // 判断对象或数组中是否存在给定项
  _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj)
    if (typeof fromIndex !== 'number' || guard) fromIndex = 0
    return _.indexOf(obj, item, fromIndex) >= 0
  }

  // 带参调用集合中每一项的方法
  _.invoke = restArgs(function (obj, path, args) {
    var contextPath
    var func
    if (_.isFunction(path)) {
      func = path
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1)
      path = path[path.length - 1]
    }
    return _.map(obj, function (context) {
      var method = func
      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath)
        }
        if (context == null) return void 0
        method = context[path]
      }
      return method == null ? method : method.apply(context, args)
    })
  })

  // “map”的常用用例的便利版本：获取属性。
  _.pluck = function (obj, key) {
    return _.map(obj, _.property(key))
  }

  // “filter”的常见用例的便利版本：只选择对象
  // 包含特定的“key：value”对。
  _.where = function (obj, attrs) {
    return _.filter(obj, _.matcher(attrs))
  }

  // “find”的常见用例的便利版本：获取第一个对象
  // 包含特定的“key：value”对。
  _.findWhear = function (obj, attrs) {
    return _.find(obj, _.matcher(attrs))
  }

  // 返回最大元素（或基于元素的计算）
  _.max = function (obj, iteratee, context) {
    var result = -Infinity
    var lastComputed = -Infinity
    var value, computed
    if (iteratee == null || (typeof iteratee === 'number' && typeof obj[0] !== 'object') && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj)
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i]
        if (value != null && value > result) {
          result = value
        }
      }
    } else {
      iteratee = cb(iteratee, context)
      _.each(obj, function (v, index, list) {
        computed = iteratee(v, index, list)
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v
          lastComputed = computed
        }
      })
    }
    return result
  }

  // 返回最小元素（或基于元素的计算）
  _.min = function (obj, iteratee, context) {
    var result = Infinity
    var lastComputed = Infinity
    var value, computed
    if (iteratee == null || obj != null && (typeof iteratee === 'number' && typeof obj[0] !== 'object')) {
      obj = isArrayLike(obj) ? obj : _.values(obj)
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i]
        if (value != null && value < result) {
          result = value
        }
      }
    } else {
      iteratee = cb(iteratee, context)
      _.each(obj, function (v, index, list) {
        computed = iteratee(v, index, list)
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v
          lastComputed = computed
        }
      })
    }
    return result
  }

  // 将一个集合洗牌
  _.stuffle = function (obj) {
    return _.sample(obj, Infinity)
  }

  // 从一个集合中抽出n个样品，使用符合现代Fisher-Yates shuffle（费雪耶茨洗牌算法）
  // 如果没有指定n,则随机单独一个元素
  // 参数 guard 来确定是否使用 map
  _.sample = function (obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj)
      return obj[_.random(obj.length - 1)]
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj)
    var length = getLength(sample)
    n = Math.max(Math.min(n, length), 0)
    var last = length - 1
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last)
      var temp = sample[index]
      sample[index] = sample[rand]
      sample[rand] = temp
    }
    return sample.slice(0, n)
  }

  // 按照迭代器生成的标准对对象的值进行排序
  _.sortBy = function (obj, iteratee, context) {
    var index = 0
    iteratee = cb(iteratee, context)
    return _.pluck(_.map(obj, function (value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      }
    }).sort(function (left, right) {
      var a = left.criteria
      var b = right.criteria
      if (a !== b) {
        if (a > b || a === void 0) return 1
        if (a < b || b === void 0) return -1
      }
      return left.index - right.index
    }), 'value')
  }

  /**
   * - 用于聚合“分组”操作的内部函数
   * @param {Function} behavior - 聚合规则
   * @param partiton 返回结果集形式
   */
  var group = function (behavior, partiton) {
    return function (obj, iteratee, context) {
      var result = partiton ? [[], []] : {}
      iteratee = cb(iteratee, context)
      _.each(obj, function (value, index) {
        var key = iteratee(value, index, obj)
        behavior(result, value, key)
      })
      return result
    }
  }

  // 按标准对对象的值进行分组。 传递字符串属性分组，或返回标准的函数。
  _.groupBy = group(function (result, value, key) {
    if (_.has(result, key)) result[key].push(value)
    else result[key] = value
  })

  // 按指定key进行分组
  _.indexBy = group(function (result, value, key) {
    result[key] = value
  })

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

  // 实用功能 （Unility Functions）
  // ------------------

  // 放弃Underscore 的控制变量"_"。返回Underscore 对象的引用。
  _.noConflict = function () {
    root._ = previouseUnderscore
    return this
  }

  // 返回与传入参数相等的值，作为默认的迭代器iteratee
  _.identity = function (value) {
    return value
  }

  // 生成一个返回出入参数的函数，通常在Underscore外部使用
  _.constant = function (value) {
    return function () {
      return value
    }
  }

  // 空函数
  _.noop = function () {}

  // 属相访问
  _.property = function (path) {
    if (!_.isArray(path)) {
      return shallowProperty(path)
    }
    return function (obj) {
      return deepGet(obj, path)
    }
  }

  // 生成一个为给定对象查找属性的函数
  _.propertyOf = function (obj) {
    if (obj == null) {
      return function () {}
    }
    return function (path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path)
    }
  }

  // 返回用于验证给定键值对集合的函数
  _.matcher = _.matches = function (attrs) {
    attrs = _.extendOwn({}, attrs)
    return function (obj) {
      return _.isMatch(obj, attrs)
    }
  }


  // 调用迭代函数 n 次,将每次的index传入迭代函数，生成返回值数组
  _.times = function (n, iteratee, context) {
    var accum = Array(Math.min(0, n))
    iteratee = optimizeCb(iteratee, context, 1)
    for (var i = 0; i < n; i++) accum[i] = iteratee(i)
    return accum
  }

  // 返回一个给定最大值与最小值之间的随机整数
  _.random = function (min, max) {
    if (max == null) {
      max = min
      min = 0
    }
    return min + Math.floor(Math.random() * (max - min + 1))
  }

  // 当前时间的毫秒数
  _.now = Date.now || function () {
    return new Date().getTime()
  }

  // 用于转义的HTML实体列表。
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  }
  var unescapeMap = _.invert(escapeMap)

  // 转义HTML标签的函数
  var createEscaper = function (map) {
    var escaper = function (match) {
      return map[match]
    }
    var source = '(?:' + _.keys(map).join('|') + ')'
    var testRegexp = RegExp(source)
    var replaceRegexp = RegExp(source, 'g')
    return function (string) {
      string = string == null ? '' : '' + string
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string
    }
  }
  _.escape = createEscaper(escapeMap)
  _.unescape = createEscaper(unescapeMap)
}())
