/* jshint node: true, esversion: 6 */
'use strict';

var xlsx = require('xlsx'), 
	fs = require('fs'),
	convert = require('./convert'),
	calc = require('./calc'),
	Monster = require('../../lib/monster');

var excelFile = './data/d20pfsrd-Bestiary.xlsx';
var maxRows = 2812;
var maxCols = 71;
var sourceCol = maxCols - 1; // 0-based index

/**
 * getWorksheet
 * reads the Excel spreadsheet and returns the first sheet
 * input: 
 * - input file name
 * output: worksheet object
 */
function getWorksheet(inputFile) {
	var workbook,
		firstSheetName,
		worksheet;

	try {
		workbook = xlsx.readFile(inputFile);
	} catch(err) {
		console.error('Could not read input file', inputFile);
		return;
	}

	if (workbook.SheetNames.length === 0) {
		console.error('Workbook has no sheet names');
		return;
	}
	firstSheetName = workbook.SheetNames[0];
	worksheet = workbook.Sheets[firstSheetName];
	if (worksheet === undefined) {
		console.error('Can\'t access worksheet', firstSheetName);
		return;
	}

	return worksheet;
}

/**
 * rowGenerator
 * generates the id of the next row to be handled
 * input: 
 * - worksheet object
 * - source name: filters the rows
 * output: id of the next row to handle (0-based)
 */
function* rowGenerator(worksheet, source) {
	var row,
		cell,
		cellKey;

	// go line by line
	for (row = 0; row < maxRows; row++) {

		// ignore anything that isn't in the given source
		cellKey = xlsx.utils.encode_cell({c: sourceCol, r: row});
		cell = worksheet[cellKey];
		
		if (cell.v !== source) {
			continue;
		}

		yield row;
	}
}

/**
 * createRawMonster
 * generates an object from a row in the worksheet
 * It uses the values in the first row of the worksheet as keys
 * input: 
 * - worksheet object
 * - row: 0-based index of the given row
 * output: a raw monster object
 */
function createRawMonster(worksheet, row) {
	var raw = {},
		col,
		cellKey,
		title,
		cellData;

	for (col = 0; col < maxCols; col++) {

		// find the column title
		cellKey = xlsx.utils.encode_cell({c: col, r: 0});
		title = worksheet[cellKey].v;
		// convert to lower case to prevent case-related bugs
		title = title.toLowerCase();

		// find the value for the given row
		cellKey = xlsx.utils.encode_cell({c: col, r: row});
		cellData = worksheet[cellKey];

		// store the title-value pair in the raw object
		if (cellData) {

			raw[title] = cellData.v;
		}		
	}

	return raw;
}

/**
 * AddProperty
 * handles the result of a convert operation by storing the data into the given monster
 * and adding the result to the log
 */
function addProperty(monster, log, convertResult) {
	
	if (convertResult.errors.length === 0) {
	
		monster[convertResult.name] = convertResult.data;
	}

	if (convertResult.errors.length || convertResult.warnings.length) {
		
		log.push(convertResult);
	}
}

/**
 * createMonster
 * generates a monster object in the database format
 * from the raw monster object
 * input: 
 * - raw monster object
 * output: a monster creation object with 2 properties:
 * - log: an array of all problems encountered during creation
 * - monster: the resulting monster object
 */
function createMonster(rawMonster) {
	var log = [];
	var monster = {};
	var temp = {};

	// those properties can be used as is
	monster.name = rawMonster.name;
	monster.alignment = rawMonster.alignment;
	monster.size = rawMonster.size;
	monster.environment = rawMonster.environment;
	monster.organization = rawMonster.organization;
	// treasure will need to be extracted at some point to identify objects 
	// that change other stats, e.g. weapons, armor, ability enhancers...
	monster.treasure = rawMonster.treasure;

	// those properties need to be extracted
	addProperty(monster, log, convert.extractType(rawMonster.type));
	addProperty(monster, log, convert.extractCR(rawMonster.cr));
	addProperty(monster, log, convert.extractSpace(rawMonster.space));
	addProperty(monster, log, convert.extractReach(rawMonster.reach));
	addProperty(monster, log, convert.extractRacialHD(rawMonster));
	addProperty(monster, log, convert.extractAbility('Str', rawMonster.str));
	addProperty(monster, log, convert.extractAbility('Dex', rawMonster.dex));
	addProperty(monster, log, convert.extractAbility('Con', rawMonster.con));
	addProperty(monster, log, convert.extractAbility('Wis', rawMonster.wis));
	addProperty(monster, log, convert.extractAbility('Int', rawMonster.int));
	addProperty(monster, log, convert.extractAbility('Cha', rawMonster.cha));
	addProperty(monster, log, convert.extractSpeed(rawMonster.speed));
	addProperty(monster, log, convert.extractFeats(rawMonster.feats));
	addProperty(monster, log, convert.extractMelee(rawMonster.melee));
	addProperty(monster, log, convert.extractSQ(rawMonster.sq));

	// skills and racialMods properties need to be extracted separately and merged
	// the skill ranks are deduced at the calculation phase
	addProperty(temp, log, convert.extractSkills(rawMonster.skills));
	addProperty(temp, log, convert.extractRacialModifiers(rawMonster.racialmods));

	if (temp.rawSkills && temp.racialMods) {
		// adds the 'mergedSkills' property
		addProperty(temp, log, convert.mergeSkillsAndRacialMods(temp.rawSkills, temp.racialMods));
	}
	
	// calculate remaining properties
	var monsterCopy = JSON.parse(JSON.stringify(monster));
	if (temp.mergedSkills) {
		// add the merged skills to the monster for ranks calculations
		// the modifier property will be ignored by the Monster object
		monsterCopy.skills = temp.mergedSkills;
	}
	var monsterObj = new Monster(monsterCopy);

	if (temp.mergedSkills) {
		addProperty(monster, log, calc.calculateSkills(temp.mergedSkills, monsterObj));
	}

	addProperty(monster, log, calc.calculateDiscrepancy('naturalArmor', rawMonster.ac, monsterObj.getAC()));
	addProperty(monster, log, calc.calculateDiscrepancy('baseFort', rawMonster.fort, monsterObj.getFortitude()));
	addProperty(monster, log, calc.calculateDiscrepancy('baseRef', rawMonster.ref, monsterObj.getReflex()));
	addProperty(monster, log, calc.calculateDiscrepancy('baseWill', rawMonster.will, monsterObj.getWill()));

	// initial value for shape
	// This is a best guess. All monsters should be checked manually before going live.
	if (monster.type === 'humanoid' || monster.type === 'monstrous humanoid' || monster.type === 'fey') {
		monster.shape = 'tall';
	} else {
		monster.shape = 'long';
	}

	return {log: log, monster: monster};
}

function writeLogArray(fdLog, type, logArray) {

	if (!logArray) {
		return;
	}

	logArray.forEach(function(message){
	
		// note: Message.toString is called automatically
		fs.writeSync(fdLog, '    ' + type + ': ' + message + '\n');
	});

}

function writeMonsterLog(fdLog, monsterName, log) {
	
	// write out the monster name
	fs.writeSync(fdLog, monsterName + '\n');

	// for each monster property in the log
	log.forEach(function(prop){

		// write all errors first
		writeLogArray(fdLog, 'ERROR ' + prop.name, prop.errors);
		
		// then all warnings
		writeLogArray(fdLog, 'WARNING ' + prop.name, prop.warnings);
	});
}

/**
 * importData
 * top level function that handles the data import
 * input: 
 * - input file name
 * - output file name
 * - log file name
 * - source: specifies which rows to import, value in source column in spreadsheet
 * output: 0 if no error, 1 if error
 */
function importData(inputFile, source, outputFile, logFile) {
	var monsterList = [];
	var rowGen;
	var worksheet,
		fdLog,
		row,
		rawMonster,
		result,
		jsonStr, 
		log,
		count = 0;

	worksheet = getWorksheet(inputFile);
	if (!worksheet) {
		return 1;
	}

	if (!logFile) {
		logFile = 'import.log';
	}

	fdLog = fs.openSync(logFile, 'w');

	rowGen = rowGenerator(worksheet, source);
	while ((row = rowGen.next().value) !== undefined) {
	
		count += 1;

		rawMonster = createRawMonster(worksheet, row);

		// check for data that can't be dealt with yet
		log = convert.checkRawMonster(rawMonster);

		// if ok, create the monster
		if (log.length === 0) {

			result = createMonster(rawMonster);
			if (result.log.length === 0) {
				monsterList.push(result.monster);
			}
			log = result.log;
		}
	
		// write the content of the log
		writeMonsterLog(fdLog, rawMonster.name, log);
	}

	fs.writeSync(fdLog, '--------------------------------------------\n');
	fs.writeSync(fdLog, 'Attempted to import ' + count + ' monsters.\n');
	fs.writeSync(fdLog, monsterList.length + ' monsters successfully imported.\n');
	fs.closeSync(fdLog);

	// write to json file
	if (outputFile) {
		jsonStr = JSON.stringify(monsterList, null, '\t');
		fs.writeFileSync(outputFile, jsonStr);
	}

	return 0;
}

// only run the module if run directly
if (require.main === module) {
	return importData(excelFile, 'PFRPG Bestiary', 'output.json', 'output.json.log');	
}

exports.getWorksheet = getWorksheet;
exports.rowGenerator = rowGenerator;
exports.createRawMonster = createRawMonster;
exports.createMonster = createMonster;
exports.importData = importData;
