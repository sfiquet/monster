const expect = require('chai').expect;
const shape = require('../shape');
const Monster = require('../../app/lib/monster');

describe('shape', () => {
  describe('guessShape', () => {

    it('returns long by default', () => {
      const monster = new Monster({ name: 'test', type: 'something else', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('long');
    });

    it('returns long if the monster is an aberration', () => {
      const monster = new Monster({ name: 'test', type: 'aberration', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('long');
    });
    
    it('returns long if the monster is an animal', () => {
      const monster = new Monster({ name: 'test', type: 'animal', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('long');
    });
    
    it('returns long if the monster is a dragon', () => {
      const monster = new Monster({ name: 'test', type: 'dragon', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('long');
    });

    it('returns long if the monster is a magical beast', () => {
      const monster = new Monster({ name: 'test', type: 'magical beast', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('long');
    });

    it('returns long if the monster is an ooze', () => {
      const monster = new Monster({ name: 'test', type: 'ooze', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('long');
    });

    it('returns long if the monster is a vermin', () => {
      const monster = new Monster({ name: 'test', type: 'vermin', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('long');
    });

    it('returns tall if the monster is bigger than medium and has a reach at least equal to its space', () => {
      const longMonster = new Monster({ name: 'test', type: 'animal', size: 'Large', space: 10, reach: 5 });
      expect(shape.guessShape(longMonster)).to.equal('long');

      const tallMonster = new Monster({ name: 'test', type: 'animal', size: 'Large', space: 10, reach: 10 });
      expect(shape.guessShape(tallMonster)).to.equal('tall');

      const bigReachMonster = new Monster({ name: 'test', type: 'animal', size: 'Large', space: 10, reach: 20 });
      expect(shape.guessShape(bigReachMonster)).to.equal('tall');
    });

    it('returns tall if the monster is a humanoid', () => {
      const monster = new Monster({ name: 'test', type: 'humanoid', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('tall');
    });

    it('returns tall if the monster is a monstrous humanoid', () => {
      const monster = new Monster({ name: 'test', type: 'monstrous humanoid', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('tall');
    });

    it('returns tall if the monster is a fey', () => {
      const monster = new Monster({ name: 'test', type: 'fey', size: 'Small' });
      expect(shape.guessShape(monster)).to.equal('tall');
    });

    it('returns tall if the monster is a plant', () => {
      const monster = new Monster({ name: 'test', type: 'plant', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('tall');
    });

    it('returns tall if the monster is an undead', () => {
      const monster = new Monster({ name: 'test', type: 'undead', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('tall');
    });

    it('returns tall if the monster is an outsider', () => {
      const monster = new Monster({ name: 'test', type: 'outsider', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('tall');
    });

    it('returns tall if the monster is a golem', () => {
      const monster = new Monster({ name: 'test golem', type: 'construct', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('tall');
    });

    it('returns long for others constructs', () => {
      const monster = new Monster({ name: 'test thing', type: 'construct', size: 'Medium' });
      expect(shape.guessShape(monster)).to.equal('long');
    });

  });  
});
