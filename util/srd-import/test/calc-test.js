/* jshint node: true, esversion: 6 */
'use strict';

var expect = require('chai').expect,
	calc = require('../calc'),
	message = require('../message'),
	Monster = require('../../../lib/monster');

var createMessage = message.createMessage;

describe('Calc', function(){
	
	describe('calculateSkills', function(){

		it('returns undefined when either parameter is undefined', function(){
			expect(calc.calculateSkills()).to.be.undefined;
			expect(calc.calculateSkills(undefined, new Monster())).to.be.undefined;
			expect(calc.calculateSkills([], undefined)).to.be.undefined;
		});

		it('deduces the ranks for a skill based on the difference between the skill modifier and the calculated modifier', function(){
			var monsterObj, skills;
			monsterObj = new Monster({
				name: 'test',
				Cha: 15,
				skills: [{name: 'Intimidate'}],
			});
			skills = [{name: 'Intimidate', modifier: 9}];
			
			expect(calc.calculateSkills(skills, monsterObj)).to.deep.equal({name: 'skills', errors: [], warnings: [], data: 
				[{name: 'Intimidate', ranks: 4}]});
		});

		it('takes the Skill Focus feat into account', function(){
			var monsterObj, skills;
			monsterObj = new Monster({
				name: 'test',
				Cha: 15,
				skills: [{name: 'Intimidate'}],
				feats: [{name: 'Skill Focus', details: [{name: 'Intimidate'}]}]
			});
			skills = [{name: 'Intimidate', modifier: 12}];
			
			expect(calc.calculateSkills(skills, monsterObj)).to.deep.equal({name: 'skills', errors: [], warnings: [], data: 
				[{name: 'Intimidate', ranks: 4}]});
		});

		it('deduces the ranks for all skills based on the difference between the skill modifier and the calculated modifier', function(){
			var monsterObj, skills;
			monsterObj = new Monster({
				name: 'test',
				Dex: 12,
				Wis: 13,
				Cha: 15,
				skills: [{name: 'Intimidate'}, {name: 'Perception'}, {name: 'Stealth', racial: 8}],
				feats: [{name: 'Skill Focus', details: [{name: 'Perception'}]}]
			});
			skills = [{name: 'Intimidate', modifier: 9}, {name: 'Perception', modifier: 11}, {name: 'Stealth', racial: 8, modifier: 16}];
			
			expect(calc.calculateSkills(skills, monsterObj)).to.deep.equal({name: 'skills', errors: [], warnings: [], data: 
				[{name: 'Intimidate', ranks: 4}, {name: 'Perception', ranks: 4}, {name: 'Stealth', racial: 8, ranks: 4}]});
		});

		it('generates an error when the discrepancy is negative', function(){
			var monsterObj, skills;
			monsterObj = new Monster({
				name: 'test',
				Cha: 15,
				skills: [{name: 'Intimidate'}],
			});
			skills = [{name: 'Intimidate', modifier: 1}];
			
			expect(calc.calculateSkills(skills, monsterObj)).to.deep.equal(
				{name: 'skills', errors: [createMessage('negativeDiscrepancy', 'Intimidate', 1, 2)], warnings: [], data: undefined});
		});

		it('generates an error when the discrepancy doesn\'t allow for class skill bonus', function(){
			var monsterObj, skills;
			monsterObj = new Monster({
				name: 'test',
				Cha: 15,
				skills: [{name: 'Intimidate'}],
			});
			skills = [{name: 'Intimidate', modifier: 3}];
			
			expect(calc.calculateSkills(skills, monsterObj)).to.deep.equal(
				{name: 'skills', errors: [createMessage('classSkillBonusDiscrepancy', 'Intimidate')], warnings: [], data: undefined});
		});

		it('generates a skill with no ranks property when there is no discrepancy but there is a racial modifier', function(){
			var monsterObj, skills;
			monsterObj = new Monster({
				name: 'test',
				Cha: 15,
				skills: [{name: 'Intimidate', racial: 2}],
			});
			skills = [{name: 'Intimidate', racial: 2, modifier: 4}];
			
			expect(calc.calculateSkills(skills, monsterObj)).to.deep.equal({name: 'skills', errors: [], warnings: [], data: 
				[{name: 'Intimidate', racial: 2}]});
		});

		it('generate a warning and no skill when there are no ranks and no racial modifier', function(){
			var monsterObj, skills;
			monsterObj = new Monster({
				name: 'test',
				Cha: 15,
				skills: [{name: 'Intimidate'}],
			});
			skills = [{name: 'Intimidate', modifier: 2}];
			
			expect(calc.calculateSkills(skills, monsterObj)).to.deep.equal(
				{name: 'skills', errors: [], warnings: [createMessage('noSkillData', 'Intimidate')], data: []});
		});

	});

	describe('calculateDiscrepancy', function(){

		it('generates a discrepancy value based on the difference between the expected value and the calculated value', function(){
			expect(calc.calculateDiscrepancy('test', 14, 12)).to.deep.equal({name: 'test', errors: [], warnings: [], data: 2});
			expect(calc.calculateDiscrepancy('test', 5, -2)).to.deep.equal({name: 'test', errors: [], warnings: [], data: 7});
			expect(calc.calculateDiscrepancy('test', -3, -4)).to.deep.equal({name: 'test', errors: [], warnings: [], data: 1});
		});

		it('generates an error if the discrepancy is negative', function(){
			expect(calc.calculateDiscrepancy('test', 14, 15)).to.deep.equal(
				{name: 'test', errors: [createMessage('negativeDiscrepancy', 'test', 14, 15)], warnings: [], data: undefined});

			expect(calc.calculateDiscrepancy('test', -3, -2)).to.deep.equal(
				{name: 'test', errors: [createMessage('negativeDiscrepancy', 'test', -3, -2)], warnings: [], data: undefined});

			expect(calc.calculateDiscrepancy('test', -3, 1)).to.deep.equal(
				{name: 'test', errors: [createMessage('negativeDiscrepancy', 'test', -3, 1)], warnings: [], data: undefined});
		});
	});
});