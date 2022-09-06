import * as migration from "./module/migration.js";

import { wod } from "./module/config.js";
import { systemSettings } from "./module/settings.js";
import * as templates from "./module/templates.js";

import { MortalActorSheet } from "./module/actor/mortal-actor-sheet.js";
import { WerewolfActorSheet } from "./module/actor/werewolf-actor-sheet.js";
import { MageActorSheet } from "./module/actor/mage-actor-sheet.js";
import { ChangingBreedActorSheet } from "./module/actor/changingbreed-actor-sheet.js";
import { SpiritActorSheet } from "./module/actor/spirit-actor-sheet.js";
import { VampireActorSheet } from "./module/actor/vampire-actor-sheet.js";
import { CreatureActorSheet } from "./module/actor/creature-actor-sheet.js";

import { WoDItemSheet } from "./module/items/item-sheet.js";

import ActionHelper from "./module/scripts/action-helpers.js";

Hooks.once("init", async function() {
	console.log("WoD | Initialising World of Darkness System");

	// Register System Settings
	systemSettings();

	console.log("WoD | Settings registered");
	
	CONFIG.wod = wod;
	CONFIG.wod.attributeSettings = game.settings.get("worldofdarkness", "attributeSettings");
	CONFIG.wod.rollSettings = game.settings.get('worldofdarkness', 'advantageRolls');

	try {
		CONFIG.wod.handleOnes = game.settings.get('worldofdarkness', 'theRollofOne');
	} 
	catch (e) {
		CONFIG.wod.handleOnes = true;
	}	

	CONFIG.wod.observersSeeFullActor = game.settings.get('worldofdarkness', 'observersFullActorViewPermission');

	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	
	Actors.registerSheet("WoD", VampireActorSheet, {
		label: "Vampire Sheet",
		types: ["Vampire"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", MageActorSheet, {
		label: "Mage Sheet",
		types: ["Mage"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", WerewolfActorSheet, {
		label: "Werewolf Sheet",
		types: ["Werewolf"],
		makeDefault: true
	});	

	Actors.registerSheet("WoD", ChangingBreedActorSheet, {
		label: "Changing Breed Sheet",
		types: ["Changing Breed"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", CreatureActorSheet, {
		label: "Creature Sheet",
		types: ["Creature"],
		makeDefault: true
	});

	Actors.registerSheet("WoD", MortalActorSheet, {
		label: "Mortal Sheet",
		types: ["Mortal"],
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
	
	templates.preloadHandlebarsTemplates();
	templates.registerHandlebarsHelpers();	
	
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
	const installedVersion = game.settings.get('worldofdarkness', 'worldVersion');
  	const systemVersion = game.data.system.version;	

	if (game.user.isGM) {
		if ((installedVersion !== systemVersion || installedVersion === null)) {
			migration.UpdateWorld(installedVersion, systemVersion);
		}
		else {
			ui.notifications.info("Checking character's settings!");
			migration.updates();
			ui.notifications.info("Done!");
		}
	}
	CONFIG.language = game.i18n.lang;
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
	else {
		sheet.element[0].classList.add("langEN");
	}

	if ((!CONFIG.wod.sheetsettings.useSplatFonts) || (!useSplatFonts)) {
		sheet.element[0].classList.add("noSplatFont");
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
	else {
		sheet.element[0].classList.add("langEN");
	}

	if ((!CONFIG.wod.sheetsettings.useSplatFonts) || (!useSplatFonts)) {
		sheet.element[0].classList.add("noSplatFont");
	}
});

Hooks.on("renderFormApplication", (sheet) => { 
	if (sheet.isDialog == undefined) {
		return;
	}


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
	if (CONFIG.language == "fr") {
		sheet.element[0].classList.add("langFR");
	}
	else {
		sheet.element[0].classList.add("langEN");
	}

	if (!useSplatFonts) {
		sheet.element[0].classList.add("noSplatFont");
	}
});

function clearHTML(sheet) {
	sheet.element[0].classList.remove("langDE");
	sheet.element[0].classList.remove("langES");
	sheet.element[0].classList.remove("langIT");
	sheet.element[0].classList.remove("langFR");
	sheet.element[0].classList.remove("langEN");
	sheet.element[0].classList.remove("noSplatFont");
}