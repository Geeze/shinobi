

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

		var i, j, tile;
		for (i = 0; i < this.w; i++){
			for (j = 0; j < this.h; j++){
				tile = this.tiles[i + "," + j];
				if(tile !== null)
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
		for (i = 0; i < 8; i++) {
			p = Util.findFree(this,10);		
			g = new Guard(p.x, p.y);		
			this.actors.add(g);
			this.guards.add(g);
		}
		
		p = Util.findFree(this,30);
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
	}
};

var levelExit = function(x,y,level,type){
	this.x = x;
	this.y = y;
	this.level = level;
	this.type = type;
};
levelExit.prototype = {
	x: 0,
	y: 0,
	char: ">",
	color: "#000",
	level: 0,   //Instance of level the exit leads to.
	type: "stair", //stair/border
	constructor: levelExit,
	
	draw: function(){
		Game.display.draw(this.x, this.y, this.char, this.color, Game.level.getBg(this.x, this.y));
	},
	act: function(){
		if(Util.distance(Game.player, this) === 0){//Player is on this exit
			Game.level.unload();
			Game.world.levels[this.level].load();
			//this.level.load();
			
			//subject to change
			var p = Util.findFree();
			Game.player.x = p.x;
			Game.player.y = p.y;
			
		} else {
			this.draw();
		}
	}
};
//Callback for FOV calculations, used for pathfinding too. good for me :D
