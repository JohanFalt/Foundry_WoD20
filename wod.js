import * as migration from "./module/migration.js";

import { wod } from "./module/config.js";
import { systemSettings } from "./module/settings.js";
import * as templates from "./module/templates.js";

import * as WoDSetup from "./module/scripts/wodsetup.js";

import { MortalActorSheet } from "./module/actor/mortal-actor-sheet.js";
import { WerewolfActorSheet } from "./module/actor/werewolf-actor-sheet.js";
import { MageActorSheet } from "./module/actor/mage-actor-sheet.js";
import { VampireActorSheet } from "./module/actor/vampire-actor-sheet.js";
import { ChangelingActorSheet } from "./module/actor/changeling-actor-sheet.js";
import { HunterActorSheet } from "./module/actor/hunter-actor-sheet.js";
import { DemonActorSheet } from "./module/actor/demon-actor-sheet.js";
import { WraithActorSheet } from "./module/actor/wraith-actor-sheet.js";
import { ChangingBreedActorSheet } from "./module/actor/changingbreed-actor-sheet.js";
import { SpiritActorSheet } from "./module/actor/spirit-actor-sheet.js";
import { CreatureActorSheet } from "./module/actor/creature-actor-sheet.js";
import { tourSetup } from './tours/toursetup.js';

import { WoDItemSheet } from "./module/items/item-sheet.js";

import { DialogGeneralRoll, GeneralRoll } from "./module/dialogs/dialog-generalroll.js";

import IconHelper from "./module/scripts/icons.js";

const SheetTypes = [
	"Mortal",
	"Werewolf",			
	"Mage",
	"Vampire",
	"Changeling",
	"Hunter",
	"Demon",
	"Wraith",
	"Changing Breed"
];
const AdversaryTypes = [
	"Creature",
	"Spirit"	
];
const PowerCreationItemTypes = [
	"Power",
	"Rote"
];
const CharacterCreationItemTypes = [
	"Bonus",
	"Experience",
	"Feature",	
	"Trait"
];
const EquipmentItemTypes = [
	"Armor",
	"Melee Weapon",
	"Ranged Weapon",
	"Fetish",
	"Item"
];

Hooks.once("init", async function() {
	console.log("WoD | Initialising World of Darkness System");

	// Register System Settings
	systemSettings();

	console.log("WoD | Settings registered");
	
	CONFIG.worldofdarkness = wod;
	CONFIG.worldofdarkness.attributeSettings = game.settings.get("worldofdarkness", "attributeSettings");
	CONFIG.worldofdarkness.fifthEditionWillpowerSetting = game.settings.get("worldofdarkness", "fifthEditionWillpowerSetting");
	CONFIG.worldofdarkness.rollSettings = game.settings.get('worldofdarkness', 'advantageRolls');
	CONFIG.worldofdarkness.demonSystemSettings = game.settings.get('worldofdarkness', 'demonSystemSettings');
	CONFIG.worldofdarkness.hunteredgeSettings = game.settings.get('worldofdarkness', 'hunteredgeSettings');
	CONFIG.worldofdarkness.wererwolfrageSettings = game.settings.get('worldofdarkness', 'wererwolfrageSettings');
	CONFIG.worldofdarkness.darkmode = game.settings.get('worldofdarkness', 'darkMode');

	// Roll settings
	try {
		CONFIG.worldofdarkness.handleOnes = game.settings.get('worldofdarkness', 'theRollofOne');
	} 
	catch (e) {
		CONFIG.worldofdarkness.handleOnes = true;
	}

	try {
		CONFIG.worldofdarkness.useOnesDamage = game.settings.get('worldofdarkness', 'useOnesDamage');
	} 
	catch (e) {
		CONFIG.worldofdarkness.useOnesDamage = false;
	}

	try {
		CONFIG.worldofdarkness.usePenaltyDamage = game.settings.get('worldofdarkness', 'usePenaltyDamage');
	} 
	catch (e) {
		CONFIG.worldofdarkness.usePenaltyDamage = false;
	}

	try {
		CONFIG.worldofdarkness.useOnesSoak = game.settings.get('worldofdarkness', 'useOnesSoak');
	} 
	catch (e) {
		CONFIG.worldofdarkness.useOnesSoak = false;
	}

	try {
		CONFIG.worldofdarkness.lowestDifficulty = parseInt(game.settings.get('worldofdarkness', 'lowestDifficulty'));
	} 
	catch (e) {
		CONFIG.worldofdarkness.lowestDifficulty = 2;
	}

	try {
		CONFIG.worldofdarkness.specialityAddSuccess = parseInt(game.settings.get('worldofdarkness', 'specialityAddSuccess'));
		CONFIG.worldofdarkness.usespecialityAddSuccess = parseInt(game.settings.get('worldofdarkness', 'specialityAddSuccess')) > 0;
	} 
	catch (e) {
		CONFIG.worldofdarkness.specialityAddSuccess = 2;
		CONFIG.worldofdarkness.usespecialityAddSuccess = true;
	}

	try {
		CONFIG.worldofdarkness.specialityReduceDiff = parseInt(game.settings.get('worldofdarkness', 'specialityReduceDiff'));
		CONFIG.worldofdarkness.usespecialityReduceDiff = parseInt(game.settings.get('worldofdarkness', 'specialityReduceDiff')) > 0;
	} 
	catch (e) {
		CONFIG.worldofdarkness.specialityReduceDiff = 0;
		CONFIG.worldofdarkness.usespecialityReduceDiff = false;
	}

	try {
		CONFIG.worldofdarkness.tenAddSuccess = parseInt(game.settings.get('worldofdarkness', 'tenAddSuccess'));
		CONFIG.worldofdarkness.usetenAddSuccess = parseInt(game.settings.get('worldofdarkness', 'tenAddSuccess')) > 0;
	} 
	catch (e) {
		CONFIG.worldofdarkness.tenAddSuccess = 0;
		CONFIG.worldofdarkness.usetenAddSuccess = false;
	}	

	try {
		CONFIG.worldofdarkness.explodingDice = game.settings.get('worldofdarkness', 'explodingDice');
		CONFIG.worldofdarkness.useexplodingDice = game.settings.get('worldofdarkness', 'explodingDice') != "never";
	} 
	catch (e) {
		CONFIG.worldofdarkness.explodingDice = "never";
		CONFIG.worldofdarkness.useexplodingDice = false;
	}

	// Era settings
	try {
		CONFIG.worldofdarkness.defaultMortalEra = game.settings.get('worldofdarkness', 'eraMortal');
		CONFIG.worldofdarkness.defaultMageEra = game.settings.get('worldofdarkness', 'eraMage');
		CONFIG.worldofdarkness.defaultVampireEra = game.settings.get('worldofdarkness', 'eraVampire');
		CONFIG.worldofdarkness.defaultWerewolfEra = game.settings.get('worldofdarkness', 'eraWerewolf');
	} 
	catch (e) {
		CONFIG.worldofdarkness.defaultMortalEra = "modern";
		CONFIG.worldofdarkness.defaultMageEra = "modern";
		CONFIG.worldofdarkness.defaultVampireEra = "modern";
		CONFIG.worldofdarkness.defaultWerewolfEra = "modern";
	}

	CONFIG.worldofdarkness.observersSeeFullActor = game.settings.get('worldofdarkness', 'observersFullActorViewPermission');
	CONFIG.worldofdarkness.limitedSeeFullActor = game.settings.get('worldofdarkness', 'limitedFullActorViewPermission');

	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	
	Actors.registerSheet("WoD", MortalActorSheet, {
		label: game.i18n.localize("wod.sheet.mortal"),
		types: ["Mortal"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", WerewolfActorSheet, {
		label: game.i18n.localize("wod.sheet.werewolf"),
		types: ["Werewolf"],
		makeDefault: true
	});	

	Actors.registerSheet("WoD", MageActorSheet, {
		label: game.i18n.localize("wod.sheet.mage"),
		types: ["Mage"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", VampireActorSheet, {
		label: game.i18n.localize("wod.sheet.vampire"),
		types: ["Vampire"],
		makeDefault: true
	});
	
	Actors.registerSheet("WoD", ChangelingActorSheet, {
		label: game.i18n.localize("wod.sheet.changeling"),
		types: ["Changeling"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", HunterActorSheet, {
		label: game.i18n.localize("wod.sheet.hunter"),
		types: ["Hunter"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", DemonActorSheet, {
		label: game.i18n.localize("wod.sheet.demon"),
		types: ["Demon"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", WraithActorSheet, {
		label: game.i18n.localize("wod.sheet.wraith"),
		types: ["Wraith"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", ChangingBreedActorSheet, {
		label: game.i18n.localize("wod.sheet.breed"),
		types: ["Changing Breed"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", CreatureActorSheet, {
		label: game.i18n.localize("wod.sheet.creature"),
		types: ["Creature"],
		makeDefault: true
	});	

	Actors.registerSheet("WoD", SpiritActorSheet, {
		label: game.i18n.localize("wod.sheet.spirit"),
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
	
	templates.preloadHandlebarsTemplates();
	templates.registerHandlebarsHelpers();	

	console.log("WoD | Added Handelebars");

	game.worldofdarkness = {
		powers: WoDSetup.getInstalledPowers(game.data.items)
	};

	game.worldofdarkness.abilities = templates.SetupAbilities();
	game.worldofdarkness.bio = templates.SetupBio();

	console.log("WoD | Added Settings");  

	game.worldofdarkness.icons = {};

	for (const race in CONFIG.worldofdarkness.sheettype) {
		game.worldofdarkness.icons[race] = {};

		let iconlist = {
			bio: IconHelper.GetIcon("bio", race),
			stats: IconHelper.GetIcon("stats", race),
			magic: IconHelper.GetIcon("magic", race),
			discipline: IconHelper.GetIcon("discipline", race),
			shapechange: IconHelper.GetIcon("shapechange", race),
			death: IconHelper.GetIcon("death", race),
			charms: IconHelper.GetIcon("charms", race),
			gift: IconHelper.GetIcon("gift", race),
			dreaming: IconHelper.GetIcon("dreaming", race),
			edge: IconHelper.GetIcon("edge", race),
			lore: IconHelper.GetIcon("lore", race),
			power: IconHelper.GetIcon("power", race),
			combat: IconHelper.GetIcon("combat", race),
			gear: IconHelper.GetIcon("gear", race),
			note: IconHelper.GetIcon("note", race),
			settings: IconHelper.GetIcon("settings", race),
			dice: IconHelper.GetIcon("dice", race)
		}

		Object.assign(game.worldofdarkness.icons[race], iconlist);
	}	

	Handlebars.registerHelper('dtSvgDie', (icon, sheettype, options) => {
		const context = sheettype.toLowerCase().replace(" ", "") + "_" + icon.toLowerCase();

		return `${context}Svg`;
	});
	
	// Register dice partials.
	for (let [race, iconlist] of Object.entries(game.worldofdarkness.icons)) {
		for (let icon of Object.entries(iconlist)) {
			Handlebars.registerPartial(`${race}_${icon[0]}Svg`, icon[1]);
		}
	}

	

	console.log("WoD | Icons added"); 
});

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
    // Do anything after initialization but before ready

	

	/* CONFIG.fontDefinitions["Mortal"] = {
		editor: true,
		fonts: [{
			urls: ["systems/worldofdarkness/assets/fonts/times.ttf"]
		}]
	};
	CONFIG.fontDefinitions["Changeling"] = {
		editor: true,
		fonts: [{
			urls: ["systems/worldofdarkness/assets/fonts/Umb000.ttf"]
		}]
	};
	CONFIG.fontDefinitions["Vampire"] = {
		editor: true,
		fonts: [{
			urls: ["systems/worldofdarkness/assets/fonts/percexp.ttf"]
		}]
	};
	CONFIG.fontDefinitions["Mage"] = {
		editor: true,
		fonts: [{
			urls: ["systems/worldofdarkness/assets/fonts/visit.TTF"]
		}]
	};
	CONFIG.fontDefinitions["Werewolf"] = {
		editor: true,
		fonts: [{
			urls: ["systems/worldofdarkness/assets/fonts/werewolf.ttf"]
		}]
	};
	CONFIG.fontDefinitions["Hunter"] = {
		editor: true,
		fonts: [{
			urls: ["systems/worldofdarkness/assets/fonts/hunter.ttf"]
		}]
	};
	CONFIG.fontDefinitions["Demon"] = {
		editor: true,
		fonts: [{
			urls: ["systems/worldofdarkness/assets/fonts/demon.ttf"]
		}]
	};
	CONFIG.fontDefinitions["Wraith"] = {
		editor: true,
		fonts: [{
			urls: ["systems/worldofdarkness/assets/fonts/Mat_____.ttf"]
		}]
	}; */
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", async function () {
    // Do anything once the system is ready
	const installedVersion = game.settings.get('worldofdarkness', 'worldVersion');
  	const systemVersion = game.data.system.version;	

	tourSetup();

	if (game.user.isGM) {
		if ((installedVersion !== systemVersion || installedVersion === null)) {
			await migration.UpdateWorld(installedVersion, systemVersion);
		}
		else {
			//ui.notifications.warn("Checking character's settings!", {permanent: true});
			await migration.updates();
			//ui.notifications.info("Done!", {permanent: true});
		}
	}
	
	CONFIG.language = game.i18n.lang;	
	
	if (CONFIG.worldofdarkness.darkmode) {
		let chat = document.getElementById("chat");
		chat.classList.add("dark-theme");
	}

	if (game.worldofdarkness.abilities == undefined) {
		ui.notifications.error("World of Darkness settings couldn't load! Check your modules!", {permanent: true});
	}
});

Hooks.on("renderActorSheet", (sheet) => { 
	const useSplatFonts = game.settings.get('worldofdarkness', 'useSplatFonts');

	clearHTML(sheet);

	// adding the means to control the CSS by what language is used.
	if (CONFIG.language == "de") {
		sheet.element[0].classList.add("langDE");
	}
	else if (CONFIG.language == "es") {
	 	sheet.element[0].classList.add("langES");
	}
	else if (CONFIG.language == "it") {
		sheet.element[0].classList.add("langIT");
    }
	else if (CONFIG.language == "fr") {
		sheet.element[0].classList.add("langFR");
    }
	else if (CONFIG.language == "pt-BR") {
		sheet.element[0].classList.add("langPT");
    }
	else if (CONFIG.language == "sv") {
		sheet.element[0].classList.add("langSV");
	}
	else {
		sheet.element[0].classList.add("langEN");
	}

	if (sheet.object.type.toLowerCase() == "creature") {
		sheet.element[0].classList.remove("mage");
		sheet.element[0].classList.remove("werewolf");
		sheet.element[0].classList.remove("changeling");

		if (sheet.object.system.settings.variant.toLowerCase() == "chimera") {			
			sheet.element[0].classList.remove("creature");
			sheet.element[0].classList.add("changeling");
		}
		else if (sheet.object.system.settings.variant.toLowerCase() == "familiar") {
			sheet.element[0].classList.remove("creature");
			sheet.element[0].classList.add("mage");
		}
		else if (sheet.object.system.settings.variant.toLowerCase() == "construct") {
			sheet.element[0].classList.remove("creature");
			sheet.element[0].classList.add("mage");
		}
		else if (sheet.object.system.settings.variant.toLowerCase() != "general") {
			sheet.element[0].classList.remove("creature");
			sheet.element[0].classList.add("werewolf");
		}
	}

	if ((!CONFIG.worldofdarkness.sheetsettings.useSplatFonts) || (!useSplatFonts)) {
		sheet.element[0].classList.add("noSplatFont");
	}

	if (CONFIG.worldofdarkness.darkmode) {
		sheet.element[0].classList.add("dark-theme");
	}	
});

Hooks.on("renderItemSheet", (sheet) => { 
	const useSplatFonts = game.settings.get('worldofdarkness', 'useSplatFonts');

	clearHTML(sheet);

	// adding the means to control the CSS by what language is used.
	if (CONFIG.language == "de") {
		sheet.element[0].classList.add("langDE");
	}
	else if (CONFIG.language == "es") {
	 	sheet.element[0].classList.add("langES");
	}
	else if (CONFIG.language == "it") {
		sheet.element[0].classList.add("langIT");
    }
	else if (CONFIG.language == "fr") {
		sheet.element[0].classList.add("langFR");
    }
	else if (CONFIG.language == "pt-BR") {
		sheet.element[0].classList.add("langPT");
    }
	else if (CONFIG.language == "sv") {
		sheet.element[0].classList.add("langSV");
	}
	else {
		sheet.element[0].classList.add("langEN");
	}

	if ((!CONFIG.worldofdarkness.sheetsettings.useSplatFonts) || (!useSplatFonts)) {
		sheet.element[0].classList.add("noSplatFont");
	}

	if (CONFIG.worldofdarkness.darkmode) {
		sheet.element[0].classList.add("dark-theme");
	}
});

/* Hooks.on("closeItemSheet", (sheet) => { 
		
}); */

Hooks.on("renderFormApplication", (sheet) => { 
	if (sheet.isDialog) {
		const useSplatFonts = game.settings.get('worldofdarkness', 'useSplatFonts');	

		clearHTML(sheet);	

		// adding the means to control the CSS by what language is used.
		if (CONFIG.language == "de") {
			sheet.element[0].classList.add("langDE");
		}
		else if (CONFIG.language == "es") {
			sheet.element[0].classList.add("langES");
		}
		else if (CONFIG.language == "it") {
			sheet.element[0].classList.add("langIT");
		}
		else if (CONFIG.language == "fr") {
			sheet.element[0].classList.add("langFR");
		}
		else if (CONFIG.language == "pt-BR") {
			sheet.element[0].classList.add("langPT");
		}
		else if (CONFIG.language == "sv") {
			sheet.element[0].classList.add("langSV");
		}
		else {
			sheet.element[0].classList.add("langEN");
		}

		if (!useSplatFonts) {
			sheet.element[0].classList.add("noSplatFont");
		}

		if (CONFIG.worldofdarkness.darkmode) {
			sheet.element[0].classList.add("dark-theme");
		}
	}
});

Hooks.on("renderDialog", (_dialog, html, _data) => {
	const container = html[0];

	if (container.classList.contains("dialog")) {
		const select = container.querySelector("select[name=type]");
		if (select) {
			select.append(
				constructOptGroup(select, game.i18n.localize("wod.sheets.items"), CharacterCreationItemTypes),
				constructOptGroup(select, game.i18n.localize("wod.sheets.powers"), PowerCreationItemTypes),
				constructOptGroup(select, game.i18n.localize("wod.sheets.equipment"), EquipmentItemTypes),
				constructOptGroup(select, game.i18n.localize("wod.sheets.sheets"), SheetTypes),
				constructOptGroup(select, game.i18n.localize("wod.sheets.npc"), AdversaryTypes)
			);
			select.querySelector("option").selected = true;
		}
	} 
});

Hooks.once("dragRuler.ready", (SpeedProvider) => {
    class GndWoD20thSpeedProvider extends SpeedProvider {
        get colors() {
            return [
                {id: "walk", default: 0x00FF00, name: "worldofdarkness.speeds.walk"},
                {id: "jog", default: 0xFFFF00, name: "worldofdarkness.speeds.jog"},
                {id: "run", default: 0xFF8000, name: "worldofdarkness.speeds.run"}
            ]
        }
        getRanges(token) {
		    const walkSpeed = token.actor.system.movement.walk;
            const jogSpeed = token.actor.system.movement.jog;
            const runSpeed = token.actor.system.movement.run;           

           //no need for multipliers in wod20 feet to meters 1feet = 0.3048m
            const ranges = [
				{range: walkSpeed, color: "walk"},
				{range: jogSpeed, color: "jog"},
            	{range: runSpeed, color: "run"}
			]            

            return ranges
        }
    }

	dragRuler.registerSystem("worldofdarkness", GndWoD20thSpeedProvider)
});

//Dice Roller
$(document).ready(() => {
	const diceIconSelector = '#chat-controls .chat-control-icon .fa-dice-d20';
  
	$(document).on('click', diceIconSelector, ev => {
	  	ev.preventDefault();
	    const roll = new GeneralRoll("dice", "dice");
		let generalRollUse = new DialogGeneralRoll(undefined, roll);
		generalRollUse.render(true);
	});
});

function clearHTML(sheet) {
	sheet.element[0].classList.remove("langDE");
	sheet.element[0].classList.remove("langES");
	sheet.element[0].classList.remove("langIT");
	sheet.element[0].classList.remove("langFR");
	sheet.element[0].classList.remove("langPT");
	sheet.element[0].classList.remove("langSV");
	sheet.element[0].classList.remove("langEN");
	sheet.element[0].classList.remove("noSplatFont");
	sheet.element[0].classList.remove("dark-theme");
}

function constructOptGroup(select, groupLabel, optValues) {
	const options = select.querySelectorAll(":scope > option");
	const optgroup = document.createElement("optgroup");
	optgroup.label = groupLabel;
	optgroup.append(...Array.from(options).filter((option) => !optValues || optValues.includes(option.value)));
	if (optgroup.children.length == 0) {
		return "";
	}
	return optgroup;
}