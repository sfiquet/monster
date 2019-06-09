'use strict';

// status value: 'neutral', 'invalid', 'handled'
// neutral: feat that has no effect on other stats
// handled: feat that affects other stats and is handled by the app
// invalid: feat that affects other stats and is NOT currently handled
var feats = {
	// feats from Core Rulebook (CRB)
	'Acrobatic': 					{ origin: 'CRB', status: 'invalid' },
	'Acrobatic Steps': 				{ origin: 'CRB', status: 'neutral' },
	'Agile Maneuvers': 				{ origin: 'CRB', status: 'invalid' },
	'Alertness': 					{ origin: 'CRB', status: 'invalid' },
	'Alignment Channel': 			{ origin: 'CRB', status: 'neutral', details: true },
	'Animal Affinity': 				{ origin: 'CRB', status: 'invalid' },
	'Arcane Armor Mastery': 		{ origin: 'CRB', status: 'neutral' },
	'Arcane Armor Training': 		{ origin: 'CRB', status: 'neutral' },
	'Arcane Strike': 				{ origin: 'CRB', status: 'neutral' },
	'Heavy Armor Proficiency': 		{ origin: 'CRB', status: 'invalid' },
	'Light Armor Proficiency': 		{ origin: 'CRB', status: 'invalid' },
	'Medium Armor Proficiency': 	{ origin: 'CRB', status: 'invalid' },
	'Athletic': 					{ origin: 'CRB', status: 'invalid' },
	'Augment Summoning': 			{ origin: 'CRB', status: 'neutral' },
	'Bleeding Critical': 			{ origin: 'CRB', status: 'neutral' },
	'Blind-Fight': 					{ origin: 'CRB', status: 'neutral' },
	'Blinding Critical': 			{ origin: 'CRB', status: 'neutral' },
	'Brew Potion': 					{ origin: 'CRB', status: 'neutral' },
	'Catch Off-Guard': 				{ origin: 'CRB', status: 'neutral' },
	'Channel Smite': 				{ origin: 'CRB', status: 'neutral' },
	'Cleave': 						{ origin: 'CRB', status: 'neutral' },
	'Combat Casting': 				{ origin: 'CRB', status: 'neutral' },
	'Combat Expertise': 			{ origin: 'CRB', status: 'neutral' },
	'Combat Reflexes': 				{ origin: 'CRB', status: 'neutral' },

	'Command Undead': 				{ origin: 'CRB', status: 'neutral' },
	'Craft Magic Arms and Armor': 	{ origin: 'CRB', status: 'neutral' },
	'Craft Rod': 					{ origin: 'CRB', status: 'neutral' },
	'Craft Staff': 					{ origin: 'CRB', status: 'neutral' },
	'Craft Wand': 					{ origin: 'CRB', status: 'neutral' },
	'Craft Wondrous Item': 			{ origin: 'CRB', status: 'neutral' },
	'Critical Focus': 				{ origin: 'CRB', status: 'neutral' },
	'Critical Mastery': 			{ origin: 'CRB', status: 'neutral' },
	'Dazzling Display': 			{ origin: 'CRB', status: 'neutral' },
	'Deadly Aim': 					{ origin: 'CRB', status: 'neutral' },
	'Deadly Stroke': 				{ origin: 'CRB', status: 'neutral' },
	'Deafening Critical': 			{ origin: 'CRB', status: 'neutral' },
	'Deceitful': 					{ origin: 'CRB', status: 'invalid' },
	'Defensive Combat Training': 	{ origin: 'CRB', status: 'invalid' },
	'Deflect Arrows': 				{ origin: 'CRB', status: 'neutral' },
	'Deft Hands': 					{ origin: 'CRB', status: 'invalid' },

	'Diehard': 						{ origin: 'CRB', status: 'neutral' },
	'Disruptive': 					{ origin: 'CRB', status: 'neutral' },
	'Dodge': 						{ origin: 'CRB', status: 'invalid' },
	'Double Slice': 				{ origin: 'CRB', status: 'invalid' },
	'Elemental Channel': 			{ origin: 'CRB', status: 'neutral', details: true },
	'Empower Spell': 				{ origin: 'CRB', status: 'neutral' },
	'Endurance': 					{ origin: 'CRB', status: 'neutral' },
	'Enlarge Spell': 				{ origin: 'CRB', status: 'neutral' },
	'Eschew Materials': 			{ origin: 'CRB', status: 'neutral' },
	'Exhausting Critical': 			{ origin: 'CRB', status: 'neutral' },
	'Exotic Weapon Proficiency': 	{ origin: 'CRB', status: 'invalid', details: true },
	'Extend Spell': 				{ origin: 'CRB', status: 'neutral' },
	'Extra Channel': 				{ origin: 'CRB', status: 'invalid' },

	'Extra Ki': 					{ origin: 'CRB', status: 'invalid' },
	'Extra Lay On Hands': 			{ origin: 'CRB', status: 'invalid' },
	'Extra Mercy': 					{ origin: 'CRB', status: 'invalid', details: true },
	'Extra Performance': 			{ origin: 'CRB', status: 'invalid' },
	'Extra Rage': 					{ origin: 'CRB', status: 'invalid' },
	'Far Shot': 					{ origin: 'CRB', status: 'neutral' },
	'Fleet': 						{ origin: 'CRB', status: 'invalid' },
	'Forge Ring': 					{ origin: 'CRB', status: 'neutral' },
	'Gorgon\'s Fist': 				{ origin: 'CRB', status: 'neutral' },
	'Great Cleave': 				{ origin: 'CRB', status: 'neutral' },
	'Great Fortitude': 				{ origin: 'CRB', status: 'invalid' },
	'Greater Bull Rush': 			{ origin: 'CRB', status: 'invalid' },
	'Greater Disarm': 				{ origin: 'CRB', status: 'invalid' },
	'Greater Feint': 				{ origin: 'CRB', status: 'neutral' },
	'Greater Grapple': 				{ origin: 'CRB', status: 'invalid' },
	'Greater Overrun': 				{ origin: 'CRB', status: 'invalid' },
	'Greater Penetrating Strike': 	{ origin: 'CRB', status: 'neutral' },
	'Greater Shield Focus': 		{ origin: 'CRB', status: 'invalid' },
	'Greater Spell Focus': 			{ origin: 'CRB', status: 'invalid', details: true },
	'Greater Spell Penetration': 	{ origin: 'CRB', status: 'neutral' },
	'Greater Sunder': 				{ origin: 'CRB', status: 'invalid' },

	'Greater Trip': 				{ origin: 'CRB', status: 'invalid' },
	'Greater Two-Weapon Fighting': 	{ origin: 'CRB', status: 'invalid' },
	'Greater Vital Strike': 		{ origin: 'CRB', status: 'neutral' },
	'Greater Weapon Focus': 		{ origin: 'CRB', status: 'invalid', details: true },
	'Greater Weapon Specialization':{ origin: 'CRB', status: 'invalid', details: true },
	'Heighten Spell': 				{ origin: 'CRB', status: 'neutral' },
	'Improved Bull Rush': 			{ origin: 'CRB', status: 'invalid' },
	'Improved Channel': 			{ origin: 'CRB', status: 'invalid' },
	'Improved Counterspell': 		{ origin: 'CRB', status: 'neutral' },
	'Improved Critical': 			{ origin: 'CRB', status: 'invalid', details: true },
	'Improved Disarm': 				{ origin: 'CRB', status: 'invalid' },
	'Improved Familiar': 			{ origin: 'CRB', status: 'neutral' },
	'Improved Feint': 				{ origin: 'CRB', status: 'neutral' },
	'Improved Grapple': 			{ origin: 'CRB', status: 'invalid' },
	'Improved Great Fortitude': 	{ origin: 'CRB', status: 'neutral' },
	'Improved Initiative': 			{ origin: 'CRB', status: 'invalid' },
	'Improved Iron Will': 			{ origin: 'CRB', status: 'neutral' },
	'Improved Lightning Reflexes': 	{ origin: 'CRB', status: 'neutral' },
	'Improved Overrun': 			{ origin: 'CRB', status: 'invalid' },

	'Improved Precise Shot': 		{ origin: 'CRB', status: 'neutral' },
	'Improved Shield Bash': 		{ origin: 'CRB', status: 'neutral' },
	'Improved Sunder': 				{ origin: 'CRB', status: 'invalid' },
	'Improved Trip': 				{ origin: 'CRB', status: 'invalid' },
	'Improved Two-Weapon Fighting': { origin: 'CRB', status: 'invalid' },
	'Improved Unarmed Strike': 		{ origin: 'CRB', status: 'neutral' },
	'Improved Vital Strike': 		{ origin: 'CRB', status: 'neutral' },
	'Improvised Weapon Mastery': 	{ origin: 'CRB', status: 'neutral' },
	'Intimidating Prowess': 		{ origin: 'CRB', status: 'invalid' },
	'Iron Will': 					{ origin: 'CRB', status: 'invalid' },
	'Leadership': 					{ origin: 'CRB', status: 'neutral' },

	'Lightning Reflexes': 			{ origin: 'CRB', status: 'invalid' },
	'Lightning Stance': 			{ origin: 'CRB', status: 'neutral' },
	'Lunge': 						{ origin: 'CRB', status: 'neutral' },
	'Magical Aptitude': 			{ origin: 'CRB', status: 'invalid' },
	'Manyshot': 					{ origin: 'CRB', status: 'neutral' },
	'Martial Weapon Proficiency': 	{ origin: 'CRB', status: 'invalid', details: true },
	'Master Craftsman': 			{ origin: 'CRB', status: 'invalid', details: true },
	'Maximize Spell': 				{ origin: 'CRB', status: 'neutral' },
	'Medusa\'s Wrath': 				{ origin: 'CRB', status: 'neutral' },
	'Mobility': 					{ origin: 'CRB', status: 'neutral' },
	'Mounted Archery': 				{ origin: 'CRB', status: 'neutral' },
	'Mounted Combat': 				{ origin: 'CRB', status: 'neutral' },
	'Natural Spell': 				{ origin: 'CRB', status: 'neutral' },
	'Nimble Moves': 				{ origin: 'CRB', status: 'neutral' },
	'Penetrating Strike': 			{ origin: 'CRB', status: 'neutral' },
	'Persuasive': 					{ origin: 'CRB', status: 'invalid' },
	'Pinpoint Targeting': 			{ origin: 'CRB', status: 'neutral' },
	'Point-Blank Shot': 			{ origin: 'CRB', status: 'neutral' },
	'Power Attack': 				{ origin: 'CRB', status: 'neutral' },
	'Precise Shot': 				{ origin: 'CRB', status: 'neutral' },
	'Quick Draw': 					{ origin: 'CRB', status: 'neutral' },

	'Quicken Spell': 				{ origin: 'CRB', status: 'neutral' },
	'Rapid Reload': 				{ origin: 'CRB', status: 'invalid', details: true },
	'Rapid Shot': 					{ origin: 'CRB', status: 'neutral' },
	'Ride-By Attack': 				{ origin: 'CRB', status: 'neutral' },
	'Run': 							{ origin: 'CRB', status: 'neutral' },
	'Scorpion Style': 				{ origin: 'CRB', status: 'neutral' },
	'Scribe Scroll': 				{ origin: 'CRB', status: 'neutral' },
	'Selective Channeling': 		{ origin: 'CRB', status: 'neutral' },
	'Self-Sufficient': 				{ origin: 'CRB', status: 'invalid' },
	'Shatter Defenses': 			{ origin: 'CRB', status: 'neutral' },
	'Shield Focus': 				{ origin: 'CRB', status: 'invalid' },
	'Shield Master': 				{ origin: 'CRB', status: 'invalid' },
	'Shield Proficiency': 			{ origin: 'CRB', status: 'invalid' },
	'Shield Slam': 					{ origin: 'CRB', status: 'neutral' },
	'Shot on the Run': 				{ origin: 'CRB', status: 'neutral' },
	'Sickening Critical': 			{ origin: 'CRB', status: 'neutral' },
	'Silent Spell': 				{ origin: 'CRB', status: 'neutral' },
	'Simple Weapon Proficiency': 	{ origin: 'CRB', status: 'invalid' },

	'Skill Focus': 					{ origin: 'CRB', status: 'handled', details: true },
	'Snatch Arrows': 				{ origin: 'CRB', status: 'neutral' },
	'Spell Focus': 					{ origin: 'CRB', status: 'invalid', details: true },
	'Spell Mastery': 				{ origin: 'CRB', status: 'neutral' },
	'Spell Penetration': 			{ origin: 'CRB', status: 'neutral' },
	'Spellbreaker': 				{ origin: 'CRB', status: 'neutral' },
	'Spirited Charge': 				{ origin: 'CRB', status: 'neutral' },
	'Spring Attack': 				{ origin: 'CRB', status: 'neutral' },
	'Staggering Critical': 			{ origin: 'CRB', status: 'neutral' },
	'Stand Still': 					{ origin: 'CRB', status: 'neutral' },
	'Stealthy': 					{ origin: 'CRB', status: 'invalid' },
	'Step Up': 						{ origin: 'CRB', status: 'neutral' },
	'Still Spell': 					{ origin: 'CRB', status: 'neutral' },
	'Strike Back': 					{ origin: 'CRB', status: 'neutral' },
	'Stunning Critical': 			{ origin: 'CRB', status: 'neutral' },
	'Stunning Fist': 				{ origin: 'CRB', status: 'neutral' },
	'Throw Anything': 				{ origin: 'CRB', status: 'neutral' },
	'Tiring Critical': 				{ origin: 'CRB', status: 'neutral' },
	'Toughness': 					{ origin: 'CRB', status: 'invalid' },
	'Tower Shield Proficiency': 	{ origin: 'CRB', status: 'invalid' },
	
	'Trample': 						{ origin: 'CRB', status: 'neutral' },
	'Turn Undead': 					{ origin: 'CRB', status: 'neutral' },
	'Two-Weapon Defense': 			{ origin: 'CRB', status: 'invalid' },
	'Two-Weapon Fighting': 			{ origin: 'CRB', status: 'invalid' },
	'Two-Weapon Rend': 				{ origin: 'CRB', status: 'neutral' },
	'Unseat': 						{ origin: 'CRB', status: 'neutral' },
	'Vital Strike': 				{ origin: 'CRB', status: 'neutral' },
	'Weapon Finesse': 				{ origin: 'CRB', status: 'invalid' },
	'Weapon Focus': 				{ origin: 'CRB', status: 'invalid', details: true },
	'Weapon Specialization': 		{ origin: 'CRB', status: 'invalid', details: true },
	'Whirlwind Attack': 			{ origin: 'CRB', status: 'neutral' },
	'Widen Spell': 					{ origin: 'CRB', status: 'neutral' },
	'Wind Stance': 					{ origin: 'CRB', status: 'neutral' }
};

function isFeat(feat) {

	return (feats[feat] !== undefined);
}

function hasDetails(feat) {

	if (!feats[feat]) {
		return;
	}
	
	if (!feats[feat].details) {
		return false;
	}

	return feats[feat].details;
}

function isHandled(feat) {

	if (!feats[feat]) {
		return false;
	}
	
	if (feats[feat].status === 'invalid') {
		return false;
	}

	return true;
}

function getStatus(feat) {

	if (!feats[feat]) {
		return;
	}

	return feats[feat].status;
}

exports.isFeat = isFeat;
exports.hasDetails = hasDetails;
exports.isHandled = isHandled;
exports.getStatus = getStatus;
