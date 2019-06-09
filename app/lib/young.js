"use strict";

/*
 * Young Template
 */

const ref = require('./reference');
const sizeLib = require('./sizechange');
const Monster = require('./monster');

exports.isCompatible = function(monster) {

	// incompatible with Fine size (can't make it smaller)
	if (monster.size === 'Fine') {
		return false;
	}

	var words = monster.name.split(/,?\s+/);
	var lastWord = words[words.length - 1];

	// incompatible with barghests (increase in power through feeding)
	if (lastWord === 'Barghest') {
		return false;
	}

	// incompatible with true dragons (increase in power through aging)
	// How can we know whether this is a true dragon?
	// For now, exclude if the last word in the name is Dragon.
	// This test might need to be refined.
	if (monster.type === 'dragon' && lastWord === 'Dragon') {
		return false;
	}

	// incompatible with creatures with the smallest CR (1/8): can't make it smaller
	if (monster.CR === ref.getCR(0)) {
		return false;
	}

	// might have to disable swarms as well, like Giant?
	// and creatures with a negative spaceOffset that would get the space 
	// beyond that of typical Fine (don't know how to calculate it)

	return true;
};

exports.apply = function(baseMonster){
	var weapon,
		dice,
		oldSize;

	if (baseMonster === null || !exports.isCompatible(baseMonster)){
		return null;
	}

	let monster = new Monster(baseMonster);
	
	// reduce CR by one step
	monster.CR = ref.getCR(ref.getCRId(monster.CR) - 1);

	// reduce Str by 4 (min 1)
	monster.Str = monster.Str ? Math.max(1, monster.Str - 4) : undefined;
	
	// reduce Con by 4 (min 1)
	monster.Con = monster.Con ? Math.max(1, monster.Con - 4) : undefined;
	
	// reduce natural armor by 2 (min 0)
	monster.naturalArmor = Math.max(0, monster.naturalArmor - 2);
	
	// increase Dex by 4
	monster.Dex = monster.Dex ? monster.Dex + 4 : undefined;

	// decrease attack dice by one step
	for (weapon in monster.melee) {
		// make sure we're not trying to decrease an attack that already makes no damage
		if (monster.melee[weapon].nbDice > 0) {
			dice = sizeLib.getNextDamageDiceDown(monster.size, monster.melee[weapon]);
			if (dice) {
				monster.melee[weapon].nbDice = dice.nbDice;
				monster.melee[weapon].dieType = dice.dieType;
			}
		}
	}
	for (weapon in monster.ranged) {
		// make sure we're not trying to decrease an attack that already makes no damage
		if (monster.ranged[weapon].nbDice > 0) {
			dice = sizeLib.getNextDamageDiceDown(monster.size, monster.ranged[weapon]);
			if (dice) {
				monster.ranged[weapon].nbDice = dice.nbDice;
				monster.ranged[weapon].dieType = dice.dieType;
			}			
		}
	}


	// reduce size by one category
	oldSize = monster.size;
	monster.size = ref.getNextSizeDown(monster.size);

	// adjust the resulting space
	monster.space = sizeLib.calculateSpace(monster.size, monster.spaceOffset);

	// adjust the resulting reach
	monster.reach = sizeLib.calculateReach(oldSize, monster.size, monster.reach, monster.shape);

	return monster;
};

exports.getErrorMessage = () => 'Cannot apply the Young template when the creature matches any of the following conditions: Barghest, Dragon, Fine size, 1/8 CR';
