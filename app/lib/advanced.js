/* jshint node: true */
"use strict";

const ref = require('./reference');
const Monster = require('./monster');

exports.isCompatible = function(/* monster */) {
	return true;
};

exports.apply = function(baseMonster) {

	if (baseMonster === null || !exports.isCompatible(baseMonster)){
		return null;
	}

	let monster = new Monster(baseMonster);

	// increase CR by step for fractions
	monster.CR = ref.getCR(ref.getCRId(monster.CR) + 1);
	
	monster.naturalArmor += 2;
	monster.Str = monster.Str ? monster.Str + 4 : undefined;
	monster.Dex = monster.Dex ? monster.Dex + 4 : undefined;
	monster.Con = monster.Con ? monster.Con + 4 : undefined;
	monster.Int = monster.Int && monster.Int > 2 ? monster.Int + 4 : monster.Int;
	monster.Wis = monster.Wis ? monster.Wis + 4 : undefined;
	monster.Cha = monster.Cha ? monster.Cha + 4 : undefined;

	return monster;
};

exports.getErrorMessage = () => '';