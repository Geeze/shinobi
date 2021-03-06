//HEATMAP HANDLING
var Heat = {
	
	time: 0,
	oldNodes: null,
	freshNodes: null,
	
	//Initialize things. Called whenever heatlevel has to be cleared
	init: function(){
		this.oldNodes = new Set(null, this._equals, this._hash);
		this.freshNodes = new Set(null, this._equals, this._hash);
		this.time = 0;
	},
	//Add node in specified coordinates. Heatlevel spreads from there max. time nodes
	set: function(x,y,time){
		this.freshNodes.add([x,y]);
		this.time = time;
	},
	
	neighbors: function(node){

		var i,j;
		var n = new Set();
		
		//3x3 grid around current node, TODO: Util.lightPasses might have to be refactored into something else later
		for(i = -1; i <= 1; i++){
			for(j = -1; j <= 1; j++){
				if(Util.walkable(node[0] + i, node[1] + j)){
					n.add([node[0] + i, node[1] + j]);
				}
			}
		}
		
		return n;
	},
	//Spreads the heat one iteration
	spread: function(){
		//Dont spread if time = 0
		if(this.time < 1) return;
		me = this;
		//Get next iteration of nodes
		var newNodes = new Set(null, this._equals, this._hash);
		this.freshNodes.forEach(function(node){
			newNodes.addEach(me.neighbors(node));
		});
		
		this.oldNodes.addEach(this.freshNodes);
		this.freshNodes = newNodes.difference(this.oldNodes);
		
		this.time -= 1;
	},
	//Returns possible neighbors for each node
	

	//Debugging. Draws the heatlevel over game. Atm called by pressing 'H'
	draw: function(){
		this.oldNodes.forEach(function(node){
			var point = Util.cam(node[0],node[1]);
			Game.display.draw(point.x, point.y, ".", C_WALL_SHADOW, "#fb0");
		});
		this.freshNodes.forEach(function(node){
			var point = Util.cam(node[0],node[1]);
			Game.display.draw(point.x, point.y, ".", C_WALL_SHADOW, "#bf0");
		});
	},

	//this._equals & this._hash, delegates(?) for the sets
	_equals: function(a, b){
		if(a[0] == b[0] && a[1] == b[1]){
			return true;
		} else {
			return false;
		}
	},
	_hash: function(object){
		return object[0] + "," + object[1];//object[0]+300*object[1];
	},

	//Removes heat from coordinates. Atm called when guards see tiles.
	remove: function(x, y){
		this.oldNodes.delete([x,y]);
		this.freshNodes.delete([x,y]);
	},

	//Find the closest heat
	find: function(x, y){
		var dist, node, curDist;
		dist = 999999999;
		this.oldNodes.forEach(function(p){
			curDist = Math.abs(x-p[0])+Math.abs(y-p[1]);
			if(curDist < dist){
				dist = curDist;
				node = p;
			}
		});
		this.freshNodes.forEach(function(p){
			curDist = Math.abs(x-p[0])+Math.abs(y-p[1]);
			if(curDist < dist){
				dist = curDist;
				node = p;
			}
		});
		return node;
	}
};