import { Enemy } from './enemies.js';

const playerWeapons = {
  sniper: {
    speed: 100
  },
  vulcan: {
    speed: 400
  },
  rocket: {
    speed: 700,
    maxAmmo: 50,
    currentAmmo: 10,
    use() {
      this.currentAmmo--;
      updateUI({ weapon: "rocket" });
    }
  },
  grenade: {
    speed: 1000
  },
  laser: {
    speed: 10
  }
};

const player = {
  ship: null,
  _x: 0,
  _y: 0,
  updateCoords(x, y) {
    this._x = x;
    this._y = y;
  },
  shoot(options) {
    console.log("Shot fired!");
    this.shotsFired++;

    const shot = options.shot.cloneNode(true);
    shot.classList.add("shot-fired");
    document.body.appendChild(shot);

    const fx = document.getElementById("shot-fx1").cloneNode(true);
    document.body.appendChild(fx);

    fx.style.left = `${options.x - 17}px`;
    fx.style.top = `${options.y - 10}px`;
    fx.style.display = 'block';

    shot.style.left = `${options.x + 11}px`;
    shot.style.top = `${options.y - 3}px`;

    // Animate shot to top using Web Animations API
    shot.animate(
      [
        { top: `${options.y - 3}px` },
        { top: '0px' }
      ],
      {
        duration: 300,
        easing: 'linear'
      }
    ).onfinish = () => {
      shot.remove();
      fx.remove();
    };
  },
  weapons: null,
  getCurrentWeapon() {
    return this.currentWeapon;
  },
  setCurrentWeapon() {
    this.currentWeapon = document.querySelector("#player-ship .current-weapon");
  },
  switchWeapons() {
    console.log("Switched weapons");

    const uiOldWeapon = document.querySelector(".ui-current-weapon");
    const uiNewWeapon = uiOldWeapon.nextElementSibling?.classList.contains("weapon")
      ? uiOldWeapon.nextElementSibling
      : null;
    const oldWeapon = document.querySelector("#player-ship .current-weapon");
    const newWeapon = oldWeapon.nextElementSibling?.classList.contains("weapon")
      ? oldWeapon.nextElementSibling
      : null;

    // Update UI
    uiOldWeapon.classList.remove("ui-current-weapon");
    if (uiNewWeapon) {
      uiNewWeapon.classList.add("ui-current-weapon");
    } else {
      player.uiWeapons[0].classList.add("ui-current-weapon");
    }

    // Update player ship
    logplayer();
    console.log(player.getCurrentWeapon());
    oldWeapon.classList.remove("current-weapon");
    if (newWeapon) {
      newWeapon.classList.add("current-weapon");
    } else {
      player.weapons[0].classList.add("current-weapon");
    }
    this.setCurrentWeapon();
  },
  shotsFired: 0
};

function updateUI(options) {
  switch (options.weapon) {
    case "rocket":
      document.querySelector("#ui-rocket-weapon .ammo").textContent = playerWeapons.rocket.currentAmmo;
      break;
  }
}

function logplayer() {
  console.log(player);
}

// Document ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize more player settings
  player.ship = document.getElementById("player-ship");
  const rect = player.ship.getBoundingClientRect();
  player.updateCoords(rect.left, rect.top);

  // Add weapons
  player.weapons = Array.from(document.querySelectorAll("#player-ship .weapon"));
  player.setCurrentWeapon();
  player.uiWeapons = Array.from(document.querySelector("#hud #weapons").children);
  player.uiCurrentWeapon = document.querySelector("#hud .ui-current-weapon");

  // Add player for debug
  logplayer();

  // Player ship controls
  document.addEventListener('keydown', (e) => {
    const shipStyle = player.ship.style;
    const currentBottom = parseInt(getComputedStyle(player.ship).bottom) || 10;
    const currentLeft = parseInt(getComputedStyle(player.ship).left) || 0;

    switch (e.which || e.keyCode) {
      case 87: // W
        shipStyle.bottom = `${currentBottom + 10}px`;
        const rectW = player.ship.getBoundingClientRect();
        player.updateCoords(rectW.left, rectW.top);
        break;
      case 65: // A
        shipStyle.left = `${currentLeft - 10}px`;
        const rectA = player.ship.getBoundingClientRect();
        player.updateCoords(rectA.left, rectA.top);
        break;
      case 83: // S
        shipStyle.bottom = `${currentBottom - 10}px`;
        const rectS = player.ship.getBoundingClientRect();
        player.updateCoords(rectS.left, rectS.top);
        break;
      case 68: // D
        shipStyle.left = `${currentLeft + 10}px`;
        const rectD = player.ship.getBoundingClientRect();
        player.updateCoords(rectD.left, rectD.top);
        break;
      case 32: // space
        e.preventDefault(); // Prevent page scroll
        player.shoot({
          x: player._x,
          y: player._y,
          shot: player.currentWeapon
        });
        break;
      case 69: // E
        player.switchWeapons();
        break;
      case 82: // R
        if (playerWeapons.rocket.currentAmmo > 0) {
          player.shoot({
            x: player._x,
            y: player._y,
            shot: document.getElementById("rocket")
          });
          playerWeapons.rocket.use();
        }
        break;
    }
  });

  const firstEnemy = new Enemy();
});

// TODO:
// - collision detection
// - weapon fire speeds
// - enemy movement
