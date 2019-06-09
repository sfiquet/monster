"use strict";

const Database = require('./database');
const format = require('./formatmonster');
const formatOptions = require('./formatoptions');
const formatError = require('./formaterror');
const urlutil = require('./urlutil');
const bp = require('./blueprint');

exports.getDefault = function getDefaultAdvancePage(req, res){
	res.redirect(req.url + '/no-monster/original');
};

/**
 * getAdvancePage
 * GET handler for Advancement page
 */
exports.get = function getAdvancePage(req, res){
	// helper function
	function renderNoMonster(options, url){
		res.render('advancement-form', { pageTitle: 'No Monster Selected', options: options, postTo: url });
	}

	const optDict = urlutil.extractAdvanceOptions(req.url);
	const options = formatOptions.getOptions(optDict);
		
	// check whether a monster was given: no need to query the DB if not
	if (req.params.monster === "no-monster") {
		renderNoMonster(options, req.url);
		return;
	}
	
	const myDB = new Database();
	myDB.findMonster(req.params.monster, function(err, baseMonster){
		if (err) {
			// TO DO: probably needs better error handling than that
			console.log('Database Error: ' + err);
		}
		
		// make sure we have a valid monster selection
		if (err || baseMonster === {}) {
			renderNoMonster(options, req.url);

		// format the data for the template
		} else {
			let name = baseMonster.name;
			let title = name;
			if (options) {
				title += ' — ' + options;
			}

			const blueprint = bp.createBlueprint(optDict);
			const {error, newMonster} = blueprint.reshape(baseMonster);
			if (error){
				res.render('advancement-form', { pageTitle: title, monster: name, options: options, error: formatError.format(error), postTo: req.url });
				return;
			}

			const stats = format.getMonsterProfile(newMonster);
			res.render('advancement-form', { pageTitle: title, monster: name, options: options, stats: stats, postTo: req.url });
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

