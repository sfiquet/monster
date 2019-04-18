/* jshint node: true, esversion: 6 */
'use strict';
    
const messages = {
	invalidFormat: 'Invalid format',
	invalidValue: 'Invalid value',
	originalValueConverted: ['Original value', 'converted to'],
	wrongFormatDate2002: '2-1/2 ft provided as date 2/01/2002',
	wrongFormatDate2014: '2-1/2 ft provided as date 2/01/2014',
	noClosingParenthesis: 'Closing parenthesis missing',
	dataAfterClosingParenthesis: 'Unexpected data after closing parenthesis',
	wrongFormatAttackHeader: 'Wrong format for attack header',
	checkFormatAttackHeader: 'Check format of attack header (plural missing)',
	wrongFormatAttackDetails: 'Wrong format for attack details',
	wrongFormatExtraDamage: 'Wrong format in extra damage',
	wrongAttackFormat: 'Wrong attack format',
	notMultipleOf5: ['Value', 'is not a multiple of 5 - rounded down to'],
	invalidReachConverted: 'Value 2.5 is invalid for Reach - replaced by default 5',
	unknownFeat: 'Unknown feat',
	unexpectedFeatDetails: 'Unexpected feat details',
	missingFeatDetails: 'Missing feat details',
	invalidDetails: 'Invalid details',
	unknownAttack: 'Unknown attack',
	wrongSkillFormat: 'Wrong skill format',
	unknownSkill: 'Unknown skill',
	numberInSQ: 'Numbers in SQ - check that they are independent from other stats',
	racialModMerge: 'Skill present in Racial modifiers but not in Skills',
	negativeDiscrepancy: ['Negative discrepancy for', 'target', 'should be bigger than calculated'],
	classSkillBonusDiscrepancy: 'Skill discrepancy doesn\'t allow for class skill bonus',
	noSkillData: 'No data to store for skill',

	// not handled yet
	highCRNotHandled: 'CR over 30 not handled yet',
	classLevelsNotHandled: 'Class levels not handled yet',
	aberrationTypeNotHandled: 'Aberration type not handled yet',
	animalTypeNotHandled: 'Animal type not handled yet',
	humanoidTypeNotHandled: 'Humanoid type not handled yet',
	outsiderTypeNotHandled: 'Outsider type not handled yet',
	subtypesNotHandled: 'Subtypes not handled yet',
	extraHPNotHandled: 'Hit Dice with extra HP not handled yet',
	extraFortitudeNotHandled: 'Extra Fortitude not handled yet',
	extraReflexNotHandled: 'Extra Reflex not handled yet',
	extraWillNotHandled: 'Extra Will not handled yet',
	gearNotHandled: 'Gear not handled yet',
	rangedNotHandled: 'Ranged attacks not handled yet',
	alternateFormsNotHandled: 'Alternate forms not handled yet',
	flyNotHandled: 'Fly speed not handled yet',
	specialSpeedNotHandled: 'Extra speed in special conditions not handled yet',
	featSubDetailsNotHandled: 'Feat sub-details not handled yet',
	criticalsNotHandled: 'Criticals not handled yet',
	alternativeAttackListsNotHandled: 'Alternative lists of attacks not handled yet',
	multipleAttackTypesNotHandled: 'Multiple attack types not handled yet',
	extraReachesNotHandled: 'Extra reaches are not implemented yet',
	movementAbilitiesNotHandled: 'Special abilities that affect movement not handled yet',
	featNotHandled: 'Feat not handled yet',
	extraSkillModifiersNotHandled: 'Alternative skill modifiers not handled yet',
	skillDetailsNotHandled: 'Skill details not handled yet',
	conditionalModifiersNotHandled: 'Conditional modifiers not handled yet',
	substitutionRulesNotHandled: 'Substitution rules not handled yet',
	DCInSQNotHandled: 'DC in SQ not handled yet'
};

function outputValue(value) {
	
	if (typeof value === 'string') {
		return '"' + value + '"';
	
	} else {
		return '' + value;
	}
}

function outputList(valArray) {
	var output = '',
		i;

	if (valArray.length > 0) {
		output += outputValue(valArray[0]);
	}
	for (i = 1; i < valArray.length; i++) {
		output += ', ' + outputValue(valArray[i]);
	}

	return output;
}

function buildMessage(msg){
	var args,
		output = '',
		i,
		max;

	if (typeof msg === 'string') {
		
		args = Array.prototype.slice.call(arguments, 1);
		output += msg;

		if (args.length > 0) {
			output += ': ' + outputValue(args[0]);
		}

		if (args.length > 1) {
			output += ' (' + outputList(args.slice(1)) + ')';
		}

	} else if (Array.isArray(msg)) {

		args = Array.prototype.slice.call(arguments, 1);
		max = Math.min(args.length, msg.length);

		output += msg[0] + ' ' + outputValue(args[0]);
		for (i = 1; i < max; i++) {
			output += ' ' + msg[i] + ' ' + outputValue(args[i]);
		}
		if (max < args.length) {
			output += ' (' + outputList(args.slice(max)) + ')';

		} else {
			for (i = max; i < msg.length; i++) {
				output += ' ' + msg[i];
			}
		}

	} else {

		args = Array.prototype.slice.call(arguments);
		
		if (args.length === 0) {
			output += 'undefined';
		
		} else {
			output += outputList(args);
		}

	}
	return output;
}

function buildMessageFromKey(key){
	var msg, args;

	if (key) {
		msg = messages[key];
	}

	if (!msg) {

		// this has a better chance to be helpful than a default message
		if (key) {
			msg = key;

		// but when all else fails, a default message will do
		} else {
			msg = 'Unrecognised error';
		}
	}

	// replace key by its value in the list of arguments 
	// before calling buildMessage
	args = Array.prototype.slice.call(arguments);
	args[0] = msg;
	
	return buildMessage.apply(null, args);
}

function isValidKey(key){
	return (messages[key] !== undefined);
}

exports.messages = messages;
exports.buildMessage = buildMessage;
exports.buildMessageFromKey = buildMessageFromKey;
exports.isValidKey = isValidKey;
