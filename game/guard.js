
var Guard = function(xx, yy) {
	//Position
	this.x = xx;
	this.y = yy;
	//Display
	this.char = "G";
	this.color = "#000";
	this.bg = "#393";
	//AI
	this.state = "sentry"; //sentry, patrol, alert, chase
	this.facing = Math.floor(ROT.RNG.getUniform()*7.99);
	this._facinglines = ["|", "/", "-", "\\", "|", "/", "-", "\\"]; //Characters for the viewcone effect 0 = north
	this.path = [];
	//Vision
	this.fov = {};
	this._seen = false;
	this._visible = false;
	
};

Guard.prototype.act = function(){
	
	var p, dx, dy;

	//SENTRY
	if(this.state == "sentry"){
		this.facing = (this.facing + 8 + Math.floor(ROT.RNG.getUniform()*2.99)-1)%8;
		
		if(ROT.RNG.getUniform() < 0.03){// GONNA GO PATROL Yea
			var p = findFree();					//Find destination for patrol
			this.startPatrol(p.x, p.y);
			//if(_visible){
				Console.message("The %c{green}Guard%c{} has started %c{yellow}patroling%c{}.");
			//}
		}
	}
	//PATROL
	
	if(this.state == "patrol"){
		if(this.path.length !== 0){
			//Get next tile
			
			p = this.path.shift();
			
			//Handle facing while patrol
			dx = p[0] - this.x;
			dy = p[1] - this.y;
			this.facing = getDir(dx, dy);
			
			//Move guard
			this.x = p[0];
			this.y = p[1];
			
			
		} else {
			this.state = "sentry";
			if(this._visible){
				Console.message("The %c{green}Guard%c{} has stopped his %c{yellow}patrol%c{}.");
			}
		}
	}
	//TODO: CHASE / PURSUE
	if(this.state == "chase"){
		if(this.fov[Game.player.x + "," + Game.player.y] && this._visible){
		
			//TAKE STEPS TOWARDS PLAYER, has to reevaluate path everyturn.
			this.path = [];
			var astar = new ROT.Path.AStar(Game.player.x, Game.player.y, lightPasses);
			var d = false;
			var g = this;
			astar.compute(this.x, this.y, function(x, y){
				d = true;
				g.path.push([x, y]);
			});
			
			if(this.path.length > 2){
				//Get next tile
				p = this.path.shift();
				if(p[0] == this.x && p[1] == this.y){//Path first node is on the same tile
					p = this.path.shift();
				}
				
				//Handle facing while chasing
				dx = p[0] - this.x;
				dy = p[1] - this.y;
				this.facing = getDir(dx, dy);
				
				//Move guard
				this.x = p[0];
				this.y = p[1];
			
			
			}
			if(this.path.length < 2){
				Game.engine.lock();
				Console.message("%c{red}GAME OVER%c{} - You got caught! %c{cyan}Press F5/Refresh to restart");
			}
		} else {
			Console.message("The %c{green}Guard%c{} has %c{yellow}lost%c{} you.");
			this.state = "patrol"; //Here is the beauty, the chase route is used for patrol automatically meaning they'll go where player was last seen, to try find him
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
		var dir, i;
		for(i = -1; i < 2; i++){
			dir = ROT.DIRS[8][(this.facing + i + 8)%8];
			Game.display.draw(
				this.x + dir[0], 
				this.y + dir[1], 
				this._facinglines[(this.facing + i + 8)%8], 
				"#0f0", 
				Game.map.getBg(this.x + dir[0], this.y + dir[1]));
		}
		//THE FIRST TIME YOU ENCOUNTER A GUARD
		if (!this._seen){
			Console.message("You see a %c{green}guard%c{}.");
			this._seen = true;
		}
		this._visible = true;
	} else {
		this._visible = false;
	}

	//TODO: GUARD SIGHT
	this.fov = {};
	var fov = this.fov; //allows fov to be used in delegate
	
	Game.fov.compute90(this.x, this.y, 10, this.facing, function(xx, yy, r, visibility){
		fov[xx + "," + yy] = true;
		//Game.display.draw(xx, yy, ".");
	});
	
	//WHEN GUARD SEES PLAYER
	if(this.fov[Game.player.x + "," + Game.player.y] && this._visible){//Condition for if player is seen. reusable

		if(this.state != "chase") 
			Console.message("The %c{green}Guard%c{} has %c{yellow}seen %c{}you!");
		Game.display.draw(this.x, this.y - 1, "!", "#f00", Game.map.getBg(this.x, this.y - 1));
		this.state = "chase";
	}
};
Guard.prototype.startPatrol = function(x, y){
	var astar = new ROT.Path.AStar(x, y, lightPasses);
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
