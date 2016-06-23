/* jshint node: true, esversion: 6 */
'use strict';

var expect = require('chai').expect,
	skill = require('../skill');

describe('Skill', function(){
	describe('isSkill', function(){
		it('returns true when the given name is a known skill', function(){
			expect(skill.isSkill('Acrobatics')).to.be.true;
			expect(skill.isSkill('Use Magic Device')).to.be.true;
			expect(skill.isSkill('Knowledge')).to.be.true;
		});
		it('returns false when the given name is not a known skill', function(){
			expect(skill.isSkill('acrobatics')).to.be.false;
			expect(skill.isSkill('Not a skill')).to.be.false;
		});
	});

	describe('isSpecialisedSkill', function(){
		it('returns true when the given name is a specialised skill', function(){
			expect(skill.isSpecialisedSkill('Craft')).to.be.true;
			expect(skill.isSpecialisedSkill('Knowledge')).to.be.true;
			expect(skill.isSpecialisedSkill('Perform')).to.be.true;
			expect(skill.isSpecialisedSkill('Profession')).to.be.true;

		});
		it('returns false when the given name is not a specialised skill', function(){
			expect(skill.isSpecialisedSkill('Acrobatics')).to.be.false;
			expect(skill.isSpecialisedSkill('craft')).to.be.false;
			expect(skill.isSpecialisedSkill('Not a skill')).to.be.false;
		});
	});
});
