"use strict"
var MONSTER = {};

// constructor
MONSTER.Monster = function(properties){

	if (!(this instanceof MONSTER.Monster)) {
		return new MONSTER.Monster();
	}
	
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
	
	this.setPropertyCalculation("Fort", this.aggregation);
	this.addCalculationComponent("Fort", this.getBaseFortBonus);
	this.addCalculationComponent("Fort", this.getLifeForceMod);
	// TO DO: only do this if the monster has the feat
	// Alternatively the function could test it
//	this.addCalculationComponent("Fort", this.featGreatFortitudeBonus);

	this.setPropertyCalculation("Ref", this.aggregation);
	this.addCalculationComponent("Ref", this.getBaseRefBonus);
	this.addCalculationComponent("Ref", this.getDexMod);

	this.setPropertyCalculation("Will", this.aggregation);
	this.addCalculationComponent("Will", this.getBaseWillBonus);
	this.addCalculationComponent("Will", this.getWisMod);

}

MONSTER.Monster.prototype.getAC = function() {
	return 10 + this.Dex.getModifier();
}
	
MONSTER.Monster.prototype.getCR = function() {
	return this.CR;
};
MONSTER.Monster.prototype.setCR = function(newCR) {
	this.CR = newCR;
};
MONSTER.Monster.prototype.addToCR = function(increment) {
	// sanitise input
	if (typeof increment !== "number") {
		console.log("addCR: Not a number: " + increment);
		return;
	}
	increment = floor(increment);
	
	var cr = getCR();
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

MONSTER.Monster.prototype.getXP = function() {
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
		10: 9600
		};
	var cr = this.getCR();
	return table[cr];
};

// from table 8-1 in Core Rulebook
MONSTER.Monster.prototype.getSizeMod = function(){
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

MONSTER.Monster.prototype.getSizeId = function(sizeName){
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

// return value is positive if the monster size is bigger than the parameter,
// negative if it is smaller and zero if they are the same
MONSTER.Monster.prototype.compareSize = function(otherSize){
	return this.getSizeId(this.size) - this.getSizeId(otherSize);
};

// from table 1-4 in Bestiary, Appendix 1 Monster Creation
MONSTER.Monster.prototype.getHitDie = function(){
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

MONSTER.Monster.prototype.getAvgHitDie = function(){
	return (this.getHitDie() + 1) / 2;
};

MONSTER.Monster.prototype.getHPBonus = function(){
	return this.racialHD * this.getConMod();
};

MONSTER.Monster.prototype.getHP = function(){
	return Math.floor(this.racialHD * this.getAvgHitDie()) + this.getHPBonus();
};

MONSTER.Monster.prototype.getHPFormula = function(){
	return "" + this.racialHD + "d" + this.getHitDie() + "+" + this.getHPBonus();
};

MONSTER.Monster.prototype.getInit = function(){
	return this.getDexMod();
};

// setting up a calculation
// the monster builder does this
// setPropertyCalculation("Fort", aggregation);
// addCalculationComponent("Fort", getBaseSaveBonus);
// addCalculationComponent("Fort", getLifeForceMod);
// addCalculationComponent("Fort", featGreatFortitude);
// effecting a calculation
// calculateProperty("Fort");

// could define a calculation object instead and pass it to this function
//function Calculation(aggregationFunction, optionalArgs) {
//	this.func = aggregationFunction;
//	this.components = optionalArgs;
//}
//

MONSTER.Monster.prototype.setPropertyCalculation = function(property, 
		aggregationFunction, optionalArgs, optionalFactor){
		
	optionalArgs = (typeof optionalArgs === 'undefined') ? [] : optionalArgs;
	optionalFactor = (typeof optionalFactor === 'undefined') ? 1 : optionalFactor;
	
	this[property] = { 
		func: aggregationFunction, 
		components: optionalArgs,
		factor: optionalFactor
		};
};

MONSTER.Monster.prototype.addCalculationComponent = function(property, componentFunc){
	this[property].components.push(componentFunc);
};

MONSTER.Monster.prototype.aggregation = function(components, factor){
	var i 		= 0,
		result 	= 0,
		max;
	
	for (max = components.length; i < max; i += 1) {
		result += (components[i].apply(this));
	}
	
	return result *= factor;
};


MONSTER.Monster.prototype.calculateProperty = function(property){
	
	if (!this.hasOwnProperty(property)) {
		return undefined;
	}
	
	return this[property].func.apply(this, [this[property].components, this[property].factor]);
};

/*
MONSTER.Monster.prototype.calculateComponent = function(property, value) {
	
	if (!this.hasOwnProperty(property)) {
		return undefined;
	}
	
	// need an invert function for the property calculation
	// or be less abstract and know that we're doing a sum
	return ;

};
*/

MONSTER.Monster.prototype.getBaseFortBonus = function() {
	return this.baseFort;
//	return getBaseSaveBonus('Fort');
};

MONSTER.Monster.prototype.getBaseRefBonus = function() {
	return this.baseRef;
//	return getBaseSaveBonus('Ref');
};

MONSTER.Monster.prototype.getBaseWillBonus = function() {
	return this.baseWill;
//	return getBaseSaveBonus('Will');
};

// this will go in the import module
/*
MONSTER.Monster.prototype.getBaseSaveBonus = function(saveType) {
	var goodSaves = {
			'aberration':			['Will'],
			'animal':				['Fort', 'Ref'],
			'construct':			[],
			'dragon':				['Fort', 'Ref', 'Will'],
			'fey':					['Ref', 'Will'],
			'humanoid':				1
			'magical beast': 		['Fort', 'Ref'],
			'monstrous humanoid':	['Ref', 'Will'],
			'ooze':					[],
			'outsider':				2,
			'plant':				['Fort'],
			'undead':				['Will'],
			'vermin':				['Fort']
		},
		bonuses = [];
	
};
*/

MONSTER.Monster.prototype.getAbilityModifier = function(abilityScore) {
	if (abilityScore > 0) {
		return Math.floor((abilityScore - 10) / 2);
	}
}

MONSTER.Monster.prototype.getStrMod = function() {
	return this.getAbilityModifier(this.Str);	
};

MONSTER.Monster.prototype.getDexMod = function() {
	return this.getAbilityModifier(this.Dex);	
};

// For calculations, don't use this function as it doesn't work for all monsters
// (undeads use Charisma). Use getLifeForceMod instead.
MONSTER.Monster.prototype.getConMod = function() {
	return this.getAbilityModifier(this.Con);	
};

MONSTER.Monster.prototype.getIntMod = function() {
	return this.getAbilityModifier(this.Int);	
};

MONSTER.Monster.prototype.getWisMod = function() {
	return this.getAbilityModifier(this.Wis);	
};

MONSTER.Monster.prototype.getChaMod = function() {
	return this.getAbilityModifier(this.Cha);	
};

MONSTER.Monster.prototype.getLifeForceMod = function() {
	if (this.type === "undead") {
		return this.getChaMod();
	} else {
		return this.getConMod();
	}
};

MONSTER.Monster.prototype.featGreatFortitudeBonus = function() {
	return 2;
};

MONSTER.Monster.prototype.getBaseAttackBonus = function(){
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

MONSTER.Monster.prototype.getCMB = function(){
	var abilityMod;
	if (this.compareSize("Tiny") <= 0) {
		abilityMod = this.getDexMod();
	} else {
		abilityMod = this.getStrMod();
	}
	return this.getBaseAttackBonus() + abilityMod - this.getSizeMod();
};

// example of call:
// monster.addModifier("Init", ImprovedInitiative)
MONSTER.Monster.prototype.addModifier = function(property, modifierFunction){

};

//***********************************
// test
MONSTER.tiger = new MONSTER.Monster({
	name: 'Tiger',
	CR: 4,
	alignment: 'N',
	size: 'Large',
	type: 'animal',
	racialHD: 6,
	naturalArmor: 3,
	Str: 23,
	Dex: 15,
	Con: 17,
	Int: 2,
	Wis: 12,
	Cha: 6,
	baseFort: 5, // those should be deduced from type and HD
	baseRef: 5,
	baseWill: 2
});

MONSTER.Monster.prototype.displayMonster = function() {
	console.log('Name: ' + this.name);
	console.log('CR: ' + this.CR);
	console.log('XP: ' + this.getXP());
	console.log('Alignment: ' + this.alignment);
	console.log('Size: ' + this.size);
	console.log('Type: ' + this.type);
	console.log('Init: ' + this.getInit());
	console.log('Senses: ' + "not implemented");
	console.log("DEFENSE");
	console.log('AC: ' + "not implemented");
	console.log('touch: ' + "not implemented");
	console.log('flat-footed: ' + "not implemented");
	console.log('components: ' + "not implemented");
	console.log('hp: ' + this.getHP());
	console.log('hp formula: ' + this.getHPFormula());
	console.log('Fort: ' + this.calculateProperty("Fort"));
	console.log('Ref: ' + this.calculateProperty("Ref"));
	console.log('Will: ' + this.calculateProperty("Will"));
	console.log("OFFENSE");
	console.log("Speed: " + "not implemented");
	console.log("Melee: " + "not implemented");
	console.log("Space: " + "not implemented");
	console.log("Reach: " + "not implemented");
	console.log("Special Attacks: " + "not implemented");
	console.log("STATISTICS");
	console.log("Str: " + this.Str);
	console.log("Dex: " + this.Dex);
	console.log("Con: " + this.Con);
	console.log("Int: " + this.Int);
	console.log("Wis: " + this.Wis);
	console.log("Cha: " + this.Cha);
	console.log("Base Atk: " + this.getBaseAttackBonus());
	console.log("CMB: " + this.getCMB());
	console.log("CMD: " + "not implemented");
	console.log("Feats: " + "not implemented");
	console.log("Skills: " + "not implemented");
	console.log("Racial Modifiers: " + "not implemented");
	console.log("ECOLOGY");
	console.log("Environment: " + "not implemented");
	console.log("Organisation: " + "not implemented");
	console.log("Treasure: " + "not implemented");
}

MONSTER.tiger.displayMonster();