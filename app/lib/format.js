/* jshint node: true */
'use strict';

const sprintf = require('sprintf-js').sprintf;
const numberFormat = require('underscore.string/numberFormat');

/**
 * formatModifier
 * modifier: integer representing a modifier
 * returns a string with a leading '+' if the number is positive or zero
 */
exports.formatModifier = function formatModifier(modifier) {
	return sprintf('%+d', modifier);
};

/**
 * formatThousands
 * number: integer
 * returns a string grouping the digits by 3 with commas
 */
exports.formatThousands = function formatThousands(number) {
	return numberFormat(number);
};