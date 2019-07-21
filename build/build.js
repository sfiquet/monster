const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;

const WORK_DIR = 'work';
const OUTPUT_DIR = 'built';
const SRD_DIR = 'srd';
const EDIT_DIR = 'edit';
const OUTPUT_FILE = 'database.json';

function createDir(dirPath){
  if (fs.existsSync(dirPath)) return;

  try {
    fs.mkdirSync(dirPath);
  } catch(err){
    console.error(`Can't create directory ${dirPath}`);
    throw err;
  }
}

function getSourceObjects(inputDir) {
  if (!inputDir)
    return;

  if (!fs.existsSync(inputDir)){
    console.error(`Missing input directory: ${inputDir}`);
    throw new Error(`Missing input directory: ${inputDir}`);
  }

  let files;
  try {
    files = fs.readdirSync(inputDir);
  } catch(err) {
    console.error(`Error reading content of ${inputDir}`);
    throw err;
  }

  let monsters = [];
  for (const file of files) {

    if (path.extname(file) === '.json'){
      let monsterStr;
      let monsterObj;

      try {
        monsterStr = fs.readFileSync(path.join(inputDir, file), {encoding: 'utf8'});
      } catch(err){
        console.error(`Error while reading JSON file: ${err} - ${path.join(inputDir, file)}`);
        throw err;
      }

      try {
        monsterObj = JSON.parse(monsterStr);
      } catch(err) {
        console.error(`Error while parsing JSON file: ${err} - ${path.join(inputDir, file)}`);
        throw err;
      }

      // ensure this is really a monster object
      if (!monsterObj.name){
        console.error(`Missing name property in JSON file ${path.join(inputDir, file)}`);
        throw new Error(`Missing name property in JSON file ${path.join(inputDir, file)}`);
      }
      if (!monsterObj.source){
        console.error(`Missing source property in JSON file ${path.join(inputDir, file)}`);
        throw new Error(`Missing source property in JSON file ${path.join(inputDir, file)}`);
      }

      monsters.push(monsterObj);
    }
  }

  return monsters;
}

function merge(srdMonster, editMonster){
  let merged = JSON.parse(JSON.stringify(srdMonster));

  let keys = Object.keys(editMonster);
  keys.forEach(key => {
    merged[key] = editMonster[key];
  });

  return merged;
}

function compareMonsters(a, b) {
  if (a.name < b.name) {
    return -1;
  
  } else if (a.name > b.name){
    return 1;

  } else if (a.source < b.source) {
    return -1;
    
  } else if (a.source > b.source) {
    return 1;
  }
  
  return 0;
}

function mergeLists(srdMonsters, editMonsters) {
  if (!Array.isArray(srdMonsters) || !Array.isArray(editMonsters)) return;
  
  // Note: it is assumed that monsters have the same source
  let merged = editMonsters.map(monster => {
    let index = srdMonsters.findIndex(item => item.name === monster.name);
    
    if (index >= 0) {
      return merge(srdMonsters[index], monster);
    }
    return monster;
  });
  
  merged.sort(compareMonsters);

  return merged;
}

function buildBestiary(sourceDir){
  let srdMonsters = getSourceObjects(path.join(sourceDir, SRD_DIR));
  let editMonsters = getSourceObjects(path.join(sourceDir, EDIT_DIR));
  return mergeLists(srdMonsters, editMonsters);
}

function buildData(baseDir, bestiaries) {
  assert.ok(baseDir && typeof baseDir === 'string');
  assert.ok(bestiaries && Array.isArray(bestiaries));


  const workDir = path.join(baseDir, WORK_DIR);
  const outputDir = path.join(baseDir, OUTPUT_DIR);

  // get the data from the srd and edit subdirectories and merge them
  let allMonsters = bestiaries.reduce((monsters, bestiary) => {
    return monsters.concat(buildBestiary(path.join(workDir, bestiary)));
  }, []);

  allMonsters.sort(compareMonsters);

  // create output dir if necessary
  createDir(outputDir);

  // write to file
  try{
    fs.writeFileSync(path.join(outputDir, OUTPUT_FILE), JSON.stringify(allMonsters, null, 2));
  } catch(err) {
    console.error(`Error while saving data: ${err}`);
    throw err;
  }
  
  return 0; // success
}

// only run the module if run directly
if (require.main === module) {
  const DATAPATH = '../data';
  const BESTIARIES = ['bestiary1', 'bestiary2', 'bestiary3', 'bestiary4'];
  
  return buildData(DATAPATH, BESTIARIES);
}

exports.buildData = buildData;
exports.getSourceObjects = getSourceObjects;
exports.merge = merge;
exports.mergeLists = mergeLists;
