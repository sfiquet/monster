const expect = require('chai').expect;
const Monster = require('../../lib/monster');
const template = require('../../lib/template');
const giant = require('../../lib/giant');
const advanced = require('../../lib/advanced');
const young = require('../../lib/young');

describe('Template', () => {

  describe('isCompatible', () => {
    
    it('returns undefined if the template given is not a valid template module', () => {
      const monster = new Monster();
      expect(template.isCompatible('invalid', monster)).to.be.undefined;
    });

    it('calls the template\'s isCompatible function', () => {
      let monster = new Monster({name: 'test', type: 'vermin', size: 'Large'});
      // advanced is always compatible
      // giant is only incompatible with colossal
      // young is incompatible with dragons among other things

      expect(template.isCompatible('advanced', monster)).to.equal(advanced.isCompatible(monster)).and.to.be.true;
      expect(template.isCompatible('giant', monster)).to.equal(giant.isCompatible(monster)).and.to.be.true;
      expect(template.isCompatible('young', monster)).to.equal(young.isCompatible(monster)).and.to.be.true;

      monster.size = 'Colossal';
      expect(template.isCompatible('advanced', monster)).to.equal(advanced.isCompatible(monster)).and.to.be.true;
      expect(template.isCompatible('giant', monster)).to.equal(giant.isCompatible(monster)).and.to.be.false;
      expect(template.isCompatible('young', monster)).to.equal(young.isCompatible(monster)).and.to.be.true;

      monster.type = 'dragon';
      monster.name = 'Test Dragon';
      expect(template.isCompatible('advanced', monster)).to.equal(advanced.isCompatible(monster)).and.to.be.true;
      expect(template.isCompatible('giant', monster)).to.equal(giant.isCompatible(monster)).and.to.be.false;
      expect(template.isCompatible('young', monster)).to.equal(young.isCompatible(monster)).and.to.be.false;

      monster.size = 'Gargantuan';
      expect(template.isCompatible('advanced', monster)).to.equal(advanced.isCompatible(monster)).and.to.be.true;
      expect(template.isCompatible('giant', monster)).to.equal(giant.isCompatible(monster)).and.to.be.true;
      expect(template.isCompatible('young', monster)).to.equal(young.isCompatible(monster)).and.to.be.false;
    });
  });
  
  describe('apply', () => {
    
    it('returns undefined if the template given is not a valid template module', () => {
      const monster = new Monster();
      expect(template.apply('invalid', monster)).to.be.undefined;
    });
    
    it('calls the template\'s apply function', () => {
      const stats = {name: 'test', type: 'animal', size: 'Medium', CR: 10, Str: 14, Dex: 10, Con: 12, Wis: 8, Cha: 8, naturalArmor: 4};
      const baseMonster = new Monster(stats);

      const advancedMonster = template.apply('advanced', baseMonster);
      expect(advancedMonster).to.be.an('object');
      expect(advancedMonster.CR).to.equal(11);
      expect(advancedMonster.naturalArmor).to.equal(6);
      expect(advancedMonster.Str).to.equal(18);
      expect(advancedMonster.size).to.equal('Medium');

      const giantMonster = template.apply('giant', baseMonster);
      expect(giantMonster).to.be.an('object');
      expect(giantMonster.CR).to.equal(11);
      expect(giantMonster.naturalArmor).to.equal(7);
      expect(giantMonster.Str).to.equal(18);
      expect(giantMonster.size).to.equal('Large');

      const youngMonster = template.apply('young', baseMonster);
      expect(youngMonster).to.be.an('object');
      expect(youngMonster.CR).to.equal(9);
      expect(youngMonster.naturalArmor).to.equal(2);
      expect(youngMonster.Str).to.equal(10);
      expect(youngMonster.size).to.equal('Small');
    });
  });
  
  describe('getErrorMessage', () => {
    it('returns undefined if the template given is not a valid template module', () => {
      expect(template.getErrorMessage('invalid')).to.be.undefined;
    });
    
    it('calls the template\'s getErrorMessage function', () => {
      expect(template.getErrorMessage('advanced')).to.equal('');
      expect(template.getErrorMessage('giant')).to.equal('Cannot apply the Giant template on a Colossal creature');
      expect(template.getErrorMessage('young')).to.equal('Cannot apply the Young template when the creature matches any of the following conditions: Barghest, Dragon, Fine size, 1/8 CR');
    });
  });

  describe('getAllTemplateNames', () => {
    
    it('returns a list of all available templates', () => {
      expect(template.getAllTemplateNames()).to.include('advanced');
      expect(template.getAllTemplateNames()).to.include('giant');
      expect(template.getAllTemplateNames()).to.include('young');
    });
  });

  describe('getTemplateModule', () => {
    
    it('returns undefined when the given name is not a valid template name', () => {
      expect(template.getTemplateModule('invalid')).to.be.undefined;
    });

    it('returns the correct module', () => {
      const module = template.getTemplateModule('giant');
      expect(module).to.be.an('object');
      expect(module).to.have.property('isCompatible');
      expect(module).to.have.property('apply');
      expect(module).to.have.property('getErrorMessage');
      expect(module.getErrorMessage()).to.equal(giant.getErrorMessage());
    });
  });

  describe('getTemplateFunction', () => {
    
    it('returns undefined if the given name is not a valid template name', () => {
      expect(template.getTemplateFunction('invalid', 'isCompatible')).to.be.undefined;
    });

    it('returns undefined if the function name is not a valid function for the template', () => {
      expect(template.getTemplateFunction('advanced', 'badFunc')).to.be.undefined;
    });

    it('returns the correct template function', () => {
      const func = template.getTemplateFunction('giant', 'getErrorMessage');
      expect(func).to.be.a('function');
      expect(func).to.equal(giant.getErrorMessage);
      expect(func()).to.equal(giant.getErrorMessage());
    });
  });
});
