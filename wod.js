import * as migration from "./module/migration.js";

import { wod } from "./module/config.js";
import { systemSettings } from "./module/settings.js";
import * as templates from "./module/templates.js";

import { RenderSettings } from './module/ui/settings-sidebar.js'
import * as WoDSetup from "./module/scripts/wodsetup.js";

import { WoDActor } from "./module/actor/data/wod-actor-base.js";
import { WoDItem } from "./module/items/data/wod-item-base.js";

/* Modules */
import * as models from "./module/actor/datamodel/_module.js";

/* Sheets */
import * as sheets from "./module/actor/template/_module.js";
import { WoDItemSheet } from "./module/items/template/item-sheet.js";

import { tourSetup } from './tours/toursetup.js';

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
	"Mummy",
	"Exalted",
	"Changing Breed"
];
const AdversaryTypes = [
	"Creature"
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
	CONFIG.worldofdarkness.specialityLevel = game.settings.get('worldofdarkness', 'specialityLevel');
	CONFIG.worldofdarkness.demonSystemSettings = game.settings.get('worldofdarkness', 'demonSystemSettings');
	CONFIG.worldofdarkness.hunteredgeSettings = game.settings.get('worldofdarkness', 'hunteredgeSettings');
	CONFIG.worldofdarkness.wererwolfrageSettings = game.settings.get('worldofdarkness', 'wererwolfrageSettings');

	

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
		CONFIG.worldofdarkness.specialityAllowBotch = game.settings.get('worldofdarkness', 'specialityAllowBotch');
	} 
	catch (e) {
		CONFIG.worldofdarkness.specialityReduceDiff = 0;
		CONFIG.worldofdarkness.usespecialityReduceDiff = false;
		CONFIG.worldofdarkness.specialityAllowBotch = true;
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

	CONFIG.Actor.dataModels.PC = models.PCDataModel;

	// Register application classes
	CONFIG.Actor.documentClass = WoDActor;
	CONFIG.Item.documentClass = WoDItem;

	console.log("WoD | Classes Registered");

	// Register sheet application classes
	foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet)

	// Add/remove to types in template.json row 4		"PC",
	// Add/remove above "Mortal" row 1378 				"PC": {},
	// foundry.documents.collections.Actors.registerSheet("WoD", sheets.PCActorSheet, {
	// 	label: "LANG: PC",
	// 	types: ["PC"],
	// 	makeDefault: true
	// });

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.MortalActorSheet, {
		label: game.i18n.localize("wod.sheet.mortal"),
		types: ["Mortal"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.WerewolfActorSheet, {
		label: game.i18n.localize("wod.sheet.werewolf"),
		types: ["Werewolf"],
		makeDefault: true
	});	

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.MageActorSheet, {
		label: game.i18n.localize("wod.sheet.mage"),
		types: ["Mage"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.VampireActorSheet, {
		label: game.i18n.localize("wod.sheet.vampire"),
		types: ["Vampire"],
		makeDefault: true
	});
	
	foundry.documents.collections.Actors.registerSheet("WoD", sheets.ChangelingActorSheet, {
		label: game.i18n.localize("wod.sheet.changeling"),
		types: ["Changeling"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.HunterActorSheet, {
		label: game.i18n.localize("wod.sheet.hunter"),
		types: ["Hunter"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.DemonActorSheet, {
		label: game.i18n.localize("wod.sheet.demon"),
		types: ["Demon"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.WraithActorSheet, {
		label: game.i18n.localize("wod.sheet.wraith"),
		types: ["Wraith"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.MummyActorSheet, {
		label: game.i18n.localize("wod.sheet.mummy"),
		types: ["Mummy"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.ExaltedActorSheet, {
		label: game.i18n.localize("wod.sheet.exalted"),
		types: ["Exalted"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.ChangingBreedActorSheet, {
		label: game.i18n.localize("wod.sheet.breed"),
		types: ["Changing Breed"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", sheets.CreatureActorSheet, {
		label: game.i18n.localize("wod.sheet.creature"),
		types: ["Creature"],
		makeDefault: true
	});	
	
	console.log("WoD | Actor Sheets Registered");
	
	// Register item application classes
	foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);

	foundry.documents.collections.Items.registerSheet("WoD", WoDItemSheet, {
		makeDefault: true		
	});

	console.log("WoD | Item Sheets Registered");
	
	templates.preloadHandlebarsTemplates();
	templates.registerHandlebarsHelpers();	

	console.log("WoD | Added Handelebars");

	// Initialize the alterations to the settings sidebar
	RenderSettings();

	game.worldofdarkness = {
		powers: WoDSetup.getInstalledPowers(game.data.items)
	};

	game.worldofdarkness.abilities = templates.SetupAbilities();
	game.worldofdarkness.bio = templates.SetupBio();

	console.log("WoD | Added Settings");  

	game.worldofdarkness.icons = {};

	for (const race in CONFIG.worldofdarkness.sheettype) {
		game.worldofdarkness.icons[race] = {};

		let iconlist = IconHelper.GetIconlist(race)

		Object.assign(game.worldofdarkness.icons[race], iconlist);
	}	

	game.worldofdarkness.icons["black"] = {};
	Object.assign(game.worldofdarkness.icons["black"], IconHelper.GetIconlist("black"));

	Handlebars.registerHelper('dtSvgDie', (icon, sheettype, options) => {
		if ((options != "") && (options != undefined)) {
			sheettype = options;
		}

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
			// so attributes are shown correctly according to the settings
			await migration.updates();
		}
	}
	
	CONFIG.language = game.i18n.lang;	
	CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";
	
	if (CONFIG.worldofdarkness.darkmode) {
		let chat = document.getElementById("chat");
		chat.classList.add("dark-theme");
	}

	if (game.worldofdarkness.abilities == undefined) {
		ui.notifications.error("World of Darkness settings couldn't load! Check your modules!", {permanent: true});
	}
});

Hooks.on('createItem', async (item, options, userId) => {
	if (item.flags?.copyFile !== undefined) {
		if (item.flags?.copyFile?.receivedPlayer !== game.user.id) {
			const text = game.i18n.localize("wod.info.droprecieved");
			text = text.replace("{1}", item.name);
			text = text.replace("{2}", item.flags?.copyFile?.receivedName);
			
			ui.notifications.info(text); 
		}
	}
});


Hooks.on("renderActorSheet", (sheet) => { 
	const useSplatFonts = game.settings.get('worldofdarkness', 'useSplatFonts');
	CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";

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

	if (sheet.object.type.toLowerCase() == "mortal") {
		sheet.element[0].classList.add("mortal");
		sheet.element[0].classList.remove("wraith");
		sheet.element[0].classList.remove("mage");
		sheet.element[0].classList.remove("vampire");
		sheet.element[0].classList.remove("werewolf");
		sheet.element[0].classList.remove("changeling");

		for (const variant in CONFIG.worldofdarkness.variant.mortal) {
			sheet.element[0].classList.remove(variant);
		}

		if (sheet.object.system.settings.variantsheet != "") {
			sheet.element[0].classList.remove("mortal");
			sheet.element[0].classList.add(sheet.object.system.settings.variant);
			sheet.element[0].classList.add(sheet.object.system.settings.variantsheet.toLowerCase());
		}
	}

	if (sheet.object.type.toLowerCase() == "creature") {
		sheet.element[0].classList.add("creature");
		sheet.element[0].classList.remove("wraith");
		sheet.element[0].classList.remove("mage");
		sheet.element[0].classList.remove("vampire");
		sheet.element[0].classList.remove("werewolf");
		sheet.element[0].classList.remove("changeling");
		sheet.element[0].classList.remove("demon");

		if (sheet.object.system.settings.variantsheet != "") {
			sheet.element[0].classList.remove("creature");
			sheet.element[0].classList.add(sheet.object.system.settings.variantsheet.toLowerCase());
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
	CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";

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
		CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";

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
	CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";

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
	const diceIconSelector = '#roll-privacy .fa-globe';
  
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