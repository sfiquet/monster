/* jshint node: true */
'use strict';

exports.title = title;
exports.rankedTitle = rankedTitle;
exports.link = link;
exports.magic = magic;
exports.format = format;
exports.eq = eq;
exports.and = and;

// eq
// compare two values
function eq(v1, v2) {
	return v1 === v2;
}

// and
// logical and
function and(v1, v2) {
	return v1 && v2;
}

/**
 * rankedTitle
 * wrap a text in <span> tags with styling class
 */
function rankedTitle(text, rank) {
	return `<span class="title-${rank}">${text}</span>`;
}

/**
 * title
 * make a text into a main title (level 1)
 */
function title(text) {
	return rankedTitle(text, 1);
}

/**
 * link
 * transform text into link
 */
function link(text, url) {
	return '<a href="' + url + '">' + text + '</a>';
}

/**
 * magic
 * mark text as magic (with <span> tags and CSS class)
 */
function magic(text) {
	return `<span class="magic">${text}</span>`;
}

/**
 * format
 * format chunk object appropriately using the link, magic and title functions
 */
function format(context) {
	var res;
	if (context.url){
		res = link(context.text, context.url);
	} else {
		res = context.text;
	}
	if (context.isMagic){
		res = magic(res);
	}
	if (context.titleLevel){
		res = rankedTitle(res, context.titleLevel);
	}
	return res;
}