/* jshint node: true */
'use strict';

var expect = require('chai').expect,
	Monster = require('../../lib/monster'),
	format = require('../../lib/formatmonster');
	
describe('Formatting of monster data for display', function(){
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
	
	describe('getACModifiers', function(){
		it('builds the list of non-zero AC modifiers as an array of objects');
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
	});
});