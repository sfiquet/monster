/* jshint node: true */
'use strict';

exports.title = title;
exports.link = link;
exports.magic = magic;
exports.format = format;

/**
 * title
 * wrap a text in <strong> tags
 */
function title(text) {
	return '<strong>' + text + '</strong>';
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
 * mark text as magic (with <em> tags)
 */
function magic(text) {
	return '<em>' + text + '</em>';
}

/**
 * format
 * format chunk object appropriately using the link and magic functions
 */
function format(context) {
	var res;
	if (context.url){
		res = link(context.text, context.url);
	} else {
		res = context.text;
	}
	if (context.magic){
		res = magic(res);
	}
	return res;
}