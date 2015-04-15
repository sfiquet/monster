 /* jshint node: true */
"use strict";

var urlutil = require('./urlutil');

exports.get = getOptionsPage;
exports.post = postOptionsPage;

/**
 * getOptionsPage
 * GET handler for the options selection page
 */
function getOptionsPage(req, res) {
	res.render('select-options', { options: urlutil.extractAdvanceOptions(req.url), postTo: req.url });
}

/**
 * postOptionsPage
 * POST handler for the options selection page
 */
function postOptionsPage(req, res) {
	var options = [],
		monster,
		advanceUrl;
	
	if (req.body.advanced) {
		options.push({ name: 'advanced', count: 1 });
	}
	if (req.body.giant) {
		options.push({ name: 'giant', count: 1 });
	}
	if (req.body.young) {
		options.push({ name: 'young', count: 1 });
	}
	
	monster = urlutil.extractAdvanceMonster(req.url);
	advanceUrl = urlutil.buildAdvanceUrl(monster, options);
	res.redirect(advanceUrl);
}

