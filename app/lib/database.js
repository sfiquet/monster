'use strict';

const fs = require('fs');
const assert = require('assert').strict;
const Monster = require('./monster');

// JSON database
// implemented as a singleton

const BESTIARIES = ['PFRPG Bestiary', 'PFRPG Bestiary 2', 'PFRPG Bestiary 3', 'PFRPG Bestiary 4'];
let monsterList;

module.exports = {
	initialise: (dbPath) => {
		// those throw exceptions when the file can't be read or is not valid json
		let json = fs.readFileSync(dbPath);
		let data = JSON.parse(json);
		
		// check that this is an array of monsters
		assert.ok(Array.isArray(data));
		assert.ok(data.length != 0);
		assert.ok(data[0].name !== undefined);
		assert.ok(data[0].source !== undefined);

		return monsterList = data;
	},

	findMonster: (name, source) => {
		assert.ok(monsterList != undefined);
		assert.ok(typeof name === 'string');
		assert.ok(source === undefined || typeof source === 'string');

		let monster = monsterList.find(item => item.name === name && (source ? item.source === source : BESTIARIES.includes(item.source)));
		if (monster){
			return new Monster(monster);
		}
	},
	
	findMonsterList: (searchString) => {
		assert.ok(monsterList != undefined);

		let selected = monsterList;

		if (searchString) {
			// transform the search string into an array of regular expressions
			let tokens = searchString.match(/\w+/g).map(word => new RegExp(word, 'i'));
			
			// only keep the monsters whose name match all the tokens
			// note: this won't work great if the tokens overlap in the string
			selected = monsterList.filter(monster => tokens.every(tok => monster.name.search(tok) >= 0));
		}
		
		return selected.map(monster => ({ name: monster.name, source: monster.source }));
	},
};
