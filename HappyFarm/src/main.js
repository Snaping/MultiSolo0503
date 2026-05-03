import * as THREE from 'three';

const PLANTS = {
    carrot: { name: '胡萝卜', emoji: '🥕', price: 10, value: 25, color: 0xfb923c, growTime: 8000, stages: 3 },
    tomato: { name: '番茄', emoji: '🍅', price: 15, value: 40, color: 0xef4444, growTime: 10000, stages: 3 },
    corn: { name: '玉米', emoji: '🌽', price: 20, value: 55, color: 0xfacc15, growTime: 12000, stages: 3 },
    watermelon: { name: '西瓜', emoji: '🍉', price: 30, value: 80, color: 0x22c55e, growTime: 15000, stages: 4 },
    sunflower: { name: '向日葵', emoji: '🌻', price: 25, value: 65, color: 0xeab308, growTime: 11000, stages: 3 },
    eggplant: { name: '茄子', emoji: '🍆', price: 35, value: 95, color: 0x8b5cf6, growTime: 13000, stages: 4 }
};

const GRID_SIZE = 6;
const TILE_SIZE = 3;
const FARM_SIZE = GRID_SIZE * TILE_SIZE;

class FarmGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.farmLand = [];
        this.plants = [];
        this.selectedPlant = null;
        this.user = { name: '农场主', coins: 100, gallery: [] };
        this.keys = { w: false, a: false, s: false, d: false };
        this.playerVelocity = new THREE.Vector3();
        this.isMoving = false;
        this.playerDirection = 0;
        this.clock = new THREE.Clock();
        this.animationId = null;
        this.loaded = false;
        this.growthSpeed = 1;
        this.draggedElement = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.hoveredPlant = null;
        this.inventory = [];

        this.init();
    }

    init() {
        this.setupScene();
        this.setupLights();
        this.createFarm();
        this.createPlayer();
        this.setupControls();
        this.loadUserData();
        this.updateUI();
        this.animate();

        document.getElementById('loading').classList.add('hidden');
        this.loaded = true;
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 30, 100);

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 25, 20);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(30, 50, 30);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 150;
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        this.scene.add(sunLight);
    }

    createFarm() {
        const groundGeometry = new THREE.PlaneGeometry(80, 80);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const grassGeometry = new THREE.PlaneGeometry(80, 80);
        const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.rotation.x = -Math.PI / 2;
        grass.position.y = -0.05;
        this.scene.add(grass);

        const offset = -FARM_SIZE / 2 + TILE_SIZE / 2;

        for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                const tileX = offset + x * TILE_SIZE;
                const tileZ = offset + z * TILE_SIZE;

                const tileGeometry = new THREE.BoxGeometry(TILE_SIZE - 0.3, 0.5, TILE_SIZE - 0.3);
                const tileMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
                const tile = new THREE.Mesh(tileGeometry, tileMaterial);
                tile.position.set(tileX, 0.25, tileZ);
                tile.receiveShadow = true;
                tile.castShadow = true;
                this.scene.add(tile);

                const borderGeometry = new THREE.BoxGeometry(TILE_SIZE - 0.15, 0.55, TILE_SIZE - 0.15);
                const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2914 });
                const border = new THREE.Mesh(borderGeometry, borderMaterial);
                border.position.set(tileX, 0.25, tileZ);
                border.receiveShadow = true;
                this.scene.add(border);

                const highlightGeometry = new THREE.BoxGeometry(TILE_SIZE - 0.2, 0.02, TILE_SIZE - 0.2);
                const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0 });
                const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
                highlight.position.set(tileX, 0.51, tileZ);
                highlight.name = 'highlight';
                this.scene.add(highlight);

                this.farmLand.push({
                    mesh: tile,
                    highlight: highlight,
                    position: { x: x, z: z },
                    worldPos: { x: tileX, z: tileZ },
                    plant: null,
                    isEmpty: true
                });
            }
        }
    }

    createPlayer() {
        const playerGroup = new THREE.Group();

        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.4;
        body.castShadow = true;
        playerGroup.add(body);

        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.4;
        head.castShadow = true;
        playerGroup.add(head);

        const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 2.5, 0.35);
        playerGroup.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 2.5, 0.35);
        playerGroup.add(rightEye);

        const mouthGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.05);
        const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 2.25, 0.38);
        playerGroup.add(mouth);

        const hairGeometry = new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2914 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 2.45;
        hair.castShadow = true;
        playerGroup.add(hair);

        const hatBrimGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 16);
        const hatMaterial = new THREE.MeshStandardMaterial({ color: 0xfbbf24 });
        const hatBrim = new THREE.Mesh(hatBrimGeometry, hatMaterial);
        hatBrim.position.y = 2.75;
        hatBrim.castShadow = true;
        playerGroup.add(hatBrim);

        const hatTopGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.5, 16);
        const hatTop = new THREE.Mesh(hatTopGeometry, hatMaterial);
        hatTop.position.y = 3.0;
        hatTop.castShadow = true;
        playerGroup.add(hatTop);

        const leftArmGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
        const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
        leftArm.position.set(-0.6, 1.4, 0);
        leftArm.castShadow = true;
        playerGroup.add(leftArm);

        const rightArm = new THREE.Mesh(leftArmGeometry, armMaterial);
        rightArm.position.set(0.6, 1.4, 0);
        rightArm.castShadow = true;
        playerGroup.add(rightArm);

        const handGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const handMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.6, 0.9, 0);
        leftHand.castShadow = true;
        playerGroup.add(leftHand);

        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.6, 0.9, 0);
        rightHand.castShadow = true;
        playerGroup.add(rightHand);

        const leftLegGeometry = new THREE.BoxGeometry(0.25, 0.7, 0.25);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x1e40af });
        const leftLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
        leftLeg.position.set(-0.2, 0.35, 0);
        leftLeg.castShadow = true;
        playerGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
        rightLeg.position.set(0.2, 0.35, 0);
        rightLeg.castShadow = true;
        playerGroup.add(rightLeg);

        const leftFootGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.4);
        const footMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const leftFoot = new THREE.Mesh(leftFootGeometry, footMaterial);
        leftFoot.position.set(-0.2, 0.0, 0.05);
        leftFoot.castShadow = true;
        playerGroup.add(leftFoot);

        const rightFoot = new THREE.Mesh(leftFootGeometry, footMaterial);
        rightFoot.position.set(0.2, 0.0, 0.05);
        rightFoot.castShadow = true;
        playerGroup.add(rightFoot);

        this.player = playerGroup;
        this.player.position.set(12, 0, 12);
        this.scene.add(this.player);
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') this.keys.w = true;
            if (key === 's' || key === 'arrowdown') this.keys.s = true;
            if (key === 'a' || key === 'arrowleft') this.keys.a = true;
            if (key === 'd' || key === 'arrowright') this.keys.d = true;
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') this.keys.w = false;
            if (key === 's' || key === 'arrowdown') this.keys.s = false;
            if (key === 'a' || key === 'arrowleft') this.keys.a = false;
            if (key === 'd' || key === 'arrowright') this.keys.d = false;
        });

        this.setupDragAndDrop();

        const canvas = this.renderer.domElement;
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('click', (e) => this.onCanvasClick(e));
    }

    setupDragAndDrop() {
        const dragItems = document.querySelectorAll('.plant-btn');

        dragItems.forEach(btn => {
            btn.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                this.draggedElement = btn.cloneNode(true);
                this.draggedElement.style.position = 'fixed';
                this.draggedElement.style.pointerEvents = 'none';
                this.draggedElement.style.zIndex = '1000';
                this.draggedElement.style.opacity = '0.8';
                this.draggedElement.style.transform = 'scale(1.2)';
                document.body.appendChild(this.draggedElement);

                this.selectedPlant = btn.dataset.plant;
                document.querySelectorAll('.plant-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                this.dragOffsetX = e.clientX - btn.getBoundingClientRect().left;
                this.dragOffsetY = e.clientY - btn.getBoundingClientRect().top;

                document.addEventListener('mousemove', this.onDragMove);
                document.addEventListener('mouseup', this.onDragEnd);
            });
        });
    }

    onDragMove = (e) => {
        if (this.draggedElement) {
            this.draggedElement.style.left = (e.clientX - this.dragOffsetX) + 'px';
            this.draggedElement.style.top = (e.clientY - this.dragOffsetY) + 'px';
        }
    }

    onDragEnd = (e) => {
        if (this.draggedElement) {
            const rect = this.renderer.domElement.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const mouse = new THREE.Vector2(
                    ((e.clientX - rect.left) / rect.width) * 2 - 1,
                    -((e.clientY - rect.top) / rect.height) * 2 + 1
                );

                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, this.camera);

                const intersects = raycaster.intersectObjects(this.farmLand.map(t => t.mesh));

                if (intersects.length > 0) {
                    const clickedTile = this.farmLand.find(t => t.mesh === intersects[0].object);
                    if (clickedTile && clickedTile.isEmpty) {
                        this.plantCrop(clickedTile, this.selectedPlant);
                    }
                }
            }

            document.body.removeChild(this.draggedElement);
            this.draggedElement = null;
        }

        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragEnd);
    }

    onMouseMove(e) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const plantMeshes = this.plants.filter(p => p && p.isHarvestable && p.fruit).map(p => p.fruit);
        const intersects = raycaster.intersectObjects(plantMeshes);

        if (intersects.length > 0) {
            const plant = this.plants.find(p => p && p.fruit === intersects[0].object);
            if (plant) {
                this.hoveredPlant = plant;
                this.renderer.domElement.style.cursor = 'pointer';
                return;
            }
        }

        this.hoveredPlant = null;
        this.renderer.domElement.style.cursor = 'default';
    }

    onCanvasClick(e) {
        if (this.hoveredPlant && this.hoveredPlant.isHarvestable) {
            this.harvestPlant(this.hoveredPlant);
            this.hoveredPlant = null;
            this.renderer.domElement.style.cursor = 'default';
        }
    }

    plantCrop(tile, plantType) {
        if (!tile || !plantType || !PLANTS[plantType]) {
            return;
        }

        const plantData = PLANTS[plantType];
        if (this.user.coins < plantData.price) {
            this.showNotification('金币不足！');
            return;
        }

        this.user.coins -= plantData.price;
        this.updateUI();
        this.saveUserData();

        const plantGroup = new THREE.Group();
        plantGroup.position.copy(tile.mesh.position);
        plantGroup.position.y = 0.5;

        const stemHeight = 1.2;
        const stemGeometry = new THREE.CylinderGeometry(0.1, 0.15, stemHeight, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = stemHeight / 2;
        stem.castShadow = true;
        plantGroup.add(stem);

        let fruitGeometry, fruitSize;
        switch (plantType) {
            case 'carrot':
                fruitGeometry = new THREE.ConeGeometry(0.35, 1.2, 8);
                fruitSize = 0.3;
                break;
            case 'tomato':
            case 'eggplant':
                fruitGeometry = new THREE.SphereGeometry(0.4, 12, 12);
                fruitSize = 0.4;
                break;
            case 'corn':
                fruitGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8);
                fruitSize = 0.5;
                break;
            case 'watermelon':
                fruitGeometry = new THREE.SphereGeometry(0.5, 12, 12);
                fruitSize = 0.5;
                break;
            case 'sunflower':
                fruitGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
                fruitSize = 0.6;
                break;
            default:
                fruitGeometry = new THREE.SphereGeometry(0.4, 12, 12);
                fruitSize = 0.4;
        }

        const fruitMaterial = new THREE.MeshStandardMaterial({
            color: plantData.color,
            emissive: 0x000000,
            emissiveIntensity: 0
        });
        const fruit = new THREE.Mesh(fruitGeometry, fruitMaterial);

        if (plantType === 'sunflower') {
            fruit.position.y = stemHeight + 0.2;

            const petalGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const petalMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
            for (let i = 0; i < 12; i++) {
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                const angle = (i / 12) * Math.PI * 2;
                petal.position.set(Math.cos(angle) * 0.5, stemHeight + 0.2, Math.sin(angle) * 0.5);
                petal.scale.set(0.5, 0.5, 0.3);
                plantGroup.add(petal);
            }
        } else {
            fruit.position.y = stemHeight * 0.7;
        }

        fruit.scale.set(0.1, 0.1, 0.1);
        fruit.castShadow = true;
        plantGroup.add(fruit);

        const leafGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x32cd32 });
        const leftLeaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leftLeaf.scale.set(0.4, 0.6, 0.3);
        leftLeaf.position.set(-0.3, stemHeight * 0.4, 0);
        plantGroup.add(leftLeaf);

        const rightLeaf = new THREE.Mesh(leafGeometry, leafMaterial);
        rightLeaf.scale.set(0.4, 0.6, 0.3);
        rightLeaf.position.set(0.3, stemHeight * 0.5, 0);
        plantGroup.add(rightLeaf);

        this.scene.add(plantGroup);

        tile.plant = {
            type: plantType,
            mesh: plantGroup,
            stem: stem,
            fruit: fruit,
            stemHeight: stemHeight,
            plantedAt: Date.now(),
            stage: 0,
            isHarvestable: false,
            fruitSize: fruitSize
        };
        tile.isEmpty = false;
        this.plants.push(tile.plant);
    }

    harvestPlant(plant) {
        if (!plant) {
            return;
        }

        const plantData = PLANTS[plant.type];
        if (!plantData) {
            return;
        }

        const tile = this.farmLand.find(t => t.plant === plant);
        if (tile) {
            tile.isEmpty = true;
            tile.plant = null;
        }

        if (plant.mesh) {
            this.scene.remove(plant.mesh);
        }
        const index = this.plants.indexOf(plant);
        if (index > -1) {
            this.plants.splice(index, 1);
        }

        this.user.coins += plantData.value;
        this.inventory.push({ type: plant.type, data: plantData });
        this.updateGallery();
        this.updateUI();
        this.saveUserData();
        this.showNotification(`${plantData.emoji} 采摘成功！`, plantData.value);
    }

    updateGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) {
            return;
        }

        galleryGrid.innerHTML = '';

        const counts = {};
        this.inventory.forEach(item => {
            if (item && item.type) {
                counts[item.type] = (counts[item.type] || 0) + 1;
            }
        });

        if (Object.keys(counts).length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'gallery-empty';
            emptyDiv.textContent = '背包空空如也，快去种植吧！';
            galleryGrid.appendChild(emptyDiv);
        } else {
            Object.entries(counts).forEach(([type, count]) => {
                const plantData = PLANTS[type];
                if (plantData) {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.innerHTML = `
                        <div class="gallery-emoji">${plantData.emoji}</div>
                        <div class="gallery-count">x${count}</div>
                        <div class="gallery-name">${plantData.name}</div>
                    `;
                    galleryGrid.appendChild(item);
                }
            });
        }
    }

    updatePlants(deltaTime) {
        const now = Date.now();

        this.plants.forEach(plant => {
            if (plant && !plant.isHarvestable && plant.fruit) {
                const elapsed = (now - plant.plantedAt) * this.growthSpeed;
                const plantData = PLANTS[plant.type];
                if (plantData) {
                    const progress = Math.min(elapsed / plantData.growTime, 1);

                    const scale = 0.1 + progress * 0.9;
                    plant.fruit.scale.set(scale, scale, scale);

                    if (plant.stem) {
                        const swayAngle = Math.sin(now * 0.002 + plant.mesh.position.x) * 0.05;
                        plant.stem.rotation.z = swayAngle;
                    }

                    if (progress >= 1) {
                        plant.isHarvestable = true;
                        if (plant.fruit.material) {
                            plant.fruit.material.emissive = new THREE.Color(plantData.color);
                            plant.fruit.material.emissiveIntensity = 0.5;
                        }
                    }
                }
            }
        });
    }

    updatePlayer(deltaTime) {
        const speed = 6;
        let moved = false;
        const moveDir = new THREE.Vector3();

        if (this.keys.w) { moveDir.z -= 1; moved = true; }
        if (this.keys.s) { moveDir.z += 1; moved = true; }
        if (this.keys.a) { moveDir.x -= 1; moved = true; }
        if (this.keys.d) { moveDir.x += 1; moved = true; }

        if (moved && this.player) {
            moveDir.normalize();
            this.player.position.x += moveDir.x * speed * deltaTime;
            this.player.position.z += moveDir.z * speed * deltaTime;

            this.playerDirection = Math.atan2(moveDir.x, moveDir.z);
            this.player.rotation.y = this.playerDirection;

            const bobAmount = Math.sin(Date.now() * 0.015) * 0.08;
            if (this.player.children[1]) {
                this.player.children[1].position.y = 1.4 + bobAmount;
            }

            const leftArm = this.player.children[6];
            const rightArm = this.player.children[7];
            const armSwing = Math.sin(Date.now() * 0.015) * 0.3;
            if (leftArm) leftArm.rotation.x = armSwing;
            if (rightArm) rightArm.rotation.x = -armSwing;

            const leftLeg = this.player.children[10];
            const rightLeg = this.player.children[11];
            const legSwing = Math.sin(Date.now() * 0.015) * 0.3;
            if (leftLeg) leftLeg.rotation.x = -legSwing;
            if (rightLeg) rightLeg.rotation.x = legSwing;

            const limit = FARM_SIZE / 2 + 5;
            this.player.position.x = Math.max(-limit, Math.min(limit, this.player.position.x));
            this.player.position.z = Math.max(-limit, Math.min(limit, this.player.position.z));
        } else if (this.player) {
            const leftArm = this.player.children[6];
            const rightArm = this.player.children[7];
            if (leftArm) leftArm.rotation.x = 0;
            if (rightArm) rightArm.rotation.x = 0;
        }

        if (this.player && this.camera) {
            this.camera.position.x = this.player.position.x * 0.5;
            this.camera.position.z = this.player.position.z + 20;
            this.camera.lookAt(this.player.position.x * 0.3, 0, this.player.position.z);
        }

        this.isMoving = moved;
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        const deltaTime = this.clock.getDelta();

        this.updatePlayer(deltaTime);
        this.updatePlants(deltaTime);

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
        if (this.renderer) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    showNotification(text, coins = 0) {
        const notification = document.getElementById('notification');
        if (!notification) {
            return;
        }
        const notificationText = document.getElementById('notification-text');
        const notificationCoins = document.getElementById('notification-coins');
        if (notificationText) notificationText.textContent = text;
        if (notificationCoins) notificationCoins.textContent = coins > 0 ? `+${coins} 💰` : '';
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }

    updateUI() {
        const userNameEl = document.getElementById('user-name');
        const userCoinsEl = document.getElementById('user-coins');
        if (userNameEl) userNameEl.textContent = this.user.name;
        if (userCoinsEl) userCoinsEl.textContent = `💰 金币: ${this.user.coins}`;
    }

    loadUserData() {
        try {
            const saved = localStorage.getItem('happyFarmUser');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.user) {
                    this.user = data.user;
                    if (typeof this.user.coins !== 'number') this.user.coins = 100;
                    if (!this.user.inventory) this.user.inventory = [];
                    this.inventory = this.user.inventory;
                }
                if (data.growthSpeed) {
                    this.growthSpeed = data.growthSpeed;
                }
                this.updateGrowthSlider();
                this.updateGallery();

                if (data.plants && Array.isArray(data.plants)) {
                    data.plants.forEach(savedPlant => {
                        if (!savedPlant || !savedPlant.pos || !savedPlant.type) {
                            return;
                        }
                        const tile = this.farmLand.find(t => 
                            t.position.x === savedPlant.pos.x && 
                            t.position.z === savedPlant.pos.z
                        );
                        if (tile && tile.isEmpty && PLANTS[savedPlant.type]) {
                            this.selectedPlant = savedPlant.type;
                            this.plantCrop(tile, savedPlant.type);
                            // 检查 plant 是否成功创建
                            if (tile.plant) {
                                const plant = tile.plant;
                                const elapsed = (Date.now() - savedPlant.plantedAt) * this.growthSpeed;
                                const plantData = PLANTS[savedPlant.type];
                                if (elapsed >= plantData.growTime) {
                                    plant.isHarvestable = true;
                                    if (plant.fruit.material) {
                                        plant.fruit.material.emissive = new THREE.Color(plantData.color);
                                        plant.fruit.material.emissiveIntensity = 0.5;
                                    }
                                }
                            }
                        }
                    });
                }
            }
        } catch (e) {
            console.error('加载用户数据失败，使用默认数据', e);
            this.user = { name: '农场主', coins: 100, gallery: [] };
            this.inventory = [];
        }
    }

    updateGrowthSlider() {
        const slider = document.getElementById('growth-speed');
        const value = document.getElementById('growth-value');
        if (slider && value) {
            slider.value = this.growthSpeed;
            value.textContent = this.growthSpeed.toFixed(1) + 'x';
        }
    }

    saveUserData() {
        try {
            const plantsData = this.farmLand
                .filter(t => !t.isEmpty && t.plant)
                .map(t => ({
                    type: t.plant.type,
                    pos: t.position,
                    plantedAt: t.plant.plantedAt
                }));

            localStorage.setItem('happyFarmUser', JSON.stringify({
                user: { ...this.user, inventory: this.inventory },
                plants: plantsData,
                growthSpeed: this.growthSpeed
            }));
        } catch (e) {
            console.error('保存用户数据失败', e);
        }
    }
}

const game = new FarmGame();
window.game = game;

setInterval(() => {
    if (game.loaded) {
        game.saveUserData();
    }
}, 5000);