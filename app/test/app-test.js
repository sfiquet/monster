/* jshint node: true */
"use strict";

var expect = require('chai').expect,
	app = require('../app');

describe('App', function(){
/*
	describe('loading', function(){
		it('loads the app module', function(){
			app = require('../app');
			expect(app).to.exist;
			done();
		});
	});
*/
	
	describe('set-up', function(){
/*		before(function(){
			try {
				app = require('../app');
			} catch(e) {}
		});
*/		
		it('creates the app object', function(){
			expect(app.app).to.exist;
		});
		
		it('sets up handlebars as the template engine', function(){
			expect(app.app.get('view engine')).to.equal('handlebars');
		});
	
	});
});