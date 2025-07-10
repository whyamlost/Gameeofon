// Game Engine Class
class SubwayRunner {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'loading'; // loading, menu, playing, paused, gameOver
        
        // Game settings
        this.lanes = 3;
        this.laneWidth = 0;
        this.gameSpeed = 5;
        this.maxSpeed = 15;
        this.speedIncrease = 0.001;
        
        // Player
        this.player = {
            x: 0,
            y: 0,
            width: 50,
            height: 80,
            lane: 1, // 0: left, 1: center, 2: right
            isJumping: false,
            isRolling: false,
            jumpHeight: 0,
            maxJumpHeight: 100,
            jumpSpeed: 8,
            gravity: 0.5,
            jumpVelocity: 0,
            rollDuration: 0,
            maxRollDuration: 30,
            invincible: false,
            character: 'default'
        };
        
        // Game objects
        this.obstacles = [];
        this.coins = [];
        this.powerUps = [];
        this.particles = [];
        this.backgrounds = [];
        
        // Game stats
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.highScore = localStorage.getItem('subwayRunnerHighScore') || 0;
        
        // Power-ups
        this.activePowerUps = {
            magnet: { active: false, duration: 0, maxDuration: 300 },
            jetpack: { active: false, duration: 0, maxDuration: 240 },
            hoverboard: { active: false, duration: 0, maxDuration: 180 }
        };
        
        // Controls
        this.keys = {};
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // Spawning
        this.spawnTimer = 0;
        this.spawnRate = 120;
        this.powerUpSpawnRate = 600;
        this.powerUpTimer = 0;
        
        // Animation
        this.animationId = null;
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.loadAssets();
        this.showMainMenu();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.laneWidth = this.canvas.width / this.lanes;
        this.player.x = this.laneWidth * 1 + this.laneWidth / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 50;
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e.code);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;
            const minSwipeDistance = 50;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.movePlayer('right');
                    } else {
                        this.movePlayer('left');
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY < 0) {
                        this.jump();
                    } else {
                        this.roll();
                    }
                }
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    handleKeyPress(key) {
        if (this.gameState !== 'playing') return;
        
        switch (key) {
            case 'ArrowLeft':
                this.movePlayer('left');
                break;
            case 'ArrowRight':
                this.movePlayer('right');
                break;
            case 'ArrowUp':
            case 'Space':
                this.jump();
                break;
            case 'ArrowDown':
                this.roll();
                break;
        }
    }
    
    movePlayer(direction) {
        if (this.player.isJumping || this.player.isRolling) return;
        
        if (direction === 'left' && this.player.lane > 0) {
            this.player.lane--;
        } else if (direction === 'right' && this.player.lane < this.lanes - 1) {
            this.player.lane++;
        }
        
        this.player.x = this.laneWidth * this.player.lane + this.laneWidth / 2 - this.player.width / 2;
    }
    
    jump() {
        if (this.player.isJumping || this.player.isRolling) return;
        
        this.player.isJumping = true;
        this.player.jumpVelocity = -this.player.jumpSpeed;
        AudioManager.playSound('jump');
    }
    
    roll() {
        if (this.player.isJumping || this.player.isRolling) return;
        
        this.player.isRolling = true;
        this.player.rollDuration = this.player.maxRollDuration;
        this.player.height = 40; // Half height when rolling
    }
    
    loadAssets() {
        // Create placeholder assets for now
        this.assets = {
            player: this.createPlayerSprite(),
            obstacles: this.createObstacleSprites(),
            coins: this.createCoinSprite(),
            powerUps: this.createPowerUpSprites(),
            backgrounds: this.createBackgroundSprites()
        };
    }
    
    createPlayerSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        
        // Draw player character
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(10, 10, 30, 60);
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(15, 5, 20, 15);
        ctx.fillStyle = '#45b7d1';
        ctx.fillRect(20, 25, 10, 20);
        
        return canvas;
    }
    
    createObstacleSprites() {
        const sprites = {};
        
        // Train
        const trainCanvas = document.createElement('canvas');
        trainCanvas.width = 80;
        trainCanvas.height = 60;
        const trainCtx = trainCanvas.getContext('2d');
        trainCtx.fillStyle = '#e74c3c';
        trainCtx.fillRect(0, 0, 80, 60);
        trainCtx.fillStyle = '#2c3e50';
        trainCtx.fillRect(10, 10, 60, 40);
        sprites.train = trainCanvas;
        
        // Barricade
        const barricadeCanvas = document.createElement('canvas');
        barricadeCanvas.width = 60;
        barricadeCanvas.height = 40;
        const barricadeCtx = barricadeCanvas.getContext('2d');
        barricadeCtx.fillStyle = '#f39c12';
        barricadeCtx.fillRect(0, 0, 60, 40);
        barricadeCtx.fillStyle = '#e67e22';
        barricadeCtx.fillRect(5, 5, 50, 30);
        sprites.barricade = barricadeCanvas;
        
        return sprites;
    }
    
    createCoinSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 30;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(15, 15, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(15, 15, 8, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    createPowerUpSprites() {
        const sprites = {};
        
        // Magnet
        const magnetCanvas = document.createElement('canvas');
        magnetCanvas.width = 40;
        magnetCanvas.height = 40;
        const magnetCtx = magnetCanvas.getContext('2d');
        magnetCtx.fillStyle = '#e74c3c';
        magnetCtx.fillRect(10, 5, 20, 30);
        magnetCtx.fillStyle = '#c0392b';
        magnetCtx.fillRect(15, 10, 10, 20);
        sprites.magnet = magnetCanvas;
        
        // Jetpack
        const jetpackCanvas = document.createElement('canvas');
        jetpackCanvas.width = 40;
        jetpackCanvas.height = 40;
        const jetpackCtx = jetpackCanvas.getContext('2d');
        jetpackCtx.fillStyle = '#3498db';
        jetpackCtx.fillRect(5, 10, 30, 20);
        jetpackCtx.fillStyle = '#e74c3c';
        jetpackCtx.fillRect(0, 15, 10, 10);
        sprites.jetpack = jetpackCanvas;
        
        // Hoverboard
        const hoverboardCanvas = document.createElement('canvas');
        hoverboardCanvas.width = 40;
        hoverboardCanvas.height = 40;
        const hoverboardCtx = hoverboardCanvas.getContext('2d');
        hoverboardCtx.fillStyle = '#9b59b6';
        hoverboardCtx.fillRect(5, 15, 30, 10);
        hoverboardCtx.fillStyle = '#8e44ad';
        hoverboardCtx.fillRect(10, 10, 20, 20);
        sprites.hoverboard = hoverboardCanvas;
        
        return sprites;
    }
    
    createBackgroundSprites() {
        const sprites = {};
        
        // City background
        const cityCanvas = document.createElement('canvas');
        cityCanvas.width = 800;
        cityCanvas.height = 600;
        const cityCtx = cityCanvas.getContext('2d');
        
        // Sky gradient
        const gradient = cityCtx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        cityCtx.fillStyle = gradient;
        cityCtx.fillRect(0, 0, 800, 600);
        
        // Buildings
        for (let i = 0; i < 20; i++) {
            const x = i * 40;
            const height = 100 + Math.random() * 300;
            cityCtx.fillStyle = `hsl(${200 + Math.random() * 60}, 50%, ${20 + Math.random() * 30}%)`;
            cityCtx.fillRect(x, 600 - height, 35, height);
            
            // Windows
            for (let j = 0; j < Math.floor(height / 20); j++) {
                if (Math.random() > 0.3) {
                    cityCtx.fillStyle = '#f1c40f';
                    cityCtx.fillRect(x + 5, 600 - height + j * 20 + 5, 8, 8);
                }
            }
        }
        
        sprites.city = cityCanvas;
        return sprites;
    }
    
    showMainMenu() {
        this.gameState = 'menu';
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('highScoreDisplay').textContent = this.highScore;
    }
    
    startGame() {
        this.gameState = 'playing';
        this.resetGame();
        this.gameLoop();
        AudioManager.playMusic();
    }
    
    resetGame() {
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.gameSpeed = 5;
        this.player.lane = 1;
        this.player.x = this.laneWidth * 1 + this.laneWidth / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 50;
        this.player.isJumping = false;
        this.player.isRolling = false;
        this.player.jumpHeight = 0;
        this.player.jumpVelocity = 0;
        this.player.rollDuration = 0;
        this.player.height = 80;
        this.player.invincible = false;
        
        this.obstacles = [];
        this.coins = [];
        this.powerUps = [];
        this.particles = [];
        this.backgrounds = [];
        
        // Reset power-ups
        Object.keys(this.activePowerUps).forEach(key => {
            this.activePowerUps[key].active = false;
            this.activePowerUps[key].duration = 0;
        });
        
        this.spawnTimer = 0;
        this.powerUpTimer = 0;
        
        this.updateHUD();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.updatePlayer();
        this.updateObstacles();
        this.updateCoins();
        this.updatePowerUps();
        this.updateParticles();
        this.updatePowerUpEffects();
        this.spawnObjects();
        this.checkCollisions();
        this.updateScore();
        
        // Increase game speed
        this.gameSpeed = Math.min(this.gameSpeed + this.speedIncrease, this.maxSpeed);
    }
    
    updatePlayer() {
        // Update jumping
        if (this.player.isJumping) {
            this.player.jumpVelocity += this.player.gravity;
            this.player.y += this.player.jumpVelocity;
            
            if (this.player.y >= this.canvas.height - this.player.height - 50) {
                this.player.y = this.canvas.height - this.player.height - 50;
                this.player.isJumping = false;
                this.player.jumpVelocity = 0;
            }
        }
        
        // Update rolling
        if (this.player.isRolling) {
            this.player.rollDuration--;
            if (this.player.rollDuration <= 0) {
                this.player.isRolling = false;
                this.player.height = 80;
            }
        }
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += this.gameSpeed;
            
            if (obstacle.y > this.canvas.height + 100) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    updateCoins() {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.y += this.gameSpeed;
            
            // Magnet effect
            if (this.activePowerUps.magnet.active) {
                const dx = this.player.x + this.player.width / 2 - (coin.x + coin.width / 2);
                const dy = this.player.y + this.player.height / 2 - (coin.y + coin.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    const angle = Math.atan2(dy, dx);
                    coin.x += Math.cos(angle) * 3;
                    coin.y += Math.sin(angle) * 3;
                }
            }
            
            if (coin.y > this.canvas.height + 50) {
                this.coins.splice(i, 1);
            }
        }
    }
    
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += this.gameSpeed;
            
            if (powerUp.y > this.canvas.height + 50) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updatePowerUpEffects() {
        Object.keys(this.activePowerUps).forEach(key => {
            const powerUp = this.activePowerUps[key];
            if (powerUp.active) {
                powerUp.duration--;
                if (powerUp.duration <= 0) {
                    powerUp.active = false;
                    this.hidePowerUpIndicator(key);
                }
            }
        });
    }
    
    spawnObjects() {
        this.spawnTimer++;
        this.powerUpTimer++;
        
        // Spawn obstacles
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnObstacle();
            this.spawnTimer = 0;
            this.spawnRate = Math.max(60, this.spawnRate - 0.5);
        }
        
        // Spawn coins
        if (Math.random() < 0.1) {
            this.spawnCoin();
        }
        
        // Spawn power-ups
        if (this.powerUpTimer >= this.powerUpSpawnRate) {
            this.spawnPowerUp();
            this.powerUpTimer = 0;
        }
    }
    
    spawnObstacle() {
        const types = ['train', 'barricade'];
        const type = types[Math.floor(Math.random() * types.length)];
        const lane = Math.floor(Math.random() * this.lanes);
        
        const obstacle = {
            x: this.laneWidth * lane + this.laneWidth / 2 - 30,
            y: -100,
            width: type === 'train' ? 80 : 60,
            height: type === 'train' ? 60 : 40,
            type: type
        };
        
        this.obstacles.push(obstacle);
    }
    
    spawnCoin() {
        const lane = Math.floor(Math.random() * this.lanes);
        const coin = {
            x: this.laneWidth * lane + this.laneWidth / 2 - 15,
            y: -50,
            width: 30,
            height: 30,
            collected: false
        };
        
        this.coins.push(coin);
    }
    
    spawnPowerUp() {
        const types = ['magnet', 'jetpack', 'hoverboard'];
        const type = types[Math.floor(Math.random() * types.length)];
        const lane = Math.floor(Math.random() * this.lanes);
        
        const powerUp = {
            x: this.laneWidth * lane + this.laneWidth / 2 - 20,
            y: -50,
            width: 40,
            height: 40,
            type: type
        };
        
        this.powerUps.push(powerUp);
    }
    
    checkCollisions() {
        if (this.player.invincible) return;
        
        // Check obstacle collisions
        for (const obstacle of this.obstacles) {
            if (this.isColliding(this.player, obstacle)) {
                this.gameOver();
                return;
            }
        }
        
        // Check coin collisions
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            if (!coin.collected && this.isColliding(this.player, coin)) {
                this.coins.splice(i, 1);
                this.coins++;
                this.score += 10;
                AudioManager.playSound('coin');
                this.createCoinParticles(coin.x, coin.y);
            }
        }
        
        // Check power-up collisions
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (this.isColliding(this.player, powerUp)) {
                this.activatePowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
                AudioManager.playSound('powerup');
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    activatePowerUp(type) {
        const powerUp = this.activePowerUps[type];
        powerUp.active = true;
        powerUp.duration = powerUp.maxDuration;
        this.showPowerUpIndicator(type);
        
        if (type === 'hoverboard') {
            this.player.invincible = true;
        }
    }
    
    showPowerUpIndicator(type) {
        const indicator = document.getElementById(`${type}Indicator`);
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }
    
    hidePowerUpIndicator(type) {
        const indicator = document.getElementById(`${type}Indicator`);
        if (indicator) {
            indicator.classList.add('hidden');
        }
        
        if (type === 'hoverboard') {
            this.player.invincible = false;
        }
    }
    
    createCoinParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x + 15,
                y: y + 15,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                color: '#f1c40f'
            });
        }
    }
    
    updateScore() {
        this.score += Math.floor(this.gameSpeed);
        this.distance += Math.floor(this.gameSpeed);
        this.updateHUD();
    }
    
    updateHUD() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('currentCoins').textContent = this.coins;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        AudioManager.playSound('crash');
        AudioManager.stopMusic();
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('subwayRunnerHighScore', this.highScore);
        }
        
        // Save score to leaderboard
        this.saveScore();
        
        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalCoins').textContent = this.coins;
        document.getElementById('finalDistance').textContent = Math.floor(this.distance / 10);
        document.getElementById('gameOver').classList.remove('hidden');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    saveScore() {
        const scores = JSON.parse(localStorage.getItem('subwayRunnerScores') || '[]');
        scores.push({
            score: this.score,
            date: new Date().toLocaleDateString(),
            coins: this.coins,
            distance: Math.floor(this.distance / 10)
        });
        
        // Sort by score (highest first) and keep only top 10
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10);
        
        localStorage.setItem('subwayRunnerScores', JSON.stringify(scores));
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderBackground();
        this.renderObstacles();
        this.renderCoins();
        this.renderPowerUps();
        this.renderPlayer();
        this.renderParticles();
    }
    
    renderBackground() {
        // Simple gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Lane dividers
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        for (let i = 1; i < this.lanes; i++) {
            const x = this.laneWidth * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    renderObstacles() {
        for (const obstacle of this.obstacles) {
            const sprite = this.assets.obstacles[obstacle.type];
            this.ctx.drawImage(sprite, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }
    
    renderCoins() {
        for (const coin of this.coins) {
            this.ctx.drawImage(this.assets.coins, coin.x, coin.y, coin.width, coin.height);
        }
    }
    
    renderPowerUps() {
        for (const powerUp of this.powerUps) {
            const sprite = this.assets.powerUps[powerUp.type];
            this.ctx.drawImage(sprite, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        }
    }
    
    renderPlayer() {
        // Draw player with character sprite
        this.ctx.drawImage(this.assets.player, this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw invincibility effect
        if (this.player.invincible) {
            this.ctx.strokeStyle = '#00ff88';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.player.x - 2, this.player.y - 2, this.player.width + 4, this.player.height + 4);
        }
    }
    
    renderParticles() {
        for (const particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x, particle.y, 4, 4);
        }
        this.ctx.globalAlpha = 1;
    }
    
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            AudioManager.pauseMusic();
            document.getElementById('pauseMenu').classList.remove('hidden');
        }
    }
    
    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            AudioManager.resumeMusic();
            document.getElementById('pauseMenu').classList.add('hidden');
            this.gameLoop();
        }
    }
    
    restart() {
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        this.startGame();
    }
    
    quitToMenu() {
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        this.showMainMenu();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SubwayRunner();
});