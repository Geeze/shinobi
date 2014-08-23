/*
menu.js - contains menus!
 */

var MainMenu = function () {};

MainMenu.prototype = {
	constructor : MainMenu,
	menuX : 10,
	menuY : 15,
	ninjaX : 15,
	ninjaY : 3,
	selection : 0,
	lines : ["PLAY", "DO NOT PLAY", "QUITTER", "COMMIT SUDOKU"],
	ninja : ["",
		"|  _____ _     _             _     _ ",
		"| /  ___| |   (_)           | |   (_)",
		"| \\ `--.| |__  _ _ __   ___ | |__  _ ",
		"|  `--. \\ '_ \\| | '_ \\ / _ \\| '_ \\| |",
		"| /\\__/ / | | | | | | | (_) | |_) | |",
		"| \\____/|_| |_|_|_| |_|\\___/|_.__/|_|"
	],
	act : function () {

		for (var i = 0; i < this.lines.length; i++) {
			if (i == this.selection)
				Game.display.drawText(this.menuX, this.menuY + i, "%c{black}%b{white}" + this.lines[i]);
			else
				Game.display.drawText(this.menuX, this.menuY + i, "%c{white}%b{black}" + this.lines[i]);
		}
		for (i = this.ninja.length - 1; i >= 0; i--) {
			Game.display.drawText(this.ninjaX, this.ninjaY + i, /*"%c{yellow}"+*/
				this.ninja[i]);
		}

		window.addEventListener("keydown", this);
		Game.engine.lock();
	},
	handleEvent : function (e) {
		if (e.keyCode == 38) { //up
			this.selection -= 1;
			if (this.selection < 0)
				this.selection = this.lines.length - 1;
		}
		if (e.keyCode == 40) { //down
			this.selection += 1;
			if (this.selection == this.lines.length)
				this.selection = 0;
		}
		if (e.keyCode == 32) { //space
			if (this.selection == 3) {
				window.location.replace('http://i2.kym-cdn.com/photos/images/original/000/711/753/094.jpg');
			}
			if (this.selection === 0) {
				this.startGame();
			}
		}
		window.removeEventListener("keydown", this);
		Game.engine.unlock();
	},

	startGame : function () {
		//CREATE SCHEDULER
		Game.display.clear();
		var lvl = Game.world.levels[0];
		console.log(lvl);

		var px = lvl.startX;
		var py = lvl.startY;
		Game.player = new Player(px, py);

		lvl.load();

		lvl.guards.forEach(function (g) {
			p = Util.findFree(lvl);
			g.startPatrol(p.x, p.y); //Start patrol
			//Add guard to gameloop
		});

		Heat.init();
		Game.scheduler.add(Game.player, true);
		Game.scheduler.remove(this);
		Game.player.draw();
		//Game.display.draw(lvl.lord.x, lvl.lord.y, "X");
	}

};
