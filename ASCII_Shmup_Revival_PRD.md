# ASCII Shmup Revival - Product Requirements Document

## **Project Overview:**

The goal of this project is to revive and complete a browser-based shoot 'em up (shmup) game that uses ASCII character artwork as its core visual style. Originally prototyped 11 years ago and recently modernized, this top-down shooter draws inspiration from classics like Raiden and Strikers while incorporating modern weapon systems and game mechanics. The game will feature dynamic ASCII animations that transition between characters to create fluid visual effects, intricately designed enemies and bosses constructed from layered ASCII characters, and an audio experience that captures the weighty, satisfying feel of 16-bit era sounds. The result should be a game that feels as good as it looks and sounds, with the ASCII aesthetic serving as both a technical constraint and creative showcase.

## **Level:**

Easy to Medium

### **Type of Project:**

Game Development, Browser Game, Retro-Inspired Interactive Entertainment

### **Skills Required:**

**Core Technologies:**
* **JavaScript/TypeScript** - Primary game logic and development language
* **HTML5 Canvas** - 2D rendering engine for ASCII graphics and animations
* **CSS3** - UI styling and layout

**Game Development:**
* **Game Loop Architecture** - RequestAnimationFrame-based update/render cycles
* **Collision Detection** - AABB or pixel-perfect collision systems
* **Sprite/Character Animation** - Frame-based ASCII character transitions
* **Particle Systems** - For visual effects and explosions
* **Enemy AI Patterns** - Movement behaviors, attack patterns, formations

**Rendering & Graphics:**
* **Canvas API** or lightweight rendering library (PixiJS, Konva.js)
* **ASCII Art Design** - Character composition and animation sequences
* **Layered Rendering** - For complex bosses and visual depth
* **Camera/Viewport Management** - Scrolling backgrounds and screen shake

**Audio:**
* **Web Audio API** - For dynamic sound mixing and effects
* **Audio libraries** - Howler.js or Tone.js for music/SFX management
* **16-bit Era Sound Design** - SNES/Genesis-style audio composition

**Build & Development Tools:**
* **Vite** or **Webpack** - Module bundling and dev server
* **Git** - Version control
* **ESLint/Prettier** - Code quality and formatting

**Optional Enhancements:**
* **LocalStorage API** - For saving game progress and high scores
* **Game State Management** - For menu systems and level transitions
* **TypeScript** - For type safety in larger codebase

---

## **Key Features & Development Milestones**

### **Milestone 1: PRD and Game Development Bible**

**Objective:** Establish comprehensive design documentation that serves as the single source of truth for all development decisions.

**Deliverables:**
* **Product Requirements Document (PRD)** - This document, detailing project scope, features, and technical specifications
* **Game Development Bible** containing:
  * **Visual Style Guide** - ASCII character palette, animation principles, color scheme (if applicable)
  * **Game Design Document** - Core gameplay mechanics, player abilities, enemy types, weapon systems
  * **Technical Architecture** - Code structure, module organization, data flow
  * **Audio Design Spec** - Sound effect categories, music themes, audio cues (16-bit era inspired)
  * **Level Design Framework** - Pacing guidelines, difficulty curve, boss encounter structure
  * **Asset Inventory** - Catalog of all ASCII art assets, animations, and audio files

**Success Criteria:**
* Clear, actionable documentation that Claude Code can reference throughout development
* Detailed enough to maintain consistency but flexible enough to iterate
* Includes visual mockups of key ASCII art elements and boss designs

---

### **Milestone 2: ASCII Asset Editor**

**Objective:** Create a dedicated tool for designing, animating, and managing all ASCII art assets used in the game.

**Deliverables:**
* **Core Editor Features:**
  * Grid-based ASCII character placement interface
  * Character palette with full ASCII character set
  * Layer system for complex designs (essential for bosses)
  * Real-time preview of animations
  * Color/styling options (foreground/background colors, bold, etc.)
  
* **Animation System:**
  * Frame-based animation editor
  * Timeline view for sequencing frames
  * Onion skinning for smooth animation transitions
  * Frame duration controls
  * Loop/ping-pong animation options
  
* **Asset Management:**
  * Import/Export functionality (JSON format recommended)
  * Asset library browser
  * Categorization (ships, enemies, weapons, effects, backgrounds, bosses)
  * Tagging and search system
  * Version control for assets
  
* **Asset Types Supported:**
  * **Static Assets** - Single-frame elements (UI elements, static decorations)
  * **Animated Assets** - Multi-frame animations (explosions, ship engines, enemy movements)
  * **Composite Assets** - Multi-layer designs (bosses with multiple components)
  * **Background Elements** - Tileable patterns, parallax layers
  * **Particle Templates** - Base designs for particle effects

**Success Criteria:**
* Intuitive interface for rapid asset creation
* Reliable import/export without data loss
* Assets integrate seamlessly into game engine
* Supports all planned asset types (ships, enemies, bosses, effects, backgrounds)
* Saves development time compared to hand-coding ASCII art

---

### **Milestone 3: Modernized Prototype with Tech Stack Implementation**

**Objective:** Establish the core technical foundation with modern tooling and architecture.

**Deliverables:**
* **Development Environment:**
  * Modern build system (Vite/Webpack) with hot-reload
  * Project structure organized by feature/module
  * TypeScript configuration (if applicable)
  
* **Core Game Systems:**
  * Game loop with consistent frame timing
  * Canvas rendering pipeline optimized for ASCII characters
  * Input handling system supporting **keyboard and gamepad**
  * Basic entity system (player, enemies, projectiles)
  * Collision detection framework
  * Asset loading system integrated with editor exports
  
* **Player Ship Prototype:**
  * Controllable player character with smooth movement (keyboard and gamepad)
  * Basic shooting mechanics
  * Simple ASCII animation for ship and projectiles

**Success Criteria:**
* 60 FPS performance on target browsers
* Responsive controls with no input lag on both keyboard and gamepad
* Clean, maintainable code architecture
* Successful rendering of multiple ASCII entities simultaneously
* Seamless integration of assets from the ASCII editor

---

### **Milestone 4: First Level - Complete Gameplay Loop**

**Objective:** Create a fully playable first level with all core gameplay elements.

**Deliverables:**
* **Player Systems:**
  * Multiple weapon types with distinct behaviors
  * Power-up system
  * Health/shield mechanics
  * Death and respawn system
  * Score tracking
  
* **Enemy Types:**
  * At least 3-5 distinct enemy types with unique ASCII designs
  * Wave-based enemy spawning system
  * Varied movement patterns and attack behaviors
  * Enemy projectile systems
  * Death animations and explosions
  
* **Boss Encounter:**
  * Multi-layered ASCII boss design
  * Multiple attack phases
  * Destructible components/weak points
  * Epic entrance and defeat animations
  * Boss health bar UI
  
* **Level Structure:**
  * Scrolling background with ASCII parallax effects
  * Timed wave progression
  * Mid-level intensity variations
  * Boss trigger at level completion

**Success Criteria:**
* Complete level playthrough from start to boss defeat
* Balanced difficulty that's challenging but fair
* Visual variety in enemies and effects
* Satisfying feedback for all player actions

---

### **Milestone 5: Enemy AI Enhancement**

**Objective:** Elevate enemy behavior from basic patterns to engaging, dynamic AI systems.

**Deliverables:**
* **Advanced Movement Patterns:**
  * Swooping attacks
  * Formation flying
  * Evasive maneuvers
  * Screen-edge wrapping behaviors
  
* **Intelligent Targeting:**
  * Predictive aiming systems
  * Player tracking with smoothing
  * Group coordination behaviors
  
* **Difficulty Scaling:**
  * Progressive enemy intelligence
  * Adaptive spawn rates based on player performance
  * Elite enemy variants with enhanced AI
  
* **Boss AI:**
  * Complex multi-phase attack patterns
  * Reactive behaviors based on player position
  * Telegraphed attacks with clear visual cues

**Success Criteria:**
* Enemies feel challenging and unpredictable
* AI behaviors are readable and fair
* Performance remains smooth with multiple AI entities
* Boss fights feel epic and strategic

---

### **Milestone 6: Weapons System V2**

**Objective:** Expand and polish the weapon systems to create deep, satisfying gameplay variety.

**Deliverables:**
* **Primary Weapon Types:**
  * Spread shot, laser, missiles, bombs, etc. (5-7 weapon types minimum)
  * Each with unique ASCII projectile designs and effects
  
* **Power-Up System:**
  * Weapon upgrade tiers (level 1-3 for each weapon)
  * Visual representation of power level in ASCII
  * Collectible power-up drops
  
* **Special Abilities:**
  * Screen-clearing bomb/special attack
  * Temporary shield or invincibility
  * Slow-motion focus mode
  * **Barrel roll invincible dodge** - Temporary invulnerability with evasive roll animation
  * **Teleport** - Short-range instant repositioning ability
  
* **Visual & Audio Feedback:**
  * Distinct ASCII muzzle flashes and impact effects
  * Unique sound effects for each weapon
  * Screen shake and particle effects for powerful weapons

**Success Criteria:**
* Each weapon feels unique and useful in different situations
* Visual feedback makes weapons feel powerful and weighty
* Balanced weapon variety encourages experimentation
* Audio-visual synchronization enhances impact
* Special abilities provide strategic depth and satisfying "get out of jail" moments

---

### **Milestone 7: ASCII Art Style Polish & Background Systems**

**Objective:** Elevate the visual presentation to make the ASCII aesthetic truly shine.

**Deliverables:**
* **Animated ASCII Effects:**
  * Smooth character-to-character transitions for explosions
  * Multi-frame animation cycles for all entities
  * Particle systems using ASCII characters
  * Screen transition effects
  
* **Background & Atmosphere:**
  * Parallax scrolling layers using ASCII patterns
  * Dynamic background elements (clouds, terrain features)
  * Atmospheric ASCII effects (rain, stars, debris)
  
* **UI/HUD:**
  * Retro-styled ASCII-themed interface
  * Health bars, score displays, weapon indicators
  * Menu systems with ASCII art decoration
  
* **Polish & Juice:**
  * Screen shake on impacts
  * Flash effects on hits
  * Smooth camera movements
  * Visual feedback for all player actions

**Success Criteria:**
* Cohesive visual style across all elements
* Smooth 60 FPS with all effects active
* ASCII aesthetic feels intentional and polished, not placeholder
* Visual clarity maintained despite animation complexity

---

### **Milestone 8: Complete V1 Release - Polished First Level**

**Objective:** Deliver a complete, polished gaming experience for the first level that serves as proof of concept for the full game.

**Deliverables:**
* **Complete Game Loop:**
  * Title screen with animated ASCII art
  * How-to-play instructions (keyboard and gamepad controls)
  * Pause menu system
  * Game over and victory screens
  * High score tracking and display
  
* **Audio Integration:**
  * Full 16-bit era style soundtrack
  * Complete sound effect library
  * Audio mixing and balance
  * Mute/volume controls
  
* **Difficulty Options:**
  * Easy/Normal/Hard modes
  * Lives and continue system
  * Balanced progression curve
  
* **Performance Optimization:**
  * Consistent 60 FPS performance
  * Efficient collision detection
  * Optimized rendering pipeline
  * Memory leak prevention
  
* **Quality Assurance:**
  * Bug fixing and testing
  * Browser compatibility (Chrome, Firefox, Safari, Edge)
  * Keyboard and gamepad input validation
  * Balance tuning based on playtesting

**Success Criteria:**
* Complete, enjoyable 5-10 minute gameplay experience
* No critical bugs or performance issues
* Professional presentation with polished menus and UI
* Serves as foundation for additional levels
* Positive playtest feedback on feel and difficulty
* Both keyboard and gamepad controls feel responsive and intuitive

---

## **Instructions for Claude Code:**

### **Development Approach:**
1. **Reference the Game Development Bible** for all design decisions regarding visual style, gameplay mechanics, and audio design
2. **Maintain the ASCII aesthetic** - all visual elements should use character-based rendering, never raster images (except for UI chrome if needed)
3. **Prioritize "game feel"** - every action should have satisfying visual and audio feedback with appropriate weight and impact
4. **Code for modularity** - systems should be independent and reusable for future levels and content
5. **Performance first** - optimize rendering and collision detection to maintain 60 FPS with dozens of entities on screen
6. **Iterative development** - implement basic versions of systems first, then polish and enhance
7. **Use the ASCII Asset Editor** - all game art should be created in the editor and imported as data, not hard-coded

### **Technical Priorities:**
* Keep the codebase clean and well-documented
* Use consistent naming conventions for ASCII art assets
* Implement a flexible entity/component system for easy extension
* Create reusable animation systems for ASCII character transitions
* Build a robust audio system that can layer multiple sounds without performance degradation
* Ensure gamepad support is first-class alongside keyboard controls

### **Testing & Validation:**
* Test on multiple browsers regularly
* Profile performance with full screens of enemies and effects
* Playtest for difficulty balance after each milestone
* Validate that the ASCII aesthetic remains clear and readable at all times
* Test with both keyboard and various gamepad types

---

## **Developer Context:**

This project is a revival of a passion project started over a decade ago. The goal is not just to complete the game, but to demonstrate how ASCII art can be a powerful, expressive medium for modern game development when paired with smooth animations, satisfying game feel, and thoughtful audio design. The aesthetic should feel intentional and premium, not retro for its own sake.

The game should evoke the satisfying weight of classic shmups with the rich audio quality of 16-bit era games, while the ASCII aesthetic provides a unique visual identity. Every bullet, explosion, and enemy should be crafted to maximize the visual and gameplay impact within the constraints of character-based rendering.

The inclusion of the ASCII Asset Editor is critical to development velocity - it allows for rapid iteration on visual designs without diving into code, and ensures consistency across all game assets.
