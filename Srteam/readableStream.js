const {Readable} = require('stream');

class MyReadable extends Readable {
    constructor (dataSource, options) {
        super(options);
        this.dataSource = dataSource;
    }
    // 继承了 Readable 的类必须实现 _read 方法，触发底层对流的读取
    _read () {
        const data = this.dataSource.makeData();
        // 内部需要调用 push 将数据放入缓冲池
        this.push(data);
    }
}

// 模拟资源池
const dataSource = {
    data: new Array(10).fill('-'),
    makeData () {
        if (!this.data.length) return null;
        return this.data.pop();
    }
}

const myReadable = new MyReadable(dataSource);
myReadable.setEncoding('utf8');

// 监听 data 事件自动触发流动模式
// myReadable.on('data', chunk => {
//     console.log('buffer size: ', myReadable._readableState.buffer.length);
//     console.log(chunk);
// });

// 监听 readable 事件后，进入暂停模式
myReadable.on('readable', () => {
    // 为 'readable' 事件添加回调将会导致一些数据被读取到内部缓存中，但并不会传递内容
    // 需要主动调用 .read([size]) 函数才会从缓存池取出
    let chunk;
    while ((chunk = myReadable.read(2)) !== null) {
        console.log(`Received ${chunk.length} bytes of data.`);
    }
});
