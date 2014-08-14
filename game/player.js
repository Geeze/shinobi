//PLAYER STUFF
var Player = function (xx, yy) {

	this.x = xx;
	this.y = yy;
	this.char = "@";
	this.color = "#000";

	this.inShadow = false;

	this.points = 0;
	this.kills = 0;

};
Player.prototype.act = function () {
	this.points += 1;
	Heat.spread();

	var dp = Util.cam(this.x, this.y);
	Game.display.draw(dp.x, dp.y, this.char, this.color, Game.level.getBg(this.x, this.y));
	Game.engine.lock();
	window.addEventListener("keydown", this);
	window.addEventListener("mousedown", this.mouse);

};
Player.prototype.handleEvent = function (e) {
	//Define keys.
	var keyMap = {};
	var actionKeys = {};
	//ARROWS
	keyMap[38] = 0; //UP
	keyMap[33] = 1; //UPRIGHT
	keyMap[39] = 2; //And so on
	keyMap[34] = 3;
	keyMap[40] = 4;
	keyMap[35] = 5;
	keyMap[37] = 6;
	keyMap[36] = 7;

	//NUMPAD
	keyMap[104] = 0; //UP
	keyMap[105] = 1; //UPRIGHT
	keyMap[102] = 2; //And so on
	keyMap[99] = 3;
	keyMap[98] = 4;
	keyMap[97] = 5;
	keyMap[100] = 6;
	keyMap[103] = 7;

	actionKeys[190] = "wait"; //Period
	actionKeys[101] = "wait"; //Numpad 5
	actionKeys[83] = "smoke";

	var code = e.keyCode;

	if (code == 72) {
		Heat.draw();
	}

	if (!(code in keyMap) && !(code in actionKeys)) {
		return;
	} //Dont do anything if invalid key is pressed.
	if (code in keyMap) {
		var dir = ROT.DIRS[8][keyMap[code]];
		var newX = dir[0] + this.x;
		var newY = dir[1] + this.y;
		//var newKey = newX + "," + newY;
		//var newTile = Game.level.tiles[newKey];

		//Moving
		if (Util.walkable(newX, newY)) {
			//This is the part where we kill the lord(batman)
			if (Game.lord) {
				if (Game.lord.x == newX && Game.lord.y == newY) {
					Console.message("%b{red}You %c{yellow}kill%c{} the %c{blue}Lord%c{}.");
					Console.message("Victory.");
					Console.message("%c{grey}You commit sudoku");
					Console.message("Your mission took %c{yellow}" + this.points + " %c{}turns");
					Console.message("Lords slaughtered so far: %c{yellow}" + (++this.kills));
					window.removeEventListener("keydown", this);
					window.removeEventListener("mousedown", this.mouse);

					//New level
					var lvl = new TileLevel(70, 25);
					lvl.generate();
					Game.level.unload();
					lvl.load();
					var p = Util.findFree(lvl);
					//Game.player = new Player(p.x, p.y);
					Game.player.x = p.x;
					Game.player.y = p.y;
					lvl.guards.forEach(function (g) {
						p = Util.findFree(lvl);
						g.startPatrol(p.x, p.y); //Start patrol
					});

					Heat.init();
					Game.engine.unlock();
					return;
				}
			}
			//This is the part where we stun the guards
			var me = this;
			Game.guards.forEach(function (g) {
				if (g.x == newX && g.y == newY) {
					g.state = "stunned";
					g.stuntime = 5;
					Console.message("You %c{yellow}knock%c{} the %c{green}Guard%c{} down.");
					newX = me.x;
					newY = me.y;
					return;
				}
			});
			var newTile = Game.level.tiles[newX + "," + newY];
			console.log(newTile);
			if (newTile.trigger) {
				newTile.trigger();
			} else {
				//var old = Game.level.tiles[this.x + "," + this.y];
				//Game.display.draw(old.x, old.y, old.char, old.color, old.bg);
				this.x = newX;
				this.y = newY;
				this.inShadow = newTile.shadow;
				Console.message("%c{grey}You sneak around."); //Displayed only if not the most recent message.
			}
		} else {
			return;
		}

	}
	if (code in actionKeys) {
		if (actionKeys[code] == "wait") {}
		if (actionKeys[code] == "smoke") {
			var smoke = new SmokeBomb(this.x, this.y);
			console.log("Smoke at "+ this.x + "," + this.y);
			}
		}

		//Render
		this.draw();

		//On to next turn
		window.removeEventListener("keydown", this);
		Game.engine.unlock();

	};

	Player.prototype.fovCallback = function (x, y, r, visibility) {

		var tile,
		key;
		key = x + "," + y;
		tile = Game.level.tiles[key];
		var dp = Util.cam(x, y);
		//If no tile dont do anything
		if (!tile) {
			return;
		}
		//If tile further in shadow dont do anything
		//if(r > 10 && tile.shadow) {return;}
		if (!tile.shadow)
			Game.display.draw(dp.x, dp.y, tile.char, tile.color, tile.bg);
		else
			Game.display.draw(dp.x, dp.y, tile.char, tile.color, tile.midlit);
		Game.drawfov[x + "," + y] = true;

	};

	Player.prototype.draw = function () {
		Game.level.draw();
		Game.drawfov = {};
		Game.fov.compute(this.x, this.y, 20, this.fovCallback);
		var dp = Util.cam(this.x, this.y);
		Game.display.draw(dp.x, dp.y, this.char, this.color, Game.level.getBg(this.x, this.y));
	};

	Player.prototype.mouse = function (e) {
		var p = Game.display.eventToPosition(e);
		if (p == [-1, -1])
			return;
		var x,
		y;
		x = p[0];
		y = p[1];
		var b = {};
		b.keyCode = 0;
		//COORD to KEYCODE
		if (x < 25) {
			if (y < 10)
				b.keyCode = 36;
			if (y > 15)
				b.keyCode = 35;
			if (y > 10 && y < 15)
				b.keyCode = 37;
		} else if (x > 45) {
			if (y < 10)
				b.keyCode = 33;
			if (y > 15)
				b.keyCode = 34;
			if (y > 10 && y < 15)
				b.keyCode = 39;
		} else {
			if (y < 10)
				b.keyCode = 38;
			if (y > 15)
				b.keyCode = 40;
			if (y > 10 && y < 15)
				b.keyCode = 0;
		}
		//alert(b); alert(b.code);
		Game.player.handleEvent(b);

	};
