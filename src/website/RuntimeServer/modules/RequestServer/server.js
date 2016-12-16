/**
 * Creates the server, listen for requests and routes 
 * the request for its respective handler.
**/
module.exports = function Server() {
  // Imports
  var express = require('express');
  var routes = require('./routes.js');
  var logger = require('../../utils/logger.js');
  var path    = require("path");
  
  var app = express();
  var __dirname = '/home/cdvm/CrimePrediction/src/website/Dashboard';
  // Store all HTML files in view folder.
  // app.use(express.static('/Users/omar91/Development/CAPSTONE/Dashboard/public'));

  // set static directories
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static('/home/cdvm/CrimePrediction/src/website/RuntimeServer/resources'));

//Store all JS and CSS in Scripts folder.
  /**
   * Creates and starts the server.
   *
   * @param route : function for routing the requests
   * @param handle: handlers array
   * @param port  : the port to listen
   */
  this.start = function(handlers, port) {
  	routes(app, handlers);
    createServer(port);
  }

  /**
   * Creates the server.
   *
   * @param port: the port to listen
   */
  function createServer(mPort) {
  		
  		var port = process.env.PORT || mPort;
  		app.listen(port);
  		logger.info("app listening on port " + port + ".");
		console.log("Express server listening on port %d in %s mode", port, app.settings.env);
  }
};
