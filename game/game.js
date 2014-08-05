
ROT.DEFAULT_WIDTH = 70;
ROT.DEFAULT_HEIGHT = 25;


var Game = { //Game container

	//critical stuff
	display: null,
	level: null,
	scheduler: null,
	engine: null,
	world: null,
	
	//CONSTANST
	gameWidth: 70,
	gameHeight: 25,
	//FIELD OF VIEW
	fov: null,
	drawfov: {},

	//Lists of actors
	actors: null,	//Things that go to scheduler
	guards: null,
	player: null,
	lord: null,

	init: function () {
	
		//Main level display
		this.display = new ROT.Display({
			width: this.gameWidth,
			height: this.gameHeight,
			fontFamily: "Fixedsys",
			spacing: 1
		});
		document.body.appendChild(this.display.getContainer());
		this.scheduler = new ROT.Scheduler.Simple();
		this.engine = new ROT.Engine(this.scheduler);
		
		this.fov = new ROT.FOV.RecursiveShadowcasting(Util.lightPasses);
		this.world = new worldGraph();
		this.world.generate();
		
		this.scheduler.add(new MainMenu(), true);
		
		
		
		
	},

	_fovequals: function(a, b){
		if(Math.floor(a[0]) == Math.floor(b[0]) && Math.floor(a[1]) == Math.floor(b[1])){
			return true;
		} else {
			return false;
		}
	},
	_fovhash: function(object){
		return Math.floor(object[0]) + "," + Math.floor(object[1]);//object[0]+300*object[1];
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


	





