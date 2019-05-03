const expect = require('chai').expect;
const build = require('../build');

describe('Database Build', () => {
  
  describe('merge', () => {

    it('builds a monster from both the srd and the edit monster', () => {
      let srd = {name: 'Tiger', type: 'animal'};
      let edit = {name: 'Tiger', senses: ['low-light vision', 'scent']};
      let expected = {name: 'Tiger', type: 'animal', senses: ['low-light vision', 'scent']};
      let merged = build.merge(srd, edit);
      expect(merged).to.be.an('object').that.deep.equals(expected);
    });

    it('prioritises the edit value over the srd value when there is a conflict', () => {
      let srd = {name: 'Tiger', type: 'Animal', alignment: 'N'};
      let edit = {name: 'Tiger', type: 'animal', senses: ['low-light vision', 'scent']};
      let expected = {name: 'Tiger', type: 'animal', alignment: 'N', senses: ['low-light vision', 'scent']};
      let merged = build.merge(srd, edit);
      expect(merged).to.be.an('object').that.deep.equals(expected);
    });

  });

  describe('mergeLists', () => {
    it('returns undefined if parameters are invalid', () => {
      expect(build.mergeLists()).to.be.undefined;
      expect(build.mergeLists([])).to.be.undefined;
      expect(build.mergeLists({}, {})).to.be.undefined;
      expect(build.mergeLists('', '')).to.be.undefined;
    });

    it('returns an empty array if both parameters are empty arrays', () => {
      expect(build.mergeLists([], [])).to.be.an('array').that.is.empty;
    });

    it('returns the content of the srd list if the edit list is empty', () => {
      let srd = [{name: 'Tiger', type: 'animal'}];
      let merged = build.mergeLists(srd, []);
      expect(merged).to.be.an('array').that.has.lengthOf(1);
      expect(merged).to.deep.equal(srd);
    });

    it('returns the content of the edit list if the srd list is empty', () => {
      let edit = [{name: 'Tiger', type: 'animal'}];
      let merged = build.mergeLists([], edit);
      expect(merged).to.be.an('array').that.has.lengthOf(1);
      expect(merged).to.deep.equal(edit);

    });

    it('builds monsters from both the srd and the edit monster', () => {
      let srd = [
        {name: 'Gray Ooze', type: 'ooze'},
        {name: 'Tiger', type: 'Animal'}, 
      ];
      let edit = [
        {name: 'Flesh Golem', type: 'construct'},
        {name: 'Tiger', type: 'animal'}, 
      ];
      let expected = [
        {name: 'Flesh Golem', type: 'construct'},
        {name: 'Gray Ooze', type: 'ooze'},
        {name: 'Tiger', type: 'animal'}, 
      ];
      let merged = build.mergeLists(srd, edit);
      expect(merged).to.deep.equal(expected);
    });

    it('sorts the resulting array in alphabetical order of names', () => {
      let srd = [
        {name: 'Tiger', type: 'Animal'}, 
        {name: 'Gray Ooze', type: 'ooze'},
      ];
      let edit = [
        {name: 'Tiger', type: 'animal'}, 
        {name: 'Flesh Golem', type: 'construct'},
      ];
      let expected = [
        {name: 'Flesh Golem', type: 'construct'},
        {name: 'Gray Ooze', type: 'ooze'},
        {name: 'Tiger', type: 'animal'}, 
      ];
      let merged = build.mergeLists(srd, edit);
      expect(merged).to.deep.equal(expected);
    });
  });
});