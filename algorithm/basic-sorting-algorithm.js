// 5种基本排序算法
// 参考链接 http://javascript.ruanyifeng.com/library/sorting.html

/**
 * 冒泡排序算法
 * - 每一次比较都将最大值冒泡到数组的末尾
 * - 外层循环遍历整个数组
 * - 内存循环负责将每一轮中的最大值冒泡到末尾
 * @param {Array} arr 需要排序的数组 
 */
function bubbleSort(arr) {
  let temp
  for (let i = 0, len = arr.length; i < len; i++) {
    for (let j = 0; j < len - i; j++) {
      if (arr[j] > arr[j + 1]) {
        temp = arr[j + 1]
        arr[j + 1] = arr[j]
        arr[j] = temp
      }
    }
  }
  return arr
}

/**
 * 选择排序
 * - 每次找到最小值位置，然后与未排序部份的首位互换
 * @param {Array} arr 需要排序的数组 
 */
function selectionSort(arr) {
  let minPos
  let temp
  for (let i = 0, len = arr.length; i < len; i++) {
    minPos = i // 将当前位置赋值为最小位置
    for (let j = i + 1; j < len; j++) { // 因为每次都将最小值放入顶端，所以内存循环从i+1位置开始
      if (arr[minPos] > arr[j]) minPos = j // 如果遍历到的值比最小位置的还小，则将该位置设为最小位置
    }
    if (minPos !== i) {
      temp = arr[i]
      arr[i] = arr[minPos]
      arr[minPos] = temp
    }
  }
  return arr
}

/**
 * 插入排序
 * 将数组分为已排序、未排序两部分
 * @param {Array} arr 需要排序的数组
 */
function insertionSort(arr) {
  let temp
  let j
  for (let i = 1, len = arr.length; i < len; i++) {
    temp = arr[i] // 当前位置（未排序部门第一个位置）
    /**
     * j = i -1 倒序遍历已排序部门
     * j > -1 如果已排序部分还未遍历结束
     * arr[j] > temp 如果temp比已排序部分当前值小
     * arr[j + 1] = arr[j] 将已排序部分当前元素后移一位，再将前一位与temp比较
     * 将temp插入到已排序部分的适当位置 （每次移动已排序部分都会j--）
     */
    for (j = i -1; j > -1 && arr[j] > temp; j--) {
      arr[j + 1] = arr[j]
    }
    arr[j + 1] = temp
  }
  return arr
}

/**
 * 合并排序
 * @param {Array} arr 需要被排序的数组
 */
function mergeSort(arr) {
  if (arr.length < 2) return arr

  var middle = Math.floor(arr.length / 2)
  var left = arr.slice(0, middle)
  var right = arr.slice(middle)

  // 1. 返回新数组（占用空间）
  // return merge(mergeSort(left), mergeSort(right))
  // 2. 修改原数组 （不多占空间）
  var params = merge(mergeSort(left), mergeSort(right)) // 递归分组合并
  params.unshift(0, arr.length)
  // 将原来arr数组替换为排序后的arr
  arr.splice.apply(arr, params)
  return arr

  /**
   * 按顺序合并两个已排序的数组
   * @param {Array} left 被分成两半的左半边数组
   * @param {Array} right 被分为两半的右半边数组
   */
  function merge(left, right) {
    var result = []
    var il = 0
    var ir = 0
    // 先比较两个数组的第一个元素，将其中较小的push到result
    // 然后将其中较大的一个与另一个数组的第二个元素（push的同时i++）进行比较
    // 再将其中较小的push到result数组，
    // 直到一个数组的所有元素都进入result为止（i < lengt)
    while (il < left.length && ir < right.length) {
      if (left[il] < right[ir]) {
        result.push(left[il++])
      } else {
        result.push(right[ir++])
      }
    }
    // 没有push到result中的一定是更大的，所以直接concat到result后面
    return result.concat(left.slice(il)).concat(right.slice(ir))
  }
}


/**
 * 快速排序
 * - http://javascript.ruanyifeng.com/library/sorting.html#toc12
 * @param {Array} arr 
 * @param {?Number} left 
 * @param {?Number} right 
 */
function quickSort(arr, left, right) {
  if (arr.length < 2) return arr
  // 建立两端的指针
  left = typeof left !== 'number' ? 0 : left
  right = typeof right !== 'number' ? arr.length - 1 : right
  var index = parttion(arr, left, right)
  if (left < index - 1) {
    quickSort(arr, left, index - 1)
  }
  if (index < right) {
    quickSort(arr, index, right)
  }
  return arr

  /**
   * 完成一轮排序
   * - 将所有小于“支点”的值都放在该点的左侧
   * - 大于“支点”的值都放在该点的右侧
   * @param {Array} arr 
   * @param {Number} left 
   * @param {Number} right 
   */
  function parttion(arr, left, right) {
    // 通过给定的左右指针位置确定“支点”(pivot)
    var pivot = arr[Math.floor((right + left) / 2)]
    var i = left
    var j = right
    while (i <= j) {
      // 左侧指针的当前值与“支点”进行比较，如果小于“支点”则指针向后移动一位，否则指针停在原地
      while (arr[i] < pivot) {
        i++
      }
      // 右侧指针的当前值与“支点”进行比较，如果大于“支点”则指针向前移动一位，否则指针停在原地
      while (arr[j] > pivot) {
        j--
      }
      // 左侧指针的位置与右侧指针的位置进行比较，如果前者大于等于后者，则本次排序结束
      // 否则，左侧指针的值与右侧指针的值相交换
      if (i <= j) {
        swap(arr, i, j)
        i++
        j--
      }
    }
    return i
  }

  /**
   * 互换给定数组两个位置的值
   * @param {Array} arr 
   * @param {Number} i 
   * @param {Number} j 
   */
  function swap(arr, i, j) {
    var temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
}
