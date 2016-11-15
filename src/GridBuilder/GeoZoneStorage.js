/**
 * GeozoneStorage module is in charge convert the GeoZone into format that
 * can manage the MongoManager before storing
 */

/**
 * Module imports
 */
var MongoManager = require('./MongoManager.js');

/**
 * @constructor Receive a GeoZone
 */
module.exports = function GeozoneStorage (log){

	var storageLog = log;
	var mGeozone;
	var gClassifier;
	var mongo;
	var geozoneLength;
	var geozoneCount;
	var onClassified;

	/**
	 * This method is use to initialize the Geozone Storage
	 * @param geozone: Unclassified Geozone to be store.
	 * @param mongoClient: Client of MongoDB to store the Geozones.
	 * @param persisting_Callback: Callback method use when initialization get done.
	 */
	this.init = function(geozone, mongoClient, persisting_Callback) {
		mGeozone = geozone;
		mongo = new MongoManager(mongoClient, storageLog);
		storageLog.notice('Finish Initialization of Geozone Storage');
		persisting_Callback();
	}

	/**
	 * This method is use as a callback for the storage of the geozones.
	 */
	function onZoneStored() {
		if(geozoneCount < geozoneLength) {
			onZoneAdded(geozoneCount, onZoneStored);
		}
		else {
			geozoneCount = 0;
			onClassified();
		}
	}

	/**
	 * This method is use as a callback for the storage of the geozones.
	 */
	function onZoneClassified() {
		if(geozoneCount < geozoneLength) {
			onZoneUpdated(geozoneCount, onZoneClassified);
		}
		else {
			onClassified();
		}
	}

	/**
	 * This method is use to handle the database storage
	 * @param geozone_callback: Callback function use when all Geozones are stored.
	 */
	this.persistGeozone = function(geozone_callback) {
		console.log("Persisting Geozones: ", mGeozone.length);
		geozoneLength = mGeozone.length;
		geozoneCount = 0;
		onClassified =  geozone_callback;
		mongo.zoneCount(function(found) {
			if(found == geozoneLength) {
				console.log("All the geozones are stored...");
				storageLog.notice('All the geozones are stored');
				onClassified();
			}
			else {
				onZoneStored();
			}
		});
	}

	/**
	 * This method is use to persist the classification into the Geozones.
	 * @param classifier: Classification corresponding to a Geozone.
	 * @param classifier_callback: Callback method use then is the classification get done.
	 */
	this.persistClassification = function(classifier, classifier_callback) {
		gClassifier = classifier;
		console.log("Persisting Classification: ", gClassifier.length);
		storageLog.info('Persisting Classification: ', gClassifier.length);
		geozoneLength = classifier.length;
		geozoneCount = 0;
		onClassified = classifier_callback;
		onZoneClassified();
	}

	/**
	 * This method is used for the callback when a GeoZone is stored.
	 * @param index: Index of the zone.
	 * @param callback: Callback function use when the geozone is added.
	 */
	function onZoneAdded(index, callback) {
		geozoneCount++;
		console.log('Adding Geozone ', index);
		storageLog.info('Adding Geozone ', index);
		mongo.addGeozone(mGeozone[index].getZone(), callback);
	}

	/**
	 * This method is used for the callback when a GeoZone is updated.
	 * @param index: Index of the zone.
	 * @param callback: Callback function use when the geozone is updated.
	 */
	function onZoneUpdated(index, callback) {
		geozoneCount++;
		console.log('Updating Classification of Geozone ', index);
		storageLog.info('Updating Classification of Geozone ', index);
		mongo.updateGeozone(gClassifier[index], callback);
	}
}