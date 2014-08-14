//items.js
//entity for smokebombs
var SmokeBomb = function(x,y){
	this.time = 6;
	this.x = x;
	this.y = y;
	this.color = "#000";
	this.char = "s";
	this.bg = "#555";
	Game.scheduler.add(this,true);
	this.block();
	this.textanimation = [" ", ".", ",", "*", "s", "S", "S"];
};

SmokeBomb.prototype = {
	//block and unblock, alter tile vision values
	block: function(){
		for(var i = this.x-1; i <= this.x+1; i++){
			for(var j = this.y-1; j <= this.y+1; j++){
				var tile = Game.level.tiles[i+","+j];
				tile.smoked = true;
			}
		}
	},
	unblock:function(){
		for(var i = this.x-1; i <= this.x+1; i++){
			for(var j = this.y-1; j <= this.y+1; j++){
				var tile = Game.level.tiles[i+","+j];
				tile.smoked = false;
			}
		}
	},
	draw:function(){
		for(var i = this.x-1; i <= this.x+1; i++){
			for(var j = this.y-1; j <= this.y+1; j++){
				if(i+","+j in Game.drawfov){
					dp = Util.cam(i,j);
					Game.display.draw(dp.x, dp.y, this.textanimation[this.time]	, this.color, this.bg);
				}
			}
		}
	},
	act:function(){
		this.time--;
		if(this.time < 0){
			this.unblock();
			Game.scheduler.remove(this);
		}
		this.draw();
	}
};
