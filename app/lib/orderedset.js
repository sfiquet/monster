'use strict';

/* Ordered property set
 * Combines an associative array with an array of keys so that it's possible to
 * access the data directly by key or in a given order
 */

module.exports = OrderedSet;

/*
 * constructor
 * input: either of the following:
 * - none, for an empty ordered set
 * - an array of objects that all have a 'name' property, whose value becomes
 *   the key. Obviously all names should be different for this to work well.
 */

function OrderedSet() {

	this.order = [];
	this.set = {};

	var data = arguments[0];

	var order = [];
	var set = {};
	var i, key;

	if (data === undefined) {
		return;
	}

	if (!(data instanceof Array)) {
		console.log('OrderedObject constructor: parameter should be an array');
		console.log(data);
		return;
	}

	for (i = 0; i < data.length; i++) {
		if (!data[i].hasOwnProperty('name')) {
			console.log('OrderedObject constructor: All array items should have a "name" property');
			console.log(data);
			return;	// wrong format
		}

		key = data[i].name;
		order[i] = key;
		set[key] = data[i];
	}

	this.order = order;
	this.set = set;
}

/*
 * getKeys
 * return a list of the keys in order
 */
OrderedSet.prototype.getKeys = function(){
	// return a copy of the array
	return this.order.slice();
};

/*
 * getItemByKey
 * return the item identified by the key or undefined if not found
 */
OrderedSet.prototype.getItemByKey = function(key){
	return this.set[key];
};

/*
 * getItemByIndex
 * return the item identified by the index or undefined if out of bounds
 */
OrderedSet.prototype.getItemByIndex = function(index){
	var key = this.order[index];
	return this.set[key];
};
