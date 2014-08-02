
ROT.DEFAULT_WIDTH = 70;
ROT.DEFAULT_HEIGHT = 25;


var Game = { //Game container

	//ENGINE
	display: null,
	level: null,
	scheduler: null,
	engine: null,
	
	//CONSTANST
	gameWidth: 70,
	gameHeight: 25,
	//FIELD OF VIEW
	fov: null,
	drawfov: {},

	//Lists of objects
	objects: null,	//Things that go to scheduler
	guards: null,
	player: null,
	lord: null,

	init: function () {
	
		//Main level display
		this.display = new ROT.Display({
			width: this.gameWidth,
			height: this.gameHeight
			
		});
		document.body.appendChild(this.display.getContainer());
		this.scheduler = new ROT.Scheduler.Simple();
		this.engine = new ROT.Engine(this.scheduler);
		
		this.fov = new ROT.FOV.RecursiveShadowcasting(Util.lightPasses);
		
		
		this.scheduler.add(new MainMenu(), true);
		
		//CREATE MAP
		//Deal with the devil
		//ROT.RNG.setSeed(666);
		
		/*DAILY LEVEL
		var d = new Date();
		ROT.RNG.setSeed(d.getDate()+31*d.getMonth()+365*d.getYear());
		//*/
		
		//Use if you need to test consistency? Or whe you need to know guard positions
		/* HERE IS PREVIOUS LEVEL START CODE
		this.level = new TileLevel(this.gameWidth, 25);
		var gen = new ROT.Map.Digger(this.gameWidth, 25, {
			dugPercentage: 0.5, 
			roomHeight: [3, 7], 
			roomWidth: [3, 7]});
		
			
			
		var digCallback = function (xx, yy, value) {
			var tile = {
				x: xx,
				y: yy,
				char: " ",
				color: value ? "#333" : "#aaa",		//Color of character if tile has any.
				type: value ? "wall" : "floor",
				bg: value ? "#333" : "#efe",		//Lit tile color
				unlit: value ? "#000" : "#454",	//Unlit tile color
				midlit: value ? "#111" : "#898"
			};
			Game.level.tiles[xx + "," + yy] = tile; //assign tile to array
		};
		
		gen.create(digCallback);
		
		
		//SPAWN CREATURES
		var p = Util.findFree();
		var g = null;
		var i;
		this.player = new Player(p.x, p.y);
		for (i = 0; i < 8; i++) {//TODO: CHANGE BACK
			p = Util.findFree();					//Find free position
			g = new Guard(p.x, p.y);		//Put guard there
			this.objects.add(g);
			this.guards.add(g);
			p = Util.findFree();					//Find destination for patrol
			g.startPatrol(p.x, p.y);		//Start patrol
			this.scheduler.add(g, true);			//Add guard to gameloop
			
		}
		this.scheduler.add(this.player, true);
		p = Util.findFree();
		this.lord = new Lord(p.x, p.y);
		this.objects.add(this.lord);
		this.scheduler.add(this.lord, true);
		

		//Player is added last so guards take first turn. In theory makes game sometimes unwinnable
		this.objects.add(this.player);
		
		//CREATE FOV and draw first turn
		
		Game.level.draw();
		Game.fov.compute(
			Game.player.x,
			Game.player.y,
			20, 
			Game.player.fovCallback);
		Game.display.draw(
			Game.player.x, 
			Game.player.y, 
			Game.player.char, 
			Game.player.color, 
			"yellow");
		Game.display.draw(this.lord.x, this.lord.y, "X");
		//HEAT Level
		Heat.init();
		
		Heat.set(this.player.x, this.player.y, 54);
		var ii = 32;
		while(ii > 0){
			Heat.spread();
			ii--;
		}
		Heat.draw();
		//*/
		
		
	}

};
//CONSOLE well selfexplanatory
var Console = {

	width: 70,
	height: 5,
	display: null,
	messages: [null, null, null, null, null],
	
	//Setup console display
	_init: function(){
		this.display = new ROT.Display({
			width:this.width/1.2, 
			height: this.height, 
			fg: "#fff", 
			bg: "#005",
			spacing: 1.2});
		document.body.appendChild(this.display.getContainer());
	},
	
	message: function(string) {
		//	handle sneak around spam
		if(string == "%c{grey}You sneak around." && string == this.messages[4]) 
			{ return; }
		this.display.clear();
		//scroll messages upwards
		for (var i = 0; i < 4; i++){
			this.messages[i] = this.messages[i+1];
			if(this.messages[i] !== null)
				this.display.drawText(0, i, this.messages[i]);
		}
		//handle new message
		this.messages[4] = string;
		this.display.drawText(0,4, string);
	}

};


	





