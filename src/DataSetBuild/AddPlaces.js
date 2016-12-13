var request = require('request');
var mongodb = require('mongodb');
var fs = require('fs');
var csv = require("fast-csv");
var moment = require('moment-timezone'); 


var mClient;
var NoSQLconnection = "mongodb://kya.media.mit.edu:3001/Geozone";
var client = mongodb.MongoClient;

var csvStream = csv.createWriteStream({headers: true}), writableStream = fs.createWriteStream("../../data/Quarter/zed-u.csv");
writableStream.on("finish", function(){
  console.log("done Writing!");
});

csvStream.pipe(writableStream);

var acc = {};

csv.fromPath("../../data/Places.csv")
.on("data", function(data){
	console.log(data[2]);
	var dat = {};
	dat['num_establishments'] = data[3];
	dat['num_liquor_stores'] = data[4];
	dat['num_restaurants'] = data[5];
	dat['num_stores'] = data[6];
	dat['num_bars'] = data[7];
	acc[data[2]] = dat;
	//acc[data] = data;
})
.on("end", function(){
		
 	csv.fromPath("../../data/Quarter/old/unbalanced/zed-cc.csv")
	.on("data", function(d){
		var i = acc[d[1]];
		csvStream.write({'geoId':d[0],'gridID':d[1],'day_name': d[2],'month_name': d[3],'date': d[4],'year': d[5],'hour': d[6],'lat':d[7],'lon':d[8],'tempf': d[9],'vis': d[10],'num_establishments': i['num_establishments'],'num_liquor_stores': i['num_liquor_stores'], 'num_restaurants': i['num_restaurants'],'num_stores':i['num_stores'],'num_bars': i['num_bars'] ,'expected':d[11]});
	})
	.on("end", function(){	
 		 console.log('donneeee!');
	});
 
 });

