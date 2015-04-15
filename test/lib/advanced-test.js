/* jshint node: true */
"use strict";

var expect = require('chai').expect,
	Monster = require('../../lib/monster'),
	advanced = require('../../lib/advanced');

var cubeLiteral = {
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
		baseFort: 1,
		baseRef: 1,
		baseWill: 1,
		melee: {
			slam: { 
				name: 'slam', 
				type: 'natural', 
				nbAttacks: 1, 
				nbDice: 1, 
				dieType: 6
			}
		}
	};

describe('Advanced Template', function(){
	describe('isCompatible', function(){
		it('always returns true for Advanced', function(){
			var monster;
			monster = new Monster(cubeLiteral);
			expect(advanced.isCompatible(monster)).to.be.true();
		});
	});
	describe('apply', function(){
		it('increases the CR by one step including for fractions', function(){
			var monster;
			monster = new Monster(cubeLiteral);
			monster.CR = '1/8';
			advanced.apply(monster);
			expect(monster.CR).to.equal('1/6');
			monster.CR = '1/2';
			advanced.apply(monster);
			expect(monster.CR).to.equal(1);
			advanced.apply(monster);
			expect(monster.CR).to.equal(2);
		});
		it('modifies the given monster according to the Advanced pattern', function(){
			var monster;
			monster = new Monster(cubeLiteral);
			advanced.apply(monster);
			expect(monster.CR).to.equal(4);
			expect(monster.naturalArmor).to.equal(2);
			expect(monster.Str).to.equal(14);
			expect(monster.Dex).to.equal(5);
			expect(monster.Con).to.equal(30);
			expect(monster.Int).to.be.undefined();
			expect(monster.Wis).to.equal(5);
			expect(monster.Cha).to.equal(5);
			expect(monster.getXP()).to.equal(1200);
			expect(monster.getInit()).to.equal(-3);
			expect(monster.getHP()).to.equal(58);
			expect(monster.getHPFormula()).to.equal('4d8+40');
			expect(monster.getFortitude()).to.equal(11);
			expect(monster.getReflex()).to.equal(-2);
			expect(monster.getWill()).to.equal(-2);
			expect(monster.getBaseAttackBonus()).to.equal(3);	// unchanged
			expect(monster.getCMB()).to.equal(6);
			expect(monster.getCMD()).to.equal(13);
			expect(monster.getAC()).to.equal(8);
			expect(monster.getTouchAC()).to.equal(6);
			expect(monster.getFlatFootedAC()).to.equal(8);
			expect(monster.getSkillBonus('Perception')).to.equal(-3);
			expect(monster.getMeleeWeaponAttackBonus('slam')).to.equal(4);
			expect(monster.getMeleeWeaponDamageBonus('slam')).to.equal(3);
		});
		it('doesn\'t increase Int if 2 or less', function(){
			var monster;
			monster = new Monster(cubeLiteral);
			monster.Int = 1;
			advanced.apply(monster);
			expect(monster.Int).to.equal(1);
			monster.Int = 2;
			advanced.apply(monster);
			expect(monster.Int).to.equal(2);
			monster.Int = 3;
			advanced.apply(monster);
			expect(monster.Int).to.equal(7);
		});
	});
});
