/* jshint node: true */
"use strict";

var expect = require('chai').expect,
	Monster = require('../../lib/monster'),
	giant = require('../../lib/giant');

describe('Giant Template', function(){

	describe('isCompatible', function(){
		it('returns false for monsters of Colossal size', function(){
			var monster;
			monster = new Monster({size: 'Colossal'});
			expect(giant.isCompatible(monster)).to.be.false;
		});

		it('returns true for monsters of all sizes but Colossal', function(){
			var monster;
			monster = new Monster();
			monster.size = 'Gargantuan';
			expect(giant.isCompatible(monster)).to.be.true;
			monster.size = 'Huge';
			expect(giant.isCompatible(monster)).to.be.true;
			monster.size = 'Large';
			expect(giant.isCompatible(monster)).to.be.true;
			monster.size = 'Medium';
			expect(giant.isCompatible(monster)).to.be.true;
			monster.size = 'Small';
			expect(giant.isCompatible(monster)).to.be.true;
			monster.size = 'Tiny';
			expect(giant.isCompatible(monster)).to.be.true;
			monster.size = 'Diminutive';
			expect(giant.isCompatible(monster)).to.be.true;
			monster.size = 'Fine';
			expect(giant.isCompatible(monster)).to.be.true;
		});
	});

	describe('apply', function(){

		it('increases the CR by one step including for fractions', function(){
			var monster;
			monster = new Monster();
			monster.CR = '1/8';
			giant.apply(monster);
			expect(monster.CR).to.equal('1/6');
			monster.CR = '1/2';
			giant.apply(monster);
			expect(monster.CR).to.equal(1);
			giant.apply(monster);
			expect(monster.CR).to.equal(2);
		});

		it('adds 4 to the Strength', function(){
			var monster = new Monster({Str: 10});
			expect(monster.Str).to.equal(10);
			giant.apply(monster);
			expect(monster.Str).to.equal(14);
		});

		it('adds 4 to the Constitution', function(){
			var monster = new Monster({Con: 10});
			expect(monster.Con).to.equal(10);
			giant.apply(monster);
			expect(monster.Con).to.equal(14);
		});

		it('has no effect on an undead\'s Constitution or Charisma', function(){
			var monster = new Monster({type: 'undead', Cha: 10});
			expect(monster.Con).to.be.undefined;
			expect(monster.Cha).to.equal(10);
			giant.apply(monster);
			expect(monster.Con).to.be.undefined;
			expect(monster.Cha).to.equal(10);
		});

		it('subtracts 2 from the Dexterity', function(){
			var monster = new Monster({Dex: 10});
			expect(monster.Dex).to.equal(10);
			giant.apply(monster);
			expect(monster.Dex).to.equal(8);
		});

		it('doesn\'t reduce the Dex beyond 1', function(){
			var monster = new Monster({Dex: 1});
			expect(monster.Dex).to.equal(1);
			giant.apply(monster);
			expect(monster.Dex).to.equal(1);

			monster = new Monster({Dex: 2});
			expect(monster.Dex).to.equal(2);
			giant.apply(monster);
			expect(monster.Dex).to.equal(1);
		});

		it('increases the size by one category', function(){
			var monster = new Monster({size: 'Fine'});
			giant.apply(monster);
			expect(monster.size).to.equal('Diminutive');

			monster = new Monster({size: 'Medium'});
			giant.apply(monster);
			expect(monster.size).to.equal('Large');
			
			monster = new Monster({size: 'Gargantuan'});
			giant.apply(monster);
			expect(monster.size).to.equal('Colossal');
		});

		it('changes the space to reflect the new size', function(){
			var monster = new Monster({size: 'Fine', space: 0.5});
			giant.apply(monster);
			expect(monster.space).to.equal(1);

			monster = new Monster({size: 'Medium', space: 5});
			giant.apply(monster);
			expect(monster.space).to.equal(10);
			
			monster = new Monster({size: 'Gargantuan', space: 20});
			giant.apply(monster);
			expect(monster.space).to.equal(30);
		});

		it('uses the space offset to change the space according to the new size', function(){
			var monster = new Monster({size: 'Fine', space: 1, spaceOffset: 1});
			giant.apply(monster);
			expect(monster.space).to.equal(2.5);

			monster = new Monster({size: 'Large', space: 15, spaceOffset: 1});
			giant.apply(monster);
			expect(monster.space).to.equal(20);
			
			monster = new Monster({size: 'Gargantuan', space: 15, spaceOffset: -1});
			giant.apply(monster);
			expect(monster.space).to.equal(20);
			
			monster = new Monster({size: 'Huge', space: 5, spaceOffset: -2});
			giant.apply(monster);
			expect(monster.space).to.equal(10);
		});

		it('changes the reach to reflect the new size when the reach is typical', function(){
			var monster = new Monster({size: 'Tiny', reach: 0, shape: 'long'});
			expect(monster.reach).to.equal(0);
			giant.apply(monster);
			expect(monster.reach).to.equal(5);

			monster = new Monster({size: 'Medium', reach: 5, shape: 'long'});
			giant.apply(monster);
			expect(monster.reach).to.equal(5);

			monster = new Monster({size: 'Medium', reach: 5, shape: 'tall'});
			giant.apply(monster);
			expect(monster.reach).to.equal(10);

			monster = new Monster({size: 'Gargantuan', reach: 15, shape: 'long'});
			giant.apply(monster);
			expect(monster.reach).to.equal(20);

			monster = new Monster({size: 'Gargantuan', reach: 20, shape: 'tall'});
			giant.apply(monster);
			expect(monster.reach).to.equal(30);
		});

		it('keeps the reach unchanged when the reach is atypical but the typical reach would not be affected by the change of size', function(){
			var monster;
			// Diminutive to Tiny
			monster = new Monster({size: 'Diminutive', reach: 5, shape: 'long'});
			expect(monster.reach).to.equal(5);
			giant.apply(monster);
			expect(monster.reach).to.equal(5);

			// Small to Medium
			monster = new Monster({size: 'Small', reach: 10, shape: 'tall'});
			expect(monster.reach).to.equal(10);
			giant.apply(monster);
			expect(monster.reach).to.equal(10);

			// Medium long to Large
			monster = new Monster({size: 'Medium', reach: 10, shape: 'long'});
			expect(monster.reach).to.equal(10);
			giant.apply(monster);
			expect(monster.reach).to.equal(10);
		});

		it('changes the reach in the same proportion to the typical reach', function(){
			var monster;
			// Medium tall to Large, larger reach than typical
			monster = new Monster({size: 'Medium', reach: 10, shape: 'tall'});
			expect(monster.reach).to.equal(10); // x2 typical reach for Medium
			giant.apply(monster);
			expect(monster.reach).to.equal(20); // x2 typical reach for Large tall

			monster = new Monster({size: 'Medium', reach: 15, shape: 'tall'});
			expect(monster.reach).to.equal(15); // x3 typical reach for Medium
			giant.apply(monster);
			expect(monster.reach).to.equal(30); // x3 typical reach for Large tall

			// Gargantuan tall to Colossal, smaller reach than typical
			monster = new Monster({size: 'Gargantuan', reach: 10, shape: 'tall'});
			expect(monster.reach).to.equal(10); // 1/2 typical reach for Gargantuan tall
			giant.apply(monster);
			expect(monster.reach).to.equal(15); // 1/2 typical reach for Colossal tall
		});

		it('adds the reach to the typical reach for Small when the original monster is Tiny (can\'t calculate proportion)', function(){
			var monster;
			// Tiny to Small
			monster = new Monster({size: 'Tiny', reach: 5, shape: 'long'});
			expect(monster.reach).to.equal(5);
			giant.apply(monster);
			expect(monster.reach).to.equal(10);			
		});

		it('ignores fractions above 5 ft', function(){
			var monster;

			// Gargantuan to Colossal, smaller reach than typical
			monster = new Monster({size: 'Gargantuan', reach: 5, shape: 'tall'});
			expect(monster.reach).to.equal(5); // x1/4 typical reach for Gargantuan tall
			giant.apply(monster);
			expect(monster.reach).to.equal(5); // x1/4 typical reach for Colossal tall (7.5), rounded down to nearest 5 ft

			// Gargantuan long to Colossal, smaller reach than typical
			monster = new Monster({size: 'Gargantuan', reach: 10, shape: 'long'});
			expect(monster.reach).to.equal(10); // 2/3 typical reach for Gargantuan tall
			giant.apply(monster);
			expect(monster.reach).to.equal(10); // 2/3 typical reach for Colossal tall (13.3) rounded down to nearest 5 ft
		});

		it('increases natural armor by 3', function(){
			var monster = new Monster();
			expect(monster.naturalArmor).to.equal(0);
			giant.apply(monster);
			expect(monster.naturalArmor).to.equal(3);
		});

		it('increases attack dice rolls by one step', function(){
			var monster = new Monster({
				melee: {
					slam: {
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 1,
						dieType: 6
					}}});
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(6);
			giant.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(8);

			monster = new Monster({
				melee: {
					slam: {
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 1,
						dieType: 1
					}}});
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(1);
			giant.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(2);

			monster = new Monster({
				melee: {
					slam: {
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 1,
						dieType: 4
					}}});
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(4);
			giant.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(6);

			monster = new Monster({
				melee: {
					slam: {
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 1,
						dieType: 8
					}}});
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(8);
			giant.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(2);
			expect(monster.melee.slam.dieType).to.equal(6);

			monster = new Monster({
				melee: {
					slam: {
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 2,
						dieType: 8
					}}});
			expect(monster.melee.slam.nbDice).to.equal(2);
			expect(monster.melee.slam.dieType).to.equal(8);
			giant.apply(monster);
			// note: uses Paizo FAQ rules - the natural attack table gives 4d6
			expect(monster.melee.slam.nbDice).to.equal(3);
			expect(monster.melee.slam.dieType).to.equal(8);
		});
	});
});
