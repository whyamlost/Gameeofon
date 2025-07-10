// Audio Management System
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.musicVolume = 0.3;
        this.soundVolume = 0.5;
        
        this.loadAudio();
        this.loadSettings();
    }
    
    loadAudio() {
        // Create audio elements for sound effects
        this.sounds = {
            coin: this.createAudio('coin', 'assets/audio/coin.mp3'),
            jump: this.createAudio('jump', 'assets/audio/jump.mp3'),
            crash: this.createAudio('crash', 'assets/audio/crash.mp3'),
            powerup: this.createAudio('powerup', 'assets/audio/powerup.mp3')
        };
        
        // Background music
        this.music = document.getElementById('bgMusic');
        if (this.music) {
            this.music.volume = this.musicVolume;
            this.music.loop = true;
        }
    }
    
    createAudio(name, src) {
        const audio = new Audio();
        audio.src = src;
        audio.volume = this.soundVolume;
        audio.preload = 'auto';
        
        // Handle audio loading errors gracefully
        audio.addEventListener('error', (e) => {
            console.warn(`Failed to load audio: ${src}`, e);
        });
        
        return audio;
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('subwayRunnerSettings') || '{}');
        this.soundEnabled = settings.sound !== false;
        this.musicEnabled = settings.music !== false;
    }
    
    // Sound effect methods
    playSound(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;
        
        try {
            // Clone the audio to allow overlapping sounds
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.soundVolume;
            sound.play().catch(e => {
                console.warn(`Failed to play sound: ${soundName}`, e);
            });
        } catch (e) {
            console.warn(`Error playing sound: ${soundName}`, e);
        }
    }
    
    playCoinSound() {
        this.playSound('coin');
    }
    
    playJumpSound() {
        this.playSound('jump');
    }
    
    playCrashSound() {
        this.playSound('crash');
    }
    
    playPowerUpSound() {
        this.playSound('powerup');
    }
    
    // Background music methods
    playMusic() {
        if (!this.musicEnabled || !this.music) return;
        
        try {
            this.music.currentTime = 0;
            this.music.play().catch(e => {
                console.warn('Failed to play background music', e);
            });
        } catch (e) {
            console.warn('Error playing background music', e);
        }
    }
    
    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }
    
    resumeMusic() {
        if (this.musicEnabled && this.music) {
            this.music.play().catch(e => {
                console.warn('Failed to resume background music', e);
            });
        }
    }
    
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
    
    // Volume control methods
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
    }
    
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.soundVolume;
        });
    }
    
    // Settings methods
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        this.saveSettings();
    }
    
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        this.saveSettings();
        
        if (!enabled) {
            this.stopMusic();
        } else if (window.game && window.game.gameState === 'playing') {
            this.playMusic();
        }
    }
    
    saveSettings() {
        const settings = JSON.parse(localStorage.getItem('subwayRunnerSettings') || '{}');
        settings.sound = this.soundEnabled;
        settings.music = this.musicEnabled;
        localStorage.setItem('subwayRunnerSettings', JSON.stringify(settings));
    }
    
    // Utility methods
    muteAll() {
        this.setSoundEnabled(false);
        this.setMusicEnabled(false);
    }
    
    unmuteAll() {
        this.setSoundEnabled(true);
        this.setMusicEnabled(true);
    }
    
    // Audio context for better mobile support
    initAudioContext() {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            try {
                this.audioContext = new (AudioContext || webkitAudioContext)();
            } catch (e) {
                console.warn('Failed to create AudioContext', e);
            }
        }
    }
    
    // Resume audio context (required for mobile browsers)
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(e => {
                console.warn('Failed to resume AudioContext', e);
            });
        }
    }
    
    // Create placeholder audio files for development
    createPlaceholderAudio() {
        // This function creates simple audio tones for development
        // In a real project, you would use actual audio files
        
        const createTone = (frequency, duration, type = 'sine') => {
            if (!this.audioContext) return null;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
            return oscillator;
        };
        
        // Create placeholder sounds
        this.placeholderSounds = {
            coin: () => createTone(800, 0.1, 'square'),
            jump: () => createTone(400, 0.2, 'sine'),
            crash: () => createTone(200, 0.5, 'sawtooth'),
            powerup: () => createTone(600, 0.3, 'triangle')
        };
    }
    
    // Play placeholder sound (fallback when audio files are not available)
    playPlaceholderSound(soundName) {
        if (!this.soundEnabled || !this.placeholderSounds[soundName]) return;
        
        try {
            this.resumeAudioContext();
            this.placeholderSounds[soundName]();
        } catch (e) {
            console.warn(`Failed to play placeholder sound: ${soundName}`, e);
        }
    }
    
    // Enhanced play sound with fallback
    playSoundWithFallback(soundName) {
        if (!this.soundEnabled) return;
        
        // Try to play the actual sound first
        if (this.sounds[soundName]) {
            try {
                const sound = this.sounds[soundName].cloneNode();
                sound.volume = this.soundVolume;
                sound.play().catch(() => {
                    // Fallback to placeholder sound
                    this.playPlaceholderSound(soundName);
                });
            } catch (e) {
                this.playPlaceholderSound(soundName);
            }
        } else {
            // Use placeholder sound
            this.playPlaceholderSound(soundName);
        }
    }
}

// Initialize AudioManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.AudioManager = new AudioManager();
    
    // Initialize audio context on user interaction
    const initAudio = () => {
        AudioManager.initAudioContext();
        AudioManager.createPlaceholderAudio();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
        document.removeEventListener('keydown', initAudio);
    };
    
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    document.addEventListener('keydown', initAudio);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            AudioManager.pauseMusic();
        } else {
            if (window.game && window.game.gameState === 'playing') {
                AudioManager.resumeMusic();
            }
        }
    });
    
    // Handle audio focus for mobile
    if ('onfocusin' in document) {
        document.addEventListener('focusin', () => {
            AudioManager.resumeAudioContext();
        });
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}