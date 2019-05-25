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
		
		it('returns null when the given monster is null', () => {
			expect(young.apply(null)).to.be.null;
		});

			it('returns null if the template cannot be applied to the monster', () => {
			const stats = {size: 'Fine'};
			const monster = new Monster(stats);
			expect(young.apply(monster)).to.be.null;
			// monster is not mutated
			expect(monster).to.deep.equal(new Monster(stats));
		});

		it('returns a new monster if successful', () => {
			const stats = {size: 'Diminutive', Str: 18, Dex: 16, Con: 14};
			const monster = new Monster(stats);
			const newMonster = young.apply(monster);
			expect(newMonster).to.be.an('object');
			expect(newMonster.size).to.equal('Fine');
			// monster is not mutated
			expect(monster).to.deep.equal(new Monster(stats));
		});

	it('reduces the CR by one step including for fractions', function(){
			let monster;
			let newMonster;

			monster = new Monster({CR: '1/6'});
			newMonster = young.apply(monster);
			expect(newMonster.CR).to.equal('1/8');

			monster = new Monster({CR: 1});
			newMonster = young.apply(monster);
			expect(newMonster.CR).to.equal('1/2');
			
			monster = new Monster({CR: 10});
			newMonster = young.apply(monster);
			expect(newMonster.CR).to.equal(9);
		});

		it('reduces the Size by one category', function(){
			let monster;
			let newMonster;

			monster = new Monster({size: 'Colossal'});
			newMonster = young.apply(monster);
			expect(newMonster.size).to.equal('Gargantuan');

			monster = new Monster({size: 'Medium'});
			newMonster = young.apply(monster);
			expect(newMonster.size).to.equal('Small');

			monster = new Monster({size: 'Diminutive'});
			newMonster = young.apply(monster);
			expect(newMonster.size).to.equal('Fine');
		});
		
		it('reduces natural armor by -2', function(){
			const monster = new Monster({naturalArmor: 5});
			const newMonster = young.apply(monster);
			expect(newMonster.naturalArmor).to.equal(3);
		});

		it('doesn\'t reduce natural armor beyond zero', function(){
			const monster = new Monster({naturalArmor: 1});
			const newMonster = young.apply(monster);
			expect(newMonster.naturalArmor).to.equal(0);
		});

		it('decreases damage dice by one step', function(){
			let monster;
			let newMonster;

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
			newMonster = young.apply(monster);
			expect(newMonster.melee.slam.nbDice).to.equal(1);
			expect(newMonster.melee.slam.dieType).to.equal(6);

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
			newMonster = young.apply(monster);
			expect(newMonster.melee.slam.nbDice).to.equal(1);
			expect(newMonster.melee.slam.dieType).to.equal(1);

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
			newMonster = young.apply(monster);
			expect(newMonster.melee.slam.nbDice).to.equal(1);
			expect(newMonster.melee.slam.dieType).to.equal(4);

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
			newMonster = young.apply(monster);
			expect(newMonster.melee.slam.nbDice).to.equal(1);
			expect(newMonster.melee.slam.dieType).to.equal(10);

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
			newMonster = young.apply(monster);
			expect(newMonster.melee.slam.nbDice).to.equal(1);
			expect(newMonster.melee.slam.dieType).to.equal(8);

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
			newMonster = young.apply(monster);
			expect(newMonster.melee.slam.nbDice).to.equal(3);
			expect(newMonster.melee.slam.dieType).to.equal(6);

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
			newMonster = young.apply(monster);
			expect(newMonster.melee.slam.nbDice).to.equal(2);
			expect(newMonster.melee.slam.dieType).to.equal(8);
		});
		
		it('sets the damage dice to zero (removing the attack) when decreasing beyond the minimum', function(){
			// when decreasing beyond 1, the attack doesn't exist anymore
			// we'll keep the attack around (with 0 dice) in case we need to 
			// apply another template that resurrects its power, e.g. giant
			const monster = new Monster({
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
			const newMonster = young.apply(monster);
			expect(newMonster.melee.slam.nbDice).to.equal(0);
			expect(newMonster.melee.slam.dieType).to.equal(1);
		});

		it('subtracts 4 from the Strength', function(){
			const monster = new Monster({Str: 10});
			const newMonster = young.apply(monster);
			expect(newMonster.Str).to.equal(6);
		});

		it('doesn\'t reduce the Strength beyond 1', function(){
			const monster = new Monster({Str: 2});
			const newMonster = young.apply(monster);
			expect(newMonster.Str).to.equal(1);
		});
		
		it('subtracts 4 from the Constitution', function(){
			const monster = new Monster({Con: 10});
			const newMonster = young.apply(monster);
			expect(newMonster.Con).to.equal(6);
		});

		it('doesn\'t reduce the Constitution beyond 1', function(){
			const monster = new Monster({Con: 2});
			expect(monster.Con).to.equal(2);
			const newMonster = young.apply(monster);
			expect(newMonster.Con).to.equal(1);
		});

		// Should you even have a young undead? You could argue they died young?
		// Plus the Young template is also used to make smaller, weaker monsters
		// regardless of their age (e.g. to transform a gorilla into an 
		// orang-utan or chimpanzee)
		it('has no effect on an undead\'s Constitution or Charisma', function(){
			const monster = new Monster({type: 'undead', Cha: 10});
			expect(monster.Con).to.be.undefined;
			expect(monster.Cha).to.equal(10);
			const newMonster = young.apply(monster);
			expect(newMonster.Con).to.be.undefined;
			expect(newMonster.Cha).to.equal(10);
		});

		it('adds 4 to the Dexterity', function(){
			const monster = new Monster({Dex: 10});
			const newMonster = young.apply(monster);
			expect(newMonster.Dex).to.equal(14);
		});

		it('changes the space to reflect the new size', function(){
			let monster;
			let newMonster;
			monster = new Monster({size: 'Diminutive', space: 1});
			newMonster = young.apply(monster);
			expect(newMonster.space).to.equal(0.5);

			monster = new Monster({size: 'Large', space: 10});
			newMonster = young.apply(monster);
			expect(newMonster.space).to.equal(5);
			
			monster = new Monster({size: 'Colossal', space: 30});
			newMonster = young.apply(monster);
			expect(newMonster.space).to.equal(20);			
		});
		
		it('uses the space offset to change the space according to the new size', function(){
			let monster;
			let newMonster;
			monster = new Monster({size: 'Diminutive', space: 2.5, spaceOffset: 1});
			newMonster = young.apply(monster);
			expect(newMonster.space).to.equal(1);

			monster = new Monster({size: 'Large', space: 15, spaceOffset: 1});
			newMonster = young.apply(monster);
			expect(newMonster.space).to.equal(10);
			
			monster = new Monster({size: 'Gargantuan', space: 15, spaceOffset: -1});
			newMonster = young.apply(monster);
			expect(newMonster.space).to.equal(10);
			
			monster = new Monster({size: 'Huge', space: 5, spaceOffset: -2});
			newMonster = young.apply(monster);
			expect(newMonster.space).to.equal(5);
		});

		it('changes the reach to reflect the new size when the reach is typical', function(){
			let monster;
			let newMonster;
			monster = new Monster({size: 'Small', reach: 5, shape: 'long'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(0);

			monster = new Monster({size: 'Medium', reach: 5, shape: 'long'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(5);

			monster = new Monster({size: 'Colossal', reach: 20, shape: 'long'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(15);

			monster = new Monster({size: 'Colossal', reach: 30, shape: 'tall'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(20);
		});

		it('keeps the reach unchanged when the reach is atypical but the typical reach would not be affected by the change of size', function(){
			let monster;
			let newMonster;
			monster = new Monster({size: 'Diminutive', reach: 5, shape: 'long'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(5);

			monster = new Monster({size: 'Medium', reach: 10, shape: 'long'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(10);
		});

		it('changes the reach in proportion to the typical reaches before and after', function(){
			let monster;
			let newMonster;
			// larger reach than usual
			monster = new Monster({size: 'Colossal', reach: 60, shape: 'tall'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(40);

			monster = new Monster({size: 'Colossal', reach: 60, shape: 'long'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(45);

			// smaller reach than usual
			monster = new Monster({size: 'Colossal', reach: 15, shape: 'tall'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(10);
		});

		it('makes the reach 0 from Small to Tiny when the original reach is 0', function(){
			const monster = new Monster({size: 'Small', reach: 0, shape: 'tall'});
			const newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(0);
		});

		it('uses the difference between the original and the typical reach from Small to Tiny when the original reach is over 5 ft', function(){
			const monster = new Monster({size: 'Small', reach: 15, shape: 'tall'});
			const newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(10);
		});

		it('rounds down the result to the nearest lower 5 ft', function(){
			let monster;
			let newMonster;
			monster = new Monster({size: 'Colossal', reach: 15, shape: 'long'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(10); // 15*15/20 = 11.25 rounds down to 10

			monster = new Monster({size: 'Gargantuan', reach: 5, shape: 'long'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(0); // 5*10/15 = 3.33 rounds down to 0

			monster = new Monster({size: 'Gargantuan', reach: 5, shape: 'tall'});
			newMonster = young.apply(monster);
			expect(newMonster.reach).to.equal(0); // 5*15/20 = 3.75 rounds down to 0
		});
	});

	describe('getErrorMessage', () => {
		
		it('returns an error message', () => {
			expect(young.getErrorMessage()).to.equal('Cannot apply the Young template when the creature matches any of the following conditions: Barghest, Dragon, Fine size, 1/8 CR');
		});
	});
});
