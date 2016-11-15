/**
 * GridBuilder module is in charge of building 
 * grids where each tile is identified by an ID. 
 */

/**
 * Module imports
 */
var Converter = require('./Converter.js');
var Geozone = require('./GeoZone.js');
var GridPoint = require('./GridPoint.js');

module.exports = function GridBuilder (log) {

	var gridLog = log;
	var converter = new Converter(gridLog);
	var result = [];
	
	var zoneID;
	var edge

	var nwLat
	var nwLon
	var seLat
	var seLon
	gridLog.info('Initializing variables of GridBuilder');

	/**
	 * This method build the 4-sided grid polygon with a unique ID.
	 * @param area: Area of the polygon.
	 * @param nwCoordinate: NW coordinate (Highest coordinate to begin the grid).
	 * @param seCoordinate: SE coordinate (Lowest coordinate to end the grid).
	 */
	this.buildGrid = function(nwCoordinate, seCoordinate, area) {

		// NW Coordinate
		nwLat = nwCoordinate.getLatitude();
		nwLon = nwCoordinate.getLongitude();

		// SE Coordinate
		seLat = seCoordinate.getLatitude();
		seLon = seCoordinate.getLongitude();

		edge = converter.translateArea(area);

		console.log("NW Coordinate:", nwLat, nwLon);
		console.log("SE Coordinate:", seLat, seLon);
		console.log("Area: ", area);

		// get tile numbers from corners of boundingbox
    	nwTile = converter.coordinateToTile({longitude:nwLon, latitude:nwLat}, edge);
    	seTile = converter.coordinateToTile({longitude:seLon, latitude:seLat}, edge);

    	console.log("Edge Side: ", edge);
    	gridLog.info('Setting parameter to construct grid');

    	zoneID = 0;

		// now loop between these tiles to get every other tile contained in the bounding box
		gridLog.info('Creating Geozone and storing them in a object array');
		for(var x = nwTile.getX(); x <= seTile.getX(); x++) {
			for(var y = nwTile.getY(); y <= seTile.getY(); y++) {
				createTilePolygon(new GridPoint(x, y), edge, zoneID++, function(found) {
					gridLog.debug(JSON.stringify(found));
					result.push(new Geozone(found));
				});
			}
		}
		console.log("Number of zones created: ", result.length);
		gridLog.notice('Successful insertion of ', result.length);
		
		return result
	}

	/**
	 * This method check if the grid is already created.
	 * @param coordinate: Coordinate of the of the grid to be created.
	 * @param area: The area of he grid.
	 * @return Return a boolean value if it was ready created or not.
	 */
	this.isGridCreated = function(coordinate, area) {
		gridLog.info('Check if the grid is created');
		if (nwLat == coordinate.getLatitude()) {
			if (nwLon == coordinate.getLongitude()) {
				if (edge == converter.translateArea(area)) {
					gridLog.notice('There is a grid created of ', coordinate);
					return true
				}
			}
		}
		gridLog.notice('There is not grid created yet');
		return false;
	}

	/**
	 * This method create the geographic polygon for zonde in a object array.
	 * @param gridPoint: The current posistion of coordinate as a point in plane
	 * @param edge: Translated value of the area for the construction
	 * @param zoneID: Zone id of the zone to be created.
	 * @param polygon_callback: Callback function to return the polygon in Geozone format.
	 */
	var createTilePolygon = function(gridPoint, edge, zoneID, polygon_callback) {

		nw = converter.tileToCoordinate(gridPoint.getX(), gridPoint.getY(), edge);
		ne = converter.tileToCoordinate(gridPoint.getX() + 1, gridPoint.getY(), edge);
		se = converter.tileToCoordinate(gridPoint.getX() + 1, gridPoint.getY() + 1, edge);
		sw = converter.tileToCoordinate(gridPoint.getX(), gridPoint.getY() + 1, edge)
		center = converter.tileToCoordinate(gridPoint.getX() + 0.5, gridPoint.getY() + 0.5, edge);



		polygon_callback({ "zone_id": zoneID, "level": 0, "totalCrime": 0, "center":[center.getLatitude(),center.getLongitude()] , "updatedOn": null, "threshold": null, "loc": { "type":"Polygon", "coordinates":[[[nw.getLongitude(), nw.getLatitude()], [ne.getLongitude(), ne.getLatitude()], [se.getLongitude(), se.getLatitude()], [sw.getLongitude(), sw.getLatitude()], [nw.getLongitude(), nw.getLatitude()]]]}});
	}
}
