class Game {
    constructor() {
        this.player = null;
        this.enemies = [];
        this.currentLevel = 1;
        this.score = 0;
        this.enemiesKilled = 0;
        this.totalKills = 0;
        this.isBattling = false;
        this.currentEnemy = null;
        this.healCooldown = 0;
        this.fleeCooldown = 0;
        this.levelComplete = false;
        this.audioContext = null;
        
        this.screens = {
            start: document.getElementById('startScreen'),
            game: document.getElementById('gameScreen'),
            levelComplete: document.getElementById('levelCompleteScreen'),
            gameOver: document.getElementById('gameOverScreen'),
            victory: document.getElementById('victoryScreen')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('start');
        this.initCanvas();
        this.initAudio();
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
            attack: { freq: 800, duration: 0.15, type: 'square' },
            hit: { freq: 200, duration: 0.3, type: 'sawtooth' },
            heal: { freq: 600, duration: 0.4, type: 'sine' },
            victory: { freq: [523, 659, 784], duration: 0.3, type: 'sine' },
            defeat: { freq: 150, duration: 0.5, type: 'sawtooth' },
            level: { freq: [440, 554, 659], duration: 0.2, type: 'sine' }
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
                    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    osc.start();
                    osc.stop(this.audioContext.currentTime + sound.duration);
                }, i * 150);
            });
            return;
        }
        
        oscillator.frequency.setValueAtTime(sound.freq, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('attackBtn').addEventListener('click', () => this.attack());
        document.getElementById('healBtn').addEventListener('click', () => this.heal());
        document.getElementById('fleeBtn').addEventListener('click', () => this.flee());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
    }

    initCanvas() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvasAnimations = [];
        this.animationId = null;
        this.startCanvasAnimation();
    }

    resizeCanvas() {
        const gameCanvas = document.getElementById('gameCanvas');
        this.canvas.width = gameCanvas.clientWidth;
        this.canvas.height = gameCanvas.clientHeight;
    }

    startCanvasAnimation() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        
        let time = 0;
        const animate = () => {
            time += 0.02;
            this.ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.drawZombies();
            this.drawParticles(time);
            this.drawBackground(time);
            
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    drawBackground(time) {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f1a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < 5; i++) {
            const x = (time * 30 + i * 150) % this.canvas.width;
            this.ctx.fillStyle = 'rgba(255, 71, 87, 0.1)';
            this.ctx.beginPath();
            this.ctx.arc(x, 50 + i * 30, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawZombies() {
        if (!this.isBattling || !this.currentEnemy) return;
        
        const enemyX = this.canvas.width * 0.7;
        const enemyY = this.canvas.height * 0.5;
        
        this.ctx.save();
        this.ctx.translate(enemyX, enemyY);
        
        const bounce = Math.sin(Date.now() / 200) * 5;
        this.ctx.translate(0, bounce);
        
        this.drawEnemyShape();
        
        this.ctx.restore();
        
        const playerX = this.canvas.width * 0.3;
        const playerY = this.canvas.height * 0.5;
        
        this.ctx.save();
        this.ctx.translate(playerX, playerY);
        this.drawPlayerShape();
        this.ctx.restore();
    }

    drawPlayerShape() {
        this.ctx.fillStyle = '#3498db';
        this.ctx.beginPath();
        this.ctx.arc(0, -20, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fillRect(-12, -5, 24, 30);
        
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(-18, 0, 8, 20);
        this.ctx.fillRect(10, 0, 8, 20);
        
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fillRect(-8, 25, 6, 15);
        this.ctx.fillRect(2, 25, 6, 15);
    }

    drawEnemyShape() {
        const colors = {
            zombie: '#2d5a27',
            hunter: '#8b4513',
            tyrant: '#4a4a4a',
            licker: '#6b4423'
        };
        
        const type = this.currentEnemy.type || 'zombie';
        const color = colors[type] || colors.zombie;
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(0, -25, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#1a3a15';
        this.ctx.beginPath();
        this.ctx.arc(-5, -28, 4, 0, Math.PI * 2);
        this.ctx.arc(5, -28, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(0, -20, 8, 0, Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-15, 0, 30, 35);
        
        this.ctx.fillStyle = '#1a3a15';
        this.ctx.fillRect(-22, 5, 12, 25);
        this.ctx.fillRect(10, 5, 12, 25);
    }

    drawParticles(time) {
        const particles = [
            { x: (time * 50) % this.canvas.width, y: 100 + Math.sin(time) * 20 },
            { x: (time * 30 + 200) % this.canvas.width, y: 200 + Math.cos(time * 1.5) * 15 },
            { x: (time * 40 + 400) % this.canvas.width, y: 300 + Math.sin(time * 0.8) * 25 }
        ];
        
        particles.forEach(p => {
            this.ctx.fillStyle = 'rgba(255, 71, 87, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    startGame() {
        this.player = new Player(100, 10);
        this.currentLevel = 1;
        this.score = 0;
        this.totalKills = 0;
        this.healCooldown = 0;
        this.fleeCooldown = 0;
        this.showScreen('game');
        this.spawnEnemy();
        this.updateUI();
        this.addLog('进入第1关 - 浣熊市街道', 'flag');
    }

    spawnEnemy() {
        const enemyTypes = ['zombie', 'hunter', 'tyrant', 'licker'];
        const typeIndex = Math.min(Math.floor(Math.random() * (this.currentLevel / 3 + 1)), enemyTypes.length - 1);
        const type = enemyTypes[typeIndex];
        
        this.currentEnemy = new Enemy(type, this.currentLevel);
        this.isBattling = true;
        this.addLog(`遭遇 ${this.currentEnemy.name}!`, 'enemy');
    }

    attack() {
        if (!this.isBattling || !this.currentEnemy) return;
        
        this.playSound('attack');
        const damage = this.player.attack();
        this.currentEnemy.takeDamage(damage);
        this.score += 10;
        
        this.addLog(`你对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害!`, 'player');
        
        if (this.currentEnemy.isDead()) {
            this.onEnemyDefeated();
        } else {
            setTimeout(() => this.enemyAttack(), 500);
        }
        
        this.updateUI();
    }

    enemyAttack() {
        if (!this.isBattling || !this.currentEnemy) return;
        
        this.playSound('hit');
        const damage = this.currentEnemy.attack();
        this.player.takeDamage(damage);
        
        this.addLog(`${this.currentEnemy.name} 对你造成了 ${damage} 点伤害!`, 'enemy');
        
        if (this.player.isDead()) {
            this.gameOver();
        }
        
        this.updateUI();
    }

    heal() {
        if (this.healCooldown > 0) {
            this.addLog('治疗冷却中...', 'heal');
            return;
        }
        
        this.playSound('heal');
        const healAmount = this.player.heal();
        this.healCooldown = 3;
        this.score -= 5;
        
        this.addLog(`使用治疗包，恢复 ${healAmount} 点生命!`, 'heal');
        
        this.updateUI();
        
        setTimeout(() => {
            this.healCooldown = Math.max(0, this.healCooldown - 1);
        }, 1000);
    }

    flee() {
        if (this.fleeCooldown > 0) {
            this.addLog('逃跑冷却中...', 'enemy');
            return;
        }
        
        const fleeChance = 0.4 + (this.player.health / 100) * 0.3;
        
        if (Math.random() < fleeChance) {
            this.addLog('成功逃离战斗!', 'player');
            this.isBattling = false;
            this.currentEnemy = null;
            this.fleeCooldown = 2;
            this.score += 5;
            
            setTimeout(() => {
                if (!this.levelComplete) this.spawnEnemy();
            }, 1000);
        } else {
            this.addLog('逃跑失败!', 'enemy');
            this.fleeCooldown = 2;
            setTimeout(() => this.enemyAttack(), 300);
        }
        
        this.updateUI();
        
        setTimeout(() => {
            this.fleeCooldown = Math.max(0, this.fleeCooldown - 1);
        }, 1000);
    }

    onEnemyDefeated() {
        this.enemiesKilled++;
        this.totalKills++;
        this.score += 50;
        
        this.addLog(`击败了 ${this.currentEnemy.name}!`, 'player');
        
        if (this.enemiesKilled >= this.getEnemiesPerLevel()) {
            this.completeLevel();
        } else {
            this.isBattling = false;
            setTimeout(() => this.spawnEnemy(), 1500);
        }
        
        this.updateUI();
    }

    getEnemiesPerLevel() {
        return Math.min(2 + Math.floor(this.currentLevel / 2), 5);
    }

    completeLevel() {
        this.levelComplete = true;
        this.isBattling = false;
        this.playSound('level');
        
        document.getElementById('enemiesKilled').textContent = this.enemiesKilled;
        document.getElementById('levelScore').textContent = this.score;
        
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
        
        this.player.maxHealth += 10;
        this.player.health = Math.min(this.player.health + 20, this.player.maxHealth);
        this.enemiesKilled = 0;
        this.levelComplete = false;
        this.healCooldown = 0;
        this.fleeCooldown = 0;
        
        this.showScreen('game');
        this.spawnEnemy();
        this.addLog(`进入第${this.currentLevel}关`, 'flag');
        this.updateUI();
    }

    gameOver() {
        this.isBattling = false;
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
        this.showScreen('start');
    }

    updateUI() {
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('healthValue').textContent = this.player.health;
        document.getElementById('healthBar').style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        document.getElementById('score').textContent = this.score;
        
        document.getElementById('healBtn').disabled = this.healCooldown > 0;
        document.getElementById('fleeBtn').disabled = this.fleeCooldown > 0;
    }

    addLog(message, type = 'player') {
        const logContent = document.getElementById('logContent');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
        
        if (logContent.children.length > 10) {
            logContent.removeChild(logContent.firstChild);
        }
    }
}

class Player {
    constructor(health, attack) {
        this.maxHealth = health;
        this.health = health;
        this.attack = attack;
    }

    attack() {
        return this.attack + Math.floor(Math.random() * 5);
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    heal() {
        const healAmount = 30;
        this.health = Math.min(this.maxHealth, this.health + healAmount);
        return healAmount;
    }

    isDead() {
        return this.health <= 0;
    }
}

class Enemy {
    constructor(type, level) {
        this.type = type;
        this.level = level;
        this.initStats();
    }

    initStats() {
        const baseStats = {
            zombie: { name: '丧尸', health: 30, attack: 8 },
            hunter: { name: '追踪者', health: 50, attack: 12 },
            tyrant: { name: '暴君', health: 80, attack: 18 },
            licker: { name: '舔食者', health: 45, attack: 15 }
        };
        
        const stats = baseStats[this.type];
        this.name = stats.name;
        this.maxHealth = stats.health + (this.level - 1) * 10;
        this.health = this.maxHealth;
        this.attack = stats.attack + (this.level - 1) * 2;
    }

    attack() {
        return this.attack + Math.floor(Math.random() * 5);
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