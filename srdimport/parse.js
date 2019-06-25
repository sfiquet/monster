'use strict';

const assert = require('assert').strict;
const message = require('./message');
const skillLib = require('./skill');
const createMessage = message.createMessage;

/**
 * splitOutsideBrackets
 * splits the first argument into a list of chunks, using the second argument
 * as the separator, ignoring any separators that are within parentheses.
 * The separator must be a single character.
 *
 * Note: there can be square brackets (with or without separators) within the 
 * parentheses but it doesn't matter here. Further parsing can be done on
 * the chunks. There are no square brackets outside parentheses.
 */
function splitOutsideBrackets(dataStr, separator){
	assert.equal(typeof (dataStr), 'string');
	assert.equal(typeof (separator), 'string');
	assert.equal(separator.length, 1);

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
			
			if (dataStr[i] === separator) {
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
 * parseCommaSeparatedString
 * build a list of chunks that are comma-separated ignoring any commas that are 
 * within parentheses.
 *
 * Note: there can be square brackets (with or without commas) within the 
 * parentheses but it doesn't matter here. Further parsing can be done on
 * the chunks. There are no square brackets outside parentheses.
 */
function parseCommaSeparatedString(dataStr) {
	return splitOutsideBrackets(dataStr, ',');
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
	chunks1 = str.split(/(\([^\(\)]*\))/); // eslint-disable-line no-useless-escape

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
 * parseFeatDetailsChunk
 * extracts a single feat detail object from a string
 * input: in most cases this is a single item (can be multiple words). 
 *  For Skill Focus it can be a specialised skill with square brackets:
 * 	"Sleight of Hand"
 * 	"Knowledge [nature]"
 * output: an object with a name property and optionally a specialty property
 * 	For the examples above:
 * 	{name: "Sleight of Hand"}
 * 	{name: "Knowledge", specialty: "nature"}
 */
function parseFeatDetailsChunk(detailStr){
	let reParens = /\s*(\[|\])\s*/;	// capture the square brackets
	let chunks;
	let errors = [];
	let result;

	// split the string into the name and its details in brackets
	// we should end up with the following structure:
	// [ name, '[', specialty, ']', '' ]
	chunks = detailStr.split(reParens);

	// simple case: no square brackets - just return the string
	if (chunks.length === 1){
		result = {name : detailStr};

	// pair of square brackets
	} else if (chunks.length === 5) {
		
		if (chunks[0] === '' || chunks[2] === '' || chunks[4] !== '' || chunks[1] === chunks[3] || chunks[1] === ']') {
			errors.push(createMessage('invalidDetails', detailStr));
		
		} else {
			result = {name: chunks[0], specialty: chunks[2]};
		}

	// wrong format
	} else {
		errors.push(createMessage('invalidDetails', detailStr));
	}

	return {errors: errors, warnings: [], data: result};
}

/**
 * parseFeatDetails
 * extracts an array of feat details from a comma-separated string
 * input: either a single item (can be multiple words) or a comma-separated list, e.g. for Skill Focus:
 * 	"Perception"
 * 	"Sleight of Hand"
 * 	"Perception, Sleight of Hand, Use Magic Device"
 * output: an array of objects with a name property (an url could also be possible but is not available in the Excel file)
 * 	for the examples above:
 * 	[{name: "Perception"}]
 * 	[{name: "Sleight of Hand"}]
 * 	[{name: "Perception"}, {name: "Sleight of Hand"}, {name: "Use Magic Device"}]
 */
function parseFeatDetails(detailStr){
	let chunks;
	let data = [];
	let errors = [];
	let warnings = [];

	chunks = parseCommaSeparatedString(detailStr);
	
	chunks.forEach(function(str) {
		let result = parseFeatDetailsChunk(str);
		
		errors = errors.concat(result.errors);
		warnings = warnings.concat(result.warnings);
		
		if (result.data !== undefined) {
			data.push(result.data);
		}
	});
	
	if (errors.length > 0){
		data = undefined;
	}

	return {errors: errors, warnings: [], data: data};
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
		detailStr,
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
		
			detailStr = chunks[1].trim();
			warnings.push(createMessage('noClosingParenthesis', featStr));
		
		} else {
		
			detailStr = chunks[1].slice(0, close).trim();

			// check that there isn't anything after the closing parenthesis
			var endStr = chunks[1].slice(close + 1).trim();

			// special case: B for bonus feat
			if (endStr === 'B' && special.length === 0) {
				special.push('bonus');
			
			} else if (endStr.length > 0) {
				warnings.push(createMessage('dataAfterClosingParenthesis', featStr));
			}
		}

		details = parseFeatDetails(detailStr);
		errors = errors.concat(details.errors);
		warnings = warnings.concat(details.warnings);
	}

	if (errors.length) {
		
		result = undefined;

	} else {

		result.name = name;
		
		if (details && details.data) {
			result.details = details.data;
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
		dieType;

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
				// we're not doing anything with the bonus currently
				// let bonus = parseInt(chunks[5], 10);
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

/**
 * parseNonBracketedSkill
 */
function parseNonBracketedSkill(str){
	var chunks,
		name,
		modifier;

	chunks = str.split(/\s*([+-]\d*)\s*/);
	
	if (chunks.length !== 3 || chunks[2] !== '') {
		return;
	}
	
	name = chunks[0].trim();
	modifier = parseInt(chunks[1], 10);

	return {name: name, modifier: modifier};
}

/**
 * parseAlternativeSkillModifiers
 */
function parseAlternativeSkillModifiers(str){
	// temporary implementation
	return str;
}

/**
 * parseBracketedSkill
 */
function parseBracketedSkill(str) {
	var reParens = /\s*(\(|\))\s*/,	// capture the brackets
		chunks,
		result,
		name,
		details,
		modifier,
		alternatives;

	// split the string at the brackets
	// we should end up with the following structure at most:
	// [ skill name, '(', details, ')', modifier, '(', list of alternative modifiers, ')', '' ]
	// Since brackets are optional, the minimum we can have is:
	// [ skill name and modifier ]
	// in a single chunk which needs its own parsing
	chunks = str.split(reParens);

	// look for formatting errors
	// there should be between 1 and 9 chunks
	if (chunks.length > 9) {
		return;
	}

	// 1 chunk = no bracket
	if (chunks.length === 1) {
		result = parseNonBracketedSkill(str);

	// 5 chunks: two cases
	// [ name, '(', details, ')', mod ] or
	// [ name and mod, '(', list of alternatives, ')', '']
	} else if (chunks.length === 5){

		// check that we actually have an opening bracket followed by a closing one
		if (chunks[1] !== '(' || chunks[3] !== ')') {
			return;
		}

		// [ name and mod, '(', list of alternatives, ')', '']
		if (chunks[4] === '') {
			result = parseNonBracketedSkill(chunks[0]);
			result.alternatives = parseAlternativeSkillModifiers(chunks[2]);

		// [ name, '(', details, ')', mod ]
		} else {
			name = chunks[0].trim();
			details = chunks[2].trim();
			modifier = parseNonBracketedSkill(chunks[4]).modifier;
			result = {name: name, specialty: details, modifier: modifier};
		}

	// 9 chunks: we have everything
	} else if (chunks.length === 9) {
		// check that our brackets make sense
		if (chunks[1] !== '(' || chunks[3] !== ')' || chunks[5] !== '(' || chunks[7] !== ')') {
			return;
		}
		name = chunks[0].trim();
		details = chunks[2].trim();
		modifier = parseNonBracketedSkill(chunks[4]).modifier;
		alternatives = parseAlternativeSkillModifiers(chunks[6]);
		result = {name: name, specialty: details, modifier: modifier, alternatives: alternatives};

	// any other number of chunks = wrong format
	} else {
		return;
	}

	return result;
}

/**
 * parseSkillChunk
 */
function parseSkillChunk(str){
	var errors = [],
		warnings = [],
		data;

	data = parseBracketedSkill(str);
	if (!data) {
		errors.push(createMessage('wrongSkillFormat', str));
	} else {
		if (data.alternatives) {
			errors.push(createMessage('extraSkillModifiersNotHandled', str));
		}
	}

	if (errors.length) {
		data = undefined;
	}

	return {errors: errors, warnings: warnings, data: data};
}

/**
 * parseSkillString
 * creates a skill dictionary
 */
function parseSkillString(skillStr){
	let errors = [],
		warnings = [],
		data = {},
		chunks;

	if (typeof skillStr !== 'string') {
		return {errors: [createMessage('invalidValue', skillStr)], warnings: [], data: undefined};
	}

	chunks = parseCommaSeparatedString(skillStr);

	chunks.forEach(function(str){

		let result = parseSkillChunk(str);
		
		Array.prototype.push.apply(errors, result.errors);
		Array.prototype.push.apply(warnings, result.warnings);

		if (result.data) {
			let skill = result.data;
			let name = skill.name;

			if (name !== undefined) {
			
				if (skill.specialty === undefined) {
					data[name] = skill;

				} else {
					if (!data[name]) {
						data[name] = {};
					}
					data[name][skill.specialty] = skill;
				}
			}
		}
	});

	if (errors.length) {
		data = undefined;
	}

	return {errors: errors, warnings: warnings, data: data};
}

/**
 * parseRacialMod
 * expected format:
 * +4 Acrobatics
 * returns either undefined or an object with properties 'name' and 'modifier'
 */
function parseRacialMod(str) {
	var chunks,
		result = {};

	chunks = str.split(/\s*([+-]\d+)\s+/);

	// no modifier
	if (chunks.length === 1) {
		return;

	// one modifier: this is expected
	} else if (chunks.length === 3) {

		if (chunks[0] !== '' || chunks[2] === '') {
			return;
		
		} else {
			result.modifier = parseInt(chunks[1], 10);
			result.name = chunks[2].trim();
			return result;
		}
	}

	// anything else is wrong
}

/**
 * parseConditionalRacialMode
 * expected formats for input string:
 * - skill, e.g. 'Acrobatics'
 * - skill condition 'Acrobatics when jumping'
 */
function parseConditionalRacialMod(str){
	var skills,
		i,
		result = {},
		condition,
		trimmed;

	trimmed = str.trim();
	
	// look for each skill at the beginning of the string until we find one
	skills = skillLib.getAllSkills();

	for (i = 0; i < skills.length; i++) {
	
		if (trimmed.startsWith(skills[i])) {

			// avoid identifying a skill within a word
			if (skills[i].length < trimmed.length && trimmed[skills[i].length] != ' ') {
				continue;
			}
	
			// we found it, now make sure it's not a specialised skill as they require brackets
			if (skillLib.isSpecialisedSkill(skills[i])) {
				return;
			}

			result.name = skills[i];

			if (skills[i].length < trimmed.length) {

				condition = trimmed.slice(skills[i].length).trim();
				
				if (condition.length) {

					result.condition = condition;
				}
			}
			return result;
		}
	}
	// not found: return undefined
}

/**
 * parseRacialModChunk
 */
function parseRacialModChunk(str){
	var errors = [],
		warnings = [],
		result,
		chunks,
		skill;

	chunks = str.split(/\s*(\(|\))\s*/);

	// 1 chunk = no bracket, 5 chunks = 2 brackets
	if (chunks.length === 1 || chunks.length === 5) {

		result = parseRacialMod(chunks[0]);

		if (!result) {
			errors.push(createMessage('invalidFormat', str));

		} else if (chunks.length === 1) {
			skill = parseConditionalRacialMod(result.name);

			if (!skill) {
				errors.push(createMessage('unknownSkill', result.name));

			} else if (skill.condition) {
				errors.push(createMessage('conditionalModifiersNotHandled', str));			
			}
			// otherwise we already have the correct name in result

		} else if (chunks.length === 5) {

			// check whether we have a specialised skill
			if (skillLib.isSpecialisedSkill(result.name)) {
				
				// no trailing text after the brackets - we're good
				if (chunks[4].length === 0) {
					result.specialty = chunks[2];
				
				// there's trailing text, i.e. a conditional modifier
				} else {
					errors.push(createMessage('conditionalModifiersNotHandled', str));
				}

			// if not, we have a conditional modifier - not handled yet
			} else {
				errors.push(createMessage('conditionalModifiersNotHandled', str));
			}
		}

	// any other number of chunks = wrong format
	} else {
		errors.push(createMessage('invalidFormat', str));
	}

	if (errors.length) {
		result = undefined;
	}

	return {errors: errors, warnings: warnings, data: result};

}

/**
 * parseRacialModString
 */
function parseRacialModString(modStr){
	let errors = [],
		warnings = [],
		data = {},
		bigChunks,
		chunks;

	if (typeof modStr !== 'string') {
		return {errors: [createMessage('invalidValue', modStr)], warnings: [], data: undefined};
	
	} else if (modStr.length === 0) {
		return {errors: [], warnings: [], data: undefined};
	}

	// look for a semicolon
	bigChunks = modStr.split(';');

	// no semicolon
	if (bigChunks.length === 1) {

		// doesn't start with a number: substitution rule
		if (isNaN(parseInt(modStr, 10))) {
			errors.push(createMessage('substitutionRulesNotHandled'));

		// starts with a number: modifier list
		} else {

			chunks = parseCommaSeparatedString(modStr);

			data.skills = {};

			chunks.forEach(function(str){

				var result = parseRacialModChunk(str);
				
				Array.prototype.push.apply(errors, result.errors);
				Array.prototype.push.apply(warnings, result.warnings);

				if (result.data) {
					let skill = result.data;
					let name = skill.name;

					if (name !== undefined) {
					
						if (skill.specialty === undefined) {
							data.skills[name] = skill;

						} else {
							if (!data.skills[name]) {
								data.skills[name] = {};
							}
							data.skills[name][skill.specialty] = skill;
						}
					}
				}
			});
		}

	// one semicolon: we have the modifier list on the left and the substitution rule on the right
	} else if (bigChunks.length === 2) {
		/*
		let modList = bigChunks[0];
		let rule = bigChunks[1];
		*/

		errors.push(createMessage('substitutionRulesNotHandled'));
	
	// too many semicolons
	} else {
		errors.push(createMessage('invalidFormat', modStr));
	}

	if (errors.length) {
		data = undefined;
	}

	return {errors: errors, warnings: warnings, data: data};
}

/**
 * parseSQString
 */
function parseSQString(str){
	var errors = [],
		warnings = [],
		SQArray = [],
		chunks;

	if (typeof str !== 'string') {
		return {errors: [createMessage('invalidValue', str)], warnings: [], data: undefined};
	
	} else if (str.length === 0) {
		return {errors: [], warnings: [], data: undefined};
	}

	// check for DCs in the string
	chunks = str.split(/\W(DC \d+)\W*/);
	if (chunks.length > 1) {
		return {errors: [createMessage('DCInSQNotHandled', str)], warnings: [], data: undefined};
	}

	// raise a warning if there are numbers in the string
	chunks = str.split(/(\d+)/);
	if (chunks.length > 1) {
		warnings.push(createMessage('numberInSQ', str));
	}

	// now build the chunks for real
	chunks = parseCommaSeparatedString(str);
	chunks.forEach(function(item){
		SQArray.push([{text: item}]);
	});

	return {errors: errors, warnings: warnings, data: SQArray};
}

function parseSpeedString(str){
	let errors = [];
	let warnings = [];
	let data = {};

	const chunks = splitOutsideBrackets(str, ';');

	if (chunks.length === 1){
		// normal case
		const res = parseNormalSpeedString(chunks[0]);
		errors = errors.concat(res.errors);
		warnings = warnings.concat(res.warnings);
		if (res.data){
			data = res.data;
		}
	
	} else if (chunks.length === 2){
		// left is normal stuff, right is either alternative list of speeds or list of special abilities
		const res = parseNormalSpeedString(chunks[0]);
		errors = errors.concat(res.errors);
		warnings = warnings.concat(res.warnings);

		if (isNaN(parseInt(chunks[1], 10))) {
			// special abilities
			errors = errors.concat(createMessage('movementAbilitiesNotHandled', chunks[1]));

		} else {
			// alternative list of speeds
			errors = errors.concat(createMessage('specialSpeedNotHandled', chunks[1]));
		}
	
	} else if (chunks.length === 3){
		// left: normal stuff, middle: alternative list, right: special abilities
		const res = parseNormalSpeedString(chunks[0]);
		errors = errors.concat(res.errors);
		warnings = warnings.concat(res.warnings);

		errors = errors.concat(createMessage('specialSpeedNotHandled', chunks[1]));
		errors = errors.concat(createMessage('movementAbilitiesNotHandled', chunks[2]));
	
	} else {
		// wrong format
		errors = errors.concat(createMessage('invalidFormat', str));
	}

	if (errors.length !== 0){
		data = undefined;
	}
	return {errors, warnings, data};
}

function parseNormalSpeedString(str){

	const chunks = parseCommaSeparatedString(str);
	let result = chunks.reduce((acc, item, id) => {
		let res;
		if (id === 0 && !isNaN(parseInt(item, 10))) {
			res = parseLandSpeedChunk(item);

		} else if (item.startsWith('fly')) {
			res = parseFlySpeedChunk(item);

		} else {
			res = parseStandardSpeedChunk(item);
		}

		acc.errors = acc.errors.concat(res.errors);
		acc.warnings = acc.warnings.concat(res.warnings);
		if (res.data){
			Object.assign(acc.data, res.data);
		}
		return acc;
	}, { errors: [], warnings: [], data: {}});

	if (result.errors.length !== 0){
		result.data = undefined;
	}

	return result;
}

function parseLandSpeedChunk(str){
	let errors = [];
	let data = {};

	// capture parentheses
	let reParens = /\s*(\(|\))\s*/;
	let parensChunks = str.split(reParens);

	if (parensChunks.length === 1){
		// no parens
		const reSeparator = /\s*(\d+)\s*ft.\s*/;
		const baseChunks = parensChunks[0].split(reSeparator);
		if (baseChunks.length !== 3 || baseChunks[0] !== '' || baseChunks[2] !== ''){
			errors = errors.concat(createMessage('invalidFormat', 'land speed', str));
		} else {
			data.land = parseInt(baseChunks[1], 10);
		}

	} else if (parensChunks.length === 5 && parensChunks[1] === '(' && parensChunks[3] === ')'){
		// extra speeds - not handled yet
			errors = errors.concat(createMessage('specialSpeedNotHandled', `(${parensChunks[2]})`));

	} else {
		// wrong format
		errors = errors.concat(createMessage('invalidFormat', 'land speed', str));
	}

	if (errors.length !== 0){
		data = undefined;
	}

	return {errors, warnings: [], data};
}

function parseStandardSpeedChunk(str){
	let errors = [];
	let data = {};

	// capture parentheses
	let reParens = /\s*(\(|\))\s*/;
	let parensChunks = str.split(reParens);

	if (parensChunks.length === 1){
		// no parens
		const baseChunks = parensChunks[0].split(/(^[A-Za-z]+[\sA-Za-z]*)\s*(\d+)\s*ft\.\s*/);
		// 'swim 30 ft.' => ['', 'swim', '30', '']
		if (baseChunks.length !== 4 || baseChunks[0] !== '' || baseChunks[3] !== ''){
			errors = errors.concat(createMessage('movementAbilitiesNotHandled', str));
		} else {
			let name = baseChunks[1].trim().toLowerCase();
			data[name] = parseInt(baseChunks[2], 10);
		}

	} else if (parensChunks.length === 5 && parensChunks[1] === '(' && parensChunks[3] === ')'){
		// either limitation or extra speeds - not handled yet
		if (parensChunks[0].includes(' ft.')){
			errors = errors.concat(createMessage('specialSpeedNotHandled', `(${parensChunks[2]})`));

		} else if (parensChunks[4].includes(' ft.')){
			errors = errors.concat(createMessage('speedLimitationNotHandled', `(${parensChunks[2]})`));

		} else {
			errors = errors.concat(createMessage('invalidFormat', 'standard speed', str));
		}

	} else if (parensChunks.length === 9 && 
		parensChunks[1] === '(' && parensChunks[3] === ')' && 
		parensChunks[5] === '(' && parensChunks[7] === ')'){
		// limitation and extra speeds - not handled yet
			errors = errors.concat(createMessage('speedLimitationNotHandled', `(${parensChunks[2]})`));
			errors = errors.concat(createMessage('specialSpeedNotHandled', `(${parensChunks[6]})`));

	} else {
		// wrong format
		errors = errors.concat(createMessage('invalidFormat', 'standard speed', str));
	}

	if (errors.length !== 0){
		data = undefined;
	}
	
	return {errors, warnings: [], data};
}

function parseFlySpeedChunk(str){
	let errors = [];
	let warnings = [];
	let data;
	let fly = {};

	// capture parentheses
	let reParens = /\s*(\(|\))\s*/;
	let parensChunks = str.split(reParens);

	// deal with the first chunk
	if (parensChunks.length > 0){
		const baseChunks = parensChunks[0].split(/(^[a-z]+)\s*(\d+)\s*ft\.\s*/);
		// 'fly 30 ft.' => ['', 'fly', '30', '']
		if (baseChunks.length !== 4 || baseChunks[0] !== '' || baseChunks[3] !== ''){
			errors = errors.concat(createMessage('invalidFormat', 'fly speed', str));

		} else {
			assert.ok(baseChunks[1] === 'fly');

			fly.value = parseInt(baseChunks[2], 10);
		}
	}

	// if there are no parentheses, there is no maneuverability: raise a warning
	if (parensChunks.length === 1) {
		warnings = warnings.concat(createMessage('flySpeedWithoutManeuverability'));
	}

	// deal with parentheses
	else if (parensChunks.length === 5 && parensChunks[1] === '(' && parensChunks[3] === ')'){
		// normal case: maneuverability details
		// it could also be a case of extra speed with absent maneuverability, although that's an edge case
		const parenStr = parensChunks[2];

		if (isNaN(parseInt(parenStr, 10))){
			const res = parseFlyDetailsChunk(parenStr);
			errors = errors.concat(res.errors);
			warnings = warnings.concat(res.warnings);
			if (res.data){
				Object.assign(fly, res.data);
			}

		} else {
			// starts with a speed value: it's a special speed
			// e.g. '20 ft. in armor'
			warnings = warnings.concat(createMessage('flySpeedWithoutManeuverability'));
			errors = errors.concat(createMessage('specialSpeedNotHandled', `(${parenStr})`));
		}

	// 2 sets of parentheses, one for fly details, one for special speed
	} else if (parensChunks.length === 9 && 
		parensChunks[1] === '(' && parensChunks[3] === ')' && 
		parensChunks[5] === '(' && parensChunks[7] === ')'){
		// extra speed - not handled yet
			errors = errors.concat(createMessage('specialSpeedNotHandled', `(${parensChunks[6]})`));

			// check the details anyway
			const res = parseFlyDetailsChunk(parensChunks[2]);
			errors = errors.concat(res.errors);
			warnings = warnings.concat(res.warnings);
			// no need to store the data, we already have an error

	} else {
		// wrong format
		errors = errors.concat(createMessage('invalidFormat', 'fly speed', str));
	}

	if (errors.length !== 0){
		data = undefined;
	} else {
		data = {fly};
	}
	
	return {errors, warnings, data};
}

function parseFlyDetailsChunk(str){
	let errors = [];
	let warnings = [];
	let data = {};
	const validManeuverabilities = ['clumsy', 'poor', 'average', 'good', 'perfect'];

	const details = str.split(';');
	
	if (details.length === 2){
		// e.g. 'average; only in fiery form'
		errors = errors.concat(createMessage('flyCommentNotHandled', `(${str})`));

	} else if (details.length === 1){
		const words = str.split(' ');
		if (words.length === 1){
			// e.g. 'average'

			if (validManeuverabilities.includes(words[0])){
				data.maneuverability = words[0];
			
			} else {
				errors = errors.concat(createMessage('invalidManeuverability', words[0]));
			}

		} else {
			// e.g. 'only at night' or 'see below'
			warnings = warnings.concat(createMessage('flySpeedWithoutManeuverability'));
			errors = errors.concat(createMessage('flyCommentNotHandled', `(${str})`));
		}

	} else {
		errors = errors.concat(createMessage('invalidFormat', 'fly speed details', str));
	}

	if (errors.length !== 0){
		data = undefined;
	}

	return {errors, warnings, data};
}

// ******************************************************************
// Exports
// ******************************************************************

exports.splitOutsideBrackets = splitOutsideBrackets;
exports.parseCommaSeparatedString = parseCommaSeparatedString;
exports.parseOrSeparatedString = parseOrSeparatedString;
exports.parseFeatChunk = parseFeatChunk;
exports.parseFeatDetails = parseFeatDetails;
exports.parseFeatDetailsChunk = parseFeatDetailsChunk;
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
exports.parseAlternativeSkillModifiers = parseAlternativeSkillModifiers;
exports.parseNonBracketedSkill = parseNonBracketedSkill;
exports.parseBracketedSkill = parseBracketedSkill;
exports.parseSkillChunk = parseSkillChunk;
exports.parseSkillString = parseSkillString;
exports.parseRacialMod = parseRacialMod;
exports.parseConditionalRacialMod = parseConditionalRacialMod;
exports.parseRacialModChunk = parseRacialModChunk;
exports.parseRacialModString = parseRacialModString;
exports.parseSQString = parseSQString;
exports.parseSpeedString = parseSpeedString;
exports.parseLandSpeedChunk = parseLandSpeedChunk;
exports.parseStandardSpeedChunk = parseStandardSpeedChunk;
exports.parseFlySpeedChunk = parseFlySpeedChunk;
