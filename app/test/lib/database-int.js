'use strict';

const expect = require('chai').expect;
const path = require('path');
const Monster = require('../../lib/monster');
const database = require('../../lib/database');

describe('Database', function(){
	describe('initialise', function(){
		it('throws when the argument is not a valid path', function(){
			expect(() => database.initialise()).to.throw();
			expect(() => database.initialise(path.join(__dirname, 'fakepath'))).to.throw();
		});

		it('throws when the argument is not a valid JSON file', function(){
			expect(() => database.initialise(path.join(__dirname, '../testdata/badjson/invalid.json'))).to.throw();
		});

		it('throws when the JSON data is not an array of monsters', function(){
			expect(() => database.initialise(path.join(__dirname, '../testdata/wrongjson/notarray.json'))).to.throw();
		});


		it('reads the JSON file into memory and stores it for future use', function(){
			let data = database.initialise(path.join(__dirname, '../testdata/database1/database.json'));
			expect(data).to.be.an('array').with.lengthOf(5);
		});

		it('overwrites the data when called several times with different arguments (for testing)', function(){
			let data = database.initialise(path.join(__dirname, '../testdata/database1/database.json'));
			expect(data).to.be.an('array').with.lengthOf(5);
			
			data = database.initialise(path.join(__dirname, '../testdata/database2/database.json'));
			expect(data).to.be.an('array').with.lengthOf(40);
			
			data = database.initialise(path.join(__dirname, '../testdata/database1/database.json'));
			expect(data).to.be.an('array').with.lengthOf(5);
		});
	});
	
	describe('findMonsterList', function(){
		before(function(){
			database.initialise(path.join(__dirname, '../testdata/database2/database.json'));
		});
		
		it('returns a list of all monster identifiers (name and source) when used without search criteria', function(){
			let list = database.findMonsterList();

			expect(list).to.be.an('array').with.lengthOf(40);
			let keys  = Object.keys(list[0]);
			expect(keys).to.have.lengthOf(2);
			expect(keys).to.have.members(['name', 'source']);
		});

		it('returns a list of all monsters matching the search criteria', function(){
			let list = database.findMonsterList('golem');
			expect(list).to.be.an('array').with.lengthOf(8);
		});

		it('returns a list of all monsters matching all the search criteria', function(){
			let list = database.findMonsterList('golem cl');
			expect(list).to.be.an('array').with.lengthOf(2);
			expect(list).to.have.deep.members([
				{name: 'Clay Golem', source: 'PFRPG Bestiary'}, 
				{name: 'Clockwork Golem', source: 'PFRPG Bestiary 2'}
			]);
		});

		it('returns an empty array when there is no match', function(){
			expect(database.findMonsterList('wieurhisfdh')).to.be.an('array').that.is.empty;
			expect(database.findMonsterList('-')).to.be.an('array').that.is.empty;
		});

		it('splits the search string on whitespaces and looks for each word separately', function(){
			let list = database.findMonsterList('gel cub');
			expect(list).to.be.an('array').with.lengthOf(1);
			expect(list).to.deep.equal([{name: 'Gelatinous Cube', source: 'PFRPG Bestiary'}]);
			
			let list2 = database.findMonsterList('cub gel');
			expect(list2).to.deep.equal(list);
		});

		it('accepts hyphens and alphabetical characters in the search string', function(){
			database.initialise(path.join(__dirname, '../testdata/database3/database.json'));
			
			let list = database.findMonsterList('-');
			expect(list).to.deep.equal([{name: 'Jack-o-Lantern', source: 'PFRPG Bestiary'}]);
			
			let list1 = database.findMonsterList('Jack-');
			expect(list1).to.deep.equal([{name: 'Jack-o-Lantern', source: 'PFRPG Bestiary'}]);

			let list2 = database.findMonsterList('-o');
			expect(list2).to.deep.equal([{name: 'Jack-o-Lantern', source: 'PFRPG Bestiary'}]);
		});

		it('doesn\'t match other characters', function(){
			// there is no need to match them as they are not present in monster names
			// and they cannot be converted into regex without additional processing
			expect(database.findMonsterList('(')).to.be.an('array').that.is.empty;
			expect(database.findMonsterList('&')).to.be.an('array').that.is.empty;
			expect(database.findMonsterList('^')).to.be.an('array').that.is.empty;
		});
	});

	describe('findMonster', function(){
		before(function(){
			database.initialise(path.join(__dirname, '../testdata/database2/database.json'));
		});
		
		it('returns the Monster object corresponding to the name and source given', function(){
			let monster;
			monster = database.findMonster('Gelatinous Cube', 'PFRPG Bestiary');
			expect(monster).to.be.an.instanceof(Monster);
			expect(monster.name).to.equal('Gelatinous Cube');
			expect(monster.source).to.equal('PFRPG Bestiary');
			expect(monster.CR).to.equal(3);
			expect(monster.size).to.equal('Large');

			monster = database.findMonster('Beheaded', 'PFRPG Bestiary 4');
			expect(monster).to.be.an.instanceof(Monster);
			expect(monster.name).to.equal('Beheaded');
			expect(monster.source).to.equal('PFRPG Bestiary 4');
			expect(monster.CR).to.equal('1/3');
			expect(monster.size).to.equal('Tiny');
		});

		it('returns undefined when the monster is not found', function(){
			let monster;
			
			// all wrong
			monster = database.findMonster('Made-up Monster', 'Not a source');
			expect(monster).to.be.undefined;
			
			// both name and source exist but not for the same monster
			monster = database.findMonster('Gelatinous Cube', 'PFRPG Bestiary 2');
			expect(monster).to.be.undefined;

			// correct name, invalid source
			monster = database.findMonster('Gelatinous Cube', 'Wrong Source');
			expect(monster).to.be.undefined;
			
			// invalid name, correct source
			monster = database.findMonster('Invalid', 'PFRPG Bestiary');
			expect(monster).to.be.undefined;
		});

		it('throws when called with no arguments', function(){
			expect(() => database.findMonster()).to.throw();
		});

		it('throws when the name argument is not a string', function(){
			expect(() => database.findMonster(0)).to.throw();
			expect(() => database.findMonster({})).to.throw();
		});

		it('throws when the source argument is defined and not a string', function(){
			expect(() => database.findMonster('Beheaded', 1)).to.throw();
		});

		it('returns the correct monster from the official bestiaries when the source is not specified', function(){
			// relies on all the official bestiary monsters having unique names
			let monster;
			monster = database.findMonster('Gelatinous Cube');
			expect(monster).to.be.an.instanceof(Monster);
			expect(monster.name).to.equal('Gelatinous Cube');
			expect(monster.source).to.equal('PFRPG Bestiary');
			expect(monster.CR).to.equal(3);
			expect(monster.size).to.equal('Large');

			monster = database.findMonster('Beheaded');
			expect(monster).to.be.an.instanceof(Monster);
			expect(monster.name).to.equal('Beheaded');
			expect(monster.source).to.equal('PFRPG Bestiary 4');
			expect(monster.CR).to.equal('1/3');
			expect(monster.size).to.equal('Tiny');
		});

		it('returns the correct monster when there are several with the same name from different sources', function(){
			database.initialise(path.join(__dirname, '../testdata/multiple/database.json'));

			let first = database.findMonster('Gelatinous Cube', 'PFRPG Bestiary');
			expect(first).to.be.an.instanceof(Monster);
			expect(first.name).to.equal('Gelatinous Cube');
			expect(first.source).to.equal('PFRPG Bestiary');
			expect(first.CR).to.equal(3);
			expect(first.size).to.equal('Large');

			let second = database.findMonster('Gelatinous Cube', 'Third Party');
			expect(second).to.be.an.instanceof(Monster);
			expect(second.name).to.equal('Gelatinous Cube');
			expect(second.source).to.equal('Third Party');
			expect(second.CR).to.equal(2);
			expect(second.size).to.equal('Medium');
		});
	});
});