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
            var threads = this.threads

            if (index != -1) {
                var task = this.tasks.shift()

                threads[index] = threads[index].pipe(function(i){    // then
                    var defer = $.Deferred()
                    var release = function () {
                        defer.resolve(i)
                    }

                    task(release, i)

                    return defer.promise()
                })
            } 
            else {
                this.locked = true

                for (var i = 0, l = threads.length; i < l; i++) {

                    threads[i] = threads[i].pipe(function(i){    // then
                        if(self.tasks.length > 0) {
                            var defer = $.Deferred()
                            var release = function () {
                                defer.resolve(i)
                                self.locked = false
                                if (self.tasks.length > 0) self.loop()
                            }

                            self.tasks.shift()(release, i)    // 需要task内部主动释放线程: release()

                            return defer.promise()
                        } else {
                            self.locked = false;
                            return i
                        }
                    })

                }
            }
        },
        indexOfIdle: function () {
            var threads = this.threads
            var index = -1

            for (var i = 0, l = threads.length; i < l; i++) {
                if (threads[i].state() == 'resolved') return i
            }

            return index
        }
    }

    return Processor
}));