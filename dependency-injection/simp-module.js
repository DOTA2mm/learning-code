/**
 * @desc: 简单的模块机制实现依赖注入
 */

const MyModules = (function Manager() {
    const modules = {}

    /**
     * 定义一个新模块
     * @param {String} name 模块名称
     * @param {String[]} deps 模块的依赖项
     * @param {Function} impl 模块的具体实现
     */
    function define (name, deps, impl) {
        for (let i = 0; i < deps.length; i++) {
            deps[i] = modules[deps[i]]
        }
        // 将模块暴露的接口集合存在私有变量 modules 中
        modules[name] = impl.apply(impl, deps)
    }

    /**
     * 根据名称获取模块
     * @param {String} name 模块名称
     */
    function get (name) {
        return modules[name]
    }

    return {
        define,
        get
    }
})()

// usage
MyModules.define('bar', [], function () {
    function hello (who) {
        return 'Let me introduction: ' + who
    }

    return {
        hello
    }
})

MyModules.define('foo', ['bar'], function (bar) {
    function awesome (who) {
        console.log(bar.hello(who).toUpperCase())
    }

    return {
        awesome
    }
})

const bar = MyModules.get('bar')
const foo = MyModules.get('foo')

console.log(bar.hello('Chuck'))
foo.awesome('Chuck')
