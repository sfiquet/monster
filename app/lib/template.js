const templates = {
  advanced: require('./advanced'),
  giant: require('./giant'),
  young: require('./young'),
};

exports.isCompatible = (template, monster) => {
  if (!templates[template]){ 
    return;
  }

  return templates[template].isCompatible(monster);
};

exports.apply = (template, monster) => {
  if (!templates[template]){ 
    return;
  }

  return templates[template].apply(monster);
};

exports.getErrorMessage = (template) => {
  if (!templates[template]){ 
    return;
  }

  return templates[template].getErrorMessage();
};

exports.getAllTemplateNames = () => Object.keys(templates);

exports.getTemplateModule = template => templates[template];

exports.getTemplateFunction = (template, functionName) => templates[template] ? templates[template][functionName] : undefined;