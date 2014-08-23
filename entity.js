//entity.js

var Entity = function (xx, yy) {

	//Position
	this.x = xx;
	this.y = yy;
	//Display
	this.char = null;
	this.color = null;
	this.bg = null;
	//AI
	this.state = null; //sentry, patrol, search, chase
	this.states = {};
	/*
	sentry = guard randomly rotates around the spot. Possibility to go on patrol
	patrol = guard chooses a random point and goes there. Starts to sentry at destination
	search = guard chooses a point on heatlevel and goes there. Repeats until no heat
	chase = guard moves towards player when seen. When player is lost, defaults to search
	 */
	this.facing = Math.floor(ROT.RNG.getUniform() * 7.99); //Random facing for the guard
	this._facinglines = ["|", "/", "-", "\\", "|", "/", "-", "\\"]; //Characters for the viewcone effect 0 = north
	this.path = [];

	//Vision
	this.fov = {}; //List of tiles the guard sees
	this._seen = false; //Used for notifying player when they see a new guard
	this._visible = false; //If guard is seen by player. THIS IS USED TO FIX PEEKING.

};

Entity.prototype.act = function () {

	var p,
	dx,
	dy;

	//DRAW


	if (this.x + "," + this.y in Game.drawfov) {
		var p = Util.cam(this.x, this.y);
		Game.display.draw(
			p.x,
			p.y,
			this.char,
			this.color,
			this.bg);

		//Draw the viewcone
		if (this.state != "stunned") {
			var dir,
			i;
			for (i = -1; i < 2; i++) {
				dir = ROT.DIRS[8][(this.facing + i + 8) % 8];
				Game.display.draw(
					p.x + dir[0],
					p.y + dir[1],
					this._facinglines[(this.facing + i + 8) % 8],
					"#0f0",
					Game.level.getBg(this.x + dir[0], this.y + dir[1]));
			}
		}
		//THE FIRST TIME YOU ENCOUNTER A GUARD
		if (!this._seen) {
			Console.message("You see a %c{green}guard%c{}.");
			this._seen = true;
		}
		this._visible = true;
	} else {
		this._visible = false;
	} //END OF DRAW

};
/*
startPatrol(x,y) = selfexplanatory
I reused this for search, just by manually setting state to "search" afterwards
 */
Entity.prototype.pathTo = function (x, y) {

	var astar = new ROT.Path.AStar(x, y, Util.walkable);
	var d = false; //checks if path was created. if not go b to sentry
	var g = this;
	g.path = [];

	astar.compute(this.x, this.y, function (x, y) {
		d = true;
		g.path.push([x, y]);
	});

	if (d) { //if path was found
		return true;
	} else { //if not
		return false;
	}
};
/*
 * draw()
 * foreground, if false, means stuff that is okay to get hidden like fov cones
 *
 *
 */
Entity.prototype.draw = function (foreground) {
	if (this.x + "," + this.y in Game.drawfov) {
		var p = Util.cam(this.x, this.y);
		if (foreground) {
			Game.display.draw(
				p.x,
				p.y,
				this.char,
				this.color,
				this.bg);
		} else {
			//Draw the viewcone
			if (this.state != "stunned") {
				var dir,
				i;
				for (i = -1; i < 2; i++) {
					dir = ROT.DIRS[8][(this.facing + i + 8) % 8];
					Game.display.draw(
						p.x + dir[0],
						p.y + dir[1],
						this._facinglines[(this.facing + i + 8) % 8],
						"#0f0",
						Game.level.getBg(this.x + dir[0], this.y + dir[1]));
				}
			}
		}
		//THE FIRST TIME YOU ENCOUNTER A GUARD
		if (!this._seen) {
			this._seen = true;
		}
		this._visible = true;
	} else {
		this._visible = false;
	} //END OF DRAW
}
