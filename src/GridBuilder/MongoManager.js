/**
 * MongoManager module is in charge of the storing the parse GeoZone.
 */

var dateFormat = require('dateformat');
var now = new Date();

module.exports = function MongoManager (mongoClient, log){

	var mongoLog = log;
	var client = mongoClient;

	/*
	 * This method check if the geozone is inserted.
	 * @param zoneID: Zone id to check if it is already inserted.
	 * @param checkInserted_callback: Callback function to return is the . 
	 */
	function isInserted(zoneID, checkInserted_callback) {
		client.collection('Geozone').find({zone_id: zoneID}).count(function(err, result) {
			if(!err) {
				mongoLog.notice('This Geozones are already inserted');
				checkInserted_callback(null,result);
			}
			else {
				mongoLog.error('There was a problem checking if the Geozones were inserted');
			}
		});
	}

	/**
	 * This method add an object array in a format to storage.
	 * @param geozone: Geozone to be added to the database.
	 * @param add_callback: Callback function when addition is done.
	 */
	this.addGeozone = function(geozone, add_callback) {
		isInserted(geozone.zone_id, function(error, result) {
			if((!error) && (!result)) {
				client.collection('Geozone').insert(geozone, function(err, result) {
					if(!err) {
						mongoLog.notice('Inserted Geozone: ', geozone);
						add_callback();
					}
					else {
						mongoLog.critical('Error on Stogare of of Geozone: ', geozone);
						add_callback();
					}
				});
			}
			else {
				console.log('Geozone ' + geozone.zone_id + ' is already added');
				mongoLog.notice('Geozone ' + geozone.zone_id + ' is already added');
				add_callback();
			}
		});
	}

	/**
	 * This method update an object array in a format to storage.
	 * @param classification: Classification for the Geozone to be updated
	 * @param update_callback: Callback function when the updating is done.
	 */
	this.updateGeozone = function(classification, update_callback) {
		var dateUpdated = dateFormat(now, "mm/dd/yyyy");
		client.collection('Geozone').update({zone_id: classification.zone}, { $set: { level: classification.level, totalCrime: parseInt(classification.totalCrime), updatedOn: dateUpdated, threshold: classification.lower + ", " + classification.upper}}, function(err, result) {
			if(!err) {
				mongoLog.notice('Updated Geozone: ', classification);
				update_callback();
			}
			else {
				mongoLog.critical('Error on updating of of Geozone: ', geozone);
			}
		});
	}

	/**
	 * This method find the zone that the coordinate is inside.
	 * @param coordinate: Coordinate reference to be found.
	 * @param find_callback: Callback function when the zone is found.
	 */
	this.findZone = function(coordinate, find_callback) {
		client.collection('Geozone').find( { loc : { $geoIntersects : { $geometry : { type : "Point", coordinates : [ coordinate.longitude, coordinate.latitude] }}}}).toArray(function(err, result) {
			if(!err) {
				if(result[0] == undefined) {
					mongoLog.alert('There is NOT zone for coordinate (' + coordinate.longitude + ', ' + coordinate.latitude + ')');
					find_callback(result);
				}
				else {
					mongoLog.info('The zone was found: ', result[0].zone_id);
					find_callback(result);
				}
			}
			else {
				mongoLog.critical('There was an error finding the zone: ', err);
				find_callback(result)
			}
		});
	}

	/*
	 * This method check if the geozones are inserted.
	 * @param zoneCount_callback: Callback function to return the number of Geozones inserted. 
	 */
	this.zoneCount = function(zoneCount_callback) {
		client.collection('Geozone').find().count(function(err, result) {
			zoneCount_callback(result);
		});
	}
}