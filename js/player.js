// Player Class for Subway Surfers Game

class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Position and movement
        this.lane = 1; // 0 = left, 1 = center, 2 = right
        this.targetLane = 1;
        this.x = 0;
        this.y = 0;
        this.z = 0; // height for jumping
        this.targetX = 0;
        this.targetY = 0;
        
        // Player dimensions
        this.width = GAME_CONFIG.PLAYER_WIDTH;
        this.height = GAME_CONFIG.PLAYER_HEIGHT;
        
        // Movement states
        this.isJumping = false;
        this.isRolling = false;
        this.isMoving = false;
        this.jumpStartTime = 0;
        this.rollStartTime = 0;
        this.movementStartTime = 0;
        
        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.sprite = '🏃';
        this.facingDirection = 1; // 1 = right, -1 = left
        
        // Power-ups effects
        this.magnetActive = false;
        this.jetpackActive = false;
        this.hoverboardActive = false;
        
        // Calculate lane positions
        this.updateLanePositions();
        
        // Initialize position
        this.resetPosition();
    }
    
    updateLanePositions() {
        const canvasWidth = this.canvas.width;
        const totalLaneWidth = GAME_CONFIG.LANES * GAME_CONFIG.LANE_WIDTH;
        const startX = (canvasWidth - totalLaneWidth) / 2;
        
        this.lanePositions = [];
        for (let i = 0; i < GAME_CONFIG.LANES; i++) {
            this.lanePositions.push(startX + i * GAME_CONFIG.LANE_WIDTH + GAME_CONFIG.LANE_WIDTH / 2);
        }
    }
    
    resetPosition() {
        this.lane = 1;
        this.targetLane = 1;
        this.x = this.lanePositions[1];
        this.y = this.canvas.height - 200;
        this.z = 0;
        this.targetX = this.x;
        this.targetY = this.y;
        
        this.isJumping = false;
        this.isRolling = false;
        this.isMoving = false;
        
        this.animationFrame = 0;
        this.sprite = '🏃';
    }
    
    moveLeft() {
        if (this.isMoving || this.lane <= 0) return;
        
        this.targetLane = this.lane - 1;
        this.targetX = this.lanePositions[this.targetLane];
        this.isMoving = true;
        this.movementStartTime = Date.now();
        this.facingDirection = -1;
    }
    
    moveRight() {
        if (this.isMoving || this.lane >= GAME_CONFIG.LANES - 1) return;
        
        this.targetLane = this.lane + 1;
        this.targetX = this.lanePositions[this.targetLane];
        this.isMoving = true;
        this.movementStartTime = Date.now();
        this.facingDirection = 1;
    }
    
    jump() {
        if (this.isJumping || this.isRolling) return;
        
        this.isJumping = true;
        this.jumpStartTime = Date.now();
        this.sprite = '🤸';
    }
    
    roll() {
        if (this.isRolling || this.isJumping) return;
        
        this.isRolling = true;
        this.rollStartTime = Date.now();
        this.sprite = '🤾';
    }
    
    update(deltaTime, gameState) {
        this.updateMovement(deltaTime);
        this.updateJump(deltaTime);
        this.updateRoll(deltaTime);
        this.updateAnimation(deltaTime);
        this.updatePowerups(gameState);
        
        // Update canvas size if changed
        if (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.updateLanePositions();
            this.resetPosition();
        }
    }
    
    updateMovement(deltaTime) {
        if (!this.isMoving) return;
        
        const movementDuration = 200; // ms
        const elapsed = Date.now() - this.movementStartTime;
        const progress = Math.min(elapsed / movementDuration, 1);
        
        // Smooth interpolation
        const easedProgress = MathUtils.easeInOutCubic(progress);
        this.x = MathUtils.lerp(this.lanePositions[this.lane], this.targetX, easedProgress);
        
        if (progress >= 1) {
            this.isMoving = false;
            this.lane = this.targetLane;
            this.x = this.lanePositions[this.lane];
        }
    }
    
    updateJump(deltaTime) {
        if (!this.isJumping) return;
        
        const jumpDuration = 600; // ms
        const elapsed = Date.now() - this.jumpStartTime;
        const progress = Math.min(elapsed / jumpDuration, 1);
        
        // Parabolic jump arc
        const jumpProgress = 4 * progress * (1 - progress);
        this.z = jumpProgress * GAME_CONFIG.JUMP_HEIGHT;
        
        if (progress >= 1) {
            this.isJumping = false;
            this.z = 0;
            this.sprite = '🏃';
        }
    }
    
    updateRoll(deltaTime) {
        if (!this.isRolling) return;
        
        const elapsed = Date.now() - this.rollStartTime;
        
        if (elapsed >= GAME_CONFIG.ROLL_DURATION) {
            this.isRolling = false;
            this.sprite = '🏃';
        }
    }
    
    updateAnimation(deltaTime) {
        this.animationFrame += this.animationSpeed * deltaTime / 16.67; // 60fps normalized
        
        if (!this.isJumping && !this.isRolling) {
            const runFrames = ['🏃', '🏃‍♂️', '🏃‍♀️'];
            this.sprite = runFrames[Math.floor(this.animationFrame) % runFrames.length];
        }
    }
    
    updatePowerups(gameState) {
        this.magnetActive = gameState.isPowerupActive('magnet');
        this.jetpackActive = gameState.isPowerupActive('jetpack');
        this.hoverboardActive = gameState.isPowerupActive('hoverboard');
        
        // Jetpack overrides normal jumping
        if (this.jetpackActive) {
            this.z = Math.max(this.z, GAME_CONFIG.JUMP_HEIGHT * 1.5);
            this.sprite = '🚀';
        }
        
        // Hoverboard visual effect
        if (this.hoverboardActive) {
            this.sprite = '🛹';
        }
    }
    
    getCollisionRect() {
        const rect = {
            x: this.x - this.width / 2,
            y: this.y - this.height + this.z, // Adjust for height when jumping
            width: this.width,
            height: this.height
        };
        
        // Smaller hitbox when rolling
        if (this.isRolling) {
            rect.height *= 0.5;
            rect.y += rect.height;
        }
        
        return rect;
    }
    
    canCollideWith(obstacle) {
        // Jetpack allows flying over most obstacles
        if (this.jetpackActive && obstacle.type !== 'tunnel') {
            return false;
        }
        
        // Hoverboard provides temporary invincibility
        if (this.hoverboardActive) {
            return false;
        }
        
        // Can roll under high obstacles
        if (this.isRolling && obstacle.canRollUnder) {
            return false;
        }
        
        // Can jump over low obstacles
        if (this.isJumping && this.z > obstacle.height && obstacle.canJumpOver) {
            return false;
        }
        
        return true;
    }
    
    collectCoin(coin, audioManager) {
        const coinRect = {
            x: coin.x - coin.width / 2,
            y: coin.y - coin.height / 2,
            width: coin.width,
            height: coin.height
        };
        
        const playerRect = this.getCollisionRect();
        
        // Magnet extends collection radius
        let collisionRadius = 0;
        if (this.magnetActive) {
            collisionRadius = 50;
        }
        
        if (collisionRadius > 0) {
            const distance = MathUtils.distance(this.x, this.y, coin.x, coin.y);
            if (distance <= collisionRadius) {
                audioManager.playCoinCollect();
                AnimationUtils.createCoinCollectEffect(coin.x, coin.y, GAME_CONFIG.COIN_VALUE);
                return true;
            }
        } else if (CollisionUtils.rectRect(playerRect, coinRect)) {
            audioManager.playCoinCollect();
            AnimationUtils.createCoinCollectEffect(coin.x, coin.y, GAME_CONFIG.COIN_VALUE);
            return true;
        }
        
        return false;
    }
    
    collectPowerup(powerup, gameState, audioManager) {
        const powerupRect = {
            x: powerup.x - powerup.width / 2,
            y: powerup.y - powerup.height / 2,
            width: powerup.width,
            height: powerup.height
        };
        
        const playerRect = this.getCollisionRect();
        
        if (CollisionUtils.rectRect(playerRect, powerupRect)) {
            gameState.activatePowerup(powerup.type);
            audioManager.playPowerup();
            
            // Show achievement for first time collecting certain powerups
            if (powerup.type === 'jetpack' && !StorageManager.getItem('jetpack_achievement', false)) {
                AnimationUtils.showAchievement('Sky High!', 'Collected your first jetpack!');
                StorageManager.setItem('jetpack_achievement', true);
            }
            
            return true;
        }
        
        return false;
    }
    
    checkObstacleCollision(obstacle) {
        if (!this.canCollideWith(obstacle)) {
            return false;
        }
        
        const obstacleRect = {
            x: obstacle.x - obstacle.width / 2,
            y: obstacle.y - obstacle.height,
            width: obstacle.width,
            height: obstacle.height
        };
        
        const playerRect = this.getCollisionRect();
        
        return CollisionUtils.rectRect(playerRect, obstacleRect);
    }
    
    render() {
        this.ctx.save();
        
        // Apply shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetY = 5;
        
        // Scale and flip if needed
        if (this.facingDirection === -1) {
            this.ctx.scale(-1, 1);
        }
        
        // Calculate render position (accounting for 3D height)
        const renderX = this.facingDirection === -1 ? -this.x : this.x;
        const renderY = this.y - this.z;
        
        // Draw player sprite
        this.ctx.font = `${this.height}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(this.sprite, renderX, renderY);
        
        // Draw powerup effects
        this.renderPowerupEffects(renderX, renderY);
        
        this.ctx.restore();
        
        // Debug collision box (only in development)
        if (window.DEBUG_MODE) {
            this.renderDebugInfo();
        }
    }
    
    renderPowerupEffects(x, y) {
        // Magnet effect
        if (this.magnetActive) {
            this.ctx.strokeStyle = '#feca57';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(x, y - this.height / 2, 60, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        // Jetpack effect
        if (this.jetpackActive) {
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillRect(x - 5, y, 10, 20);
            this.ctx.fillRect(x - 15, y, 10, 15);
            this.ctx.fillRect(x + 5, y, 10, 15);
            this.ctx.globalAlpha = 1;
        }
        
        // Hoverboard effect
        if (this.hoverboardActive) {
            this.ctx.strokeStyle = '#48dbfb';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y + 5, 30, 8, 0, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    renderDebugInfo() {
        const rect = this.getCollisionRect();
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        
        // Lane indicators
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.lanePositions.length; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.lanePositions[i], 0);
            this.ctx.lineTo(this.lanePositions[i], this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    // Input handling methods
    handleKeyDown(key) {
        switch(key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.moveLeft();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.moveRight();
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
            case ' ':
                this.jump();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.roll();
                break;
        }
    }
    
    handleSwipe(direction) {
        switch(direction) {
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
            case 'up':
                this.jump();
                break;
            case 'down':
                this.roll();
                break;
        }
    }
    
    handleTap() {
        if (!this.isJumping && !this.isRolling) {
            this.jump();
        }
    }
}

// Export for use in other modules
window.Player = Player;