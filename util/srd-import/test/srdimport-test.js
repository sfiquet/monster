/* jshint node: true, esversion: 6 */
'use strict';

var expect = require('chai').expect,
	srdImport = require('../srdimport'),
	fs = require('fs'),
	path = require('path');

var armadillo = {
	name: 'Armadillo',
	cr: 0.25,
	xp: 100,
	alignment: 'N',
	size: 'Tiny',
	type: 'animal',
	ac: 16,
	ac_touch: 14,
	"ac_flat-footed": 14,
	hp: 4,
	hd: '1d8',
	fort: 2,
	ref: 4,
	will: 1,
	melee: 'claw +0 (1d2-3)',
	space: 37288,
	reach: 0,
	str: 4,
	dex: 15,
	con: 11,
	int: 2,
	wis: 12,
	cha: 9,
	feats: 'Skill Focus (Perception)',
	skills: 'Perception +8, Swim +1',
	racialmods: '+4 Swim',
	environment: 'temperate or warm plains',
	organization: 'solitary',
	treasure: 'none',
	group: 'Familiar',
	characterflag: 0,
	companionflag: 0,
	speed: '30 ft., burrow 5 ft.',
	base_speed: 30,
	speed_land: 1,
	fly: 0,
	climb: 0,
	burrow: 1,
	swim: 0,
	companionfamiliarlink: 'NULL',
	id: 4033,
	uniquemonster: 0,
	mr: 0,
	mythic: 0,
	mt: 0,
	source: 'Animal Archive'
};


describe('SRD import', function(){
	describe('import', function(){
		
		it('returns a non-zero value when the input file cannot be read', function(){
			expect(srdImport.importData('blah')).to.equal(1);
		});

		it('creates a JSON file', function(){
			var outputFile = 'output.json',
				fd;

			try {
				fs.unlinkSync(outputFile);
			} catch(err) {
				// the file doesn't already exist: do nothing
			}
			expect(srdImport.importData(path.resolve('test/testdata/test-Bestiary.xlsx'), 'PFRPG Bestiary', outputFile)).to.equal(0);

			try {
				fd = fs.openSync(outputFile, 'r');
			} catch(err) {
				expect(err).to.be.undefined;
				return;
			}
			fs.closeSync(fd);
		});
		
		it('creates a log file', function(){
			var outputFile = 'output.json',
				logFile = outputFile + '.log',
				fd;

			try {
				fs.unlinkSync(logFile);
			} catch(err) {
				// the file doesn't already exist: do nothing
			}
			expect(srdImport.importData(path.resolve('test/testdata/test-Bestiary.xlsx'), 'PFRPG Bestiary', outputFile, logFile)).to.equal(0);
			try {
				fd = fs.openSync(logFile, 'r');
			} catch(err) {
				expect(err).to.be.undefined;
				return;
			}
			fs.closeSync(fd);
		});
	});

	describe('getWorksheet', function(){
		it('returns undefined if the file cannot be opened');
		it('returns undefined if the file is not an excel file');
		it('returns a worksheet object containing the data from the first sheet');
	});

	describe('rowGenerator', function(){
		
		it('returns the 0-based index of the rows associated with the given source', function(){
			var inputFile = path.resolve('test/testdata/test-Bestiary.xlsx');
			var worksheet = srdImport.getWorksheet(inputFile);
			var rowGen = srdImport.rowGenerator(worksheet, 'PFRPG Bestiary');
			expect(rowGen.next().value).to.equal(38);
		});
		
		it('returns undefined when there are no more rows', function(){
			var inputFile = path.resolve('test/testdata/test-Bestiary.xlsx');
			var worksheet = srdImport.getWorksheet(inputFile);
			var rowGen = srdImport.rowGenerator(worksheet, 'Animal Archive');

			expect(rowGen.next().value).to.equal(1);
			expect(rowGen.next().value).to.equal(2);
			expect(rowGen.next().value).to.equal(3);
			expect(rowGen.next().value).to.equal(199);
			expect(rowGen.next().value).to.equal(200);
			expect(rowGen.next().value).to.equal(201);
			expect(rowGen.next().value).to.be.undefined;
		});
	});
	
	describe('createRawMonster', function(){

		it('returns an object containing all the data from the given row', function(){
			var inputFile = path.resolve('test/testdata/test-Bestiary.xlsx');
			var worksheet = srdImport.getWorksheet(inputFile);
			var raw = srdImport.createRawMonster(worksheet, 1);
			// note: the value for space is due to bad data 2 1/2 ft being 
			// stored as date 2/1/2002, which translates to numeric value 37288
			expect(raw).to.deep.equal(armadillo);
		});
	});

	describe('createMonster', function(){

		it('creates a monster object in the database format from the given raw monster', function(){
			var res = srdImport.createMonster(armadillo);
			var monster = res.monster;
			expect(res.log).to.have.length(1); // warning for space data
			expect(monster.name).to.equal(armadillo.name);
			expect(monster.CR).to.equal('1/4');
			expect(monster.alignment).to.equal(armadillo.alignment);
			expect(monster.size).to.equal(armadillo.size);
			expect(monster.type).to.equal('animal');
			expect(monster.racialHD).to.equal(1);
			expect(monster.space).to.equal(2.5);
			expect(monster.reach).to.equal(armadillo.reach);
			expect(monster.Str).to.equal(armadillo.str);
			expect(monster.Dex).to.equal(armadillo.dex);
			expect(monster.Con).to.equal(armadillo.con);
			expect(monster.Int).to.equal(armadillo.int);
			expect(monster.Wis).to.equal(armadillo.wis);
			expect(monster.Cha).to.equal(armadillo.cha);
			expect(monster.environment).to.equal(armadillo.environment);
			expect(monster.organization).to.equal(armadillo.organization);
			expect(monster.treasure).to.equal(armadillo.treasure);
			expect(monster.speed).to.deep.equal({land: 30, burrow: 5});
			expect(monster.feats).to.deep.equal([{name: 'Skill Focus', details: {name: 'Perception'}}]);
			expect(monster.melee).to.deep.equal({claw: {name: 'claw', nbAttacks: 1, nbDice: 1, dieType: 2, type: 'natural'}});
		});
	});
});
