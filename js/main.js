/**
 * ASCII Shmup Revival - Main Game Loop
 * Canvas-based implementation
 */

// ============================================================================
// AUDIO MANAGER (Web Audio API)
// ============================================================================

class AudioManager {
  constructor() {
    // Create audio context (handles browser prefixes)
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.enabled = true;
    this.initialized = false;

    // Volume settings from GDB
    this.volumes = {
      master: 0.7,
      music: 0.4,
      sfx: 0.8
    };
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  init() {
    if (this.initialized) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Create gain nodes for volume control
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volumes.master;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.volumes.sfx;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.volumes.music;
      this.musicGain.connect(this.masterGain);

      this.initialized = true;
      console.log('Audio system initialized');
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  /**
   * Play a synthesized laser sound (placeholder)
   */
  playLaserSound(frequency = 800, duration = 0.1) {
    if (!this.enabled || !this.initialized) return;

    const now = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, now + duration);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * Play a synthesized explosion sound (placeholder)
   */
  playExplosionSound(large = false) {
    if (!this.enabled || !this.initialized) return;

    const now = this.ctx.currentTime;
    const duration = large ? 0.5 : 0.3;

    // Use white noise for explosion effect
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(large ? 200 : 400, now);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(large ? 0.5 : 0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  /**
   * Play a synthesized hit/impact sound (placeholder)
   */
  playHitSound() {
    if (!this.enabled || !this.initialized) return;

    const now = this.ctx.currentTime;
    const duration = 0.1;
    const oscillator = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + duration);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * Play weapon switch sound
   */
  playWeaponSwitchSound() {
    if (!this.enabled || !this.initialized) return;

    const now = this.ctx.currentTime;
    const duration = 0.15;
    const oscillator = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + duration);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.volumes.master = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volumes.master;
    }
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterGain.gain.value > 0 ? 0 : this.volumes.master;
    }
  }
}

// ============================================================================
// ASSET LOADER
// ============================================================================

class AssetLoader {
  constructor() {
    this.assets = {};
    this.loadedCount = 0;
    this.totalCount = 0;
  }

  /**
   * Load a JSON asset from a URL
   * @param {string} name - Asset identifier
   * @param {string} url - Path to JSON file
   * @returns {Promise}
   */
  async loadAsset(name, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.statusText}`);
      }
      const data = await response.json();
      this.assets[name] = data;
      this.loadedCount++;
      console.log(`Loaded asset: ${name}`);
      return data;
    } catch (error) {
      console.warn(`Could not load asset ${name} from ${url}:`, error.message);
      // Return null if asset doesn't exist yet
      return null;
    }
  }

  /**
   * Load multiple assets
   * @param {Object} assetMap - Object mapping asset names to URLs
   * @returns {Promise}
   */
  async loadAssets(assetMap) {
    this.totalCount = Object.keys(assetMap).length;
    const promises = Object.entries(assetMap).map(([name, url]) =>
      this.loadAsset(name, url)
    );
    await Promise.all(promises);
    return this.assets;
  }

  /**
   * Get a loaded asset by name
   * @param {string} name - Asset identifier
   * @returns {Object|null}
   */
  getAsset(name) {
    return this.assets[name] || null;
  }

  /**
   * Check if all assets are loaded
   * @returns {boolean}
   */
  isReady() {
    return this.loadedCount === this.totalCount;
  }

  /**
   * Get loading progress
   * @returns {number} Progress from 0 to 1
   */
  getProgress() {
    return this.totalCount === 0 ? 1 : this.loadedCount / this.totalCount;
  }
}

// ============================================================================
// GAME CONFIGURATION (from Game Development Bible)
// ============================================================================

const CONFIG = {
  canvas: {
    minWidth: 800,
    minHeight: 600,
    width: 800,  // Will be updated dynamically
    height: 600, // Will be updated dynamically
    backgroundColor: '#4682B4' // Steel blue
  },
  targetFPS: 60,
  font: {
    family: 'Courier New, monospace',
    size: 16,
    weight: 'bold'
  },
  player: {
    speed: 250, // pixels per second
    bounds: {
      // These will be calculated dynamically based on canvas size
      top: 50,
      bottom: 550,
      left: 20,
      right: 780
    }
  },
  background: {
    skyGradientTop: '#87CEEB',    // Light sky blue
    skyGradientBottom: '#4682B4',  // Steel blue
    cloudSpawnInterval: 2000,      // milliseconds
    cloudSpawnVariance: 1000       // random variance
  }
};

// ============================================================================
// GAME STATE
// ============================================================================

const game = {
  canvas: null,
  ctx: null,
  running: false,
  lastTime: 0,
  deltaTime: 0,
  entities: [],
  player: null,
  projectiles: [],
  enemies: [],
  effects: [],
  particles: [],
  clouds: [],
  background: null,
  score: 0,
  enemySpawnTimer: 0,
  enemySpawnInterval: 2000, // milliseconds between enemy spawns
  cloudSpawnTimer: 0,
  assetLoader: null,
  assetsLoaded: false,
  audioManager: null
};

// ============================================================================
// ASCII RENDERING UTILITY
// ============================================================================

class ASCIIRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.setFont();
  }

  setFont(size = CONFIG.font.size, family = CONFIG.font.family, weight = CONFIG.font.weight) {
    this.ctx.font = `${weight} ${size}px ${family}`;
    this.ctx.textBaseline = 'top';
  }

  /**
   * Render ASCII text at a specific position
   * @param {string} text - The text to render
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} color - Fill color
   */
  drawText(text, x, y, color = '#ffffff') {
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
  }

  /**
   * Render ASCII text centered at a specific position
   * @param {string} text - The text to render
   * @param {number} x - X position (center)
   * @param {number} y - Y position (top)
   * @param {string} color - Fill color
   */
  drawTextCentered(text, x, y, color = '#ffffff') {
    const metrics = this.ctx.measureText(text);
    const textX = x - (metrics.width / 2);
    this.drawText(text, textX, y, color);
  }

  /**
   * Render multi-line ASCII art
   * @param {string[]} lines - Array of text lines
   * @param {number} x - X position (center)
   * @param {number} y - Y position (top)
   * @param {string} color - Fill color
   */
  drawMultiLine(lines, x, y, color = '#ffffff') {
    const lineHeight = CONFIG.font.size;
    lines.forEach((line, index) => {
      // Center each line
      const metrics = this.ctx.measureText(line);
      const lineX = x - (metrics.width / 2);
      const lineY = y + (index * lineHeight);
      this.drawText(line, lineX, lineY, color);
    });
  }

  /**
   * Measure text width
   * @param {string} text
   * @returns {number}
   */
  measureWidth(text) {
    return this.ctx.measureText(text).width;
  }
}

// ============================================================================
// BASE ENTITY CLASS
// ============================================================================

class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.active = true;
    this.type = 'entity';
    this.hitboxRadius = 0;
  }

  update(deltaTime) {
    // Override in subclasses
  }

  render(renderer) {
    // Override in subclasses
  }

  destroy() {
    this.active = false;
  }

  // Circular collision detection
  collidesWith(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.hitboxRadius + other.hitboxRadius);
  }
}

// ============================================================================
// PROJECTILE CLASS
// ============================================================================

class Projectile extends Entity {
  constructor(x, y, config) {
    super(x, y);
    this.type = 'projectile';
    this.vx = config.vx || 0;
    this.vy = config.vy || -config.speed; // Default upward
    this.char = config.char || '!';
    this.color = config.color || '#ffffff';
    this.damage = config.damage || 10;
    this.hitboxRadius = config.hitboxRadius || 3;
    this.owner = config.owner || 'player'; // 'player' or 'enemy'
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Destroy if off screen
    if (this.y < -50 || this.y > CONFIG.canvas.height + 50 ||
        this.x < -50 || this.x > CONFIG.canvas.width + 50) {
      this.destroy();
    }
  }

  render(renderer) {
    renderer.drawTextCentered(this.char, this.x, this.y, this.color);
  }
}

// ============================================================================
// WEAPON SYSTEMS
// ============================================================================

class Weapon {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.fireRate = config.fireRate; // milliseconds between shots
    this.lastFireTime = 0;
    this.config = config;
  }

  canFire(currentTime) {
    return (currentTime - this.lastFireTime) >= this.fireRate;
  }

  fire(x, y, currentTime) {
    if (!this.canFire(currentTime)) return [];
    this.lastFireTime = currentTime;
    return this.createProjectiles(x, y);
  }

  createProjectiles(x, y) {
    // Override in subclasses
    return [];
  }
}

class SniperLaser extends Weapon {
  constructor() {
    super({
      id: 'sniper',
      name: 'Sniper Laser',
      fireRate: 350,
      projectileChar: '!',
      projectileColor: '#00ff00',
      projectileSpeed: 1600,
      damage: 15,
      hitboxRadius: 3
    });
  }

  createProjectiles(x, y) {
    // Add muzzle flash
    game.effects.push(createMuzzleFlash(x, y, this.config.projectileColor));

    // Play laser sound
    if (game.audioManager) {
      game.audioManager.playLaserSound(800, 0.08);
    }

    return [new Projectile(x, y - 10, {
      speed: this.config.projectileSpeed,
      char: this.config.projectileChar,
      color: this.config.projectileColor,
      damage: this.config.damage,
      hitboxRadius: this.config.hitboxRadius,
      owner: 'player'
    })];
  }
}

class VulcanCannon extends Weapon {
  constructor() {
    super({
      id: 'vulcan',
      name: 'Vulcan 50cal',
      fireRate: 80,
      projectileChar: '"',
      projectileColor: '#0099ff',
      projectileSpeed: 900,
      damage: 5,
      hitboxRadius: 2,
      spread: 5
    });
  }

  createProjectiles(x, y) {
    // Add muzzle flash
    game.effects.push(createMuzzleFlash(x, y, this.config.projectileColor));

    // Play vulcan sound (higher pitch, shorter)
    if (game.audioManager) {
      game.audioManager.playLaserSound(1200, 0.05);
    }

    // Random horizontal spread
    const spreadOffset = (Math.random() - 0.5) * this.config.spread * 2;
    return [new Projectile(x + spreadOffset, y - 10, {
      speed: this.config.projectileSpeed,
      char: this.config.projectileChar,
      color: this.config.projectileColor,
      damage: this.config.damage,
      hitboxRadius: this.config.hitboxRadius,
      owner: 'player'
    })];
  }
}

class RocketLauncher extends Weapon {
  constructor() {
    super({
      id: 'rocket',
      name: 'Homing Rockets',
      fireRate: 500,
      projectileSpeed: 400,
      damage: 50,
      hitboxRadius: 5
    });
    this.ammo = 10;
    this.maxAmmo = 10;
  }

  canFire(currentTime) {
    return super.canFire(currentTime) && this.ammo > 0;
  }

  fire(x, y, currentTime) {
    const projectiles = super.fire(x, y, currentTime);
    if (projectiles.length > 0) {
      this.ammo--;
    }
    return projectiles;
  }

  createProjectiles(x, y) {
    // Add rocket launch flash
    game.effects.push(createMuzzleFlash(x, y, '#ff6600'));

    return [new Rocket(x, y - 10, {
      speed: this.config.projectileSpeed,
      damage: this.config.damage,
      hitboxRadius: this.config.hitboxRadius,
      owner: 'player'
    })];
  }
}

class Rocket extends Projectile {
  constructor(x, y, config) {
    super(x, y, {
      ...config,
      speed: config.speed,
      char: '^',
      color: '#ffaa00'
    });
    this.type = 'rocket';
    this.homingStrength = 0.3;
    this.acceleration = 100;
    this.age = 0;
    this.homingActivation = 0.2; // seconds before homing starts
  }

  update(deltaTime) {
    this.age += deltaTime;

    // Apply acceleration
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const newSpeed = currentSpeed + this.acceleration * deltaTime;

    // Homing behavior after activation delay
    if (this.age >= this.homingActivation && game.enemies.length > 0) {
      // Find nearest enemy
      let nearestEnemy = null;
      let nearestDist = Infinity;

      game.enemies.forEach(enemy => {
        if (enemy.active) {
          const dx = enemy.x - this.x;
          const dy = enemy.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestEnemy = enemy;
          }
        }
      });

      if (nearestEnemy) {
        // Calculate direction to enemy
        const dx = nearestEnemy.x - this.x;
        const dy = nearestEnemy.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          // Blend current direction with target direction
          const targetVx = (dx / dist) * newSpeed;
          const targetVy = (dy / dist) * newSpeed;

          this.vx += (targetVx - this.vx) * this.homingStrength;
          this.vy += (targetVy - this.vy) * this.homingStrength;
        }
      }
    } else {
      // Just accelerate in current direction
      if (currentSpeed > 0) {
        this.vx = (this.vx / currentSpeed) * newSpeed;
        this.vy = (this.vy / currentSpeed) * newSpeed;
      }
    }

    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Destroy if off screen
    if (this.y < -50 || this.y > CONFIG.canvas.height + 50 ||
        this.x < -50 || this.x > CONFIG.canvas.width + 50) {
      this.destroy();
    }
  }

  render(renderer) {
    // Render rocket body (centered)
    renderer.drawTextCentered('^', this.x, this.y, this.color);
    renderer.drawTextCentered('*', this.x, this.y + CONFIG.font.size, '#ff6600');
  }
}

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

class Particle extends Entity {
  constructor(x, y, config) {
    super(x, y);
    this.type = 'particle';
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.char = config.char || '·';
    this.color = config.color || '#ffffff';
    this.lifetime = config.lifetime || 400; // milliseconds
    this.age = 0;
    this.fadeToColor = config.fadeToColor || null;
    this.initialColor = this.color;
  }

  update(deltaTime) {
    this.age += deltaTime * 1000;

    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Fade color if specified
    if (this.fadeToColor) {
      const progress = Math.min(this.age / this.lifetime, 1);
      this.color = this.interpolateColor(this.initialColor, this.fadeToColor, progress);
    }

    // Destroy when lifetime expires
    if (this.age >= this.lifetime) {
      this.destroy();
    }
  }

  interpolateColor(color1, color2, progress) {
    // Simple hex color interpolation
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;

    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);

    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  render(renderer) {
    renderer.drawTextCentered(this.char, this.x, this.y, this.color);
  }
}

// ============================================================================
// VISUAL EFFECTS
// ============================================================================

class Effect extends Entity {
  constructor(x, y, config) {
    super(x, y);
    this.type = 'effect';
    this.frames = config.frames || [];
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.particles = [];
    this.particleConfig = config.particles || null;
    this.particlesSpawned = false;
  }

  update(deltaTime) {
    if (this.currentFrame >= this.frames.length) {
      this.destroy();
      return;
    }

    this.frameTimer += deltaTime * 1000;

    const frame = this.frames[this.currentFrame];
    if (this.frameTimer >= frame.duration) {
      this.currentFrame++;
      this.frameTimer = 0;

      // Spawn particles on first frame
      if (this.currentFrame === 1 && !this.particlesSpawned && this.particleConfig) {
        this.spawnParticles();
        this.particlesSpawned = true;
      }
    }
  }

  spawnParticles() {
    if (!this.particleConfig) return;

    const count = this.particleConfig.count || 8;
    const speed = this.particleConfig.speed || 100;
    const char = this.particleConfig.char || '·';
    const initialColor = this.particleConfig.initialColor || '#ffffff';
    const fadeToColor = this.particleConfig.fadeToColor || null;
    const lifetime = this.particleConfig.lifetime || 400;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const particle = new Particle(this.x, this.y, {
        vx,
        vy,
        char,
        color: initialColor,
        fadeToColor,
        lifetime
      });

      game.particles.push(particle);
    }
  }

  render(renderer) {
    if (this.currentFrame >= this.frames.length) return;

    const frame = this.frames[this.currentFrame];
    renderer.drawTextCentered(frame.char, this.x, this.y, frame.color);
  }
}

// ============================================================================
// EFFECT FACTORIES
// ============================================================================

function createSmallExplosion(x, y) {
  // Play explosion sound
  if (game.audioManager) {
    game.audioManager.playExplosionSound(false);
  }

  return new Effect(x, y, {
    frames: [
      { char: '*', color: '#ffffff', duration: 50 },
      { char: '@', color: '#ffff00', duration: 50 },
      { char: '#', color: '#ff6600', duration: 60 },
      { char: '%', color: '#ff3300', duration: 60 },
      { char: '+', color: '#ff0000', duration: 70 },
      { char: '·', color: '#660000', duration: 80 }
    ],
    particles: {
      count: 8,
      char: '·',
      initialColor: '#ffff00',
      fadeToColor: '#660000',
      speed: 100,
      lifetime: 400
    }
  });
}

function createLargeExplosion(x, y) {
  // Play large explosion sound
  if (game.audioManager) {
    game.audioManager.playExplosionSound(true);
  }

  return new Effect(x, y, {
    frames: [
      { char: '█', color: '#ffffff', duration: 60 },
      { char: '@', color: '#ffff00', duration: 60 },
      { char: '#', color: '#ff6600', duration: 70 },
      { char: '%', color: '#ff3300', duration: 70 },
      { char: '+', color: '#ff0000', duration: 80 },
      { char: '·', color: '#660000', duration: 100 }
    ],
    particles: {
      count: 20,
      char: '*',
      initialColor: '#ffffff',
      fadeToColor: '#330000',
      speed: 150,
      lifetime: 600
    }
  });
}

function createImpactEffect(x, y) {
  // Play hit sound
  if (game.audioManager) {
    game.audioManager.playHitSound();
  }

  return new Effect(x, y, {
    frames: [
      { char: '*', color: '#ffffff', duration: 40 },
      { char: '·', color: '#ffff00', duration: 40 }
    ],
    particles: {
      count: 3,
      char: '·',
      initialColor: '#ffffff',
      fadeToColor: '#ffff00',
      speed: 80,
      lifetime: 200
    }
  });
}

function createMuzzleFlash(x, y, color = '#00ff00') {
  return new Effect(x, y - 5, {
    frames: [
      { char: '*', color: color, duration: 30 },
      { char: '·', color: color, duration: 20 }
    ]
  });
}

// ============================================================================
// BACKGROUND SYSTEM
// ============================================================================

class Background {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.createGradient();

    // Ground layer parameters
    this.groundY = 550;
    this.groundScrollOffset = 0;
    this.groundScrollSpeed = 80; // pixels per second
  }

  createGradient() {
    this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    this.gradient.addColorStop(0, CONFIG.background.skyGradientTop);
    this.gradient.addColorStop(1, CONFIG.background.skyGradientBottom);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.createGradient();
    // Update ground Y position for larger screens
    this.groundY = Math.min(550, height - 50);
  }

  update(deltaTime) {
    // Scroll ground layer
    this.groundScrollOffset += this.groundScrollSpeed * deltaTime;
    // Reset offset to prevent overflow
    if (this.groundScrollOffset > 100) {
      this.groundScrollOffset = 0;
    }
  }

  render() {
    // Render sky gradient
    this.ctx.fillStyle = this.gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render ground layer (distant green pastures)
    this.renderGroundLayer();
  }

  renderGroundLayer() {
    const y = this.groundY + this.groundScrollOffset;
    const pattern = '═≡-';
    const spacing = 20; // pixels between pattern elements

    // Draw multiple lines of ground pattern with slight parallax
    for (let lineOffset = 0; lineOffset < 3; lineOffset++) {
      const lineY = y + (lineOffset * 10);

      // Skip if below screen
      if (lineY > this.height) continue;

      // Alternate colors for depth
      const color = lineOffset === 0 ? '#228b22' : '#32cd32';
      this.ctx.fillStyle = color;
      this.ctx.font = 'bold 16px Courier New, monospace';

      // Draw repeating pattern across the width
      for (let x = -spacing; x < this.width + spacing; x += spacing) {
        const offsetX = x + (this.groundScrollOffset * (1 + lineOffset * 0.1)) % spacing;
        const char = pattern[Math.floor((x / spacing) + lineOffset) % pattern.length];
        this.ctx.fillText(char, offsetX, lineY);
      }
    }
  }
}

class Cloud extends Entity {
  constructor(x, y, config) {
    super(x, y);
    this.type = 'cloud';
    this.art = config.art;
    this.color = config.color;
    this.speed = config.speed; // Downward scroll speed
    this.layer = config.layer; // 'far' or 'near'
  }

  update(deltaTime) {
    // Clouds scroll downward
    this.y += this.speed * deltaTime;

    // Destroy if off screen
    if (this.y > CONFIG.canvas.height + 100) {
      this.destroy();
    }
  }

  render(renderer) {
    if (Array.isArray(this.art)) {
      renderer.drawMultiLine(this.art, this.x, this.y, this.color);
    } else {
      renderer.drawTextCentered(this.art, this.x, this.y, this.color);
    }
  }
}

// ============================================================================
// CLOUD FACTORIES
// ============================================================================

function createFarCloud() {
  const types = [
    {
      art: [
        '       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       ',
        '     ░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░     ',
        '   ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░   ',
        '  ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░  ',
        ' ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░ ',
        '░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░'
      ],
      chance: 0.25 // Large
    },
    {
      art: [
        '     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     ',
        '   ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░   ',
        '  ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░  ',
        ' ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░ ',
        '░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░'
      ],
      chance: 0.35 // Medium
    },
    {
      art: [
        '   ░░░░░░░░░░░░░░░░░░░░░░   ',
        '  ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░  ',
        ' ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░ ',
        '░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░'
      ],
      chance: 0.4 // Small
    }
  ];

  // Weighted random selection
  const rand = Math.random();
  let cumulative = 0;
  let selectedType = types[0];

  for (const type of types) {
    cumulative += type.chance;
    if (rand <= cumulative) {
      selectedType = type;
      break;
    }
  }

  const x = Math.random() * CONFIG.canvas.width;
  const y = -50;

  return new Cloud(x, y, {
    art: selectedType.art,
    color: '#f0f8ff', // Alice blue
    speed: 20,
    layer: 'far'
  });
}

function createNearCloud() {
  const types = [
    {
      art: [
        '           ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░           ',
        '        ░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░        ',
        '      ░░▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒░░      ',
        '    ░░▒▒▓▓▓████████████████████████████████████████████████████████▓▓▓▒▒░░    ',
        '   ░▒▒▓▓███████████████████████████████████████████████████████████████▓▓▒▒░   ',
        '  ░▒▓▓████████████████████████████████████████████████████████████████████▓▓▒░  ',
        ' ░▒▓▓██████████████████████████████████████████████████████████████████████▓▓▒░ ',
        '░▒▓███████████████████████████████████████████████████████████████████████████▓▒░',
        '░▒▓███████████████████████████████████████████████████████████████████████████▓▒░',
        '░▒▓███████████████████████████████████████████████████████████████████████████▓▒░',
        ' ░▒▓▓██████████████████████████████████████████████████████████████████████▓▓▒░ ',
        '  ░▒▓▓████████████████████████████████████████████████████████████████████▓▓▒░  ',
        '   ░▒▒▓▓███████████████████████████████████████████████████████████████▓▓▒▒░   '
      ],
      chance: 0.15 // Massive
    },
    {
      art: [
        '         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         ',
        '      ░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░      ',
        '    ░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░    ',
        '   ░▒▒▓▓███████████████████████████████████████████████▓▓▒▒░   ',
        '  ░▒▓▓█████████████████████████████████████████████████████▓▓▒░  ',
        ' ░▒▓███████████████████████████████████████████████████████████▓▒░ ',
        '░▒▓█████████████████████████████████████████████████████████████▓▒░',
        '░▒▓█████████████████████████████████████████████████████████████▓▒░',
        ' ░▒▓███████████████████████████████████████████████████████████▓▒░ ',
        '  ░▒▓▓█████████████████████████████████████████████████████▓▓▒░  ',
        '   ░▒▒▓▓███████████████████████████████████████████████▓▓▒▒░   '
      ],
      chance: 0.2 // Huge
    },
    {
      art: [
        '      ░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░░      ',
        '    ░░▒▒▓▓▓████████████████████████████████▓▓▓▒▒░░    ',
        '  ░░▒▒▓▓████████████████████████████████████████▓▓▒▒░░  ',
        ' ░▒▓▓██████████████████████████████████████████████▓▓▒░ ',
        '░▒▓████████████████████████████████████████████████████▓▒░',
        '░▒▓████████████████████████████████████████████████████▓▒░',
        ' ░▒▓▓██████████████████████████████████████████████▓▓▒░ ',
        '  ░░▒▒▓▓████████████████████████████████████████▓▓▒▒░░  '
      ],
      chance: 0.25 // Large
    },
    {
      art: [
        '    ░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░    ',
        '  ░░▒▓▓████████████████████▓▓▒░░  ',
        ' ░▒▓▓██████████████████████████▓▓▒░ ',
        '░▒▓████████████████████████████████▓▒░',
        ' ░▒▓▓██████████████████████████▓▓▒░ ',
        '  ░░▒▓▓████████████████████▓▓▒░░  '
      ],
      chance: 0.25 // Medium
    },
    {
      art: [
        '  ░░▒▓▓▓▓▓▓▓▓▓▓▒░░  ',
        ' ░▒▓▓████████████▓▓▒░ ',
        '░▒▓████████████████▓▒░',
        ' ░▒▓▓████████████▓▓▒░ '
      ],
      chance: 0.15 // Small
    }
  ];

  // Weighted random selection
  const rand = Math.random();
  let cumulative = 0;
  let selectedType = types[0];

  for (const type of types) {
    cumulative += type.chance;
    if (rand <= cumulative) {
      selectedType = type;
      break;
    }
  }

  const x = Math.random() * CONFIG.canvas.width;
  const y = -100; // Start further up for larger clouds

  return new Cloud(x, y, {
    art: selectedType.art,
    color: '#ffffff', // White
    speed: 40,
    layer: 'near'
  });
}

// ============================================================================
// PLAYER SHIP
// ============================================================================

class Player extends Entity {
  constructor(x, y) {
    super(x, y);
    this.type = 'player';

    // Visual
    this.art = [
      '  ^  ',
      ' <o> ',
      ' ||| '
    ];
    this.color = '#00ffff'; // Cyan from GDB

    // Physics
    this.speed = CONFIG.player.speed;
    this.vx = 0;
    this.vy = 0;

    // Combat
    this.health = 100;
    this.maxHealth = 100;
    this.hitboxRadius = this.calculateHitboxRadius();

    // Weapons
    this.weapons = [
      new SniperLaser(),
      new VulcanCannon()
    ];
    this.currentWeaponIndex = 0;
    this.rocketLauncher = new RocketLauncher();

    // Animation
    this.thrustFrame = 0;
    this.thrustTimer = 0;
    this.thrustInterval = 100; // ms
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  switchWeapon() {
    this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
    this.updateWeaponUI();

    // Play weapon switch sound
    if (game.audioManager) {
      game.audioManager.playWeaponSwitchSound();
    }
  }

  updateWeaponUI() {
    // Update UI to show current weapon
    document.querySelectorAll('.weapon').forEach(el => {
      el.classList.remove('ui-current-weapon');
    });

    const weaponId = this.getCurrentWeapon().id;
    const uiElement = document.getElementById(`ui-${weaponId}-weapon`);
    if (uiElement) {
      uiElement.classList.add('ui-current-weapon');
    }

    // Update rocket ammo display
    const rocketAmmoEl = document.querySelector('#ui-rocket-weapon .ammo');
    if (rocketAmmoEl) {
      rocketAmmoEl.textContent = this.rocketLauncher.ammo;
    }
  }

  fire(currentTime) {
    const weapon = this.getCurrentWeapon();
    return weapon.fire(this.x, this.y, currentTime);
  }

  fireRocket(currentTime) {
    return this.rocketLauncher.fire(this.x, this.y, currentTime);
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      // Create large explosion on player death
      game.effects.push(createLargeExplosion(this.x, this.y));
      this.destroy();
    }
    this.updateHealthUI();
  }

  updateHealthUI() {
    const healthEl = document.querySelector('#health span');
    if (healthEl) {
      healthEl.textContent = this.health;
    }
  }

  update(deltaTime) {
    // Update position based on velocity
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Clamp to bounds
    this.x = Math.max(CONFIG.player.bounds.left, Math.min(CONFIG.player.bounds.right, this.x));
    this.y = Math.max(CONFIG.player.bounds.top, Math.min(CONFIG.player.bounds.bottom, this.y));

    // Update thrust animation
    this.thrustTimer += deltaTime * 1000;
    if (this.thrustTimer >= this.thrustInterval) {
      this.thrustFrame = (this.thrustFrame + 1) % 2;
      this.thrustTimer = 0;
    }

    // Decay velocity (for smooth stopping)
    this.vx *= 0.85;
    this.vy *= 0.85;
  }

  render(renderer) {
    // Render ship
    renderer.drawMultiLine(this.art, this.x, this.y, this.color);

    // Render thrust (centered below ship)
    const thrustChar = this.thrustFrame === 0 ? '*' : '^';
    const thrustY = this.y + (CONFIG.font.size * 3);
    renderer.drawTextCentered(thrustChar, this.x, thrustY, '#ff6600');
  }

  move(dx, dy) {
    // Acceleration-based movement
    this.vx = dx * this.speed;
    this.vy = dy * this.speed;
  }

  calculateHitboxRadius() {
    // Player ship is multi-line, calculate based on dimensions
    if (!game.renderer) {
      return 16; // Default fallback
    }

    let maxWidth = 0;
    this.art.forEach(line => {
      const width = game.renderer.measureWidth(line);
      maxWidth = Math.max(maxWidth, width);
    });
    const height = this.art.length * CONFIG.font.size;

    // Use half-diagonal for circular hitbox to cover rectangle
    return Math.sqrt((maxWidth/2) ** 2 + (height/2) ** 2);
  }
}

// ============================================================================
// ENEMY CLASSES
// ============================================================================

class Enemy extends Entity {
  constructor(x, y, config) {
    super(x, y);
    this.type = 'enemy';
    this.art = config.art || '???';
    this.color = config.color || '#ff0000';
    this.health = config.health || 10;
    this.maxHealth = this.health;
    this.scoreValue = config.scoreValue || 100;
    this.speed = config.speed || 100;

    // Weapon configuration
    this.weapon = config.weapon || null;
    this.lastFireTime = 0;

    // Calculate hitbox radius based on art if not provided
    if (config.hitboxRadius !== undefined) {
      this.hitboxRadius = config.hitboxRadius;
    } else {
      this.hitboxRadius = this.calculateHitboxRadius();
    }
  }

  canFire(currentTime) {
    if (!this.weapon) return false;
    return (currentTime - this.lastFireTime) >= this.weapon.fireRate;
  }

  fire(currentTime) {
    if (!this.canFire(currentTime)) return [];
    this.lastFireTime = currentTime;

    const projectiles = [];
    const config = {
      speed: this.weapon.projectileSpeed,
      char: this.weapon.projectileChar,
      color: this.weapon.projectileColor,
      damage: this.weapon.damage,
      hitboxRadius: this.weapon.hitboxRadius || 3,
      owner: 'enemy'
    };

    if (this.weapon.aimAtPlayer && game.player && game.player.active) {
      // Aim at player
      const dx = game.player.x - this.x;
      const dy = game.player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        config.vx = (dx / dist) * this.weapon.projectileSpeed;
        config.vy = (dy / dist) * this.weapon.projectileSpeed;
        projectiles.push(new Projectile(this.x, this.y + 10, config));
      }
    } else {
      // Fire straight down
      projectiles.push(new Projectile(this.x, this.y + 10, config));
    }

    return projectiles;
  }

  calculateHitboxRadius() {
    // Create a temporary canvas context to measure text
    if (!game.renderer) {
      return 16; // Default fallback
    }

    if (Array.isArray(this.art)) {
      // Multi-line art - find the widest line
      let maxWidth = 0;
      this.art.forEach(line => {
        const width = game.renderer.measureWidth(line);
        maxWidth = Math.max(maxWidth, width);
      });
      const height = this.art.length * CONFIG.font.size;

      // Use half-diagonal for circular hitbox to cover rectangle
      return Math.sqrt((maxWidth/2) ** 2 + (height/2) ** 2);
    } else {
      // Single-line art
      const width = game.renderer.measureWidth(this.art);
      // Use half-width as radius (covers the full width)
      return width / 2;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.onDeath();
      this.destroy();
    }
  }

  onDeath() {
    // Add score
    if (game.score !== undefined) {
      game.score += this.scoreValue;
      this.updateScoreUI();
    }

    // Create explosion effect
    game.effects.push(createSmallExplosion(this.x, this.y));
  }

  updateScoreUI() {
    const scoreEl = document.querySelector('#score span');
    if (scoreEl) {
      scoreEl.textContent = game.score;
    }
  }

  render(renderer) {
    if (Array.isArray(this.art)) {
      renderer.drawMultiLine(this.art, this.x, this.y, this.color);
    } else {
      renderer.drawTextCentered(this.art, this.x, this.y, this.color);
    }
  }
}

class Scout extends Enemy {
  constructor(x, y) {
    super(x, y, {
      art: '{[::]}',
      color: '#ff3300',
      health: 10,
      // hitboxRadius auto-calculated from art
      speed: 120,
      scoreValue: 100,
      weapon: {
        projectileChar: '·',
        projectileColor: '#ffff00',
        fireRate: 2000,         // milliseconds
        projectileSpeed: 300,   // pixels per second
        damage: 10,
        aimAtPlayer: false      // fires straight down
      }
    });

    // Sine wave movement parameters
    this.amplitude = 50;
    this.frequency = 2;
    this.baseSpeed = 120;
    this.startX = x;
    this.time = 0;
  }

  update(deltaTime) {
    this.time += deltaTime;

    // Sine wave horizontal movement
    const sineOffset = Math.sin(this.time * this.frequency) * this.amplitude;
    this.x = this.startX + sineOffset;

    // Move downward
    this.y += this.baseSpeed * deltaTime;

    // Fire weapon
    if (this.weapon) {
      const projectiles = this.fire(performance.now());
      game.projectiles.push(...projectiles);
    }

    // Destroy if off screen
    if (this.y > CONFIG.canvas.height + 50) {
      this.destroy();
    }
  }
}

class Gunship extends Enemy {
  constructor(x, y) {
    super(x, y, {
      art: [
        ' _||_ ',
        '<||||>',
        ' ‾||‾ '
      ],
      color: '#ff00ff',
      health: 30,
      speed: 60,
      scoreValue: 250,
      weapon: {
        projectileChar: '¦',
        projectileColor: '#ffff00',
        fireRate: 1200,         // milliseconds
        projectileSpeed: 400,
        damage: 15,
        aimAtPlayer: true,
        burstCount: 3,
        burstDelay: 150         // milliseconds between burst shots
      }
    });

    // Movement parameters
    this.descendTo = 150;       // Y position to stop at
    this.hovering = false;
    this.driftAmount = 20;      // pixels of drift
    this.driftSpeed = 30;       // pixels per second
    this.driftDirection = 1;
    this.driftDistance = 0;
    this.baseSpeed = 60;

    // Burst fire tracking
    this.burstShotsFired = 0;
    this.lastBurstTime = 0;
  }

  update(deltaTime) {
    // Descent phase
    if (!this.hovering && this.y < this.descendTo) {
      this.y += this.baseSpeed * deltaTime;
      if (this.y >= this.descendTo) {
        this.hovering = true;
      }
    }

    // Hover and drift phase
    if (this.hovering) {
      // Drift left and right
      const drift = this.driftSpeed * this.driftDirection * deltaTime;
      this.x += drift;
      this.driftDistance += Math.abs(drift);

      // Reverse direction when reaching drift limit
      if (this.driftDistance >= this.driftAmount) {
        this.driftDirection *= -1;
        this.driftDistance = 0;
      }
    }

    // Burst fire weapon
    if (this.weapon && this.hovering) {
      const currentTime = performance.now();

      // Check if we should start a new burst
      if (this.burstShotsFired === 0 && this.canFire(currentTime)) {
        this.lastFireTime = currentTime;
        this.lastBurstTime = currentTime;
        this.burstShotsFired = 1;

        const projectiles = this.fire(currentTime);
        game.projectiles.push(...projectiles);
      }
      // Continue burst
      else if (this.burstShotsFired > 0 && this.burstShotsFired < this.weapon.burstCount) {
        if (currentTime - this.lastBurstTime >= this.weapon.burstDelay) {
          this.lastBurstTime = currentTime;
          this.burstShotsFired++;

          const projectiles = this.fire(currentTime);
          game.projectiles.push(...projectiles);
        }
      }
      // Reset burst counter
      else if (this.burstShotsFired >= this.weapon.burstCount) {
        this.burstShotsFired = 0;
      }
    }

    // Destroy if off screen
    if (this.y > CONFIG.canvas.height + 50) {
      this.destroy();
    }
  }
}

class Kamikaze extends Enemy {
  constructor(x, y) {
    super(x, y, {
      art: '(@@)',
      color: '#ff6600',
      health: 5,
      speed: 200,
      scoreValue: 150,
      weapon: null  // No weapon - explodes on contact
    });

    // Chase behavior parameters
    this.acceleration = 150;     // pixels per second squared
    this.maxSpeed = 300;         // maximum speed
    this.trackingStrength = 0.8; // how aggressively it tracks
    this.vx = 0;
    this.vy = 100;               // initial downward velocity

    // Explosion parameters
    this.explosionDamage = 25;
    this.explosionRadius = 40;
  }

  update(deltaTime) {
    if (!game.player || !game.player.active) {
      // If no player, just move downward
      this.y += this.vy * deltaTime;
    } else {
      // Chase player
      const dx = game.player.x - this.x;
      const dy = game.player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        // Calculate desired velocity toward player
        const targetVx = (dx / dist) * this.maxSpeed;
        const targetVy = (dy / dist) * this.maxSpeed;

        // Blend current velocity with target velocity
        this.vx += (targetVx - this.vx) * this.trackingStrength * deltaTime;
        this.vy += (targetVy - this.vy) * this.trackingStrength * deltaTime;

        // Apply acceleration
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const newSpeed = Math.min(currentSpeed + this.acceleration * deltaTime, this.maxSpeed);

        if (currentSpeed > 0) {
          const scale = newSpeed / currentSpeed;
          this.vx *= scale;
          this.vy *= scale;
        }
      }

      // Update position
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;
    }

    // Destroy if off screen
    if (this.y > CONFIG.canvas.height + 50 || this.y < -50 ||
        this.x < -50 || this.x > CONFIG.canvas.width + 50) {
      this.destroy();
    }
  }

  onDeath() {
    // Create explosion effect
    game.effects.push(createSmallExplosion(this.x, this.y));

    // Add score
    if (game.score !== undefined) {
      game.score += this.scoreValue;
      this.updateScoreUI();
    }

    // Damage player if close
    if (game.player && game.player.active) {
      const dx = game.player.x - this.x;
      const dy = game.player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.explosionRadius) {
        game.player.takeDamage(this.explosionDamage);
      }
    }

    // Damage nearby enemies (chain reaction)
    game.enemies.forEach(enemy => {
      if (enemy === this || !enemy.active) return;

      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.explosionRadius) {
        enemy.takeDamage(this.explosionDamage);
      }
    });
  }
}

// ============================================================================
// INPUT MANAGER
// ============================================================================

class InputManager {
  constructor() {
    this.keys = {};
    this.previousKeys = {};
    this.gamepadButtons = {};
    this.previousGamepadButtons = {};
    this.deadzone = 0.15; // Per GDB specification
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Prevent default for game controls
      if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyR'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Gamepad connection events
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
    });
  }

  getGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    // Return first connected gamepad
    for (const gamepad of gamepads) {
      if (gamepad) return gamepad;
    }
    return null;
  }

  isKeyDown(code) {
    return this.keys[code] === true;
  }

  wasKeyJustPressed(code) {
    return this.keys[code] === true && this.previousKeys[code] !== true;
  }

  isGamepadButtonDown(buttonIndex) {
    return this.gamepadButtons[buttonIndex] === true;
  }

  wasGamepadButtonJustPressed(buttonIndex) {
    return this.gamepadButtons[buttonIndex] === true &&
           this.previousGamepadButtons[buttonIndex] !== true;
  }

  update() {
    // Store previous key states for just-pressed detection
    this.previousKeys = { ...this.keys };
    this.previousGamepadButtons = { ...this.gamepadButtons };

    // Update gamepad state
    const gamepad = this.getGamepad();
    if (gamepad) {
      // Update button states
      gamepad.buttons.forEach((button, index) => {
        this.gamepadButtons[index] = button.pressed;
      });
    }
  }

  getMovementVector() {
    let dx = 0;
    let dy = 0;

    // Keyboard input
    if (this.isKeyDown('KeyW')) dy -= 1;
    if (this.isKeyDown('KeyS')) dy += 1;
    if (this.isKeyDown('KeyA')) dx -= 1;
    if (this.isKeyDown('KeyD')) dx += 1;

    // Gamepad input (left stick or D-pad)
    const gamepad = this.getGamepad();
    if (gamepad) {
      // Left stick (axes 0 and 1)
      const leftStickX = gamepad.axes[0] || 0;
      const leftStickY = gamepad.axes[1] || 0;

      // Apply deadzone
      if (Math.abs(leftStickX) > this.deadzone) {
        dx += leftStickX;
      }
      if (Math.abs(leftStickY) > this.deadzone) {
        dy += leftStickY;
      }

      // D-pad (buttons 12-15 on standard gamepad)
      if (gamepad.buttons[12]?.pressed) dy -= 1; // Up
      if (gamepad.buttons[13]?.pressed) dy += 1; // Down
      if (gamepad.buttons[14]?.pressed) dx -= 1; // Left
      if (gamepad.buttons[15]?.pressed) dx += 1; // Right
    }

    // Normalize diagonal movement
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude > 1) {
      dx /= magnitude;
      dy /= magnitude;
    }

    return { dx, dy };
  }

  // Check if shoot button is pressed (Space or A button)
  isShootPressed() {
    return this.isKeyDown('Space') || this.isGamepadButtonDown(0); // A button
  }

  // Check if weapon switch was just pressed (E or X button)
  wasWeaponSwitchPressed() {
    return this.wasKeyJustPressed('KeyE') || this.wasGamepadButtonJustPressed(2); // X button
  }

  // Check if special weapon was just pressed (R or RT)
  wasSpecialWeaponPressed() {
    return this.wasKeyJustPressed('KeyR') ||
           this.wasGamepadButtonJustPressed(7) || // RT button (some gamepads)
           this.wasGamepadButtonJustPressed(6);   // LT button alternative
  }
}

// ============================================================================
// CANVAS RESIZE HANDLING
// ============================================================================

function updateCanvasSize() {
  const canvas = game.canvas;

  // Get the window dimensions
  const width = Math.max(CONFIG.canvas.minWidth, window.innerWidth);
  const height = Math.max(CONFIG.canvas.minHeight, window.innerHeight);

  // Update canvas dimensions
  canvas.width = width;
  canvas.height = height;

  // Update CONFIG
  CONFIG.canvas.width = width;
  CONFIG.canvas.height = height;

  // Update player bounds to maintain playable area margins
  CONFIG.player.bounds.top = 50;
  CONFIG.player.bounds.bottom = height - 50;
  CONFIG.player.bounds.left = 20;
  CONFIG.player.bounds.right = width - 20;

  // If player exists, ensure it stays within new bounds
  if (game.player) {
    game.player.x = Math.max(CONFIG.player.bounds.left, Math.min(CONFIG.player.bounds.right, game.player.x));
    game.player.y = Math.max(CONFIG.player.bounds.top, Math.min(CONFIG.player.bounds.bottom, game.player.y));
  }

  // Resize background gradient
  if (game.background) {
    game.background.resize(width, height);
  }
}

// ============================================================================
// GAME INITIALIZATION
// ============================================================================

async function init() {
  // Get canvas and context
  game.canvas = document.getElementById('game-canvas');
  game.ctx = game.canvas.getContext('2d');

  if (!game.ctx) {
    console.error('Failed to get 2D context');
    return;
  }

  // Set initial canvas size
  updateCanvasSize();

  // Create audio manager
  game.audioManager = new AudioManager();

  // Initialize audio on first user interaction
  const initAudio = () => {
    game.audioManager.init();
    document.removeEventListener('keydown', initAudio);
    document.removeEventListener('click', initAudio);
  };
  document.addEventListener('keydown', initAudio);
  document.addEventListener('click', initAudio);

  // Create asset loader
  game.assetLoader = new AssetLoader();

  // Try to load JSON assets (gracefully handles missing files)
  // These will be created in Milestone 3 with the asset editor
  const assetPaths = {
    'player_ship': '/assets/sprites/player/player_ship.json',
    'scout': '/assets/sprites/enemies/scout.json',
    'gunship': '/assets/sprites/enemies/gunship.json',
    'kamikaze': '/assets/sprites/enemies/kamikaze.json'
  };

  console.log('Attempting to load JSON assets...');
  await game.assetLoader.loadAssets(assetPaths);
  game.assetsLoaded = true;

  // Note: Assets are currently hardcoded. When JSON assets are available,
  // entities can be created from the loaded data using assetLoader.getAsset(name)

  // Create background
  game.background = new Background(game.ctx, CONFIG.canvas.width, CONFIG.canvas.height);

  // Create renderer
  game.renderer = new ASCIIRenderer(game.ctx);

  // Create input manager
  game.input = new InputManager();

  // Create player
  game.player = new Player(CONFIG.canvas.width / 2, CONFIG.canvas.height - 100);

  // Initialize UI
  game.player.updateHealthUI();
  game.player.updateWeaponUI();
  const scoreEl = document.querySelector('#score span');
  if (scoreEl) {
    scoreEl.textContent = game.score;
  }

  // Spawn initial clouds
  for (let i = 0; i < 5; i++) {
    game.clouds.push(createFarCloud());
    game.clouds.push(createNearCloud());
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    updateCanvasSize();
  });

  // Start game loop
  game.running = true;
  game.lastTime = performance.now();
  requestAnimationFrame(gameLoop);

  console.log('Game initialized - Canvas mode');
  console.log('Asset loader ready. Assets can be imported from JSON files.');
}

// ============================================================================
// GAME LOOP
// ============================================================================

function gameLoop(currentTime) {
  if (!game.running) return;

  // Calculate delta time in seconds
  game.deltaTime = (currentTime - game.lastTime) / 1000;
  game.lastTime = currentTime;

  // Cap delta time to prevent large jumps
  game.deltaTime = Math.min(game.deltaTime, 0.1);

  // Update
  update(game.deltaTime);

  // Render
  render();

  // Next frame
  requestAnimationFrame(gameLoop);
}

// ============================================================================
// ENEMY SPAWNING
// ============================================================================

function spawnEnemy() {
  // Spawn at random X position at top of screen
  const x = Math.random() * (CONFIG.canvas.width - 100) + 50;

  // Randomly choose enemy type (60% Scout, 20% Gunship, 20% Kamikaze)
  const rand = Math.random();
  let enemy;

  if (rand < 0.6) {
    enemy = new Scout(x, -20);
  } else if (rand < 0.8) {
    enemy = new Gunship(x, -50);
  } else {
    enemy = new Kamikaze(x, -20);
  }

  game.enemies.push(enemy);
}

// ============================================================================
// COLLISION DETECTION
// ============================================================================

function handleCollisions() {
  // Player projectiles vs Enemies
  game.projectiles.forEach(projectile => {
    if (!projectile.active || projectile.owner !== 'player') return;

    game.enemies.forEach(enemy => {
      if (!enemy.active) return;

      if (projectile.collidesWith(enemy)) {
        // Create impact effect
        game.effects.push(createImpactEffect(projectile.x, projectile.y));

        enemy.takeDamage(projectile.damage);
        projectile.destroy();
      }
    });
  });

  // Enemy projectiles vs Player
  if (game.player && game.player.active) {
    game.projectiles.forEach(projectile => {
      if (!projectile.active || projectile.owner !== 'enemy') return;

      if (projectile.collidesWith(game.player)) {
        // Create impact effect
        game.effects.push(createImpactEffect(projectile.x, projectile.y));

        game.player.takeDamage(projectile.damage);
        projectile.destroy();
      }
    });
  }

  // Player vs Enemies (collision damage)
  if (game.player && game.player.active) {
    game.enemies.forEach(enemy => {
      if (!enemy.active) return;

      if (game.player.collidesWith(enemy)) {
        game.player.takeDamage(25);
        // Enemy explodes on contact (handled by enemy.destroy -> onDeath)
        enemy.takeDamage(enemy.health); // Instant kill
      }
    });
  }
}

// ============================================================================
// UPDATE
// ============================================================================

function update(deltaTime) {
  if (!game.player || !game.player.active) return;

  // Handle input
  const movement = game.input.getMovementVector();
  game.player.move(movement.dx, movement.dy);

  // Handle shooting (keyboard or gamepad)
  if (game.input.isShootPressed()) {
    const projectiles = game.player.fire(performance.now());
    game.projectiles.push(...projectiles);
  }

  // Handle weapon switching (keyboard or gamepad)
  if (game.input.wasWeaponSwitchPressed()) {
    game.player.switchWeapon();
  }

  // Handle rocket firing (keyboard or gamepad)
  if (game.input.wasSpecialWeaponPressed()) {
    const projectiles = game.player.fireRocket(performance.now());
    game.projectiles.push(...projectiles);
    game.player.updateWeaponUI();
  }

  // Update input state
  game.input.update();

  // Update background
  if (game.background) {
    game.background.update(deltaTime);
  }

  // Update player
  game.player.update(deltaTime);

  // Update projectiles
  game.projectiles.forEach(projectile => {
    if (projectile.active) {
      projectile.update(deltaTime);
    }
  });

  // Update enemies
  game.enemies.forEach(enemy => {
    if (enemy.active) {
      enemy.update(deltaTime);
    }
  });

  // Update effects
  game.effects.forEach(effect => {
    if (effect.active) {
      effect.update(deltaTime);
    }
  });

  // Update particles
  game.particles.forEach(particle => {
    if (particle.active) {
      particle.update(deltaTime);
    }
  });

  // Update clouds
  game.clouds.forEach(cloud => {
    if (cloud.active) {
      cloud.update(deltaTime);
    }
  });

  // Handle collisions
  handleCollisions();

  // Remove inactive entities
  game.projectiles = game.projectiles.filter(p => p.active);
  game.enemies = game.enemies.filter(e => e.active);
  game.effects = game.effects.filter(e => e.active);
  game.particles = game.particles.filter(p => p.active);
  game.clouds = game.clouds.filter(c => c.active);

  // Enemy spawning
  game.enemySpawnTimer += deltaTime * 1000;
  if (game.enemySpawnTimer >= game.enemySpawnInterval) {
    spawnEnemy();
    game.enemySpawnTimer = 0;
  }

  // Cloud spawning
  game.cloudSpawnTimer += deltaTime * 1000;
  const cloudInterval = CONFIG.background.cloudSpawnInterval +
                        (Math.random() - 0.5) * CONFIG.background.cloudSpawnVariance;
  if (game.cloudSpawnTimer >= cloudInterval) {
    // Randomly spawn far or near clouds
    if (Math.random() > 0.5) {
      game.clouds.push(createFarCloud());
    } else {
      game.clouds.push(createNearCloud());
    }
    game.cloudSpawnTimer = 0;
  }
}

// ============================================================================
// RENDER
// ============================================================================

function render() {
  // Render sky gradient background
  if (game.background) {
    game.background.render();
  }

  // Render far clouds (slower parallax layer)
  game.clouds.forEach(cloud => {
    if (cloud.active && cloud.layer === 'far') {
      cloud.render(game.renderer);
    }
  });

  // Render near clouds (faster parallax layer)
  game.clouds.forEach(cloud => {
    if (cloud.active && cloud.layer === 'near') {
      cloud.render(game.renderer);
    }
  });

  // Render particles (debris, etc)
  game.particles.forEach(particle => {
    if (particle.active) {
      particle.render(game.renderer);
    }
  });

  // Render effects (explosions, muzzle flashes)
  game.effects.forEach(effect => {
    if (effect.active) {
      effect.render(game.renderer);
    }
  });

  // Render enemies
  game.enemies.forEach(enemy => {
    if (enemy.active) {
      enemy.render(game.renderer);
    }
  });

  // Render projectiles
  game.projectiles.forEach(projectile => {
    if (projectile.active) {
      projectile.render(game.renderer);
    }
  });

  // Render player
  if (game.player && game.player.active) {
    game.player.render(game.renderer);
  }

  // Debug info (optional)
  if (false) { // Set to true for debugging
    game.ctx.fillStyle = '#00ff00';
    game.ctx.font = '12px monospace';
    game.ctx.fillText(`FPS: ${Math.round(1 / game.deltaTime)}`, 10, 10);
    game.ctx.fillText(`Projectiles: ${game.projectiles.length}`, 10, 25);
    game.ctx.fillText(`Enemies: ${game.enemies.length}`, 10, 40);
    game.ctx.fillText(`Effects: ${game.effects.length}`, 10, 55);
    game.ctx.fillText(`Particles: ${game.particles.length}`, 10, 70);
    game.ctx.fillText(`Clouds: ${game.clouds.length}`, 10, 85);
  }
}

// ============================================================================
// START GAME
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
