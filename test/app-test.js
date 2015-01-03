"use strict"

var expect = require('chai').expect,
	app;

describe('App', function(){
	describe('loading', function(){
		it('loads the app module', function(){
			try {
				app = require('../app');
			} catch(e) {}
			expect(app).to.exist;
		});
	});
	
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
		
		it('sets up jade as the template engine', function(){
			expect(app.app.get('view engine')).to.equal('jade');
		});
	
		it('starts the server', function(){
			expect(app.server).to.exist;
		});
	});
});