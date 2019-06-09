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
			expect(ref.getCRId(0)).to.be.undefined;
			expect(ref.getCRId(-1)).to.be.undefined;
			expect(ref.getCRId('1/5')).to.be.undefined;
			expect(ref.getCRId(2.4)).to.be.undefined;
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
			expect(ref.getCR(-1)).to.be.undefined;
			expect(ref.getCR(2.5)).to.be.undefined;
			expect(ref.getCR('1/8')).to.be.undefined;
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
			expect(ref.getXP('1/20')).to.be.undefined;
			expect(ref.getXP(0)).to.be.undefined;
			expect(ref.getXP(31)).to.be.undefined;
			expect(ref.getXP(1.5)).to.be.undefined;
			expect(ref.getXP(-1)).to.be.undefined;
		});
	});
	
	describe('getSizeMod', function(){
		it('returns the size modifier for valid size names', function(){
			expect(ref.getSizeMod('Fine')).to.equal(8);
			expect(ref.getSizeMod('Diminutive')).to.equal(4);
			expect(ref.getSizeMod('Tiny')).to.equal(2);
			expect(ref.getSizeMod('Small')).to.equal(1);
			expect(ref.getSizeMod('Medium')).to.equal(0);
			expect(ref.getSizeMod('Large')).to.equal(-1);
			expect(ref.getSizeMod('Huge')).to.equal(-2);
			expect(ref.getSizeMod('Gargantuan')).to.equal(-4);
			expect(ref.getSizeMod('Colossal')).to.equal(-8);
		});
		it('returns undefined for any other value', function(){
			expect(ref.getSizeMod('fine')).to.be.undefined;
			expect(ref.getSizeMod('')).to.be.undefined;
			expect(ref.getSizeMod(0)).to.be.undefined;
		});
	});
	
	describe('getStealthSizeMod', function(){
		it('returns the Stealth size modifier for valid size names', function(){
			expect(ref.getStealthSizeMod('Fine')).to.equal(16);
			expect(ref.getStealthSizeMod('Diminutive')).to.equal(12);
			expect(ref.getStealthSizeMod('Tiny')).to.equal(8);
			expect(ref.getStealthSizeMod('Small')).to.equal(4);
			expect(ref.getStealthSizeMod('Medium')).to.equal(0);
			expect(ref.getStealthSizeMod('Large')).to.equal(-4);
			expect(ref.getStealthSizeMod('Huge')).to.equal(-8);
			expect(ref.getStealthSizeMod('Gargantuan')).to.equal(-12);
			expect(ref.getStealthSizeMod('Colossal')).to.equal(-16);
		});
		it('returns undefined for any other value', function(){
			expect(ref.getStealthSizeMod('fine')).to.be.undefined;
			expect(ref.getStealthSizeMod('')).to.be.undefined;
			expect(ref.getStealthSizeMod(0)).to.be.undefined;
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
			expect(ref.getSizeIndex('fine')).to.be.undefined;
			expect(ref.getSizeIndex(0)).to.be.undefined;
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
			expect(ref.getSizeName(-1)).to.be.undefined;
			expect(ref.getSizeName(9)).to.be.undefined;
			expect(ref.getSizeName('Colossal')).to.be.undefined;
		});

		it('returns undefined when the index is not a number', function(){
			expect(ref.getSizeName('Colossal')).to.be.undefined;
			expect(ref.getSizeName()).to.be.undefined;
		});
	});

	describe('getNextSizeUp', function(){
		it('returns undefined if there is no size up', function(){
			expect(ref.getNextSizeUp('Colossal')).to.be.undefined;
		});

		it('returns the name of the next size up', function(){
			expect(ref.getNextSizeUp('Fine')).to.equal('Diminutive');
			expect(ref.getNextSizeUp('Medium')).to.equal('Large');
			expect(ref.getNextSizeUp('Huge')).to.equal('Gargantuan');
		});
	});

	describe('getNextSizeDown', function(){
		it('returns undefined if there is no size down', function(){
			expect(ref.getNextSizeDown('Fine')).to.be.undefined;
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
			expect(ref.getHitDie('Aberration')).to.be.undefined;
			expect(ref.getHitDie('')).to.be.undefined;
		});
	});

	describe('getClassSkillsForType', function(){
		it('returns undefined if the type is invalid', function(){
			expect(ref.getClassSkillsForType('Animal')).to.be.undefined;
			expect(ref.getClassSkillsForType('')).to.be.undefined;
		});
		it('returns an empty array for construct, ooze and vermin', () => {
			expect(ref.getClassSkillsForType('construct')).to.be.an('array').that.is.empty;
			expect(ref.getClassSkillsForType('ooze')).to.be.an('array').that.is.empty;
			expect(ref.getClassSkillsForType('vermin')).to.be.an('array').that.is.empty;
		});
		it('returns an array of skills for each type', () => {
			expect(ref.getClassSkillsForType('aberration')).to.be.an('array').that.has.a.lengthOf(10).and.includes.members(['Acrobatics', 'Swim']);
			expect(ref.getClassSkillsForType('animal')).to.be.an('array').that.has.a.lengthOf(6).and.includes.members(['Acrobatics', 'Swim']);
			expect(ref.getClassSkillsForType('dragon')).to.be.an('array').that.has.a.lengthOf(17).and.includes.members(['Appraise', 
				'Use Magic Device', 'Knowledge']);
			expect(ref.getClassSkillsForType('fey')).to.be.an('array').that.has.a.lengthOf(18).and.includes.members(['Acrobatics', 
				'Use Magic Device', 'Knowledge (geography)', 'Knowledge (local)', 'Knowledge (nature)']);
			expect(ref.getClassSkillsForType('humanoid')).to.be.an('array').that.has.a.lengthOf(7).and.includes.members(['Climb', 'Survival']);
			expect(ref.getClassSkillsForType('magical beast')).to.be.an('array').that.has.a.lengthOf(6).and.includes.members(['Acrobatics', 'Swim']);
			expect(ref.getClassSkillsForType('monstrous humanoid')).to.be.an('array').that.has.a.lengthOf(9).and.includes.members(['Climb', 'Swim']);
			expect(ref.getClassSkillsForType('outsider')).to.be.an('array').that.has.a.lengthOf(6).and.includes.members(['Bluff', 
				'Stealth', 'Knowledge (planes)']);
			expect(ref.getClassSkillsForType('plant')).to.be.an('array').that.has.a.lengthOf(2).and.includes.members(['Perception', 'Stealth']);
			expect(ref.getClassSkillsForType('undead')).to.be.an('array').that.has.a.lengthOf(10).and.includes.members(['Climb', 'Stealth', 
				'Knowledge (arcana)', 'Knowledge (religion)']);
		});
	});

	describe('isSkillFamily', () => {
		it('returns true if the given name is a skill family name', () => {
			expect(ref.isSkillFamily('Craft')).to.be.true;
			expect(ref.isSkillFamily('Knowledge')).to.be.true;
			expect(ref.isSkillFamily('Perform')).to.be.true;
			expect(ref.isSkillFamily('Profession')).to.be.true;
		});
		it('returns false if the given name is not a skill name', () => {
			expect(ref.isSkillFamily('ergdaxvzx')).to.be.false;
			expect(ref.isSkillFamily('')).to.be.false;
			expect(ref.isSkillFamily(23)).to.be.false;
			expect(ref.isSkillFamily(undefined)).to.be.false;
		});
		it('returns false if the given name is a specialised skill belonging to a skill family', () => {
			expect(ref.isSkillFamily('Knowledge (local)')).to.be.false;
			expect(ref.isSkillFamily('Craft (alchemy)')).to.be.false;
		});
		it('returns false if the given name is a normal skill name', () => {
			expect(ref.isSkillFamily('Climb')).to.be.false;
		});
	});

	describe('isClassSkillForType', () => {
		it('returns true if the given skill is a class skill for the given type', () => {
			expect(ref.isClassSkillForType('animal', 'Acrobatics')).to.be.true;
			expect(ref.isClassSkillForType('fey', 'Knowledge', 'local')).to.be.true;
		});
		it('returns true for a whole skill family that is a class skill for the given type', () => {
			expect(ref.isClassSkillForType('dragon', 'Knowledge')).to.be.true;
			expect(ref.isClassSkillForType('dragon', 'Craft')).to.be.true;
		});
		it('returns false for a whole skill family that is not a class skill for the given type', () => {
			expect(ref.isClassSkillForType('animal', 'Knowledge')).to.be.false;
			expect(ref.isClassSkillForType('fey', 'Knowledge')).to.be.false;
		});
		it('returns true if the given skill is part of a family that is a class skill for the given type', () => {
			expect(ref.isClassSkillForType('dragon', 'Knowledge', 'local')).to.be.true;
			expect(ref.isClassSkillForType('dragon', 'Craft', 'alchemy')).to.be.true;
		});
		it('returns false if the given skill is not a class skill for the given type', () => {
			expect(ref.isClassSkillForType('animal', 'Appraise')).to.be.false;
			expect(ref.isClassSkillForType('construct', 'Fly')).to.be.false;
		});
		it('returns undefined if either parameter is invalid', () => {
			expect(ref.isClassSkillForType('animal', 'stuff')).to.be.undefined;
			expect(ref.isClassSkillForType('clown', 'Fly')).to.be.undefined;
			expect(ref.isClassSkillForType('clown', 'stuff')).to.be.undefined;
		});
	});

	describe('isSkill', () => {
		it('returns true if the given skill is a simple skill', () => {
			expect(ref.isSkill('Appraise')).to.be.true;
		});
		it('returns true if the given skill is the name of a skill family', () => {
			expect(ref.isSkill('Craft')).to.be.true;
			expect(ref.isSkill('Knowledge')).to.be.true;
		});
		it('returns false if the given name doesn\'t match either a normal skill or a skill family', () => {
			expect(ref.isSkill('Skateboard')).to.be.false;
			expect(ref.isSkill('')).to.be.false;
			expect(ref.isSkill(undefined)).to.be.false;
			expect(ref.isSkill(42)).to.be.false;
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
			expect(ref.getConstructHPBonus('fine')).to.be.undefined;
			expect(ref.getConstructHPBonus('')).to.be.undefined;
			expect(ref.getConstructHPBonus()).to.be.undefined;
			expect(ref.getConstructHPBonus(0)).to.be.undefined;
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
			expect(ref.getHitDieBABFactor(7)).to.be.undefined;
			expect(ref.getHitDieBABFactor('')).to.be.undefined;
		});
	});
	
	describe('getAbilityForSkill', function(){
		it('returns the name of the ability associated with the given skill', function(){
			expect(ref.getAbilityForSkill('Acrobatics')).to.equal('Dex');
			expect(ref.getAbilityForSkill('Use Magic Device')).to.equal('Cha');
			expect(ref.getAbilityForSkill('Perception')).to.equal('Wis');
			expect(ref.getAbilityForSkill('Knowledge')).to.equal('Int');
		});

		it('returns undefined if the skill provided is invalid', function(){
			expect(ref.getAbilityForSkill('acrobatics')).to.be.undefined;
			expect(ref.getAbilityForSkill('')).to.be.undefined;
			expect(ref.getAbilityForSkill()).to.be.undefined;
			expect(ref.getAbilityForSkill(2)).to.be.undefined;
		});

		it('returns undefined for the old format for Knowledge', () => {
			expect(ref.getAbilityForSkill('Knowledge (religion)')).to.be.undefined;
		});
	});
	
	describe('getSkillUrl', function(){
		it('returns the url associated with the given skill', function(){
			expect(ref.getSkillUrl('Acrobatics')).to.equal('http://paizo.com/pathfinderRPG/prd/skills/acrobatics.html#acrobatics');
			expect(ref.getSkillUrl('Use Magic Device')).to.equal('http://paizo.com/pathfinderRPG/prd/skills/useMagicDevice.html#use-magic-device');
			expect(ref.getSkillUrl('Knowledge')).to.equal('http://paizo.com/pathfinderRPG/prd/skills/knowledge.html#knowledge');
		});
		
		it('returns undefined for skills not associated with an url', function(){
			expect(ref.getSkillUrl('blarg')).to.be.undefined;
			expect(ref.getSkillUrl('')).to.be.undefined;
			expect(ref.getSkillUrl()).to.be.undefined;
			expect(ref.getSkillUrl('Knowledge (arcana)')).to.be.undefined;
		});
	});

	describe('getTypeUrl', function(){
		it('returns the url associated with the given monster type', function(){
			expect(ref.getTypeUrl('aberration')).to.equal('http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#aberration');
			expect(ref.getTypeUrl('vermin')).to.equal('http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#vermin');
			expect(ref.getTypeUrl('magical beast')).to.equal('http://paizo.com/pathfinderRPG/prd/bestiary/creatureTypes.html#magical-beast');
		});
		
		it('returns undefined for types not associated with an url', function(){
			expect(ref.getTypeUrl('blarg')).to.be.undefined;
			expect(ref.getTypeUrl('')).to.be.undefined;
			expect(ref.getTypeUrl()).to.be.undefined;
			expect(ref.getTypeUrl('outsider (native)')).to.be.undefined;
		});
	});

	describe('getSpace', function(){
		it('returns undefined for an invalid size', function(){
			expect(ref.getSpace('Wrong')).to.be.undefined;
			expect(ref.getSpace('medium')).to.be.undefined;
			expect(ref.getSpace(0)).to.be.undefined;
		});

		it('returns the correct space for the given size', function(){
			expect(ref.getSpace('Fine')).to.equal(0.5);
			expect(ref.getSpace('Diminutive')).to.equal(1);
			expect(ref.getSpace('Tiny')).to.equal(2.5);
			expect(ref.getSpace('Small')).to.equal(5);
			expect(ref.getSpace('Medium')).to.equal(5);
			expect(ref.getSpace('Large')).to.equal(10);
			expect(ref.getSpace('Huge')).to.equal(15);
			expect(ref.getSpace('Gargantuan')).to.equal(20);
			expect(ref.getSpace('Colossal')).to.equal(30);
		});
	});

	describe('getReach', function(){
		it('returns undefined for invalid parameters', function(){
			expect(ref.getReach('WrongSize', 'WrongShape')).to.be.undefined;
			expect(ref.getReach('WrongSize', 'tall')).to.be.undefined;
			expect(ref.getReach('Medium', 'WrongShape')).to.be.undefined;
			expect(ref.getReach()).to.be.undefined;
		});

		it('returns undefined when there is no shape parameter and the size is Large or bigger', function(){
			expect(ref.getReach('Large')).to.be.undefined;
			expect(ref.getReach('Huge')).to.be.undefined;
			expect(ref.getReach('Gargantuan')).to.be.undefined;
			expect(ref.getReach('Colossal')).to.be.undefined;
		});
		
		it('returns the correct reach without a shape parameter when the given size does not exceed Medium', function(){
			expect(ref.getReach('Fine')).to.equal(0);
			expect(ref.getReach('Diminutive')).to.equal(0);
			expect(ref.getReach('Tiny')).to.equal(0);
			expect(ref.getReach('Small')).to.equal(5);
			expect(ref.getReach('Medium')).to.equal(5);
		});
		
		it('returns the correct reach for the given size for a long monster', function(){
			expect(ref.getReach('Fine', 'long')).to.equal(0);
			expect(ref.getReach('Diminutive', 'long')).to.equal(0);
			expect(ref.getReach('Tiny', 'long')).to.equal(0);
			expect(ref.getReach('Small', 'long')).to.equal(5);
			expect(ref.getReach('Medium', 'long')).to.equal(5);
			expect(ref.getReach('Large', 'long')).to.equal(5);
			expect(ref.getReach('Huge', 'long')).to.equal(10);
			expect(ref.getReach('Gargantuan', 'long')).to.equal(15);
			expect(ref.getReach('Colossal', 'long')).to.equal(20);
		});
		
		it('returns the correct reach for the given size for a tall monster', function(){
			expect(ref.getReach('Fine', 'tall')).to.equal(0);
			expect(ref.getReach('Diminutive', 'tall')).to.equal(0);
			expect(ref.getReach('Tiny', 'tall')).to.equal(0);
			expect(ref.getReach('Small', 'tall')).to.equal(5);
			expect(ref.getReach('Medium', 'tall')).to.equal(5);
			expect(ref.getReach('Large', 'tall')).to.equal(10);
			expect(ref.getReach('Huge', 'tall')).to.equal(15);
			expect(ref.getReach('Gargantuan', 'tall')).to.equal(20);
			expect(ref.getReach('Colossal', 'tall')).to.equal(30);			
		});
	});
});