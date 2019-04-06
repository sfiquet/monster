/* jshint node: true */
"use strict";

var expect = require('chai').expect,
	OrderedSet = require('../../lib/orderedset');

describe('OrderedSet', function(){
	describe('Constructor', function(){
		it('creates an empty OrderedSet object and initialises it correctly', function(){
			var set = new OrderedSet();
			expect(set.order).to.deep.equal([]);
			expect(set.set).to.deep.equal({});
		});

		it('creates an OrderedSet object and initialises it from the correct JSON format', function(){
			var data = [
				{'name': 'one', 'number': 4}, 
				{'name': 'two', 'string': 'asd'}, 
				{'name': 'three', 'object': {'name': 'four', 'blah': '123'}}
			];
			var set = new OrderedSet(data);
			expect(set.order).to.deep.equal(['one', 'two', 'three']);
			expect(set.set).to.deep.equal({
				'one': {'name': 'one', 'number': 4},
				'two': {'name': 'two', 'string': 'asd'},
				'three': {'name': 'three', 'object': {'name': 'four', 'blah': '123'}}
				});
		});

		it('creates an empty OrderedSet object when the data is in the wrong format', function(){
			// not an array
			var set = new OrderedSet({'name': 'one', 'number': 4});
			expect(set.order).to.deep.equal([]);
			expect(set.set).to.deep.equal({});

			// array items are not all objects
			set = new OrderedSet(['one', 'two', 4, {}]);
			expect(set.order).to.deep.equal([]);
			expect(set.set).to.deep.equal({});

			// no name properties in objects
			var data = [
				{'number': 4}, 
				{'string': 'asd'}, 
				{'object': {'name': 'four', 'blah': '123'}}
			];
			set = new OrderedSet(data);
			expect(set.order).to.deep.equal([]);
			expect(set.set).to.deep.equal({});
		});
	});

	describe('getKeys', function(){
		it('returns a copy of the order array', function(){
			var data = [
				{'name': 'one', 'number': 4}, 
				{'name': 'two', 'string': 'asd'}, 
				{'name': 'three', 'object': {'name': 'four', 'blah': '123'}}
			];
			var set = new OrderedSet(data);
			var keys = set.getKeys();
			expect(keys).to.deep.equal(set.order);
			expect(keys).to.not.equal(set.order);
		});
	});

	describe('getItemByKey', function(){
		it('returns undefined if the ordered set is empty', function(){
			var set = new OrderedSet();
			expect(set.getItemByKey('test')).to.be.undefined();
		});

		it('returns undefined if the key is not found', function(){
			var data = [
				{'name': 'one', 'number': 4}, 
				{'name': 'two', 'string': 'asd'}, 
				{'name': 'three', 'object': {'name': 'four', 'blah': '123'}}
			];
			var set = new OrderedSet(data);
			expect(set.getItemByKey('test')).to.be.undefined();
		});
		
		it('returns the item identified by the key', function(){
			var data = [
				{'name': 'one', 'number': 4}, 
				{'name': 'two', 'string': 'asd'}, 
				{'name': 'three', 'object': {'name': 'four', 'blah': '123'}}
			];
			var set = new OrderedSet(data);
			expect(set.getItemByKey('one')).to.deep.equal({'name': 'one', 'number': 4});
			expect(set.getItemByKey('two')).to.deep.equal({'name': 'two', 'string': 'asd'});
			expect(set.getItemByKey('three')).to.deep.equal({'name': 'three', 'object': {'name': 'four', 'blah': '123'}});
		});
	});

	describe('getItemByIndex', function(){
		it('returns undefined if the index is out of bounds', function(){
			var set = new OrderedSet();
			expect(set.getItemByIndex(-1)).to.be.undefined();
			expect(set.getItemByIndex(0)).to.be.undefined();

			var data = [
				{'name': 'one', 'number': 4}, 
				{'name': 'two', 'string': 'asd'}, 
				{'name': 'three', 'object': {'name': 'four', 'blah': '123'}}
			];
			set = new OrderedSet(data);
			expect(set.getItemByIndex(3)).to.be.undefined();
		});

		it('returns the idem identified by the index', function(){
			var data = [
				{'name': 'one', 'number': 4}, 
				{'name': 'two', 'string': 'asd'}, 
				{'name': 'three', 'object': {'name': 'four', 'blah': '123'}}
			];
			var set = new OrderedSet(data);
			expect(set.getItemByIndex(0)).to.deep.equal({'name': 'one', 'number': 4});
			expect(set.getItemByIndex(1)).to.deep.equal({'name': 'two', 'string': 'asd'});
			expect(set.getItemByIndex(2)).to.deep.equal({'name': 'three', 'object': {'name': 'four', 'blah': '123'}});
		});
	});
});

