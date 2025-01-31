var GeozoneManager 	= require('./GeoZoneManager.js');
var Log = require('log');
var mongodb = require('mongodb');
var coordinate 	= require('./GeoCoordinate.js');
var fs 	= require('fs');


var log = new Log('debug', fs.createWriteStream('log/grid-build-'+new Date().getTime().toString() + '.log'));
var mClient;
var NoSQLconnection = "mongodb://localhost:27017/Geozone3";
var mongoClient = mongodb.MongoClient;


mongoClient.connect(NoSQLconnection, function (err, db) {
	if (err) {
		log.error('MongoDB Connection Fail');
    	console.log('Unable to connect to the mongoDB server. Error:', err);
  	} 
  	else {


      var onGridComplete = function() {
        mClient.close();
        log.notice('KYA Building Completed');
        console.log("| Geozone Building Complete |");
      }

      var onStorageComplete = function() {
        console.log('storage of area complete!');
      }

  		log.info('MongoDB Connection successfully');
    	console.log('MongoDB Database Connected');
    	mClient = db;
    	var geo = new GeozoneManager(null, mClient, onStorageComplete, log);
    	geo.buildGrid(new coordinate(40.764649, -73.983307), new coordinate(40.653262, -73.792419),60000,onGridComplete);
	}


});

