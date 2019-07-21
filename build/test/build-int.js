const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const folder = require('../../testlib/folder');
const build = require('../build');

describe('Integration: Build', () => {

  describe('getSourceObjects', () => {
    
    it('expects a string argument that represents the path of the input folder', () => {
      expect(build.getSourceObjects()).to.be.undefined;
      expect(build.getSourceObjects('')).to.be.undefined;
    });
    
    it('throws an error if the folder doesn\'t exist', () => {
      expect(() => build.getSourceObjects('nofolder')).to.throw();
    });
    
    it('throws an error if it cannot read the content of the folder', () => {
      let errCaught = false;
      try {
        // pass a file instead of a folder
        build.getSourceObjects(path.resolve('test/testdata/getSourceObjects/ignore/Flesh Golem.json'));
      } catch(err) {
        errCaught = true;
      }
      expect(errCaught).to.be.true;

    });
    
    it('throws an error if it cannot read a json file', () => {
      const file = path.resolve('test/testdata/getSourceObjects/writeonly/Worg.json');
      let errCaught = false;

      // set permissions to write only
      // Note: this won't work on Windows - see Node.js documentation
      fs.chmodSync(file, 0o200);
      
      try {
        build.getSourceObjects(file);
      } catch(err) {
        errCaught = true;
      }
      
      // restore default permissions
      fs.chmodSync(file, 0o644);

      expect(errCaught).to.be.true;
    });
    
    it('throws an error if the data read is not valid JSON', () => {
      let errCaught = false;
      try {
        build.getSourceObjects(path.resolve('test/testdata/getSourceObjects/badjson'));
      } catch(err) {
        errCaught = true;
      }
      expect(errCaught).to.be.true;
    });

    it('throws an error if the JSON data doesn\'t have the name property', function(){
      expect(() => build.getSourceObjects(path.resolve('test/testdata/getSourceObjects/wrongjson/noname'))).to.throw();
    });

    it('throws an error if the JSON data doesn\'t have the source property', function(){
      expect(() => build.getSourceObjects(path.resolve('test/testdata/getSourceObjects/wrongjson/nosource'))).to.throw();
    });
    
    it('ignores files without a .json extension and directories', () => {
      let data = build.getSourceObjects(path.resolve('test/testdata/getSourceObjects/ignore'));
      expect(data).to.be.an('array');
      expect(data).to.have.lengthOf(1);
      expect(data[0].name).to.be.a('string');
      expect(data[0].name).to.equal('Flesh Golem');
    });
    
    it('returns an array containing all the monsters from the input folder', () => {
      let data = build.getSourceObjects(path.resolve('test/testdata/getSourceObjects/valid'));
      expect(data).to.be.an('array');
      expect(data).to.have.lengthOf(2);
      expect(data[0].name).to.be.a('string');
      expect(data[1].name).to.be.a('string');
      expect([data[0].name, data[1].name]).to.have.members(['Flesh Golem', 'Gelatinous Cube']);
    });
  });
  
  describe('buildData', () => {

    describe('Invalid parameters', () => {
      it('throws an error when called with no parameters', () => {
        expect(() => build.buildData()).to.throw();
      });

      it('throws an error when called with one parameter', () => {
        expect(() => build.buildData(path.resolve('test/testdata'))).to.throw();
      });

      it('throws an error when the parameters have wrong types', () => {
        expect(() => build.buildData(path.resolve('test/testdata', {}))).to.throw();
        expect(() => build.buildData([], {})).to.throw();
        expect(() => build.buildData(13, ['bestiary1'])).to.throw();
      });
    });

    
    describe('Bad input data', () => {
      it('throws an error when the data folder doesn\'t exist', () => {
        expect(() => build.buildData(path.resolve('test/testdata/nope'), ['bestiary1'])).to.throw();
      });

      it('throws an error when an edit folder is missing', () => {
        expect(() => build.buildData(path.resolve('test/testdata/noedit'), ['bestiary1'])).to.throw();
      });

      it('throws an error when a srd folder is missing', () => {
        expect(() => build.buildData(path.resolve('test/testdata/nosrd'), ['bestiary1'])).to.throw();
      });

      it('throws an error when input files cannot be read', () => {
        const file = path.resolve('test/testdata/permissions/work/bestiary/srd/Worg.json');
        
        // set file permissions to write only
        // Note: this won't work on Windows - see Node.js documentation
        fs.chmodSync(file, 0o200);

        let errCaught = false;
        try {
          build.buildData(path.resolve('test/testdata/permissions'), ['bestiary']);
        } catch(err) {
          errCaught = true;
        }
        
        // restore default permissions
        fs.chmodSync(file, 0o644);
        
        expect(errCaught).to.be.true;
      });

      it('throws an error when the output file cannot be produced', () => {
        const file = path.resolve('test/testdata/permissions/built/database.json');
        
        // set file permissions to read only
        fs.chmodSync(file, 0o444);

        let errCaught = false;
        try {
          build.buildData(path.resolve('test/testdata/permissions'), ['bestiary']);
        } catch(err) {
          errCaught = true;
        }
        
        // restore default permissions
        fs.chmodSync(file, 0o644);
        
        expect(errCaught).to.be.true;
      });

      it('throws an error when an input file is not valid JSON', () => {
        let errCaught = false;
        try {
          build.buildData(path.resolve('test/testdata/badjson'), ['bestiary']);
        } catch(err) {
          errCaught = true;
        }
        expect(errCaught).to.be.true;
      });
    });


    describe('Create output folder and database', () => {
      const testPath = 'test/testdata/create';
      let result;
      
      before(() => {
        folder.deleteFolder(path.resolve(testPath, 'built'));

        result = build.buildData(path.resolve(testPath), ['bestiary1', 'bestiary2']);
      });
      
      it('returns 0 if successful', () => {
        expect(result).to.equal(0);
      });

      it('creates the output folder', () => {
        expect(fs.existsSync(path.resolve(testPath, 'built'))).to.be.true;
      });
      
      it('creates the database.json file in the output folder' , () => {
        expect(fs.existsSync(path.resolve(testPath, 'built/database.json'))).to.be.true;
      });

      it('saves an array of monster objects coming from the given source folders in database.json', () => {
        let dataStr = fs.readFileSync(path.resolve(testPath, 'built/database.json'), {encoding: 'utf8'});
        expect(dataStr).to.be.a('string');
        let errCaught = false;
        let array;
        try {
          array = JSON.parse(dataStr);
        } catch(err) {
          errCaught = true;
        }
        expect(errCaught).to.be.false;
        expect(array).to.be.an('array');
        expect(array).to.have.lengthOf(2);
      });

      it('creates new monsters from the edit folders by merging data from the srd and the edit folders for each bestiary', () => {
        let data = JSON.parse(fs.readFileSync(path.resolve(testPath, 'built/database.json'), {encoding: 'utf8'}));
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(2);
        expect(data[0].name).to.equal('Gelatinous Cube');
        // gelatinous cube has properties from both srd and edit files
        expect(data[0].type).to.equal('ooze');
        expect(data[0].specialCMD).to.deep.equal([{ "name": "trip", "cantFail": true }]);
        // giant bee doesn't have a srd file so comes fully from the edit file
        expect(data[1].name).to.equal('Giant Bee');
        // flesh golem doesn't have an edit file so is not included
      });
    });

    describe('Update overwrites the whole database', () => {

      it('produces the same result with the same input', () => {
        const testPath = 'test/testdata/update/repeat';

        expect(build.buildData(path.resolve(testPath), ['bestiary'])).to.equal(0);
        let data1 = JSON.parse(fs.readFileSync(path.resolve(testPath, 'built/database.json'), {encoding: 'utf8'}));
        expect(data1).to.be.an('array');

        expect(build.buildData(path.resolve(testPath), ['bestiary'])).to.equal(0);
        let data2 = JSON.parse(fs.readFileSync(path.resolve(testPath, 'built/database.json'), {encoding: 'utf8'}));
        expect(data2).to.be.an('array');

        expect(data2).to.deep.equal(data1);
      });

      it('doesn\'t keep previous monsters that are not in the input files', () => {
        const testPath = 'test/testdata/update/remove';

        fs.copyFileSync(path.resolve(testPath, 'built/database/database.json'), 
          path.resolve(testPath, 'built/database.json'));

        let data1 = JSON.parse(fs.readFileSync(path.resolve(testPath, 'built/database.json'), {encoding: 'utf8'}));
        expect(data1).to.be.an('array');
        expect(data1).to.have.lengthOf(1);
        expect(data1[0].name).to.equal('Giant Bee');

        expect(build.buildData(path.resolve(testPath), ['bestiary'])).to.equal(0);

        let data2 = JSON.parse(fs.readFileSync(path.resolve(testPath, 'built/database.json'), {encoding: 'utf8'}));
        expect(data2).to.be.an('array');
        expect(data2).to.have.lengthOf(1);
        expect(data2[0].name).to.equal('Gelatinous Cube');
      });

      it('overwrites previous data', () => {
        const testPath = 'test/testdata/update/overwrite';

        fs.copyFileSync(path.resolve(testPath, 'built/database/database.json'), 
          path.resolve(testPath, 'built/database.json'));

        let data1 = JSON.parse(fs.readFileSync(path.resolve(testPath, 'built/database.json'), {encoding: 'utf8'}));
        expect(data1).to.be.an('array');
        expect(data1).to.have.lengthOf(1);
        expect(data1[0].name).to.equal('Gelatinous Cube');
        expect(data1[0].shape).to.equal('long');
        expect(data1[0].CR).to.equal(3);

        expect(build.buildData(path.resolve(testPath), ['bestiary'])).to.equal(0);

        let data2 = JSON.parse(fs.readFileSync(path.resolve(testPath, 'built/database.json'), {encoding: 'utf8'}));
        expect(data2).to.be.an('array');
        expect(data2).to.have.lengthOf(1);
        expect(data2[0].name).to.equal('Gelatinous Cube');
        expect(data2[0].shape).to.equal('tall'); // from srd
        expect(data2[0].CR).to.equal(4); // from edit
      });
    });
  });
});

