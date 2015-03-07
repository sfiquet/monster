/* jshint node: true */
"use strict";

var expect = require('chai').expect,
	Monster = require('../../lib/monster');

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
		}
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
			expect(myMonster.Str).to.be.undefined();
			expect(myMonster.Dex).to.be.undefined();
			expect(myMonster.Con).to.be.undefined();
			expect(myMonster.Int).to.be.undefined();
			expect(myMonster.Wis).to.be.undefined();
			expect(myMonster.Cha).to.be.undefined();
			expect(myMonster.baseFort).to.equal(0);
			expect(myMonster.baseRef).to.equal(0);
			expect(myMonster.baseWill).to.equal(0);
			expect(myMonster.senses).to.exist();
			expect(myMonster.senses).to.be.an.instanceof(Array);
			expect(myMonster.senses).to.be.empty();
			expect(myMonster.space).to.equal(5);
			expect(myMonster.reach).to.equal(5);
			expect(myMonster.extraReach).to.be.undefined();
			expect(myMonster.SQ).to.be.undefined();
			expect(myMonster.optDefense).to.be.undefined();
			expect(myMonster.specialAtk).to.be.undefined();
			expect(myMonster.specialAbilities).to.be.undefined();
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
					senses: [
							{name: 'darkvision', value: 60, unit: 'ft.'}, 
							{name: 'scent'}
							],
					optDefense: {
						abilities: ['freedom of movement', 'ferocity'],
						immune: ['cold', 'fire', 'poison']
					},
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
			expect(myMonster.senses).to.have.length(2);
			expect(myMonster.senses[0]).to.deep.equal({name: 'darkvision', value: 60, unit: 'ft.'});
			expect(myMonster.senses[1]).to.deep.equal({name: 'scent'});
			expect(myMonster.optDefense).to.exist();
			expect(myMonster.optDefense.abilities).to.exist();
			expect(myMonster.optDefense.abilities).to.deep.equal(['freedom of movement', 'ferocity']);
			expect(myMonster.optDefense.immune).to.exist();
			expect(myMonster.optDefense.immune).to.deep.equal(['cold', 'fire', 'poison']);
			expect(myMonster.space).to.equal(10);
			expect(myMonster.reach).to.equal(5);
			expect(myMonster.extraReach).to.have.length(2);
			expect(myMonster.extraReach[0]).to.deep.equal({distance: 20, weapons: ['arms', 'tentacles']});
			expect(myMonster.extraReach[1]).to.deep.equal({distance: 10, weapons: ['bite']});
			expect(myMonster.specialAtk).to.have.length(2);
			expect(myMonster.specialAtk[0]).to.deep.equal({name: 'bleed', url: 'http://paizo.com/pathfinderRPG/prd/monsters/universalMonsterRules.html#bleed', details: [{ text: '2d6' }]});
			expect(myMonster.specialAtk[1]).to.deep.equal({name: 'corrosion'});
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
			expect(tiger.getXP()).to.be.undefined();
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
			expect(ACModifiers).to.exist();
			expect(ACModifiers).to.have.ownProperty('Dex');
			expect(ACModifiers.Dex).to.equal(2);
			expect(ACModifiers).to.have.ownProperty('size');
			expect(ACModifiers.size).to.equal(-1);
			expect(ACModifiers).to.have.ownProperty('natural');
			expect(ACModifiers.natural).to.equal(3);
		});
		
		it('calculates untrained skill bonus', function(){
			expect(tiger.getSkillBonus('Perception')).to.equal(1);
			tiger.Wis = 1;
			expect(tiger.getSkillBonus('Perception')).to.equal(-5);
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
			expect(monster.getDC('Str')).to.be.undefined();	
		});
		
		it('returns undefined if the given stat is not a valid stat', function(){
			var tiger = new Monster(tigerLiteral);
			expect(tiger.getDC('blah')).to.be.undefined();
		});
	});
});
