// dependencies
var express = require('express');
var path = require('path');

// create express app
var app = express();
app.use(express.static(path.join(__dirname, 'public')));

// set up jade
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// routing
var monsters = ["Aboleth", 'Rakshasa', 'Vampire'];
var templates = [	'Advanced Creature',
					'Celestial Creature',
					'Entropic Creature',
					'Fiendish Creature',
					'Giant Creature',
					'Resolute Creature',
					'Young Creature'];
app.get('/', function(req, res){
	res.render('monster-form', {monsters: monsters, templates: templates});
});

// start the server
var server = app.listen(3000, function(){
	console.log('Listening on port %d', server.address().port);
});