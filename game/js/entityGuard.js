//entityGuard.js
var entityGuard = {
	name: 'Guard',
	char: 'G',
	color: 'black',
	bgColor: '#0a0',
	pushable: false,
	state: "sentry",
	states: {
		sentry: function(){
			this.facing = (this.facing + 8 + Math.floor(ROT.RNG.getUniform()*2.99)-1)%8; //Rotate 45 degrees or not
			game.console.log("Here I am standing around");
			/*
			if(ROT.RNG.getUniform() < 0.03){	// Go for patrol?
				p = Util.findFree();					//Find destination for patrol
				this.startPatrol(p.x, p.y);
				if(this._visible){
					Console.message("The %c{green}Guard%c{} has started %c{yellow}patroling%c{}.");
				}
			}*/
		}
	}
};