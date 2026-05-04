const designTopics = [
    {
        id: 'design-patterns',
        title: '设计模式',
        icon: 'fa-puzzle-piece',
        category: 'System Design',
        difficulty: 'high',
        frequency: 5,
        summary: '单例、工厂、观察者、策略等经典设计模式',
        content: `
            <p><strong>创建型模式：</strong></p>
            <ul>
                <li>单例模式</li>
                <li>工厂模式</li>
                <li>抽象工厂</li>
                <li>建造者模式</li>
            </ul>
            <p><strong>结构型模式：</strong></p>
            <ul>
                <li>适配器模式</li>
                <li>装饰器模式</li>
                <li>代理模式</li>
            </ul>
            <p><strong>行为型模式：</strong></p>
            <ul>
                <li>观察者模式</li>
                <li>策略模式</li>
                <li>责任链模式</li>
            </ul>
        `,
        codeExample: `// 单例模式
class Singleton {
    constructor() {
        if (Singleton.instance) return Singleton.instance;
        Singleton.instance = this;
    }
}

// 观察者模式
class Subject {
    constructor() {
        this.observers = [];
    }
    addObserver(obs) { this.observers.push(obs); }
    notify(data) {
        this.observers.forEach(o => o.update(data));
    }
}

class Observer {
    update(data) { console.log('Got data:', data); }
}

// 策略模式
class StrategyA { execute() { console.log('A'); } }
class StrategyB { execute() { console.log('B'); } }
class Context {
    constructor(strategy) { this.strategy = strategy; }
    execute() { this.strategy.execute(); }
}`,
        animation: 'design-pattern'
    },
    {
        id: 'microservices',
        title: '微服务架构',
        icon: 'fa-network-wired',
        category: 'System Design',
        difficulty: 'very-high',
        frequency: 5,
        summary: '服务拆分、网关、熔断、负载均衡',
        content: `
            <p><strong>微服务核心组件：</strong></p>
            <ul>
                <li>服务注册与发现：Eureka, Consul</li>
                <li>API网关：Spring Cloud Gateway, Kong</li>
                <li>熔断降级：Hystrix, Sentinel</li>
                <li>配置中心：Apollo, Nacos</li>
                <li>链路追踪：Zipkin, SkyWalking</li>
            </ul>
        `,
        codeExample: `// Nacos 服务发现 (Java)
@SpringBootApplication
@EnableDiscoveryClient
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

// Spring Cloud 熔断
@HystrixCommand(fallbackMethod = "fallback")
public String getRemoteData() {
    return restTemplate.getForObject(url, String.class);
}
public String fallback() {
    return "服务降级";
}

// 网关配置
- 路由转发
- 限流
- 认证鉴权
- 日志监控`,
        animation: 'microservices'
    },
    {
        id: 'consistent-hash',
        title: '一致性哈希',
        icon: 'fa-sync-alt',
        category: 'System Design',
        difficulty: 'high',
        frequency: 4,
        summary: '分布式缓存负载均衡策略',
        content: `
            <p><strong>核心特点：</strong></p>
            <ul>
                <li>节点增删时只影响相邻节点</li>
                <li>虚拟节点解决数据分布不均</li>
            </ul>
        `,
        codeExample: `// 简单一致性哈希实现
class ConsistentHash {
    constructor(nodes = [], replicas = 150) {
        this.replicas = replicas;
        this.ring = {};
        this.sortedKeys = [];
        nodes.forEach(n => this.addNode(n));
    }
    
    hash(key) {
        return require('crypto').createHash('md5')
            .update(key).digest('hex');
    }
    
    addNode(node) {
        for (let i = 0; i < this.replicas; i++) {
            const key = this.hash(node + ':' + i);
            this.ring[key] = node;
            this.sortedKeys.push(key);
        }
        this.sortedKeys.sort();
    }
    
    getNode(key) {
        const hash = this.hash(key);
        for (let k of this.sortedKeys) {
            if (hash <= k) return this.ring[k];
        }
        return this.ring[this.sortedKeys[0]];
    }
}`,
        animation: 'hash'
    },
    {
        id: 'high-concurrency',
        title: '高并发系统',
        icon: 'fa-bolt',
        category: 'System Design',
        difficulty: 'very-high',
        frequency: 5,
        summary: '缓存、异步、限流、分库分表',
        content: `
            <p><strong>高并发优化方案：</strong></p>
            <ul>
                <li>缓存：Redis，热点数据加载</li>
                <li>异步：消息队列，削峰填谷</li>
                <li>限流：漏桶、令牌桶</li>
                <li>分库分表：垂直、水平拆分</li>
                <li>读写分离：主从复制</li>
            </ul>
        `,
        codeExample: `// 限流：令牌桶算法
class TokenBucket {
    constructor(capacity, rate) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.rate = rate;
        this.lastTime = Date.now();
    }
    
    allowRequest() {
        const now = Date.now();
        const elapsed = (now - this.lastTime) / 1000;
        this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.rate);
        this.lastTime = now;
        
        if (this.tokens >= 1) {
            this.tokens--;
            return true;
        }
        return false;
    }
}

// 使用
const limiter = new TokenBucket(100, 10);
if (limiter.allowRequest()) {
    // 处理请求
}`,
        animation: 'high-concurrency'
    },
    {
        id: 'distributed-lock',
        title: '分布式锁',
        icon: 'fa-lock',
        category: 'System Design',
        difficulty: 'high',
        frequency: 4,
        summary: 'Redis、Zookeeper、数据库实现',
        content: `
            <p><strong>分布式锁要求：</strong></p>
            <ul>
                <li>互斥：同一时间只有一个持有者</li>
                <li>防死锁：超时释放</li>
                <li>解铃还须系铃人：谁加锁谁释放</li>
            </ul>
        `,
        codeExample: `// Redis 分布式锁 (SET NX EX)
function tryLock(key, expireTime) {
    const value = UUID();
    const result = redis.set(key, value, 'NX', 'EX', expireTime);
    if (result === 'OK') return value;
    return null;
}

function unlock(key, value) {
    const script = \`
        if redis.call("get", KEYS[1]) == ARGV[1]
        then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
    \`;
    return redis.eval(script, 1, key, value);
}

// 使用
const lockVal = tryLock('order:123', 30);
if (lockVal) {
    try {
        // 业务逻辑
    } finally {
        unlock('order:123', lockVal);
    }
}`,
        animation: 'distributed-lock'
    }
];

window.designTopics = designTopics;