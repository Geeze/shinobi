ROT.DEFAULT_WIDTH = 70;
ROT.DEFAULT_HEIGHT = 25;
ROT.Display.Rect.cache = true;

var Game = { //Game container

	//ENGINE
	display: null,
	map: null,
	engine: null,
	player: null,
	//CONSTANST
	gameWidth: 70,
	gameHeight: 25,
	
	fov: null,
	
	
	init: function () {
		this.display = new ROT.Display({width: this.gameWidth, height: 25});
		document.body.appendChild(this.display.getContainer());
		//CREATE MAP
		//Deal with the devil
		//ROT.RNG.setSeed(666);
		
		this.map = new TileMap(this.gameWidth, 25);
		var gen = new ROT.Map.Digger(this.gameWidth, 25, {dugPercentage: 0.5, roomHeight: [5, 10], roomWidth: [5, 10]});
		var digCallback = function (xx, yy, value) {
			var tile = {
				//#MAPCOLOR
				x: xx,
				y: yy,
				char: " ",
				color: value ? "#333" : "#aaa",
				type: value ? "wall" : "floor",
				bg: value ? "#333" : "#efe",
				unlit: value ? "#000" : "#454"
			};
			Game.map.tiles[xx + "," +  yy] = tile;
		};
		gen.create(digCallback);
		//CREATE SCHEDULER
		var scheduler = new ROT.Scheduler.Simple();
		this.engine = new ROT.Engine(scheduler);
		var findFree = function(){
			var pX, pY;
			do {
				pX = ROT.RNG.getUniform() * (Game.gameWidth - 2) + 1;
				pY = ROT.RNG.getUniform() * (Game.gameHeight- 2) + 1;
				pX = Math.floor(pX);
				pY = Math.floor(pY);
			} while (Game.map.tiles[pX + "," + pY].type == "wall");
			return {x: pX, y: pY};
		};
		var p = findFree();
		this.player = new Player(p.x,p.y);
		p = findFree();
		
		scheduler.add(new Guard(p.x, p.y), true);
		scheduler.add(this.player, true);
		//CREATE FOV and draw first turn
		this.fov = new ROT.FOV.PreciseShadowcasting(lightPasses);
		//first draw before turn 1
		Game.map.draw();
		Game.fov.compute(Game.player.x, Game.player.y, 20, Game.player.fovCallback);
		Game.display.draw(Game.player.x, Game.player.y, Game.player.char, Game.player.color, "yellow");
		
	}

};
//MAP STUFF
var TileMap = function (w, h) { //Class for base map functionality
	this.tiles = {};
	this.w = w;
	this.h = h;
};
/* TILE SYNTAX
var tile = {
	x:
	y:
	char:
	color:
	type: //wall ? floor
	bg:
	unlit:
*/

TileMap.prototype.draw = function () {

	for (var i = 0; i < this.w; i++){
		for (var j = 0; j < this.h; j++){
			var tile = this.tiles[i + "," + j];
			if(tile !== null)
				Game.display.draw(i, j ,tile.char, tile.color, tile.unlit);//TODO Add color
		}
	}


};
var lightPasses = function(x, y){
	var key = x + "," + y;
	if(!(key in Game.map.tiles)) return false;
	var tile = Game.map.tiles[key];
	if (tile.type == "floor") { return true; }
	else { return false; }
};
//PLAYER STUFF
var Player = function(xx, yy) {
	this.x = xx;
	this.y = yy;
	this.char = "@";
	this.color = "#000";
	
};
Player.prototype.act = function(){
	
	
	Game.engine.lock();
	window.addEventListener("keydown", this);
};
Player.prototype.handleEvent = function(e){
	var keyMap = {};
	keyMap[38] = 0;
	keyMap[33] = 1;
	keyMap[39] = 2;
	keyMap[34] = 3;
	keyMap[40] = 4;
	keyMap[35] = 5;
	keyMap[37] = 6;
	keyMap[36] = 7;
	
	var code = e.keyCode;
	if(!(code in keyMap)){ return;}
	
	var dir = ROT.DIRS[8] [keyMap[code]];
	var newX = dir[0] + this.x;
	var newY = dir[1] + this.y;
	var newKey = newX + "," + newY;
	var newTile = Game.map.tiles[newKey];
	
	if(newTile.type == "floor"){
		var old = Game.map.tiles[this.x + "," + this.y];
		Game.display.draw(old.x, old.y, old.char, old.color, old.bg);
		this.x = newX;
		this.y = newY;
		
	} else { return; }	
	
	Game.map.draw();
	Game.fov.compute(this.x, this.y, 20, this.fovCallback);
	Game.display.draw(this.x, this.y, this.char, this.color, "yellow");
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
};

var Guard = function(xx, yy) {
	this.x = xx;
	this.y = yy;
	this.char = "G";
	this.color = "#000";
	this.bg = "#393";
};
Guard.prototype.act = function(){

	
	Game.display.draw(this.x, this.y,  this.char, this.color, this.bg);
};


Game.init();
Game.engine.start();


