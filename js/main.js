var playerWeapons = {
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
		use: function(){
			this.currentAmmo--;
			updateUI({weapon: "rocket"});
		}
	},
	grenade: {
		speed: 1000
		
	},
	laser: {
		speed: 10
		
	}
};

var player = {
	ship: null,
	_x: 0,
	_y: 0,
	updateCoords: function(x, y){
		this._x = x;
		this._y = y;
	},
	shoot: function(options) {
		console.log("Shot fired!");
		this.shotsFired++;
		
		var shot = options.shot.clone().addClass("shot-fired").appendTo("body"),
			fx = $("#shot-fx1").clone().appendTo("body");
		
		fx.css({
			left: options.x - 17,
			top: options.y - 10
		}).show();
		
		shot.css({
			left: options.x + 11,
			top: options.y - 3
		}).animate({ top: 0 }, 300, function(){
			$(this).remove();
			fx.remove();
		});
	},
	weapons: null,
	getCurrentWeapon: function() {
		return this.currentWeapon;
	},
	setCurrentWeapon: function() {
		this.currentWeapon = $("#player-ship .current-weapon");
	},
	switchWeapons: function () {
		console.log("Switched weapons");
		
		var uiOldWeapon = $(".ui-current-weapon"),
			uiNewWeapon = uiOldWeapon.next(".weapon"),
			oldWeapon = $("#player-ship .current-weapon"),
			newWeapon = oldWeapon.next(".weapon"),
			weapons = player.weapons;
		
		// update UI
		uiOldWeapon.removeClass("ui-current-weapon");
		if (uiNewWeapon.length > 0) {
			uiNewWeapon.addClass("ui-current-weapon");
		} else {
			$(player.uiWeapons[0]).addClass("ui-current-weapon");
		}
		
		// update player ship
		logplayer();
		console.log(player.getCurrentWeapon());
		oldWeapon.removeClass("current-weapon");
		if (newWeapon.length > 0) {
			newWeapon.addClass("current-weapon");
		} else {
			$(player.weapons[0]).addClass("current-weapon");
		}
		this.setCurrentWeapon();
	},
	shotsFired: 0
};

function updateUI(options){
	switch (options.weapon){
		case "rocket":
			$("#ui-rocket-weapon .ammo").text(playerWeapons.rocket.currentAmmo);
			break;
	}
}

function logplayer() {
	console.log(player);
}


// Document ready
$(function() {
	
	// Initialize more player settings
	player.ship = $("#player-ship");
	player.updateCoords(player.ship.offset().left, player.ship.offset().top);
	
	// Add weapons
	player.weapons = $("#player-ship .weapon");
	player.setCurrentWeapon();
	player.uiWeapons = $("#hud #weapons").children();
	player.uiCurrentWeapon = $("#hud .ui-current-weapon");
	
	// Add <player> for debug. Just for kicks
	logplayer();
	
	
	// Player ship controls
	$(document).keydown(function(e) {
		switch (e.which) {
			case 87:	// W
				player.ship.css({ bottom: "+=10" });
				player.updateCoords(player.ship.offset().left, player.ship.offset().top);
				break;
			case 65:	// A
				player.ship.css({ left: "-=10" });
				player.updateCoords(player.ship.offset().left, player.ship.offset().top);
				break;
			case 83:	// S
				player.ship.css({ bottom: "-=10" });
				player.updateCoords(player.ship.offset().left, player.ship.offset().top);
				break;
			case 68:	// D
				player.ship.css({ left: "+=10" });
				player.updateCoords(player.ship.offset().left, player.ship.offset().top);
				break;
			case 32:	// space
				player.shoot({
					x: player._x,
					y: player._y,
					shot: player.currentWeapon
				});
				break;
			case 69:	// E
				player.switchWeapons();
				break;
			case 82:	// R
				if (playerWeapons.rocket.currentAmmo > 0){
					player.shoot({
						x: player._x,
						y: player._y,
						shot: $("#rocket")
					});
					playerWeapons.rocket.use();
				}
				break;
		}
	});
	
	var firstEnemy = new Enemy();
	
});

// to do
// collision detection
// weapon fire speeds
// enemy movement