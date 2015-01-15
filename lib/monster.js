/* jshint node: true */
"use strict";

var Sum = require("./calculation");

module.exports = Monster;

/**
 * Monster constructor
 */
function Monster() {

	if (!(this instanceof Monster)) {
		return new Monster(arguments);
	}
	
	var properties = arguments[0] || {};
	
	this.name = properties.name || "Default";
	this.CR   =	properties.CR || 1;
	this.alignment = properties.alignment || "N";
	this.size =	properties.size || "Medium";
	this.type = properties.type || "magical beast";
	this.racialHD = properties.racialHD || 1;
	this.naturalArmor = properties.naturalArmor || 0;
	this.Str  = properties.Str || 10;
	this.Dex  = properties.Dex || 10;
	this.Con  = properties.Con || 10;
	this.Int  = properties.Int || 10;
	this.Wis  = properties.Wis || 10;
	this.Cha  = properties.Cha || 10;
	this.baseFort = properties.baseFort || 0;
	this.baseRef  = properties.baseRef || 0;
	this.baseWill = properties.baseWill || 0;
	
	this.Fort = new Sum(this);
	this.Fort.setComponent("baseFort", this.getBaseFortBonus);
	this.Fort.setComponent("lifeForceMod", this.getLifeForceMod);

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
 * getCR / setCR do we need those?
 */	
Monster.prototype.getCR = function() {
	return this.CR;
};

Monster.prototype.setCR = function(newCR) {
	this.CR = newCR;
};

/**
 * addToCR
 * not used right now - was probably written for simple templates
 * TO DO: look into it again when implementing templates
 */
Monster.prototype.addToCR = function(increment) {
	// sanitise input
	if (typeof increment !== "number") {
		console.log("addCR: Not a number: " + increment);
		return;
	}
	increment = Math.floor(increment);
	
	var cr = this.getCR();
	if (typeof cr === "number") {
		cr += increment;
	} else {
	// only CR smaller than 1 are strings
		if (increment > 0) {
			cr = increment;
		}
	}
	if (cr >= 1) {
		this.setCR(cr);
	} else {
		console.log("addCR: Can't set CR below 1");
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
Monster.prototype.getXP = function() {
	var table = {
		"1/8": 50,
		"1/6": 65,
		"1/4": 100,
		"1/3": 135,
		"1/2": 200,
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
	var cr = this.getCR();
	return table[cr];
};

/**
 * getSizeMod
 * implements table 8-1 in Core Rulebook
 */
Monster.prototype.getSizeMod = function(){
	var sizeTable = {
		"Fine": 		8,
		"Diminutive": 	4,
		"Tiny": 		2,
		"Small": 		1,
		"Medium": 		0,
		"Large": 		-1,
		"Huge": 		-2,
		"Gargantuan":	-4,
		"Colossal": 	-8
	};
	
	return sizeTable[this.size];
};

/**
 * getSizeId
 * Helper function for compareSize
 */
Monster.prototype.getSizeId = function(sizeName){
	var orderedSize = [
			"Fine",
			"Diminutive",
			"Tiny",
			"Small",
			"Medium",
			"Large",
			"Huge",
			"Gargantuan",
			"Colossal"
		],
		i = 0,
		len;
	
	for (len = orderedSize.length; i < len; i++) {
		if (sizeName === orderedSize[i]) {
			return i;
		}
	}
};

/**
 * compareSize
 * return value is:
 * - positive if the monster size is bigger than the parameter,
 * - negative if it is smaller,
 * - zero if they are the same
 */
Monster.prototype.compareSize = function(otherSize){
	return this.getSizeId(this.size) - this.getSizeId(otherSize);
};

/**
 * getHitDie
 * implements table 1-4 in Bestiary, Appendix 1 Monster Creation
 */
Monster.prototype.getHitDie = function(){
	var hitDieTable = {
		"aberration": 			8,
		"animal": 				8,
		"construct": 			10,
		"dragon": 				12,
		"fey": 					6,
		"humanoid": 			8,
		"magical beast": 		10,
		"monstrous humanoid": 	10,
		"ooze": 				8,
		"outsider": 			10,
		"plant": 				8,
		"undead": 				8,
		"vermin": 				8
	};
	return hitDieTable[this.type];
};

/**
 * getAvgHitDie
 */
Monster.prototype.getAvgHitDie = function(){
	return (this.getHitDie() + 1) / 2;
};

/**
 * getConstructHPBonus
 */
Monster.prototype.getConstructHPBonus = function(size){
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
 * getHPBonus
 */
Monster.prototype.getHPBonus = function(){
	if (this.type === 'construct') {
		return this.getConstructHPBonus(this.size);
	}
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
	var hitDieBABFactor = {
			"6": 0.5,
			"8": 0.75,
			"10": 1,
			"12": 1
		},
		factor;
	
	factor = hitDieBABFactor[String(this.getHitDie())];
	
	return Math.floor(this.racialHD * factor);
};

/**
 * getCMB
 */
Monster.prototype.getCMB = function(){
	var abilityMod;
	if (this.compareSize("Tiny") <= 0) {
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
