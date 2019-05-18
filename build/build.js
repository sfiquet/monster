const fs = require('fs');
const path = require('path');

const outputFile = 'database.json';

function createDir(dirPath){
  if (fs.existsSync(dirPath)) return;

  try {
    fs.mkdirSync(dirPath);
  } catch(err){
    console.error(`Can't create directory ${dirPath}`);
    throw err;
  }
}

function getSourceObjects(inputDir, generalIgnoreList, localIgnoreList) {
  if (!inputDir)
    return;

  if (!fs.existsSync(inputDir)){
    console.log(`Missing input directory: ${inputDir}`);
    return [];
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

    let include = false;
    if (path.extname(file) === '.json'){
      include = true;
      if (localIgnoreList && localIgnoreList.findIndex(item => item === file) >= 0){
        include = false;
      }
    }

    if (include) {
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

      if (generalIgnoreList && generalIgnoreList.findIndex(item => {
          return item.name === monsterObj.name && item.source === monsterObj.source;
        }) >= 0){
        
        include = false;
      }
      
      if (include){
        monsters.push(monsterObj);
      }
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

  let merged = srdMonsters.slice();
  
  editMonsters.forEach(monster => {
    let index = merged.findIndex(item => item.name === monster.name);
    
    if (index >= 0) {
      merged[index] = merge(merged[index], monster);

    } else {
      merged.push(monster);
    }
  });
  
  merged.sort(compareMonsters);

  return merged;
}

function getIgnoreList(dirPath) {
  let str;
  let data;

  try {
    str = fs.readFileSync(path.join(dirPath, 'ignore.json'));
  } catch(err){
    if (err.code !== 'ENOENT'){
      throw err;
    }
    return [];
  }

  try {
    data = JSON.parse(str);
  } catch(err){
    console.error(`Error while parsing ${path.join(dirPath, 'ignore.json')}`);
    throw err;
  }

  // check the format
  if (!Array.isArray(data)) {
    throw new Error('Wrong format in ignore file');
  }

  return data.map(item => {
    if (typeof item !== 'string'){
      throw new Error('Wrong format in ignore file');
    }
    return item.endsWith('.json') ? item : `${item}.json`;
  });
}

function buildData(sourceDir, outputDir) {
  if (!sourceDir || !outputDir){
    return 1;
  }

  // read the contents of the current database
  let allMonsters = [];
  let dataStr;
  try {
    dataStr = fs.readFileSync(path.join(outputDir, outputFile), {encoding: 'utf8'});
  } catch(err){
    if (err.code !== 'ENOENT'){
      throw err;
    }
  }

  if (dataStr){
    try {
      allMonsters = JSON.parse(dataStr);
    } catch(err) {
      console.error(`Error while parsing JSON database: ${err} - ${path.join(outputDir, outputFile)}`);
      throw err;
    }
  }

  // build an ignore list from the content of the database - we don't want to import those again
  let ignoreList = allMonsters.map(item => {
    return {name: item.name, source: item.source};
  });

  // get the data from the srd and edit subdirectories and merge them
  let configIgnoreList = getIgnoreList(path.resolve(sourceDir));
  let srdMonsters = getSourceObjects(path.join(sourceDir, 'srd'), ignoreList, configIgnoreList);
  let editMonsters = getSourceObjects(path.join(sourceDir, 'edit'), ignoreList);
  allMonsters = allMonsters.concat(mergeLists(srdMonsters, editMonsters));
  allMonsters.sort(compareMonsters);

  // create output dir if necessary
  createDir(outputDir);

  // write to file
  try{
    fs.writeFileSync(path.join(outputDir, outputFile), JSON.stringify(allMonsters, null, 2));
  } catch(err) {
    console.error(`Error while saving data: ${err}`);
    throw err;
  }
  
  return 0; // success
}

// only run the module if run directly
if (require.main === module) {

  let inputPath = process.argv.length > 2 ? process.argv[2] : '../data/work/bestiary1';
  let outputPath = process.argv.length > 3 ? process.argv[3] : '../data/built';

  return buildData(inputPath, outputPath);
}

exports.buildData = buildData;
exports.getSourceObjects = getSourceObjects;
exports.merge = merge;
exports.mergeLists = mergeLists;
