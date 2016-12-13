// Imports

var RequestHandlers = require("./requestHandlers.js");
var Server = require("./server.js");

// Initialize objetcs
var handlers = new RequestHandlers();
var server = new Server();
var port = 3000;

// Start server
server.start(handlers, port);