/* jshint node: true */
'use strict';

/**
 * getXP
 * Note: Values for CR 22 to 25 differ in the Bestiary and the Core Rulebook.
 * The Core Rulebook XPs are based on powers of 2. 
 * In the Bestiary, values are rounded up to the nearest thousand. 
 * CR 26 to 30 in Bestiary 4 are consistent with the choices in the Core
 * Rulebook so the Core Rulebook values have been used here.
 *
 * In the future the table could be replaced by an algorithmic implementation.
 * In general, if x is CR and y is 1/100th of XP:
 * x -> y where x is odd
 * x + 1 -> y * 1.5
 * x + 2 -> y * 2
 * Multiply result by 100 to get XP.
 * Fractions are a bit less obvious but follow a similar pattern.
 */
exports.getXP = function(cr) {

	var table = {
		'1/8': 50,
		'1/6': 65,
		'1/4': 100,
		'1/3': 135,
		'1/2': 200,
		1: 400,
		2: 600,
		3: 800,
		4: 1200,
		5: 1600,
		6: 2400,
		7: 3200,
		8: 4800,
		9: 6400,
		10: 9600,
		11: 12800,
		12: 19200,
		13: 25600,
		14: 38400,
		15: 51200,
		16: 76800,
		17: 102400,
		18: 153600,
		19: 204800,
		20: 307200,
		21: 409600,
		22: 614400,
		23: 819200,
		24: 1228800,
		25: 1638400,
		26: 2457600,
		27: 3276800,
		28: 4915200,
		29: 6553600,
		30: 9830400
		};
		
	return table[cr];
};

/**
 * getSizeMod
 * implements table 8-1 in Core Rulebook
 */
exports.getSizeMod = function(size){

	var sizeTable = {
		'Fine': 		8,
		'Diminutive': 	4,
		'Tiny': 		2,
		'Small': 		1,
		'Medium': 		0,
		'Large': 		-1,
		'Huge': 		-2,
		'Gargantuan':	-4,
		'Colossal': 	-8
	};
	
	return sizeTable[size];
};

/**
 * compareSize
 * Takes two strings representing size names and compares their meaning.
 * Return value is:
 * - positive if first size is bigger than second size,
 * - negative if it is smaller,
 * - zero if they are the same
 */
exports.compareSize = function(thisSize, otherSize){

	var orderedSize = {
			'Fine' : 		0,
			'Diminutive': 	1,
			'Tiny': 		2,
			'Small': 		3,
			'Medium': 		4,
			'Large': 		5,
			'Huge': 		6,
			'Gargantuan': 	7,
			'Colossal': 	8
		};
	
	return orderedSize[thisSize] - orderedSize[otherSize];
};

/**
 * getHitDie
 * implements table 1-4 in Bestiary, Appendix 1 Monster Creation
 */
exports.getHitDie = function(type){

	var hitDieTable = {
		'aberration': 			8,
		'animal': 				8,
		'construct': 			10,
		'dragon': 				12,
		'fey': 					6,
		'humanoid': 			8,
		'magical beast': 		10,
		'monstrous humanoid': 	10,
		'ooze': 				8,
		'outsider': 			10,
		'plant': 				8,
		'undead': 				8,
		'vermin': 				8
	};
	
	return hitDieTable[type];
};

/**
 * getConstructHPBonus
 * Implements table from Construct description in Bestiary
 */
exports.getConstructHPBonus = function(size){

	var bonusTable = {
			'Fine':			0,
			'Diminutive':	0,
			'Tiny':			0,
			'Small':		10,
			'Medium':		20,
			'Large':		30,
			'Huge':			40,
			'Gargantuan':	60,
			'Colossal':		80
	};
	
	return bonusTable[size];
};

/**
 * getHitDieBABFactor
 * parameter HD is a number like everywhere else, e.g. 6 for a d6
 * returns the factor used for BAB calculation
 * Deduced from table 1-4 in Bestiary, corresponds to slow, medium and fast BAB
 */
exports.getHitDieBABFactor = function(hd) {

	var hitDieBABFactor = {
			6: 0.5,
			8: 0.75,
			10: 1,
			12: 1
		};
	
	return hitDieBABFactor[hd];
};

/**
 * getAbilityForSkill
 * returns name of ability linked with skill
 */
exports.getAbilityForSkill = function(skill) {

	var skills = {
		'Acrobatics':					'Dex',
		'Appraise':						'Int',
		'Bluff':						'Cha',
		'Climb':						'Str',
		'Craft':						'Int',
		'Diplomacy':					'Cha',
		'Disable Device':				'Dex',
		'Disguise':						'Cha',
		'Escape Artist':				'Dex',
		'Fly':							'Dex',
		'Handle Animal':				'Cha',
		'Heal':							'Wis',
		'Intimidate':					'Cha',
		'Knowledge (arcana)':			'Int',
		'Knowledge (dungeoneering)':	'Int',
		'Knowledge (engineering)':		'Int',
		'Knowledge (geography)':		'Int',
		'Knowledge (history)':			'Int',
		'Knowledge (local)':			'Int',
		'Knowledge (nature)':			'Int',
		'Knowledge (nobility)':			'Int',
		'Knowledge (planes)':			'Int',
		'Knowledge (religion)':			'Int',
		'Linguistics':					'Int',
		'Perception':					'Wis',
		'Perform':						'Cha',
		'Profession':					'Wis',
		'Ride':							'Dex',
		'Sense Motive':					'Wis',
		'Sleight of Hand':				'Dex',
		'Spellcraft':					'Int',
		'Stealth':						'Dex',
		'Survival':						'Wis',
		'Swim':							'Str',
		'Use Magic Device':				'Cha'
	};
	
	return skills[skill];
};