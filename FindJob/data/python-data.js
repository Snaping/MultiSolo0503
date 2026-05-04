const pythonTopics = [
    {
        id: 'decorator',
        title: '装饰器 Decorator',
        icon: 'fa-gem',
        category: 'Core',
        difficulty: 'high',
        frequency: 5,
        summary: '装饰器是高阶函数，用于在不修改原函数情况下增强功能',
        content: `
            <p><strong>装饰器原理：</strong></p>
            <p>@decorator 等价于 func = decorator(func)</p>
            
            <p><strong>应用场景：</strong></p>
            <ul>
                <li>日志记录</li>
                <li>性能计时</li>
                <li>权限验证</li>
                <li>缓存</li>
            </ul>
        `,
        codeExample: `# 简单装饰器
def timer(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__}: {time.time() - start:.4f}s")
        return result
    return wrapper

@timer
def compute():
    return sum(i for i in range(1000000))

# 带参数装饰器
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet():
    print("Hello")
`,
        animation: 'decorator'
    },
    {
        id: 'async-await',
        title: 'asyncio 异步编程',
        icon: 'fa-bolt',
        category: 'Async',
        difficulty: 'high',
        frequency: 4,
        summary: 'async/await 协程，高性能I/O并发',
        content: `
            <p><strong>核心概念：</strong></p>
            <ul>
                <li>coroutine - async 声明的函数</li>
                <li>event loop - 事件循环</li>
                <li>task - 并发任务调度</li>
            </ul>
        `,
        codeExample: `import asyncio

async def say_hello(name, delay):
    await asyncio.sleep(delay)
    print(f"Hello {name}!")

async def main():
    # 并发执行
    await asyncio.gather(
        say_hello("Alice", 1),
        say_hello("Bob", 2),
        say_hello("Charlie", 1)
    )
    print("All done!")

asyncio.run(main())
`,
        animation: 'asyncio'
    },
    {
        id: 'meta-class',
        title: '元编程与元类',
        icon: 'fa-cube',
        category: 'Advanced',
        difficulty: 'very-high',
        frequency: 3,
        summary: '类的类，用于控制类的创建行为',
        content: `
            <p><strong>元类继承链：</strong></p>
            <p>object ← type ← your_metaclass ← class</p>
        `,
        codeExample: `# type 是类的类
print(type(int))    # type
print(type(type))   # type

# 自定义元类
class Meta(type):
    def __new__(cls, name, bases, attrs):
        print(f"Creating class {name}")
        attrs['added_attr'] = 100
        return super().__new__(cls, name, bases, attrs)

class MyClass(metaclass=Meta):
    pass

print(MyClass.added_attr)  # 100
`,
        animation: 'metaclass'
    }
];

window.pythonTopics = pythonTopics;
