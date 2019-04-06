/* jshint node: true */
'use strict';

var OrderedSet = require('./orderedset');

var sizes = new OrderedSet([
	{ name: 'Fine', 		index: 0 },
	{ name: 'Diminutive', 	index: 1 },
	{ name: 'Tiny', 		index: 2 },
	{ name: 'Small', 		index: 3 },
	{ name: 'Medium', 		index: 4 },
	{ name: 'Large', 		index: 5 },
	{ name: 'Huge', 		index: 6 },
	{ name: 'Gargantuan', 	index: 7 },
	{ name: 'Colossal', 	index: 8 },
	]);

/**
 * getCRId
 * purpose: to increment/decrement CR in steps (especially for fractional values)
 */
exports.getCRId = function(cr) {
	var crId = {
		'1/8': 0,
		'1/6': 1,
		'1/4': 2,
		'1/3': 3,
		'1/2': 4
	};
	
	if (typeof cr === 'number' && cr > 0 && cr === Math.floor(cr)) {
		return cr + 4;
	} else {
		return crId[cr];
	}
};

/**
 * getCR
 * get a CR from its id - to be used with getCRId
 */
exports.getCR = function(id) {
	var crId = [
		'1/8',
		'1/6',
		'1/4',
		'1/3',
		'1/2'
	];
	
	if (typeof id !== 'number') {
		return;
	}
	
	if (id >= crId.length) {
		return id - crId.length + 1;
	} else if (id >= 0) {
		return crId[id];
	}
};

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
 * getStealthSizeMod
 * implements the size modifiers for Stealth skill
 */
exports.getStealthSizeMod = function(size){

	var sizeTable = {
		'Fine': 		16,
		'Diminutive': 	12,
		'Tiny': 		8,
		'Small': 		4,
		'Medium': 		0,
		'Large': 		-4,
		'Huge': 		-8,
		'Gargantuan':	-12,
		'Colossal': 	-16
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
 * getSizeIndex
 */
exports.getSizeIndex = function(size){
	var item = sizes.getItemByKey(size);
	if (!item) {
		return;
	}
	return item.index;
};

/**
 * getSizeName
 */
exports.getSizeName = function(index){
	var item = sizes.getItemByIndex(index);
	if (!item) {
		return;
	}
	return item.name;
};

/**
 * getNextSizeUp
 */
exports.getNextSizeUp = function(size){
	var index = exports.getSizeIndex(size);
	if (index === undefined) {
		return;
	}

	return exports.getSizeName(index + 1);
};

/**
 * getNextSizeDown
 */
exports.getNextSizeDown = function(size){
	var index = exports.getSizeIndex(size);
	if (index === undefined) {
		return;
	}
	
	return exports.getSizeName(index - 1);
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

/**
 * getSkillUrl
 */
exports.getSkillUrl = function(skill){

	var urls = {
		'Acrobatics':		'http://paizo.com/pathfinderRPG/prd/skills/acrobatics.html#acrobatics',
		'Appraise':			'http://paizo.com/pathfinderRPG/prd/skills/appraise.html#appraise',
		'Bluff':			'http://paizo.com/pathfinderRPG/prd/skills/bluff.html#bluff',
		'Climb':			'http://paizo.com/pathfinderRPG/prd/skills/climb.html#climb',
		'Craft':			'http://paizo.com/pathfinderRPG/prd/skills/craft.html#craft',
		'Diplomacy':		'http://paizo.com/pathfinderRPG/prd/skills/diplomacy.html#diplomacy',
		'Disable Device':	'http://paizo.com/pathfinderRPG/prd/skills/disableDevice.html#disable-device',
		'Disguise':			'http://paizo.com/pathfinderRPG/prd/skills/disguise.html#disguise',
		'Escape Artist':	'http://paizo.com/pathfinderRPG/prd/skills/escapeArtist.html#escape-artist',
		'Fly':				'http://paizo.com/pathfinderRPG/prd/skills/fly.html#fly',
		'Handle Animal':	'http://paizo.com/pathfinderRPG/prd/skills/handleAnimal.html#handle-animal',
		'Heal':				'http://paizo.com/pathfinderRPG/prd/skills/heal.html#heal',
		'Intimidate':		'http://paizo.com/pathfinderRPG/prd/skills/intimidate.html#intimidate',
		'Knowledge':		'http://paizo.com/pathfinderRPG/prd/skills/knowledge.html#knowledge',
		'Linguistics':		'http://paizo.com/pathfinderRPG/prd/skills/linguistics.html#linguistics',
		'Perception':		'http://paizo.com/pathfinderRPG/prd/skills/perception.html#perception',
		'Perform':			'http://paizo.com/pathfinderRPG/prd/skills/perform.html#perform',
		'Profession':		'http://paizo.com/pathfinderRPG/prd/skills/profession.html#profession',
		'Ride':				'http://paizo.com/pathfinderRPG/prd/skills/ride.html#ride',
		'Sense Motive':		'http://paizo.com/pathfinderRPG/prd/skills/senseMotive.html#sense-motive',
		'Sleight of Hand':	'http://paizo.com/pathfinderRPG/prd/skills/sleightOfHand.html#sleight-of-hand',
		'Spellcraft':		'http://paizo.com/pathfinderRPG/prd/skills/spellcraft.html#spellcraft',
		'Stealth':			'http://paizo.com/pathfinderRPG/prd/skills/stealth.html#stealth',
		'Survival':			'http://paizo.com/pathfinderRPG/prd/skills/survival.html#survival',
		'Swim':				'http://paizo.com/pathfinderRPG/prd/skills/swim.html#swim',
		'Use Magic Device':	'http://paizo.com/pathfinderRPG/prd/skills/useMagicDevice.html#use-magic-device'
	};
	
	return urls[skill];
	
};

/**
 * getTypeUrl
 */
exports.getTypeUrl = function(type){

	var urls = {
		'aberration': 			'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#aberration',
		'animal': 				'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#animal',
		'construct': 			'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#construct',
		'dragon': 				'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#dragon',
		'fey': 					'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#fey',
		'humanoid': 			'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#humanoid',
		'magical beast': 		'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#magical-beast',
		'monstrous humanoid': 	'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#monstrous-humanoid',
		'ooze': 				'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#ooze',
		'outsider': 			'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#outsider',
		'plant': 				'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#plant',
		'undead': 				'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#undead',
		'vermin': 				'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#vermin'
	};
	
	return urls[type];
};

/**
 * getSpace
 * returns the typical space for the given size
 */
exports.getSpace = function(size){
	var spaces = {
		'Fine': 		0.5,
		'Diminutive': 	1,
		'Tiny': 		2.5,
		'Small': 		5,
		'Medium': 		5,
		'Large': 		10,
		'Huge': 		15,
		'Gargantuan': 	20,
		'Colossal': 	30
	};

	return spaces[size];
};

/**
 * getReach
 * returns the typical reach for the given size and shape
 * shape is either 'tall' or 'long'
 */
exports.getReach = function(size, shape){
	var reaches = {
		'Fine': 		{long: 0, tall: 0},
		'Diminutive': 	{long: 0, tall: 0},
		'Tiny': 		{long: 0, tall: 0},
		'Small': 		{long: 5, tall: 5},
		'Medium': 		{long: 5, tall: 5},
		'Large': 		{long: 5, tall: 10},
		'Huge': 		{long: 10, tall: 15},
		'Gargantuan': 	{long: 15, tall: 20},
		'Colossal': 	{long: 20, tall: 30}
	};

	if (reaches[size] === undefined) {
		return;
	}

	if (shape === undefined && exports.compareSize(size, 'Large') < 0) {
		return reaches[size].long;
	}
	else {
		return reaches[size][shape];
	}
};

