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
        var tasks = []
        var threads = new Array(n)
        var locked = false

        function process (task) {
            if (typeof task !== 'function') return;

            tasks.push(task)
            loop()
        }

        function loop () {
            if (locked || tasks.length === 0) {
                return
            }

            var index = indexOfIdle()

            if (index == -1) {
                locked = true;
                return
            }

            threads[index] = true    // 标记为忙碌
            tasks.shift()(release, index)    // 需要task内部主动释放线程: release()

            function release() {
                threads[index] = false
                locked = false

                loop()
            }
        }

        function indexOfIdle () {
            for (var i = 0, l = threads.length; i < l; i++) {
                if (!threads[i]) return i
            }

            return -1
        }

        // public
        this.process = process;
    }

    return Processor
}));