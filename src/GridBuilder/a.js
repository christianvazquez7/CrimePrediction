var up = function(item, callback) {
			var lat = item.center[0];
			var lon = item.center[1];
			var id = item._id;

			var options = {
				url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lon+'&zoom=18&addressdetails=1',
				headers: {
					'User-Agent': 'mas'
				}
			};

			request(options, function (error, response, body) {
					console.log('Finally');
				  if (!error && response.statusCode == 200) {
				  	var r = JSON.parse(body);
				    console.log(r.address.postcode) 
	    			db.collection('Geozone').update({_id: id}, {$set : {"zip":r.address.postcode}},{upsert:false, multi:true}, function(e,rr){
	    				if(!e) {
	    					console.log('Update');
	    					callback(i, theResult);
	    				} else {
	    					console.log('Error on update.');
	    				}
	    			}); 

				  } else {

				  	console.log('An error occured...');
				  }
			});
};

console.log('1');


var next = function(index, results) {
	if(index < results.length) {
		i = i + 1;
		up(results[index], this);
	} else {
		console.log('DONE!');
	}
};


console.log('here');
client.connect(NoSQLconnection, function (err, db) {

	db.collection('Geozone').find({}).toArray(function(error,result){

		theResult = result;
		next(i, theResult);
	});

});
