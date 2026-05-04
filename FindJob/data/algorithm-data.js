const algorithmTopics = [
    {
        id: 'sort',
        title: '排序算法',
        icon: 'fa-sort',
        category: 'Algorithm',
        difficulty: 'high',
        frequency: 5,
        summary: '快速排序、归并排序、堆排序等核心排序算法',
        content: `
            <p><strong>经典排序算法：</strong></p>
            <ul>
                <li>快速排序：O(nlogn)，不稳定</li>
                <li>归并排序：O(nlogn)，稳定</li>
                <li>堆排序：O(nlogn)，不稳定</li>
                <li>冒泡排序：O(n²)，稳定</li>
                <li>插入排序：O(n²)，稳定</li>
                <li>选择排序：O(n²)，不稳定</li>
            </ul>
        `,
        codeExample: `// 快速排序
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    
    return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 归并排序
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    const res = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) res.push(left[i++]);
        else res.push(right[j++]);
    }
    return res.concat(left.slice(i), right.slice(j));
}`,
        animation: 'sort'
    },
    {
        id: 'dp',
        title: '动态规划',
        icon: 'fa-calculator',
        category: 'Algorithm',
        difficulty: 'very-high',
        frequency: 5,
        summary: '背包问题、最长子序列、爬楼梯等经典DP问题',
        content: `
            <p><strong>DP核心思想：</strong></p>
            <ul>
                <li>最优子结构：原问题最优解由子问题最优解组成</li>
                <li>重叠子问题：重复求解相同子问题</li>
                <li>状态转移方程：递推关系式</li>
            </ul>
            <p><strong>经典问题：</strong></p>
            <ul>
                <li>爬楼梯</li>
                <li>0-1背包</li>
                <li>最长子序列LCS</li>
                <li>最长递增子序列LIS</li>
            </ul>
        `,
        codeExample: `// 爬楼梯
function climbStairs(n) {
    const dp = new Array(n + 1);
    dp[0] = 1; dp[1] = 1;
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}

// 最长公共子序列 LCS
function LCS(text1, text2) {
    const m = text1.length, n = text2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}`,
        animation: 'dp'
    },
    {
        id: 'tree',
        title: '二叉树与搜索树',
        icon: 'fa-sitemap',
        category: 'Algorithm',
        difficulty: 'high',
        frequency: 5,
        summary: '二叉树遍历、BST、AVL、红黑树',
        content: `
            <p><strong>二叉树遍历：</strong></p>
            <ul>
                <li>前序：根左右</li>
                <li>中序：左根右</li>
                <li>后序：左右根</li>
                <li>层序：逐层遍历</li>
            </ul>
            <p><strong>平衡树：</strong></p>
            <ul>
                <li>AVL：高度差不超过1</li>
                <li>红黑树：非严格平衡，性能更好</li>
            </ul>
        `,
        codeExample: `// 二叉树前序遍历 (递归)
function preOrder(root, result = []) {
    if (!root) return result;
    result.push(root.val);
    preOrder(root.left, result);
    preOrder(root.right, result);
    return result;
}

// 二叉树前序遍历 (迭代)
function preOrderTraversal(root) {
    const stack = [root], result = [];
    while (stack.length) {
        const node = stack.pop();
        if (!node) continue;
        result.push(node.val);
        stack.push(node.right);
        stack.push(node.left);
    }
    return result;
}

// BST查找
function searchBST(root, val) {
    while (root && root.val !== val) {
        root = val < root.val ? root.left : root.right;
    }
    return root;
}`,
        animation: 'tree'
    },
    {
        id: 'graph',
        title: '图算法',
        icon: 'fa-project-diagram',
        category: 'Algorithm',
        difficulty: 'high',
        frequency: 4,
        summary: 'DFS、BFS、最短路径、拓扑排序',
        content: `
            <p><strong>图遍历：</strong></p>
            <ul>
                <li>DFS：深度优先，用栈</li>
                <li>BFS：广度优先，用队列</li>
            </ul>
            <p><strong>最短路径：</strong></p>
            <ul>
                <li>Dijkstra：单源最短路径</li>
                <li>Floyd：多源最短路径</li>
                <li>Bellman-Ford：可处理负权边</li>
            </ul>
        `,
        codeExample: `// BFS 遍历
function bfs(graph, start) {
    const queue = [start], visited = new Set(), result = [];
    
    while (queue.length) {
        const node = queue.shift();
        if (!visited.has(node)) {
            visited.add(node);
            result.push(node);
            for (let neighbor of graph[node]) {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                }
            }
        }
    }
    return result;
}

// 拓扑排序
function topologicalSort(graph) {
    const inDegree = new Map();
    for (let node of graph.keys()) {
        inDegree.set(node, 0);
    }
    for (let neighbors of graph.values()) {
        for (let n of neighbors) {
            inDegree.set(n, inDegree.get(n) + 1);
        }
    }
    
    const queue = [...graph.keys()].filter(n => inDegree.get(n) === 0);
    const result = [];
    
    while (queue.length) {
        const node = queue.shift();
        result.push(node);
        for (let neighbor of graph.get(node)) {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) {
                queue.push(neighbor);
            }
        }
    }
    return result;
}`,
        animation: 'graph'
    },
    {
        id: 'backtrack',
        title: '回溯算法',
        icon: 'fa-redo',
        category: 'Algorithm',
        difficulty: 'high',
        frequency: 4,
        summary: '组合、排列、子集、N皇后问题',
        content: `
            <p><strong>回溯思想：</strong></p>
            <ul>
                <li>暴力搜索的优化形式</li>
                <li>一条路走到底，行不通则回退</li>
                <li>通常用递归实现</li>
            </ul>
            <p><strong>经典问题：</strong></p>
            <ul>
                <li>全排列</li>
                <li>子集</li>
                <li>组合</li>
                <li>N皇后</li>
            </ul>
        `,
        codeExample: `// 全排列
function permute(nums) {
    const result = [];
    
    function backtrack(path, used) {
        if (path.length === nums.length) {
            result.push([...path]);
            return;
        }
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            path.push(nums[i]);
            used[i] = true;
            backtrack(path, used);
            path.pop();
            used[i] = false;
        }
    }
    
    backtrack([], new Array(nums.length).fill(false));
    return result;
}

// 组合
function combine(n, k) {
    const result = [];
    
    function backtrack(start, path) {
        if (path.length === k) {
            result.push([...path]);
            return;
        }
        for (let i = start; i <= n; i++) {
            path.push(i);
            backtrack(i + 1, path);
            path.pop();
        }
    }
    
    backtrack(1, []);
    return result;
}`,
        animation: 'backtrack'
    }
];

window.algorithmTopics = algorithmTopics;