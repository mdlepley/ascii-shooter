/**
 * ASCII Shmup Revival - Main Game Loop
 * Canvas-based implementation
 */

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
  cloudSpawnTimer: 0
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
  }

  render() {
    this.ctx.fillStyle = this.gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
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

    // Calculate hitbox radius based on art if not provided
    if (config.hitboxRadius !== undefined) {
      this.hitboxRadius = config.hitboxRadius;
    } else {
      this.hitboxRadius = this.calculateHitboxRadius();
    }
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
      scoreValue: 100
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

    // Destroy if off screen
    if (this.y > CONFIG.canvas.height + 50) {
      this.destroy();
    }
  }
}

// ============================================================================
// INPUT MANAGER
// ============================================================================

class InputManager {
  constructor() {
    this.keys = {};
    this.previousKeys = {};
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
  }

  isKeyDown(code) {
    return this.keys[code] === true;
  }

  wasKeyJustPressed(code) {
    return this.keys[code] === true && this.previousKeys[code] !== true;
  }

  update() {
    // Store previous key states for just-pressed detection
    this.previousKeys = { ...this.keys };
  }

  getMovementVector() {
    let dx = 0;
    let dy = 0;

    if (this.isKeyDown('KeyW')) dy -= 1;
    if (this.isKeyDown('KeyS')) dy += 1;
    if (this.isKeyDown('KeyA')) dx -= 1;
    if (this.isKeyDown('KeyD')) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      dx /= magnitude;
      dy /= magnitude;
    }

    return { dx, dy };
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

function init() {
  // Get canvas and context
  game.canvas = document.getElementById('game-canvas');
  game.ctx = game.canvas.getContext('2d');

  if (!game.ctx) {
    console.error('Failed to get 2D context');
    return;
  }

  // Set initial canvas size
  updateCanvasSize();

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
  const enemy = new Scout(x, -20);
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

  // Handle shooting
  if (game.input.isKeyDown('Space')) {
    const projectiles = game.player.fire(performance.now());
    game.projectiles.push(...projectiles);
  }

  // Handle weapon switching
  if (game.input.wasKeyJustPressed('KeyE')) {
    game.player.switchWeapon();
  }

  // Handle rocket firing
  if (game.input.wasKeyJustPressed('KeyR')) {
    const projectiles = game.player.fireRocket(performance.now());
    game.projectiles.push(...projectiles);
    game.player.updateWeaponUI();
  }

  // Update input state
  game.input.update();

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
