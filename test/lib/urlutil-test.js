/* jshint node: true */
"use strict";

var expect = require('chai').expect,
	urlutil = require('../../lib/urlutil');

describe('Urlutil', function(){

	describe('extractAdvanceOptions', function(){

		it('returns an empty object if the options segment is \'original\'', function(){
			var options;

			options = urlutil.extractAdvanceOptions('/advance/no-monster/original');
			expect(options).to.be.an('object');
			expect(options).to.be.empty();

			options = urlutil.extractAdvanceOptions('/advance/no-monster/original/browse');
			expect(options).to.be.an('object');
			expect(options).to.be.empty();
		});
		
		it('returns undefined if the url doesn\'t follow the correct format', function(){
			var options;
			
			options = urlutil.extractAdvanceOptions('advance/no-monster');
			expect(options).to.be.undefined();
			
			options = urlutil.extractAdvanceOptions('');
			expect(options).to.be.undefined();
			
			options = urlutil.extractAdvanceOptions('original');
			expect(options).to.be.undefined();
		});
		
		it('returns an object containing the options', function(){
			var options;

			options = urlutil.extractAdvanceOptions('/advance/no-monster/advanced');
			expect(options).to.be.an('object');
			expect(options).to.include.keys('advanced');

			options = urlutil.extractAdvanceOptions('/advance/no-monster/advanced-giant-young');
			expect(options).to.be.an('object');
			expect(options).to.include.keys('advanced', 'giant', 'young');

			options = urlutil.extractAdvanceOptions('/advance/no-monster/advanced-x2-giant-x3-celestial-ghost');
			expect(options).to.be.an('object');
			expect(options).to.include.keys('advanced', 'giant', 'celestial', 'ghost');
			expect(options).to.deep.equal({ advanced: 2, giant: 3, celestial: 1, ghost: 1 });
		});
	});
	
	describe('buildAdvanceOptionsSlug', function(){
		
		it('creates a slug for the options passed in', function(){
			var slug;
			slug = urlutil.buildAdvanceOptionsSlug([
					{name: 'advanced', count: 1}, 
					{name: 'giant', count: 3}, 
					{name: 'young', count: 2}, 
					{name: 'celestial', count: 1}
				]);
			expect(slug).to.deep.equal('advanced-giant-x3-young-x2-celestial');
		});
		
		it('makes sure the number of uses for a a given template is valid', function(){
			var slug;
			slug = urlutil.buildAdvanceOptionsSlug([
					{name: 'advanced', count: 0}, 
					{name: 'giant', count: -1}, 
					{name: 'young', count: 4}, 
					{name: 'celestial', count: 100}
				]);
			expect(slug).to.deep.equal('advanced-giant-young-x3-celestial-x3');
		});
		
		it('returns \'original\' if no options are set up', function(){
			var slug;
			slug = urlutil.buildAdvanceOptionsSlug([]);
			expect(slug).to.deep.equal('original');
		});
	});
	
	describe('extractAdvanceMonster', function(){
		
		it('extracts the monster segment from the given url', function(){
			var monster = urlutil.extractAdvanceMonster('/advance/black-pudding/original/search');
			expect(monster).to.equal('black-pudding');
			monster = urlutil.extractAdvanceMonster('/advance/black-pudding/original');
			expect(monster).to.equal('black-pudding');
			monster = urlutil.extractAdvanceMonster('/advance/black-pudding');
			expect(monster).to.equal('black-pudding');
		});
		
		it('returns undefined if there is no monster segment in the url', function(){
			var monster = urlutil.extractAdvanceMonster('/advance');
			expect(monster).to.be.undefined();
			monster = urlutil.extractAdvanceMonster('/');
			expect(monster).to.be.undefined();
			monster = urlutil.extractAdvanceMonster('');
			expect(monster).to.be.undefined();
		});
	});
	
	describe('buildAdvanceUrl', function(){
	
		it('builds the correct url for the given monster and template options', function(){
			var url;
			url = urlutil.buildAdvanceUrl('black-pudding', 'advanced-giant-x2');
			expect(url).to.equal('/advance/black-pudding/advanced-giant-x2');
			url = urlutil.buildAdvanceUrl('black-pudding', 'advanced-giant-x2', 'browse');
			expect(url).to.equal('/advance/black-pudding/advanced-giant-x2/browse');
			url = urlutil.buildAdvanceUrl('black-pudding', [
					{ name: 'giant', count: 3 }, 
					{ name: 'advanced', count: 1 }
				]);
			expect(url).to.equal('/advance/black-pudding/giant-x3-advanced');
			url = urlutil.buildAdvanceUrl('black-pudding', [
					{ name: 'giant', count: 3 }, 
					{ name: 'advanced', count: 1 }
				], 'customize');
			expect(url).to.equal('/advance/black-pudding/giant-x3-advanced/customize');
			url = urlutil.buildAdvanceUrl('black-pudding', []);
			expect(url).to.equal('/advance/black-pudding/original');
		});
		
		it('returns undefined when the input parameters are wrong', function(){
			var url;
			url = urlutil.buildAdvanceUrl('black-pudding');
			expect(url).to.be.undefined();
			url = urlutil.buildAdvanceUrl(undefined, 'advanced');
			expect(url).to.be.undefined();
			url = urlutil.buildAdvanceUrl();
			expect(url).to.be.undefined();
			url = urlutil.buildAdvanceUrl('', '');
			expect(url).to.be.undefined();
			url = urlutil.buildAdvanceUrl('', []);
			expect(url).to.be.undefined();
		});
		
		it('ignores the extraSegment parameter if empty', function(){
			var url;
			url = urlutil.buildAdvanceUrl('black-pudding', 'advanced-giant-x2', '');
			expect(url).to.equal('/advance/black-pudding/advanced-giant-x2');
		});
	});
});