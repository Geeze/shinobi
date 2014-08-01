
var Guard = function(xx, yy) {
	//Position
	this.x = xx;
	this.y = yy;
	//Display
	this.char = "G";
	this.color = "#000";
	this.bg = "#393";
	//AI
	this.state = "sentry"; //sentry, patrol, search, chase
	/*
		sentry = guard randomly rotates around the spot. Possibility to go on patrol
		patrol = guard chooses a random point and goes there. Starts to sentry at destination
		search = guard chooses a point on heatlevel and goes there. Repeats until no heat
		chase = guard moves towards player when seen. When player is lost, defaults to search
	*/
	this.facing = Math.floor(ROT.RNG.getUniform()*7.99); //Random facing for the guard
	this._facinglines = ["|", "/", "-", "\\", "|", "/", "-", "\\"]; //Characters for the viewcone effect 0 = north
	this.path = [];
	this.stuntime = 0;
	
	//Vision
	this.fov = {}; //List of tiles the guard sees
	this._seen = false; //Used for notifying player when they see a new guard
	this._visible = false; //If guard is seen by player. THIS IS USED TO FIX PEEKING. 
	/**
		Peeking = fov algorithm always shows the tile behind corner.
			XXXXXXX
			XXXXXXX@
			G
		Here the guard would see player and player cant see the guard. 
		_visible makes the game fairer by allowing player to hide behind corners
	*/
	
};

Guard.prototype.act = function(){
	
	var p, dx, dy;

	//SENTRY
	if(this.state == "sentry"){
		this.facing = (this.facing + 8 + Math.floor(ROT.RNG.getUniform()*2.99)-1)%8; //Rotate 45 degrees or not
		
		if(ROT.RNG.getUniform() < 0.03){	// Go for patrol?
			p = Util.findFree();					//Find destination for patrol
			this.startPatrol(p.x, p.y);
			if(this._visible){
				Console.message("The %c{green}Guard%c{} has started %c{yellow}patroling%c{}.");
			}
		}
	}
	//PATROL
	
	if(this.state == "patrol" || this.state == "search"){
		if(this.path.length !== 0){
		
			//Get next tile
			p = this.path.shift();
			
			//Handle facing while patrol
			dx = p[0] - this.x;
			dy = p[1] - this.y;
			this.facing = Util.getDir(dx, dy);
			
			//Move guard
			this.x = p[0];
			this.y = p[1];
			
			
		} else { //End of path
			if(this.state == "patrol"){
				this.state = "sentry";
				if(this._visible){
					Console.message("The %c{green}Guard%c{} has stopped his %c{yellow}patrol%c{}.");
				}	
			} else {//If searching search more!
				this.startSearch(this.x, this.y);
			}
		}
	}//END OF PATROL
	
	//TODO: CHASE / PURSUE
	if(this.state == "chase"){
		if(this.fov[Game.player.x + "," + Game.player.y] && this._visible){ //PLAYER STILL VISIBLE
		
			//TAKE STEPS TOWARDS PLAYER, has to re-evaluate path every turn!
			this.path = [];
			var astar = new ROT.Path.AStar(Game.player.x, Game.player.y, Util.lightPasses);
			var d = false;
			var g = this;
			astar.compute(this.x, this.y, function(x, y){
				d = true;
				g.path.push([x, y]);
			});
			
			if(this.path.length > 2){//PLAYER NOT IN REACH
				//Get next tile
				p = this.path.shift();
				if(p[0] == this.x && p[1] == this.y){//if path first node is on the same tile
					p = this.path.shift();
				}
				
				//Handle facing while chasing
				dx = p[0] - this.x;
				dy = p[1] - this.y;
				this.facing = Util.getDir(dx, dy);
				
				//Move guard
				this.x = p[0];
				this.y = p[1];
			
			}
			
			if(this.path.length < 2){//PLAYER IN REACH
				Game.engine.lock();
				Console.message("%c{red}GAME OVER%c{} - You got caught! %c{cyan}Press F5/Refresh to restart");
			}
		} else {//LOST THE PLAYER
			Console.message("The %c{green}Guard%c{} has %c{yellow}lost%c{} you.");
			this.state = "search"; //Here is the beauty, the chase route is used for patrol automatically meaning they'll go where player was last seen, to try find him.
		}
	}//END OF CHASE
	
	//HANDLE STUN
	if(this.state == "stunned"){
		this.stuntime -= 1;
		if(this.stuntime <= 0){
			this.state = "sentry";
			Console.message("The %c{green}Guard%c{} wakes up.");
		}
	}
	
	//DRAW
	if(this.x + "," + this.y in Game.drawfov) {
	
		Game.display.draw(
			this.x, 
			this.y,  
			this.char, 
			this.color, 
			this.bg);
			
		//Draw the viewcone	
		if(this.state != "stunned"){
			var dir, i;
			for(i = -1; i < 2; i++){
				dir = ROT.DIRS[8][(this.facing + i + 8)%8];
				Game.display.draw(
					this.x + dir[0], 
					this.y + dir[1], 
					this._facinglines[(this.facing + i + 8)%8], 
					"#0f0", 
					Game.level.getBg(this.x + dir[0], this.y + dir[1]));
			}
		}
		//THE FIRST TIME YOU ENCOUNTER A GUARD
		if (!this._seen){
			Console.message("You see a %c{green}guard%c{}.");
			this._seen = true;
		}
		this._visible = true;
	} else {
		this._visible = false;
	}//END OF DRAW

	//GUARD SIGHT
	if(this.state != "stunned"){
	
		this.fov = {};
		var fov = this.fov; //allows fov to be used in delegate(?)
		
		//CALCULATE FOV
		Game.fov.compute90(this.x, this.y, 10, this.facing, function(xx, yy, r, visibility){
		
			fov[xx + "," + yy] = true;
			if(!(Game.player.x == xx & Game.player.y == yy))
				Heat.remove(xx, yy);
				
		});
		
		//WHEN GUARD SEES PLAYER
		if(this.fov[Game.player.x + "," + Game.player.y] && this._visible){//Condition for if player is seen. reusable
			Heat.init();
			Heat.set(Game.player.x, Game.player.y, 16);
			if(this.state != "chase") 
				Console.message("A %c{green}Guard%c{} has %c{yellow}seen %c{}you!");
			Game.display.draw(this.x, this.y - 1, "!", "#f00", Game.level.getBg(this.x, this.y - 1));
			this.state = "chase";
		}
	}//END OF SIGHT
};
/*
	startPatrol(x,y) = selfexplanatory
	I reused this for search, just by manually setting state to "search" afterwards
*/
Guard.prototype.startPatrol = function(x, y){

	var astar = new ROT.Path.AStar(x, y, Util.lightPasses);
	var d = false;//checks if path was created. if not go b to sentry
	var g = this;
	
	astar.compute(this.x, this.y, function(x, y){
		d = true;
		g.path.push([x, y]);
	});
	
	if (d){ //if path was found
		this.state = "patrol";
	} else { //if not
		this.state = "sentry";
	}
};
/*
	startSearch(x,y) = finds closest heat and goes there, repeat.
	
	TODO: Make it so that when the target heat is cleared (by fov or other guards) startSearch() again
*/
Guard.prototype.startSearch = function(x, y){
	var p = Heat.find(x,y);
	if(!p){
		this.state = "sentry";
		return;
	}
	this.startPatrol(p[0], p[1]);
	this.state = "search";
};

