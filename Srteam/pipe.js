const Writable = require('stream').Writable

class MyWritable extends Writable {
    constructor (dataSource, options) {
        // highWaterMark Number write()方法开始返回false时的缓冲级别。默认为16kb，对于objectMode流则是16。
        // decodeStrings Boolean 是否在传递给write()方法前将字符串解码成Buffer。默认为true。
        // objectMode Boolean 是否write(anyObj)为一个合法操作。如果设置为true你可以写入任意数据而不仅是Buffer或字符串数据。可以是任何js对象。
        // 默认为false。当设置为true时，在调用write(data,encoding)时，encoding将会被忽略。
        super(options)
    }
    // 所有的Writable流的实现都必须提供一个_write()方法来给底层资源传输数据
    // _write(chunk, encoding, callback)
    // chunk：被写入的资源
    // encoding：如果数据块是一个字符串，那么这就是编码的类型。如果是一个buffer，那么则会忽略它
    // callback： 当你处理完给定的数据块后调用这个函数。回调函数使用标准的callback(error)模式来表示这个写操作成功或发生了错误。
    _write (chuck, enc, cb) {
        let s = [];
        [].forEach.call(chuck.toString(), (w, i) => {
            s.push(w.toUpperCase())
        });
        console.log(s.join(''));
        cb()
    }
}

const myWS = new MyWritable(null, {decodeStrings: false});

process.stdin.pipe(myWS);
