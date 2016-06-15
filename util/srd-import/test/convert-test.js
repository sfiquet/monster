/* jshint node: true, esversion: 6 */
'use strict';

var expect = require('chai').expect,
	conv = require('../convert');

describe('Convert', function(){

	describe('checkRawMonster', function(){

		it('generates an error when the CR is over 30', function(){
			expect(conv.checkRawMonster({cr: 31})).to.deep.equal([{name: 'CR', errors: ['CR over 30 not handled yet']}]);
		});

		it('generates an error when the monster has class levels', function(){
			expect(conv.checkRawMonster({class1: 'rogue'})).to.deep.equal([{name: 'Class1', errors: ['Class levels not handled yet']}]);
		});

		it('generates an error when the HD has extra HP', function(){
			expect(conv.checkRawMonster({hd: '12d10 plus 12'})).to.deep.equal([{name: 'HD', errors: ['Hit Dice with extra HP not handled yet']}]);
			expect(conv.checkRawMonster({hd: '11d6+55 plus 15 false life'})).to.deep.equal([{name: 'HD', errors: ['Hit Dice with extra HP not handled yet']}]);
		});

		it('generates an error when there are extra Fortitude details', function(){
			expect(conv.checkRawMonster({fort: '+8 (+10 vs. nonmagical disease)'})).to.deep.equal([{name: 'Fort', errors: ['Extra Fortitude not handled yet']}]);
		});

		it('generates an error when there are extra Reflex details', function(){
			expect(conv.checkRawMonster({ref: '+5 (+1 vs. traps)'})).to.deep.equal([{name: 'Ref', errors: ['Extra Reflex not handled yet']}]);
		});

		it('generates an error when there are extra Will details', function(){
			expect(conv.checkRawMonster({will: '+2 (+1 vs. fear)'})).to.deep.equal([{name: 'Will', errors: ['Extra Will not handled yet']}]);
		});

		it('generates an error when the monster has data in Gear', function(){
			expect(conv.checkRawMonster({gear: '+2 longsword, +2 full platemail, +2 heavy steel shield'})).to.deep.equal(
				[{name: 'Gear', errors: ['Gear not handled yet']}]);
		});

		it('generates an error when the monster has data in OtherGear', function(){
			expect(conv.checkRawMonster({othergear: 'bracers of armor +6, mirror of life trapping, ring of evasion, ring of protection +5'})).to.deep.equal(
				[{name: 'Gear', errors: ['Gear not handled yet']}]);
		});

		it('generates an error when the treasure contains specific objects', function(){
			expect(conv.checkRawMonster(
				{treasure: 'standard (sickle, masterwork composite longbow [Str +4] with 20 arrows, wooden armor, other treasure)'})).to.deep.equal(
				[{name: 'Treasure', errors: ['Gear not handled yet']}]);
		});

		it('generates an error when the monster has ranged attacks', function(){
			expect(conv.checkRawMonster(
				{ranged: 'light crossbow +3 (1d8/19-20)'})).to.deep.equal(
				[{name: 'Ranged', errors: ['Ranged attacks not handled yet']}]);
		});

		it('generates an error when the monster has alternate forms', function(){
			expect(conv.checkRawMonster(
				{alternatenameform: 'Human Form'})).to.deep.equal(
				[{name: 'AlternateNameForm', errors: ['Alternate forms not handled yet']}]);
		});

		it('generates an error when there is a fly speed', function(){
			expect(conv.checkRawMonster(
				{speed: 'fly 60 ft. (poor)'})).to.deep.equal(
				[{name: 'Speed', errors: ['Fly speed not handled yet']}]);

			expect(conv.checkRawMonster(
				{speed: 'Fly 60 ft. (poor)'})).to.deep.equal(
				[{name: 'Speed', errors: ['Fly speed not handled yet']}]);

			expect(conv.checkRawMonster(
				{speed: '50 ft., fly 100 ft. (good)'})).to.deep.equal(
				[{name: 'Speed', errors: ['Fly speed not handled yet']}]);
		});

		it('generates an error when there is extra details for speeds', function(){
			expect(conv.checkRawMonster(
				{speed: '30 ft. (20 ft. in armor)'})).to.deep.equal(
				[{name: 'Speed', errors: ['Extra speed in special conditions not handled yet']}]);

			expect(conv.checkRawMonster(
				{speed: '20 ft., burrow (lava only) 30 ft.'})).to.deep.equal(
				[{name: 'Speed', errors: ['Extra speed in special conditions not handled yet']}]);
		});

		// useless: the move special abilities have been removed from the excel file
		it('generates an error when there are special ways to move', function(){
			expect(conv.checkRawMonster(
				{speed: '20 ft., swim 30 ft.; sprint'})).to.deep.equal(
				[{name: 'Speed', errors: ['Special ways to move not handled yet']}]);

			expect(conv.checkRawMonster(
				{speed: '40 ft., fly 200 ft. (average); cloudwalking, graceful flight'})).to.deep.equal(
				[{name: 'Speed', errors: ['Fly speed not handled yet', 'Special ways to move not handled yet']}]);
		});
	});

	describe('extractType', function(){
		
		it('converts the type to lowercase', function(){
			expect(conv.extractType('Outsider')).to.deep.equal({name: 'type', errors: [], warnings: [], data: 'outsider'});
		});

		it('generates an error when the value is not a string', function(){
			expect(conv.extractType(null)).to.deep.equal({name: 'type', errors: ['Invalid value: null'], warnings: [], data: undefined});
			expect(conv.extractType(undefined)).to.deep.equal({name: 'type', errors: ['Invalid value: undefined'], warnings: [], data: undefined});
			expect(conv.extractType(0)).to.deep.equal({name: 'type', errors: ['Invalid value: 0'], warnings: [], data: undefined});
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
			expect(conv.extractCR(0.7)).to.deep.equal({name: 'CR', errors: ['Invalid value: 0.7'], warnings: [], data: undefined});
		});

		it('generates the given value when the value is an integer >= 1', function(){
			expect(conv.extractCR(1)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: 1});
			expect(conv.extractCR(5)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: 5});
			expect(conv.extractCR(10)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: 10});
			expect(conv.extractCR(10.0)).to.deep.equal({name: 'CR', errors: [], warnings: [], data: 10});
		});

		it('truncates a floating point numeric value and generates a warning', function(){
			expect(conv.extractCR(4.7)).to.deep.equal({name: 'CR', errors: [], warnings: ['Original value 4.7 converted to 4'], data: 4});
		});

		it('converts to an integer when the value is a string', function(){
			expect(conv.extractCR('5')).to.deep.equal({name: 'CR', errors: [], warnings: [], data: 5});
		});

		it('generates a warning when the value is a string but doesn\'t represent an integer', function(){
			expect(conv.extractCR('5,')).to.deep.equal({name: 'CR', errors: [], warnings: ['Original value "5," converted to 5'], data: 5});			
			expect(conv.extractCR('5.2')).to.deep.equal({name: 'CR', errors: [], warnings: ['Original value "5.2" converted to 5'], data: 5});			
		});

		it('generates an error when the value is a string that cannot be converted to a number', function(){
			expect(conv.extractCR('')).to.deep.equal({name: 'CR', errors: ['Invalid value: ""'], warnings: [], data: NaN});			
			expect(conv.extractCR('wrong')).to.deep.equal({name: 'CR', errors: ['Invalid value: "wrong"'], warnings: [], data: NaN});			
		});

		it('generates an error when the data is neither a number nor a string', function(){
			expect(conv.extractCR(undefined)).to.deep.equal({name: 'CR', errors: ['Invalid value: undefined'], warnings: [], data: undefined});			
			expect(conv.extractCR(null)).to.deep.equal({name: 'CR', errors: ['Invalid value: null'], warnings: [], data: undefined});			
		});
	});

	describe('extractSpace', function(){
		
		it('generates the given value when the value is a positive number', function(){
			expect(conv.extractSpace(0)).to.deep.equal({name: 'space', errors: [], warnings: [], data: 0});
			expect(conv.extractSpace(1)).to.deep.equal({name: 'space', errors: [], warnings: [], data: 1});
			expect(conv.extractSpace(10)).to.deep.equal({name: 'space', errors: [], warnings: [], data: 10});
		});

		it('generates an error when the value is a negative number', function(){
			expect(conv.extractSpace(-1)).to.deep.equal({name: 'space', errors: ['Invalid value: -1'], warnings: [], data: undefined});
		});

		it('generates a value of 2.5 for special values to correct for bad data format and raises a warning', function(){
			expect(conv.extractSpace(37288)).to.deep.equal({name: 'space', errors: [], warnings: ['2-1/2 ft provided as date 2/01/2002'], data: 2.5});
			expect(conv.extractSpace(41641)).to.deep.equal({name: 'space', errors: [], warnings: ['2-1/2 ft provided as date 2/01/2014'], data: 2.5});
		});

		it('converts to a number when the value is a string', function(){
			expect(conv.extractSpace('2.5')).to.deep.equal({name: 'space', errors: [], warnings: [], data: 2.5});
		});

		it('generates a value of 0.5 when the string starts with "1/2" and raises a warning', function(){
			expect(conv.extractSpace('1/2 ft')).to.deep.equal({name: 'space', errors: [], warnings: ['Original value "1/2 ft" converted to 0.5'], data: 0.5});
		});

		it('generates a value of 2.5 when the string starts with "2-1/2" and raises a warning', function(){
			expect(conv.extractSpace('2-1/2 ft')).to.deep.equal({name: 'space', errors: [], warnings: ['Original value "2-1/2 ft" converted to 2.5'], data: 2.5});
		});
		
		it('generates a warning when the value is a string but doesn\'t just represent a number', function(){
			expect(conv.extractSpace('10 ft')).to.deep.equal({name: 'space', errors: [], warnings: ['Original value "10 ft" converted to 10'], data: 10});
			expect(conv.extractSpace('10,')).to.deep.equal({name: 'space', errors: [], warnings: ['Original value "10," converted to 10'], data: 10});
			expect(conv.extractSpace('5 (coiled)')).to.deep.equal({name: 'space', errors: [], warnings: ['Original value "5 (coiled)" converted to 5'], data: 5});
			expect(conv.extractSpace('5ft.')).to.deep.equal({name: 'space', errors: [], warnings: ['Original value "5ft." converted to 5'], data: 5});
		});

		it('generates an error when the value is a string that cannot be converted to a number', function(){
			expect(conv.extractSpace('')).to.deep.equal({name: 'space', errors: ['Invalid value: ""'], warnings: [], data: NaN});
			expect(conv.extractSpace('wrong')).to.deep.equal({name: 'space', errors: ['Invalid value: "wrong"'], warnings: [], data: NaN});
		});

		it('generates an error when the data is neither a number nor a string', function(){
			expect(conv.extractSpace(undefined)).to.deep.equal({name: 'space', errors: ['Invalid value: undefined'], warnings: [], data: undefined});
			expect(conv.extractSpace(null)).to.deep.equal({name: 'space', errors: ['Invalid value: null'], warnings: [], data: undefined});
		});

	});

	describe('extractReach', function(){
		
		it('generates the given number when the value is a positive multiple of 5', function(){
			expect(conv.extractReach(0)).to.deep.equal({name: 'reach', errors: [], warnings: [], data: 0});
			expect(conv.extractReach(5)).to.deep.equal({name: 'reach', errors: [], warnings: [], data: 5});
			expect(conv.extractReach(20)).to.deep.equal({name: 'reach', errors: [], warnings: [], data: 20});
		});

		it('generates an error when the value is a negative number', function(){
			expect(conv.extractReach(-1)).to.deep.equal({name: 'reach', errors: ['Invalid value: -1'], warnings: [], data: undefined});
		});

		it('rounds down the given number to the closest multiple of 5 and raises a warning', function(){
			expect(conv.extractReach(14)).to.deep.equal({name: 'reach', errors: [], warnings: ['Value 14 is not a multiple of 5 - rounded down to 10'], data: 10});
		});

		it('replaces a value of 2.5 with 5 as this is obviously a typo', function(){
			expect(conv.extractReach(2.5)).to.deep.equal({name: 'reach', errors: [], warnings: ['Value 2.5 is invalid for Reach - replaced by default 5'], data: 5});
		});

		it('replaces a date equivalent of 2.5 with 5 as this is obviously a typo', function(){
			expect(conv.extractReach(37288)).to.deep.equal({name: 'reach', errors: [], 
				warnings: ['2-1/2 ft provided as date 2/01/2002', 'Value 2.5 is invalid for Reach - replaced by default 5'], data: 5});
			expect(conv.extractReach(41641)).to.deep.equal({name: 'reach', errors: [], 
				warnings: ['2-1/2 ft provided as date 2/01/2014', 'Value 2.5 is invalid for Reach - replaced by default 5'], data: 5});
		});

		it('generates a warning when the value is a string but doesn\'t just represent a number', function(){
			expect(conv.extractReach('0 ft')).to.deep.equal({name: 'reach', errors: [], warnings: ['Original value "0 ft" converted to 0'], data: 0});
			expect(conv.extractReach('0 Special attacks distraction (DC 15)')).to.deep.equal({name: 'reach', errors: [], 
				warnings: ['Original value "0 Special attacks distraction (DC 15)" converted to 0'], data: 0});
		});

		// temporary test until extra reaches are implemented
		it('generates an error when the value contains extra reaches (temporary)', function(){
			expect(conv.extractReach('0 (10 with slam)')).to.deep.equal({name: 'reach', errors: ['Extra reaches are not implemented yet'], 
				warnings: [], data: 0});
			expect(conv.extractReach('5; 15 with slam')).to.deep.equal({name: 'reach', errors: ['Extra reaches are not implemented yet'], 
				warnings: [], data: 5});
			expect(conv.extractReach('15 (30 with arms and tentacles)')).to.deep.equal(
				{name: 'reach', errors: ['Extra reaches are not implemented yet'], warnings: [], data: 15});
			expect(conv.extractReach('20 (60 with arm, 40 with tentacle)')).to.deep.equal(
				{name: 'reach', errors: ['Extra reaches are not implemented yet'], warnings: [], data: 20});
		});

		it('generates an error when the value is a string that cannot be converted to a number', function(){
			expect(conv.extractReach('')).to.deep.equal({name: 'reach', errors: ['Invalid value: ""'], warnings: [], data: NaN});
			expect(conv.extractReach('wrong')).to.deep.equal({name: 'reach', errors: ['Invalid value: "wrong"'], warnings: [], data: NaN});
		});

		it('generates an error when the data is neither a number nor a string', function(){
			expect(conv.extractReach(undefined)).to.deep.equal({name: 'reach', errors: ['Invalid value: undefined'], warnings: [], data: undefined});
			expect(conv.extractReach(null)).to.deep.equal({name: 'reach', errors: ['Invalid value: null'], warnings: [], data: undefined});
		});
	});

	describe('extractRacialHD', function(){

		it('generates an error when the monster has class levels (temporary)', function(){
			var rawMonster = { class1_lvl: 1, hd: '1d4+3' };
			expect(conv.extractRacialHD(rawMonster)).to.deep.equal(
				{name: 'racialHD', errors: ['Class levels are not implemented yet'], warnings: [], data: undefined});
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
			expect(conv.extractAbility('Dex', '5')).to.deep.equal({name: 'Dex', errors: ['Invalid value: "5"'], warnings: [], data: undefined});
			expect(conv.extractAbility('Dex','wrong')).to.deep.equal({name: 'Dex', errors: ['Invalid value: "wrong"'], warnings: [], data: undefined});
			expect(conv.extractAbility('Dex', '')).to.deep.equal({name: 'Dex', errors: ['Invalid value: ""'], warnings: [], data: undefined});
			expect(conv.extractAbility('Dex', null)).to.deep.equal({name: 'Dex', errors: ['Invalid value: null'], warnings: [], data: undefined});
			expect(conv.extractAbility('Dex', undefined)).to.deep.equal({name: 'Dex', errors: ['Invalid value: undefined'], warnings: [], data: undefined});
		});

		it('generates an error when the data is outside reasonable range', function(){
			expect(conv.extractAbility('Str', -1)).to.deep.equal({name: 'Str', errors: ['Invalid value: -1'], warnings: [], data: undefined});
			expect(conv.extractAbility('Str', 101)).to.deep.equal({name: 'Str', errors: ['Invalid value: 101'], warnings: [], data: undefined});
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

		it('generates an error when the value contains a special ability, i.e. a chunk without a numeric speed', function(){
			expect(conv.extractSpeed('20 ft., swim 30 ft., waverider')).to.deep.equal(
				{name: 'speed', errors: ['Special abilities that affect movement not handled yet'], warnings: [], data: undefined});
		});

		it('generates an error when the value is not a string', function(){
			expect(conv.extractSpeed(30)).to.deep.equal({name: 'speed', errors: ['Invalid value: 30'], warnings: [], data: undefined});
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

		it('generates an error for feats whose details have details (not handled yet)', function(){
			expect(conv.extractFeats('Skill Focus (Knowledge[religion])')).to.deep.equal(
				{name: 'feats', errors: ['Feat sub-details not handled yet'], warnings: [], data: undefined});
		});

		it('generates an error when a feat can\'t be recognised', function(){
			expect(conv.extractFeats('Fake Feat')).to.deep.equal(
				{name: 'feats', errors: ['Unknown feat: "Fake Feat"'], warnings: [], data: undefined});

			expect(conv.extractFeats('Fake Feat (something)')).to.deep.equal(
				{name: 'feats', errors: ['Unknown feat: "Fake Feat"'], warnings: [], data: undefined});
		});

		it('generates an error when a feat is known to affect stats but isn\'t handled currently', function(){
			expect(conv.extractFeats('Heavy Armor Proficiency')).to.deep.equal(
				{name: 'feats', errors: ['Feat not handled yet: "Heavy Armor Proficiency"'], warnings: [], data: undefined});
		});
	});
});
