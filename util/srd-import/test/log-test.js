/* jshint node: true, esversion: 6 */
'use strict';

var expect = require('chai').expect,
	log = require('../log');

describe('Log', function(){

	describe('buildMessage', function(){

		it('outputs the message string on its own when there is no parameter', function(){
			expect(log.buildMessage('Invalid format')).to.equal('Invalid format');
		});

		it('builds the message string with quotes when the parameter is a string', function(){
			expect(log.buildMessage('Invalid format', 'invalid text')).to.equal('Invalid format: "invalid text"');
		});
		
		it('builds the message string without quotes when the parameter is not a string', function(){
			expect(log.buildMessage('Invalid format', 4)).to.equal('Invalid format: 4');
		});

		it('adds extra parameters in brackets at the end of the string', function(){
			expect(log.buildMessage('Invalid format', 'invalid text', 5, 'more text')).to.equal('Invalid format: "invalid text" (5, "more text")');
		});
		
		it('outputs the parameters when the first function parameter is not a string', function(){
			expect(log.buildMessage()).to.equal('undefined');
			expect(log.buildMessage(4)).to.equal('4');
			expect(log.buildMessage(4, 5, 'text value')).to.equal('4, 5, "text value"');
			expect(log.buildMessage(undefined, 4, 5, 'text value')).to.equal('undefined, 4, 5, "text value"');
		});

		it('alternates the string items and the parameters when the message is an array of strings', function(){
			expect(log.buildMessage(['Original value', 'converted to'], 4.7, 4)).to.equal('Original value 4.7 converted to 4');
		});

		it('adds extra parameters in brackets at the end of the string when the message is an array of strings', function(){
			expect(log.buildMessage(['Original value', 'converted to'], 4.7, 4, 'some text', 3)).to.equal('Original value 4.7 converted to 4 ("some text", 3)');
		});
	});

	describe('buildMessageFromKey', function(){

		it('calls buildMessage with the value associated with the given key', function(){
			expect(log.buildMessageFromKey('invalidFormat')).to.equal('Invalid format');
			expect(log.buildMessageFromKey('invalidFormat', 'invalid text')).to.equal('Invalid format: "invalid text"');
			expect(log.buildMessageFromKey('invalidFormat', 4)).to.equal('Invalid format: 4');
			expect(log.buildMessageFromKey('invalidFormat', 'invalid text', 5, 'more text')).to.equal('Invalid format: "invalid text" (5, "more text")');

			expect(log.buildMessageFromKey('originalValueConverted', 4.7, 4)).to.equal('Original value 4.7 converted to 4');
			expect(log.buildMessageFromKey('originalValueConverted', 4.7, 4, 'extra value')).to.equal('Original value 4.7 converted to 4 ("extra value")');
		});

		it('builds a default message string when the message identifier is not recognised', function(){
			expect(log.buildMessageFromKey()).to.equal('Unrecognised error');
			expect(log.buildMessageFromKey('completeRubbish')).to.equal('Unrecognised error');
			
			expect(log.buildMessageFromKey(undefined, 4)).to.equal('Unrecognised error: 4');
			expect(log.buildMessageFromKey('completeRubbish', 4)).to.equal('Unrecognised error: 4');

			expect(log.buildMessageFromKey(undefined, 'value text')).to.equal('Unrecognised error: "value text"');
			expect(log.buildMessageFromKey('completeRubbish', 'value text')).to.equal('Unrecognised error: "value text"');
		});
	});
});