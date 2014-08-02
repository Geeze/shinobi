//TARGET OF ASSASSINATION

var Lord = function(xx, yy) {
	//Position
	this.x = xx;
	this.y = yy;
	//Display
	this.char = "X";
	this.color = "#000";
	this.bg = "#77f";
	//AI
	
	this.state = "idle"; //idle, escape
	
	this.facing = 0;
	this._facinglines = ["|", "/", "-", "\\", "|", "/", "-", "\\"];
	this.path = [];
	//Vision
	this.fov = {};
	this._seen = false;
	this._visible = false;
	
};

Lord.prototype.act = function(){
	//Handle drawing
	if(this.state == "idle"){
		this.facing = (this.facing + 8 + Math.floor(ROT.RNG.getUniform()*2.99)-1)%8;

	}
	
	this.fov = {};
	var fov = this.fov;
	Game.fov.compute180(this.x, this.y, 10, this.facing,
		function(xx, yy, r, visibility){
			fov[xx + "," + yy] = true;
		}
	);
	//Handle player getting caught
	if((Game.player.x + "," + Game.player.y) in this.fov && this._visible){
		if(this.state == "idle"){
			this.state = "escape";
			Console.message("%c{blue}Lord%c{} sees you.");
			Console.message("%c{grey}GUAAARDS!");
		}
		var maxdist = 0, dist, g = null;
		var l = this;
		Game.guards.forEach(function(guard){
			dist = Math.pow(guard.x - l.x, 2) + Math.pow(guard.y - l.y, 2);
			if(dist > maxdist){
				maxdist = dist;
				g = guard;
			}
		});
		
		var astar = new ROT.Path.AStar(g.x, g.y, escapeRoute);
		this.path = [];
		var lord = this;
		astar.compute(this.x, this.y, function(x, y){
			lord.path.push([x,y]);
			//DEBUG: Game.display.draw(x,y,"x");
		});
		if(this.path.length === 0){
			astar = new ROT.Path.AStar(g.x, g.y, escapeRoute);
			astar.compute(this.x, this.y, function(x, y){
				lord.path.push([x,y]);
			
			});
		}
		this.path.shift();
	}
	//Handle escape
	if(this.state == "escape"){
		
		var p = this.path.shift();
		if(this.path.length === 0) {
			this.state = "idle";
			this.facing = 1;
		} else {
		this.facing = Util.getDir(p[0]-this.x, p[1]-this.y);
			this.x = p[0];
			this.y = p[1];
		}
	}
	
	console.log(this.x + "," + this.y);
	//Util.debugfov();
	if(this.x + "," + this.y in Game.drawfov) {
		Game.display.draw(
			this.x,
			this.y,
			this.char,
			this.color,
			this.bg);
		console.log("drawn at " + this.x + "," + this.y + " facing " + this.facing);
		console.log("player at " + Game.player.x + "," + Game.player.y);
		//Draw the viewcone
		var dir, i;
		if(this.state != "escape")
		for(i = -2; i < 3; i++){
			dir = ROT.DIRS[8][(this.facing + i + 8) % 8];
			Game.display.draw(
				this.x + dir[0],
				this.y + dir[1],
				this._facinglines[(this.facing + i + 8)%8],
				this.bg,
				Game.level.getBg(this.x + dir[0], this.y + dir[1]));
		}
		
		if(!this._seen){
			Console.message("You see a %c{blue}lord%c{}.");
			this._seen = true;
		}
		this._visible = true;
	} else {
		this._visible = false;
		console.log("unseen");
	}

	
};
// CUSTOM PATHFINDER HEURISTIC(?) that avoids the player. simple.
var escapeRoute = function(x, y){
	if(Math.abs(Game.player.x-x) < 2 && Math.abs(Game.player.y-y) < 2) {return false;}
	var key = x + "," + y;
	if(!(key in Game.level.tiles)) return false;
	var tile = Game.level.tiles[key];
	if (tile.type == "floor") { return true; }
	else { return false; }

};