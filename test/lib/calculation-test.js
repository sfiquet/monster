/* jshint node: true */
"use strict";

var expect = require('chai').expect,
	Sum = require('../../lib/calculation');

describe('Calculation', function(){
	describe('general use with functions or methods', function(){
		var fSum, // for sum of functions
			mSum, // for sum of methods
			myObj;	// object attached to mSum
		
		beforeEach(function(){
			fSum = new Sum();
			myObj = {};
			mSum = new Sum(myObj);
		});
		
		it('returns 0 if it has no component', function(){
			expect(fSum.calculate()).to.equal(0);
			expect(mSum.calculate()).to.equal(0);
		});
		
		it('returns correct value if it has a single component', function(){
			var f;
			
			myObj.f = f = function(){
				return 8;
			};
			
			fSum.setComponent("single", f);
			mSum.setComponent("single", myObj.f);
			
			expect(fSum.calculate()).to.equal(8);
			expect(mSum.calculate()).to.equal(8);
		});
		
		it('adds the results of two functions or methods', function(){
			var f1, f2;
			
			myObj.f1 = f1 = function(){
				return 1;
			};
			myObj.f2 = f2 = function(){
				return 2;
			};
			
			fSum.setComponent("function 1", f1);
			fSum.setComponent("function 2", f2);
			expect(fSum.calculate()).to.equal(3);
			
			mSum.setComponent("method 1", myObj.f1);
			mSum.setComponent("method 2", myObj.f2);
			expect(mSum.calculate()).to.equal(3);
		});

		it('uses component parameters', function(){
			var f1,
				f2;
			
			// this doesn't check that methods use object properties properly
			myObj.f1 = f1 = function(a, b){
				return a * b;
			};
			myObj.f2 = f2 = function(a, b){
				return a - b;
			};
			
			fSum.setComponent("f1", f1, [2, 3]);	// should give us 6
			fSum.setComponent("f2", f2, [3, 4]);	// -1
			expect(fSum.calculate()).to.equal(5);
			
			mSum.setComponent("f1", myObj.f1, [2, 3]);	// should give us 6
			mSum.setComponent("f2", myObj.f2, [3, 4]);	// -1
			expect(mSum.calculate()).to.equal(5);
		});
		
		it('removes a component', function(){
			var f1,
				f2;
				
			myObj.f1 = f1 = function(){
				return 5;
			};
			myObj.f2 = f2 = function(){
				return 4;
			};
			
			fSum.setComponent("f1", f1);
			fSum.setComponent("f2", f2);
			expect(fSum.calculate()).to.equal(9);
			fSum.removeComponent("f1");
			expect(fSum.calculate()).to.equal(4);
			fSum.removeComponent("f2");
			expect(fSum.calculate()).to.equal(0);
			
			mSum.setComponent("f1", myObj.f1);
			mSum.setComponent("f2", myObj.f2);
			expect(mSum.calculate()).to.equal(9);
			mSum.removeComponent("f1");
			expect(mSum.calculate()).to.equal(4);
			mSum.removeComponent("f2");
			expect(mSum.calculate()).to.equal(0);
		});
		
		it('calculates discrepancy between expected and actual result', function(){
			expect(fSum.calculateDiscrepancy(5)).to.equal(5);
			expect(fSum.calculateDiscrepancy(-5)).to.equal(-5);
			
			expect(mSum.calculateDiscrepancy(5)).to.equal(5);
			expect(mSum.calculateDiscrepancy(-5)).to.equal(-5);
		});
	});
	
	describe('sum of functions', function(){
		var mySum;
		
		beforeEach(function(){
			mySum = new Sum();
		});

		it('replaces a component', function(){
			var f1, 
				f2,
				f3;
			
			f1 = function(a, b, c){
				return a * b - c;
			};
			f2 = function(a, b){
				return a * 2 + b;
			};
			f3 = function(){
				return 5;
			};
			
			// initial calculation
			mySum.setComponent("f1", f1, [2, 3, 3]);	// should give us 3
			mySum.setComponent("f2", f2, [3, 4]);		// 10
			expect(mySum.calculate()).to.equal(13);
			// replace 2nd component
			mySum.setComponent("f2", f3);			// should replace 10 with 5
			expect(mySum.calculate()).to.equal(8);
			mySum.setComponent("f2", f2, [3, 4]);	// replace 5 with 10
			expect(mySum.calculate()).to.equal(13);
			mySum.setComponent("f2", f2, [5, 3]);	// replace 10 with 13
			expect(mySum.calculate()).to.equal(16);
			// also try replacing 1st component just in case
			mySum.setComponent("f1", f3);			// should replace 3 with 5
			expect(mySum.calculate()).to.equal(18);
			mySum.setComponent("f1", f2, [-1, 1]);	// should replace 5 with -1
			expect(mySum.calculate()).to.equal(12);
			mySum.setComponent("f1", f1, [-1, 3, 5]);	// should replace -1 with -8
			expect(mySum.calculate()).to.equal(5);
		});
	});
	
	describe('sum of an object\'s methods', function(){
		var myObj,
			mySum;
		
		beforeEach(function(){
			myObj = {};
			mySum = new Sum(myObj);
		});
				
		it('uses object properties correctly', function(){
			myObj.x = 2;
			myObj.f1 = function(a, b){
				return a * this.x + b;
			};
			myObj.f2 = function(a, b){
				return a * b - this.x;
			};
			mySum.setComponent("f1", myObj.f1, [2, 3]);	// should give us 7
			mySum.setComponent("f2", myObj.f2, [3, 4]);	// 10
			expect(mySum.calculate()).to.equal(17);
		});
		
		it('replaces a component', function(){
			myObj.x = 2;
			myObj.f1 = function(a, b, c){
				return a * this.x + b - c;
			};
			myObj.f2 = function(a, b){
				return a * b - this.x;
			};
			myObj.f3 = function(){
				return this.x;
			};
			// initial calculation
			mySum.setComponent("f1", myObj.f1, [2, 3, 0]);	// should give us 7
			mySum.setComponent("f2", myObj.f2, [3, 4]);	// 10
			expect(mySum.calculate()).to.equal(17);
			// replace 2nd component
			mySum.setComponent("f2", myObj.f3);			// should replace 10 with 2
			expect(mySum.calculate()).to.equal(9);
			mySum.setComponent("f2", myObj.f2, [3, 4]);	// replace 2 with 10
			expect(mySum.calculate()).to.equal(17);
			mySum.setComponent("f2", myObj.f2, [5, 3]);	// replace 10 with 13
			expect(mySum.calculate()).to.equal(20);
			// also try replacing 1st component just in case
			mySum.setComponent("f1", myObj.f3);			// should replace 7 with 2
			expect(mySum.calculate()).to.equal(15);
			mySum.setComponent("f1", myObj.f2, [1, 1]);	// should replace 2 with -1
			expect(mySum.calculate()).to.equal(12);
			mySum.setComponent("f1", myObj.f1, [-1, 3, 5]);	// should replace -1 with -4
			expect(mySum.calculate()).to.equal(9);
		});
	});
});