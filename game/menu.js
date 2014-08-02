/*
	menu.js - contains menus!
*/

var MainMenu = function(){

};

MainMenu.prototype = {
	constructor: MainMenu,
	menuX: 10,
	menuY: 15,
	ninjaX: 15,
	ninjaY: 3,
	selection: 0,
	lines: ["PLAY", "DO NOT PLAY", "QUITTER", "COMMIT SUDOKU"],
	ninja: ["",
			"|  _____ _     _             _     _ ",
			"| /  ___| |   (_)           | |   (_)",
			"| \\ `--.| |__  _ _ __   ___ | |__  _ ",
			"|  `--. \\ '_ \\| | '_ \\ / _ \\| '_ \\| |",
			"| /\\__/ / | | | | | | | (_) | |_) | |",
			"| \\____/|_| |_|_|_| |_|\\___/|_.__/|_|"
           ],
	act: function(){
		
		for(var i = 0; i < this.lines.length; i++){
			if(i == this.selection)
				Game.display.drawText(this.menuX, this.menuY + i, "%c{black}%b{white}"+this.lines[i]);
			else
				Game.display.drawText(this.menuX, this.menuY + i, "%c{white}%b{black}"+this.lines[i]);
		}
		for(i = this.ninja.length - 1; i >= 0; i--){
				Game.display.drawText(this.ninjaX, this.ninjaY + i, /*"%c{yellow}"+*/this.ninja[i]);
		}
		
		console.log("menu drawn");
		window.addEventListener("keydown", this);
		console.log("listener added");
		Game.engine.lock();
	},
	handleEvent: function(e){
		if(e.keyCode == 38){//up
			this.selection -= 1;
			if(this.selection < 0) 
				this.selection = this.lines.length - 1;
		}
		if(e.keyCode == 40){//down
			this.selection += 1;
			if(this.selection == this.lines.length)
				this.selection = 0;
		}
		if(e.keyCode == 32){//space
			if(this.selection == 3){
				window.location.replace('http://i2.kym-cdn.com/photos/images/original/000/711/753/094.jpg');
			}
			if(this.selection == 0){
				this.startGame();
			}
		}
		window.removeEventListener("keydown", this);
		Game.engine.unlock();
	},
	
	startGame: function(){
		//CREATE SCHEDULER
		
		var lvl = new TileLevel(70,25);
		lvl.generate();
		
		var p = Util.findFree(lvl);
		Game.player = new Player(p.x, p.y);
		
		lvl.load();
		
		lvl.guards.forEach(function(g){
			g.startPatrol(p.x, p.y);		//Start patrol
						//Add guard to gameloop
		});
		
		Heat.init();
		Game.scheduler.add(Game.player, true);
		Game.scheduler.remove(this);
		Game.player.draw();
	}

};
