
var request = require('request');
var mongodb = require('mongodb');
var coordinate = require('./GeoCoordinate.js');
var fs = require('fs');
var csv = require("fast-csv");
var moment = require('moment-timezone'); 


var mClient;
var NoSQLconnection = "mongodb://kya.media.mit.edu:3001/Geozone";
var client = mongodb.MongoClient;

var csvStream = csv.createWriteStream({headers: true}), writableStream = fs.createWriteStream("../../data/nyc.csv");
writableStream.on("finish", function(){
  console.log("done Writing!");
});

csvStream.pipe(writableStream);

var acc = {};

csv.fromPath("../../data/mask.csv")
.on("data", function(data){
	acc[data] = data;
})
.on("end", function(){
		
 	csv.fromPath("../../data/QuarterBins2.csv")
	.on("data", function(d){
		if(d[0] in acc)
			csvStream.write(d);
	})
	.on("end", function(){	
 		 console.log('donneeee!');
	});
 
 });

