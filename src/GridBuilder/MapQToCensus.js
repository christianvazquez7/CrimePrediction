
var request = require('request');
var mongodb = require('mongodb');
var coordinate = require('./GeoCoordinate.js');
var fs = require('fs');
var csv = require("fast-csv");
var moment = require('moment-timezone'); 


var mClient;
var client = mongodb.MongoClient;

var csvStream = csv.createWriteStream({headers: true}), writableStream = fs.createWriteStream("../../data/Quarter/streetscore/zed-c-q.csv");
writableStream.on("finish", function(){
  console.log("done Writing!");
});

csvStream.pipe(writableStream);

var acc = {};

csv.fromPath("../../data/StreetScoreNYC-Aggregated.csv")
.on("data", function(data){
	acc[data[1]] = data;
})
.on("end", function(){
	console.log(acc);
 	csv.fromPath("../../data/Quarter/census/zed-c.csv")
	.on("data", function(d){
		if(d[1] in acc){
			b = {};

			Object.keys(d).forEach(function(key) {
    			 b[ key ] = d[ key ];
			}); 

			b['qscore'] = acc[d[1]][0]
			csvStream.write(b);
		}
	})
	.on("end", function(){	
 		 console.log('donneeee!');
	});
 
 });

