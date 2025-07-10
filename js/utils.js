// Utility Functions for Subway Surfers Game

// Game Constants
const GAME_CONFIG = {
    LANES: 3,
    LANE_WIDTH: 150,
    PLAYER_HEIGHT: 60,
    PLAYER_WIDTH: 40,
    JUMP_HEIGHT: 100,
    ROLL_DURATION: 500,
    INITIAL_SPEED: 2,
    MAX_SPEED: 8,
    SPEED_INCREMENT: 0.001,
    COIN_VALUE: 10,
    POWERUP_DURATION: 5000
};

// Math Utilities
class MathUtils {
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
    
    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

// Collision Detection
class CollisionUtils {
    static rectRect(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    static circleRect(circle, rect) {
        const distX = Math.abs(circle.x - rect.x - rect.width / 2);
        const distY = Math.abs(circle.y - rect.y - rect.height / 2);
        
        if (distX > (rect.width / 2 + circle.radius)) return false;
        if (distY > (rect.height / 2 + circle.radius)) return false;
        
        if (distX <= (rect.width / 2)) return true;
        if (distY <= (rect.height / 2)) return true;
        
        const dx = distX - rect.width / 2;
        const dy = distY - rect.height / 2;
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }
    
    static pointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
}

// Local Storage Manager
class StorageManager {
    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }
    
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
            return defaultValue;
        }
    }
    
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Failed to remove from localStorage:', e);
        }
    }
    
    static clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
        }
    }
}

// Game State Manager
class GameStateManager {
    constructor() {
        this.state = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.coins = 0;
        this.level = 1;
        this.speed = GAME_CONFIG.INITIAL_SPEED;
        this.powerups = new Map();
        this.highScore = StorageManager.getItem('highScore', 0);
        this.totalCoins = StorageManager.getItem('totalCoins', 0);
        this.unlockedCharacters = StorageManager.getItem('unlockedCharacters', ['jake']);
        this.selectedCharacter = StorageManager.getItem('selectedCharacter', 'jake');
        this.settings = StorageManager.getItem('settings', {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal'
        });
    }
    
    reset() {
        this.score = 0;
        this.coins = 0;
        this.level = 1;
        this.speed = GAME_CONFIG.INITIAL_SPEED;
        this.powerups.clear();
    }
    
    addScore(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            StorageManager.setItem('highScore', this.highScore);
        }
    }
    
    addCoins(amount) {
        this.coins += amount;
        this.totalCoins += amount;
        StorageManager.setItem('totalCoins', this.totalCoins);
    }
    
    activatePowerup(type, duration = GAME_CONFIG.POWERUP_DURATION) {
        this.powerups.set(type, Date.now() + duration);
    }
    
    isPowerupActive(type) {
        const endTime = this.powerups.get(type);
        if (!endTime) return false;
        if (Date.now() > endTime) {
            this.powerups.delete(type);
            return false;
        }
        return true;
    }
    
    updateSpeed(distance) {
        this.speed = Math.min(
            GAME_CONFIG.MAX_SPEED,
            GAME_CONFIG.INITIAL_SPEED + distance * GAME_CONFIG.SPEED_INCREMENT
        );
    }
    
    saveSettings() {
        StorageManager.setItem('settings', this.settings);
    }
    
    unlockCharacter(character) {
        if (!this.unlockedCharacters.includes(character)) {
            this.unlockedCharacters.push(character);
            StorageManager.setItem('unlockedCharacters', this.unlockedCharacters);
        }
    }
    
    selectCharacter(character) {
        if (this.unlockedCharacters.includes(character)) {
            this.selectedCharacter = character;
            StorageManager.setItem('selectedCharacter', character);
        }
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.frameTimeHistory = [];
        this.maxHistory = 60;
    }
    
    update() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.frameTimeHistory.push(deltaTime);
        if (this.frameTimeHistory.length > this.maxHistory) {
            this.frameTimeHistory.shift();
        }
        
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
            this.fps = Math.round(1000 / avgFrameTime);
        }
        
        return deltaTime;
    }
    
    getFPS() {
        return this.fps;
    }
}

// Audio Manager
class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.musicVolume = 0.5;
        this.soundVolume = 0.7;
        this.musicEnabled = true;
        this.soundEnabled = true;
    }
    
    createBeep(frequency, duration, volume = 0.1) {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Web Audio not supported:', e);
        }
    }
    
    playJump() {
        this.createBeep(400, 0.2, 0.1);
    }
    
    playCoinCollect() {
        this.createBeep(800, 0.1, 0.15);
    }
    
    playPowerup() {
        this.createBeep(600, 0.3, 0.12);
    }
    
    playGameOver() {
        this.createBeep(200, 0.5, 0.2);
    }
    
    setMusicVolume(volume) {
        this.musicVolume = MathUtils.clamp(volume, 0, 1);
    }
    
    setSoundVolume(volume) {
        this.soundVolume = MathUtils.clamp(volume, 0, 1);
    }
    
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
    }
    
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }
}

// Touch Handler for Mobile
class TouchHandler {
    constructor(element) {
        this.element = element;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.minSwipeDistance = 50;
        this.maxTapDistance = 10;
        this.callbacks = {};
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.endX = touch.clientX;
        this.endY = touch.clientY;
        
        const deltaX = this.endX - this.startX;
        const deltaY = this.endY - this.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Check for tap
        if (distance < this.maxTapDistance) {
            this.trigger('tap', { x: this.endX, y: this.endY });
            return;
        }
        
        // Check for swipe
        if (distance < this.minSwipeDistance) return;
        
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.trigger('swipeRight');
            } else {
                this.trigger('swipeLeft');
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                this.trigger('swipeDown');
            } else {
                this.trigger('swipeUp');
            }
        }
    }
    
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }
    
    trigger(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }
}

// Animation Utilities
class AnimationUtils {
    static createCoinCollectEffect(x, y, amount) {
        const effect = document.createElement('div');
        effect.className = 'coin-collect-effect';
        effect.textContent = `+${amount}`;
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1000);
    }
    
    static showAchievement(title, description) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-title">${title}</div>
            <div class="achievement-description">${description}</div>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => popup.classList.add('show'), 100);
        
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 500);
        }, 3000);
    }
}

// Export utilities for use in other modules
window.MathUtils = MathUtils;
window.CollisionUtils = CollisionUtils;
window.StorageManager = StorageManager;
window.GameStateManager = GameStateManager;
window.PerformanceMonitor = PerformanceMonitor;
window.AudioManager = AudioManager;
window.TouchHandler = TouchHandler;
window.AnimationUtils = AnimationUtils;
window.GAME_CONFIG = GAME_CONFIG;