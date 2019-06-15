'use strict';

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const convert = require('./convert');
const calc = require('./calc');
const shape = require('./shape');
const Monster = require('../app/lib/monster');

const maxRows = 2812;
const maxCols = 71;
const sourceCol = maxCols - 1; // 0-based index

const sources = {
	b1: {xl: 'PFRPG Bestiary', folder: 'bestiary1'},
	b2: {xl: 'PFRPG Bestiary 2', folder: 'bestiary2'},
	b3: {xl: 'PFRPG Bestiary 3', folder: 'bestiary3'},
	b4: {xl: 'PFRPG Bestiary 4', folder: 'bestiary4'},
	toh4: {xl: 'Tome of Horrors 4', folder: 'toh4'},
	tohc: {xl: 'Tome of Horrors Complete', folder: 'tohc'},
	various: {xl: 'various', folder: 'various'},
};

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

	// go line by line, skipping the first line which is for titles
	for (row = 1; row < maxRows; row++) {

		// ignore anything that isn't in the given source
		cellKey = xlsx.utils.encode_cell({c: sourceCol, r: row});
		cell = worksheet[cellKey];
		
		if (source === 'various') {
			if (cell.v.startsWith('PFRPG Bestiary') || cell.v === 'Tome of Horrors 4' || cell.v === 'Tome of Horrors Complete'){
				continue;
			}
		} else if (cell.v !== source) {
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
	monster.source = rawMonster.source;
	monster.alignment = rawMonster.alignment;
	monster.size = rawMonster.size;
	monster.environment = rawMonster.environment;
	monster.organization = rawMonster.organization;
	monster.languages = rawMonster.languages;
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

	// raise an error if there are extra HPs. Later we'll need to store them in the monster
	addProperty(temp, log, calc.calculateExtraHP(rawMonster.hp, monsterObj.getHP()));

	addProperty(monster, log, calc.calculateDiscrepancy('naturalArmor', rawMonster.ac, monsterObj.getAC()));
	addProperty(monster, log, calc.calculateDiscrepancy('baseFort', rawMonster.fort, monsterObj.getFortitude()));
	addProperty(monster, log, calc.calculateDiscrepancy('baseRef', rawMonster.ref, monsterObj.getReflex()));
	addProperty(monster, log, calc.calculateDiscrepancy('baseWill', rawMonster.will, monsterObj.getWill()));

	// initial value for shape
	// This is a best guess. All monsters should be checked manually before going live.
	monster.shape = shape.guessShape(monsterObj);

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

function writeMonsterCSV(fdcsv, monsterId, monsterName, log){
	
	function writeLine(propName, type, message){
		// use TAB as separator as data can contain commas or semicolons
		fs.writeSync(fdcsv, `${monsterId}\t${monsterName}\t${type}\t${propName}\t${message.logKey}\t${message}\n`);
	}

	log.forEach(prop => {

		if (prop.errors) {
			prop.errors.forEach(error => {
				writeLine(prop.name, 'ERROR', error)
			});
		}

		if (prop.warnings){
			prop.warnings.forEach(warning => {
				writeLine(prop.name, 'WARNING', warning)
			});
		}
	});
}

function isValidMonster(log){
	// check whether the monster creation log has errors
	if (log.length > 0 && log.find(item => item.errors && item.errors.length > 0)) {
		return false;
	}
	return true;
}

function getSource(sourceCode){
	return sources[sourceCode];
}

function createDir(dirPath){
	if (fs.existsSync(dirPath)) return;

	try {
		fs.mkdirSync(dirPath);
	} catch(err){
		console.log(`Can't create directory ${dirPath}`);
		throw(err);
	}
}

/**
 * importSourceData
 * handles the data import from a given source
 * input: 
 * - sourceCode: short code that specifies which rows to import, is mapped to 
 *   value in source column in spreadsheet and to output folder
 * - dataPath: path of the data directory
 * output: 0 if no error, 1 if error
 */
function importSourceData(sourceCode, dataPath) {
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
	let warningLog = [];
	let successLog = [];

	if (!sourceCode || !dataPath){
		return 1;
	}

	let source = getSource(sourceCode);
	if (!source){
		return 1;
	}

	let inputFile = path.join(dataPath, 'source/srd/d20pfsrd-Bestiary.xlsx');
	let outputFile = path.join(dataPath, 'work', `${sourceCode}.json`);
	let logFile = path.join(dataPath, 'work', `${sourceCode}.log`);
	let csvFile = path.join(dataPath, 'work', `${sourceCode}.csv`);

	worksheet = getWorksheet(inputFile);
	if (!worksheet) {
		return 1;
	}

	// make sure all the folders we need for output are present
	createDir(path.join(dataPath, 'work'));
	createDir(path.join(dataPath, 'work', source.folder));
	createDir(path.join(dataPath, 'work', source.folder, 'srd'));
	// and the edit folder as well
	createDir(path.join(dataPath, 'work', source.folder, 'edit'));

	fdLog = fs.openSync(logFile, 'w');
	const fdcsv = fs.openSync(csvFile, 'w');
	// header line
	fs.writeSync(fdcsv, 'id\tname\tmsgType\tproperty\tmsgCode\tmessage\n');
	
	rowGen = rowGenerator(worksheet, source.xl);
	while ((row = rowGen.next().value) !== undefined) {
	
		count += 1;

		rawMonster = createRawMonster(worksheet, row);

		// check for data that can't be dealt with yet
		log = convert.checkRawMonster(rawMonster);

		// if ok, create the monster
		if (log.length === 0) {

			result = createMonster(rawMonster);
			if (isValidMonster(result.log)) {
				monsterList.push(result.monster);

				let monsterFile = path.join(dataPath, 'work', source.folder, 'srd', `${rawMonster.name}.json`);
				fs.writeFileSync(monsterFile, JSON.stringify(result.monster, null, 2));

				if (result.log.length === 0){
					successLog = successLog.concat(rawMonster.name);
				} else {
					warningLog = warningLog.concat({name: rawMonster.name, log: result.log});
				}
			}
			log = result.log;
		}
	
		// write the content of the log
		writeMonsterLog(fdLog, rawMonster.name, log);
		// write to CSV file too
		writeMonsterCSV(fdcsv, rawMonster.id, rawMonster.name, log);
	}

	fs.writeSync(fdLog, '--------------------------------------------\n');
	fs.writeSync(fdLog, 'Attempted to import ' + count + ' monsters.\n');
	fs.writeSync(fdLog, monsterList.length + ' monsters successfully imported.\n');
	fs.writeSync(fdLog, '--------------------------------------------\n');

	fs.writeSync(fdLog, `${successLog.length} monsters imported without warnings:\n`);
	successLog.sort().forEach(name => writeMonsterLog(fdLog, name, []));
	
	fs.writeSync(fdLog, '--------------------------------------------\n');
	fs.writeSync(fdLog, `${warningLog.length} monsters imported with warnings:\n`);
	warningLog.sort((a, b) => {
		if (a.name < b.name) {
			return -1;
		} else if (a.name > b.name) {
			return 1;
		} else {
			return 0;
		}
	}).forEach(item => writeMonsterLog(fdLog, item.name, item.log));

	fs.closeSync(fdLog);
	fs.closeSync(fdcsv);

	// write to json file
	if (outputFile) {
		jsonStr = JSON.stringify(monsterList, null, '\t');
		fs.writeFileSync(outputFile, jsonStr);
	}

	return 0;
}

/**
 * importData
 * top level function that handles the data import
 * input: 
 * - sourceCode: short code that specifies which rows to import, is mapped to 
 *   value in source column in spreadsheet and to output folder
 * - dataPath: path of the data directory
 * output: 0 if no error, > 0 if error(s)
 */
function importData(sourceCode, dataPath) {
	
	if (sourceCode === 'all'){
		
		return Object.keys(sources).reduce((errors, code) => {
			errors += importSourceData(code, dataPath);
			return errors;
		}, 0);

	} else {
	
		return importSourceData(sourceCode, dataPath);
	}
}

// only run the module if run directly
if (require.main === module) {
	let sourceCode = process.argv.length > 2? process.argv[2] : 'b1';
	let dataPath = process.argv.length > 3 ? process.argv[3] : '../data';
	
	return importData(sourceCode, dataPath);	
}

exports.getWorksheet = getWorksheet;
exports.rowGenerator = rowGenerator;
exports.createRawMonster = createRawMonster;
exports.createMonster = createMonster;
exports.importData = importData;
