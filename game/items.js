//items.js

var Inventory = {

	width : 15,
	height : 25,
	display : null,
	items : [],
	maxSize : 6,

	//Setup console display
	_init : function () {
		this.display = new ROT.Display({
				width : this.width,
				height : this.height,
				fg : "#fff",
				bg : "#003",
				spacing : 1
			});
		document.body.appendChild(this.display.getContainer());
		//TEST
		while (this.addItem(new Item("%c{grey}Smokebomb", 1 , true, false, ItemSmokeBomb))) {
			console.log("Added smokebombs");
		}

	},
	addItem : function (item) {
		if (this.getWeight() + item.size > this.maxSize) {
			return false; //Couldnt pick item up
		}
		this.items.push(item);
		this.draw();
		return true;
	},
	useItem : function (index) {
		var item = this.items[index];
		if (!item.targetable) {
			Console.message("Used " + this.items[index].name);
			this.items.splice(index, 1);
			if(item.action)
				item.action(Game.player.x,Game.player.y);
		}
		this.draw();
	},
	getWeight : function () {
		var weight = 0;
		this.items.forEach(function (i) {
			weight += i.size;
		});
		return weight;
	},
	draw : function () {
		this.display.clear();
		//Draw header
		this.display.drawText(1, 1, "Inventory");
		this.display.drawText(0, 2, "===============");
		var i;
		for (i in this.items) {
			var y = 4 + 3 * i;
			var item = this.items[i];
			this.display.draw(0, y, ++i, C_WALL_SHADOW, "#bbf");
			this.display.drawText(2, y, item.name);
		}
	}

};
var Item = function (name, size, consumable, targetable, action) {
	this.name = name;
	this.size = size;
	this.consumable = consumable;
	this.targetable = targetable;
	this.action = action;
};

var ItemSmokeBomb = function(x,y){
	new SmokeBomb(x,y);
};
//entity for smokebombs
var SmokeBomb = function (x, y) {
	this.time = 6;
	this.x = x;
	this.y = y;
	this.color = C_WALL_SHADOW;
	this.char = "s";
	this.bg = "#555";
	Game.scheduler.add(this, true);
	this.block();
	this.textanimation = [" ", ".", ",", "*", "s", "S", "S"];
};
SmokeBomb.prototype = {
	//block and unblock, alter tile vision values
	block : function () {
		for (var i = this.x - 1; i <= this.x + 1; i++) {
			for (var j = this.y - 1; j <= this.y + 1; j++) {
				var tile = Game.level.tiles[i + "," + j];
				tile.smoked = true;
			}
		}
	},
	unblock : function () {
		for (var i = this.x - 1; i <= this.x + 1; i++) {
			for (var j = this.y - 1; j <= this.y + 1; j++) {
				var tile = Game.level.tiles[i + "," + j];
				tile.smoked = false;
			}
		}
	},
	draw : function () {
		for (var i = this.x - 1; i <= this.x + 1; i++) {
			for (var j = this.y - 1; j <= this.y + 1; j++) {
				if (i + "," + j in Game.drawfov) {
					dp = Util.cam(i, j);
					Game.display.draw(dp.x, dp.y, this.textanimation[this.time], this.color, this.bg);
				}
			}
		}
	},
	act : function () {
		this.time--;
		if (this.time < 0) {
			this.unblock();
			Game.scheduler.remove(this);
		}
		this.draw();
	}
};
