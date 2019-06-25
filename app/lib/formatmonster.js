'use strict';

var formatThousands = require('./format').formatThousands,
	formatModifier	= require('./format').formatModifier,
	ref = require('./reference');

exports.getMonsterProfile = getMonsterProfile;
exports.getType = getType;
exports.getSenses = getSenses;
exports.getPerception = getPerception;
exports.getACModifiers = getACModifiers;
exports.getOptionalDefense = getOptionalDefense;
exports.getSpaceReach = getSpaceReach;
exports.formatExtraReach = formatExtraReach;
exports.getSpecialAttacks = getSpecialAttacks;
exports.getSpecialAbilities = getSpecialAbilities;
exports.getCMB = getCMB;
exports.getCMD = getCMD;
exports.getSkills = getSkills;
exports.getRacialModifiers = getRacialModifiers;
exports.getFeats = getFeats;
exports.getSpeed = getSpeed;

/**
 * getMonsterProfile
 * extract the monster data for use by the template
 */
function getMonsterProfile(monster) {
	var sheet = {},
		weapon;
		
	sheet.name = monster.name;
	sheet.CR = monster.CR;
	sheet.XP = formatThousands(monster.getXP());
	sheet.alignment = monster.alignment;
	sheet.size = monster.size;
	sheet.type = getType(monster);
	sheet.init = formatModifier(monster.getInit());
	sheet.senses = getSenses(monster);
	sheet.perception = getPerception(monster);
	sheet.AC = monster.getAC();
	sheet.touchAC = monster.getTouchAC();
	sheet.flatFootedAC = monster.getFlatFootedAC();
	sheet.ACModifiers = getACModifiers(monster);
	sheet.hp = monster.getHP();
	sheet.hpFormula = monster.getHPFormula();
	sheet.fort = formatModifier(monster.getFortitude());
	sheet.ref = formatModifier(monster.getReflex());
	sheet.will = formatModifier(monster.getWill());
	sheet.optDefense = getOptionalDefense(monster);
	sheet.weaknesses = monster.weaknesses;
	sheet.speed = getSpeed(monster);
	sheet.spaceReach = getSpaceReach(monster);
	sheet.Str = monster.Str;
	sheet.Dex = monster.Dex;
	sheet.Con = monster.Con;
	sheet.Int = monster.Int;
	sheet.Wis = monster.Wis;
	sheet.Cha = monster.Cha;
	sheet.languages = monster.languages;
	sheet.SQ = monster.SQ;
	sheet.BAB = formatModifier(monster.getBaseAttackBonus());
	sheet.CMB = getCMB(monster);
	sheet.CMD = getCMD(monster);
	sheet.environment = monster.environment;
	sheet.organization = monster.organization;
	sheet.treasure = monster.treasure;
	
	sheet.melee = {};
	for (weapon in monster.melee) {
		sheet.melee[weapon] = monster.getMeleeWeaponFormula(weapon);
	}
	
	sheet.specialAttacks = getSpecialAttacks(monster);
	sheet.specialAbilities = getSpecialAbilities(monster);
	sheet.skills = getSkills(monster);
	sheet.racialMods = getRacialModifiers(monster);
	sheet.feats = getFeats(monster);
	
	return sheet;	
}

/**
 * getType
 * returns a formatable chunk for type
 */
function getType(monster) {
	return { text: monster.type, url: ref.getTypeUrl(monster.type) };
}

/*
 * getSenses
 * builds a descriptive string for each sense
 */
function getSenses(monster) {
	return monster.senses.map(function(sense){
		var s = sense.name;
		
		if (sense.hasOwnProperty('value')) {
		
			s += ' ' + sense.value;
		}
		
		if (sense.hasOwnProperty('unit')) {
		
			s += ' ' + sense.unit;
		}
		
		return s;
	});
}

/**
 * getPerception
 * returns an array of formatable chunks for perception
 */
function getPerception(monster) {
	var chunks = [];

	chunks.push({ text: 'Perception', url: ref.getSkillUrl('Perception') });
	chunks.push({ text: formatModifier(monster.getSkillBonus('Perception')) });
	return chunks;
}

/**
 * getACModifiers
 * builds the list of non-zero AC modifiers as an array of objects with 
 * properties name and value
 */
function getACModifiers(monster) {
	var ACModifiers = [],
		order = [
			'armor', 
			'deflection', 
			'Dex', 
			'dodge', 
			'insight', 
			'luck', 
			'natural', 
			'shield',
			'profane',
			'rage',
			'size',
			'sacred',
			'monk',
			'Wis'
			],
		mods,
		maxMod,
		i,
		key;
		
	mods = monster.getACModifiers();
	maxMod = order.length;
	
	for (i = 0; i < maxMod; i++) {
	
		key = order[i];
		
		if (mods.hasOwnProperty(key) && mods[key] !== 0) {
		
			ACModifiers.push({ name: key, value: formatModifier(mods[key]) });
		}
	}
	
	return ACModifiers;
}

/**
 * getOptionalDefense
 */
function getOptionalDefense(monster) {
	var result = [];
	
	if (!monster.optDefense) {
		return;
	}
	
	if (monster.optDefense.abilities) {
	
		result.push({name: 'Defensive Abilities', list: monster.optDefense.abilities});
	}
	
	if (monster.optDefense.DR) {
	
		result.push({name: 'DR', list: monster.optDefense.DR.map(item => {
			let text = `${item.value}/`;
			if (!item.negatedByAny){
				text += '—';
			} else {
				text += item.negatedByAny.reduce((acc, neg) => `${acc} or ${neg}`);
			}
			return text;
		})});
	}
	
	if (monster.optDefense.immune) {
	
		result.push({name: 'Immune', list: monster.optDefense.immune});
	}
	
	if (monster.optDefense.resist) {
	
		result.push({name: 'Resist', list: monster.optDefense.resist.map(item => {
			let text = `${item.name} ${item.value}`;
			if (item.comment){
				text += ` ${item.comment}`;
			}
			return text;
		})});
	}
	
	if (monster.optDefense.SR) {
		let text = `${monster.optDefense.SR.value}`;
		if (monster.optDefense.SR.comment){
			text += ` ${monster.optDefense.SR.comment}`;
		}
		result.push({name: 'SR', list: [text]});
	}
	
	return result;
}

/**
 * getSpaceReach
 */
function getSpaceReach(monster) {
	var result;
	
	// default space-reach not included in view
	if (!monster.extraReach && monster.space === 5 && monster.reach === 5) {
		return;
	}
	
	function getAllExtraReaches(reaches) {
		var extra = [], 
			len, i;
			
		if (!reaches)
			return;
			
		len = reaches.length;
		for (i = 0; i < len-1; i++){
			Array.prototype.push.apply(extra, formatExtraReach(reaches[i], ', '));
		}
		Array.prototype.push.apply(extra, formatExtraReach(reaches[len-1], ''));
		return extra;
	}
	
	result = {
			space: monster.space, 
			reach: monster.reach, 
			extraReach: getAllExtraReaches(monster.extraReach)
	};
	return result;
}

/**
 * formatExtraReach
 * reach: an object with properties distance and weapons
 * - distance: numeric (represents length of reach in feet)
 * - weapons: array of weapon names having that specific reach
 *
 * returns an array with 2 items, which are meant to be concatenated for display
 * - [0] length of reach
 * - [1] the text that follows
 * Separating them allows us to use different styling on the page.
 */
function formatExtraReach(reach, tailText) {
	var result = [],
		weapons = reach.weapons.length,
		text,
		i;
	
	result.push(reach.distance);
	
	text = ' ft.';
	
	if (weapons > 0){
	
		text += ' with ' + reach.weapons[0];
	}
	
	for (i = 1; i < weapons - 1; i++){
	
		text += ', ' + reach.weapons[i];
	}
	
	if (weapons > 1) {
	
		text += ' and ' + reach.weapons[weapons-1];
	}
	text += tailText;
	result.push(text);
	
	return result;
}

/**
 * getSpecialAttacks
 * transforms the special attack data into an array of text chuncks that can be
 * transformed into HTML by the handlebars template
 */
function getSpecialAttacks(monster) {
	var output = [], 
		maxAttacks, i, j, atk, chunk, maxChunks, atkChunks;
	
	if (!monster.specialAtk) {
		return;
	}
		
	maxAttacks = monster.specialAtk.length;
	for (i = 0; i < maxAttacks; i++) {
	
		atk = monster.specialAtk[i];
		chunk = {};
		atkChunks =[];
		
		chunk.text = atk.name;
		if (atk.url) {
			chunk.url = atk.url;
		}
		atkChunks.push(chunk);
		
		if (atk.details) {
			
			maxChunks = atk.details.length;
			
			if (maxChunks) {
				atkChunks.push({text: ' ('});
			}
			
			// calculate any chunks without text, output the others as is
			for (j = 0; j < maxChunks; j++) {
			
				chunk = atk.details[j];
				
				if (chunk.text) {
				
						atkChunks.push(chunk);
				}
				else if (chunk.calc) {
				
					if (chunk.calc === 'damage') {

						atkChunks.push({ text: getDamageFormula(chunk.nbDice, chunk.dieType, 
								monster.getDamageBonus(chunk.strengthFactor)) });
					}
					else if (chunk.calc === 'DC') {
					
						atkChunks.push({ text: '' + monster.getDC(chunk.baseStat) });
					}
					// add other calculations here
				}
			}
			
			if (maxChunks) {
				atkChunks.push({text: ')'});
			}
		}
		
		output.push(atkChunks);
	}
	
	return output;
}

/**
 * getDamageFormula
 * A general function for generating a damage formula such as 2d6+4
 * that doesn't care where the data comes from.
 */
function getDamageFormula(nbDice, dieType, damageBonus) {
	var formula = '';
	
	// damage dice
	formula += nbDice + 'd' + dieType;
	
	// damage bonus
	if (damageBonus) {
		formula += formatModifier(damageBonus);
	}
	return formula;
}

/**
 * getSpecialAbilities
 */
function getSpecialAbilities(monster) {
	var result;
	
	if (!monster.specialAbilities) {
		return;
	}

	function formatSpecialAbilityChunk(chunk){
		if (chunk.calc) {
			
			if (chunk.calc === 'DC') {
			
				return { text: `${monster.getDC(chunk.baseStat)}` };
			}
			// deal with other calculations here
		}
		return chunk;		
	}
	
	result = monster.specialAbilities.map(function(ability){
		let abilityObj = {};
		let chunksArray = [];
		chunksArray.push({ text: ability.title, titleLevel: 1 });
		
		Array.prototype.push.apply(chunksArray, ability.description.map(formatSpecialAbilityChunk));
		
		abilityObj.main = chunksArray;
		
		if (ability.extra){
			
			abilityObj.extra = ability.extra.map(item => {
				let content = [];
				
				if (item.title){
					content = content.concat({ text: item.title, titleLevel: 2 });
				}
				
				if (item.type === 'paragraph'){
					content = content.concat(item.content.map(formatSpecialAbilityChunk));
				
				} else if (item.type === 'list'){
					content = content.concat(item.content.map(chunkArray => chunkArray.map(formatSpecialAbilityChunk)));
				} else if (item.type === 'table'){
					content = content.concat(item.content.map(colArray => colArray.map(chunkArray => chunkArray.map(formatSpecialAbilityChunk))));
					return {type: item.type, hasHeaderRow: item.hasHeaderRow, hasHeaderCol: item.hasHeaderCol, content: content};
				}

				return {type: item.type, content: content};
			});
		}
		return abilityObj;
	});
	
	return result;
}

/**
 * getCMB
 * returns a string describing the CMB and any maneuver-specific variations
 */
function getCMB(monster) {
	var extra = '', cmb, result, special;
	
	cmb = monster.getCMB();
	result = formatModifier(cmb);
	
	special = monster.getSpecialCMBList();
	
	if (special.length > 0) {
	
		special = special.map(function(curr){
			return formatModifier(monster.getCMB(curr)) + ' ' + curr;
		});
		extra = special.reduce(function(prev, curr){
			return prev + ', ' + curr;
		});
		
		if (extra) {
		
			extra = ' (' + extra + ')';
		}
	}

	return result + extra;
}

/**
 * getCMD
 * returns a string describing the CMD and any maneuver-specific variations
 */
function getCMD(monster) {
	let extra = '', result, special;

	result = '' + monster.getCMD();
	special = monster.getSpecialCMDList();
	
	if (special.length > 0) {
	
		special = special.map(function(curr){
			var cantbe = 'can\'t be ',
				irreg = { trip: 'tripped', overrun: 'overrun', grapple: 'grappled' },
				cmd,
				participle; 
			
			cmd = monster.getCMD(curr);
			
			// immune to maneuver
			if (cmd === Number.POSITIVE_INFINITY) {
			
				if (irreg[curr]) {
					participle = irreg[curr];
				}
				else {
					participle = curr + 'ed';
				}
				
				return cantbe + participle;
			}
			
			// normal case
			return cmd + ' vs. ' + curr;
		});
		
		extra = special.reduce(function(prev, curr){
			return prev + ', ' + curr;
		});
		
		if (extra) {
		
			extra = ' (' + extra + ')';
		}
	}
	return result + extra;
 }
 
/*
 * getSkills
 */
function getSkills(monster) {
	var result,
		skills;
	
	skills = monster.getSkillsList();
	if (skills.length === 0) {
		return;	
	}
	
	// format
	result = skills.map(function(curr) {
		var chunks = [];
		chunks.push({ text: curr.name, url: ref.getSkillUrl(curr.name) });
		if (curr.specialty){
			chunks.push({ text: `(${curr.specialty})` });
		}
		chunks.push({ text: formatModifier(monster.getSkillBonus(curr.name, curr.specialty)) });
		return chunks;
	});
	
	return result;
}

/*
 * getRacialModifiers
 */
function getRacialModifiers(monster) {
	var result = [],
		skills,
		chunks,
		i,
		skill,
		mod;
	
	skills = monster.getSkillsList();
	if (skills.length === 0) {
		return;	
	}

	for (i = 0; i < skills.length; i++) {
		skill = skills[i];
		mod = monster.getRacialModifier(skill.name, skill.specialty);
		if (mod) {
			chunks = [];
			chunks.push({ text: formatModifier(mod) });
			chunks.push({ text: skill.name, url: ref.getSkillUrl(skill.name) });
			if (skill.specialty) {
				chunks.push({ text: `(${skill.specialty})`});
			}
			result.push(chunks);
		}
	}
	
	if (result.length === 0) {
		return;
	}

	return result;
}

/*
 * getFeats
 */
function getFeats(monster) {
	const feats = monster.getFeatsList();
	if (feats.length === 0) {
		return;
	}

	return feats.map(feat => {
		let chunk = { text: feat.name };
		if (feat.url) {
			chunk.url = feat.url;
		}
		let formatted = { description: chunk };

		// add extra details here
		if (feat.details) {
			formatted.details = feat.details.map(detail => {
				let name;
				if (detail.specialty){
					name = `${detail.name} [${detail.specialty}]`;
				} else {
					name = detail.name;
				}
				chunk = { text: name };
				if (detail.url){
					chunk.url = detail.url;
				}
				return chunk;
			});
		}

		return formatted;
	});
}

/**
 * getSpeed
 */
function getSpeed(monster) {
	var result = [];
	
	if (!monster.speed)
		return;
		
	if (monster.hasSpeed('land')) {
		result.push({ text: monster.speed.land + ' ft.' });
	}
	
	var keys = Object.keys(monster.speed);
	keys.sort(function(a, b){
		var loa = a.toLowerCase(),
			lob = b.toLowerCase();
			
		if (loa < lob) {
			return -1;
		}
		
		if (loa > lob) {
			return 1;
		}
		
		return 0;
	});
	result = keys.reduce(function(prev, curr){
		if (curr === 'fly'){
			let speed;
			if (typeof monster.speed[curr] === 'number'){
				speed = monster.speed[curr];
			} else {
				speed = monster.speed[curr].value;
			}
			let text = `${curr} ${speed} ft.`;
			if (monster.speed[curr].maneuverability) {
				text += ` (${monster.speed[curr].maneuverability})`;
			}
			prev.push({ text });
		
		} else if (curr !== 'land') {
			prev.push({ text: curr + ' ' + monster.speed[curr] + ' ft.' });
		}
		
		return prev;
	}, result);
	
	return result;
}
