import * as THREE from 'three';

const threeKingdomsData = [
    {
        name: "诸葛亮",
        title: "卧龙先生",
        color: 0x4169e1,
        questions: [
            { question: "我的号是什么？", options: ["凤雏", "卧龙", "冢虎", "幼麟"], correct: 1 },
            { question: "《出师表》是写给谁的？", options: ["刘备", "刘禅", "曹操", "孙权"], correct: 1 },
            { question: "我在什么地方隐居？", options: ["卧龙岗", "赤壁", "成都", "许昌"], correct: 0 }
        ]
    },
    {
        name: "关羽",
        title: "武圣",
        color: 0xdc143c,
        questions: [
            { question: "我的武器是什么？", options: ["丈八蛇矛", "青龙偃月刀", "方天画戟", "双股剑"], correct: 1 },
            { question: "过五关斩六将说的是谁？", options: ["张飞", "赵云", "关羽", "马超"], correct: 2 },
            { question: "我镇守的地方是？", options: ["荆州", "益州", "徐州", "扬州"], correct: 0 }
        ]
    },
    {
        name: "刘备",
        title: "昭烈帝",
        color: 0xffd700,
        questions: [
            { question: "桃园三结义中我排行第几？", options: ["老大", "老二", "老三", "没有参与"], correct: 0 },
            { question: "我建立的国家是？", options: ["魏", "蜀", "吴", "晋"], correct: 1 },
            { question: "三顾茅庐请的是谁？", options: ["曹操", "孙权", "诸葛亮", "周瑜"], correct: 2 }
        ]
    },
    {
        name: "曹操",
        title: "魏武帝",
        color: 0x2f4f4f,
        questions: [
            { question: "挟天子以令诸侯中的天子是谁？", options: ["汉献帝", "汉灵帝", "汉桓帝", "汉少帝"], correct: 0 },
            { question: "我写的《短歌行》中'青青子衿'下一句是？", options: ["悠悠我心", "沉吟至今", "但为君故", "何时可掇"], correct: 0 },
            { question: "赤壁之战中我的对手是谁？", options: ["刘备", "孙权", "孙刘联军", "袁绍"], correct: 2 }
        ]
    },
    {
        name: "孙权",
        title: "吴大帝",
        color: 0x228b22,
        questions: [
            { question: "我继承了谁的基业？", options: ["孙坚", "孙策", "孙皓", "孙亮"], correct: 1 },
            { question: "我的都城在？", options: ["成都", "洛阳", "建业", "许昌"], correct: 2 },
            { question: "谁曾说'生子当如孙仲谋'？", options: ["刘备", "曹操", "诸葛亮", "周瑜"], correct: 1 }
        ]
    },
    {
        name: "周瑜",
        title: "大都督",
        color: 0xff69b4,
        questions: [
            { question: "赤壁之战中我使用了什么计策？", options: ["空城计", "苦肉计", "连环计", "草船借箭"], correct: 1 },
            { question: "我的妻子是谁？", options: ["大乔", "小乔", "孙尚香", "甄姬"], correct: 1 },
            { question: "诸葛亮三气谁？", options: ["鲁肃", "周瑜", "吕蒙", "陆逊"], correct: 1 }
        ]
    },
    {
        name: "张飞",
        title: "燕人张翼德",
        color: 0x000000,
        questions: [
            { question: "我的武器是什么？", options: ["青龙偃月刀", "丈八蛇矛", "双股剑", "龙胆枪"], correct: 1 },
            { question: "我在长坂坡喝退了谁的军队？", options: ["曹操", "孙权", "袁绍", "吕布"], correct: 0 },
            { question: "桃园三结义中我排行第几？", options: ["老大", "老二", "老三", "老四"], correct: 2 }
        ]
    },
    {
        name: "赵云",
        title: "常山赵子龙",
        color: 0xe0e0e0,
        questions: [
            { question: "长坂坡七进七出说的是谁？", options: ["关羽", "张飞", "赵云", "马超"], correct: 2 },
            { question: "我的称号是？", options: ["武圣", "常胜将军", "卧龙", "凤雏"], correct: 1 },
            { question: "我单骑救的是谁？", options: ["刘备", "刘禅", "诸葛亮", "关羽"], correct: 1 }
        ]
    },
    {
        name: "吕布",
        title: "人中吕布",
        color: 0x8b0000,
        questions: [
            { question: "我的坐骑是？", options: ["的卢", "赤兔", "爪黄飞电", "绝影"], correct: 1 },
            { question: "辕门射戟的是谁？", options: ["关羽", "张飞", "吕布", "黄忠"], correct: 2 },
            { question: "我是谁的义子？", options: ["董卓", "王允", "袁绍", "曹操"], correct: 0 }
        ]
    },
    {
        name: "貂蝉",
        title: "绝世美女",
        color: 0xff6eb4,
        questions: [
            { question: "连环计中我离间了谁？", options: ["曹操与刘备", "董卓与吕布", "周瑜与诸葛亮", "孙策与周瑜"], correct: 1 },
            { question: "四大美女中我是？", options: ["沉鱼", "落雁", "闭月", "羞花"], correct: 2 },
            { question: "我的义父王允是什么官职？", options: ["丞相", "太尉", "司徒", "司空"], correct: 2 }
        ]
    }
];

let scene, camera, renderer, player, maze;
let level = 1;
let npcs = [];
let currentTargetNPC = null;
let isDialogOpen = false;
let canMove = true;
let currentYaw = 0;
let targetYaw = 0;
let mazeSize = 15;
let cellSize = 4;
let currentPath = [];
let pathIndex = 0;
let isWalking = false;

document.getElementById('start-btn').addEventListener('click', startGame);

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    init();
    generateLevel();
    animate();
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0a00);
    scene.fog = new THREE.Fog(0x1a0a00, 5, 80);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffd700, 1.2);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff6600, 0.8, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
}

function generateMaze(width, height) {
    const maze = [];
    for (let y = 0; y < height; y++) {
        maze[y] = [];
        for (let x = 0; x < width; x++) {
            maze[y][x] = 1;
        }
    }

    function carve(x, y) {
        maze[y][x] = 0;
        const directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        directions.sort(() => Math.random() - 0.5);

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
                maze[y + dy / 2][x + dx / 2] = 0;
                carve(nx, ny);
            }
        }
    }

    carve(1, 1);
    return maze;
}

function buildMaze(mazeData) {
    const mazeGroup = new THREE.Group();

    const floorGeometry = new THREE.PlaneGeometry(mazeData[0].length * cellSize, mazeData.length * cellSize);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    mazeGroup.add(floor);

    const wallGeometry = new THREE.BoxGeometry(cellSize, cellSize * 2, cellSize);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4033 });

    for (let y = 0; y < mazeData.length; y++) {
        for (let x = 0; x < mazeData[y].length; x++) {
            if (mazeData[y][x] === 1) {
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(
                    (x - mazeData[0].length / 2) * cellSize + cellSize / 2,
                    cellSize,
                    (y - mazeData.length / 2) * cellSize + cellSize / 2
                );
                wall.castShadow = true;
                wall.receiveShadow = true;
                mazeGroup.add(wall);
            }
        }
    }

    const ceilingGeometry = new THREE.PlaneGeometry(mazeData[0].length * cellSize, mazeData.length * cellSize);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x2d1810, side: THREE.DoubleSide });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = cellSize * 2;
    mazeGroup.add(ceiling);

    scene.add(mazeGroup);
    return { mazeGroup, mazeData };
}

function createPlayer() {
    const playerGroup = new THREE.Group();

    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4169e1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    playerGroup.add(body);

    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2;
    head.castShadow = true;
    playerGroup.add(head);

    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 2.05, 0.25);
    playerGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 2.05, 0.25);
    playerGroup.add(rightEye);

    const hairGeometry = new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.1;
    hair.castShadow = true;
    playerGroup.add(hair);

    scene.add(playerGroup);
    return playerGroup;
}

function createNPC(data, position) {
    const npcGroup = new THREE.Group();

    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: data.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    npcGroup.add(body);

    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2;
    head.castShadow = true;
    npcGroup.add(head);

    const beardGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
    const beardMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const beard = new THREE.Mesh(beardGeometry, beardMaterial);
    beard.position.set(0, 1.75, 0.3);
    npcGroup.add(beard);

    const hatGeometry = new THREE.ConeGeometry(0.5, 0.6, 8);
    const hatMaterial = new THREE.MeshStandardMaterial({ color: data.color });
    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.y = 2.5;
    hat.castShadow = true;
    npcGroup.add(hat);

    const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.3 });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 1.5;
    npcGroup.add(glow);

    npcGroup.position.copy(position);
    npcGroup.userData = data;

    const light = new THREE.PointLight(data.color, 0.5, 8);
    light.position.y = 2;
    npcGroup.add(light);

    scene.add(npcGroup);
    return npcGroup;
}

function getEmptyPositions(mazeData) {
    const positions = [];
    for (let y = 0; y < mazeData.length; y++) {
        for (let x = 0; x < mazeData[y].length; x++) {
            if (mazeData[y][x] === 0) {
                positions.push(new THREE.Vector3(
                    (x - mazeData[0].length / 2) * cellSize + cellSize / 2,
                    0,
                    (y - mazeData.length / 2) * cellSize + cellSize / 2
                ));
            }
        }
    }
    return positions;
}

function worldToGrid(worldPos) {
    const mazeData = maze.mazeData;
    const halfWidth = mazeData[0].length / 2;
    const halfHeight = mazeData.length / 2;
    return {
        x: Math.floor((worldPos.x / cellSize) + halfWidth),
        z: Math.floor((worldPos.z / cellSize) + halfHeight)
    };
}

function gridToWorld(gridPos) {
    const mazeData = maze.mazeData;
    const halfWidth = mazeData[0].length / 2;
    const halfHeight = mazeData.length / 2;
    return new THREE.Vector3(
        (gridPos.x - halfWidth) * cellSize + cellSize / 2,
        1.5,
        (gridPos.z - halfHeight) * cellSize + cellSize / 2
    );
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
}

function findPath(startWorld, endWorld) {
    const start = worldToGrid(startWorld);
    const end = worldToGrid(endWorld);
    const mazeData = maze.mazeData;

    if (mazeData[end.z][end.x] === 1) {
        let nearestEmpty = null;
        let minDist = Infinity;
        for (let z = 0; z < mazeData.length; z++) {
            for (let x = 0; x < mazeData[z].length; x++) {
                if (mazeData[z][x] === 0) {
                    const dist = Math.abs(x - end.x) + Math.abs(z - end.z);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestEmpty = { x, z };
                    }
                }
            }
        }
        if (nearestEmpty) {
            end.x = nearestEmpty.x;
            end.z = nearestEmpty.z;
        }
    }

    const openSet = [{ ...start, g: 0, h: heuristic(start, end), f: heuristic(start, end), parent: null }];
    const closedSet = new Set();

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();

        if (current.x === end.x && current.z === end.z) {
            const path = [];
            let node = current;
            while (node) {
                path.unshift(gridToWorld({ x: node.x, z: node.z }));
                node = node.parent;
            }
            return path;
        }

        closedSet.add(`${current.x},${current.z}`);

        const neighbors = [
            { x: current.x + 1, z: current.z },
            { x: current.x - 1, z: current.z },
            { x: current.x, z: current.z + 1 },
            { x: current.x, z: current.z - 1 }
        ];

        for (const neighbor of neighbors) {
            if (neighbor.x < 0 || neighbor.x >= mazeData[0].length ||
                neighbor.z < 0 || neighbor.z >= mazeData.length ||
                mazeData[neighbor.z][neighbor.x] === 1 ||
                closedSet.has(`${neighbor.x},${neighbor.z}`)) {
                continue;
            }

            const g = current.g + 1;
            const h = heuristic(neighbor, end);
            const f = g + h;

            const existingIndex = openSet.findIndex(n => n.x === neighbor.x && n.z === neighbor.z);
            if (existingIndex !== -1) {
                if (g < openSet[existingIndex].g) {
                    openSet[existingIndex].g = g;
                    openSet[existingIndex].f = f;
                    openSet[existingIndex].parent = current;
                }
            } else {
                openSet.push({ ...neighbor, g, h, f, parent: current });
            }
        }
    }

    return [];
}

function generateLevel() {
    scene.clear();
    npcs = [];
    currentPath = [];
    pathIndex = 0;
    isWalking = false;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffd700, 1.2);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xff6600, 0.8, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    const currentMazeSize = mazeSize + (level - 1) * 2;
    const mazeData = generateMaze(currentMazeSize, currentMazeSize);
    const mazeResult = buildMaze(mazeData);
    maze = mazeResult;

    const emptyPositions = getEmptyPositions(mazeData);

    player = createPlayer();
    const startPos = emptyPositions[0];
    player.position.copy(startPos);
    player.position.y = 1.5;

    const shuffledPositions = emptyPositions.slice(1).sort(() => Math.random() - 0.5);
    const shuffledCharacters = [...threeKingdomsData].sort(() => Math.random() - 0.5);

    const npcCount = Math.min(3 + level, shuffledCharacters.length);
    for (let i = 0; i < npcCount && i < shuffledPositions.length; i++) {
        const npc = createNPC(shuffledCharacters[i], shuffledPositions[i]);
        npc.position.y = 0;
        npcs.push(npc);
    }

    currentTargetNPC = npcs[Math.floor(Math.random() * npcs.length)];
    currentYaw = 0;
    targetYaw = 0;
    updateHint();
    updatePath();
    document.getElementById('level-info').textContent = `关卡: ${level}`;
}

function updatePath() {
    if (currentTargetNPC && player) {
        currentPath = findPath(player.position, currentTargetNPC.position);
        pathIndex = 0;
        isWalking = currentPath.length > 0;
    }
}

function updateHint() {
    if (currentTargetNPC) {
        document.getElementById('hint-panel').textContent =
            `🎯 目标：${currentTargetNPC.userData.title} ${currentTargetNPC.userData.name} | 按空格键对话`;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(e) {
    if (e.code === 'Space' && canMove && !isDialogOpen) {
        tryTalk();
    }
}

function tryTalk() {
    for (const npc of npcs) {
        const distance = player.position.distanceTo(npc.position);
        if (distance < 3) {
            startDialog(npc);
            return;
        }
    }
}

function startDialog(npc) {
    isDialogOpen = true;
    canMove = false;
    isWalking = false;

    const questionData = npc.userData.questions[Math.floor(Math.random() * npc.userData.questions.length)];

    document.getElementById('npc-name').textContent = `${npc.userData.title} ${npc.userData.name}`;
    document.getElementById('npc-dialog').textContent = questionData.question;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    questionData.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(npc, index === questionData.correct);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('dialog-box').style.display = 'block';
}

function checkAnswer(npc, isCorrect) {
    document.getElementById('dialog-box').style.display = 'none';

    if (isCorrect && npc === currentTargetNPC) {
        showResult('🎉 回答正确！', '恭喜你通过了这个关卡！', () => {
            level++;
            generateLevel();
            isDialogOpen = false;
            canMove = true;
        });
    } else if (isCorrect) {
        showResult('👍 回答正确！', '但这不是你的目标人物，继续寻找吧！', () => {
            isDialogOpen = false;
            canMove = true;
            updatePath();
        });
    } else {
        teleportRandom();
        showResult('😅 回答错误！', '你被随机传送了！', () => {
            isDialogOpen = false;
            canMove = true;
            updatePath();
        });
    }
}

function teleportRandom() {
    const emptyPositions = getEmptyPositions(maze.mazeData);
    const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    player.position.copy(randomPos);
    player.position.y = 1.5;

    let nearestNPC = npcs[0];
    let minDistance = Infinity;
    for (const npc of npcs) {
        const dist = player.position.distanceTo(npc.position);
        if (dist < minDistance) {
            minDistance = dist;
            nearestNPC = npc;
        }
    }
    currentTargetNPC = nearestNPC;
    updateHint();
}

function showResult(title, text, callback) {
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-text').textContent = text;
    document.getElementById('result-message').style.display = 'block';
    document.getElementById('result-btn').onclick = () => {
        document.getElementById('result-message').style.display = 'none';
        callback();
    };
}

function lerpAngle(current, target, t) {
    let diff = target - current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    return current + diff * t;
}

function animate() {
    requestAnimationFrame(animate);

    if (canMove && player && isWalking && currentPath.length > 0) {
        const moveSpeed = 0.12;
        const targetPos = currentPath[pathIndex];
        const direction = new THREE.Vector3();
        direction.subVectors(targetPos, player.position);
        direction.y = 0;
        const distance = direction.length();

        if (distance < 0.5) {
            pathIndex++;
            if (pathIndex >= currentPath.length) {
                isWalking = false;
            }
        } else {
            direction.normalize();
            targetYaw = Math.atan2(direction.x, direction.z);

            const newPos = player.position.clone();
            newPos.x += direction.x * moveSpeed;
            newPos.z += direction.z * moveSpeed;

            player.position.copy(newPos);
        }
    }

    if (player && currentTargetNPC) {
        const toTarget = new THREE.Vector3();
        toTarget.subVectors(currentTargetNPC.position, player.position);
        toTarget.y = 0;
        if (toTarget.length() > 0.1 && !isWalking) {
            targetYaw = Math.atan2(toTarget.x, toTarget.z);
        }
    }

    currentYaw = lerpAngle(currentYaw, targetYaw, 0.1);

    if (player) {
        camera.position.set(
            player.position.x,
            player.position.y + 1.6,
            player.position.z
        );

        const lookX = player.position.x + Math.sin(currentYaw);
        const lookZ = player.position.z + Math.cos(currentYaw);
        camera.lookAt(lookX, player.position.y + 1.6, lookZ);

        player.rotation.y = currentYaw;
    }

    if (npcs) {
        const time = Date.now() * 0.001;
        npcs.forEach((npc, i) => {
            npc.rotation.y = time + i;
            npc.children[npc.children.length - 2].position.y = 1.5 + Math.sin(time * 2 + i) * 0.1;
        });
    }

    renderer.render(scene, camera);
}
