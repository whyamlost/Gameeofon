// Main Game Engine for Subway Surfers

class SubwaySurfersGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.animationId = null;
        
        // Game systems
        this.gameState = new GameStateManager();
        this.audioManager = new AudioManager();
        this.performanceMonitor = new PerformanceMonitor();
        this.uiManager = null;
        this.player = null;
        this.obstacleManager = null;
        this.powerUpManager = null;
        this.touchHandler = null;
        
        // Background rendering
        this.backgroundOffset = 0;
        this.trackOffset = 0;
        
        // Input handling
        this.keys = new Set();
        this.lastInputTime = 0;
        this.inputCooldown = 150; // ms
        
        // Game world properties
        this.distance = 0;
        this.worldSpeed = 0;
        
        this.initialize();
    }
    
    initialize() {
        // Setup canvas
        this.setupCanvas();
        
        // Initialize UI Manager
        this.uiManager = new UIManager(this.gameState, this.audioManager);
        this.setupUICallbacks();
        
        // Initialize game objects
        this.player = new Player(this.canvas);
        this.obstacleManager = new ObstacleManager(this.canvas, this.player);
        this.powerUpManager = new PowerUpManager(this.canvas, this.player);
        
        // Setup input handling
        this.setupInputHandlers();
        
        // Setup mobile controls
        this.setupMobileControls();
        
        // Setup window events
        this.setupWindowEvents();
        
        // Start game loop
        this.start();
        
        console.log('Subway Surfers Game initialized successfully!');
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        
        // Setup canvas properties for crisp rendering
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.textRendering = 'optimizeSpeed';
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Update player lane positions
        if (this.player) {
            this.player.updateLanePositions();
        }
    }
    
    setupUICallbacks() {
        this.uiManager.onGameStart = () => {
            this.startNewGame();
        };
        
        this.uiManager.onGamePause = () => {
            // Game paused - audio can continue
        };
        
        this.uiManager.onGameResume = () => {
            // Game resumed
        };
        
        this.uiManager.onGameOver = () => {
            this.endGame();
        };
    }
    
    setupInputHandlers() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (this.gameState.state === 'playing') {
                this.handleKeyDown(e.key);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    setupMobileControls() {
        const swipeArea = document.getElementById('swipeArea');
        if (swipeArea) {
            this.touchHandler = new TouchHandler(swipeArea);
            
            this.touchHandler.on('swipeLeft', () => {
                if (this.gameState.state === 'playing') {
                    this.player.handleSwipe('left');
                    this.audioManager.playJump();
                }
            });
            
            this.touchHandler.on('swipeRight', () => {
                if (this.gameState.state === 'playing') {
                    this.player.handleSwipe('right');
                    this.audioManager.playJump();
                }
            });
            
            this.touchHandler.on('swipeUp', () => {
                if (this.gameState.state === 'playing') {
                    this.player.handleSwipe('up');
                    this.audioManager.playJump();
                }
            });
            
            this.touchHandler.on('swipeDown', () => {
                if (this.gameState.state === 'playing') {
                    this.player.handleSwipe('down');
                }
            });
            
            this.touchHandler.on('tap', () => {
                if (this.gameState.state === 'playing') {
                    this.player.handleTap();
                    this.audioManager.playJump();
                }
            });
        }
    }
    
    setupWindowEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Handle visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState.state === 'playing') {
                this.uiManager.pauseGame();
            }
        });
        
        // Handle focus/blur
        window.addEventListener('blur', () => {
            if (this.gameState.state === 'playing') {
                this.uiManager.pauseGame();
            }
        });
    }
    
    handleKeyDown(key) {
        const currentTime = Date.now();
        
        // Input cooldown to prevent spam
        if (currentTime - this.lastInputTime < this.inputCooldown) {
            return;
        }
        
        if (this.keys.has(key)) {
            return; // Key already pressed
        }
        
        this.keys.add(key);
        this.lastInputTime = currentTime;
        
        // Handle player input
        this.player.handleKeyDown(key);
        
        // Play audio feedback
        if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(key)) {
            this.audioManager.playJump();
        } else if (['ArrowUp', 'w', 'W', ' '].includes(key)) {
            this.audioManager.playJump();
        }
        
        // Debug commands
        if (key === 'F2') {
            this.toggleDebugMode();
        }
    }
    
    toggleDebugMode() {
        if (window.DEBUG_MODE) {
            this.uiManager.disableDebugMode();
        } else {
            this.uiManager.enableDebugMode();
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
        }
    }
    
    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }
    
    startNewGame() {
        // Reset all game systems
        this.distance = 0;
        this.worldSpeed = GAME_CONFIG.INITIAL_SPEED;
        this.backgroundOffset = 0;
        this.trackOffset = 0;
        
        this.player.resetPosition();
        this.obstacleManager.clear();
        this.powerUpManager.clear();
        
        // Show initial control hint
        this.uiManager.showControlHint('Use arrow keys or swipe to move!');
    }
    
    endGame() {
        this.audioManager.playGameOver();
        this.uiManager.setLastGameTimestamp();
        
        // Check for achievements
        this.checkAchievements();
    }
    
    checkAchievements() {
        const score = this.gameState.score;
        
        // Score-based achievements
        if (score >= 1000 && !StorageManager.getItem('score_1000', false)) {
            AnimationUtils.showAchievement('First Milestone!', 'Scored 1,000 points!');
            StorageManager.setItem('score_1000', true);
        }
        
        if (score >= 5000 && !StorageManager.getItem('score_5000', false)) {
            AnimationUtils.showAchievement('Speed Demon!', 'Scored 5,000 points!');
            StorageManager.setItem('score_5000', true);
        }
        
        if (score >= 10000 && !StorageManager.getItem('score_10000', false)) {
            AnimationUtils.showAchievement('Subway Master!', 'Scored 10,000 points!');
            StorageManager.setItem('score_10000', true);
        }
        
        // Distance-based achievements
        const distanceKm = Math.floor(this.distance / 1000);
        if (distanceKm >= 1 && !StorageManager.getItem('distance_1km', false)) {
            AnimationUtils.showAchievement('Marathon Runner!', 'Traveled 1 kilometer!');
            StorageManager.setItem('distance_1km', true);
        }
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const deltaTime = this.performanceMonitor.update();
        
        // Update game state
        if (this.gameState.state === 'playing') {
            this.update(deltaTime);
        }
        
        // Render game
        this.render();
        
        // Update UI
        this.uiManager.update(deltaTime);
        
        // Show FPS in debug mode
        if (window.DEBUG_MODE) {
            this.uiManager.showFPS(this.performanceMonitor.getFPS());
        }
        
        // Continue game loop
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Update distance and speed
        this.distance += this.worldSpeed * deltaTime / 16.67;
        this.gameState.updateSpeed(this.distance);
        this.worldSpeed = this.gameState.speed;
        
        // Update score based on distance
        const scoreIncrement = Math.floor(this.worldSpeed);
        this.gameState.addScore(scoreIncrement);
        
        // Update game objects
        this.player.update(deltaTime, this.gameState);
        this.obstacleManager.update(deltaTime, this.gameState);
        this.powerUpManager.update(deltaTime, this.gameState);
        
        // Check collisions
        this.checkCollisions();
        
        // Update background
        this.updateBackground(deltaTime);
    }
    
    updateBackground(deltaTime) {
        this.backgroundOffset += this.worldSpeed * deltaTime / 16.67;
        this.trackOffset += this.worldSpeed * deltaTime / 16.67;
        
        // Reset offsets to prevent overflow
        if (this.backgroundOffset > this.canvas.height) {
            this.backgroundOffset = 0;
        }
        
        if (this.trackOffset > 100) {
            this.trackOffset = 0;
        }
    }
    
    checkCollisions() {
        // Check obstacle collisions
        if (this.obstacleManager.checkCollisions(this.player, this.audioManager)) {
            this.uiManager.showGameOver();
            return;
        }
        
        // Check power-up and coin collisions
        this.powerUpManager.checkCollisions(this.player, this.gameState, this.audioManager);
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render background
        this.renderBackground();
        
        // Render game objects (only when playing)
        if (this.gameState.state === 'playing' || this.gameState.state === 'paused') {
            this.renderTracks();
            this.powerUpManager.render();
            this.obstacleManager.render();
            this.player.render();
            this.renderSpeedEffects();
        }
        
        // Render pause overlay
        if (this.gameState.state === 'paused') {
            this.renderPauseOverlay();
        }
    }
    
    renderBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        // Time-based color variation
        const time = Date.now() * 0.001;
        const skyHue = 200 + Math.sin(time * 0.1) * 30;
        
        gradient.addColorStop(0, `hsl(${skyHue}, 60%, 70%)`); // Sky
        gradient.addColorStop(0.3, `hsl(${skyHue + 20}, 50%, 60%)`); // Horizon
        gradient.addColorStop(0.7, '#4a4a4a'); // Buildings
        gradient.addColorStop(1, '#2a2a2a'); // Ground
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Parallax buildings
        this.renderBuildings();
        
        // Moving clouds
        this.renderClouds();
    }
    
    renderBuildings() {
        const buildingHeight = this.canvas.height * 0.4;
        const buildingY = this.canvas.height * 0.3;
        const buildingSpeed = this.worldSpeed * 0.3;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        
        for (let i = 0; i < 10; i++) {
            const x = (i * 80 - this.backgroundOffset * buildingSpeed) % (this.canvas.width + 80);
            const height = buildingHeight + Math.sin(i) * 50;
            
            this.ctx.fillRect(x, buildingY, 60, height);
            
            // Building windows
            this.ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
            for (let w = 0; w < 3; w++) {
                for (let h = 0; h < 8; h++) {
                    if (Math.random() > 0.7) {
                        this.ctx.fillRect(x + 10 + w * 15, buildingY + 20 + h * 20, 8, 12);
                    }
                }
            }
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        }
    }
    
    renderClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const cloudSpeed = this.worldSpeed * 0.1;
        
        for (let i = 0; i < 5; i++) {
            const x = (i * 200 - this.backgroundOffset * cloudSpeed) % (this.canvas.width + 100);
            const y = 50 + Math.sin(i) * 30;
            const size = 30 + i * 10;
            
            // Simple cloud shape
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.arc(x + size * 0.5, y, size * 0.8, 0, Math.PI * 2);
            this.ctx.arc(x + size, y, size * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    renderTracks() {
        const laneWidth = GAME_CONFIG.LANE_WIDTH;
        const trackY = this.canvas.height - 150;
        
        // Track base
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(
            this.player.lanePositions[0] - laneWidth / 2,
            trackY,
            laneWidth * 3,
            100
        );
        
        // Lane dividers
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([20, 10]);
        this.ctx.lineDashOffset = -this.trackOffset;
        
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.lanePositions[i] - laneWidth / 2, trackY);
            this.ctx.lineTo(this.player.lanePositions[i] - laneWidth / 2, trackY + 100);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
        
        // Rails
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 6;
        
        for (let i = 0; i < 3; i++) {
            const railX = this.player.lanePositions[i];
            
            // Left rail
            this.ctx.beginPath();
            this.ctx.moveTo(railX - 30, trackY);
            this.ctx.lineTo(railX - 30, trackY + 100);
            this.ctx.stroke();
            
            // Right rail
            this.ctx.beginPath();
            this.ctx.moveTo(railX + 30, trackY);
            this.ctx.lineTo(railX + 30, trackY + 100);
            this.ctx.stroke();
        }
        
        // Railroad ties
        this.ctx.fillStyle = '#8B4513';
        const tieSpacing = 30;
        
        for (let i = 0; i < this.canvas.height / tieSpacing + 2; i++) {
            const tieY = trackY + 40 + (i * tieSpacing - this.trackOffset) % this.canvas.height;
            
            this.ctx.fillRect(
                this.player.lanePositions[0] - laneWidth / 2 - 10,
                tieY,
                laneWidth * 3 + 20,
                8
            );
        }
    }
    
    renderSpeedEffects() {
        if (this.worldSpeed > GAME_CONFIG.INITIAL_SPEED * 2) {
            // Speed lines
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                const length = 20 + this.worldSpeed * 5;
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x, y + length);
                this.ctx.stroke();
            }
            
            // Screen shake effect for very high speeds
            if (this.worldSpeed > GAME_CONFIG.MAX_SPEED * 0.8) {
                const shakeIntensity = 2;
                this.ctx.translate(
                    Math.random() * shakeIntensity - shakeIntensity / 2,
                    Math.random() * shakeIntensity - shakeIntensity / 2
                );
            }
        }
    }
    
    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    // Public methods for debugging
    getGameStats() {
        return {
            distance: this.distance,
            speed: this.worldSpeed,
            score: this.gameState.score,
            coins: this.gameState.coins,
            obstacles: this.obstacleManager.obstacles.length,
            powerups: this.powerUpManager.powerUps.length,
            fps: this.performanceMonitor.getFPS()
        };
    }
    
    setSpeed(speed) {
        this.worldSpeed = MathUtils.clamp(speed, 0, GAME_CONFIG.MAX_SPEED * 2);
    }
    
    spawnTestObstacle(type = 'train') {
        const lane = MathUtils.randomInt(0, 2);
        const x = this.player.lanePositions[lane];
        const obstacle = new Obstacle(x, -100, lane, type, this.worldSpeed);
        this.obstacleManager.obstacles.push(obstacle);
    }
    
    spawnTestPowerUp(type = 'magnet') {
        const lane = MathUtils.randomInt(0, 2);
        const x = this.player.lanePositions[lane];
        const powerUp = new PowerUp(x, -100, lane, type, this.worldSpeed);
        this.powerUpManager.powerUps.push(powerUp);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global game instance
    window.game = new SubwaySurfersGame();
    
    // Add debug commands to window for development
    if (window.DEBUG_MODE) {
        window.gameStats = () => window.game.getGameStats();
        window.setSpeed = (speed) => window.game.setSpeed(speed);
        window.spawnObstacle = (type) => window.game.spawnTestObstacle(type);
        window.spawnPowerUp = (type) => window.game.spawnTestPowerUp(type);
    }
    
    console.log('🚇 Subway Surfers Game Loaded! 🚇');
    console.log('Use arrow keys or swipe to play!');
    
    if (window.DEBUG_MODE) {
        console.log('Debug mode enabled. Press F2 to toggle.');
        console.log('Available debug commands: gameStats(), setSpeed(n), spawnObstacle(type), spawnPowerUp(type)');
    }
});