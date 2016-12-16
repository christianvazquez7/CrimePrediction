/**
 * This module is in charge of routing all requests to its respective handler.
 */
module.exports = function Route(app, handlers) {

	// Imports
	var bodyParser = require('../../node_modules/body-parser')

	// Initialization
	var bufferParser = bodyParser.raw();
	var path    = require("path");
	var __dirname = '/home/cdvm/CrimePrediction/src/website/Dashboard/';

    app.get('/', function (req, res) {
	console.log('sending we');
	    res.sendFile(path.join(__dirname+ '/public/views/index.html'));
	});

	app.get('/aboutus', function (req, res) {
	    res.sendFile(path.join(__dirname+ '/public/views/aboutus.html'));
	});

	app.get('/stats', handlers.getStats);

	app.get('/grids/', handlers.getGrids);

	app.get('/grids/ready/', handlers.isReady);

	app.post('/zones', bufferParser, handlers.getZones);
	
	app.post('/threshold', bufferParser, handlers.setThreshold);
	
	// Error
	app.use(function(req, res, next) {
 		res.status(404).send('The page does not exist.');
	});

};
