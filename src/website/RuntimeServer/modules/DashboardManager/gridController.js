/**
 * This module creates a GeoJSON object containing grids.
 * Determines if the zones are ready to be fetched.
 */
 
module.exports = function GridController(threshold) {
	
	/**
	 * Module imports.
	 */
	var logger = require('../../utils/logger.js');
	var turf = require('../../node_modules/turf');

	// Minimum area to fetch zone in kilometers
	var areaThreshold = threshold;
	
	/**
	 * Given the north west latitude/longitude and the south east 
	 * latitude/longitude coordinates, it creates a new GeoJSON object 
	 * containing the grids to add to a map.
	 *
	 * @param swCoordinate: (LatLng) the south west latitude and longitude
	 * @param neCoordinate: (LatLng) the north east latitude and longitude
	 * @param area: (int) size of the grids
	 * @return GeoJSON: a GeoJSON containing the grids
	 */
	this.buildGrids = function(swCoordinate, neCoordinate, area) {
		if (typeof swCoordinate === 'undefined' || 
			typeof neCoordinate === 'undefined' || 
			typeof area === 'undefined') {

			throw new Error("Incorrect parameter")
		}
		else {
			logger.info("Grid requested: ");
			logger.info('\tSW coordinate: ', swCoordinate.getLatitude(), swCoordinate.getLongitude());
			logger.info('\tNE coordinate: ', neCoordinate.getLatitude(), neCoordinate.getLongitude());
			logger.info('\tGrid width: ', area);

			var extent = [
							parseFloat(swCoordinate.getLongitude()), 
							parseFloat(swCoordinate.getLatitude()), 
							parseFloat(neCoordinate.getLongitude()), 
							parseFloat(neCoordinate.getLatitude()),
						];
			var cellWidth = area;
			var units = 'kilometers';

			squareGrid = turf.squareGrid(extent, cellWidth, units);
			logger.info('Grid result: ');
			logger.info('\tTotal grids: ', squareGrid.features.length);
				squareGrid.features.forEach(function (feature) {

					var polyCoord = [
					    {lat: feature.geometry.coordinates[0][0][1], lng: feature.geometry.coordinates[0][0][0]}, // swPoint
					    {lat: feature.geometry.coordinates[0][1][1], lng: feature.geometry.coordinates[0][1][0]}, // nwPoint
					    {lat: feature.geometry.coordinates[0][2][1], lng: feature.geometry.coordinates[0][2][0]}, // nePoint
					    {lat: feature.geometry.coordinates[0][3][1], lng: feature.geometry.coordinates[0][3][0]}  // sePoint
	  				];

				    feature.properties['polyCoord'] = polyCoord;
				    feature.properties["area"] = area;
				});
				return squareGrid;
		}
	};
	
	/**
	 * Determines if the zones are ready to be fetched.
	 *
	 * @return boolean: True is the zones are ready to be fetched, False otherwise
	 */
	this.isReadyToFetch = function(gridArea) {
		if (parseFloat(gridArea) <= areaThreshold) {
			// ready
			// fetch zones
			return 'true';
		}
		else if (parseFloat(gridArea) > areaThreshold){
			// not ready
			// build new grid
			return 'false';
		}
		else {
			throw new Error("Incorrect parameter")
		}
	};
};
