/* jshint node: true */
"use strict";

var expect = require('chai').expect,
	sprintf = require('underscore.string/sprintf'),
	format = require('../../lib/format');

describe('Format', function(){
	describe('formatModifier', function(){
		it('formats positive numbers with a plus sign', function(){
			expect(format.formatModifier(1)).to.equal('+1');
			expect(format.formatModifier(10)).to.equal('+10');
			expect(format.formatModifier(3456)).to.equal('+3456');
		});
		
		it('formats zero with a plus sign', function(){
			expect(format.formatModifier(0)).to.equal('+0');
		});
		
		it('formats negative numbers with a minus sign', function(){
			expect(format.formatModifier(-1)).to.equal('-1');
			expect(format.formatModifier(-10)).to.equal('-10');
			expect(format.formatModifier(-3456)).to.equal('-3456');
		});
	});
	
	describe('formatThousands', function(){
		it('groups digits by 3 using commas as the separator', function(){
			expect(format.formatThousands(0)).to.equal('0');
			expect(format.formatThousands(999)).to.equal('999');
			expect(format.formatThousands(1000)).to.equal('1,000');
			expect(format.formatThousands(123456789)).to.equal('123,456,789');
		});
	});
});