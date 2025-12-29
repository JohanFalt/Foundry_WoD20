import { databio } from "../assets/data/bio.js";
import { dataability } from "../assets/data/ability.js";
import BonusHelper from "./scripts/bonus-helpers.js";
import ItemHelper from "./scripts/item-helpers.js";
import Functions from "./functions.js";

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

	// Define template paths to load
	const templatePaths = [
		// Actor Sheet Partials
		"systems/worldofdarkness/templates/actor/parts/description.hbs",

		"systems/worldofdarkness/templates/actor/parts/bio.hbs",
		"systems/worldofdarkness/templates/actor/parts/stats.hbs",
		"systems/worldofdarkness/templates/actor/parts/attributes.hbs",
		"systems/worldofdarkness/templates/actor/parts/abilities.hbs",
		"systems/worldofdarkness/templates/actor/parts/stats_adventages.hbs",

		

		"systems/worldofdarkness/templates/actor/parts/profile-img.html",
		"systems/worldofdarkness/templates/actor/parts/navigation.html",
		"systems/worldofdarkness/templates/actor/parts/navigation.hbs",
		"systems/worldofdarkness/templates/actor/parts/bio.html",		
		"systems/worldofdarkness/templates/actor/parts/attributes.html",		
		"systems/worldofdarkness/templates/actor/parts/abilities.html",
		
		"systems/worldofdarkness/templates/actor/parts/combat.html",
		"systems/worldofdarkness/templates/actor/parts/power.html",
		"systems/worldofdarkness/templates/actor/parts/power.hbs",
		"systems/worldofdarkness/templates/actor/parts/conditions.html",			// TODO - Seperate file?
		"systems/worldofdarkness/templates/actor/parts/movement.html",				// TODO - Seperate file?
		"systems/worldofdarkness/templates/actor/parts/macro_icons.html",
		"systems/worldofdarkness/templates/actor/parts/combat_natural.html",
		"systems/worldofdarkness/templates/actor/parts/combat_melee.html",
		"systems/worldofdarkness/templates/actor/parts/combat_ranged.html",
		"systems/worldofdarkness/templates/actor/parts/combat_armor.html",		

		"systems/worldofdarkness/templates/actor/parts/stats.html",		
		
		"systems/worldofdarkness/templates/actor/parts/creature/stats.html",
		"systems/worldofdarkness/templates/actor/parts/stats_virtue.html",		

		"systems/worldofdarkness/templates/actor/parts/hunter/stats_virtue.html",
		"systems/worldofdarkness/templates/actor/parts/demon/forms.html",
		"systems/worldofdarkness/templates/actor/parts/demon/forms.hbs",
		
		"systems/worldofdarkness/templates/actor/parts/stats_health.html",
		"systems/worldofdarkness/templates/actor/parts/stats_health_old.html",		// TODO - should be removed or reworked in future
		"systems/worldofdarkness/templates/actor/parts/gear.html",
		"systems/worldofdarkness/templates/actor/parts/notes.html",
		"systems/worldofdarkness/templates/actor/parts/effect.html",
		"systems/worldofdarkness/templates/actor/parts/settings.html",
		"systems/worldofdarkness/templates/actor/parts/settings_attribute.html",
		"systems/worldofdarkness/templates/actor/parts/settings_abilities.html",
		"systems/worldofdarkness/templates/actor/parts/settings_combat.html",
		"systems/worldofdarkness/templates/actor/parts/settings_power.html",
		"systems/worldofdarkness/templates/actor/parts/settings_sheet.html",

		// Vampire
		"systems/worldofdarkness/templates/actor/parts/vampire/bio_vampire_background.html",		

		"systems/worldofdarkness/templates/actor/parts/vampire/disciplines.html",
		"systems/worldofdarkness/templates/actor/parts/vampire/disciplines.hbs",
		"systems/worldofdarkness/templates/actor/parts/mainpower_list.hbs",
		"systems/worldofdarkness/templates/actor/parts/power_list.hbs",

		// Mage
		"systems/worldofdarkness/templates/actor/parts/mage/bio_mage_background.html",		
		"systems/worldofdarkness/templates/actor/parts/mage/stats_arete.html",			// TODO - should use the new stat function
		"systems/worldofdarkness/templates/actor/parts/mage/stats_quintessence.html",	

		"systems/worldofdarkness/templates/actor/parts/mage/magic.html",
		"systems/worldofdarkness/templates/actor/parts/mage/resonance.html",
		"systems/worldofdarkness/templates/actor/parts/mage/spheres.html",
		"systems/worldofdarkness/templates/actor/parts/mage/rotes.hbs",
		"systems/worldofdarkness/templates/actor/parts/mage/focus.html",

		// Werewolf
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

		"systems/worldofdarkness/templates/actor/parts/gifts.html",
		"systems/worldofdarkness/templates/actor/parts/gifts.hbs",
		"systems/worldofdarkness/templates/actor/parts/werewolf/gift.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/gift.hbs",
		"systems/worldofdarkness/templates/actor/parts/werewolf/rites.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/rites.hbs",

		// Changeling
		"systems/worldofdarkness/templates/actor/parts/changeling/bio_changeling_background.html",				

		"systems/worldofdarkness/templates/actor/parts/changeling/dreaming.html",
		"systems/worldofdarkness/templates/actor/parts/changeling/dreaming.hbs",

		// Hunter
		"systems/worldofdarkness/templates/actor/parts/hunter/bio_hunter_background.html",		
		
		"systems/worldofdarkness/templates/actor/parts/hunter/edges.html",
		"systems/worldofdarkness/templates/actor/parts/hunter/edges.hbs",

		// Demon
		"systems/worldofdarkness/templates/actor/parts/demon/bio_demon_background.html",	
		
		"systems/worldofdarkness/templates/actor/parts/demon/lores.html",
		"systems/worldofdarkness/templates/actor/parts/demon/lores.hbs",

		// Wraith
		"systems/worldofdarkness/templates/actor/parts/wraith/bio_wraith_background.html",
		"systems/worldofdarkness/templates/actor/parts/wraith/shadow.html",

		// Mummy
		"systems/worldofdarkness/templates/actor/parts/mummy/bio_mummy_background.html",

		// Wraith
		"systems/worldofdarkness/templates/actor/parts/wraith/death.html",
		"systems/worldofdarkness/templates/actor/parts/wraith/death.hbs",

		// Exalted
		"systems/worldofdarkness/templates/actor/parts/exalted/bio_exalted_background.html",
		"systems/worldofdarkness/templates/actor/parts/exalted/exalted_charms.hbs",

		// Orpheus
		"systems/worldofdarkness/templates/actor/parts/variant/bio_orpheus_background.html",	

		// Sorcerer
		"systems/worldofdarkness/templates/actor/parts/variant/bio_sorcerer_background.html",		
		"systems/worldofdarkness/templates/actor/parts/variant/stats_quintessence.html",	
		
		// Creature
		"systems/worldofdarkness/templates/actor/parts/creature/charms.html",		
		"systems/worldofdarkness/templates/actor/parts/creature/charms.hbs",
		"systems/worldofdarkness/templates/actor/parts/creature/power.html",
		"systems/worldofdarkness/templates/actor/parts/creature/power.hbs",

		// Item Sheet Partials
		"systems/worldofdarkness/templates/sheets/parts/power_rollable.html",
		"systems/worldofdarkness/templates/sheets/parts/power_description.html",
		"systems/worldofdarkness/templates/sheets/parts/item_bonus.html"		
	];

	/* Load the template parts */
	return foundry.applications.handlebars.loadTemplates(templatePaths);
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
		
	Handlebars.registerHelper("add", function (num1, num2) {
		return parseInt(num1) + parseInt(num2);
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

	// Handlebars.registerHelper("iff", function (a, operator, b, opts) {
	// 	var bool = false;
	// 	switch (operator) {
	// 		case "==":
	// 			bool = a == b;
	// 			break;
	// 		case ">":
	// 			bool = a > b;
	// 			break;
	// 		case "<":
	// 			bool = a < b;
	// 			break;
	// 		case ">=":
	// 			bool = parseInt(a) >= parseInt(b);
	// 			break;
	// 		case "<=":
	// 			bool = a <= b;
	// 			break;
	// 		case "!=":
	// 			bool = a != b;
	// 			break;
	// 		case "contains":
	// 			if (a && b) {
	// 				bool = a.includes(b);
	// 			} else {
	// 				bool = false;
	// 			}
	// 			break;
	// 		default:
	// 		throw "Unknown operator " + operator;
	// 	}

	// 	if (bool) {
	// 		return opts.fn(this);
	// 	} else {
	// 		return opts.inverse(this);
	// 	}
	// });

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

	Handlebars.registerHelper('SvgHtml', (icon, dice, sheettype, options) => {
		let value = dice.value;
		let color = dice.color;

		if ((options != "") && (options != undefined)) {
			sheettype = options;
		}

		if (value == 10) {
			value = 0;
		}

		if (sheettype === undefined) {
			sheettype = "mortal";
		}
		if (sheettype === "Changing Breed") {
			sheettype = "werewolf";
		}

		if (color == "black_") {
			return encodeURIComponent(game.worldofdarkness.icons["black"][icon+value]);
		}
		else {
			return encodeURIComponent(game.worldofdarkness.icons[sheettype.toLowerCase()][icon+value]);
		}

		
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

	/* get advantages box mainly used on Core (application v1) */
	Handlebars.registerHelper("getGetStatArea", function (actor, stat, statname, isrollable, ispermanent, istemporary, showbanner = true) {
		let html = "";
		let permanent_html = "";
		let temporary_html = "";
		let stat_headline_text = game.i18n.localize(`wod.advantages.${statname}`);
		let rollable = "";
		let splat = CONFIG.worldofdarkness.sheettype.mortal;
		let splat_temporary = CONFIG.worldofdarkness.sheettype.mortal;
		let path = "advantages";

		if (isrollable) {
			rollable = " vrollable";
		}

		// vampire path
		if (statname == "path") {
			if (stat.label == "custom") {
				stat_headline_text = stat.custom;
			}
			else {
				stat_headline_text = game.i18n.localize(stat.label);
			}
		}

		// wraith corpus
		if (statname == "corpus") {
			splat_temporary = CONFIG.worldofdarkness.sheettype.wraith;
		}

		// wereweolf and shifter renown
		if ((statname == "glory") || (statname == "honor") || (statname == "wisdom")) {
			path = "renown";

			splat = CONFIG.worldofdarkness.sheettype.werewolf;
			if (actor.type == CONFIG.worldofdarkness.sheettype.werewolf) {
				stat_headline_text = game.i18n.localize(actor.GetShifterRenownName(actor.system.tribe, statname));
			}
			else {
				stat_headline_text = game.i18n.localize(actor.GetShifterRenownName(actor.system.changingbreed, statname));
			}
		}		

		if (showbanner) {
			html += `<div class="sheet-headline sheet-banner-small splatFont ${rollable}" data-type="${splat}" data-key="${statname}" data-noability="true"><span class="sheet-banner-text">${stat_headline_text}</span></div>`;	
		}
		else {
			html += `<div class="sheet-headline splatFont ${rollable}" data-type="${splat}" data-key="${statname}" data-noability="true"><span class="sheet-banner-text">${stat_headline_text}</span></div>`;
		}
		

		if (ispermanent) {
			let header = `<div class="sheet-boxcontainer ${statname}"><div class="resource-value permValueRow" data-value="${stat.permanent}" data-name="${path}.${statname}.permanent">`;
			let footer = `</div></div>`;

			for (let value = 0; value <= stat.max - 1; value++) {
				if ((actor.type == CONFIG.worldofdarkness.sheettype.changeling) && (statname == "willpower")) {
					let imbalance = "";
					let imbalance_title_text = "";

					let imbalanceValue = stat.permanent - stat.imbalance;

					if ((value >= imbalanceValue) && (value < stat.permanent)) {
						imbalance = `imbalance`;
						imbalance_title_text = game.i18n.localize(`wod.advantages.imbalance`);
					}

					permanent_html += `<span class="resource-value-step ${imbalance}" title="${imbalance_title_text}" data-type="${splat}" data-key="${statname}" data-index="${value}"></span>`;
				}
				else {
					permanent_html += `<span class="resource-value-step" data-type="${splat}" data-key="${statname}" data-index="${value}"></span>`;
				}
			}
					
			permanent_html = header + permanent_html + footer;
		}		

		if (istemporary) {
			let header = `<div class="sheet-boxcontainer"><div class="resource-counter tempSquareRow" data-value="${stat.temporary}" data-name="${path}.${statname}.temporary">`;
			let footer = `</div></div>`;

			for (let value = 0; value <= stat.max - 1; value++) {				
				let mark = "";

				if ((splat_temporary === CONFIG.worldofdarkness.sheettype.wraith) && (stat.label === "wod.advantages.corpus")) {
					if (stat.temporary > value) {
						mark = "/";
					}

					if (actor.system?.listdata?.health[value] !== undefined) {
						mark = actor.system.listdata.health[value].status;
					}					
				}
				else {
					if (stat.temporary > value) {
						mark = "x";
					}
				}				

				temporary_html += `<span class="resource-value-step" data-type="${splat_temporary}" data-key="${statname}" data-index="${value}" data-state="${mark}"></span>`;
			}			

			temporary_html = header + temporary_html + footer;
		}
		
		html += permanent_html + temporary_html;

		return html;
	});

	Handlebars.registerHelper("getMainPowerList", function (actor, powertype) {
		const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.type === powertype);
		items.sort((a, b) => a.name.localeCompare(b.name));
		
		return items;
	});

	Handlebars.registerHelper("getUnsortedMainPowerList", function (actor, powertype) {
		const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.type === powertype && item?.system?.parentid === "");
		items.sort((a, b) => a.name.localeCompare(b.name));
		
		return items;
	});

	Handlebars.registerHelper("couintUnsortedMainPowerList", function (actor, powertype) {
		const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.type === powertype && item?.system?.parentid === "");
		items.sort((a, b) => a.name.localeCompare(b.name));
		
		return items.length;
	});

	Handlebars.registerHelper("getPowerList", function (actor, mainpowerId) {
		const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.parentid === mainpowerId);
		items.sort((a, b) => {
			const levelComparison = a.system.level - b.system.level;
			if (levelComparison !== 0) return levelComparison;
			return a.name.localeCompare(b.name);
		});
		
		return items;
	});

	/**
	 * Get a power list with main power and then connected sub powers to that one. E.g disciplines
	 */	
	Handlebars.registerHelper("getGetPowerList", function (locked, actor, powername, powertype, bannertext, useabilitiy) {
		let html = "";
		let addText = game.i18n.localize("wod.labels.add." + powername);
		let sendText = game.i18n.localize("wod.labels.send");
		let removebonusText = game.i18n.localize("wod.labels.power.removebonus." + powername);
		let editText = game.i18n.localize("wod.labels.edit." + powername);
		let deleteText = game.i18n.localize("wod.labels.remove." + powername);

		let addsubpowertext = game.i18n.localize("wod.labels.add." + powername + "power");

		html = 
			`<div class="sheet-headline sheet-banner splatFont" data-area="${powername}">
				<span class="sheet-banner-text">${bannertext}</span>

				<div class="pullRight pointer headlineNormal">
					<i class="icon fa-solid fa-square-plus item-create" title="${addText}" aria-hidden="true" data-itemtype="Power" data-type="${powername}"></i>
				</div>
			</div>`;

		const items = actor.items.filter(item => item.type === "Power" && item.system.type === powertype);

		items.sort((a, b) => a.name.localeCompare(b.name));

		for (const i in items) {
			let headerhtml = `<div class="item-row-area mainpower-row"><div class="clearareaBox power-row">`;
			let footerhtml = `</div></div>`;

			let descriptionhtml = "";
			
			if (items[i].system.description != "") {
				descriptionhtml = `<h3>${game.i18n.localize("wod.labels.description")}</h3> ${items[i].system.description}`;
			}

			let detailshtml = "";

			if (items[i].system.details != "") {
				detailshtml = `<h3>${game.i18n.localize("wod.labels.power.system")}</h3> ${items[i].system.details}`;
			}

			let listhtml = `<div class="pullLeft ${powername}-headline splatFont headlineGroup">${items[i].name}</div>`;					

			listhtml += `<div class="resource-value pullLeft power-dotBox" data-value="${items[i].system.value}" data-itemid="${items[i]._id}">`;

			for(let num = 0; num <= items[i].system.max - 1; num++) {
				let supernatural = "";

				if (items[i].system.max > 5) {
					supernatural = "supernaturalAttribute";
				}			

				listhtml += `<span class="${supernatural} resource-value-step" data-type="${CONFIG.worldofdarkness.sheettype.mortal}" data-index="${num}" style="margin-right: 5px;"></span>`;
			}

        	listhtml += `</div>`;	

			listhtml += `<div class="pullLeft power-iconbox">`;				// ----- POWERICONS START
				
            listhtml += 
				`<div class="pullLeft pointer">
                   	<i class="icon fa-solid fa-square-plus item-create" title="${addsubpowertext}" aria-hidden="true" data-itemtype="Power" data-type="${powername}power" data-parentid="${items[i]._id}"></i>
                </div>`;

			if ((descriptionhtml != "") || (detailshtml != "")) {
				let description = descriptionhtml + detailshtml;

				listhtml += `
					<div class="pullLeft pointer headlineNormal tooltip">
						<i class="icon fa-solid fa-memo"></i>
						<span class="tooltiptext">${description}</span>
					</div>`;
			}

			listhtml += `<div class="pullLeft pointer"><a class="send-chat" title="${sendText}" data-itemid="${items[i]._id}"><i class="icon fa-solid fa-comment-dots"></i></a></div>`;                        

			if (!locked) {
				listhtml += `
					<div class="pullLeft pointer">
						<a class="clearPower" title="${removebonusText}" data-powertype="main" data-item-id="${items[i]._id}"><i class="icon fa-solid fa-lock"></i></a>
					</div>
					<div class="pullLeft pointer">
						<a class="item-edit" title="${editText}" data-type="Power" data-item-id="${items[i]._id}"><i class="icon fa-solid fa-pen-to-square"></i></a>
					</div>
					<div class="pullLeft pointer">
						<a class="item-delete" title="${deleteText}" data-type="Power" data-item-id="${items[i]._id}"><i class="icon fa-solid fa-trash-can"></i></a>
					</div>`; 
			}

			listhtml += `</div>`;											// ----- POWERICONS END

			html += headerhtml + listhtml + footerhtml;

			let itempowers = actor.items.filter(item => item.type === "Power" && item.system.parentid === items[i]._id);
			itempowers = itempowers.sort((a, b) => {
				return a.system.level.toString().localeCompare(b.system.level.toString()) || a.name.localeCompare(b.name);
			});

			for (const p in itempowers) {
				removebonusText = game.i18n.localize("wod.labels.power.clear" + powername);
				editText = game.i18n.localize("wod.labels.edit." + powername + "power");
				deleteText = game.i18n.localize("wod.labels.remove." + powername + "power");
				let showbonusText = game.i18n.localize("wod.labels.show.bonus");

				let rollabelcss = `${powername}power-nonerollablerow`;
				let isactive = "";

				if (itempowers[p].system.isrollable) {
					rollabelcss = `${powername}power-rollablerow`;
				}

				headerhtml = `<div class="item-row-area">`;		
				footerhtml = `</div>`;

				descriptionhtml = "";
				
				if (itempowers[p].system.description != "") {
					descriptionhtml = `<h3>${game.i18n.localize("wod.labels.description")}</h3> ${itempowers[p].system.description}`;
				}

				detailshtml = "";

				if (itempowers[p].system.details != "") {
					detailshtml = `<h3>${game.i18n.localize("wod.labels.power.system")}</h3> ${itempowers[p].system.details}`;
				}

				listhtml = `<div class="clearareaBox ${powername}power-row ${rollabelcss}">`; 		// ----- ROW START

				if (itempowers[p].system.isrollable) {
					rollabelcss = `vrollable`;
				}
				if (itempowers[p].system.isactive) {
					isactive = `checked`;
				}

				listhtml += `<div class="pullLeft item-activeBox"><input class="item-active pointer" name="power.system.isactive" type="checkbox" data-item-id="${itempowers[p]._id}" data-type="isactive" ${isactive}></input></div>`;
				listhtml += `<div class="pullLeft ${powername}-headline headlineNormal ${rollabelcss}" data-type="${CONFIG.worldofdarkness.sheettype.mortal}" data-object="${powername}" data-rollitem="true" data-itemid="${itempowers[p]._id}">${itempowers[p].name}</div>`;

				if (itempowers[p].system.isrollable) {
					let dice1name = game.i18n.localize(getAttributes(itempowers[p].system.dice1));
					dice1name = game.i18n.localize(getAbility(actor, itempowers[p].system.dice1));					

					let difficultyText = itempowers[p].system.difficulty;

					if (itempowers[p].system.dice1 == "path") {
						dice1name = actor.system.advantages.path.label;
					}
					if (itempowers[p].system.dice1 == "custom") {
						if (itempowers[p].system.secondaryabilityid != "") {
							const item = actor.getEmbeddedDocument("Item", itempowers[p].system.secondaryabilityid);
							if (item == undefined) {
								console.warn("Secondary ability for power " + itempowers[p].name + " not found.");
								dice1name = game.i18n.localize("wod.dialog.power.secondarynotselected");
							}
							else {
								dice1name = item.system.label;
							}							
						}
						else {
							dice1name = game.i18n.localize("wod.dialog.power.secondarynotselected");
						}						
					}

					if (useabilitiy) {
						// TODO
					}

					if (parseInt(itempowers[p].system.difficulty) == -1) {
						difficultyText = game.i18n.localize("wod.labels.varies");
					}

					listhtml += `
						<div class="pullLeft power-dicebox headlineNormal">${dice1name}</div>
						<div class="pullLeft power-valueBox headlineNormal centerText">${difficultyText}</div>`;
				}

				listhtml += `<div class="pullLeft power-iconbox">`;				// ----- POWERICONS START
				
				if ((descriptionhtml != "") || (detailshtml != "")) {
					let description = descriptionhtml + detailshtml;

					listhtml += `
						<div class="pullLeft pointer headlineNormal tooltip">
							<i class="icon fa-solid fa-memo"></i>
							<span class="tooltiptext">${description}</span>
						</div>`;
				}

				listhtml += `<div class="pullLeft pointer"><a class="send-chat" title="${sendText}" data-itemid="${itempowers[p]._id}"><i class="icon fa-solid fa-comment-dots"></i></a></div>`;                        

				if (!locked) {
					listhtml += `
						<div class="pullLeft pointer">
							<a class="clearPower" title="${removebonusText}" data-powertype="power" data-item-id="${itempowers[p]._id}"><i class="icon fa-solid fa-lock"></i></a>
						</div>
						<div class="pullLeft pointer">
							<a class="item-edit" title="${editText}" data-type="Power" data-item-id="${itempowers[p]._id}"><i class="icon fa-solid fa-pen-to-square"></i></a>
						</div>
						<div class="pullLeft pointer">
							<a class="item-delete" title="${deleteText}" data-type="Power" data-item-id="${itempowers[p]._id}"><i class="icon fa-solid fa-trash-can"></i></a>
						</div>`; 
				}

				if (itempowers[p].system.bonuslist.length > 0) {
					let id = `collapsiblehekaubonus${p}`;
					let typeid = `${powername}${p}`;
	
					listhtml += `
						<div class="pullLeft pointer">
							<i id="${id}" class="icon collapsible button fa-solid fa-angles-right" title="${showbonusText}" data-sheet="${CONFIG.worldofdarkness.sheettype.mortal}" data-type="${typeid}"></i>
						</div>`; 
				}

				listhtml += `</div>`;											// ----- POWERICONS END

				listhtml += `</div>`;											// ----- ROW END

				listhtml += `<div class="hide bonuses ${powername}${p}" data-area="${powername}bonus${p}">`;		// ----- BONUS START

				for (const b in itempowers[p].system.bonuslist) {
					listhtml += `<div class="clearareaBox">
									<div class="pullLeft bonus-power-name headlineNormal">${itempowers[p].system.bonuslist[b].name}</div>
									<div class="pullLeft headlineNormal" style="width: 200px;">${game.i18n.localize(CONFIG.worldofdarkness.bonus[itempowers[p].system.bonuslist[b].type])}</div>
									<div class="pullLeft headlineNormal">${itempowers[p].system.bonuslist[b].value}</div>
								</div>`;
				}

				listhtml += `</div>`;																				// ----- BONUS END

				html += headerhtml + listhtml + footerhtml;
			}
		}

		return html;
	});

	/* exalted */
	Handlebars.registerHelper("getExaltedCharmTypes", function (actor, categoryname, powertype) {
		const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.type === powertype);

		if (Array.isArray(items)) {
			const uniqueVariants = [
				...new Set(
				items
					.map(item => {
						return item.system?.[categoryname] !== undefined ? item.system[categoryname] : null;
					})
					.filter(value => value !== null) // Ta bort null-värden som inte finns
				)
			];

			return uniqueVariants;
		}
	});

	Handlebars.registerHelper("getExaltedCharm", function (actor, categoryname, unique) {
		let charms = [];
		charms = actor?.items.filter(item => item.system?.[categoryname] === unique);

		console.log(charms);

		return charms;		
	});

	// Handlebars.registerHelper("getGetPowers", function (locked, actor, categoryname, powername, powertype, bannertext, useabilitiy) {
	// 	let html = "";
	// 	let headerhtml = `<div class="sheet-area flex-columns"><div class="sheet-headline sheet-banner splatFont" data-area="${powername}list"><span class="sheet-banner-text">${bannertext}</span></div>`;
	// 	let listhtml = "";
	// 	let footerhtml = `</div>`;

	// 	const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.type === powertype);

	// 	if (Array.isArray(items)) {
	// 		const uniqueVariants = [
	// 		  		...new Set(
	// 				items
	// 			  		.map(item => {
	// 						return item.system?.[categoryname] !== undefined ? item.system[categoryname] : null;
	// 			  		})
	// 			  		.filter(value => value !== null) // Ta bort null-värden som inte finns
	// 		  		)
	// 			];
			
	// 		let powers = [];

	// 		// if category isn't used by the power
	// 		if (uniqueVariants.length == 0) {
	// 			uniqueVariants.push("");
	// 		}

	// 		for (const unique of uniqueVariants) {
	// 			let addText = game.i18n.localize("wod.labels.add." + powername);
	// 			let removebonusText = game.i18n.localize("wod.labels.power.removebonus." + powername);
	// 			let sendText = game.i18n.localize("wod.labels.send");
	// 			let editText = game.i18n.localize("wod.labels.edit." + powername);
	// 			let deleteText = game.i18n.localize("wod.labels.remove." + powername);
	// 			let uniquetext = unique.replace(/[.,?]/g, "");

	// 			let showbonusText = game.i18n.localize("wod.labels.show.bonus");

	// 			let i = 0;

	// 			// no inner seperation of power
	// 			if (unique == "") {
	// 				powers = items;
	// 			}
	// 			else {
	// 				listhtml += `<div class="headlineRow splatFont">${game.i18n.localize(unique)}</div>`;
	// 				powers = items.filter(item => item.system?.[categoryname] === unique);	
	// 			}				

	// 			powers = powers.sort((a, b) => {
	// 				if (a.system?.level < b.system?.level) return -1;
	// 				if (a.system?.level > b.system?.level) return 1;
				  
	// 				return a.name.localeCompare(b.name);
	// 		  	});				

	// 			for (const power of powers) {
					
	// 				let descriptionhtml = "";
			
	// 				if (power.system.description != "") {
	// 					descriptionhtml = `<h3>${game.i18n.localize("wod.labels.description")}</h3> ${power.system.description}`;
	// 				}

	// 				let detailshtml = "";

	// 				if (power.system.details != "") {
	// 					detailshtml = `<h3>${game.i18n.localize("wod.labels.power.system")}</h3> ${power.system.details}`;
	// 				}

	// 				let isactive = '';
	// 				let rollablerow = powername + '-row';
	// 				let rollabelcss = '';

	// 				if (power.system.isrollable) {
	// 					rollablerow = powername + '-rollablerow';
	// 				}
	// 				else {
	// 					rollablerow = powername + '-nonerollablerow';
	// 				}
					
	// 				if (power.system.isrollable) {
	// 					rollabelcss = `vrollable`;
	// 				}

	// 				if (power.system.isactive) {
	// 					isactive = `checked`;
	// 				}					

	// 				listhtml += `<div class="item-row-area" data-area="${uniquetext}row${i}">
	// 								<div class="clearareaBox ${rollablerow}">
	// 									<div class="pullLeft item-activeBox"><input class="item-active pointer" name="item.system.isactive" type="checkbox" data-item-id="${power._id}" data-type="isactive" ${isactive}></input></div>
	// 									<div class="pullLeft ${powername}-headlineBox headlineNormal ${rollabelcss}" data-type="${CONFIG.worldofdarkness.sheettype.mortal}" data-object="${powername}" data-rollitem="true" data-itemid="${power._id}">${power.name}</div>`;
					
	// 				listhtml += `<div class="pullLeft numberBox">${(power.system.level > 0) ? power.system.level : "&nbsp;"}</div>`;

	// 				if (power.system.isrollable) {
	// 					let dice1name = game.i18n.localize(getAttributes(power.system.dice1));
	// 					let dice2name = "";
	
	// 					if (power.system.dice1 == "path") {
	// 						dice1name = actor.system.advantages.path.label;
	// 					}
	
	// 					if (useabilitiy) {
	// 						dice2name = game.i18n.localize(getAbility(actor, power.system.dice2));
	// 					}						
	
	// 					let difficultyText = power.system.difficulty;

	// 					if (parseInt(power.system.difficulty) == -1) {
	// 						difficultyText = game.i18n.localize("wod.labels.varies");
	// 					}
	
	// 					listhtml += `
	// 						<div class="pullLeft power-dicebox headlineNormal">${dice1name}</div>
	// 						<div class="pullLeft power-dicebox headlineNormal">${dice2name}</div>
	// 						<div class="pullLeft power-valueBox headlineNormal centerText">${difficultyText}</div>`;
	// 				}
	// 				else {
	// 					listhtml += `<div class="pullLeft">&nbsp;</div>`;
	// 				}

	// 				listhtml += `<div class="pullLeft power-iconbox">`;				// ----- POWERICONS START
				
	// 				if ((descriptionhtml != "") || (detailshtml != "")) {
	// 					let description = descriptionhtml + detailshtml;

	// 					listhtml += `
	// 						<div class="pullLeft pointer headlineNormal tooltip">
	// 							<i class="icon fa-solid fa-memo"></i>
	// 							<span class="tooltiptext">${description}</span>
	// 						</div>`;
	// 				}

	// 				listhtml += `<div class="pullLeft pointer"><a class="send-chat" title="${sendText}" data-itemid="${power._id}"><i class="icon fa-solid fa-comment-dots"></i></a></div>`;                        

	// 				if (!locked) {
	// 					listhtml += `
	// 						<div class="pullLeft pointer">
	// 							<a class="clearPower" title="${removebonusText}" data-powertype="power" data-item-id="${power._id}"><i class="icon fa-solid fa-lock"></i></a>
	// 						</div>
	// 						<div class="pullLeft pointer">
	// 							<a class="item-edit" title="${editText}" data-type="Power" data-item-id="${power._id}"><i class="icon fa-solid fa-pen-to-square"></i></a>
	// 						</div>
	// 						<div class="pullLeft pointer">
	// 							<a class="item-delete" title="${deleteText}" data-type="Power" data-item-id="${power._id}"><i class="icon fa-solid fa-trash-can"></i></a>
	// 						</div>`; 
	// 				}

	// 				if (power.system.bonuslist.length > 0) {
	// 					let id = `collapsiblehekaubonus${i}`;
	// 					let typeid = `${powername}${i}`;
		
	// 					listhtml += `
	// 						<div class="pullLeft pointer">
	// 							<i id="${id}" class="icon collapsible button fa-solid fa-angles-right" title="${showbonusText}" data-sheet="${CONFIG.worldofdarkness.sheettype.mortal}" data-type="${typeid}"></i>
	// 						</div>`; 
	// 				}

	// 				listhtml += `</div>`;											// ----- POWERICONS END

	// 				listhtml += `</div>`;											// ----- ROW END

	// 				listhtml += `<div class="hide bonuses ${powername}${i}" data-area="${powername}bonus${i}">`;		// ----- BONUS START

	// 				for (const b in power.system.bonuslist) {
	// 					listhtml += `<div class="clearareaBox">
	// 									<div class="pullLeft bonus-power-name headlineNormal">${power.system.bonuslist[b].name}</div>
	// 									<div class="pullLeft headlineNormal" style="width: 200px;">${game.i18n.localize(CONFIG.worldofdarkness.bonus[power.system.bonuslist[b].type])}</div>
	// 									<div class="pullLeft headlineNormal">${power.system.bonuslist[b].value}</div>
	// 								</div>`;
	// 				}

	// 				listhtml += `</div>`;											// ----- BONUS END

	// 				listhtml += `</div>`;

	// 				i = i + 1;
	// 			}
	// 		}			
	// 	} 
	// 	else {
	// 		console.error("items is not an array or undefined");
	// 	}

	// 	html += headerhtml + listhtml + footerhtml;

	// 	return html;
	// });

	/* Get the tooltip graphics */
	Handlebars.registerHelper("getToolTip", function (description, detail, bonuses, actor) {
		let listhtml = "";
		let descriptionhtml = "";
				
		if (description != "") {
			descriptionhtml = `<h3>${game.i18n.localize("wod.labels.description")}</h3> ${description}`;
		}

		let detailshtml = "";

		if ((detail != "") || (bonuses != undefined)) {
			detailshtml = `<h3>${game.i18n.localize("wod.labels.power.system")}</h3> ${detail}`;

			if ((bonuses != undefined) && (bonuses.length > 0)) {
				detailshtml += "<table><tr><td>"+game.i18n.localize("wod.labels.type")+"</td><td>"+game.i18n.localize("wod.effects.area")+"</td><td>"+game.i18n.localize("wod.labels.modifier")+"</td><tr>";
				for (const bonus of bonuses) {
					detailshtml += "<tr><td>" + game.i18n.localize(CONFIG.worldofdarkness.bonus[bonus.type]) + "</td><td>" + game.i18n.localize(getAbility(actor, game.i18n.localize(getAttributes(bonus.settingtype)))) + "</td><td>" + bonus.value + "</td></tr>";
				}
				detailshtml += "</table>";
			}			
		}

		if ((descriptionhtml != "") || (detailshtml != "")) {
			let description = descriptionhtml + detailshtml;

			listhtml = `
				<div class="pointer tooltip">
					<i class="icon fa-solid fa-memo"></i>
					<span class="tooltiptext">${description}</span>
				</div>`;
		}

		return listhtml;
	});

	Handlebars.registerHelper("showToolTip", function (item) {
		if (item?.system?.bonuslist?.length > 0) return true;
		if (item?.system?.description !== "") return true;
		if (item?.system?.details !== "") return true;

		return false;
	});

	Handlebars.registerHelper("getToolTip_v2", function (description, detail, bonuses, actor) {
		let descriptionhtml = "";
				
		if (description != "") {
			descriptionhtml = `<div class="headlineList">${game.i18n.localize("wod.labels.description")}</div><div class="tooltipText">${description}</div>`;
		}

		let detailshtml = "";

		if ((detail !== "") || (bonuses?.length > 0)) {
			detailshtml = `<div class="headlineList">${game.i18n.localize("wod.labels.power.system")}</div><div class="tooltipText">${detail}</div>`;

			if (bonuses?.length > 0) {
				detailshtml += `<table><tr><th style="text-align: left;">${game.i18n.localize("wod.labels.type")}</th><th style="text-align: left;">${game.i18n.localize("wod.effects.area")}</th><th>${game.i18n.localize("wod.labels.modifier")}</th><tr>`;
				for (const bonus of bonuses) {
					detailshtml += `<tr><td>${game.i18n.localize(CONFIG.worldofdarkness.bonus[bonus.type])}</td><td>${game.i18n.localize(getAbility(actor, game.i18n.localize(getAttributes(bonus.settingtype))))}</td><td style="text-align: center;">${bonus.value}</td></tr>`;
				}
				detailshtml += `</table>`;
			}			
		}

		return descriptionhtml + detailshtml;
	});

	/* Handlebars.registerHelper("getToolTipRote", function (description, detail, actor, item) {
		let listhtml = "";
		let descriptionhtml = "";
				
		if (description != "") {
			descriptionhtml = `<h3>${game.i18n.localize("wod.labels.description")}</h3> ${description}`;
		}

		let detailshtml = "";

		if (detail != "") {
			detailshtml = `<h3>${game.i18n.localize("wod.labels.power.system")}</h3> ${detail}`;					
		}

		if ((descriptionhtml != "") || (detailshtml != "")) {
			let description = descriptionhtml + detailshtml;
			let spheredescription = "";

			if (item.system.correspondence > 0) {
				spheredescription += `<div>${game.i18n.localize(actor.system.spheres.correspondence.label)} (${item.system.correspondence})</div>`;
			}
			if (item.system.entropy > 0) {
				spheredescription += `<div>${game.i18n.localize(actor.system.spheres.entropy.label)} (${item.system.entropy})</div>`;
			}
			if (item.system.forces > 0) {
				spheredescription += `<div>${game.i18n.localize(actor.system.spheres.forces.label)} (${item.system.forces})</div>`;
			}
			if (item.system.life > 0) {
				spheredescription += `<div>${game.i18n.localize(actor.system.spheres.life.label)} (${item.system.life})</div>`;
			}
			if (item.system.matter > 0) {
				spheredescription += `<div>${game.i18n.localize(actor.system.spheres.matter.label)} (${item.system.matter})</div>`;
			}
			if (item.system.mind > 0) {
				spheredescription += `<div>${game.i18n.localize(actor.system.spheres.mind.label)} (${item.system.mind})</div>`;
			}
			if (item.system.prime > 0) {
				spheredescription += `<div>${game.i18n.localize(actor.system.spheres.prime.label)} (${item.system.prime})</div>`;
			}
			if (item.system.spirit > 0) {
				spheredescription += `<div>${game.i18n.localize(actor.system.spheres.spirit.label)} (${item.system.spirit})</div>`;
			}
			if (item.system.time > 0) {
				spheredescription += `<div>${game.i18n.localize(actor.system.spheres.time.label)} (${item.system.time})</div>`;
			}

			description += spheredescription;

			listhtml = `
				<div class="pullLeft pointer headlineNormal tooltip">
					<i class="icon fa-solid fa-memo"></i>
					<span class="tooltiptext">${description}</span>
	
				</div>`;
		}

		return listhtml;
	}); */

	Handlebars.registerHelper("getConnectedItemList", function (actor, type, variant, parentid) {
		let list = [];
		let items = (actor.items.filter(i => i.type === type && i.system.type === variant && i.system.parentid === parentid));

		if (items != undefined) {
			return items;
		}

		return list;
	});

	/* TRUE / FALSE if a list is empty */
	Handlebars.registerHelper("listNotEmpty", function (list) {
		return list.length > 0;
	});

	Handlebars.registerHelper("getAttributes", function (attribute) {
		return getAttributes(attribute);
	});

	Handlebars.registerHelper("getSecondaryAbility", function (ability, actor, id) {
		let abilityName = game.i18n.localize("wod.labels.power.noabilityselected");

		if ((ability == "custom") && (id != "") ) {
			const item = actor.getEmbeddedDocument("Item", id);

			if (item !== undefined) {
				abilityName = item.system.label;
			}
		}

		return abilityName;
	});

	/* returns a list of a particular items sorted */
	/* Handlebars.registerHelper("getItemList", function (actor, itemtype, itemcategory) {
		const items = (actor.items.filter(i => i.type === itemtype && i.system.type === itemcategory));
		return items.sort((a, b) => a.name.localeCompare(b.name));
	}); */

	/* get all bonuses */
	Handlebars.registerHelper("getBonuses", function (actor, type, sort) {
		let bonuslist = [];

		if (type != "") {
			return BonusHelper.GetAllAttributeBonus(actor, bonuslist, type);
		}

		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_diff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_dice_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_auto_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "ability_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "ability_diff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "soak_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "soak_diff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "health_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "initiative_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "movement_buff");
		
		return bonuslist;
	});

	Handlebars.registerHelper("getItems", function (actor) {
		return ItemHelper.GetAllItems(actor);
	});

	Handlebars.registerHelper("getItemType", function (actor, itemtype, itemcategory = "") {
		return ItemHelper.GetItemType(actor, itemtype, itemcategory);
	});

	Handlebars.registerHelper("getNotes", function (actor) {
		return ItemHelper.GetAllNotes(actor);
	});

	Handlebars.registerHelper("getEarnedExperience", function (actor) {
		return ItemHelper.GetEarnedExperience(actor);
	});

	Handlebars.registerHelper("getSpendExperience", function (actor) {
		return ItemHelper.GetSpendExperience(actor);
	});

	Handlebars.registerHelper("getTotalExperience", function (actor, type) {
		const earnedExp = ItemHelper.GetEarnedExperience(actor);
		const spendExp = ItemHelper.GetSpendExperience(actor);
		

		if (type == "total") {
			let earned = 0;
			let spent = 0;
			earnedExp.forEach(item => 
				earned += parseInt(item.system.amount));
			spendExp.forEach((item) => {
				if (item.system.isspent) {
					spent += parseInt(item.system.amount);
				}
			});

			return earned - spent;
		}
		if (type == "earned") {
			let earned = 0;
			earnedExp.forEach(item => earned += parseInt(item.system.amount));
			return earned;
		}
		if (type == "spent") {
			let spent = 0;
			spendExp.forEach((item) => {
				if (item.system.isspent) {
					spent += parseInt(item.system.amount);
				}
			});
			return spent;
			
		}
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

	Handlebars.registerHelper("showAbility", function (ability, abilityType, actor) {
		const sheetType = actor.type;
		const variant = actor.system.settings.variant;

		if (ability == "research") {
			if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)) && 
					((sheetType == CONFIG.worldofdarkness.sheettype.mortal) && (variant == 'sorcerer')) &&
					(abilityType == "skills")) {
				return false;
			}
			else if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)||(sheetType == CONFIG.worldofdarkness.sheettype.mummy)) && 
					((sheetType == CONFIG.worldofdarkness.sheettype.mortal) && (variant == 'sorcerer')) &&
					(abilityType == "knowledges")) {
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
			if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.mage)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)||(sheetType == CONFIG.worldofdarkness.sheettype.mummy)||
					((sheetType == CONFIG.worldofdarkness.sheettype.mortal) && ((variant == 'orpheus') || (variant == 'sorcerer'))) && 
					(abilityType == "skills"))) {
				return true;
			}
			else if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.mage)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)||(sheetType == CONFIG.worldofdarkness.sheettype.mummy)||
					((sheetType == CONFIG.worldofdarkness.sheettype.mortal) && ((variant == 'orpheus') || (variant == 'sorcerer'))) && 
					(abilityType == "knowledges"))) {
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
		let specialityLevel = 4;

		if (ability.id != undefined) {
			id = ability.id;
		}

		if ((CONFIG.worldofdarkness.specialityLevel != undefined) && (Functions.isNumber(CONFIG.worldofdarkness.specialityLevel))) {
			specialityLevel = parseInt(CONFIG.worldofdarkness.specialityLevel);
		}

		if (ability.value >= specialityLevel) {
			hasSpeciality = true;
		}
		else if (ability.value >= 1) {
			hasSpeciality = CONFIG.worldofdarkness.alwaysspeciality.includes(id); 			
		}		

		return hasSpeciality;
	});

	Handlebars.registerHelper("shifterHasForm", function (actor, form) {
		if (actor.system.shapes[form].isactive) {
			return true;
		}
		else {
			return false;
		}
	});

	/* Handlebars.registerHelper("getShifterRenown", function (actor, type, renown) {
		return actor.GetShifterRenownName(type, renown);
	}); */

	Handlebars.registerHelper("getShifterRank", function (actor) {
		return actor.GetShifterRank();
	});

	/**
	 * Fetches the total bonus a shifter have on the sheet and return the value
	 * @param actor 		- the actor in itself
	 * @param form			- the form you wish to fetch value from (homid, glabro, crinos, hispo, lupus)
	 * @param attribute		- the attribute searched for
	 * @param istext		- TRUE / FALSE if the return is to be a STRING or integer
	 * @return {Promise}
	 */
	Handlebars.registerHelper("getShifterAttrbuteBonus", function (actor, form, attribute, istext) {
		const type = "Bonus";

		let items = (actor.items.filter(i => i.type === type && i.system.parentid === form && i.system.settingtype === attribute));

		if (items.length == 0) {
			return "0";
		}

		if (istext) {
			if (items[0].system.value > 0) {
				return "+" + items[0].system.value;
			}
		}
		
		return items[0].system.value;
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

	Handlebars.registerHelper("getInjuredLevel", function (type, health) {
		let totalDamage = health.damage.bashing + health.damage.lethal + health.damage.aggravated;
		if (totalDamage == 0) return game.i18n.localize("wod.health.uninjured");

		totalDamage = totalDamage - health.bruised.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.bruised");

		totalDamage = totalDamage - health.hurt.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.hurt");

		totalDamage = totalDamage - health.injured.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.injured");

		totalDamage = totalDamage - health.wounded.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.wounded");

		totalDamage = totalDamage - health.mauled.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.mauled");

		totalDamage = totalDamage - health.crippled.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.crippled");

		if (type != CONFIG.worldofdarkness.sheettype.mummy) {
			return game.i18n.localize("wod.health.incapacitated");
		}

		totalDamage = totalDamage - health.damage.bashing;
		
		if (totalDamage <= 1) return game.i18n.localize("wod.health.incapacitated");
		if (totalDamage == 2) return game.i18n.localize("wod.health.broken");
		if (totalDamage == 3) return game.i18n.localize("wod.health.crushed");
		if (totalDamage == 4) return game.i18n.localize("wod.health.dismembered");
		if (totalDamage == 5) return game.i18n.localize("wod.health.pulverized");
		if (totalDamage >= 6) return game.i18n.localize("wod.health.dust");
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

	// Handlebars.registerHelper("checkProperty", function (properties, name, value) {
	// 	if (properties.length == 0) {
	// 		return false;
	// 	}

	// 	if (properties[name] == undefined) {
	// 		return false;
	// 	}

	// 	if (properties[name] == value) {
	// 		return true;
	// 	}

	// 	return false;
	// });

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

			if ((era == CONFIG.worldofdarkness.era.darkages) || (era == CONFIG.worldofdarkness.era.classical) || (era == CONFIG.worldofdarkness.era.livinggods)) {
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

		if (text == "fifthEditionWillpowerSetting") {
			return CONFIG.worldofdarkness.fifthEditionWillpowerSetting;
		}

		if (text == "willpowerBonusDice") {
			return CONFIG.worldofdarkness.willpowerBonusDice;
		}

		if (text == "rollSettings") {
			return CONFIG.worldofdarkness.rollSettings;
		}

		if (text == "specialityLevel") {
			return CONFIG.worldofdarkness.specialityLevel;
		}

		if (text == "theRollofOne") {
			return CONFIG.worldofdarkness.handleOnes;
		}

		if (text == "useOnesDamage") {
			return CONFIG.worldofdarkness.useOnesDamage;
		}

		if (text == "usePenaltyDamage") {
			return CONFIG.worldofdarkness.usePenaltyDamage;
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

		if (text == "specialityAllowBotch") {
			return CONFIG.worldofdarkness.specialityAllowBotch;
		}	

		if (text == "specialityAllowBotch") {
			return CONFIG.worldofdarkness.specialityAllowBotch;
		}	
		
		if (text == "tenAddSuccess") {
			return CONFIG.worldofdarkness.tenAddSuccess;
		}

		if (text == "explodingDice") {
			return CONFIG.worldofdarkness.explodingDice;
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

	// Handlebars.registerHelper("ragePenalty", function (value) {
	// 	let rageDiff = parseInt(this.actor.system.advantages.rage.roll) - parseInt(this.actor.system.advantages.willpower.roll);

	// 	if (rageDiff < 0) {
	// 		rageDiff = 0;
	// 	}

	// 	return rageDiff * -1;
	// });

	Handlebars.registerHelper("calculateHight", function (area, list) {
		if (area == "rotes") {
			if (list.length < 26) {
				return "max-height: 350px";
			}
			else {
				const height = Math.ceil(350 / 25 *list.length);

				return "max-height: " + height + "px";
			}
		}
	});

	function getAttributes(attribute) {
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
	}

	function getAbility(actor, ability) {
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
	}
}
