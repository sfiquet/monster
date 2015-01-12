// parameter: optional port number
// if omitted the server is created on port 8080

/* jshint node: true */

"use strict";

var express,
	exphbs,
	bodyParser,
	url,
	app,
	server;
	
// create express app
express = require('express');
exphbs  = require('express-handlebars');
bodyParser = require('body-parser');
url = require('url');

app = express();

// set up handlebars as template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// serve static files
app.use(express.static(__dirname + '/public'));

// set up body parsing for posting forms
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded

// routing

/**
 * Home page
 */
app.get('/', function(req, res){
		res.render('home');
//		res.render('home', { title: 'Monster Workshop', body: 'This is a test'});
	});

// TO DO: change this when using the database
var isValidMonster = function(monsterStr){
	var i = 0,
		len = monsters.length;
	
	if (!monsterStr) {
		return false;  
	}
		
	for (; i < len; i+=1) {
		if (monsterStr === monsters[i]) {
			return true;
		}
	}
	return false;
};

var isValidOptions = function(options){
	return false;
};

/**
 * Advancement page
 */
app.get('/advance', function(req, res){
	var stats = "This is where the stats go";
	
	// check that we have valid query parameters
	if (!isValidMonster(req.query.monster)) {
		req.query.monster = "";
	}
	
	if (!isValidOptions(req.query.options)) {
		req.query.options = "";
	}
	
	res.render('advancement-form', { monster: req.query.monster, options: req.query.options, stats: stats});
});

/**
 * Event handler for Advancement page
 */
app.post('/advance', function(req, res){

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
});

var monsters = [
	"Aasimar", 
	"Aboleth", 
	"Angel, Astral Deva",
	"Angel, Planetar",
	"Angel, Solar",
	"Animated Object",
	"Ankheg",
	"Ant, Giant",
	"Army Ant Swarm",
	"Ape, Dire",
	"Ape, Gorilla"
	];

// splits a string into word tokens
var tokenize = function(myString){
	return myString.match(/\w+/g);
};

// converts an array of strings to an array of regular expressions
var toRegExp = function(strArray, flags){
	var i = 0,
	reArray = [],
	len;
	for (len = strArray.length; i < len; i += 1) {
		reArray[i] = new RegExp(strArray[i], flags);
	}
	return reArray;
};

var buildResultList = function(queryString, stringArray) {
	var i = 0,
		result = [],
		tokens,
		j,
		maxMonsters,
		maxTokens,
		match;
	
	// no query: return everything
	if (!queryString) {
		for (maxMonsters = stringArray.length; i < maxMonsters; i += 1) {
			// TO DO: add the options parameter
			result.push({ url: buildAdvanceURL(stringArray[i]), name: stringArray[i] });
		}
		return result;
	}
	
	// tokenize
	tokens = toRegExp(tokenize(queryString), 'i');
	maxTokens = tokens.length;
	
	// note: this won't work great if the tokens overlap in the string
	for (maxMonsters = stringArray.length; i < maxMonsters; i += 1) {
		match = true;
		for (j = 0; j < maxTokens; j += 1) {
			if (stringArray[i].search(tokens[j]) < 0) {
				match = false;
				break;
			}
		}
		if (match) {
			// TO DO: add the options parameter
			result.push({ url: buildAdvanceURL(stringArray[i]), name: stringArray[i] });
		}
	}
	return result;
};

var buildAdvanceURL = function(monsterId, options){
	return url.format({ 
			pathname: '/advance', 
			query: { 
				monster: monsterId,
				options: options
			}
	});
};

/**
 * monster search results page
 */
app.get('/advance/search', function(req, res) {
	// TO DO: change this when the database is implemented
	var result = buildResultList(req.query.search, monsters);

	res.render('select-monster', { monsters: result});
});

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