/* jshint node: true */
'use strict';

var expect = require('chai').expect,
	Monster = require('../../lib/monster'),
	format = require('../../lib/formatmonster');
	
describe('Formatting of monster data for display', function(){
	
	describe('getSenses', function(){
		it('generates a descriptive string for each sense', function(){
			var monster = new Monster(),
				senses;
			monster.senses = [
				{ name: 'low-light vision' }, 
				{ name: 'darkvision', value: 60, unit: 'ft.'}
			];
			senses = format.getSenses(monster);
			expect(senses).to.have.length(2);
			expect(senses[0]).to.equal('low-light vision');
			expect(senses[1]).to.equal('darkvision 60 ft.');
		});
	});
	
	describe('getACModifiers', function(){
		it('builds the list of non-zero AC modifiers as an array of objects', function(){
			var monster, 
				modifiers;
			monster = new Monster({Dex: 14, naturalArmor: 3, size: 'Large'});
			modifiers = format.getACModifiers(monster);
			expect(modifiers).to.deep.equal([{name: 'Dex', value: '+2'}, {name: 'natural', value: '+3'}, 
						{name: 'size', value: '-1'}]);
			monster.Dex = 10;
			modifiers = format.getACModifiers(monster);
			expect(modifiers).to.deep.equal([{name: 'natural', value: '+3'}, {name: 'size', value: '-1'}]);
			monster.naturalArmor = 0;
			monster.size = 'Medium';
			modifiers = format.getACModifiers(monster);
			expect(modifiers).to.deep.equal([]);
		});
	});
	
	describe('getOptionalDefense', function(){
		it('builds an array of the optional defense characterics', function(){
			var monster = new Monster(),
				result;
			monster.optDefense = {
				'abilities': ['split', 'ooze traits'],
				'immune': ['cold', 'fire', 'poison']
			};
			result = format.getOptionalDefense(monster);
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(2);
			expect(result[0]).to.deep.equal({name: 'Defensive Abilities', list: ['split', 'ooze traits']});
			expect(result[1]).to.deep.equal({name: 'Immune', list: ['cold', 'fire', 'poison']});
		});
	});
	
	describe('formatExtraReach', function(){
		it('returns an array in the correct format for 1 weapon', function(){
			var reach = { distance: 10, weapons: ['arms'] };
			expect(format.formatExtraReach(reach, '')).to.deep.equal([10, ' ft. with arms']);
		});
		it('returns an array in the correct format for 2 weapons', function(){
			var reach = { distance: 10, weapons: ['arms', 'tentacle'] };
			expect(format.formatExtraReach(reach, '')).to.deep.equal([10, ' ft. with arms and tentacle']);
		});
		it('returns an array in the correct format for 3 weapons', function(){
			var reach = { distance: 10, weapons: ['arms', 'tentacle', 'lasso'] };
			expect(format.formatExtraReach(reach, '')).to.deep.equal([10, ' ft. with arms, tentacle and lasso']);
		});
	});
	
	describe('getSpaceReach', function(){
		
		it('builds an object representing space, reach and extra reach', function(){
			var monster, spaceReach;
			
			monster = new Monster({
					space: 10, 
					reach: 15, 
					extraReach: [
						{
							distance: 20, 
							weapons: ['arm']
						}
					]
				});
			spaceReach = format.getSpaceReach(monster);
			expect(spaceReach).to.deep.equal({space: 10, reach: 15, extraReach: [20, ' ft. with arm']});
		});
		
		it('builds a space/reach object without extra reach', function(){
			var monster, spaceReach;
			
			monster = new Monster({space: 10, reach: 15});
			spaceReach = format.getSpaceReach(monster);
			expect(spaceReach).to.deep.equal({space: 10, reach: 15, extraReach: undefined});
		});
		
		it('returns undefined when the space and reach are standard', function(){
			var monster, spaceReach;
			
			monster = new Monster();
			spaceReach = format.getSpaceReach(monster);
			expect(spaceReach).to.be.undefined();
		});
		
		it('builds an object when space and reach are standard but there is extra reach', function(){
			var monster, spaceReach;
			
			monster = new Monster({extraReach: [
							{distance: 20, weapons: ['arms', 'tentacles']}, 
							{distance: 10, weapons: ['bite']}
							]});

			spaceReach = format.getSpaceReach(monster);
			expect(spaceReach).to.deep.equal({
					space: 5, 
					reach: 5, 
					extraReach: [20, ' ft. with arms and tentacles, ', 10, ' ft. with bite']
					});
		});
	});
	
	describe('getMonsterProfile', function(){
		var cubeLiteral = {
				name: 'Gelatinous Cube',
				CR: 3,
				alignment: 'N',
				size: 'Large',
				type: 'ooze',
				senses: [
					{
						name: 'blindsight', 
						value: 60,
						unit: 'ft.'
					}
				],
				optDefense: {
					immune: [
						'electricity',
						'ooze traits'
					]
				},
				racialHD: 4,
				naturalArmor: 0,
				speed: '15 ft.',
				space: 10,
				reach: 5,
				Str: 10,
				Dex: 1,
				Con: 26,
				Int: undefined,
				Wis: 1,
				Cha: 1,
				SQ: 
					[
						[
							{text: 'change shape', link: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#change-shape'},
							{text: ' (2 of the following forms: bat, Small centipede, toad, or wolf; '},
							{text: 'polymorph', magic: true},
							{text: ')'}
						],
						[{text: 'amphibious'}]
					],
				baseFort: 1,
				baseRef: 1,
				baseWill: 1,
				melee: {
					slam: { 
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 1, 
						dieType: 6,
						extraDamage: ['1d6 acid']
					},
				},
				environment: 'any underground',
				organization: 'solitary',
				treasure: 'incidental'
		};
		
		it('gets the data in the correct format', function(){
			var monster,
				profile;
			
			monster = new Monster(cubeLiteral);
			profile = format.getMonsterProfile(monster);
			expect(profile.name).to.equal('Gelatinous Cube');
			expect(profile.CR).to.equal(3);
			expect(profile.XP).to.equal('800');
			expect(profile.alignment).to.equal('N');
			expect(profile.size).to.equal('Large');
			expect(profile.type).to.equal('ooze');
			expect(profile.init).to.equal('-5');
			expect(profile.senses).to.deep.equal(["blindsight 60 ft."]);
			expect(profile.perception).to.equal('-5');
			expect(profile.AC).to.equal(4);
			expect(profile.touchAC).to.equal(4);
			expect(profile.flatFootedAC).to.equal(4);
			expect(profile.ACModifiers).to.deep.equal([{name: 'Dex', value: '-5'}, {name: 'size', value: '-1'}]);
			expect(profile.hp).to.equal(50);
			expect(profile.hpFormula).to.equal('4d8+32');
			expect(profile.fort).to.equal('+9');
			expect(profile.ref).to.equal('-4');
			expect(profile.will).to.equal('-4');
			expect(profile.optDefense).to.deep.equal([{name: 'Immune', list: ['electricity', 'ooze traits']}]);
			expect(profile.speed).to.equal('15 ft.');
			expect(profile.spaceReach).to.deep.equal({space: 10, reach: 5, extraReach: undefined});
			expect(profile.Str).to.equal(10);
			expect(profile.Dex).to.equal(1);
			expect(profile.Con).to.equal(26);
			expect(profile.Int).to.be.undefined();
			expect(profile.Wis).to.equal(1);
			expect(profile.Cha).to.equal(1);
			expect(profile.SQ).to.deep.equal([
						[
							{text: 'change shape', link: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#change-shape'},
							{text: ' (2 of the following forms: bat, Small centipede, toad, or wolf; '},
							{text: 'polymorph', magic: true},
							{text: ')'}
						],
						[{text: 'amphibious'}]
					]);
			expect(profile.BAB).to.equal('+3');
			expect(profile.CMB).to.equal('+4');
			expect(profile.CMD).to.equal(9);
			expect(profile.environment).to.equal('any underground');
			expect(profile.organization).to.equal('solitary');
			expect(profile.treasure).to.equal('incidental');
		});
	});
});