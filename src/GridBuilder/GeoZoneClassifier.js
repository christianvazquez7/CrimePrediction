/**
 * GeoZoneClassifier module is in charge of 
 * classify tile based on the zoneID.
 */

/**
 * Module imports
 */
var GeoCoordinate = require('./GeoCoordinate.js');
var DataClassificationStorage = require('./DataClassificationStorage.js');
var MongoManager = require('./MongoManager.js');
var Strategy = require('./ClassificationStrategy.js');
var Geozone = require('./GeoZone.js');

/**
 * @Constructor get the list of crime with the marshall
 */
module.exports = function GeozoneClassifier (client, mongoClient, log) {

	var classifierLog = log;
	var mongo = new MongoManager(mongoClient, classifierLog);
	var storage = new DataClassificationStorage(client, classifierLog);

	var unclassifiedZone;
	var classifiedZone = [];
	var onClassifierSet;

	var strategy = new Strategy(classifierLog);

	var crimeCount
	var classificationCount = 0;
	var onBatchComplete;
	var currentCrimeIndex;
	var crimeLength;
	var classificationLength;	
	var currentBatch;
	var that = this;
	var notPinpointed;
	var pinpointCount;

	var onClassification;

	classifierLog.info('Initializing variables for Geozone Classifier');

	/**
	 * This method is use for as a callback method for pinpoint
	 */
	function onPinpoint() {
		currentCrimeIndex ++;
		if(currentCrimeIndex < crimeLength) {
			pinpoint(new GeoCoordinate(currentBatch[currentCrimeIndex].getLatitude(), currentBatch[currentCrimeIndex].getLongitude()), currentBatch[currentCrimeIndex].getPage(), currentBatch[currentCrimeIndex].getOffset(), onPinpoint);
		} 
		else {
			classifierLog.debug('');
			classifierLog.notice("Batch Completed. " +pinpointCount+ " crimes were pinpointed and "+notPinpointed+" were not pinpointed.");
			console.log("Batch Completed. " +pinpointCount+ " crimes were pinpointed and "+notPinpointed+" were not pinpointed.");
			onBatchComplete();
		}
	}

	/**
	 * This method Initialize the  the zone to be classify
	 * @param zone: Unclassified zone.
	 * @param size: Size of the Unclassified zone.
	 * @param callback: Callback function use when the sorting on the table is done.
	 */
	this.init = function(zone, size, callback) {
		unclassifiedZone = zone;
		onClassifierSet = callback;

		classificationLength = unclassifiedZone.length;
		notPinpointed = 0;
		pinpointCount = 0;

		storage.createTable(size, function(err, result, callback) {
			if(err) {
				classifierLog.error('There was an error in the Geozone Classifier: ', err);
				console.error(err);
			}
			else {
				console.log(result);
				classifierLog.notice('Zone Dictionary population completed');
				onClassifierSet();
			}
		});
	}

	/**
	 * This method received the crime list and the marshall
	 * @param List<crime> : List of crime
	 * @param Marshall : marshall to classify each crime.
	 * @param feed_callback : callback method to it finished.
	 */
	this.feedCrime = function(crime, marshall, feed_callback) {

		var ignoreList = marshall.getIgnoreList()
		var isValidCrime = true;
		var filtered = [];
		classifierLog.info('Processing Crime');
		classifierLog.info('Type of of crime to ignore: ', ignoreList.length);

		for (var i = 0; i < crime.length; i++) {
			for (var j = 0; j < ignoreList.length; j++) {
				if(crime[i].getType() == ignoreList[j]) {
					isValidCrime = false;
					break;
				}
			}

			if(isValidCrime) {
				filtered.push(crime[i]);
			}
			isValidCrime = true;
		}

			onBatchComplete = feed_callback;
			currentCrimeIndex = 0;
			crimeLength = filtered.length;
			currentBatch = filtered;
			classifierLog.notice("There were " + crimeLength + " filtered from ", crime.length);
			console.log("There were " + crimeLength + " filtered from ", crime.length);
			classifierLog.notice('Begining of Pinpoint');
			if(crimeLength == 0) {
				onBatchComplete();
			}
			else {
				pinpoint(new GeoCoordinate(filtered[0].getLatitude(), filtered[0].getLongitude()), filtered[0].getPage(), filtered[0].getOffset(), onPinpoint);
			}
	}
	
	/**
	 * This method incriase the ZoneID accumulator by one when the zone is pinpointed.
	 * @param zoneID: Zone id of the zone to be update.
	 * @param update_callback: Callback function use when the zone is updated.
	 */
	var updateDictonary = function(zoneID, page, offset, update_callback) {
		if ((currentCrimeIndex + 1) >= crimeLength) {
			storage.updateCrimeCount(zoneID, (page + 1), null, update_callback)
		}
		else {
			storage.updateCrimeCount(zoneID, page, offset, update_callback)
		}
	}

	/**
	 * This method return the zoneID where the crime was pinpointed
	 * @param coodinate: Location of the crime.
	 * @param pinpoint_callback: Callback function when pinpoint is done.
	 */
	var pinpoint = function(coordinate, page, offset, pinpoint_callback) {
		if(coordinate.getLongitude() != null || coordinate.getLatitude() != null) {
			var location = {
				latitude : parseFloat(coordinate.getLatitude()),
				longitude : parseFloat(coordinate.getLongitude())
			};
			
			mongo.findZone(location, function(found) {
				if(found[0] != undefined){
					pinpointCount++;
					classifierLog.debug('The crime with coordinate: (' + coordinate.getLongitude() + ', ' + coordinate.getLatitude() + ') was pinpointed in zone: ' + found[0].zone_id + '. ' + (currentCrimeIndex + 1) + ' of ', crimeLength);
					updateDictonary(parseInt(found[0].zone_id), page, offset, pinpoint_callback);
				}
				else {
					classifierLog.alert('The crime with coordinate: (' + coordinate.getLongitude() + ', ' + coordinate.getLatitude() + ') was NOT pinpointed into any zone');
					notPinpointed++;
					pinpoint_callback();
				}

			});
		}
		else {
			classifierLog.warning('The crime with coordinate: (' + coordinate.getLongitude() + ', ' + coordinate.getLatitude() + ') was NOT pinpointed');
			notPinpointed++;
			pinpoint_callback();
		}
	}

	/**
	 * This method clears the data of the dictonary.
	 * @param clear_callback: Callback function when the data is cleared.
	 */
	this.clear = function(clear_callback) {
		storage.clearData( function(err, result) {
			if(!err) {
				clear_callback(null, result);
			}
			else {
				clear_callback(result, null);
			}
		});
	}

	/**
	 * This method classify all the tile zone using a classfication strategy.
	 * @para beginClassification_callback: Callback function use when is ready to classify.
	 */
	this.beginClassification = function(beginClassification_callback) {
		onClassification = beginClassification_callback;
		if(classificationCount < classificationLength) {
			classifyZone(classificationCount);
		}
		else {
			beginClassification_callback(null, classifiedZone);
		}
	}

	/**
	 * This method set the parameter for the classification.
	 * @param parameter_callback: Callback function use when parameter are set.
	 */
	this.getParameter = function(parameter_callback) {
		classifierLog.info('Getting Parameter for classification');
		storage.getCrimeCount(function(err, found) {
			if(!err) {
				classifierLog.notice("The distinct crime counts found were ", found);
				strategy.findThreshold(found, 1, parameter_callback);
			}
		})
	}

	/**
	 * This method classify each zone and then create a Geozone.
	 * @param count: Counter to iterate between zone.
	 */
	function classifyZone(count) {
		storage.getZoneCount(count, function(err, result) {
			if(!err) {
				strategy.classify(result, function(level, totalCrime, lower, upper) {
					classifierLog.debug('zone: ' + count + ', level: ' + level + ', Total Crime: ', totalCrime);
					classifiedZone.push({zone: count, level: level, totalCrime: totalCrime, lower: lower, upper: upper});
					classificationCount++;
					that.beginClassification(onClassification);
				});
			}
		});
	}
}
