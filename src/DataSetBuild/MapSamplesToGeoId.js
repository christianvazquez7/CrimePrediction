var request = require('request');
var mongodb = require('mongodb');
var coordinate = require('../GridBuilder/GeoCoordinate.js');
var fs = require('fs');
var csv = require("fast-csv");
var moment = require('moment-timezone'); 

var mClient;
var NoSQLconnection = "mongodb://localhost:27017/Geozone";
var client = mongodb.MongoClient;
var theResult;
var i =  0;
var db;


client.connect(NoSQLconnection, function (err, theDb) {
	
		var csv = require("fast-csv");

    	var csvStream = csv.createWriteStream({headers: true}),
   		writableStream = fs.createWriteStream("../../data/Quarter/zed-f.csv");

		writableStream.on("finish", function(){
		  console.log("done Writing!");
		});

		csvStream.pipe(writableStream);
		var map = {};

		theDb.collection('Geozone').find({}).toArray(function(error,result){
			result.forEach(function(item){
				map[item.zone_id] = item;
			});

			csv.fromPath("../../data/Quarter/zed-n-r-w.csv").on("data", function(data){
				

					var geo = map[data[0]];
					console.log(geo);
				if(geo != undefined) {

					var lati =  geo.center[0];
					var loni = geo.center[1];
					var geoId = geo.geoId;
					console.log('lon:'+geo.geoId);
					//change hour if for one
					csvStream.write({ geoId: geo.geoId, gridID: data[0], day_name: data[1], month_name: data[2], date: data[3], year: data[4], hour: data[5], lat: lati, lon: loni,tempf: data[8], vis: data[9], expected: data[10]});
					console.log('done for: ' + data[0]);
				}
			})
	 		.on("end", function(){
	     		console.log("done");
	 		});
	 	});

});