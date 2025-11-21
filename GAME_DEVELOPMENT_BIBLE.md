# ASCII Shmup Revival - Game Development Bible
**Version:** 1.1 (Minimal Specification - Level Themes Added)
**Date:** 2025-11-21
**Purpose:** Actionable specifications for Canvas-based implementation

**Recent Updates:**
- Added comprehensive level themes (Daybreak Assault, Maritime, Orbital Factory, Deep Space)
- Level 1 "Daybreak Assault" fully specified with sunny sky, clouds, and green pastures
- Updated color palette for bright daytime environments
- Added detailed parallax background system with cloud generation
- Environmental details (birds, sun) specified

---

## Table of Contents
1. [Core Game Parameters](#core-game-parameters)
2. [Level Themes](#level-themes)
3. [Visual Style Guide](#visual-style-guide)
4. [Color Palette](#color-palette)
5. [Player Ship Specification](#player-ship-specification)
6. [Weapon Systems](#weapon-systems)
7. [Enemy Specifications](#enemy-specifications)
8. [Visual Effects](#visual-effects)
9. [Audio Design Guidelines](#audio-design-guidelines)
10. [Control Schemes](#control-schemes)
11. [Level 1 Background System](#level-1-background-system)
12. [Asset Naming Conventions](#asset-naming-conventions)

---

## Core Game Parameters

### Canvas Configuration
```javascript
{
  "screenWidth": 800,
  "screenHeight": 600,
  "targetFPS": 60,
  "backgroundColor": "#000000"
}
```

### Game Physics
```javascript
{
  "playerSpeed": 250,              // pixels per second
  "playerBounds": {
    "top": 50,                      // minimum Y position
    "bottom": 550,                  // maximum Y position
    "left": 20,                     // minimum X position
    "right": 780                    // maximum X position
  },
  "scrollSpeed": 60,                // background scroll pixels/sec
  "gravity": 0                      // no gravity in space
}
```

### Performance Targets
- **Minimum FPS:** 60
- **Maximum entities on screen:** 100
- **Target render time per frame:** <16ms

---

## Level Themes

### Level 1: "Daybreak Assault" - Clouds & Green Pastures
**Setting:** Flying through a beautiful sunny day, above rolling green fields and farmland

**Visual Theme:**
- Bright, cheerful color palette
- Fluffy white clouds drifting by
- Green pastures visible far below
- Occasional birds or environmental details
- Clear blue sky gradient

**Background Layers (Parallax):**
1. **Sky Layer** - Light blue gradient (#87CEEB to #4682B4)
2. **Cloud Layer (Far)** - Large, slow-moving clouds using `░▒▓` characters
3. **Cloud Layer (Near)** - Faster, puffier clouds for depth
4. **Ground Layer** - Distant green fields (subtle, far below)

**Atmosphere:**
- Peaceful beginning that contrasts with incoming enemy forces
- Pastoral, almost idyllic before the chaos begins

**Enemy Types for Level 1:**
- Scout fighters (red/orange to stand out against blue sky)
- Gunships
- Kamikaze drones

---

### Level 2: "Sea Thunder" - Maritime Battle (Future)
**Setting:** Low altitude combat over a naval battlefield with warships below

**Planned Elements:**
- Ocean waves (ASCII wave patterns)
- Battleships firing flak
- Aircraft carriers as platforms
- Water splashes and naval combat

---

### Level 3: "Factory Zero" - Orbital Manufacturing Station (Future)
**Setting:** Industrial space station with mechanical hazards

**Planned Elements:**
- Metallic structures and girders
- Conveyor belts and machinery
- Industrial enemies (robotic)
- Hazardous environmental elements

---

### Level 4: "Deep Void" - Outer Space (Future)
**Setting:** Classic deep space shmup environment

**Planned Elements:**
- Star field backgrounds
- Asteroids and debris
- Alien spacecraft
- Nebula effects

---

## Visual Style Guide

### ASCII Design Principles
1. **Readability First** - All entities must be immediately recognizable
2. **Consistent Character Use** - Stick to the defined character palette for each entity type
3. **Symmetry for Ships** - Player and enemy ships should be vertically symmetrical when possible
4. **Animation Through Substitution** - Animate by replacing characters, not moving individual chars
5. **Layering for Complexity** - Complex entities (bosses) use multiple layers

### Character Palette

**Structural Characters** (ship hulls, solid parts):
- `█ ▓ ▒ ░ ■ ▪ ● ○ ◘ ◙ ☼`

**Weapon/Detail Characters:**
- `! " # $ % & * + - = / \ | ^ < > ▲ ▼ ◄ ►`

**Wing/Extension Characters:**
- `{ } [ ] ( ) < >`

**Effect Characters:**
- `* @ # % + . ~ ' "`

### Font Specifications
```css
{
  "fontFamily": "Courier New, monospace",
  "fontSize": "16px",
  "fontWeight": "bold",
  "lineHeight": 1.0,
  "letterSpacing": "0px"
}
```

---

## Color Palette

### Primary Colors (All Levels)
```javascript
{
  "player": "#00ffff",          // Cyan - player ship
  "playerWeapon1": "#00ff00",   // Green - sniper laser
  "playerWeapon2": "#0099ff",   // Blue - vulcan
  "playerSpecial": "#ffaa00",   // Orange - rockets

  "enemy1": "#ff3300",          // Red-Orange - basic enemies (pops against sky)
  "enemy2": "#cc0000",          // Dark Red - advanced enemies
  "enemyWeapon": "#ffff00",     // Yellow - enemy projectiles

  "explosion": "#ff6600",       // Orange - explosions
  "particles": "#ffffff",       // White - debris/particles

  "hud": "#ffffff",             // White - UI elements
  "hudWarning": "#ff0000",      // Red - low health warning
  "hudText": "#000000"          // Black - contrasts with bright backgrounds
}
```

### Level 1: "Daybreak Assault" - Colors
```javascript
{
  "skyTop": "#87CEEB",          // Light sky blue - top of screen
  "skyBottom": "#4682B4",       // Steel blue - bottom gradient
  "cloudsFar": "#f0f8ff",       // Alice blue - distant clouds
  "cloudsNear": "#ffffff",      // Pure white - close clouds
  "cloudShadow": "#d3d3d3",     // Light grey - cloud shading
  "ground": "#228b22",          // Forest green - distant pastures
  "groundDetail": "#32cd32",    // Lime green - field highlights
  "sun": "#ffff00",             // Yellow - optional sun element
  "birds": "#8b4513"            // Brown - optional environmental details
}
```

### Future Level Color Palettes
**Level 2 - Maritime:** Ocean blues, wave whites, battleship greys
**Level 3 - Orbital Factory:** Industrial greys, warning yellows, metal silvers
**Level 4 - Deep Space:** Dark backgrounds, star whites, nebula purples/blues

---

## Player Ship Specification

### Visual Design
```
Name: "Phoenix Mark II"
Width: 5 characters
Height: 3 characters

ASCII Art:
  ^
 <o>
 |||

With Thrust (animated - alternates every 100ms):
  ^         ^
 <o>   or  <o>
 |||       |*|
  *         ^
```

### Stats
```javascript
{
  "health": 100,
  "maxHealth": 100,
  "speed": 250,                    // pixels per second
  "hitboxRadius": 8,               // pixels (circular hitbox)
  "respawnInvulnerability": 3000,  // milliseconds
  "startingWeapon": "sniper",
  "startingLives": 3
}
```

### Animation States
1. **Idle** - Base ship design, thrust alternates
2. **Moving Left** - Ship tilts: `<o)`
3. **Moving Right** - Ship tilts: `(o>`
4. **Hit** - Flash white for 100ms
5. **Destroyed** - Explosion animation (see Visual Effects)

---

## Weapon Systems

### Weapon 1: Sniper Laser
```javascript
{
  "id": "sniper",
  "name": "Sniper Laser",
  "projectileChar": "!",
  "projectileColor": "#00ff00",
  "fireRate": 150,              // milliseconds between shots
  "projectileSpeed": 800,       // pixels per second
  "damage": 15,
  "hitboxRadius": 3,            // pixels
  "muzzleFlash": {
    "char": "*",
    "color": "#00ff00",
    "duration": 50              // milliseconds
  },
  "soundEffect": "laser_sniper",
  "maxLevel": 3,
  "upgrades": {
    "level2": { "damage": 20, "fireRate": 120 },
    "level3": { "damage": 30, "fireRate": 100, "projectileChar": "‼" }
  }
}
```

### Weapon 2: Vulcan Cannon
```javascript
{
  "id": "vulcan",
  "name": "Vulcan 50cal",
  "projectileChar": "\"",
  "projectileColor": "#0099ff",
  "fireRate": 80,               // milliseconds between shots (rapid fire)
  "projectileSpeed": 650,       // pixels per second
  "damage": 5,                  // lower damage, higher rate
  "hitboxRadius": 2,
  "spread": 5,                  // pixels of random horizontal offset
  "muzzleFlash": {
    "char": "~",
    "color": "#0099ff",
    "duration": 30
  },
  "soundEffect": "vulcan_fire",
  "maxLevel": 3,
  "upgrades": {
    "level2": { "damage": 7, "spread": 3 },
    "level3": { "damage": 10, "fireRate": 60, "dualBarrels": true }
  }
}
```

### Special Weapon: Rockets
```javascript
{
  "id": "rocket",
  "name": "Homing Rockets",
  "projectileArt": [
    " ^ ",
    " * "
  ],
  "projectileColor": "#ffaa00",
  "fireRate": 500,              // milliseconds (slower, more powerful)
  "projectileSpeed": 400,       // starts slow
  "acceleration": 100,          // speeds up over time
  "damage": 50,
  "hitboxRadius": 5,
  "maxAmmo": 10,
  "homingStrength": 0.3,        // how aggressively it tracks enemies
  "homingActivation": 200,      // milliseconds before homing starts
  "explosionRadius": 30,        // splash damage area
  "muzzleFlash": {
    "chars": ["*", "*", "*"],
    "color": "#ff6600",
    "duration": 100
  },
  "trailEffect": {
    "char": ".",
    "color": "#ffaa00",
    "lifetime": 300,            // milliseconds
    "spawnRate": 50             // trail particle every 50ms
  },
  "soundEffect": "rocket_launch"
}
```

---

## Enemy Specifications

### Enemy Type 1: Scout
```javascript
{
  "id": "scout",
  "name": "Scout Fighter",
  "art": "{[::]}",
  "width": 5,
  "height": 1,
  "color": "#ff0000",
  "health": 10,
  "hitboxRadius": 8,
  "speed": 120,
  "scoreValue": 100,

  "movement": {
    "type": "sine_wave",
    "amplitude": 50,            // pixels of horizontal movement
    "frequency": 2,             // cycles per second
    "baseSpeed": 120            // downward pixels per second
  },

  "weapon": {
    "projectileChar": "·",
    "projectileColor": "#ffff00",
    "fireRate": 2000,           // milliseconds
    "projectileSpeed": 300,
    "damage": 10,
    "aimAtPlayer": false        // fires straight down
  },

  "dropTable": {
    "health_small": 0.3,        // 30% chance
    "weapon_powerup": 0.1,      // 10% chance
    "nothing": 0.6              // 60% nothing
  }
}
```

### Enemy Type 2: Gunship
```javascript
{
  "id": "gunship",
  "name": "Heavy Gunship",
  "art": [
    " _||_ ",
    "<||||>",
    " ‾||‾ "
  ],
  "width": 6,
  "height": 3,
  "color": "#ff00ff",
  "health": 30,
  "hitboxRadius": 12,
  "speed": 60,
  "scoreValue": 250,

  "movement": {
    "type": "descent_and_hover",
    "descendTo": 150,           // Y position to stop at
    "speed": 60,
    "hoverPattern": "drift",    // slight left-right movement
    "driftAmount": 20
  },

  "weapon": {
    "projectileChar": "¦",
    "projectileColor": "#ffff00",
    "fireRate": 1200,
    "projectileSpeed": 400,
    "damage": 15,
    "aimAtPlayer": true,
    "burstCount": 3,            // fires 3 shots
    "burstDelay": 150           // 150ms between burst shots
  },

  "dropTable": {
    "health_large": 0.2,
    "weapon_powerup": 0.3,
    "rocket_ammo": 0.2,
    "nothing": 0.3
  }
}
```

### Enemy Type 3: Kamikaze Drone
```javascript
{
  "id": "kamikaze",
  "name": "Kamikaze Drone",
  "art": "(@@)",
  "width": 4,
  "height": 1,
  "color": "#ff6600",
  "health": 5,
  "hitboxRadius": 6,
  "speed": 200,
  "scoreValue": 150,

  "movement": {
    "type": "chase_player",
    "acceleration": 150,        // speeds up toward player
    "maxSpeed": 300,
    "trackingStrength": 0.8     // how directly it homes in
  },

  "weapon": null,               // explodes on contact

  "deathBehavior": {
    "type": "explosion",
    "damage": 25,
    "radius": 40,               // damages player if close
    "damagesEnemies": true      // can chain-react
  },

  "dropTable": {
    "nothing": 1.0              // no drops, they explode
  }
}
```

---

## Visual Effects

### Explosion Animation (Small - Enemy Death)
```javascript
{
  "name": "explosion_small",
  "frames": [
    { "char": "*", "color": "#ffffff", "duration": 50 },
    { "char": "@", "color": "#ffff00", "duration": 50 },
    { "char": "#", "color": "#ff6600", "duration": 60 },
    { "char": "%", "color": "#ff3300", "duration": 60 },
    { "char": "+", "color": "#ff0000", "duration": 70 },
    { "char": "·", "color": "#660000", "duration": 80 }
  ],
  "totalDuration": 370,
  "expandSize": true,           // chars get slightly larger/spaced
  "particles": {
    "count": 8,
    "char": "·",
    "initialColor": "#ffff00",
    "fadeToColor": "#660000",
    "speed": 100,               // pixels per second outward
    "lifetime": 400             // milliseconds
  }
}
```

### Explosion Animation (Large - Player Death, Boss Parts)
```javascript
{
  "name": "explosion_large",
  "frames": [
    { "char": "█", "color": "#ffffff", "duration": 60 },
    { "char": "@", "color": "#ffff00", "duration": 60 },
    { "char": "#", "color": "#ff6600", "duration": 70 },
    { "char": "%", "color": "#ff3300", "duration": 70 },
    { "char": "+", "color": "#ff0000", "duration": 80 },
    { "char": "·", "color": "#660000", "duration": 100 }
  ],
  "totalDuration": 440,
  "expandSize": true,
  "particles": {
    "count": 20,
    "char": "*",
    "initialColor": "#ffffff",
    "fadeToColor": "#330000",
    "speed": 150,
    "lifetime": 600
  },
  "screenShake": {
    "intensity": 8,             // pixels
    "duration": 300             // milliseconds
  }
}
```

### Muzzle Flash Effect
```javascript
{
  "name": "muzzle_flash",
  "type": "overlay",
  "offsetY": -5,                // pixels above weapon origin
  "fadeOut": true,
  "inheritWeaponColor": true
}
```

### Impact/Hit Effect
```javascript
{
  "name": "projectile_impact",
  "frames": [
    { "char": "*", "color": "#ffffff", "duration": 40 },
    { "char": "·", "color": "#ffff00", "duration": 40 }
  ],
  "particles": {
    "count": 3,
    "char": "·",
    "speed": 80,
    "lifetime": 200
  }
}
```

### Thrust/Engine Trail
```javascript
{
  "name": "engine_trail",
  "char": "·",
  "color": "#ff6600",
  "spawnRate": 50,              // new particle every 50ms
  "particleLifetime": 200,      // fades over 200ms
  "speed": -100,                // moves opposite to ship direction
  "fadeOut": true
}
```

---

## Audio Design Guidelines

### Sound Categories

**Weapon Sounds (16-bit style, punchy)**
- `laser_sniper` - Sharp, focused energy beam (think SNES Contra)
- `vulcan_fire` - Rapid staccato bursts (mechanical, percussive)
- `rocket_launch` - Deep whoosh with power (bass-heavy)
- `weapon_switch` - Quick menu blip

**Impact/Hit Sounds**
- `enemy_hit` - Light impact, satisfying "thunk"
- `player_hit` - Sharper, more alarming
- `explosion_small` - Quick pop with bass
- `explosion_large` - Deeper, more resonant

**UI Sounds**
- `menu_select` - Clean blip
- `menu_confirm` - Positive chime
- `pause` - Distinct pause tone
- `game_over` - Descending tone sequence

**Ambient/Music**
- Background music: 16-bit chiptune style, driving rhythm
- Tempo: 140-160 BPM for action feel
- Boss music: More intense, layered

### Audio Mix Levels
```javascript
{
  "masterVolume": 0.7,
  "musicVolume": 0.4,
  "sfxVolume": 0.8,
  "maxSimultaneousSounds": 16   // prevent audio spam
}
```

---

## Control Schemes

### Keyboard (Primary)
```javascript
{
  "movement": {
    "up": "W",
    "left": "A",
    "down": "S",
    "right": "D"
  },
  "combat": {
    "shoot": "SPACE",
    "switchWeapon": "E",
    "specialWeapon": "R",
    "bomb": "Q"
  },
  "game": {
    "pause": "ESC",
    "confirm": "ENTER"
  }
}
```

### Gamepad (Xbox Layout)
```javascript
{
  "movement": {
    "leftStick": true,          // analog movement
    "dpad": true                // alternative
  },
  "combat": {
    "shoot": "A",               // face button bottom
    "switchWeapon": "X",        // face button left
    "specialWeapon": "RT",      // right trigger
    "bomb": "RB"                // right bumper
  },
  "game": {
    "pause": "START",
    "confirm": "A"
  }
}
```

### Input Settings
```javascript
{
  "deadzone": 0.15,             // for analog sticks
  "repeatDelay": 300,           // ms before key repeat
  "repeatRate": 50              // ms between repeats
}
```

---

## Level 1 Background System

### Parallax Layers (Front to Back)
```javascript
{
  "layers": [
    {
      "name": "Sky Gradient",
      "type": "gradient",
      "colorTop": "#87CEEB",
      "colorBottom": "#4682B4",
      "scrollSpeed": 0,
      "zIndex": 0
    },
    {
      "name": "Far Clouds",
      "type": "ascii_pattern",
      "pattern": "░▒",
      "color": "#f0f8ff",
      "scrollSpeed": 20,
      "density": 0.3,
      "yRange": [50, 250],
      "zIndex": 1
    },
    {
      "name": "Near Clouds",
      "type": "ascii_pattern",
      "pattern": "▒▓█",
      "color": "#ffffff",
      "shadowColor": "#d3d3d3",
      "scrollSpeed": 40,
      "density": 0.2,
      "yRange": [100, 400],
      "zIndex": 2
    },
    {
      "name": "Ground Layer",
      "type": "ascii_pattern",
      "pattern": "═≡-",
      "color": "#228b22",
      "highlightColor": "#32cd32",
      "scrollSpeed": 80,
      "yPosition": 550,
      "parallaxDepth": 0.9,
      "zIndex": 3
    }
  ]
}
```

### Cloud Generation
```javascript
{
  "cloudTypes": [
    {
      "size": "small",
      "ascii": "░░▒░",
      "width": 4,
      "spawnChance": 0.4
    },
    {
      "size": "medium",
      "ascii": [
        " ░▒▓▒░ ",
        "░▒▓█▓▒░"
      ],
      "width": 8,
      "spawnChance": 0.4
    },
    {
      "size": "large",
      "ascii": [
        "  ░▒▓▓▒░  ",
        " ░▒▓██▓▒░ ",
        "░▒▓████▓▒░"
      ],
      "width": 12,
      "spawnChance": 0.2
    }
  ],
  "spawnRate": 2000,            // milliseconds between cloud spawns
  "randomOffset": 1000          // random variance in spawn timing
}
```

### Environmental Details (Optional)
```javascript
{
  "birds": {
    "enabled": true,
    "ascii": "v",
    "color": "#8b4513",
    "flightPattern": "sine_wave",
    "speed": 80,
    "spawnChance": 0.1,
    "flockSize": [1, 5]
  },
  "sun": {
    "enabled": false,           // optional sun in corner
    "ascii": "☼",
    "color": "#ffff00",
    "position": { "x": 700, "y": 100 },
    "glow": true
  }
}
```

---

## Asset Naming Conventions

### File Structure
```
/assets
  /sprites
    /player
      player_ship.json
      player_thrust_1.json
      player_thrust_2.json
    /enemies
      scout.json
      gunship.json
      kamikaze.json
    /weapons
      sniper_projectile.json
      vulcan_projectile.json
      rocket_projectile.json
    /effects
      explosion_small.json
      explosion_large.json
      muzzle_flash.json
    /backgrounds
      /level1_daybreak
        clouds_small.json
        clouds_medium.json
        clouds_large.json
        background_config.json
      /level2_maritime
        (future)
      /level3_orbital
        (future)
      /level4_space
        (future)
  /audio
    /music
      level_1_daybreak.ogg
      level_2_maritime.ogg
      boss_theme.ogg
    /sfx
      laser_sniper.ogg
      vulcan_fire.ogg
      explosion_small.ogg
```

### JSON Asset Format
```javascript
{
  "name": "scout",
  "type": "enemy",
  "version": "1.0",
  "frames": [
    {
      "ascii": "{[::]}",
      "width": 5,
      "height": 1,
      "color": "#ff0000",
      "duration": 0              // 0 for static
    }
  ],
  "metadata": {
    "author": "Matt Lepley",
    "created": "2025-11-21",
    "notes": "Basic scout enemy"
  }
}
```

---

## Notes for Implementation

1. **Start Simple** - Implement static sprites first, add animation later
2. **Test Performance** - Profile with 50+ entities before adding more complexity
3. **Iterate on Feel** - Adjust speeds, fire rates, and effects based on playtesting
4. **Data-Driven** - All specs above should load from JSON, not hard-coded
5. **Version Control** - Track changes to this document as game evolves

---

**Next Steps:**
1. Review and approve this GDB
2. Begin Canvas rendering system implementation
3. Implement player ship + one weapon
4. Add first enemy type
5. Test collision detection
6. Iterate and expand

---

*This is a living document. Update as the game evolves.*
