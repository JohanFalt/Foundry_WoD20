/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	console.log("WoD | loading parts");

	// Define template paths to load
	const templatePaths = [
		// Actor Sheet Partials
		"systems/worldofdarkness/templates/actor/parts/profile-img.html",
		"systems/worldofdarkness/templates/actor/parts/navigation.html",
		"systems/worldofdarkness/templates/actor/parts/bio.html",
		"systems/worldofdarkness/templates/actor/parts/attributes.html",
		"systems/worldofdarkness/templates/actor/parts/attributes_spec.html",
		"systems/worldofdarkness/templates/actor/parts/abilities.html",
		"systems/worldofdarkness/templates/actor/parts/abilities_spec.html",
		"systems/worldofdarkness/templates/actor/parts/combat.html",
		"systems/worldofdarkness/templates/actor/parts/conditions.html",
		"systems/worldofdarkness/templates/actor/parts/combat_natural.html",
		"systems/worldofdarkness/templates/actor/parts/combat_melee.html",
		"systems/worldofdarkness/templates/actor/parts/combat_ranged.html",
		"systems/worldofdarkness/templates/actor/parts/combat_armor.html",		
		"systems/worldofdarkness/templates/actor/parts/stats.html",
		
		"systems/worldofdarkness/templates/actor/parts/stats_rage.html",
		"systems/worldofdarkness/templates/actor/parts/stats_gnosis.html",
		"systems/worldofdarkness/templates/actor/parts/stats_willpower.html",
		"systems/worldofdarkness/templates/actor/parts/stats_bloodpool.html",
		"systems/worldofdarkness/templates/actor/parts/stats_health.html",
		"systems/worldofdarkness/templates/actor/parts/gear.html",
		"systems/worldofdarkness/templates/actor/parts/notes.html",
		"systems/worldofdarkness/templates/actor/parts/settings.html",

		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_werewolf_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_ajaba_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_ananasi_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_bastet_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_corax_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_gurahl_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_kitsune_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_mokole_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_nagah_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_nuwisha_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_ratkin_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_rokea_background.html",

		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_ajaba_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_ananasi_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_bastet_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_corax_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_gurahl_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_kitsune_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_mokole_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_nuwisha_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_ratkin_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_rokea_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_renown.html",

		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_ajaba.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_ananasi.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_bastet.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_corax.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_gurahl.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_kitsune.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_mokole.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_nagah.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_nuwisha.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_ratkin.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_rokea.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift.html",

		"systems/worldofdarkness/templates/actor/parts/werewolf/gift.html",
		"systems/worldofdarkness/templates/actor/parts/spirit/charms.html",
		"systems/worldofdarkness/templates/actor/parts/creature/power.html",

		// Item Sheet Partials
		"systems/worldofdarkness/templates/sheets/parts/lock.html",
		"systems/worldofdarkness/templates/sheets/parts/power_rollable.html",
		"systems/worldofdarkness/templates/sheets/parts/power_description.html"		
	];

	/* Load the template parts
		That function is part of foundry, not founding it here is normal
	*/
	return loadTemplates(templatePaths); // eslint-disable-line no-undef
};

export const registerHandlebarsHelpers = function () {
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

	Handlebars.registerHelper("checkSystemsetting", function (text) {
		if (text == "attributeSettings") {
			return CONFIG.attributeSettings;
		}

		if (text == "rollSettings") {
			return CONFIG.rollSettings;
		}

		if (text == "theRollofOne") {
			return CONFIG.handleOnes;
		}

		return false;
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
}
