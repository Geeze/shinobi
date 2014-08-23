//custom houses
/*
width
height
mapdata = [][]

 */

//Scales template evenly
var scaleTemplate = function (template, w, h) {
	//Bring variables from template
	var sliceX = template.sliceX,
	sliceY = template.sliceY;
	var scaleX = template.scaleX,
	scaleY = template.scaleY;
	var modeX = template.modeX,
	modeY = template.modeY;
	//Mapdatas
	var oldMap = template.mapdata;
	var newMap = [];
	for (i = 0; i < h; i++) {
		newMap[i] = [];
	}
	console.log(newMap);
	//Arrays that hold first index of each slice
	var indexX = [],
	indexY = [];
	ii = 0;
	for (i = 0; i < sliceX.length; i++) {
		indexX[i] = ii;
		ii += sliceX[i];
	}
	ii = 0;
	for (i = 0; i < sliceY.length; i++) {
		indexY[i] = ii;
		ii += sliceY[i];
	}

	//Arrays that hold new slice scaleTotals after expansion to wanted scaleTotal
	var newSliceX = sliceX.slice(0),
	newSliceY = sliceY.slice(0);

	//Misc. variables. some hoisting, nothing to worry
	var i,
	j,
	ii,
	jj,
	px,
	py,
	oldx,
	oldy;

	//Expansion part
	while (scaleTotal(newSliceX) < w) {
		for (i = 0; i < newSliceX.length; i++) {
			if (scaleX[i] && scaleTotal(newSliceX) + (scaleX[i]) <= w) {
				newSliceX[i] = newSliceX[i] + (scaleX[i]);

				if (scaleTotal(newSliceX) >= w)
					break;
			}
		}
	}
	while (scaleTotal(newSliceY) < h) {
		for (i = 0; i < newSliceY.length; i++) {
			if (scaleY[i] && scaleTotal(newSliceY) + (scaleY[i]) <= h) {
				newSliceY[i] = newSliceY[i] + (scaleY[i]);

				if (scaleTotal(newSliceY) >= h)
					break;
			}
		}
	}

	//Magic part
	//We will loop over x axis, but slice by slice
	px = 0;
	py = 0;
	for (i = 0; i < sliceX.length; i++) { //sliceX and newSliceX are interchangeable here
		//And each point in slice.

		for (ii = 0; ii < newSliceX[i]; ii++) {
			//Get corresponding tile (x) from template
			if (!modeX[i])
				oldx = indexX[i] + ii % sliceX[i];
			else
				oldx = indexX[i] + Math.floor(ii * (sliceX[i] / newSliceX[i]));
			//Loop over y-axis slice by slice
			for (j = 0; j < sliceY.length; j++) {
				for (jj = 0; jj < newSliceY[j]; jj++) {
					//Get corresponding tile (y) from template
					if (!modeY[j])
						oldy = indexY[j] + jj % sliceY[j];
					else
						oldy = indexY[j] + Math.floor(jj * (sliceY[j] / newSliceY[j]));
					//Important

					newMap[py][px] = oldMap[oldy][oldx];
					py++;
				}
			}
			py = 0;
			px++;
		}
	}

	return {
		mapdata : newMap,
		width : w,
		height : h,
		sliceX : newSliceX, //for red lines
		sliceY : newSliceY //for red lines
	};

};
/*
 *
 * rotation: ROT.DIRS[4]
 * flipped: boolean
 */
var rotatedTemplate = function (template, w, h, rotation, flipped) {
	var oldTemplate;
	var newMap = [];
	var i,
	j,
	ii = 0,
	jj = 0;
	//initialize new data
	for (i = 0; i < h; i++) {
		newMap[i] = [];
	}
	//Create template
	if (rotation == 0 || rotation == 2) { //normal case
		oldTemplate = scaleTemplate(template, w, h);
	} else {
		oldTemplate = scaleTemplate(template, h, w); //It's sideways so its different
	}

	//Rotate and Flip.
	for (i = 0; i < w; i++) {
		for (j = 0; j < h; j++) {
			try {
				if (rotation === 0) { //its upwards

					ii = flipped ? (w - i - 1) : i;
					//console.log(j + ii);
					newMap[j][i] = oldTemplate.mapdata[j][ii];

				}
				if (rotation == 2) { //Down
					ii = flipped ? i : (w - i - 1);
					jj = h - j - 1;
					//console.log((h - j - 1) + (ii));
					newMap[j][i] = oldTemplate.mapdata[jj][ii];

				}
				if (rotation == 1) { //Right
					jj = flipped ? (h - j - 1) : j;
					ii = w - i - 1
					//console.log((w - i - 1) + (jj));

					newMap[j][i] = oldTemplate.mapdata[ii][jj];

				}
				if (rotation == 3) { //Left
					jj = flipped ? j : (h - j - 1);
					//console.log(i + jj);
					newMap[j][i] = oldTemplate.mapdata[i][jj];
				}
			} catch (e) {
				console.log((w - i - 1) + "," + (h-j-i));
				console.log(w + "," + h);
				console.log("jj" + jj);
				
				console.log(newMap[j]);
				console.log("old");
				console.log(oldTemplate.mapdata);
				console.log("new");
				console.log(newMap);
				throw e;
			}
		}
	}
	
	return {
		width : w,
		height : h,
		mapdata : newMap
	};
};

var scaleTotal = function (array) {
	return array.reduce(function (a, b) {
		return a + b;
	});
};

function randInt(a, b) {
	return a + Math.floor(Math.random() * (++b - a));
}
