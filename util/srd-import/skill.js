/* jshint node: true, esversion: 6 */
'use strict';

var skills = [
	'Acrobatics',
	'Appraise',
	'Bluff',
	'Climb',
	'Craft',
	'Diplomacy',
	'Disable Device',
	'Disguise',
	'Escape Artist',
	'Fly',
	'Handle Animal',
	'Heal',
	'Intimidate',
	'Knowledge',
	'Linguistics',
	'Perception',
	'Perform',
	'Profession',
	'Ride',
	'Sense Motive',
	'Sleight of Hand',
	'Spellcraft',
	'Stealth',
	'Survival',
	'Swim',
	'Use Magic Device'
];

var specialisedSkills = [
	'Craft',
	'Knowledge',
	'Perform',
	'Profession'
];

function isSkill(name){

	return (skills.indexOf(name) < 0 ? false: true);
}

function isSpecialisedSkill(name){

	return (specialisedSkills.indexOf(name) < 0 ? false: true);
}

function getAllSkills(){
	return skills.slice();
}

exports.isSkill = isSkill;
exports.isSpecialisedSkill = isSpecialisedSkill;
exports.getAllSkills = getAllSkills;
