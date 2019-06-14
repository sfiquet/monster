"use strict";

const expect = require('chai').expect;
const Monster = require('../../lib/monster');

var tigerLiteral = {
		name: 'Tiger',
		CR: 4,
		alignment: 'N',
		size: 'Large',
		type: 'animal',
		racialHD: 6,
		naturalArmor: 3,
		Str: 23,
		Dex: 15,
		Con: 17,
		Int: 2,
		Wis: 12,
		Cha: 6,
		baseFort: 5, // those should be deduced from type and HD
		baseRef: 5,
		baseWill: 2,
		melee: {
			claw: {
				name: 'claw',
				type: 'natural',
				nbAttacks: 2,
				nbDice: 1,
				dieType: 8,
				extraDamage: ['grab']
			},
			bite: {
				name: 'bite',
				type: 'natural',
				nbAttacks: 1,
				nbDice: 2,
				dieType: 6,
				extraDamage: ['grab']
			}
		},
		feats: [
			{
				name: 'Improved Initiative',
				url: 'url/improvedinit'
			},
			{
				name: 'Skill Focus',
				url: 'url/skillfocus',
				details: 
				[
					{
						name: 'Perception',
						url: 'url/perception'
					}
				]
			}
		]
	},
	cubeLiteral = {
		name: 'Gelatinous Cube',
		CR: 3,
		alignment: 'N',
		size: 'Large',
		type: 'ooze',
		racialHD: 4,
		naturalArmor: 0,
		Str: 10,
		Dex: 1,
		Con: 26,
		Int: undefined,
		Wis: 1,
		Cha: 1,
		melee: {
			slam: { 
				name: 'slam', 
				type: 'natural', 
				nbAttacks: 1, 
				nbDice: 1, 
				dieType: 6,
				extraDamage: ['1d6 acid']
			},
		}
	};

describe('Monster', function(){
	describe('Constructor', function(){
		var myMonster;
		
		it('creates a monster with default values', function(){
			myMonster = new Monster();
			expect(myMonster.name).to.equal('Default');
			expect(myMonster.CR).to.equal(1);
			expect(myMonster.alignment).to.equal('N');
			expect(myMonster.size).to.equal('Medium');
			expect(myMonster.type).to.equal('magical beast');
			expect(myMonster.racialHD).to.equal(1);
			expect(myMonster.naturalArmor).to.equal(0);
			expect(myMonster.Str).to.be.undefined;
			expect(myMonster.Dex).to.be.undefined;
			expect(myMonster.Con).to.be.undefined;
			expect(myMonster.Int).to.be.undefined;
			expect(myMonster.Wis).to.be.undefined;
			expect(myMonster.Cha).to.be.undefined;
			expect(myMonster.baseFort).to.equal(0);
			expect(myMonster.baseRef).to.equal(0);
			expect(myMonster.baseWill).to.equal(0);
			expect(myMonster.senses).to.deep.equal([]);
			expect(myMonster.space).to.equal(5);
			expect(myMonster.reach).to.equal(5);
			expect(myMonster.extraReach).to.be.undefined;
			expect(myMonster.SQ).to.be.undefined;
			expect(myMonster.optDefense).to.be.undefined;
			expect(myMonster.specialAtk).to.be.undefined;
			expect(myMonster.specialAbilities).to.be.undefined;
			expect(myMonster.specialCMB).to.be.undefined;
			expect(myMonster.specialCMD).to.be.undefined;
			expect(myMonster.weaknesses).to.be.undefined;
			expect(myMonster.languages).to.be.undefined;
			expect(myMonster.spaceOffset).to.be.undefined;
			expect(myMonster.shape).to.equal('tall');
			expect(myMonster.environment).to.be.undefined;
			expect(myMonster.organization).to.be.undefined;
			expect(myMonster.treasure).to.be.undefined;
			expect(myMonster.speed).to.deep.equal({land: 30});
			expect(myMonster.feats).to.deep.equal([]);
			expect(myMonster.melee).to.deep.equal({});
			expect(myMonster.skills).to.deep.equal([]);
			expect(myMonster.skillSet).to.deep.equal({});
			expect(myMonster.Fort).to.be.an('object');
			expect(myMonster.Ref).to.be.an('object');
			expect(myMonster.Will).to.be.an('object');
		});
		
		it('creates a monster from given literal', function(){
			var literal = {
					name: 'Test',
					CR: 4,
					alignment: 'CE',
					size: 'Large',
					type: 'outsider',
					racialHD: 6,
					naturalArmor: 3,
					space: 10,
					reach: 5,
					extraReach: [
							{distance: 20, weapons: ['arms', 'tentacles']}, 
							{distance: 10, weapons: ['bite']}
							],
					Str: 23,
					Dex: 15,
					Con: 17,
					Int: 8,
					Wis: 12,
					Cha: 6,
					baseFort: 5, // should those be deduced from type and HD?
					baseRef: 5,
					baseWill: 2,
					environment: 'underground',
					organization: 'solitary',
					treasure: 'none',
					speed: {land: 20, climb: 20},
					feats: [{name: 'Improved Initiative'}],
					senses: [
							{name: 'darkvision', value: 60, unit: 'ft.'}, 
							{name: 'scent'}
							],
					melee: {
						claw: {
							name: 'claw',
							type: 'natural',
							nbAttacks: 2,
							nbDice: 1,
							dieType: 8,
							extraDamage: ['grab']
						}
					},
					skills: [
						{
							"name": "Perception",
							"ranks": 7
						}
					],
					SQ: [
						[{"text": "transparent"}]
					],
					optDefense: {
						abilities: ['freedom of movement', 'ferocity'],
						immune: ['cold', 'fire', 'poison']
					},
					weaknesses: ['cold'],
					languages: 'common',
					specialAtk: [
						{
							name: 'bleed', 
							url: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#bleed', 
							details: [{ text: '2d6' }]
						},
						{
							name: 'corrosion'
						}
					],
					specialCMB: [
						{ 
							name: 'grapple', 
							components: [{ 
								name: 'grab', 
								type: 'melee', 
								bonus: 4 
							}]
						}
					],
					specialCMD: [
						{ 
							name: 'grapple', 
							components: [ { 
								name: 'Improved Grapple', 
								type: 'feat', 
								bonus: 2 
							} ]
						}
					],
					specialAbilities: [
						{
							title: 'Acid (Ex)',
							description: [
								{text: 'A black pudding secretes a digestive acid that dissolves organic material and metal quickly, but does not affect stone. Each time a creature suffers damage from a black pudding\'s acid, its clothing and armor take the same amount of damage from the acid. A DC '}, 
								{calc: 'DC', baseStat: 'Con'}, 
								{text: ' Reflex save prevents damage to clothing and armor. A metal or wooden weapon that strikes a black pudding takes 2d6 acid damage unless the weapon\'s wielder succeeds on a DC 21 Reflex save. If a black pudding remains in contact with a wooden or metal object for 1 full round, it inflicts 21 points of acid damage (no save) to the object. The save DCs are Constitution-based.'}
							]
						},
						{
							title: 'Corrosion (Ex)',
							description: [
								{text: ' An opponent that is being constricted by a black pudding suffers a –4 penalty on Reflex saves made to resist acid damage applying to clothing and armor.'}
							]
						}
					]
				};
			
			myMonster = new Monster(literal);
			expect(myMonster.name).to.equal('Test');
			expect(myMonster.CR).to.equal(4);
			expect(myMonster.alignment).to.equal('CE');
			expect(myMonster.size).to.equal('Large');
			expect(myMonster.type).to.equal('outsider');
			expect(myMonster.racialHD).to.equal(6);
			expect(myMonster.naturalArmor).to.equal(3);
			expect(myMonster.Str).to.equal(23);
			expect(myMonster.Dex).to.equal(15);
			expect(myMonster.Con).to.equal(17);
			expect(myMonster.Int).to.equal(8);
			expect(myMonster.Wis).to.equal(12);
			expect(myMonster.Cha).to.equal(6);
			expect(myMonster.baseFort).to.equal(5);
			expect(myMonster.baseRef).to.equal(5);
			expect(myMonster.baseWill).to.equal(2);
			expect(myMonster.space).to.equal(10);
			expect(myMonster.reach).to.equal(5);
			expect(myMonster.environment).to.equal('underground');
			expect(myMonster.organization).to.equal('solitary');
			expect(myMonster.treasure).to.equal('none');
			expect(myMonster.languages).to.equal('common');

			expect(myMonster.senses).to.have.length(2);
			expect(myMonster.senses[0]).to.deep.equal({name: 'darkvision', value: 60, unit: 'ft.'});
			expect(myMonster.senses[1]).to.deep.equal({name: 'scent'});

			expect(myMonster.speed).to.deep.equal({land: 20, climb: 20});

			expect(myMonster.feats).to.deep.equal([{name: 'Improved Initiative'}]);

			expect(myMonster.melee).to.deep.equal({
				claw: {
					name: 'claw',
					type: 'natural',
					nbAttacks: 2,
					nbDice: 1,
					dieType: 8,
					extraDamage: ['grab']
				}
			});

			expect(myMonster.skills).to.deep.equal([
				{
					"name": "Perception",
					"ranks": 7
				}
			]);
			expect(myMonster.skillSet).to.deep.equal({
				Perception: {
					"name": "Perception",
					"ranks": 7
				}
			});

			expect(myMonster.SQ).to.deep.equal([[{"text": "transparent"}]]);

			expect(myMonster.optDefense).to.exist;
			expect(myMonster.optDefense.abilities).to.exist;
			expect(myMonster.optDefense.abilities).to.deep.equal(['freedom of movement', 'ferocity']);
			expect(myMonster.optDefense.immune).to.exist;
			expect(myMonster.optDefense.immune).to.deep.equal(['cold', 'fire', 'poison']);

			expect(myMonster.weaknesses).to.deep.equal(['cold']);
			
			expect(myMonster.extraReach).to.have.length(2);
			expect(myMonster.extraReach[0]).to.deep.equal({distance: 20, weapons: ['arms', 'tentacles']});
			expect(myMonster.extraReach[1]).to.deep.equal({distance: 10, weapons: ['bite']});
			
			expect(myMonster.specialAtk).to.have.length(2);
			expect(myMonster.specialAtk[0]).to.deep.equal({name: 'bleed', url: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#bleed', details: [{ text: '2d6' }]});
			expect(myMonster.specialAtk[1]).to.deep.equal({name: 'corrosion'});

			expect(myMonster.specialCMB).to.deep.equal([
				{ 
					name: 'grapple', 
					components: [{ 
						name: 'grab', 
						type: 'melee', 
						bonus: 4 
					}]
				}
			]);

			expect(myMonster.specialCMD).to.deep.equal([
				{ 
					name: 'grapple', 
					components: [ { 
						name: 'Improved Grapple', 
						type: 'feat', 
						bonus: 2 
					} ]
				}
			]);
			
			expect(myMonster.specialAbilities).to.have.length(2);
			expect(myMonster.specialAbilities[0]).to.deep.equal(
				{
					title: 'Acid (Ex)',
					description: [
						{text: 'A black pudding secretes a digestive acid that dissolves organic material and metal quickly, but does not affect stone. Each time a creature suffers damage from a black pudding\'s acid, its clothing and armor take the same amount of damage from the acid. A DC '}, 
						{calc: 'DC', baseStat: 'Con'}, 
						{text: ' Reflex save prevents damage to clothing and armor. A metal or wooden weapon that strikes a black pudding takes 2d6 acid damage unless the weapon\'s wielder succeeds on a DC 21 Reflex save. If a black pudding remains in contact with a wooden or metal object for 1 full round, it inflicts 21 points of acid damage (no save) to the object. The save DCs are Constitution-based.'}
					]
				}
			);
			expect(myMonster.specialAbilities[1]).to.deep.equal(
				{
					title: 'Corrosion (Ex)',
					description: [
						{text: ' An opponent that is being constricted by a black pudding suffers a –4 penalty on Reflex saves made to resist acid damage applying to clothing and armor.'}
					]
				}
			);

		});
		
		it('creates an object even if not called with new', function(){
			myMonster = Monster();
			expect(myMonster).to.be.an.instanceof(Monster);
		});

		it('creates a deep clone when passed an existing Monster object', () => {
			let original = new Monster(tigerLiteral);
			let copy = new Monster(original);
			expect(copy).to.not.equal(original);
			expect(copy).to.deep.equal(original);
			// check that all the references (objects and arrays) are different
			expect(copy.speed).to.not.equal(original.speed);
			expect(copy.feats).to.not.equal(original.feats);
			expect(copy.melee).to.not.equal(original.melee);
			expect(copy.skills).to.not.equal(original.skills);
			expect(copy.senses).to.not.equal(original.senses);
			expect(copy.skillSet).to.not.equal(original.skillSet);
			expect(copy.Fort).to.not.equal(original.Fort);
			expect(copy.Ref).to.not.equal(original.Ref);
			expect(copy.Will).to.not.equal(original.Will);

			// check the references that can be undefined separately
			expect(copy.SQ).to.be.undefined;
			expect(copy.optDefense).to.be.undefined;
			expect(copy.specialAtk).to.be.undefined;
			expect(copy.specialCMB).to.be.undefined;
			expect(copy.specialCMD).to.be.undefined;
			expect(copy.specialAbilities).to.be.undefined;
			expect(copy.extraReach).to.be.undefined;
			expect(copy.weaknesses).to.be.undefined;

			// now check with those references being defined
			let definedLiteral = Object.assign({}, tigerLiteral, {
				SQ: [
					[{text: 'amphibious'}]
				],
				optDefense: {
						immune: ['cold', 'fire', 'poison']					
				},
				specialAtk: [
						{name: 'corrosion'}
				],
				specialCMB: [
					{ 
						name: 'grapple', 
						components: [{ 
							name: 'grab', 
							type: 'melee', 
							bonus: 4 
						}]
					}
				],
				specialCMD: [
					{ 
						name: 'grapple', 
						components: [ { 
							name: 'Improved Grapple', 
							type: 'feat', 
							bonus: 2 
						} ]
					}
				],
				specialAbilities: [
					{
						title: 'Corrosion (Ex)',
						description: [
							{text: ' An opponent that is being constricted by a black pudding suffers a –4 penalty on Reflex saves made to resist acid damage applying to clothing and armor.'}
						]
					}
				],
				extraReach: [
					{
						distance: 20, 
						weapons: ['arm']
					}
				],
				weaknesses: ["cold"]
			});
			original = new Monster(definedLiteral);
			copy = new Monster(original);
			expect(copy.SQ).to.not.equal(original.SQ);
			expect(copy.optDefense).to.not.equal(original.optDefense);
			expect(copy.specialAtk).to.not.equal(original.specialAtk);
			expect(copy.specialCMB).to.not.equal(original.specialCMB);
			expect(copy.specialCMD).to.not.equal(original.specialCMD);
			expect(copy.specialAbilities).to.not.equal(original.specialAbilities);
			expect(copy.extraReach).to.not.equal(original.extraReach);
			expect(copy.weaknesses).to.not.equal(original.weaknesses);
		});

		it('stores the spaceOffset property when provided', function(){
			myMonster = new Monster({spaceOffset: 1});
			expect(myMonster.spaceOffset).to.equal(1);
		});

		it('doesn\'t replace a reach of 0 with the default 5', function(){
			myMonster = new Monster({reach: 0});
			expect(myMonster.reach).to.equal(0);
		});

		it('stores the shape property when provided', function(){
			myMonster = new Monster({shape: 'long'});
			expect(myMonster.shape).to.equal('long');
		});
	});
	
	describe('Calculated values', function(){
		var tiger;
		
		beforeEach('Create the Monster object', function(){
			tiger = new Monster(tigerLiteral);
		});
		
		it('calculates the XP correctly', function(){
			expect(tiger.getXP()).to.equal(1200);
			tiger.CR = 1;
			expect(tiger.getXP()).to.equal(400);
			tiger.CR = 10;
			expect(tiger.getXP()).to.equal(9600);
			tiger.CR = '1/8';
			expect(tiger.getXP()).to.equal(50);
			tiger.CR = '1/2';
			expect(tiger.getXP()).to.equal(200);
			tiger.CR = 0;
			expect(tiger.getXP()).to.be.undefined;
			tiger.CR = 30;
			expect(tiger.getXP()).to.equal(9830400);
		});
		
		it('calculates the initiative', function(){
			expect(tiger.getInit()).to.equal(2);
		});
		
		it('calculates the HP', function(){
			expect(tiger.getHP()).to.equal(45);
			tiger.Con = 10;
			expect(tiger.getHP()).to.equal(27);
			tiger.type = "undead";
			expect(tiger.getHP()).to.equal(15);
			tiger.type = "construct";
			expect(tiger.getHP()).to.equal(63);
		});
		
		it('produces the HP formula', function(){
			expect(tiger.getHPFormula()).to.equal('6d8+18');
			tiger.Con = 10;
			expect(tiger.getHPFormula()).to.equal('6d8');
			tiger.type = "undead";
			expect(tiger.getHPFormula()).to.equal('6d8-12');
			tiger.type = "construct";
			expect(tiger.getHPFormula()).to.equal('6d10+30');
		});
		
		it('calculates the Fortitude bonus', function(){
			expect(tiger.getFortitude()).to.equal(8);
			tiger.type = 'undead';
			expect(tiger.getFortitude()).to.equal(3);
			tiger.type = 'construct';
			expect(tiger.getFortitude()).to.equal(5);
		});
		
		it('calculates the Reflex bonus', function(){
			expect(tiger.getReflex()).to.equal(7);
		});
		
		it('calculates the Will bonus', function(){
			expect(tiger.getWill()).to.equal(3);
		});
		
		// stats are usually unchanged but could be affected by magic objects
		// this is a rare occurrence - do this later
		it('calculates the Str stat');
		it('calculates the Dex stat');
		it('calculates the Con stat');
		it('calculates the Int stat');
		it('calculates the Wis stat');
		it('calculates the Cha stat');
		
		it('calculates the stat modifiers', function(){
			expect(tiger.getStrMod()).to.equal(6);
			expect(tiger.getDexMod()).to.equal(2);
			expect(tiger.getConMod()).to.equal(3);
			expect(tiger.getIntMod()).to.equal(-4);
			expect(tiger.getWisMod()).to.equal(1);
			expect(tiger.getChaMod()).to.equal(-2);
		});
		
		it('calculates the BAB', function(){
			expect(tiger.getBaseAttackBonus()).to.equal(4);
			tiger.type = 'fey';
			expect(tiger.getBaseAttackBonus()).to.equal(3);
			tiger.type = 'dragon';
			expect(tiger.getBaseAttackBonus()).to.equal(6);
		});
		
		it('calculates the CMB', function(){
			expect(tiger.getCMB()).to.equal(11);
			tiger.size='Tiny';
			expect(tiger.getCMB()).to.equal(4);
			tiger.size='Fine';
			expect(tiger.getCMB()).to.equal(-2);
			tiger.size='Small';
			expect(tiger.getCMB()).to.equal(9);
			tiger.size='Colossal';
			expect(tiger.getCMB()).to.equal(18);
		});
		
		it('calculates the CMD', function(){
			expect(tiger.getCMD()).to.equal(23);
		});
		
		it('calculates the AC', function(){
			expect(tiger.getAC()).to.equal(14);
		});
		
		it('calculates the touch AC', function(){
			expect(tiger.getTouchAC()).to.equal(11);
		});
		
		it('calculates the flat-footed AC', function(){
			expect(tiger.getFlatFootedAC()).to.equal(12);
		});
		
		it('keeps a Dex penalty when calculating the flat-footed AC', function(){
			tiger.Dex = 1;
			expect(tiger.getAC()).to.equal(7);
			expect(tiger.getTouchAC()).to.equal(4);
			expect(tiger.getFlatFootedAC()).to.equal(7);
		});
		
		it('provides all the AC modifiers', function(){
			var ACModifiers = tiger.getACModifiers();
			expect(ACModifiers).to.exist;
			expect(ACModifiers).to.have.ownProperty('Dex');
			expect(ACModifiers.Dex).to.equal(2);
			expect(ACModifiers).to.have.ownProperty('size');
			expect(ACModifiers.size).to.equal(-1);
			expect(ACModifiers).to.have.ownProperty('natural');
			expect(ACModifiers.natural).to.equal(3);
		});
	});
	
	describe('getSkillBonus', () => {		
		let tiger;
		
		beforeEach('Create the Monster object', function(){
			tiger = new Monster(tigerLiteral);
		});
		
		it('calculates untrained skill bonus', function(){
			expect(tiger.getSkillBonus('Survival')).to.equal(1);
			tiger.Wis = 1;
			expect(tiger.getSkillBonus('Survival')).to.equal(-5);
		});

		it('calculates untrained climb bonus when there is a climb speed', function(){
			expect(tiger.getSkillBonus('Climb')).to.equal(6);
			tiger.speed = { land: 30, climb: 15 };
			expect(tiger.getSkillBonus('Climb')).to.equal(14);
		});
		
		it('calculates untrained swim bonus when there is a swim speed', function(){
			expect(tiger.getSkillBonus('Swim')).to.equal(6);
			tiger.speed = { land: 30, swim: 15 };
			expect(tiger.getSkillBonus('Swim')).to.equal(14);
		});

		it('calculates trained skill bonus for class skills', function() {
			tiger.setSkills([{'name': 'Acrobatics', 'ranks': 4}]);
			expect(tiger.getSkillBonus('Acrobatics')).to.equal(9); // 4 ranks + 3 class skills + 2 Dex
		});

		it('calculates trained skill bonus for non-class skills', function() {
			tiger.setSkills([{'name': 'Intimidate', 'ranks': 4}]);
			expect(tiger.getSkillBonus('Intimidate')).to.equal(2); // 4 ranks - 2 Cha
		});

		it('applies racial bonus to trained skill bonus', function(){
			tiger.setSkills([{'name': 'Acrobatics', 'ranks': 4, 'racial': 6}]);
			expect(tiger.getSkillBonus('Acrobatics')).to.equal(15); // 4 ranks + 3 class skills + 2 Dex + 6 racial
		});

		it('applies racial bonus to untrained skill bonus', function(){
			tiger.setSkills([{'name': 'Acrobatics', 'racial': 6}]);
			expect(tiger.getSkillBonus('Acrobatics')).to.equal(8); // 2 Dex + 6 racial
		});

		it('takes an additional parameter for specialised skills', () => {
			tiger.setSkills([{name: 'Profession', specialty: 'butcher', ranks: 3}]);
			expect(tiger.getSkillBonus('Profession', 'butcher')).to.equal(4); // 3 ranks + 1 Wis
		});

		it('returns undefined when the specialty parameter is missing for a skill family', ()=> {
			tiger.setSkills([{name: 'Profession', specialty: 'butcher', ranks: 3}]);
			expect(tiger.getSkillBonus('Profession')).to.be.undefined;
		});

		it('applies the stealth size modifiers', function(){
			// untrained +2 Dex -4 Large
			expect(tiger.getSkillBonus('Stealth')).to.equal(-2);
			// trained +2 Dex -4 Large +4 racial +3 class skills +2 ranks
			tiger.setSkills([{name: 'Stealth', ranks: 2, racial: 4}]);
			expect(tiger.getSkillBonus('Stealth')).to.equal(7);
		});
		
		it('applies the Skill Focus feat correctly', function(){
			const featArray = {
				feats: [{
					name: 'Skill Focus',
					details: [{name: 'Perception'}]
				}]
			};
			let tiger = new Monster(Object.assign({}, tigerLiteral, featArray));
			expect(tiger.getSkillBonus('Perception')).to.equal(4);
			tiger.setSkills([{'name': 'Perception', 'ranks': 9}]);
			expect(tiger.getSkillBonus('Perception')).to.equal(16);
			tiger.setSkills([{'name': 'Perception', 'ranks': 10}]);
			expect(tiger.getSkillBonus('Perception')).to.equal(20);
		});

		it('applies the Skill Focus feat correctly to specialised skills', () => {
			const featArray = {
				feats: [{
					name: 'Skill Focus',
					details: [{
						name: 'Profession',
						specialty: 'butcher',
					}]
				}]
			};
			let tiger = new Monster(Object.assign({}, tigerLiteral, featArray));
			expect(tiger.getSkillBonus('Profession', 'butcher')).to.equal(4);
			tiger.setSkills([{'name': 'Profession', 'specialty': 'butcher', 'ranks': 9}]);
			expect(tiger.getSkillBonus('Profession', 'butcher')).to.equal(13);
			tiger.setSkills([{'name': 'Profession', 'specialty': 'butcher', 'ranks': 10}]);
			expect(tiger.getSkillBonus('Profession', 'butcher')).to.equal(17);
		});
	});
	
	describe('Melee weapons', function(){
		it('calculates the attack bonus for a single natural weapon', function(){
			var cube, tiger;
		
			cube = new Monster(cubeLiteral);
			expect(cube.getMeleeWeaponAttackBonus('slam')).to.equal(2);
			tiger = new Monster(tigerLiteral);
			delete tiger.melee.bite;
			expect(tiger.getMeleeWeaponAttackBonus('claw')).to.equal(9);
		});
		
		it('calculates the damage bonus for a single natural weapon', function(){
			var cube, tiger;
		
			cube = new Monster(cubeLiteral);
			// single attack
			expect(cube.getMeleeWeaponDamageBonus('slam')).to.equal(0);
			cube.Str = 14;
			expect(cube.getMeleeWeaponDamageBonus('slam')).to.equal(3);
			// multiple attacks
			tiger = new Monster(tigerLiteral);
			delete tiger.melee.bite;
			expect(tiger.getMeleeWeaponDamageBonus('claw')).to.equal(6);
		});
		
		it('rounds down the damage bonus if not a whole number', function(){
			var cube;
		
			cube = new Monster(cubeLiteral);
			cube.Str = 16;
			expect(cube.getMeleeWeaponDamageBonus('slam')).to.equal(4);
		});
		
		it('produces the melee weapon formula', function(){
			var cube, tiger;
		
			cube = new Monster(cubeLiteral);
			// single attack
			expect(cube.getMeleeWeaponFormula('slam')).to.equal('slam +2 (1d6 plus 1d6 acid)');
			cube.Str = 14;
			expect(cube.getMeleeWeaponFormula('slam')).to.equal('slam +4 (1d6+3 plus 1d6 acid)');
			cube.melee.slam.extraDamage.push('grab');
			expect(cube.getMeleeWeaponFormula('slam')).to.equal('slam +4 (1d6+3 plus 1d6 acid plus grab)');
			// multiple attacks
			tiger = new Monster(tigerLiteral);
			delete tiger.melee.bite;
			expect(tiger.getMeleeWeaponFormula('claw')).to.equal('2 claws +9 (1d8+6 plus grab)');
		});
	});
	
	describe('DC', function(){
		it('calculates a DC based on Str', function(){
			var tiger = new Monster(tigerLiteral);
			expect(tiger.getDC("Str")).to.equal(19);
			tiger.Str = 10;
			expect(tiger.getDC("Str")).to.equal(13);
			tiger.Str = 6;
			expect(tiger.getDC("Str")).to.equal(11);
		});
		
		it('calculates a DC based on Dex', function(){
			var tiger = new Monster(tigerLiteral);
			expect(tiger.getDC("Dex")).to.equal(15);
			tiger.Dex = 10;
			expect(tiger.getDC("Dex")).to.equal(13);
			tiger.Dex = 6;
			expect(tiger.getDC("Dex")).to.equal(11);
		});
		
		it('calculates a DC based on Con', function(){
			var tiger = new Monster(tigerLiteral);
			expect(tiger.getDC("Con")).to.equal(16);
			tiger.Con = 10;
			expect(tiger.getDC("Con")).to.equal(13);
			tiger.Con = 6;
			expect(tiger.getDC("Con")).to.equal(11);
		});
		
		it('calculates a DC based on Int', function(){
			var tiger = new Monster(tigerLiteral);
			expect(tiger.getDC("Int")).to.equal(9);
			tiger.Int = 10;
			expect(tiger.getDC("Int")).to.equal(13);
			tiger.Int = 16;
			expect(tiger.getDC("Int")).to.equal(16);
		});
		
		it('calculates a DC based on Wis', function(){
			var tiger = new Monster(tigerLiteral);
			expect(tiger.getDC("Wis")).to.equal(14);
			tiger.Wis = 10;
			expect(tiger.getDC("Wis")).to.equal(13);
			tiger.Wis = 6;
			expect(tiger.getDC("Wis")).to.equal(11);
		});
		
		it('calculates a DC based on Cha', function(){
			var tiger = new Monster(tigerLiteral);
			expect(tiger.getDC("Cha")).to.equal(11);
			tiger.Cha = 10;
			expect(tiger.getDC("Cha")).to.equal(13);
			tiger.Cha = 16;
			expect(tiger.getDC("Cha")).to.equal(16);
		});
		
		it('returns undefined if the stat is invalid for the monster', function(){
			var monster = new Monster();
			expect(monster.getDC('Str')).to.be.undefined;	
		});
		
		it('returns undefined if the given stat is not a valid stat', function(){
			var tiger = new Monster(tigerLiteral);
			expect(tiger.getDC('blah')).to.be.undefined;
		});
	});
	
	describe('Special CMB', function(){
		it('returns the list of maneuvers that have a special CMB', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.specialCMB = [
				{ 
					name: 'grapple', 
					components: [ { 
						name: 'grab', 
						type: 'melee', 
						bonus: 4 
					} ]
				}, 
				{ 
					name: 'overrun', 
					components: [ { 
						name: 'Improved Overrun', 
						type: 'feat', 
						bonus: 2 
					} ] 
				}];
			expect(tiger.getSpecialCMBList()).to.deep.equal(['grapple', 'overrun']);
		});
		
		it('returns an empty array if there are no maneuvers with special CMB', function(){
			var monster = new Monster();
			expect(monster.getSpecialCMBList()).to.deep.equal([]);
		});
		
		it('calculates the correct CMB for the given special maneuver', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.specialCMB = [
				{ 
					name: 'grapple', 
					components: [ { 
						name: 'grab', 
						type: 'melee', 
						bonus: 4 
					} ]
				}, 
				{ 
					name: 'overrun', 
					components: [ { 
						name: 'Improved Overrun', 
						type: 'feat', 
						bonus: 2 
					} ] 
				}];
			expect(tiger.getCMB()).to.equal(11);
			expect(tiger.getCMB('grapple')).to.equal(15);
			expect(tiger.getCMB('overrun')).to.equal(13);
		});
		
		it('calculates the correct CMB when there are several components for a given maneuver', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.specialCMB = [
				{ 
					name: 'grapple', 
					components: [ 
						{ 
							name: 'grab', 
							type: 'melee', 
							bonus: 4 
						},
						{
							name: 'Improved Grapple',
							type: 'feat',
							bonus: 2
						},
						{
							name: 'Greater Grapple',
							type: 'feat',
							bonus: 2
						}
					]
				}, 
				{ 
					name: 'overrun', 
					components: [ 
						{ 
							name: 'Improved Overrun', 
							type: 'feat', 
							bonus: 2 
						},
						{
							name: 'Greater Overrun',
							type: 'feat',
							bonus: 2
						}
					] 
				}];
			expect(tiger.getCMB()).to.equal(11);
			expect(tiger.getCMB('grapple')).to.equal(19);
			expect(tiger.getCMB('overrun')).to.equal(15);
		});
		
		it('returns the default CMB if given an invalid maneuver name', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.specialCMB = [
				{ 
					name: 'grapple', 
					components: [ { 
						name: 'grab', 
						type: 'melee', 
						bonus: 4 
					} ]
				}];
			expect(tiger.getCMB()).to.equal(11);
			expect(tiger.getCMB('blah')).to.equal(11);
		});
	});
	
	describe('getListOfValues', function(){
		it('returns the list of all values with the given parameters', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.specialCMB = [
				{ 
					name: 'grapple', 
					components: [ { 
						name: 'grab', 
						type: 'melee', 
						bonus: 4 
					} ]
				}, 
				{ 
					name: 'overrun', 
					components: [ { 
						name: 'Improved Overrun', 
						type: 'feat', 
						bonus: 2 
					} ] 
				}];
			expect(tiger.getListOfValues('specialCMB', 'name')).to.deep.equal(['grapple', 'overrun']);
		});
		
		it('returns an empty array if the array does not exist', function(){
			var monster = new Monster();
			expect(monster.getListOfValues('specialCMB', 'name')).to.deep.equal([]);
		});
		
		it('returns an undefined value for each object that doesn\'t have the given attribute', function(){
			var monster = new Monster();
			monster.specialCMB = [
					{ one: 1, two: 2 }, 
					{ name: 'grapple' }, 
					{ blah: 'blah' }];
			expect(monster.getListOfValues('specialCMB', 'name')).to.deep.equal([undefined, 'grapple', undefined]);
		});
		
	});
	
	describe('Special CMD', function(){
		it('returns the list of maneuvers that have a special CMD', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.specialCMD = [
				{ 
					name: 'grapple', 
					components: [ { 
						name: 'Improved Grapple', 
						type: 'feat', 
						bonus: 2 
					} ]
				}, 
				{ 
					name: 'trip', 
					components: [ { 
						name: 'racial', 
						type: 'racial', 
						bonus: 8 
					} ] 
				}];
			expect(tiger.getSpecialCMDList()).to.deep.equal(['grapple', 'trip']);
		});
		
		it('returns an empty array if there are no maneuvers with special CMD', function(){
			var monster = new Monster();
			expect(monster.getSpecialCMDList()).to.deep.equal([]);
		});
		
		it('calculates the correct CMD for the given special maneuver', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.specialCMD = [
				{ 
					name: 'trip', 
					components: [ { 
						name: 'racial', 
						type: 'racial', 
						bonus: 8 
					} ]
				}, 
				{ 
					name: 'overrun', 
					components: [ { 
						name: 'Improved Overrun', 
						type: 'feat', 
						bonus: 2 
					} ] 
				}];
			expect(tiger.getCMD()).to.equal(23);
			expect(tiger.getCMD('trip')).to.equal(31);
			expect(tiger.getCMD('overrun')).to.equal(25);
		});
		
		it('calculates the correct CMD when there are several components for a given maneuver', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.specialCMD = [
				{ 
					name: 'trip', 
					components: [ 
						{ 
							name: 'trip', 
							type: 'racial', 
							bonus: 8
						},
						{
							name: 'Improved Trip',
							type: 'feat',
							bonus: 2
						}
					]
				}, 
				{ 
					name: 'overrun', 
					components: [ 
						{ 
							name: 'Improved Overrun', 
							type: 'feat', 
							bonus: 2 
						},
						{
							name: 'overrun',
							type: 'racial',
							bonus: 4
						}
					] 
				}];
			expect(tiger.getCMD()).to.equal(23);
			expect(tiger.getCMD('trip')).to.equal(33);
			expect(tiger.getCMD('overrun')).to.equal(29);
		});
		
		it('returns the default CMD if given an invalid maneuver name', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.specialCMD = [
				{ 
					name: 'trip', 
					components: [ { 
						name: 'trip', 
						type: 'racial', 
						bonus: 8
					} ]
				}];
			expect(tiger.getCMD()).to.equal(23);
			expect(tiger.getCMD('blah')).to.equal(23);
		});
		
		it('returns Number.POSITIVE_INFINITY if the monster is immune to the maneuver', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.specialCMD = [
				{ 
					name: 'trip',
					cantFail: true,
					components: [{ name: 'Improved Trip', type: 'feat', bonus: 2 }]
				}];
			expect(tiger.getCMD()).to.equal(23);
			expect(tiger.getCMD('trip')).to.equal(Number.POSITIVE_INFINITY);
		});
		
	});
	
	describe('setSkills', function(){
		it('sets up the skills data in the monster from the JSON representation passed as parameter', function(){
			var tiger = new Monster(tigerLiteral);
			const skillArray = [{'name': 'Acrobatics', 'ranks': 4}, {'name': 'Stealth', 'ranks': 4, 'racial': 8}];
			tiger.setSkills(skillArray);
			expect(tiger.skills).to.not.equal(skillArray);
			expect(tiger.skills).to.deep.equal(skillArray);
			expect(tiger.skillSet).to.exist;
			expect(tiger.skillSet).to.be.an.instanceof(Object);
			expect(tiger.skillSet).to.deep.equal({
				'Acrobatics': {'name': 'Acrobatics', 'ranks': 4}, 
				'Stealth': {'name': 'Stealth', 'ranks': 4, 'racial': 8}
			});
		});

		it('initialises the skills data correctly when there is no JSON available', function(){
			var tiger = new Monster(tigerLiteral);
			tiger.setSkills();
			expect(tiger.skills).to.deep.equal([]);
			expect(tiger.skillSet).to.exist;
			expect(tiger.skillSet).to.deep.equal({});
		});

		it('sets up specialised skills properly', () => {
			let dragon = new Monster(tigerLiteral);
			dragon.type = 'dragon';
			dragon.setSkills([
				{'name': 'Craft', 'specialty': 'alchemy', 'ranks': 2}, 
				{'name': 'Knowledge', 'specialty': 'nature', 'ranks': 4, 'racial': 8},
				{'name': 'Knowledge', 'specialty': 'religion', 'ranks': 4}
				]);
			expect(dragon.skills).to.deep.equal([
				{'name': 'Craft', 'specialty': 'alchemy', 'ranks': 2}, 
				{'name': 'Knowledge', 'specialty': 'nature', 'ranks': 4, 'racial': 8},
				{'name': 'Knowledge', 'specialty': 'religion', 'ranks': 4}
				]);
			expect(dragon.skillSet).to.exist;
			expect(dragon.skillSet).to.be.an.instanceof(Object);
			expect(dragon.skillSet).to.deep.equal({
				'Craft': { 
					'alchemy': {'name': 'Craft', 'specialty': 'alchemy', 'ranks': 2}
				}, 
				'Knowledge': {
					'nature': {'name': 'Knowledge', 'specialty': 'nature', 'ranks': 4, 'racial': 8},
					'religion': {'name': 'Knowledge', 'specialty': 'religion', 'ranks': 4}
				}
			});
		});
	});

	describe('isClassSkill', () => {
		it('returns true when the given skill is a class skill for the monster type', () => {
			let monster = new Monster(tigerLiteral);
			// those skills are class skills for animals
			expect(monster.isClassSkill('Acrobatics')).to.be.true;
			expect(monster.isClassSkill('Climb')).to.be.true;
			expect(monster.isClassSkill('Fly')).to.be.true;
		});

		it('returns false when the given skill is not a class skill for the monster type', () => {
			let monster = new Monster(tigerLiteral);
			// those skills are not class skills for animals
			expect(monster.isClassSkill('Appraise')).to.be.false;
			expect(monster.isClassSkill('Bluff')).to.be.false;
			expect(monster.isClassSkill('Use Magic Device')).to.be.false;
			monster.type = 'ooze';
			// this skill is class skill for animals (tested above) but not for oozes
			expect(monster.isClassSkill('Acrobatics')).to.be.false;
		});

		it('distinguishes between specialties of the same skill family', () => {
			let monster = new Monster(tigerLiteral);
			monster.type = 'fey';
			expect(monster.isClassSkill('Knowledge', 'geography')).to.be.true;
			expect(monster.isClassSkill('Knowledge', 'planes')).to.be.false;
		});
	});

	describe('getSkillsList', function(){
		it('returns an empty array when the monster has no skills with bonuses', function(){
			var tiger = new Monster(tigerLiteral);
			expect(tiger.getSkillsList()).to.deep.equal([]);
		});
		
		it('returns Climb and Swim when the monster has the corresponding speeds', function(){
			var tiger = new Monster(tigerLiteral),
				list;
			
			tiger.speed = { land: 30, climb: 20 };
			expect(tiger.getSkillsList()).to.deep.equal([{name: 'Climb'}]);
			tiger.speed = { land: 30, swim: 30 };
			expect(tiger.getSkillsList()).to.deep.equal([{name: 'Swim'}]);
			tiger.speed = { land: 30, climb: 20, swim: 20 };
			list = tiger.getSkillsList();
			expect(list).to.be.an.instanceof(Array);
			expect(list).to.have.length(2);
			expect(list).to.deep.include({name: 'Climb'});
			expect(list).to.deep.include({name: 'Swim'});
		});

		it('returns the correct skills', function() {
			var tiger = new Monster(tigerLiteral);
			tiger.setSkills([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Survival', 'ranks': 5, 'racial': 2}
			]);
			expect(tiger.getSkillsList()).to.deep.equal([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Survival', 'ranks': 5, 'racial': 2}
			]);
		});

		it('returns specialised skills as well', () => {
			var tiger = new Monster(tigerLiteral);
			tiger.setSkills([
				{'name': 'Craft', 'specialty': 'pawprints', 'ranks': 3}, 
				{'name': 'Craft', 'specialty': 'advanced pawprints', 'ranks': 4, 'racial': 8}, 
				{'name': 'Knowledge', 'specialty': 'nature', 'ranks': 5, 'racial': 2}
			]);
			expect(tiger.getSkillsList()).to.deep.equal([
				{'name': 'Craft', 'specialty': 'pawprints', 'ranks': 3}, 
				{'name': 'Craft', 'specialty': 'advanced pawprints', 'ranks': 4, 'racial': 8}, 
				{'name': 'Knowledge', 'specialty': 'nature', 'ranks': 5, 'racial': 2}
			]);
		});

		it('adds Climb and Swim to the list when the monster has the corresponding speeds', function(){
			var tiger = new Monster(tigerLiteral);
			
			tiger.setSkills([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Survival', 'ranks': 5, 'racial': 2}
			]);
			tiger.speed = { land: 30, climb: 20 };
			expect(tiger.getSkillsList()).to.deep.equal([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Survival', 'ranks': 5, 'racial': 2},
				{'name': 'Climb'}
			]);
			tiger.speed = { land: 30, swim: 30 };
			expect(tiger.getSkillsList()).to.deep.equal([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Survival', 'ranks': 5, 'racial': 2},
				{'name': 'Swim'}
			]);
			tiger.speed = { land: 30, climb: 20, swim: 20 };
			expect(tiger.getSkillsList()).to.deep.equal([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Survival', 'ranks': 5, 'racial': 2},
				{'name': 'Climb'},
				{'name': 'Swim'}
			]);
		});

		it('only adds Climb or Swim when they are not already present in the list', function(){
			var tiger = new Monster(tigerLiteral);
			
			// Climb
			tiger.setSkills([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Climb', 'ranks': 4},
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Survival', 'ranks': 5, 'racial': 2}
			]);
			tiger.speed = { land: 30, climb: 20 };
			expect(tiger.getSkillsList()).to.deep.equal([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Climb', 'ranks': 4},
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Survival', 'ranks': 5, 'racial': 2}
			]);
			// Swim
			tiger.setSkills([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Swim', 'ranks': 5, 'racial': 2}
			]);
			tiger.speed = { land: 30, swim: 30 };
			expect(tiger.getSkillsList()).to.deep.equal([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Swim', 'ranks': 5, 'racial': 2}
			]);
			// both
			tiger.setSkills([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Climb', 'ranks': 4},
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Swim', 'ranks': 5, 'racial': 2}
			]);
			tiger.speed = { land: 30, climb: 20, swim: 20 };
			expect(tiger.getSkillsList()).to.deep.equal([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Climb', 'ranks': 4},
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Swim', 'ranks': 5, 'racial': 2}
			]);
			// skill bonus in Climb with Swim speed
			tiger.setSkills([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Climb', 'ranks': 4},
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Survival', 'ranks': 5, 'racial': 2}
			]);
			tiger.speed = { land: 30, swim: 30 };
			expect(tiger.getSkillsList()).to.deep.equal([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Climb', 'ranks': 4},
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Survival', 'ranks': 5, 'racial': 2},
				{'name': 'Swim'}
			]);
			// skill bonus in Swim with Climb speed
			tiger.setSkills([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Swim', 'ranks': 5, 'racial': 2}
			]);
			tiger.speed = { land: 30, climb: 20 };
			expect(tiger.getSkillsList()).to.deep.equal([
				{'name': 'Acrobatics', 'ranks': 3}, 
				{'name': 'Stealth', 'ranks': 4, 'racial': 8}, 
				{'name': 'Swim', 'ranks': 5, 'racial': 2},
				{'name': 'Climb'}
			]);
		});
	});

	describe('getRacialModifier', function(){
		it('returns undefined if monster doesn\'t have the given skill', function(){
			var monster = new Monster();
			expect(monster.getRacialModifier('Acrobatics')).to.be.undefined;
		});

		it('returns undefined if there is no racial modifier for the given skill', function(){
			var monster = new Monster();
			monster.setSkills([{name: 'Acrobatics', ranks: 4}]);
			expect(monster.getRacialModifier('Acrobatics')).to.be.undefined;
		});

		it('returns the correct racial modifier for the given skill', function(){
			var monster = new Monster();
			monster.setSkills([{name: 'Acrobatics', ranks: 4, racial: 7}]);
			expect(monster.getRacialModifier('Acrobatics')).to.equal(7);
		});

		it('returns undefined if monster doesn\'t have the given specialised skill', function(){
			var monster = new Monster();
			expect(monster.getRacialModifier('Craft', 'traps')).to.be.undefined;
		});

		it('returns undefined if there is no racial modifier for the given specialised skill', function(){
			var monster = new Monster();
			monster.setSkills([{name: 'Craft', specialty: 'traps', ranks: 4}]);
			expect(monster.getRacialModifier('Craft', 'traps')).to.be.undefined;
		});

		it('returns the correct racial modifier for the given specialised skill', function(){
			var monster = new Monster();
			monster.setSkills([{name: 'Craft', specialty: 'traps', ranks: 4, racial: 7}]);
			expect(monster.getRacialModifier('Craft', 'traps')).to.equal(7);
		});
	});

	describe('getFeatsList', function(){
		it('returns an empty array when the monster has no feats', function(){
			var monster = new Monster();
			expect(monster.getFeatsList()).to.deep.equal([]);
		});

		it('returns a copy of the monster\'s feats', function(){
			const tiger = new Monster(tigerLiteral);
			const feats = tiger.getFeatsList();
			expect(feats).to.not.equal(tiger.feats);
			expect(feats).to.deep.equal(tiger.feats);
		});
	});

	describe('hasFeat', () => {
		it('returns true for simple feats if the monster has the feat', () => {
			const monster = new Monster({feats: [{name:'Improved Initiative'}]});
			expect(monster.feats).to.be.an('array').with.lengthOf(1);
			expect(monster.hasFeat('Improved Initiative')).to.be.true;
		});

		it('returns false if the monster doesn\'t have the feat', () => {
			const monster = new Monster({feats: [{name:'Improved Initiative'}]});
			expect(monster.hasFeat('Acrobatic')).to.be.false;
		});
		
		it('returns true for feats with details if the monster has the feat with the correct details', () => {
			const monster = new Monster({feats: [{name:'Skill Focus', details: [{name: 'Perception'}]}]});
			expect(monster.hasFeat('Skill Focus', 'Perception')).to.be.true;
		});

		it('returns false for feats with details if the monster has the feat but not with the given details', () => {
			const monster = new Monster({feats: [{name:'Skill Focus', details: [{name: 'Perception'}]}]});
			expect(monster.hasFeat('Skill Focus', 'Stealth')).to.be.false;
		});
		
		it('returns true for feats with specialty details if the monster has the feat with the correct details and specialty', () => {
			const monster = new Monster({feats: [{name:'Skill Focus', details: [{name: 'Knowledge', specialty: 'planes'}]}]});
			expect(monster.hasFeat('Skill Focus', 'Knowledge', 'planes')).to.be.true;
		});

		it('returns false for feats with specialty details if the monster has the feat and details but not with the given specialty', () => {
			const monster = new Monster({feats: [{name:'Skill Focus', details: [{name: 'Knowledge', specialty: 'planes'}]}]});
			expect(monster.hasFeat('Skill Focus', 'Knowledge', 'geography')).to.be.false;			
		});

		it('returns the same value when detailed feats are represented grouped or separately', () => {
			const grouped = new Monster({feats: [
				{name:'Skill Focus', details: [
					{name: 'Perception'},
					{name: 'Stealth'}
				]}
			]});
			const separate = new Monster({feats: [
				{name:'Skill Focus', details: [{name: 'Perception'}]},
				{name:'Skill Focus', details: [{name: 'Stealth'}]}
			]});

			expect(grouped.hasFeat('Skill Focus', 'Perception')).to.be.true;
			expect(separate.hasFeat('Skill Focus', 'Perception')).to.be.true;

			expect(grouped.hasFeat('Skill Focus', 'Stealth')).to.be.true;
			expect(separate.hasFeat('Skill Focus', 'Stealth')).to.be.true;

			expect(grouped.hasFeat('Skill Focus', 'Survival')).to.be.false;
			expect(separate.hasFeat('Skill Focus', 'Survival')).to.be.false;
		});

		it('returns the same value when detailed feats with specialty are represented grouped or separately', () => {
			const grouped = new Monster({feats: [
				{name:'Skill Focus', details: [
					{name: 'Knowledge', specialty: 'planes'},
					{name: 'Knowledge', specialty: 'religion'}
				]}
			]});
			const separate = new Monster({feats: [
				{name:'Skill Focus', details: [{name: 'Knowledge', specialty: 'planes'}]},
				{name:'Skill Focus', details: [{name: 'Knowledge', specialty: 'religion'}]}
			]});

			expect(grouped.hasFeat('Skill Focus', 'Knowledge', 'planes')).to.be.true;
			expect(separate.hasFeat('Skill Focus', 'Knowledge', 'planes')).to.be.true;

			expect(grouped.hasFeat('Skill Focus', 'Knowledge', 'religion')).to.be.true;
			expect(separate.hasFeat('Skill Focus', 'Knowledge', 'religion')).to.be.true;
			
			expect(grouped.hasFeat('Skill Focus', 'Knowledge', 'local')).to.be.false;
			expect(separate.hasFeat('Skill Focus', 'Knowledge', 'local')).to.be.false;
		});
	});

	describe('getSkillBonusFromFeats', () => {

		describe('Skill Focus', () => {

			it('returns 0 for a skill that doesn\'t have Skill Focus', () => {
				let monster = new Monster({name: 'monster', type: 'dragon', Int: 20});
				monster.setSkills([{name: 'Appraise', ranks: 5}]);
				expect(monster.getSkillBonusFromFeats('Appraise')).to.equal(0);
			});

			it('returns 3 for a skill that has Skill Focus and less than 10 ranks', () => {
				let monster = new Monster({name: 'monster', type: 'dragon', Int: 20, 
					skills: [{name: 'Appraise', ranks: 5}], 
					feats: [{
						name: 'Skill Focus',
						details: [{name: 'Appraise'}]
					}]
				});
				expect(monster.getSkillBonusFromFeats('Appraise')).to.equal(3);
			});

			it('returns 6 for a skill that has Skill Focus and 10 ranks or more', () => {
				let monster = new Monster({name: 'monster', type: 'dragon', Int: 20,
					skills: [{name: 'Appraise', ranks: 10}],
					feats: [{
						name: 'Skill Focus',
						details: [{name: 'Appraise'}]
					}]
				});
				expect(monster.getSkillBonusFromFeats('Appraise')).to.equal(6);
			});

			it('works with specialised skills', () => {
				let monster = new Monster({name: 'monster', type: 'dragon', Int: 20,
					skills: [{name: 'Knowledge', specialty: 'planes', ranks: 10}],
					feats: [{
						name: 'Skill Focus',
						details: [{
								name: 'Knowledge',
								specialty: 'planes',
							}]
					}]
				});
				expect(monster.getSkillBonusFromFeats('Knowledge', 'planes')).to.equal(6);
				expect(monster.getSkillBonusFromFeats('Knowledge', 'religion')).to.equal(0);
			});

			it('works when skill focus is represented as separate feats', () => {
				let monster = new Monster({name: 'monster', type: 'dragon', Int: 20,
					skills: [
						{name: 'Knowledge', specialty: 'planes', ranks: 10},
						{name: 'Knowledge', specialty: 'religion', ranks: 2}
					],
					feats: [
						{
							name: 'Skill Focus',
							details: [{name: 'Knowledge', specialty: 'planes'}]
						},
						{
							name: 'Skill Focus',
							details: [{name: 'Knowledge', specialty: 'religion'}]
						}
					]
				});
				expect(monster.getSkillBonusFromFeats('Knowledge', 'planes')).to.equal(6);
				expect(monster.getSkillBonusFromFeats('Knowledge', 'religion')).to.equal(3);
			});
		});
	});
});
