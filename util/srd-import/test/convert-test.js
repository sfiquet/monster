/* jshint node: true, esversion: 6 */
'use strict';

var expect = require('chai').expect,
	conv = require('../convert'),
	message = require('../message');

var createMessage = message.createMessage;

describe('Convert', function(){

	describe('checkRawMonster', function(){

		it('generates an error when the CR is over 30 (temporary)', function(){
			expect(conv.checkRawMonster({cr: 31})).to.deep.equal([{name: 'CR', errors: [createMessage('highCRNotHandled')]}]);
		});

		it('generates an error when the monster has class levels (temporary)', function(){
			expect(conv.checkRawMonster({class1: 'rogue'})).to.deep.equal([{name: 'Class1', errors: [createMessage('classLevelsNotHandled')]}]);
		});

		it('generates an error when the HD has extra HP (temporary)', function(){
			expect(conv.checkRawMonster({hd: '12d10 plus 12'})).to.deep.equal([{name: 'HD', errors: [createMessage('extraHPNotHandled')]}]);
			expect(conv.checkRawMonster({hd: '11d6+55 plus 15 false life'})).to.deep.equal([{name: 'HD', errors: [createMessage('extraHPNotHandled')]}]);
		});

		it('generates an error when there are extra Fortitude details (temporary)', function(){
			expect(conv.checkRawMonster({fort: '+8 (+10 vs. nonmagical disease)'})).to.deep.equal([{name: 'Fort', errors: [createMessage('extraFortitudeNotHandled')]}]);
		});

		it('generates an error when there are extra Reflex details (temporary)', function(){
			expect(conv.checkRawMonster({ref: '+5 (+1 vs. traps)'})).to.deep.equal([{name: 'Ref', errors: [createMessage('extraReflexNotHandled')]}]);
		});

		it('generates an error when there are extra Will details (temporary)', function(){
			expect(conv.checkRawMonster({will: '+2 (+1 vs. fear)'})).to.deep.equal([{name: 'Will', errors: [createMessage('extraWillNotHandled')]}]);
		});

		it('generates an error when the monster has data in Gear (temporary)', function(){
			expect(conv.checkRawMonster({gear: '+2 longsword, +2 full platemail, +2 heavy steel shield'})).to.deep.equal(
				[{name: 'Gear', errors: [createMessage('gearNotHandled')]}]);
		});

		it('generates an error when the monster has data in OtherGear (temporary)', function(){
			expect(conv.checkRawMonster({othergear: 'bracers of armor +6, mirror of life trapping, ring of evasion, ring of protection +5'})).to.deep.equal(
				[{name: 'Gear', errors: [createMessage('gearNotHandled')]}]);
		});

		it('generates an error when the treasure contains specific objects (temporary)', function(){
			expect(conv.checkRawMonster(
				{treasure: 'standard (sickle, masterwork composite longbow [Str +4] with 20 arrows, wooden armor, other treasure)'})).to.deep.equal(
				[{name: 'Treasure', errors: [createMessage('gearNotHandled')]}]);
		});

		it('generates an error when the monster has ranged attacks (temporary)', function(){
			expect(conv.checkRawMonster(
				{ranged: 'light crossbow +3 (1d8/19-20)'})).to.deep.equal(
				[{name: 'Ranged', errors: [createMessage('rangedNotHandled')]}]);
		});

		it('generates an error when the monster has alternate forms (temporary)', function(){
			expect(conv.checkRawMonster(
				{alternatenameform: 'Human Form'})).to.deep.equal(
				[{name: 'AlternateNameForm', errors: [createMessage('alternateFormsNotHandled')]}]);
		});

		it('generates an error when there is a fly speed (temporary)', function(){
			expect(conv.checkRawMonster(
				{speed: 'fly 60 ft. (poor)'})).to.deep.equal(
				[{name: 'Speed', errors: [createMessage('flyNotHandled')]}]);

			expect(conv.checkRawMonster(
				{speed: 'Fly 60 ft. (poor)'})).to.deep.equal(
				[{name: 'Speed', errors: [createMessage('flyNotHandled')]}]);

			expect(conv.checkRawMonster(
				{speed: '50 ft., fly 100 ft. (good)'})).to.deep.equal(
				[{name: 'Speed', errors: [createMessage('flyNotHandled')]}]);
		});

		it('generates an error when there is extra details for speeds (temporary)', function(){
			expect(conv.checkRawMonster(
				{speed: '30 ft. (20 ft. in armor)'})).to.deep.equal(
				[{name: 'Speed', errors: [createMessage('specialSpeedNotHandled')]}]);

			expect(conv.checkRawMonster(
				{speed: '20 ft., burrow (lava only) 30 ft.'})).to.deep.equal(
				[{name: 'Speed', errors: [createMessage('specialSpeedNotHandled')]}]);
		});
	});

	describe('extractType', function(){
		
		it('converts the type to lowercase', function(){
			expect(conv.extractType('Outsider')).to.deep.equal({name: 'type', errors: [], warnings: [], data: 'outsider'});
		});

		it('generates an error when the value is not a string', function(){
			expect(conv.extractType(null)).to.deep.equal({name: 'type', errors: [createMessage('invalidValue', null)], warnings: [], data: undefined});
			expect(conv.extractType(undefined)).to.deep.equal({name: 'type', errors: [createMessage('invalidValue', undefined)], warnings: [], data: undefined});
			expect(conv.extractType(0)).to.deep.equal({name: 'type', errors: [createMessage('invalidValue', 0)], warnings: [], data: undefined});
		});
	});

	describe('extractCR', function(){

		it('generates a fraction string for numeric values smaller than 1', function(){
			expect(conv.extractCR(0.125)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: '1/8'});
			expect(conv.extractCR(0.166)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: '1/6'});
			expect(conv.extractCR(0.25)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: '1/4'});
			expect(conv.extractCR(0.33)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: '1/3'});
			expect(conv.extractCR(0.5)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: '1/2'});
		});

		it('generates an error if the raw value is smaller than 1 and not an allowed fraction', function(){
			expect(conv.extractCR(0.7)).to.deep.equal({name: 'CR', errors: [createMessage('invalidValue', 0.7)], warnings: [], data: undefined});
		});

		it('generates the given value when the value is an integer >= 1', function(){
			expect(conv.extractCR(1)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: 1});
			expect(conv.extractCR(5)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: 5});
			expect(conv.extractCR(10)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: 10});
			expect(conv.extractCR(10.0)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: 10});
		});

		it('truncates a floating point numeric value and generates a warning', function(){
			expect(conv.extractCR(4.7)).to.deep.equal({name: 'CR', errors: [], warnings: [createMessage('originalValueConverted', 4.7, 4)], data: 4});
		});

		it('converts to an integer when the value is a string', function(){
			expect(conv.extractCR('5')).to.deep.equal({name: 'CR', errors: [], warnings: [], data: 5});
		});

		it('generates a warning when the value is a string but doesn\'t represent an integer', function(){
			expect(conv.extractCR('5,')).to.deep.equal({name: 'CR', errors: [], warnings: [createMessage('originalValueConverted', '5,', 5)], data: 5});			
			expect(conv.extractCR('5.2')).to.deep.equal({name: 'CR', errors: [], warnings: [createMessage('originalValueConverted', '5.2', 5)], data: 5});			
		});

		it('generates an error when the value is a string that cannot be converted to a number', function(){
			expect(conv.extractCR('')).to.deep.equal({name: 'CR', errors: [createMessage('invalidValue', '')], warnings: [], data: NaN});			
			expect(conv.extractCR('wrong')).to.deep.equal({name: 'CR', errors: [createMessage('invalidValue', 'wrong')], warnings: [], data: NaN});			
		});

		it('generates an error when the data is neither a number nor a string', function(){
			expect(conv.extractCR(undefined)).to.deep.equal({name: 'CR', errors: [createMessage('invalidValue', undefined)], warnings: [], data: undefined});			
			expect(conv.extractCR(null)).to.deep.equal({name: 'CR', errors: [createMessage('invalidValue', null)], warnings: [], data: undefined});			
		});
	});

	describe('extractSpace', function(){
		
		it('generates the given value when the value is a positive number', function(){
			expect(conv.extractSpace(0)).to.deep.equal({name: 'space', errors: [], warnings: [], data: 0});
			expect(conv.extractSpace(1)).to.deep.equal({name: 'space', errors: [], warnings: [], data: 1});
			expect(conv.extractSpace(10)).to.deep.equal({name: 'space', errors: [], warnings: [], data: 10});
		});

		it('generates an error when the value is a negative number', function(){
			expect(conv.extractSpace(-1)).to.deep.equal({name: 'space', errors: [createMessage('invalidValue', -1)], warnings: [], data: undefined});
		});

		it('generates a value of 2.5 for special values to correct for bad data format and raises a warning', function(){
			expect(conv.extractSpace(37288)).to.deep.equal({name: 'space', errors: [], warnings: [createMessage('wrongFormatDate2002')], data: 2.5});
			expect(conv.extractSpace(41641)).to.deep.equal({name: 'space', errors: [], warnings: [createMessage('wrongFormatDate2014')], data: 2.5});
		});

		it('converts to a number when the value is a string', function(){
			expect(conv.extractSpace('2.5')).to.deep.equal({name: 'space', errors: [], warnings: [], data: 2.5});
		});

		it('generates a value of 0.5 when the string starts with "1/2" and raises a warning', function(){
			expect(conv.extractSpace('1/2 ft')).to.deep.equal({name: 'space', errors: [], warnings: [createMessage('originalValueConverted', '1/2 ft', 0.5)], data: 0.5});
		});

		it('generates a value of 2.5 when the string starts with "2-1/2" and raises a warning', function(){
			expect(conv.extractSpace('2-1/2 ft')).to.deep.equal({name: 'space', errors: [], warnings: [createMessage('originalValueConverted', '2-1/2 ft', 2.5)], data: 2.5});
		});
		
		it('generates a warning when the value is a string but doesn\'t just represent a number', function(){
			expect(conv.extractSpace('10 ft')).to.deep.equal({name: 'space', errors: [], warnings: [createMessage('originalValueConverted', '10 ft', 10)], data: 10});
			expect(conv.extractSpace('10,')).to.deep.equal({name: 'space', errors: [], warnings: [createMessage('originalValueConverted', '10,', 10)], data: 10});
			expect(conv.extractSpace('5 (coiled)')).to.deep.equal({name: 'space', errors: [], warnings: [createMessage('originalValueConverted', '5 (coiled)', 5)], data: 5});
			expect(conv.extractSpace('5ft.')).to.deep.equal({name: 'space', errors: [], warnings: [createMessage('originalValueConverted', '5ft.', 5)], data: 5});
		});

		it('generates an error when the value is a string that cannot be converted to a number', function(){
			expect(conv.extractSpace('')).to.deep.equal({name: 'space', errors: [createMessage('invalidValue', '')], warnings: [], data: NaN});
			expect(conv.extractSpace('wrong')).to.deep.equal({name: 'space', errors: [createMessage('invalidValue', 'wrong')], warnings: [], data: NaN});
		});

		it('generates an error when the data is neither a number nor a string', function(){
			expect(conv.extractSpace(undefined)).to.deep.equal({name: 'space', errors: [createMessage('invalidValue', undefined)], warnings: [], data: undefined});
			expect(conv.extractSpace(null)).to.deep.equal({name: 'space', errors: [createMessage('invalidValue', null)], warnings: [], data: undefined});
		});

	});

	describe('extractReach', function(){
		
		it('generates the given number when the value is a positive multiple of 5', function(){
			expect(conv.extractReach(0)).to.deep.equal({name: 'reach', errors: [], warnings: [], data: 0});
			expect(conv.extractReach(5)).to.deep.equal({name: 'reach', errors: [], warnings: [], data: 5});
			expect(conv.extractReach(20)).to.deep.equal({name: 'reach', errors: [], warnings: [], data: 20});
		});

		it('generates an error when the value is a negative number', function(){
			expect(conv.extractReach(-1)).to.deep.equal({name: 'reach', errors: [createMessage('invalidValue', -1)], warnings: [], data: undefined});
		});

		it('rounds down the given number to the closest multiple of 5 and raises a warning', function(){
			expect(conv.extractReach(14)).to.deep.equal({name: 'reach', errors: [], warnings: [createMessage('notMultipleOf5', 14, 10)], data: 10});
		});

		it('replaces a value of 2.5 with 5 as this is obviously a typo', function(){
			expect(conv.extractReach(2.5)).to.deep.equal({name: 'reach', errors: [], warnings: [createMessage('invalidReachConverted')], data: 5});
		});

		it('replaces a date equivalent of 2.5 with 5 as this is obviously a typo', function(){
			expect(conv.extractReach(37288)).to.deep.equal({name: 'reach', errors: [], 
				warnings: [createMessage('wrongFormatDate2002'), createMessage('invalidReachConverted')], data: 5});
			expect(conv.extractReach(41641)).to.deep.equal({name: 'reach', errors: [], 
				warnings: [createMessage('wrongFormatDate2014'), createMessage('invalidReachConverted')], data: 5});
		});

		it('generates a warning when the value is a string but doesn\'t just represent a number', function(){
			expect(conv.extractReach('0 ft')).to.deep.equal({name: 'reach', errors: [], warnings: [createMessage('originalValueConverted', '0 ft', 0)], data: 0});
			expect(conv.extractReach('0 Special attacks distraction (DC 15)')).to.deep.equal({name: 'reach', errors: [], 
				warnings: [createMessage('originalValueConverted', '0 Special attacks distraction (DC 15)', 0)], data: 0});
		});

		// temporary test until extra reaches are implemented
		it('generates an error when the value contains extra reaches (temporary)', function(){
			expect(conv.extractReach('0 (10 with slam)')).to.deep.equal({name: 'reach', errors: [createMessage('extraReachesNotHandled')], 
				warnings: [], data: 0});
			expect(conv.extractReach('5; 15 with slam')).to.deep.equal({name: 'reach', errors: [createMessage('extraReachesNotHandled')], 
				warnings: [], data: 5});
			expect(conv.extractReach('15 (30 with arms and tentacles)')).to.deep.equal(
				{name: 'reach', errors: [createMessage('extraReachesNotHandled')], warnings: [], data: 15});
			expect(conv.extractReach('20 (60 with arm, 40 with tentacle)')).to.deep.equal(
				{name: 'reach', errors: [createMessage('extraReachesNotHandled')], warnings: [], data: 20});
		});

		it('generates an error when the value is a string that cannot be converted to a number', function(){
			expect(conv.extractReach('')).to.deep.equal({name: 'reach', errors: [createMessage('invalidValue', '')], warnings: [], data: NaN});
			expect(conv.extractReach('wrong')).to.deep.equal({name: 'reach', errors: [createMessage('invalidValue', 'wrong')], warnings: [], data: NaN});
		});

		it('generates an error when the data is neither a number nor a string', function(){
			expect(conv.extractReach(undefined)).to.deep.equal({name: 'reach', errors: [createMessage('invalidValue', undefined)], warnings: [], data: undefined});
			expect(conv.extractReach(null)).to.deep.equal({name: 'reach', errors: [createMessage('invalidValue', null)], warnings: [], data: undefined});
		});
	});

	describe('extractRacialHD', function(){

		it('generates an error when the monster has class levels (temporary)', function(){
			var rawMonster = { class1_lvl: 1, hd: '1d4+3' };
			expect(conv.extractRacialHD(rawMonster)).to.deep.equal(
				{name: 'racialHD', errors: [createMessage('classLevelsNotHandled')], warnings: [], data: undefined});
		});

		it('generates the correct number of Hit Dice', function(){
			var rawMonster = { hd: '3d6+5' };
			expect(conv.extractRacialHD(rawMonster)).to.deep.equal({name: 'racialHD', errors: [], warnings: [], data: 3});
		});
	});

	describe('extractAbility', function(){
		it('generates the given value when it is a number', function() {
			expect(conv.extractAbility('Str', 0)).to.deep.equal({name: 'Str', errors: [], warnings: [], data: 0});
			expect(conv.extractAbility('Str', 20)).to.deep.equal({name: 'Str', errors: [], warnings: [], data: 20});
		});

		it('generates undefined when the value is a dash', function(){
			expect(conv.extractAbility('Con', '-')).to.deep.equal({name: 'Con', errors: [], warnings: [], data: undefined});
		});

		it('generates an error when the given value is in an invalid format', function(){
			expect(conv.extractAbility('Dex', '5')).to.deep.equal({name: 'Dex', errors: [createMessage('invalidValue', '5')], warnings: [], data: undefined});
			expect(conv.extractAbility('Dex','wrong')).to.deep.equal({name: 'Dex', errors: [createMessage('invalidValue', 'wrong')], warnings: [], data: undefined});
			expect(conv.extractAbility('Dex', '')).to.deep.equal({name: 'Dex', errors: [createMessage('invalidValue', '')], warnings: [], data: undefined});
			expect(conv.extractAbility('Dex', null)).to.deep.equal({name: 'Dex', errors: [createMessage('invalidValue', null)], warnings: [], data: undefined});
			expect(conv.extractAbility('Dex', undefined)).to.deep.equal({name: 'Dex', errors: [createMessage('invalidValue', undefined)], warnings: [], data: undefined});
		});

		it('generates an error when the data is outside reasonable range', function(){
			expect(conv.extractAbility('Str', -1)).to.deep.equal({name: 'Str', errors: [createMessage('invalidValue', -1)], warnings: [], data: undefined});
			expect(conv.extractAbility('Str', 101)).to.deep.equal({name: 'Str', errors: [createMessage('invalidValue', 101)], warnings: [], data: undefined});
		});
	});

	describe('extractSpeed', function(){
		it('generates a speed object when the value only contains a land speed', function(){
			expect(conv.extractSpeed('60 ft.')).to.deep.equal({name: 'speed', errors: [], warnings: [], data: {land: 60}});
			expect(conv.extractSpeed('0 ft.')).to.deep.equal({name: 'speed', errors: [], warnings: [], data: {land: 0}});
		});

		it('generates a speed object when the value contains a single non-land non-fly speed', function(){
			expect(conv.extractSpeed('swim 30 ft.')).to.deep.equal({name: 'speed', errors: [], warnings: [], data: {swim: 30}});
			expect(conv.extractSpeed('unusual 30 ft.')).to.deep.equal({name: 'speed', errors: [], warnings: [], data: {unusual: 30}});
		});

		it('generates a speed object when the value contains both a land speed and one or more other speeds', function(){
			expect(conv.extractSpeed('10 ft., swim 30 ft.')).to.deep.equal(
				{name: 'speed', errors: [], warnings: [], data: {land: 10, swim: 30}});
			
			expect(conv.extractSpeed('10 ft., swim 20 ft., water walk 30 ft.')).to.deep.equal(
				{name: 'speed', errors: [], warnings: [], data: {land: 10, swim: 20, "water walk": 30}});
		});

		it('generates a speed object when the value contains several non-land non-fly speeds', function(){
			expect(conv.extractSpeed('swim 60 ft., jet 240 ft.')).to.deep.equal(
				{name: 'speed', errors: [], warnings: [], data: {swim: 60, jet: 240}});
		});

		it('converts the speed names to lowercase', function(){
			expect(conv.extractSpeed('Swim 60 ft., Jet 240 ft.')).to.deep.equal(
				{name: 'speed', errors: [], warnings: [], data: {swim: 60, jet: 240}});
		});

		it('generates an error when the value contains a special ability, i.e. a chunk without a numeric speed (temporary)', function(){
			expect(conv.extractSpeed('20 ft., swim 30 ft., waverider')).to.deep.equal(
				{name: 'speed', errors: [createMessage('movementAbilitiesNotHandled')], warnings: [], data: undefined});
		});

		it('generates an error when the value is not a string', function(){
			expect(conv.extractSpeed(30)).to.deep.equal({name: 'speed', errors: [createMessage('invalidValue', 30)], warnings: [], data: undefined});
		});
	});

	describe('extractFeats', function(){
		
		it('generates an empty array when there are no feats', function(){
			expect(conv.extractFeats('')).to.deep.equal({name: 'feats', errors: [], warnings: [], data: []});
			expect(conv.extractFeats(undefined)).to.deep.equal({name: 'feats', errors: [], warnings: [], data: []});
		});

		it('generates an array of feat names when the feats are simple', function(){
			expect(conv.extractFeats('Endurance, Diehard, Power Attack')).to.deep.equal(
				{name: 'feats', errors: [], warnings: [], data: [{name: 'Endurance'}, {name: 'Diehard'}, {name: 'Power Attack'}]});
		});

		it('includes the feat details when a feat has additional details', function(){
			expect(conv.extractFeats('Skill Focus (Perception)')).to.deep.equal(
				{name: 'feats', errors: [], warnings: [], data: [{name: 'Skill Focus', details: {name: 'Perception'}}]});
		});

		it('generates an error for feats whose details have details (temporary)', function(){
			expect(conv.extractFeats('Skill Focus (Knowledge[religion])')).to.deep.equal(
				{name: 'feats', errors: [createMessage('featSubDetailsNotHandled')], warnings: [], data: undefined});
		});

		it('generates an error when a feat can\'t be recognised', function(){
			expect(conv.extractFeats('Fake Feat')).to.deep.equal(
				{name: 'feats', errors: [createMessage('unknownFeat', 'Fake Feat')], warnings: [], data: undefined});

			expect(conv.extractFeats('Fake Feat (something)')).to.deep.equal(
				{name: 'feats', errors: [createMessage('unknownFeat', 'Fake Feat')], warnings: [], data: undefined});
		});

		it('generates an error when a feat is known to affect stats but isn\'t handled currently (temporary)', function(){
			expect(conv.extractFeats('Heavy Armor Proficiency')).to.deep.equal(
				{name: 'feats', errors: [createMessage('featNotHandled', 'Heavy Armor Proficiency')], warnings: [], data: undefined});
		});

		it('identifies and stores bonus feats properly when they have no extra details', function(){
			expect(conv.extractFeats('RunB, Diehard, Power Attack')).to.deep.equal(
				{name: 'feats', errors: [], warnings: [], data: [{name: 'Run', special: ['bonus']}, {name: 'Diehard'}, {name: 'Power Attack'}]});

			expect(conv.extractFeats('Diehard, Power Attack, RunB')).to.deep.equal(
				{name: 'feats', errors: [], warnings: [], data: [{name: 'Diehard'}, {name: 'Power Attack'}, {name: 'Run', special: ['bonus']}]});
		});

		it('identifies and stores bonus feats properly when they have additional details', function(){
			expect(conv.extractFeats('Skill Focus (Perception)B, Diehard, Power Attack')).to.deep.equal(
				{	name: 'feats', errors: [], warnings: [], 
					data: [	{name: 'Skill Focus', details: {name: 'Perception'}, special: ['bonus']}, 
							{name: 'Diehard'}, 
							{name: 'Power Attack'}]});

			expect(conv.extractFeats('Diehard, Power Attack, Skill Focus (Perception)B')).to.deep.equal(
				{	name: 'feats', errors: [], warnings: [], 
					data: [	{name: 'Diehard'}, 
							{name: 'Power Attack'},
							{name: 'Skill Focus', details: {name: 'Perception'}, special: ['bonus']}]});
		});
	});

	describe('extractMelee', function(){
		it('generates an empty object when there is no melee data', function(){
			expect(conv.extractMelee('')).to.deep.equal({name: 'melee', errors: [], warnings: [], data: {}});
			expect(conv.extractMelee(undefined)).to.deep.equal({name: 'melee', errors: [], warnings: [], data: {}});
		});

		it('generates the correct melee data for a single natural attack', function(){
			expect(conv.extractMelee('bite +1 (1d4)')).to.deep.equal(
				{name: 'melee', errors: [], warnings: [], data: {bite: {name: 'bite', type: 'natural', nbAttacks: 1, nbDice: 1, dieType: 4}}});

			expect(conv.extractMelee('bite -1 (1d2-5)')).to.deep.equal(
				{name: 'melee', errors: [], warnings: [], data: {bite: {name: 'bite', type: 'natural', nbAttacks: 1, nbDice: 1, dieType: 2}}});

			expect(conv.extractMelee('bite +10 (1d8+4)')).to.deep.equal(
				{name: 'melee', errors: [], warnings: [], data: {bite: {name: 'bite', type: 'natural', nbAttacks: 1, nbDice: 1, dieType: 8}}});

		});

		it('generates the correct melee data for a single natural attacks with extra damage', function(){
			expect(conv.extractMelee('bite +10 (1d8+6 plus 1d6 acid)')).to.deep.equal(
				{name: 'melee', errors: [], warnings: [], data: 
					{bite: {name: 'bite', type: 'natural', nbAttacks: 1, nbDice: 1, dieType: 8, extraDamage: ['1d6 acid']}}});

			expect(conv.extractMelee('bite +10 (1d8+6 plus bleed, disease, and grab)')).to.deep.equal(
				{name: 'melee', errors: [], warnings: [], data: 
					{bite: {name: 'bite', type: 'natural', nbAttacks: 1, nbDice: 1, dieType: 8, extraDamage: ['bleed', 'disease', 'grab']}}});
		});

		it('generates the correct melee data for a single natural attack with multiple attacks', function(){
			expect(conv.extractMelee('2 claws +1 (1d4)')).to.deep.equal(
				{name: 'melee', errors: [], warnings: [], data: 
					{claw: {name: 'claw', type: 'natural', nbAttacks: 2, nbDice: 1, dieType: 4}}});

			expect(conv.extractMelee('2 claws +1 (1d4 plus poison)')).to.deep.equal(
				{name: 'melee', errors: [], warnings: [], data: 
					{claw: {name: 'claw', type: 'natural', nbAttacks: 2, nbDice: 1, dieType: 4, extraDamage: ['poison']}}});
		});

		it('generates an error for a single weapon (temporary)', function(){
			expect(conv.extractMelee('longsword +1 (1d8)')).to.deep.equal(
				{name: 'melee', errors: [createMessage('unknownAttack', 'longsword')], warnings: [], data: undefined});
		});

		it('generates an error when several types of attacks or weapons are involved (temporary)', function(){
			expect(conv.extractMelee('bite +1 (1d4), 2 claws +2 (1d6)')).to.deep.equal(
				{name: 'melee', errors: [createMessage('multipleAttackTypesNotHandled')], warnings: [], data: undefined});

			expect(conv.extractMelee('bite +1 (1d4) and 2 claws +2 (1d6)')).to.deep.equal(
				{name: 'melee', errors: [createMessage('multipleAttackTypesNotHandled')], warnings: [], data: undefined});
		});

		it('generates an error when there are alternative lists of weapons (separated by "or") (temporary)', function(){
			expect(conv.extractMelee('bite +1 (1d4) or 2 claws +2 (1d6)')).to.deep.equal(
				{name: 'melee', errors: [createMessage('alternativeAttackListsNotHandled')], warnings: [], data: undefined});
		});
	});

	describe('checkSkills', function(){
		it ('returns an empty error array when the given skill dictionary is empty', function(){
			expect(conv.checkSkills({})).to.deep.equal([]);
		});

		it('returns an empty error array when the given skill dictionary only has valid skills', function(){
			// note: only the keys are checked, the data is irrelevant
			expect(conv.checkSkills({Acrobatics: {}, 'Sense Motive': {}})).to.deep.equal([]);
		});

		it('returns an array of errors when the given skill dictionary has invalid skills', function(){
			// note: only the keys are checked, the data is irrelevant
			expect(conv.checkSkills({acrobatics: {}})).to.deep.equal([createMessage('unknownSkill', 'acrobatics')]);
			expect(conv.checkSkills({Rubbish: {}})).to.deep.equal([createMessage('unknownSkill', 'Rubbish')]);

			expect(conv.checkSkills({Acrobatics: {}, 'Sense motive': {}, Rubbish: {}})).to.deep.equal(
				[createMessage('unknownSkill', 'Sense motive'), createMessage('unknownSkill', 'Rubbish')]);
		});
	});

	describe('extractSkills', function(){
		
		it('generates an empty object when there are no skills', function(){
			expect(conv.extractSkills('')).to.deep.equal(
				{name: 'skills', errors: [], warnings: [], data: {}});
		});

		it('generates a dictionary of skill objects', function(){
			expect(conv.extractSkills('Perception +4, Stealth +4')).to.deep.equal(
				{name: 'skills', errors: [], warnings: [], data: {Perception: {name: 'Perception', modifier: 4}, Stealth: {name: 'Stealth', modifier: 4}}});
		});
	});

	describe('extractRacialModifiers', function(){

		it('generates an empty object when there are no racial modifiers', function(){
			expect(conv.extractRacialModifiers('')).to.deep.equal(
				{name: 'racialMods', errors: [], warnings: [], data: {}});

			expect(conv.extractRacialModifiers()).to.deep.equal(
				{name: 'racialMods', errors: [], warnings: [], data: {}});
		});

		it('generates a racial modifier object with a list of skills from the given string', function(){
			expect(conv.extractRacialModifiers('+4 Perception, +4 Stealth')).to.deep.equal(
				{name: 'racialMods', errors: [], warnings: [], data: 
					{skills: {Perception: {name: 'Perception', modifier: 4}, Stealth: {name: 'Stealth', modifier: 4}}}});
		});

		it('generates an error when there is a conditional modifier', function(){
			expect(conv.extractRacialModifiers('+4 Acrobatics (+8 when jumping)')).to.deep.equal(
				{name: 'racialMods', errors: [createMessage('conditionalModifiersNotHandled', '+4 Acrobatics (+8 when jumping)')], warnings: [], data: undefined});
		});

		it('generates an error when there is a conditional modifier without a general modifier', function(){
			expect(conv.extractRacialModifiers('+4 Acrobatics when jumping')).to.deep.equal(
				{name: 'racialMods', errors: [createMessage('conditionalModifiersNotHandled', '+4 Acrobatics when jumping')], warnings: [], data: undefined});
		});

		it('generates an error when the given string is a substitution rule', function(){
			expect(conv.extractRacialModifiers('uses Dex to modify Swim')).to.deep.equal(
				{name: 'racialMods', errors: [createMessage('substitutionRulesNotHandled')], warnings: [], data: undefined});
		});

		it('generates an error when the given string contains a substitution rule', function(){
			expect(conv.extractRacialModifiers('+4 Perception; uses Dexterity to modify Climb checks')).to.deep.equal(
				{name: 'racialMods', errors: [createMessage('substitutionRulesNotHandled')], warnings: [], data: undefined});
		});

		it('generates errors for each unrecognised skill', function(){
			expect(conv.extractRacialModifiers('+4 acrobatics, +2 wrong')).to.deep.equal(
				{name: 'racialMods', errors: [createMessage('unknownSkill', 'acrobatics'), createMessage('unknownSkill', 'wrong')], warnings: [], data: undefined});

			expect(conv.extractRacialModifiers('+4 on Perception')).to.deep.equal(
				{name: 'racialMods', errors: [createMessage('unknownSkill', 'on Perception')], warnings: [], data: undefined});
		});
	});

	describe('mergeSkillsAndRacialMods', function(){

		it('generates a warning when there is a racial modifier without corresponding skill data', function(){
			var racial = {skills: {Perception: {name: 'Perception', modifier: 4}}};

			expect(conv.mergeSkillsAndRacialMods({}, racial)).to.deep.equal(
				{name: 'skills', errors: [], warnings: [createMessage('racialModMerge', 'Perception')], data: 
					[{name: 'Perception', racial: 4}]});
		});
		
		it('creates a new array that is the result of merging the skills and racial mods dictionaries', function(){
			var skills = {Perception: {name: 'Perception', modifier: 8}, Stealth: {name: 'Stealth', modifier: 8}};
			var racial = {skills: {Perception: {name: 'Perception', modifier: 4}}};
			
			expect(conv.mergeSkillsAndRacialMods(skills, {})).to.deep.equal(
				{name: 'skills', errors: [], warnings: [], data: 
					[{name: 'Perception', modifier: 8}, {name: 'Stealth', modifier: 8}]});

			expect(conv.mergeSkillsAndRacialMods(skills, racial)).to.deep.equal(
				{name: 'skills', errors: [], warnings: [], data: 
					[{name: 'Perception', modifier: 8, racial: 4}, {name: 'Stealth', modifier: 8}]});
		});
	});

	describe('extractSQ', function(){
		
		it('generates an error when there are DCs in the given string (temporary)', function(){
			expect(conv.extractSQ('fiery form (DC 20)')).to.deep.equal(
				{name: 'SQ', errors: [createMessage('DCInSQNotHandled', 'fiery form (DC 20)')], warnings: [], data: undefined});
		});

		it('generates an array of items, each an array of text chunks', function(){
			expect(conv.extractSQ('camouflage, trackless step, water breathing, woodland stride')).to.deep.equal(
				{name: 'SQ', errors: [], warnings: [], data: 
					[[{text: 'camouflage'}], [{text: 'trackless step'}], [{text: 'water breathing'}], [{text: 'woodland stride'}]]});
		});

		it('generates a warning when there are numbers in the string so that they can be checked manually', function(){
			expect(conv.extractSQ('inspiration, unearthly grace, wild empathy +21')).to.deep.equal(
				{name: 'SQ', errors: [], warnings: [createMessage('numberInSQ', 'inspiration, unearthly grace, wild empathy +21')], data: 
					[[{text: 'inspiration'}], [{text: 'unearthly grace'}], [{text: 'wild empathy +21'}]]});

			expect(conv.extractSQ('lay on hands (4d6, 7/day, as a 9th-level paladin)')).to.deep.equal(
				{name: 'SQ', errors: [], warnings: [createMessage('numberInSQ', 'lay on hands (4d6, 7/day, as a 9th-level paladin)')], data: 
					[[{text: 'lay on hands (4d6, 7/day, as a 9th-level paladin)'}]]});
		});
	});
});
