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

var NoSQLconnection2 = "mongodb://localhost:27017/Census";


var csvStream = csv.createWriteStream({headers: true}), writableStream = fs.createWriteStream("../../data/census.csv");

writableStream.on("finish", function(){
	console.log("done Writing!");
});

csvStream.pipe(writableStream);


client.connect(NoSQLconnection2, function (ee, db) {
	
	db.collection('Census').find({}).toArray(function(e,r){
		r.forEach(function(item){

			csvStream.write(item);
			console.log('writing!');
		});
	});

});



