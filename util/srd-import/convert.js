/* jshint node: true, esversion: 6 */
'use strict';

// ***********************************************************************
// Data extraction and clean up module
// All functions returns an object with the following properties:
// - name: name of data, e.g. 'CR'
// - errors: array of errors
// - warnings: arrays of warnings
// - data: the required data
// ***********************************************************************

var feat = require('./feat');

const 	WRONG_FORMAT_VALUE1 = 37288,
		WRONG_FORMAT_VALUE2 = 41641;

const 	WRONG_FORMAT_MSG1 = '2-1/2 ft provided as date 2/01/2002',
		WRONG_FORMAT_MSG2 = '2-1/2 ft provided as date 2/01/2014';

function invalidValue(value, quote) {
	if (quote === undefined) {
		return 'Invalid value: ' + value;		
	} else {
		return 'Invalid value: ' + quote + value + quote;
	}
}

function valueConverted(original, converted, oriQuote, conQuote) {
	var result = 'Original value ';

	if (oriQuote) {
		result += oriQuote + original + oriQuote;
	} else {
		result += original;
	}
	
	result += ' converted to ';
	
	if (conQuote) {
		result += conQuote + converted + conQuote;
	} else {
		result += converted;
	}

	return result;
}

/**
 * checkRawMonster
 * check whether the data in the raw monster can be handled by the main application
 */
function checkRawMonster(rawMonster) {
	var log = [];

	if (rawMonster.cr > 30) {
		log.push({name: 'CR', errors: ['CR over 30 not handled yet']});
	}

	if (rawMonster.class1) {
		log.push({name: 'Class1', errors: ['Class levels not handled yet']});
	}

	if (typeof rawMonster.hd === 'string' && rawMonster.hd.indexOf('plus') >= 0) {
		log.push({name: 'HD', errors: ['Hit Dice with extra HP not handled yet']});
	}

	if (typeof rawMonster.fort === 'string') {
		log.push({name: 'Fort', errors: ['Extra Fortitude not handled yet']});
	}

	if (typeof rawMonster.ref === 'string') {
		log.push({name: 'Ref', errors: ['Extra Reflex not handled yet']});
	}

	if (typeof rawMonster.will === 'string') {
		log.push({name: 'Will', errors: ['Extra Will not handled yet']});
	}

	if (rawMonster.gear || rawMonster.othergear) {
		log.push({name: 'Gear', errors: ['Gear not handled yet']});
	}

	if (typeof rawMonster.treasure === 'string' && rawMonster.treasure.indexOf('(') >= 0) {
		log.push({name: 'Treasure', errors: ['Gear not handled yet']});
	}

	if (rawMonster.ranged) {
		log.push({name: 'Ranged', errors: ['Ranged attacks not handled yet']});
	}

	if (rawMonster.alternatenameform) {
		log.push({name: 'AlternateNameForm', errors: ['Alternate forms not handled yet']});
	}

	if (typeof rawMonster.speed === 'string') {
		var errors = [],
			low, 
			id;

		low = rawMonster.speed.toLowerCase();
		
		if (low.indexOf('fly') >= 0) {
			errors.push('Fly speed not handled yet');
		
		// Extra speeds in special conditions come between brackets.
		// At this stage, we're not digging very deep.
		// All fly speeds have parentheses for the manoeuverability but that 
		// doesn't imply extra speed conditions.
		// No point in wrongly reporting extra speed, only do this test when we
		// don't have fly.
		} else if (low.indexOf('(') >= 0) {
			errors.push('Extra speed in special conditions not handled yet');
		}

		id = low.lastIndexOf(';');
		if (id >= 0 && low.slice(id).indexOf(')') < 0) {
			// there is a semi-colon that isn't inside parentheses
			// special move ability
			errors.push('Special ways to move not handled yet');
		}

		if (errors.length) {
			log.push({name: 'Speed', errors: errors});
		}
	}

	return log;
}

/**
 * extractType
 * Makes sure that type is all lowercase.
 */
function extractType(value) {
	var result,
		errors = [];

	if (typeof value === 'string') {
		result = value.toLowerCase();
	
	} else {
		errors.push(invalidValue(value));
	}

	return {name: 'type', errors: errors, warnings: [], data: result};
}

/**
 * extractCR
 * Fractions are stored as floating point numbers in the excel file.
 * Most integer values are stored as strings but some are stored as numbers.
 */
function extractCR(value) {
	var errors = [],
		warnings = [],
		result;

	if (typeof value === 'number') {

		if (value < 1) {

			if (value === 0.125) {
				result = '1/8';
			} else if (value === 0.166) {
				result = '1/6';
			} else if (value === 0.25) {
				result = '1/4';
			} else if (value === 0.33) {
				result = '1/3';
			} else if (value === 0.5) {
				result = '1/2';
			} else {
				errors.push(invalidValue(value));
			}

		} else {
			result = Math.floor(value);

			if (result !== value) {
				warnings.push(valueConverted(value, result));
			}
		}

	} else if (typeof value === 'string') {

		result = parseInt(value, 10);

		if (isNaN(result)) {
			errors.push(invalidValue(value, '"'));

		} else if ('' + result !== value) {
			warnings.push(valueConverted(value, result, '"'));
		}

	// anything else is invalid
	} else {
		errors.push(invalidValue(value));
	}

	return {name: 'CR', errors: errors, warnings: warnings, data: result};
}

/**
 * extractSpace
 * There are a number of wrong data in the file
 */
function extractSpace(value) {
	var errors = [],
		warnings = [],
		result;

	if (typeof value === 'number') {
		if (value < 0) {
			errors.push(invalidValue(value));

		} else if (value === WRONG_FORMAT_VALUE1) {
			// 2 1/2 ft was stored in excel as date 2/1/2002
			result = 2.5;
			warnings.push(WRONG_FORMAT_MSG1);

		} else if (value === WRONG_FORMAT_VALUE2) {
			// 2 1/2 ft was stored in excel as date 2/1/2014
			result = 2.5;
			warnings.push(WRONG_FORMAT_MSG2);

		} else {
			result = value;
		}

	} else if (typeof value === 'string') {

		if (value.startsWith('1/2')) {
			result = 0.5; // not sure if that's the right value
			warnings.push(valueConverted(value, result, '"'));

		} else if (value.startsWith('2-1/2')) {
			result = 2.5;
			warnings.push(valueConverted(value, result, '"'));

		} else {
			result = parseFloat(value);

			if (isNaN(result)) {
				errors.push(invalidValue(value, '"'));

			} else if ('' + result !== value) {
				warnings.push(valueConverted(value, result, '"'));
			}
		}

	} else {
		errors.push(invalidValue(value));
	}

	return {name: 'space', errors: errors, warnings: warnings, data: result};
}

/**
 * hasExtraReaches
 * test if the reach value string has extra data
 */
function hasExtraReaches(valueString) {
	
	if (valueString.indexOf('with') >= 0) {
		return true;
	}

	return false;
}

/**
 * extractReach
 */
function extractReach(value) {
	var errors = [],
		warnings = [],
		result;

	if (typeof value === 'number') {

		if (value < 0) {
			errors.push(invalidValue(value));

		} else if (value === WRONG_FORMAT_VALUE1 || value == WRONG_FORMAT_VALUE2 || value === 2.5) {
			
			if (value === WRONG_FORMAT_VALUE1) {
				warnings.push(WRONG_FORMAT_MSG1);

			} else if (value === WRONG_FORMAT_VALUE2) {
				warnings.push(WRONG_FORMAT_MSG2);
			}
			// 2 1/2 ft as for space but that makes no sense for reach
			// make it a square
			result = 5;
			warnings.push('Value 2.5 is invalid for Reach - replaced by default 5');

		// make sure the result is a multiple of 5
		} else if (value % 5 !== 0) {

			result = Math.floor(value / 5) * 5;
			warnings.push('Value ' + value + ' is not a multiple of 5 - rounded down to ' + result);

		} else {
			result = value;
		}

	} else if (typeof value === 'string') {
		result = parseInt(value, 10);
		// there'll be extra reaches to deal with later

		if (isNaN(result)) {
			errors.push(invalidValue(value, '"'));

		} else if ('' + result !== value) {
			if (hasExtraReaches(value)) {
				errors.push('Extra reaches are not implemented yet');
			} else {
				warnings.push(valueConverted(value, result, '"'));
			}
		}

	} else {
		errors.push(invalidValue(value));
	}

	return {name: 'reach', errors: errors, warnings: warnings, data: result};
}

/**
 * extractRacialHD
 */
function extractRacialHD(rawMonster) {
	var errors = [],
		warnings = [],
		result,
		chunks;

	if (rawMonster.class1_lvl) {
		errors.push('Class levels are not implemented yet');
	
	} else {
		chunks = rawMonster.hd.split('d');
		result = parseInt(chunks[0], 10);
	}
	

	return {name: 'racialHD', errors: errors, warnings: warnings, data: result};
}

/**
 * extractAbility
 * extract data for any ability stat
 */
function extractAbility(ability, value){
	const MAX_ABILITY = 100;
	var errors = [],
		result;

	if (typeof value === 'number') {

		if (value < 0 || value > MAX_ABILITY) {
			errors.push(invalidValue(value));

		} else {
			result = value;
		}

	} else if (typeof value === 'string') {

		// a dash is a valid value, it means undefined
		if (value !== '-') {
			errors.push(invalidValue(value, '"'));
		}

	} else {
		errors.push(invalidValue(value));
	}

	return {name: ability, errors: errors, warnings: [], data: result};	
}

/**
 * extractSpeed
 * parse the speed string to build a speed object
 */
function extractSpeed(speedStr){
	var errors = [],
		speed = {},
		val,
		chunks;

	if (typeof speedStr !== 'string') {
		errors.push(invalidValue(speedStr));
	
	} else {

		// split into comma-separated chunks
		chunks = speedStr.split(',');

		// look for the land speed in the first chunk
		val = parseInt(chunks[0], 10);

		// a integer value is found: this is our land speed
		if (!isNaN(val)) {
			speed.land = val;
			chunks = chunks.slice(1);
		}
		
		chunks.forEach(function(item){
			var words,
				key,
				itemStr;
			
			itemStr = item.trim();
			words = itemStr.split(' ');
			key = '';

			for (var i = 0; i < words.length; i++) {

				val = parseInt(words[i], 10);
				
				if (!isNaN(val)) {
					// found the value
					key = words.slice(0, i).join(' ').toLowerCase();
					speed[key] = val;
					break;
				}
			}
			// check whether we found any value
			if (isNaN(val)) {
				errors.push('Special abilities that affect movement not handled yet');
			}
		});
	}

	// return undefined data in case of errors
	if (errors.length) {
		speed = undefined;
	}

	return {name: 'speed', errors: errors, warnings: [], data: speed};	
}

/**
 * parseCommaSeparatedString
 * build a list of chunks that are comma-separated ignoring any commas that are 
 * within parentheses.
 *
 * Note: there can be square brackets (with or without commas) within the 
 * parentheses but it doesn't matter here. Further parsing can be done on
 * the chunks. There are no square brackets outside parentheses.
 */
function parseCommaSeparatedString(dataStr) {
	var chunks = [];

	if (typeof dataStr !== 'string') {
		return undefined;
	}

	// look for commas
	var begin = 0;
	var parens = false;
	for (var i = 0; i < dataStr.length; i++) {

		// inside parens: look for closing parens only
		// note: we're not expecting nested parentheses
		if (parens) {

			if (dataStr[i] === ')') {
				parens = false;
			}

		// outside of parens
		// look for comma and opening parens
		} else {
			
			if (dataStr[i] === ',') {
				chunks.push(dataStr.slice(begin, i).trim());
				begin = i+1;
			
			} else if (dataStr[i] === '(') {
				parens = true;
			}
		}
	}

	// add the last chunk
	if (begin < dataStr.length) {
		chunks.push(dataStr.slice(begin, dataStr.length).trim());
	}

	return chunks;
}

function parseFeatChunk(featStr){
	var chunks,
		result = {},
		errors = [],
		warnings = [],
		close,
		name,
		details,
		special = [];
	
	// split at the opening parenthesis
	chunks = featStr.split('(');
	
	// more than one opening parenthesis? raise an error
	// although in theory this could happen: Skill Focus(Perception) (some comment)
	if (chunks.length > 2) {
		return {errors: [invalidValue(featStr)], warnings: [], data: undefined};
	}

	name = chunks[0].trim();

	// look for B for bonus feat
	if (name.endsWith('B')) {
		name = name.slice(0, -1);
		special.push('bonus');
	}
	
	if (chunks.length === 2) {
		
		close = chunks[1].indexOf(')');

		if (close < 0) {
		
			details = { name: chunks[1].trim() };
			warnings.push('Closing parenthesis missing: ' + featStr);
		
		} else {
		
			details = { name: chunks[1].slice(0, close).trim() };

			// check that there isn't anything after the closing parenthesis
			var endStr = chunks[1].slice(close + 1).trim();

			// special case: B for bonus feat
			if (endStr === 'B' && special.length === 0) {
				special.push('bonus');
			
			} else if (endStr.length > 0) {
				warnings.push('Unexpected data after closing parenthesis: ' + featStr);
			}
		}
		// check that there aren't any square brackets within the details
		// not handled yet
		var sq = details.name.indexOf('[');
		if (sq >= 0) {
			errors.push('Feat sub-details not handled yet');
		}
	}

	if (errors.length) {
		
		result = undefined;

	} else {

		result.name = name;
		
		if (details) {
			result.details = details;
		}
		
		if (special.length > 0) {
			result.special = special;
		}
	}

	return {errors: errors, warnings: warnings, data: result};
}

/**
 * parseFeatString
 * parses the feat strings and returns an array of feat objects with properties:
 * - name
 * - details (optional)
 */
function parseFeatString(featStr) {
	var errors = [],
		warnings = [],
		chunks,
		data,
		result;

	if (typeof featStr !== 'string') {
		return {errors: [invalidValue(featStr)], warnings: [], data: undefined};
	}

	chunks = parseCommaSeparatedString(featStr);

	data = chunks.map(function(str){

		result = parseFeatChunk(str);
		
		Array.prototype.push.apply(errors, result.errors);
		Array.prototype.push.apply(warnings, result.warnings);

		return result.data;
	});

	if (errors.length) {
		data = undefined;
	}

	return {errors: errors, warnings: warnings, data: data};
}

/**
 * checkFeatList
 */
function checkFeatList(featList){
	var errors = [];

	featList.forEach(function(item){

		// check if the feat name is known
		if (!feat.isFeat(item.name)){
			errors.push('Unknown feat: "' + item.name + '"');

		// check if the feat is currently handled
		} else if (!feat.isHandled(item.name)) {
			errors.push('Feat not handled yet: "' + item.name + '"');
		}
	});

	return errors;
}

/**
 * extractFeats
 * parses the feats string and checks that all feats are valid and currently 
 * handled
 */
function extractFeats(featStr){
	var list,
		result,
		checkErrors,
		errors = [],
		warnings = [];

	if (featStr === undefined) {

		// there are no feats, same as empty string
		list = [];
	
	} else {

		result = parseFeatString(featStr);

		errors = result.errors;
		warnings = result.warnings;
		list = result.data;
	}

	if (list) {

		checkErrors = checkFeatList(list);
		
		if (checkErrors.length) {
	
			Array.prototype.push.apply(errors, checkErrors);
			list = undefined;
		}
	}


	return {name: 'feats', errors: errors, warnings: warnings, data: list};
}

exports.checkRawMonster = checkRawMonster;
exports.extractType = extractType;
exports.extractCR = extractCR;
exports.extractSpace = extractSpace;
exports.extractReach = extractReach;
exports.extractRacialHD = extractRacialHD;
exports.extractAbility = extractAbility;
exports.extractSpeed = extractSpeed;
exports.extractFeats = extractFeats;
