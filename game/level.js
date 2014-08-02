

var TileLevel = function (w, h) { //Class for base level functionality
	this.tiles = {};
	this.w = w;
	this.h = h;
};
/* TILE SYNTAX
var tile = {
	x:
	y:
	char:
	color:
	type: //wall ? floor
	bg:
	unlit:
	midlit:
*/
TileLevel.prototype.getBg = function(x, y){
	if(Game.drawfov)
		if(!(x+","+y in Game.drawfov))
			return this.tiles[x + "," + y].unlit;
	if(Util.distance({x:x,y:y}, Game.player) < 10)
		return this.tiles[x + "," + y].bg;
	else
		return this.tiles[x + "," + y].midlit;
};

//Draws whole level.
TileLevel.prototype.draw = function () {

	var i, j, tile;
	for (i = 0; i < this.w; i++){
		for (j = 0; j < this.h; j++){
			tile = this.tiles[i + "," + j];
			if(tile !== null)
				Game.display.draw(i, j ,tile.char, tile.color, tile.unlit);//TODO Add color
		}
	}

};
//Callback for FOV calculations, used for pathfinding too. good for me :D
