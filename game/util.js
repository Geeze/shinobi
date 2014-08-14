/*
UTIL.JS
CONTAINS USEFUL IF NOT INTEGRAL FUNCTIONS
that dont fit anywhere ellse

 */

var Util = {

	/*
	inBounds(): because im lazy(?)
	 */
	inBounds : function (x, y, level) {
		if (arguments.length == 3)
			if (x < 0 || y < 0 || x >= level.w || y >= level.h)
				return false;
			else
				return true;
		else
			if (x < 0 || y < 0 || x >= Game.level.w || y >= Game.level.h)
				return false;
			else
				return true;

	},

	/*
	Util.lightPasses(): used for Field of View
	 */
	lightPasses : function (x, y) {
		if (!Util.inBounds(x, y))
			return false;
		var key = x + "," + y;
		if (!(key in Game.level.tiles))
			return false;
		var tile = Game.level.tiles[key];
		if (!tile.blockslos && !tile.smoked) {
			return true;
		} else {
			return false;
		}
	},
	/*
	Util.walkable(): should be used for pathfinding
	 */
	walkable : function (x, y) {
		if (!Util.inBounds(x, y))
			return false;
		var key = x + "," + y;
		if (!(key in Game.level.tiles))
			return false;
		var tile = Game.level.tiles[key];
		if (tile.walkable) {
			return true;
		} else {
			return false;
		}
	},

	/*
	Finds a random free point on the level
	 */
	findFree : function (level, avoid) {
		var l;
		if (arguments.length === 0) {
			l = Game.level;
		} else {
			l = level;
		}

		var pX,
		pY;
		
		do {
			pX = ROT.RNG.getUniform() * (l.w - 2) + 1;
			pY = ROT.RNG.getUniform() * (l.h - 2) + 1;
			pX = Math.floor(pX);
			pY = Math.floor(pY);
			if (arguments.length < 2 || Game.player === null) {
				avoid = 0;
				dist = 1;
			} else {
				dist = this.distance(Game.player, {
						x : pX,
						y : pY
					});
			}

		} while (l.tiles[pX + "," + pY].walkable === false || dist < avoid);
		
		return {
			x : pX,
			y : pY
		};

	},
	/*
	Util.getDir() = Turns coordinates to ROT.DIRS[8]
	 */
	getDir : function (x, y) {

		var l,
		lim;

		lim = 0.8; //Arbitary(estimate) value used to compare which octant the dir is in
		l = Math.sqrt(x * x + y * y);
		if (l === 0) {
			return 0;
		} //no dir. return 0 to avoid freeze. Or well default is up.
		x /= l;
		y /= l;

		if (y < -lim)
			return 0; //UP
		if (y > lim)
			return 4; //DOWN
		if (x < -lim)
			return 6; //REFT
		if (x > lim)
			return 2; //RIGHT
		if (x > 0 && y > 0)
			return 3; //DOWNRIGHT
		if (x > 0 && y < 0)
			return 1; //UPRIGHT
		if (x < 0 && y > 0)
			return 5; //DOWNLEFT
		if (x < 0 && y < 0)
			return 7; //UPLEFT

	},
	//Simple helper for stuff.
	distance : function (a, b) {
		var dx,
		dy;
		dx = a.x - b.x;
		dy = a.y - b.y;
		if (dx < 0)
			dx = -dx;
		if (dy < 0)
			dy = -dy;

		return Math.sqrt(dx * dx + dy * dy);
	},
	debugfov : function () {

		Game.drawfov.forEach(function (p) {
			Game.display.draw(p[0], p[1], "y");
		});
		for (var i = 0; i < 70; i++) {
			for (var j = 0; j < 25; j++) {
				if (Game.drawfov.get([i, j]) == [i, j]) {
					Game.display.draw(i, j, "x");
				}
			}
		}

	},
	/*
	 * randomInRange, returns random integer between a and b, quite likely never returns b.
	 * 
	 */
	randomInRange : function (a, b, pad) {
		var x = ROT.RNG.getUniform();
		pad = pad || 0;
		return Math.floor(a + pad + (b - pad - a) * x);
	},
	/*
	cam = returns point translated by camera position
	 */
	cam : function (x, y) {
		if (!Game.player) {
			return {
				x : x,
				y : y
			};
		} else {
			var p = Game.player;
			return {
				x : x - p.x + Math.floor(Game.gameWidth / 2),
				y : y - p.y + Math.floor(Game.gameHeight / 2)
			};
		}
	},

	//FOR [x,y] pairs
	//this._equals & this._hash, delegates(?) for the sets
	_equals : function (a, b) {
		if (a[0] == b[0] && a[1] == b[1]) {
			return true;
		} else {
			return false;
		}
	},
	_hash : function (object) {
		return object[0] + "," + object[1]; //object[0]+300*object[1];
	}
};
