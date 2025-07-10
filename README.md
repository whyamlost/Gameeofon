# Subway Runner - Endless Adventure Game

A complete Subway Surfers-style endless runner game built with modern web technologies. Run, jump, roll, and collect coins while avoiding obstacles in this addictive browser-based game!

## 🎮 Features

### Core Gameplay
- **3-Lane Endless Runner**: Navigate through three lanes with smooth controls
- **Character Movement**: Jump, roll, and move left/right to avoid obstacles
- **Progressive Difficulty**: Game speed increases over time for challenging gameplay
- **Multiple Obstacles**: Trains, barricades, and other hazards to avoid
- **Power-ups**: Magnet, Jetpack, and Hoverboard for enhanced gameplay

### Game Elements
- **Score System**: Earn points by surviving and collecting coins
- **Coin Collection**: Collect coins for character unlocks and rewards
- **High Score Tracking**: Local storage saves your best scores
- **Leaderboard**: View your top 10 scores with dates
- **Daily Rewards**: Claim daily coin bonuses

### Characters & Customization
- **Multiple Characters**: Unlock different characters with unique sprites
- **Character Progression**: Earn coins to unlock new characters
- **Character Selection**: Choose your favorite character before each run

### Visual & Audio
- **Modern UI**: Clean, responsive design with smooth animations
- **Particle Effects**: Visual feedback for coin collection and power-ups
- **Background Music**: Immersive audio experience
- **Sound Effects**: Audio feedback for all game actions
- **Responsive Design**: Works on desktop and mobile devices

### Controls
- **Keyboard**: Arrow keys for movement, Space for jump
- **Touch Controls**: Swipe gestures for mobile devices
- **Mouse**: Click buttons for menu navigation

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required!

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start playing immediately!

### Local Development
If you want to run this locally with a web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 🎯 How to Play

### Basic Controls
- **Left/Right Arrow Keys**: Move between lanes
- **Up Arrow Key / Space**: Jump over obstacles
- **Down Arrow Key**: Roll under obstacles
- **Touch/Swipe**: Use touch controls on mobile devices

### Game Objectives
1. **Survive**: Avoid all obstacles to keep running
2. **Collect Coins**: Gather coins for points and character unlocks
3. **Use Power-ups**: Activate power-ups for advantages:
   - **Magnet**: Attracts nearby coins
   - **Jetpack**: Fly above obstacles temporarily
   - **Hoverboard**: Become invincible for a short time
4. **Beat Your High Score**: Try to achieve the highest score possible

### Scoring System
- **Survival Points**: Earn points for each second survived
- **Coin Points**: 10 points per coin collected
- **Distance Bonus**: Points based on distance traveled

## 🛠️ Technical Details

### Technology Stack
- **HTML5**: Game structure and canvas rendering
- **CSS3**: Modern styling with animations and responsive design
- **JavaScript (ES6+)**: Game logic, physics, and interactions
- **Canvas API**: 2D graphics rendering
- **Web Audio API**: Sound effects and music
- **Local Storage**: Save game progress and settings

### Game Architecture
- **Modular Design**: Separated concerns with dedicated classes
- **Game Engine**: Core game loop and physics
- **UI Manager**: Screen transitions and user interface
- **Audio Manager**: Sound effects and music handling
- **Asset Management**: Dynamic sprite generation and loading

### Performance Features
- **60 FPS Gameplay**: Smooth animation using requestAnimationFrame
- **Efficient Rendering**: Optimized canvas drawing
- **Memory Management**: Proper cleanup of game objects
- **Mobile Optimization**: Touch controls and responsive design

## 📱 Mobile Support

The game is fully optimized for mobile devices:
- **Touch Controls**: Intuitive swipe gestures
- **Responsive Design**: Adapts to different screen sizes
- **Mobile Audio**: Handles mobile browser audio restrictions
- **Touch-Friendly UI**: Large buttons and easy navigation

## 🎨 Customization

### Adding New Characters
1. Add character data to the character selection screen
2. Create character sprite in the `createPlayerSprite()` method
3. Update character unlock requirements

### Adding New Obstacles
1. Create obstacle sprite in `createObstacleSprites()`
2. Add obstacle type to spawn logic
3. Update collision detection if needed

### Modifying Game Settings
- **Difficulty**: Adjust speed increase and max speed in game settings
- **Audio**: Modify volume levels and sound effects
- **Visual**: Customize colors, animations, and effects

## 🔧 Configuration

### Game Settings
- **Sound Effects**: Toggle on/off
- **Background Music**: Toggle on/off
- **Difficulty Level**: Easy, Medium, Hard

### Local Storage Keys
- `subwayRunnerHighScore`: Best score achieved
- `subwayRunnerScores`: Leaderboard data
- `subwayRunnerCoins`: Total coins collected
- `subwayRunnerUnlocked`: Unlocked characters
- `subwayRunnerSettings`: Game settings
- `subwayRunnerLastReward`: Daily reward tracking

## 🐛 Troubleshooting

### Common Issues
1. **Audio not working**: Click/tap the screen to initialize audio context
2. **Game not loading**: Check browser console for errors
3. **Touch controls not working**: Ensure you're using a touch-enabled device
4. **Performance issues**: Close other browser tabs to free up memory

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Full support with touch controls

## 🚀 Future Enhancements

### Planned Features
- **Online Leaderboard**: Global score competition
- **More Characters**: Additional unlockable characters
- **Special Events**: Limited-time challenges
- **Achievements**: Unlockable achievements system
- **Power-up Combinations**: Multiple power-up effects
- **Background Themes**: Different visual themes
- **Soundtrack Selection**: Multiple background music options

### Technical Improvements
- **WebGL Rendering**: Enhanced graphics performance
- **Progressive Web App**: Installable as mobile app
- **Offline Support**: Play without internet connection
- **Cloud Saves**: Sync progress across devices

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure you're using a supported browser
4. Try refreshing the page

## 🎉 Credits

- **Game Design**: Inspired by Subway Surfers
- **Graphics**: Canvas-generated sprites and effects
- **Audio**: Web Audio API with placeholder sounds
- **UI/UX**: Modern responsive design patterns

---

**Enjoy playing Subway Runner!** 🏃‍♂️💨