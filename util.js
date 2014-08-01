/*
	UTIL.JS
	CONTAINS USEFUL IF NOT INTEGRAL FUNCTIONS
	that dont fit anywhere ellse

*/

/*
	lightPasses(): used for Field of View
*/
var lightPasses = function(x, y){
	var key = x + "," + y;
	if(!(key in Game.level.tiles)) return false;
	var tile = Game.level.tiles[key];
	if (tile.type == "floor") { return true; }
	else { return false; }
};

//Callback for PATHFINDING, not needed. YET! When smoke is introduced.

/*
	Finds a random free point on the level
*/
var findFree = function(){

	var pX, pY;
	
	do {
		pX = ROT.RNG.getUniform() * (Game.gameWidth - 2) + 1;
		pY = ROT.RNG.getUniform() * (Game.gameHeight- 2) + 1;
		pX = Math.floor(pX);
		pY = Math.floor(pY);
	} while (Game.level.tiles[pX + "," + pY].type == "wall");
	
	return {x: pX, y: pY};
	
};
/*
	getDir() = Turns coordinates to ROT.DIRS[8]
*/
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
//Simple helper for stuff.
distance = function(a, b){
	var dx, dy;
	dx = a.x - b.x;
	dy = a.y - b.y;
	if(dx < 0) dx = -dx;
	if(dy < 0) dy = -dy;
	
	return Math.sqrt(dx*dx + dy*dy);
};

