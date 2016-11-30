var Log = require('log');
var mongodb = require('mongodb');
var coordinate 	= require('./GeoCoordinate.js');
var fs 	= require('fs');
var log = new Log('debug', fs.createWriteStream('log/mapping-crime-' + new Date().getTime().toString() + '.log'));

var mClient;
var NoSQLconnection = "mongodb://localhost:27017/Geozone3";
var mongoClient = mongodb.MongoClient;



mongoClient.connect(NoSQLconnection, function (err, db) {
	if (err) {
		log.error('MongoDB Connection Fail');
    	console.log('Unable to connect to the mongoDB server. Error:', err);
  	} 
  	else {
  		log.info('MongoDB Connection successfully');
    	console.log('MongoDB Database Connected');
    	mClient = db;

    	var csv = require("fast-csv");

    	var csvStream = csv.createWriteStream({headers: true}),
   		writableStream = fs.createWriteStream("../../data/RobberyGeozone3.csv");

		writableStream.on("finish", function(){
		  console.log("done Writing!");
		});
		csvStream.pipe(writableStream);

		csv.fromPath("../../data/RobberyNYC.csv")
		.on("data", function(data){
			//console.log(data);
			location = new coordinate(Number(data[7]),Number(data[8]));
			var cor = {
				latitude : parseFloat(location.getLatitude()),
				longitude : parseFloat(location.getLongitude())
			};
			
			 findZone(cor, function(res){
			 	if(res !== undefined) {
			 		//console.log(res[0].zone_id);
			 		console.log(res[0].center)
			 		csvStream.write({crime_id: data[0], date: data[1], day_name: data[2], month_name: data[3], day: data[4], year: data[5], hour: data[6], latitude: data[7], longitude: data[8], gridID: res[0].zone_id, center_lat: res[0].center[0], center_lon: res[0].center[1]});
			 	}

			 	//csvStream.write({a: "a0", b: "b0"});
			 	//console.log(res);
			});
     	
 		})
 		.on("end", function(){
     		console.log("done");
 		});


 		var findZone = function(coordinate, find_callback) {
	mClient.collection('Geozone').find( { loc : { $geoIntersects : { $geometry : { type : "Point", coordinates : [ coordinate.longitude, coordinate.latitude] }}}}).toArray(function(err, result) {
		if(!err) {
			if(result[0] == undefined) {
				console.log('There is NOT zone for coordinate (' + coordinate.longitude + ', ' + coordinate.latitude + ')');
				//find_callback(result);
			}
			else {
				//console.log('The zone was found: ', result[0].zone_id);
				find_callback(result);
			}
		}
		else {
			console.log('There was an error finding the zone: ', err);
			//find_callback(result)
		}
	});
}
    	
	}

});






