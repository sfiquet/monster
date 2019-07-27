"use strict";

const urlutil 	= require('./urlutil');
const database 	= require('./database');

exports.get = getBrowsePage;

/**
 * get
 * GET handler for the Advancement Search page
 */
function getBrowsePage(req, res) {
	// build the list of links
	let linkList = database
		.findMonsterList(req.params.search)
			.map(obj => ({ 
				url: urlutil.buildAdvanceUrl(obj.name, req.params.options),
				name: obj.name
			}));
		
	res.render('select-monster', { pageTitle: 'Select Monster', monsters: linkList });	
}

