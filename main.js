// main.js
// Screen DOM elements
const homeScreen = document.getElementById('home-screen');
const gameContainer = document.getElementById('game-container');
const gameOverScreen = document.getElementById('game-over');
const charactersScreen = document.getElementById('characters-screen');
const skinsContainer = document.getElementById('skins-container');
const totalCoinsSpan = document.getElementById('total-coins');

const playBtn = document.getElementById('play-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const charactersBtn = document.getElementById('characters-btn');
const charBackBtn = document.getElementById('char-back-btn');
const scoreText = document.getElementById('score');
const coinsText = document.getElementById('coins');
const finalScoreText = document.getElementById('final-score');

let phaserGame; // Will hold the Phaser.Game instance

// Helper to switch visible screen
function showScreen(screen) {
  homeScreen.classList.remove('active');
  gameContainer.classList.remove('active');
  gameOverScreen.classList.remove('active');
  charactersScreen.classList.remove('active');
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

charactersBtn.addEventListener('click', () => {
  buildCharacterScreen();
  showScreen(charactersScreen);
});

charBackBtn.addEventListener('click', () => {
  showScreen(homeScreen);
});

function getTotalCoins() {
  return Number(localStorage.getItem('totalCoins') || 0);
}

function addCoins(amount) {
  const total = getTotalCoins() + amount;
  localStorage.setItem('totalCoins', total);
}

function getUnlockedSkins() {
  const raw = localStorage.getItem('unlockedSkins');
  if (raw) return JSON.parse(raw);
  // Ensure default skin unlocked
  const defaultArr = ['green'];
  localStorage.setItem('unlockedSkins', JSON.stringify(defaultArr));
  return defaultArr;
}

function saveUnlockedSkins(arr) {
  localStorage.setItem('unlockedSkins', JSON.stringify(arr));
}

function getSelectedSkin() {
  return localStorage.getItem('selectedSkin') || 'green';
}

function setSelectedSkin(key) {
  localStorage.setItem('selectedSkin', key);
}

function buildCharacterScreen() {
  skinsContainer.innerHTML = '';
  const unlocked = getUnlockedSkins();
  const totalCoins = getTotalCoins();
  totalCoinsSpan.textContent = totalCoins;

  SKINS.forEach((skin) => {
    const card = document.createElement('div');
    card.className = 'skin-card';

    const sample = document.createElement('div');
    sample.className = 'skin-sample';
    sample.style.background = `#${Phaser.Display.Color.IntegerToColor(skin.color).color.toString(16).padStart(6, '0')}`;
    card.appendChild(sample);

    const label = document.createElement('div');
    label.textContent = skin.key.toUpperCase();
    card.appendChild(label);

    const btn = document.createElement('button');
    btn.className = 'btn small';

    const selectedSkin = getSelectedSkin();
    if (unlocked.includes(skin.key)) {
      if (skin.key === selectedSkin) {
        btn.textContent = 'Selected';
        btn.disabled = true;
      } else {
        btn.textContent = 'Select';
        btn.addEventListener('click', () => {
          setSelectedSkin(skin.key);
          buildCharacterScreen();
        });
      }
    } else {
      btn.textContent = `Unlock (${skin.cost})`;
      btn.disabled = totalCoins < skin.cost;
      btn.addEventListener('click', () => {
        const currentCoins = getTotalCoins();
        if (currentCoins >= skin.cost) {
          addCoins(-skin.cost);
          const newUnlocked = [...unlocked, skin.key];
          saveUnlockedSkins(newUnlocked);
          setSelectedSkin(skin.key);
          buildCharacterScreen();
        }
      });
    }

    card.appendChild(btn);
    skinsContainer.appendChild(card);
  });
}

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

    // Parallax background textures
    // Far skyline (darker)
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0x262626, 1);
    graphics.fillRect(10, 32, 12, 32);
    graphics.fillRect(30, 20, 16, 44);
    graphics.fillRect(50, 40, 10, 24);
    graphics.generateTexture('bg_far', 64, 64);
    graphics.clear();

    // Mid skyline (slightly lighter)
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0x3a3a3a, 1);
    graphics.fillRect(5, 28, 14, 36);
    graphics.fillRect(25, 40, 20, 24);
    graphics.fillRect(50, 26, 12, 38);
    graphics.generateTexture('bg_mid', 64, 64);
    graphics.clear();

    // Player texture generation (skins)
    SKINS.forEach((s) => {
      graphics.fillStyle(s.color, 1);
      graphics.fillRect(0, 0, 50, 80);
      graphics.generateTexture(`player_${s.key}`, 50, 80);
      graphics.clear();
    });

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

    // Power-up textures (placeholder visuals)
    graphics.fillStyle(0x00bcd4, 1); // Cyan circle – Magnet
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('power_magnet', 32, 32);
    graphics.clear();

    graphics.fillStyle(0x9c27b0, 1); // Purple rectangle – Jetpack
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('power_jetpack', 32, 32);
    graphics.clear();

    graphics.fillStyle(0xff4081, 1); // Pink ellipse – Hoverboard
    graphics.fillEllipse(16, 16, 32, 16);
    graphics.generateTexture('power_hover', 32, 32);
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
    this.POWERUP_DURATIONS = { magnet: 7000, jetpack: 5000, hoverboard: 8000 };
    this.MAGNET_RADIUS = 150;

    // Score & state
    this.score = 0;
    this.coins = 0;
    this.speed = this.SPEED_START;
    this.isGameOver = false;
    this.isJumping = false;
    this.isRolling = false;

    // Power-up state flags
    this.hasMagnet = false;
    this.isJetpack = false;
    this.isHoverboard = false;

    // HUD power-up indicator
    this.powerupText = this.add.text(this.game.config.width - 10, 10, '', {
      fontSize: '18px',
      color: '#fff',
    }).setOrigin(1, 0).setDepth(2);

    // Track - tileSprite for endless scroll
    this.bgFar = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'bg_far')
      .setOrigin(0, 0).setDepth(-3);
    this.bgMid = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'bg_mid')
      .setOrigin(0, 0).setDepth(-2);

    this.track = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'track')
      .setOrigin(0, 0).setDepth(-1);

    // Player
    this.currentLane = 1; // start center
    this.skin = getSelectedSkin();
    this.player = this.physics.add.sprite(this.LANES[this.currentLane], this.game.config.height - 100, `player_${this.skin}`);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(1);

    // Groups
    this.obstacles = this.physics.add.group();
    this.coinsGroup = this.physics.add.group();
    this.powerupsGroup = this.physics.add.group();

    // Collisions
    this.physics.add.overlap(this.player, this.coinsGroup, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.obstacles, this.handleObstacleCollision, undefined, this);
    this.physics.add.overlap(this.player, this.powerupsGroup, this.collectPowerup, undefined, this);

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
    this.time.addEvent({ delay: 6000, callback: this.spawnPowerup, callbackScope: this, loop: true });
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // Scroll track
    this.bgFar.tilePositionY += this.speed * 0.2;
    this.bgMid.tilePositionY += this.speed * 0.5;
    this.track.tilePositionY += this.speed;

    // Increase speed gradually
    this.speed += this.SPEED_INCREMENT * delta;

    // Move obstacles & coins
    Phaser.Actions.IncY(this.obstacles.getChildren(), this.speed);
    Phaser.Actions.IncY(this.coinsGroup.getChildren(), this.speed);
    Phaser.Actions.IncY(this.powerupsGroup.getChildren(), this.speed);

    // Magnet effect – attract nearby coins
    if (this.hasMagnet) {
      this.coinsGroup.getChildren().forEach((coin) => {
        const dist = Phaser.Math.Distance.Between(coin.x, coin.y, this.player.x, this.player.y);
        if (dist < this.MAGNET_RADIUS) {
          // Lerp coin towards player
          coin.x = Phaser.Math.Linear(coin.x, this.player.x, 0.08);
          coin.y = Phaser.Math.Linear(coin.y, this.player.y, 0.08);
        }
      });
    }

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
    this.powerupsGroup.getChildren().forEach((obj) => {
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

    // Update power-up HUD text with remaining time
    this.updatePowerupHUD();
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

  spawnPowerup() {
    const lane = Phaser.Math.Between(0, 2);
    const kinds = ['magnet', 'jetpack', 'hoverboard'];
    const kind = Phaser.Utils.Array.GetRandom(kinds);
    const key = {
      magnet: 'power_magnet',
      jetpack: 'power_jetpack',
      hoverboard: 'power_hover',
    }[kind];
    const power = this.powerupsGroup.create(this.LANES[lane], -40, key);
    power.setData('kind', kind);
  }

  collectCoin(player, coin) {
    coin.destroy();
    this.coins += 1;
    addCoins(1);
  }

  collectPowerup(player, power) {
    const kind = power.getData('kind');
    power.destroy();
    this.activatePowerup(kind);
  }

  activatePowerup(kind) {
    switch (kind) {
      case 'magnet':
        this.hasMagnet = true;
        this.time.delayedCall(this.POWERUP_DURATIONS.magnet, () => {
          this.hasMagnet = false;
        });
        break;
      case 'jetpack':
        if (this.isJetpack) return; // Prevent stacking
        this.isJetpack = true;
        const originalY = this.player.y;
        // Fly up
        this.tweens.add({
          targets: this.player,
          y: 200,
          duration: 300,
          ease: 'Quad.easeOut',
        });
        this.time.delayedCall(this.POWERUP_DURATIONS.jetpack, () => {
          // Return to ground
          this.tweens.add({
            targets: this.player,
            y: originalY,
            duration: 300,
            ease: 'Quad.easeIn',
            onComplete: () => {
              this.isJetpack = false;
            },
          });
        });
        break;
      case 'hoverboard':
        if (this.isHoverboard) return;
        this.isHoverboard = true;
        // Visual: tint player
        this.player.setTint(0x00e676);
        this.time.delayedCall(this.POWERUP_DURATIONS.hoverboard, () => {
          this.isHoverboard = false;
          this.player.clearTint();
        });
        break;
    }
  }

  handleObstacleCollision(player, obstacle) {
    if ((this.isJetpack || this.isHoverboard)) {
      return; // Completely invincible
    }
    const type = obstacle.getData('type') || 'high';
    if ((type === 'low' && this.isJumping) || (type === 'high' && this.isRolling)) {
      return; // Dodged
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
    if (this.isJetpack) return; // cannot roll mid-air
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

  updatePowerupHUD() {
    const active = [];
    if (this.hasMagnet) active.push('Magnet');
    if (this.isJetpack) active.push('Jetpack');
    if (this.isHoverboard) active.push('Hover');
    this.powerupText.setText(active.join(' | '));
  }
}