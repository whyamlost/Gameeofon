// Obstacles System for Subway Surfers Game

class Obstacle {
    constructor(x, y, lane, type, gameSpeed) {
        this.x = x;
        this.y = y;
        this.lane = lane;
        this.type = type;
        this.speed = gameSpeed;
        this.active = true;
        
        // Set properties based on type
        this.setupObstacleProperties();
    }
    
    setupObstacleProperties() {
        switch(this.type) {
            case 'train':
                this.width = 120;
                this.height = 80;
                this.sprite = '🚇';
                this.canJumpOver = false;
                this.canRollUnder = false;
                this.color = '#ff4757';
                break;
                
            case 'barrier':
                this.width = 60;
                this.height = 50;
                this.sprite = '🚧';
                this.canJumpOver = true;
                this.canRollUnder = false;
                this.color = '#ffa502';
                break;
                
            case 'tunnel':
                this.width = 100;
                this.height = 60;
                this.sprite = '🕳️';
                this.canJumpOver = false;
                this.canRollUnder = true;
                this.color = '#2f3542';
                break;
                
            case 'sign':
                this.width = 40;
                this.height = 70;
                this.sprite = '🪧';
                this.canJumpOver = true;
                this.canRollUnder = false;
                this.color = '#5f27cd';
                break;
                
            case 'cone':
                this.width = 30;
                this.height = 40;
                this.sprite = '🚥';
                this.canJumpOver = true;
                this.canRollUnder = false;
                this.color = '#ff3838';
                break;
        }
    }
    
    update(deltaTime, gameSpeed) {
        this.speed = gameSpeed;
        this.y += this.speed * deltaTime / 16.67; // 60fps normalized
        
        // Deactivate if moved off screen
        if (this.y > window.innerHeight + 100) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Draw shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        
        // Draw obstacle sprite
        ctx.font = `${this.height}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(this.sprite, this.x, this.y);
        
        // Add glow effect for some obstacles
        if (this.type === 'train') {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.fillText(this.sprite, this.x, this.y);
        }
        
        ctx.restore();
        
        // Debug collision box
        if (window.DEBUG_MODE) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.x - this.width / 2,
                this.y - this.height,
                this.width,
                this.height
            );
        }
    }
    
    getCollisionRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height,
            width: this.width,
            height: this.height
        };
    }
}

class MovingTrain extends Obstacle {
    constructor(x, y, lane, gameSpeed, direction = 1) {
        super(x, y, lane, 'train', gameSpeed);
        this.direction = direction; // 1 = left to right, -1 = right to left
        this.movementSpeed = 1.5;
        this.sprite = direction === 1 ? '🚇' : '🚈';
        this.oscillation = 0;
    }
    
    update(deltaTime, gameSpeed) {
        super.update(deltaTime, gameSpeed);
        
        // Side-to-side movement
        this.oscillation += deltaTime * 0.003;
        this.x += Math.sin(this.oscillation) * this.movementSpeed * this.direction;
        
        // Keep within reasonable bounds
        const margin = 50;
        if (this.x < margin || this.x > window.innerWidth - margin) {
            this.direction *= -1;
        }
    }
}

class ObstacleManager {
    constructor(canvas, player) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = player;
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 2000; // Base spawn interval in ms
        this.minSpawnInterval = 800;
        this.difficulty = 1;
        
        // Obstacle spawn patterns
        this.patterns = [
            { type: 'single', obstacles: [{ lane: 1, type: 'barrier' }] },
            { type: 'double', obstacles: [{ lane: 0, type: 'cone' }, { lane: 2, type: 'cone' }] },
            { type: 'train', obstacles: [{ lane: 1, type: 'train' }] },
            { type: 'tunnel', obstacles: [{ lane: 0, type: 'tunnel' }, { lane: 1, type: 'tunnel' }] },
            { type: 'zigzag', obstacles: [{ lane: 0, type: 'sign' }, { lane: 2, type: 'barrier' }] },
            { type: 'moving_train', obstacles: [{ lane: 1, type: 'moving_train' }] }
        ];
        
        this.obstacleWeights = {
            'barrier': 30,
            'cone': 25,
            'sign': 20,
            'train': 15,
            'tunnel': 7,
            'moving_train': 3
        };
    }
    
    update(deltaTime, gameState) {
        const currentTime = Date.now();
        
        // Update difficulty based on score
        this.difficulty = 1 + gameState.score / 1000;
        
        // Adjust spawn interval based on difficulty
        const adjustedInterval = Math.max(
            this.minSpawnInterval,
            this.spawnInterval / this.difficulty
        );
        
        // Spawn new obstacles
        if (currentTime - this.lastSpawnTime > adjustedInterval) {
            this.spawnObstacle(gameState);
            this.lastSpawnTime = currentTime;
        }
        
        // Update existing obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.update(deltaTime, gameState.speed);
            
            if (!obstacle.active) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    spawnObstacle(gameState) {
        // Choose spawn pattern based on difficulty
        let pattern;
        
        if (this.difficulty < 2) {
            // Easy patterns
            pattern = this.patterns[MathUtils.randomInt(0, 2)];
        } else if (this.difficulty < 4) {
            // Medium patterns
            pattern = this.patterns[MathUtils.randomInt(0, 4)];
        } else {
            // Hard patterns
            pattern = this.patterns[MathUtils.randomInt(0, this.patterns.length - 1)];
        }
        
        const spawnY = -100; // Spawn above screen
        
        pattern.obstacles.forEach(obstacleData => {
            const lane = obstacleData.lane;
            const laneX = this.player.lanePositions[lane];
            
            let obstacle;
            if (obstacleData.type === 'moving_train') {
                obstacle = new MovingTrain(
                    laneX,
                    spawnY,
                    lane,
                    gameState.speed,
                    MathUtils.randomInt(0, 1) === 0 ? 1 : -1
                );
            } else {
                obstacle = new Obstacle(
                    laneX,
                    spawnY,
                    lane,
                    obstacleData.type,
                    gameState.speed
                );
            }
            
            this.obstacles.push(obstacle);
        });
    }
    
    spawnRandomObstacle(gameState) {
        const availableLanes = [0, 1, 2];
        const lane = availableLanes[MathUtils.randomInt(0, availableLanes.length - 1)];
        const laneX = this.player.lanePositions[lane];
        
        // Choose obstacle type based on weights
        const obstacleType = this.getWeightedRandomObstacle();
        
        const obstacle = new Obstacle(
            laneX,
            -100,
            lane,
            obstacleType,
            gameState.speed
        );
        
        this.obstacles.push(obstacle);
    }
    
    getWeightedRandomObstacle() {
        const types = Object.keys(this.obstacleWeights);
        const weights = Object.values(this.obstacleWeights);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < types.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return types[i];
            }
        }
        
        return types[0]; // Fallback
    }
    
    checkCollisions(player, audioManager) {
        for (let obstacle of this.obstacles) {
            if (!obstacle.active) continue;
            
            if (player.checkObstacleCollision(obstacle)) {
                audioManager.playGameOver();
                return true; // Collision detected
            }
        }
        return false;
    }
    
    render() {
        this.obstacles.forEach(obstacle => {
            obstacle.render(this.ctx);
        });
        
        // Render debug info
        if (window.DEBUG_MODE) {
            this.renderDebugInfo();
        }
    }
    
    renderDebugInfo() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Obstacles: ${this.obstacles.length}`, 10, 50);
        this.ctx.fillText(`Difficulty: ${this.difficulty.toFixed(2)}`, 10, 70);
        this.ctx.fillText(`Spawn Interval: ${(this.spawnInterval / this.difficulty).toFixed(0)}ms`, 10, 90);
    }
    
    clear() {
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.difficulty = 1;
    }
    
    // Special obstacle spawning methods
    spawnTrainSequence(gameState) {
        const trains = [
            { lane: 0, delay: 0 },
            { lane: 2, delay: 500 },
            { lane: 1, delay: 1000 }
        ];
        
        trains.forEach(trainData => {
            setTimeout(() => {
                const laneX = this.player.lanePositions[trainData.lane];
                const train = new Obstacle(
                    laneX,
                    -100,
                    trainData.lane,
                    'train',
                    gameState.speed
                );
                this.obstacles.push(train);
            }, trainData.delay);
        });
    }
    
    spawnTunnelGap(gameState) {
        // Create a gap the player must roll through
        const openLane = MathUtils.randomInt(0, 2);
        
        for (let lane = 0; lane < 3; lane++) {
            if (lane !== openLane) {
                const laneX = this.player.lanePositions[lane];
                const tunnel = new Obstacle(
                    laneX,
                    -100,
                    lane,
                    'tunnel',
                    gameState.speed
                );
                this.obstacles.push(tunnel);
            }
        }
    }
    
    getObstaclesInRange(y, range) {
        return this.obstacles.filter(obstacle => 
            obstacle.active && 
            Math.abs(obstacle.y - y) <= range
        );
    }
    
    getClosestObstacle(playerY) {
        let closest = null;
        let minDistance = Infinity;
        
        for (let obstacle of this.obstacles) {
            if (!obstacle.active) continue;
            
            const distance = Math.abs(obstacle.y - playerY);
            if (distance < minDistance) {
                minDistance = distance;
                closest = obstacle;
            }
        }
        
        return closest;
    }
}

// Special Effects for Obstacles
class ObstacleEffects {
    static createExplosion(x, y, ctx) {
        const particles = [];
        const particleCount = 10;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: x,
                y: y,
                vx: MathUtils.random(-5, 5),
                vy: MathUtils.random(-8, -2),
                life: 1,
                decay: MathUtils.random(0.02, 0.05),
                size: MathUtils.random(2, 6),
                color: `hsl(${MathUtils.random(0, 60)}, 100%, 50%)`
            });
        }
        
        const animate = () => {
            ctx.save();
            
            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.2; // gravity
                particle.life -= particle.decay;
                
                if (particle.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }
                
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            }
            
            ctx.restore();
            
            if (particles.length > 0) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    static createSparkTrail(x, y, ctx) {
        ctx.save();
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        
        for (let i = 0; i < 5; i++) {
            const offsetX = MathUtils.random(-10, 10);
            const offsetY = MathUtils.random(10, 30);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + offsetX, y + offsetY);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Export classes for use in other modules
window.Obstacle = Obstacle;
window.MovingTrain = MovingTrain;
window.ObstacleManager = ObstacleManager;
window.ObstacleEffects = ObstacleEffects;