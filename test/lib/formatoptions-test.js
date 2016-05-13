/* jshint node: true */
"use strict";

var expect = require('chai').expect,
	format = require('../../lib/formatoptions');
	
describe('Formatting of chosen template options for display', function(){
	describe('getOptions', function(){
	
		it('returns \'Original\' if no template option is selected', function(){
			expect(format.getOptions('/advance/no-monster/original')).to.equal('Original');
		});
		
		it('returns \'Original\' if the url format is incorrect', function(){
			expect(format.getOptions('')).to.equal('Original');
		});
		
		it('capitalizes the first letter', function(){
			expect(format.getOptions('/advance/no-monster/advanced')).to.equal('Advanced');
			expect(format.getOptions('/advance/no-monster/giant')).to.equal('Giant');
			expect(format.getOptions('/advance/no-monster/blah')).to.equal('Blah');
		});
		
		it('lists all options capitalized and separated by commas', function(){
			expect(format.getOptions('/advance/no-monster/advanced-giant-young')).to.equal('Advanced, Giant, Young');
		});
		
		it('follows an option with the number of times it is applied if more than once', function(){
			expect(format.getOptions('/advance/no-monster/advanced-x2-giant-young-x3')).to.equal('Advanced (x2), Giant, Young (x3)');
		});
	});
});