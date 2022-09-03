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
		"systems/worldofdarkness/templates/actor/parts/macro_icons.html",
		"systems/worldofdarkness/templates/actor/parts/combat_natural.html",
		"systems/worldofdarkness/templates/actor/parts/combat_melee.html",
		"systems/worldofdarkness/templates/actor/parts/combat_ranged.html",
		"systems/worldofdarkness/templates/actor/parts/combat_armor.html",		
		"systems/worldofdarkness/templates/actor/parts/stats.html",
		
		"systems/worldofdarkness/templates/actor/parts/stats_rage.html",
		"systems/worldofdarkness/templates/actor/parts/stats_gnosis.html",
		"systems/worldofdarkness/templates/actor/parts/stats_willpower.html",
		"systems/worldofdarkness/templates/actor/parts/stats_bloodpool.html",
		"systems/worldofdarkness/templates/actor/parts/stats_essence.html",
		"systems/worldofdarkness/templates/actor/parts/stats_health.html",
		"systems/worldofdarkness/templates/actor/parts/gear.html",
		"systems/worldofdarkness/templates/actor/parts/notes.html",
		"systems/worldofdarkness/templates/actor/parts/settings.html",

		"systems/worldofdarkness/templates/actor/parts/vampire/bio_vampire_background.html",
		"systems/worldofdarkness/templates/actor/parts/vampire/stats_path.html",
		"systems/worldofdarkness/templates/actor/parts/vampire/stats_virtue.html",

		"systems/worldofdarkness/templates/actor/parts/mage/bio_mage_background.html",		
		"systems/worldofdarkness/templates/actor/parts/mage/stats_arete.html",
		"systems/worldofdarkness/templates/actor/parts/mage/stats_quintessence.html",

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
		
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_renown.html",

		"systems/worldofdarkness/templates/actor/parts/werewolf/combat_active.html",
		"systems/worldofdarkness/templates/actor/parts/mage/combat_active.html",

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

		"systems/worldofdarkness/templates/actor/parts/werewolf/fetish.html",

		"systems/worldofdarkness/templates/actor/parts/mage/magic.html",
		"systems/worldofdarkness/templates/actor/parts/vampire/disciplines.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/gift.html",
		"systems/worldofdarkness/templates/actor/parts/spirit/charms.html",
		"systems/worldofdarkness/templates/actor/parts/creature/power.html",

		"systems/worldofdarkness/templates/actor/parts/mage/spheres_spec.html",
		"systems/worldofdarkness/templates/actor/parts/mage/spheres.html",
		"systems/worldofdarkness/templates/actor/parts/mage/rotes.html",
		"systems/worldofdarkness/templates/actor/parts/mage/focus.html",

		// Item Sheet Partials
		"systems/worldofdarkness/templates/sheets/parts/power_rollable.html",
		"systems/worldofdarkness/templates/sheets/parts/power_description.html"		
	];

	/* Load the template parts
		That function is part of foundry, not founding it here is normal
	*/
	return loadTemplates(templatePaths); // eslint-disable-line no-undef
};

export const registerHandlebarsHelpers = function () {

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

	Handlebars.registerHelper("numFromLoop", function (from, num, options) {
		let ret = "";

		for (let i = from; i <= num; i++) {
			ret = ret + options.fn(i);
		}

		return ret;
	});

	Handlebars.registerHelper("numDownToLoop", function (from, num, options) {
		let ret = "";

		for (let i = from; i >= num; i--) {
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

	Handlebars.registerHelper('eqAny', function () {
		for(let i = 1; i < arguments.length; i++) {
		  	if(arguments[0] === arguments[i]) {
				return true;
		  	}
		}
		return false;
	});

	Handlebars.registerHelper('eqAnyNot', function () {
		let found = false;

		for(let i = 1; i < arguments.length; i++) {
		  	if(arguments[0] === arguments[i]) {
				found = true;
		  	}
		}
		
		return !found;
	});

	Handlebars.registerHelper('le', function( a, b ){
		var next =  arguments[arguments.length-1];
		return (a <= b) ? next.fn(this) : next.inverse(this);
	});

	Handlebars.registerHelper("shorten", function (text, i) {
		let result = text;

		if (text.length > i) {
			if (text.length > i + 3) {
				result = text.substring(0, i) + "...";
			}
		}

		return result;
	});

	Handlebars.registerHelper("getAttributes", function (attribute) {
		let list;

		if (CONFIG.wod.attributeSettings == "5th") {
			list = CONFIG.wod.attributes;
		}
		else if (CONFIG.wod.attributeSettings == "20th") {
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

	Handlebars.registerHelper("topAttributes", function (attribute) {
		var list = ["strength","charisma","perception"];

		if (CONFIG.wod.attributeSettings == "5th") {
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

		if (CONFIG.wod.attributeSettings == "5th") {
			list = ["stamina","composure","resolve"];
		}
		
		if (list.includes(attribute)) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("getShifterRenown", function (type, renown) {
		let newtext = renown;

		if ((type == "Ajaba") || (type == "Bastet")) {
			if (renown == "Glory") { 
				newtext = "wod.advantages.ferocity";
			}
			if (renown == "Wisdom") { 
				newtext = "wod.advantages.cunning";
			}
		}
		if (type == "Ananasi") {
			if (renown == "Glory") { 
				newtext = "wod.advantages.obedience";
			}
			if (renown == "Honor") { 
				newtext = "wod.advantages.cunning";
			}
		}
		if (type == "Kitsune") {
			if (renown == "Glory") { 
				newtext = "wod.advantages.chie";
			}
			if (renown == "Honor") { 
				newtext = "wod.advantages.toku";
			}
			if (renown == "Wisdom") { 
				newtext = "wod.advantages.kagayaki";
			}
		}
		if (type == "Ratkin") {
			if (renown == "Glory") { 
				newtext = "wod.advantages.infamy";
			}
			if (renown == "Honor") { 
				newtext = "wod.advantages.obligation";
			}
			if (renown == "Wisdom") { 
				newtext = "wod.advantages.cunning";
			}
		}
		if (type == "Rokea") {
			if (renown == "Glory") { 
				newtext = "wod.advantages.valor";
			}
			if (renown == "Honor") { 
				newtext = "wod.advantages.harmony";
			}
			if (renown == "Wisdom") { 
				newtext = "wod.advantages.innovation";
			}
		}

		return newtext;
	});

	Handlebars.registerHelper("getSpiritAttributes", function (attribute) {
		const list = CONFIG.wod.advantages;

		for (const i in list) {
			if (i == attribute) {
				return list[i];
			}
		}

		if (attribute == "strength") {
			return "wod.advantages.rage";
		}
		else if ((attribute == "dexterity") || (attribute == "stamina")) {
			return "wod.advantages.willpower";
		}
		else {
			return "wod.advantages.gnosis";
		}
	});		

	Handlebars.registerHelper("topSpheres", function (sphere) {
		var list = ["correspondence","life","prime"];

		if (list.includes(sphere)) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("bottenSpheres", function (sphere) {
		var list = ["forces","mind","time"];

		if (list.includes(sphere)) {
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

	Handlebars.registerHelper("quintessenceWheel", function (quintessence, paradox, index) {
		let state = "";
		const square = index + 1;

		if ((paradox.permanent > 0) && (20 - paradox.permanent  < square)) {
			state = "*";
			return state;
		}

		if ((paradox.temporary > 0) && (20 - (paradox.permanent + paradox.temporary) < square)) {
			state = "x";
			return state;
		}

		if ((quintessence.temporary > 0) && (square <= quintessence.temporary))  {
			state = "Ψ";
			return state;
		}

		return state;
	});

	Handlebars.registerHelper("captilizeFirst", function (text) {
		return text.charAt(0).toUpperCase() + text.slice(1);
	});

	Handlebars.registerHelper("checkSystemsetting", function (text) {
		if (text == "attributeSettings") {
			return CONFIG.wod.attributeSettings;
		}

		if (text == "rollSettings") {
			return CONFIG.wod.rollSettings;
		}

		if (text == "theRollofOne") {
			return CONFIG.wod.handleOnes;
		}

		if (text == "observersSeeFullActor") {
			if (CONFIG.wod.observersSeeFullActor == "full") {
				return CONFIG.wod.observersSeeFullActor;
			}

			if (game.user.isGM) {
				return "full";
			}

			if (this.actor.isOwner) {
				return "full";
			}

			return CONFIG.wod.observersSeeFullActor;
		}

		return false;
	});

	Handlebars.registerHelper("captilize", function (text) {
		return text.toUpperCase();
	});

	Handlebars.registerHelper("lowercase", function (text) {
		return text.toLowerCase();
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

	Handlebars.registerHelper("ignorePain", function (value) {
		let ignoresPain = false;

		if (this.actor.system.conditions?.isignoringpain)
		{
			ignoresPain = true;
		}

		if (this.actor.system.conditions?.isfrenzy)
		{
			ignoresPain = true;
		}

		if (ignoresPain) {
			return 0;
		}
		else {
			return value;
		}
	});

	Handlebars.registerHelper("ragePenalty", function (value) {
		let rageDiff = parseInt(this.actor.system.rage.roll) - parseInt(this.actor.system.willpower.roll);

		if (rageDiff < 0) {
			rageDiff = 0;
		}

		return rageDiff * -1;
	});
}
