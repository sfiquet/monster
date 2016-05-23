 /* jshint node: true */

"use strict";

var url 		= require('url'),
	Database 	= require('./database'),
	format		= require('./formatmonster'),
	formatOptions = require('./formatoptions'),
	urlutil		= require('./urlutil'),
	advanced	= require('./advanced'),
	giant		= require('./giant');


exports.getDefault = function getDefaultAdvancePage(req, res){
	res.redirect(req.url + '/no-monster/original');
};

/**
 * getAdvancePage
 * GET handler for Advancement page
 */
exports.get = function getAdvancePage(req, res){
	var options = formatOptions.getOptions(req.url),
		myDB;
	
	/**
	 * isValidOptions
	 * awaits implementation - to check that selected options are valid
	 */
	var isValidOptions = function(options){
		return false;
	};
	
	/**
	 * renderNoMonster
	 */
	 function renderNoMonster(){
		res.render('advancement-form', { options: options, postTo: req.url });
	 }
	
	// check that we have valid options - reset if not
	// TO DO: do this later
	/*
	if (!isValidOptions(req.query.options)) {
		req.query.options = "";
	}
	*/
	
	// check whether a monster was given: no need to query the DB if not
	if (req.params.monster === "no-monster") {
		renderNoMonster();
		return;
	}
	
	myDB = new Database();
	myDB.findMonster(req.params.monster, function(err, stats){
		var optObj, 
			i;
		
		if (err) {
			// TO DO: probably needs better error handling than that
			console.log('Database Error: ' + err);
		}
		
		// make sure we have a valid monster selection
		if (err || stats === {}) {
			renderNoMonster();
		}
		// format the data for the template
		else {
			optObj = urlutil.extractAdvanceOptions(req.url);
			if (optObj.advanced) {
				for (i = 0; i < optObj.advanced; i++) {
					advanced.apply(stats);				
				}
			}
			if (optObj.giant) {
				for (i = 0; i < optObj.giant; i++) {
					giant.apply(stats);				
				}
			}
			stats = format.getMonsterProfile(stats);
			res.render('advancement-form', { monster: stats.name, options: options, stats: stats, postTo: req.url});
		}
	});
};

/**
 * postAdvancePage
 * POST Event handler for Advancement page
 */
exports.post = function postAdvancePage(req, res){

	if (req.body.submit === "Go") {
	
		// search button was clicked
		res.redirect(req.url + '/search/' + req.body.q);
		
	} else if (req.body.submit === "Customize") {
	
		// customize button was clicked
		res.redirect(req.url + '/options');
		
	} else {
		// don't know what happened here, log the body
		console.log(req.body);
	}
};

