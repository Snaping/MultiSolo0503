const databaseTopics = [
    {
        id: 'index',
        title: '索引原理与优化',
        icon: 'fa-search',
        category: 'Database',
        difficulty: 'high',
        frequency: 5,
        summary: 'MySQL索引类型、B+树原理、索引优化策略',
        content: `
            <p><strong>索引类型：</strong></p>
            <ul>
                <li>主键索引：PRIMARY KEY</li>
                <li>唯一索引：UNIQUE</li>
                <li>普通索引：INDEX</li>
                <li>复合索引：INDEX(a, b, c)</li>
            </ul>
            <p><strong>B+树的优势：</strong></p>
            <ul>
                <li>叶子结点有序链表，范围查询高效</li>
                <li>所有查询都落在叶子结点，查询稳定</li>
                <li>节点存储更多key，树高更小，IO更少</li>
            </ul>
        `,
        codeExample: `-- 创建索引
CREATE INDEX idx_name ON users(name);
CREATE INDEX idx_name_age ON users(name, age);

-- 查询索引使用情况
EXPLAIN SELECT * FROM users WHERE name = 'Alice';

-- 最左前缀匹配
-- 使用：name, name+age, name+age+address
-- 不使用：age, age+address`,
        animation: 'index'
    },
    {
        id: 'transaction',
        title: '事务与ACID',
        icon: 'fa-database',
        category: 'Database',
        difficulty: 'high',
        frequency: 5,
        summary: 'ACID四大特性、四种隔离级别、MVCC原理',
        content: `
            <p><strong>ACID特性：</strong></p>
            <ul>
                <li>原子性：Atomicity，要么全做，要么全不做</li>
                <li>一致性：Consistency，数据状态前后一致</li>
                <li>隔离性：Isolation，并发事务互不干扰</li>
                <li>持久性：Durability，提交后永久生效</li>
            </ul>
            <p><strong>隔离级别：</strong></p>
            <ol>
                <li>读未提交：Read Uncommitted</li>
                <li>读已提交：Read Committed</li>
                <li>可重复读：Repeatable Read (MySQL默认)</li>
                <li>串行化：Serializable</li>
            </ol>
        `,
        codeExample: `-- 开启事务
START TRANSACTION;

UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;

-- 事务提交或回滚
COMMIT;  -- 成功
ROLLBACK;  -- 失败

-- 设置隔离级别
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;`,
        animation: 'transaction'
    },
    {
        id: 'redis',
        title: 'Redis数据结构',
        icon: 'fa-memory',
        category: 'Database',
        difficulty: 'medium',
        frequency: 5,
        summary: 'Redis五种核心数据结构、实现原理、应用场景',
        content: `
            <p><strong>Redis数据结构：</strong></p>
            <ul>
                <li>String：字符串，用于缓存、计数器</li>
                <li>Hash：哈希表，存储对象信息</li>
                <li>List：双向链表，用于消息队列</li>
                <li>Set：集合，用于去重、交集、并集</li>
                <li>ZSet：有序集合，用于排行榜</li>
            </ul>
        `,
        codeExample: `-- String操作
SET user:1:name "Alice";
GET user:1:name;
INCR page_view:home;

-- Hash操作
HSET user:1 name "Alice" age 25;
HGET user:1 name;

-- List操作
LPUSH queue:order "order1";
RPOP queue:order;

-- ZSet操作
ZADD ranking 100 "Alice";
ZREVRANGE ranking 0 10 WITHSCORES;`,
        animation: 'redis'
    },
    {
        id: 'redis-cluster',
        title: 'Redis集群架构',
        icon: 'fa-project-diagram',
        category: 'Database',
        difficulty: 'high',
        frequency: 4,
        summary: '主从复制、哨兵模式、Cluster集群',
        content: `
            <p><strong>集群模式：</strong></p>
            <ul>
                <li>主从复制：读写分离，一主一从/多从</li>
                <li>哨兵模式：Sentinel，自动故障转移</li>
                <li>Cluster：官方集群，分片存储</li>
            </ul>
        `,
        codeExample: `# 主从复制配置 (slave)
replicaof 192.168.1.100 6379

# 哨兵配置 (sentinel)
sentinel monitor mymaster 192.168.1.100 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 180000

# Cluster模式，16384个哈希槽
# CLUSTER ADDSLOTS 0 1 2 ... 5461`,
        animation: 'cluster'
    },
    {
        id: 'mysql-optimize',
        title: 'MySQL性能优化',
        icon: 'fa-bolt',
        category: 'Database',
        difficulty: 'high',
        frequency: 4,
        summary: 'SQL优化、架构优化、配置调优',
        content: `
            <p><strong>优化方法：</strong></p>
            <ul>
                <li>避免SELECT *，只查需要的字段</li>
                <li>合理使用索引，避免失效</li>
                <li>避免使用NOT IN、OR等导致索引失效</li>
                <li>大表分库分表，拆分为多个小表</li>
                <li>读写分离，减轻主库压力</li>
            </ul>
        `,
        codeExample: `-- 避免索引失效
-- 不推荐：对字段函数处理
SELECT * FROM users WHERE YEAR(created_at) = 2023;

-- 推荐：范围查询
SELECT * FROM users WHERE created_at BETWEEN '2023-01-01' AND '2023-12-31';

-- 使用LIMIT分页
SELECT * FROM users ORDER BY id DESC LIMIT 20 OFFSET 0;`,
        animation: 'optimize'
    }
];

window.databaseTopics = databaseTopics;