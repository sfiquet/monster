/* jshint node: true */
"use strict";

/*
 * Giant Template
 */

var ref = require('./reference');

var SQUARE_SIZE = 5;	// a square on the board is 5 ft x 5 ft

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
		dice = ref.getNextDamageDiceUp(monster.size, monster.melee[weapon]);
		if (dice) {
			monster.melee[weapon].nbDice = dice.nbDice;
			monster.melee[weapon].dieType = dice.dieType;
		}
	}
	for (weapon in monster.ranged) {
		dice = ref.getNextDamageDiceUp(monster.size, monster.ranged[weapon]);
		if (dice) {
			monster.ranged[weapon].nbDice = dice.nbDice;
			monster.ranged[weapon].dieType = dice.dieType;
		}
	}

	// increase size by one category
	oldSize = monster.size;
	monster.size = ref.getNextSizeUp(monster.size);

	// adjust the resulting space
	size = monster.size;
	if (monster.spaceOffset) {
		index = ref.getSizeIndex(monster.size);
		index += monster.spaceOffset;
		size = ref.getSizeName(index);
	}
	monster.space = ref.getSpace(size);

	// adjust the resulting reach
	monster.reach = calculateReach(oldSize, monster.size, monster.reach, monster.shape);
};

function calculateReach(oldSize, newSize, oldReach, shape){
	var newReach,
		oldTypical,
		newTypical,
		factor;

	oldTypical = ref.getReach(oldSize, shape);
	newTypical = ref.getReach(newSize, shape);

	// typical reach for the size: just get the typical reach for the new size
	if (oldReach === oldTypical) {

		newReach = newTypical;

	// the change of size wouldn't change the typical reach: don't change it either
	} else if (oldTypical === newTypical) {

		newReach = oldReach;

	// special case: Tiny to Small - can't calculate a proportion (divide by 0)
	// instead, add the old reach to the Small typical reach
	} else if (oldTypical === 0) {

		newReach = newTypical + oldReach;
	
	// calculate the atypicality factor for the old reach and apply it to the new typical
	} else {

		factor = oldReach / oldTypical;
		newReach = factor * newTypical;
	}

	// if bigger than a square, round down to nearest square 
	if (newReach > SQUARE_SIZE) {
		newReach = Math.floor(newReach / SQUARE_SIZE) * SQUARE_SIZE;
	}

	return newReach;
}