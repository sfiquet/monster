'use strict';

var message = require('./message');

var createMessage = message.createMessage;

var CLASS_SKILL_BONUS = 3;

function calculateSkills(mergedSkills, monsterObj){
	var errors = [],
		warnings = [],
		skills;

	if (!mergedSkills || !monsterObj) {
		console.log('undefined parameters');
		return;
	}

	// calculate remaining properties
	skills = mergedSkills.reduce(function(prev, item){
		var itemCopy, 
			calcResult,
			key,
			ranks;

		calcResult = calculateDiscrepancy(item.name, item.modifier, monsterObj.getSkillBonus(item.name, item.specialty));

		if (calcResult.errors.length) {
			Array.prototype.push.apply(errors, calcResult.errors);
		
		} else {
			// if no error has been raised, ranks is either zero or positive
			ranks = calcResult.data;

			if (ranks > 0 && monsterObj.isClassSkill(item.name, item.specialty)) {

				ranks -= CLASS_SKILL_BONUS;

				if (ranks < 0) {
					errors.push(createMessage('classSkillBonusDiscrepancy', item.name));
				}
			}

			// don't create an item if there is no data to store (racial modifier and/or ranks)
			if (ranks === 0 && Object.keys(item).length <= 2) {
				// using Object.keys(item).length allows this test to still work when 
				// other properties are added in the future
				// each item should have at least a name and a modifier

				warnings.push(createMessage('noSkillData', item.name));
				// no skill data: skip this one
				return prev;
			}

			if (ranks >= 0) {
				itemCopy = {};
				// copy everything but the 'modifier' property into the output object
				// then add 'ranks'
				for (key in item) {
					if (key !== 'modifier') {
						itemCopy[key] = item[key];
					}
				}
				// only add ranks if non-zero
				if (ranks !== 0) {
					itemCopy.ranks = ranks;
				}
				return prev.concat(itemCopy);				
			}
		}

		// didn't work, ignore this one
		return prev;
	}, []);

	if (errors.length) {
		skills = undefined;
	}
	return {name: 'skills', errors: errors, warnings: warnings, data: skills};
}

function calculateDiscrepancy(key, targetValue, actualValue){
	var errors = [],
		diff;

	diff = targetValue - actualValue;

	if (diff < 0) {
	
		errors.push(createMessage('negativeDiscrepancy', key, targetValue, actualValue));
		diff = undefined;
	}

	return {name: key, errors: errors, warnings: [], data: diff};
}

exports.calculateSkills = calculateSkills;
exports.calculateDiscrepancy = calculateDiscrepancy;