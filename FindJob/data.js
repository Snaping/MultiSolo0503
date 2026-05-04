const interviewData = [
    {
        category: "JavaScript",
        icon: "fa-brands fa-js-square",
        color: "#f7df1e",
        topics: [
            {
                id: "js-exec-context",
                title: "执行上下文与作用域",
                importance: "high",
                frequency: 5,
                summary: "执行上下文是JavaScript引擎执行代码时的运行环境，作用域决定变量访问范围",
                content: `
                    <p><strong>执行上下文类型</strong>：全局上下文、函数上下文、Eval上下文</p>
                    <p><strong>执行上下文包含</strong>：变量对象、作用域链、this绑定</p>
                    <p><strong>作用域类型</strong>：全局、函数、块级、词法作用域</p>
                `,
                codeExample: `// 全局上下文
let global = 'global';

function outer() {
    let outerVar = 'outer';
    function inner() {
        let innerVar = 'inner';
        console.log(global, outerVar, innerVar);
    }
    inner();
}

outer();

// 块级作用域
if (true) {
    let block = 'block';
    const constant = 'constant';
}`,
                animation: "scope-demo"
            },
            {
                id: "js-closure-prototype",
                title: "闭包与原型链",
                importance: "high",
                frequency: 5,
                summary: "闭包是能访问其词法作用域的函数，原型链是实现继承的核心机制",
                content: `
                    <p><strong>闭包特点</strong>：函数嵌套、引用外部变量、延长作用域寿命</p>
                    <p><strong>原型链查找</strong>：对象 -> prototype -> Object.prototype -> null</p>
                `,
                codeExample: `// 闭包-计数器
function counter() {
    let count = 0;
    return {
        increment() { count++; return count; },
        decrement() { count--; return count; }
    };
}

const c = counter();
c.increment(); // 1

// 原型链继承
function Person(name) { this.name = name; }
Person.prototype.greet = function() { return 'Hi ' + this.name; };

function Student(name, grade) {
    Person.call(this, name);
    this.grade = grade;
}
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;`,
                animation: "closure-prototype-demo"
            },
            {
                id: "js-async-event-loop",
                title: "异步与事件循环",
                importance: "high",
                frequency: 5,
                summary: "事件循环机制使单线程的JavaScript能高效处理异步操作",
                content: `
                    <p><strong>事件循环流程</strong>：执行同步代码 -> 清空微任务队列 -> 取出宏任务执行 -> 重复</p>
                    <p><strong>微任务</strong>：Promise.then/catch/finally、async/await</p>
                    <p><strong>宏任务</strong>：setTimeout/setInterval、I/O、事件回调</p>
                `,
                codeExample: `// 事件循环执行顺序
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve()
    .then(() => console.log('3'))
    .then(() => console.log('4'));
console.log('5');

// 输出: 1 -> 5 -> 3 -> 4 -> 2`,
                animation: "event-loop-demo"
            }
        ]
    },
    {
        category: "TypeScript",
        icon: "fa-brands fa-ts",
        color: "#3178c6",
        topics: [
            {
                id: "ts-basic-types",
                title: "基础类型与类型注解",
                importance: "high",
                frequency: 5,
                summary: "TypeScript基础类型系统，是类型安全的基石",
                content: `
                    <p><strong>基础类型</strong>：string、number、boolean、null、undefined、symbol、bigint</p>
                    <p><strong>高级类型</strong>：数组、对象、函数、元组、枚举、any、unknown、never、void</p>
                `,
                codeExample: `// 基础类型
let name: string = 'Alice';
let age: number = 25;
let isActive: boolean = true;

// 数组类型
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ['a', 'b'];

// 类型别名
type User = {
    name: string;
    age?: number; // 可选属性
    readonly id: string; // 只读
};

// 接口
interface Product {
    name: string;
    price: number;
    [key: string]: any;
}`,
                animation: "ts-types-demo"
            },
            {
                id: "ts-advanced-types",
                title: "高级类型与工具类型",
                importance: "high",
                frequency: 5,
                summary: "TypeScript高级类型系统，包括泛型、条件类型、工具类型等",
                content: `
                    <p><strong>泛型</strong>：类型参数化，提高代码复用性</p>
                    <p><strong>工具类型</strong>：Partial、Required、Readonly、Pick、Omit、Record、Exclude、Extract</p>
                `,
                codeExample: `// 泛型函数
function identity<T>(arg: T): T {
    return arg;
}
const num = identity<number>(123);
const str = identity('hello'); // 类型推断

// 工具类型
interface User {
    id: string;
    name: string;
    age: number;
}

type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type NameOnly = Pick<User, 'name'>;
type WithoutAge = Omit<User, 'age'>;`,
                animation: "ts-advanced-demo"
            }
        ]
    },
    {
        category: "Java",
        icon: "fa-brands fa-java",
        color: "#f89820",
        topics: [
            {
                id: "java-basics",
                title: "Java基础与面向对象",
                importance: "high",
                frequency: 5,
                summary: "Java语言基础、面向对象特性、核心概念",
                content: `
                    <p><strong>Java特性</strong>：跨平台、强类型、自动内存管理</p>
                    <p><strong>面向对象</strong>：封装、继承、多态、抽象</p>
                `,
                codeExample: `// 类与对象
public class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

// 继承
public class Student extends Person {
    private String school;
    public Student(String name, int age, String school) {
        super(name, age);
        this.school = school;
    }
}`,
                animation: "java-oop-demo"
            },
            {
                id: "java-collections",
                title: "集合框架与泛型",
                importance: "high",
                frequency: 5,
                summary: "Java集合框架是面试高频知识点，包括List、Set、Map等",
                content: `
                    <p><strong>Collection接口</strong>：List（ArrayList、LinkedList）、Set（HashSet、TreeSet）</p>
                    <p><strong>Map接口</strong>：HashMap、TreeMap、ConcurrentHashMap</p>
                `,
                codeExample: `// List
List<String> list = new ArrayList<>();
list.add("a");
list.add("b");

// Map
Map<String, Integer> map = new HashMap<>();
map.put("one", 1);
map.put("two", 2);

// 泛型类
public class Box<T> {
    private T value;
    public T get() { return value; }
    public void set(T value) { this.value = value; }
}`,
                animation: "java-collection-demo"
            },
            {
                id: "java-concurrency",
                title: "并发编程与线程池",
                importance: "high",
                frequency: 5,
                summary: "Java并发编程核心：线程、锁、线程池、并发工具类",
                content: `
                    <p><strong>线程创建</strong>：继承Thread、实现Runnable、Callable+Future</p>
                    <p><strong>锁机制</strong>：synchronized、ReentrantLock、volatile</p>
                    <p><strong>线程池</strong>：ThreadPoolExecutor、Executors工具类</p>
                `,
                codeExample: `// 线程创建
Thread thread = new Thread(() -> System.out.println("Hello from thread"));
thread.start();

// synchronized
public class Counter {
    private int count = 0;
    public synchronized void increment() { count++; }
}

// 线程池
ExecutorService executor = Executors.newFixedThreadPool(4);
executor.submit(() -> System.out.println("Task running"));
executor.shutdown();`,
                animation: "java-concurrency-demo"
            }
        ]
    },
    {
        category: "Python",
        icon: "fa-brands fa-python",
        color: "#3776ab",
        topics: [
            {
                id: "py-basics",
                title: "Python基础与语法特性",
                importance: "high",
                frequency: 5,
                summary: "Python语言基础、数据结构、核心语法特性",
                content: `
                    <p><strong>数据类型</strong>：int、float、str、list、tuple、dict、set</p>
                    <p><strong>函数式特性</strong>：lambda、map、filter、列表推导式</p>
                `,
                codeExample: `# 数据类型
x = 10
y = 3.14
name = "Alice"
my_list = [1, 2, 3]
my_dict = {"a": 1, "b": 2}

# 列表推导式
squares = [x**2 for x in range(10) if x % 2 == 0]

# 函数
def add(a, b):
    return a + b

# Lambda
multiply = lambda x, y: x * y`,
                animation: "python-basics-demo"
            },
            {
                id: "py-oop",
                title: "Python面向对象编程",
                importance: "high",
                frequency: 5,
                summary: "Python类、继承、多态、魔法方法等面向对象特性",
                content: `
                    <p><strong>类与对象</strong>：封装、属性、方法</p>
                    <p><strong>魔法方法</strong>：__init__、__str__、__repr__、__getattr__</p>
                `,
                codeExample: `# 类定义
class Person:
    species = "Homo sapiens"
    
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, I'm {self.name}"
    
    def __str__(self):
        return f"Person({self.name}, {self.age})"

# 继承
class Student(Person):
    def __init__(self, name, age, school):
        super().__init__(name, age)
        self.school = school`,
                animation: "python-oop-demo"
            },
            {
                id: "py-async",
                title: "异步编程与协程",
                importance: "high",
                frequency: 4,
                summary: "Python异步IO、asyncio库、协程概念",
                content: `
                    <p><strong>async/await</strong>：异步编程语法</p>
                    <p><strong>事件循环</strong>：asyncio事件循环机制</p>
                `,
                codeExample: `import asyncio

async def say_hello(name, delay):
    await asyncio.sleep(delay)
    print(f"Hello, {name}!")

async def main():
    task1 = asyncio.create_task(say_hello("Alice", 1))
    task2 = asyncio.create_task(say_hello("Bob", 2))
    await task1
    await task2

asyncio.run(main())`,
                animation: "python-async-demo"
            }
        ]
    },
    {
        category: "Go",
        icon: "fa-brands fa-golang",
        color: "#00add8",
        topics: [
            {
                id: "go-basics",
                title: "Go语言基础",
                importance: "high",
                frequency: 5,
                summary: "Go语言语法基础、类型系统、控制流程",
                content: `
                    <p><strong>类型</strong>：int、float、string、bool、array、slice、map、struct、interface</p>
                    <p><strong>函数</strong>：多返回值、defer、panic、recover</p>
                `,
                codeExample: `// 变量声明
var name string = "Alice"
age := 25

// 切片
slice := []int{1, 2, 3}
slice = append(slice, 4)

// 结构体
type Person struct {
    Name string
    Age  int
}

// 接口
type Speaker interface {
    Speak() string
}

// 函数多返回值
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}`,
                animation: "go-basics-demo"
            },
            {
                id: "go-concurrency",
                title: "Go并发编程：Goroutine与Channel",
                importance: "high",
                frequency: 5,
                summary: "Go的核心优势：轻量级协程和通道通信",
                content: `
                    <p><strong>Goroutine</strong>：用go关键字启动的轻量级线程</p>
                    <p><strong>Channel</strong>：用于协程间通信的管道</p>
                    <p><strong>Select</strong>：多路复用，同时等待多个通道操作</p>
                `,
                codeExample: `// Goroutine
go sayHello("Alice")

// Channel
func sum(numbers []int, result chan int) {
    sum := 0
    for _, n := range numbers {
        sum += n
    }
    result <- sum
}

// sync.WaitGroup
var wg sync.WaitGroup
for i := 0; i < 3; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        fmt.Println("Worker", id)
    }(i)
}
wg.Wait()`,
                animation: "go-concurrency-demo"
            }
        ]
    },
    {
        category: "HTML/CSS",
        icon: "fa-brands fa-html5",
        color: "#e34f26",
        topics: [
            {
                id: "html-css-box-model",
                title: "盒模型与布局基础",
                importance: "high",
                frequency: 5,
                summary: "CSS盒模型是布局基础，理解其原理至关重要",
                content: `
                    <p><strong>盒模型类型</strong>：content-box（标准）、border-box（IE）</p>
                    <p><strong>盒组成</strong>：content → padding → border → margin</p>
                `,
                codeExample: `/* 盒模型 */
.box {
    box-sizing: border-box;
    width: 200px;
    padding: 20px;
    border: 5px solid #333;
    margin: 10px;
}

/* Flexbox */
.flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

/* Grid */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}`,
                animation: "box-model-demo"
            }
        ]
    },
    {
        category: "React",
        icon: "fa-brands fa-react",
        color: "#61dafb",
        topics: [
            {
                id: "react-vdom",
                title: "虚拟DOM与Diff算法",
                importance: "high",
                frequency: 5,
                summary: "React核心原理：虚拟DOM树对比，计算最小变更",
                content: `
                    <p><strong>虚拟DOM</strong>：用JS对象表示DOM结构，比真实DOM轻量</p>
                    <p><strong>Diff策略</strong>：同层比较、类型不同替换、用key识别列表项</p>
                `,
                codeExample: `// key的重要性
{items.map(item => (
    <li key={item.id}>{item.text}</li>
))}`,
                animation: "virtual-dom-demo"
            },
            {
                id: "react-hooks",
                title: "Hooks原理与使用",
                importance: "high",
                frequency: 5,
                summary: "React函数组件的状态和副作用管理",
                content: `
                    <p><strong>useState</strong>：状态管理</p>
                    <p><strong>useEffect</strong>：副作用处理</p>
                    <p><strong>useContext</strong>：Context消费</p>
                    <p><strong>useMemo/useCallback</strong>：缓存优化</p>
                `,
                codeExample: `// useState
function Counter() {
    const [count, setCount] = useState(0);
    return (
        <button onClick={() => setCount(c => c + 1)}>
            Count: {count}
        </button>
    );
}

// useEffect
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        fetch(\`/api/users/\${userId}\`)
            .then(res => res.json())
            .then(data => setUser(data));
    }, [userId]);
    return user ? <div>{user.name}</div> : <div>Loading</div>;
}`,
                animation: "hooks-demo"
            }
        ]
    },
    {
        category: "数据库",
        icon: "fa-solid fa-database",
        color: "#336791",
        topics: [
            {
                id: "mysql-index",
                title: "MySQL索引与优化",
                importance: "high",
                frequency: 5,
                summary: "MySQL索引原理、B+树、索引优化策略",
                content: `
                    <p><strong>索引类型</strong>：主键索引、普通索引、唯一索引、组合索引</p>
                    <p><strong>索引优化</strong>：最左前缀原则、覆盖索引、避免索引失效</p>
                `,
                codeExample: `-- 索引创建
CREATE INDEX idx_name ON users(name);
CREATE INDEX idx_name_age ON users(name, age);

-- 最左前缀
-- 索引 idx(a, b, c)
WHERE a = 1 AND b = 2 AND c = 3; -- 使用索引
WHERE a = 1 AND b = 2;           -- 使用索引
WHERE a = 1;                      -- 使用索引

-- EXPLAIN查看执行计划
EXPLAIN SELECT * FROM users WHERE name = 'Alice';`,
                animation: "mysql-index-demo"
            },
            {
                id: "mysql-transaction",
                title: "事务与ACID特性",
                importance: "high",
                frequency: 5,
                summary: "数据库事务原理、ACID特性、隔离级别",
                content: `
                    <p><strong>ACID</strong>：原子性、一致性、隔离性、持久性</p>
                    <p><strong>隔离级别</strong>：读未提交、读已提交、可重复读、串行化</p>
                `,
                codeExample: `-- 事务示例
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- 没问题就提交`,
                animation: "mysql-transaction-demo"
            },
            {
                id: "redis-basics",
                title: "Redis数据结构与使用场景",
                importance: "high",
                frequency: 5,
                summary: "Redis常用数据结构及其应用场景",
                content: `
                    <p><strong>数据结构</strong>：String、Hash、List、Set、SortedSet</p>
                    <p><strong>应用场景</strong>：缓存、分布式锁、计数器、排行榜、消息队列</p>
                `,
                codeExample: `// String
SET key value
GET key
INCR counter

// Hash
HSET user:1 name "Alice" age 25
HGETALL user:1

// SortedSet (排行榜)
ZADD rank 100 "player1"
ZREVRANGE rank 0 -1 WITHSCORES`,
                animation: "redis-demo"
            }
        ]
    },
    {
        category: "算法",
        icon: "fa-solid fa-code-branch",
        color: "#6f42c1",
        topics: [
            {
                id: "algo-sort",
                title: "经典排序算法",
                importance: "high",
                frequency: 5,
                summary: "快排、归并、堆排等核心排序算法实现与复杂度",
                content: `
                    <p><strong>排序比较</strong>：冒泡O(n²)、快排O(nlogn)、归并O(nlogn)、堆排O(nlogn)</p>
                `,
                codeExample: `// 快速排序
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), ...middle, ...quickSort(right)];
}`,
                animation: "sort-demo"
            },
            {
                id: "algo-dp",
                title: "动态规划DP",
                importance: "high",
                frequency: 5,
                summary: "动态规划核心思想与经典问题：背包、最长子序列等",
                content: `
                    <p><strong>DP核心</strong>：最优子结构、重叠子问题、状态转移方程</p>
                `,
                codeExample: `// 斐波那契数列
function fib(n) {
    if (n <= 1) return n;
    const dp = new Array(n + 1);
    dp[0] = 0; dp[1] = 1;
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}

// 爬楼梯
function climbStairs(n) {
    const dp = new Array(n + 1);
    dp[0] = 1; dp[1] = 1;
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`,
                animation: "dp-demo"
            },
            {
                id: "algo-binary-tree",
                title: "二叉树与BFS/DFS",
                importance: "high",
                frequency: 5,
                summary: "树的遍历、递归、层次遍历等核心算法",
                content: `
                    <p><strong>遍历方式</strong>：前序（根左右）、中序（左根右）、后序（左右根）</p>
                    <p><strong>搜索方式</strong>：DFS深度优先、BFS广度优先</p>
                `,
                codeExample: `// 二叉树节点
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = this.right = null;
    }
}

// 前序遍历
function preorder(root) {
    if (!root) return [];
    return [root.val, ...preorder(root.left), ...preorder(root.right)];
}

// 层序遍历BFS
function levelOrder(root) {
    if (!root) return [];
    const queue = [root];
    const result = [];
    while (queue.length) {
        const level = [];
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}`,
                animation: "tree-demo"
            }
        ]
    },
    {
        category: "系统设计",
        icon: "fa-solid fa-architecture",
        color: "#28a745",
        topics: [
            {
                id: "design-url-shortener",
                title: "URL短链接服务设计",
                importance: "high",
                frequency: 5,
                summary: "经典系统设计题目：短链接生成与跳转",
                content: `
                    <p><strong>需求</strong>：长URL转短URL、访问短URL跳转、高可用高并发</p>
                    <p><strong>方案</strong>：哈希函数、Base62编码、缓存加速、分布式ID生成</p>
                `,
                codeExample: `// 核心逻辑伪代码
function generateShortUrl(longUrl):
    hash = md5(longUrl)
    shortId = base62_encode(hash)[0:6]
    store(shortId, longUrl)
    return "https://t.cn/" + shortId

function redirect(shortId):
    longUrl = getFromCache(shortId)
    if not longUrl:
        longUrl = getFromDatabase(shortId)
        setCache(shortId, longUrl)
    return redirect(longUrl)`,
                animation: "url-shortener-demo"
            },
            {
                id: "design-cache",
                title: "缓存系统设计",
                importance: "high",
                frequency: 5,
                summary: "分布式缓存设计：缓存穿透、缓存击穿、缓存雪崩",
                content: `
                    <p><strong>缓存问题</strong>：缓存穿透（查不存在的数据）、缓存击穿（热点key失效）、缓存雪崩（大面积key同时失效）</p>
                    <p><strong>解决方案</strong>：布隆过滤器、互斥锁、过期时间随机化、多级缓存</p>
                `,
                codeExample: `// 布隆过滤器防止穿透
function get(key):
    if bloomFilter.notHas(key):
        return null
    val = cache.get(key)
    if val == null:
        lock(key)
        val = cache.get(key) // double check
        if val == null:
            val = db.get(key)
            cache.set(key, val, expire)
        unlock(key)
    return val`,
                animation: "cache-design-demo"
            }
        ]
    }
];

window.interviewData = interviewData;
