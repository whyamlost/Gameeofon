// main.js
// Screen DOM elements
const homeScreen = document.getElementById('home-screen');
const gameContainer = document.getElementById('game-container');
const gameOverScreen = document.getElementById('game-over');
const playBtn = document.getElementById('play-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const scoreText = document.getElementById('score');
const coinsText = document.getElementById('coins');
const finalScoreText = document.getElementById('final-score');

let phaserGame; // Will hold the Phaser.Game instance

// Helper to switch visible screen
function showScreen(screen) {
  homeScreen.classList.remove('active');
  gameContainer.classList.remove('active');
  gameOverScreen.classList.remove('active');
  screen.classList.add('active');
}

playBtn.addEventListener('click', () => {
  showScreen(gameContainer);
  if (!phaserGame) {
    initGame();
  } else {
    // Restart existing scene if it exists
    phaserGame.scene.keys['GameScene']?.scene.restart();
  }
});

restartBtn.addEventListener('click', () => {
  showScreen(gameContainer);
  phaserGame.scene.keys['GameScene']?.scene.restart();
});

menuBtn.addEventListener('click', () => {
  showScreen(homeScreen);
});

function initGame() {
  const width = 480;
  const height = 640;

  // Phaser configuration
  const config = {
    type: Phaser.AUTO,
    width,
    height,
    parent: 'game-container',
    backgroundColor: 0x222222,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [GameScene],
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
  };

  phaserGame = new Phaser.Game(config);
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // Create simple textures using graphics for placeholder assets
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Track texture
    graphics.fillStyle(0x444444, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.generateTexture('track', 64, 64);
    graphics.clear();

    // Player texture
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 50, 80);
    graphics.generateTexture('player', 50, 80);
    graphics.clear();

    // Obstacle texture
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 50, 80);
    graphics.generateTexture('obstacle', 50, 80);
    graphics.clear();
    graphics.fillStyle(0xffa500, 1);
    graphics.fillRect(0, 0, 50, 40);
    graphics.generateTexture('obstacle_low', 50, 40);
    graphics.clear();

    // Coin texture
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('coin', 32, 32);
    graphics.clear();
  }

  create() {
    // Constants
    this.SPEED_START = 4;
    this.SPEED_INCREMENT = 0.0005; // Speed increases each frame
    this.LANES = [this.game.config.width / 2 - 80, this.game.config.width / 2, this.game.config.width / 2 + 80];
    this.JUMP_HEIGHT = 120;
    this.JUMP_DURATION = 600;
    this.ROLL_DURATION = 500;

    // Score & state
    this.score = 0;
    this.coins = 0;
    this.speed = this.SPEED_START;
    this.isGameOver = false;
    this.isJumping = false;
    this.isRolling = false;

    // Track - tileSprite for endless scroll
    this.track = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'track')
      .setOrigin(0, 0);

    // Player
    this.currentLane = 1; // start center
    this.player = this.physics.add.sprite(this.LANES[this.currentLane], this.game.config.height - 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(1);

    // Groups
    this.obstacles = this.physics.add.group();
    this.coinsGroup = this.physics.add.group();

    // Collisions
    this.physics.add.overlap(this.player, this.coinsGroup, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.obstacles, this.handleObstacleCollision, undefined, this);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Swipe input detection
    this.input.on('pointerdown', (pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
    });
    this.input.on('pointerup', (pointer) => {
      const dx = pointer.x - this.touchStartX;
      const dy = pointer.y - this.touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) {
          this.switchLane(1);
        } else if (dx < -30) {
          this.switchLane(-1);
        }
      } else {
        if (dy < -30) {
          this.jump();
        } else if (dy > 30) {
          this.roll();
        }
      }
    });

    // Timers for obstacle and coin spawning
    this.time.addEvent({ delay: 1000, callback: this.spawnObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 800, callback: this.spawnCoin, callbackScope: this, loop: true });
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // Scroll track
    this.track.tilePositionY += this.speed;

    // Increase speed gradually
    this.speed += this.SPEED_INCREMENT * delta;

    // Move obstacles & coins
    Phaser.Actions.IncY(this.obstacles.getChildren(), this.speed);
    Phaser.Actions.IncY(this.coinsGroup.getChildren(), this.speed);

    // Cleanup off-screen objects
    this.obstacles.getChildren().forEach((obj) => {
      if (obj.y > this.game.config.height + 100) {
        obj.destroy();
      }
    });
    this.coinsGroup.getChildren().forEach((obj) => {
      if (obj.y > this.game.config.height + 100) {
        obj.destroy();
      }
    });

    // Input - arrow keys
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.switchLane(-1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.switchLane(1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.jump();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.roll();
    }

    // Update score
    this.score += delta * 0.01; // Score based on time survived
    scoreText.textContent = Math.floor(this.score);
    coinsText.textContent = this.coins;
  }

  switchLane(dir) {
    this.currentLane = Phaser.Math.Clamp(this.currentLane + dir, 0, 2);
    this.tweens.add({
      targets: this.player,
      x: this.LANES[this.currentLane],
      duration: 100,
      ease: 'Power2',
    });
  }

  spawnObstacle() {
    const lane = Phaser.Math.Between(0, 2);
    const type = Math.random() < 0.5 ? 'low' : 'high';
    const key = type === 'low' ? 'obstacle_low' : 'obstacle';
    const y = type === 'low' ? -30 : -50;
    const obstacle = this.obstacles.create(this.LANES[lane], y, key);
    obstacle.setImmovable(true);
    obstacle.setData('type', type);
  }

  spawnCoin() {
    const lane = Phaser.Math.Between(0, 2);
    const coin = this.coinsGroup.create(this.LANES[lane], -50, 'coin');
    coin.setCircle(16);
  }

  collectCoin(player, coin) {
    coin.destroy();
    this.coins += 1;
  }

  handleObstacleCollision(player, obstacle) {
    const type = obstacle.getData('type') || 'high';
    if ((type === 'low' && this.isJumping) || (type === 'high' && this.isRolling)) {
      return; // Dodged successfully
    }
    this.gameOver();
  }

  jump() {
    if (this.isJumping || this.isRolling) return;
    this.isJumping = true;
    const originalY = this.player.y;
    this.tweens.add({
      targets: this.player,
      y: originalY - this.JUMP_HEIGHT,
      duration: this.JUMP_DURATION / 2,
      ease: 'Quad.easeOut',
      yoyo: true,
      onComplete: () => {
        this.isJumping = false;
        this.player.y = originalY;
      },
    });
  }

  roll() {
    if (this.isRolling || this.isJumping) return;
    this.isRolling = true;
    this.player.setDisplaySize(50, 40);
    this.player.body.setSize(50, 40);
    this.player.y += 20;
    this.time.delayedCall(this.ROLL_DURATION, () => {
      this.player.setDisplaySize(50, 80);
      this.player.body.setSize(50, 80);
      this.player.y -= 20;
      this.isRolling = false;
    });
  }

  gameOver() {
    this.isGameOver = true;

    // Save high score
    const highScore = Number(localStorage.getItem('highScore') || 0);
    if (this.score > highScore) {
      localStorage.setItem('highScore', Math.floor(this.score));
    }

    // Delay to ensure collision sprite visible
    this.time.delayedCall(500, () => {
      finalScoreText.textContent = Math.floor(this.score);
      showScreen(gameOverScreen);
    });
  }
}