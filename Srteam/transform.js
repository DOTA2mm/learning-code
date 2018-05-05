const Transform = require('stream').Transform;

const MAP = {
    One: '一',
    Two: '二'
}

class Translate extends Transform {
    constructor (dataSource, options) {
        super(options);
    }
    // 重写 Transform 内部方法
    _transform (buf, enc, next) {
        const key = buf.toString();
        const data = MAP[key];
        this.push(data);
        next();
    }
}

const transform = new Translate();
transform.on('data', data => console.log(data.toString()));
transform.write('One');
transform.write('Two');
transform.end();
