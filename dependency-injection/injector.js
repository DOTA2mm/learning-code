/**
 * 依赖注入
 */

var injector = {
    // 收集依赖
    dependencies: {},
    register: function (key, value) {
        this.dependencies[key] = value;
    },
    resolve: function (deps, func, scope) {
        var i;
        var d;
        scope = scope || {}; // 是否注入作用域
        for (i = 0; i < deps.length, d = deps[i]; i++) {
            if (this.dependencies[d]) {
                scope[d] = this.dependencies[d];
            } else {
                throw new Error('Can\'t resolve ' + d);
            }
        }
        return function () {
            func.apply(scope || {}, Array.prototype.slice.call(arguments));
        }
    }
}

module.exports = injector;
