// dependencies
var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");
var path = require("path");
var url = require("url");

function onError(error) {
	console.log(error);
}

function onSuccess() {
	console.log("Success");
}

// copied from MDN
// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// input: array of monster urls obtained from the monster index webpage
// Each monster url has this format: page.html#monsterid (fragment is optional)
// output: Set of unique monster urls without fragment
/*
function buildFileList(monsters) {
	var length = monsters.length;
	
	for (i = 0; i < length; i++) {
		var urlParts = monsters[i].split('#');
		uniquePages.add(urlParts[0]);
	}
	return uniquePages;
}
*/

// input: content of monster index page (HTML)
// output: Set of unique monsters url
function buildFileList(indexHtml) {
	var $ = cheerio.load(indexHtml);
	var uniquePages = [];
	var currPage;
	var prevPage;
//	console.log('Unique URLs:');
	$('#monster-index-wrapper li a').each(function(index, element){
		if ($(this).text()) {
			// remove fragment from url
			var urlParts = $(this).attr('href').split('#');
			currPage = urlParts[0];
			if (currPage !== prevPage) {
				uniquePages.push(path.basename(currPage));
				prevPage = currPage;
//				console.log('size: ' + uniquePages.length + ' added: ' + currPage);
			}
		}
		else {
			console.log('No monster: ' + $(this).html());
		}
	});
	return uniquePages;
}

function getHtmlFiles(indexUrl, destFolder, onsuccess, onerror) {
	// asynchronous : get the monster index page
	request(indexUrl, function (err, resp, body) {
		// when that's done we build a list of monster urls
		// and request the first one asynchronously
		var uniqueMonsters;
		var len;
		var i;
		var monsterUrl;
		var pending;
		
		if (err)
			return onerror(err);
			
		uniqueMonsters = buildFileList(body);
		len = uniqueMonsters.length;
		pending = len;
		
		// async recursive function
		function getNextHtmlFile(i) {
			if (i >= len) {
				return; // finished
			}
			
			monsterUrl = uniqueMonsters[i];
			request(url.resolve(indexUrl, monsterUrl), function(err, resp, body) {
				var filePath;
				var stop = false; // for debug
				
				if (err)
					return onerror(err);
					
				console.log(monsterUrl);
				filePath = path.join('./html', destFolder, monsterUrl);
				console.log(filePath);
				
				// write the file asynchronously
				fs.writeFile(filePath, body, function(err) {
					pending -= 1;
					if (err) {
						stop = true;
						return onerror(err);
					}
					
					// very last file: the task is finished successfully
					if (pending === 0) {
						return onsuccess();
					}
				});
				
				// debug
				if (stop) {
					return;
				}
				
				// put the next call on the event queue with a waiting time of 1-3 seconds
				// to avoid pounding the server too hard
				setTimeout(getNextHtmlFile(i+1), getRandomInt(1000, 3001));
			});
		}
		
		getNextHtmlFile(0);
		
	});
}

// argument: value between 1 and 4 (including)
// 1 for first bestiary, 2 for second bestiary and so on
function main() {
	var indexPath = [
			'http://paizo.com/pathfinderRPG/prd/monsters/monsterIndex.html',
			'http://paizo.com/pathfinderRPG/prd/additionalMonsters/additionalMonsterIndex.html',
			'http://paizo.com/pathfinderRPG/prd/bestiary3/monsterIndex.html',
			'http://paizo.com/pathfinderRPG/prd/bestiary4/monsterIndex.html'
		],
		destFolder = 'bestiary',
		id 		  = 0;
	
	if (process.argv.length > 2) {
		id = process.argv[2] - 1;
	}
	destFolder = destFolder + " " + (id + 1);
	console.log("destFolder: " + destFolder);

	getHtmlFiles(indexPath[id], destFolder, onSuccess, onError);
}

main();