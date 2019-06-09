'use strict';

var ref = require('./reference');

var SQUARE_SIZE = 5;	// a square on the board is 5 ft x 5 ft

var progression = [
	{nbDice: 1, dieType: 1},
	{nbDice: 1, dieType: 2},
	{nbDice: 1, dieType: 3},
	{nbDice: 1, dieType: 4},
	{nbDice: 1, dieType: 6},
	{nbDice: 1, dieType: 8},
	{nbDice: 1, dieType: 10},
	{nbDice: 2, dieType: 6},
	{nbDice: 2, dieType: 8},
	{nbDice: 3, dieType: 6},
	{nbDice: 3, dieType: 8},
	{nbDice: 4, dieType: 6},
	{nbDice: 4, dieType: 8},
	{nbDice: 6, dieType: 6},
	{nbDice: 6, dieType: 8},
	{nbDice: 8, dieType: 6},
	{nbDice: 8, dieType: 8},
	{nbDice: 12, dieType: 6},
	{nbDice: 12, dieType: 8},
	{nbDice: 16, dieType: 6}
];

var validParameters = function(size, dmgDice){

	var dieTypes = [1, 2, 3, 4, 6, 8, 10, 12];

	// check input
	if (size === undefined || dmgDice === undefined) {
		console.log('invalid parameter: undefined');
		return false;
	}

	// valid size?
	if (ref.getSizeIndex(size) === undefined) {
		console.log('invalid size');
		return false;
	}

	if (!(dmgDice.nbDice && dmgDice.dieType)) {
		console.log('invalid dice object');
		return false;
	}

	// check that the number of dice is within range
	if (dmgDice.nbDice > 16 || dmgDice.nbDice < 1) {
		console.log('invalid number of dice');
		return false;
	}

	if (dieTypes.indexOf(dmgDice.dieType) < 0) {
		console.log('invalid die type');
		return false;
	}

	return true;
};

var findDiceIndex = function(dmgDice) {
	var maxProg = progression.length,
		i;
	
	for (i = 0; i < maxProg; i++) {
		
		if (progression[i].nbDice === dmgDice.nbDice && progression[i].dieType === dmgDice.dieType) {
			return i;
		}
		if (progression[i].dieType === dmgDice.dieType && progression[i].nbDice > dmgDice.nbDice) {
			break;
		}
	}
	return -1;	// not found
};

var findStartingDice = function(dmgDice){
	var maxProg = progression.length,
		dieType,
		nbDice,
		dice,
		index,
		i;
	
	// non-standard number of d8: use the next number of d8 to use with d6
	// e.g. if looking for 5d8, use 6d6
	if (dmgDice.dieType === 8) {

		for (i = 0; i < maxProg; i++) {
			
			if (progression[i].dieType === dmgDice.dieType && progression[i].nbDice > dmgDice.nbDice) {					
				return i - 1; // return index of d6 with this number of dice, i.e. previous index
			}
		}
		console.log('d8 equivalent not found');
		return -1;
	}

	// non-standard number of d6: look for the next smaller number of d6s and use with d8
	// e.g. if looking for 10d6, use 8d8
	if (dmgDice.dieType === 6) {
		for (i = maxProg - 1; i >= 0; i--) {
			if (progression[i].dieType === dmgDice.dieType && progression[i].nbDice < dmgDice.nbDice) {
				return i + 1;	// d8 are right after d6
			}
		}
		console.log('d6 equivalent not found');
		return -1;
	}

	// more than one d4: use either d6 or d8 as equivalent
	if (dmgDice.dieType === 4) {
		if (dmgDice.nbDice % 3 === 0) {
			// use d6
			dieType = 6;
			nbDice = dmgDice.nbDice * dmgDice.dieType / dieType;
			return findDiceIndex({nbDice: nbDice, dieType: dieType});
		} else if (dmgDice.nbDice % 2 === 0) {
			// use d8
			dieType = 8;
			nbDice = dmgDice.nbDice * dmgDice.dieType / dieType;
			return findDiceIndex({nbDice: nbDice, dieType: dieType});
		} else {
			console.log('d4 error: not a multiple of 2 or 3: ' + dmgDice.nbDice + 'd' + dmgDice.dieType);
			return -1;
			// not really covered by the FAQ but we need to do something
			// use the average roll and take the closest equivalent that doesn't exceed it
			/*
			avg4 = 2.5;
			avg6 = 3.5;
			avg8 = 4.5;
			avgRoll = avg4 * dmgDice.nbDice;
			nbDice6 = avgRoll / avg6;
			nbDice8 = avgRoll / avg8;
			// unfinished
			*/
		}
	}

	// d12: replace each d12 by 2d6
	if (dmgDice.dieType === 12) {
		dice = {nbDice: dmgDice.nbDice * 2, dieType: 6};
		index = findDiceIndex(dice);
		if (index < 0) {
			index = findStartingDice(dice);
		}
		return index;
	}

	return -1;
};

/**
 * getNextDamageDiceUp
 * size: original size
 * dmgDice: original damage dice object
 * e.g. {nbDice: 2, dieType: 6} for 2d6
 * returns a damage dice object representing the damage when the monster size goes up a step
 * Specs come from the Paizo FAQ: http://paizo.com/paizo/faq/v5748nruor1fm#v5748eaic9t3f
 */
exports.getNextDamageDiceUp = function(size, dmgDice){

	if (!validParameters(size, dmgDice)) {
		return;
	}

	var diceIndex = findDiceIndex(dmgDice);

	if (dmgDice.dieType === 10 && diceIndex < 0) {
		// multiple d10: ignore size
		if (dmgDice.nbDice % 2 === 0) {
			// 2d10 increases to 4d8
			return {nbDice: dmgDice.nbDice * 2, dieType: 8};
		} else {
			// not covered by FAQ
			console.log('d10 error: not a multiple of 2: ' + dmgDice.nbDice + 'd' + dmgDice.dieType);
			return;
		}

	} else {
		if (diceIndex < 0) {
			diceIndex = findStartingDice(dmgDice);
		}
		if (diceIndex < 0) {
			console.log('Can\'t find starting dice for ' + dmgDice.nbDice + 'd' + dmgDice.dieType);
			return;
		}

		// adjust according to size and original damage
		if ((dmgDice.nbDice === 1 && dmgDice.dieType <= 6) || ref.compareSize(size, 'Small') <= 0) {
			// increase damage by one step
			if (diceIndex + 1 > progression.length) {
				console.log('Resulting damage dice index out of bounds for ' + dmgDice.nbDice + 'd' + dmgDice.dieType);
				return;
			}
			return progression[diceIndex + 1];

		} else {
			// increase damage by two steps
			if (diceIndex + 2 > progression.length) {
				console.log('Resulting damage dice index out of bounds for ' + dmgDice.nbDice + 'd' + dmgDice.dieType);
				return;
			}
			return progression[diceIndex + 2];
		}
	}
};

/**
 * getNextDamageDiceDown
 * size: original size
 * dmgDice: original damage dice object
 * e.g. {nbDice: 2, dieType: 6} for 2d6
 * returns a damage dice object representing the damage when the monster size goes down a step
 * Specs come from the Paizo FAQ: http://paizo.com/paizo/faq/v5748nruor1fm#v5748eaic9t3f
 */
exports.getNextDamageDiceDown = function(size, dmgDice){

	if (!validParameters(size, dmgDice)) {
		return;
	}

	var diceIndex = findDiceIndex(dmgDice);

	if (dmgDice.dieType === 10 && diceIndex < 0) {
		// multiple d10: ignore size
		if (dmgDice.nbDice % 2 === 0) {
			// 2d10 decreases to 2d8
			return {nbDice: dmgDice.nbDice, dieType: 8};
		} else {
			// not covered by FAQ
			console.log('d10 error: not a multiple of 2: ' + dmgDice.nbDice + 'd' + dmgDice.dieType);
			return;
		}

	} else {
		if (diceIndex < 0) {
			diceIndex = findStartingDice(dmgDice);
		}
		if (diceIndex < 0) {
			console.log('Can\'t find starting dice for ' + dmgDice.nbDice + 'd' + dmgDice.dieType);
			return;
		}

		// adjust according to size and original damage
		if ((dmgDice.nbDice === 1 && dmgDice.dieType <= 8) || ref.compareSize(size, 'Medium') <= 0) {
			// decrease damage by one step
			if (diceIndex - 1 < 0) {
				// the attack makes no damage except extra damage such as poison
				return { nbDice: 0, dieType: 1 };
			}
			return progression[diceIndex - 1];

		} else {
			// decrease damage by two steps
			if (diceIndex - 2 < 0) {
				console.log('Resulting damage dice index out of bounds for ' + dmgDice.nbDice + 'd' + dmgDice.dieType);
				return;
			}
			return progression[diceIndex - 2];
		}
	}
};

/**
 * calculateReach
 * Calculates the new reach for a size change
 * Input:
 * - oldSize: size before the change
 * - newSize: size after the change
 * - oldReach: reach before the change
 * - shape: tall/long
 * Output: value of the new reach
 * Note: It's assumed that a reach is a multiple of 5 ft as it's impossible to
 * manage combats with other values. There are some creatures in the bestiaries
 * that have a reach of 2-1/2 ft but it seems to be a mistake.
 */
exports.calculateReach = function(oldSize, newSize, oldReach, shape){
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
	
	// opposite special case: Small to Tiny - instead of making the new reach 0,
	// subtract the Small typical reach from the old reach if over 5ft
	} else if (newTypical === 0) {

		newReach = Math.max(0, oldReach - oldTypical);

	// calculate the atypicality factor for the old reach and apply it to the new typical
	} else {

		factor = oldReach / oldTypical;
		newReach = factor * newTypical;
	}

	// round down to nearest square 
	newReach = Math.floor(newReach / SQUARE_SIZE) * SQUARE_SIZE;

	return newReach;
};

/**
 * calculateSpace
 * utility function that combines the size of a monster and its space offset
 * to return the space occupied by the monster
 * Input:
 * - size: actual size of monster
 * - offset: size offset for space: 1 means it uses the space of the next size up,
 * whereas -1 means it uses the space of the next size down
 * Output: space (in feet)
 */
exports.calculateSpace = function(size, offset){
	var effectiveSize = size,
		index;

	if (offset) {
		index = ref.getSizeIndex(size);
		index += offset;
		effectiveSize = ref.getSizeName(index);
	}

	return ref.getSpace(effectiveSize);
};
