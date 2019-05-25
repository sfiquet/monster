const assert = require('assert').strict;
const template = require('./template');
const capitalize = require('underscore.string/capitalize');

exports.format = (error) => {
  assert.ok(Error.prototype.isPrototypeOf(error));

  if (error.name === 'IncompatibleTemplateError'){
    return formatIncompatibleTemplateError(error);
  }
  return error.message;
};

const formatIncompatibleTemplateError = (error) => {
  assert.ok(Error.prototype.isPrototypeOf(error));
  assert.equal(error.name, 'IncompatibleTemplateError');
  assert.equal(typeof error.template, 'string');
  assert.ok(Array.isArray(error.history));

  let message = template.getErrorMessage(error.template);
  assert.ok(message); // fail if it can't find the template's error message - that shouldn't happen

  if (error.history.length > 0){
    message += ' — Templates applied before failure:';
    message += error.history.reduce((msg, curr, id) => msg + `${(id === 0 ? '' : ',')} ${capitalize(curr.name)} (x${curr.count})`, '');
  }
  return message;
};