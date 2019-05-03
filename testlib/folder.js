const fs = require('fs');
const path = require('path');

function emptyFolder(dirPath){
  let files;
  try {
    files = fs.readdirSync(dirPath);
  } catch(err) {
    console.error(`Error reading content of ${dirPath}`);
    throw err;
  }

  for (const file of files) {
    let stat = fs.lstatSync(path.join(dirPath, file));
    
    if (stat.isDirectory()){
      deleteFolder(path.join(dirPath, file));

    } else {
      try {
        fs.unlinkSync(path.join(dirPath, file));
      } catch(err){
        console.error(`Error deleting file ${path.join(dirPath, file)}`);
        throw err;
      }
    }
  }
}

function deleteFolder(dirPath){
  if (!fs.existsSync(dirPath)) return;

  emptyFolder(dirPath);

  try {
    fs.rmdirSync(dirPath);
  } catch(err){
    console.error(`Error removing directory ${dirPath}`);
    throw(err);
  }
}

exports.deleteFolder = deleteFolder;
exports.emptyFolder = emptyFolder;