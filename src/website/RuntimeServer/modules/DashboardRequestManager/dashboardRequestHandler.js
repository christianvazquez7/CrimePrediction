/**
 * Handles request to fetch the zones and the 
 * crimes statistics from the database.
 */
 
module.exports = function DashboardRequestHandler() {
	
	/**
	 * Module imports.
	 */
	var MongoClient = require('mongodb').MongoClient;
	var ProtoBuf = require("../../node_modules/protobufjs");
	//var logger = require('../../utils/logger.js');
	var coordinate = require('./GeoCoordinate.js');
	var GridController = require('../DashboardManager/gridController.js');
	var ZonesManager = require('../DashboardManager/zonesManager.js');

	// Protocol buffer initialization
	var protoBuilder = ProtoBuf.loadProtoFile("../../resources/kya.proto");
	var KYA = protoBuilder.build("KYA");
	var GridBounds = KYA.GridBounds;
	var Stats = KYA.Stats;
	var Threshold = KYA.Threshold;
	var zonesManager = new ZonesManager();
    var gridController;
    var mongo = require('mongodb');
    
    var version = mongo.version;

    console.log('The version: ' +version);

	// URL for Mondo db 
	var url = 'mongodb://localhost:3001/Geozone';			
	
	/**
	 * Fetch the current crime statistics from KYA DB.
	 *
	 * @param callback: Callback function to be called when the crime statistics have been fecthed from the database.
	 */
	this.requestStats = function(callback) {
		var maxCrime;
		var minCrime;
		var crimeAverage;
	
		// Use connect method to connect to the Server
		MongoClient.connect(url, function (err, db) {
			// Documents collection
			var collection = db.collection('Geozone');

			if (err) {
				//logger.error('Unable to connect to the mongoDB server. Error:', err);
			} 
			else {
				// Connected
				//logger.debug('Connection established to', url);

				collection.find().sort({"totalCrime":-1}).limit(1).toArray(function (err, result)
											   {
											       console.log(result);
				    if (err) {
					console.log('errorrrr');
						//logger.error(err);
					}
					else if (0) {
						//logger.info('Crime statistics');
						maxCrime = result[0].totalCrime;
						//logger.info('\tMax crimes: ', maxCrime);
						collection.find().sort({"totalCrime":1}).limit(1).toArray(function (err, result) 
						{
							if (err) {
								//logger.error(err);
							}
							else if (result.length) {
								minCrime = result[0].totalCrime;
								//logger.info('\tMin crimes: ', minCrime);
								collection.aggregate([{$group: {_id:null, crimeAverage: {$avg:"$totalCrime"} } }]).toArray(function (err, result)
								{
									if (err) {
										//logger.error(err);
									}
									else if (result.length) {
										crimeAverage = result[0].crimeAverage;
										//logger.info('\tCrime rate: ', crimeAverage);
										db.close();  
										//logger.debug('Mongodb connection closed.');                  
										var result = encodeStats(maxCrime, minCrime, crimeAverage);
										callback(err, result)
									}
								});
							}
						});
					}
											       else {
												   console.log('closing!');
						//logger.error('No document(s) found with defined "find" criteria!');
						db.close();
						//logger.debug('Mongodb connection closed.');
					}
				});
			}
		});
	};

	/**
	 * Fetch the zones from KYA DB.
	 *
	 * @param nwPoint: the north west point
	 * @param sePoint: the south east point
	 * @param area: the size 
	 * @param callback: Callback function to be called when the zones have been fetched from the database.
	 */
	this.requestZones = function(gridBoundsBuffer, callback) {
		try {
			var gridBounds = GridBounds.decode(gridBoundsBuffer);

			var swPoint = [gridBounds.boundaries[0].longitude, gridBounds.boundaries[0].latitude];
			var nwPoint = [gridBounds.boundaries[1].longitude, gridBounds.boundaries[1].latitude];
			var nePoint = [gridBounds.boundaries[2].longitude, gridBounds.boundaries[2].latitude];
			var sePoint = [gridBounds.boundaries[3].longitude, gridBounds.boundaries[3].latitude];

			// logger.info('GET zones in: ');
			// logger.info('\tSW Point', swPoint);
			// logger.info('\tNW Point', nwPoint);
			// logger.info('\tNE Point', nePoint);
			// logger.info('\tSE Point', sePoint);
			
			MongoClient.connect(url, function (err, db) {
				// Documents collection
			    var collection = db.collection('Geozone');
			   // console.log(collection);
				if (err) {
				    //logger.error('Unable to connect to the mongoDB server. Error:', err);
				    console.log('Error connection');
				} 
				else {
				    // Connected
				    console.log('Connection established to', url);
				    console.log(swPoint);
				    console.log(nwPoint);
				    console.log(nePoint);
				    console.log(sePoint);
				    console.log(swPoint);
				    var x = {};
				  //  collection.find({}).toArray(function (e,r){
				//	console.log('in here man');
				//	console.log(r);
				 //   });
				    
				    collection.find( { loc :
						       { $geoWithin :
				         { $geometry :
							   { type : "Polygon",
							     coordinates : [ [ swPoint , nwPoint , nePoint , sePoint , swPoint ] ]
							   } } } } ).toArray(function (err, result) {
		                			       if (err) {
								   console.log('in error');
								   console.log(err);
							}
				    else {
					console.log('to Array');
					
					zones = zonesManager.getGeoJson(result);
					//console.log(zones);
					callback(err, zones);
					    	}
					    	db.close();
					    	//logger.debug('Mongodb connection closed.');
					    });
				}
			});
		}
		catch(err) {
			callback(new Error("Undefined parameter"))
		}
	};

	/**
	 * Creates a new grid given some parameters.
	 *
	 * @param swLat: the south west latitude
	 * @param swLng: the south west longitude
	 * @param neLat: the north east latitude
	 * @param neLng: the north east longitude
	 * @param area: the size for the grids
	 * @param callback: Callback function to be called when the grids have been created
	 */
	this.requestGrids = function(swLat, swLng, neLat, neLng, area, callback) {
		if (typeof swLat === 'undefined' || 
			typeof swLng === 'undefined' || 
			typeof neLat === 'undefined' || 
			typeof neLng === 'undefined' || 
			typeof area === 'undefined') {
			// Error -  undefined value
			callback(new Error("Undefined parameter"))
		}
		else {
			result = gridController.buildGrids(new coordinate(swLat, swLng), new coordinate(neLat, neLng), area);
			callback(null, result);
		}
	};

	/**
	 * Verifies if we are ready to fetch the zones. 
	 *
	 * @param area: the current size of the clicked grid
	 * @param callback: Callback function to be called to send the response
	 */
	this.isReady = function(area, callback) {
		if (typeof area === 'undefined') {
			// Error - Area is undefined
			callback(new Error("Area is undefined"))
		}
		else {
			result = gridController.isReadyToFetch(area);
			callback(null, result);
		}
	};

	/**
	 * Sets the threshold value that indicates when to fetch the zones.
	 *
	 * @param threshold: the threshold value
	 * @param callback: Callback function to be called when the threshold have been set
	 */
	this.setThreshold = function(threshold, callback) {
		try {
			var thresholdBuf = Threshold.decode(threshold);
			var areaThreshold = thresholdBuf.threshold;
			gridController = new GridController(areaThreshold);
			//logger.info('Setting threshold: ', areaThreshold);
			callback(null, 'SUCCESS');
		}
		catch(err) {
			callback(err);
		}
	};

	/**
	 * Prepare the stats to be send via a HTTP respone.
	 *
	 * @param maxCrime: the maximum number of incidents
	 * @param minCrime: the minimum number of incidents
	 * @param crimeAverage: the crime average
	 *
	 * @return buffer: the parameters encoded into a buffer object
	 */
	function encodeStats(maxCrime, minCrime, crimeAverage) {
		var currentStats = new Stats({
			"maxNumOfCrimes" : maxCrime,
			"minNumOfCrimes" : minCrime,
			"crimeAverage": crimeAverage
 		});

 		var buffer = currentStats.encode();
 		return buffer.toBuffer().toString('base64');
	}
};
