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
   * 是否类数组对象
   * - 通过length属性判断是否为数组或类数组对象
   * @param {Array | Object} collection 需要检查长度的对象
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
   * @return {Object | Array} result
   */
  // TODO: 难点 - group函数的功能
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

  // 按数量分组
  _.countBy = group(function (result, value, key) {
    if (_.has(result, key)) result[key]++
    else result[key] = 1
  })

  // 将集合一分为二：一部分都满足条件，另一部分都不满足
  _.partition = group(function (result, value, pass) {
    result[pass ? 0 : 1].push(value)
  }, true) // 传了第二个参数，返回result为一个二维数组

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g
  // 将可迭代对象安全转换为数组
  _.toArray = function (obj) {
    if (!obj) return []
    if (_.isArray(obj)) return slice.call(obj)
    if (_.isString(obj)) {
      // Keep surrogate pair characters together ?
      return obj.match(reStrSymbol)
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity)
    return _.values(obj)
  }

  // 返回对象中元素的个数
  _.size = function (obj) {
    if (obj == null) return 0
    return isArrayLike(obj) ? obj.length : _.keys(obj).length
  }

  // 数组处理函数库
  // Array Functions
  // --------------

  /**
   * first, initial, last, rest 一组取数组开头、结尾相应位数的方法
   * 也适用于类数组对象
   * 函数功能单一化，无副作用（slice
   */
  // 取数组第一位或开头n位
  _.first = _.head = _.take = function (array, n, guard) {
    if (array == null || array.length < 1) return void 0
    if (n == null || guard) return array[0]
    return _.initial(array, array.length - n)
  }

  // 取数组的第前n个元素
  _.initial = function (array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)))
  }

  // 取数组元素最后一位或多位
  _.last = function (array, n, guard) {
    if (array == null || array.length < 1) return void 0
    if (n == null || guard) return array[array.length - 1]
    return _.rest(array, Math.max(0, array.length - n))
  }

  // 取数组后n位
  _.rest = _.tail = _.drop = function (array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n)
  }

  // 剔除数组中转换类型后为false的值
  // 即过滤数组中的 false, null, 0, "", undefined, NaN
  _.compact = function (array) {
    // 这里用Boolean构造函数作为filter的回调，显式转换为布尔类型
    return _.filter(array, Boolean)
  }

  /**
   * 内部的数组扁平化函数
   * @param {Array} input 需要扁平化的数组或类数组对象
   * @param {Boolean} shallow 是否深度展开（是否递归）
   * @param {Boolean} strict 是否接受Object作为处理对象
   * @param {Array?} output 输出形式，可接受初始值
   */
  var flatten = function (input, shallow, strict, output) {
    console.log(shallow)
    output = output || []
    var idx = output.length
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i]
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        if (shallow) {
          var j = 0
          var len = value.length
          while (j < len) output[idx++] = value[j++]
        } else {
          flatten(value, shallow, strict, output)
          idx = output.length
        }
      } else if (!strict) {
        output[idx++] = value
      }
    }
    return output
  }

  // 扁平化任何嵌套深度的数组
  _.flatten = function (array, shallow) {
    return flatten(array, shallow, false)
  }

  // 返回数组的副本，并删除所有值的实例。
  _.without = restArgs(function (array, otherArrays) {
    return _.difference(array, otherArrays)
  })

  // 生成数组的无重复版本。如果数组已经排序，可以选择更快的算法
  // TODO: 去重
  _.uniq = _.unique = function (array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) { // 调整参数位置
      context = iteratee
      iteratee = isSorted
      isSorted = false
    }
    if (iteratee != null) iteratee = cb(iteratee, context)
    var result = []
    var seen = []
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i]
      var computed = iteratee ? iteratee(value, i, array) : value
      if (isSorted) {
        if (!i || seen !== computed) result.push(value)
        seen = computed
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed)
          result.push(value)
        }
      } else if (!_.contains(result, value)) {
        result.push(value)
      }
    }
    return result
  }

 // 计算传入数组的并集：按顺序列出的一个或多个数组中的唯一项目列表。
  _.union = restArgs(function (array) {
    return _.uniq(flatten(array, true, true))
  })

  // 计算作为所有数组的交集的值列表。结果中的每个值都存在于每个数组中。
  // 接受多个数组作为参数
  _.intersection = function (array) {
    // 形参array是传入数组的第一个
    var result = []
    var argsLength = arguments.length // 参数（要比较的数组）的个数
    for (var i = 1, length = getLength(array); i < length; i++) {
      var item = array[i]
      if (_.contains(result, item)) continue
      var j
      for (j = 1; j < argsLength; j++) {
        // 内存循环判断后续数组中是否包含array中的元素
        if (!_.contains(arguments[j], item)) break
      }
      // 已经确认过取到的array中的元素不存在与后续所有的数组中
      if (j === argsLength) result.push(item)
    }
    return result
  }

  // 类似于_.without,返回的是array排除与后续数组中存在的相同元素的结果
  _.difference = restArgs(function (array, rest) {
    rest = flatten(rest, true, true)
    return _.filter(array, function (value) {
      return !_.contains(rest, value)
    })
  })

  _.unzip = function (array) {
    var length = array && _.max(array, getLength).length || 0
    var result = Array(length)

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index)
    }
    return result
  }

  _.zip = restArgs(_.unzip)

  // 将数组转换成相应的对象
  // values参数可选，给了则将list中元素作为key,values元素作为value
  _.object = function (list, values) {
    var result = {}
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i]
      } else {
        result[list[i][0]] = list[i][1]
      }
    }
    return result
  }

  /**
   * 创建正向或反向查找index的函数
   * @param {Number} dir 确定是否正向(dir > 0: 正向)
   */
  var createPredicateIndexFinder = function (dir) {
    return function (array, predicate, context) {
      predicate = cb(predicate, context)
      var length = getLength(array)
      var index = dir > 0 ? 0 : length - 1 // 确定是否正向
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index
      }
    }
  }

  // 返回通过谓词测试的数组上的第一个索引
  _.findIndex = createPredicateIndexFinder(1)
  _.findLastIndex = createPredicateIndexFinder(-1)

  // 使用比较函数来计算应该插入一个对象的最小索引，以保持顺序
  _.sortedIndex = function (array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1)
    var value = iteratee(obj)
    var low = 0
    var high = getLength(array)
    while (low < high) {
      var mid = Math.floor((low + high) / 2)
      // 二分法确定位置
      if (iteratee(array[mid]) < value) low = mid + 1
      else high = mid
    }
    return low
  }

  /**
   * 生成函数来创建 indexof 和 lastIndexOf 函数
   * @param {Number} dir 查找方向（正向 or 反向）
   * @param {Function} predicateFind 查找范围
   * @param {Function} sortedIndex 排序索引
   */
  var createIndexFinder = function (dir, predicateFind, sortedIndex) {
    return function (array, item, idx) {
      var i = 0
      var length = getLength(array)
      if (typeof idx === 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i)
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item)
        return array[idx] === item ? idx : -1
      }
      if (item !== item) { // eslint-disable-line
        idx = predicateFind(slice.call(array, i, length), _.isNaN)
        return idx >= 0 ? idx + i : -1
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx
      }
      return -1
    }
  }

  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex)
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex)

  // 根据给出的起始，末尾，步进值生成相应数组
  _.range = function (start, stop, step) {
    if (stop == null) {
      stop = start || 0
      start = 0
    }
    if (!step) {
      step = stop < start ? -1 : 1
    }
    var length = Math.max(Math.ceil((stop - start) / step), 0)
    var range = Array(length)
    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start
    }
    return range
  }

  // 数组按给定长度分块
  _.chunk = function (array, count) {
    if (count == null || count < 1) return []
    var result = []
    var i = 0
    var length = array.length
    while (i < length) {
      result.push(slice.call(array, i, i += count))
    }
    return result
  }

  // Function Functions
  // --------------

  /**
   * 确定是否使用提供的参数作为构造函数或普通函数执行函数
   * @param {Function} sourceFunc
   * @param {Function} boundFunc
   * @param {Object} context
   * @param {Object} callingContext
   * @param {*} args
   */
  var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args)
    var self = baseCreate(sourceFunc.property)
    var result = sourceFunc.apply(self, args)
    if (_.isObject(result)) return result
    return self
  }

  _.bind = restArgs(function (func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function')
    var bound = restArgs(function (callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs))
    })
    return bound
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

  // 实用功能 （Utility Functions）
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

  // 属性访问
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

  // 沿着path遍历obj,如果子成员是一个Function则返回调用结果，否则返回该成员
  // 没找到path对应的成员则用obj直接调用fallback
  _.result = function (obj, path, fallback) {
    if (!_.isArray(path)) path = [path] // 使其可以被迭代
    var length = path.length
    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback
    }
    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]]
      if (prop === void 0) {
        prop = fallback // 没找到path对应的成员
        i = length
      }
      obj = _.isFunction(prop) ? prop.call(obj) : prop
    }
    return obj
  }

  // 生成唯一的ID（在当前客户端回话中唯一）
  var idCounter = 0
  _.uniqueId = function (prefix) {
    var id = ++idCounter + ''
    return prefix ? prefix + id : id
  }

  // 模板分隔符设置
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/
  }

  // 使用自定义模板分隔符时，需要保证不与上面三种匹配
  var noMatch = /(.)^/

  // 某些字符需要转义，以便它们可以放入字符串文字。
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  }

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2089/g

  var escapeChar = function (match) {
    return '\\' + escapes[match]
  }

  // JavaScript微模板
  // TODO: 难点 - 模板引擎
  _.template = function (text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings
    settings = _.default({}, settings, _.templateSettings)

    // 通过交替将分隔符合并为一个正则表达式。
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g')

    // 编译模板源，适当转义字符串文字
    var index = 0
    var source = "__p+='"
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar)
      index = offset + match.length

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'"
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n"
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='"
      }

      return match
    })
    source += "';\n"

    // 如果没有指定变量，将数据值放在本地作用域中
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n'

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n'

    var render
    try {
      render = new Function(settings.variable || 'obj', '_', source) // eslint-disable-line
    } catch (e) {
      e.source = source
      throw e
    }

    var template = function (data) {
      return render.call(this, data, _)
    }

    // 提供编译源以方便预编译。
    var argument = settings.variable || 'obj'
    template.source = 'function(' + argument + '){\n' + source + '}'

    return template
  }

  // 添加一个“链函数”,开始连接被包装的Underscore对象
  _.chain = function (obj) {
    var instance = _(obj)
    instance._chain = true
    return instance
  }
}())
