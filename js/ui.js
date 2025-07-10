// UI Management System
class UIManager {
    constructor() {
        this.currentScreen = 'loading';
        this.setupEventListeners();
        this.checkDailyReward();
    }
    
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('playBtn').addEventListener('click', () => {
            this.showCharacterSelect();
        });
        
        document.getElementById('charactersBtn').addEventListener('click', () => {
            this.showCharacterSelect();
        });
        
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.showLeaderboard();
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });
        
        // Character selection
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Character cards
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectCharacter(e.currentTarget);
            });
        });
        
        // Leaderboard
        document.getElementById('backToMenuFromLeaderboard').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Settings
        document.getElementById('backToMenuFromSettings').addEventListener('click', () => {
            this.saveSettings();
            this.showMainMenu();
        });
        
        // Game controls
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (window.game) {
                window.game.pause();
            }
        });
        
        // Pause menu
        document.getElementById('resumeBtn').addEventListener('click', () => {
            if (window.game) {
                window.game.resume();
            }
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            if (window.game) {
                window.game.restart();
            }
        });
        
        document.getElementById('quitBtn').addEventListener('click', () => {
            if (window.game) {
                window.game.quitToMenu();
            }
        });
        
        // Game over
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            if (window.game) {
                window.game.restart();
            }
        });
        
        document.getElementById('backToMenuFromGame').addEventListener('click', () => {
            if (window.game) {
                window.game.quitToMenu();
            }
        });
        
        // Daily rewards
        document.getElementById('claimRewardBtn').addEventListener('click', () => {
            this.claimDailyReward();
        });
        
        // Settings toggles
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            AudioManager.setSoundEnabled(e.target.checked);
        });
        
        document.getElementById('musicToggle').addEventListener('change', (e) => {
            AudioManager.setMusicEnabled(e.target.checked);
        });
        
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.updateDifficulty(e.target.value);
        });
        
        // Touch controls for mobile
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        // Add touch controls to game screen
        const gameScreen = document.getElementById('gameScreen');
        const touchControls = document.createElement('div');
        touchControls.className = 'touch-controls';
        touchControls.innerHTML = `
            <div class="touch-btn" id="leftBtn">⬅️</div>
            <div class="touch-btn" id="jumpBtn">⬆️</div>
            <div class="touch-btn" id="rollBtn">⬇️</div>
            <div class="touch-btn" id="rightBtn">➡️</div>
        `;
        gameScreen.appendChild(touchControls);
        
        // Touch control events
        document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (window.game && window.game.gameState === 'playing') {
                window.game.movePlayer('left');
            }
        });
        
        document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (window.game && window.game.gameState === 'playing') {
                window.game.movePlayer('right');
            }
        });
        
        document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (window.game && window.game.gameState === 'playing') {
                window.game.jump();
            }
        });
        
        document.getElementById('rollBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (window.game && window.game.gameState === 'playing') {
                window.game.roll();
            }
        });
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.remove('hidden');
        this.currentScreen = screenId;
    }
    
    showMainMenu() {
        this.showScreen('mainMenu');
        document.getElementById('highScoreDisplay').textContent = 
            localStorage.getItem('subwayRunnerHighScore') || '0';
    }
    
    showCharacterSelect() {
        this.showScreen('characterSelect');
        this.updateCharacterSelection();
    }
    
    showLeaderboard() {
        this.showScreen('leaderboard');
        this.loadLeaderboard();
    }
    
    showSettings() {
        this.showScreen('settings');
        this.loadSettings();
    }
    
    showGameScreen() {
        this.showScreen('gameScreen');
        if (window.game) {
            window.game.startGame();
        }
    }
    
    selectCharacter(card) {
        if (card.classList.contains('locked')) {
            this.showUnlockMessage(card);
            return;
        }
        
        // Remove selection from all cards
        document.querySelectorAll('.character-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Select clicked card
        card.classList.add('selected');
        
        // Update game character
        const character = card.dataset.character;
        if (window.game) {
            window.game.player.character = character;
        }
        
        // Start game after character selection
        setTimeout(() => {
            this.showGameScreen();
        }, 500);
    }
    
    showUnlockMessage(card) {
        const character = card.querySelector('h3').textContent;
        const cost = card.querySelector('p').textContent;
        const currentCoins = parseInt(localStorage.getItem('subwayRunnerCoins') || '0');
        const costAmount = parseInt(cost.match(/\d+/)[0]);
        
        if (currentCoins >= costAmount) {
            // Unlock character
            this.unlockCharacter(card.dataset.character, costAmount);
            card.classList.remove('locked');
            card.querySelector('p').textContent = 'Unlocked';
            this.selectCharacter(card);
        } else {
            alert(`You need ${cost} to unlock ${character}!`);
        }
    }
    
    unlockCharacter(character, cost) {
        const currentCoins = parseInt(localStorage.getItem('subwayRunnerCoins') || '0');
        localStorage.setItem('subwayRunnerCoins', currentCoins - cost);
        
        // Save unlocked characters
        const unlocked = JSON.parse(localStorage.getItem('subwayRunnerUnlocked') || '["default"]');
        if (!unlocked.includes(character)) {
            unlocked.push(character);
            localStorage.setItem('subwayRunnerUnlocked', JSON.stringify(unlocked));
        }
    }
    
    updateCharacterSelection() {
        const unlocked = JSON.parse(localStorage.getItem('subwayRunnerUnlocked') || '["default"]');
        
        document.querySelectorAll('.character-card').forEach(card => {
            const character = card.dataset.character;
            if (unlocked.includes(character)) {
                card.classList.remove('locked');
                card.querySelector('p').textContent = 'Unlocked';
            } else {
                card.classList.add('locked');
            }
        });
    }
    
    loadLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('subwayRunnerScores') || '[]');
        const scoreEntries = document.getElementById('scoreEntries');
        
        scoreEntries.innerHTML = '';
        
        if (scores.length === 0) {
            scoreEntries.innerHTML = '<div class="score-entry"><span colspan="3">No scores yet!</span></div>';
            return;
        }
        
        scores.forEach((score, index) => {
            const entry = document.createElement('div');
            entry.className = 'score-entry';
            entry.innerHTML = `
                <span>${index + 1}</span>
                <span>${score.score}</span>
                <span>${score.date}</span>
            `;
            scoreEntries.appendChild(entry);
        });
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('subwayRunnerSettings') || '{}');
        
        document.getElementById('soundToggle').checked = settings.sound !== false;
        document.getElementById('musicToggle').checked = settings.music !== false;
        document.getElementById('difficultySelect').value = settings.difficulty || 'medium';
    }
    
    saveSettings() {
        const settings = {
            sound: document.getElementById('soundToggle').checked,
            music: document.getElementById('musicToggle').checked,
            difficulty: document.getElementById('difficultySelect').value
        };
        
        localStorage.setItem('subwayRunnerSettings', JSON.stringify(settings));
    }
    
    updateDifficulty(difficulty) {
        if (window.game) {
            switch (difficulty) {
                case 'easy':
                    window.game.speedIncrease = 0.0005;
                    window.game.maxSpeed = 12;
                    break;
                case 'medium':
                    window.game.speedIncrease = 0.001;
                    window.game.maxSpeed = 15;
                    break;
                case 'hard':
                    window.game.speedIncrease = 0.002;
                    window.game.maxSpeed = 20;
                    break;
            }
        }
    }
    
    checkDailyReward() {
        const lastReward = localStorage.getItem('subwayRunnerLastReward');
        const today = new Date().toDateString();
        
        if (lastReward !== today) {
            // Show daily reward popup
            setTimeout(() => {
                this.showDailyReward();
            }, 2000);
        }
    }
    
    showDailyReward() {
        const rewardAmount = Math.floor(Math.random() * 200) + 100;
        document.getElementById('rewardAmount').textContent = rewardAmount;
        document.getElementById('dailyRewards').classList.remove('hidden');
    }
    
    claimDailyReward() {
        const rewardAmount = parseInt(document.getElementById('rewardAmount').textContent);
        const currentCoins = parseInt(localStorage.getItem('subwayRunnerCoins') || '0');
        
        localStorage.setItem('subwayRunnerCoins', currentCoins + rewardAmount);
        localStorage.setItem('subwayRunnerLastReward', new Date().toDateString());
        
        document.getElementById('dailyRewards').classList.add('hidden');
        
        // Update coin display if on main menu
        if (this.currentScreen === 'mainMenu') {
            this.updateCoinDisplay();
        }
    }
    
    updateCoinDisplay() {
        const coins = localStorage.getItem('subwayRunnerCoins') || '0';
        // You can add a coin display to the main menu if needed
    }
    
    showLoadingProgress(progress) {
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    hideLoadingScreen() {
        document.getElementById('loadingScreen').classList.add('hidden');
        this.showMainMenu();
    }
    
    // Animation helpers
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    fadeOut(element, duration = 300) {
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - progress / duration, 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Notification system
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4757' : '#3742fa'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UIManager();
    
    // Simulate loading
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(() => {
                window.ui.hideLoadingScreen();
            }, 500);
        }
        window.ui.showLoadingProgress(progress);
    }, 100);
});