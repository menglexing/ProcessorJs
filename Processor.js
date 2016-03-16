/*!
 * js多线程处理器
 */
(function (global, factory) {
    if (typeof define === 'function') {
        define(factory)
    } else {
        global.Processor = factory()
    }
}(this, function(){

    /**
     * @n {Number} 线程数
     */
    function Processor (n) {
        n = n || 1;

        this.tasks = []
        this.threads = new Array(n)    // true 表示被占用
    }

    Processor.prototype = {
        process: function (task) {
            if (typeof task !== 'function') return;

            this.tasks.push(task)
            this.loop()
        },
        loop: function () {
            if (this.locked || this.tasks.length == 0) {
                return
            }

            var self = this
            var index = this.indexOfIdle()

            if (index == -1) {
                this.locked = true;
                return
            }

            this.threads[index] = true
            this.tasks.shift()(release, index)    // 需要task内部主动释放线程: release()

            function release() {
                self.threads[index] = false
                self.locked = false

                if (self.tasks.length > 0) self.loop()
            }
        },
        indexOfIdle: function () {
            var threads = this.threads

            for (var i = 0, l = threads.length; i < l; i++) {
                if (!threads[i]) return i
            }

            return -1
        }
    }

    return Processor
}));