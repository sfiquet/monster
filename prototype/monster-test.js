var tiger = {
	"name": "Tiger",
	"CR": 4,
	"XP" : 1200,
	"alignment": "N",
	"size": "Large",
	"type": "animal",
	"Init": 6,
	"Senses": [
		"low-light vision", 
		"scent"
	],
	"Perception": 8,
	"Str": 23,
	"Dex": 15,
	"Con": 17,
	"Int": 2,
	"Wis": 12,
	"Cha": 6,
	"Base Atk": 4,
	"CMB": [
		11,
		"grapple": 15
	],
	"CMD": [
		23,
		"vs. trip": 27
	],
	"Feats": [
		"Improved Initiative",
		"Skill Focus (Perception)",
		"Weapon Focus (claw)"
	],
	"Skills": [
		"Acrobatics": 10,
		"Perception": 8,
		"Stealth": [
			7,
			"in areas of tall grass": 11
		],
		"Swim": 11,
	],
	"Racial Modifiers": [
		"Acrobatics": 4,
		"Stealth": [
			4,
			"in tall grass": 8
		]
	]
};

function Monster(fixed) {
	if (! this instanceof Monster)
		return new Monster(fixed);
		
	this.name = fixed.name;
	this.CR = fixed.CR;
	this.alignment = fixed.alignment;
	this.size = fixed.size;
	this.type = fixed.type;
	this.Senses = fixed.Senses;
	this.Str = fixed.Str;
	this.Dex = fixed.Dex;
	this.Con = fixed.Con;
	this.Int = fixed.Int;
	this.Wis = fixed.Wis;
	this.Cha = fixed.Cha;
	this.Feats = fixed.Feats;
}

