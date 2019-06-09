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
			expect(advanced.isCompatible(monster)).to.be.true;
		});
	});

	describe('apply', function(){

		it('returns null when the given monster is null', () => {
			expect(advanced.apply(null)).to.be.null;
		});

		it('returns a new monster, leaving the original untouched', () => {
			const monster = new Monster();
			const monsterCopy = new Monster(monster);
			expect(monster).to.deep.equal(monsterCopy);

			const result = advanced.apply(monster);
			
			expect(result).to.be.an('object');
			expect(result).to.not.equal(monster);
			expect(monster).to.deep.equal(monsterCopy);
		});

		it('increases the CR by one step including for fractions', function(){
			let monster;
			let newMonster;
			monster = new Monster(cubeLiteral);
			
			monster.CR = '1/8';
			newMonster = advanced.apply(monster);
			expect(newMonster.CR).to.equal('1/6');

			monster.CR = '1/2';
			newMonster = advanced.apply(monster);
			expect(newMonster.CR).to.equal(1);
			
			monster.CR = 1;
			newMonster = advanced.apply(monster);
			expect(newMonster.CR).to.equal(2);
		});

		it('modifies the given monster according to the Advanced pattern', function(){
			const baseMonster = new Monster(cubeLiteral);
			const monster = advanced.apply(baseMonster);

			expect(monster.CR).to.equal(4);
			expect(monster.naturalArmor).to.equal(2);
			expect(monster.Str).to.equal(14);
			expect(monster.Dex).to.equal(5);
			expect(monster.Con).to.equal(30);
			expect(monster.Int).to.be.undefined;
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
			let monster;
			let newMonster;
			monster = new Monster(cubeLiteral);
			
			monster.Int = 1;
			newMonster = advanced.apply(monster);
			expect(newMonster.Int).to.equal(1);
			
			monster.Int = 2;
			newMonster = advanced.apply(monster);
			expect(newMonster.Int).to.equal(2);
			
			monster.Int = 3;
			newMonster = advanced.apply(monster);
			expect(newMonster.Int).to.equal(7);
		});
	});

	describe('getErrorMessage', () => {
		
		it('returns an empty string since there is no incompatible creature', () => {
			expect(advanced.getErrorMessage()).to.equal('');
		});
	});
});
