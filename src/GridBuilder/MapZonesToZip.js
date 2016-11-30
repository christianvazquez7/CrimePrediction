
var request = require('request');
var mongodb = require('mongodb');
var coordinate = require('./GeoCoordinate.js');
var fs = require('fs');
var csv = require("fast-csv");
var moment = require('moment-timezone'); 


var mClient;
var NoSQLconnection = "mongodb://localhost:27017/Geozone";
var client = mongodb.MongoClient;
var theResult;
var i =  0;
var db;


console.log('here');

var up = function(item, onFin) {
			var lat = item.center[0];
			var lon = item.center[1];
			var id = item._id;

			var options = {
				url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lon+'&zoom=18&addressdetails=1',
				headers: {
					'User-Agent': 'qwert',
					'referrer':'kya.media.mit.edu'
				}
			};

			request(options, function (error, response, body) {
					console.log('Finally');
				  if (!error && response.statusCode == 200) {
				  	var r = JSON.parse(body);
				    console.log(r.address.postcode) 
	    			db.collection('Geozone').update({_id: id}, {$set : {"zip":r.address.postcode}},{upsert:false, multi:true}, function(e,rr){
	    				if(!e) {
	    					console.log('Update');
	    					onFin(i, theResult);
	    				} else {
	    					console.log('Error on update.');
	    				}
	    			}); 

				  } else {

				  	console.log('An error occured...');
				  	console.log(body);
				  }
			});
};

console.log('1');


var next = function(index, results) {
	if(index < results.length) {
		i = i + 1;
		up(results[index], next);
	} else {
		console.log('DONE!');
	}
};


console.log('here');
client.connect(NoSQLconnection, function (err, theDb) {
	db = theDb;
	theDb.collection('Geozone').find({zip:{$ne:0}}).toArray(function(error,result){

		theResult = result;
		next(i, theResult);
	});

});


