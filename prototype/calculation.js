// calculations
"use strict"
var CALCULATION = {};

CALCULATION.Sum = function(obj) {
	this.that = obj;
	this.components = {};
};

// set the function and its arguments (as passed to apply())
// argsArray can be null
CALCULATION.Sum.prototype.setComponent = function(key, func, argsArray) {
	this.components[key].func = func;
	
	if (arguments.length >= 3) {
		this.components[key].argsArray = argsArray;
	} else {
		// needs to be done in case we are overwriting a previous function
		this.components[key].argsArray = null;
	}
};

// returns a component object with the following properties:
// - func: component function
// - argsArray: array containing arguments for the function (as passed to apply())
// returns undefined if the key is not found
CALCULATION.Sum.prototype.getComponent = function(key) {
	return this.components[key];
};

CALCULATION.Sum.prototype.removeComponent = function(key) {
	delete this.component[key];
};

// calls each component function with its arguments and adds the results together
CALCULATION.Sum.prototype.calculate = function() {
	var result = 0, 
		key;

	for (key in this.components) {

		if (this.components.hasOwnProperty(key) && 
			typeof this.components[key] !== 'function') {
			
			result += this.components[key].func.apply(this.that, 
							this.components[key].argsArray);
		}
	}
	
	return result;
};

// calculates the difference between the expected total and the result of the calculation
// this is used to identify missing components
CALCULATION.Sum.prototype.calculateDiscrepancy = function(expectedTotal){
	return expectedTotal - this.calculate();
};
