var C_GROUND_LIT = "#efe";
var C_GROUND_MID = "#898";
var C_GROUND_SHADOW = "#454";
var C_WALL_LIT = "#333";
var C_WALL_MID = "#111";
var C_WALL_SHADOW = "#000";

/*
	bg: value ? "#333" : "#efe",		//Lit tile color
	unlit: value ? "#000" : "#454",	//Unlit tile color
	midlit: value ? "#111" : "#898"
*/

var TileLevel = function (w, h) { //Class for base level functionality
	this.tiles = {};
	this.w = w;
	this.h = h;
	this.actors = new Set();
	this.guards = new Set();
	this.exits = new Set();
};
/* TILE SYNTAX
var tile = {
	x:
	y:
	char:
	color:
	walkable: //wall ? floor
	blocklos:
	bg:
	unlit:
	midlit:
*/
TileLevel.prototype = {
	tiles: null,
	w: null,
	h: null,
	actors: null,
	guards: null,
	
	getBg: function(x, y){
		if(Game.drawfov)
			if(!(x + "," + y in Game.drawfov))
				return this.tiles[x + "," + y].unlit;
		if(Util.distance({x:x,y:y}, Game.player) < 10)
			return this.tiles[x + "," + y].bg;
		else
			return this.tiles[x + "," + y].midlit;
	},

	//Draws whole level.
	draw: function () {
		Game.display.clear();
		var x, y;
		if(!Game.player){
			x = 0;
			y = 0;
		} else {
			var p = Game.player;
			x = p.x - Math.floor(Game.gameWidth/2);
			y = p.y - Math.floor(Game.gameHeight/2);
		}
		var i, j, tile;
		for (i = 0; i < Game.gameWidth; i++){
			for (j = 0; j < Game.gameHeight; j++){
				tile = this.tiles[(x + i) + "," + (y + j)];
				if(tile !== null && tile !== undefined)
					Game.display.draw(i, j ,tile.char, tile.color, tile.unlit);//TODO Add color
			}
		}
		
	},

	load: function () {
		//SPAWN
		//SPAWN CREATURES
		var p = Util.findFree(this);
		var g = null;
		var i;
		for (i = 0; i < 1; i++) {
			p = Util.findFree(this);		
			g = new Guard(p.x, p.y);		
			this.actors.add(g);
			this.guards.add(g);
		}
		
		p = Util.findFree(this);
		this.lord = new Lord(p.x, p.y);
		this.actors.add(this.lord);
		
		//var lvl = new TileLevel(70,25);
		//lvl.generate();
		p = Util.findFree(this);
		//var e = new levelExit(p.x, p.y, lvl, "stair");
		//this.exits.add(e);
		
		
		//END SPAWN
		Game.level = this;
		Game.guards = this.guards;
		Game.actors = this.actors;
		Game.lord = this.lord;
		
		this.actors.forEach(function(o){
			Game.scheduler.add(o,true);
			console.log("Object added to scheduler");
		});
		this.exits.forEach(function(o){
			Game.scheduler.add(o,true);
			console.log("exit added");
		});
		
		this.draw();
	},
	
	unload: function () {
		Game.guards = null;
		Game.actors = null;
		Game.lord = null;
		
		this.actors.forEach(function(o){
			Game.scheduler.remove(o);
		});
		this.exits.forEach(function(o){
			Game.scheduler.remove(o);
		});
	},
	generate: function(){
		levelGenerator.generate(this);
	},
	
	levelExit: function(x,y,level,type){
		tile = {
			x: x,
			y: y,
			char: ">",
			color: "#000",
			walkable: true,
			blocklos: false,
			bg: C_GROUND_LIT,
			midlit: C_GROUND_MID,
			unlit: C_GROUND_SHADOW,
			
			trigger: function(){
				Game.level.unload();
				Game.world.levels[this.level].load();
				var p = Util.findFree();
				Game.player.x = p.x;
				Game.player.y = p.y;
			},
			exitTo: level,
			exitType: type
		};
		this.tiles[x + "," + y] = tile;
		
	}
};



