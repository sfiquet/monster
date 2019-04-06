/* jshint node: true, esversion: 6 */
'use strict';

var expect = require('chai').expect,
	log = require('../log'),
	msg = require('../message'),
	parse = require('../parse');
var createMessage = msg.createMessage;

describe('Parse', function(){
	describe('parseCommaSeparatedString', function(){
		
		it('returns undefined if the parameter is not a string', function(){
			expect(parse.parseCommaSeparatedString()).to.be.undefined;
			expect(parse.parseCommaSeparatedString(4)).to.be.undefined;
			expect(parse.parseCommaSeparatedString({})).to.be.undefined;
		});

		it('returns an array containing the trimmed input string if there is no comma', function(){
			expect(parse.parseCommaSeparatedString('  this is a string  ')).to.deep.equal(['this is a string']);
			expect(parse.parseCommaSeparatedString('  this  ( is a ) string  ')).to.deep.equal(['this  ( is a ) string']);
		});

		it('returns an array of trimmed chunks if there are commas', function(){
			expect(parse.parseCommaSeparatedString('  apples, oranges, tomatoes  ')).to.deep.equal(['apples', 'oranges', 'tomatoes']);
		});

		it('ignores commas that are inside round brackets', function(){
			expect(parse.parseCommaSeparatedString(
				'Alertness, Critical Focus, Extend Spell, Improved Critical (bite, claw), Iron Will')).to.deep.equal(
					['Alertness', 'Critical Focus', 'Extend Spell', 'Improved Critical (bite, claw)', 'Iron Will']);
		});
	});

	describe('parseOrSeparatedString', function(){

		it('returns undefined if the parameter is not a string', function(){
			expect(parse.parseOrSeparatedString()).to.be.undefined;
			expect(parse.parseOrSeparatedString(4)).to.be.undefined;
			expect(parse.parseOrSeparatedString({})).to.be.undefined;
		});

		it('returns an array containing the trimmed input string if there is no "or" separator', function(){
			expect(parse.parseOrSeparatedString('  this is a string  ')).to.deep.equal(['this is a string']);
		});

		it('returns an array of trimmed chunks if there are "or" separators', function(){
			expect(parse.parseOrSeparatedString('  apples or pears or tomatoes  ')).to.deep.equal(['apples', 'pears', 'tomatoes']);
		});

		it('ignores any "or" within a word', function(){
			expect(parse.parseOrSeparatedString('  apples or oranges or tomatoes  ')).to.deep.equal(['apples', 'oranges', 'tomatoes']);
			expect(parse.parseOrSeparatedString('terminator test')).to.deep.equal(['terminator test']);
			expect(parse.parseOrSeparatedString('transformer')).to.deep.equal(['transformer']);
		});

		it('doesn\'t ignore "or" separators that are within parentheses', function(){
			// this is different from the behaviour of parseCommaSeparatedString
			// dealing with parentheses is not needed for now, might change in the future if necessary
			expect(parse.parseOrSeparatedString('one or (two or three)')).to.deep.equal(['one', '(two', 'three)']);
		});
	});

	describe('parseAndSeparatedString', function(){

		it('returns undefined if the parameter is not a string', function(){
			expect(parse.parseAndSeparatedString()).to.be.undefined;
			expect(parse.parseAndSeparatedString(4)).to.be.undefined;
			expect(parse.parseAndSeparatedString({})).to.be.undefined;
		});

		it('returns an array containing the trimmed input string if there is no "and" separator', function(){
			expect(parse.parseAndSeparatedString('  this is a string  ')).to.deep.equal(['this is a string']);
		});

		it('returns an array of trimmed chunks if there are "and" separators', function(){
			expect(parse.parseAndSeparatedString('  apples and pears and tomatoes  ')).to.deep.equal(['apples', 'pears', 'tomatoes']);
		});

		it('ignores any "and" within a word', function(){
			expect(parse.parseAndSeparatedString('  apples and androids and tomatoes  ')).to.deep.equal(['apples', 'androids', 'tomatoes']);
			expect(parse.parseAndSeparatedString('land test')).to.deep.equal(['land test']);
			expect(parse.parseAndSeparatedString('random')).to.deep.equal(['random']);
		});

		it('ignores "and" separators that are within parentheses', function(){
			expect(parse.parseAndSeparatedString('one and (two and three)')).to.deep.equal(['one', '(two and three)']);
		});
	});

	describe('parseFeatChunk', function(){
		it('generates a feat object with a name property when there are no parentheses', function(){
			expect(parse.parseFeatChunk('Diehard')).to.deep.equal({errors: [], warnings: [], data: {name: 'Diehard'}});
		});

		it('generates a feat object with a special property when the feat is a bonus feat', function(){
			expect(parse.parseFeatChunk('DiehardB')).to.deep.equal({errors: [], warnings: [], data: {name: 'Diehard', special: ['bonus']}});
		});

		it('generates a feat object with a details property when there are parentheses', function(){
			expect(parse.parseFeatChunk('Skill Focus (Perception)')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'Skill Focus', details: [{name: 'Perception'}]}});
		});

		it('generates a feat object with bonus and details properties', function(){
			expect(parse.parseFeatChunk('Skill Focus (Perception)B')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'Skill Focus', details: [{name: 'Perception'}], special: ['bonus']}});
		});

		it('generates an error when there are too many parentheses', function(){
			expect(parse.parseFeatChunk('Skill Focus ((Perception)')).to.deep.equal(
				{errors: [createMessage('invalidFormat', 'Skill Focus ((Perception)')], warnings: [], data: undefined});

			expect(parse.parseFeatChunk('Skill Focus (Perception) (some comment)')).to.deep.equal(
				{errors: [createMessage('invalidFormat', 'Skill Focus (Perception) (some comment)')], warnings: [], data: undefined});
		});

		it('generates an error when there are brackets within the parentheses (temporary)', function(){
			expect(parse.parseFeatChunk('Skill Focus (Knowledge[planes])')).to.deep.equal(
				{errors: [createMessage('featSubDetailsNotHandled')], warnings: [], data: undefined});
		});

		it('generates a warning when there is no closing parenthesis', function(){
			expect(parse.parseFeatChunk('Skill Focus (Perception')).to.deep.equal(
				{errors: [], warnings: [createMessage('noClosingParenthesis', 'Skill Focus (Perception')], 
					data: {name: 'Skill Focus', details: [{name: 'Perception'}]}});
		});

		it('generates a warning when there is text after the parentheses', function(){
			expect(parse.parseFeatChunk('Skill Focus (Perception) blah blah')).to.deep.equal(
				{errors: [], warnings: [createMessage('dataAfterClosingParenthesis', 'Skill Focus (Perception) blah blah')], 
					data: {name: 'Skill Focus', details: [{name: 'Perception'}]}});
		});

		it('doesn\'t deal with mythic feats yet (temporary)', function(){
			expect(parse.parseFeatChunk('DiehardM')).to.deep.equal({errors: [], warnings: [], data: {name: 'DiehardM'}});

			expect(parse.parseFeatChunk('Skill Focus (Perception)M')).to.deep.equal(
				{errors: [], warnings: [createMessage('dataAfterClosingParenthesis', 'Skill Focus (Perception)M')], 
					data: {name: 'Skill Focus', details: [{name: 'Perception'}]}});
		});

		it('generates a feat object with multiple details', function(){
			expect(parse.parseFeatChunk('Skill Focus (Bluff, Perception)')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'Skill Focus', details: [{name: 'Bluff'}, {name: 'Perception'}]}});
		});

		it('generates a single error when there are brackets for multiple details (temporary)', function(){
			expect(parse.parseFeatChunk('Skill Focus (Knowledge[planes], Knowledge[religion])')).to.deep.equal(
				{errors: [createMessage('featSubDetailsNotHandled')], warnings: [], data: undefined});
		});

		it('generates a warning there is no closing parenthesis after multiple details', function(){
			expect(parse.parseFeatChunk('Skill Focus (Bluff, Perception')).to.deep.equal(
				{errors: [], warnings: [createMessage('noClosingParenthesis', 'Skill Focus (Bluff, Perception')], 
					data: {name: 'Skill Focus', details: [{name: 'Bluff'}, {name: 'Perception'}]}});
		});
	});

	describe('parseAttackHeader', function(){

		it('generates a header object with properties name and nbAttacks', function(){
			expect(parse.parseAttackHeader('2 claws +5')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'claw', nbAttacks: 2}});

			expect(parse.parseAttackHeader('4 claws -1')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'claw', nbAttacks: 4}});

			expect(parse.parseAttackHeader('4 claws +0')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'claw', nbAttacks: 4}});
		});

		it('generates a header object with nbAttacks equal to 1 when it is not provided', function(){
			expect(parse.parseAttackHeader('bite +5')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'bite', nbAttacks: 1}});

			expect(parse.parseAttackHeader('bite +0')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'bite', nbAttacks: 1}});

			expect(parse.parseAttackHeader('bite -2')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'bite', nbAttacks: 1}});
		});

		it('generates an error when the format is incorrect', function(){
			expect(parse.parseAttackHeader('')).to.deep.equal(
				{errors: [createMessage('wrongFormatAttackHeader', '')], warnings: [], data: undefined});

			expect(parse.parseAttackHeader('bite')).to.deep.equal(
				{errors: [createMessage('wrongFormatAttackHeader', 'bite')], warnings: [], data: undefined});

			expect(parse.parseAttackHeader('5')).to.deep.equal(
				{errors: [createMessage('wrongFormatAttackHeader', '5')], warnings: [], data: undefined});

			expect(parse.parseAttackHeader('bite +5 weird')).to.deep.equal(
				{errors: [createMessage('wrongFormatAttackHeader', 'bite +5 weird')], warnings: [], data: undefined});

			expect(parse.parseAttackHeader('2 claws +4 text 3')).to.deep.equal(
				{errors: [createMessage('wrongFormatAttackHeader', '2 claws +4 text 3')], warnings: [], data: undefined});

			expect(parse.parseAttackHeader('bite 2 claws +4 text')).to.deep.equal(
				{errors: [createMessage('wrongFormatAttackHeader', 'bite 2 claws +4 text')], warnings: [], data: undefined});
		});

		it('generates an error when the format is correct but not handled yet (temporary)', function(){
			// this case is actually valid, will need to be dealt with later
			expect(parse.parseAttackHeader('dagger +10/+5')).to.deep.equal(
				{errors: [createMessage('wrongFormatAttackHeader', 'dagger +10/+5')], warnings: [], data: undefined});

			// this case is actually valid, will need to be dealt with later
			expect(parse.parseAttackHeader('+1 club +5')).to.deep.equal(
				{errors: [createMessage('wrongFormatAttackHeader', '+1 club +5')], warnings: [], data: undefined});
		});

		it('generates a warning when there are several natural attacks of the same kind but the name doesn\'t end with an S', function(){
			expect(parse.parseAttackHeader('2 claw +5')).to.deep.equal(
				{errors: [], warnings: [createMessage('checkFormatAttackHeader', '2 claw +5')], data: {name: 'claw', nbAttacks: 2}});
		});
	});

	describe('parseAttackDetails', function(){

		it('generates a details object with properties nbDice and dieType', function(){
			expect(parse.parseAttackDetails('2d4')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 2, dieType: 4}});

			expect(parse.parseAttackDetails('2d4+3')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 2, dieType: 4}});

			expect(parse.parseAttackDetails('1d8-2')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 1, dieType: 8}});
		});

		it('generates the optional property extraDamage when one is provided', function(){
			expect(parse.parseAttackDetails('2d4+3 plus grab')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 2, dieType: 4, extraDamage: ['grab']}});

			expect(parse.parseAttackDetails('2d4+3 plus energy drain')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 2, dieType: 4, extraDamage: ['energy drain']}});
		});

		it('handles extra damage properly when it has a dice roll', function(){
			expect(parse.parseAttackDetails('2d4+3 plus 4d6 negative energy')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 2, dieType: 4, extraDamage: ['4d6 negative energy']}});
		});

		it('handles two extra damages correctly', function(){
			expect(parse.parseAttackDetails('2d4+3 plus grab and poison')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 2, dieType: 4, extraDamage: ['grab', 'poison']}});

			expect(parse.parseAttackDetails('2d4+3 plus grab and 4d6 negative energy')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 2, dieType: 4, extraDamage: ['grab', '4d6 negative energy']}});

			// alternative format
			expect(parse.parseAttackDetails('2d4+3 plus grab plus poison')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 2, dieType: 4, extraDamage: ['grab', 'poison']}});

			expect(parse.parseAttackDetails('2d4+3 plus grab plus 4d6 negative energy')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 2, dieType: 4, extraDamage: ['grab', '4d6 negative energy']}});
		});

		it('handles a list of extra damages correctly', function(){
			// not sure if there is a version without the comma before the 'and'
			expect(parse.parseAttackDetails('2d4+3 plus grab, attach, and poison')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 2, dieType: 4, extraDamage: ['grab', 'attach', 'poison']}});
		});

		it('generates an error when criticals are provided (temporary)', function(){
			expect(parse.parseAttackDetails('2d4+3/x3')).to.deep.equal(
				{errors: [createMessage('criticalsNotHandled')], warnings: [], data: undefined});

			expect(parse.parseAttackDetails('2d4+3/15-20')).to.deep.equal(
				{errors: [createMessage('criticalsNotHandled')], warnings: [], data: undefined});

			expect(parse.parseAttackDetails('2d4+3/19-20/x3')).to.deep.equal(
				{errors: [createMessage('criticalsNotHandled')], warnings: [], data: undefined});
		});
	});

	describe('parseDamageFormula', function(){
		it('generates a damage formula object including the damage roll and the criticals', function(){
			// the detailed test for the damage roll is in parseDamageRoll
			expect(parse.parseDamageFormula('1d8+3')).to.deep.equal(
				{errors: [], warnings: [], data: {nbDice: 1, dieType: 8}});
		});

		it('generates an error when the formula contains criticals (temporary)', function(){
			expect(parse.parseDamageFormula('1d8+3/19-20/x3')).to.deep.equal(
				{errors: [createMessage('criticalsNotHandled')], warnings: [], data: undefined});

			expect(parse.parseDamageFormula('1d8+3/x3')).to.deep.equal(
				{errors: [createMessage('criticalsNotHandled')], warnings: [], data: undefined});
			
			expect(parse.parseDamageFormula('1d8+3/19-20')).to.deep.equal(
				{errors: [createMessage('criticalsNotHandled')], warnings: [], data: undefined});

			expect(parse.parseDamageFormula('1d8+3/')).to.deep.equal(
				{errors: [createMessage('criticalsNotHandled')], warnings: [], data: undefined});

			expect(parse.parseDamageFormula('1d8+3/text')).to.deep.equal(
				{errors: [createMessage('criticalsNotHandled')], warnings: [], data: undefined});
		});
	});

	describe('parseDamageRoll', function(){
		it('generates damage roll data when there is no modifier', function(){
			expect(parse.parseDamageRoll('2d4')).to.deep.equal({errors: [], warnings: [], data: {nbDice: 2, dieType: 4}});
			expect(parse.parseDamageRoll('10d12')).to.deep.equal({errors: [], warnings: [], data: {nbDice: 10, dieType: 12}});
		});

		// maybe it should return the modifier for further checking?
		it('generates damage roll data when there is a bonus', function(){
			expect(parse.parseDamageRoll('2d4+3')).to.deep.equal({errors: [], warnings: [], data: {nbDice: 2, dieType: 4}});
			expect(parse.parseDamageRoll('10d12+15')).to.deep.equal({errors: [], warnings: [], data: {nbDice: 10, dieType: 12}});
		});

		it('generates damage roll data when there is a malus', function(){
			expect(parse.parseDamageRoll('2d4-1')).to.deep.equal({errors: [], warnings: [], data: {nbDice: 2, dieType: 4}});
			expect(parse.parseDamageRoll('10d12-11')).to.deep.equal({errors: [], warnings: [], data: {nbDice: 10, dieType: 12}});
		});

		it('ignores trailing text after the damage roll', function(){
			// maybe it shouldn't?
			expect(parse.parseDamageRoll('2d4+1 ')).to.deep.equal({errors:[], warnings: [], data: {nbDice: 2, dieType: 4}});
			expect(parse.parseDamageRoll('2d4+1 rubbish')).to.deep.equal({errors:[], warnings: [], data: {nbDice: 2, dieType: 4}});
			expect(parse.parseDamageRoll('2d4+1rubbish')).to.deep.equal({errors:[], warnings: [], data: {nbDice: 2, dieType: 4}});
		});

		it('generates an error when the format is wrong', function(){
			expect(parse.parseDamageRoll('2')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', '2')], warnings: [], data: undefined});
			expect(parse.parseDamageRoll('d4')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', 'd4')], warnings: [], data: undefined});
			expect(parse.parseDamageRoll('2s4')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', '2s4')], warnings: [], data: undefined});
			expect(parse.parseDamageRoll('d')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', 'd')], warnings: [], data: undefined});
			expect(parse.parseDamageRoll('s2d4')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', 's2d4')], warnings: [], data: undefined});
			expect(parse.parseDamageRoll(' 2d4')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', ' 2d4')], warnings: [], data: undefined});

			expect(parse.parseDamageRoll('2+1')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', '2+1')], warnings: [], data: undefined});
			expect(parse.parseDamageRoll('d4+1')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', 'd4+1')], warnings: [], data: undefined});
			expect(parse.parseDamageRoll('2s4+1')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', '2s4+1')], warnings: [], data: undefined});
			expect(parse.parseDamageRoll('d+1')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', 'd+1')], warnings: [], data: undefined});
			expect(parse.parseDamageRoll('s2d4+1')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', 's2d4+1')], warnings: [], data: undefined});
			expect(parse.parseDamageRoll(' 2d4+1')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', ' 2d4+1')], warnings: [], data: undefined});

			expect(parse.parseDamageRoll('2d4!1')).to.deep.equal({errors:[createMessage('wrongFormatAttackDetails', '2d4!1')], warnings: [], data: undefined});
		});
	});

	describe('parseList', function(){

		it('splits the given string into comma-separated chunks and returns them in an array', function(){
			expect(parse.parseList('one,two,three')).to.deep.equal(['one', 'two', 'three']);
			expect(parse.parseList('one , two , three')).to.deep.equal(['one', 'two', 'three']);
			expect(parse.parseList(' one , two , three ')).to.deep.equal([' one', 'two', 'three ']);
			expect(parse.parseList('one potato, two potato, three potato')).to.deep.equal(['one potato', 'two potato', 'three potato']);
			expect(parse.parseList(', one , two , three, ')).to.deep.equal(['one', 'two', 'three']);
		});

		it('returns the given string in an single-item array when there is no comma', function(){
			expect(parse.parseList('one')).to.deep.equal(['one']);
			expect(parse.parseList('one two three')).to.deep.equal(['one two three']);
			expect(parse.parseList('  one two three  ')).to.deep.equal(['  one two three  ']);
		});

	});

	describe('parseExtraDamage', function(){

		it('splits the string into chunks separated by "and" and returns them in an array', function(){
			expect(parse.parseExtraDamage('grab and poison and 1d4 acid')).to.deep.equal({errors:[], warnings: [], data: {extraDamage:['grab', 'poison', '1d4 acid']}});
		});

		it('splits the string on commas before the first "and"', function(){
			expect(parse.parseExtraDamage('grab, poison, and 1d4 acid')).to.deep.equal({errors:[], warnings: [], data: {extraDamage:['grab', 'poison', '1d4 acid']}});
			expect(parse.parseExtraDamage('grab, poison and 1d4 acid')).to.deep.equal({errors:[], warnings: [], data: {extraDamage:['grab', 'poison', '1d4 acid']}});
		});

		it('generates an error if there are commas after the first "and"', function(){
			expect(parse.parseExtraDamage('grab and poison, 1d4 acid and enerdy drain')).to.deep.equal(
				{errors:[createMessage('wrongFormatExtraDamage', 'grab and poison, 1d4 acid and enerdy drain')], warnings: [], data: undefined});

		});
	});

	describe('parseAttack', function(){

		it('returns an object with properties identifier and details', function(){
			expect(parse.parseAttack('name (details)')).to.deep.equal(
				{identifier: 'name', details: 'details'});

			expect(parse.parseAttack('2 claws +10 (1d6+5 plus disease)')).to.deep.equal(
				{identifier: '2 claws +10', details: '1d6+5 plus disease'});

			expect(parse.parseAttack(' name ( details ) ')).to.deep.equal(
				{identifier: 'name', details: 'details'});

			expect(parse.parseAttack('name(details)')).to.deep.equal(
				{identifier: 'name', details: 'details'});
		});

		it('returns undefined if the format is wrong', function(){
			expect(parse.parseAttack('name')).to.be.undefined;
			expect(parse.parseAttack('name (')).to.be.undefined;
			expect(parse.parseAttack('name ()')).to.be.undefined;
			expect(parse.parseAttack('name )')).to.be.undefined;
			expect(parse.parseAttack('(details)')).to.be.undefined;
			expect(parse.parseAttack(' (details)')).to.be.undefined;
			expect(parse.parseAttack(' (details')).to.be.undefined;
			expect(parse.parseAttack('name (details) other')).to.be.undefined;
			expect(parse.parseAttack('name (details)other')).to.be.undefined;
			expect(parse.parseAttack('name (details) (other)')).to.be.undefined;
		});
	});
	
	describe('parseAttackChunk', function(){
		it('parses an attack chunk', function(){
			expect(parse.parseAttackChunk('2 claws +10 (1d6+5 plus disease)')).to.deep.equal({errors: [], warnings: [], data: 
				{name: 'claw', nbAttacks: 2, nbDice: 1, dieType: 6, extraDamage: ['disease']}});

			expect(parse.parseAttackChunk('2 claws +10 (1d6+5 plus disease and grab)')).to.deep.equal({errors: [], warnings: [], data: 
				{name: 'claw', nbAttacks: 2, nbDice: 1, dieType: 6, extraDamage: ['disease', 'grab']}});

			expect(parse.parseAttackChunk('2 claws +10 (1d6+5 plus disease, grab and poison)')).to.deep.equal({errors: [], warnings: [], data: 
				{name: 'claw', nbAttacks: 2, nbDice: 1, dieType: 6, extraDamage: ['disease', 'grab', 'poison']}});
		});

		it('generates an error when the format is wrong', function(){
			expect(parse.parseAttackChunk('2 claws +10 (1d6+5 plus disease)(more stuff)')).to.deep.equal(
				{errors: [createMessage('wrongAttackFormat', '2 claws +10 (1d6+5 plus disease)(more stuff)')], warnings: [], data: undefined});
			// more testing in parseAttack
		});
	});

	describe('parseMeleeString', function(){
		it('generates an error if the value is not a string', function(){
			expect(parse.parseMeleeString(undefined)).to.deep.equal(
				{errors:[createMessage('invalidValue', undefined)], warnings: [], data: undefined});
			
			expect(parse.parseMeleeString(5)).to.deep.equal(
				{errors:[createMessage('invalidValue', 5)], warnings: [], data: undefined});
		});

		it('generates an error if there are alternative lists of attacks separated by "or" (temporary)', function(){
			expect(parse.parseMeleeString('greatsword +3 (1d10+2) or 2 claws +1 (2d4+2)')).to.deep.equal(
				{errors:[createMessage('alternativeAttackListsNotHandled')], warnings: [], data: undefined});
		});

		it('generates an error if there are multiple attack types separated by commas (temporary)', function(){
			expect(parse.parseMeleeString('sting +16 (2d6+4 plus poison), 2 claws +16 (1d6+4 plus grab)')).to.deep.equal(
				{errors:[createMessage('multipleAttackTypesNotHandled')], warnings: [], data: undefined});
		});

		it('generates an error if there are multiple attack types separated by "and" (temporary)', function(){
			expect(parse.parseMeleeString('sting +16 (2d6+4 plus poison) and 2 claws +16 (1d6+4 plus grab)')).to.deep.equal(
				{errors:[createMessage('multipleAttackTypesNotHandled')], warnings: [], data: undefined});
		});

		it('generates attack data for a single attack', function(){
			expect(parse.parseMeleeString('sting +16 (2d6+4 plus poison)')).to.deep.equal(
				{errors:[], warnings: [], data: 
					{name: 'sting', nbAttacks: 1, nbDice: 2, dieType: 6, extraDamage:['poison']}});
			// see parseAttackChunk for more tests
		});
	});

	describe('parseNonBracketedSkill', function(){
		it('parses a string containing a skill name and a modifier', function(){
			expect(parse.parseNonBracketedSkill('Stealth +4')).to.deep.equal({name: 'Stealth', modifier: 4});
			expect(parse.parseNonBracketedSkill('Sense Motive +4')).to.deep.equal({name: 'Sense Motive', modifier: 4});
			expect(parse.parseNonBracketedSkill('Sense Motive -4')).to.deep.equal({name: 'Sense Motive', modifier: -4});
			expect(parse.parseNonBracketedSkill('Sense Motive +0')).to.deep.equal({name: 'Sense Motive', modifier: 0});
		});

		it('trims the results', function(){
			expect(parse.parseNonBracketedSkill('  Stealth  +4  ')).to.deep.equal({name: 'Stealth', modifier: 4});
		});

		it('returns undefined if the format is not as expected', function(){
			expect(parse.parseNonBracketedSkill('Sense Motive')).to.be.undefined;
			expect(parse.parseNonBracketedSkill('Sense Motive +4 Stealth +2')).to.be.undefined;
			expect(parse.parseNonBracketedSkill('Sense Motive +4 trailing rubbish')).to.be.undefined;
			expect(parse.parseNonBracketedSkill('Stealth 4')).to.be.undefined;
		});

		it('works if there is no skill name', function(){
			expect(parse.parseNonBracketedSkill('+4')).to.deep.equal({name: '', modifier: 4});
		});
	});

	describe('parseAlternativeSkillModifiers', function(){
		it('currently returns the given string (temporary)', function(){
			expect(parse.parseAlternativeSkillModifiers('anything')).to.equal('anything');
		});
	});

	describe('parseBracketedSKill', function(){
		it('parses a string containing a skill name and a modifier', function(){
			expect(parse.parseBracketedSkill('Stealth +4')).to.deep.equal(
				{name: 'Stealth', modifier: 4});
			// see parseNonBracketedSkill for more in-depth testing
		});

		it('parses a string containing a skill name, skill details and a modifier', function(){
			expect(parse.parseBracketedSkill('Craft (alchemy) +4')).to.deep.equal(
				{name: 'Craft', details: 'alchemy', modifier: 4});
		});

		it('parses a string containing a skill name, a modifier and a list of alternative modifiers', function(){
			// note: alternatives should eventually be an array of objects with a value and a text for each element
			expect(parse.parseBracketedSkill('Acrobatics +10 (+14 balancing, +18 jumping)')).to.deep.equal(
				{name: 'Acrobatics', modifier: 10, alternatives: '+14 balancing, +18 jumping'});
		});

		it('parses a string containing a skill name, details, a modifier and a list of alternative modifiers', function(){
			// note: alternatives should eventually be an array of objects with a value and a text for each element
			expect(parse.parseBracketedSkill('Knowledge (nature) +4 (+8 on a blue moon)')).to.deep.equal(
				{name: 'Knowledge', details: 'nature', modifier: 4, alternatives: '+8 on a blue moon'});
		});

		it('returns undefined if brackets are wrong', function(){
			expect(parse.parseBracketedSkill('Craft (alchemy +4')).to.be.undefined;
			expect(parse.parseBracketedSkill('Craft alchemy) +4')).to.be.undefined;
			expect(parse.parseBracketedSkill('Craft )alchemy( +4')).to.be.undefined;
			
			expect(parse.parseBracketedSkill('Acrobatics +4 (+8 jumping')).to.be.undefined;
			expect(parse.parseBracketedSkill('Acrobatics +4 +8 jumping)')).to.be.undefined;
			expect(parse.parseBracketedSkill('Acrobatics +4 )+8 jumping(')).to.be.undefined;

			expect(parse.parseBracketedSkill('Knowledge nature) +4 (+8 sometimes)')).to.be.undefined;
			expect(parse.parseBracketedSkill('Knowledge (nature +4 (+8 sometimes)')).to.be.undefined;
			expect(parse.parseBracketedSkill('Knowledge (nature) +4 +8 sometimes)')).to.be.undefined;
			expect(parse.parseBracketedSkill('Knowledge (nature) +4 (+8 sometimes')).to.be.undefined;
			expect(parse.parseBracketedSkill('Knowledge (nature) +4 )+8 sometimes)')).to.be.undefined;
		});
	});

	describe('parseSkillChunk', function(){

		it('parses a skill chunk', function(){
			expect(parse.parseSkillChunk('Stealth +4')).to.deep.equal({errors: [], warnings: [], data: {name: 'Stealth', modifier: 4}});
		});

		it('parses a skill chunk with a negative modifier', function(){
			expect(parse.parseSkillChunk('Stealth -4')).to.deep.equal({errors: [], warnings: [], data: {name: 'Stealth', modifier: -4}});
		});

		it('generates an error if there are alternative values in special conditions (temporary)', function(){
			expect(parse.parseSkillChunk('Stealth +4 (+8 in low light)')).to.deep.equal(
				{errors: [createMessage('extraSkillModifiersNotHandled', 'Stealth +4 (+8 in low light)')], warnings: [], data: undefined});
		});

		it('generates an error if the skill has details (temporary)', function(){
			expect(parse.parseSkillChunk('Knowledge(planes) +4')).to.deep.equal(
				{errors: [createMessage('skillDetailsNotHandled', 'Knowledge(planes) +4')], warnings: [], data: undefined});
		});
	});

	describe('parseSkillString', function(){
		
		it('generates an error if the value is not a string', function(){
			expect(parse.parseSkillString(undefined)).to.deep.equal(
				{errors:[createMessage('invalidValue', undefined)], warnings: [], data: undefined});
		});

		it('generates an entry in the skills object when there is a single skill', function(){
			expect(parse.parseSkillString('Stealth +4')).to.deep.equal(
				{errors:[], warnings: [], data: {Stealth: {name: 'Stealth', modifier: 4}}});
		});

		it('generates a skill object when there are several skills', function(){
			expect(parse.parseSkillString('Stealth +4, Swim +8')).to.deep.equal(
				{errors:[], warnings: [], data: {Stealth: {name: 'Stealth', modifier: 4}, Swim: {name: 'Swim', modifier: 8}}});
		});
	});

	describe('parseRacialMod', function(){
		it('returns undefined when the format is wrong', function(){
			expect(parse.parseRacialMod('')).to.be.undefined;
			expect(parse.parseRacialMod('Swim')).to.be.undefined;
			expect(parse.parseRacialMod('+ Swim')).to.be.undefined;
			expect(parse.parseRacialMod('4 Swim')).to.be.undefined;
			expect(parse.parseRacialMod('+4 ')).to.be.undefined;
			expect(parse.parseRacialMod('Swim +4')).to.be.undefined;
		});

		it('returns an object with properties "name" and "modifier" when the format is correct', function(){
			expect(parse.parseRacialMod('+4 Swim')).to.deep.equal({name: 'Swim', modifier: 4});
		});

		it('handles negative modifiers', function(){
			expect(parse.parseRacialMod('-4 Swim')).to.deep.equal({name: 'Swim', modifier: -4});
		});

		it('trims the name', function(){
			expect(parse.parseRacialMod('-4   Swim    ')).to.deep.equal({name: 'Swim', modifier: -4});
		});

		it('ignores spaces', function(){
			expect(parse.parseRacialMod('   -4   Swim    ')).to.deep.equal({name: 'Swim', modifier: -4});
		});
	});

	describe('parseConditionalRacialMod', function(){
		it('returns an object with property "name" when the given string is a known skill', function(){
			expect(parse.parseConditionalRacialMod('Acrobatics')).to.deep.equal({name: 'Acrobatics'});
			expect(parse.parseConditionalRacialMod('Use Magic Device')).to.deep.equal({name: 'Use Magic Device'});
			expect(parse.parseConditionalRacialMod('Heal')).to.deep.equal({name: 'Heal'});
		});

		it('returns undefined if the skill is a specialised skill as it requires different parsing', function(){
			expect(parse.parseConditionalRacialMod('Craft')).to.be.undefined;
			expect(parse.parseConditionalRacialMod('Knowledge')).to.be.undefined;
			expect(parse.parseConditionalRacialMod('Perform')).to.be.undefined;
			expect(parse.parseConditionalRacialMod('Profession')).to.be.undefined;
		});

		it('returns an object with properties "name" and "condition" when the given string starts with a known skill and ends with additional text', function(){
			expect(parse.parseConditionalRacialMod('Acrobatics when jumping')).to.deep.equal({name: 'Acrobatics', condition: 'when jumping'});
			expect(parse.parseConditionalRacialMod('Stealth in tall grass')).to.deep.equal({name: 'Stealth', condition: 'in tall grass'});
		});

		it('returns undefined when the given string doesn\'t starts with a known skill', function(){
			expect(parse.parseConditionalRacialMod('acrobatics')).to.be.undefined;
			expect(parse.parseConditionalRacialMod('Not a skill')).to.be.undefined;
			expect(parse.parseConditionalRacialMod('+4 Acrobatics')).to.be.undefined;
		});

		it('removes leading and trailing spaces', function(){
			expect(parse.parseConditionalRacialMod('  Acrobatics  ')).to.deep.equal({name: 'Acrobatics'});
			expect(parse.parseConditionalRacialMod('  Acrobatics when jumping  ')).to.deep.equal({name: 'Acrobatics', condition: 'when jumping'});
		});

		it('makes sure the skill name identified is followed by a space or at the end of the string', function(){
			expect(parse.parseConditionalRacialMod('Fly')).to.deep.equal({name: 'Fly'});
			expect(parse.parseConditionalRacialMod('Flying')).to.be.undefined;
		});
	});

	describe('parseRacialModChunk', function(){

		it('generates an error if the format is wrong', function(){
			expect(parse.parseRacialModChunk('Swim')).to.deep.equal(
				{errors: [createMessage('invalidFormat', 'Swim')], warnings: [], data: undefined});
		});

		it('generates a racial modifier object', function(){
			expect(parse.parseRacialModChunk('+4 Swim')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'Swim', modifier: 4}});
		});

		it('generates a racial modifier object when the skill has several words', function(){
			expect(parse.parseRacialModChunk('+4 Escape Artist')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'Escape Artist', modifier: 4}});
		});

		it('generates a racial modifier object when the modifier has more than 1 digit', function(){
			expect(parse.parseRacialModChunk('+10 Escape Artist')).to.deep.equal(
				{errors: [], warnings: [], data: {name: 'Escape Artist', modifier: 10}});
		});

		it('generates an error when the skill has details', function(){
			expect(parse.parseRacialModChunk('+4 Craft (trapmaking)')).to.deep.equal(
				{errors: [createMessage('skillDetailsNotHandled', '+4 Craft (trapmaking)')], warnings: [], data: undefined});
		});

		it('generates an error when there is a conditional modifier', function(){
			expect(parse.parseRacialModChunk('+4 Acrobatics (+8 when jumping)')).to.deep.equal(
				{errors: [createMessage('conditionalModifiersNotHandled', '+4 Acrobatics (+8 when jumping)')], warnings: [], data: undefined});
		});

		it('generates an error when there is a conditional modifier without a general modifier', function(){
			expect(parse.parseRacialModChunk('+4 Acrobatics when jumping')).to.deep.equal(
				{errors: [createMessage('conditionalModifiersNotHandled', '+4 Acrobatics when jumping')], warnings: [], data: undefined});
		});
	});

	describe('parseRacialModString', function(){

		it('generates an error if the value is not a string', function(){
			expect(parse.parseRacialModString(undefined)).to.deep.equal(
				{errors:[createMessage('invalidValue', undefined)], warnings: [], data: undefined});
		});

		it('generates a racial modifier object with a list of skills from the given string', function(){
			expect(parse.parseRacialModString('+4 Perception, +4 Stealth')).to.deep.equal(
				{errors: [], warnings: [], data: 
					{skills: {Perception: {name: 'Perception', modifier: 4}, Stealth: {name: 'Stealth', modifier: 4}}}});
		});

		it('generates an error when the given string is a substitution rule', function(){
			expect(parse.parseRacialModString('uses Dex to modify Swim')).to.deep.equal(
				{errors: [createMessage('substitutionRulesNotHandled')], warnings: [], data: undefined});
		});

		it('generates an error when the given string contains a substitution rule', function(){
			expect(parse.parseRacialModString('+4 Perception, +4 Stealth; uses Dexterity to modify Climb checks')).to.deep.equal(
				{errors: [createMessage('substitutionRulesNotHandled')], warnings: [], data: undefined});
		});
		
		it('generates an error when there is a conditional modifier', function(){
			expect(parse.parseRacialModString('+4 Acrobatics (+8 when jumping), +4 Stealth')).to.deep.equal(
				{errors: [createMessage('conditionalModifiersNotHandled', '+4 Acrobatics (+8 when jumping)')], warnings: [], data: undefined});
		});

		it('generates an error when there is a conditional modifier without a general modifier', function(){
			expect(parse.parseRacialModString('+4 Acrobatics when jumping, +4 Stealth')).to.deep.equal(
				{errors: [createMessage('conditionalModifiersNotHandled', '+4 Acrobatics when jumping')], warnings: [], data: undefined});
		});
	});

	describe('parseSQString', function(){

		it('generates an error if the value is not a string', function(){
			expect(parse.parseSQString(undefined)).to.deep.equal(
				{errors:[createMessage('invalidValue', undefined)], warnings: [], data: undefined});
		});

		it('generates an error when there are DCs in the given string', function(){
			expect(parse.parseSQString('fiery form (DC 20)')).to.deep.equal(
				{errors:[createMessage('DCInSQNotHandled', 'fiery form (DC 20)')], warnings: [], data: undefined});
		});

		it('generates a warning when there are numbers in the given string', function(){
			expect(parse.parseSQString('lay on hands (4d6, 7/day, as a 9th-level paladin)')).to.deep.equal(
				{errors:[], warnings: [createMessage('numberInSQ', 'lay on hands (4d6, 7/day, as a 9th-level paladin)')], data: 
					[[{text: 'lay on hands (4d6, 7/day, as a 9th-level paladin)'}]]});
		});

		it('generates an array of SQ data where each item is an array of text chunks', function(){
			expect(parse.parseSQString('camouflage, trackless step, water breathing, woodland stride')).to.deep.equal(
				{errors:[], warnings: [], data: 
					[[{text: 'camouflage'}], [{text: 'trackless step'}], [{text: 'water breathing'}], [{text: 'woodland stride'}]]});
		});
	});
});