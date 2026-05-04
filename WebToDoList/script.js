const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const imageInput = document.getElementById('imageInput');
const exportBtn = document.getElementById('exportBtn');

let todos = [];
let pendingImages = [];

function loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
        renderTodos();
    } else {
        initializeDefaultTodos();
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function initializeDefaultTodos() {
    todos = [
        {
            text: "完成项目报告",
            completed: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            images: []
        },
        {
            text: "学习 React 框架",
            completed: true,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            images: []
        },
        {
            text: "准备下周演示文稿",
            completed: false,
            createdAt: new Date().toISOString(),
            images: []
        }
    ];
    saveTodos();
    renderTodos();
}

function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.textContent = '暂无待办事项，添加一个吧！';
        todoList.appendChild(emptyState);
        return;
    }

    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    sortedTodos.forEach((todo, originalIndex) => {
        const index = todos.indexOf(todo);
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const mainDiv = document.createElement('div');
        mainDiv.className = 'todo-main';

        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.innerHTML = todo.completed ? '✓' : '○';
        completeBtn.addEventListener('click', () => toggleComplete(index));

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;
        textSpan.addEventListener('click', () => toggleComplete(index));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '✕';
        deleteBtn.addEventListener('click', () => deleteTodo(index));

        mainDiv.appendChild(completeBtn);
        mainDiv.appendChild(textSpan);
        mainDiv.appendChild(deleteBtn);
        li.appendChild(mainDiv);

        if (todo.images && todo.images.length > 0) {
            const imagesDiv = document.createElement('div');
            imagesDiv.className = 'todo-images';

            todo.images.forEach((imgData, imgIndex) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'todo-image';

                const img = document.createElement('img');
                img.src = imgData;
                img.addEventListener('click', () => showModal(imgData));

                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '✕';
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeImage(index, imgIndex);
                });

                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                imagesDiv.appendChild(imgContainer);
            });

            li.appendChild(imagesDiv);
        }

        todoList.appendChild(li);
    });
}

function showModal(src) {
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `<img src="${src}" alt="预览图片">`;
    modal.addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;

    const newTodo = {
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        images: [...pendingImages]
    };

    todos.push(newTodo);
    pendingImages = [];
    imageInput.value = '';

    todoInput.value = '';
    saveTodos();
    renderTodos();
}

function toggleComplete(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

function removeImage(todoIndex, imageIndex) {
    todos[todoIndex].images.splice(imageIndex, 1);
    saveTodos();
    renderTodos();
}

imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            pendingImages.push(event.target.result);
            renderTodos();
        };
        reader.readAsDataURL(file);
    });
});

exportBtn.addEventListener('click', exportToMarkdown);

function exportToMarkdown() {
    const sortedTodos = [...todos].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN');
    const timeStr = now.toLocaleTimeString('zh-CN');

    let markdown = `# 待办事项列表\n\n`;
    markdown += `> 生成时间：${dateStr} ${timeStr}\n\n`;
    markdown += `---\n\n`;

    const completed = sortedTodos.filter(t => t.completed);
    const pending = sortedTodos.filter(t => !t.completed);

    if (pending.length > 0) {
        markdown += `## 📋 待完成 (${pending.length})\n\n`;
        pending.forEach((todo, index) => {
            markdown += `### ${index + 1}. ${todo.text}\n`;
            markdown += `- 创建时间：${new Date(todo.createdAt).toLocaleString('zh-CN')}\n`;
            markdown += `- 状态：⏳ 进行中\n`;
            if (todo.images && todo.images.length > 0) {
                markdown += `- 图片附件：\n`;
                todo.images.forEach(img => {
                    markdown += `  ![附件图片](${img})\n`;
                });
            }
            markdown += `\n`;
        });
    }

    if (completed.length > 0) {
        markdown += `## ✅ 已完成 (${completed.length})\n\n`;
        completed.forEach((todo, index) => {
            markdown += `### ${index + 1}. ~~${todo.text}~~\n`;
            markdown += `- 创建时间：${new Date(todo.createdAt).toLocaleString('zh-CN')}\n`;
            markdown += `- 状态：✔️ 已完成\n`;
            if (todo.images && todo.images.length > 0) {
                markdown += `- 图片附件：\n`;
                todo.images.forEach(img => {
                    markdown += `  ![附件图片](${img})\n`;
                });
            }
            markdown += `\n`;
        });
    }

    markdown += `---\n\n`;
    markdown += `*本文件由待办事项应用自动生成*\n`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `待办事项_${dateStr.replace(/\//g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const filename = `待办事项_${dateStr.replace(/\//g, '-')}.md`;
    saveMarkdownToServer(filename, markdown);
}

async function saveMarkdownToServer(filename, content) {
    try {
        const response = await fetch('/api/save-markdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename, content })
        });
        const result = await response.json();
        if (result.success) {
            console.log('Markdown文件已保存到服务器:', result.filepath);
        }
    } catch (error) {
        console.log('保存到服务器失败，将仅下载文件');
    }
}

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

loadTodos();