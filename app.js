// parameter: optional port number
// if omitted the server is created on port 3000
"use strict"

var port = 8080,
	express,
	app,
	server;
	
if (process.argv.length > 2) {
	port = process.argv[2];
}
// create express app
express = require('express');
app = express();

// set up jade
app.set('view engine', 'jade');

// routing
app.get('/', function(req, res){
		res.render('index', { title: 'Express Server App', message: 'This is a test'});
	});

// start the server
server = app.listen(port, function(){
		console.log('Listening on port %d', server.address().port);
	});

exports.app = app;
exports.server = server;
