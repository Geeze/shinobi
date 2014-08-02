/*
	UTIL.JS
	CONTAINS USEFUL IF NOT INTEGRAL FUNCTIONS
	that dont fit anywhere ellse

*/

var Util = {
	/*
		Util.lightPasses(): used for Field of View
	*/
	lightPasses: function(x, y){
		var key = x + "," + y;
		if(!(key in Game.level.tiles)) return false;
		var tile = Game.level.tiles[key];
		if (tile.type == "floor") { return true; }
		else { return false; }
	},

	//Callback for PATHFINDING, not needed. YET! When smoke is introduced.

	/*
		Finds a random free point on the level
	*/
	findFree: function(level, avoid){
		var l;
		if(arguments.length === 0){
			l = Game.level;
		} else {
			l = level;
		}
		
		var pX, pY;
		
			do {
				pX = ROT.RNG.getUniform() * (l.w - 2) + 1;
				pY = ROT.RNG.getUniform() * (l.h - 2) + 1;
				pX = Math.floor(pX);
				pY = Math.floor(pY);
				if(arguments.length < 2){
					avoid = 0;
					dist = 1;
				} else {
					dist = this.distance(Game.player,{x:pX,y:pY});
				}
				
			} while (l.tiles[pX + "," + pY].type == "wall" || dist < avoid);
		 
		return {x: pX, y: pY};
		
	},
	/*
		Util.getDir() = Turns coordinates to ROT.DIRS[8]
	*/
	getDir: function(x,y){

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
		
	},
	//Simple helper for stuff.
	distance: function(a, b){
		var dx, dy;
		dx = a.x - b.x;
		dy = a.y - b.y;
		if(dx < 0) dx = -dx;
		if(dy < 0) dy = -dy;
		
		return Math.sqrt(dx*dx + dy*dy);
	},
	debugfov: function(){
		
		Game.drawfov.forEach(function(p){
			Game.display.draw(p[0],p[1],"y");
		});
		for(var i = 0; i < 70; i++){
			for(var j = 0; j < 25; j++){
				if(Game.drawfov.get([i ,j]) == [i, j]){
					Game.display.draw(i,j,"x");
				}
			}
		}
		
	}
};
