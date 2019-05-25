const template = require('./template');

// From Eric Elliott's blog - could use lodash FP or Ramda in the future
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

/*
Blueprint factory

Input:  optDict: options key-value dictionary
        key: template name, value: number of applications
        e.g. {advanced: 2, giant: 1}

Output: a new blueprint object

Properties:
- templates: array of template objects, one per template application
  {name, func} where name is the name of the template and func is a reference
  to the template's apply function to be used as input to pipe()
  e.g. [
    {name: 'advanced', func: <advanced.apply>}, 
    {name: 'advanced', func: <advanced.apply>}, 
    {name: 'giant'}, func: <giant.apply>}
  ]

Methods:
- reshape: applies all the templates one after the other
    input: a monster object
    output: a result object with two properties, error and newMonster, one of which is null
*/
const createBlueprint = (optDict = {}) => ({
  
  templates: Object.keys(optDict).reduce((acc, key) => {
    for (let i = 0; i < optDict[key]; i++) {
      acc = acc.concat({name: key, func: template.getTemplateFunction(key, 'apply')});
    }
    return acc;
  }, []),

  reshape(monster) {
    let failAt = [];
    const trace = id => monster => {
      if (monster === null){
        failAt.push(id);
      }
      return monster;
    };

    const actions = this.templates.reduce((acc, item, id) => {
      return acc.concat([item.func, trace(id)]);
    }, []);

    const newMonster = pipe(...actions)(monster);
    let error = null;
    if (newMonster === null){
      error = new Error('monster incompatible with template');
      error.name = 'IncompatibleTemplateError';
      let failedAt = failAt[0];
      error.template = this.templates[failedAt].name;
      error.history = this.templates
        .slice(0, failedAt)
        .reduce((acc, item) => {
          if (acc.length === 0 || acc[acc.length-1].name !== item.name){
            acc.push({name: item.name, count: 1});
          } else {
            acc[acc.length-1].count += 1;
          }
          return acc;
        }, []);
    }
    return { error, newMonster };
  },
});

module.exports = {
  createBlueprint,
};
