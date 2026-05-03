import * as THREE from 'three';

const PLANTS = {
    carrot: { name: '胡萝卜', price: 10, value: 25, color: 0xfb923c, growTime: 8000, stages: 3 },
    tomato: { name: '番茄', price: 15, value: 40, color: 0xef4444, growTime: 10000, stages: 3 },
    corn: { name: '玉米', price: 20, value: 55, color: 0xfacc15, growTime: 12000, stages: 3 },
    watermelon: { name: '西瓜', price: 30, value: 80, color: 0x22c55e, growTime: 15000, stages: 4 },
    sunflower: { name: '向日葵', price: 25, value: 65, color: 0xeab308, growTime: 11000, stages: 3 },
    eggplant: { name: '茄子', price: 35, value: 95, color: 0x8b5cf6, growTime: 13000, stages: 4 }
};

const GRID_SIZE = 6;
const TILE_SIZE = 2;
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
        this.user = { name: '农场主', coins: 100 };
        this.keys = { w: false, a: false, s: false, d: false };
        this.playerVelocity = new THREE.Vector3();
        this.isMoving = false;
        this.playerDirection = 0;
        this.clock = new THREE.Clock();
        this.animationId = null;
        this.loaded = false;

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
        this.scene.fog = new THREE.Fog(0x87ceeb, 20, 80);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 12);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(20, 30, 20);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 100;
        sunLight.shadow.camera.left = -30;
        sunLight.shadow.camera.right = 30;
        sunLight.shadow.camera.top = 30;
        sunLight.shadow.camera.bottom = -30;
        this.scene.add(sunLight);
    }

    createFarm() {
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const grassGeometry = new THREE.PlaneGeometry(50, 50);
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

                const tileGeometry = new THREE.BoxGeometry(TILE_SIZE - 0.2, 0.3, TILE_SIZE - 0.2);
                const tileMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
                const tile = new THREE.Mesh(tileGeometry, tileMaterial);
                tile.position.set(tileX, 0.15, tileZ);
                tile.receiveShadow = true;
                tile.castShadow = true;
                this.scene.add(tile);

                const borderGeometry = new THREE.BoxGeometry(TILE_SIZE - 0.1, 0.35, TILE_SIZE - 0.1);
                const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2914 });
                const border = new THREE.Mesh(borderGeometry, borderMaterial);
                border.position.set(tileX, 0.15, tileZ);
                border.receiveShadow = true;
                this.scene.add(border);

                this.farmLand.push({
                    mesh: tile,
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

        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        playerGroup.add(body);

        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.3;
        head.castShadow = true;
        playerGroup.add(head);

        const hatGeometry = new THREE.ConeGeometry(0.3, 0.4, 8);
        const hatMaterial = new THREE.MeshStandardMaterial({ color: 0xfbbf24 });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 1.6;
        hat.castShadow = true;
        playerGroup.add(hat);

        this.player = playerGroup;
        this.player.position.set(8, 0, 8);
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

        document.querySelectorAll('.plant-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.plant-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedPlant = btn.dataset.plant;
            });
        });

        document.getElementById('harvest-btn').addEventListener('click', () => this.harvest());

        const canvas = this.renderer.domElement;
        canvas.addEventListener('click', (e) => this.onCanvasClick(e));
    }

    onCanvasClick(e) {
        if (!this.selectedPlant) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
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

    plantCrop(tile, plantType) {
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
        plantGroup.position.y = 0.3;

        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 6);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.15;
        stem.castShadow = true;
        plantGroup.add(stem);

        const fruitGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const fruitMaterial = new THREE.MeshStandardMaterial({ color: plantData.color });
        const fruit = new THREE.Mesh(fruitGeometry, fruitMaterial);
        fruit.position.y = 0.4;
        fruit.scale.set(0.1, 0.1, 0.1);
        fruit.castShadow = true;
        plantGroup.add(fruit);

        this.scene.add(plantGroup);

        tile.plant = {
            type: plantType,
            mesh: plantGroup,
            stem: stem,
            fruit: fruit,
            plantedAt: Date.now(),
            stage: 0,
            isHarvestable: false
        };
        tile.isEmpty = false;
        this.plants.push(tile.plant);
    }

    harvest() {
        let harvested = [];
        const playerPos = this.player.position;

        this.plants.forEach(plant => {
            if (plant.isHarvestable) {
                const distance = playerPos.distanceTo(plant.mesh.position);
                if (distance < 3) {
                    harvested.push(plant);
                }
            }
        });

        if (harvested.length === 0) {
            this.showNotification('附近没有成熟的作物！');
            return;
        }

        let totalCoins = 0;
        harvested.forEach(plant => {
            const plantData = PLANTS[plant.type];
            totalCoins += plantData.value;

            const tile = this.farmLand.find(t => t.plant === plant);
            if (tile) {
                tile.isEmpty = true;
                tile.plant = null;
            }

            this.scene.remove(plant.mesh);
            const index = this.plants.indexOf(plant);
            if (index > -1) this.plants.splice(index, 1);
        });

        this.user.coins += totalCoins;
        this.updateUI();
        this.saveUserData();
        this.showNotification(`收获 ${harvested.length} 个作物！`, totalCoins);
    }

    updatePlants(deltaTime) {
        const now = Date.now();

        this.plants.forEach(plant => {
            if (!plant.isHarvestable) {
                const elapsed = now - plant.plantedAt;
                const plantData = PLANTS[plant.type];
                const progress = Math.min(elapsed / plantData.growTime, 1);

                const stage = Math.floor(progress * plantData.stages);
                plant.stage = stage;

                const scale = 0.1 + progress * 0.9;
                plant.fruit.scale.set(scale, scale, scale);

                if (progress >= 1) {
                    plant.isHarvestable = true;
                    plant.fruit.material.emissive = new THREE.Color(plantData.color);
                    plant.fruit.material.emissiveIntensity = 0.3;
                }
            }
        });
    }

    updatePlayer(deltaTime) {
        const speed = 5;
        let moved = false;
        const moveDir = new THREE.Vector3();

        if (this.keys.w) { moveDir.z -= 1; moved = true; }
        if (this.keys.s) { moveDir.z += 1; moved = true; }
        if (this.keys.a) { moveDir.x -= 1; moved = true; }
        if (this.keys.d) { moveDir.x += 1; moved = true; }

        if (moved) {
            moveDir.normalize();
            this.player.position.x += moveDir.x * speed * deltaTime;
            this.player.position.z += moveDir.z * speed * deltaTime;

            this.playerDirection = Math.atan2(moveDir.x, moveDir.z);
            this.player.rotation.y = this.playerDirection;

            const bobAmount = Math.sin(Date.now() * 0.01) * 0.05;
            this.player.children[0].position.y = 0.6 + bobAmount;

            const limit = FARM_SIZE / 2 + 3;
            this.player.position.x = Math.max(-limit, Math.min(limit, this.player.position.x));
            this.player.position.z = Math.max(-limit, Math.min(limit, this.player.position.z));
        }

        this.camera.position.x = this.player.position.x;
        this.camera.position.z = this.player.position.z + 12;
        this.camera.lookAt(this.player.position.x, 0, this.player.position.z);

        this.isMoving = moved;
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        const deltaTime = this.clock.getDelta();

        this.updatePlayer(deltaTime);
        this.updatePlants(deltaTime);

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    showNotification(text, coins = 0) {
        const notification = document.getElementById('notification');
        document.getElementById('notification-text').textContent = text;
        document.getElementById('notification-coins').textContent = coins > 0 ? `+${coins} 💰` : '';
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }

    updateUI() {
        document.getElementById('user-name').textContent = this.user.name;
        document.getElementById('user-coins').textContent = `💰 金币: ${this.user.coins}`;
    }

    loadUserData() {
        const saved = localStorage.getItem('happyFarmUser');
        if (saved) {
            const data = JSON.parse(saved);
            this.user = data.user || this.user;
            if (data.plants) {
                data.plants.forEach(savedPlant => {
                    const tile = this.farmLand.find(t => t.position.x === savedPlant.pos.x && t.position.z === savedPlant.pos.z);
                    if (tile && tile.isEmpty) {
                        this.selectedPlant = savedPlant.type;
                        this.plantCrop(tile, savedPlant.type);
                        const plant = tile.plant;
                        const elapsed = Date.now() - savedPlant.plantedAt;
                        const plantData = PLANTS[savedPlant.type];
                        if (elapsed >= plantData.growTime) {
                            plant.isHarvestable = true;
                            plant.fruit.material.emissive = new THREE.Color(plantData.color);
                            plant.fruit.material.emissiveIntensity = 0.3;
                        }
                    }
                });
            }
        }
    }

    saveUserData() {
        const plantsData = this.farmLand
            .filter(t => !t.isEmpty && t.plant)
            .map(t => ({
                type: t.plant.type,
                pos: t.position,
                plantedAt: t.plant.plantedAt
            }));

        localStorage.setItem('happyFarmUser', JSON.stringify({
            user: this.user,
            plants: plantsData
        }));
    }
}

const game = new FarmGame();

setInterval(() => {
    if (game.loaded) {
        game.saveUserData();
    }
}, 5000);