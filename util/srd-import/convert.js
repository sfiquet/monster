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

var feat = require('./feat'),
	skill = require('./skill'),
	parse = require('./parse'),
	message = require('./message');
var createMessage = message.createMessage;

const 	WRONG_FORMAT_VALUE1 = 37288,
		WRONG_FORMAT_VALUE2 = 41641;

/**
 * checkRawMonster
 * check whether the data in the raw monster can be handled by the main application
 */
function checkRawMonster(rawMonster) {
	var log = [];

	if (rawMonster.cr > 30) {
		log.push({name: 'CR', errors: [createMessage('highCRNotHandled')]});
	}

	if (rawMonster.class1) {
		log.push({name: 'Class1', errors: [createMessage('classLevelsNotHandled')]});
	}

	if (typeof rawMonster.hd === 'string' && rawMonster.hd.indexOf('plus') >= 0) {
		log.push({name: 'HD', errors: [createMessage('extraHPNotHandled')]});
	}

	if (typeof rawMonster.fort === 'string') {
		log.push({name: 'Fort', errors: [createMessage('extraFortitudeNotHandled')]});
	}

	if (typeof rawMonster.ref === 'string') {
		log.push({name: 'Ref', errors: [createMessage('extraReflexNotHandled')]});
	}

	if (typeof rawMonster.will === 'string') {
		log.push({name: 'Will', errors: [createMessage('extraWillNotHandled')]});
	}

	if (rawMonster.gear || rawMonster.othergear) {
		log.push({name: 'Gear', errors: [createMessage('gearNotHandled')]});
	}

	if (typeof rawMonster.treasure === 'string' && rawMonster.treasure.indexOf('(') >= 0) {
		log.push({name: 'Treasure', errors: [createMessage('gearNotHandled')]});
	}

	if (rawMonster.ranged) {
		log.push({name: 'Ranged', errors: [createMessage('rangedNotHandled')]});
	}

	if (rawMonster.alternatenameform) {
		log.push({name: 'AlternateNameForm', errors: [createMessage('alternateFormsNotHandled')]});
	}

	if (typeof rawMonster.speed === 'string') {
		var errors = [],
			low;

		low = rawMonster.speed.toLowerCase();
		
		if (low.indexOf('fly') >= 0) {
			errors.push(createMessage('flyNotHandled'));
		
		// Extra speeds in special conditions come between brackets.
		// At this stage, we're not digging very deep.
		// All fly speeds have parentheses for the manoeuverability but that 
		// doesn't imply extra speed conditions.
		// No point in wrongly reporting extra speed, only do this test when we
		// don't have fly.
		} else if (low.indexOf('(') >= 0) {
			errors.push(createMessage('specialSpeedNotHandled'));
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
		errors.push(createMessage('invalidValue', value));
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
				errors.push(createMessage('invalidValue', value));
			}

		} else {
			result = Math.floor(value);

			if (result !== value) {
				warnings.push(createMessage('originalValueConverted', value, result));
			}
		}

	} else if (typeof value === 'string') {

		result = parseInt(value, 10);

		if (isNaN(result)) {
			errors.push(createMessage('invalidValue', value));

		} else if ('' + result !== value) {
			warnings.push(createMessage('originalValueConverted', value, result));
		}

	// anything else is invalid
	} else {
		errors.push(createMessage('invalidValue', value));
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
			errors.push(createMessage('invalidValue', value));

		} else if (value === WRONG_FORMAT_VALUE1) {
			// 2 1/2 ft was stored in excel as date 2/1/2002
			result = 2.5;
			warnings.push(createMessage('wrongFormatDate2002'));

		} else if (value === WRONG_FORMAT_VALUE2) {
			// 2 1/2 ft was stored in excel as date 2/1/2014
			result = 2.5;
			warnings.push(createMessage('wrongFormatDate2014'));

		} else {
			result = value;
		}

	} else if (typeof value === 'string') {

		if (value.startsWith('1/2')) {
			result = 0.5; // not sure if that's the right value
			warnings.push(createMessage('originalValueConverted', value, result));

		} else if (value.startsWith('2-1/2')) {
			result = 2.5;
			warnings.push(createMessage('originalValueConverted', value, result));

		} else {
			result = parseFloat(value);

			if (isNaN(result)) {
				errors.push(createMessage('invalidValue', value));

			} else if ('' + result !== value) {
				warnings.push(createMessage('originalValueConverted', value, result));
			}
		}

	} else {
		errors.push(createMessage('invalidValue', value));
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
			errors.push(createMessage('invalidValue', value));

		} else if (value === WRONG_FORMAT_VALUE1 || value == WRONG_FORMAT_VALUE2 || value === 2.5) {
			
			if (value === WRONG_FORMAT_VALUE1) {
				warnings.push(createMessage('wrongFormatDate2002'));

			} else if (value === WRONG_FORMAT_VALUE2) {
				warnings.push(createMessage('wrongFormatDate2014'));
			}
			// 2 1/2 ft as for space but that makes no sense for reach
			// make it a square
			result = 5;
			warnings.push(createMessage('invalidReachConverted'));

		// make sure the result is a multiple of 5
		} else if (value % 5 !== 0) {

			result = Math.floor(value / 5) * 5;
			warnings.push(createMessage('notMultipleOf5', value, result));

		} else {
			result = value;
		}

	} else if (typeof value === 'string') {
		result = parseInt(value, 10);
		// there'll be extra reaches to deal with later

		if (isNaN(result)) {
			errors.push(createMessage('invalidValue', value));

		} else if ('' + result !== value) {
			if (hasExtraReaches(value)) {
				errors.push(createMessage('extraReachesNotHandled'));
			} else {
				warnings.push(createMessage('originalValueConverted', value, result));
			}
		}

	} else {
		errors.push(createMessage('invalidValue', value));
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
		errors.push(createMessage('classLevelsNotHandled'));
	
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
			errors.push(createMessage('invalidValue', value));

		} else {
			result = value;
		}

	} else if (typeof value === 'string') {

		// a dash is a valid value, it means undefined
		if (value !== '-') {
			errors.push(createMessage('invalidValue', value));
		}

	} else {
		errors.push(createMessage('invalidValue', value));
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
		errors.push(createMessage('invalidValue', speedStr));
	
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
				errors.push(createMessage('movementAbilitiesNotHandled'));
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
		return {errors: [createMessage('invalidValue', featStr)], warnings: [], data: undefined};
	}

	chunks = parse.parseCommaSeparatedString(featStr);

	data = chunks.map(function(str){

		result = parse.parseFeatChunk(str);
		
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
			errors.push(createMessage('unknownFeat', item.name));

		// check if the feat is currently handled
		} else if (!feat.isHandled(item.name)) {
			errors.push(createMessage('featNotHandled', item.name));
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

/**
 * calculateAttackType
 */
function calculateAttackType(attackObj){
	var attack;
	
	var naturalAttacks = [
		'bite',
		'claw',
		'gore',
		'hoof',
		'pincers',
		'slam',
		'sting',
		'tail slap',
		'talons',
		'tentacle',
		'wing'
	];

	attack = attackObj.name;
	if (naturalAttacks.indexOf(attack) >= 0) {
		return 'natural';
	}
}

/**
 * extractMelee
 * parses the melee string and converts it to a melee object
 */
function extractMelee(meleeStr){
	var melee = {},
		result,
		errors = [],
		warnings = [],
		attack,
		type;

	if (meleeStr !== undefined && meleeStr !== '') {
		result = parse.parseMeleeString(meleeStr);

		errors = result.errors;
		warnings = result.warnings;

		if (errors.length === 0) {
			melee[result.data.name] = result.data;

			for (attack in melee) {
				
				type = calculateAttackType(melee[attack]);
				
				if (type === undefined) {
					errors.push(createMessage('unknownAttack', attack));

				} else {
					melee[attack].type = type;
				}
			}
		}

		if (errors.length) {
			melee = undefined;
		}
	}


	return {name: 'melee', errors: errors, warnings: warnings, data: melee};
}

/**
 * checkSkills
 * returns an array of errors
 */
function checkSkills(skillsDict){
	var errors = [],
		key;

	for (key in skillsDict) {
		// check that this is a known skill
		if (!skill.isSkill(key)) {
			errors.push(createMessage('unknownSkill', key));
		}
	}

	return errors;
}

/**
 * extractSkills
 */
function extractSkills(skillStr){
	var errors = [],
		warnings = [],
		skills = {},
		result,
		checkErrors;

	if (skillStr !== undefined) {

		result = parse.parseSkillString(skillStr);

		errors = result.errors;
		warnings = result.warnings;
		skills = result.data;
	}

	if (skills !== undefined) {

		checkErrors = checkSkills(skills);
		
		if (checkErrors.length) {
	
			Array.prototype.push.apply(errors, checkErrors);
			skills = undefined;
		}
	}

	return {name: 'skills', errors: errors, warnings: warnings, data: skills};
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
exports.extractMelee = extractMelee;
exports.extractSkills = extractSkills;
exports.checkSkills = checkSkills;
