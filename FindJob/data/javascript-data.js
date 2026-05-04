const javascriptTopics = [
    {
        id: 'closure',
        title: '闭包 Closure',
        icon: 'fa-cube',
        category: 'Core',
        difficulty: 'medium',
        frequency: 5,
        summary: '函数能够记住并访问其词法作用域，即使函数在其词法作用域之外被调用',
        content: `
            <p><strong>什么是闭包？</strong></p>
            <p>闭包是指能够访问自由变量的函数，这些变量在其词法作用域中定义，但不在该函数自身内部定义。</p>
            
            <p><strong>核心特点：</strong></p>
            <ul>
                <li>函数嵌套时形成闭包</li>
                <li>内部函数引用外部函数变量</li>
                <li>延长变量生命周期</li>
                <li>实现数据私有化</li>
            </ul>
            
            <p><strong>应用场景：</strong></p>
            <ul>
                <li>计数器、缓存</li>
                <li>函数工厂与偏函数</li>
                <li>模块封装</li>
                <li>事件处理器</li>
            </ul>
        `,
        codeExample: `// 计数器闭包
function makeCounter() {
    let count = 0; // 私有变量
    
    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count
    };
}

const counter = makeCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount(); // 2
// count 无法直接访问

// 闭包实现缓存
function memoize(fn) {
    const cache = {};
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache[key]) return cache[key];
        const result = fn(...args);
        cache[key] = result;
        return result;
    };
}
`,
        animation: 'closure'
    },
    {
        id: 'prototype',
        title: '原型链 Prototype Chain',
        icon: 'fa-link',
        category: 'Core',
        difficulty: 'high',
        frequency: 5,
        summary: 'JavaScript通过原型链实现继承，每个对象都有指向原型的指针',
        content: `
            <p><strong>原型链的工作原理：</strong></p>
            <p>当访问对象属性时，先在对象本身查找，然后沿着__proto__向上查找，直到找到或到达null。</p>
            
            <p><strong>核心规则：</strong></p>
            <ul>
                <li>obj.__proto__ === Constructor.prototype</li>
                <li>所有函数默认有 prototype 属性</li>
                <li>Object.prototype.__proto__ === null</li>
            </ul>
        `,
        codeExample: `function Person(name) {
    this.name = name;
}

Person.prototype.greet = function() {
    return \`Hi, I'm \${this.name}\`;
};

function Student(name, grade) {
    Person.call(this, name);
    this.grade = grade;
}

// 建立原型链继承
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;
Student.prototype.study = function() {
    return 'Studying...';
};

const alice = new Student('Alice', 10);
alice.greet(); // Hi, I'm Alice
alice.study(); // Studying...
`,
        animation: 'prototype-chain'
    },
    {
        id: 'event-loop',
        title: '事件循环 Event Loop',
        icon: 'fa-sync',
        category: 'Async',
        difficulty: 'high',
        frequency: 5,
        summary: 'JS异步机制核心：调用栈 + 微任务队列 + 宏任务队列',
        content: `
            <p><strong>执行顺序（优先级从高到低）：</strong></p>
            <ol>
                <li>同步代码（调用栈）</li>
                <li>微任务（Promise, process.nextTick）</li>
                <li>宏任务（setTimeout, setInterval, I/O）</li>
            </ol>
            
            <p><strong>关键要点：</strong></p>
            <ul>
                <li>同步执行完清空微任务</li>
                <li>每次宏任务执行后再次清空微任务</li>
                <li>requestAnimationFrame 在渲染前执行</li>
            </ul>
        `,
        codeExample: `console.log('1'); // 同步

setTimeout(() => console.log('2'), 0); // 宏任务

Promise.resolve()
    .then(() => console.log('3')) // 微任务
    .then(() => console.log('4')); // 微任务

console.log('5'); // 同步

// 输出顺序: 1 -> 5 -> 3 -> 4 -> 2
`,
        animation: 'event-loop'
    },
    {
        id: 'promise',
        title: 'Promise与异步',
        icon: 'fa-clock',
        category: 'Async',
        difficulty: 'high',
        frequency: 5,
        summary: 'Promise是ES6异步编程方案，解决回调地狱',
        content: `
            <p><strong>Promise 状态：</strong></p>
            <ul>
                <li>pending: 等待中</li>
                <li>fulfilled: 已成功</li>
                <li>rejected: 已失败</li>
            </ul>
            
            <p><strong>常用静态方法：</strong></p>
            <ul>
                <li>Promise.all() - 全部成功才成功</li>
                <li>Promise.race() - 第一个完成</li>
                <li>Promise.any() - 第一个成功</li>
                <li>Promise.allSettled() - 全部完成</li>
            </ul>
        `,
        codeExample: `// Promise 基本使用
function fetchData(url) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (url) {
                resolve({ data: 'Hello' });
            } else {
                reject(new Error('Invalid URL'));
            }
        }, 1000);
    });
}

// async/await 写法
async function process() {
    try {
        const data = await fetchData('url');
        console.log(data);
    } catch (err) {
        console.error(err);
    }
}

// Promise.all
Promise.all([task1(), task2()])
    .then(([r1, r2]) => console.log(r1, r2));
`,
        animation: 'promise'
    },
    {
        id: 'this-binding',
        title: 'this 绑定',
        icon: 'fa-user',
        category: 'Core',
        difficulty: 'high',
        frequency: 4,
        summary: 'this指向取决于函数调用方式，有4种绑定规则',
        content: `
            <p><strong>绑定规则（优先级从高到低）：</strong></p>
            <ol>
                <li>new 绑定：构造函数，this指向新创建对象</li>
                <li>显式绑定：call/apply/bind</li>
                <li>隐式绑定：作为对象方法调用</li>
                <li>默认绑定：独立函数，严格模式 undefined</li>
            </ol>
        `,
        codeExample: `function sayHi() {
    console.log(\`Hi, I'm \${this.name}\`);
}

const alice = { name: 'Alice', sayHi };
const bob = { name: 'Bob' };

sayHi(); // 默认绑定，undefined

alice.sayHi(); // 隐式绑定，Alice

sayHi.call(bob); // 显式绑定，Bob

const bound = sayHi.bind({ name: 'Charlie' });
bound(); // Charlie

function Person(name) {
    this.name = name; // new 绑定
}
const p = new Person('Dave');
`,
        animation: 'this-binding'
    },
    {
        id: 'es6-module',
        title: 'ESModule 模块化',
        icon: 'fa-puzzle-piece',
        category: 'Language',
        difficulty: 'medium',
        frequency: 4,
        summary: 'ESModule是官方标准，支持静态分析和Tree Shaking',
        content: `
            <p><strong>与 CommonJS 区别：</strong></p>
            <ul>
                <li>ESModule 是语法，CommonJS 是运行时</li>
                <li>ESModule 支持静态分析，Tree Shaking</li>
                <li>CommonJS 模块是对象，ESModule 是绑定</li>
            </ul>
        `,
        codeExample: `// 导出
export const add = (a, b) => a + b;
export function subtract(a, b) { return a - b; }

const obj = { a: 1 };
export default obj; // 默认导出

// 导入
import myObj, { add, subtract } from './module.js';
import * as all from './module.js';

// 动态导入
const module = await import('./module.js');
`,
        animation: 'modules'
    },
    {
        id: 'proxy-reflect',
        title: 'Proxy 与 Reflect',
        icon: 'fa-eye',
        category: 'Language',
        difficulty: 'high',
        frequency: 3,
        summary: 'Proxy用于代理对象，Reflect提供统一对象操作API',
        content: `
            <p><strong>Proxy 可拦截的操作：</strong></p>
            <ul>
                <li>get / set - 属性访问</li>
                <li>has - in 运算符</li>
                <li>apply / construct - 函数调用</li>
                <li>getPrototypeOf / setPrototypeOf</li>
            </ul>
        `,
        codeExample: `const handler = {
    get(target, prop) {
        console.log(\`Getting \${prop}\`);
        return Reflect.get(target, prop);
    },
    set(target, prop, value) {
        console.log(\`Setting \${prop} = \${value}\`);
        return Reflect.set(target, prop, value);
    }
};

const obj = { a: 1 };
const proxy = new Proxy(obj, handler);

proxy.a; // 输出 "Getting a"
proxy.b = 2; // 输出 "Setting b = 2"
`,
        animation: 'proxy'
    },
    {
        id: 'generator',
        title: 'Generator 生成器',
        icon: 'fa-spinner',
        category: 'Language',
        difficulty: 'high',
        frequency: 3,
        summary: 'Generator函数使用yield暂停执行，实现懒加载和流程控制',
        content: `
            <p><strong>特点：</strong></p>
            <ul>
                <li>function* 声明函数</li>
                <li>yield 暂停执行</li>
                <li>返回 Iterator 对象</li>
            </ul>
        `,
        codeExample: `function* count() {
    yield 1;
    yield 2;
    yield 3;
}

const iterator = count();
iterator.next(); // { value: 1, done: false }
iterator.next(); // { value: 2, done: false }
iterator.next(); // { value: 3, done: false }
iterator.next(); // { value: undefined, done: true }

// 实现无限序列
function* fibonacci() {
    let a = 0, b = 1;
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}
`,
        animation: 'generator'
    }
];

window.javascriptTopics = javascriptTopics;
