/* jshint node: true, esversion: 6 */
'use strict';

var expect = require('chai').expect,
	log = require('../log');

describe('Log', function(){

	describe('logString', function(){
	
		it('creates a log message with quotes', function(){
			expect(log.logString('Invalid value', 'lkjsahfl')).to.equal('Invalid value: "lkjsahfl"');
		});
	});

	describe('logValue', function(){

		it('creates a log message without quotes', function(){
			expect(log.logValue('Invalid value', 'lkjsahfl')).to.equal('Invalid value: lkjsahfl');
			expect(log.logValue('Invalid value', 4)).to.equal('Invalid value: 4');
			expect(log.logValue('Invalid value', undefined)).to.equal('Invalid value: undefined');
		});
	});
});