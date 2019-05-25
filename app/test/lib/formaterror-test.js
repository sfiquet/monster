const expect = require('chai').expect;
const formatError = require('../../lib/formaterror');

describe('FormatError', () => {

  describe('IncompatibleTemplateError', () => {

    it('throws an assertion error if the template property is not a string', () => {
      let error = new Error('monster incompatible with template');
      error.name = 'IncompatibleTemplateError';
      error.template = undefined;
      expect(() => {formatError.format(error)}).to.throw();
    });

    it('throws an assertion error if the template property is not a valid template with an error message', () => {
      let error = new Error('monster incompatible with template');
      error.name = 'IncompatibleTemplateError';
      error.template = 'garbage';
      expect(() => {formatError.format(error)}).to.throw();
    });

    it('throws an assertion error if the history property is not an array', () => {
      let error = new Error('monster incompatible with template');
      error.name = 'IncompatibleTemplateError';
      error.template = 'giant';
      error.history = undefined;
      expect(() => {formatError.format(error)}).to.throw();
    });

    it('returns the template\'s error message when there is no history', () => {
      let error = new Error('monster incompatible with template');
      error.name = 'IncompatibleTemplateError';
      error.template = 'giant';
      error.history = [];
      let message = formatError.format(error);
      expect(message).to.equal('Cannot apply the Giant template on a Colossal creature');

      error.template = 'young';
      message = formatError.format(error);
      expect(message).to.equal('Cannot apply the Young template when the creature matches any of the following conditions: Barghest, Dragon, Fine size, 1/8 CR');
    });

    it('adds the details when history is present', () => {
      let error = new Error('monster incompatible with template');
      error.name = 'IncompatibleTemplateError';
      error.template = 'giant';
      error.history = [{name: 'advanced', count: 2}, {name: 'giant', count: 1}];
      let message = formatError.format(error);
      expect(message).to.equal('Cannot apply the Giant template on a Colossal creature — Templates applied before failure: Advanced (x2), Giant (x1)');
    });

  });

  describe('Other Errors', () => {
    // no other error is currently formatted
    it('returns the error message', () => {
      let error = new Error('monster incompatible with template');
      let message = formatError.format(error);
      expect(message).to.equal('monster incompatible with template');
    });
  });
});