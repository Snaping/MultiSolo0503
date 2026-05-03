class Game {
    constructor() {
        this.player = null;
        this.map = null;
        this.enemies = [];
        this.currentLevel = 1;
        this.score = 0;
        this.totalKills = 0;
        this.enemiesKilled = 0;
        this.isGameRunning = false;
        this.isBattling = false;
        this.currentEnemy = null;
        this.healCooldown = 0;
        this.fleeCooldown = 0;
        this.levelComplete = false;
        this.gamePhase = 'exploring';
        
        this.audioContext = null;
        this.particles = [];
        
        this.screens = {
            start: document.getElementById('startScreen'),
            game: document.getElementById('gameScreen'),
            levelComplete: document.getElementById('levelCompleteScreen'),
            gameOver: document.getElementById('gameOverScreen'),
            victory: document.getElementById('victoryScreen')
        };
        
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            s: false,
            a: false,
            d: false,
            ' ': false,
            h: false,
            f: false
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initAudio();
        this.showScreen('start');
        this.initCanvas();
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('attackBtn').addEventListener('click', () => this.attack());
        document.getElementById('healBtn').addEventListener('click', () => this.heal());
        document.getElementById('fleeBtn').addEventListener('click', () => this.flee());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
        
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (key in this.keys) {
            this.keys[key] = true;
            this.keys[e.key] = true;
            e.preventDefault();
        }
        
        if (e.key === ' ' && this.isBattling) {
            e.preventDefault();
            this.attack();
        }
        
        if (e.key.toLowerCase() === 'h' && this.isGameRunning) {
            e.preventDefault();
            this.heal();
        }
        
        if (e.key.toLowerCase() === 'f' && this.isBattling) {
            e.preventDefault();
            this.flee();
        }
    }

    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (key in this.keys) {
            this.keys[key] = false;
            this.keys[e.key] = false;
        }
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playSound(type) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const sounds = {
            attack: { freq: 850, duration: 0.12, type: 'square' },
            hit: { freq: 220, duration: 0.25, type: 'sawtooth' },
            heal: { freq: 650, duration: 0.35, type: 'sine' },
            victory: { freq: [523, 659, 784, 880], duration: 0.25, type: 'sine' },
            defeat: { freq: [150, 100, 80], duration: 0.4, type: 'sawtooth' },
            level: { freq: [440, 554, 659], duration: 0.2, type: 'sine' },
            walk: { freq: 800, duration: 0.08, type: 'square' },
            pickup: { freq: 1000, duration: 0.2, type: 'sine' },
            alert: { freq: [400, 600], duration: 0.3, type: 'square' }
        };
        
        const sound = sounds[type];
        if (!sound) return;
        
        oscillator.type = sound.type;
        
        if (Array.isArray(sound.freq)) {
            sound.freq.forEach((freq, i) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    osc.type = sound.type;
                    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    osc.start();
                    osc.stop(this.audioContext.currentTime + sound.duration);
                }, i * 100);
            });
            return;
        }
        
        oscillator.frequency.setValueAtTime(sound.freq, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }

    initCanvas() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas && this.canvas) {
            this.canvas.width = gameCanvas.clientWidth || 800;
            this.canvas.height = gameCanvas.clientHeight || 600;
        }
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    startGame() {
        this.player = new Player(100, 30, 15);
        this.currentLevel = 1;
        this.score = 0;
        this.totalKills = 0;
        this.enemiesKilled = 0;
        this.healCooldown = 0;
        this.fleeCooldown = 0;
        this.levelComplete = false;
        this.isBattling = false;
        this.currentEnemy = null;
        this.gamePhase = 'exploring';
        this.particles = [];
        
        this.resizeCanvas();
        this.generateMap();
        this.showScreen('game');
        
        setTimeout(() => {
            this.resizeCanvas();
            this.render();
        }, 100);
        
        this.addLog('欢迎来到浣熊市...', 'flag');
        this.addLog('寻找出口逃离这个危险的地方!', 'flag');
        this.updateUI();
        this.gameLoop();
    }

    generateMap() {
        const mapSize = 8;
        this.map = new Map(mapSize);
        this.map.generate();
        
        this.player.x = 1;
        this.player.y = Math.floor(mapSize / 2);
        
        this.enemies = [];
        const enemyCount = Math.min(2 + Math.floor(this.currentLevel / 2), 5);
        
        for (let i = 0; i < enemyCount; i++) {
            const enemy = this.spawnEnemy();
            this.enemies.push(enemy);
        }
        
        this.updateMiniMap();
    }

    spawnEnemy() {
        const enemyTypes = ['zombie', 'hunter', 'tyrant', 'licker'];
        const typeIndex = Math.min(Math.floor(Math.random() * (this.currentLevel / 3 + 1)), enemyTypes.length - 1);
        const type = enemyTypes[typeIndex];
        
        let x, y;
        do {
            x = Math.floor(Math.random() * (this.map.size - 2)) + 1;
            y = Math.floor(Math.random() * (this.map.size - 2)) + 1;
        } while (this.isPositionOccupied(x, y));
        
        return new Enemy(type, x, y, this.currentLevel);
    }

    isPositionOccupied(x, y) {
        if (x === this.player.x && y === this.player.y) return true;
        if (x === this.map.exitX && y === this.map.exitY) return true;
        
        for (const enemy of this.enemies) {
            if (enemy.x === x && enemy.y === y) return true;
        }
        return false;
    }

    gameLoop() {
        if (!this.isGameRunning) {
            this.isGameRunning = true;
        }
        
        this.update();
        this.render();
        
        if (this.isGameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    update() {
        if (this.levelComplete) return;
        
        this.handleMovement();
        this.updateEnemies();
        this.updateParticles();
        this.checkCollisions();
        
        if (this.healCooldown > 0) {
            this.healCooldown = Math.max(0, this.healCooldown - 1/60);
        }
        if (this.fleeCooldown > 0) {
            this.fleeCooldown = Math.max(0, this.fleeCooldown - 1/60);
        }
        
        this.updateUI();
    }

    handleMovement() {
        if (this.isBattling) return;
        
        const moveSpeed = 3;
        let moved = false;
        
        if (this.keys.ArrowUp || this.keys.w) {
            if (this.player.y > 0) {
                this.player.y--;
                moved = true;
            }
        }
        if (this.keys.ArrowDown || this.keys.s) {
            if (this.player.y < this.map.size - 1) {
                this.player.y++;
                moved = true;
            }
        }
        if (this.keys.ArrowLeft || this.keys.a) {
            if (this.player.x > 0) {
                this.player.x--;
                moved = true;
            }
        }
        if (this.keys.ArrowRight || this.keys.d) {
            if (this.player.x < this.map.size - 1) {
                this.player.x++;
                moved = true;
            }
        }
        
        if (moved) {
            this.playSound('walk');
            this.updateMiniMap();
            this.createStepParticles();
        }
    }

    createStepParticles() {
        const centerX = this.player.x * (this.canvas.width / this.map.size) + (this.canvas.width / this.map.size) / 2;
        const centerY = this.player.y * (this.canvas.height / this.map.size) + (this.canvas.height / this.map.size) / 2;
        
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: centerX + (Math.random() - 0.5) * 20,
                y: centerY + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * -1 - 1,
                life: 1,
                color: 'rgba(255, 255, 255, 0.3)'
            });
        }
    }

    updateEnemies() {
        if (this.isBattling) return;
        
        for (const enemy of this.enemies) {
            if (!enemy.active) continue;
            
            enemy.update(this.player.x, this.player.y);
            
            if (enemy.x === this.player.x && enemy.y === this.player.y) {
                this.startBattle(enemy);
            }
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= 0.02;
            return p.life > 0;
        });
    }

    checkCollisions() {
        if (this.player.x === this.map.exitX && this.player.y === this.map.exitY) {
            this.completeLevel();
        }
    }

    startBattle(enemy) {
        this.isBattling = true;
        this.currentEnemy = enemy;
        this.gamePhase = 'battle';
        this.playSound('alert');
        
        this.addLog(`遭遇 ${enemy.name}!`, 'enemy');
        this.showEnemyAlert(enemy.name);
    }

    showEnemyAlert(name) {
        const alert = document.getElementById('enemyAlert');
        alert.textContent = `⚠️ ${name} 出现!`;
        alert.style.display = 'block';
        
        setTimeout(() => {
            alert.style.display = 'none';
        }, 3000);
    }

    attack() {
        if (!this.isBattling || !this.currentEnemy) return;
        if (this.player.ammo <= 0) {
            this.addLog('弹药耗尽!', 'warning');
            return;
        }
        
        this.playSound('attack');
        const damage = this.player.attack();
        this.player.ammo -= 1;
        this.currentEnemy.takeDamage(damage);
        this.score += 10;
        
        this.addLog(`你对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害!`, 'player');
        this.createHitParticles(true);
        
        if (this.currentEnemy.isDead()) {
            this.onEnemyDefeated();
        } else {
            setTimeout(() => this.enemyAttack(), 600);
        }
        
        this.updateUI();
    }

    enemyAttack() {
        if (!this.isBattling || !this.currentEnemy) return;
        
        this.playSound('hit');
        const damage = this.currentEnemy.attack();
        this.player.takeDamage(damage);
        
        this.addLog(`${this.currentEnemy.name} 对你造成了 ${damage} 点伤害!`, 'enemy');
        this.createHitParticles(false);
        
        if (this.player.isDead()) {
            this.gameOver();
        }
        
        this.updateUI();
    }

    createHitParticles(isPlayer) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const color = isPlayer ? 'rgba(255, 71, 87, 0.8)' : 'rgba(243, 156, 18, 0.8)';
        const offsetX = isPlayer ? -this.canvas.width * 0.2 : this.canvas.width * 0.2;
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push({
                x: centerX + offsetX,
                y: centerY,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                life: 1,
                color: color
            });
        }
    }

    heal() {
        if (this.healCooldown > 0) {
            this.addLog('治疗冷却中...', 'heal');
            return;
        }
        
        if (this.player.health >= this.player.maxHealth) {
            this.addLog('生命值已满!', 'warning');
            return;
        }
        
        this.playSound('heal');
        const healAmount = this.player.heal();
        this.healCooldown = 5;
        this.score = Math.max(0, this.score - 5);
        
        this.addLog(`使用医疗包，恢复 ${healAmount} 点生命!`, 'heal');
        this.createHealParticles();
        
        this.updateUI();
    }

    createHealParticles() {
        const centerX = this.canvas.width / 2 - this.canvas.width * 0.2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * -2 - 1,
                life: 1,
                color: 'rgba(39, 174, 96, 0.8)'
            });
        }
    }

    flee() {
        if (this.fleeCooldown > 0) {
            this.addLog('逃跑冷却中...', 'enemy');
            return;
        }
        
        const fleeChance = 0.3 + (this.player.health / this.player.maxHealth) * 0.4;
        
        if (Math.random() < fleeChance) {
            this.addLog('成功逃离战斗!', 'player');
            this.endBattle();
            
            let newX, newY;
            do {
                newX = this.player.x + (Math.random() > 0.5 ? 1 : -1);
                newY = this.player.y;
            } while (newX < 0 || newX >= this.map.size);
            
            this.player.x = newX;
            this.fleeCooldown = 3;
            this.score += 5;
            this.updateMiniMap();
        } else {
            this.addLog('逃跑失败!', 'enemy');
            this.fleeCooldown = 2;
            setTimeout(() => this.enemyAttack(), 400);
        }
        
        this.updateUI();
    }

    endBattle() {
        this.isBattling = false;
        this.currentEnemy = null;
        this.gamePhase = 'exploring';
    }

    onEnemyDefeated() {
        this.enemiesKilled++;
        this.totalKills++;
        this.score += 50;
        
        this.addLog(`击败了 ${this.currentEnemy.name}!`, 'player');
        this.createKillParticles();
        
        this.currentEnemy.active = false;
        this.enemies = this.enemies.filter(e => e.active);
        
        this.endBattle();
        this.updateMiniMap();
        
        if (this.enemies.length === 0) {
            this.addLog('所有敌人已清除!', 'flag');
        }
        
        this.updateUI();
    }

    createKillParticles() {
        const centerX = this.canvas.width / 2 + this.canvas.width * 0.2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: 'rgba(255, 71, 87, 0.8)'
            });
        }
    }

    completeLevel() {
        this.levelComplete = true;
        this.isGameRunning = false;
        this.playSound('level');
        
        document.getElementById('enemiesKilled').textContent = this.enemiesKilled;
        document.getElementById('levelScore').textContent = this.score;
        document.getElementById('remainingHealth').textContent = this.player.health;
        
        setTimeout(() => {
            this.showScreen('levelComplete');
        }, 1000);
    }

    nextLevel() {
        this.currentLevel++;
        
        if (this.currentLevel > 10) {
            this.victory();
            return;
        }
        
        this.player.maxHealth += 15;
        this.player.health = Math.min(this.player.health + 30, this.player.maxHealth);
        this.player.maxAmmo += 5;
        this.player.ammo = this.player.maxAmmo;
        this.enemiesKilled = 0;
        this.levelComplete = false;
        this.healCooldown = 0;
        this.fleeCooldown = 0;
        
        this.generateMap();
        this.showScreen('game');
        this.addLog(`进入第 ${this.currentLevel} 关`, 'flag');
        this.updateUI();
        this.gameLoop();
    }

    gameOver() {
        this.isGameRunning = false;
        this.playSound('defeat');
        
        document.getElementById('finalLevel').textContent = this.currentLevel;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('totalKills').textContent = this.totalKills;
        
        setTimeout(() => {
            this.showScreen('gameOver');
        }, 1000);
    }

    victory() {
        this.playSound('victory');
        document.getElementById('victoryScore').textContent = this.score;
        document.getElementById('victoryKills').textContent = this.totalKills;
        document.getElementById('victoryHealth').textContent = this.player.health;
        
        this.showScreen('victory');
    }

    restartGame() {
        this.isGameRunning = false;
        this.showScreen('start');
    }

    updateUI() {
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('healthValue').textContent = `${this.player.health}/${this.player.maxHealth}`;
        document.getElementById('healthBar').style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        document.getElementById('ammoValue').textContent = `${this.player.ammo}/${this.player.maxAmmo}`;
        document.getElementById('ammoBar').style.width = `${(this.player.ammo / this.player.maxAmmo) * 100}%`;
        document.getElementById('score').textContent = this.score;
        
        document.getElementById('healBtn').disabled = this.healCooldown > 0;
        document.getElementById('fleeBtn').disabled = this.fleeCooldown > 0 || !this.isBattling;
        document.getElementById('attackBtn').disabled = !this.isBattling || this.player.ammo <= 0;
        
        document.getElementById('healBtn').innerHTML = this.healCooldown > 0 ? `💊 冷却(${Math.ceil(this.healCooldown)}s)` : '💊 治疗';
        document.getElementById('fleeBtn').innerHTML = this.fleeCooldown > 0 ? `🏃 冷却(${Math.ceil(this.fleeCooldown)}s)` : '🏃 逃跑';
    }

    updateMiniMap() {
        const mapPlayer = document.getElementById('mapPlayer');
        mapPlayer.style.left = `${(this.player.x / this.map.size) * 100}%`;
        mapPlayer.style.top = `${(this.player.y / this.map.size) * 100}%`;
        
        const mapExit = document.getElementById('mapExit');
        mapExit.style.left = `${(this.map.exitX / this.map.size) * 100}%`;
        mapExit.style.top = `${(this.map.exitY / this.map.size) * 100}%`;
        
        const enemiesContainer = document.getElementById('mapEnemies');
        enemiesContainer.innerHTML = '';
        
        this.enemies.forEach((enemy, index) => {
            if (enemy.active) {
                const enemyDot = document.createElement('div');
                enemyDot.className = 'map-enemies';
                enemyDot.style.left = `${(enemy.x / this.map.size) * 100}%`;
                enemyDot.style.top = `${(enemy.y / this.map.size) * 100}%`;
                enemyDot.style.zIndex = index + 1;
                enemiesContainer.appendChild(enemyDot);
            }
        });
    }

    addLog(message, type = 'player') {
        const logContent = document.getElementById('logContent');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
        
        if (logContent.children.length > 15) {
            logContent.removeChild(logContent.firstChild);
        }
    }

    render() {
        this.ctx.fillStyle = '#0d0d1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawMap();
        this.drawPlayer();
        this.drawEnemies();
        this.drawParticles();
        
        if (this.isBattling) {
            this.drawBattleUI();
        }
    }

    drawMap() {
        const tileWidth = this.canvas.width / this.map.size;
        const tileHeight = this.canvas.height / this.map.size;
        
        for (let y = 0; y < this.map.size; y++) {
            for (let x = 0; x < this.map.size; x++) {
                const tile = this.map.getTile(x, y);
                this.drawTile(x, y, tile, tileWidth, tileHeight);
            }
        }
        
        this.drawExit(tileWidth, tileHeight);
    }

    drawTile(x, y, tile, tileWidth, tileHeight) {
        const colors = {
            empty: '#1a1a2e',
            wall: '#555555',
            door: '#2ecc71'
        };
        
        this.ctx.fillStyle = colors[tile] || colors.empty;
        this.ctx.fillRect(x * tileWidth + 1, y * tileHeight + 1, tileWidth - 2, tileHeight - 2);
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x * tileWidth + 1, y * tileHeight + 1, tileWidth - 2, tileHeight - 2);
    }

    drawExit(tileWidth, tileHeight) {
        const x = this.map.exitX * tileWidth + tileWidth / 2;
        const y = this.map.exitY * tileHeight + tileHeight / 2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        const pulse = Math.sin(Date.now() / 300) * 5;
        this.ctx.shadowBlur = 20 + pulse;
        this.ctx.shadowColor = '#27ae60';
        
        this.ctx.fillStyle = '#27ae60';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -tileHeight / 2 + 5);
        this.ctx.lineTo(-tileWidth / 4, tileHeight / 2 - 5);
        this.ctx.lineTo(0, tileHeight / 2 - 15);
        this.ctx.lineTo(tileWidth / 4, tileHeight / 2 - 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }

    drawPlayer() {
        if (!this.map || !this.player) return;
        
        const tileWidth = this.canvas.width / this.map.size;
        const tileHeight = this.canvas.height / this.map.size;
        const x = this.player.x * tileWidth + tileWidth / 2;
        const y = this.player.y * tileHeight + tileHeight / 2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        const bounce = Math.sin(Date.now() / 300) * 3;
        this.ctx.translate(0, bounce);
        
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#3498db';
        
        this.ctx.fillStyle = '#3498db';
        this.ctx.beginPath();
        this.ctx.arc(0, -tileHeight/3, tileWidth/3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fillRect(-tileWidth/4, -tileHeight/6, tileWidth/2, tileHeight/3);
        
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(-tileWidth/3, -tileHeight/8, tileWidth/5, tileHeight/4);
        this.ctx.fillRect(tileWidth/6, -tileHeight/8, tileWidth/5, tileHeight/4);
        
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fillRect(-tileWidth/6, tileHeight/6, tileWidth/7, tileHeight/4);
        this.ctx.fillRect(tileWidth/12, tileHeight/6, tileWidth/7, tileHeight/4);
        
        this.ctx.restore();
    }

    drawEnemies() {
        if (!this.map) return;
        
        const tileWidth = this.canvas.width / this.map.size;
        const tileHeight = this.canvas.height / this.map.size;
        
        for (const enemy of this.enemies) {
            if (!enemy.active) continue;
            
            const x = enemy.x * tileWidth + tileWidth / 2;
            const y = enemy.y * tileHeight + tileHeight / 2;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            
            const bounce = Math.sin(Date.now() / 200) * 4;
            this.ctx.translate(0, bounce);
            
            this.drawEnemyShape(enemy.type, tileWidth, tileHeight);
            
            this.ctx.restore();
        }
    }

    drawEnemyShape(type, tileWidth = 40, tileHeight = 40) {
        const colors = {
            zombie: '#27ae60',
            hunter: '#d35400',
            tyrant: '#7f8c8d',
            licker: '#8e44ad'
        };
        
        const color = colors[type] || colors.zombie;
        
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#e74c3c';
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(0, -tileHeight/3, tileWidth/3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.beginPath();
        this.ctx.arc(-tileWidth/8, -tileHeight/3 - 2, tileWidth/10, 0, Math.PI * 2);
        this.ctx.arc(tileWidth/8, -tileHeight/3 - 2, tileWidth/10, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#c0392b';
        this.ctx.beginPath();
        this.ctx.moveTo(-tileWidth/6, -tileHeight/6);
        this.ctx.lineTo(tileWidth/6, -tileHeight/6);
        this.ctx.lineTo(0, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-tileWidth/4, -tileHeight/8, tileWidth/2, tileHeight/3);
        
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(-tileWidth/3, -tileHeight/12, tileWidth/5, tileHeight/4);
        this.ctx.fillRect(tileWidth/6, -tileHeight/12, tileWidth/5, tileHeight/4);
    }

    drawParticles() {
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3 * particle.life, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    drawBattleUI() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const playerX = centerX - 150;
        const enemyX = centerX + 150;
        
        this.drawPlayerBattle(playerX, centerY);
        this.drawEnemyBattle(enemyX, centerY);
        
        this.drawHealthBar(playerX - 40, centerY + 50, 80, 12, this.player.health, this.player.maxHealth, '#27ae60');
        this.drawHealthBar(enemyX - 40, centerY + 50, 80, 12, this.currentEnemy.health, this.currentEnemy.maxHealth, '#ff4757');
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('你', playerX, centerY + 75);
        this.ctx.fillText(this.currentEnemy.name, enemyX, centerY + 75);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('VS', centerX, centerY + 20);
    }

    drawPlayerBattle(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#3498db';
        
        this.ctx.fillStyle = '#3498db';
        this.ctx.beginPath();
        this.ctx.arc(0, -25, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fillRect(-15, -5, 30, 35);
        
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(-22, 0, 10, 25);
        this.ctx.fillRect(12, 0, 10, 25);
        
        this.ctx.restore();
    }

    drawEnemyBattle(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        const bounce = Math.sin(Date.now() / 200) * 5;
        this.ctx.translate(0, bounce);
        
        this.drawEnemyShape(this.currentEnemy.type);
        
        this.ctx.restore();
    }

    drawHealthBar(x, y, width, height, current, max, color) {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, width, height);
        
        const fillWidth = (current / max) * width;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, fillWidth, height);
        
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
    }
}

class Map {
    constructor(size) {
        this.size = size;
        this.tiles = [];
        this.exitX = size - 2;
        this.exitY = Math.floor(size / 2);
    }

    generate() {
        this.tiles = [];
        for (let y = 0; y < this.size; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.size; x++) {
                if (x === this.exitX && y === this.exitY) {
                    this.tiles[y][x] = 'door';
                } else if (Math.random() < 0.1 && !(x === 1 && y === Math.floor(this.size / 2))) {
                    this.tiles[y][x] = 'wall';
                } else {
                    this.tiles[y][x] = 'empty';
                }
            }
        }
    }

    getTile(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return 'wall';
        }
        return this.tiles[y][x];
    }
}

class Player {
    constructor(health, maxAmmo, attack) {
        this.maxHealth = health;
        this.health = health;
        this.maxAmmo = maxAmmo;
        this.ammo = maxAmmo;
        this.attack = attack;
        this.x = 0;
        this.y = 0;
    }

    attack() {
        return this.attack + Math.floor(Math.random() * 8);
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    heal() {
        const healAmount = 35;
        this.health = Math.min(this.maxHealth, this.health + healAmount);
        return healAmount;
    }

    isDead() {
        return this.health <= 0;
    }
}

class Enemy {
    constructor(type, x, y, level) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.level = level;
        this.active = true;
        this.moveTimer = 0;
        this.initStats();
    }

    initStats() {
        const baseStats = {
            zombie: { name: '丧尸', health: 30, attack: 8, speed: 1.5 },
            hunter: { name: '追踪者', health: 50, attack: 12, speed: 2 },
            tyrant: { name: '暴君', health: 80, attack: 18, speed: 1 },
            licker: { name: '舔食者', health: 45, attack: 15, speed: 2.5 }
        };
        
        const stats = baseStats[this.type];
        this.name = stats.name;
        this.maxHealth = stats.health + (this.level - 1) * 12;
        this.health = this.maxHealth;
        this.attack = stats.attack + (this.level - 1) * 2;
        this.speed = stats.speed;
    }

    update(playerX, playerY) {
        this.moveTimer++;
        
        if (this.moveTimer >= 60 / this.speed) {
            this.moveTimer = 0;
            
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            
            if (Math.random() < 0.7) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.x += dx > 0 ? 1 : -1;
                } else {
                    this.y += dy > 0 ? 1 : -1;
                }
            } else {
                if (Math.random() > 0.5) {
                    this.x += Math.random() > 0.5 ? 1 : -1;
                } else {
                    this.y += Math.random() > 0.5 ? 1 : -1;
                }
            }
            
            this.x = Math.max(0, Math.min(7, this.x));
            this.y = Math.max(0, Math.min(7, this.y));
        }
    }

    attack() {
        return this.attack + Math.floor(Math.random() * 6);
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    isDead() {
        return this.health <= 0;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});