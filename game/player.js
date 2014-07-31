//PLAYER STUFF
var Player = function(xx, yy) {

	this.x = xx;
	this.y = yy;
	this.char = "@";
	this.color = "#000";

	this.points = 0;
};
Player.prototype.act = function(){
	this.points += 1;
	heatSpread();
	
	Game.display.draw(this.x, this.y, this.char, this.color, "yellow");
	Game.engine.lock();
	window.addEventListener("keydown", this);
	window.addEventListener("mousedown", this.mouse);
	
};
Player.prototype.handleEvent = function(e){
	//Define keys.
	var keyMap = {};
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
	

	
	
	var code = e.keyCode;
	
	if(code == 72){
		heatDraw();
	}
	
	if(!(code in keyMap)){ return;} //Dont do anything if invalid key is pressed.

	var dir = ROT.DIRS[8] [keyMap[code]];
	var newX = dir[0] + this.x;
	var newY = dir[1] + this.y;
	var newKey = newX + "," + newY;
	var newTile = Game.map.tiles[newKey];
	
	//Moving
	if(newTile.type == "floor"){
		//This is the part where we kill the lord(batman)
		if(Game.lord){
			if(Game.lord.x == newX && Game.lord.y == newY){
				Console.message("%b{red}You %c{yellow}kill%c{} the %c{blue}Lord%c{}.");
				Console.message("Victory.");
				Console.message("%c{grey}You commit sudoku");
				Console.message("Your mission took %c{yellow}" + this.points + " %c{}turns");
				window.removeEventListener("keydown", this);
				Game.engine.lock();
				return;
			}
		}
		//This is the part where we stun the guards
		var me = this;
		Game.guards.forEach(function(g){
			if(g.x == newX && g.y == newY){
				g.state = "stunned";
				g.stuntime = 5;
				Console.message("You %c{yellow}knock%c{} the %c{green}Guard%c{} down.");
				newX = me.x;
				newY = me.y;
				return;
			}
		});
	
	
		var old = Game.map.tiles[this.x + "," + this.y];
		Game.display.draw(old.x, old.y, old.char, old.color, old.bg);
		this.x = newX;
		this.y = newY;
		Console.message("%c{grey}You sneak around.");//Displayed only if not the most recent message.
	} else { return; }

	//Render
	Game.map.draw();
	Game.drawfov = {};
	Game.fov.compute(this.x, this.y, 20, this.fovCallback);
	Game.display.draw(this.x, this.y, this.char, this.color, "yellow");
	
	//On to next turn
	window.removeEventListener("keydown", this);
	Game.engine.unlock();
	
};

Player.prototype.fovCallback = function(x, y, r, visibility){

	var tile, key;
	//if(!(key in Game.map.tiles)) return;
	key = x + "," + y;
	tile = Game.map.tiles[key];
	//alert(x + "," + y);
	if(!tile) { return; }
	Game.display.draw(x, y, tile.char, tile.color, tile.bg);
	Game.drawfov[x + "," + y] = true;
	
};

Player.prototype.mouse = function(e){
	var p = Game.display.eventToPosition(e);
	if(p == [-1, -1]) return;
	var x,y;
	x = p[0];
	y = p[1];
	var b = {};
	b.keyCode = 0;
	//COORD to KEYCODE
	if(x < 25){
		if(y < 10) b.keyCode = 36;
		if(y > 15) b.keyCode = 35;
		if(y > 10 && y < 15) b.keyCode = 37;
	} else if(x > 45) {
		if(y < 10) b.keyCode = 33;
		if(y > 15) b.keyCode = 34;
		if(y > 10 && y < 15) b.keyCode = 39;
	} else {
		if(y < 10) b.keyCode = 38;
		if(y > 15) b.keyCode = 40;
		if(y > 10 && y < 15) b.keyCode = 0;
	}
	//alert(b); alert(b.code);
	Game.player.handleEvent(b);
	
};
