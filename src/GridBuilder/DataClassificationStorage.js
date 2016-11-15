/**
 * DataClassificationStorage module is in charge of storing crime
 * data into a SQL database
 */

module.exports = function DataClassificationStorage(client, log) {

	classificationLog = log;
	var zoneLength;
	var zoneCount;
	var onInsertComplete;
	var that = this;
	var pgClient = client;

	function onTableInserted() {
		if(zoneCount < zoneLength) {
			create(zoneCount, onTableInserted);
		} else {
			onInsertComplete(null, "Insertion Completed...");
		}
	}

	/**
	 * This method create the table for the classification
	 * @param size: Size of the row to be created.
	 * @param tableCreation_callback: Callback function when the inserting is completed.
	 */
	 this.createTable = function(size, tableCreation_callback){
		pgClient.query("SELECT Count(zoneid) FROM classifier", function(error, count) {
			if (error) {
				tableCreation_callback("There was a problem when counting zoneids", null)
				classificationLog.alert('There was a problem when counting zoneids: ', error);
			}
			else if(size != count.rows[0].count){
				that.clearData(function(err) {
					console.log("Amount of rows to insert: " + size + ". Amount of rows previously: ", count.rows[0].count)
					classificationLog.info("Amount of rows to insert: " + size + ". Amount of rows previously: ", count.rows[0].count);
					if (!err) {
		 				zoneLength = size;
		 				zoneCount = 0;
		 				onInsertComplete = tableCreation_callback;
		 				onTableInserted();
					}
				});
			}
			else {
				classificationLog.warning('No Table replacement needed');
				tableCreation_callback(null, "Not table replacement needed");
			}
		});

	 }

	 /**
	  * This method create the zones row in the classififcation table.
	  * @param zone: Zone count to be insert.
	  * @param creation_callback: Callback function when creation is done.
	  */
	 function create(zone, creation_callback) {
	 	pgClient.query("INSERT INTO classifier (zoneID) values ($1)", [zone], function(err, result) {
	 		if(!err) {
	 			zoneCount++;
	 			classificationLog.notice('Insertion of zone ' + zone + ' successfully completed');
	 			creation_callback();
	 		}
	 		else {
	 			classificationLog.critical('There was a problem inserting zone ', zone);
	 		}
	 	});
	}

	/**
	 * This method set on a query the zone to be increase
	 * @param zoneID: Zone id of zone to be update
	 * @param updateCrime_callback: Callback function use when is done.
	 */
	this.updateCrimeCount = function(zoneID, page, offset, updateCrime_callback) {
		pgClient.query("UPDATE classifier SET crimecounter = crimecounter + 1 WHERE zoneid = $1", [zoneID], function(err, result) {
			if(!err) {
				pgClient.query("UPDATE utility SET lastpage = $1, lastoffset = $2", [page, offset], function(error, result) {
	 				if(error) {
	 					classificationLog.alert('There was a problem updating the utility table');
	 				}
	 				else {
	 					classificationLog.notice('Insertion of lastpage ' + page + ' and lastoffset ' + offset + ' successfully completed');
	 					classificationLog.notice('Updating of zone ' + zoneID + ' successfully completed');
						updateCrime_callback();
	 				}
	 			});
			}
			else {
				classificationLog.critical('There was a problem updating zone ', zoneID);
			}
		});
	}

	/**
	 * This method clears the column with the data accumulated.
	 * @param clear_callback: Callback function when the data is cleared.
	 */
	this.clearData = function(clear_callback) {
		pgClient.query("DELETE FROM classifier", function(err) {
 			if(err) {
 				classificationLog.warning('The values in the classification table were NOT DELETED or WERE DELETED already');
 				clear_callback("The values for classification were NOT deleted or were deleted already!", null);		
 			}
 			else {
 				pgClient.query("UPDATE utility SET lastpage = null, lastoffset = null", function(error, result) {
					if(error) {
						log.critical('The utility table was NOT reset');
					}
					else {
						log.notice('The utility table was reset');
						classificationLog.notice('The values in classification table were deleted');
 						clear_callback(null, "The values for classification were deleted!");
					}
				});
 			}
 		});
	}

	/**
	 * This method retreive the max and min for the classification strategy
	 * @param maxMin_callback: Callback function use for retreiving of the max and min
	 */
	this.getCrimeCount = function(crimeCount_callback) {
		pgClient.query("SELECT distinct(crimecounter) FROM classifier", function(err, result) {
 			if(err) {
 				classificationLog.critical('The crime counts for the classification strategy were NOT RETREIVE!');
 			}
 			else {
 				classificationLog.notice('The crime counts for the classification strategy were retreive');
				crimeCountParse(result, crimeCount_callback);		
 			}
 		});
	}

	/**
	 * This method retreive the crime count of the zone for the classification strategy
	 * @param zoneID: zone id of the zone to get crime count
	 * @param zoneCount_callback: Callback function use for retreiving of the crime count
	 */
	this.getZoneCount = function(zoneID, zoneCount_callback) {
		pgClient.query("SELECT crimecounter FROM classifier WHERE zoneid = $1", [zoneID], function(err, result) {
			if(err) {
				classificationLog.critical('The crime count of the zone ' + zoneID + ' WERE NOT retreive');
				console.log("The values on the table were NOT deleted or were deleted already!");		
			}
			else {
				classificationLog.notice('The crime count of the zone ' + zoneID + ' were retreive');
				zoneCount_callback(null, result.rows[0].crimecounter);
 			}
		});
	}

	/**
	 * This method parse the array of crime count into an arra of integers.
	 * @param result: The array result from the crime dictionaty on the database.
	 * @param parsing_callback: Callback function use to retreive the array of integers.
	 */
	var crimeCountParse = function(result, parsing_callback) {
		var crimeCounter = [];
		for(var i = 0; i < result.rows.length; i++) {
			crimeCounter.push(parseInt(result.rows[i].crimecounter));
		}
		parsing_callback(null, crimeCounter);
	}
}