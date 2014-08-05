/*
	GENERATORSSS MAGICALLNESS OVERLOEAAAAAADDDDDD.
*/
/*
	worldGraph 
	a class for handling the overall map structure.
	each level is generated separately from each other but still adhere to guidelines set by worldGraph
*/
var worldGraph = function(){
	this.leveld = {};
	this.leveld[0] = new levelDescriptor(0,[1],"village",null);
	this.leveld[1] = new levelDescriptor(1,[0],"village",null);
};

worldGraph.prototype = {
	constructor: worldGraph,
	leveld: null, //list of level descriptors
	levels: null, //list of actual levels
	
	/*
		generate()
		generates all levels and stores them to this.levels
	*/
	generate: function(){
		this.levels = {};
		var desc;
		for (var i in this.leveld){
			desc = this.leveld[i];				//get the description
			var lvl = new TileLevel(100,100);		//create a blank level
			
			levelGenerator.generate(lvl, desc); //Take descriptor and use it to generate the level
			this.levels[i] = lvl;				//add that level to this.levels
			
		}
	}
};
/*
	levelDescriptor
	an object that contains basic information to levels, used to generate them
*/
var levelDescriptor = function(place,exits,type,goals){
	this.place = place;		//index for the level
	this.exits = exits;		//list of exits
	this.type = type;		//type of generator used. at the moment useless
	this.goals = goals;		//list of special goals. at the moment useless
};
levelDescriptor.prototype = {
	constructor: levelDescriptor,

	place: null, //[x,y]
	exits: [],//N,S,W,E
	type: null,
	goals: []
};

/*
	levelGenerator
	a singleton in charge of generating levels
*/
var levelGenerator = {

	/*
		generate(level, desc)
		level = TileLevel,
		desc = levelDescriptor
		
		generate holds the code i originally used to generate levels
	*/
	generate: function(level, desc){
		
		if(desc.type == "village"){
			this.generateVillage(level, desc);
			return;
		}
		
		var gen = new ROT.Map.Digger(level.w, level.h, {
			dugPercentage: 0.5, 
			roomHeight: [3, 7], 
			roomWidth: [3, 7]});
		
		//callback used by rot.js generators
		var digCallback = function (xx, yy, value) {
			var tile = {
				x: xx,
				y: yy,
				char: " ",
				color: value ? "#333" : "#aaa",		//Color of character if tile has any.
				walkable: value ? false : true, 
				blockslos: value ? true : false,
				type: value ? "wall" : "floor",
				bg: value ? "#333" : "#efe",		//Lit tile color
				unlit: value ? "#000" : "#454",	//Unlit tile color
				midlit: value ? "#111" : "#898"
			};
			level.tiles[xx + "," + yy] = tile; //assign tile to array
		};
		
		gen.create(digCallback);
		//Handle descriptor
		if(arguments.length > 0){
			console.log(desc);
			var exit = desc.exits[0];
			var p = Util.findFree(level);
			//level.exits.add(new levelExit(p.x,p.y,exit,"stair"));
			//console.log(level.exits.toArray());
		
		}
	},
	/*
		A test at supplementing my own generator
	*/
	generateVillage: function(level, desc){
		
		var w, h;
		w = level.w;
		h = level.h;
		
		//Temporary array to hold tile values.
		/*
			0 = regular floor
			1 = regular wall
			2 = window
			3 = ?
		*/
		var map = [];
		for (var i = 0; i < w; i++){
			map[i] = [];
			for (var j = 0; j < h; j++){
				map[i][j] = 1; //init the array with floor.
			}
			//console.log(map[i]);
		}
		this.tunnel(map, 0);
		
		
		
		var digCallback = function (xx, yy, value) {
			var val;
			if(value == 1) val = true;
			else val = false;
			
			var tile = {
				x: xx,
				y: yy,
				char: " ",
				color: val ? "#333" : "#aaa",		//Color of character if tile has any.
				walkable: val ? false : true, 
				blockslos: val ? true : false,
				type: val ? "wall" : "floor",
				bg: val ? "#333" : "#efe",		//Lit tile color
				unlit: val ? "#100" : "#454",	//Unlit tile color
				midlit: val ? "#111" : "#898"
			};
			
			level.tiles[xx + "," + yy] = tile; //assign tile to array
		};
		
		//Convert our map to tiles
		for (var iii = 0; iii < w; iii++){
			for (var jjj = 0; jjj < h; jjj++){
				digCallback(iii, jjj, map[iii][jjj]);
			}
			console.log("row " + iii + " done");
		}
		var exit = desc.exits[0];
		//var p = Util.findFree(level);
		//level.levelExit(p.x,p.y,exit,"stair");
		console.log("level done");
	},
	/*
		my attempt/implementation of tunneling algorithm
	*/
	tunnel: function(map, value){
		
		console.log("TUNEL STARTO!");
		new Tunneler(50,50,0,4,35,map).dig();//right
		new Tunneler(50,50,1,4,35,map).dig();//left
		new Tunneler(50,50,2,4,35,map).dig();
		new Tunneler(50,50,3,4,35,map).dig();
		console.log("TUNEL FINISHU!");
		
	},
	
	
	placeHut: function(map, x, y, w, h){
		for (var ii = 0; ii < w; ii++){
			for (var jj = 0; jj < h; jj++){
				if(ii === 0 || jj === 0 || ii == w-1 || jj == h-1)
					map[ii + x][jj + y] = 1;
			}
		}
	}
	
};


/*
	AABB axisaligned bounding box. mostly helper class
*/
var Rectangle = function(x, y, w, h){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};
Rectangle.prototype = {
	x: 0,
	y: 0,
	w: 1,
	h: 1,
	constructor: Rectangle,
	overlaps: function(b){
		var a = this;
		if(a.x+a.w < b.x || b.x+b.w < a.x || a.y+a.h < b.y || b.y+b.h < a.y){
			return false;
		} else {
			return true;
		}
	},
	inside: function(b){
		var a = this;
		if(a.x >= b.x && a.x + a.w <= b.x + b.w && a.y >= b.y && a.y + a.h <= b.y + b.h){
			return true;
		} else {
			return false;
		}
	}
};

var Tunneler = function(x,y,dir,width,life,map) {
		this.x = x;
		this.y = y;
		this.dir = (dir%4); //0,1,2,3 up right down left
		this.width = width; //assume positive
		this.life = life;
		this.maxlife = life;
		this.map = map;
		console.log(this);
};
Tunneler.prototype.dig = function(){
	//console.log("Diggydiggy hoole " + this.x + "," + this.y + " life:" + this.life + " width:" + this.width);
	if(!(this.width > 0 && this.life > 0 )) return;
	for (var i = this.x; i < this.x+this.width; i++){
		for (var j = this.y; j < this.y+this.width; j++){
			if(i > 0 && j > 0 && i < this.map.length && j < this.map[0].length){
				this.map[i][j] = 0;
			} else {
				//console.log(this.map);
				
			}
		}
	}
	this.life--;
	if(this.dir === 0) this.y -= 1;
	if(this.dir == 1) this.x += 1;
	if(this.dir == 2) this.y += 1;
	if(this.dir == 3) this.x -= 1;
	
	var rnd = ROT.RNG.getPercentage();
	if(rnd < 8){
		console.log("new tunneler");
		var n = new Tunneler(this.x, this.y, this.dir + (rnd < 4 ? 1 : -1), this.width-1, this.maxlife-10, this.map);
		n.dig();
	}
	
	this.dig();
};