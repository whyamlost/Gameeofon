# 🚇 Subway Surfers - Endless Runner Game

A complete recreation of the popular Subway Surfers endless runner game built with modern web technologies. Experience smooth gameplay, challenging obstacles, power-ups, and an engaging progression system right in your browser!

![Game Preview](https://img.shields.io/badge/Status-Complete-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![Mobile](https://img.shields.io/badge/Mobile-Friendly-blue)

## 🎮 Game Features

### Core Gameplay
- **3-Lane Endless Runner**: Navigate between left, center, and right tracks
- **Smooth Player Movement**: Responsive controls with fluid animations
- **Dynamic Obstacles**: Trains, barriers, tunnels, signs, and moving trains
- **Progressive Difficulty**: Game speed and obstacle complexity increase over time
- **Collision Detection**: Precise hit detection with different obstacle interactions

### Power-ups & Collectibles
- **🪙 Coins**: Collect coins to unlock new characters and boost your score
- **🧲 Magnet**: Attracts nearby coins automatically for easier collection
- **🚀 Jetpack**: Fly above obstacles and collect coins in the air
- **🛹 Hoverboard**: Temporary invincibility with style
- **Coin Patterns**: Various collectible formations (lines, zigzags, circles, hearts)

### Characters & Progression
- **Multiple Characters**: Unlock Jake, Tricky, and Fresh with collected coins
- **Character Costs**: Jake (Free), Tricky (500 coins), Fresh (1000 coins)
- **Persistent Progress**: Your coins and unlocks are saved locally
- **Achievement System**: Unlock achievements for various milestones

### UI & Experience
- **Modern Interface**: Sleek design with smooth animations and gradients
- **Multiple Screens**: Main menu, character selection, leaderboard, settings, pause menu
- **Local Leaderboard**: Track your top 10 high scores
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Audio Feedback**: Sound effects for actions and game events

### Mobile Support
- **Touch Controls**: Swipe left/right/up/down for movement
- **Tap to Jump**: Simple tap gesture for jumping
- **Responsive UI**: Optimized layouts for different screen sizes
- **Mobile Detection**: Automatic touch control display on mobile devices

## 🎯 Game Controls

### Desktop (Keyboard)
- **Arrow Keys** or **WASD**: Move left, right, jump, roll
- **Spacebar**: Jump
- **Escape**: Pause game / Return to main menu
- **Enter**: Start game from main menu
- **R**: Restart game (when game over)
- **F2**: Toggle debug mode

### Mobile (Touch)
- **Swipe Left/Right**: Move between lanes
- **Swipe Up**: Jump over obstacles
- **Swipe Down**: Roll under obstacles
- **Tap**: Jump (alternative to swipe up)

## 🚀 Getting Started

### Quick Start
1. **Clone or Download** this repository
2. **Open `index.html`** in a modern web browser
3. **Click "PLAY"** to start your endless run!

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No additional dependencies or installations required

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd subway-surfers-game

# Serve with a local HTTP server (optional but recommended)
python -m http.server 8000
# OR
npx serve .
# OR
php -S localhost:8000

# Open browser to http://localhost:8000
```

## 📁 Project Structure

```
subway-surfers-game/
├── index.html              # Main HTML file
├── css/
│   ├── style.css          # General styles and layout
│   ├── game.css           # Game-specific styles
│   └── ui.css             # UI components and screens
├── js/
│   ├── utils.js           # Utility functions and helpers
│   ├── player.js          # Player character logic
│   ├── obstacles.js       # Obstacle system and collision
│   ├── powerups.js        # Power-ups and collectibles
│   ├── ui.js              # UI management and screens
│   └── game.js            # Main game engine and loop
├── assets/                # Game assets (placeholder structure)
│   ├── images/
│   ├── sounds/
│   └── sprites/
└── README.md              # This file
```

## 🎨 Game Mechanics

### Obstacle Types
- **🚇 Train**: Cannot be jumped over or rolled under - must avoid
- **🚧 Barrier**: Can be jumped over, blocks rolling
- **🕳️ Tunnel**: Must roll under, cannot be jumped
- **🪧 Sign**: Can be jumped over, blocks rolling
- **🚥 Cone**: Small obstacle that can be jumped over

### Power-up Effects
- **Magnet (🧲)**: 5-second coin attraction radius
- **Jetpack (🚀)**: 5-second flight ability
- **Hoverboard (🛹)**: 5-second invincibility
- **Multiplier (✖️)**: Score multiplier effect

### Scoring System
- **Distance Points**: Continuous scoring based on distance traveled
- **Coin Collection**: 10 points per coin + coins for character unlocks
- **Speed Bonus**: Higher scores at increased game speeds
- **Power-up Bonus**: Additional points for power-up collection

## 🛠️ Technical Features

### Performance Optimizations
- **60 FPS Game Loop**: Smooth animations with requestAnimationFrame
- **Object Pooling**: Efficient memory management for game objects
- **Collision Optimization**: Spatial partitioning for collision detection
- **Mobile Optimization**: Touch event handling with gesture recognition

### Data Persistence
- **Local Storage**: Saves high scores, settings, and character unlocks
- **Progressive Data**: Coins and achievements persist between sessions
- **Settings Sync**: Audio and difficulty preferences saved

### Debug Features
- **Debug Mode**: Press F2 to enable development tools
- **Performance Monitor**: FPS counter and performance metrics
- **Console Commands**: Spawn objects and modify game state
- **Collision Visualization**: Visual debugging for hit detection

## 🎮 Gameplay Tips

### Beginner Tips
1. **Start Simple**: Focus on avoiding obstacles before collecting coins
2. **Learn Patterns**: Each obstacle type has specific avoidance methods
3. **Use Power-ups**: Don't save them - power-ups spawn regularly
4. **Practice Timing**: Jumping and rolling have specific timing windows

### Advanced Strategies
1. **Coin Priority**: Focus on coin patterns for character unlocks
2. **Power-up Chaining**: Combine magnet with coin collections for maximum effect
3. **Speed Management**: Higher speeds = higher scores but more difficulty
4. **Pattern Recognition**: Learn common obstacle combinations

## 🔧 Development

### Adding New Features
The game is built with a modular architecture that makes it easy to extend:

- **New Obstacles**: Add to `obstacles.js` with custom properties
- **New Power-ups**: Extend `powerups.js` with new effects
- **New Characters**: Add to character data in `ui.js`
- **New Screens**: Create new screen components in HTML/CSS

### Debug Commands
When debug mode is enabled (F2), you can use these console commands:
```javascript
gameStats()              // Get current game statistics
setSpeed(5)              // Set game speed (0-16)
spawnObstacle('train')   // Spawn specific obstacle type
spawnPowerUp('magnet')   // Spawn specific power-up type
```

### Browser Compatibility
- **Chrome/Chromium**: Full support with optimal performance
- **Firefox**: Full support with good performance
- **Safari**: Full support (may need vendor prefixes for some CSS)
- **Edge**: Full support with good performance
- **Mobile Browsers**: Touch controls work on all modern mobile browsers

## 📱 Mobile Optimization

The game includes comprehensive mobile support:
- **Responsive Layout**: UI adapts to screen size and orientation
- **Touch Gestures**: Intuitive swipe and tap controls
- **Performance**: Optimized rendering for mobile GPUs
- **Battery Life**: Efficient game loop with frame rate management

## 🎵 Audio System

The game includes a custom Web Audio API implementation:
- **Sound Effects**: Jump, coin collect, power-up, and game over sounds
- **Audio Settings**: Toggle sound effects and music in settings
- **Web Audio**: Pure JavaScript audio generation (no external files needed)
- **Cross-Platform**: Works consistently across all browsers

## 🌟 Future Enhancements

Potential improvements and features that could be added:
- **Daily Challenges**: Special objectives with rewards
- **More Characters**: Additional unlockable characters with unique abilities
- **Seasonal Themes**: Holiday-specific visual themes and obstacles
- **Multiplayer**: Real-time competition with other players
- **Power-up Upgrades**: Enhance power-up duration and effects
- **World Themes**: Different visual environments (city, forest, space)

## 📄 License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute as needed.

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, new features, or improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:
- Check the browser console for error messages
- Ensure JavaScript is enabled
- Try refreshing the page
- Test in a different browser
- Clear browser cache and localStorage if needed

---

**Enjoy the endless run! 🏃‍♂️💨**

Made with ❤️ using HTML5 Canvas, JavaScript ES6+, and modern web technologies.