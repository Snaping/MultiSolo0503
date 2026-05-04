// 主应用 - 路由系统
let currentPage = 'home';
let currentCategory = '';

// 数据加载
const DATA_LOADED = {};

const pages = {
    home: renderHomePage,
    javascript: renderJavaScriptPage,
    typescript: renderTypeScriptPage,
    java: renderJavaPage,
    python: renderPythonPage,
    go: renderGoPage,
    database: renderDatabasePage,
    algorithm: renderAlgorithmPage,
    design: renderDesignPage
};

async function loadCategoryData(category) {
    if (DATA_LOADED[category]) return DATA_LOADED[category];
    
    // 动态加载脚本
    const script = document.createElement('script');
    script.src = `data/${category}-data.js`;
    document.head.appendChild(script);
    
    return new Promise(resolve => {
        const check = setInterval(() => {
            const dataKey = category + 'Topics';
            if (window[dataKey]) {
                clearInterval(check);
                DATA_LOADED[category] = window[dataKey];
                resolve(window[dataKey]);
            }
        }, 50);
        setTimeout(resolve, 2000);
    });
}

function navigate(page, category = '') {
    currentPage = page;
    currentCategory = category;
    renderPage();
    window.location.hash = page;
}

async function renderPage() {
    const pageRenderer = pages[currentPage] || renderHomePage;
    try {
        const content = await pageRenderer();
        document.querySelector('#main-container').innerHTML = content;
        setupPageListeners();
    } catch (e) {
        document.querySelector('#main-container').innerHTML = renderHomePage();
    }
}

function setupPageListeners() {
    // 页面特定的事件绑定
}

function renderHomePage() {
    return `
        <div class="hero">
            <div class="hero-content">
                <h1 class="animate__animated animate__fadeInDown">
                    <i class="fas fa-code"></i> 前端面试系统
                </h1>
                <p class="animate__animated animate__fadeInUp" style="color: var(--text-secondary); margin: 16px 0 32px;">
                    全面的编程知识学习与面试准备平台
                </p>
                <div class="hero-actions">
                    <a href="#javascript" onclick="navigate('javascript'); return false;">
                        <i class="fab fa-js-square"></i> 开始学习
                    </a>
                </div>
            </div>
        </div>
        
        <div class="home-categories">
            <div class="home-grid">
                <div class="category-card" onclick="navigate('javascript')">
                    <div class="category-icon" style="background: linear-gradient(135deg, #f7df1e, #f0db4f);">
                        <i class="fab fa-js-square"></i>
                    </div>
                    <h3>JavaScript</h3>
                    <p>核心语言、异步编程、原型链</p>
                    <div class="category-count">10 个知识点</div>
                </div>
                
                <div class="category-card" onclick="navigate('typescript')">
                    <div class="category-icon" style="background: linear-gradient(135deg, #3178c6, #235a97);">
                        <i class="fab fa-ts"></i>
                    </div>
                    <h3>TypeScript</h3>
                    <p>类型系统、高级类型、工具类型</p>
                    <div class="category-count">8 个知识点</div>
                </div>
                
                <div class="category-card" onclick="navigate('java')">
                    <div class="category-icon" style="background: linear-gradient(135deg, #f89820, #ea771d);">
                        <i class="fab fa-java"></i>
                    </div>
                    <h3>Java</h3>
                    <p>集合框架、并发编程、JVM</p>
                    <div class="category-count">12 个知识点</div>
                </div>
                
                <div class="category-card" onclick="navigate('python')">
                    <div class="category-icon" style="background: linear-gradient(135deg, #3776ab, #2b5e86);">
                        <i class="fab fa-python"></i>
                    </div>
                    <h3>Python</h3>
                    <p>高级特性、异步编程、装饰器</p>
                    <div class="category-count">9 个知识点</div>
                </div>
                
                <div class="category-card" onclick="navigate('go')">
                    <div class="category-icon" style="background: linear-gradient(135deg, #00add8, #008ab3);">
                        <i class="fab fa-golang"></i>
                    </div>
                    <h3>Go</h3>
                    <p>Goroutine、Channel、并发</p>
                    <div class="category-count">8 个知识点</div>
                </div>
                
                <div class="category-card" onclick="navigate('database')">
                    <div class="category-icon" style="background: linear-gradient(135deg, #336791, #29547a);">
                        <i class="fas fa-database"></i>
                    </div>
                    <h3>数据库</h3>
                    <p>MySQL、Redis、索引优化</p>
                    <div class="category-count">7 个知识点</div>
                </div>
                
                <div class="category-card" onclick="navigate('algorithm')">
                    <div class="category-icon" style="background: linear-gradient(135deg, #6f42c1, #5a32a8);">
                        <i class="fas fa-code-branch"></i>
                    </div>
                    <h3>算法</h3>
                    <p>排序、动态规划、图算法</p>
                    <div class="category-count">9 个知识点</div>
                </div>
                
                <div class="category-card" onclick="navigate('design')">
                    <div class="category-icon" style="background: linear-gradient(135deg, #28a745, #1f8b3e);">
                        <i class="fas fa-architecture"></i>
                    </div>
                    <h3>系统设计</h3>
                    <p>架构、缓存、分布式系统</p>
                    <div class="category-count">6 个知识点</div>
                </div>
            </div>
        </div>
    `;
}

async function renderJavaScriptPage() {
    const topics = window.javascriptTopics || [];
    if (topics.length === 0) {
        await loadCategoryData('javascript');
    }
    return renderLanguagePage('JavaScript', '#f7df1e', 'fab fa-js-square', 
        (window.javascriptTopics || []).map(t => ({id: t.id, title: t.title, icon: t.icon, desc: t.summary})));
}

async function renderTypeScriptPage() {
    const topics = [
        { id: 'types', title: '类型系统', icon: 'fa-tag', desc: '基础类型与高级类型' },
        { id: 'generics', title: '泛型', icon: 'fa-cube', desc: '类型参数化编程' },
        { id: 'utility', title: '工具类型', icon: 'fa-tools', desc: '内置类型转换工具' },
        { id: 'decorator', title: '装饰器', icon: 'fa-star', desc: '元编程装饰器' },
        { id: 'infer', title: '类型推断', icon: 'fa-magic', desc: '高级类型推断' },
        { id: 'react-ts', title: 'React+TS', icon: 'fab fa-react', desc: 'TypeScript在React中的最佳实践' }
    ];
    return renderLanguagePage('TypeScript', '#3178c6', 'fab fa-ts', topics);
}

async function renderJavaPage() {
    const topics = window.javaTopics || [];
    if (topics.length === 0) {
        await loadCategoryData('java');
    }
    return renderLanguagePage('Java', '#f89820', 'fab fa-java', 
        (window.javaTopics || []).map(t => ({id: t.id, title: t.title, icon: t.icon, desc: t.summary})));
}

async function renderPythonPage() {
    const topics = window.pythonTopics || [];
    if (topics.length === 0) {
        await loadCategoryData('python');
    }
    return renderLanguagePage('Python', '#3776ab', 'fab fa-python', 
        (window.pythonTopics || []).map(t => ({id: t.id, title: t.title, icon: t.icon, desc: t.summary})));
}

async function renderGoPage() {
    const topics = window.goTopics || [];
    if (topics.length === 0) {
        await loadCategoryData('go');
    }
    return renderLanguagePage('Go', '#00add8', 'fab fa-golang', 
        (window.goTopics || []).map(t => ({id: t.id, title: t.title, icon: t.icon, desc: t.summary})));
}

async function renderDatabasePage() {
    const topics = window.databaseTopics || [];
    if (topics.length === 0) {
        await loadCategoryData('database');
    }
    return renderLanguagePage('数据库', '#336791', 'fas fa-database', 
        (window.databaseTopics || []).map(t => ({id: t.id, title: t.title, icon: t.icon, desc: t.summary})));
}

async function renderAlgorithmPage() {
    const topics = window.algorithmTopics || [];
    if (topics.length === 0) {
        await loadCategoryData('algorithm');
    }
    return renderLanguagePage('算法', '#6f42c1', 'fas fa-code-branch', 
        (window.algorithmTopics || []).map(t => ({id: t.id, title: t.title, icon: t.icon, desc: t.summary})));
}

async function renderDesignPage() {
    const topics = window.designTopics || [];
    if (topics.length === 0) {
        await loadCategoryData('design');
    }
    return renderLanguagePage('系统设计', '#28a745', 'fas fa-architecture', 
        (window.designTopics || []).map(t => ({id: t.id, title: t.title, icon: t.icon, desc: t.summary})));
}

function renderLanguagePage(name, color, icon, topics) {
    return `
        <div class="language-header">
            <div class="language-info">
                <i class="${icon}" style="font-size: 48px; color: ${color};"></i>
                <h1 class="animate__animated animate__fadeInDown">${name}</h1>
                <p style="color: var(--text-secondary); margin-top: 8px;">
                    ${topics.length} 个知识点 · 高频面试必备
                </p>
            </div>
            <div class="back-btn">
                <a href="#home" onclick="navigate('home'); return false;">
                    <i class="fas fa-arrow-left"></i> 返回首页
                </a>
            </div>
        </div>
        
        <div class="topics-grid">
            ${topics.map((t, i) => `
                <div class="topic-card animate__animated animate__fadeInUp" 
                     style="animation-delay: ${i * 0.1}s;"
                     onclick="showTopicDetail('${name}', '${t.id}')">
                    <div class="topic-card-header" style="border-left: 4px solid ${color};">
                        <i class="fas ${t.icon}"></i>
                        <div class="topic-card-title">${t.title}</div>
                    </div>
                    <div class="topic-card-body">
                        <p>${t.desc}</p>
                    </div>
                    <div class="topic-card-footer">
                        <span class="badge-high">高频</span>
                        <span class="tag-animation">动画演示</span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="demo-section">
            <h2><i class="fas fa-play-circle"></i> 动画演示</h2>
            <div class="demos-grid">
                <div class="demo-card" onclick="showAnimation('event-loop')">
                    <i class="fas fa-sync"></i>
                    <h3>事件循环</h3>
                    <p>JS事件循环可视化</p>
                </div>
                <div class="demo-card" onclick="showAnimation('thread-sync')">
                    <i class="fas fa-users"></i>
                    <h3>线程同步</h3>
                    <p>多线程竞争与同步</p>
                </div>
                <div class="demo-card" onclick="showAnimation('tcp')">
                    <i class="fas fa-exchange-alt"></i>
                    <h3>TCP三次握手</h3>
                    <p>网络连接建立过程</p>
                </div>
                <div class="demo-card" onclick="showAnimation('cache')">
                    <i class="fas fa-brain"></i>
                    <h3>缓存访问</h3>
                    <p>缓存读写流程</p>
                </div>
                <div class="demo-card" onclick="showAnimation('sort')">
                    <i class="fas fa-sort"></i>
                    <h3>快速排序</h3>
                    <p>排序算法可视化</p>
                </div>
                <div class="demo-card" onclick="showAnimation('distributed-lock')">
                    <i class="fas fa-lock"></i>
                    <h3>分布式锁</h3>
                    <p>Redis分布式锁演示</p>
                </div>
                <div class="demo-card" onclick="showAnimation('high-concurrency')">
                    <i class="fas fa-bolt"></i>
                    <h3>高并发处理</h3>
                    <p>限流、缓存、数据库架构</p>
                </div>
                <div class="demo-card" onclick="showAnimation('microservices')">
                    <i class="fas fa-architecture"></i>
                    <h3>微服务架构</h3>
                    <p>服务调用与基础设施</p>
                </div>
            </div>
        </div>
    `;
}

function showTopicDetail(language, topicId) {
    document.querySelector('#topic-modal').classList.add('active');
    
    // 查找对应的主题数据
    let topicData = null;
    const categoryMap = {
        'JavaScript': 'javascript',
        'Java': 'java',
        'Python': 'python',
        'Go': 'go',
        '数据库': 'database',
        '算法': 'algorithm',
        '系统设计': 'design'
    };
    const categoryKey = (categoryMap[language] || language.toLowerCase()) + 'Topics';
    const topicsArray = window[categoryKey] || [];
    
    for (let topic of topicsArray) {
        if (topic.id === topicId) {
            topicData = topic;
            break;
        }
    }
    
    const title = topicData ? topicData.title : topicId;
    
    const content = `
        <div class="modal-header">
            <h2>${title}</h2>
            <button onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            ${topicData ? generateTopicContent(topicData) : '<p>详细内容加载中...</p>'}
        </div>
    `;
    
    document.querySelector('#topic-modal .modal-content').innerHTML = content;
    
    // 高亮代码
    if (window.Prism) {
        Prism.highlightAllUnder(document.querySelector('#topic-modal .modal-content'));
    }
}

function generateTopicContent(topic) {
    return `
        <div class="topic-detail-section">
            <h4 style="color: var(--primary); margin-bottom: 12px;">
                <i class="fas fa-info-circle"></i> 概述
            </h4>
            <p style="margin-bottom: 20px;">${topic.summary}</p>
            
            <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                <span style="background: #f0f0f0; padding: 4px 12px; border-radius: 12px; font-size: 13px;">
                    <i class="fas fa-fire" style="color: #ff6b00;"></i> 
                    ${getFreqText(topic.frequency)} · ${getDifficulty(topic.difficulty)}
                </span>
            </div>
            
            ${topic.content ? `
                <h4 style="color: var(--primary); margin-bottom: 12px;">
                    <i class="fas fa-book"></i> 详细内容
                </h4>
                <div style="margin-bottom: 20px;">${topic.content}</div>
            ` : ''}
            
            ${topic.codeExample ? `
                <h4 style="color: var(--primary); margin-bottom: 12px;">
                    <i class="fas fa-code"></i> 代码示例
                </h4>
                <pre class="language-javascript" style="background: #2d2d2d; color: #ccc; padding: 16px; border-radius: 8px;">
                    <code class="language-javascript">${escapeHtml(topic.codeExample)}</code>
                </pre>
            ` : ''}
            
            ${topic.animation ? `
                <h4 style="color: var(--primary); margin-bottom: 12px;">
                    <i class="fas fa-play-circle"></i> 动画演示
                </h4>
                <div style="padding: 16px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                    <button class="btn-primary" onclick="showAnimation('${topic.animation}'); closeModal();">
                        <i class="fas fa-play"></i> 查看动画
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function getFreqText(freq) {
    if (freq >= 5) return '极高频';
    if (freq >= 4) return '高频';
    if (freq >= 3) return '中频';
    return '低频';
}

function getDifficulty(diff) {
    const diffMap = { 'low': '简单', 'medium': '中等', 'high': '较难', 'very-high': '困难' };
    return diffMap[diff] || '未知';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showAnimation(name) {
    document.querySelector('#animation-modal').classList.add('active');
    const demo = document.querySelector('#animation-modal .demo-container');
    renderAnimationDemo(demo, name);
}

function closeModal() {
    document.querySelector('#topic-modal').classList.remove('active');
    document.querySelector('#animation-modal').classList.remove('active');
}

function renderAnimationDemo(container, name) {
    const demos = {
        'event-loop': renderEventLoopDemo,
        'thread-sync': renderThreadSyncDemo,
        'tcp': renderTcpHandshakeDemo,
        'cache': renderCacheDemo,
        'sort': renderSortDemo,
        'distributed-lock': renderDistributedLockDemo,
        'hash': renderConsistentHashDemo,
        'high-concurrency': renderHighConcurrencyDemo,
        'microservices': renderMicroServicesDemo
    };
    
    if (demos[name]) {
        demos[name](container);
    }
}

function renderEventLoopDemo(container) {
    container.innerHTML = `
        <h3>事件循环 Event Loop</h3>
        <div class="event-loop-demo">
            <div class="call-stack">
                <div class="stack-title">
                    <i class="fas fa-layer-group"></i> Call Stack
                </div>
                <div class="stack-content" id="stack-content"></div>
            </div>
            
            <div class="event-queues">
                <div class="microtasks">
                    <div class="queue-title">Microtasks</div>
                    <div class="queue-content" id="micro-queue"></div>
                </div>
                <div class="macrotasks">
                    <div class="queue-title">Macrotasks</div>
                    <div class="queue-content" id="macro-queue"></div>
                </div>
            </div>
            
            <div class="web-apis">
                <div class="apis-title">Web APIs</div>
                <div class="apis-content" id="web-apis"></div>
            </div>
        </div>
        
        <div class="demo-controls">
            <button class="btn-primary" onclick="startEventLoopDemo()">
                <i class="fas fa-play"></i> 开始演示
            </button>
            <button class="btn-outline" onclick="resetEventLoopDemo()">
                <i class="fas fa-redo"></i> 重置
            </button>
        </div>
    `;
}

function renderThreadSyncDemo(container) {
    container.innerHTML = `
        <h3>线程同步与竞争</h3>
        <div class="thread-demo">
            <div class="thread-grid">
                <div class="thread-item" id="thread-1">
                    <i class="fas fa-user-circle"></i> Thread 1
                    <div class="thread-state">Ready</div>
                </div>
                <div class="shared-resource">
                    <i class="fas fa-database"></i>
                    Shared Resource
                </div>
                <div class="thread-item" id="thread-2">
                    <i class="fas fa-user-circle"></i> Thread 2
                    <div class="thread-state">Ready</div>
                </div>
            </div>
            
            <div class="resource-value">
                Count: <span id="count-val">0</span>
            </div>
        </div>
        
        <div class="demo-controls">
            <button class="btn-primary" onclick="startThreadDemo()">
                <i class="fas fa-play"></i> 开始竞争
            </button>
            <button class="btn-outline" onclick="startThreadDemoSync()">
                <i class="fas fa-lock"></i> 加锁执行
            </button>
        </div>
    `;
}

function renderTcpHandshakeDemo(container) {
    container.innerHTML = `
        <h3>TCP 三次握手</h3>
        <div class="tcp-demo">
            <div class="tcp-clients">
                <div class="client-box" id="client-side">
                    <i class="fas fa-desktop"></i> Client
                    <div class="client-state">CLOSED</div>
                </div>
                
                <div class="tcp-arrows" id="tcp-arrows"></div>
                
                <div class="client-box" id="server-side">
                    <i class="fas fa-server"></i> Server
                    <div class="client-state">LISTEN</div>
                </div>
            </div>
            
            <div class="tcp-log" id="tcp-log">
                <div class="log-entry">等待开始...</div>
            </div>
        </div>
        
        <div class="demo-controls">
            <button class="btn-primary" onclick="startTcpDemo()">
                <i class="fas fa-handshake"></i> 开始握手
            </button>
        </div>
    `;
}

function renderCacheDemo(container) {
    container.innerHTML = `
        <h3>缓存访问流程</h3>
        <div class="cache-demo">
            <div class="memory-stack">
                <div class="mem-cache" id="cache-data">
                    <i class="fas fa-memory"></i> Cache
                    <div class="cache-item">user1: Alice</div>
                    <div class="cache-item">user2: Bob</div>
                </div>
                <div class="db-layer">
                    <i class="fas fa-database"></i> Database
                    <div class="db-item">user1: Alice</div>
                    <div class="db-item">user2: Bob</div>
                    <div class="db-item">user3: Charlie</div>
                </div>
            </div>
            
            <div class="query-area">
                <input type="text" placeholder="查询 user1" id="query-input">
                <button class="btn-primary" onclick="doQuery()">查询</button>
            </div>
            
            <div class="query-result" id="query-result"></div>
        </div>
    `;
}

let eventLoopRunning = false;

function startEventLoopDemo() {
    if (eventLoopRunning) return;
    eventLoopRunning = true;
    
    const steps = [
        { type: 'sync', func: 'console.log(1)' },
        { type: 'webapi', delay: 0 },
        { type: 'macrotask', func: 'setTimeout()' },
        { type: 'microtask', func: 'Promise.then()' },
        { type: 'sync', func: 'console.log(2)' }
    ];
    
    let i = 0;
    const interval = setInterval(() => {
        if (i >= steps.length) {
            clearInterval(interval);
            eventLoopRunning = false;
            return;
        }
        
        const step = steps[i++];
        const stack = document.querySelector('#stack-content');
        
        if (step.type === 'sync') {
            stack.innerHTML += `
                <div class="stack-item animate__animated animate__fadeIn">
                    <i class="fas fa-code"></i> ${step.func}
                </div>
            `;
        } else if (step.type === 'webapi') {
            document.querySelector('#web-apis').innerHTML += `
                <div class="api-item animate__animated animate__fadeIn">
                    <i class="fas fa-clock"></i> setTimeout()
                </div>
            `;
        }
        
        setTimeout(() => {
            const last = stack.lastElementChild;
            if (last) {
                last.classList.add('animate__animated', 'animate__fadeOut');
                setTimeout(() => last.remove(), 300);
            }
        }, 500);
        
    }, 800);
}

function resetEventLoopDemo() {
    document.querySelector('#stack-content').innerHTML = '';
    document.querySelector('#web-apis').innerHTML = '';
    document.querySelector('#micro-queue').innerHTML = '';
    document.querySelector('#macro-queue').innerHTML = '';
    eventLoopRunning = false;
}

let threadDemoRunning = false;

function startThreadDemo() {
    if (threadDemoRunning) return;
    threadDemoRunning = true;
    
    let count = 0;
    const max = 10;
    
    const t1 = document.querySelector('#thread-1 .thread-state');
    const t2 = document.querySelector('#thread-2 .thread-state');
    const val = document.querySelector('#count-val');
    
    let running1 = true;
    let running2 = true;
    
    const worker1 = setInterval(() => {
        if (count >= max || !running1) {
            clearInterval(worker1);
            t1.textContent = 'Done';
            return;
        }
        t1.textContent = 'Running';
        let temp = count;
        temp++;
        setTimeout(() => {
            count = temp;
            val.textContent = count;
        }, 100);
    }, 100);
    
    const worker2 = setInterval(() => {
        if (count >= max || !running2) {
            clearInterval(worker2);
            t2.textContent = 'Done';
            return;
        }
        t2.textContent = 'Running';
        let temp = count;
        temp++;
        setTimeout(() => {
            count = temp;
            val.textContent = count;
        }, 100);
    }, 100);
    
    setTimeout(() => {
        running1 = running2 = false;
        threadDemoRunning = false;
    }, 2000);
}

function startThreadDemoSync() {
    document.querySelector('#count-val').textContent = '0';
    document.querySelector('#thread-1 .thread-state').textContent = 'Ready';
    document.querySelector('#thread-2 .thread-state').textContent = 'Ready';
    startThreadDemo();
}

function startTcpDemo() {
    const log = document.querySelector('#tcp-log');
    const arrows = document.querySelector('#tcp-arrows');
    const client = document.querySelector('#client-side .client-state');
    const server = document.querySelector('#server-side .client-state');
    
    let step = 0;
    
    const steps = [
        { client: 'SYN_SENT', server: 'LISTEN', arrow: 'SYN', log: 'Client: SYN to Server' },
        { client: 'SYN_SENT', server: 'SYN_RCVD', arrow: 'SYN+ACK', log: 'Server: SYN+ACK to Client' },
        { client: 'ESTABLISHED', server: 'ESTABLISHED', arrow: 'ACK', log: 'Client: ACK, Connection Established' }
    ];
    
    const executeStep = () => {
        if (step >= steps.length) return;
        
        const s = steps[step];
        client.textContent = s.client;
        server.textContent = s.server;
        
        const arrowClass = step === 0 ? 'left-right' : (step === 1 ? 'right-left' : 'left-right');
        arrows.innerHTML = `
            <div class="tcp-arrow ${arrowClass} animate__animated animate__fadeIn">
                ${s.arrow}
            </div>
        `;
        
        log.innerHTML += `<div class="log-entry animate__animated animate__fadeInUp">
            <i class="fas fa-check-circle" style="color: var(--success-color);"></i> ${s.log}
        </div>`;
        
        step++;
        
        if (step < steps.length) {
            setTimeout(executeStep, 1000);
        }
    };
    
    log.innerHTML = '';
    executeStep();
}

function doQuery() {
    const q = document.querySelector('#query-input').value;
    const cache = document.querySelector('#cache-data');
    const result = document.querySelector('#query-result');
    
    if (!q) return;
    
    const found = cache.innerHTML.includes(q);
    
    if (found) {
        result.innerHTML = `
            <div class="result-box success animate__animated animate__fadeIn">
                <i class="fas fa-check"></i> Cache Hit!
                <p>Found in cache</p>
            </div>
        `;
    } else {
        result.innerHTML = `
            <div class="result-box animate__animated animate__fadeIn">
                <i class="fas fa-database"></i> Cache Miss!
                <p>Fetching from database...</p>
            </div>
        `;
        setTimeout(() => {
            result.innerHTML += `
                <div class="query-step animate__animated animate__fadeIn">
                    <i class="fas fa-arrow-down"></i> Writing back to cache
                </div>
            `;
            cache.innerHTML += `
                <div class="cache-item animate__animated animate__fadeIn">${q}: Data</div>
            `;
        }, 600);
    }
}

function setupListeners() {
    window.addEventListener('hashchange', () => {
        const page = window.location.hash.slice(1);
        navigate(page);
    });
    
    if (window.location.hash) {
        navigate(window.location.hash.slice(1));
    } else {
        navigate('home');
    }
}

document.addEventListener('DOMContentLoaded', setupListeners);
window.navigate = navigate;
window.closeModal = closeModal;
window.showAnimation = showAnimation;
window.startEventLoopDemo = startEventLoopDemo;
window.startThreadDemo = startThreadDemo;
window.startTcpDemo = startTcpDemo;
window.doQuery = doQuery;

// ========== 新增动画演示 ==========

function renderSortDemo(container) {
    container.innerHTML = \`
        <h3>快速排序 Quick Sort</h3>
        <div class="sort-demo">
            <div class="bars-container" id="bars-container"></div>
            <div class="sort-info">
                <p>基准选择 &rarr; 分区 &rarr; 递归排序</p>
            </div>
        </div>
        <div class="demo-controls">
            <button class="btn-primary" onclick="startSortDemo()">
                <i class="fas fa-play"></i> 开始排序
            </button>
            <button class="btn-outline" onclick="resetSortDemo()">
                <i class="fas fa-redo"></i> 重置
            </button>
        </div>
    \`;
    initSortDemo();
}

let sortData = [];

function initSortDemo() {
    sortData = [6, 2, 8, 4, 10, 3, 7, 1, 9, 5];
    renderSortBars(sortData, []);
}

function renderSortBars(data, highlights) {
    const container = document.querySelector('#bars-container');
    container.innerHTML = data.map((val, idx) => \`
        <div class="bar \${highlights.includes(idx) ? 'active' : ''}" 
             style="height: \${val * 25}px;">
            \${val}
        </div>
    \`).join('');
}

async function startSortDemo() {
    await quickSort(sortData, 0, sortData.length - 1);
}

async function quickSort(arr, left, right) {
    if (left < right) {
        const pivotIdx = await partition(arr, left, right);
        await Promise.all([
            quickSort(arr, left, pivotIdx - 1),
            quickSort(arr, pivotIdx + 1, right)
        ]);
    }
}

async function partition(arr, left, right) {
    const pivot = arr[right];
    let i = left - 1;
    for (let j = left; j < right; j++) {
        renderSortBars(arr, [right, j]);
        await sleep(300);
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    renderSortBars(arr, [i + 1]);
    await sleep(300);
    return i + 1;
}

function resetSortDemo() {
    initSortDemo();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function renderDistributedLockDemo(container) {
    container.innerHTML = \`
        <h3>Redis 分布式锁</h3>
        <div class="lock-demo">
            <div class="lock-grid">
                <div class="lock-node" id="client-a">
                    <i class="fas fa-laptop-code"></i> Client A
                    <div class="node-state">Pending</div>
                </div>
                <div class="lock-node redis-node">
                    <i class="fas fa-server"></i> Redis
                    <div class="lock-key" id="lock-key">
                        <i class="fas fa-lock-open"></i> Available
                    </div>
                </div>
                <div class="lock-node" id="client-b">
                    <i class="fas fa-laptop-code"></i> Client B
                    <div class="node-state">Pending</div>
                </div>
            </div>
            <div class="lock-log" id="lock-log">
                <div class="log-entry">等待开始...</div>
            </div>
        </div>
        <div class="demo-controls">
            <button class="btn-primary" onclick="startLockDemo()">
                <i class="fas fa-play"></i> 竞争锁
            </button>
            <button class="btn-outline" onclick="resetLockDemo()">
                <i class="fas fa-redo"></i> 重置
            </button>
        </div>
    \`;
}

function startLockDemo() {
    const log = document.querySelector('#lock-log');
    const key = document.querySelector('#lock-key');
    const a = document.querySelector('#client-a .node-state');
    const b = document.querySelector('#client-b .node-state');
    
    log.innerHTML = '';
    let step = 0;
    
    const steps = [
        { msg: 'Client A: SETNX lock "order:123"', actor: 'a', lock: true },
        { msg: 'Client A: 获取锁成功！执行业务...', actor: 'a', state: 'Running' },
        { msg: 'Client B: SETNX lock "order:123"', actor: 'b', lock: false },
        { msg: 'Client B: 获取失败，等待重试...', actor: 'b', state: 'Waiting' },
        { msg: 'Client A: 业务执行完毕，DEL lock', actor: 'a', state: 'Done', unlock: true },
        { msg: 'Client B: 获取锁成功！执行...', actor: 'b', state: 'Running' },
        { msg: 'Client B: 执行完毕，释放锁', actor: 'b', state: 'Done', unlock: true }
    ];
    
    const run = () => {
        if (step >= steps.length) return;
        const s = steps[step];
        
        if (s.actor === 'a') a.textContent = s.state || a.textContent;
        if (s.actor === 'b') b.textContent = s.state || b.textContent;
        
        if (s.lock) key.innerHTML = '<i class="fas fa-lock"></i> Locked by Client A';
        if (s.unlock) key.innerHTML = '<i class="fas fa-lock-open"></i> Available';
        
        log.innerHTML += \`
            <div class="log-entry animate__animated animate__fadeInUp">
                <i class="fas fa-check-circle"></i> \${s.msg}
            </div>
        \`;
        
        step++;
        setTimeout(run, 1000);
    };
    
    run();
}

function resetLockDemo() {
    renderDistributedLockDemo(document.querySelector('#animation-modal .demo-container'));
}

function renderConsistentHashDemo(container) {
    container.innerHTML = \`
        <h3>一致性哈希 Consistent Hashing</h3>
        <div class="hash-demo">
            <div class="hash-ring" id="hash-ring"></div>
            <div class="hash-nodes">
                <div class="server-node">Server 1</div>
                <div class="server-node">Server 2</div>
                <div class="server-node">Server 3</div>
            </div>
            <div class="hash-info" id="hash-info">
                点击哈希环上的位置，查看数据分配到哪个服务器
            </div>
        </div>
        <div class="demo-controls">
            <button class="btn-primary" onclick="addNode()">
                <i class="fas fa-plus"></i> 添加服务器
            </button>
            <button class="btn-outline" onclick="removeNode()">
                <i class="fas fa-minus"></i> 移除服务器
            </button>
        </div>
    \`;
}

function renderHighConcurrencyDemo(container) {
    container.innerHTML = \`
        <h3>高并发处理流程</h3>
        <div class="concurrency-demo">
            <div class="concurrency-flow">
                <div class="flow-step">
                    <i class="fas fa-users"></i>
                    <div class="step-title">流量入口</div>
                    <div class="step-desc">大量请求涌入</div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                    <i class="fas fa-filter"></i>
                    <div class="step-title">限流层</div>
                    <div class="step-desc">令牌桶算法</div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                    <i class="fas fa-brain"></i>
                    <div class="step-title">缓存层</div>
                    <div class="step-desc">Redis 95%+ 命中率</div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                    <i class="fas fa-database"></i>
                    <div class="step-title">数据库</div>
                    <div class="step-desc">主从读写分离</div>
                </div>
            </div>
        </div>
        <div class="demo-controls">
            <button class="btn-primary" onclick="startConcurrencyDemo()">
                <i class="fas fa-bolt"></i> 模拟流量
            </button>
        </div>
    \`;
}

function startConcurrencyDemo() {
    const steps = document.querySelectorAll('.concurrency-demo .flow-step');
    let index = 0;
    const animate = () => {
        if (index < steps.length) {
            steps[index].classList.add('animate__animated', 'animate__pulse');
            index++;
            setTimeout(animate, 500);
        } else {
            steps.forEach(s => s.classList.remove('animate__animated', 'animate__pulse'));
            index = 0;
        }
    };
    animate();
}

function renderMicroServicesDemo(container) {
    container.innerHTML = \`
        <h3>微服务架构</h3>
        <div class="microservices-demo">
            <div class="gateway">
                <i class="fas fa-traffic-light"></i> API Gateway
            </div>
            <div class="services-grid">
                <div class="service-box">
                    <i class="fas fa-user"></i> User Service
                </div>
                <div class="service-box">
                    <i class="fas fa-shopping-cart"></i> Order Service
                </div>
                <div class="service-box">
                    <i class="fas fa-credit-card"></i> Payment Service
                </div>
            </div>
            <div class="infra-grid">
                <div class="infra-box">
                    <i class="fas fa-route"></i> Service Discovery
                </div>
                <div class="infra-box">
                    <i class="fas fa-sliders-h"></i> Config Center
                </div>
                <div class="infra-box">
                    <i class="fas fa-link"></i> Message Queue
                </div>
            </div>
        </div>
        <div class="demo-controls">
            <button class="btn-primary" onclick="startMicroDemo()">
                <i class="fas fa-exchange-alt"></i> 调用演示
            </button>
        </div>
    \`;
}

function startMicroDemo() {
    const services = document.querySelectorAll('.microservices-demo .service-box');
    let index = 0;
    const animate = () => {
        if (index > 0) services[index-1].classList.remove('active');
        if (index < services.length) {
            services[index].classList.add('active');
            index++;
            setTimeout(animate, 600);
        }
    };
    animate();
}

window.startSortDemo = startSortDemo;
window.resetSortDemo = resetSortDemo;
window.startLockDemo = startLockDemo;
window.resetLockDemo = resetLockDemo;
window.startConcurrencyDemo = startConcurrencyDemo;
window.startMicroDemo = startMicroDemo;
