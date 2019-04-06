 /* jshint node: true */
"use strict";

var url 		= require('url'),
	urlutil 	= require('./urlutil'),
	Database 	= require('./database');

exports.get = getBrowsePage;

/**
 * get
 * GET handler for the Advancement Search page
 */
function getBrowsePage(req, res) {
	var myDb;
	
	myDb = new Database();
	
	myDb.findMonsterList(req.params.search, function(err, list){
		var linkList = [];
		
		if (err) {
			console.log("Database Error: " + err);
		} else {
			// build the list of links
			linkList = list.map(function(obj){
				return { 
					url: urlutil.buildAdvanceUrl(obj.id, req.params.options),
					name: obj.name
				};
			});
		}
		
		res.render('select-monster', { pageTitle: 'Select Monster', monsters: linkList });	
	});
}

