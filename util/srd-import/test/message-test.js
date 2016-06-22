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
	});

	describe('toString', function(){
		it('calls the method', function(){
			var message = createMessage('originalValueConverted', 4.7, 4);
			expect(message.toString()).to.equal('Original value 4.7 converted to 4');
		});
	});
});
