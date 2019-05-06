/* jshint node: true, esversion: 6 */
'use strict';

var expect = require('chai').expect,
	srdImport = require('../srdimport');

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
			expect(monster.feats).to.deep.equal([{name: 'Skill Focus', details: [{name: 'Perception'}]}]);
			expect(monster.melee).to.deep.equal({claw: {name: 'claw', nbAttacks: 1, nbDice: 1, dieType: 2, type: 'natural'}});
			expect(monster.sq).to.be.undefined;
			expect(monster.skills).to.deep.equal([{name: 'Perception', ranks: 1}, {name: 'Swim', racial: 4}]);
			expect(monster.naturalArmor).to.equal(2);
			expect(monster.baseFort).to.equal(2);
			expect(monster.baseRef).to.equal(2);
			expect(monster.baseWill).to.equal(0);
			expect(monster.shape).to.equal('long');
			expect(monster.source).to.equal('Animal Archive');
		});
	});
});
