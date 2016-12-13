var request = require('request');
var mongodb = require('mongodb');
var coordinate = require('../GridBuilder/GeoCoordinate.js');
var fs = require('fs');
var csv = require("fast-csv");
var moment = require('moment-timezone'); 


var mClient;
var NoSQLconnection = "mongodb://kya.media.mit.edu:3001/Geozone";
var client = mongodb.MongoClient;

var csvStream = csv.createWriteStream({headers: true}), writableStream = fs.createWriteStream("../../data/Quarter/zed-n-r-w.csv");
writableStream.on("finish", function(){
  console.log("done Writing!");
});

csvStream.pipe(writableStream);

var acc = {};

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

	acc[date] = data;
})
.on("end", function(){
		
 	csv.fromPath("../../data/Quarter/zed-n-r.csv")
	.on("data", function(d){

		var date2 = new Date(d[3]);


		var theDate2 = roundMinutes(date2); // 5:00

		function roundMinutes(date) {
			date.setHours(date.getHours() + Math.floor(date.getMinutes()/60));
			date.setMinutes(0);
			return date;
		}

		if(theDate2 in acc) {
			console.log('printing date');
			if (acc[theDate2][2] != 'M' && acc[theDate2][3] != 'M')
				csvStream.write({gridID: d[0], day_name: d[1], month_name: d[2], date: d[3], year: d[4], hour: d[5], lat: d[6], lon: d[7], tempf: acc[theDate2][2],vis: acc[theDate2][3],expected: d[8]});
		}
	})
	.on("end", function(){	
 		 console.log('donneeee!');
	});
 
 });
