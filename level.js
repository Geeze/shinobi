

var TileLevel = function (w, h) { //Class for base level functionality
	this.tiles = {};
	this.w = w;
	this.h = h;
	this.objects = new Set();
	this.guards = new Set();
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
	midlit:
*/
TileLevel.prototype = {
	tiles: null,
	w: null,
	h: null,
	objects: null,
	guards: null,
	
	getBg: function(x, y){
		if(Game.drawfov)
			if(!(x+","+y in Game.drawfov))
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
		Game.level = this;
		Game.guards = this.guards;
		Game.objects = this.objects;
		Game.lord = this.lord;
		
		this.objects.forEach(function(o){
			Game.scheduler.add(o);
			console.log("Object added to scheduler");
		});
		
		this.draw();
	},
	
	unload: function () {
		Game.guards = null;
		Game.objects = null;
		Game.lord = null;
		
		this.objects.forEach(function(o){
			Game.scheduler.remove(o);
		});
	},
	generate: function(options){
		
		//HERE IS PREVIOUS LEVEL START CODE
		var gen = new ROT.Map.Digger(this.w, this.h, {
			dugPercentage: 0.5, 
			roomHeight: [3, 7], 
			roomWidth: [3, 7]});
		
		var self = this;
			
		var digCallback = function (xx, yy, value) {
			var tile = {
				x: xx,
				y: yy,
				char: " ",
				color: value ? "#333" : "#aaa",		//Color of character if tile has any.
				type: value ? "wall" : "floor",
				bg: value ? "#333" : "#efe",		//Lit tile color
				unlit: value ? "#000" : "#454",	//Unlit tile color
				midlit: value ? "#111" : "#898"
			};
			self.tiles[xx + "," + yy] = tile; //assign tile to array
		};
		
		gen.create(digCallback);
		
		
		//SPAWN CREATURES
		var p = Util.findFree(this);
		var g = null;
		var i;
		for (i = 0; i < 8; i++) {//TODO: CHANGE BACK
			p = Util.findFree(this);		//Find free position
			g = new Guard(p.x, p.y);		//Put guard there
			this.objects.add(g);
			this.guards.add(g);
			p = Util.findFree(this);					//Find destination for patrol
			//g.startPatrol(p.x, p.y);		//Start patrol
			//Game.scheduler.add(g, true);			//Add guard to gameloop
		}
		//this.scheduler.add(this.player, true);
		p = Util.findFree(this);
		this.lord = new Lord(p.x, p.y);
		this.objects.add(this.lord);
		//this.scheduler.add(this.lord, true);
		
	
	}
};
//Callback for FOV calculations, used for pathfinding too. good for me :D
