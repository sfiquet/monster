// parameter: optional port number
// if omitted the server is created on port 8080

/* jshint node: true */

"use strict";

var express				= require('express'), // create express app
	exphbs				= require('express-handlebars'),
	bodyParser			= require('body-parser'),
	helpers				= require('./lib/helpers'),
	advancePresenter	= require('./lib/advancepresenter'),
	optionsPresenter	= require('./lib/optionspresenter'),
	browsePresenter		= require('./lib/browsepresenter');

var app = express();

// set up handlebars as template engine
app.engine('handlebars', exphbs({defaultLayout: 'main', helpers: helpers}));
app.set('view engine', 'handlebars');

// serve static files
app.use(express.static(__dirname + '/public'));

// set up body parsing for posting forms
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded

/**
 * routing
 */

// Home page
app.route('/')
.get(getHomePage);

// Advancement page
app.route('/advance/:monster/:options')
.get(advancePresenter.get)
.post(advancePresenter.post);

app.route('/advance')
.get(advancePresenter.getDefault);

// monster search results page
app.route('/advance/:monster/:options/search')
.get(browsePresenter.get);

app.route('/advance/:monster/:options/search/:search')
.get(browsePresenter.get);

// advancement options selection page
app.route('/advance/:monster/:options/options')
.get(optionsPresenter.get)
.post(optionsPresenter.post);

/**
 * getHomePage
 * GET handler for the Home page
 */
function getHomePage(req, res){
	res.render('home', { pageTitle: 'Monster Workshop' });
}

/**
 * start the server
 */
function start(){
	var port = process.env.PORT || 8080;
	app.listen(port, function(){
		console.log('Listening on port %d', port);
	});
}

/**
 * Only start server if this script is executed, not if it's require()'d.
 * This makes it easier to run integration tests on ephemeral ports.
 */
if (require.main === module) {
  start();
}

exports.app = app;