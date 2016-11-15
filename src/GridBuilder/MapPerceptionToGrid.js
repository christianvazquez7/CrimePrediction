var Log = require('log');
var mongodb = require('mongodb');
var coordinate 	= require('./GeoCoordinate.js');
var fs 	= require('fs');
var log = new Log('debug', fs.createWriteStream(new Date().getTime().toString() + '.log'));

var mClient;
var NoSQLconnection = "mongodb://localhost:27017/Geozone";
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
   		writableStream = fs.createWriteStream("StreetScoreNYC-Mapped.csv");

		writableStream.on("finish", function(){
		  console.log("done Writing!");
		});
		csvStream.pipe(writableStream);

		csv.fromPath("StreetScoreNYC.csv")
		.on("data", function(data){
			console.log(data);
			location = new coordinate(Number(data[0]),Number(data[1]));
			var cor = {
				latitude : parseFloat(location.getLatitude()),
				longitude : parseFloat(location.getLongitude())
			};
			
			 findZone(cor, function(res){
			 	if(res !== undefined) {
			 		//console.log(res[0].zone_id);
			 		csvStream.write({latitude: data[0], longitude: data[1], qscore: data[2], gridID: res[0].zone_id});
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






