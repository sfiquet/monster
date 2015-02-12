/* jshint node: true */
'use strict';

exports.title = function title(text) {
	return '<strong>' + text + '</strong>';
};

exports.link = function link(text, url) {
	return '<a href="' + url + '">' + text + '</a>';
};

exports.magic = function magic(text) {
	return '<em>' + text + '</em>';
};

