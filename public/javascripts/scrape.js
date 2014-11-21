// dependencies
var request = require('request');
var cheerio = require('cheerio');
var url = require('url');

function onError(error) {
	console.log("Error: " + error);
};

// input: array of monsters (name, url) as defined in monster index
// Each monster url has this format: page.html#monsterid (fragment is optional)
// output: array of monster pages (url, array of hashes)
function consolidate(monsters) {
	var pages = [];
	var maxPages = 0;
	var length = monsters.length;
	if (length === 0)
		return pages;
	
	// monsters are grouped by category in the index
	// all monster in a category are in a single page
	var urlPrev;
	
	for (i = 0; i < length; i++) {
		var urlParts = monsters[i].url.split('#');
		var urlCurr = urlParts[0];
		if (urlCurr !== urlPrev) {
			pages[maxPages++] = new MonsterPage(urlCurr);
			urlPrev = urlCurr;
		}
		if (urlParts.length > 1) {
			pages[maxPages-1].addHash(urlParts[1]);
		}
	}
	return pages;
}

function onBestiaryLoaded(monsters) {
	console.log("Success");
	var length = monsters.length;
	for (var i = 0; i < length; i++)
		console.log(monsters[i].name + ' - ' + monsters[i].url);
	
	var Pages = consolidate(monsters);
};

function bestiary(indexUrl, onsuccess, onerror) {
	request(indexUrl, function (err, resp, body) {
		if (err)
			return onerror(err);
		var $ = cheerio.load(body);
		var monsters = [];
		$('#monster-index-wrapper li a').each(function(index, element){
			if ($(this).text()) {
				monsters.push({name: $(this).text(), 
								url: $(this).attr('href')});
			}
			else {
				console.log('No monster: ' + $(this).html());
			}
		});
		return onsuccess(monsters);
	});
};

function onAllMonstersLoaded() {
	console.log("Monsters loaded");
};

function MonsterPage(url) {
	if (!(this instanceof MonsterPage)) {
		return new MonsterPage(url, hashes);
	}
	this.url = url;			// url of monster page
	this.hashes = [];	// # identifiers to be found on page
}

MonsterPage.prototype.addHash = function(hash) {
	var len = this.hashes.length;
	this.hashes[len] = hash;
};

// input: list of monster urls
// output: list of Monsters (JSON or object?)
function getAllMonsters(pages, onsuccess, onerror) {
	var maxPages = pages.length;
	var pending = maxPages;
	var result = [];
	for (var i = 0; i < maxPages; i++) {
		request(pages[i].url, function (err, resp, body) {
			if (err)
				return onerror(err);
			var $ = cheerio.load(body);
			var maxHashes = pages[i].hashes.length;
			for (var j = 0; j < maxHashes; j++) {
				var myMonster = new Object();
				var selector = 'div.body-content div.body h1 #' + pages[i].hashes[j];
				myMonster["name"] = $(selector).text();
				$(selector).nextUntil('h1 #').each(function () {
					if ($(this).text().find("XP")) {
						
					}
					
				});
			}
		});
	}
};

// Bestiary 1
bestiary('http://paizo.com/pathfinderRPG/prd/monsters/monsterIndex.html', 
			onBestiaryLoaded, onError);
						
getAllMonsters(['http://paizo.com/pathfinderRPG/prd/monsters/aasimar.html#aasimar'],
				onAllMonstersLoaded, onError);