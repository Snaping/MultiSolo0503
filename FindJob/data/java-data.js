const javaTopics = [
    {
        id: 'collection-framework',
        title: '集合框架 Collection Framework',
        icon: 'fa-layer-group',
        category: 'Core',
        difficulty: 'high',
        frequency: 5,
        summary: 'ArrayList、HashMap、LinkedList、ConcurrentHashMap等核心集合',
        content: `
            <p><strong>Collection 体系：</strong></p>
            <ul>
                <li>List: ArrayList, LinkedList, Vector</li>
                <li>Set: HashSet, TreeSet, LinkedHashSet</li>
                <li>Map: HashMap, TreeMap, ConcurrentHashMap</li>
            </ul>
            
            <p><strong>HashMap 1.7 vs 1.8：</strong></p>
            <ul>
                <li>1.7: 数组+链表，头插法，扩容转移</li>
                <li>1.8: 数组+链表+红黑树，尾插法，平衡树优化</li>
            </ul>
        `,
        codeExample: `// ArrayList
List<String> list = new ArrayList<>();
list.add("a");
list.get(0);

// HashMap
Map<String, Integer> map = new HashMap<>();
map.put("key", 1);
map.get("key");

// ConcurrentHashMap - 线程安全
Map<String, String> concurrent = new ConcurrentHashMap<>();
concurrent.put("k", "v");
`,
        animation: 'hashmap'
    },
    {
        id: 'multithreading',
        title: '多线程与并发',
        icon: 'fa-users',
        category: 'Concurrency',
        difficulty: 'high',
        frequency: 5,
        summary: '线程创建、synchronized、volatile、Lock、线程池',
        content: `
            <p><strong>线程创建方式：</strong></p>
            <ol>
                <li>继承 Thread</li>
                <li>实现 Runnable</li>
                <li>使用 Callable + Future</li>
                <li>线程池 Executors</li>
            </ol>
            
            <p><strong>线程池：</strong></p>
            <ul>
                <li>ThreadPoolExecutor 7大参数</li>
                <li>核心线程、最大线程、空闲时间</li>
                <li>workQueue 任务队列</li>
                <li>handler 拒绝策略</li>
            </ul>
        `,
        codeExample: `// 线程池
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.execute(() -> System.out.println("Task running"));
pool.shutdown();

// ThreadPoolExecutor 手动配置
ThreadPoolExecutor custom = new ThreadPoolExecutor(
    2, 10, 60L, TimeUnit.SECONDS, 
    new LinkedBlockingQueue<>(100)
);

// synchronized 关键字
synchronized void increment() {
    count++;
}

// Lock 接口
Lock lock = new ReentrantLock();
lock.lock();
try {
    // do work
} finally {
    lock.unlock();
}
`,
        animation: 'thread-pool'
    },
    {
        id: 'jvm',
        title: 'JVM 原理',
        icon: 'fa-cogs',
        category: 'JVM',
        difficulty: 'very-high',
        frequency: 5,
        summary: '内存模型、GC算法、类加载机制、调优',
        content: `
            <p><strong>运行时数据区域：</strong></p>
            <ul>
                <li>程序计数器 - 线程私有</li>
                <li>虚拟机栈 - 方法执行内存</li>
                <li>本地方法栈 - Native方法</li>
                <li>堆 - 对象分配主要区域</li>
                <li>方法区 - 类元信息、常量池</li>
            </ul>
            
            <p><strong>GC 算法：</strong></p>
            <ul>
                <li>标记-清除</li>
                <li>复制算法</li>
                <li>标记-整理</li>
                <li>分代收集</li>
            </ul>
        `,
        codeExample: `// JVM 参数示例
// -Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200

// 类加载过程
// Loading -> Linking (Verification + Preparation + Resolution) -> Initialization

// ClassLoader 双亲委派
// Bootstrap -> Extension -> Application -> Custom
`,
        animation: 'jvm'
    },
    {
        id: 'java8-stream',
        title: 'Stream API',
        icon: 'fa-water',
        category: 'Language',
        difficulty: 'medium',
        frequency: 4,
        summary: '函数式数据处理：filter、map、reduce',
        content: `
            <p><strong>Stream 操作类型：</strong></p>
            <ul>
                <li>中间操作：filter, map, sorted</li>
                <li>终端操作：collect, forEach, reduce</li>
            </ul>
        `,
        codeExample: `List<Integer> nums = Arrays.asList(1,2,3,4,5);

List<Integer> result = nums.stream()
    .filter(n -> n % 2 == 0) // [2,4]
    .map(n -> n * 2)        // [4,8]
    .sorted()               // [4,8]
    .collect(Collectors.toList());

int sum = nums.stream()
    .mapToInt(Integer::intValue)
    .sum();
`,
        animation: 'stream-api'
    },
    {
        id: 'spring-core',
        title: 'Spring 核心原理',
        icon: 'fa-leaf',
        category: 'Framework',
        difficulty: 'high',
        frequency: 5,
        summary: 'IOC、DI、AOP原理与实现',
        content: `
            <p><strong>IOC 控制反转：</strong></p>
            <p>将对象创建与依赖管理交给容器</p>
            
            <p><strong>AOP 面向切面：</strong></p>
            <p>动态代理与字节码增强实现横切关注点</p>
        `,
        codeExample: `// 配置类
@Configuration
public class AppConfig {
    @Bean
    public UserService userService() {
        return new UserService();
    }
}

// 依赖注入
@Service
public class MyService {
    @Autowired
    private UserDao userDao;
}

// AOP 切面
@Aspect
@Component
public class LogAspect {
    @Before("execution(* com.example.*.*(..))")
    public void before() {
        System.out.println("Before method");
    }
}
`,
        animation: 'spring-ioc'
    }
];

window.javaTopics = javaTopics;
