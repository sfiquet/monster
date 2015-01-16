/* jshint node: true */
'use strict';

var Sum = require('./calculation'),
	ref = require('./reference');

module.exports = Monster;

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
	this.racialHD = properties.racialHD || 1;
	this.naturalArmor = properties.naturalArmor || 0;
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
 * getAC
 * might need to use a Sum later
 */
Monster.prototype.getAC = function() {
	return 10 + this.naturalArmor + this.getArmorDexMod() + this.getSizeMod() + this.getArmorBonus() + this.getShieldBonus();
};

/**
 * getArmorDexMod
 * TO DO implement: limit Dex bonus to Max Dex Bonus from table 6-6 in Core Rulebook
 */
Monster.prototype.getArmorDexMod = function() {
	return this.getDexMod();
};

/**
 * getTouchAC
 * might need to use a Sum later
 * Bracers of Armor protect against incorporeal touch attack. Not sure if it protects against
 * normal touch attacks. Look it up - although no monster in any of the 4 bestiaries seems to have that
 */
Monster.prototype.getTouchAC = function() {
	return 10 + this.getArmorDexMod() + this.getSizeMod();
};

/**
 * getFlatFootedAC
 * might need to use a Sum later
 * will need to cater for Uncanny Dodge later.
 */
Monster.prototype.getFlatFootedAC = function() {
	return 10 + this.naturalArmor + this.getSizeMod() + this.getArmorBonus() + this.getShieldBonus();
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
 * getCMB
 */
Monster.prototype.getCMB = function(){
	var abilityMod;
	if (this.compareSize('Tiny') <= 0) {
		abilityMod = this.getDexMod();
	} else {
		abilityMod = this.getStrMod();
	}
	return this.getBaseAttackBonus() + abilityMod - this.getSizeMod();
};

/**
 * getCMD
 */
Monster.prototype.getCMD = function() {
	return 10 + this.getBaseAttackBonus() + this.getStrMod() + this.getDexMod() - this.getSizeMod();
};

/**
 * getSkillBonus
 */
Monster.prototype.getSkillBonus = function(skill) {
	var ability;
	ability = ref.getAbilityForSkill(skill);
	return this.getAbilityModifier(this[ability]);
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
 * getMeleeWeaponDamageBonus
 */
Monster.prototype.getMeleeWeaponDamageBonus = function(attack) {
	return this.getStrMod() * this.getDamageFactor(attack);
	// TO DO: add enhancement bonus, weapon specialisation bonus, sneak attack bonus...
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
