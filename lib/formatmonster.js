/* jshint node: true */
'use strict';

var formatThousands = require('./format').formatThousands,
	formatModifier	= require('./format').formatModifier;

exports.getMonsterProfile = getMonsterProfile;
exports.getSenses = getSenses;
exports.getACModifiers = getACModifiers;
exports.getOptionalDefense = getOptionalDefense;
exports.getSpaceReach = getSpaceReach;
exports.formatExtraReach = formatExtraReach;

/**
 * getMonsterProfile
 * extract the monster data for use by the template
 */
function getMonsterProfile(monster) {
	var sheet = {},
		weapon;
		
	sheet.name = monster.name;
	sheet.CR = monster.CR;
	sheet.XP = formatThousands(monster.getXP());
	sheet.alignment = monster.alignment;
	sheet.size = monster.size;
	sheet.type = monster.type;
	sheet.init = formatModifier(monster.getInit());
	sheet.senses = getSenses(monster);
	sheet.perception = formatModifier(monster.getSkillBonus('Perception'));
	sheet.AC = monster.getAC();
	sheet.touchAC = monster.getTouchAC();
	sheet.flatFootedAC = monster.getFlatFootedAC();
	sheet.ACModifiers = getACModifiers(monster);
	sheet.hp = monster.getHP();
	sheet.hpFormula = monster.getHPFormula();
	sheet.fort = formatModifier(monster.getFortitude());
	sheet.ref = formatModifier(monster.getReflex());
	sheet.will = formatModifier(monster.getWill());
	sheet.optDefense = getOptionalDefense(monster);
	sheet.speed = monster.speed;
	sheet.spaceReach = getSpaceReach(monster);
	sheet.Str = monster.Str;
	sheet.Dex = monster.Dex;
	sheet.Con = monster.Con;
	sheet.Int = monster.Int;
	sheet.Wis = monster.Wis;
	sheet.Cha = monster.Cha;
	sheet.BAB = formatModifier(monster.getBaseAttackBonus());
	sheet.CMB = formatModifier(monster.getCMB());
	sheet.CMD = monster.getCMD();
	sheet.environment = monster.environment;
	sheet.organization = monster.organization;
	sheet.treasure = monster.treasure;
	
	sheet.melee = {};
	for (weapon in monster.melee) {
		sheet.melee[weapon] = monster.getMeleeWeaponFormula(weapon);
	}
	return sheet;	
}

/*
 * getSenses
 * builds a descriptive string for each sense
 */
function getSenses(monster) {
	return monster.senses.map(function(sense){
		var s = sense.name;
		
		if (sense.hasOwnProperty('value')) {
		
			s += ' ' + sense.value;
		}
		
		if (sense.hasOwnProperty('unit')) {
		
			s += ' ' + sense.unit;
		}
		
		return s;
	});
}

/**
 * getACModifiers
 * builds the list of non-zero AC modifiers as an array of objects with 
 * properties name and value
 */
function getACModifiers(monster) {
	var ACModifiers = [],
		order = [
			'armor', 
			'deflection', 
			'Dex', 
			'dodge', 
			'insight', 
			'luck', 
			'natural', 
			'shield',
			'profane',
			'rage',
			'size',
			'sacred',
			'monk',
			'Wis'
			],
		mods,
		maxMod,
		i,
		key;
		
	mods = monster.getACModifiers();
	maxMod = order.length;
	
	for (i = 0; i < maxMod; i++) {
	
		key = order[i];
		
		if (mods.hasOwnProperty(key) && mods[key] !== 0) {
		
			ACModifiers.push({ name: key, value: formatModifier(mods[key]) });
		}
	}
	
	return ACModifiers;
}

/**
 * getOptionalDefense
 */
function getOptionalDefense(monster) {
	var result = [];
	
	if (!monster.optDefense) {
		return;
	}
	
	if (monster.optDefense.abilities) {
	
		result.push({name: 'Defensive Abilities', list: monster.optDefense.abilities});
	}
	
	if (monster.optDefense.DR) {
	
		result.push({name: 'DR', list: monster.optDefense.DR});
	}
	
	if (monster.optDefense.immune) {
	
		result.push({name: 'Immune', list: monster.optDefense.immune});
	}
	
	if (monster.optDefense.resist) {
	
		result.push({name: 'Resist', list: monster.optDefense.resist});
	}
	
	if (monster.optDefense.SR) {
	
		result.push({name: 'SR', list: monster.optDefense.SR});
	}
	
	return result;
}

/**
 * getSpaceReach
 */
function getSpaceReach(monster) {
	var result;
	
	// default space-reach not included in view
	if (!monster.extraReach && monster.space === 5 && monster.reach === 5) {
		return;
	}
	
	function getAllExtraReaches(reaches) {
		var extra = [], 
			len, i, weapons, text;
			
		if (!reaches)
			return;
			
		len = reaches.length;
		for (i = 0; i < len-1; i++){
			Array.prototype.push.apply(extra, formatExtraReach(reaches[i], ', '));
		}
		Array.prototype.push.apply(extra, formatExtraReach(reaches[len-1], ''));
		return extra;
	}
	
	result = {
			space: monster.space, 
			reach: monster.reach, 
			extraReach: getAllExtraReaches(monster.extraReach)
	};
	return result;
}

/**
 * formatExtraReach
 * reach: an object with properties distance and weapons
 * - distance: numeric (represents length of reach in feet)
 * - weapons: array of weapon names having that specific reach
 *
 * returns an array with 2 items, which are meant to be concatenated for display
 * - [0] length of reach
 * - [1] the text that follows
 * Separating them allows us to use different styling on the page.
 */
function formatExtraReach(reach, tailText) {
	var result = [],
		weapons = reach.weapons.length,
		text,
		i;
	
	result.push(reach.distance);
	
	text = ' ft.';
	
	if (weapons > 0){
	
		text += ' with ' + reach.weapons[0];
	}
	
	for (i = 1; i < weapons - 1; i++){
	
		text += ', ' + reach.weapons[i];
	}
	
	if (weapons > 1) {
	
		text += ' and ' + reach.weapons[weapons-1];
	}
	text += tailText;
	result.push(text);
	
	return result;
}