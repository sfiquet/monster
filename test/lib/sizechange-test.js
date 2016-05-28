/* jshint node: true */
'use strict';

var expect = require('chai').expect,
	sizeLib = require('../../lib/sizechange');

describe('Damage dice', function(){

	describe('getNextDamageDiceUp', function(){

		it('returns undefined if the parameters are incorrect', function(){
			expect(sizeLib.getNextDamageDiceUp(undefined, {nbDice: 1, dieType: 4})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceUp('not a size', {nbDice: 1, dieType: 4})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 1})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceUp('Medium', {dieType: 4})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceUp('Medium')).to.be.undefined();
		});

		it('returns the correct damage dice when the initial damage is 1d6 or less', function(){
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 1, dieType: 1})).to.deep.equal({nbDice: 1, dieType: 2});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 1, dieType: 2})).to.deep.equal({nbDice: 1, dieType: 3});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 1, dieType: 3})).to.deep.equal({nbDice: 1, dieType: 4});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 1, dieType: 4})).to.deep.equal({nbDice: 1, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 1, dieType: 6})).to.deep.equal({nbDice: 1, dieType: 8});
		});

		it('returns the correct damage dice for an initial size of Small or lower', function(){
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 1, dieType: 1})).to.deep.equal({nbDice: 1, dieType: 2});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 1, dieType: 2})).to.deep.equal({nbDice: 1, dieType: 3});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 1, dieType: 3})).to.deep.equal({nbDice: 1, dieType: 4});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 1, dieType: 4})).to.deep.equal({nbDice: 1, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 1, dieType: 6})).to.deep.equal({nbDice: 1, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 1, dieType: 8})).to.deep.equal({nbDice: 1, dieType: 10});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 1, dieType: 10})).to.deep.equal({nbDice: 2, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 2, dieType: 6})).to.deep.equal({nbDice: 2, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 2, dieType: 8})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 3, dieType: 6})).to.deep.equal({nbDice: 3, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 3, dieType: 8})).to.deep.equal({nbDice: 4, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 4, dieType: 6})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 4, dieType: 8})).to.deep.equal({nbDice: 6, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 6, dieType: 6})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 6, dieType: 8})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 8, dieType: 6})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 8, dieType: 8})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 12, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 12, dieType: 8})).to.deep.equal({nbDice: 16, dieType: 6});

			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 1, dieType: 1})).to.deep.equal({nbDice: 1, dieType: 2});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 1, dieType: 2})).to.deep.equal({nbDice: 1, dieType: 3});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 1, dieType: 3})).to.deep.equal({nbDice: 1, dieType: 4});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 1, dieType: 4})).to.deep.equal({nbDice: 1, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 1, dieType: 6})).to.deep.equal({nbDice: 1, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 1, dieType: 8})).to.deep.equal({nbDice: 1, dieType: 10});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 1, dieType: 10})).to.deep.equal({nbDice: 2, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 2, dieType: 6})).to.deep.equal({nbDice: 2, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 2, dieType: 8})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 3, dieType: 6})).to.deep.equal({nbDice: 3, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 3, dieType: 8})).to.deep.equal({nbDice: 4, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 4, dieType: 6})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 4, dieType: 8})).to.deep.equal({nbDice: 6, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 6, dieType: 6})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 6, dieType: 8})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 8, dieType: 6})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 8, dieType: 8})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 12, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Fine', {nbDice: 12, dieType: 8})).to.deep.equal({nbDice: 16, dieType: 6});
		});

		it('returns the correct damage dice for an initial size of Medium or higher with damage of 1d8 or higher', function(){
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 1, dieType: 8})).to.deep.equal({nbDice: 2, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 1, dieType: 10})).to.deep.equal({nbDice: 2, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 2, dieType: 6})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 2, dieType: 8})).to.deep.equal({nbDice: 3, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 3, dieType: 6})).to.deep.equal({nbDice: 4, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 3, dieType: 8})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 4, dieType: 6})).to.deep.equal({nbDice: 6, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 4, dieType: 8})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 6, dieType: 6})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 6, dieType: 8})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 8, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 8, dieType: 8})).to.deep.equal({nbDice: 12, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 12, dieType: 6})).to.deep.equal({nbDice: 16, dieType: 6});

			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 1, dieType: 8})).to.deep.equal({nbDice: 2, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 1, dieType: 10})).to.deep.equal({nbDice: 2, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 1, dieType: 12})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 2, dieType: 6})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 2, dieType: 8})).to.deep.equal({nbDice: 3, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 3, dieType: 6})).to.deep.equal({nbDice: 4, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 3, dieType: 8})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 4, dieType: 6})).to.deep.equal({nbDice: 6, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 4, dieType: 8})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 6, dieType: 6})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 6, dieType: 8})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 8, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 8, dieType: 8})).to.deep.equal({nbDice: 12, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Gargantuan', {nbDice: 12, dieType: 6})).to.deep.equal({nbDice: 16, dieType: 6});
		});

		it('returns the correct damage dice when the original damage is a non-standard number of d6', function(){
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 5, dieType: 6})).to.deep.equal({nbDice: 6, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 7, dieType: 6})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 9, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 10, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 11, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 6});
			// those last calculations only work for Small and lower sizes
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 13, dieType: 6})).to.deep.equal({nbDice: 16, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 14, dieType: 6})).to.deep.equal({nbDice: 16, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 15, dieType: 6})).to.deep.equal({nbDice: 16, dieType: 6});

			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 5, dieType: 6})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 7, dieType: 6})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 9, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 10, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 11, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 8});			
		});

		it('returns the correct damage dice when the original damage is a non-standard number of d8', function(){
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 5, dieType: 8})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 7, dieType: 8})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 9, dieType: 8})).to.deep.equal({nbDice: 12, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 10, dieType: 8})).to.deep.equal({nbDice: 12, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 11, dieType: 8})).to.deep.equal({nbDice: 12, dieType: 8});

			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 5, dieType: 8})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 7, dieType: 8})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 9, dieType: 8})).to.deep.equal({nbDice: 16, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 10, dieType: 8})).to.deep.equal({nbDice: 16, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 11, dieType: 8})).to.deep.equal({nbDice: 16, dieType: 6});			
		});
		
		it('returns the correct damage dice when the original damage has several d4', function(){
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 2, dieType: 4})).to.deep.equal({nbDice: 1, dieType: 10});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 3, dieType: 4})).to.deep.equal({nbDice: 2, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 4, dieType: 4})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 6, dieType: 4})).to.deep.equal({nbDice: 4, dieType: 8});

			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 2, dieType: 4})).to.deep.equal({nbDice: 2, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 3, dieType: 4})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 4, dieType: 4})).to.deep.equal({nbDice: 3, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 6, dieType: 4})).to.deep.equal({nbDice: 6, dieType: 6});
			// not much point in testing further as d4 are not used in big numbers
		});

		it('returns undefined when the original damage has several d4 but not a multiple of 2 or 3', function(){
			// 5d4 has no calculation (but is not likely to be used)
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 5, dieType: 4})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 5, dieType: 4})).to.be.undefined();
		});

		it('returns the correct damage dice when the original damage has several d10', function(){
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 2, dieType: 10})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 4, dieType: 10})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 6, dieType: 10})).to.deep.equal({nbDice: 12, dieType: 8});
			// same results for bigger sizes
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 2, dieType: 10})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 4, dieType: 10})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 6, dieType: 10})).to.deep.equal({nbDice: 12, dieType: 8});
		});

		it('returns undefined when the original damage has several d10 but not a multiple of 2', function(){
			// the calculation only works on numbers that are multiples of 2
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 3, dieType: 10})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 5, dieType: 10})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 3, dieType: 10})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 5, dieType: 10})).to.be.undefined();
		});

		it('returns the correct damage dice when the original damage is based on d12', function(){
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 1, dieType: 12})).to.deep.equal({nbDice: 2, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 2, dieType: 12})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 3, dieType: 12})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 4, dieType: 12})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 5, dieType: 12})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 6, dieType: 12})).to.deep.equal({nbDice: 12, dieType: 8});
			// 7d12 calculation only works for smaller sizes
			expect(sizeLib.getNextDamageDiceUp('Small', {nbDice: 7, dieType: 12})).to.deep.equal({nbDice: 16, dieType: 6});

			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 1, dieType: 12})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 2, dieType: 12})).to.deep.equal({nbDice: 6, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 3, dieType: 12})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 4, dieType: 12})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 5, dieType: 12})).to.deep.equal({nbDice: 12, dieType: 8});
			expect(sizeLib.getNextDamageDiceUp('Medium', {nbDice: 6, dieType: 12})).to.deep.equal({nbDice: 16, dieType: 6});
		});
	});

	describe('getNextDamageDiceDown', function(){
		it('returns undefined if the parameters are incorrect', function(){
			expect(sizeLib.getNextDamageDiceDown(undefined, {nbDice: 1, dieType: 6})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceDown('not a size', {nbDice: 1, dieType: 6})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 1})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceDown('Medium', {dieType: 6})).to.be.undefined();
			expect(sizeLib.getNextDamageDiceDown('Medium')).to.be.undefined();
		});

		it('returns a dice representing an absence of damage when it is impossible to decrease any further', function(){
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 1, dieType: 1})).to.deep.equal({nbDice: 0, dieType: 1});
		});

		it('returns the correct damage dice when the initial damage is 1d8 or less', function(){
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 1, dieType: 2})).to.deep.equal({nbDice: 1, dieType: 1});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 1, dieType: 3})).to.deep.equal({nbDice: 1, dieType: 2});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 1, dieType: 4})).to.deep.equal({nbDice: 1, dieType: 3});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 1, dieType: 6})).to.deep.equal({nbDice: 1, dieType: 4});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 1, dieType: 8})).to.deep.equal({nbDice: 1, dieType: 6});
		});

		it('returns the correct damage dice for an initial size of Medium or lower', function(){
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 1, dieType: 2})).to.deep.equal({nbDice: 1, dieType: 1});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 1, dieType: 3})).to.deep.equal({nbDice: 1, dieType: 2});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 1, dieType: 4})).to.deep.equal({nbDice: 1, dieType: 3});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 1, dieType: 6})).to.deep.equal({nbDice: 1, dieType: 4});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 1, dieType: 8})).to.deep.equal({nbDice: 1, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 1, dieType: 10})).to.deep.equal({nbDice: 1, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 2, dieType: 6})).to.deep.equal({nbDice: 1, dieType: 10});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 2, dieType: 8})).to.deep.equal({nbDice: 2, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 3, dieType: 6})).to.deep.equal({nbDice: 2, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 3, dieType: 8})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 4, dieType: 6})).to.deep.equal({nbDice: 3, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 4, dieType: 8})).to.deep.equal({nbDice: 4, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 6, dieType: 6})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 6, dieType: 8})).to.deep.equal({nbDice: 6, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 8, dieType: 6})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 8, dieType: 8})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 12, dieType: 6})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 12, dieType: 8})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Medium', {nbDice: 16, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 8});

			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 1, dieType: 2})).to.deep.equal({nbDice: 1, dieType: 1});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 1, dieType: 3})).to.deep.equal({nbDice: 1, dieType: 2});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 1, dieType: 4})).to.deep.equal({nbDice: 1, dieType: 3});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 1, dieType: 6})).to.deep.equal({nbDice: 1, dieType: 4});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 1, dieType: 8})).to.deep.equal({nbDice: 1, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 1, dieType: 10})).to.deep.equal({nbDice: 1, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 2, dieType: 6})).to.deep.equal({nbDice: 1, dieType: 10});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 2, dieType: 8})).to.deep.equal({nbDice: 2, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 3, dieType: 6})).to.deep.equal({nbDice: 2, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 3, dieType: 8})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 4, dieType: 6})).to.deep.equal({nbDice: 3, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 4, dieType: 8})).to.deep.equal({nbDice: 4, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 6, dieType: 6})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 6, dieType: 8})).to.deep.equal({nbDice: 6, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 8, dieType: 6})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 8, dieType: 8})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 12, dieType: 6})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 12, dieType: 8})).to.deep.equal({nbDice: 12, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Fine', {nbDice: 16, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 8});
		});

		it('returns the correct damage dice for an initial size of Large or higher with damage of 1d10 or higher', function(){
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 1, dieType: 10})).to.deep.equal({nbDice: 1, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 2, dieType: 6})).to.deep.equal({nbDice: 1, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 2, dieType: 8})).to.deep.equal({nbDice: 1, dieType: 10});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 3, dieType: 6})).to.deep.equal({nbDice: 2, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 3, dieType: 8})).to.deep.equal({nbDice: 2, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 4, dieType: 6})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 4, dieType: 8})).to.deep.equal({nbDice: 3, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 6, dieType: 6})).to.deep.equal({nbDice: 4, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 6, dieType: 8})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 8, dieType: 6})).to.deep.equal({nbDice: 6, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 8, dieType: 8})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 12, dieType: 6})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 12, dieType: 8})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Large', {nbDice: 16, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 6});

			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 1, dieType: 10})).to.deep.equal({nbDice: 1, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 2, dieType: 6})).to.deep.equal({nbDice: 1, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 2, dieType: 8})).to.deep.equal({nbDice: 1, dieType: 10});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 3, dieType: 6})).to.deep.equal({nbDice: 2, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 3, dieType: 8})).to.deep.equal({nbDice: 2, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 4, dieType: 6})).to.deep.equal({nbDice: 3, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 4, dieType: 8})).to.deep.equal({nbDice: 3, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 6, dieType: 6})).to.deep.equal({nbDice: 4, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 6, dieType: 8})).to.deep.equal({nbDice: 4, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 8, dieType: 6})).to.deep.equal({nbDice: 6, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 8, dieType: 8})).to.deep.equal({nbDice: 6, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 12, dieType: 6})).to.deep.equal({nbDice: 8, dieType: 6});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 12, dieType: 8})).to.deep.equal({nbDice: 8, dieType: 8});
			expect(sizeLib.getNextDamageDiceDown('Colossal', {nbDice: 16, dieType: 6})).to.deep.equal({nbDice: 12, dieType: 6});
		});
	});

	describe('calculateReach', function(){

		it('returns the typical reach for the new size when the old reach was typical for the old size - getting bigger, tall', function(){
			expect(sizeLib.calculateReach('Fine', 'Diminutive', 0, 'tall')).to.equal(0);
			expect(sizeLib.calculateReach('Tiny', 'Small', 0, 'tall')).to.equal(5);
			expect(sizeLib.calculateReach('Medium', 'Large', 5, 'tall')).to.equal(10);
			expect(sizeLib.calculateReach('Gargantuan', 'Colossal', 20, 'tall')).to.equal(30);
		});

		it('returns the typical reach for the new size when the old reach was typical for the old size - getting bigger, long', function(){
			expect(sizeLib.calculateReach('Fine', 'Diminutive', 0, 'long')).to.equal(0);
			expect(sizeLib.calculateReach('Tiny', 'Small', 0, 'long')).to.equal(5);
			expect(sizeLib.calculateReach('Medium', 'Large', 5, 'long')).to.equal(5);
			expect(sizeLib.calculateReach('Gargantuan', 'Colossal', 15, 'long')).to.equal(20);
		});

		it('returns the typical reach for the new size when the old reach was typical for the old size - getting smaller, tall', function(){
			expect(sizeLib.calculateReach('Colossal', 'Gargantuan', 30, 'tall')).to.equal(20);
			expect(sizeLib.calculateReach('Medium', 'Small', 5, 'tall')).to.equal(5);
			expect(sizeLib.calculateReach('Small', 'Tiny', 5, 'tall')).to.equal(0);
			expect(sizeLib.calculateReach('Diminutive', 'Fine', 0, 'tall')).to.equal(0);
		});

		it('returns the typical reach for the new size when the old reach was typical for the old size - getting smaller, long', function(){
			expect(sizeLib.calculateReach('Colossal', 'Gargantuan', 20, 'long')).to.equal(15);
			expect(sizeLib.calculateReach('Medium', 'Small', 5, 'long')).to.equal(5);
			expect(sizeLib.calculateReach('Small', 'Tiny', 5, 'long')).to.equal(0);
			expect(sizeLib.calculateReach('Diminutive', 'Fine', 0, 'long')).to.equal(0);
		});

		it('returns the old reach when the typical reach is the same for the old size and the new size - getting bigger, tall', function(){
			expect(sizeLib.calculateReach('Fine', 'Diminutive', 5, 'tall')).to.equal(5);
			expect(sizeLib.calculateReach('Diminutive', 'Tiny', 5, 'tall')).to.equal(5);
			expect(sizeLib.calculateReach('Small', 'Medium', 10, 'tall')).to.equal(10);
		});

		it('returns the old reach when the typical reach is the same for the old size and the new size - getting bigger, long', function(){
			expect(sizeLib.calculateReach('Fine', 'Diminutive', 5, 'long')).to.equal(5);
			expect(sizeLib.calculateReach('Diminutive', 'Tiny', 5, 'long')).to.equal(5);
			expect(sizeLib.calculateReach('Small', 'Medium', 10, 'long')).to.equal(10);
			expect(sizeLib.calculateReach('Medium', 'Large', 20, 'long')).to.equal(20);
		});

		it('returns the old reach when the typical reach is the same for the old size and the new size - getting smaller, tall', function(){
			expect(sizeLib.calculateReach('Medium', 'Small', 10, 'tall')).to.equal(10);
			expect(sizeLib.calculateReach('Tiny', 'Diminutive', 5, 'tall')).to.equal(5);
			expect(sizeLib.calculateReach('Diminutive', 'Fine', 5, 'tall')).to.equal(5);
		});

		it('returns the old reach when the typical reach is the same for the old size and the new size - getting smaller, long', function(){
			expect(sizeLib.calculateReach('Large', 'Medium', 20, 'long')).to.equal(20);
			expect(sizeLib.calculateReach('Medium', 'Small', 10, 'long')).to.equal(10);
			expect(sizeLib.calculateReach('Tiny', 'Diminutive', 5, 'long')).to.equal(5);
			expect(sizeLib.calculateReach('Diminutive', 'Fine', 5, 'long')).to.equal(5);
		});

		it('returns the sum of the old reach and the typical reach for the new size when changing from Tiny to Small', function(){
			expect(sizeLib.calculateReach('Tiny', 'Small', 5, 'tall')).to.equal(10);
			expect(sizeLib.calculateReach('Tiny', 'Small', 10, 'tall')).to.equal(15);

			expect(sizeLib.calculateReach('Tiny', 'Small', 5, 'long')).to.equal(10);
			expect(sizeLib.calculateReach('Tiny', 'Small', 10, 'long')).to.equal(15);
		});

		it('returns the difference between the old reach and the typical reach for the old size when changing from Small to Tiny', function(){
			expect(sizeLib.calculateReach('Small', 'Tiny', 15, 'tall')).to.equal(10);
			expect(sizeLib.calculateReach('Small', 'Tiny', 10, 'tall')).to.equal(5);

			expect(sizeLib.calculateReach('Small', 'Tiny', 15, 'long')).to.equal(10);
			expect(sizeLib.calculateReach('Small', 'Tiny', 10, 'long')).to.equal(5);
		});

		it('returns zero if the old reach is smaller than typical when changing from Small to Tiny', function(){
			expect(sizeLib.calculateReach('Small', 'Tiny', 0, 'tall')).to.equal(0);			
			expect(sizeLib.calculateReach('Small', 'Tiny', 0, 'long')).to.equal(0);			
		});

		it('returns the product of the old reach by the new typical reach divided by the old typical reach - bigger reach than usual', function(){
			expect(sizeLib.calculateReach('Medium', 'Large', 10, 'tall')).to.equal(20); // 10*10/5
			expect(sizeLib.calculateReach('Medium', 'Large', 15, 'tall')).to.equal(30); // 15*10/5
			expect(sizeLib.calculateReach('Colossal', 'Gargantuan', 60, 'tall')).to.equal(40); // 60*20/30
			expect(sizeLib.calculateReach('Colossal', 'Gargantuan', 40, 'long')).to.equal(30); // 60*15/20
		});

		it('returns the product of the old reach by the new typical reach divided by the old typical reach - smaller reach than usual', function(){
			expect(sizeLib.calculateReach('Gargantuan', 'Colossal', 10, 'tall')).to.equal(15); // 10*30/20
			// note: in most cases (and especially when reducing the size), we end up in a rounding down situation - see below
		});

		it('rounds down the reach to the nearest square', function(){
			expect(sizeLib.calculateReach('Gargantuan', 'Colossal', 5, 'tall')).to.equal(5); // 5*30/20 = 7.5 rounded down
			expect(sizeLib.calculateReach('Colossal', 'Gargantuan', 10, 'tall')).to.equal(5); // 10*20/30 = 6.7 rounded down
		});
	});

	describe('calculateSpace', function(){
		it('returns the space corresponding to the given size', function(){
			expect(sizeLib.calculateSpace('Fine')).to.equal(0.5);
			expect(sizeLib.calculateSpace('Medium')).to.equal(5);
			expect(sizeLib.calculateSpace('Colossal')).to.equal(30);
		});

		it('returns the space corresponding to the given size plus the given offset', function(){
			expect(sizeLib.calculateSpace('Medium', 1)).to.equal(10);
			expect(sizeLib.calculateSpace('Medium', 2)).to.equal(15);
			expect(sizeLib.calculateSpace('Medium', 3)).to.equal(20);
			expect(sizeLib.calculateSpace('Medium', 4)).to.equal(30);

			expect(sizeLib.calculateSpace('Medium', -1)).to.equal(5);
			expect(sizeLib.calculateSpace('Medium', -2)).to.equal(2.5);
			expect(sizeLib.calculateSpace('Medium', -3)).to.equal(1);
			expect(sizeLib.calculateSpace('Medium', -4)).to.equal(0.5);
		});

		it('returns undefined if the offset doesn\'t correspond to a valid size', function(){
			expect(sizeLib.calculateSpace('Colossal', 1)).to.be.undefined();
			expect(sizeLib.calculateSpace('Gargantuan', 2)).to.be.undefined();
			expect(sizeLib.calculateSpace('Medium', 5)).to.be.undefined();
			expect(sizeLib.calculateSpace('Medium', -5)).to.be.undefined();
			expect(sizeLib.calculateSpace('Diminutive', -2)).to.be.undefined();
			expect(sizeLib.calculateSpace('Fine', -1)).to.be.undefined();
		});
	});
});