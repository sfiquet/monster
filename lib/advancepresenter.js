/* jshint node: true */

"use strict";

var url 		= require('url'),
	Database 	= require('./database'),
	format		= require('./formatmonster');

/**
 * getAdvancePage
 * GET handler for Advancement page
 */
exports.get = function getAdvancePage(req, res){
	/**
	 * isValidOptions
	 * awaits implementation - to check that selected options are valid
	 */
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
		// format the data for the template
		else {
			stats = format.getMonsterProfile(stats);
		}
		
		res.render('advancement-form', { monster: stats.name, options: req.query.options, stats: stats});
	});
};

/**
 * postAdvancePage
 * POST Event handler for Advancement page
 */
exports.post = function postAdvancePage(req, res){

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
};

