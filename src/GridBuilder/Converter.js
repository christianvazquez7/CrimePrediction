/**
 * CoordinateConverter module convert coordinates into tile of an specific
 * area. Also, convert tile into coodinate to create the GeoJson.
 */

/**
 * Module Import
 */
var GridPoint = require('./GridPoint.js');
var GeoCoordinate = require('./GeoCoordinate.js');

module.exports = function Converter (log) {

	var converterLog = log;
	var conversionFactor;

	/**
	 * This method convert coordinate into tile
	 * @param coordinate: Latitude and Longitude
	 * @param area: Area to determine the size of the grid
	 * @return Tile based on the coordinate
	 */
	this.coordinateToTile = function(coordinate, area) {
		var x = (Math.floor((coordinate.longitude + 180) / 360 * Math.pow(2, area)));
		var y = (Math.floor((1 - Math.log(Math.tan(coordinate.latitude * Math.PI / 180) + 1 / Math.cos(coordinate.latitude * Math.PI / 180)) /Math.PI) / 2 * Math.pow(2, area)));
		var area = area;
		return new GridPoint(x, y, area);

	}

	/**
	 * This method convert tile into coordinate.
	 * @param x: x-position from the left top corner.
	 * @param y: y-position from the lett top corner.
	 * @param area: Area to determine the size of the grid
	 * @return The coordinate based on the location (x-position, y-position) 
	 * of the tile.
	 */
	this.tileToCoordinate = function(x, y, area) {
		conversionFactor = Math.PI - 2 * Math.PI * y / Math.pow(2, area);
		var latitude = (180 / Math.PI * Math.atan(0.5 * (Math.exp(conversionFactor) - Math.exp(-conversionFactor))));
		var longitude = (x / Math.pow(2, area) * 360 - 180);
		return new GeoCoordinate(latitude, longitude, area);
	}

	/**
	 * This is method change the area size into the 
	 * corresponding values for the formula for the grid calculation
	 * @param area: is the area inserted for the size.
	 * @return Return the respective size for the calculation
	 */
	this.translateArea = function(area) {
		converterLog.info('Translating Area into the corresponding value for the grid formula');
		var edge = Math.sqrt(area)
		converterLog.info('Area to be convert: ', area);
		var translated = (-1.442627823) * Math.log(edge) + 25.18
		converterLog.info('Value of area converted: ', translated);
		return translated
	}
}