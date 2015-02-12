/* jshint node: true */
'use strict';

var Monster = require('./monster');

module.exports = Database;

/* 
* This is a temporary mock of the database
*/

/**
 * Database constructor
 * The database connection itself must be created prior to starting the server
 */
function Database(db){
	if (!(this instanceof Database)) {
		return new Database();
	}
	
	this.db = db;
	// temporary
	this.monsterList = initMonsterList();
}

/**
 * findMonster
 * returns a Monster object or an empty object if not found
 */
Database.prototype.findMonster = function(id, callback) {
	var monster, i, size;
	if (!this.monsterList) {
		return callback(new Error('Database not initialised'), {});
	}
	
	size = this.monsterList.length;
	for (i = 0; i < size; i++) {
		if (this.monsterList[i].name === id) {
			// found
			monster = new Monster(this.monsterList[i]);
			return callback(null, monster);
		}
	}
	return callback(new Error('Monster not found: ' + id), {});
};

/**
 * findMonsterList
 * returns a list of monsters with names matching the searchString
 * (all monsters if no searchString is provided)
 * Each list item is an object with 2 properties: name and id
 */
Database.prototype.findMonsterList = function(searchString, callback) {
	var list, i, size;
	if (!this.monsterList) {
		return callback(new Error('Database not initialised'), {});
	}
	
	list = buildResultList(searchString, this.monsterList);
	
	return callback(null, list);
};

/**************
Temporary implementation
**************/
var initMonsterList = function(){
	var fs = require('fs');
	var json = fs.readFileSync(__dirname + '/database.json');
	var list;
	try {
		list = JSON.parse(json);
	} catch(e) {
		console.log('Can\'t parse JSON file: ', e);
		return;
	}
	return list;
};

// splits a string into word tokens
var tokenize = function(myString){
	return myString.match(/\w+/g);
};

// converts an array of strings to an array of regular expressions
var toRegExp = function(strArray, flags){
	var i = 0,
	reArray = [],
	len;
	for (len = strArray.length; i < len; i += 1) {
		reArray[i] = new RegExp(strArray[i], flags);
	}
	return reArray;
};

var buildResultList = function(searchString, monsterArray) {
	var i = 0,
		result = [],
		tokens,
		j,
		maxMonsters,
		maxTokens,
		match;
	
	// no query: return everything
	if (!searchString) {
		for (maxMonsters = monsterArray.length; i < maxMonsters; i += 1) {
			result.push({ name: monsterArray[i].name, id: monsterArray[i].name });
		}
		return result;
	}
	
	// tokenize
	tokens = toRegExp(tokenize(searchString), 'i');
	maxTokens = tokens.length;
	
	// note: this won't work great if the tokens overlap in the string
	for (maxMonsters = monsterArray.length; i < maxMonsters; i += 1) {
		match = true;
		for (j = 0; j < maxTokens; j += 1) {
			if (monsterArray[i].name.search(tokens[j]) < 0) {
				match = false;
				break;
			}
		}
		if (match) {
			result.push({ name: monsterArray[i].name, id: monsterArray[i].name });
		}
	}
	return result;
};
