import * as migration from "./module/migration.js";

import { wod } from "./module/config.js";
import { systemSettings } from "./module/settings.js";
//import { preloadHandlebarsTemplates } from "./module/templates.js";
import * as templates from "./module/templates.js";

import { MortalActorSheet } from "./module/actor/mortal-actor-sheet.js";
import { WerewolfActorSheet } from "./module/actor/werewolf-actor-sheet.js";
import { ChangingBreedActorSheet } from "./module/actor/changingbreed-actor-sheet.js";
import { SpiritActorSheet } from "./module/actor/spirit-actor-sheet.js";
import { VampireActorSheet } from "./module/actor/vampire-actor-sheet.js";
import { CreatureActorSheet } from "./module/actor/creature-actor-sheet.js";

import { WoDItemSheet } from "./module/items/item-sheet.js";

Hooks.once("init", async function() {
	console.log("WoD | Initialising World of Darkness System");

	// Register System Settings
	systemSettings();

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

	Actors.registerSheet("WoD", ChangingBreedActorSheet, {
		label: "Changing Breed Sheet",
		types: ["Changing Breed"],
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
    // Reference a Compendium pack by it's collection ID
    // packImport();
	const installedVersion = game.settings.get('worldofdarkness', 'worldVersion');
  	const currentVersion = game.data.system.data.version;	

	if (game.user.isGM) {
		if ((installedVersion !== currentVersion || installedVersion === null)) {
			ui.notifications.info(game.i18n.localize("wod.system.patches"));
			migration.patches(installedVersion, currentVersion);	
		}
		ui.notifications.info(game.i18n.localize("wod.system.updates"));
		migration.updates();
		ui.notifications.info(game.i18n.localize("wod.system.done"));
	}
	CONFIG.language = game.i18n.lang;
});

Hooks.on("renderActorSheet", (sheet) => { 
	// adding the means to control the CSS by what language is used.
	if (CONFIG.language == "de") {
		sheet.element[0].classList.add("langDE");
	}
	else {
		sheet.element[0].classList.add("langEN");
	}

	//if (actor && actor.isOwner) {
	//	return;
	//}
});