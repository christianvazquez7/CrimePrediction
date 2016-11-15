/**
 * GeoZoneManager module is in charge of organize the building process of all the modules
 * such as classification and storage of Geozones.
 */

/**
 * Module imports
 */
var Classifier 	= require('./GeozoneClassifier.js');
var GeozoneStorage 	= require('./GeozoneStorage.js');
var GridBuilder = require('./GridBuilder.js');

module.exports = function GeozoneManager (pgClient, mongoClient, finish_callback, log) {

	var geozoneLog = log;
	var gridBuilder = new GridBuilder(geozoneLog)
	var mongo = mongoClient;
	var geozoneStorage = new GeozoneStorage(geozoneLog);
	var classifier = new Classifier(pgClient, mongo, geozoneLog);
	var geozoneList;
	var classifiedList;
	var onFinish = finish_callback;
	var onBatchComplete;
	var onStorageComplete;
	geozoneLog.info('Initializing variables for Geozone Manager');

	/**
	 * This method is in charge of building the grid.
	 * @param nw: Northwest side of the grid.
	 * @param se: Southeast side of the grid.
	 * @param area: Area to calculate the size.
	 * @param complete_callback: Callback function when storage got completed
	 */
	this.buildGrid = function(nwCoordinate, seCoordinate, area, complete_callback) {
		geozoneLog.info('Building Geozone Grid');
		if(!this.isGridCreated(nwCoordinate, seCoordinate, area)) {
			geozoneList = gridBuilder.buildGrid(nwCoordinate, seCoordinate, area);
		}
		
		geozoneLog.notice('Grid Building Completed');
		onStorageComplete = complete_callback;
		storeGeozone();
	}

	/**
	 * This method check if the grid is created.
	 * @param nw: Northwest side of the grid.
	 * @param se: Southeast side of the grid.
	 * @param area: Area to calculate the size.
	 * @return Return a boolean value to check if it is created or not.
	 */
	this.isGridCreated = function(nwCoordinate, seCoordinate, area) {
		if(gridBuilder.isGridCreated(nwCoordinate, seCoordinate, area)) {
			return true;
		}
		return false;
	}

	/**
	 * This method feed crime into the Geozone Classifier.
	 * @param crime : List of crime coming from the data provider.
	 * @param marshall: Contains label information for requests.
	 * @param batch_callback: Callback function when crime is procesed
	 */
	this.feedCrime = function(crime, marshall, batch_callback) {
		console.log("Feeding crime....")
		onBatchComplete = batch_callback;
		geozoneLog.info('Feeding Crime');
		classifier.feedCrime(crime, marshall, onCrimeProcessed);

	}

	/**
	 * This method classify all the geozones using a classfication strategy.
	 */
	this.classify = function() {
		classifier.beginClassification(function(err, result) {
			classifiedList = result;
			console.info('Classification Completed');
			geozoneList = null; // Clear Memory...
			persistClassification();
		});
	}

	/**
	 * This method prepare the classification with the corresponding parameters.
	 * @param prepareToClassify_callback: Callback function when is ready classify.
	 */
	this.prepareToClassisfy = function(prepareToClassify_callback) {
		geozoneLog.info('Initializing parameters for classifier');
		classifier.getParameter(prepareToClassify_callback);
	}
	/**
	 * This method drop the accumulator from the crime dictionaty collected
	 * on the SQL database.
	 * @return Return a boolean value if the data were deleted or not.
	 */
	this.clearClassificationData = function(clear_callback) {
		classifier.clear(function(err, result) {
			if(!err) {
				geozoneLog.notice(result);
				clear_callback(null, 'Classification Data clear...');
			}
			else {
				geozoneLog.error(result);
				clear_callback('error', null);
			}
		});
	}

	/**
	 * This method begin the storing process for GeoZone.
	 */
	function storeGeozone() {
		geozoneLog.info('Beginning storage of Geozones')
		if(geozoneList.length == 0){
			geozoneLog.alert('List of Geozone Empty...');
		}
		else {
			geozoneLog.info('Initializing Geozones Storage. ' + geozoneList.length + ' Geozones to be store');
			geozoneStorage.init(geozoneList, mongo, onPersistingGeozone);
		}
	}

	/*
	 * THis method persist the classification for the Geozones.
	 */
	function persistClassification() {
		if(classifiedList.length == 0) {
			geozoneLog.alert('The classification list is Empty');
		}
		else {
			geozoneLog.info('Initializing Classification for Geozones');
			geozoneStorage.persistClassification(classifiedList, onFinish)
		}
	}

	/**
	 * This method is use for the callback to the GeoZoneClassifier.
	 * @param err: Error values if there's any
	 * @param result: Result of the callback
	 */
	var onCrimeProcessed = function(err, result) {
		if(err) {
			geozoneLog.error('There was an error feeding crime: ', err);
			return err
		}
		else {
			console.log(result)
			geozoneLog.notice('Batch of Crime completed');
			onBatchComplete();
		}
	}

	/*
	 * This callback function persisting the Gezones.
	 */
	function onPersistingGeozone() {
		geozoneLog.info('Persisting Geozones');
		geozoneStorage.persistGeozone(onClassification);
	}

	/**
     * This callback function initialize the classification of the Geozones.
     */
	function onClassification() {
		geozoneLog.info('Initializing Geozone Classifier');
		onStorageComplete();
		//classifier.init(geozoneList, geozoneList.length, onStorageComplete);
	}
}