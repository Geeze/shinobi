
ROT.DEFAULT_WIDTH = 70;
ROT.DEFAULT_HEIGHT = 25;
//ROT.Display.Rect.cache = true;

var Game = { //Game container

	//ENGINE
	display: null,
	level: null,
	levels: [],
	scheduler: null,
	engine: null,
	
	//CONSTANST
	gameWidth: 70,
	gameHeight: 25,
	//FIELD OF VIEW
	fov: null,
	drawfov: {},

	//Lists of objects
	objects: new Set(),	//Things that go to scheduler
	guards: new Set(),
	player: null,
	lord: null,

	init: function () {
	
		//Main level display
		this.display = new ROT.Display({
			width: this.gameWidth,
			height: this.gameHeight
		});
		document.body.appendChild(this.display.getContainer());
		
		//CREATE MAP
		//Deal with the devil
		//ROT.RNG.setSeed(666);
		
		/*DAILY LEVEL
		var d = new Date();
		ROT.RNG.setSeed(d.getDate()+31*d.getMonth()+365*d.getYear());
		//*/
		
		//Use if you need to test consistency? Or whe you need to know guard positions
		var gen;
		this.level = new TileLevel(this.gameWidth, 25);
		gen = new ROT.Map.Digger(this.gameWidth, 25, {
			dugPercentage: 0.5, 
			roomHeight: [3, 7], 
			roomWidth: [3, 7]});
			gen.create(digCallback);
		this.levels[1] = this.level;
		this.level = new TileLevel(this.gameWidth, 25);
		gen = new ROT.Map.Digger(this.gameWidth, 25, {
			dugPercentage: 0.5, 
			roomHeight: [3, 7], 
			roomWidth: [3, 7]});
		this.levels[0] = this.level;
			
			
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
			Game.level.tiles[xx + "," + yy] = tile; //assign tile to array
		};
		gen.create(digCallback);
		
		//CREATE SCHEDULER
		this.scheduler = new ROT.Scheduler.Simple();
		this.engine = new ROT.Engine(this.scheduler);

		//SPAWN CREATURES
		var p = findFree();
		var g = null;
		var i;
		this.player = new Player(p.x, p.y);
		for (i = 0; i < 1; i++) {//TODO: CHANGE BACK
			p = findFree();					//Find free position
			g = new Guard(p.x, p.y);		//Put guard there
			this.objects.add(g);
			this.guards.add(g);
			p = findFree();					//Find destination for patrol
			g.startPatrol(p.x, p.y);		//Start patrol
			this.scheduler.add(g, true);			//Add guard to gameloop
			
		}
		this.scheduler.add(this.player, true);
		p = findFree();
		this.lord = new Lord(p.x, p.y);
		this.objects.add(this.lord);
		this.scheduler.add(this.lord, true);
		

		//Player is added last so guards take first turn. In theory makes game sometimes unwinnable
		this.objects.add(this.player);
		
		//CREATE FOV and draw first turn
		this.fov = new ROT.FOV.RecursiveShadowcasting(lightPasses);
		Game.level.draw();
		Game.fov.compute(
			Game.player.x,
			Game.player.y,
			20, 
			Game.player.fovCallback);
		Game.display.draw(
			Game.player.x, 
			Game.player.y, 
			Game.player.char, 
			Game.player.color, 
			"yellow");
		Game.display.draw(this.lord.x, this.lord.y, "X");
		//HEAT Level
		heatInit();
		/*
		heatSet(this.player.x, this.player.y, 54);
		var ii = 32;
		while(ii > 0){
			heatSpread();
			ii--;
		}
		heatDraw();
		//*/
		
		//INIT MOUSE
		
	}

};
//CONSOLE well selfexplanatory
var Console = {

	width: 70,
	height: 5,
	display: null,
	messages: [null, null, null, null, null],
	
	//Setup console display
	_init: function(){
		this.display = new ROT.Display({
			width:this.width/1.2, 
			height: this.height, 
			fg: "#fff", 
			bg: "#005",
			spacing: 1.2});
		document.body.appendChild(this.display.getContainer());
	},
	
	message: function(string) {
		//	handle sneak around spam
		if(string == "%c{grey}You sneak around." && string == this.messages[4]) 
			{ return; }
		this.display.clear();
		//scroll messages upwards
		for (var i = 0; i < 4; i++){
			this.messages[i] = this.messages[i+1];
			if(this.messages[i] !== null)
				this.display.drawText(0, i, this.messages[i]);
		}
		//handle new message
		this.messages[4] = string;
		this.display.drawText(0,4, string);
	}

};

var changeLevel = function(id){
	// Remove objects from scheduler
	Game.objects.forEach(function(o){
		Game.scheduler.remove(o);
	});
	
	//Old objects into level
	Game.level.objects = Game.objects;
	Game.level.guards = Game.guards;
	
	//Swap the level
	Game.level = Game.levels[id];
	//New objects from level
	Game.guards = Game.level.guards;
	Game.objects = Game.level.guards;
	var p = findFree();
		var g = null;
		var i;
		Game.player = new Player(p.x, p.y);
	Game.objects.add(this.player);
	this.scheduler.add(this.player, true);
};

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
TileLevel.prototype.getBg = function(x, y){
	if(Game.drawfov)
		if(!(x+","+y in Game.drawfov))
			return this.tiles[x + "," + y].unlit;
	if(distance({x:x,y:y}, Game.player) < 10)
		return this.tiles[x + "," + y].bg;
	else
		return this.tiles[x + "," + y].midlit;
};

//Draws whole level.
TileLevel.prototype.draw = function () {

	var i, j, tile;
	for (i = 0; i < this.w; i++){
		for (j = 0; j < this.h; j++){
			tile = this.tiles[i + "," + j];
			if(tile !== null)
				Game.display.draw(i, j ,tile.char, tile.color, tile.unlit);//TODO Add color
		}
	}

};
//Callback for FOV calculations, used for pathfinding too. good for me :D


	Game.init();
	Console._init();
	Game.levels[1].draw();
	alert("");
	Game.engine.start();
	
	Console.message("Kill the lord or face death!");
	





