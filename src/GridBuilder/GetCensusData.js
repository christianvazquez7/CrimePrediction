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


client.connect(NoSQLconnection, function (err, theDb) {
	client.connect(NoSQLconnection2, function (ee, db) {
	
	theDb.collection('Geozone').distinct("geoId",function(e,r){
		console.log(r.length);
		r.forEach(function(item){

			censusHandle.getData(item,function(result, d){
				var collapsed = {};
				collapsed["geoId"] = item;
				for(var key in result.data["2010"]){

					for( var k in result.data["2010"][key]){
						collapsed[k] = result.data["2010"][key][k];
					}
				}

				console.log('writing to csv');
				csvStream.write(collapsed);


				// db.collection('Census').update({geoId: item}, {$set : collapsed},{upsert:true, multi:false}, function(e,rr){
				// 	console.log('updated data!!!');
				// });


			});
		});
	});


	});
});


