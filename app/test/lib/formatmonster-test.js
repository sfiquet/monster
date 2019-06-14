'use strict';

var expect = require('chai').expect,
	Monster = require('../../lib/monster'),
	format = require('../../lib/formatmonster');
	
describe('Formatting of monster data for display', function(){
	
	describe('getType', function(){
		it('generates a formatable chunk for type including a link', function(){
			var monster = new Monster({type: 'undead'});
			expect(format.getType(monster)).to.deep.equal(
				{text: 'undead', url: 'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#undead'} 
			);
		});
	});
	
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

	describe('getPerception', function(){
		it('generates an array of formatable chunks for perception including a link', function(){
			var monster = new Monster({Wis: 14});
			expect(format.getPerception(monster)).to.deep.equal(
				[
					{text: 'Perception', url: 'http://paizo.com/pathfinderRPG/prd/skills/perception.html#perception'}, 
					{text: '+2'}
				]);
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

		it('transforms the DR data into strings for inclusion in the handlebars template', () => {
			var monster = new Monster(),
				result;
			monster.optDefense = {
				'DR': [
					{
						"value": 10,
						"negatedByAny": ["adamantine", "bludgeoning"]
					},
					{
						"value": 5,
						"negatedByAny": ["cold iron"]
					}
				]
			};
			result = format.getOptionalDefense(monster);
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(1);
			expect(result[0]).to.deep.equal({name: 'DR', list: ['10/adamantine or bludgeoning', '5/cold iron']});
		});
		
		it('transforms the resist data into strings for inclusion in the handlebars template', () => {
			var monster = new Monster(),
				result;
			monster.optDefense = {
				'resist': [
					{
						"name": "cold",
						"value": 10,
					},
					{
						"name": "fire",
						"value": 5,
						"comment": "(see below)"
					}
				]
			};
			result = format.getOptionalDefense(monster);
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(1);
			expect(result[0]).to.deep.equal({name: 'Resist', list: ['cold 10', 'fire 5 (see below)']});
		});
		
		it('transforms the SR data into strings for inclusion in the handlebars template', () => {
			var monster = new Monster(),
				result;
			monster.optDefense = {
				'SR': {
					"value": 10,
					"comment": "vs lawful spells and creatures"
				}
			};
			result = format.getOptionalDefense(monster);
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(1);
			expect(result[0]).to.deep.equal({name: 'SR', list: ['10 vs lawful spells and creatures']});

			monster.optDefense = {
				'SR': {
					"value": 5,
				}
			};
			result = format.getOptionalDefense(monster);
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(1);
			expect(result[0]).to.deep.equal({name: 'SR', list: ['5']});
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
			expect(spaceReach).to.be.undefined;
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
	
	describe('getSpecialAttacks', function(){
		
		it('returns undefined if there are no special attacks', function(){
			var monster = new Monster();
			expect(format.getSpecialAttacks(monster)).to.be.undefined;
		});
		
		it('formats the output text correctly when there is no calculation', function(){
			var monster, attacks;
			
			monster = new Monster({specialAtk: [
							{
								name: 'bleed', 
								url: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#bleed',
								details: [{text: '2d6'}]
							}
						]
					});
			attacks = format.getSpecialAttacks(monster);
			expect(attacks).to.have.length(1);
			expect(attacks[0]).to.have.length(4);
			expect(attacks[0]).to.deep.equal([
					{
						text: 'bleed', 
						url: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#bleed'
					}, 
					{text: ' ('}, 
					{text: '2d6'}, 
					{text: ')'}
				]);
		});
		
		it('calculates a damage formula and builds a text chunk for it', function(){
			var monster, attacks;
			
			monster = new Monster({Str: 16, specialAtk: [
							{
								name: 'constrict', 
								details: [
									{
										calc: 'damage',
										type: 'weapon',
										nbDice: 2, 
										dieType: 6, 
										strengthFactor: 1.5
									}
								]
							}
						]
					});
			attacks = format.getSpecialAttacks(monster);
			expect(attacks).to.have.length(1);
			expect(attacks[0]).to.have.length(4);
			expect(attacks[0]).to.deep.equal([
					{text: 'constrict'}, 
					{text: ' ('}, 
					{text: '2d6+4'}, 
					{text: ')'}
				]);
		});

		it('performs a DC calculation and outputs the result as a text chunk', function() {
			var monster, attacks;
			
			monster = new Monster({Cha: 15, racialHD: 4, specialAtk: [
							{
								name: 'energy drain', 
								details: [
									{
										"text": "1 level, DC "
									},
									{
										"calc": "DC",
										"baseStat": "Cha"
									}
								]
							}
						]
					});
			attacks = format.getSpecialAttacks(monster);
			expect(attacks).to.have.length(1);
			expect(attacks[0]).to.have.length(5);
			expect(attacks[0]).to.deep.equal([
					{text: 'energy drain'}, 
					{text: ' ('}, 
					{text: '1 level, DC '}, 
					{text: '14'},
					{text: ')'}
				]);
		});
	});
	
	describe('getSpecialAbilities', function(){
		it('returns undefined if there are no special abilities', function(){
			var monster = new Monster();
			expect(format.getSpecialAbilities(monster)).to.be.undefined;
		});
		
		it('outputs the text correctly when there is no calculation', function(){
			var monster, abilities;
			
			monster = new Monster({ specialAbilities: 
				[{
					title: 'Corrosion (Ex)',
					description: [
						{text: 'An opponent that is being constricted by a black pudding suffers a –4 penalty on Reflex saves made to resist acid damage applying to clothing and armor.'}
					]
				}]
			});
			
			abilities = format.getSpecialAbilities(monster);
			expect(abilities).to.be.instanceof(Array);
			expect(abilities).to.have.length(1);
			expect(abilities[0]).to.deep.equal({
				main: [
					{text: 'Corrosion (Ex)', titleLevel: 1}, 
					{text: 'An opponent that is being constricted by a black pudding suffers a –4 penalty on Reflex saves made to resist acid damage applying to clothing and armor.'}
				]});
		});
		
		it('works on multiple special abilities when there is no calculation', function(){
			var monster, abilities;

			monster = new Monster({ specialAbilities: 
				[
					{
						title: 'Corrosion (Ex)',
						description: [
							{text: 'An opponent that is being constricted by a black pudding suffers a –4 penalty on Reflex saves made to resist acid damage applying to clothing and armor.'}
						]
					},
					{
						title: 'Split (Ex)',
						description: [
							{ text: 'Slashing and piercing weapons deal no damage to a black pudding. Instead, the creature splits into two identical puddings, each with half of the original\'s current hit points (round down). A pudding with 10 hit points or less cannot be further split and dies if reduced to 0 hit points.' }
						]	
					},
					{
						title: 'Suction (Ex)',
						description: [
							{ text: 'The black pudding can create powerful suction against any surface as it climbs, allowing it to cling to inverted surfaces with ease. A black pudding can establish or release suction as a swift action, and as long as it is using suction, it moves at half speed. Because of the suction, a black pudding\'s CMD score gets a +10 circumstance bonus to resist bull rush, awesome blows, and other attacks and effects that attempt to physically move it from its location.' }
						]
					}
				]
			});
			
			abilities = format.getSpecialAbilities(monster);
			expect(abilities).to.be.instanceof(Array);
			expect(abilities).to.have.length(3);
			expect(abilities[0]).to.deep.equal({ 
				main: [
					{text: 'Corrosion (Ex)', titleLevel: 1}, 
					{text: 'An opponent that is being constricted by a black pudding suffers a –4 penalty on Reflex saves made to resist acid damage applying to clothing and armor.'}
				]});
			expect(abilities[1]).to.deep.equal({
				main: [
					{text: 'Split (Ex)', titleLevel: 1}, 
					{text: 'Slashing and piercing weapons deal no damage to a black pudding. Instead, the creature splits into two identical puddings, each with half of the original\'s current hit points (round down). A pudding with 10 hit points or less cannot be further split and dies if reduced to 0 hit points.'}
				]});
			expect(abilities[2]).to.deep.equal({
				main: [
					{text: 'Suction (Ex)', titleLevel: 1}, 
					{text: 'The black pudding can create powerful suction against any surface as it climbs, allowing it to cling to inverted surfaces with ease. A black pudding can establish or release suction as a swift action, and as long as it is using suction, it moves at half speed. Because of the suction, a black pudding\'s CMD score gets a +10 circumstance bonus to resist bull rush, awesome blows, and other attacks and effects that attempt to physically move it from its location.'}
				]});
		});

		it('performs a DC calculation and outputs the result as a text chunk', function(){
			var monster, abilities;
			
			monster = new Monster(
				{
					Con: 22, 
					racialHD: 10,
					specialAbilities : [
						{
							title: 'Acid (Ex)',
							description: [
								{text: 'A black pudding secretes a digestive acid that dissolves organic material and metal quickly, but does not affect stone. Each time a creature suffers damage from a black pudding\'s acid, its clothing and armor take the same amount of damage from the acid. A DC '}, 
								{calc: 'DC', baseStat: 'Con'}, 
								{text: 'Reflex save prevents damage to clothing and armor. A metal or wooden weapon that strikes a black pudding takes 2d6 acid damage unless the weapon\'s wielder succeeds on a DC 21 Reflex save. If a black pudding remains in contact with a wooden or metal object for 1 full round, it inflicts 21 points of acid damage (no save) to the object. The save DCs are Constitution-based.'}
							]
						}
					]
				}
			);
			
			abilities = format.getSpecialAbilities(monster);
			expect(abilities).to.be.instanceof(Array);
			expect(abilities).to.have.length(1);
			expect(abilities[0]).to.be.an('object');
			expect(Object.keys(abilities[0])).to.deep.equal(['main']);
			expect(abilities[0].main).to.be.an('array').that.has.lengthOf(4);
			expect(abilities[0].main[0]).to.deep.equal({ text: 'Acid (Ex)', titleLevel: 1 });
			expect(abilities[0].main[1]).to.deep.equal({ text: 'A black pudding secretes a digestive acid that dissolves organic material and metal quickly, but does not affect stone. Each time a creature suffers damage from a black pudding\'s acid, its clothing and armor take the same amount of damage from the acid. A DC ' });
			expect(abilities[0].main[2]).to.deep.equal({ text: '21' });
			expect(abilities[0].main[3]).to.deep.equal({ text: 'Reflex save prevents damage to clothing and armor. A metal or wooden weapon that strikes a black pudding takes 2d6 acid damage unless the weapon\'s wielder succeeds on a DC 21 Reflex save. If a black pudding remains in contact with a wooden or metal object for 1 full round, it inflicts 21 points of acid damage (no save) to the object. The save DCs are Constitution-based.' });
		});

		it('supports extra elements for each ability', () => {
			const monster = new Monster({ specialAbilities: 
				[{
					title: 'Corrosion (Ex)',
					description: [{text: 'This is the main paragraph.'}],
					extra: [
						{
							type: 'paragraph',
							content: [{text: 'This is the second paragraph.'}]
						},
						{
							type: 'paragraph',
							content: [{text: 'This is the third paragraph.'}]
						}
					]
				}]
			});
			
			const abilities = format.getSpecialAbilities(monster);
			expect(abilities).to.be.instanceof(Array);
			expect(abilities).to.have.length(1);
			expect(abilities[0]).to.deep.equal({
				main: [
					{text: 'Corrosion (Ex)', titleLevel: 1}, 
					{text: 'This is the main paragraph.'}
				],
				extra: [
					{
						type: 'paragraph',
						content: [{text: 'This is the second paragraph.'}]
					},
					{
						type: 'paragraph',
						content: [{text: 'This is the third paragraph.'}]
					},
				]
			});
		});

		it('supports multiple normal paragraphs', () => {
			const monster = new Monster({ 
				Con: 22, 
				Wis: 6,
				racialHD: 10,
				specialAbilities: 
				[{
					title: 'Corrosion (Ex)',
					description: [{text: 'This is the main paragraph.'}],
					extra: [
						{
							type: 'paragraph',
							content: [
								{text: 'This is the second paragraph with DC '}, 
								{calc: 'DC', baseStat: 'Con'},
								{text: ' due to '},
								{text: 'Some Spell', isMagic: true}
							]
						},
						{
							type: 'paragraph',
							content: [
								{text: 'This is the third paragraph with DC '},
								{calc: 'DC', baseStat: 'Wis'}
							]
						}
					]
				}]
			});
			
			const abilities = format.getSpecialAbilities(monster);
			expect(abilities).to.be.an('array').with.lengthOf(1);
			expect(abilities[0]).to.deep.equal({
				main: [
					{text: 'Corrosion (Ex)', titleLevel: 1}, 
					{text: 'This is the main paragraph.'}
				],
				extra: [
					{
						type: 'paragraph',
						content: [
							{text: 'This is the second paragraph with DC '}, 
							{text: '21'},
							{text: ' due to '},
							{text: 'Some Spell', isMagic: true}
						]
					},
					{
						type: 'paragraph',
						content: [
							{text: 'This is the third paragraph with DC '},
							{text: '13'}
						]
					},
				]
			});
		});

		it('supports multiple titled paragraphs', () => {
			const monster = new Monster({ 
				Con: 22, 
				Wis: 6,
				racialHD: 10,
				specialAbilities: 
				[{
					title: 'Corrosion (Ex)',
					description: [{text: 'This is the main paragraph.'}],
					extra: [
						{
							type: 'paragraph',
							title: 'First Power',
							content: [
								{text: 'This is the second paragraph with DC '}, 
								{calc: 'DC', baseStat: 'Con'},
								{text: ' due to '},
								{text: 'Some Spell', isMagic: true}
							]
						},
						{
							type: 'paragraph',
							title: 'Second Power',
							content: [
								{text: 'This is the third paragraph with DC '},
								{calc: 'DC', baseStat: 'Wis'}
							]
						}
					]
				}]
			});
			
			const abilities = format.getSpecialAbilities(monster);
			expect(abilities).to.be.an('array').with.lengthOf(1);
			expect(abilities[0]).to.deep.equal({
				main: [
					{text: 'Corrosion (Ex)', titleLevel: 1}, 
					{text: 'This is the main paragraph.'}
				],
				extra: [
					{
						type: 'paragraph',
						content: [
							{text: 'First Power', titleLevel: 2},
							{text: 'This is the second paragraph with DC '}, 
							{text: '21'},
							{text: ' due to '},
							{text: 'Some Spell', isMagic: true}
						]
					},
					{
						type: 'paragraph',
						content: [
							{text: 'Second Power', titleLevel: 2},
							{text: 'This is the third paragraph with DC '},
							{text: '13'}
						]
					},
				]
			});
		});

		it('supports lists', () => {
			const monster = new Monster({ 
				Con: 22, 
				Wis: 6,
				racialHD: 10,
				specialAbilities: 
				[{
					title: 'Corrosion (Ex)',
					description: [{text: 'This is the main paragraph.'}],
					extra: [
						{
							type: 'list',
							content: [
								[
									{text: 'Item 1 with DC '}, 
									{calc: 'DC', baseStat: 'Con'},
									{text: ' due to '},
									{text: 'Some Spell', isMagic: true}
								],
								[
									{text: 'Item 2'}
								]
							]
						},
						{
							type: 'paragraph',
							content: [
								{text: 'And now we have another list:'},
							]
						},
						{
							type: 'list',
							content: [
								[
									{text: 'eggs'}
								],
								[
									{text: 'flour'}
								],
								[
									{text: 'sugar', isMagic: true}
								]
							]
						}
					]
				}]
			});
			
			const abilities = format.getSpecialAbilities(monster);
			expect(abilities).to.be.an('array').with.lengthOf(1);
			expect(abilities[0]).to.deep.equal({
				main: [
					{text: 'Corrosion (Ex)', titleLevel: 1}, 
					{text: 'This is the main paragraph.'}
				],
				extra: [
					{
						type: 'list',
						content: [
							[
								{text: 'Item 1 with DC '}, 
								{text: '21'},
								{text: ' due to '},
								{text: 'Some Spell', isMagic: true}
							],
							[
								{text: 'Item 2'}
							]
						]
					},
					{
						type: 'paragraph',
						content: [
							{text: 'And now we have another list:'},
						]
					},
					{
						type: 'list',
						content: [
							[
								{text: 'eggs'}
							],
							[
								{text: 'flour'}
							],
							[
								{text: 'sugar', isMagic: true}
							]
						]
					}
				]
			});
		});

		it('supports tables', () => {
			const monster = new Monster({ 
				Con: 22, 
				Wis: 6,
				racialHD: 10,
				specialAbilities: 
				[{
					title: 'Corrosion (Ex)',
					description: [{text: 'This is the main paragraph.'}],
					extra: [
						{
							type: 'table',
							hasHeaderRow: true,
							hasHeaderCol: true,
							content: [
								[
									[{text: 'Col 1'}],
									[{text: 'Col 2'}],
								],
								[
									[{text: 'Text with DC '}, {calc: 'DC', baseStat: 'Con'}],
									[{text: 'Text with '}, {text: 'Some Spell', isMagic: true}],
								]
							]
						}
					]
				}]
			});
			
			const abilities = format.getSpecialAbilities(monster);
			expect(abilities).to.be.an('array').with.lengthOf(1);
			expect(abilities[0]).to.deep.equal({
				main: [
					{text: 'Corrosion (Ex)', titleLevel: 1}, 
					{text: 'This is the main paragraph.'}
				],
				extra: [
					{
						type: 'table',
						hasHeaderRow: true,
						hasHeaderCol: true,
						content: [
							[
								[{text: 'Col 1'}],
								[{text: 'Col 2'}],
							],
							[
								[{text: 'Text with DC '}, {text: '21'}],
								[{text: 'Text with '}, {text: 'Some Spell', isMagic: true}],
							]
						]
					}
				]
			});

		});
	});
	
	describe('getCMB', function(){
		it('returns a string containing the monster\'s CMB when there are no extra bonuses', function(){
			var monster = new Monster({
					size: 'Large',
					type: 'animal',
					racialHD: 6,
					naturalArmor: 3,
					Str: 23,
					Dex: 15,
					Con: 17
			});
			expect(monster.getCMB()).to.equal(11);
			expect(format.getCMB(monster)).to.equal('+11');
		});
		
		it('includes the special CMBs between parentheses after the CMB', function(){
			var monster = new Monster({
					size: 'Large',
					type: 'animal',
					racialHD: 6,
					naturalArmor: 3,
					Str: 23,
					Dex: 15,
					Con: 17,
					specialCMB: [
						{
							name: 'grapple',
							components: [{type: 'melee', name: 'grab', bonus: 4}]
						}
					]
			});
			
			expect(format.getCMB(monster)).to.equal('+11 (+15 grapple)');
		});
		
		it('separates the special CMBs with commas', function(){
			var monster = new Monster({
					size: 'Large',
					type: 'animal',
					racialHD: 6,
					naturalArmor: 3,
					Str: 23,
					Dex: 15,
					Con: 17,
					specialCMB: [
						{
							name: 'grapple',
							components: [{type: 'melee', name: 'grab', bonus: 4}]
						},
						{
							name: 'bull rush',
							components: [{type: 'feat', name: 'Improved Bull Rush', bonus: 2}]
						}
					]
			});
			
			expect(format.getCMB(monster)).to.equal('+11 (+15 grapple, +13 bull rush)');
		});
	});
	
	describe('getCMD', function(){
		it('returns a string containing the monster\'s CMD when there are no extra bonuses', function(){
			var monster = new Monster({
					size: 'Large',
					type: 'animal',
					racialHD: 6,
					naturalArmor: 3,
					Str: 23,
					Dex: 15,
					Con: 17
			});
			expect(monster.getCMD()).to.equal(23);
			expect(format.getCMD(monster)).to.equal('23');
		});
		
		it('includes the special CMDs between parentheses after the CMD', function(){
			var monster = new Monster({
					size: 'Large',
					type: 'animal',
					racialHD: 6,
					naturalArmor: 3,
					Str: 23,
					Dex: 15,
					Con: 17,
					specialCMD: [
						{
							name: 'trip',
							components: [{type: 'racial', name: 'racial', bonus: 8}]
						}
					]
			});
			
			expect(format.getCMD(monster)).to.equal('23 (31 vs. trip)');
		});
		
		it('separates the special CMDs with commas', function(){
			var monster = new Monster({
					size: 'Large',
					type: 'animal',
					racialHD: 6,
					naturalArmor: 3,
					Str: 23,
					Dex: 15,
					Con: 17,
					specialCMD: [
						{
							name: 'trip',
							components: [{type: 'racial', name: 'racial', bonus: 8}]
						},
						{
							name: 'bull rush',
							components: [{type: 'feat', name: 'Improved Bull Rush', bonus: 2}]
						}
					]
			});
			
			expect(format.getCMD(monster)).to.equal('23 (31 vs. trip, 25 vs. bull rush)');
		});
		
		it('returns a "can\'t be..." message when the creature is immune to a maneuver', function(){
			var monster = new Monster({
					size: 'Large',
					type: 'animal',
					racialHD: 6,
					naturalArmor: 3,
					Str: 23,
					Dex: 15,
					Con: 17,
					specialCMD: [
						{
							name: 'trip',
							cantFail: true,
							components: [{type: 'feat', name: 'Improved Trip', bonus: 2}]
						}
					]
			});
			
			expect(format.getCMD(monster)).to.equal('23 (can\'t be tripped)');
		});
		
		it('uses the correct past participle in the "can\'t be" messages for standard immune maneuvers', function(){
			var monster = new Monster({
					size: 'Large',
					type: 'animal',
					racialHD: 6,
					naturalArmor: 3,
					Str: 23,
					Dex: 15,
					Con: 17,
					specialCMD: [
						{ name: 'trip', cantFail: true }
					]
			});
			
			expect(format.getCMD(monster)).to.equal('23 (can\'t be tripped)');
			monster.specialCMD[0].name = 'grapple';
			expect(format.getCMD(monster)).to.equal('23 (can\'t be grappled)');
			monster.specialCMD[0].name = 'disarm';
			expect(format.getCMD(monster)).to.equal('23 (can\'t be disarmed)');
			monster.specialCMD[0].name = 'overrun';
			expect(format.getCMD(monster)).to.equal('23 (can\'t be overrun)');
			monster.specialCMD[0].name = 'bull rush';
			expect(format.getCMD(monster)).to.equal('23 (can\'t be bull rushed)');
			monster.specialCMD[0].name = 'sunder';
			expect(format.getCMD(monster)).to.equal('23 (can\'t be sundered)');
		});
		
		it('makes up the past participle by adding -ed for non-standard immune maneuvers', function(){
			var monster = new Monster({
					size: 'Large',
					type: 'animal',
					racialHD: 6,
					naturalArmor: 3,
					Str: 23,
					Dex: 15,
					Con: 17,
					specialCMD: [
						{ name: 'blah', cantFail: true }
					]
			});
			
			expect(format.getCMD(monster)).to.equal('23 (can\'t be blahed)');
		});
		
	});
	
	describe('getSkills', function(){
		it('returns undefined when the creature has no skill bonus', function(){
			var monster = new Monster();
			expect(format.getSkills(monster)).to.be.undefined;
		});
		
		it('returns an array of chunks for the template to display', function(){
			var monster,
				skills;
			
			monster = new Monster({
				Str: 18,
				speed: { land: 20, climb: 20 }
			});
			skills = format.getSkills(monster);
			expect(skills).to.be.instanceof(Array);
			expect(skills).to.have.length(1);
			expect(skills[0]).to.have.length(2);
			expect(skills[0][0]).to.deep.equal({ text: 'Climb', url: 'http://paizo.com/pathfinderRPG/prd/skills/climb.html#climb' });
			expect(skills[0][1]).to.deep.equal( { text: '+12' });
		});

		it('formats specialised skills appropriately', () => {
			var monster,
				skills;
			
			monster = new Monster({
				Int: 14,
				type: 'dragon',
				skills: [{name: 'Craft', specialty: 'traps', ranks: 4}]
			});
			skills = format.getSkills(monster);
			expect(skills).to.be.instanceof(Array);
			expect(skills).to.have.length(1);
			expect(skills[0]).to.have.length(3);
			expect(skills[0][0]).to.deep.equal({ text: 'Craft', url: 'http://paizo.com/pathfinderRPG/prd/skills/craft.html#craft' });
			expect(skills[0][1]).to.deep.equal( { text: '(traps)' });
			expect(skills[0][2]).to.deep.equal( { text: '+9' });
		});
	});

	describe('getRacialModifiers', function(){
		it('returns undefined when the creature has no racial modifier', function(){
			var monster = new Monster();
			expect(format.getRacialModifiers(monster)).to.be.undefined;
		});

		it('returns an array of chunks for display in the template', function(){
			var monster = new Monster();
			monster.setSkills([{'name': 'Acrobatics', 'ranks': 4, 'racial': 6}]);
			expect(format.getRacialModifiers(monster)).to.deep.equal([
				[
					{text: '+6'}, 
					{text: 'Acrobatics', url: 'http://paizo.com/pathfinderRPG/prd/skills/acrobatics.html#acrobatics'}
				]
			]);
		});

		it('formats specialised skills appropriately', () => {
			var monster = new Monster();
			monster.type = 'dragon';
			monster.setSkills([{'name': 'Craft', specialty: 'traps', 'ranks': 4, 'racial': 6}]);
			expect(format.getRacialModifiers(monster)).to.deep.equal([
				[
					{text: '+6'}, 
					{text: 'Craft', url: 'http://paizo.com/pathfinderRPG/prd/skills/craft.html#craft'},
					{text: '(traps)'}
				]
			]);
		});
	});
	
	describe('getSpeed', function(){
		it('returns undefined when the monster has no speed', function(){
			var monster = new Monster();
			monster.speed = undefined;
			expect(format.getSpeed(monster)).to.be.undefined;
		});
		
		it('returns an array of text chunks', function(){
			var monster = new Monster({
				speed: { land: 30, climb: 20, swim: 10 },
			});
			
			expect(format.getSpeed(monster)).to.deep.equal([
					{ text: '30 ft.'}, 
					{ text : 'climb 20 ft.' }, 
					{ text: 'swim 10 ft.' }]);
		});
	});
	
	describe('getFeats', function(){
		it('returns undefined when the creature has no feat', function(){
			var monster = new Monster();
			expect(format.getFeats(monster)).to.be.undefined;
		});

		it('returns the correct array of chunks when a creature has simple feats with no extra detail', function(){
			var monster = new Monster({
				feats: [
					{name: 'Improved Initiative', url: 'url/improvedinit'},
					{name: 'Weapon Finesse'}
				]
			});
			expect(format.getFeats(monster)).to.deep.equal([
					{
						description: { text: 'Improved Initiative', url: 'url/improvedinit' }
					},
					{
						description: { text: 'Weapon Finesse' }
					}
				]);
		});

		it('returns the correct array of chunks for feats that have extra details', function(){
			var monster = new Monster({
				feats: [
					{
						name: 'Skill Focus', 
						url: 'url/skillfocus', 
						details: [
							{name: 'Perception', url: 'url/perception'}, 
							{name: 'Swim', url: 'url/swim'}]
					},
					{name: 'Weapon Finesse'}
				]
			});
			expect(format.getFeats(monster)).to.deep.equal(
				[
					{ 
						description: { text: 'Skill Focus', url: 'url/skillfocus' },
						details: 
							[
								{ text: 'Perception', url: 'url/perception'},
								{ text: 'Swim', url: 'url/swim' },
							]
					},
					{
						description: { text: 'Weapon Finesse' }
					}
				]);
		});

		it('formats specialised skills correctly for Skill Focus', () => {
			var monster = new Monster({
				feats: [
					{
						name: 'Skill Focus', 
						url: 'url/skillfocus', 
						details: [
							{name: 'Craft', specialty: 'traps', url: 'url/craft'}, 
							{name: 'Knowledge', specialty: 'nature', url: 'url/knowledge'}]
					}
				]
			});
			expect(format.getFeats(monster)).to.deep.equal(
				[
					{ 
						description: { text: 'Skill Focus', url: 'url/skillfocus' },
						details: 
							[
								{ text: 'Craft [traps]', url: 'url/craft' },
								{ text: 'Knowledge [nature]', url: 'url/knowledge' }
							]
					}
				]);
		});

		it('formats separate Skill Focus feats correctly', () => {
			const monster = new Monster({
				feats: [
					{
						name: 'Skill Focus', 
						url: 'url/skillfocus', 
						details: [{name: 'Craft', specialty: 'traps', url: 'url/craft'}]
					},
					{
						name: 'Skill Focus', 
						url: 'url/skillfocus', 
						details: [{name: 'Knowledge', specialty: 'nature', url: 'url/knowledge'}]
					},
				]
			});
			expect(format.getFeats(monster)).to.deep.equal(
				[
					{ 
						description: { text: 'Skill Focus', url: 'url/skillfocus' },
						details: 
							[
								{ text: 'Craft [traps]', url: 'url/craft' }
							]
					},
					{ 
						description: { text: 'Skill Focus', url: 'url/skillfocus' },
						details: 
							[
								{ text: 'Knowledge [nature]', url: 'url/knowledge' }
							]
					}
				]);

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
				speed: { land: 15 },
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
							{text: 'change shape', url: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#change-shape'},
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
				specialAtk: [
					{
						name: 'constrict', 
						url: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#constrict',
						details: [
							{
								calc: 'damage',
								type: 'weapon',
								nbDice: 2,
								dieType: 6,
								strengthFactor: 1.5,
							},
							{ text: ' plus ' },
							{
								calc: 'damage',
								type: 'extra',
								nbDice: 2,
								dieType: 6,
							},
							{ text: ' acid' }
						]
					}, 
					{
						name: 'corrosion'
					}
				],
				environment: 'any underground',
				organization: 'solitary',
				treasure: 'incidental',
				specialAbilities: [
					{
						title: 'Acid (Ex)',
						description: [
							{
								text: 'A gelatinous cube\'s acid does not harm metal or stone.'
							}
						]
					}
				]
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
			expect(profile.type).to.deep.equal({text: 'ooze', url: 'http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#ooze'});
			expect(profile.init).to.equal('-5');
			expect(profile.senses).to.deep.equal(["blindsight 60 ft."]);
			expect(profile.perception).to.deep.equal(
				[
					{text: 'Perception', url: 'http://paizo.com/pathfinderRPG/prd/skills/perception.html#perception'}, 
					{text: '-5'}
				]);
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
			expect(profile.speed).to.deep.equal([{ text: '15 ft.' }]);
			expect(profile.spaceReach).to.deep.equal({space: 10, reach: 5, extraReach: undefined});
			expect(profile.Str).to.equal(10);
			expect(profile.Dex).to.equal(1);
			expect(profile.Con).to.equal(26);
			expect(profile.Int).to.be.undefined;
			expect(profile.Wis).to.equal(1);
			expect(profile.Cha).to.equal(1);
			expect(profile.BAB).to.equal('+3');
			expect(profile.CMB).to.equal('+4');
			expect(profile.CMD).to.equal('9');
			expect(profile.skills).to.be.undefined;
			expect(profile.SQ).to.deep.equal([
						[
							{text: 'change shape', url: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#change-shape'},
							{text: ' (2 of the following forms: bat, Small centipede, toad, or wolf; '},
							{text: 'polymorph', magic: true},
							{text: ')'}
						],
						[{text: 'amphibious'}]
					]);
			expect(profile.environment).to.equal('any underground');
			expect(profile.organization).to.equal('solitary');
			expect(profile.treasure).to.equal('incidental');
			expect(profile.specialAttacks).to.deep.equal([
				[
					{text: 'constrict', url: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#constrict'}, 
					{text: ' ('},
					{text: '2d6'},
					{text: ' plus '},
					{text: '2d6'},
					{text: ' acid'},
					{text: ')'}
				],
				[
					{text: 'corrosion'}
				]
			]);
			expect(profile.specialAbilities).to.deep.equal([{
				main: [
					{ text: 'Acid (Ex)', titleLevel: 1 },
					{ text: 'A gelatinous cube\'s acid does not harm metal or stone.' }
				]
			}]);
		});
	});
});