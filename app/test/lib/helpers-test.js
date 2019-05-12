/* jshint node: true */
'use strict';

var expect = require('chai').expect,
	helpers = require('../../lib/helpers');
	
describe('Helpers', function(){
	describe('title', function(){
		it('surrounds the title with styled span tags', function(){
			expect(helpers.title('My Title')).to.equal('<span class="title-1">My Title</span>');
		});
	});
	
	describe('rankedTitle', function(){
		it('surrounds the title with styled span tags for the given rank', function(){
			expect(helpers.rankedTitle('My Title')).to.equal('<span class="title-undefined">My Title</span>');
			expect(helpers.rankedTitle('My Title', 0)).to.equal('<span class="title-0">My Title</span>');
			expect(helpers.rankedTitle('My Title', 1)).to.equal('<span class="title-1">My Title</span>');
			expect(helpers.rankedTitle('My Title', 2)).to.equal('<span class="title-2">My Title</span>');
		});
	});
	
	describe('link', function(){
		it('creates a correct HTML link with the text and the url', function(){
			expect(helpers.link('This is a link', 'www.example.com')).to.equal(
					'<a href="www.example.com">This is a link</a>');
		});
	});
	
	describe('magic', function(){
		it('surrounds the text with styled span tags', function(){
			expect(helpers.magic('My spell')).to.equal('<span class="magic">My spell</span>');
		});
	});
	
	describe('format', function(){
		it('formats the text according with link and em tags', function(){
			expect(helpers.format({ text: 'some text', url: 'www.example.com', isMagic: true })).to.equal(
				'<span class="magic"><a href="www.example.com">some text</a></span>');
			expect(helpers.format({ text: 'some text', url: 'www.example.com', isMagic: false })).to.equal(
				'<a href="www.example.com">some text</a>');
			expect(helpers.format({ text: 'some text', url: 'www.example.com' })).to.equal(
				'<a href="www.example.com">some text</a>');
			expect(helpers.format({ text: 'some text', isMagic: true })).to.equal('<span class="magic">some text</span>');
			expect(helpers.format({ text: 'some text' })).to.equal('some text');
		});
		
		it('formats the text with strong tags', function(){
			expect(helpers.format({ text: 'some text', titleLevel: 1 })).to.equal('<span class="title-1">some text</span>');
			expect(helpers.format({ text: 'some text', titleLevel: 0 })).to.equal('some text');
			expect(helpers.format({ text: 'some text' })).to.equal('some text');
			expect(helpers.format({ text: 'some text', titleLevel: 1, isMagic: true })).to.equal('<span class="title-1"><span class="magic">some text</span></span>');
			expect(helpers.format({ text: 'some text', titleLevel: 1, url: 'www.example.com' })).to.equal('<span class="title-1"><a href="www.example.com">some text</a></span>');
			expect(helpers.format({ text: 'some text', titleLevel: 1, url: 'www.example.com', isMagic: true })).to.equal('<span class="title-1"><span class="magic"><a href="www.example.com">some text</a></span></span>');
		});
	});

	describe('eq', () => {
		it('returns true if the parameters are equal', () => {
			expect(helpers.eq(1, 1)).to.be.true;
			const obj = { type: 'list'};
			expect(helpers.eq(obj.type, 'list')).to.be.true;
		});

		it('returns false if the parameters are different', () => {
			expect(helpers.eq(1, 2)).to.be.false;
			const obj = { type: 'paragraph'};
			expect(helpers.eq(obj.type, 'list')).to.be.false;
		});
	});

	describe('and', () => {
		it('returns true if both parameters evaluate to true', () => {
			expect(helpers.and(true, true)).to.be.true;
		});

		it('returns false if any parameter evaluates to false', () => {
			expect(helpers.and(false, true)).to.be.false;
			expect(helpers.and(true, false)).to.be.false;
			expect(helpers.and(false, false)).to.be.false;
		});
	});
});