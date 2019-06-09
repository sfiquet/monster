const assert = require('assert').strict;
const Monster = require('../app/lib/monster');

function guessShape(monster){
  assert.ok(Monster.prototype.isPrototypeOf(monster));

  if (monster.compareSize('Medium') > 0 && monster.reach >= monster.space){
    return 'tall';
  }

  const tallTypes = [
    'fey',
    'humanoid',
    'monstrous humanoid',
    'outsider',
    'plant',
    'undead',
  ];
  if (tallTypes.includes(monster.type)){
    return 'tall';
  }

  if (monster.type === 'construct' && monster.name.toLowerCase().endsWith(' golem')){
    return 'tall';
  }

  return 'long';
}

exports.guessShape = guessShape;
