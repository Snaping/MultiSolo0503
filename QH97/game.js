const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'start';
let score = 0;
let currentLevel = 1;
let combo = 0;
let comboTimer = 0;
let hitTexts = [];

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
        this.jumpPower = -16;
        this.gravity = 0.7;
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
        this.currentAttack = null;
        this.specialCooldown = 0;
        this.ultimateCooldown = 0;
        this.power = isPlayer ? 0 : 100;
        this.isAttacking = false;
        this.hasHitThisAttack = false;
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
                this.currentAttack = null;
                this.isAttacking = false;
                this.hasHitThisAttack = false;
            }
        }

        if (this.hitTimer > 0) {
            this.hitTimer--;
            if (this.hitTimer === 0) {
                this.state = 'idle';
            }
        }

        if (this.invincible > 0) {
            this.invincible--;
        }

        if (this.specialCooldown > 0) this.specialCooldown--;
        if (this.ultimateCooldown > 0) this.ultimateCooldown--;

        if (!this.isPlayer && this.power < 100) {
            this.power += 0.1;
        }

        this.animationTimer++;
        if (this.animationTimer > 8) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }

    draw() {
        ctx.save();

        if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        const drawX = this.facing === -1 ? this.x + this.width : this.x;
        ctx.translate(drawX, this.y);
        ctx.scale(this.facing, 1);

        this.drawBody();

        ctx.restore();

        this.drawHealthBar();
    }

    drawBody() {
        ctx.fillStyle = this.color;

        if (this.state === 'hit') {
            ctx.fillStyle = '#ffffff';
        }

        ctx.fillRect(10, 25, 40, 50);

        ctx.fillStyle = this.state === 'hit' ? '#ffffff' : '#ffdbac';
        ctx.fillRect(15, 0, 30, 30);

        ctx.fillStyle = this.state === 'hit' ? '#888888' : '#333';
        if (this.isPlayer) {
            ctx.fillRect(10, 0, 40, 15);
        } else {
            ctx.fillRect(15, 0, 30, 10);
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(10, 75, 15, 25);
        ctx.fillRect(35, 75, 15, 25);

        ctx.fillStyle = this.state === 'hit' ? '#ffffff' : '#ffdbac';

        if (this.state === 'attack') {
            if (this.currentAttack === 'light') {
                ctx.fillRect(45, 25, 30, 12);
            } else if (this.currentAttack === 'heavy') {
                ctx.fillRect(45, 20, 40, 15);
                ctx.fillRect(-15, 35, 20, 10);
            } else if (this.currentAttack === 'special') {
                ctx.fillRect(50, 15, 50, 20);
                ctx.fillStyle = '#ff6b35';
                ctx.fillRect(45, 20, 15, 15);
            } else if (this.currentAttack === 'ultimate') {
                ctx.fillRect(50, 10, 60, 25);
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(45, 15, 20, 20);
            }
        } else if (this.state === 'jump') {
            ctx.fillRect(40, 40, 15, 12);
            ctx.fillRect(5, 40, 15, 12);
        } else {
            ctx.fillRect(-5, 30, 15, 12);
            ctx.fillRect(50, 30, 15, 12);
        }

        if (this.isPlayer && this.state !== 'hit') {
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(25, -5, 20, 3);
        }
    }

    drawHealthBar() {
        const barWidth = 120;
        const barHeight = 14;
        const barX = this.isPlayer ? this.x - 30 : this.x - 30;
        const barY = this.y - 25;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

        ctx.fillStyle = '#440000';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        const healthWidth = barWidth * healthPercent;

        const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
        if (healthPercent > 0.6) {
            gradient.addColorStop(0, '#00ff00');
            gradient.addColorStop(0.5, '#88ff00');
            gradient.addColorStop(1, '#006600');
        } else if (healthPercent > 0.3) {
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(0.5, '#ffaa00');
            gradient.addColorStop(1, '#886600');
        } else {
            gradient.addColorStop(0, '#ff0000');
            gradient.addColorStop(0.5, '#ff4400');
            gradient.addColorStop(1, '#880000');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, healthWidth, barHeight);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        if (this.isPlayer) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('草薙京', barX, barY - 5);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(this.isBoss ? 'BOSS' : '敌人', barX, barY - 5);
        }
    }

    takeDamage(damage, attacker) {
        if (this.invincible > 0) return false;

        this.health -= damage;
        this.hitTimer = 20;
        this.invincible = 40;
        this.state = 'hit';

        this.x += (attacker.x < this.x ? 1 : -1) * 15;

        hitTexts.push({
            x: this.x + this.width / 2,
            y: this.y,
            text: '-' + damage,
            life: 40,
            color: '#ffff00'
        });

        if (this.health <= 0) {
            this.health = 0;
            return true;
        }
        return false;
    }

    attack(type) {
        if (this.attackTimer > 0) return null;
        if (this.state === 'hit') return null;

        this.state = 'attack';
        this.currentAttack = type;
        this.isAttacking = true;
        this.hasHitThisAttack = false;

        let attackBox = null;
        let damage = 0;
        let duration = 0;

        switch(type) {
            case 'light':
                this.attackTimer = 15;
                duration = 15;
                damage = 8 + Math.floor(currentLevel / 2);
                this.power = Math.min(100, this.power + 5);
                attackBox = {
                    x: this.facing === 1 ? this.x + this.width : this.x - 40,
                    y: this.y + 25,
                    width: 40,
                    height: 35
                };
                break;
            case 'heavy':
                this.attackTimer = 30;
                duration = 30;
                damage = 18 + Math.floor(currentLevel * 1.5);
                this.power = Math.min(100, this.power + 10);
                attackBox = {
                    x: this.facing === 1 ? this.x + this.width : this.x - 60,
                    y: this.y + 15,
                    width: 60,
                    height: 50
                };
                break;
            case 'special':
                if (this.specialCooldown > 0) return null;
                this.attackTimer = 40;
                duration = 40;
                damage = 30 + currentLevel * 5;
                this.specialCooldown = 90;
                this.power = Math.min(100, this.power + 20);
                attackBox = {
                    x: this.facing === 1 ? this.x + this.width : this.x - 80,
                    y: this.y,
                    width: 80,
                    height: 80
                };
                break;
            case 'ultimate':
                if (this.ultimateCooldown > 0 || this.power < 100) return null;
                this.attackTimer = 55;
                duration = 55;
                damage = 60 + currentLevel * 10;
                this.ultimateCooldown = 200;
                this.power = 0;
                attackBox = {
                    x: this.facing === 1 ? this.x + this.width - 30 : this.x - 120,
                    y: this.y - 30,
                    width: 120,
                    height: 130
                };
                break;
        }

        return { box: attackBox, damage: damage, duration: duration };
    }
}

class Enemy extends Character {
    constructor(x, y, type) {
        super(x, y, type === 'boss' ? '#8b0000' : '#4a0080', false);
        this.type = type;
        this.isBoss = type === 'boss';
        this.aiState = 'idle';
        this.aiTimer = 0;
        this.targetX = 0;

        if (this.isBoss) {
            this.maxHealth = 150 + currentLevel * 30;
            this.health = this.maxHealth;
            this.width = 80;
            this.height = 120;
            this.speed = 4;
        } else {
            this.maxHealth = 60 + currentLevel * 15;
            this.health = this.maxHealth;
        }
    }

    updateAI(player, groundY) {
        if (this.state === 'hit') {
            this.update(groundY);
            return;
        }

        this.aiTimer++;

        const distX = player.x - this.x;
        const distY = player.y - this.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        this.facing = distX > 0 ? 1 : -1;

        if (this.aiState === 'idle') {
            this.vx = 0;
            if (this.aiTimer > 25) {
                this.aiTimer = 0;
                if (distance > 250) {
                    this.aiState = 'approach';
                } else if (distance < 80) {
                    this.aiState = 'retreat';
                } else if (distance < 150) {
                    this.aiState = 'attack';
                } else {
                    this.aiState = Math.random() > 0.4 ? 'approach' : 'idle';
                }
            }
        } else if (this.aiState === 'approach') {
            this.vx = this.facing * this.speed;
            if (this.aiTimer > 40 || distance < 100) {
                this.aiTimer = 0;
                this.aiState = 'attack';
            }
        } else if (this.aiState === 'retreat') {
            this.vx = -this.facing * 2;
            if (distance > 200 || this.aiTimer > 30) {
                this.aiTimer = 0;
                this.aiState = 'idle';
            }
        } else if (this.aiState === 'attack') {
            this.vx = 0;
            if (this.aiTimer > 15) {
                this.aiTimer = 0;

                if (this.isBoss && this.power >= 100 && distance < 180) {
                    this.attack('ultimate');
                } else if (this.isBoss && this.specialCooldown === 0 && distance < 120) {
                    this.attack('special');
                } else if (Math.random() > 0.5) {
                    this.attack('heavy');
                } else {
                    this.attack('light');
                }

                this.aiState = 'idle';
            }
        }

        if (this.grounded && Math.random() < 0.02 && distance < 200) {
            this.vy = this.jumpPower;
            this.grounded = false;
        }

        this.update(groundY);
    }
}

class Particle {
    constructor(x, y, color, vx, vy, size = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.life = 25 + Math.random() * 15;
        this.maxLife = this.life;
        this.size = size || (3 + Math.random() * 6);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.4;
        this.vx *= 0.98;
        this.life--;
        this.size *= 0.96;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

class Effect {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = type === 'ultimate' ? 35 : 18;
        this.maxLife = this.life;
    }

    update() {
        this.life--;
    }

    draw() {
        const progress = 1 - this.life / this.maxLife;

        if (this.type === 'special') {
            ctx.strokeStyle = '#ff6b35';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 25 + progress * 45, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = `rgba(255, 107, 53, ${0.6 - progress * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 15 + progress * 35, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'ultimate') {
            const colors = ['#ff0000', '#ff4400', '#ffaa00', '#ffffff'];
            for (let i = 0; i < 4; i++) {
                ctx.strokeStyle = colors[i];
                ctx.lineWidth = 5 - i;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 40 + progress * 90 + i * 15, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - progress * 0.7})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30 + progress * 70, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'hit') {
            ctx.fillStyle = '#ffff00';
            ctx.font = `bold ${18 + Math.floor(progress * 12)}px Arial`;
            ctx.globalAlpha = 1 - progress;
            ctx.fillText('HIT!', this.x - 25, this.y - progress * 25);
            ctx.globalAlpha = 1;
        }
    }
}

let player;
let enemies = [];
let pendingEnemies = [];
let particles = [];
let effects = [];
let currentEnemy = null;
let enemySpawnTimer = 0;

const groundY = 480;

function initLevel() {
    enemies = [];
    pendingEnemies = [];
    particles = [];
    effects = [];
    hitTexts = [];
    enemySpawnTimer = 0;

    player = new Character(100, groundY - 100, '#ff4444', true);

    const enemyCount = Math.min(2 + currentLevel, 5);

    for (let i = 0; i < enemyCount; i++) {
        const isBoss = currentLevel % 3 === 0 && i === enemyCount - 1;
        pendingEnemies.push({
            type: isBoss ? 'boss' : 'normal',
            delay: i === 0 ? 0 : 180 + i * 120
        });
    }

    spawnEnemy();
    updateUI();
}

function spawnEnemy() {
    if (pendingEnemies.length > 0) {
        const enemyData = pendingEnemies.shift();
        const enemy = new Enemy(750, groundY - 100, enemyData.type);
        enemies.push(enemy);
        currentEnemy = enemy;

        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2,
                ['#ff6b35', '#ffaa00', '#ff4400'][Math.floor(Math.random() * 3)],
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8 - 3
            ));
        }
    }
}

function updateUI() {
    const playerPercent = (player.health / player.maxHealth) * 100;
    const playerFill = document.getElementById('playerHealthFill');
    playerFill.style.width = playerPercent + '%';
    playerFill.className = 'health-fill';
    if (playerPercent < 25) playerFill.classList.add('low');
    else if (playerPercent < 50) playerFill.classList.add('medium');

    if (currentEnemy && currentEnemy.health > 0) {
        const enemyPercent = (currentEnemy.health / currentEnemy.maxHealth) * 100;
        const enemyFill = document.getElementById('enemyHealthFill');
        enemyFill.style.width = enemyPercent + '%';
        enemyFill.className = 'health-fill';
        if (enemyPercent < 25) enemyFill.classList.add('low');
        else if (enemyPercent < 50) enemyFill.classList.add('medium');
        document.getElementById('enemyHealth').style.display = 'block';
    } else {
        document.getElementById('enemyHealth').style.display = 'none';
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

function createHitParticles(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            x, y,
            ['#ff6b35', '#ffff00', '#ffffff', '#ffaa00'][Math.floor(Math.random() * 4)],
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12 - 4
        ));
    }
}

function updateCombo() {
    combo++;
    comboTimer = 100;
    const bonus = Math.floor(combo * (1 + currentLevel * 0.2));
    score += bonus;

    if (combo > 1) {
        hitTexts.push({
            x: canvas.width / 2,
            y: 150,
            text: combo + ' 连击! +' + bonus,
            life: 60,
            color: '#ffff00',
            isCombo: true
        });
    }

    document.getElementById('comboDisplay').textContent = combo + ' 连击!';
    document.getElementById('comboDisplay').style.opacity = '1';
    document.getElementById('comboDisplay').style.transform = `translateX(-50%) scale(${1 + combo * 0.05})`;
}

function gameLoop() {
    if (gameState !== 'playing') {
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    ctx.fillStyle = '#444466';
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i, groundY, 38, 5);
    }

    player.vx = 0;

    if (player.state !== 'attack' && player.state !== 'hit') {
        if (keys['a'] || keys['ArrowLeft']) {
            player.vx = -player.speed;
            player.facing = -1;
            if (player.grounded) player.state = 'walk';
        }
        if (keys['d'] || keys['ArrowRight']) {
            player.vx = player.speed;
            player.facing = 1;
            if (player.grounded) player.state = 'walk';
        }
        if ((keys['w'] || keys['ArrowUp']) && player.grounded) {
            player.vy = player.jumpPower;
            player.grounded = false;
            player.state = 'jump';
        }
        if (!keys['a'] && !keys['ArrowLeft'] && !keys['d'] && !keys['ArrowRight'] &&
            player.grounded && player.state === 'walk') {
            player.state = 'idle';
        }
    }

    player.update(groundY);

    if (player.power < 100) player.power += 0.15;

    enemies.forEach((enemy) => {
        if (enemy.health > 0) {
            enemy.updateAI(player, groundY);

            if (enemy.isAttacking && enemy.attackTimer > 5 && enemy.attackTimer < 18 && !enemy.hasHitThisAttack) {
                const attackResult = enemy.attack(enemy.currentAttack);
                if (attackResult) {
                    const playerBox = { x: player.x, y: player.y, width: player.width, height: player.height };
                    if (checkCollision(attackResult.box, playerBox)) {
                        enemy.hasHitThisAttack = true;
                        const dead = player.takeDamage(attackResult.damage, enemy);
                        createHitParticles(player.x + player.width / 2, player.y + player.height / 2, 15);
                        effects.push(new Effect(player.x + player.width / 2, player.y + player.height / 2, 'hit'));
                        combo = 0;
                        document.getElementById('comboDisplay').style.opacity = '0';
                        document.getElementById('comboDisplay').style.transform = 'translateX(-50%) scale(1)';
                        if (dead) {
                            setTimeout(() => gameOver(), 500);
                        }
                    }
                }
            }
        }
    });

    if (player.isAttacking && player.attackTimer > 3 && player.attackTimer < 12 && !player.hasHitThisAttack) {
        const attackResult = player.attack(player.currentAttack);
        if (attackResult) {
            let hitEnemy = false;
            enemies.forEach(enemy => {
                if (enemy.health > 0) {
                    const enemyBox = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
                    if (checkCollision(attackResult.box, enemyBox)) {
                        player.hasHitThisAttack = true;
                        hitEnemy = true;
                        const dead = enemy.takeDamage(attackResult.damage, player);
                        createHitParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 12);

                        if (player.currentAttack === 'special') {
                            effects.push(new Effect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'special'));
                        } else if (player.currentAttack === 'ultimate') {
                            effects.push(new Effect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'ultimate'));
                        } else {
                            effects.push(new Effect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'hit'));
                        }

                        updateCombo();

                        if (dead) {
                            score += enemy.isBoss ? 500 : 100;
                            for (let i = 0; i < 25; i++) {
                                particles.push(new Particle(
                                    enemy.x + enemy.width / 2,
                                    enemy.y + enemy.height / 2,
                                    ['#ff0000', '#ff6b35', '#ffff00'][Math.floor(Math.random() * 3)],
                                    (Math.random() - 0.5) * 18,
                                    (Math.random() - 0.5) * 18 - 10
                                ));
                            }

                            setTimeout(() => {
                                if (pendingEnemies.length > 0) {
                                    spawnEnemy();
                                }
                            }, 1000);
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

    hitTexts = hitTexts.filter(h => {
        h.life--;
        h.y -= 1.5;
        return h.life > 0;
    });

    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer === 0) {
            combo = 0;
            document.getElementById('comboDisplay').style.opacity = '0';
            document.getElementById('comboDisplay').style.transform = 'translateX(-50%) scale(1)';
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

    hitTexts.forEach(h => {
        ctx.fillStyle = h.color;
        ctx.globalAlpha = h.life / 40;
        ctx.font = h.isCombo ? 'bold 28px Arial' : 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(h.text, h.x, h.y);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
    });

    drawPowerBar();

    enemies = enemies.filter(e => e.health > 0);

    if (enemies.length > 0 && (!currentEnemy || currentEnemy.health <= 0)) {
        currentEnemy = enemies[0];
    }

    updateUI();

    if (enemies.length === 0 && pendingEnemies.length === 0) {
        levelComplete();
    }

    requestAnimationFrame(gameLoop);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a3e');
    gradient.addColorStop(1, '#2a2a4e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, groundY);

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 60; i++) {
        const x = (i * 43 + currentLevel * 15 + Date.now() * 0.01) % canvas.width;
        const y = (i * 31) % (groundY - 50);
        const size = 1 + Math.sin(Date.now() * 0.003 + i) * 0.8;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#151528';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(0, groundY - 80);
    ctx.lineTo(150, groundY - 120);
    ctx.lineTo(300, groundY - 60);
    ctx.lineTo(500, groundY - 180);
    ctx.lineTo(700, groundY - 100);
    ctx.lineTo(850, groundY - 160);
    ctx.lineTo(960, groundY - 140);
    ctx.lineTo(960, groundY);
    ctx.fill();
}

function drawPowerBar() {
    const barX = 10;
    const barY = canvas.height - 35;
    const barWidth = 180;
    const barHeight = 18;

    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const powerGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    powerGradient.addColorStop(0, '#0066ff');
    powerGradient.addColorStop(0.5, '#00aaff');
    powerGradient.addColorStop(1, '#00ffff');
    ctx.fillStyle = powerGradient;
    ctx.fillRect(barX, barY, barWidth * (player.power / 100), barHeight);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('能量', barX + 5, barY - 5);

    if (player.power >= 100) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('必杀就绪!', barX + barWidth - 55, barY + 13);
    }
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
    document.getElementById('finalScore').textContent = '最终分数: ' + score;
    document.getElementById('gameOver').style.display = 'block';
}

function levelComplete() {
    gameState = 'levelcomplete';
    const bonus = 200 + combo * 20 + currentLevel * 100;
    score += bonus;
    document.getElementById('levelScore').innerHTML = `关卡 ${currentLevel} 完成！<br>奖励: ${bonus} 分`;
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
            e.preventDefault();
        }
    }

    if (e.key === ' ') {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

gameLoop();
