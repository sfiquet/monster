// parameter: optional port number
// if omitted the server is created on port 8080

/* jshint node: true */

"use strict";

var express				= require('express'), // create express app
	exphbs				= require('express-handlebars'),
	bodyParser			= require('body-parser'),
	url 				= require('url'),
	Database 			= require('./lib/database'),
	helpers				= require('./lib/helpers'),
	advancePresenter	= require('./lib/advancepresenter');

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
app.route('/advance')
.get(advancePresenter.get)
.post(advancePresenter.post);

// monster search results page
app.route('/advance/search')
.get(getAdvanceSearch);

/**
 * getHomePage
 * GET handler for the Home page
 */
function getHomePage(req, res){
	res.render('home');
}

/**
 * getAdvancePage
 * GET handler for Advancement page
 */
 /*
function getAdvancePage(req, res){
*/
	/**
	 * isValidOptions
	 * awaits implementation - to check that selected options are valid
	 */
/*
	var isValidOptions = function(options){
		return false;
	};
	
	var myDB = new Database();
	
	// check that we have valid options - reset if not
	if (!isValidOptions(req.query.options)) {
		req.query.options = "";
	}
	
	myDB.findMonster(req.query.monster, function(err, stats){
		if (err) {
			// TO DO: probably needs better error handling than that
			console.log('Database Error: ' + err);
		}
		
		// make sure we have a valid monster selection
		if (err || stats === {}) {
			req.query.monster = "";
		}
		// add properties for the template to use
		else {
			stats.XP = stats.getXP();
			stats.AC = stats.getAC();
			stats.touchAC = stats.getTouchAC();
			stats.flatFootedAC = stats.getFlatFootedAC();
			stats.ACComponents = [];
			if (stats.naturalArmor != 0) {
				stats.ACComponents.push({ name: 'natural', value: stats.naturalArmor });
			}
			
		}
		
		res.render('advancement-form', { monster: stats.name, options: req.query.options, stats: stats});
	});
}
*/

/**
 * postAdvancePage
 * POST Event handler for Advancement page
 */
 /*
function postAdvancePage(req, res){

	if (req.body.submit === "Go") {
	
		// search button was clicked
		var searchQuery = req.body.q;
		res.redirect(url.format({ 
				pathname: '/advance/search', 
				query: { search: searchQuery}}));
		
	} else if (req.body.submit === "Customize") {
		// customize button was clicked
		
	} else {
		// don't know what happened here, log the body
		console.log(req.body);
	}
}
*/

/**
 * getAdvanceSearch
 * GET handler for the Advancement Search page
 */
function getAdvanceSearch(req, res) {

	var buildResultList = function(monsterList, options) {
	
		var buildAdvanceURL = function(monsterId, options){
			return url.format({ 
					pathname: '/advance', 
					query: { 
						monster: monsterId,
						options: options
					}
			});
		};	// buildAdvanceURL

		var i = 0,
			result = [],
			max;
		
		for (max = monsterList.length; i < max; i += 1) {
			result.push({
				url: buildAdvanceURL(monsterList[i].id, options), 
				name: monsterList[i].name
			});
		}
		return result;
	};	// buildResultList

	var myDb = new Database();
	
	myDb.findMonsterList(req.query.search, function(err, list){
		var linkList = [];
		
		if (err) {
			console.log("Database Error: " + err);
		} else {
			// build the list of links
			linkList = buildResultList(list);
		}
		
		res.render('select-monster', { monsters: linkList});	
	});
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