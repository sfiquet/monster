/* jshint node: true */
'use strict';

var expect = require('chai').expect,
	Monster = require('../../lib/monster'),
	Database = require('../../lib/database');

// Note: Currently those tests are completely dependent on the content of 
// database.json. They are totally inadequate to test a database and they will 
// fail when the content of database.json is modified.

describe('Database', function(){
	describe('findMonsterList', function(){
		it('returns a list of all monsters when used without search criteria', function(done){
			var db = new Database();
			db.findMonsterList(null, function(err, list){
				if (err) {
					return done(err);
				}
				expect(list).to.be.an.instanceof(Array);
				expect(list).to.have.length(32);
				expect(list[0]).to.have.ownProperty('name');
				expect(list[0]).to.have.ownProperty('id');
				done();
				
			});
		});
		it('returns a list of all monsters matching the search criteria', function(done){
			var db = new Database();
			db.findMonsterList('golem', function(err, list){
				if (err) {
					return done(err);
				}
				expect(list).to.be.an.instanceof(Array);
				expect(list).to.have.length(8);
				done();
			});
		});
	});
	describe('findMonster', function(){
		it('returns the Monster object corresponding to the id given', function(done){
			var db = new Database();
			db.findMonster('Gelatinous Cube', function(err, monster){
				if (err) {
					return done(err);
				}
				expect(monster).to.be.an.instanceof(Monster);
				expect(monster.name).to.equal('Gelatinous Cube');
				done();
			});
		});
	});
});