/* jshint node: true */
'use strict';

var expect = require('chai').expect,
	helpers = require('../../lib/helpers');
	
describe('Helpers', function(){
	describe('title', function(){
		it('surrounds the title with strong tags', function(){
			expect(helpers.title('My Title')).to.equal('<strong>My Title</strong>');
		});
	});
	describe('link', function(){
		it('creates a correct HTML link with the text and the url', function(){
			expect(helpers.link('This is a link', 'www.example.com')).to.equal(
					'<a href="www.example.com">This is a link</a>');
		});
	});
	describe('magic', function(){
		it('surrounds the text with em tags', function(){
			expect(helpers.magic('My spell')).to.equal('<em>My spell</em>');
		});
	});
});