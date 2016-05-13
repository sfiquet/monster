/* jshint node: true */
"use strict";

var urlutil = require('./urlutil'),
	capitalize = require('underscore.string/capitalize');

exports.getOptions = getOptions;

/**
 * getOptions
 * creates a string to be displayed on the web page
 */
function getOptions(url) {
	var options = urlutil.extractAdvanceOptions(url),
		result = 'Original',
		keys;
	
	if (!options){
		return result;
	}
	
	keys = Object.keys(options);
	
	if (keys.length === 0){
		return result;
	}
	
	keys = keys.map(function(curr){
		var res = capitalize(curr);
		
		if (options[curr] > 1) {
			res += ' (x' + options[curr] + ')';
		}
		
		return res;
	});
	result = keys.reduce(function(str, curr){
		if (str.length){
			str += ', ';
		}
		return str + curr;
	}, '');
	return result;
}