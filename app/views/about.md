# About This Site
This site is a monster advancement application for the first edition of Pathfinder. 

As the application is entirely based on Open Game License (OGL) content, this page aims to show the rules used and provide links to the relevant pages of the [Pathfinder Reference Document (PRD)](http://legacy.aonprd.com).

## Monsters

The monsters currently supported by the application come from the [Bestiary](http://legacy.aonprd.com/bestiary/monsterIndex.html):

- [Black pudding](http://legacy.aonprd.com/bestiary/blackPudding.html#black-pudding)
- [Gelatinous Cube](http://legacy.aonprd.com/bestiary/gelatinousCube.html#gelatinous-cube)
- [Gray Ooze](http://legacy.aonprd.com/bestiary/grayOoze.html#gray-ooze)
- [Ochre Jelly](http://legacy.aonprd.com/bestiary/ochreJelly.html#ochre-jelly)
- [Wight](http://legacy.aonprd.com/bestiary/wight.html#wight)

More will be added as the application is developed.

## Calculation Rules
In order to apply templates only core data is stored. Everything else is calculated by applying generic rules from the Core Rulebook and monster-specific rules from the Bestiaries.

### Core Stats
These stats are constant values used to calculate everything else. Some of the stats can be changed by templates, triggering recalculations. The stats can be classed into two groups: Stats present in the original data and stats deduced from the original data.

#### Original Stats
The following stats are directly extracted from the original data:
- Name
- CR
- Alignment
- Size
- Type
- Senses
- Natural Armor
- Racial HD
- Defensive Abilities/DR/Immune/Resist/SR
- Weaknesses
- Speed
- Melee attacks
- Space
- Reach
- Special attacks
- Ability scores: Str, Dex, Con, Wis, Int, Cha
- Feat list
- Skill list, with racial bonuses
- Languages
- SQ
- Environment
- Organisation
- Treasure
- Special Abilities list

#### Deduced Stats
The following stats are interpolated from the original data and then stored in the database as core stats:
- Base Fort
- Base Will
- Base Ref
- Skill ranks

The base saves are calculated by subtracting the appropriate modifiers from the source monster's save.

Skills ranks are calculated in a similar manner, taking into account whether the skill is a class skill.

#### Additional Stats for Templating

- Shape: tall / long - This characteristic is not explicitly listed in the bestiaries but it is needed to calculate reach when a template changes the size (see the rules used by templates below)

- Space Offset - represents the number of steps between the actual size of the creature and the typical size for its space: e.g. Quickwood is Huge and should have a space of 15 ft but has an actual space of 5 ft, which is 2 sizes down. Its Space Offset is therefore `-2`. This is used by templates that affect size to change the space in steps that make sense.

### Calculated Stats
Everything that isn't listed above is calculated.
- XP: [Table 1-7 in Bestiary, Monster Creation](http://legacy.aonprd.com/bestiary/monsterCreation.html#table-1-7-xp-and-gp-values-by-cr)
- Init: [Core Rulebook, Combat](http://legacy.aonprd.com/coreRulebook/combat.html#initiative)
- Perception: see Skills
- AC: [Core Rulebook, Combat](http://legacy.aonprd.com/coreRulebook/combat.html#armor-class)
- touch AC: [Core Rulebook, Combat](http://legacy.aonprd.com/coreRulebook/combat.html#touch-attacks)
- Flat-footed AC: [Core Rulebook, Combat](http://legacy.aonprd.com/coreRulebook/combat.html#flat-footed)
- Hit Dice
    - Definition: [Core Rulebook, Getting Started](http://legacy.aonprd.com/coreRulebook/gettingStarted.html#hit-dice)
    - Hit Die by creature type: [Table 1-4 in Bestiary, Monster Creation](http://legacy.aonprd.com/bestiary/monsterCreation.html#table-1-4-creature-statistics-by-type)
    - HP modifier: 
        - normal case: HD * Con mod: [Core Rulebook, Getting Started](http://legacy.aonprd.com/coreRulebook/gettingStarted.html#constitution)
        - undead: HD * Cha mod: [Bestiary, Creature Types, Undead](http://legacy.aonprd.com/bestiary/creatureTypes.html#undead)
        - construct: Bonus Hit Point table from [Bestiary, Creature Types, Construct](http://legacy.aonprd.com/bestiary/creatureTypes.html#construct)
- HP: applies average hit points to the Hit Dice formula
  - Average Hit Points: [Bestiary, Monster Creation, Step 7](http://legacy.aonprd.com/bestiary/monsterCreation.html) states that "You can also use [Table: Average Die Results](http://legacy.aonprd.com/bestiary/monsterCreation.html#table-1-5-average-die-results) to determine a creature's average hit points."
- Fortitude, Reflex and Will: [Core Rulebook, Combat, Saving Throws](http://legacy.aonprd.com/coreRulebook/combat.html#saving-throws)
- Melee
    - Attack bonus: [Core Rulebook, Combat, Attack Bonus](http://legacy.aonprd.com/coreRulebook/combat.html#attack-bonus)
        - Base Attack Bonus: See Base attack below
        - Size Modifier: [Table 8-1 in Core Rulebook, Combat](http://legacy.aonprd.com/coreRulebook/combat.html#table-8-1-size-modifiers)
    - Damage bonus: [Core Rulebook, Combat, Damage](http://legacy.aonprd.com/coreRulebook/combat.html#damage)
    - Natural attacks: [Bestiary, Universal Monster Rules, Natural Attacks](http://legacy.aonprd.com/bestiary/universalMonsterRules.html#natural-attacks)
- Special Attacks
    - attack bonus: similar to melee attacks
    - DC: Step 8 of [Bestiary, Monster Creation](http://legacy.aonprd.com/bestiary/monsterCreation.html) states that "The DC for almost all special abilities is equal to 10 + 1/2 the creature's Hit Dice + a relevant ability modifier (usually Constitution or Charisma depending on the ability)."
- Base attack, from [Table 1-4 in Bestiary Monster Creation](http://legacy.aonprd.com/bestiary/monsterCreation.html#table-1-4-creature-statistics-by-type)
- CMB and CMD, from [Core Rulebook, Combat Maneuvers](http://legacy.aonprd.com/coreRulebook/combat.html#combat-maneuvers)
- Skills
    - skill calculation [Table 4-2 in Core Rulebook](http://legacy.aonprd.com/coreRulebook/usingSkills.html#table-4-2-skill-check-bonuses)
    - skill ability [Table 4-3 in Core Rulebook](http://legacy.aonprd.com/coreRulebook/skillDescriptions.html#table-4-3-skill-summary)
    - special rules for individual skills, accessed from [Core Rulebook, Skill Descriptions](http://legacy.aonprd.com/coreRulebook/skillDescriptions.html), including:
        - [Climb](http://legacy.aonprd.com/coreRulebook/skills/climb.html#climb)
        - [Swim](http://legacy.aonprd.com/coreRulebook/skills/swim.html#swim)
        - [Stealth](http://legacy.aonprd.com/coreRulebook/skills/stealth.html#stealth)
    - class skills from [Bestiary Creature Types](http://legacy.aonprd.com/bestiary/creatureTypes.html)
    - [Skill Focus feat](http://legacy.aonprd.com/coreRulebook/feats.html#skill-focus)
- Special Abilities DC


### Not Supported Yet
- Race, class and level
- Subtypes
- Aura
- Ranged attacks
- Spell-like abilities
- Spells

### Partially Supported
- Types
  - Supported: Most types, provided the monster has no subtypes
  - Not supported: Aberrations, Animals, Humanoids, Outsiders
- Feats
  - Supported:
    - Feats that have no effect on calculations (e.g. Cleave)
    - Skill Focus
  - Not supported: Other feats affecting calculations

## Templates
Reference: [Monster Advancement](http://legacy.aonprd.com/bestiary/monsterAdvancement.html)

### Simple Templates
Simple templates have two sets of rules: the quick rules, that can be applied on the fly, and the rebuild rules, that require more time and effort.

The application implements the rebuild rules of the following simple templates:

- [Advanced](http://legacy.aonprd.com/bestiary/monsterAdvancement.html#advanced-creature)
- [Giant](http://legacy.aonprd.com/bestiary/monsterAdvancement.html#giant-creature)
- [Young](http://legacy.aonprd.com/bestiary/monsterAdvancement.html#young-creature)

### Other Templates
More templates will be added in the future.

### Rules used
- Fractional CR steps: [Table 1-7 from Bestiary, Monster Creation](http://legacy.aonprd.com/bestiary/monsterCreation.html#table-1-7-xp-and-gp-values-by-cr)
- Effect of size change 
    - on weapon damage: [Paizo FAQ](http://paizo.com/paizo/faq/v5748nruor1fm#v5748eaic9t3f)
    - on space and reach: [Table 8-4 from Core Rulebook, Combat](http://legacy.aonprd.com/coreRulebook/combat.html#table-8-4-creature-size-and-scale)