var API_URL = "http://census.ire.org/geo/1.0/boundary/?contains=";
var request = require('request');
var mongodb = require('mongodb');
var coordinate = require('./GeoCoordinate.js');
var fs = require('fs');
var csv = require("fast-csv");
var moment = require('moment-timezone'); 
var census = require('./ire_census.js');
var censusHandle = new census();

var mClient;
var NoSQLconnection = "mongodb://localhost:27017/Geozone";
var client = mongodb.MongoClient;
var theResult;
var i =  0;
var db;


client.connect(NoSQLconnection, function (err, theDb) {
	db = theDb;
	
	theDb.collection('Geozone').find({"geoId": {$exists: false}}).toArray(function(error,result){
		theResult = result;
		next(i,theResult);
	});

});


var next = function(index, results) {
	if(index < results.length) {
		i = i + 1;
		up(results[index], next);
	} else {
		console.log('DONE!');
	}
};

var up = function(item, onFin) {

		censusHandle.getGeo(item.center,function(data){
				console.log('gt here');
				db.collection('Geozone').update({_id:item._id},{$set: {"geoId":data.objects[2].metadata.GEOID10}},{upsert:false, multi:true}, function(x, o){
					if(!x){
						console.log('Updated: '+ item._id);
						onFin(i,theResult);
					} else {
						console.log('Error on update of zone!!!!!!!!!');
					}
				});


				// censusHandle.getData(data.objects[2].metadata.GEOID10,function(d){
				// 	var collapsed = {};
				// 	console.log(data.objects[2].kind);
				// 	collapsed["geoId"] = data.objects[2].metadata.GEOID10;
				// 	for(var key in d.data["2010"]){
				// 		//console.log(key);
				// 		for( var k in d.data["2010"][key]){
				// 			collapsed[k] = d.data["2010"][key][k];
							
				// 		}

				// 	}

				// 	db.collection('Census').update({geoId: data.objects[2].metadata.GEOID10}, {$set : collapsed},{upsert:true, multi:true}, function(e,rr){
	   //  				if(!e) {
	   //  					db.collection('Geozone').update({_id:item._id},{$set: {"geoId":data.objects[2].metadata.GEOID10}},{upsert:false, multi:true}, function(x, o){
	   //  						if(!x){
	   //  							console.log('Updated: '+ item._id);
	   //  							onFin(i,theResult);
	   //  						} else {
	   //  							console.log('Error on update of zone!!!!!!!!!');
	   //  						}
	   //  					});
	   //  				} else {
	   //  					console.log('Error on update!!!!!!!!!');
	   //  				}
	   //  			}); 


				// },{});
			},{});

}