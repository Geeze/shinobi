/*
LEVEL GENERATOR CODE
 */
var T_FLOOR = 0;
var T_WALL = 1;
var T_WINDOW = 2;
var T_INDOORS = 3;
/*
worldGraph
a class for handling the overall map structure.
each level is generated separately from each other but still adhere to guidelines set by worldGraph
 */
var worldGraph = function () {
	this.leveld = {};
	this.leveld[0] = new levelDescriptor(0, [1], "village", null);
	this.leveld[1] = new levelDescriptor(1, [2], "village", null);
	this.leveld[2] = new levelDescriptor(2, [3], "village", null);
	this.leveld[3] = new levelDescriptor(3, [4], "village", null);
	this.leveld[4] = new levelDescriptor(4, [5], "village", null);
	this.leveld[5] = new levelDescriptor(5, [6], "village", null);
	this.leveld[6] = new levelDescriptor(6, [7], "village", null);
	this.leveld[7] = new levelDescriptor(7, [], "village", null);
};

worldGraph.prototype = {
	constructor : worldGraph,
	leveld : null, //list of level descriptors
	levels : null, //list of actual levels

	/*
	generate()
	generates all levels and stores them to this.levels
	 */
	generate : function () {
		this.levels = {};
		var desc;
		for (var i in this.leveld) {
			desc = this.leveld[i]; //get the description
			var lvl = new TileLevel(100, 100); //create a blank level

			levelGenerator.generate(lvl, desc); //Take descriptor and use it to generate the level
			this.levels[i] = lvl; //add that level to this.levels

		}
	}
};

/*
levelDescriptor
an object that contains basic information to levels, used to generate them
 */
var levelDescriptor = function (place, exits, type, goals) {
	this.place = place; //index for the level
	this.exits = exits; //list of exits
	this.type = type; //type of generator used. at the moment useless
	this.goals = goals; //list of special goals. at the moment useless
};
levelDescriptor.prototype = {
	constructor : levelDescriptor,

	place : null, //[x,y]
	exits : [], //N,S,W,E
	type : null,
	goals : []
};

/*
levelGenerator
a singleton in charge of generating levels
 */
var levelGenerator = {
	//General generation
	/*
	generate(level, desc)
	level = TileLevel,
	desc = levelDescriptor

	generate holds the code i originally used to generate levels
	 */
	generate : function (level, desc) {

		if (desc.type == "village") {
			this.generateVillage(level, desc);
			return;
		}

		var gen = new ROT.Map.Digger(level.w, level.h, {
				dugPercentage : 0.5,
				roomHeight : [3, 7],
				roomWidth : [3, 7]
			});

		//callback used by rot.js generators
		var digCallback = function (xx, yy, value) {
			var tile = {
				x : xx,
				y : yy,
				char : " ",
				color : value ? "#333" : "#aaa", //Color of character if tile has any.
				walkable : value ? false : true,
				blockslos : value ? true : false,
				type : value ? "wall" : "floor",
				bg : value ? "#333" : "#efe", //Lit tile color
				unlit : value ? "#000" : "#454", //Unlit tile color
				midlit : value ? "#111" : "#898",
				shadow : false
			};
			level.tiles[xx + "," + yy] = tile; //assign tile to array
		};

		gen.create(digCallback);
		//Handle descriptor
		if (arguments.length > 0) {
			var exit = desc.exits[0];
			var p = Util.findFree(level);
			

		}
	},
	/*
	A test at supplementing my own generator
	 */
	generateVillage : function (level, desc) {

		var w,
			h;
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
		for (var i = 0; i < w; i++) {
			map[i] = [];
			for (var j = 0; j < h; j++) {
				map[i][j] = 1; //init the array with floor.
			}
			
		}

		//Former tunnel()
		var bsp = new BSP(map.length, map[0].length, 7, 7, 22, 22);
		bsp.shortenEdges();
		var self = this;
		//Create roads on edges
		bsp.edges.forEach(function (e) {
			self.placeRoad(map, e.x1, e.y1, e.x2, e.y2, e.width);
		});
		//Do stuff to areas
		bsp.nodes.forEach(function (n) {
			//If area next to level border dont do anything
			if(n.bottom.width === 0 || n.right.width === 0 || n.left.width === 0 || n.top.width === 0) return;
			var r = nodeToRect(n);
			if (r.w < 15 && r.h < 15)
				self.placeHut(map, r.x, r.y, r.w, r.h);
			if (r.w > 12  && r.h > 12)
				self.placeAlley(map, r, ROT.RNG.getPercentage() % 2);
		});

		var digCallback = function (xx, yy, value) {
			var val,
			tile;
			if (value == 1)
				val = true;
			else
				val = false;
			if (value == T_FLOOR || value == T_WALL) {
				tile = {
					x : xx,
					y : yy,
					char : " ",
					color : val ? "#333" : "#aaa", //Color of character if tile has any.
					walkable : val ? false : true,
					blockslos : val ? true : false,
					type : val ? "wall" : "floor",
					bg : val ? "#333" : "#efe", //Lit tile color
					unlit : val ? "#100" : "#454", //Unlit tile color
					midlit : val ? "#111" : "#898",
					shadow : false
				};
			}
			if (value == T_WINDOW) { //Windows
				tile = {
					x : xx,
					y : yy,
					char : "\u2610",
					color : "#000", //Color of character if tile has any.
					walkable : false,
					blockslos : false,
					type : "window",
					bg : "#66f", //Lit tile color
					unlit : "#100", //Unlit tile color
					midlit : "#66a",
					shadow : false
				};
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
					bg : "#efe", //Lit tile color
					unlit : "#100", //Unlit tile color
					midlit : "#898",
					shadow : true
				};
			}
			level.tiles[xx + "," + yy] = tile; //assign tile to array
		};

		//Convert our map to tiles
		for (var iii = 0; iii < w; iii++) {
			for (var jjj = 0; jjj < h; jjj++) {
				digCallback(iii, jjj, map[iii][jjj]);
			}
		}
		var exit = desc.exits[0];
		this.placeExits(level, desc);
		this.placeStart(level, bsp);
		this.placeShadows(level);
		if(desc.place < 6)
			level.populate(false, 7 + desc.place);
		else
			level.populate(true,20);
		//var p = Util.findFree(level);
		//level.levelExit(p.x,p.y,exit,"stair");
	},

	//Subroutines, operate on maps. arrays [][] of int "enums"
	placeHut : function (map, x, y, w, h) {
		for (var ii = 0; ii < w; ii++) {
			for (var jj = 0; jj < h; jj++) {
				if (ii + x > 0 && jj + y > 0 && ii + x < map.length && jj + y < map[0].length) {
					if (ii === 0 || jj === 0 || ii == w - 1 || jj == h - 1) {
						if ((ii > w / 3 && ii < 2 * w / 3) || (jj > h / 3 && jj < 2 * h / 3))
							map[ii + x][jj + y] = T_WINDOW;
						else
							map[ii + x][jj + y] = T_WALL;
					} else
						map[ii + x][jj + y] = T_INDOORS;
				}
			}
		}
	},
	placeRoad : function (map, x1, y1, x2, y2, width) {
		//Lets assume road is never bended
		//map is [][] of integers
		var i,
		j,
		upper,
		lower;

		if (x2 - x1 > y2 - y1) { //horizontal

			upper = y1 - Math.floor(width / 2 - 0.1);
			lower = y1 + Math.floor(width / 2 + 0.1);
			for (i = x1; i <= x2; i++) {
				for (j = upper; j <= lower; j++) {
					map[i][j] = T_FLOOR;
				}
			}

		} else { //vertical
			upper = x1 - Math.floor(width / 2 - 0.1);
			lower = x1 + Math.floor(width / 2 + 0.1);
			for (i = y1; i <= y2; i++) {
				for (j = upper; j <= lower; j++) {

					map[j][i] = T_FLOOR;
				}
			}

		}

	},

	/**
	 *	placeAlleys
	 *  splits larger cityblocks with narrow alleys in them
	 */
	placeAlley : function (map, rect, horizontal) {
		var x1,
			x2,
			y1,
			y2,
			i,
			j;
		x1 = rect.x;
		x2 = rect.x + rect.w;
		y1 = rect.y;
		y2 = rect.y + rect.h;
		var ix = Util.randomInRange(rect.x, rect.x + rect.w, 4);
		var iy = Util.randomInRange(rect.y, rect.y + rect.h, 4);
		if (horizontal) {
			j = Util.randomInRange(rect.y, rect.y + rect.h, 4);
			for (i = x1; i < x2; i++) {
				if (map[i])
					map[i][j] = T_INDOORS;

				if (i == ix) {
					for (j = j; j != iy; (j < iy) ? j++ : j--) {
						if (map[i])
							map[i][j] = T_INDOORS;

					}
					if (map[i])
						map[i][j] = T_INDOORS;
				}
			}
		} else {
			j = Util.randomInRange(rect.x, rect.x + rect.w, 2);
			for (i = y1; i < y2; i++) {
				if (map[j])
					map[j][i] = T_INDOORS;

				if (j == iy) {
					for (j = j; j != ix; (j < ix) ? j++ : j--) {
						if (map[j])
							map[j][i] = T_INDOORS;

					}
					if (map[j])
						map[j][i] = T_INDOORS;
				}
			}
		}
	},
	//Subroutines, operate on tilelevel data
	placeExits : function (level, desc) {
		var exits = desc.exits;
		if (exits.length === 0)
			return;
		var tile;
		for (var i = 0; i < level.h; i++) {
			tile = level.tiles[(level.w - 1) + "," + i];
			if (tile.type == "floor") {
				level.levelExit(tile.x, tile.y, exits[0], "border");
			}
		}
	},
	placeStart : function (level,bsp){
		level.startX = 2;
		level.startY = bsp.mainRoad.y1;
	},
	//bakes the shadows in the level
	placeShadows : function (level) {
		var tile,
		comparedTile;

		//lightPasses copied from util.js
		var lightPasses = function (x, y) {
			if (!Util.inBounds(x, y, level))
				return false;
			var key = x + "," + y;
			if (!(key in level.tiles))
				return false;
			var tile = level.tiles[key];
			if (tile.type == "floor") {
				return true;
			} else {
				return false;
			}
		};
		//Go through every tile and check if sun direction casts shadow
		var key;
		for (key in level.tiles) {
			tile = level.tiles[key];
			if (tile.type == "floor") {
				if (!lightPasses(tile.x + 1, tile.y - 1)) {
					tile.shadow = true;
				}
			}
		}
	}
};

/* BSP - binary spatial partitioning. Not exactly tree
named after bsp tree even if not actual tree
 */
var BSP = function (w, h, minx, miny, maxx, maxy) {
	//variables
	this.w = w;
	this.h = h;
	this.minx = minx;
	this.maxx = maxx;
	this.miny = miny;
	this.maxy = maxy;
	//list of nodes
	this.nodes = new List();
	this.newNodes = new List();
	this.edges = new List();
	this.root = null;
	//Main node
	var left = new BspEdge(this, 1, 0, 0, 0, h - 1, 0);
	var right = new BspEdge(this, 1, w - 1, w - 1, 0, h - 1, 0);
	var top = new BspEdge(this, 1, 0, w - 1, 0, 0, 0);
	var bottom = new BspEdge(this, 1, 0, w - 1, h - 1, h - 1, 0);
	this.edges.push(left, right, top, bottom);
	this.root = new BspNode(this, top, bottom, left, right, 1);
	this.newNodes.add(this.root);
	var self = this;
	//Start the nuclear reaction!!!
	this.split(this.root);
};
BSP.prototype = {
	split : function (node) {

		var direction = (node.orientation + 1) % 2; //0 for horizontal 1 for vertical
		var newEdge;
		var x1,
		x2,
		y1,
		y2;
		y1 = node.top.y1;
		y2 = node.bottom.y2;
		x1 = node.left.x1;
		x2 = node.right.x2;
		//Handle horizontal splits
		if (direction === 0) {
			//Check if we can fit a new split.
			if ((y2 - y1) > this.maxy) {
				//Calculate split Y
				var y = y1 + this.miny + Math.floor(((y2 - y1) - 2 * this.miny) * ROT.RNG.getUniform());
				//Make edge
				newEdge = new BspEdge(this, direction, x1, x2, y, y, ROT.RNG.getPercentage() % 2 + 2);
				//Add neighbors (edges this edge is connected to);
				node.left.neighbors.add(newEdge);
				node.right.neighbors.add(newEdge);
				newEdge.neighbors.add(node.left);
				newEdge.neighbors.add(node.right);
				//Make new nodes
				var upnode,
				downnode;
				upnode = new BspNode(this,
						node.top,
						newEdge,
						node.left,
						node.right,
						direction);
				downnode = new BspNode(this,
						newEdge,
						node.bottom,
						node.left,
						node.right,
						direction);

				//Add references
				node.childA = upnode;
				node.childB = downnode;
				this.newNodes.add(upnode);
				this.newNodes.add(downnode);
				this.edges.add(newEdge);

				//Recursive
				this.split(upnode);
				this.split(downnode);
			} else {
				this.nodes.add(node);
				
			}
		}

		//Handle vertical splits. Nearly identical.
		if (direction == 1) {
			if ((x2 - x1) > this.maxx) {
				var x = x1 + this.minx + Math.floor(((x2 - x1) - 2 * this.minx) * ROT.RNG.getUniform()); //Splits the node in half, but leaves each size atleast with min size
				newEdge = new BspEdge(this, direction, x, x, y1, y2, ROT.RNG.getPercentage() % 2 + 2);
				newEdge.neighbors.add(node.top);
				newEdge.neighbors.add(node.bottom);
				node.top.neighbors.add(newEdge);
				node.bottom.neighbors.add(newEdge);

				var leftnode,
				rightnode;
				leftnode = new BspNode(this,
						node.top,
						node.bottom,
						node.left,
						newEdge,
						direction);
				rightnode = new BspNode(this,
						node.top,
						node.bottom,
						newEdge,
						node.right,
						direction);

				node.childA = leftnode;
				node.childB = rightnode;
				this.newNodes.add(leftnode);
				this.newNodes.add(rightnode);
				this.edges.add(newEdge);
				this.split(leftnode);
				this.split(rightnode);
			} else {
				this.nodes.add(node);
			}
		} //END VERTICAL


	},

	shortenEdges : function () {
		var self = this;
		this.edges.forEach(function (edge) {
			//Check if connected to borders.
			var minx,
			maxx,
			miny,
			maxy,
			border;
			minx = 9999;
			maxx = 0;
			miny = 9999;
			maxy = 0;
			border = null;
			edge.neighbors.forEach(function (n) {
				if (n.width === 0) { //check if connected to border
					if (border !== null) {
						border = null; //if connected to both borders dont do anything
						edge.width = 7;
						self.mainRoad = edge;
					} else
						border = n;
				} else {
					//Get coordinates for edges.
					minx = Math.min(minx, n.x1);
					maxx = Math.max(maxx, n.x2);
					miny = Math.min(miny, n.y1);
					maxy = Math.max(maxy, n.y2);
				}
			});
			//If not on border dont shorten.
			if (border === null) {
				return;
			} else {
				//Adjust new ends for edges
				if (border == self.root.left)
					edge.x1 = minx;
				if (border == self.root.right)
					edge.x2 = maxx;
				if (border == self.root.top)
					edge.y1 = miny;
				if (border == self.root.bottom)
					edge.y2 = maxy;
			}
		});
	}
};
var BspEdge = function (bsp, orientation, x1, x2, y1, y2, width) {
	this.bsp = bsp;
	this.orientation = orientation;
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
	this.width = width;
	this.neighbors = new Set();
};
BspEdge.prototype = {
	bsp : null,
	orientation : null, //hor or vertical
	x1 : null,
	x2 : null,
	y1 : null,
	y2 : null,
	width : 1, //used for stuff...
	neighbors : null //edges that connect to/divide this edge.
};
var BspNode = function (bsp, top, bottom, left, right, orientation) {
	this.bsp = bsp;
	this.top = top;
	this.bottom = bottom;
	this.left = left;
	this.right = right;
	this.orientation = orientation;
	this.split = false;
};
BspNode.prototype = {
	top : null,
	bottom : null,
	left : null,
	right : null,
	childA : null,
	childB : null
};

/*
AABB axisaligned bounding box. mostly helper class
 */
var Rectangle = function (x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};
Rectangle.prototype = {
	x : 0,
	y : 0,
	w : 1,
	h : 1,
	constructor : Rectangle,
	overlaps : function (b) {
		var a = this;
		if (a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y) {
			return false;
		} else {
			return true;
		}
	},
	inside : function (b) {
		var a = this;
		if (a.x >= b.x && a.x + a.w <= b.x + b.w && a.y >= b.y && a.y + a.h <= b.y + b.h) {
			return true;
		} else {
			return false;
		}
	}
};
//Create a rectangular area from node. sized by roads.
var nodeToRect = function (node) {
	var x1,
	x2,
	y1,
	y2;
	//Get coords from edges.
	x1 = node.left.x1;
	x2 = node.right.x1;
	y1 = node.top.y1;
	y2 = node.bottom.y1;
	//make it smaller according to roadwidths.
	/*
	x1 = x1 + 1 + Math.floor(node.left.width/2 + 0.1);
	x2 = x2 - 1 - Math.floor(node.right.width/2 - 0.1);
	y1 = y1 + 1 + Math.floor(node.top.width/2 - 0.1);
	y2 = y2 - 1 - Math.floor(node.bottom.width/2 + 0.1);
	 */
	y2 = y2 - Math.floor(node.bottom.width / 2 - 0.1);
	y1 = y1 + 1 + Math.floor(node.top.width / 2 + 0.1);
	x2 = x2 - Math.floor(node.right.width / 2 - 0.1);
	x1 = x1 + 1 + Math.floor(node.left.width / 2 + 0.1);

	//Make the rect
	return new Rectangle(x1, y1, x2 - x1, y2 - y1);
};
