/*!
 * js多线程处理器
 */
(function (global, factory) {
    if ( typeof define === 'function') {
        define(['jquery'], factory)
    } else {
        global.Processor = factory(jQuery)
    }
}(this, function($){

    /**
     * @n {Number} 线程数
     */
    function Processor (n) {
        n = n || 1;

        this.tasks = []
        this.threads = []

        for (var i = 0; i < n; i++) {
            this.threads[i] = $.Deferred().resolve(i).promise()
        }
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

            var task = this.tasks.shift()

            this.threads[index] = this.threads[index].pipe(function(i){    // then
                var defer = $.Deferred()
                var release = function () {
                    defer.resolve(i)

                    setTimeout(function(){    // 防止release在task内部被同步时导致的不良后果
                        self.locked = false
                        if (self.tasks.length > 0) self.loop()
                    }, 0)
                }

                task(release, i)

                return defer.promise()
            })
        },
        indexOfIdle: function () {
            var threads = this.threads

            for (var i = 0, l = threads.length; i < l; i++) {
                if (threads[i].state() == 'resolved') return i
            }

            return -1
        }
    }

    return Processor
}));
