'use strict';

var expect = require('chai').expect,
	srdImport = require('../srdimport'),
	fs = require('fs'),
	path = require('path');
const folder = require('../../testlib/folder');

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

let inputFile = path.resolve('test/testdata/source/srd/d20pfsrd-Bestiary.xlsx');

describe('Integration: SRD import', function(){
	this.timeout(0);

	describe('importData', function(){
		
		describe('Bad set-up', () => {

			it('expects two non-empty string arguments', () => {
				expect(srdImport.importData()).to.equal(1);
				expect(srdImport.importData('b1')).to.equal(1);
				expect(srdImport.importData('b1', '')).to.equal(1);
				expect(srdImport.importData('', '')).to.equal(1);
			});

			it('returns a non-zero value when the source code is invalid', function(){
				expect(srdImport.importData('aaa', path.resolve('test/testdata'))).to.equal(1);
			});

			it('returns a non-zero value when the input file cannot be read', function(){
				expect(srdImport.importData('b1', 'blah')).to.equal(1);
			});
		});

		describe('Running with output folders absents', () => {
			let dataDir = path.resolve('test/testdata');
			let returnValue;

			// remove any output directories
			before(() => {
				folder.deleteFolder(path.resolve('test/testdata/work'));
			});

			// run the function once only
			before(() => {
				returnValue = srdImport.importData('b1', dataDir);
			});

			it('returns zero when it is sucessful', () => {
				expect(returnValue).to.equal(0);
			})

			it('creates the work folder', () => {
				expect(fs.existsSync(path.resolve('test/testdata/work'))).to.be.true;
			});

			it('creates a folder named after the source book', () => {
				expect(fs.existsSync(path.resolve('test/testdata/work/bestiary1'))).to.be.true;
			});

			it('creates a srd subfolder', () => {
				expect(fs.existsSync(path.resolve('test/testdata/work/bestiary1/srd'))).to.be.true;
			});

			it('creates an edit subfolder', () => {
				expect(fs.existsSync(path.resolve('test/testdata/work/bestiary1/edit'))).to.be.true;
			});

			it('creates a JSON file', function(){
				let outputFile = path.join(dataDir, 'work/b1.json');
				let fd;

				try {
					fd = fs.openSync(outputFile, 'r');
				} catch(err) {
					expect(err).to.be.undefined;
					return;
				}
				fs.closeSync(fd);
			});
			
			it('creates a log file', function(){
				let logFile = path.join(dataDir, 'work/b1.log');
				let fd;

				try {
					fd = fs.openSync(logFile, 'r');
				} catch(err) {
					expect(err).to.be.undefined;
					return;
				}
				fs.closeSync(fd);
			});
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

		it('returns only the rows that are not associated with a bestiary or one of the big tomes of horrors', () => {
			let worksheet = srdImport.getWorksheet(inputFile);
			let rowGen = srdImport.rowGenerator(worksheet, 'various');
			let count = 0;
			let value;

			value = rowGen.next().value;
			while (value != undefined){
				count += 1;
				value = rowGen.next().value;
			}
			expect(count).to.equal(614);
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
