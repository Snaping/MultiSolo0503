const goTopics = [
    {
        id: 'goroutine-channel',
        title: 'Goroutine 与 Channel',
        icon: 'fa-wind',
        category: 'Concurrency',
        difficulty: 'high',
        frequency: 5,
        summary: 'Goroutine轻量级协程，Channel用于数据传递与同步',
        content: `
            <p><strong>Go 并发模型：</strong></p>
            <p>通过Channel通信来共享内存，而不是通过共享内存来通信</p>
            
            <p><strong>Channel 类型：</strong></p>
            <ul>
                <li>无缓冲Channel - 同步通信</li>
                <li>有缓冲Channel - 异步缓存</li>
            </ul>
        `,
        codeExample: `// Goroutine
func sayHello(name string) {
    fmt.Printf("Hello %s\\n", name)
}

func main() {
    go sayHello("Goroutine") // 启动协程
    fmt.Println("Main goroutine")
    time.Sleep(100 * time.Millisecond)
}

// Channel
func sendData(ch chan<- string) {
    ch <- "Hello from channel"
}

func main() {
    ch := make(chan string, 1) // 缓冲Channel
    go sendData(ch)
    
    val := <-ch
    fmt.Println(val)
}
`,
        animation: 'goroutine'
    },
    {
        id: 'select',
        title: 'Select 多路复用',
        icon: 'fa-sitemap',
        category: 'Concurrency',
        difficulty: 'medium',
        frequency: 4,
        summary: 'select同时监听多个channel操作，类似于switch',
        content: `
            <p><strong>Select 特点：</strong></p>
            <ul>
                <li>监听多个channel的读写</li>
                <li>有多个就绪时随机选择</li>
                <li>default分支在无就绪时立即执行</li>
            </ul>
        `,
        codeExample: `func main() {
    ch1 := make(chan string, 1)
    ch2 := make(chan string, 1)
    
    go func() {
        time.Sleep(50 * time.Millisecond)
        ch1 <- "From channel 1"
    }()
    
    go func() {
        time.Sleep(100 * time.Millisecond)
        ch2 <- "From channel 2"
    }()
    
    select {
    case msg1 := <-ch1:
        fmt.Println("Received:", msg1)
    case msg2 := <-ch2:
        fmt.Println("Received:", msg2)
    case <-time.After(200 * time.Millisecond):
        fmt.Println("Timeout!")
    }
}
`,
        animation: 'select'
    },
    {
        id: 'context',
        title: 'Context 上下文',
        icon: 'fa-random',
        category: 'Concurrency',
        difficulty: 'medium',
        frequency: 4,
        summary: 'Context用于在goroutine间传递请求作用域、取消信号、超时控制',
        content: `
            <p><strong>常用 Context 创建方法：</strong></p>
            <ul>
                <li>context.Background() - 根Context</li>
                <li>context.WithCancel() - 可取消</li>
                <li>context.WithTimeout() - 超时取消</li>
                <li>context.WithDeadline() - 截止时间</li>
            </ul>
        `,
        codeExample: `func doWork(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            fmt.Println("Work cancelled")
            return
        default:
            time.Sleep(100 * time.Millisecond)
            fmt.Println("Working...")
        }
    }
}

func main() {
    ctx, cancel := context.WithTimeout(
        context.Background(),
        500 * time.Millisecond
    )
    defer cancel()
    
    go doWork(ctx)
    
    time.Sleep(1 * time.Second)
}
`,
        animation: 'context'
    },
    {
        id: 'sync-package',
        title: 'Sync 同步原语',
        icon: 'fa-lock',
        category: 'Concurrency',
        difficulty: 'medium',
        frequency: 4,
        summary: 'WaitGroup、Mutex、Once等同步工具',
        content: `
            <p><strong>常用同步原语：</strong></p>
            <ul>
                <li>sync.WaitGroup - 等待协程完成</li>
                <li>sync.Mutex / RWMutex - 互斥锁</li>
                <li>sync.Once - 仅执行一次</li>
            </ul>
        `,
        codeExample: `import (
    "sync"
    "time"
)

func main() {
    var wg sync.WaitGroup
    var mu sync.Mutex
    count := 0
    
    for i := 0; i < 100; i++ {
        wg.Add(1)
        go func() {
            mu.Lock()
            count++
            mu.Unlock()
            wg.Done()
        }()
    }
    
    wg.Wait()
    fmt.Println("Final count:", count)
}
`,
        animation: 'sync'
    },
    {
        id: 'http-server',
        title: '标准库 HTTP Server',
        icon: 'fa-server',
        category: 'Web',
        difficulty: 'medium',
        frequency: 4,
        summary: 'net/http 包实现高性能 HTTP 服务',
        content: `
            <p><strong>核心概念：</strong></p>
            <ul>
                <li>http.Handler 接口 - ServeHTTP</li>
                <li>ServeMux 路由复用器</li>
                <li>中间件链式调用</li>
            </ul>
        `,
        codeExample: `package main

import (
    "fmt"
    "net/http"
)

func hello(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello Go Web!")
}

func main() {
    http.HandleFunc("/", hello)
    http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        fmt.Fprintf(w, "{\"status\":\"ok\"}")
    })
    
    fmt.Println("Server starting on :8080")
    http.ListenAndServe(":8080", nil)
}
`,
        animation: 'http'
    }
];

window.goTopics = goTopics;
