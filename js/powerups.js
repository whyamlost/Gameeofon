// Power-ups and Coins System for Subway Surfers Game

class Coin {
    constructor(x, y, lane, gameSpeed) {
        this.x = x;
        this.y = y;
        this.lane = lane;
        this.speed = gameSpeed;
        this.width = 20;
        this.height = 20;
        this.active = true;
        this.value = GAME_CONFIG.COIN_VALUE;
        
        // Animation properties
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.sprite = '🪙';
        this.bobOffset = 0;
        this.bobSpeed = 0.05;
        this.rotation = 0;
        
        // Special effects
        this.sparkleTime = 0;
        this.glowIntensity = 0.5;
    }
    
    update(deltaTime, gameSpeed) {
        this.speed = gameSpeed;
        this.y += this.speed * deltaTime / 16.67; // 60fps normalized
        
        // Animation updates
        this.animationFrame += this.animationSpeed * deltaTime / 16.67;
        this.bobOffset = Math.sin(this.animationFrame * this.bobSpeed) * 5;
        this.rotation += 2 * deltaTime / 16.67;
        this.sparkleTime += deltaTime;
        this.glowIntensity = 0.5 + Math.sin(this.animationFrame * 0.1) * 0.3;
        
        // Deactivate if moved off screen
        if (this.y > window.innerHeight + 100) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Glow effect
        ctx.shadowColor = '#feca57';
        ctx.shadowBlur = 10 * this.glowIntensity;
        
        // Bobbing motion
        const renderY = this.y + this.bobOffset;
        
        // Rotation
        ctx.translate(this.x, renderY);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.translate(-this.x, -renderY);
        
        // Draw coin
        ctx.font = `${this.height}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.sprite, this.x, renderY);
        
        // Sparkle effects
        if (this.sparkleTime % 100 < 20) {
            this.renderSparkles(ctx, this.x, renderY);
        }
        
        ctx.restore();
        
        // Debug collision box
        if (window.DEBUG_MODE) {
            ctx.strokeStyle = '#feca57';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }
    }
    
    renderSparkles(ctx, x, y) {
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 3; i++) {
            const angle = (i * 120 + this.rotation) * Math.PI / 180;
            const distance = 15;
            const sparkleX = x + Math.cos(angle) * distance;
            const sparkleY = y + Math.sin(angle) * distance;
            
            ctx.fillRect(sparkleX - 1, sparkleY - 1, 2, 2);
        }
    }
    
    getCollisionRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

class PowerUp {
    constructor(x, y, lane, type, gameSpeed) {
        this.x = x;
        this.y = y;
        this.lane = lane;
        this.type = type;
        this.speed = gameSpeed;
        this.active = true;
        
        // Set properties based on type
        this.setupPowerUpProperties();
        
        // Animation properties
        this.animationFrame = 0;
        this.animationSpeed = 0.08;
        this.bobOffset = 0;
        this.bobSpeed = 0.03;
        this.pulseScale = 1;
        this.pulseSpeed = 0.05;
    }
    
    setupPowerUpProperties() {
        switch(this.type) {
            case 'magnet':
                this.width = 40;
                this.height = 40;
                this.sprite = '🧲';
                this.color = '#feca57';
                this.duration = GAME_CONFIG.POWERUP_DURATION;
                break;
                
            case 'jetpack':
                this.width = 35;
                this.height = 35;
                this.sprite = '🚀';
                this.color = '#ff6b6b';
                this.duration = GAME_CONFIG.POWERUP_DURATION;
                break;
                
            case 'hoverboard':
                this.width = 45;
                this.height = 25;
                this.sprite = '🛹';
                this.color = '#48dbfb';
                this.duration = GAME_CONFIG.POWERUP_DURATION;
                break;
                
            case 'multiplier':
                this.width = 30;
                this.height = 30;
                this.sprite = '✖️';
                this.color = '#ff9ff3';
                this.duration = GAME_CONFIG.POWERUP_DURATION;
                break;
        }
    }
    
    update(deltaTime, gameSpeed) {
        this.speed = gameSpeed;
        this.y += this.speed * deltaTime / 16.67; // 60fps normalized
        
        // Animation updates
        this.animationFrame += this.animationSpeed * deltaTime / 16.67;
        this.bobOffset = Math.sin(this.animationFrame * this.bobSpeed) * 8;
        this.pulseScale = 1 + Math.sin(this.animationFrame * this.pulseSpeed) * 0.2;
        
        // Deactivate if moved off screen
        if (this.y > window.innerHeight + 100) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Bobbing motion
        const renderY = this.y + this.bobOffset;
        
        // Pulsing scale
        ctx.translate(this.x, renderY);
        ctx.scale(this.pulseScale, this.pulseScale);
        ctx.translate(-this.x, -renderY);
        
        // Draw power-up
        ctx.font = `${this.height}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.sprite, this.x, renderY);
        
        // Energy rings effect
        this.renderEnergyRings(ctx, this.x, renderY);
        
        ctx.restore();
        
        // Debug collision box
        if (window.DEBUG_MODE) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }
    }
    
    renderEnergyRings(ctx, x, y) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < 2; i++) {
            const radius = 25 + i * 10 + Math.sin(this.animationFrame * 0.1 + i) * 5;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
    
    getCollisionRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

class CoinTrail {
    constructor(startX, startY, endX, endY, gameSpeed) {
        this.coins = [];
        this.gameSpeed = gameSpeed;
        
        const distance = MathUtils.distance(startX, startY, endX, endY);
        const coinCount = Math.max(3, Math.floor(distance / 30));
        
        for (let i = 0; i < coinCount; i++) {
            const progress = i / (coinCount - 1);
            const x = MathUtils.lerp(startX, endX, progress);
            const y = MathUtils.lerp(startY, endY, progress);
            
            this.coins.push(new Coin(x, y, 0, gameSpeed));
        }
    }
    
    update(deltaTime, gameSpeed) {
        this.coins.forEach(coin => coin.update(deltaTime, gameSpeed));
        this.coins = this.coins.filter(coin => coin.active);
    }
    
    render(ctx) {
        this.coins.forEach(coin => coin.render(ctx));
    }
    
    checkCollections(player, gameState, audioManager) {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            if (player.collectCoin(coin, audioManager)) {
                gameState.addCoins(coin.value);
                gameState.addScore(coin.value);
                this.coins.splice(i, 1);
            }
        }
    }
    
    isEmpty() {
        return this.coins.length === 0;
    }
}

class PowerUpManager {
    constructor(canvas, player) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = player;
        this.coins = [];
        this.powerUps = [];
        this.coinTrails = [];
        
        // Spawn timers
        this.lastCoinSpawn = 0;
        this.lastPowerUpSpawn = 0;
        this.coinSpawnInterval = 800; // ms
        this.powerUpSpawnInterval = 8000; // ms
        
        // Power-up probabilities (out of 100)
        this.powerUpProbabilities = {
            'magnet': 35,
            'jetpack': 25,
            'hoverboard': 25,
            'multiplier': 15
        };
    }
    
    update(deltaTime, gameState) {
        const currentTime = Date.now();
        
        // Spawn coins
        if (currentTime - this.lastCoinSpawn > this.coinSpawnInterval) {
            this.spawnCoins(gameState);
            this.lastCoinSpawn = currentTime;
        }
        
        // Spawn power-ups (less frequent)
        if (currentTime - this.lastPowerUpSpawn > this.powerUpSpawnInterval) {
            this.spawnPowerUp(gameState);
            this.lastPowerUpSpawn = currentTime;
        }
        
        // Update coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.update(deltaTime, gameState.speed);
            
            if (!coin.active) {
                this.coins.splice(i, 1);
            }
        }
        
        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update(deltaTime, gameState.speed);
            
            if (!powerUp.active) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Update coin trails
        for (let i = this.coinTrails.length - 1; i >= 0; i--) {
            const trail = this.coinTrails[i];
            trail.update(deltaTime, gameState.speed);
            
            if (trail.isEmpty()) {
                this.coinTrails.splice(i, 1);
            }
        }
    }
    
    spawnCoins(gameState) {
        const patterns = [
            'single',
            'line',
            'zigzag',
            'circle',
            'heart'
        ];
        
        const pattern = patterns[MathUtils.randomInt(0, patterns.length - 1)];
        this.spawnCoinPattern(pattern, gameState);
    }
    
    spawnCoinPattern(pattern, gameState) {
        const spawnY = -50;
        
        switch(pattern) {
            case 'single':
                this.spawnSingleCoin(gameState, spawnY);
                break;
                
            case 'line':
                this.spawnCoinLine(gameState, spawnY);
                break;
                
            case 'zigzag':
                this.spawnCoinZigzag(gameState, spawnY);
                break;
                
            case 'circle':
                this.spawnCoinCircle(gameState, spawnY);
                break;
                
            case 'heart':
                this.spawnCoinHeart(gameState, spawnY);
                break;
        }
    }
    
    spawnSingleCoin(gameState, spawnY) {
        const lane = MathUtils.randomInt(0, 2);
        const x = this.player.lanePositions[lane];
        this.coins.push(new Coin(x, spawnY, lane, gameState.speed));
    }
    
    spawnCoinLine(gameState, spawnY) {
        const lane = MathUtils.randomInt(0, 2);
        const x = this.player.lanePositions[lane];
        
        for (let i = 0; i < 5; i++) {
            this.coins.push(new Coin(x, spawnY - i * 40, lane, gameState.speed));
        }
    }
    
    spawnCoinZigzag(gameState, spawnY) {
        for (let i = 0; i < 6; i++) {
            const lane = i % 2 === 0 ? 0 : 2;
            const x = this.player.lanePositions[lane];
            this.coins.push(new Coin(x, spawnY - i * 30, lane, gameState.speed));
        }
    }
    
    spawnCoinCircle(gameState, spawnY) {
        const centerX = this.player.lanePositions[1];
        const centerY = spawnY - 100;
        const radius = 60;
        const coinCount = 8;
        
        for (let i = 0; i < coinCount; i++) {
            const angle = (i / coinCount) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius * 0.5; // Elliptical
            
            const coin = new Coin(x, y, 1, gameState.speed);
            this.coins.push(coin);
        }
    }
    
    spawnCoinHeart(gameState, spawnY) {
        const centerX = this.player.lanePositions[1];
        const centerY = spawnY - 80;
        const coinPositions = [
            {x: 0, y: 0},
            {x: -20, y: -10},
            {x: 20, y: -10},
            {x: -30, y: -25},
            {x: 30, y: -25},
            {x: -20, y: -40},
            {x: 20, y: -40},
            {x: 0, y: -50}
        ];
        
        coinPositions.forEach(pos => {
            const coin = new Coin(
                centerX + pos.x,
                centerY + pos.y,
                1,
                gameState.speed
            );
            this.coins.push(coin);
        });
    }
    
    spawnPowerUp(gameState) {
        const lane = MathUtils.randomInt(0, 2);
        const x = this.player.lanePositions[lane];
        const type = this.getRandomPowerUpType();
        
        const powerUp = new PowerUp(x, -50, lane, type, gameState.speed);
        this.powerUps.push(powerUp);
    }
    
    getRandomPowerUpType() {
        const types = Object.keys(this.powerUpProbabilities);
        const probabilities = Object.values(this.powerUpProbabilities);
        const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0);
        
        let random = Math.random() * totalProbability;
        
        for (let i = 0; i < types.length; i++) {
            random -= probabilities[i];
            if (random <= 0) {
                return types[i];
            }
        }
        
        return types[0]; // Fallback
    }
    
    checkCollisions(player, gameState, audioManager) {
        // Check coin collections
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            if (player.collectCoin(coin, audioManager)) {
                gameState.addCoins(coin.value);
                gameState.addScore(coin.value);
                this.coins.splice(i, 1);
                
                // Achievement for collecting many coins
                if (gameState.coins > 0 && gameState.coins % 100 === 0) {
                    AnimationUtils.showAchievement(
                        'Coin Collector!',
                        `Collected ${gameState.coins} coins!`
                    );
                }
            }
        }
        
        // Check coin trail collections
        this.coinTrails.forEach(trail => {
            trail.checkCollections(player, gameState, audioManager);
        });
        
        // Check power-up collections
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (player.collectPowerup(powerUp, gameState, audioManager)) {
                this.powerUps.splice(i, 1);
                
                // Special effects for power-ups
                this.createPowerUpEffect(powerUp);
                
                // Achievement for first power-up
                if (powerUp.type === 'magnet' && !StorageManager.getItem('magnet_achievement', false)) {
                    AnimationUtils.showAchievement('Magnetic!', 'Collected your first magnet!');
                    StorageManager.setItem('magnet_achievement', true);
                }
            }
        }
    }
    
    createPowerUpEffect(powerUp) {
        // Create particle effect at power-up location
        ObstacleEffects.createExplosion(powerUp.x, powerUp.y, this.ctx);
        
        // Create coin trail for magnet
        if (powerUp.type === 'magnet') {
            this.createMagnetCoinTrail(powerUp.x, powerUp.y);
        }
    }
    
    createMagnetCoinTrail(x, y) {
        const trailCount = 3;
        for (let i = 0; i < trailCount; i++) {
            const startX = x + MathUtils.random(-50, 50);
            const startY = y + MathUtils.random(-30, 30);
            const endX = this.player.x;
            const endY = this.player.y;
            
            const trail = new CoinTrail(startX, startY, endX, endY, 0);
            this.coinTrails.push(trail);
        }
    }
    
    render() {
        // Render coins
        this.coins.forEach(coin => coin.render(this.ctx));
        
        // Render coin trails
        this.coinTrails.forEach(trail => trail.render(this.ctx));
        
        // Render power-ups
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
        
        // Render debug info
        if (window.DEBUG_MODE) {
            this.renderDebugInfo();
        }
    }
    
    renderDebugInfo() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Coins: ${this.coins.length}`, 10, 110);
        this.ctx.fillText(`Power-ups: ${this.powerUps.length}`, 10, 130);
        this.ctx.fillText(`Coin Trails: ${this.coinTrails.length}`, 10, 150);
    }
    
    clear() {
        this.coins = [];
        this.powerUps = [];
        this.coinTrails = [];
        this.lastCoinSpawn = 0;
        this.lastPowerUpSpawn = 0;
    }
    
    // Special spawning methods
    spawnCoinBurst(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const offsetX = MathUtils.random(-50, 50);
            const offsetY = MathUtils.random(-30, 30);
            const coin = new Coin(x + offsetX, y + offsetY, 1, 0);
            this.coins.push(coin);
        }
    }
    
    spawnBonusCoinLine(lane, length = 10) {
        const x = this.player.lanePositions[lane];
        for (let i = 0; i < length; i++) {
            const coin = new Coin(x, -50 - i * 25, lane, 2);
            coin.value = GAME_CONFIG.COIN_VALUE * 2; // Bonus coins worth more
            coin.sprite = '💰';
            this.coins.push(coin);
        }
    }
}

// Export classes for use in other modules
window.Coin = Coin;
window.PowerUp = PowerUp;
window.CoinTrail = CoinTrail;
window.PowerUpManager = PowerUpManager;