"use strict";

const capitalize = require('underscore.string/capitalize');

exports.getOptions = getOptions;

/*
getOptions
creates a string to be displayed on the web page
Input:  optDict: options key-value dictionary
        key: template name, value: number of applications
        e.g. {advanced: 2, giant: 1}
 */
function getOptions(options) {
	let result = 'Original';
	let keys;
	
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
