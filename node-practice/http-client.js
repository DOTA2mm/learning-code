/**
 * 一个简易的 http 客户端
 */
const net = require('net');
const url = require('url');
const dns = require('dns');

async function request (addr, callback) {
  const URL = url.parse(addr);
  let req;
  try {
    req = await connect(URL.hostname, URL.port || 80);
    req.write(setHeaders({URL}));

    let result = await getResult(req);
    console.log(result);
    let [headers, body] = getRes(result);

    callback(null, headers, body);
  } catch (err) {
    callback(err);
  }
}

/**
 * 域名解析 Promise 封装
 * @param {String} host 域名
 */
function lookup (host) {
  return new Promise((resolve, reject) => {
    dns.lookup(host, (err, address, family) => {
      if (err) {
        return reject(err);
      }
      resolve(address);
    });
  });
}

/**
 * 创建连接
 * @param {String} host 域名
 * @param {Number} port 端口
 */
function connect (host, port) {
  return new Promise((resolve) => {
    const req = net.createConnection({host, port}, () => {
      resolve(req);
    });
  });
}

/**
 * 获取请求结果
 * @param {<net.Socket>} req 用于开启连接的新创建的套接字.
 */
function getResult (req) {
  return new Promise((resolve, reject) => {
    const data = [];
    req.on('readable', () => {
      let chunk;
      while ((chunk = req.read()) !== null) {
        data.push(chunk);
      }
      resolve(Buffer.concat(data).toString());
    });
    // req.on('data', (chunk) => {
    //   data.push(chunk);
    // });
    // req.on('end', () => {
    //   resolve(Buffer.concat(data).toString());
    // })
  });
}
/**
 * 解析响应报文
 * @param {String} text 响应报文
 */
function getRes (text) {
  let [head, body] = shiftBy(text, '\r\n\r\n');
  let headers = getHeaders(head.split('\r\n'));
  console.log(head, body);
  return [headers, body];
}
/**
 * 生成请求报文首部
 * @param {Object} opts 首部选项
 */
function setHeaders (opts) {
  let res = [];
  res.push(`GET ${opts.URL.pathname} HTTP/1.1`);
  res.push(`HOST: ${opts.URL.hostname}`);
  res.push('User-Agent: curl/7.51.0; http-client/0.0.0;');
  res.push('Accept: */*');
  res.push('\r\n'); // 首部与主体间的空行
  return res.join('\r\n');
}
/**
 * 格式化请求报文首部
 * @param {Array} lines 报文首部各行
 */
function getHeaders (lines) {
  let headers = {statusCode: 200};
  let firstLine = lines.shift();
  let [proto, statusCode] = firstLine.split(' ') // 首行形如 'HTTP/1.1 200 OK'
  if (statusCode > 0) {
    headers.statusCode = +statusCode;
  } else {
    throw new Error(`Invalid status code: ${lines}`);
  }
  for (let line of lines) {
    let [key, value] = shiftBy(line, ':');
    if (key) headers[key] = value;
  }
  return headers;
}

/**
 * 字符串转换成用分隔符分割的数组
 * @param {String} content 待替换内容
 * @param {String} separator 分隔符
 * @returns {Array}
 */
function shiftBy (content, separator) {
  let i = content.indexOf(separator);
  if (i !== -1) {
    return [content.slice(0, i), content.slice(i + separator.length)];
  }
  return [];
}

module.exports = request;
