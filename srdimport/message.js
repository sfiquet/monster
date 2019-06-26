'use strict';

const assert = require('assert').strict;
const log = require('./log');

// stores the logKey separately from the arguments so we can access it easily
function Message(){
	this.logKey = '';
	this.params = [];
}

Message.prototype.toString = function(){
	var args = [].concat(this.logKey, this.params);
	return log.buildMessageFromKey.apply(null, args);
};

// creates a new message
// variable number of parameters
function createMessage(key){
	var obj;

	obj =  Object.create(Message.prototype);
	obj.logKey = key;

	// make the job of identifying undefined keys easier
	assert.ok(log.isValidKey(key), `Invalid message key: ${key}`);

	obj.params = Array.prototype.slice.call(arguments, 1);

	return obj;
}

exports.createMessage = createMessage;