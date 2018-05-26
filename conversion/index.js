'use strict';

const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * 将任意十进制整数转换成指定进制数字符串
 * 功能类似 (int).toString(radix)
 * 基数（进制）需小于等于 62
 * @param {Number} int 待被转换的十进制整数
 * @param {Number} radix 基数（机制）
 */
exports.encode = function (int, radix) {
  if (radix < 2 || radix > 62) {
    return new TypeError('Radix must be large than 1 and less than 62');
  }
  if (int === 0) {
    return CHARSET[0];
  }

  let res = '';
  while (int > 0) {
    res = CHARSET[int % radix] + res;
    int = Math.floor(int / radix);
  }
  return res;
}

/**
 * 将给定字符串解析成指定基数的数字
 * 功能类似 parseInt(str, radix)
 * @param {String} str 待解析成指定基数的字符串
 * @param {Number} radix 基数（进制）
 */
exports.decode = function (str, radix) {
  if (radix < 2 || radix > 62) {
    return new TypeError('Radix must be large than 1 and less than 62');
  }
  let res = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let factor = CHARSET.indexOf(str[len - 1 - i]);
    if (factor === -1) return TypeError('Params has Eroor');
    res += factor * (Math.pow(radix, i));
  }
  return res;
}
