
var request = require('request');
var mongodb = require('mongodb');
var coordinate = require('./GeoCoordinate.js');
var fs = require('fs');
var csv = require("fast-csv");
var moment = require('moment-timezone'); 


var mClient;
var NoSQLconnection = "mongodb://kya.media.mit.edu:3001/Geozone";
var client = mongodb.MongoClient;

var csvStream = csv.createWriteStream({headers: true}), writableStream = fs.createWriteStream("../../data/mask.csv");
writableStream.on("finish", function(){
  console.log("done Writing!");
});

csvStream.pipe(writableStream);

client.connect(NoSQLconnection, function (err, theDb) {
	

	theDb.collection('Geozone').find({loc: {$geoWithin: {$geometry:{type:"Polygon", coordinates: [[[-73.9874267578125,40.70042247927178],[-73.9215087890625,40.76806170936614],[-73.77044677734375,40.72332345541451],[-73.95584106445312,40.58475654701271],[-74.02587890625,40.62646106367355],[-73.9874267578125,40.70042247927178]]]}}}}).toArray(function(err,result){
		//console.log(result);
		result.forEach(function(item){
			console.log('writing');
			csvStream.write({gridID: item.zone_id});
		});

	});

});

// [[-73.9874267578125,40.70042247927178],[-73.9215087890625,40.76806170936614],[-73.77044677734375,40.72332345541451],[-73.95584106445312,40.58475654701271],[-74.02587890625,40.62646106367355],[-73.9874267578125,40.70042247927178]]]
