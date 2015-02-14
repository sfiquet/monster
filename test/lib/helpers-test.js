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
	
	describe('format', function(){
		it('formats the text according with link and em tags', function(){
			expect(helpers.format({ text: 'some text', url: 'www.example.com', magic: true })).to.equal(
				'<em><a href="www.example.com">some text</a></em>');
			expect(helpers.format({ text: 'some text', url: 'www.example.com', magic: false })).to.equal(
				'<a href="www.example.com">some text</a>');
			expect(helpers.format({ text: 'some text', url: 'www.example.com' })).to.equal(
				'<a href="www.example.com">some text</a>');
			expect(helpers.format({ text: 'some text', magic: true })).to.equal('<em>some text</em>');
			expect(helpers.format({ text: 'some text' })).to.equal('some text');
		});
	});
});