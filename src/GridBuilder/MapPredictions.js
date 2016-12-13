
var request = require('request');
var mongodb = require('mongodb');
var coordinate = require('./GeoCoordinate.js');
var fs = require('fs');
var csv = require("fast-csv");
var moment = require('moment-timezone'); 


var mClient;
var NoSQLconnection = "mongodb://kya.media.mit.edu:3001/Geozone";
var client = mongodb.MongoClient;

client.connect(NoSQLconnection, function (err, theDb) {
	
	var ac = {};
	csv.fromPath("../../data/Quarter/predicted2006-m.csv")
	.on("data", function(data){
		console.log('dataa');
		ac[data[0]] = data[1];

	})
	.on("end", function(){
		console.log("done");
		console.log("size: "+ Object.keys(ac).length);


		theDb.collection('Geozone').update({},{$set: {totalCrime:0}},{upsert:false, multi:true}, function(x, o){

			for (key in ac) {
				//console.log('hereee');
				if (Number(ac[key]) == 1) {
				theDb.collection('Geozone').update({zone_id:parseInt(key)},{$set: {totalCrime:1}},{upsert:false, multi:true}, function(x, o){
						if(!x){
							console.log(o);
							console.log('Updated!');
						} else {
							console.log('Error on update of zone!!!!!!!!!');
						}
					});
				}
			}

		});
	});



	

});

