/* jshint node: true */
"use strict";

var expect = require('chai').expect,
	Monster = require('../../lib/monster'),
	young = require('../../lib/young');

describe('Young Template', function(){
	
	describe('isCompatible', function(){
		
		it('returns false for creatures of Fine size', function(){
			var monster;
			monster = new Monster({size: 'Fine'});
			expect(young.isCompatible(monster)).to.be.false;
		});

		it('returns true for creatures that are bigger than Fine', function() {
			var monster;
			monster = new Monster({size: 'Diminutive'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({size: 'Tiny'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({size: 'Small'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({size: 'Medium'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({size: 'Large'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({size: 'Huge'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({size: 'Gargantuan'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({size: 'Colossal'});
			expect(young.isCompatible(monster)).to.be.true;
		});

		it('returns false for true dragons (increase in power through aging)', function(){
			var monster;
			monster = new Monster({name: 'Young Black Dragon', type: 'dragon'});
			expect(young.isCompatible(monster)).to.be.false;
		});

		it('returns true for creatures of type dragon that are not true dragons', function(){
			var monster;
			monster = new Monster({name: 'Pseudodragon', type: 'dragon'});
			expect(young.isCompatible(monster)).to.be.true;

			monster = new Monster({name: 'Dragon Turtle', type: 'dragon'});
			expect(young.isCompatible(monster)).to.be.true;

			// limits of implementation: depends on how we name dragons in the database
			monster = new Monster({name: 'Black Dragon, Old', type: 'dragon'});
			expect(young.isCompatible(monster)).to.be.true;
		});

		it('returns false for barghests (increase in power through feeding)', function(){
			var monster;
			monster = new Monster({name: 'Barghest'});
			expect(young.isCompatible(monster)).to.be.false;

			monster = new Monster({name: 'Greater Barghest'});
			expect(young.isCompatible(monster)).to.be.false;
		});

		it('returns false for creatures that have the smallest possible CR', function(){
			var monster;
			monster = new Monster({name: 'Bat', CR: '1/8'});
			expect(young.isCompatible(monster)).to.be.false;
		});

		it('returns true for creatures that have a bigger CR than 1/8', function(){
			var monster;
			monster = new Monster({CR: '1/6'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({CR: '1/4'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({CR: '1/3'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({CR: '1/2'});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({CR: 1});
			expect(young.isCompatible(monster)).to.be.true;
			monster = new Monster({CR: 30});
			expect(young.isCompatible(monster)).to.be.true;
		});
	});

	describe('apply', function(){
		it('reduces the CR by one step including for fractions', function(){
			var monster;

			monster = new Monster({CR: '1/6'});
			young.apply(monster);
			expect(monster.CR).to.equal('1/8');

			monster = new Monster({CR: 1});
			young.apply(monster);
			expect(monster.CR).to.equal('1/2');
			
			monster = new Monster({CR: 10});
			young.apply(monster);
			expect(monster.CR).to.equal(9);
		});

		it('reduces the Size by one category', function(){
			var monster;
			monster = new Monster({size: 'Colossal'});
			young.apply(monster);
			expect(monster.size).to.equal('Gargantuan');

			monster = new Monster({size: 'Medium'});
			young.apply(monster);
			expect(monster.size).to.equal('Small');

			monster = new Monster({size: 'Diminutive'});
			young.apply(monster);
			expect(monster.size).to.equal('Fine');
		});
		
		it('reduces natural armor by -2', function(){
			var monster = new Monster({naturalArmor: 5});
			young.apply(monster);
			expect(monster.naturalArmor).to.equal(3);
		});

		it('doesn\'t reduce natural armor beyond zero', function(){
			var monster = new Monster({naturalArmor: 1});
			young.apply(monster);
			expect(monster.naturalArmor).to.equal(0);
		});

		it('decreases damage dice by one step', function(){
			var monster = new Monster({
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
			young.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(6);

			monster = new Monster({
				melee: {
					slam: {
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 1,
						dieType: 2
					}}});
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(2);
			young.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(1);

			monster = new Monster({
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
			young.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(4);

			monster = new Monster({
				size: 'Medium',
				melee: {
					slam: {
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 2,
						dieType: 6
					}}});
			expect(monster.melee.slam.nbDice).to.equal(2);
			expect(monster.melee.slam.dieType).to.equal(6);
			young.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(10);

			monster = new Monster({
				size: 'Large',
				melee: {
					slam: {
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 2,
						dieType: 6
					}}});
			expect(monster.melee.slam.nbDice).to.equal(2);
			expect(monster.melee.slam.dieType).to.equal(6);
			young.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(1);
			expect(monster.melee.slam.dieType).to.equal(8);

			monster = new Monster({
				size: 'Medium',
				melee: {
					slam: {
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 3,
						dieType: 8
					}}});
			expect(monster.melee.slam.nbDice).to.equal(3);
			expect(monster.melee.slam.dieType).to.equal(8);
			young.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(3);
			expect(monster.melee.slam.dieType).to.equal(6);

			monster = new Monster({
				size: 'Large',
				melee: {
					slam: {
						name: 'slam', 
						type: 'natural', 
						nbAttacks: 1, 
						nbDice: 3,
						dieType: 8
					}}});
			expect(monster.melee.slam.nbDice).to.equal(3);
			expect(monster.melee.slam.dieType).to.equal(8);
			young.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(2);
			expect(monster.melee.slam.dieType).to.equal(8);
		});
		
		it('sets the damage dice to zero (removing the attack) when decreasing beyond the minimum', function(){
			// when decreasing beyond 1, the attack doesn't exist anymore
			// we'll keep the attack around (with 0 dice) in case we need to 
			// apply another template that resurrects its power, e.g. young
			var monster;
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
			young.apply(monster);
			expect(monster.melee.slam.nbDice).to.equal(0);
			expect(monster.melee.slam.dieType).to.equal(1);
		});

		it('subtracts 4 from the Strength', function(){
			var monster = new Monster({Str: 10});
			expect(monster.Str).to.equal(10);
			young.apply(monster);
			expect(monster.Str).to.equal(6);
		});

		it('doesn\'t reduce the Strength beyond 1', function(){
			var monster = new Monster({Str: 2});
			expect(monster.Str).to.equal(2);
			young.apply(monster);
			expect(monster.Str).to.equal(1);
		});
		
		it('subtracts 4 from the Constitution', function(){
			var monster = new Monster({Con: 10});
			expect(monster.Con).to.equal(10);
			young.apply(monster);
			expect(monster.Con).to.equal(6);
		});

		it('doesn\'t reduce the Constitution beyond 1', function(){
			var monster = new Monster({Con: 2});
			expect(monster.Con).to.equal(2);
			young.apply(monster);
			expect(monster.Con).to.equal(1);
		});

		// Should you even have a young undead? You could argue they died young?
		// Plus the Young template is also used to make smaller, weaker monsters
		// regardless of their age (e.g. to transform a gorilla into an 
		// orang-utan or chimpanzee)
		it('has no effect on an undead\'s Constitution or Charisma', function(){
			var monster = new Monster({type: 'undead', Cha: 10});
			expect(monster.Con).to.be.undefined;
			expect(monster.Cha).to.equal(10);
			young.apply(monster);
			expect(monster.Con).to.be.undefined;
			expect(monster.Cha).to.equal(10);
		});

		it('adds 4 to the Dexterity', function(){
			var monster = new Monster({Dex: 10});
			expect(monster.Dex).to.equal(10);
			young.apply(monster);
			expect(monster.Dex).to.equal(14);
		});

		it('changes the space to reflect the new size', function(){
			var monster = new Monster({size: 'Diminutive', space: 1});
			young.apply(monster);
			expect(monster.space).to.equal(0.5);

			monster = new Monster({size: 'Large', space: 10});
			young.apply(monster);
			expect(monster.space).to.equal(5);
			
			monster = new Monster({size: 'Colossal', space: 30});
			young.apply(monster);
			expect(monster.space).to.equal(20);			
		});
		
		it('uses the space offset to change the space according to the new size', function(){
			var monster = new Monster({size: 'Diminutive', space: 2.5, spaceOffset: 1});
			young.apply(monster);
			expect(monster.space).to.equal(1);

			monster = new Monster({size: 'Large', space: 15, spaceOffset: 1});
			young.apply(monster);
			expect(monster.space).to.equal(10);
			
			monster = new Monster({size: 'Gargantuan', space: 15, spaceOffset: -1});
			young.apply(monster);
			expect(monster.space).to.equal(10);
			
			monster = new Monster({size: 'Huge', space: 5, spaceOffset: -2});
			young.apply(monster);
			expect(monster.space).to.equal(5);
		});

		it('changes the reach to reflect the new size when the reach is typical', function(){
			var monster = new Monster({size: 'Small', reach: 5, shape: 'long'});
			young.apply(monster);
			expect(monster.reach).to.equal(0);

			monster = new Monster({size: 'Medium', reach: 5, shape: 'long'});
			young.apply(monster);
			expect(monster.reach).to.equal(5);

			monster = new Monster({size: 'Colossal', reach: 20, shape: 'long'});
			young.apply(monster);
			expect(monster.reach).to.equal(15);

			monster = new Monster({size: 'Colossal', reach: 30, shape: 'tall'});
			young.apply(monster);
			expect(monster.reach).to.equal(20);
		});

		it('keeps the reach unchanged when the reach is atypical but the typical reach would not be affected by the change of size', function(){
			var monster = new Monster({size: 'Diminutive', reach: 5, shape: 'long'});
			young.apply(monster);
			expect(monster.reach).to.equal(5);

			monster = new Monster({size: 'Medium', reach: 10, shape: 'long'});
			young.apply(monster);
			expect(monster.reach).to.equal(10);
		});

		it('changes the reach in proportion to the typical reaches before and after', function(){
			// larger reach than usual
			var monster = new Monster({size: 'Colossal', reach: 60, shape: 'tall'});
			young.apply(monster);
			expect(monster.reach).to.equal(40);

			monster = new Monster({size: 'Colossal', reach: 60, shape: 'long'});
			young.apply(monster);
			expect(monster.reach).to.equal(45);

			// smaller reach than usual
			monster = new Monster({size: 'Colossal', reach: 15, shape: 'tall'});
			young.apply(monster);
			expect(monster.reach).to.equal(10);
		});

		it('makes the reach 0 from Small to Tiny when the original reach is 0', function(){
			var monster = new Monster({size: 'Small', reach: 0, shape: 'tall'});
			young.apply(monster);
			expect(monster.reach).to.equal(0);
		});

		it('uses the difference between the original and the typical reach from Small to Tiny when the original reach is over 5 ft', function(){
			var monster = new Monster({size: 'Small', reach: 15, shape: 'tall'});
			young.apply(monster);
			expect(monster.reach).to.equal(10);
		});

		it('rounds down the result to the nearest lower 5 ft', function(){
			var monster = new Monster({size: 'Colossal', reach: 15, shape: 'long'});
			young.apply(monster);
			expect(monster.reach).to.equal(10); // 15*15/20 = 11.25 rounds down to 10

			monster = new Monster({size: 'Gargantuan', reach: 5, shape: 'long'});
			young.apply(monster);
			expect(monster.reach).to.equal(0); // 5*10/15 = 3.33 rounds down to 0

			monster = new Monster({size: 'Gargantuan', reach: 5, shape: 'tall'});
			young.apply(monster);
			expect(monster.reach).to.equal(0); // 5*15/20 = 3.75 rounds down to 0
		});
	});
});
