/* jshint node: true, esversion: 6 */
'use strict';

function logString (message, strValue) {
	return message + ': "' + strValue + '"';
}

function logValue (message, value) {
	return message + ': ' + value;
}

exports.logString = logString;
exports.logValue = logValue;