import { databio } from "../assets/data/bio.js";
import { dataability } from "../assets/data/ability.js";

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
		"systems/worldofdarkness/templates/actor/parts/abilities.html",
		"systems/worldofdarkness/templates/actor/parts/combat.html",
		"systems/worldofdarkness/templates/actor/parts/conditions.html",
		"systems/worldofdarkness/templates/actor/parts/movement.html",
		"systems/worldofdarkness/templates/actor/parts/macro_icons.html",
		"systems/worldofdarkness/templates/actor/parts/combat_natural.html",
		"systems/worldofdarkness/templates/actor/parts/combat_melee.html",
		"systems/worldofdarkness/templates/actor/parts/combat_ranged.html",
		"systems/worldofdarkness/templates/actor/parts/combat_armor.html",		

		"systems/worldofdarkness/templates/actor/parts/stats.html",		
		"systems/worldofdarkness/templates/actor/parts/stats_banality.html",
		"systems/worldofdarkness/templates/actor/parts/stats_bloodpool.html",
		"systems/worldofdarkness/templates/actor/parts/stats_essence.html",
		"systems/worldofdarkness/templates/actor/parts/stats_glamour.html",
		"systems/worldofdarkness/templates/actor/parts/stats_nightmare.html",		
		"systems/worldofdarkness/templates/actor/parts/stats_gnosis.html",
		"systems/worldofdarkness/templates/actor/parts/stats_rage.html",
		"systems/worldofdarkness/templates/actor/parts/stats_willpower.html",

		"systems/worldofdarkness/templates/actor/parts/creature/stats.html",

		"systems/worldofdarkness/templates/actor/parts/stats_path.html",
		"systems/worldofdarkness/templates/actor/parts/stats_virtue.html",		

		"systems/worldofdarkness/templates/actor/parts/hunter/stats_virtue.html",
		"systems/worldofdarkness/templates/actor/parts/hunter/stats_conviction.html",		
		
		"systems/worldofdarkness/templates/actor/parts/wraith/stats_corpus.html",
		"systems/worldofdarkness/templates/actor/parts/wraith/stats_pathos.html",
		
		"systems/worldofdarkness/templates/actor/parts/stats_faith.html",
		"systems/worldofdarkness/templates/actor/parts/stats_torment.html",
		"systems/worldofdarkness/templates/actor/parts/demon/forms.html",
		
		"systems/worldofdarkness/templates/actor/parts/stats_health.html",
		"systems/worldofdarkness/templates/actor/parts/gear.html",
		"systems/worldofdarkness/templates/actor/parts/notes.html",
		"systems/worldofdarkness/templates/actor/parts/settings.html",
		"systems/worldofdarkness/templates/actor/parts/settings_attribute.html",
		"systems/worldofdarkness/templates/actor/parts/settings_abilities.html",
		"systems/worldofdarkness/templates/actor/parts/settings_combat.html",
		"systems/worldofdarkness/templates/actor/parts/settings_power.html",
		"systems/worldofdarkness/templates/actor/parts/settings_sheet.html",

		"systems/worldofdarkness/templates/actor/parts/vampire/bio_vampire_background.html",		

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

		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_apis_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_camazotz_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_grondr_background.html",

		"systems/worldofdarkness/templates/actor/parts/changeling/bio_changeling_background.html",				
		"systems/worldofdarkness/templates/actor/parts/changeling/treasure.html",

		"systems/worldofdarkness/templates/actor/parts/hunter/bio_hunter_background.html",				
		"systems/worldofdarkness/templates/actor/parts/demon/bio_demon_background.html",		
		"systems/worldofdarkness/templates/actor/parts/wraith/bio_wraith_background.html",
		"systems/worldofdarkness/templates/actor/parts/wraith/shadow.html",
		
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_nagah_renown.html",

		"systems/worldofdarkness/templates/actor/parts/werewolf/combat_active.html",

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

		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_apis.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_camazotz.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_grondr.html",	

		"systems/worldofdarkness/templates/actor/parts/werewolf/fetish.html",
		"systems/worldofdarkness/templates/actor/parts/mage/magic_item.html",

		"systems/worldofdarkness/templates/actor/parts/mage/magic.html",
		"systems/worldofdarkness/templates/actor/parts/mage/resonance.html",
		"systems/worldofdarkness/templates/actor/parts/vampire/disciplines.html",
		"systems/worldofdarkness/templates/actor/parts/gifts.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/gift.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/rites.html",
		"systems/worldofdarkness/templates/actor/parts/changeling/dreaming.html",
		"systems/worldofdarkness/templates/actor/parts/hunter/edges.html",
		"systems/worldofdarkness/templates/actor/parts/demon/lores.html",
		"systems/worldofdarkness/templates/actor/parts/spirit/charms.html",		
		"systems/worldofdarkness/templates/actor/parts/creature/charms.html",		
		"systems/worldofdarkness/templates/actor/parts/creature/power.html",

		"systems/worldofdarkness/templates/actor/parts/mage/spheres.html",
		"systems/worldofdarkness/templates/actor/parts/mage/rotes.html",
		"systems/worldofdarkness/templates/actor/parts/mage/focus.html",		

		"systems/worldofdarkness/templates/actor/parts/wraith/death.html",

		// Item Sheet Partials
		"systems/worldofdarkness/templates/sheets/parts/power_rollable.html",
		"systems/worldofdarkness/templates/sheets/parts/power_description.html",
		"systems/worldofdarkness/templates/sheets/parts/item_bonus.html"		
	];

	/* Load the template parts
		That function is part of foundry, not founding it here is normal
	*/
	return loadTemplates(templatePaths); // eslint-disable-line no-undef
};

export function SetupAbilities()
{
    try {        
		let importData = dataability;
		// let fileData = await fetch(`systems/worldofdarkness/assets/data/ability.json`).then((response) => response.json());
		// Object.assign(importData, fileData);

		return importData;		
    } catch(err) {
		err.message = `Failed Setup ability: ${err.message}`;
        console.error(err);
        return
    }
}

export function SetupBio()
{
    try {        
		let importData = databio;
		/* let fileData = await fetch(`systems/worldofdarkness/assets/data/bio.json`).then((response) => response.json());
		Object.assign(importData, fileData);
 */
		return importData;		
    } catch(err) {
		err.message = `Failed Setup bio: ${err.message}`;
        console.error(err);
        return
    }
}

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

	Handlebars.registerHelper('neAny', function () {
		for(let i = 1; i < arguments.length; i++) {
		  	if(arguments[0] === arguments[i]) {
				return false;
		  	}
		}
		return true;
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

	Handlebars.registerHelper("getEra", function (actor) {
		let era = actor.system.settings.era;

		if (era ==  CONFIG.worldofdarkness.era.modern) {
			return "modern";
		}
		else if (era ==  CONFIG.worldofdarkness.era.victorian) {
			return "victorian";
		}
		else if (era ==  CONFIG.worldofdarkness.era.darkages) {
			return "darkages";
		}

		return "modern";
	});

	Handlebars.registerHelper("getVariant", function (actor) {
		let variant = actor.system.settings.variant;

		if ((actor.type != CONFIG.worldofdarkness.sheettype.mortal) && (actor.type != CONFIG.worldofdarkness.sheettype.changingbreed) && (actor.type != CONFIG.worldofdarkness.sheettype.changeling) && (actor.type != CONFIG.worldofdarkness.sheettype.creature)) {
			return "variantSelected";
		}
		else if (variant == undefined) {
			return "variantUnselected";
		}
		else if (variant == "") {
			return "variantUnselected";
		}
		else {
			return "variantSelected";
		}
	});	

	Handlebars.registerHelper("getVariantName", function (type, variant) {
		return CONFIG.worldofdarkness.variant[type][variant];
	});

	Handlebars.registerHelper("getBonusName", function (type) {
		return game.i18n.localize(CONFIG.worldofdarkness.bonus[type]);
	});

	

	Handlebars.registerHelper("getAttributes", function (attribute) {
		let list;

		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
			list = CONFIG.worldofdarkness.attributes;
		}
		else if (CONFIG.worldofdarkness.attributeSettings == "20th") {
			list = CONFIG.worldofdarkness.attributes20;
		}
		
		for (const i in list) {
			if (i == attribute) {
				return list[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.advantages) {
			if (i == attribute) {
				return CONFIG.worldofdarkness.advantages[i];
			}
		}

		return attribute;
	});

	Handlebars.registerHelper("getSecondaryAbility", function (ability, actor, id) {
		if ((ability == "custom") && (id != "") ) {
			const item = actor.getEmbeddedDocument("Item", id);
			return item.system.label;	
		}

		return "";
	});

	Handlebars.registerHelper("getAbility", function (ability, actor) {	
		
		if (ability == "") {
			return "";
		}

		if (actor != undefined) {
			if (actor.system.abilities[ability] != undefined) {
				if (actor.system.abilities[ability].altlabel != "") {
					return actor.system.abilities[ability].altlabel;
				}
			}			
		}

		for (const i in CONFIG.worldofdarkness.talents) {
			if (i == ability) {
				return CONFIG.worldofdarkness.talents[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.skills) {
			if (i == ability) {
				return CONFIG.worldofdarkness.skills[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.knowledges) {
			if (i == ability) {
				return CONFIG.worldofdarkness.knowledges[i];
			}
		}	

		for (const i in CONFIG.worldofdarkness.advantages) {
			if (i == ability) {
				return CONFIG.worldofdarkness.advantages[i];
			}
		}

		// attribute then?
		let list;

		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
			list = CONFIG.worldofdarkness.attributes;
		}
		else if (CONFIG.worldofdarkness.attributeSettings == "20th") {
			list = CONFIG.worldofdarkness.attributes20;
		}
		
		for (const i in list) {
			if (i == ability) {
				return list[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.advantages) {
			if (i == ability) {
				return CONFIG.worldofdarkness.advantages[i];
			}
		}

		return ability;
	});

	Handlebars.registerHelper("getAbilityLabel", function (ability) {
		if (ability.altlabel == "") {
			return game.i18n.localize(ability.label);
		}
		
		return ability.altlabel;
	});

	Handlebars.registerHelper("topAttributes", function (attribute) {
		var list = ["strength","charisma","perception"];

		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
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

		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
			list = ["stamina","composure","resolve"];
		}
		
		if (list.includes(attribute)) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("showAbility", function (ability, abilityType, sheetType) {
		if (ability == "research") {
			if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)) && (abilityType == "skills")) {
				return false;
			}
			else if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)) && (abilityType == "knowledges")) {
				return true;
			}
			else if (abilityType == "skills") {
				return true;
			}
			else if (abilityType == "knowledges") {
				return false;
			}
		}
		if (ability == "technology") {
			if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.mage)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)) && (abilityType == "skills")) {
				return true;
			}
			else if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.mage)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)) && (abilityType == "knowledges")) {
				return false;
			}
			else if (abilityType == "skills") {
				return false;
			}
			else if (abilityType == "knowledges") {
				return true;
			}
		}

		return true;
	}); 

	Handlebars.registerHelper("getAbilityAttribute" , function (actor, ability, attribute) {
		let value = "";

		if (actor.system.abilities == undefined) {
			return value;
		}

		if (attribute == "label") {
			value = game.i18n.localize(actor.system.abilities[ability][attribute]);
		}
		if (attribute == "altlabel") {
			value = actor.system.abilities[ability][attribute];
		}
		if (attribute == "isvisible") {
			value = actor.system.abilities[ability][attribute];
		}		 

		return value;
	});

	Handlebars.registerHelper("hasSpeciality" , function (ability) {
		// opens in dialog to edit speciality
		if (ability.typeform == "attribute") {
			return true;
		}

		let hasSpeciality = false;
		let id = ability._id;

		if (ability.id != undefined) {
			id = ability.id;
		}

		if (ability.value >= 4) {
			hasSpeciality = true;
		}
		else {
			hasSpeciality = CONFIG.worldofdarkness.alwaysspeciality.includes(id); 			
		}		

		return hasSpeciality;
	});

	Handlebars.registerHelper("getDescriptionTooltip" , function (description, system) {
		let tooltip = "";

		if ((description != "") && (system != "")) {
			tooltip = `<h2>${game.i18n.localize("wod.labels.description")}:</h2>${description}<br /><br /><h2>${game.i18n.localize("wod.labels.details")}:</h2>${system}`;
		}
		else if (description != "") {
			tooltip = `<h2>${game.i18n.localize("wod.labels.description")}:</h2>${description}`;
		}
		else if (system != "") {
			tooltip = `<h2>${game.i18n.localize("wod.labels.details")}:<h2>${system}`;
		}

		return tooltip;
	});

	Handlebars.registerHelper("shifterHasForm", function (actor, form) {
		if (actor.system.shapes[form].isactive) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("getShifterRenown", function (type, renown) {
		let newtext = renown;

		if (renown == "Glory") {
			newtext = "wod.advantages.glory";
		}
		if (renown == "Honor") { 
			newtext = "wod.advantages.honor";
		}
		if (renown == "Wisdom") { 
			newtext = "wod.advantages.wisdom";
		}

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
		if (type == "Gurahl") {
			if (renown == "Glory") { 
				newtext = "wod.advantages.honor";
			}
			if (renown == "Honor") { 
				newtext = "wod.advantages.succor";
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
		if (type == "Nuwisha") {
			if (renown == "Honor") { 
				newtext = "wod.advantages.humor";
			}
			if (renown == "Wisdom") { 
				newtext = "wod.advantages.cunning";
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

	Handlebars.registerHelper("getShifterRank", function (type, rank) {
		if (type == "Werewolf") {
			if (rank == 0) return game.i18n.localize("wod.advantages.ranknames.garou.rank0");
			if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.garou.rank1");
			if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.garou.rank2");
			if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.garou.rank3");
			if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.garou.rank4");
			if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.garou.rank5");
			if (rank == 6) return game.i18n.localize("wod.advantages.ranknames.garou.rank6");
		}
		if (type == "Bastet") {
			if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.bastet.rank1");
			if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.bastet.rank2");
			if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.bastet.rank3");
			if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.bastet.rank4");
			if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.bastet.rank5");
		}
		if (type == "Corax") {
			if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.corax.rank1");
			if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.corax.rank2");
			if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.corax.rank3");
			if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.corax.rank4");
			if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.corax.rank5");
		}
		if (type == "Gurahl") {
			if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.gurahl.rank1");
			if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.gurahl.rank2");
			if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.gurahl.rank3");
			if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.gurahl.rank4");
			if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.gurahl.rank5");
		}
		if (type == "Kitsune") {
			if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.kitsune.rank1");
			if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.kitsune.rank2");
			if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.kitsune.rank3");
			if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.kitsune.rank4");
			if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.kitsune.rank5");
		}
		if (type == "Mokole") {
			if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.mokole.rank1");
			if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.mokole.rank2");
			if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.mokole.rank3");
			if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.mokole.rank4");
			if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.mokole.rank5");
		}
		if (type == "Nagah") {
			if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.nagah.rank0");
			if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.nagah.rank1");
			if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.nagah.rank2");
			if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.nagah.rank3");
			if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.nagah.rank4");
			if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.nagah.rank5");
			if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.nagah.rank6");
		}
		if (type == "Ratkin") {
			if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.ratkin.rank1");
			if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.ratkin.rank2");
			if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.ratkin.rank3");
			if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.ratkin.rank4");
			if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.ratkin.rank5");
		}

		return "";
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

		if (healthStates == undefined) {
			return "";
		}

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

	Handlebars.registerHelper("getGiftList", function (gifts, rank) {
		let list = [];

		if (rank == 1) {
			list = gifts.powerlist1;
		}
		else if (rank == 2) {
			list = gifts.powerlist2;
		}
		else if (rank == 3) {
			list = gifts.powerlist3;
		}
		else if (rank == 4) {
			list = gifts.powerlist4;
		}
		else if (rank == 5) {
			list = gifts.powerlist5;
		}
		else if (rank == 6) {
			list = gifts.powerlist6;
		}

		return list;
	});

	Handlebars.registerHelper("checkProperty", function (properties, name, value) {
		if (properties.length == 0) {
			return false;
		}

		if (properties[name] == undefined) {
			return false;
		}

		if (properties[name] == value) {
			return true;
		}

		return false;
	});

	Handlebars.registerHelper("getProperty", function (properties, name) {
		if (properties.length == 0) {
			return "";
		}

		if (properties[name] == undefined) {
			return "";
		}

		return game.i18n.localize(properties[name]);
	});

	Handlebars.registerHelper("translateConceal", function (conceal, era, fullname) {

		if (era == undefined) {
			era = CONFIG.worldofdarkness.era.modern;
		}
		
		if (fullname) {
			if (era == CONFIG.worldofdarkness.era.modern) {
				if (conceal == "P") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.pocket");
				}
				if (conceal == "J") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.jacket");
				}
				if (conceal == "T") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.trenchcoat");
				}
				if (conceal == "NA") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.na");
				}
			}

			if (era == CONFIG.worldofdarkness.era.victorian) {
				if (conceal == "P") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.pocket");
				}
				if (conceal == "J") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.jacket");
				}
				if (conceal == "T") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.trenchcoat");
				}
				if (conceal == "NA") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.na");
				}
			}

			if (era == CONFIG.worldofdarkness.era.darkages) {
				if (conceal == "P") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.pouch");
				}
				if (conceal == "J") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.loose");
				}
				if (conceal == "T") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.cloak");
				}
				if (conceal == "NA") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.notbeconcealed");
				}
			}
		}
		else {
			if (era == CONFIG.worldofdarkness.era.darkages) {
				if (conceal == "J") {
					conceal = "C";
				}
				if (conceal == "T") {
					conceal = "L";
				}
			}
		}		

		return conceal;
	});

	Handlebars.registerHelper("getBioList", function(list, section) {
		if (list == undefined) {
			return [];
		}
		if (list[section] == undefined) {
			return [];
		}

		return list[section];
	});

 	Handlebars.registerHelper("isChecked", function(value) {
		if (value == undefined) {
			return "";
		}

		if (value) {
			return "checked";
		}

		return "";
	}); 

	Handlebars.registerHelper("isActive", function(stat, value) {
		if (stat == value) {
			return "active";
		}

		return "";
	});

	Handlebars.registerHelper("captilizeFirst", function (text) {
		return text.charAt(0).toUpperCase() + text.slice(1);
	});

	Handlebars.registerHelper("firstLetter", function (text) {
		return text.charAt(0).toUpperCase();
	});

	Handlebars.registerHelper("checkSystemsetting", function (text) {
		if (text == "attributeSettings") {
			return CONFIG.worldofdarkness.attributeSettings;
		}

		if (text == "rollSettings") {
			return CONFIG.worldofdarkness.rollSettings;
		}

		if (text == "theRollofOne") {
			return CONFIG.worldofdarkness.handleOnes;
		}

		if (text == "useOnesDamage") {
			return CONFIG.worldofdarkness.useOnesDamage;
		}

		if (text == "useOnesSoak") {
			return CONFIG.worldofdarkness.useOnesSoak;
		}

		if (text == "lowestDifficulty") {
			return CONFIG.worldofdarkness.lowestDifficulty;
		}

		if (text == "lowestDifficulty") {
			return CONFIG.worldofdarkness.lowestDifficulty;
		}

		if (text == "specialityAddSuccess") {
			return CONFIG.worldofdarkness.specialityAddSuccess;
		}				

		if (text == "specialityReduceDiff") {
			return CONFIG.worldofdarkness.specialityReduceDiff;
		}

		if (text == "tenAddSuccess") {
			return CONFIG.worldofdarkness.tenAddSuccess;
		}

		if (text == "explodingDice") {
			return CONFIG.worldofdarkness.specialityReduceDiff;
		}

		if (text == "wererwolfrageSettings") {
			return CONFIG.worldofdarkness.wererwolfrageSettings;
		}		

		if (text == "viewBiotabPermission") {
			if (game.user.isGM) {
				return "full";
			}

			if (this.actor.isOwner) {
				return "full";
			}

			if (this.actor.limited) {
				return CONFIG.worldofdarkness.limitedSeeFullActor;
			}

			return CONFIG.worldofdarkness.observersSeeFullActor;
		}

		return false;
	});

	Handlebars.registerHelper("captilize", function (text) {
		return text.toUpperCase();
	});

	Handlebars.registerHelper("lowercase", function (text) {
		return text.toLowerCase();
	});

	Handlebars.registerHelper("isEmpty", function (text) {
		if (text == undefined) {
			return true;
		}

		if (text.length == 0) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("convertDamageCode", function (attribute, bonus, type) {
		let code = "";

		if ((type != undefined) && (type != "")) {
			type = game.i18n.localize(CONFIG.worldofdarkness.damageTypes[type]).charAt(0).toUpperCase();
		}
		else {
			type = "";
		}		

		if ((attribute != undefined) && (attribute != "")) {
			code = game.i18n.localize(CONFIG.worldofdarkness.attributes20[attribute]).substring(0, 3);
		}		

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
		let rageDiff = parseInt(this.actor.system.advantages.rage.roll) - parseInt(this.actor.system.advantages.willpower.roll);

		if (rageDiff < 0) {
			rageDiff = 0;
		}

		return rageDiff * -1;
	});
}
