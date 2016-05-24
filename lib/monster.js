/* jshint node: true */
'use strict';

var Sum = require('./calculation'),
	OrderedSet = require('./orderedset'),
	ref = require('./reference'),
	formatModifier = require('./format').formatModifier;

module.exports = Monster;

var CLASS_SKILL_BONUS = 3;

/**
 * Monster constructor
 */
function Monster() {

	if (!(this instanceof Monster)) {
		return new Monster(arguments);
	}
	
	var properties = arguments[0] || {};
	
	this.name = properties.name || 'Default';
	this.CR   =	properties.CR || 1;
	this.alignment = properties.alignment || 'N';
	this.size =	properties.size || 'Medium';
	this.type = properties.type || 'magical beast';
	this.senses = properties.senses || [];
	this.racialHD = properties.racialHD || 1;
	this.naturalArmor = properties.naturalArmor || 0;
	this.speed = properties.speed || { land: 30 };
	this.space = properties.space || 5;
	// a value of 0 is valid for reach
	this.reach = (properties.reach === undefined? 5: properties.reach);
	this.extraReach = properties.extraReach;
	this.shape = properties.shape || 'tall';
	// if the stats are undefined, leave them undefined
	this.Str  = properties.Str;
	this.Dex  = properties.Dex;
	this.Con  = properties.Con;
	this.Int  = properties.Int;
	this.Wis  = properties.Wis;
	this.Cha  = properties.Cha;
	this.baseFort = properties.baseFort || 0;
	this.baseRef  = properties.baseRef || 0;
	this.baseWill = properties.baseWill || 0;
	this.melee = properties.melee || {};
	this.environment = properties.environment;
	this.organization = properties.organization;
	this.treasure = properties.treasure;
	// this data is optional, leave undefined if not specified
	this.optDefense = properties.optDefense;
	this.weaknesses = properties.weaknesses;
	this.languages = properties.languages;
	this.SQ = properties.SQ;
	this.specialAtk = properties.specialAtk;
	this.feats = new OrderedSet(properties.feats);
	this.setSkills(properties.skills);
	this.specialAbilities = properties.specialAbilities;
	this.specialCMB = properties.specialCMB;
	this.specialCMD = properties.specialCMD;

	// spaceOffset represents the number of steps between the actual size of 
	// the creature and the typical size for its space:
	// e.g. Quickwood is Huge and should have a space of 15 ft but has an 
	// actual space of 5 ft, so its space is down 2 sizes. Its spaceOffset is -2.
	this.spaceOffset = properties.spaceOffset;
	
	this.Fort = new Sum(this);
	this.Fort.setComponent('baseFort', this.getBaseFortBonus);
	this.Fort.setComponent('lifeForceMod', this.getLifeForceMod);

	this.Ref = new Sum(this);
	this.Ref.setComponent('baseRef', this.getBaseRefBonus);
	this.Ref.setComponent('DexMod', this.getDexMod);

	this.Will = new Sum(this);
	this.Will.setComponent('baseWill', this.getBaseWillBonus);
	this.Will.setComponent('WisMod', this.getWisMod);
}

/**
 * setSkills
 * set up the skills-related data from the JSON representation
 */
Monster.prototype.setSkills = function(skillArray){
	var skillOrder = [];
	var skillSet = {};
	var i, key;

	if (skillArray === undefined) {
		this.skillOrder = [];
		this.skillSet = {};
		return;
	}

	if (!(skillArray instanceof Array)) {
		console.log('setSkills: parameter should be an array');
		console.log(skillArray);
		return;
	}
	for (i = 0; i < skillArray.length; i++) {
		if (!skillArray[i].hasOwnProperty('name')) {
			console.log('Wrong format array passed to setSkills: ');
			console.log(skillArray);
			return;	// wrong format
		}
		key = skillArray[i].name;
		skillOrder[i] = key;
		skillSet[key] = skillArray[i];
	}

	this.skillOrder = skillOrder;
	this.skillSet = skillSet;
};

/**
 * getAC
 * might need to use a Sum later
 */
Monster.prototype.getAC = function() {
//	return 10 + this.naturalArmor + this.getArmorDexMod() + this.getSizeMod() + this.getArmorBonus() + this.getShieldBonus();
	var mods = this.getACModifiers(),
		result = 10,
		key;
	
	for (key in mods) {
		if (mods.hasOwnProperty(key)) {
			result += mods[key];
		}
	}
	return result;
};

/**
 * getArmorDexMod
 * TO DO implement: limit Dex bonus to Max Dex Bonus from table 6-6 in Core Rulebook
 */
Monster.prototype.getArmorDexMod = function() {
	return this.getDexMod();
};

/**
 * getArmorDexBonus
 * return ArmorDexMod if positive or zero otherwise
 */
Monster.prototype.getArmorDexBonus = function() {
	var bonus = this.getArmorDexMod();
	return bonus > 0 ? bonus : 0;
};

/**
 * getTouchAC
 * might need to use a Sum later
 * Bracers of Armor protect against incorporeal touch attack. Not sure if it protects against
 * normal touch attacks. Look it up - although no monster in any of the 4 bestiaries seems to have that
 *
 * Touch AC removes armor, shield and natural armor. Everything else still applies.
 */
Monster.prototype.getTouchAC = function() {
//	return 10 + this.getArmorDexMod() + this.getSizeMod();
	var mods = this.getACModifiers(),
		result = 10,
		key;
	
	for (key in mods) {
		if (mods.hasOwnProperty(key)) {
			if (key !== 'armor' && key !== 'shield' && key !== 'natural') {
				result += mods[key];
			}
		}
	}
	return result;
};

/**
 * getFlatFootedAC
 * might need to use a Sum later
 * will need to cater for Uncanny Dodge later.
 *
 * Flat-footed AC removes Dex bonus (not penalty) and dodge.
 * Exception: when the monster has uncanny dodge (barbarians and rogues),
 * it cannot be flat-footed, so it keeps its normal AC.
 */
Monster.prototype.getFlatFootedAC = function() {
	// remove Dex bonus only, not penalty
	return this.getAC() - this.getArmorDexBonus();
};

/**
 * getACModifiers
 * returns all AC modifiers, in any order, including any equal to zero
 */
Monster.prototype.getACModifiers = function() {
	var result = {};
	
	// quick and dirty version
	result.Dex = this.getArmorDexMod();
	result.natural = this.naturalArmor;
	result.size = this.getSizeMod();
	result.armor = this.getArmorBonus();
	result.shield = this.getShieldBonus();

	return result;
};

/**
 * getArmorBonus
 * TO DO implement
 * + decide if enhancement bonuses (from magic objects) go in there or in separate function
 */
Monster.prototype.getArmorBonus = function() {
	return 0;
};
	
/**
 * getShieldBonus
 * TO DO implement
 */
Monster.prototype.getShieldBonus = function() {
	return 0;
};

/**
 * addToCR
 * not used right now - was probably written for simple templates
 * TO DO: look into it again when implementing templates
 */
Monster.prototype.addToCR = function(increment) {
	// sanitise input
	if (typeof increment !== 'number') {
		console.log('addCR: Not a number: ' + increment);
		return;
	}
	increment = Math.floor(increment);
	
	var cr = this.CR;
	if (typeof cr === 'number') {
		cr += increment;
	} else {
	// only CR smaller than 1 are strings
		if (increment > 0) {
			cr = increment;
		}
	}
	if (cr >= 1) {
		this.CR = cr;
	} else {
		console.log('addCR: Can\'t set CR below 1');
	}
};

/**
 * getXP
 */
Monster.prototype.getXP = function() {
	return ref.getXP(this.CR);
};

/**
 * getSizeMod
 */
Monster.prototype.getSizeMod = function(){
	return ref.getSizeMod(this.size);
};

/**
 * compareSize
 * return value is:
 * - positive if the monster size is bigger than the parameter,
 * - negative if it is smaller,
 * - zero if they are the same
 */
Monster.prototype.compareSize = function(otherSize){
	return ref.compareSize(this.size, otherSize);
};

/**
 * getHitDie
 */
Monster.prototype.getHitDie = function(){
	return ref.getHitDie(this.type);
};

/**
 * getAvgHitDie
 */
Monster.prototype.getAvgHitDie = function(){
	return (this.getHitDie() + 1) / 2;
};

/**
 * getHPBonus
 */
Monster.prototype.getHPBonus = function(){
	// constructs don't have Constitution
	// they get bonus HP based on size
	if (this.type === 'construct') {
		return ref.getConstructHPBonus(this.size);
	}
	
	// everybody else get bonus HP based on HD and life force
	// (Cha for undead, Con for others)
	return this.racialHD * this.getLifeForceMod();
};

/**
 * getHP
 */
Monster.prototype.getHP = function(){
	return Math.floor(this.racialHD * this.getAvgHitDie()) + this.getHPBonus();
};

/**
 * getHPFormula
 * returns a string representing the HP formula e.g. '3d8+12'
 */
Monster.prototype.getHPFormula = function(){
	var hpBonus = this.getHPBonus(),
		formula;

	formula = this.racialHD + 'd' + this.getHitDie();
	if (hpBonus !== 0){
		if (hpBonus > 0){
			formula = formula + '+';
		}
		formula = formula + hpBonus;
	}
	return formula;
};

/**
 * getInit
 */
Monster.prototype.getInit = function(){
	return this.getDexMod();
};

/**
 * getBaseFortBonus
 * necessary for calculation of Fortitude
 */
Monster.prototype.getBaseFortBonus = function() {
	return this.baseFort;
};

/**
 * getBaseRefBonus
 * necessary for calculation of Reflex
 */
Monster.prototype.getBaseRefBonus = function() {
	return this.baseRef;
};

/**
 * getBaseWillBonus
 * necessary for calculation of Will
 */
Monster.prototype.getBaseWillBonus = function() {
	return this.baseWill;
};

/**
 * getFortitude
 */
Monster.prototype.getFortitude = function() {
	return this.Fort.calculate();
};

/**
 * getReflex
 */
Monster.prototype.getReflex = function() {
	return this.Ref.calculate();
};

/**
 * getWill
 */
Monster.prototype.getWill = function() {
	return this.Will.calculate();
};

/**
 * getAbilityModifier
 * calculates a stat modifier
 * used for all ability stats
 */
Monster.prototype.getAbilityModifier = function(abilityScore) {
	if (abilityScore > 0) {
		return Math.floor((abilityScore - 10) / 2);
	}
};

/**
 * getStrMod
 */
Monster.prototype.getStrMod = function() {
	return this.getAbilityModifier(this.Str);	
};

/**
 * getDexMod
 */
Monster.prototype.getDexMod = function() {
	return this.getAbilityModifier(this.Dex);	
};

/**
 * getConMod
 * For calculations, don't use this function as it doesn't work for all monsters
 * (undeads use Charisma). Use getLifeForceMod instead.
 */
Monster.prototype.getConMod = function() {
	if (this.type === 'construct')
		return 0;
	return this.getAbilityModifier(this.Con);	
};

/**
 * getIntMod
 */
Monster.prototype.getIntMod = function() {
	return this.getAbilityModifier(this.Int);	
};

/**
 * getWisMod
 */
Monster.prototype.getWisMod = function() {
	return this.getAbilityModifier(this.Wis);	
};

/**
 * getChaMod
 */
Monster.prototype.getChaMod = function() {
	return this.getAbilityModifier(this.Cha);	
};

/**
 * getLifeForceMod
 * returns the Cha modifier for undead or the Con modifier for other types
 * The construct special case is dealt with in getConMod().
 */
Monster.prototype.getLifeForceMod = function() {
	if (this.type === 'undead') {
		return this.getChaMod();
	} else {
		return this.getConMod();
	}
};

/**
 * featGreatFortitudeBonus
 */
Monster.prototype.featGreatFortitudeBonus = function() {
	return 2;
};

/**
 * getBaseAttackBonus
 */
Monster.prototype.getBaseAttackBonus = function(){
	var factor;
	
	factor = ref.getHitDieBABFactor(this.getHitDie());
	return Math.floor(this.racialHD * factor);
};

/**
 * getNormalCMB
 */
Monster.prototype.getNormalCMB = function(){
	var abilityMod;
	if (this.compareSize('Tiny') <= 0) {
		abilityMod = this.getDexMod();
	} else {
		abilityMod = this.getStrMod();
	}
	return this.getBaseAttackBonus() + abilityMod - this.getSizeMod();
};

/**
 * getCMB
 */
Monster.prototype.getCMB = function(maneuverID) {
	var specialBonus = 0,
		cmb, 
		maneuver;
	
	cmb = this.getNormalCMB();
	
	if (! (maneuverID && this.specialCMB)) {
		return cmb;
	}

	// search for the maneuver object in the array
	maneuver = this.specialCMB.reduce(function(prev, curr){
		if (prev)
			return prev;
		if (curr.name === maneuverID) {
			return curr;
		}
	}, undefined);
	
	// not found or no components attribute: return default CMB
	if (! (maneuver && maneuver.components)) {
		return cmb;
	}
	
	// add all the bonuses together
	specialBonus = maneuver.components.reduce(function(prev, curr){
		return prev + curr.bonus;
	}, 0);
	
	return cmb + specialBonus;
};

/**
 * getListOfValues
 * returns list of values for a given attribute in an array of objects of 'this'
 * this[objArrayName] is an array of objects that all have attribute objAttribute
 */
Monster.prototype.getListOfValues = function(objArrayName, objAttribute){
	if (! (this[objArrayName] && Array.isArray(this[objArrayName])))
		return [];
	
	return this[objArrayName].map(function(curr){
		return curr[objAttribute];
	});
};

/**
 * getSpecialCMBList
 * returns list of names of maneuvers that have a special CMB
 */
Monster.prototype.getSpecialCMBList = function(){
	return this.getListOfValues('specialCMB', 'name');
};

/**
 * getSpecialCMDList
 * returns list of names of maneuvers that have a special CMD
 */
Monster.prototype.getSpecialCMDList = function(){
	return this.getListOfValues('specialCMD', 'name');
};

/**
 * getNormalCMD
 */
Monster.prototype.getNormalCMD = function() {
	return 10 + this.getBaseAttackBonus() + this.getStrMod() + this.getDexMod() - this.getSizeMod();
};

/**
 * getCMD
 */
Monster.prototype.getCMD = function(maneuverID) {
	return this.getCombatManeuver(this.getNormalCMD, 'specialCMD', maneuverID);
};

/**
 * getCombatManeuver
 * generic calculation for CMB and CMD
 */
Monster.prototype.getCombatManeuver = function(baseFunc, arrayName, maneuverID) {
	var specialBonus = 0,
		base, 
		maneuver;
	
	base = baseFunc.apply(this);
	
	if (! (maneuverID && this[arrayName])) {
		return base;
	}

	// search for the maneuver object in the array
	maneuver = this[arrayName].reduce(function(prev, curr){
		if (prev)
			return prev;
		if (curr.name === maneuverID) {
			return curr;
		}
	}, undefined);
	
	// not found: return default value
	if (!maneuver) {
		return base;
	}
	
	// currently for CMD only - there is no equivalent for CMB
	if (maneuver.cantFail) {
		return Number.POSITIVE_INFINITY;
	}
	
	// no components attribute: return default value
	if (!maneuver.components) {
		return base;
	}
	
	// add all the bonuses together
	specialBonus = maneuver.components.reduce(function(prev, curr){
		return prev + curr.bonus;
	}, 0);
	
	return base + specialBonus;
};

/**
 * getSkillBonus
 */
Monster.prototype.getSkillBonus = function(skill) {
	var ability, 
		mod,
		skillDetails;

	// start with ability modifier
	ability = ref.getAbilityForSkill(skill);
	mod = this.getAbilityModifier(this[ability]);

	// add trained skill bonuses
	if (this.skillSet && this.skillSet[skill]) {

		skillDetails = this.skillSet[skill];

		if (skillDetails.ranks) {

			mod += skillDetails.ranks;

			if (this.isClassSkill(skill)) {
				mod += CLASS_SKILL_BONUS;
			}
		}

		if (skillDetails.racial) {

			mod += skillDetails.racial;
		}
	}
	
	// add speed bonuses
	if (skill === 'Climb') {
		if (this.hasSpeed('climb')) {
			mod += 8;
		}
	} else if (skill === 'Swim') {
		if (this.hasSpeed('swim')) {
			mod += 8;
		}
	}

	// add Stealth size modifier
	if (skill === 'Stealth') {
		mod += ref.getStealthSizeMod(this.size);
	}

	// add bonuses from feats
	mod += this.getSkillBonusFromFeats(skill);
	
	return mod;
};

/**
 * getSkillBonusFromFeats
 * calculate additional bonuses to a specific skill originating from feats
 */
 Monster.prototype.getSkillBonusFromFeats = function(skill){
 	var mod = 0;
 	var i;

 	// Skill Focus
	var skillFocus = this.getFeat('Skill Focus');
	if (skillFocus && skillFocus.details) {
		for (i = 0; i < skillFocus.details.length; i++) {
			if (skillFocus.details[i].name === skill) {
				// there is a skill focus feat for this skill
				mod += 3;

				// additional bonus for at least 10 ranks in the skill
				if (this.skillSet && this.skillSet[skill] && this.skillSet[skill].ranks >= 10) {
					mod += 3;
				}

				break;
			}
		}
	}

	return mod;
};

/**
 * isClassSkill
 */
 Monster.prototype.isClassSkill = function(skill) {
	// treat all skills with ranks as class skills (+3)
	// unless the monster has class levels (not implemented yet)
 	return true;
 };

/**
 * hasSpeed
 * checks if the monster has a speed with the given name
 */
Monster.prototype.hasSpeed = function(name) {
	if (this.speed[name]) {
		return true;
	}
	return false;
};

/**
 * getSkillsList
 * returns an array containing the names of skills that have a bonus
 */
Monster.prototype.getSkillsList = function() {
	var result = [];
	var item;

	if (this.skillOrder instanceof Array) {
		this.skillOrder.forEach(function(item){
			result.push(item);
		});
	}
	
	if (this.hasSpeed('climb') && (!this.skillSet || !this.skillSet['Climb'])) {
		result.push('Climb');
	}
	if (this.hasSpeed('swim') && (!this.skillSet || !this.skillSet['Swim'])) {
		result.push('Swim');
	}
	
	return result;
};

/**
 * getRacialModifier
 */
Monster.prototype.getRacialModifier = function(skill){
	if (!this.skillSet) {
		return;
	}

	if (!this.skillSet[skill]) {
		return;
	}

	return this.skillSet[skill].racial;
};

/**
 * getFeatsList
 * returns an array containing the names of the monster's feats
 */
Monster.prototype.getFeatsList = function(){
	return this.feats.getKeys();
};

/**
 * getFeat
 * returns an object describing the given feat or undefined if not found
 */
Monster.prototype.getFeat = function(featName){
	return this.feats.getItemByKey(featName);
};

/**
 * getMeleeWeaponAttackBonus
 */
Monster.prototype.getMeleeWeaponAttackBonus = function(attack) {
	
	if (! this.melee[attack]) {
	
		console.log('Unknown attack weapon: ' + attack);
		return;
	}
	
	// for single natural weapon
	if (this.getNumberOfMeleeWeapons() === 1) {

		if (this.melee[attack].type === 'natural') {

			return this.getBaseAttackBonus() + this.getStrMod() + this.getSizeMod();
			
		} else {
		
			console.log('Single melee weapon not implemented yet');
		}
		
	} else {
	
		console.log('Multiple melee attacks not implemented yet');
	}
};

/**
 * getNumberOfMeleeWeapons
 */
Monster.prototype.getNumberOfMeleeWeapons = function() {
	var count = 0, 
		key;
	
	for (key in this.melee) {
		if (this.melee.hasOwnProperty(key) && typeof this.melee[key] !== 'function') {
			count += 1;
		}
	}
	return count;
};

/**
 * getDamageBonus
 * used for special attacks such as constrict as well as melee weapons
 */
Monster.prototype.getDamageBonus = function(strMult) {
	if (!strMult) {
		return 0;
	}
	var bonus = this.getStrMod() * strMult;
	// TO DO: add relevant bonuses: enhancement bonus, weapon specialisation bonus...
	return Math.floor(bonus);
};

/**
 * getMeleeWeaponDamageBonus
 */
Monster.prototype.getMeleeWeaponDamageBonus = function(attack) {
	return this.getDamageBonus(this.getDamageFactor(attack));
};

/**
 * getDamageFactor
 */
Monster.prototype.getDamageFactor = function(attack){
	// for single natural weapon
	if (this.getNumberOfMeleeWeapons() === 1) {

		if (this.melee[attack].type === 'natural') {

			if (this.melee[attack].nbAttacks === 1) {
			
				return 1.5;
				
			} else {
			
				return 1;
			}
			
		} else {
		
			console.log('Single melee weapon not implemented yet');
		}
		
	} else {
	
		console.log('Multiple melee attacks not implemented yet');
	}
	
};

/**
 * getMeleeWeaponFormula
 */
Monster.prototype.getMeleeWeaponFormula = function(attack){
	var formula = '',
		attackBonus,
		damageBonus,
		i;
	
	// number of attacks and name
	if (this.melee[attack].nbAttacks > 1) {
	
		formula += this.melee[attack].nbAttacks + ' ' + attack + 's ';

	} else {

		formula += attack + ' ';
	}
	
	// attack bonus
	attackBonus = this.getMeleeWeaponAttackBonus(attack);
	if (attackBonus !== 0) {
		formula += formatModifier(attackBonus) + ' ';
	}
	
	// damage dice
	formula += '(' + this.melee[attack].nbDice + 'd' + this.melee[attack].dieType;
	
	// damage bonus
	damageBonus = this.getMeleeWeaponDamageBonus(attack);
	if (damageBonus !== 0) {
		formula += formatModifier(damageBonus);
	}
	
	// extra damage
	if (this.melee[attack].extraDamage) {
		for (i =0; i < this.melee[attack].extraDamage.length; i++) {
			formula += ' plus ' + this.melee[attack].extraDamage[i];
		}
//		formula += ' ' + this.melee[attack].extraDamage;
	}
	
	// close damage parenthese
	formula += ')';
	
	return formula;
};

/**
 * getDC
 */
Monster.prototype.getDC = function(ability){
	var mod = this.getStatMod(ability);
	if (mod === undefined){
		return;
	}
	return Math.floor(10 + 0.5 * this.racialHD + mod);
};

/**
 * getStatMod
 * get the stat modifier for the stat passed as a parameter
 * Not suitable when you need to replace Con by Cha for undead, 
 * use getLifeForceMod instead.
 * This is for use when you already know which stat you need to use,
 * e.g. for save DCs.
 */
Monster.prototype.getStatMod = function getStatMod(ability) {
	switch(ability) {
		case 'Str':
			return this.getStrMod();
		case 'Dex':
			return this.getDexMod();
		case 'Con':
			return this.getConMod();
		case 'Int':
			return this.getIntMod();
		case 'Wis':
			return this.getWisMod();
		case 'Cha':
			return this.getChaMod();
		default:
			return undefined;
	}
};
