import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls;
let model, mixer, activeAction, previousAction;
let animations = [];
let isPlaying = true;
let loopMode = THREE.LoopRepeat;
let clock = new THREE.Clock();

function init() {
    const container = document.getElementById('canvas-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 3, 5);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.target.set(0, 1, 0);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    const backLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);
    
    const fillLight = new THREE.DirectionalLight(0xff8844, 0.3);
    fillLight.position.set(-5, 2, 5);
    scene.add(fillLight);
    
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a4a,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const gridHelper = new THREE.GridHelper(50, 50, 0x444466, 0x2a2a4a);
    scene.add(gridHelper);
    
    loadModel();
    
    window.addEventListener('resize', onWindowResize);
    setupControls();
    
    animate();
}

function loadModel() {
    const loader = new GLTFLoader();
    
    const modelUrl = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';
    
    loader.load(
        modelUrl,
        (gltf) => {
            model = gltf.scene;
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        child.material.roughness = 0.5;
                        child.material.metalness = 0.2;
                    }
                }
            });
            
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            model.position.y = 0;
            
            scene.add(model);
            
            mixer = new THREE.AnimationMixer(model);
            
            if (gltf.animations && gltf.animations.length > 0) {
                animations = gltf.animations;
                const animationSelect = document.getElementById('animationSelect');
                animations.forEach((clip, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = clip.name;
                    animationSelect.appendChild(option);
                });
                
                playAnimation(0);
            }
            
            document.getElementById('loading').style.display = 'none';
        },
        (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            document.getElementById('loading').innerHTML = `
                <div class="spinner"></div>
                <div>加载中... ${percent}%</div>
            `;
        },
        (error) => {
            console.error('模型加载失败:', error);
            document.getElementById('loading').innerHTML = `
                <div style="color: #ff6b6b;">❌ 模型加载失败</div>
                <div style="font-size: 14px; margin-top: 10px;">请检查网络连接</div>
            `;
        }
    );
}

function playAnimation(index) {
    if (!mixer || !animations[index]) return;
    
    const clip = animations[index];
    
    if (activeAction) {
        activeAction.fadeOut(0.2);
        setTimeout(() => {
            if (activeAction) {
                activeAction.stop();
            }
        }, 200);
    }
    
    activeAction = mixer.clipAction(clip);
    activeAction.setLoop(loopMode);
    activeAction.reset().fadeIn(0.2).play();
}

function setupControls() {
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const animationSelect = document.getElementById('animationSelect');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const loopBtn = document.getElementById('loopBtn');
    const onceBtn = document.getElementById('onceBtn');
    
    playBtn.addEventListener('click', () => {
        if (activeAction) {
            activeAction.paused = false;
            isPlaying = true;
        }
    });
    
    pauseBtn.addEventListener('click', () => {
        if (activeAction) {
            activeAction.paused = true;
            isPlaying = false;
        }
    });
    
    resetBtn.addEventListener('click', () => {
        if (activeAction) {
            activeAction.reset();
            activeAction.play();
        }
    });
    
    animationSelect.addEventListener('change', (e) => {
        playAnimation(parseInt(e.target.value));
    });
    
    speedSlider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        speedValue.textContent = speed.toFixed(1) + 'x';
        if (mixer) {
            mixer.timeScale = speed;
        }
    });
    
    loopBtn.addEventListener('click', () => {
        loopMode = THREE.LoopRepeat;
        loopBtn.classList.add('active');
        onceBtn.classList.remove('active');
        if (activeAction) {
            activeAction.setLoop(loopMode);
        }
    });
    
    onceBtn.addEventListener('click', () => {
        loopMode = THREE.LoopOnce;
        onceBtn.classList.add('active');
        loopBtn.classList.remove('active');
        if (activeAction) {
            activeAction.setLoop(loopMode);
            activeAction.clampWhenFinished = true;
        }
    });
    
    const screenshotBtn = document.getElementById('screenshotBtn');
    screenshotBtn.addEventListener('click', captureScreenshot);
}

function captureScreenshot() {
    renderer.render(scene, camera);
    
    const link = document.createElement('a');
    link.download = `threejs-animation-${Date.now()}.png`;
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 212, 0, 0.9);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 16px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = '✅ 截图已保存!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    if (mixer) {
        mixer.update(delta);
    }
    
    controls.update();
    renderer.render(scene, camera);
}

init();
