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

let inputFile = path.resolve('test/testdata/test-input/test-Bestiary.xlsx');
let outputDir = path.resolve('test/testdata/test-output');

describe('Integration: SRD import', function(){
	this.timeout(0);

	describe('import', function(){
		before(function(){
			// create the output folder if not already there
			if (!fs.existsSync(outputDir)){
				try{
					fs.mkdirSync(outputDir);
				} catch(err){
					console.err(`Error creating directory ${outputDir}`);
				}
			// empty the output folder
			} else {
				let files;
				try {
					files = fs.readdirSync(outputDir);
				} catch(err) {
					console.err(`Error reading content of ${outputDir}`);
					throw err;
				}

  			for (const file of files) {
  				try {
	    			fs.unlinkSync(path.join(outputDir, file));
  				} catch(err){
  					console.err(`Error deleting file ${path.join(outputDir, file)}`);
  					throw err;
  				}
  			}
			}
		});
		
		it('returns a non-zero value when the input file cannot be read', function(){
			expect(srdImport.importData('blah')).to.equal(1);
		});

		it('creates a JSON file', function(){
			var outputFile = path.resolve('test/testdata/test-output/json-test.json'),
				fd;

			expect(srdImport.importData(inputFile, 'PFRPG Bestiary', outputFile)).to.equal(0);

			try {
				fd = fs.openSync(outputFile, 'r');
			} catch(err) {
				expect(err).to.be.undefined;
				return;
			}
			fs.closeSync(fd);
		});
		
		it('creates a log file', function(){
			var outputFile = path.resolve('test/testdata/test-output/log-test.json'),
				logFile = outputFile + '.log',
				fd;

			expect(srdImport.importData(inputFile, 'PFRPG Bestiary', outputFile, logFile)).to.equal(0);
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
			var worksheet = srdImport.getWorksheet(inputFile);
			var rowGen = srdImport.rowGenerator(worksheet, 'PFRPG Bestiary');
			expect(rowGen.next().value).to.equal(38);
		});
		
		it('returns undefined when there are no more rows', function(){
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
			var worksheet = srdImport.getWorksheet(inputFile);
			var raw = srdImport.createRawMonster(worksheet, 1);
			// note: the value for space is due to bad data 2 1/2 ft being 
			// stored as date 2/1/2002, which translates to numeric value 37288
			expect(raw).to.deep.equal(armadillo);
		});
	});
});
