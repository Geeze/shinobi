(function(root) {
    'use strict';

    /**
    * Utility functions
    * @class Util
    * @constructor
    * @static
    */
    var Util = {
        /**
        * Merges settings with default values.
        * @method merge
        * @param {Object} defaults - Default values to merge with.
        * @param {Object} settings - Settings to merge with default values.
        */
        merge: function(defaults, settings) {
            var out = {};
            for (var key in defaults) {
                if (key in settings) {
                    out[key] = settings[key];
                } else {
                    out[key] = defaults[key];
                }
            }
            return out;
        },
		
		//Finds a random free point on the map
		findFree: function(level){
			var l = level;
			
			var pX, pY;
			
				do {
					pX = ROT.RNG.getUniform() * (l.w - 2) + 1;
					pY = ROT.RNG.getUniform() * (l.h - 2) + 1;
					pX = Math.floor(pX);
					pY = Math.floor(pY);
				} while (l.get(pX,pY).passable === false);
				
			return {x: pX, y: pY};
		},
		
    };

    root.RL.Util = Util;

}(this));
