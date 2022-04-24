//import { weaponSheet } from "./module/sheets/item-sheet.js";
import { migrations } from "./module/migration.js";
import { wod } from "./module/config.js";
import { preloadHandlebarsTemplates } from "./module/templates.js";
import { MortalActorSheet } from "./module/actor/mortal-actor-sheet.js";
import { WerewolfActorSheet } from "./module/actor/werewolf-actor-sheet.js";
import { SpiritActorSheet } from "./module/actor/spirit-actor-sheet.js";
import { VampireActorSheet } from "./module/actor/vampire-actor-sheet.js";
import { CreatureActorSheet } from "./module/actor/creature-actor-sheet.js";
import { WoDItemSheet } from "./module/items/item-sheet.js";

Hooks.once("init", async function() {
	console.log("WoD | Initialising World of Darkness System");

	// "core" is core settings
	// "worldofdarkness" as system setting
	// "wod" or other then is module settings
	game.settings.register("worldofdarkness", "worldVersion", {
		name: game.i18n.localize('wod.settings.worldversion'),
		hint: game.i18n.localize('wod.settings.worldversionhint'),
		scope: "world",
		config: true,
		default: "1",
		type: String,
	});

	// Are you to use the permanent (check) values or temporary (not checked) of e.g. Willpower in rolls
	game.settings.register("worldofdarkness", "advantageRolls", {
		name: game.i18n.localize('wod.settings.advantagerolls'),
		hint: game.i18n.localize('wod.settings.advantagerollshint'),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});

	game.settings.register("worldofdarkness", "theRollofOne", {
		name: game.i18n.localize('wod.settings.therollofone'),
		hint: game.i18n.localize('wod.settings.therollofonehint'),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});

	game.settings.register("worldofdarkness", "attributeSettings", {
		name: game.i18n.localize('wod.settings.attributesettings'),
		hint: game.i18n.localize('wod.settings.attributesettingshint'),
		scope: "world",
		config: true,
		default: "20th",
		type: String,
		choices: {
			"20th": "20th edition",
			"5th": "5th edition"
		}
	});

	//patch settings
	game.settings.register("worldofdarkness", "patch107", {
		name: "patch107",
		hint: "patch107",
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
	});

	game.settings.register("worldofdarkness", "patch110", {
		name: "patch110",
		hint: "patch110",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

	game.settings.register("worldofdarkness", "patch120", {
		name: "patch120",
		hint: "patch120",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

	console.log("WoD | Settings registered");
	
	CONFIG.wod = wod;
	CONFIG.attributeSettings = game.settings.get("worldofdarkness", "attributeSettings");
	CONFIG.rollSettings = game.settings.get('worldofdarkness', 'advantageRolls');
	CONFIG.handleOnes = game.settings.get('worldofdarkness', 'theRollofOne');

	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	
	Actors.registerSheet("WoD", MortalActorSheet, {
		label: "Mortal Sheet",
		types: ["Mortal"],
		makeDefault: true
	});
	
	Actors.registerSheet("WoD", WerewolfActorSheet, {
		label: "Werewolf Sheet",
		types: ["Werewolf"],
		makeDefault: true
	});	

	Actors.registerSheet("WoD", VampireActorSheet, {
		label: "Vampire Sheet",
		types: ["Vampire"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", CreatureActorSheet, {
		label: "Creature Sheet",
		types: ["Creature"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", SpiritActorSheet, {
		label: "Spirit Sheet",
		types: ["Spirit"],
		makeDefault: true
	});
	
	console.log("WoD | Sheets Registered");

	// Register item application classes
	Items.unregisterSheet("core", ItemSheet);

	Items.registerSheet("WoD", WoDItemSheet, {
		makeDefault: true		
	});

	console.log("WoD | Items Registered");
	
	preloadHandlebarsTemplates();

	Handlebars.registerHelper("logg", function(variable, options) {
		console.log(variable);
	});
	
	Handlebars.registerHelper("setVariable", function(varName, varValue, options) {
		console.log("WoD | setVariable " + varName + " value " + varValue);
		
		options.data.root[varName] = varValue;
	});
		
	Handlebars.registerHelper("numLoop", function (num, options) {
		let ret = "";

		for (let i = 0, j = num; i < j; i++) {
			ret = ret + options.fn(i);
		}

		return ret;
	});

	Handlebars.registerHelper("iff", function (a, operator, b, opts) {
		var bool = false;
		switch (operator) {
			case "==":
				bool = a == b;
				break;
			case ">":
				bool = a > b;
				break;
			case "<":
				bool = a < b;
				break;
			case ">=":
				bool = parseInt(a) >= parseInt(b);
				break;
			case "<=":
				bool = a <= b;
				break;
			case "!=":
				bool = a != b;
				break;
			case "contains":
				if (a && b) {
					bool = a.includes(b);
				} else {
					bool = false;
				}
				break;
			default:
			throw "Unknown operator " + operator;
		}

		if (bool) {
			return opts.fn(this);
		} else {
			return opts.inverse(this);
		}
	});
	
	Handlebars.registerHelper('le', function( a, b ){
		var next =  arguments[arguments.length-1];
		return (a <= b) ? next.fn(this) : next.inverse(this);
	});

	Handlebars.registerHelper("getAttributes", function (attribute) {
		let list;

		if (CONFIG.attributeSettings == "5th") {
			list = CONFIG.wod.attributes;
		}
		else if (CONFIG.attributeSettings == "20th") {
			list = CONFIG.wod.attributes20;
		}
		
		for (const i in list) {
			if (i == attribute) {
				return list[i];
			}
		}

		for (const i in CONFIG.wod.advantages) {
			if (i == attribute) {
				return CONFIG.wod.advantages[i];
			}
		}

		return attribute;
	});

	Handlebars.registerHelper("getAbility", function (ability) {
		for (const i in CONFIG.wod.alltalents) {
			if (i == ability) {
				return CONFIG.wod.alltalents[i];
			}
		}

		for (const i in CONFIG.wod.allskills) {
			if (i == ability) {
				return CONFIG.wod.allskills[i];
			}
		}

		for (const i in CONFIG.wod.allknowledges) {
			if (i == ability) {
				return CONFIG.wod.allknowledges[i];
			}
		}

		return ability;
	});

	Handlebars.registerHelper("orderAttributes", function (attribute) {
		var list = ["strength","dexterity","stamina"];
		
		if (list.includes(attribute)) {
			//return "clear:left;float:left;";
			return "clear:left";
		}
		else {
			return "float:left;";
		}
	});

	Handlebars.registerHelper("topAttributes", function (attribute) {
		var list = ["strength","charisma","perception"];

		if (CONFIG.attributeSettings == "5th") {
			list = ["strength","charisma","intelligence"];
		}
		
		if (list.includes(attribute)) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("bottenAttributes", function (attribute) {
		var list = ["stamina","appearance","wits"];

		if (CONFIG.attributeSettings == "5th") {
			list = ["stamina","composure","resolve"];
		}
		
		if (list.includes(attribute)) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("damageState", function (healthLevel, healthStates, index) {
		let num = 0;
		let oldHealthLevel = "";

		for (const i of healthStates) {
			if (oldHealthLevel != healthLevel) {
				num = 0;
				oldHealthLevel = healthLevel;
			}

			if (i.label == healthLevel) {
				if (num == index) {
					return i.status;
				}

				num += 1;
			}			
		}

		return "";
	});

	Handlebars.registerHelper("captilizeFirst", function (text) {
		return text.charAt(0).toUpperCase() + text.slice(1);
	});

	Handlebars.registerHelper("captilize", function (text) {
		return text.toUpperCase();
	});

	Handlebars.registerHelper("convertDamageCode", function (attribute, bonus, type) {
		var code;

		type = type.charAt(0).toUpperCase();

		code = attribute.substring(0, 3);

		if (code == "") {
			code = bonus;
		}
		else if (bonus > 0) {
			code += "+"+bonus;
		}
		else if (bonus < 0) {
			code += "-"+bonus;
		}

		code += " " + type;

		return code;
	});
	
	console.log("WoD | Added Handelebars");  
});

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
    // Do anything after initialization but before
    // ready
});
/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", function () {
    // Do anything once the system is ready
    // Reference a Compendium pack by it's collection ID
    // packImport();
    migrations();	
});

Hooks.on("renderActorSheet", (sheet) => { 
	//console.log("WoD | Sheet opened " + sheet.actor.type);  	
});