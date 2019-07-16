// calculations
// **************
// How to use:
// There are 2 ways to use.
// Either create a Sum object with no parameter and then add function components with setComponent.
// Or create a Sum object with an object parameter and then add method components with setComponent.
// The methods must be methods of the object associated with the Sum object.
// Currently there is no way to mix and match functions and methods or methods from several objects.


"use strict";

function Sum (obj) {
	this.that = obj;
	this.components = {};
}

// set the function and its arguments (as passed to apply())
// argsArray can be null
Sum.prototype.setComponent = function(key, func, argsArray) {
	if (!this.components[key]){
		this.components[key] = {};
	}
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
Sum.prototype.getComponent = function(key) {
	return this.components[key];
};

Sum.prototype.removeComponent = function(key) {
	delete this.components[key];
};

// calls each component function with its arguments and adds the results together
Sum.prototype.calculate = function() {
	var result = 0, 
		key;

	for (key in this.components) {

		if (Object.prototype.hasOwnProperty.call(this.components, key) && 
			typeof this.components[key] !== 'function') {
			
			result += this.components[key].func.apply(this.that, 
							this.components[key].argsArray);
		}
	}
	
	return result;
};

// calculates the difference between the expected total and the result of the calculation
// this is used to identify missing components
Sum.prototype.calculateDiscrepancy = function(expectedTotal){
	return expectedTotal - this.calculate();
};

module.exports = Sum;
