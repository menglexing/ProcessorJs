# js(伪)多线程处理器

* 使用示例
```javascript
var processor = new Processor(2)

processor.process(function(release, i){
    console.log('thread-'+ i +': taskA-start')

    setTimeout(function(){
        console.log('thread-'+ i +': taskA-end')
        release()    // 释放线程
    }, 5000)
})

processor.process(function(release, i){
    console.log('thread-'+ i +': taskB-start')

    setTimeout(function(){
        console.log('thread-'+ i +': taskB-end')
        release()    // 释放线程
    }, 2000)
})


processor.process(function(release, i){
    console.log('thread-'+ i +': taskC-start')

    setTimeout(function(){
        console.log('thread-'+ i +': taskC-end')
        release()    // 释放线程
    }, 2000)
})

输出:
thread-0: taskA-start
thread-1: taskB-start
thread-1: taskB-end
thread-1: taskC-start
thread-1: taskC-end
thread-0: taskA-end
```