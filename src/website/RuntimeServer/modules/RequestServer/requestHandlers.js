/**
 * This module is in charge of handling all the requests received
 * from the Android application and the Dashboard web page.
**/
module.exports = function RequestHandlers() {

	// Imports
	var logger = require('../../utils/logger.js');
	var DashboardRequestHandler = require('../DashboardRequestManager/dashboardRequestHandler.js');
	var fs = require('fs');
	
	// Initialization
	var mDashboardHandler = new DashboardRequestHandler();

	/**
	 * Request handle for the crime statistics. Connects with the
	 * database to fetch the current statistics.
	 *
	 * @param response: A protobuffer with the current statistics.
	 */
	this.getStats = function(req, res) {
		logger.debug("GET --> Get stats handle");
		mDashboardHandler.requestStats(function(err, result) {
			if (err) {
				res.statusCode = 404;
				res.send('No stats found');
				logger.error(err);
			}
			else {
				res.send(result);
				// logger.info('Stats buffer result --> ', result);
			}
		});
	}

	/**
	 * Request handle for the fetching of the zones. Connects with the 
	 * KYA DB to fetch the zones requested.
	 *
	 * @param req: Object containing the following parameters:
	 *   1) northWest: Farthest north west point of area requested.
	 *   2) northEast: Farthest north east point of area requested.
	 *	 3) southWest: Farthest south west point of area requested.
	 *   4) southEast: Farthest south east point of area requested.
	 * @param response: A Json array with the requested zones.
	 */
	this.getZones = function(req, res) {
		logger.debug("POST --> Zones handle");

	        gridBounds = req.body;
	    console.log('here are the grid bounds');
	    console.log(gridBounds);

		mDashboardHandler.requestZones(gridBounds, function(err, result) {
		    if (err) {
			console.log(err);
				res.statusCode = 400;
				res.send(err);
			}
		    else {
			console.log('sending zones');
				res.send(result);
				// logger.info(result);
			}
		});
	}


	/**
	 * Communicates with teh Grid Controller to construct the grids.
	 *
	 * @param req: Object containing the following parameter:
	 *   1) swLat	: south west latitude of current grid
	 *   2) swLng	: south west longitude of current grid
	 *   3) neLat	: north east latitude of current grid
	 *   4) neLng	: north east longitude of current grid
	 *	 5) area    : size of the next grids
	 * @param response: a GeoJSON with the new grids
	 */
	this.getGrids = function(req, res) {
		logger.debug("GET --> Grids handle");
		swLat = req.query.swLat;
		swLng = req.query.swLng;
		neLat = req.query.neLat;
		neLng = req.query.neLng;
		gridArea = req.query.area;
		mDashboardHandler.requestGrids(swLat, swLng, neLat, neLng, gridArea, function(err, result){
			if (err) {
				res.statusCode = 400;
				res.send(err);
			}
			else {
				res.send(result);
			}
				// logger.info('Get grids result --> ', result);
		});
	}

	this.setThreshold = function(req, res) {
		logger.debug("POST --> Threshold handle");
		threshold = req.body;
		mDashboardHandler.setThreshold(threshold, function(err, result){
			if (err) {
				res.statusCode = 400;
				res.send(err);
			}
			else {
				res.sendStatus(result);
				// logger.info('Threshold result --> ', result);
			}
		});
	}

	/**
	 * Communicates with the GridController to verify if it is time to fethc the zones.
	 *
	 * @param req: Object containing the following parameter:
	 *   1) area    : Current grid's area.
	 * @param response: true, if it is ready to fetch zones, or false, otherwise
	 */
	this.isReady = function(req, res) {
		logger.debug("GET --> Is ready handle");
		gridArea = req.query.gridArea;
		mDashboardHandler.isReady(gridArea, function(err, result){
			if (err) {
				res.statusCode = 400;
				res.send(err);
			}
			else {
				res.send(result);
			}
		});
	}
};
