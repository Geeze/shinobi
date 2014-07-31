
ROT.DEFAULT_WIDTH = 70;
ROT.DEFAULT_HEIGHT = 25;
ROT.Display.Rect.cache = true;

var Game = { //Game container

	//ENGINE
	display: null,
	map: null,
	engine: null,
	
	//CONSTANST
	gameWidth: 70,
	gameHeight: 25,
	//FIELD OF VIEW
	fov: null,
	drawfov: {},

	//Lists of objects
	objects: new Set(),
	guards: new Set(),
	player: null,
	lord: null,

	init: function () {
	
		//Main map display
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
		this.map = new TileMap(this.gameWidth, 25);
		var gen = new ROT.Map.Digger(this.gameWidth, 25, {
			dugPercentage: 0.5, 
			roomHeight: [3, 7], 
			roomWidth: [3, 7]});
		var digCallback = function (xx, yy, value) {
			var tile = {
				x: xx,
				y: yy,
				char: " ",
				color: value ? "#333" : "#aaa",		//Color of character if tile has any.
				type: value ? "wall" : "floor",
				bg: value ? "#333" : "#efe",		//Lit tile color
				unlit: value ? "#000" : "#454",	//Unlit tile color
				heat: 0
			};
			Game.map.tiles[xx + "," + yy] = tile; //assign tile to array
		};
		gen.create(digCallback);
		
		//CREATE SCHEDULER
		var scheduler = new ROT.Scheduler.Simple();
		this.engine = new ROT.Engine(scheduler);

		//SPAWN CREATURES
		var p = findFree();
		var g = null;
		var i;
		this.player = new Player(p.x, p.y);
		for (i = 0; i < 7; i++) {//TODO: CHANGE BACK
			p = findFree();					//Find free position
			g = new Guard(p.x, p.y);		//Put guard there
			this.objects.add(g);
			this.guards.add(g);
			p = findFree();					//Find destination for patrol
			g.startPatrol(p.x, p.y);		//Start patrol
			scheduler.add(g, true);			//Add guard to gameloop
			
		}
		scheduler.add(this.player, true);
		p = findFree();
		this.lord = new Lord(p.x, p.y);
		this.objects.add(this.lord);
		scheduler.add(this.lord, true);
		

		//Player is added last so guards take first turn. In theory makes game sometimes unwinnable
		this.objects.add(this.player);
		
		//CREATE FOV and draw first turn
		this.fov = new ROT.FOV.RecursiveShadowcasting(lightPasses);
		Game.map.draw();
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
		//HEAT Map
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
			width:this.width, 
			height: this.height, 
			fg: "#fff", 
			bg: "#005"});
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
	heat:
*/
TileMap.prototype.getBg = function(x, y){

	return this.tiles[x + "," + y].bg;
	
};

//Draws whole map.
TileMap.prototype.draw = function () {

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
var lightPasses = function(x, y){
	var key = x + "," + y;
	if(!(key in Game.map.tiles)) return false;
	var tile = Game.map.tiles[key];
	if (tile.type == "floor") { return true; }
	else { return false; }
};
//Callback for PATHFINDING, not needed. YET! When smoke is introduced.

//Finds a random free point on the map
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

//Turns coordinates to ROT.DIRS[8]
var getDir = function(x,y){

	var l, lim;
	
	lim = 0.8; //Arbitary(estimate) value used to compare which octant the dir is in
	l = Math.sqrt(x*x + y*y);
	if(l === 0){ return 0;}//no dir. return 0 to avoid freeze. Or well default is up.
	x /= l;
	y /= l;
	
	if(y < -lim) return 0;//UP
	if(y > lim) return 4;//DOWN
	if(x < -lim) return 6;//REFT
	if(x > lim) return 2;//RIGHT
	if(x > 0 && y > 0) return 3;//DOWNRIGHT
	if(x > 0 && y < 0) return 1;//UPRIGHT
	if(x < 0 && y > 0) return 5;//DOWNLEFT
	if(x < 0 && y < 0) return 7;//UPLEFT
	
};

//HEATMAP HANDLING callback should return 1 
var Heat = {};

var heatInit = function(){
	oldNodes = new Set(null, heatEquals, heatHash);
	freshNodes = new Set(null, heatEquals, heatHash);
	heatTime = 0;
};
var heatSet = function(x,y,time){
	freshNodes.add([x,y]);
	heatTime = time;
};
var heatSpread = function(){
	if(heatTime < 1) return;
	var newNodes = new Set(null, heatEquals, heatHash);
	freshNodes.forEach(function(node){
		newNodes.addEach(heatNeighbors(node));
	});
	oldNodes.addEach(freshNodes);
	freshNodes = newNodes.difference(oldNodes);
	//freshNodes = newNodes;
	
	heatTime -= 1;
	//alert(newNodes.toArray());
};
//Returns possible neighbors for each node
var heatNeighbors = function(node){
	var i,j;
	var neighbors = new Set();
	for(i = -1; i <= 1; i++){
		for(j = -1; j <= 1; j++){
			if(lightPasses(node[0] + i, node[1] + j)){
				neighbors.add([node[0] + i, node[1] + j]);
			}
		}
	}
	return neighbors;
};
var heatDraw = function(){
	oldNodes.forEach(function(node){
		Game.display.draw(node[0], node[1], ".", "#000", "#fb0");
	});
	freshNodes.forEach(function(node){
		Game.display.draw(node[0], node[1], ".", "#000", "#bf0");
	});//*/
};
var heatEquals = function(a, b){
	if(a[0] == b[0] && a[1] == b[1]){
		return true;
	} else {
		return false;
	}
};

var heatRemove = function(x, y){
	oldNodes.delete([x,y]);
	freshNodes.delete([x,y]);
};
var heatHash = function(object){
	return object[0] + "," + object[1];//object[0]+300*object[1];
};
var heatFind = function(x, y){
	var dist, node, curd;
	dist = 99999999;
	oldNodes.forEach(function(p){
		curd = Math.abs(x-p[0])+Math.abs(y-p[1]);
		if(curd < dist){
			dist = curd;
			node = p;
		}
	});
	
	return node;
};

	Game.init();
	Console._init();
	Game.engine.start();
	Console.message("The Games have begun");





