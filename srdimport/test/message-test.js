/* jshint node: true, esversion: 6 */
'use strict';

var expect = require('chai').expect,
	message = require('../message');
var createMessage = message.createMessage;

describe('Message', function(){
	describe('constructor', function(){

		it('creates a default object', function(){
			var message = createMessage();
			expect(message.logKey).to.be.undefined;
			expect(message.params).to.deep.equal([]);
		});

		it('creates an object with a log key and no parameters', function(){
			var message = createMessage('invalidFormat');
			expect(message.logKey).to.equal('invalidFormat');
			expect(message.params).to.deep.equal([]);
		});

		it('creates an object with a log key and an array of parameters', function(){
			var message = createMessage('originalValueConverted', 4.7, 4);
			expect(message.logKey).to.equal('originalValueConverted');
			expect(message.params).to.deep.equal([4.7, 4]);
		});

		it('logs an error message when the key is invalid', function(){
			// not sure how to test this
			// The error message will show in the test output
			// it makes it easier to spot the problem
			var message = createMessage('invalidBanana', 'your banana should be red');
			expect(message.logKey).to.equal('invalidBanana');
			expect(message.params).to.deep.equal(['your banana should be red']);
		});
	});

	describe('toString', function(){
		it('calls the method', function(){
			var message = createMessage('originalValueConverted', 4.7, 4);
			expect(message.toString()).to.equal('Original value 4.7 converted to 4');
		});

		it('outputs the key as a message when the key is invalid', function(){
			var message = createMessage('invalidBanana', 'your banana should be red');
			expect(message.toString()).to.equal('invalidBanana: "your banana should be red"');
		});
	});
});
