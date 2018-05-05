const Writable = require('stream').Writable;

const writer = new Writable({
    write (chunk, encoding, callback) {
        // 比 process.nextTick() 稍慢
        // setTimeout(() => {
        //     callback && callback();
        // })
        process.nextTick(() => {
            callback && callback();
        })
    }
});

writeOneMillionTimes(writer, 'simple', 'utf8', () => {
    console.log('end');
})

function writeOneMillionTimes (writer, data, encoding, callback) {
    let i = 10000;
    write();

    function write () {
        let ok = true;
        while (i-- > 0 && ok) {
            // 写入结束时回调
            ok = writer.write(data, encoding, i === 0 ? callback : null);
        }
        if (i > 0) {
            // 当队列释放之后，Writable Stream 会给生产者发送一个 drain 消息，让它恢复生产
            // 提前停下，'drain' 事件触发后才可以继续写入
            console.log('drain', i)
            // writer.once('drain', write)
        }
    }
}
