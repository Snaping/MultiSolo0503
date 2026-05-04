(function() {
    'use strict';

    const state = {
        currentCategory: null,
        currentTopic: null,
        searchQuery: '',
        viewMode: 'card',
        masteredTopics: new Set(),
        favoriteTopics: new Set(),
        topics: []
    };

    const elements = {
        categoryNav: document.getElementById('categoryNav'),
        topicsContainer: document.getElementById('topicsContainer'),
        currentCategory: document.getElementById('currentCategory'),
        searchInput: document.getElementById('searchInput'),
        cardViewBtn: document.getElementById('cardViewBtn'),
        listViewBtn: document.getElementById('listViewBtn'),
        topicModal: document.getElementById('topicModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        modalClose: document.getElementById('modalClose'),
        markMastered: document.getElementById('markMastered'),
        nextTopic: document.getElementById('nextTopic'),
        animationDemo: document.getElementById('animationDemo'),
        demoContent: document.getElementById('demoContent'),
        demoClose: document.getElementById('demoClose'),
        masteredCount: document.getElementById('masteredCount'),
        pendingCount: document.getElementById('pendingCount'),
        totalCount: document.getElementById('totalCount'),
        mobileMenuBtn: document.getElementById('mobileMenuBtn'),
        sidebar: document.getElementById('sidebar'),
        emptyState: document.getElementById('emptyState')
    };

    function init() {
        loadStateFromStorage();
        renderCategories();
        setupEventListeners();
        updateStats();
        
        if (window.interviewData && window.interviewData.length > 0) {
            selectCategory(0);
        }
    }

    function loadStateFromStorage() {
        try {
            const saved = localStorage.getItem('interviewState');
            if (saved) {
                const parsed = JSON.parse(saved);
                state.masteredTopics = new Set(parsed.masteredTopics || []);
                state.favoriteTopics = new Set(parsed.favoriteTopics || []);
            }
        } catch (e) {
            console.warn('Failed to load state from storage');
        }
    }

    function saveStateToStorage() {
        try {
            localStorage.setItem('interviewState', JSON.stringify({
                masteredTopics: Array.from(state.masteredTopics),
                favoriteTopics: Array.from(state.favoriteTopics)
            }));
        } catch (e) {
            console.warn('Failed to save state to storage');
        }
    }

    function renderCategories() {
        const navHTML = window.interviewData.map((cat, index) => `
            <div class="category-item" data-index="${index}">
                <i class="${cat.icon}" style="color: ${cat.color}"></i>
                <span>${cat.category}</span>
                <span class="count">${cat.topics.length}</span>
            </div>
        `).join('');

        elements.categoryNav.innerHTML = navHTML;
    }

    function selectCategory(index) {
        const categories = document.querySelectorAll('.category-item');
        categories.forEach(cat => cat.classList.remove('active'));
        categories[index].classList.add('active');

        state.currentCategory = index;
        state.topics = window.interviewData[index].topics;
        
        const category = window.interviewData[index];
        elements.currentCategory.innerHTML = `
            <i class="${category.icon}" style="color: ${category.color}"></i>
            <span>${category.category}</span>
        `;

        renderTopics();
    }

    function renderTopics() {
        const filteredTopics = filterTopics();

        if (filteredTopics.length === 0) {
            elements.topicsContainer.innerHTML = '';
            elements.emptyState.style.display = 'block';
            return;
        }

        elements.emptyState.style.display = 'none';

        const topicsHTML = filteredTopics.map((topic, index) => {
            const isMastered = state.masteredTopics.has(topic.id);
            const isFavorite = state.favoriteTopics.has(topic.id);

            return `
                <div class="topic-card ${isMastered ? 'mastered' : ''}" 
                     data-id="${topic.id}" 
                     style="animation-delay: ${index * 0.05}s">
                    <div class="topic-card-header">
                        <span class="importance-badge ${topic.importance}">${getImportanceText(topic.importance)}</span>
                        <h3 class="topic-card-title">
                            <i class="fas fa-file-alt"></i>
                            ${highlightText(topic.title)}
                        </h3>
                        <div class="topic-card-meta">
                            <span><i class="fas fa-chart-bar"></i> 频率: ${'★'.repeat(topic.frequency)}</span>
                        </div>
                    </div>
                    <div class="topic-card-body">
                        <p class="topic-card-summary">${highlightText(topic.summary)}</p>
                    </div>
                    <div class="topic-card-footer">
                        <div class="topic-tags">
                            ${topic.tags ? topic.tags.slice(0, 3).map(tag => 
                                `<span class="topic-tag">${highlightText(tag)}</span>`
                            ).join('') : ''}
                        </div>
                        <div class="topic-actions">
                            <button class="topic-action-btn ${isFavorite ? 'active' : ''}" 
                                    onclick="event.stopPropagation(); toggleFavorite('${topic.id}')"
                                    title="收藏">
                                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                            </button>
                            <button class="topic-action-btn" onclick="event.stopPropagation(); openAnimation('${topic.animation}')" title="动画演示">
                                <i class="fas fa-play-circle"></i>
                            </button>
                            <button class="topic-action-btn ${isMastered ? 'mastered' : ''}" 
                                    onclick="event.stopPropagation(); toggleMastered('${topic.id}')"
                                    title="标记掌握">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        elements.topicsContainer.innerHTML = topicsHTML;

        document.querySelectorAll('.topic-card').forEach(card => {
            card.addEventListener('click', () => openTopicDetail(card.dataset.id));
        });
    }

    function filterTopics() {
        if (!state.searchQuery) return state.topics;

        const query = state.searchQuery.toLowerCase();
        return state.topics.filter(topic => 
            topic.title.toLowerCase().includes(query) ||
            topic.summary.toLowerCase().includes(query) ||
            topic.content.toLowerCase().includes(query)
        );
    }

    function highlightText(text) {
        if (!state.searchQuery) return text;

        const regex = new RegExp(`(${escapeRegex(state.searchQuery)})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function getImportanceText(importance) {
        const map = { high: '高频', medium: '中频', low: '低频' };
        return map[importance] || importance;
    }

    function openTopicDetail(topicId) {
        const topic = state.topics.find(t => t.id === topicId);
        if (!topic) return;

        state.currentTopic = topic;

        elements.modalTitle.textContent = topic.title;
        
        const isMastered = state.masteredTopics.has(topic.id);
        elements.markMastered.classList.toggle('active', isMastered);
        elements.markMastered.innerHTML = isMastered 
            ? '<i class="fas fa-check-circle"></i> 已掌握' 
            : '<i class="fas fa-check"></i> 标记已掌握';

        elements.modalBody.innerHTML = `
            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> 知识点概述</h3>
                ${topic.content}
            </div>
            
            ${topic.codeExample ? `
            <div class="modal-section">
                <h3><i class="fas fa-code"></i> 代码示例</h3>
                <div class="code-block">
                    <div class="code-block-header">
                        <i class="fas fa-file-code"></i> 示例代码
                    </div>
                    <pre><code class="language-javascript">${escapeHtml(topic.codeExample)}</code></pre>
                </div>
            </div>
            ` : ''}
            
            <div class="modal-section">
                <h3><i class="fas fa-chart-bar"></i> 面试频率</h3>
                <div class="frequency-chart">
                    ${renderFrequencyChart(topic.frequency)}
                </div>
            </div>
            
            ${topic.animation ? `
            <div class="modal-section">
                <h3><i class="fas fa-play-circle"></i> 原理动画</h3>
                <button class="btn btn-primary" onclick="openAnimation('${topic.animation}')">
                    <i class="fas fa-play"></i> 播放动画演示
                </button>
            </div>
            ` : ''}
        `;

        Prism.highlightAllUnder(elements.modalBody);

        elements.topicModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function renderFrequencyChart(frequency) {
        const maxFrequency = 5;
        const percentage = (frequency / maxFrequency) * 100;

        return `
            <div class="frequency-bar">
                <span class="frequency-label">面试频率</span>
                <div class="frequency-track">
                    <div class="frequency-fill" style="width: 0%">
                        <span class="frequency-value">${frequency}/${maxFrequency}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function closeModal() {
        elements.topicModal.classList.remove('active');
        document.body.style.overflow = '';
        state.currentTopic = null;
    }

    function toggleMastered(topicId) {
        if (state.masteredTopics.has(topicId)) {
            state.masteredTopics.delete(topicId);
        } else {
            state.masteredTopics.add(topicId);
        }
        saveStateToStorage();
        updateStats();
        renderTopics();
        
        if (state.currentTopic && state.currentTopic.id === topicId) {
            const isMastered = state.masteredTopics.has(topicId);
            elements.markMastered.classList.toggle('active', isMastered);
            elements.markMastered.innerHTML = isMastered 
                ? '<i class="fas fa-check-circle"></i> 已掌握' 
                : '<i class="fas fa-check"></i> 标记已掌握';
        }

        showToast(state.masteredTopics.has(topicId) ? '已标记为掌握' : '已取消标记', 'success');
    }

    function toggleFavorite(topicId) {
        if (state.favoriteTopics.has(topicId)) {
            state.favoriteTopics.delete(topicId);
            showToast('已取消收藏', 'success');
        } else {
            state.favoriteTopics.add(topicId);
            showToast('已添加收藏', 'success');
        }
        saveStateToStorage();
        renderTopics();
    }

    function nextTopic() {
        const currentIndex = state.topics.findIndex(t => t.id === state.currentTopic?.id);
        const nextIndex = (currentIndex + 1) % state.topics.length;
        openTopicDetail(state.topics[nextIndex].id);
    }

    function openAnimation(animationType) {
        if (!animationType) return;

        const demoContent = getAnimationContent(animationType);
        elements.demoContent.innerHTML = demoContent;
        elements.animationDemo.classList.add('active');

        setTimeout(() => {
            const fill = elements.demoContent.querySelector('.frequency-fill');
            if (fill) {
                fill.style.width = '100%';
            }
        }, 100);
    }

    function closeAnimation() {
        elements.animationDemo.classList.remove('active');
    }

    function getAnimationContent(animationType) {
        const demos = {
            'scope-demo': `
                <div class="scope-visual">
                    <div class="scope-block global">
                        <strong>全局作用域</strong>
                        <div>
                            <span class="scope-var">globalVar</span>
                        </div>
                    </div>
                    <div class="scope-block local">
                        <strong>函数作用域 (outer)</strong>
                        <div>
                            <span class="scope-var">outerVar</span>
                        </div>
                    </div>
                    <div class="scope-block local">
                        <strong>函数作用域 (inner)</strong>
                        <div>
                            <span class="scope-var highlight">innerVar</span>
                        </div>
                    </div>
                </div>
            `,
            'event-loop-demo': `
                <div class="event-loop-demo">
                    <div class="call-stack">
                        <h4>调用栈 (Call Stack)</h4>
                        <div class="demo-task" style="background: #52c41a;">console.log('1 - Sync')</div>
                        <div class="demo-task" style="background: #1890ff;">console.log('5 - Sync')</div>
                    </div>
                    <div class="task-queue">
                        <h4>微任务队列 (Microtask Queue)</h4>
                        <div class="demo-task" style="background: #722ed1;">Promise.then (3)</div>
                        <div class="demo-task" style="background: #722ed1;">Promise.then (4)</div>
                    </div>
                    <div class="web-apis">
                        <h4>宏任务队列 (Macrotask Queue)</h4>
                        <div class="demo-task" style="background: #fa541c;">setTimeout (2)</div>
                    </div>
                </div>
                <p style="margin-top: 16px; font-size: 12px; color: #8c8c8c;">
                    执行顺序: 1 → 5 → 3 → 4 → 2
                </p>
            `,
            'closure-prototype-demo': `
                <div class="prototype-chain-demo">
                    <div class="prototype-level">alice (实例对象)</div>
                    <div class="prototype-connector"></div>
                    <div class="prototype-level">Person.prototype</div>
                    <div class="prototype-connector"></div>
                    <div class="prototype-level">Object.prototype</div>
                    <div class="prototype-connector"></div>
                    <div class="prototype-level">null</div>
                </div>
            `,
            'promise-demo': `
                <div class="promise-chain-demo">
                    <div class="promise-node">new Promise</div>
                    <span class="promise-arrow">→</span>
                    <div class="promise-node then">.then()</div>
                    <span class="promise-arrow">→</span>
                    <div class="promise-node then">.then()</div>
                    <span class="promise-arrow">→</span>
                    <div class="promise-node catch">.catch()</div>
                </div>
            `,
            'box-model-demo': `
                <div style="width: 200px; padding: 20px; border: 5px solid #1890ff; background: #f0f2f5; margin: 0 auto;">
                    <div style="background: white; padding: 10px; text-align: center;">
                        Content Area
                    </div>
                </div>
                <p style="text-align: center; margin-top: 12px; font-size: 12px;">
                    Width = content + padding + border = 200px
                </p>
            `,
            'flex-grid-demo': `
                <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                    <div style="width: 60px; height: 60px; background: #1890ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">1</div>
                    <div style="width: 60px; height: 60px; background: #52c41a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">2</div>
                    <div style="width: 60px; height: 60px; background: #faad14; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">3</div>
                </div>
            `,
            'virtual-dom-demo': `
                <div style="display: flex; gap: 20px; justify-content: center; align-items: center;">
                    <div style="text-align: center;">
                        <div style="padding: 16px; background: #f0f2f5; border-radius: 8px; font-size: 12px;">
                            <div style="color: #1890ff;">div</div>
                            <div style="margin-left: 20px; color: #52c41a;">h1 "Hello"</div>
                            <div style="margin-left: 20px; color: #faad14;">button "Click"</div>
                        </div>
                        <p style="margin-top: 8px; font-size: 11px;">虚拟DOM</p>
                    </div>
                    <span style="font-size: 24px; color: #8c8c8c;">→</span>
                    <div style="text-align: center;">
                        <div style="padding: 16px; background: #1890ff; border-radius: 8px; font-size: 12px; color: white;">
                            真实DOM
                        </div>
                        <p style="margin-top: 8px; font-size: 11px;">更新</p>
                    </div>
                </div>
            `,
            'vue-reactivity-demo': `
                <div class="heap-visual">
                    <div class="heap-object">
                        <div class="obj-name">reactive</div>
                        <div class="obj-props">count: 0<br>name: "Alice"</div>
                    </div>
                    <div class="heap-object">
                        <div class="obj-name">ref</div>
                        <div class="obj-props">value: 1</div>
                    </div>
                    <div class="heap-object">
                        <div class="obj-name">computed</div>
                        <div class="obj-props">value: 2</div>
                    </div>
                </div>
            `,
            'default': `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-play-circle" style="font-size: 48px; color: #1890ff; margin-bottom: 16px;"></i>
                    <p>动画演示区域</p>
                </div>
            `
        };

        return demos[animationType] || demos['default'];
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function updateStats() {
        let total = 0;
        window.interviewData.forEach(cat => {
            total += cat.topics.length;
        });

        elements.totalCount.textContent = total;
        elements.masteredCount.textContent = state.masteredTopics.size;
        elements.pendingCount.textContent = total - state.masteredTopics.size;
    }

    function showToast(message, type = 'success') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    function toggleViewMode(mode) {
        state.viewMode = mode;
        elements.cardViewBtn.classList.toggle('active', mode === 'card');
        elements.listViewBtn.classList.toggle('active', mode === 'list');
        document.getElementById('app').classList.toggle('list-view', mode === 'list');
    }

    function toggleMobileMenu() {
        elements.sidebar.classList.toggle('active');
    }

    function handleSearch(e) {
        state.searchQuery = e.target.value.trim();
        if (state.topics.length > 0) {
            renderTopics();
        }
    }

    function setupEventListeners() {
        elements.categoryNav.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem) {
                selectCategory(parseInt(categoryItem.dataset.index));
                if (window.innerWidth < 768) {
                    elements.sidebar.classList.remove('active');
                }
            }
        });

        elements.searchInput.addEventListener('input', handleSearch);

        elements.cardViewBtn.addEventListener('click', () => toggleViewMode('card'));
        elements.listViewBtn.addEventListener('click', () => toggleViewMode('list'));

        elements.modalClose.addEventListener('click', closeModal);
        elements.topicModal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        elements.markMastered.addEventListener('click', () => {
            if (state.currentTopic) {
                toggleMastered(state.currentTopic.id);
            }
        });

        elements.nextTopic.addEventListener('click', nextTopic);

        elements.demoClose.addEventListener('click', closeAnimation);

        elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
                closeAnimation();
            }
        });

        window.toggleMastered = toggleMastered;
        window.toggleFavorite = toggleFavorite;
        window.openAnimation = openAnimation;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
