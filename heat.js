//HEATMAP HANDLING
var Heat = {};

//Initialize things. Called whenever heatlevel has to be cleared
var heatInit = function(){
	oldNodes = new Set(null, heatEquals, heatHash);
	freshNodes = new Set(null, heatEquals, heatHash);
	heatTime = 0;
};
//Add node in specified coordinates. Heatlevel spreads from there max. time nodes
var heatSet = function(x,y,time){
	freshNodes.add([x,y]);
	heatTime = time;
};
//Spreads the heat one iteration
var heatSpread = function(){
	//Dont spread if time = 0
	if(heatTime < 1) return;
	
	//Get next iteration of nodes
	var newNodes = new Set(null, heatEquals, heatHash);
	freshNodes.forEach(function(node){
		newNodes.addEach(heatNeighbors(node));
	});
	
	oldNodes.addEach(freshNodes);
	freshNodes = newNodes.difference(oldNodes);
	
	heatTime -= 1;
};
//Returns possible neighbors for each node
var heatNeighbors = function(node){

	var i,j;
	var neighbors = new Set();
	
	//3x3 grid around current node, TODO: lightPasses might have to be refactored into something else later
	for(i = -1; i <= 1; i++){
		for(j = -1; j <= 1; j++){
			if(lightPasses(node[0] + i, node[1] + j)){
				neighbors.add([node[0] + i, node[1] + j]);
			}
		}
	}
	
	return neighbors;
};

//Debugging. Draws the heatlevel over game. Atm called by pressing 'H'
var heatDraw = function(){
	oldNodes.forEach(function(node){
		Game.display.draw(node[0], node[1], ".", "#000", "#fb0");
	});
	freshNodes.forEach(function(node){
		Game.display.draw(node[0], node[1], ".", "#000", "#bf0");
	});
};

//heatEquals & heatHash, delegates(?) for the sets
var heatEquals = function(a, b){
	if(a[0] == b[0] && a[1] == b[1]){
		return true;
	} else {
		return false;
	}
};
var heatHash = function(object){
	return object[0] + "," + object[1];//object[0]+300*object[1];
};

//Removes heat from coordinates. Atm called when guards see tiles.
var heatRemove = function(x, y){
	oldNodes.delete([x,y]);
	freshNodes.delete([x,y]);
};

//Find the closest heat
var heatFind = function(x, y){
	var dist, node, curDist;
	dist = infinity;
	oldNodes.forEach(function(p){
		curd = Math.abs(x-p[0])+Math.abs(y-p[1]);
		if(curDist < dist){
			dist = curDist;
			node = p;
		}
	});
	return node;
};
