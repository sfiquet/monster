"use strict";

const expect = require('chai').expect;
const format = require('../../lib/formatoptions');
	
describe('Formatting of chosen template options for display', function(){
	describe('getOptions', function(){
	
		it('returns \'Original\' by default', function(){
			expect(format.getOptions()).to.equal('Original');
		});
		
		it('returns \'Original\' if no template option is selected', function(){
			expect(format.getOptions({})).to.equal('Original');
		});
		
		it('capitalizes the first letter', function(){
			expect(format.getOptions({advanced: 1})).to.equal('Advanced');
			expect(format.getOptions({giant: 1})).to.equal('Giant');
			expect(format.getOptions({blah: 1})).to.equal('Blah');
		});
		
		it('lists all options capitalized and separated by commas', function(){
			expect(format.getOptions({advanced: 1, giant: 1, young: 1})).to.equal('Advanced, Giant, Young');
		});
		
		it('follows an option with the number of times it is applied if more than once', function(){
			expect(format.getOptions({advanced: 2, giant: 1, young: 3})).to.equal('Advanced (x2), Giant, Young (x3)');
		});
	});
});
