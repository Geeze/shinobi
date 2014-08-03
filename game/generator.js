/*
	GENERATORSSS MAGICALLNESS OVERLOEAAAAAADDDDDD.
*/

var worldGraph = function(){
	this.leveld = {};//this.leveld = new Map(); //([x,y], levelDescriptor) pairs
	this.leveld[0] = new levelDescriptor(0,[1],"dungeon",null);//this.leveld.add(0, new levelDescriptor(0,[1],"dungeon",null));
	this.leveld[1] = new levelDescriptor(1,[0],"dungeon",null);//this.leveld.add(1, new levelDescriptor(1,[0],"dungeon",null));
};

worldGraph.prototype = {
	constructor: worldGraph,
	leveld: null,
	levels: null,
	
	generate: function(){
		this.levels = {};
		var desc;
		for (var i in this.leveld){//this.leveld.forEach(function(key, value, col){
			desc = this.leveld[i];
			var lvl = new TileLevel(70,25);
			
			levelGenerator.generate(lvl, desc); //Take descriptor and use it to generate levels
			this.levels[i] = lvl;//me.levels.add(key,lvl);
			//console.log(me.levels.has(key));
		}//});
	}
};

var levelDescriptor = function(place,exits,type,goals){
	this.place = place;
	this.exits = exits;
	this.type = type;
	this.goals = goals;
};
levelDescriptor.prototype = {
	constructor: levelDescriptor,

	place: null, //[x,y]
	exits: [],//N,S,W,E
	type: null,
	goals: []
};

var levelGenerator = {
	generate: function(level, desc){//descriptor
		
		//HERE IS PREVIOUS LEVEL START CODE
		var gen = new ROT.Map.Digger(level.w, level.h, {
			dugPercentage: 0.5, 
			roomHeight: [3, 7], 
			roomWidth: [3, 7]});
			
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
			level.exits.add(new levelExit(p.x,p.y,exit,"stair"));
			console.log(level.exits.toArray());
		
		}
		
		
		
	
	}
};
