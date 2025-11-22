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
    backgroundColor: '#000000'
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
  player: null
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

    // Animation
    this.thrustFrame = 0;
    this.thrustTimer = 0;
    this.thrustInterval = 100; // ms
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

    // Render thrust
    const thrustChar = this.thrustFrame === 0 ? '*' : '^';
    const thrustY = this.y + (CONFIG.font.size * 3);
    renderer.drawText(thrustChar, this.x - 5, thrustY, '#ff6600');
  }

  move(dx, dy) {
    // Acceleration-based movement
    this.vx = dx * this.speed;
    this.vy = dy * this.speed;
  }
}

// ============================================================================
// INPUT MANAGER
// ============================================================================

class InputManager {
  constructor() {
    this.keys = {};
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

  // Create renderer
  game.renderer = new ASCIIRenderer(game.ctx);

  // Create input manager
  game.input = new InputManager();

  // Create player
  game.player = new Player(CONFIG.canvas.width / 2, CONFIG.canvas.height - 100);
  game.entities.push(game.player);

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
// UPDATE
// ============================================================================

function update(deltaTime) {
  // Handle input
  const movement = game.input.getMovementVector();
  game.player.move(movement.dx, movement.dy);

  // Update all entities
  game.entities.forEach(entity => {
    if (entity.active) {
      entity.update(deltaTime);
    }
  });

  // Remove inactive entities
  game.entities = game.entities.filter(entity => entity.active);
}

// ============================================================================
// RENDER
// ============================================================================

function render() {
  // Clear canvas
  game.ctx.fillStyle = CONFIG.canvas.backgroundColor;
  game.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

  // Render all entities
  game.entities.forEach(entity => {
    if (entity.active) {
      entity.render(game.renderer);
    }
  });

  // Debug info (optional)
  if (false) { // Set to true for debugging
    game.ctx.fillStyle = '#00ff00';
    game.ctx.font = '12px monospace';
    game.ctx.fillText(`FPS: ${Math.round(1 / game.deltaTime)}`, 10, 10);
    game.ctx.fillText(`Entities: ${game.entities.length}`, 10, 25);
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
