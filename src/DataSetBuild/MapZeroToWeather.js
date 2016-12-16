var Log = require('log');
var mongodb = require('mongodb');
var coordinate 	= require('../GridBuilder/GeoCoordinate.js');
var fs 	= require('fs');
var log = new Log('debug', fs.createWriteStream('log/mapping-crime-' + new Date().getTime().toString() + '.log'));
var csv = require("fast-csv");
var moment = require('moment-timezone');


var mClient;
var NoSQLconnection = "mongodb://localhost:27017/Weather";
var client = mongodb.MongoClient;




var csvStream = csv.createWriteStream({headers: true}), writableStream = fs.createWriteStream("../../data/zeros-l-w.csv");

writableStream.on("finish", function(){
  console.log("done Writing!");
});

csvStream.pipe(writableStream);


client.connect(NoSQLconnection, function (err, db) {



		csv.fromPath("../../data/z2.csv")
		.on("data", function(data){


			var date = new Date(data[3]);
			//console.log(date);


			var theDate = roundMinutes(date); // 5:00

			function roundMinutes(date) {

			date.setHours(date.getHours() + Math.floor(date.getMinutes()/60));
			date.setMinutes(0);

			return date;
			}

			var weatherEntry = {"date": theDate};
			db.collection('Weather').find(weatherEntry).toArray(function(err, result){
				if(!err) {
					if(result[0] == undefined) {
						console.log('Weather not found for date: '+ theDate);
					}
					else {
						console.log('Found weather!');
						csvStream.write({gridID: data[0], day_name: data[1], month_name: data[2], date: data[3], year: data[4], lat: data[5], lon: data[6], hour: data[7], expected: data[8], tempf:result[0].tempf, vis: result[0].vis});

					}
				}
				else {
					console.log('There was an error finding the weather: ');
				}
			});
 		})
 		.on("end", function(){
     		console.log("done");
 		});









});


