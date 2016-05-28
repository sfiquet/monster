/* jshint node: true */
"use strict";

/*
 * Giant Template
 */

var ref = require('./reference'),
	sizeLib = require('./sizechange');

exports.isCompatible = function(monster) {
	if (monster.size === 'Colossal') {
		return false;
	}
	// will probably need to disable swarms as well
	// and creatures with a positive spaceOffset that would get the space 
	// beyond that of typical Colossal (don't know how to calculate it)

	return true;
};

exports.apply = function(monster) {
	var weapon,
		dice,
		oldSize,
		size,
		index;

	// increase CR by step for fractions
	monster.CR = ref.getCR(ref.getCRId(monster.CR) + 1);
	
	monster.naturalArmor += 3;
	monster.Str = monster.Str ? monster.Str + 4 : undefined;
	monster.Con = monster.Con ? monster.Con + 4 : undefined;
	// -2 Dex but can't be smaller than 1
	monster.Dex = monster.Dex ? Math.max(1, monster.Dex - 2) : undefined;

	// increase attack dice by one step
	for (weapon in monster.melee) {
		dice = sizeLib.getNextDamageDiceUp(monster.size, monster.melee[weapon]);
		if (dice) {
			monster.melee[weapon].nbDice = dice.nbDice;
			monster.melee[weapon].dieType = dice.dieType;
		}
	}
	for (weapon in monster.ranged) {
		dice = sizeLib.getNextDamageDiceUp(monster.size, monster.ranged[weapon]);
		if (dice) {
			monster.ranged[weapon].nbDice = dice.nbDice;
			monster.ranged[weapon].dieType = dice.dieType;
		}
	}

	// increase size by one category
	oldSize = monster.size;
	monster.size = ref.getNextSizeUp(monster.size);

	// adjust the resulting space
	monster.space = sizeLib.calculateSpace(monster.size, monster.spaceOffset);

	// adjust the resulting reach
	monster.reach = sizeLib.calculateReach(oldSize, monster.size, monster.reach, monster.shape);
};
