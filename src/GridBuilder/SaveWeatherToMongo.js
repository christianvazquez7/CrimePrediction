var Log = require('log');
var mongodb = require('mongodb');
var coordinate 	= require('./GeoCoordinate.js');
var fs 	= require('fs');
var log = new Log('debug', fs.createWriteStream('log/mapping-crime-' + new Date().getTime().toString() + '.log'));
var csv = require("fast-csv");
var moment = require('moment-timezone');


var mClient;
var NoSQLconnection = "mongodb://localhost:27017/Weather";
var client = mongodb.MongoClient;


client.connect(NoSQLconnection, function (err, db) {



		csv.fromPath("../../data/NYC-Weather-Hourly.csv")
		.on("data", function(data){


			var date = new Date(data[1]);
			//console.log(date);


			var theDate = roundMinutes(date); // 5:00

			function roundMinutes(date) {

			    date.setHours(date.getHours() + Math.floor(date.getMinutes()/60));
			    date.setMinutes(0);

			    return date;
			}

			var weatherEntry = {"date": theDate, "tempf": data[2],"vis": data[3]};

			db.collection('Weather').insert(weatherEntry, function(err, result) {
					if(!err) {
						console.log('Inserted new weather entry.');
					}
					else {
						console.log('Error entering weather entry');
					}
				});
 		})
 		.on("end", function(){
     		console.log("done");
 		});









});


