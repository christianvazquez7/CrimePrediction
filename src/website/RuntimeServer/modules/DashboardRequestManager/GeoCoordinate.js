/**
 * GeoCoordinate class create coordinates to be access as an object
 */

module.exports = function GeoCoordinate (latitude, longitude) {

    var geoLatitude = latitude;
    var geoLongitude = longitude;

    /**
        * This method return the latitude coordinate.
	 * @return Return the latitude coordinate.
	 */
    this.getLatitude = function() {
	return geoLatitude;

    }

    /**
        * This method return the longitude coordinate.
	 * @return Return the longitude coordinate.
	 */
    this.getLongitude = function() {
	return geoLongitude;

    }

    /**
        * This method return coordinate which represent the latitude and
	 * longitude
	  * @return Return the area of the coordinate
	  */
    this.getCoordinate = function() {
	return "{'latitude:'" + geoLatitude + ", 'longitude': "+ geoLongitude + "}";

    }
}
