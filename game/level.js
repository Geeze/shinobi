var C_GROUND_LIT = "#efe";
var C_GROUND_MID = "#898";
var C_GROUND_SHADOW = "#454";
var C_WALL_LIT = "#333";
var C_WALL_MID = "#111";
var C_WALL_SHADOW = "#000";

var T_FLOOR = 0;
var T_WALL = 1;
var T_WINDOW = 2;
var T_INDOORS = 3;

/*
	bg: value ? C_WALL_LIT : C_GROUND_LIT,		//Lit tile color
	unlit: value ? C_WALL_SHADOW : C_GROUND_SHADOW,	//Unlit tile color
	midlit: value ? C_WALL_MID : C_GROUND_MID
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
		if(!this.tiles[x + "," + y].shadow)
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
		outputLevel(this);
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
	populate: function(lord,guards){
		//SPAWN
		//SPAWN CREATURES
		
		var p = Util.findFree(this);
		var g = null;
		var i;
		for (i = 0; i < guards; i++) {
			p = Util.findFree(this, 15);		
			g = new Guard(p.x, p.y);		
			this.actors.add(g);
			this.guards.add(g);
		}
		if(lord){
			p = Util.findFree(this,40);
			this.lord = new Lord(p.x, p.y);
			this.actors.add(this.lord);
		}
		p = Util.findFree(this);
		console.log("guards: " + guards + " lord " + lord);
		//END SPAWN
	},
	/*
		levelExit, creates exits to defined level
		x,y
		level: index in Game.world.levels
		type: border or stair? affects only appearance since this doesnt handle placing
	*/
	levelExit: function(x,y,level,type){
		tile = {
			x: x,
			y: y,
			char: ">",
			color: C_WALL_SHADOW,
			walkable: true,
			blocklos: false,
			bg: C_GROUND_LIT,
			midlit: C_GROUND_MID,
			unlit: C_GROUND_SHADOW,
			type: "floor",
			
			trigger: function(){
				Game.level.unload();
				//Get start position for player
				var newLevel = Game.world.levels[this.exitTo];
				Game.player.x = newLevel.startX;
				Game.player.y = newLevel.startY;
				Game.world.levels[this.exitTo].load();
				console.log("Level: " + this.exitTo);
			},
			exitTo: level,
			exitType: type
		};
		this.tiles[x + "," + y] = tile;
		
	}
};

var outputLevel = function(level){
	var canvas = document.getElementById('output');
	var context = canvas.getContext('2d');
	
	for (i = 0; i < level.w; i++){
		for (j = 0; j < level.h; j++){
			tile = level.tiles[(i) + "," + (j)];
			if(tile !== null && tile !== undefined){
				context.fillStyle = tile.bg;
				context.fillRect(i*2,j*2,2,2);
			}
				
		}
	}
	// save canvas image as data url (png format by default)
	var dataURL = canvas.toDataURL();

	// set canvasImg image src to dataURL
	// so it can be saved as an image
	document.getElementById('canvasImg').src = dataURL;

};

var Tile = function(x,y, type){
	var tile, val;
	if(type == T_FLOOR){
		val = false;
		tile = {
				x : xx,
				y : yy,
				char : " ",
				color : value ? C_WALL_LIT : "#aaa", //Color of character if tile has any.
				walkable : value ? false : true,
				blockslos : value ? true : false,
				type : value ? "wall" : "floor",
				bg : value ? C_WALL_LIT : C_GROUND_LIT, //Lit tile color
				unlit : value ? C_WALL_SHADOW : C_GROUND_SHADOW, //Unlit tile color
				midlit : value ? C_WALL_MID : C_GROUND_MID,
				shadow : false
		};
		return tile;
	}
	if(type == T_WALL){
		val = true;
		tile = {
				x : xx,
				y : yy,
				char : " ",
				color : value ? C_WALL_LIT : "#aaa", //Color of character if tile has any.
				walkable : value ? false : true,
				blockslos : value ? true : false,
				type : value ? "wall" : "floor",
				bg : value ? C_WALL_LIT : C_GROUND_LIT, //Lit tile color
				unlit : value ? C_WALL_SHADOW : C_GROUND_SHADOW, //Unlit tile color
				midlit : value ? C_WALL_MID : C_GROUND_MID,
				shadow : false
		};
		return tile;
	}
	if (value == T_WINDOW) { //Windows
		tile = {
			x : xx,
			y : yy,
			char : "\u2610",
			color : C_WALL_SHADOW, //Color of character if tile has any.
			walkable : false,
			blockslos : false,
			type : "window",
			bg : "#66f", //Lit tile color
			unlit : "#100", //Unlit tile color
			midlit : "#66a",
			shadow : false
		};
		return tile;
	}

	if (value == T_INDOORS) { //Indoors
		tile = {
			x : xx,
			y : yy,
			char : " ",
			color : "#aaa", //Color of character if tile has any.
			walkable : true,
			blockslos : false,
			type : "floor",
			bg : C_GROUND_LIT, //Lit tile color
			unlit : "#100", //Unlit tile color
			midlit : C_GROUND_MID,
			shadow : true
		};
		return tile;
	}
}





