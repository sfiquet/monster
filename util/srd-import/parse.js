/* jshint node: true, esversion: 6 */
'use strict';

var message = require('./message');
var createMessage = message.createMessage;

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

/**
 * parseOrSeparatedString
 * split the string into chunks separated by ' or '
 * Right now, doesn't take parentheses into account.
 */
function parseOrSeparatedString(str){
	var chunks;

	if (typeof str !== 'string') {
		return undefined;
	}

	chunks = str.split(/\s+or\s+/);

	chunks = chunks.map(function(item){
		return item.trim();
	});
	
	return chunks;
}

/**
 * parseAndSeparatedString
 */
function parseAndSeparatedString(str){
	var chunks,
		chunks1,
		chunks2,
		len;

	if (typeof str !== 'string') {
		return undefined;
	}

	// capture the parentheses
	chunks1 = str.split(/(\([^\(\)]*\))/);

	// on each chunk that is not a bracket unit, split on "and" then replace 
	// the chunk by its sub-chunks in the resulting array
	chunks = chunks1.reduce(function(prev, item){

		if (item.indexOf('(') < 0) {
		
			chunks2 = item.split(/\s+(and)\s+/);
			return prev.concat(chunks2);
			
		} else {
			return prev.concat(item);
		}
	}, []);

	// concatenate together all the strings that are not "and"
	// start a new item when "and" is encountered
	chunks =  chunks.reduce(function(prev, item){

		if (item === 'and') {
			return prev.concat('');
		
		} else {
			len = prev.length;

			prev[len-1] = prev[len-1] + item;
			return prev;
		}
			
	}, ['']);
	
	// trim what's left
	chunks = chunks.map(function(item){
		return item.trim();
	});
	
	return chunks;
}

/**
 * parseFeatChunk
 * parses a string describing a single feat and creates a feat object
 */
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
		return {errors: [createMessage('invalidFormat', featStr)], warnings: [], data: undefined};
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
			warnings.push(createMessage('noClosingParenthesis', featStr));
		
		} else {
		
			details = { name: chunks[1].slice(0, close).trim() };

			// check that there isn't anything after the closing parenthesis
			var endStr = chunks[1].slice(close + 1).trim();

			// special case: B for bonus feat
			if (endStr === 'B' && special.length === 0) {
				special.push('bonus');
			
			} else if (endStr.length > 0) {
				warnings.push(createMessage('dataAfterClosingParenthesis', featStr));
			}
		}
		// check that there aren't any square brackets within the details
		// not handled yet
		var sq = details.name.indexOf('[');
		if (sq >= 0) {
			errors.push(createMessage('featSubDetailsNotHandled'));
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
 * parseAttackHeader
 * headerStr: is supposed to have format:
 * '2 claws +5' or 'bite -1'
 */
function parseAttackHeader(headerStr) {
	var chunks, 
		nbAttacks,
		name,
		last,
		errors = [],
		warnings = [], 
		data;

	// this should capture both the number of attack and the attack bonus/malus
	chunks = headerStr.split(/(\d+)/);

	// there should be either 3 or 5 chunks depending on whether the number of 
	// attacks is implied with empty chunks next to the matched chunk on either side

	if (chunks.length === 3) {
		// format 'bite +5' which gives chunks ['bite +', '5', '']
		if (chunks[0] === '' || chunks[2] !== '') {
			// the string starts with a number that got matched with the regex
			// or there is some text after the bonus
			errors.push(createMessage('wrongFormatAttackHeader', headerStr));

		} else {
			nbAttacks = 1;
			name = chunks[0];
		}

	} else if (chunks.length === 5) {
		// format '2 claws +5' e.g. ['', '2', 'claws +', '5', '']
		if (chunks[0] !== '' || chunks[4] !== '') {
			errors.push(createMessage('wrongFormatAttackHeader', headerStr));
		
		} else {
			nbAttacks = parseInt(chunks[1], 10);

			if (isNaN(nbAttacks)) {
				// don't think this is even possible
				errors.push(createMessage('wrongFormatAttackHeader', headerStr));

			} else {
				name = chunks[2];
			}
		}

	} else {
		errors.push(createMessage('wrongFormatAttackHeader', headerStr));
	}

	if (errors.length === 0) {

		// remove the sign from the attack bonus that didn't get captured
		last = name.length - 1;
		if (name[last] !== '+' && name[last] !== '-') {
			errors.push(createMessage('wrongFormatAttackHeader', headerStr));
		
		} else {
			name = name.slice(0, -1).trim();

			// remove the final S if plural
			if (nbAttacks > 1) {

				if (name[name.length - 1] === 's') {
					name = name.slice(0, -1);
				
				} else {
					warnings.push(createMessage('checkFormatAttackHeader', headerStr));
				}
			}
		}
	}

	if (errors.length === 0) {
		data = {name: name, nbAttacks: nbAttacks};
	}

	return {errors: errors, warnings: warnings, data: data};
}

/**
 * parseDamageRoll
 * parse a damage roll in the format 2d8+4 or similar
 * can be shortened to 2d8 when there is no modifier
 */
function parseDamageRoll(rollStr){
	var chunks, 
		errors = [],
		warnings = [], 
		data,
		nbDice,
		dieType,
		bonus;

	chunks = rollStr.split(/(\d+)/);

	// expected: ['', number string, 'd', number string...] or 
	//           ['', number string, 'd', number string, '+' or '-', number string...]
	// every odd-indexed item is a number string

	if (chunks.length < 5) {
		// either 0 or 1 occurrence of a numeric string, we need at least 2
		errors.push(createMessage('wrongFormatAttackDetails', rollStr));

	} else if (chunks[0] !== '' || chunks[2] !== 'd') {
		errors.push(createMessage('wrongFormatAttackDetails', rollStr));

	} else {
		nbDice = parseInt(chunks[1], 10);
		dieType = parseInt(chunks[3], 10);

		if (chunks.length >= 6) {
			
			if (chunks[4] !== '+' && chunks[4] !== '-') {
				errors.push(createMessage('wrongFormatAttackDetails', rollStr));
			
			} else {
				bonus = parseInt(chunks[5], 10);
			}
		}
	}

	if (errors.length === 0) {
		data = {nbDice: nbDice, dieType: dieType};
	}

	return {errors: errors, warnings: warnings, data: data};
}

/**
 * parseDamageFormula
 * expected formats: 
 * 1d8+3
 * 1d8+3/19-20
 * 1d8+3/19-20/x3
 * 1d8+3/x3
 * Currently criticals are not handled so only the first case is valid.
 */
function parseDamageFormula(formula){
	var errors = [],
		warnings = [],
		sep,
		dmgRollStr,
		data,
		result;

	// look for criticals separator '/'
	sep = formula.indexOf('/');
	
	if (sep >= 0) {
	
		errors.push(createMessage('criticalsNotHandled'));
		dmgRollStr = formula.slice(0, sep);

	} else {
		dmgRollStr = formula;
	}

	result = parseDamageRoll(dmgRollStr);

	Array.prototype.push.apply(errors, result.errors);
	Array.prototype.push.apply(warnings, result.warnings);

	if (errors.length === 0) {
		data = result.data;
	}

	return {errors: errors, warnings: warnings, data: data};
}

/**
 * parseList
 * parses a comma-separated list
 * returns an array of string chunks
 */
function parseList(listStr){
	var chunks,
		result;

	chunks = listStr.split(/\s*,\s*/);

	// remove any empty strings from the array of results
	result = chunks.reduce(function(prev, curr){
		if (curr !== '') {
			return prev.concat(curr);
		} else {
			return prev;
		}
	}, []);

	return result;
}

/**
 * parseExtraDamage
 */
function parseExtraDamage(extraStr) {
	var chunks, 
		extraDamage = [],
		i,
		data,
		errors = [];

	chunks = extraStr.split(/\s+and\s+/);

	// the left chunk could be comma-separated
	extraDamage = parseList(chunks[0]);
	
	// the right chunk(s?) shouldn't be comma-separated so no point in parsing
	for (i = 1; i < chunks.length; i++) {

		if (chunks[i].indexOf(',') >= 0) {
			errors.push(createMessage('wrongFormatExtraDamage', extraStr));
			break;
		}
		extraDamage.push(chunks[i]);
	}

	if (errors.length === 0) {
		data = {extraDamage: extraDamage};
	}

	return {errors: errors, warnings: [], data: data};
}

/**
 * parseAttackDetails
 * parses an attack details string (i.e. the part between parentheses)
 */
function parseAttackDetails(detailStr) {
	var chunks, 
		errors = [],
		warnings = [], 
		result,
		data,
		extraDamage = [],
		i;

	chunks = detailStr.split(/\s+plus\s+/);

	// the first chunk is usually a damage roll (it can be missing)
	if (! isNaN(parseInt(chunks[0], 10))) {
		result = parseDamageFormula(chunks[0]);
	} else {
		result = parseExtraDamage(chunks[0]);
	}

	errors = result.errors;
	warnings = result.warnings;

	if (errors.length === 0) {
		
		data = result.data;

		if (data.extraDamage) {
			Array.prototype.push.apply(extraDamage, data.extraDamage);
		}

		// subsequent chunks can only be extra damage (for now)
		for (i = 1; i < chunks.length; i++) {

			result = parseExtraDamage(chunks[i]);
			
			Array.prototype.push.apply(errors, result.errors);
			Array.prototype.push.apply(warnings, result.warnings);

			if (errors.length === 0) {

				Array.prototype.push.apply(extraDamage, result.data.extraDamage);

			// no point in continuing if we have an error
			} else {
				break;
			}
		}
	}

	if (errors.length > 0) {
		data = undefined;

	} else if (extraDamage.length > 0) {
		data.extraDamage = extraDamage;
	}

	return {errors: errors, warnings: warnings, data: data};
}

/**
 * parseAttack
 * parses an attack into an identifier and a details value
 */
function parseAttack(attackStr) {
 	var reParens = /\s*(\(|\))\s*/,	// capture the brackets
		chunks,
		identifier,
		details;

	// split the string into the attack identifier and its details in brackets
	// we should end up with the following structure:
	// [ identifier, '(', details, ')', '' ]
	chunks = attackStr.split(reParens);

	// look for formatting errors
	// there should be exactly 5 chunks with chunks 2 and 4 being brackets
	// and the last chunk being an empty string
	if (chunks.length !== 5) {
		return;

	} else if (chunks[1] !== '(' || chunks[3] !== ')' || chunks[4] !== '') {
		return;
	}

	identifier = chunks[0].trim();
	details = chunks[2].trim();

	if (identifier === '' || details === '') {
		return;
	}

	return {identifier: identifier, details: details};
}

/**
 * parseAttackChunk
 * parses a single attack
 */
function parseAttackChunk(attackStr){
	var errors = [],
		warnings = [],
		headerRes, 
		detailsRes, 
		data,
		key;

	// extract the identifier and the details
	// format: identifier (details)
	// e.g. 2 claws +3 (2d4+2 plus poison)
	var attack = parseAttack(attackStr);

	if (!attack) {
		errors.push(createMessage('wrongAttackFormat', attackStr));

	} else {

		headerRes = parseAttackHeader(attack.identifier);
		detailsRes = parseAttackDetails(attack.details);

		Array.prototype.push.apply(errors, headerRes.errors);
		Array.prototype.push.apply(warnings, headerRes.warnings);

		Array.prototype.push.apply(errors, detailsRes.errors);
		Array.prototype.push.apply(warnings, detailsRes.warnings);

		if (errors.length === 0) {

			data = {};
			for (key in headerRes.data) {
				data[key] = headerRes.data[key];
			}
			// requires the keys in header and details to be distinct
			for (key in detailsRes.data) {
				data[key] = detailsRes.data[key];
			}
		}
	}
	return {errors: errors, warnings: warnings, data: data};
}

/**
 * parseMeleeString
 * parses the whole melee string
 */
function parseMeleeString(meleeStr){
	var errors = [],
		warnings = [],
		bigChunks,
		chunks = [],
		data,
		result;

	if (typeof meleeStr !== 'string') {
		return {errors: [createMessage('invalidValue', meleeStr)], warnings: [], data: undefined};
	}

	// parse for lists of attacks separated by 'or'
	bigChunks = parseOrSeparatedString(meleeStr);
	if (bigChunks.length !== 1) {
		errors.push(createMessage('alternativeAttackListsNotHandled'));
	} 

	// parse the string for commas
	if (errors.length === 0) {
		chunks = parseCommaSeparatedString(bigChunks[0]);
	
		if (chunks.length > 1) {
			errors.push(createMessage('multipleAttackTypesNotHandled'));
		}
	}

	// parse the string for "and" outside the brackets (alternative to commas)
	if (errors.length === 0) {
		chunks = parseAndSeparatedString(bigChunks[0]);
	
		if (chunks.length > 1) {
			errors.push(createMessage('multipleAttackTypesNotHandled'));
		}
	}

	if (errors.length === 0 && chunks.length > 0) {
		result = parseAttackChunk(chunks[0]);
		errors = result.errors;
		warnings = result.warnings;
		data = result.data;
	}

	if (errors.length) {
		data = undefined;
	}

	return {errors: errors, warnings: warnings, data: data};
}


// ******************************************************************
// Exports
// ******************************************************************

exports.parseCommaSeparatedString = parseCommaSeparatedString;
exports.parseOrSeparatedString = parseOrSeparatedString;
exports.parseFeatChunk = parseFeatChunk;
exports.parseAttackHeader = parseAttackHeader;
exports.parseAttackDetails = parseAttackDetails;
exports.parseAttackChunk = parseAttackChunk;
exports.parseDamageRoll = parseDamageRoll;
exports.parseList = parseList;
exports.parseExtraDamage = parseExtraDamage;
exports.parseAttack = parseAttack;
exports.parseDamageFormula = parseDamageFormula;
exports.parseMeleeString = parseMeleeString;
exports.parseAndSeparatedString = parseAndSeparatedString;
