const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'start';
let score = 0;
let currentLevel = 1;
let combo = 0;
let comboTimer = 0;

const keys = {};

class Character {
    constructor(x, y, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 100;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpPower = -15;
        this.gravity = 0.8;
        this.grounded = false;
        this.health = 100;
        this.maxHealth = 100;
        this.color = color;
        this.isPlayer = isPlayer;
        this.facing = isPlayer ? 1 : -1;
        this.state = 'idle';
        this.attackTimer = 0;
        this.hitTimer = 0;
        this.invincible = 0;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.attackType = null;
        this.specialCooldown = 0;
        this.ultimateCooldown = 0;
        this.power = 100;
    }

    update(groundY) {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;

        if (this.y + this.height > groundY) {
            this.y = groundY - this.height;
            this.vy = 0;
            this.grounded = true;
        } else {
            this.grounded = false;
        }

        if (this.attackTimer > 0) {
            this.attackTimer--;
            if (this.attackTimer === 0) {
                this.state = 'idle';
                this.attackType = null;
            }
        }

        if (this.hitTimer > 0) {
            this.hitTimer--;
        }

        if (this.invincible > 0) {
            this.invincible--;
        }

        if (this.specialCooldown > 0) this.specialCooldown--;
        if (this.ultimateCooldown > 0) this.ultimateCooldown--;

        if (!this.isPlayer && this.power < 100) {
            this.power += 0.2;
        }

        this.animationTimer++;
        if (this.animationTimer > 10) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }

    draw() {
        ctx.save();
        
        if (this.invincible > 0 && Math.floor(this.invincible / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const drawX = this.facing === -1 ? this.x + this.width : this.x;
        ctx.translate(drawX, this.y);
        ctx.scale(this.facing, 1);

        this.drawBody();

        ctx.restore();
    }

    drawBody() {
        ctx.fillStyle = this.color;
        ctx.fillRect(10, 25, 40, 50);
        
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(15, 0, 30, 30);
        
        ctx.fillStyle = '#333';
        if (this.isPlayer) {
            ctx.fillRect(10, 0, 40, 15);
        } else {
            ctx.fillRect(15, 0, 30, 10);
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(10, 75, 15, 25);
        ctx.fillRect(35, 75, 15, 25);
        
        ctx.fillStyle = '#ffdbac';
        if (this.state === 'attack') {
            ctx.fillRect(45, 30, 25, 12);
            ctx.fillRect(-10, 30, 20, 12);
        } else {
            ctx.fillRect(-5, 30, 15, 12);
            ctx.fillRect(50, 30, 15, 12);
        }
    }

    takeDamage(damage) {
        if (this.invincible > 0) return false;
        
        this.health -= damage;
        this.hitTimer = 15;
        this.invincible = 30;
        this.state = 'hit';
        
        if (this.health <= 0) {
            this.health = 0;
            return true;
        }
        return false;
    }

    attack(type) {
        if (this.attackTimer > 0) return null;
        
        this.state = 'attack';
        this.attackType = type;
        
        let attackBox = null;
        let damage = 0;
        
        switch(type) {
            case 'light':
                this.attackTimer = 20;
                damage = 10;
                attackBox = {
                    x: this.facing === 1 ? this.x + this.width : this.x - 50,
                    y: this.y + 20,
                    width: 50,
                    height: 40
                };
                break;
            case 'heavy':
                this.attackTimer = 35;
                damage = 20;
                attackBox = {
                    x: this.facing === 1 ? this.x + this.width : this.x - 70,
                    y: this.y + 10,
                    width: 70,
                    height: 60
                };
                break;
            case 'special':
                this.attackTimer = 45;
                damage = 30;
                this.specialCooldown = 60;
                attackBox = {
                    x: this.facing === 1 ? this.x + this.width : this.x - 100,
                    y: this.y,
                    width: 100,
                    height: 100
                };
                break;
            case 'ultimate':
                this.attackTimer = 60;
                damage = 50;
                this.ultimateCooldown = 180;
                this.power = 0;
                attackBox = {
                    x: this.facing === 1 ? this.x + this.width - 50 : this.x - 150,
                    y: this.y - 20,
                    width: 150,
                    height: 140
                };
                break;
        }
        
        return { box: attackBox, damage: damage };
    }
}

class Enemy extends Character {
    constructor(x, y, type) {
        super(x, y, type === 'boss' ? '#8b0000' : '#4a0080', false);
        this.type = type;
        this.aiState = 'idle';
        this.aiTimer = 0;
        this.targetX = 0;
        
        if (type === 'boss') {
            this.maxHealth = 200;
            this.health = 200;
            this.width = 80;
            this.height = 120;
        } else {
            this.maxHealth = 80 + currentLevel * 20;
            this.health = this.maxHealth;
        }
    }

    updateAI(player, groundY) {
        this.aiTimer++;
        
        const distX = player.x - this.x;
        const distY = player.y - this.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        this.facing = distX > 0 ? 1 : -1;
        
        if (this.aiState === 'idle') {
            this.vx = 0;
            if (this.aiTimer > 30) {
                this.aiTimer = 0;
                if (distance > 300) {
                    this.aiState = 'approach';
                } else if (distance < 100) {
                    this.aiState = 'attack';
                } else {
                    this.aiState = Math.random() > 0.5 ? 'approach' : 'retreat';
                }
            }
        } else if (this.aiState === 'approach') {
            this.vx = this.facing * (this.type === 'boss' ? 4 : 3);
            if (distance < 120 || this.aiTimer > 60) {
                this.aiTimer = 0;
                this.aiState = 'attack';
            }
        } else if (this.aiState === 'retreat') {
            this.vx = -this.facing * 2;
            if (distance > 250 || this.aiTimer > 40) {
                this.aiTimer = 0;
                this.aiState = 'idle';
            }
        } else if (this.aiState === 'attack') {
            this.vx = 0;
            if (this.aiTimer > 20) {
                this.aiTimer = 0;
                
                if (this.type === 'boss' && this.power >= 100 && distance < 200) {
                    this.attack('ultimate');
                } else if (this.type === 'boss' && this.specialCooldown === 0 && distance < 150) {
                    this.attack('special');
                } else if (Math.random() > 0.6) {
                    this.attack('heavy');
                } else {
                    this.attack('light');
                }
                
                this.aiState = 'idle';
            }
        }
        
        this.update(groundY);
    }
}

class Particle {
    constructor(x, y, color, vx, vy) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.life = 30;
        this.size = 5 + Math.random() * 5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3;
        this.life--;
        this.size *= 0.95;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 30;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

class Effect {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = type === 'ultimate' ? 40 : 20;
        this.maxLife = this.life;
    }

    update() {
        this.life--;
    }

    draw() {
        const progress = 1 - this.life / this.maxLife;
        
        if (this.type === 'special') {
            ctx.strokeStyle = '#ff6b35';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30 + progress * 50, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = 'rgba(255, 107, 53, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 20 + progress * 40, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'ultimate') {
            const colors = ['#ff0000', '#ff6b35', '#ffff00', '#ffffff'];
            for (let i = 0; i < 4; i++) {
                ctx.strokeStyle = colors[i];
                ctx.lineWidth = 4 - i;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 50 + progress * 100 + i * 20, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else if (this.type === 'hit') {
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('HIT!', this.x - 25, this.y - progress * 30);
        }
    }
}

let player;
let enemies = [];
let particles = [];
let effects = [];
let currentEnemy = null;

const groundY = 480;

function initLevel() {
    enemies = [];
    particles = [];
    effects = [];
    
    player = new Character(100, groundY - 100, '#ff4444', true);
    
    const enemyCount = Math.min(2 + currentLevel, 5);
    
    for (let i = 0; i < enemyCount; i++) {
        const isBoss = currentLevel % 3 === 0 && i === enemyCount - 1;
        enemies.push(new Enemy(500 + i * 150, groundY - 100, isBoss ? 'boss' : 'normal'));
    }
    
    currentEnemy = enemies[0];
    updateUI();
}

function updateUI() {
    const playerPercent = (player.health / player.maxHealth) * 100;
    const playerFill = document.getElementById('playerHealthFill');
    playerFill.style.width = playerPercent + '%';
    playerFill.className = 'health-fill';
    if (playerPercent < 25) playerFill.classList.add('low');
    else if (playerPercent < 50) playerFill.classList.add('medium');
    
    if (currentEnemy) {
        const enemyPercent = (currentEnemy.health / currentEnemy.maxHealth) * 100;
        const enemyFill = document.getElementById('enemyHealthFill');
        enemyFill.style.width = enemyPercent + '%';
        enemyFill.className = 'health-fill';
        if (enemyPercent < 25) enemyFill.classList.add('low');
        else if (enemyPercent < 50) enemyFill.classList.add('medium');
    }
    
    document.getElementById('score').textContent = '分数: ' + score;
    document.getElementById('level').textContent = '关卡: ' + currentLevel;
}

function checkCollision(box1, box2) {
    return box1.x < box2.x + box2.width &&
           box1.x + box1.width > box2.x &&
           box1.y < box2.y + box2.height &&
           box1.y + box1.height > box2.y;
}

function createHitParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(
            x, y,
            ['#ff6b35', '#ffff00', '#ffffff'][Math.floor(Math.random() * 3)],
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10 - 5
        ));
    }
}

function updateCombo() {
    combo++;
    comboTimer = 90;
    document.getElementById('comboDisplay').textContent = combo + ' 连击!';
    document.getElementById('comboDisplay').style.opacity = '1';
}

function gameLoop() {
    if (gameState !== 'playing') {
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    ctx.fillStyle = '#333';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    ctx.fillStyle = '#555';
    ctx.fillRect(0, groundY, canvas.width, 5);
    
    player.vx = 0;
    if (keys['a'] || keys['ArrowLeft']) {
        player.vx = -player.speed;
        player.facing = -1;
        if (player.grounded && player.state !== 'attack') player.state = 'walk';
    }
    if (keys['d'] || keys['ArrowRight']) {
        player.vx = player.speed;
        player.facing = 1;
        if (player.grounded && player.state !== 'attack') player.state = 'walk';
    }
    if ((keys['w'] || keys['ArrowUp']) && player.grounded) {
        player.vy = player.jumpPower;
        player.state = 'jump';
    }
    if (!keys['a'] && !keys['ArrowLeft'] && !keys['d'] && !keys['ArrowRight'] && player.state === 'walk') {
        player.state = 'idle';
    }
    
    player.update(groundY);
    
    if (player.power < 100) player.power += 0.3;
    
    enemies.forEach((enemy, index) => {
        if (enemy.health > 0) {
            enemy.updateAI(player, groundY);
            
            if (enemy.attackType && enemy.attackTimer > 10) {
                const attackBox = enemy.getAttackBox ? enemy.getAttackBox() : null;
                if (attackBox) {
                    const playerBox = { x: player.x, y: player.y, width: player.width, height: player.height };
                    if (checkCollision(attackBox.box, playerBox)) {
                        const dead = player.takeDamage(attackBox.damage);
                        createHitParticles(player.x + player.width / 2, player.y + player.height / 2);
                        effects.push(new Effect(player.x + player.width / 2, player.y + player.height / 2, 'hit'));
                        combo = 0;
                        document.getElementById('comboDisplay').style.opacity = '0';
                        if (dead) {
                            gameOver();
                        }
                    }
                }
            }
        }
    });
    
    if (player.attackType && player.attackTimer > 5 && player.attackTimer < 15) {
        const attackResult = player.attack(player.attackType);
        if (attackResult) {
            enemies.forEach(enemy => {
                if (enemy.health > 0) {
                    const enemyBox = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
                    if (checkCollision(attackResult.box, enemyBox)) {
                        const dead = enemy.takeDamage(attackResult.damage);
                        createHitParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        
                        if (player.attackType === 'special') {
                            effects.push(new Effect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'special'));
                        } else if (player.attackType === 'ultimate') {
                            effects.push(new Effect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'ultimate'));
                        }
                        
                        updateCombo();
                        
                        if (dead) {
                            score += enemy.type === 'boss' ? 500 : 100;
                            for (let i = 0; i < 20; i++) {
                                particles.push(new Particle(
                                    enemy.x + enemy.width / 2,
                                    enemy.y + enemy.height / 2,
                                    ['#ff0000', '#ff6b35', '#ffff00'][Math.floor(Math.random() * 3)],
                                    (Math.random() - 0.5) * 15,
                                    (Math.random() - 0.5) * 15 - 8
                                ));
                            }
                        }
                    }
                }
            });
        }
    }
    
    particles = particles.filter(p => {
        p.update();
        return p.life > 0;
    });
    
    effects = effects.filter(e => {
        e.update();
        return e.life > 0;
    });
    
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer === 0) {
            combo = 0;
            document.getElementById('comboDisplay').style.opacity = '0';
        }
    }
    
    enemies.forEach(enemy => {
        if (enemy.health > 0) {
            enemy.draw();
        }
    });
    player.draw();
    
    particles.forEach(p => p.draw());
    effects.forEach(e => e.draw());
    
    drawPowerBar();
    
    enemies = enemies.filter(e => e.health > 0);
    
    if (enemies.length > 0 && enemies[0] !== currentEnemy) {
        currentEnemy = enemies[0];
    }
    
    updateUI();
    
    if (enemies.length === 0) {
        levelComplete();
    }
    
    requestAnimationFrame(gameLoop);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
    gradient.addColorStop(0, '#0f0c29');
    gradient.addColorStop(0.5, '#302b63');
    gradient.addColorStop(1, '#24243e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, groundY);
    
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37 + currentLevel * 10) % canvas.width;
        const y = (i * 23) % (groundY - 100);
        ctx.beginPath();
        ctx.arc(x, y, 1 + Math.sin(Date.now() / 500 + i) * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(0, groundY - 100);
    ctx.lineTo(200, groundY - 150);
    ctx.lineTo(400, groundY - 80);
    ctx.lineTo(600, groundY - 200);
    ctx.lineTo(800, groundY - 120);
    ctx.lineTo(960, groundY - 180);
    ctx.lineTo(960, groundY);
    ctx.fill();
}

function drawPowerBar() {
    ctx.fillStyle = '#333';
    ctx.fillRect(10, canvas.height - 30, 200, 20);
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(10, canvas.height - 30, player.power * 2, 20);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, canvas.height - 30, 200, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('能量', 15, canvas.height - 35);
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameState = 'playing';
    score = 0;
    currentLevel = 1;
    combo = 0;
    initLevel();
    gameLoop();
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    gameState = 'playing';
    score = 0;
    currentLevel = 1;
    combo = 0;
    initLevel();
}

function nextLevel() {
    document.getElementById('levelComplete').style.display = 'none';
    gameState = 'playing';
    currentLevel++;
    initLevel();
}

function gameOver() {
    gameState = 'gameover';
    document.getElementById('finalScore').textContent = '分数: ' + score;
    document.getElementById('gameOver').style.display = 'block';
}

function levelComplete() {
    gameState = 'levelcomplete';
    const bonus = combo * 10 + currentLevel * 50;
    score += bonus;
    document.getElementById('levelScore').textContent = '获得 ' + bonus + ' 奖励分!';
    document.getElementById('levelComplete').style.display = 'block';
}

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (gameState === 'playing') {
        if (e.key.toLowerCase() === 'j') {
            player.attack('light');
        } else if (e.key.toLowerCase() === 'k') {
            player.attack('heavy');
        } else if (e.key.toLowerCase() === 'l' && player.specialCooldown === 0) {
            player.attack('special');
        } else if (e.key === ' ' && player.ultimateCooldown === 0 && player.power >= 100) {
            player.attack('ultimate');
        }
    }
    
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

gameLoop();
