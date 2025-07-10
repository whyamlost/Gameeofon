// UI Manager for Subway Surfers Game

class UIManager {
    constructor(gameState, audioManager) {
        this.gameState = gameState;
        this.audioManager = audioManager;
        this.currentScreen = 'mainMenu';
        this.screens = new Map();
        this.powerupIndicators = new Map();
        
        this.initializeScreens();
        this.bindEvents();
        this.updatePowerupIndicators();
    }
    
    initializeScreens() {
        // Register all screen elements
        this.screens.set('mainMenu', document.getElementById('mainMenu'));
        this.screens.set('gameScreen', document.getElementById('gameScreen'));
        this.screens.set('gameOverScreen', document.getElementById('gameOverScreen'));
        this.screens.set('characterScreen', document.getElementById('characterScreen'));
        this.screens.set('leaderboardScreen', document.getElementById('leaderboardScreen'));
        this.screens.set('settingsScreen', document.getElementById('settingsScreen'));
        this.screens.set('pauseMenu', document.getElementById('pauseMenu'));
        
        // Power-up indicators
        this.powerupIndicators.set('magnet', document.getElementById('magnetIndicator'));
        this.powerupIndicators.set('jetpack', document.getElementById('jetpackIndicator'));
        this.powerupIndicators.set('hoverboard', document.getElementById('hoverboardIndicator'));
    }
    
    bindEvents() {
        // Main Menu buttons
        document.getElementById('playBtn').addEventListener('click', () => {
            this.showScreen('gameScreen');
            this.startGame();
        });
        
        document.getElementById('charactersBtn').addEventListener('click', () => {
            this.showCharacterScreen();
        });
        
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.showLeaderboardScreen();
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsScreen();
        });
        
        // Game Over buttons
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.showScreen('gameScreen');
            this.startGame();
        });
        
        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Character selection
        document.getElementById('characterBackBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Leaderboard
        document.getElementById('leaderboardBackBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Settings
        document.getElementById('settingsBackBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
            this.saveSettings();
        });
        
        // Pause menu
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('pauseMainMenuBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
            this.gameState.state = 'menu';
        });
        
        // Character cards click handling
        this.bindCharacterCardEvents();
        
        // Settings controls
        this.bindSettingsEvents();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    bindCharacterCardEvents() {
        const characterCards = document.querySelectorAll('.character-card');
        characterCards.forEach(card => {
            card.addEventListener('click', () => {
                const character = card.dataset.character;
                this.selectCharacter(character);
            });
        });
    }
    
    bindSettingsEvents() {
        const soundToggle = document.getElementById('soundToggle');
        const musicToggle = document.getElementById('musicToggle');
        const difficultySelect = document.getElementById('difficultySelect');
        
        soundToggle.addEventListener('change', (e) => {
            this.gameState.settings.soundEnabled = e.target.checked;
            this.audioManager.setSoundEnabled(e.target.checked);
        });
        
        musicToggle.addEventListener('change', (e) => {
            this.gameState.settings.musicEnabled = e.target.checked;
            this.audioManager.setMusicEnabled(e.target.checked);
        });
        
        difficultySelect.addEventListener('change', (e) => {
            this.gameState.settings.difficulty = e.target.value;
        });
    }
    
    handleKeyboardShortcuts(e) {
        switch(e.key) {
            case 'Escape':
                if (this.gameState.state === 'playing') {
                    this.pauseGame();
                } else if (this.currentScreen === 'pauseMenu') {
                    this.resumeGame();
                } else if (this.currentScreen !== 'mainMenu') {
                    this.showScreen('mainMenu');
                }
                break;
                
            case 'Enter':
                if (this.currentScreen === 'mainMenu') {
                    this.showScreen('gameScreen');
                    this.startGame();
                }
                break;
                
            case 'r':
            case 'R':
                if (this.gameState.state === 'gameOver') {
                    this.showScreen('gameScreen');
                    this.startGame();
                }
                break;
        }
    }
    
    showScreen(screenName) {
        // Hide all screens
        this.screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = this.screens.get(screenName);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }
    }
    
    startGame() {
        this.gameState.reset();
        this.gameState.state = 'playing';
        this.updateGameHUD();
        
        // Trigger game start event
        if (this.onGameStart) {
            this.onGameStart();
        }
    }
    
    pauseGame() {
        if (this.gameState.state === 'playing') {
            this.gameState.state = 'paused';
            this.showScreen('pauseMenu');
            
            if (this.onGamePause) {
                this.onGamePause();
            }
        }
    }
    
    resumeGame() {
        if (this.gameState.state === 'paused') {
            this.gameState.state = 'playing';
            this.showScreen('gameScreen');
            
            if (this.onGameResume) {
                this.onGameResume();
            }
        }
    }
    
    showGameOver() {
        this.gameState.state = 'gameOver';
        this.updateGameOverScreen();
        this.showScreen('gameOverScreen');
        this.updateLeaderboard();
        
        if (this.onGameOver) {
            this.onGameOver();
        }
    }
    
    updateGameHUD() {
        document.getElementById('scoreDisplay').textContent = this.gameState.score.toLocaleString();
        document.getElementById('coinsDisplay').textContent = this.gameState.coins.toLocaleString();
    }
    
    updateGameOverScreen() {
        document.getElementById('finalScore').textContent = this.gameState.score.toLocaleString();
        document.getElementById('finalCoins').textContent = this.gameState.coins.toLocaleString();
        document.getElementById('bestScore').textContent = this.gameState.highScore.toLocaleString();
    }
    
    showCharacterScreen() {
        this.showScreen('characterScreen');
        this.updateCharacterScreen();
    }
    
    updateCharacterScreen() {
        const characterCards = document.querySelectorAll('.character-card');
        const unlockedCharacters = this.gameState.unlockedCharacters;
        const selectedCharacter = this.gameState.selectedCharacter;
        const totalCoins = this.gameState.totalCoins;
        
        characterCards.forEach(card => {
            const character = card.dataset.character;
            const isUnlocked = unlockedCharacters.includes(character);
            const isSelected = character === selectedCharacter;
            
            // Remove all status classes
            card.classList.remove('active', 'locked');
            
            if (isSelected) {
                card.classList.add('active');
            }
            
            if (!isUnlocked) {
                card.classList.add('locked');
                const cost = this.getCharacterCost(character);
                const statusElement = card.querySelector('.character-status');
                
                if (totalCoins >= cost) {
                    statusElement.textContent = `${cost} 🪙`;
                    statusElement.style.color = '#feca57';
                } else {
                    statusElement.textContent = `${cost} 🪙`;
                    statusElement.style.color = '#ff6b6b';
                }
            } else {
                const statusElement = card.querySelector('.character-status');
                if (isSelected) {
                    statusElement.textContent = 'SELECTED';
                    statusElement.style.color = '#ff6b6b';
                } else {
                    statusElement.textContent = 'OWNED';
                    statusElement.style.color = '#48dbfb';
                }
            }
        });
    }
    
    selectCharacter(character) {
        const cost = this.getCharacterCost(character);
        const isUnlocked = this.gameState.unlockedCharacters.includes(character);
        
        if (isUnlocked) {
            this.gameState.selectCharacter(character);
            this.updateCharacterScreen();
            
            AnimationUtils.showAchievement(
                'Character Selected!',
                `Now playing as ${this.getCharacterName(character)}`
            );
        } else if (this.gameState.totalCoins >= cost) {
            // Purchase character
            this.gameState.totalCoins -= cost;
            StorageManager.setItem('totalCoins', this.gameState.totalCoins);
            this.gameState.unlockCharacter(character);
            this.gameState.selectCharacter(character);
            this.updateCharacterScreen();
            
            AnimationUtils.showAchievement(
                'Character Unlocked!',
                `${this.getCharacterName(character)} is now available!`
            );
        } else {
            AnimationUtils.showAchievement(
                'Not Enough Coins!',
                `You need ${cost - this.gameState.totalCoins} more coins`
            );
        }
    }
    
    getCharacterCost(character) {
        const costs = {
            'jake': 0,
            'tricky': 500,
            'fresh': 1000
        };
        return costs[character] || 0;
    }
    
    getCharacterName(character) {
        const names = {
            'jake': 'Jake',
            'tricky': 'Tricky',
            'fresh': 'Fresh'
        };
        return names[character] || character;
    }
    
    showLeaderboardScreen() {
        this.showScreen('leaderboardScreen');
        this.updateLeaderboardDisplay();
    }
    
    updateLeaderboard() {
        if (this.gameState.score > 0) {
            const leaderboard = StorageManager.getItem('leaderboard', []);
            
            const entry = {
                score: this.gameState.score,
                coins: this.gameState.coins,
                character: this.gameState.selectedCharacter,
                date: new Date().toLocaleDateString(),
                timestamp: Date.now()
            };
            
            leaderboard.push(entry);
            leaderboard.sort((a, b) => b.score - a.score);
            leaderboard.splice(10); // Keep only top 10
            
            StorageManager.setItem('leaderboard', leaderboard);
        }
    }
    
    updateLeaderboardDisplay() {
        const leaderboard = StorageManager.getItem('leaderboard', []);
        const listContainer = document.getElementById('leaderboardList');
        
        if (leaderboard.length === 0) {
            listContainer.innerHTML = '<div class="leaderboard-empty">No scores yet. Play a game to set a record!</div>';
            return;
        }
        
        let html = '';
        leaderboard.forEach((entry, index) => {
            const isCurrentPlayer = entry.timestamp === this.getLastGameTimestamp();
            const className = isCurrentPlayer ? 'leaderboard-item current-player' : 'leaderboard-item';
            
            html += `
                <div class="${className}">
                    <div class="leaderboard-rank">#${index + 1}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${this.getCharacterName(entry.character)}</div>
                        <div class="leaderboard-date">${entry.date}</div>
                    </div>
                    <div class="leaderboard-score">${entry.score.toLocaleString()}</div>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
    }
    
    getLastGameTimestamp() {
        return StorageManager.getItem('lastGameTimestamp', 0);
    }
    
    setLastGameTimestamp() {
        StorageManager.setItem('lastGameTimestamp', Date.now());
    }
    
    showSettingsScreen() {
        this.showScreen('settingsScreen');
        this.updateSettingsDisplay();
    }
    
    updateSettingsDisplay() {
        document.getElementById('soundToggle').checked = this.gameState.settings.soundEnabled;
        document.getElementById('musicToggle').checked = this.gameState.settings.musicEnabled;
        document.getElementById('difficultySelect').value = this.gameState.settings.difficulty;
    }
    
    saveSettings() {
        this.gameState.saveSettings();
    }
    
    updatePowerupIndicators() {
        this.powerupIndicators.forEach((indicator, type) => {
            if (this.gameState.isPowerupActive(type)) {
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        });
    }
    
    // Mobile responsiveness
    setupMobileUI() {
        const touchControls = document.getElementById('touchControls');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            touchControls.style.display = 'block';
        } else {
            touchControls.style.display = 'none';
        }
    }
    
    showControlHint(message, duration = 2000) {
        const hintElement = document.querySelector('.control-hint');
        if (hintElement) {
            hintElement.textContent = message;
            hintElement.style.opacity = '1';
            
            setTimeout(() => {
                hintElement.style.opacity = '0.7';
            }, duration);
        }
    }
    
    // Event callbacks for game integration
    onGameStart() {}
    onGamePause() {}
    onGameResume() {}
    onGameOver() {}
    
    // Update methods called by game loop
    update(deltaTime) {
        if (this.gameState.state === 'playing') {
            this.updateGameHUD();
            this.updatePowerupIndicators();
        }
    }
    
    // Performance indicator
    showFPS(fps) {
        if (window.DEBUG_MODE) {
            let fpsDisplay = document.getElementById('fpsDisplay');
            if (!fpsDisplay) {
                fpsDisplay = document.createElement('div');
                fpsDisplay.id = 'fpsDisplay';
                fpsDisplay.style.position = 'fixed';
                fpsDisplay.style.top = '10px';
                fpsDisplay.style.left = '10px';
                fpsDisplay.style.color = 'white';
                fpsDisplay.style.fontSize = '14px';
                fpsDisplay.style.fontFamily = 'monospace';
                fpsDisplay.style.zIndex = '1000';
                document.body.appendChild(fpsDisplay);
            }
            fpsDisplay.textContent = `FPS: ${fps}`;
        }
    }
    
    // Notification system
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-size: 14px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;
        
        // Type-specific styling
        switch(type) {
            case 'success':
                notification.style.borderLeft = '4px solid #48dbfb';
                break;
            case 'warning':
                notification.style.borderLeft = '4px solid #feca57';
                break;
            case 'error':
                notification.style.borderLeft = '4px solid #ff6b6b';
                break;
            default:
                notification.style.borderLeft = '4px solid #667eea';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    // Debug methods
    enableDebugMode() {
        window.DEBUG_MODE = true;
        this.showNotification('Debug mode enabled', 'info');
    }
    
    disableDebugMode() {
        window.DEBUG_MODE = false;
        const fpsDisplay = document.getElementById('fpsDisplay');
        if (fpsDisplay) {
            fpsDisplay.remove();
        }
        this.showNotification('Debug mode disabled', 'info');
    }
}

// Export for use in other modules
window.UIManager = UIManager;