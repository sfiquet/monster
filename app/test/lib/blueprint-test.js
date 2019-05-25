const expect = require('chai').expect;
const bp = require('../../lib/blueprint');
const Monster = require('../../lib/monster');
const advanced = require('../../lib/advanced');
const giant = require('../../lib/giant');
const young = require('../../lib/young');

describe('Blueprint', () => {
  describe('createBlueprint', () => {

    it('creates an empty blueprint object by default', () => {
      const blueprint = bp.createBlueprint();
      expect(blueprint).to.be.an('object');
      expect(blueprint.templates).to.be.an('array').that.is.empty;
      expect(blueprint.reshape).to.be.a('function');
    });

    it('creates a blueprint object from a dictionary of template options', () => {
      const blueprint = bp.createBlueprint({advanced: 1, giant: 1, young: 1});
      expect(blueprint.templates).to.be.an('array').with.lengthOf(3);
      expect(blueprint.templates).to.have.deep.ordered.members([
        {name: 'advanced', func: advanced.apply}, 
        {name: 'giant', func: giant.apply},
        {name: 'young', func: young.apply}
      ]);
    });

    it('accepts multiple occurrences of the same template', () => {
      const blueprint = bp.createBlueprint({advanced: 2, giant: 1});
      expect(blueprint.templates).to.be.an('array').with.lengthOf(3);
      expect(blueprint.templates).to.have.deep.ordered.members([
        {name: 'advanced', func: advanced.apply}, 
        {name: 'advanced', func: advanced.apply}, 
        {name: 'giant', func: giant.apply},
      ]);
    });
  })

  describe('reshape', () => {
    it('returns a reference to the original monster when called on an empty blueprint', () => {
      const blueprint = bp.createBlueprint();
      const monster = new Monster({name: 'test', size: 'Colossal', CR: 4, Str: 7, Dex: 14, Con: 18, Int: 17, Wis: 12, Cha: 4});
      const result = blueprint.reshape(monster);
      expect(result).to.be.an('object');
      expect(result).to.have.property('error');
      expect(result).to.have.property('newMonster');
      expect(result.error).to.be.null;
      expect(result.newMonster).to.equal(monster);
    });

    it('returns a result object with an error object and a null monster in case of failure', () => {
      const blueprint = bp.createBlueprint({giant: 1});
      const monster = new Monster({name: 'test', size: 'Colossal', CR: 4, Str: 7, Dex: 14, Con: 18, Int: 17, Wis: 12, Cha: 4});
      const result = blueprint.reshape(monster);
      expect(result).to.be.an('object');
      expect(result).to.have.property('error');
      expect(result).to.have.property('newMonster');
      expect(result.error).to.be.an.instanceOf(Error);
      expect(result.error.name).to.equal('IncompatibleTemplateError');
      expect(result.error.message).to.equal('monster incompatible with template');
      expect(result.error.template).to.equal('giant');
      expect(result.newMonster).to.be.null;
    });

    it('returns a result object with a null error and a valid monster in case of success', () => {
      const blueprint = bp.createBlueprint({advanced: 1});
      const monster = new Monster({name: 'test', CR: 4, size: 'Medium', Str: 7, Dex: 14, Con: 18, Int: 17, Wis: 12, Cha: 4});
      const result = blueprint.reshape(monster);
      expect(result).to.be.an('object');
      expect(result).to.have.property('error');
      expect(result).to.have.property('newMonster');
      expect(result.error).to.be.null;
      expect(result.newMonster).to.be.an('object');
      expect(result.newMonster.CR).to.equal(5);
      expect(result.newMonster.Str).to.equal(11);
      expect(result.newMonster.Dex).to.equal(18);
      expect(result.newMonster.size).to.equal('Medium');
    });

    it('applies all templates and generates a new monster', () => {
      const blueprint = bp.createBlueprint({advanced: 1, giant: 1});
      const monster = new Monster({name: 'test', CR: 4, size: 'Medium', Str: 7, Dex: 14, Con: 18, Int: 17, Wis: 12, Cha: 4});
      const result = blueprint.reshape(monster);
      expect(result.error).to.be.null;
      expect(result.newMonster).to.be.an('object');
      expect(result.newMonster.CR).to.equal(6);
      expect(result.newMonster.Str).to.equal(15);
      expect(result.newMonster.Dex).to.equal(16);
      expect(result.newMonster.size).to.equal('Large');
    });

    it('returns the error describing template incompatibility when the error happens on the first template', () => {
      const blueprint = bp.createBlueprint({giant: 1, young: 1});
      const monster = new Monster({name: 'test', size: 'Colossal', CR: 4, Str: 7, Dex: 14, Con: 18, Int: 17, Wis: 12, Cha: 4});
      const result = blueprint.reshape(monster);
      expect(result.error).to.be.an.instanceOf(Error);
      expect(result.error.name).to.equal('IncompatibleTemplateError');
      expect(result.error.message).to.equal('monster incompatible with template');
      expect(result.error.template).to.equal('giant');
      expect(result.error.history).to.deep.equal([]);
    });

    it('adds details about the previous templates when the error happens on a subsequent template', () => {
      const blueprint = bp.createBlueprint({advanced: 2, giant: 2, young: 1});
      const monster = new Monster({name: 'test', size: 'Gargantuan', CR: 4, Str: 7, Dex: 14, Con: 18, Int: 17, Wis: 12, Cha: 4});
      const result = blueprint.reshape(monster);
      expect(result.error).to.be.an.instanceOf(Error);
      expect(result.error.name).to.equal('IncompatibleTemplateError');
      expect(result.error.message).to.equal('monster incompatible with template');
      expect(result.error.template).to.equal('giant');
      expect(result.error.history).to.be.deep.equal([{name: 'advanced', count: 2}, {name: 'giant', count: 1}]);
    });

  });
});