/**
 * GridBuilder module is in charge of building 
 * grids where each tile is identified by an ID. 
 */

/**
 * @constructor Set the zoneID to build the GeoZone.
 */
module.exports = function Geozone(zone) {

	var gZone = zone;


	/**
	 * This method return the zoneID.
	 * @return Return the ZoneID of the GeoZone.
	 */
	this.getZoneID = function() {
		return gZone.zone_id;
	}

	/**
	 * This method return the zone.
	 * @return Return the zone of the GeoZone.
	 */
	this.getZone = function() {
		return gZone;
	}
}
