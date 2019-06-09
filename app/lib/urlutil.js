/* jshint node: true */
"use strict";

var url = require('url');

const NO_OPTIONS = 'original';
// const NO_MONSTER = 'no-monster';
const ADVANCE_SEGMENT = 'advance';
const MAX_TEMPLATE_USE = 3;
// const ADVANCE_SEG_ID = 1;
const MONSTER_SEG_ID = 2;
const OPTIONS_SEG_ID = 3;
// const EXTRA_SEG_ID = 4;

exports.extractAdvanceOptions = extractAdvanceOptions;
exports.extractAdvanceMonster = extractAdvanceMonster;
exports.buildAdvanceOptionsSlug = buildAdvanceOptionsSlug;
exports.buildAdvanceUrl = buildAdvanceUrl;

/**
 * extractAdvanceOptions
 * parses the options segment of an url and returns a dictionary object
 */
function extractAdvanceOptions(urlStr) {
	var slug,
		options, 
		result;
		
	slug = getAdvanceUrlSegment(urlStr, OPTIONS_SEG_ID);
	
	if (slug === undefined) {
		return;
	}

	if (slug === NO_OPTIONS) {

		return {};
	}
	
	options = slug.split('-');
	result = options.map(function(str){
		return { name: str, count: 1 };
	});
	result = result.reduce(function(arr, curObj){
		if (curObj.name === 'x2' && arr.length > 0) {
			arr[arr.length-1].count = 2;
		} else if (curObj.name === 'x3' && arr.length > 0) {
			arr[arr.length-1].count = 3;
		} else {
			arr.push(curObj);
		}
		return arr;
	}, []);
	result = result.reduce(function(prevObj, curItem){
		prevObj[curItem.name] = curItem.count;
		return prevObj;
	}, {});
	return result;
}

/**
 * getAdvanceUrlSegment
 * extracts a segment from the pathname of the given url
 * expected format of pathname: /advance/<monster-name>/<options-slug>[/optional-segment]
 */
function getAdvanceUrlSegment(urlStr, segmentId) {
	var urlObj,
		segments;

	urlObj = url.parse(urlStr);
	if (!urlObj.pathname) {
		return;
	}
	segments = urlObj.pathname.split('/');
	// now we should have:
	// segments[0]: ''
	// segments[1]: 'advance'
	// segments[2]: monster
	// segments[3]: options slug
	
	// if we don't have enough segments, return undefined
	if (segments.length < segmentId) {
		return;
	}
	
	return segments[segmentId];
}

/**
 * extractAdvanceMonster
 * returns the monster segment of the url
 */
function extractAdvanceMonster(urlStr) {
	return getAdvanceUrlSegment(urlStr, MONSTER_SEG_ID);
}

/**
 * buildAdvanceOptionsSlug
 * builds the options slug to be used in the url
 * Expected format for optionsArr: array of template objects, each with 
 * properties name and count, e.g.:
 * [{name: 'advanced', count: 1}, {name: 'giant', count: 3}, 
 * {name: 'young', count: 2}, {name: 'celestial', count: 1}]
 * The point of the array is to provide the order for building the string:
 * Not absolutely necessary but makes the output predictable, so easier to test.
 * count is supposed to be at least 1.
 * Expected output:
 * 'advanced-giant-x3-young-x2-celestial'
 */
function buildAdvanceOptionsSlug(optionsArr) {
	var result;
	
	if (!Array.isArray(optionsArr) || optionsArr.length === 0) {
		return NO_OPTIONS;
	}
	
	result = optionsArr.map(function(obj){
		var str = obj.name;
		if (obj.count > 1) {
			str += '-x' + Math.min(obj.count, MAX_TEMPLATE_USE);
		}
		return str;
	});
	result = result.reduce(function(prevStr, curStr) {
		return prevStr + '-' + curStr;
	});
	return result;
}

/**
 * buildAdvanceUrl
 */
function buildAdvanceUrl(monsterStr, options, extraSegment) {
	var url;
	
	// options can be an array as the input to buildAdvanceOptionsSlug
	// In that case, we build its slug and work with that
	if (Array.isArray(options)) {
		options = buildAdvanceOptionsSlug(options);
	}
	
	if (typeof monsterStr !== 'string' || typeof options !== 'string' || 
		monsterStr === '' || options === '') {
		return;
	}
	
	url = '/' + ADVANCE_SEGMENT + '/' + monsterStr + '/' + options;
	
	if (typeof extraSegment === 'string' && extraSegment !== '') {
		url += '/' + extraSegment;
	}
	
	return url;
}