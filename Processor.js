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

        while (n--) {
            this.threads[n] = $.Deferred().resolve(n).promise()
        }
    }

    Processor.prototype = {
        process: function (task) {
            var self = this;

            task = typeof task === 'function' ? task : function () {};

            this.tasks.push(task)
            this.loop()
        },
        loop: function () {
            var self = this

            for (var i = 0, l = this.threads.length; i < l; i++) {
                var thread = this.threads[i]

                this.threads[i] = thread.then(function(i){
                    if(self.tasks.length > 0) {
                        var defer = $.Deferred()
                        var release = function () {
                            defer.resolve(i)
                        }

                        self.tasks.shift()(release, i) // 需要task内部主动释放线程: release()

                        return defer.promise()
                    } else {
                        return i
                    }
                })
            }
        }
    }

    return Processor
}));