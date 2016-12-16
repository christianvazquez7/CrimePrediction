/**
 * This module creates and draws the grids for the zones in the map.
 */
 
module.exports = function ZoneManager() {

	/**
	 * Module imports.
	 */
	var turf = require('../../node_modules/turf');
	
	/**
	 * Gets the color for a risk level classification.
	 *
	 * @param level: (int) the risk level classification
	 * @return String: the level's color in hexadecimal
	 */
        function getLevelColor(level, pred) {
	    var color;
	    if(pred == -1){
		if(level ==1) {
		    return '#389D26';
		} else {
		    return  '#F41E1F';
		}
	    }
	    
	    if(level == 1 && pred == 1) {
		return '#2B1364';
	    } else if (level == 1 && pred ==0) {
		return '#389D26';
	    } else if (level == 10 && pred ==1) {
		return  '#F41E1F';
	    } else if (level == 10 && pred ==0) {
		return '#EC690E';
	    }
  	
		
	};

	this.getLevelColor_ = function(level) {
		return getLevelColor(level);
	}

	this.getGeoJson = function(zonesJson) {
		var features = [];
		for(var i = 0; i < zonesJson.length; i++) {
			var zoneLevel = zonesJson[i].level;
		    var zoneColor = getLevelColor(zoneLevel,zonesJson[i].totalCrime);
			var polygon = turf.polygon(
 				zonesJson[i].loc.coordinates,
 				{ zone_id: zonesJson[i].zone_id,level: zoneLevel, totalCrime: zonesJson[i].totalCrime, color: zoneColor}
 			);
			features.push(polygon);
 		}
		
		return turf.featurecollection(features);
	}
};
