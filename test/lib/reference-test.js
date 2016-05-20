/* jshint node: true */
'use strict';

var expect = require('chai').expect,
	ref = require('../../lib/reference');

describe('Look-up tables', function(){
	describe('getCRId', function(){
		it('gets an order id for the given CR', function(){
			expect(ref.getCRId('1/8')).to.equal(0);
			expect(ref.getCRId('1/6')).to.equal(1);
			expect(ref.getCRId('1/2')).to.equal(4);
			expect(ref.getCRId(1)).to.equal(5);
			expect(ref.getCRId(30)).to.equal(34);
		});
		it('returns undefined for any invalid CR', function(){
			expect(ref.getCRId(0)).to.be.undefined();
			expect(ref.getCRId(-1)).to.be.undefined();
			expect(ref.getCRId('1/5')).to.be.undefined();
			expect(ref.getCRId(2.4)).to.be.undefined();
		});
	});
	
	describe('getCR', function(){
		it('returns the CR corresponding to the id', function(){
			expect(ref.getCR(0)).to.equal('1/8');
			expect(ref.getCR(1)).to.equal('1/6');
			expect(ref.getCR(4)).to.equal('1/2');
			expect(ref.getCR(5)).to.equal(1);
			expect(ref.getCR(10)).to.equal(6);
		});
		it('returns undefined for any invalid id', function(){
			expect(ref.getCR(-1)).to.be.undefined();
			expect(ref.getCR(2.5)).to.be.undefined();
			expect(ref.getCR('1/8')).to.be.undefined();
		});
	});
	
	describe('getXP', function(){
		it('deduces XP from CR whole values between 1 and 30', function(){
			expect(ref.getXP(1)).to.equal(400);
			expect(ref.getXP(10)).to.equal(9600);
			expect(ref.getXP(30)).to.equal(9830400);
			expect(ref.getXP('30')).to.equal(9830400);
		});
		it('deduces XP from CR fractions expressed as strings', function(){
			expect(ref.getXP('1/2')).to.equal(200);
			expect(ref.getXP('1/3')).to.equal(135);
			expect(ref.getXP('1/8')).to.equal(50);
		});
		it('returns undefined for any other value', function(){
			expect(ref.getXP('1/20')).to.be.undefined();			
			expect(ref.getXP(0)).to.be.undefined();			
			expect(ref.getXP(31)).to.be.undefined();			
			expect(ref.getXP(1.5)).to.be.undefined();			
			expect(ref.getXP(-1)).to.be.undefined();			
		});
	});
	
	describe('getSizeMod', function(){
		it('returns the size modifier for valid size names', function(){
			expect(ref.getSizeMod('Fine')).to.equal(8);
			expect(ref.getSizeMod('Medium')).to.equal(0);
			expect(ref.getSizeMod('Gargantuan')).to.equal(-4);
		});
		it('returns undefined for any other value', function(){
			expect(ref.getSizeMod('fine')).to.be.undefined();
			expect(ref.getSizeMod('')).to.be.undefined();
			expect(ref.getSizeMod(0)).to.be.undefined();
		});
	});
	
	describe('compareSize', function(){
		it('returns a positive value if the first size is bigger', function(){
			expect(ref.compareSize('Colossal', 'Gargantuan')).to.be.above(0);
			expect(ref.compareSize('Medium', 'Tiny')).to.be.above(0);
			expect(ref.compareSize('Diminutive', 'Fine')).to.be.above(0);
		});
		it('returns a negative value if the first size is smaller', function(){
			expect(ref.compareSize('Gargantuan', 'Colossal')).to.be.below(0);
			expect(ref.compareSize('Medium', 'Huge')).to.be.below(0);
			expect(ref.compareSize('Fine', 'Diminutive')).to.be.below(0);
		});
		it('returns zero if the two sizes are equal', function(){
			expect(ref.compareSize('Gargantuan', 'Gargantuan')).to.equal(0);
			expect(ref.compareSize('Fine', 'Fine')).to.equal(0);
		});
		it('returns NaN if either size is invalid', function(){
			expect(ref.compareSize('Gargantuan', 'gargantuan')).to.satisfy(isNaN);
			expect(ref.compareSize('gargantuan', 'Gargantuan')).to.satisfy(isNaN);
			expect(ref.compareSize('', 'Gargantuan')).to.satisfy(isNaN);
			expect(ref.compareSize('gargantuan', 'gargantuan')).to.satisfy(isNaN);
		});
	});

	describe('getSizeIndex', function(){
		it('returns the correct index for valid sizes', function(){
			expect(ref.getSizeIndex('Fine')).to.equal(0);
			expect(ref.getSizeIndex('Diminutive')).to.equal(1);
			expect(ref.getSizeIndex('Tiny')).to.equal(2);
			expect(ref.getSizeIndex('Small')).to.equal(3);
			expect(ref.getSizeIndex('Medium')).to.equal(4);
			expect(ref.getSizeIndex('Large')).to.equal(5);
			expect(ref.getSizeIndex('Huge')).to.equal(6);
			expect(ref.getSizeIndex('Gargantuan')).to.equal(7);
			expect(ref.getSizeIndex('Colossal')).to.equal(8);
		});

		it('returns undefined for invalid sizes', function(){
			expect(ref.getSizeIndex('fine')).to.be.undefined();
			expect(ref.getSizeIndex(0)).to.be.undefined();
		});
	});

	describe('getSizeName', function(){
		it('returns the correct size name for the given index', function(){
			expect(ref.getSizeName(0)).to.equal('Fine');
			expect(ref.getSizeName(1)).to.equal('Diminutive');
			expect(ref.getSizeName(2)).to.equal('Tiny');
			expect(ref.getSizeName(3)).to.equal('Small');
			expect(ref.getSizeName(4)).to.equal('Medium');
			expect(ref.getSizeName(5)).to.equal('Large');
			expect(ref.getSizeName(6)).to.equal('Huge');
			expect(ref.getSizeName(7)).to.equal('Gargantuan');
			expect(ref.getSizeName(8)).to.equal('Colossal');
		});

		it('returns undefined when the index is out of range', function(){
			expect(ref.getSizeName(-1)).to.be.undefined();
			expect(ref.getSizeName(9)).to.be.undefined();
			expect(ref.getSizeName('Colossal')).to.be.undefined();
		});

		it('returns undefined when the index is not a number', function(){
			expect(ref.getSizeName('Colossal')).to.be.undefined();
			expect(ref.getSizeName()).to.be.undefined();
		});
	});

	describe('getNextSizeUp', function(){
		it('returns undefined if there is no size up', function(){
			expect(ref.getNextSizeUp('Colossal')).to.be.undefined();
		});

		it('returns the name of the next size up', function(){
			expect(ref.getNextSizeUp('Fine')).to.equal('Diminutive');
			expect(ref.getNextSizeUp('Medium')).to.equal('Large');
			expect(ref.getNextSizeUp('Huge')).to.equal('Gargantuan');
		});
	});
	
	describe('getNextSizeDown', function(){
		it('returns undefined if there is no size down', function(){
			expect(ref.getNextSizeDown('Fine')).to.be.undefined();
		});

		it('returns the name of the next size down', function(){
			expect(ref.getNextSizeDown('Colossal')).to.equal('Gargantuan');
			expect(ref.getNextSizeDown('Medium')).to.equal('Small');
			expect(ref.getNextSizeDown('Tiny')).to.equal('Diminutive');
		});
	});
	
	describe('getHitDie', function(){
		it('returns an integer representing the hit die for the type provided', function(){
			expect(ref.getHitDie('aberration')).to.equal(8);
			expect(ref.getHitDie('vermin')).to.equal(8);
			expect(ref.getHitDie('construct')).to.equal(10);
			expect(ref.getHitDie('dragon')).to.equal(12);
			expect(ref.getHitDie('fey')).to.equal(6);
		});
		it('returns undefined if the type is invalid', function(){
			expect(ref.getHitDie('Aberration')).to.be.undefined();
			expect(ref.getHitDie('')).to.be.undefined();
		});
	});
	
	describe('getConstructHPBonus', function(){
		it('returns the HP bonus for a construct for the given size', function(){
			expect(ref.getConstructHPBonus('Fine')).to.equal(0);
			expect(ref.getConstructHPBonus('Colossal')).to.equal(80);
			expect(ref.getConstructHPBonus('Small')).to.equal(10);
			expect(ref.getConstructHPBonus('Tiny')).to.equal(0);
			expect(ref.getConstructHPBonus('Medium')).to.equal(20);
		});
		it('returns undefined if the size is invalid', function(){
			expect(ref.getConstructHPBonus('fine')).to.be.undefined();
			expect(ref.getConstructHPBonus('')).to.be.undefined();
			expect(ref.getConstructHPBonus()).to.be.undefined();
			expect(ref.getConstructHPBonus(0)).to.be.undefined();
		});
	});
	
	describe('getHitDieBABFactor', function(){
		it('returns the BAB factor for the given Hit Die', function(){
			expect(ref.getHitDieBABFactor(6)).to.equal(0.5);
			expect(ref.getHitDieBABFactor(8)).to.equal(0.75);
			expect(ref.getHitDieBABFactor(10)).to.equal(1);
			expect(ref.getHitDieBABFactor(12)).to.equal(1);
			expect(ref.getHitDieBABFactor('6')).to.equal(0.5);
		});
		it('returns undefined if the hit die provided is invalid', function(){
			expect(ref.getHitDieBABFactor(7)).to.be.undefined();
			expect(ref.getHitDieBABFactor('')).to.be.undefined();
		});
	});
	
	describe('getAbilityForSkill', function(){
		it('returns the name of the ability associated with the given skill', function(){
			expect(ref.getAbilityForSkill('Acrobatics')).to.equal('Dex');
			expect(ref.getAbilityForSkill('Use Magic Device')).to.equal('Cha');
			expect(ref.getAbilityForSkill('Perception')).to.equal('Wis');
		});
		it('returns undefined if the skill provided is invalid', function(){
			expect(ref.getAbilityForSkill('acrobatics')).to.be.undefined();
			expect(ref.getAbilityForSkill('')).to.be.undefined();
			expect(ref.getAbilityForSkill()).to.be.undefined();
			expect(ref.getAbilityForSkill(2)).to.be.undefined();
		});
	});
	
	describe('getSkillUrl', function(){
		it('returns the url associated with the given skill', function(){
			expect(ref.getSkillUrl('Acrobatics')).to.equal('http://paizo.com/pathfinderRPG/prd/skills/acrobatics.html#acrobatics');
			expect(ref.getSkillUrl('Use Magic Device')).to.equal('http://paizo.com/pathfinderRPG/prd/skills/useMagicDevice.html#use-magic-device');
			expect(ref.getSkillUrl('Knowledge')).to.equal('http://paizo.com/pathfinderRPG/prd/skills/knowledge.html#knowledge');
		});
		
		it('returns undefined for skills not associated with an url', function(){
			expect(ref.getSkillUrl('blarg')).to.be.undefined();
			expect(ref.getSkillUrl('')).to.be.undefined();
			expect(ref.getSkillUrl()).to.be.undefined();
			expect(ref.getSkillUrl('Knowledge (arcana)')).to.be.undefined();
		});
	});

	describe('getTypeUrl', function(){
		it('returns the url associated with the given monster type', function(){
			expect(ref.getTypeUrl('aberration')).to.equal('http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#aberration');
			expect(ref.getTypeUrl('vermin')).to.equal('http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#vermin');
			expect(ref.getTypeUrl('magical beast')).to.equal('http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#magical-beast');
		});
		
		it('returns undefined for types not associated with an url', function(){
			expect(ref.getTypeUrl('blarg')).to.be.undefined();
			expect(ref.getTypeUrl('')).to.be.undefined();
			expect(ref.getTypeUrl()).to.be.undefined();
			expect(ref.getTypeUrl('outsider (native)')).to.be.undefined();
		});
	});
});