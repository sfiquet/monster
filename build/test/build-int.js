const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;
const folder = require('../../testlib/folder');
const build = require('../build');

describe('Integration: Build', () => {

  describe('getSourceObjects', () => {
    
    it('expects a string argument that represents the path of the input folder', () => {
      expect(build.getSourceObjects()).to.be.undefined;
      expect(build.getSourceObjects('')).to.be.undefined;
    });
    
    it('returns an empty array if the folder doesn\'t exist', () => {
      let data = build.getSourceObjects('nofolder');
      expect(data).to.be.an('array');
      expect(data).to.be.empty;
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

    it('skips monster files that are present in the local ignore list', () => {
      let localIgnoreList = ["Flesh Golem.json"];
      let data = build.getSourceObjects(path.resolve('test/testdata/getSourceObjects/valid'), [], localIgnoreList);
      expect(data).to.be.an('array');
      expect(data).to.have.lengthOf(1);
      expect(data[0].name).to.be.a('string');
      expect(data[0].name).to.equal('Gelatinous Cube');
    });

    it('skips monster files that match the general ignore list', () => {
      let ignoreList = [{name: "Flesh Golem", source: "PFRPG Bestiary"}];
      let data = build.getSourceObjects(path.resolve('test/testdata/getSourceObjects/valid'), ignoreList);
      expect(data).to.be.an('array').that.has.lengthOf(1);
      expect(data[0].name).to.equal('Gelatinous Cube');
    });

    it('doesn\'t skip monster files when the match is partial', () => {
      let ignoreList = [{name: "Flesh Golem", source: "PFRPG Bestiary 2"}];
      let data = build.getSourceObjects(path.resolve('test/testdata/getSourceObjects/valid'), ignoreList);
      expect(data).to.be.an('array').that.has.lengthOf(2);
      expect(data[0].name).to.equal('Flesh Golem');
      expect(data[1].name).to.equal('Gelatinous Cube');
    });
  });
  
  describe('buildData', () => {

    describe('Bad setup', () => {
      
      it('expects two non-empty string arguments', () => {
        expect(build.buildData()).to.equal(1);
        expect(build.buildData('')).to.equal(1);
        expect(build.buildData('', '')).to.equal(1);
        expect(build.buildData(path.resolve('test/testdata/update/input'), '')).to.equal(1);
        expect(build.buildData('', path.resolve('test/testdata/update/output'))).to.equal(1);
      });

      it('throws an error when input files cannot be read', () => {
        const file = path.resolve('test/testdata/permissions/input/srd/Worg.json');
        
        // set file permissions to write only
        // Note: this won't work on Windows - see Node.js documentation
        fs.chmodSync(file, 0o200);

        let errCaught = false;
        try {
          build.buildData(path.resolve('test/testdata/permissions/input'), path.resolve('test/testdata/permissions/output'));
        } catch(err) {
          errCaught = true;
        }
        
        // restore default permissions
        fs.chmodSync(file, 0o644);
        
        expect(errCaught).to.be.true;
      });

      it('throws an error when the output file cannot be produced', () => {
        const file = path.resolve('test/testdata/permissions/output/database.json');
        
        // set file permissions to read only
        fs.chmodSync(file, 0o444);

        let errCaught = false;
        try {
          build.buildData(path.resolve('test/testdata/permissions/input'), path.resolve('test/testdata/permissions/output'));
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
          build.buildData(path.resolve('test/testdata/badjson/input'), path.resolve('test/testdata/badjson/output'));
        } catch(err) {
          errCaught = true;
        }
        expect(errCaught).to.be.true;
      });
    })

    describe('Create output folder and database', () => {
      const testPath = 'test/testdata/create';
      let result;
      
      before(() => {
        folder.deleteFolder(path.resolve(testPath, 'output'));
        folder.deleteFolder(path.resolve(testPath, 'input/edit/archive'));
        fs.copyFileSync(
          path.resolve(testPath, 'input/edit/restore/Gelatinous Cube.json'), 
          path.resolve(testPath, 'input/edit/Gelatinous Cube.json'));
      });

      before(() => {
        result = build.buildData(path.resolve(testPath, 'input'), path.resolve(testPath, 'output'));
      });
      
      it('returns 0 if successful', () => {
        expect(result).to.equal(0);
      });

      it('creates the output folder', () => {
        expect(fs.existsSync(path.resolve(testPath, 'output'))).to.be.true;
      });
      
      it('creates the database.json file in the output folder' , () => {
        expect(fs.existsSync(path.resolve(testPath, 'output/database.json'))).to.be.true;
      });

      it('saves an array of monster objects coming from the given source folder in database.json', () => {
        let dataStr = fs.readFileSync(path.resolve(testPath, 'output/database.json'), {encoding: 'utf8'});
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

      it('creates new monsters by merging data from the srd and the edit folders', () => {
        let data = JSON.parse(fs.readFileSync(path.resolve(testPath, 'output/database.json'), {encoding: 'utf8'}));
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(2);
        expect(data[0].name).to.equal('Flesh Golem');
        expect(data[1].name).to.equal('Gelatinous Cube');
        // gelatinous cube has properties from both srd and edit files
        expect(data[1].type).to.equal('ooze');
        expect(data[1].specialCMD).to.deep.equal([{ "name": "trip", "cantFail": true }]);
      });

      it('archives edit files when successful', () => {
        const date = new Date();
        const dateStr = sprintf('%4d-%02d-%02d', date.getFullYear(), date.getMonth() + 1, date.getDate());

        expect(fs.existsSync(path.resolve(testPath, 'input/edit/archive'))).to.be.true;
        
        let files = fs.readdirSync(path.resolve(testPath, 'input/edit/archive'));
        files = files.filter(item => {
          if (!item.startsWith(dateStr)) {
            return false;
          }
          return fs.lstatSync(path.join(testPath, 'input/edit/archive', item)).isDirectory();
        });
        expect(files.length).to.equal(1);
        let folderName = files[0];
        
        expect(fs.existsSync(path.resolve(testPath, 'input/edit/archive', folderName, 'Gelatinous Cube.json'))).to.be.true;
      });

    });

    describe('Update existing database', () => {
      const testPath = 'test/testdata/update';
      let result;
      let data;

      // hooks
      before(() => {
        fs.copyFileSync(path.resolve(testPath, 'output/database/database.json'), 
          path.resolve(testPath, 'output/database.json'));
        
        result = build.buildData(path.resolve(testPath, 'input'), path.resolve(testPath, 'output'));
        data = JSON.parse(fs.readFileSync(path.resolve(testPath, 'output/database.json'), {encoding: 'utf8'}));
      });
      
      // tests
      it('adds the new monsters to the existing database', () => {
        expect(result).to.equal(0);
        expect(data).to.be.an('array').that.has.lengthOf(4);
        expect([ data[0].name, data[1].name, data[2].name, data[3].name ]).to.have.members(['Worg', 'Flesh Golem', 'Gelatinous Cube', 'Gelatinous Cube']);
      });
      
      it('ignores srd files for monsters that are already in the database', () => {
        expect(data[3].name).to.equal('Worg');
        expect(data[3].size).to.equal('Medium'); // 'Large' in srd file
      });

      it('adds monsters that have the same name as a database monster with a different source', () => {
        expect(data[1].name).to.equal('Gelatinous Cube');
        expect(data[1].source).to.equal('PFRPG Bestiary');
        expect(data[1].size).to.equal('Large');
        expect(data[2].name).to.equal('Gelatinous Cube');
        expect(data[2].source).to.equal('PFRPG Bestiary 2');
        expect(data[2].size).to.equal('Small');
      });

    });

    describe('Ignore automatically generated monsters', () => {
      const testPath = 'test/testdata/ignore';
      let result;
      let data;
      
      before(() => {
        folder.deleteFolder(path.resolve(testPath, 'output'));
        folder.deleteFolder(path.resolve(testPath, 'input/edit/archive'));
        fs.copyFileSync(
          path.resolve(testPath, 'input/edit/restore/Monster 3.json'), 
          path.resolve(testPath, 'input/edit/Monster 3.json'));

        result = build.buildData(path.resolve(testPath, 'input'), path.resolve(testPath, 'output'));
        data = JSON.parse(fs.readFileSync(path.resolve(testPath, 'output/database.json'), {encoding: 'utf8'}));
      });
      
      it('ignores monsters from the srd directory when they are listed in the ignore file', () => {
        expect(result).to.equal(0);
        expect(data).to.be.an('array').that.has.lengthOf(2);
        expect(data[0].name).to.equal('Monster 1');
        expect(data[1].name).to.equal('Monster 3');
        expect(data[1].type).to.be.undefined;
      });
      
      it('imports monsters from the edit directory even if they are listed in the ignore file', () => {
        expect(data[1]).to.deep.equal({name: "Monster 3", CR: 3});
      });
    });
  });
});
