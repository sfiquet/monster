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
				dieType: 8
			},
			bite: {
				name: 'bite',
				type: 'natural',
				nbAttacks: 1,
				nbDice: 2,
				dieType: 6
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
				dieType: 6
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
					Str: 23,
					Dex: 15,
					Con: 17,
					Int: 8,
					Wis: 12,
					Cha: 6,
					baseFort: 5, // those should be deduced from type and HD
					baseRef: 5,
					baseWill: 2
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
	});
});
