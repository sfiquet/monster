// parameter: optional port number
// if omitted the server is created on port 8080

"use strict";

const express = require('express'); // create express app
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const marked = require('marked');
const database = require('./lib/database');
const helpers = require('./lib/helpers');
const advancePresenter = require('./lib/advancepresenter');
const optionsPresenter = require('./lib/optionspresenter');
const browsePresenter = require('./lib/browsepresenter');

const app = express();

// set up handlebars as template engine
app.engine('handlebars', exphbs({defaultLayout: 'main', helpers: helpers}));
app.set('view engine', 'handlebars');

// serve static files
app.use(express.static(__dirname + '/public'));

// set up body parsing for posting forms
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded

// modify markedjs's default behaviour
const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
	const html = linkRenderer.call(renderer, href, title, text);
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow noopener noreferrer" ');
};


/**
 * routing
 */

// Home page
app.route('/')
.get(getHomePage);

// Open Game License page
app.route('/opengamelicense')
.get(getOGLPage);

// About page
app.route('/about')
.get(getAboutPage);

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
 * getOGLPage
 * GET handler for the Open Game License page
 */
function getOGLPage(req, res){
  let file = path.join(__dirname, 'views','open-game-license.md');
  fs.readFile(file, 'utf8', function(err, data) {
    if (err){
      res.write('Could not find or open file for reading\n');
    }else{
      res.render('open-game-license', { pageTitle: 'Open Game License', helpers: {content: function(){ return marked(data);}}});
    }
	});
}

/**
 * getAboutPage
 * GET handler for the About page
 */
function getAboutPage(req, res){
  let file = path.join(__dirname, 'views','about.md');
  fs.readFile(file, 'utf8', function(err, data) {
    if (err){
      res.write('Could not find or open file for reading\n');
    }else{
      res.render('about', { 
        pageTitle: 'About Monster Workshop', 
        helpers: {content: function(){ return marked(data, { renderer });}}
      });
    }
	});
}
/**
 * start the server
 */
function start(){
  // set up the database before doing anything
  database.initialise(path.join(__dirname, 'database', 'database.json'));

	const port = process.env.PORT || 8080;
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