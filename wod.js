import * as migration from "./module/migration.js";

import { wod } from "./module/config.js";
import { systemSettings } from "./module/settings.js";
import * as templates from "./module/templates.js";

import { RenderSettings } from './module/ui/settings-sidebar.js'
import * as WoDSetup from "./module/scripts/wodsetup.js";

import { WoDActor } from "./module/actor/data/wod-actor-base.js";
import { WoDItem } from "./module/items/data/wod-item-base.js";

/* Modules */
import * as actorModels from "./module/actor/datamodel/_module.js";
import * as itemModels from "./module/items/datamodel/_module.js";

/* Sheets */
import * as actorSheets from "./module/actor/template/_module.js";
import * as itemSheets from "./module/items/template/_module.js";

import { tourSetup } from './tours/toursetup.js';

import { DialogGeneralRoll, GeneralRoll } from "./module/dialogs/dialog-generalroll.js";

import IconHelper from "./module/ui/icons.js";

import MigrationWizard from "./module/ui/migration-wizard-helper.js";

const SheetTypes = [
	"PC",
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
	"Rote",
	"Sphere"
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

let isTablet = false;

Hooks.once("init", async function() {
	console.log("WoD | Initialising World of Darkness System");

	// Register System Settings
	systemSettings();

	console.log("WoD | Settings registered");

	
	CONFIG.worldofdarkness = wod;
	CONFIG.worldofdarkness.sheetv2 = {};
	CONFIG.worldofdarkness.sheetv2 = Object.assign(CONFIG.worldofdarkness.sheetv2, templates.SetupBioTab());
	CONFIG.worldofdarkness.sheetv2 = Object.assign(CONFIG.worldofdarkness.sheetv2, templates.SetupPowerTab());
	CONFIG.worldofdarkness.attributeSettings = game.settings.get("worldofdarkness", "attributeSettings");
	CONFIG.worldofdarkness.fifthEditionWillpowerSetting = game.settings.get("worldofdarkness", "fifthEditionWillpowerSetting");
	CONFIG.worldofdarkness.willpowerBonusDice = game.settings.get("worldofdarkness", "willpowerBonusDice"); 
	CONFIG.worldofdarkness.rollSettings = game.settings.get('worldofdarkness', 'advantageRolls');
	CONFIG.worldofdarkness.specialityLevel = game.settings.get('worldofdarkness', 'specialityLevel');
	CONFIG.worldofdarkness.demonSystemSettings = game.settings.get('worldofdarkness', 'demonSystemSettings');
	CONFIG.worldofdarkness.hunteredgeSettings = game.settings.get('worldofdarkness', 'hunteredgeSettings');
	CONFIG.worldofdarkness.wererwolfrageSettings = game.settings.get('worldofdarkness', 'wererwolfrageSettings');
	

	// Roll settings
	try {
		CONFIG.worldofdarkness.handleOnes = game.settings.get('worldofdarkness', 'theRollofOne');
		CONFIG.worldofdarkness.usehandleOnes = parseInt(game.settings.get('worldofdarkness', 'theRollofOne')) > 0;
	} 
	catch (e) {
		CONFIG.worldofdarkness.handleOnes = 1;
		CONFIG.worldofdarkness.usehandleOnes = true;
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

	// Register datamodels
	CONFIG.Actor.dataModels.PC = actorModels.PCDataModel;

	CONFIG.Item.dataModels.Ability = itemModels.AbilityDataModel;
	CONFIG.Item.dataModels.Advantage = itemModels.AdvantageDataModel;
	CONFIG.Item.dataModels.Sphere = itemModels.SphereDataModel;
	CONFIG.Item.dataModels.Splat = itemModels.SplatDataModel;

	console.log("WoD | Datamodels Registered");
	
	
	

	// Register application classes
	CONFIG.Actor.documentClass = WoDActor;
	CONFIG.Item.documentClass = WoDItem;

	console.log("WoD | Classes Registered");

	// Register sheet application classes
	foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet)

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.PCActorSheet, {
		types: ["PC"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.MortalActorSheet, {
		label: game.i18n.localize("wod.sheet.mortal"),
		types: ["Mortal"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.WerewolfActorSheet, {
		label: game.i18n.localize("wod.sheet.werewolf"),
		types: ["Werewolf"],
		makeDefault: true
	});	

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.MageActorSheet, {
		label: game.i18n.localize("wod.sheet.mage"),
		types: ["Mage"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.VampireActorSheet, {
		label: game.i18n.localize("wod.sheet.vampire"),
		types: ["Vampire"],
		makeDefault: true
	});
	
	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.ChangelingActorSheet, {
		label: game.i18n.localize("wod.sheet.changeling"),
		types: ["Changeling"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.HunterActorSheet, {
		label: game.i18n.localize("wod.sheet.hunter"),
		types: ["Hunter"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.DemonActorSheet, {
		label: game.i18n.localize("wod.sheet.demon"),
		types: ["Demon"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.WraithActorSheet, {
		label: game.i18n.localize("wod.sheet.wraith"),
		types: ["Wraith"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.MummyActorSheet, {
		label: game.i18n.localize("wod.sheet.mummy"),
		types: ["Mummy"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.ExaltedActorSheet, {
		label: game.i18n.localize("wod.sheet.exalted"),
		types: ["Exalted"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.ChangingBreedActorSheet, {
		label: game.i18n.localize("wod.sheet.breed"),
		types: ["Changing Breed"],
		makeDefault: true
	});

	foundry.documents.collections.Actors.registerSheet("WoD", actorSheets.CreatureActorSheet, {
		label: game.i18n.localize("wod.sheet.creature"),
		types: ["Creature"],
		makeDefault: true
	});	
	
	console.log("WoD | Actor Sheets Registered");
	
	// Register item application classes
	foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.SplatItemSheet, {
		types: ["Splat"],
		makeDefault: true
	});	

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.AbilityItemSheet, {
		types: ["Ability"],
		makeDefault: true
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.AdvantageItemSheet, {
		types: ["Advantage"],
		makeDefault: true
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.SphereItemSheet, {
		types: ["Sphere"],
		makeDefault: true
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Armor"],
		makeDefault: true		
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Bonus"],
		makeDefault: true		
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Experience"],
		makeDefault: true		
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Feature"],
		makeDefault: true		
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Fetish"],
		makeDefault: true		
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Item"],
		makeDefault: true		
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Melee Weapon"],
		makeDefault: true		
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Ranged Weapon"],
		makeDefault: true		
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Power"],
		makeDefault: true		
	});

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Rote"],
		makeDefault: true		
	});	

	foundry.documents.collections.Items.registerSheet("WoD", itemSheets.WoDItemSheet, {
		types: ["Trait"],
		makeDefault: true		
	});

	console.log("WoD | Item Sheets Registered");
	
	templates.preloadHandlebarsTemplates();
	templates.registerHandlebarsHelpers();	

	console.log("WoD | Added Handelebars");

	// Initialize the alterations to the settings sidebar
	RenderSettings();

	game.worldofdarkness = {
		powers: await WoDSetup.getInstalledPowers(game.data.items, true)
	};

	game.worldofdarkness.bio = templates.SetupBio();
	game.worldofdarkness.abilities = templates.SetupAbilities();
	

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

		// Fallback to "mortal" if sheettype is empty or undefined
		if (!sheettype || sheettype === "") {
			sheettype = "mortal";
		}

		// Convert to lowercase and remove spaces
		sheettype = sheettype.toLowerCase().replace(" ", "");
		
		// Convert "pc" to "mortal" (same logic as getSplat)
		if (sheettype === "pc") {
			sheettype = "mortal";
		}

		const context = sheettype + "_" + icon.toLowerCase();

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
	const test = false;

	// Register status effects (måste ske innan CONFIG.Actor.documentClass sätts)
	if (!CONFIG.statusEffects || !Array.isArray(CONFIG.statusEffects)) {
		CONFIG.statusEffects = [];
	}
	
	// Registrera generisk status effect för shapeform ikoner
	// Denna används för PC Actor shape changes - ikonen uppdateras dynamiskt i ActiveEffect
	CONFIG.statusEffects.push({
		id: "wod_shapeform_icon",
		name: "Shapeform Icon",
		img: "systems/worldofdarkness/assets/img/icons/shapeform.svg" // Fallback ikon
	});
	
	// Hämta alla unika shapeform ikoner från PC actors i world
	// Detta säkerställer att alla ikoner är registrerade vid init
	if (game.actors) {
		const uniqueIcons = new Set();
		const iconToName = new Map();
		
		// Gå igenom alla actors
		for (const actor of game.actors) {
			// Endast PC Actors
			if (actor.type !== "PC" && actor.type !== "pc") continue;
			
			// Hitta alla shapeform items
			const shapeforms = actor.items.filter(item => 
				item.type === "Trait" && 
				item.system?.type === "wod.types.shapeform" &&
				item.system?.icon &&
				item.system.icon.trim() !== ""
			);
			
			// Samla unika ikoner
			for (const shapeform of shapeforms) {
				const iconUrl = shapeform.system.icon.trim();
				if (iconUrl.toLowerCase().endsWith('.svg')) {
					uniqueIcons.add(iconUrl);
					// Spara shapeform namn för denna ikon (använd första hittade)
					if (!iconToName.has(iconUrl)) {
						iconToName.set(iconUrl, shapeform.name || "Shapeform");
					}
				}
			}
		}
		
		// Registrera varje unik ikon som en status effect
		// Använd hash av URL:en som del av ID för att göra det unikt
		for (const iconUrl of uniqueIcons) {
			// Skapa unikt ID baserat på icon URL (använd sista delen av sökvägen)
			const urlParts = iconUrl.split('/');
			const fileName = urlParts[urlParts.length - 1].replace('.svg', '');
			const statusId = `wod_shapeform_${fileName}`;
			
			// Kontrollera om den redan finns
			const exists = CONFIG.statusEffects.find(s => s.id === statusId);
			if (!exists) {
				CONFIG.statusEffects.push({
					id: statusId,
					name: iconToName.get(iconUrl) || "Shapeform",
					img: iconUrl
				});
			}
		}
		
		if (uniqueIcons.size > 0) {
			console.log(`WoD | Registered ${uniqueIcons.size} unique shapeform icons`);
		}
	}

	console.log("WoD | Status Effects Registered");

	tourSetup();

	if (game.user.isGM) {
		if (!game.settings.get('worldofdarkness', 'readmessage01')) {
			MigrationWizard.show([
				// Page 1: Welcome to v6
				`<h2>Welcome to WoD20 v6!</h2>
				<p>I'm excited to announce the release of version 6, which brings significant improvements and simplification of how the system handles actors. By doing so, this secures WoD20 for upcoming versions of Foundry, especially from version 16 onwards.</p>
				<p>Please take a moment to review the following pages to learn about the key changes and new features.</p>`,

				// Page 2: New PC Character Sheet
				`<h2>Introducing the New PC Character Sheet</h2>
				<p>Version 6 introduces a completely new Actor called <strong>PC</strong> (Player Character). The PC is in itself just a blank sheet to which you then add a Splat item which sets the Actor up to the type of setting you are playing (e.g., a vampire or a werewolf).</p>
				<p><strong>Important:</strong> The PC sheet will eventually replace all existing character sheets starting with Foundry v16.</p>`,

				// Page 3: System Compendium
				`<h2>New System Compendium</h2>
				<p>The new compendium contains new items used for character creation and mainly when creating a new PC Actor. As mentioned before, when you create a PC Actor, it starts blank. To fill it with information, you add one Splat item to it by dragging it to the sheet and it will then add abilities, advantages, powers, features and settings that have been configured on the Splat item.</p>
				<p>For more detailed information about creating PC Actors and using Splat items, please refer to the <a href="https://github.com/JohanFalt/Foundry_WoD20/wiki/PC-Actor" target="_blank">Wiki - PC Actor</a>.</p>`,

				// Page 4: Available Templates
				`<h2>Available Character Splat items</h2>
				<p>In this release, the following Splat items are ready for use with the new PC sheet in the Compendium, divided by game:</p>
				<ul style="margin-left: 20px; margin-top: 10px;">
					<li><strong>Mortal</strong> - (also ghoul, kinfolk, sorcerers)</li>
					<li><strong>Vampire</strong> - (also kindred of the east)</li>
					<li><strong>Werewolf</strong></li>
					<li><strong>Mage</strong></li>
				</ul>
				<p>More Splat items will be added in future updates.</p>`,

				// Page 5: API
				`<h2>New API</h2>
				<p>With the new PC Actor I have added an API for those that want to use script within Foundry. <b>This only works with the new Actor!</b> For detailed documentation, please visit the <a href="https://github.com/JohanFalt/Foundry_WoD20/wiki/Feature:-API" target="_blank">Wiki - API</a></p>`,

				// Page 5: What to Expect
				`<h2>What to Expect</h2>
				<p>The transition to the new PC sheet system will happen gradually:</p>
				<ul style="margin-left: 20px; margin-top: 10px;">
					<li>You can start using the new PC sheet for new characters right away</li>
					<li>Existing characters will continue to work with their current sheets</li>
					<li>A migration tool will be developed in the future to convert existing characters to PC Actors</li>
					<li>After migration, you'll have access to all the new features and improvements</li>
				</ul>
				<p>I recommend creating a test character with the new PC sheet to familiarize yourself with how it works.</p>`,

				// Page 6: Feedback and Support
				`<h2>Feedback and Support</h2>
				<p>For detailed documentation and guides, please visit the <a href="https://github.com/JohanFalt/Foundry_WoD20/wiki" target="_blank">Wiki main page</a>. As you explore the new features, I'd love to hear your feedback! If you encounter any issues or have suggestions for improvements, please let me know.</p>
				<p>Thank you for being part of the World of Darkness community, and I hope you enjoy the new features in v6!</p>`
			], 'readmessage01');
		}		

		if ((installedVersion !== systemVersion || installedVersion === null || test)) {
			await migration.UpdateWorld(installedVersion, systemVersion);
		}
		else {
			// so attributes are shown correctly according to the settings
			await migration.updates();
		}		
	}	
	
	CONFIG.language = game.i18n.lang;	
	CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";
	
	// if (CONFIG.worldofdarkness.darkmode) {
	// 	let chat = document.getElementById("chat");
	// 	chat.classList.add("wod-theme-dark");
	// }

	if (game.worldofdarkness.abilities == undefined) {
		ui.notifications.error("World of Darkness settings couldn't load! Check your modules!", {permanent: true});
	}

	if (isIpadViewport()) {
		isTablet = true;
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

Hooks.on("renderActorSheetV2", (sheet) => { 
	CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";

	clearHTML(sheet);

	// adding the means to control the CSS by what language is used.
	if (CONFIG.language == "de") {
		sheet.classList.add("langDE");
	}
	else if (CONFIG.language == "es") {
	 	sheet.classList.add("langES");
	}
	else if (CONFIG.language == "it") {
		sheet.classList.add("langIT");
    }
	else if (CONFIG.language == "fr") {
		sheet.classList.add("langFR");
    }
	else if (CONFIG.language == "pt-BR") {
		sheet.classList.add("langPT");
    }
	else {
		sheet.classList.add("langEN");
	}

	if (sheet.splat.toLowerCase() == "mortal") {
		sheet.classList.add("mortal");
		sheet.classList.remove("wraith");
		sheet.classList.remove("mage");
		sheet.classList.remove("vampire");
		sheet.classList.remove("werewolf");
		sheet.classList.remove("changeling");

		for (const variant in CONFIG.worldofdarkness.variant.mortal) {
			sheet.classList.remove(variant);
		}

		// TODO: get correct variant sheet on PC
		// if (sheet.object.system.settings.variant != "general") {
		// 	sheet.element[0].classList.remove("mortal");
		// 	sheet.element[0].classList.add(sheet.object.system.settings.game);
		// 	sheet.element[0].classList.add(sheet.object.system.settings.variantsheet.toLowerCase());
		// }
	}
	if (sheet.splat.toLowerCase() == "vampire") {
		sheet.classList.add("vampire");
		sheet.classList.remove("mortal");
		sheet.classList.remove("wraith");
		sheet.classList.remove("mage");		
		sheet.classList.remove("werewolf");
		sheet.classList.remove("changeling");

		for (const variant in CONFIG.worldofdarkness.variant.mortal) {
			sheet.classList.remove(variant);
		}

		// TODO: get correct variant sheet on PC
		// if (sheet.object.system.settings.variant != "general") {
		// 	sheet.element[0].classList.remove("mortal");
		// 	sheet.element[0].classList.add(sheet.object.system.settings.game);
		// 	sheet.element[0].classList.add(sheet.object.system.settings.variantsheet.toLowerCase());
		// }
	}
	if (sheet.splat.toLowerCase() == "werewolf") {
		sheet.classList.add("werewolf");
		sheet.classList.remove("mortal");
		sheet.classList.remove("wraith");
		sheet.classList.remove("mage");		
		sheet.classList.remove("vampire");
		sheet.classList.remove("changeling");

		for (const variant in CONFIG.worldofdarkness.variant.mortal) {
			sheet.classList.remove(variant);
		}

		// TODO: get correct variant sheet on PC
		// if (sheet.object.system.settings.variant != "general") {
		// 	sheet.element[0].classList.remove("werewolf");
		// 	sheet.element[0].classList.add(sheet.object.system.settings.game);
		// 	sheet.element[0].classList.add(sheet.object.system.settings.variantsheet.toLowerCase());
		// }
	}
	if (sheet.splat.toLowerCase() == "mage") {
		sheet.classList.add("mage");
		sheet.classList.remove("mortal");
		sheet.classList.remove("wraith");
		sheet.classList.remove("werewolf");		
		sheet.classList.remove("vampire");
		sheet.classList.remove("changeling");

		for (const variant in CONFIG.worldofdarkness.variant.mortal) {
			sheet.classList.remove(variant);
		}

		// TODO: get correct variant sheet on PC
		// if (sheet.object.system.settings.variant != "general") {
		// 	sheet.element[0].classList.remove("mage");
		// 	sheet.element[0].classList.add(sheet.object.system.settings.game);
		// 	sheet.element[0].classList.add(sheet.object.system.settings.variantsheet.toLowerCase());
		// }
	} 

	if (!sheet.actor.system.settings.usesplatfont) {
		sheet.classList.add("noSplatFont");
	}

	if (CONFIG.worldofdarkness.darkmode) {
		sheet.classList.add("wod-theme-dark");
	}	
});


Hooks.on("renderActorSheet", (sheet) => { 
	CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";

	clearHTML(sheet);

	if (isTablet) {
		//ui.notifications.info("tabet"); 
	}

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

	if (game.settings.get('worldofdarkness', 'useSplatFonts') === false) {
		sheet.element[0].classList.add("noSplatFont");
	}
	else if (!sheet.object.system.settings.usesplatfont) {
		sheet.element[0].classList.add("noSplatFont");
	}

	if (CONFIG.worldofdarkness.darkmode) {
		sheet.element[0].classList.add("wod-theme-dark");
	}	
});

Hooks.on("renderItemSheet", (sheet) => { 
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
	else {
		sheet.element[0].classList.add("langEN");
	}

	if (game.settings.get('worldofdarkness', 'useSplatFonts') === false) {
		sheet.element[0].classList.add("noSplatFont");
	}
	else if (sheet.object?.actor !== undefined) {
		if (sheet.object.actor?.system?.settings?.usesplatfont === false) {
			sheet.element[0].classList.add("noSplatFont");
		}
	}

	if (CONFIG.worldofdarkness.darkmode) {
		sheet.element[0].classList.add("wod-theme-dark");
	}
});

Hooks.on("renderItemSheetV2", (sheet) => {
	CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";

	// Check if this is a WoD item sheet
	if (sheet.element?.classList?.contains("wod-item")) {
		// adding the means to control the CSS by what language is used.
		if (CONFIG.language == "de") {
			sheet.classList.add("langDE");
		}
		else if (CONFIG.language == "es") {
			sheet.classList.add("langES");
		}
		else if (CONFIG.language == "it") {
			sheet.classList.add("langIT");
		}
		else if (CONFIG.language == "fr") {
			sheet.classList.add("langFR");
		}
		else if (CONFIG.language == "pt-BR") {
			sheet.classList.add("langPT");
		}
		else {
			sheet.classList.add("langEN");
		}

		if (game.settings.get('worldofdarkness', 'useSplatFonts') === false) {
			sheet.classList.add("noSplatFont");
		}
		else if (sheet.item?.actor?.system?.settings?.usesplatfont === false) {
			sheet.classList.add("noSplatFont");
		}

		if (CONFIG.worldofdarkness.darkmode) {
			sheet.classList.add("wod-theme-dark");
		}
	}
});

Hooks.on("renderFormApplication", (sheet) => { 
	if (sheet.isDialog) {
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
		else {
			sheet.element[0].classList.add("langEN");
		}

		if (game.settings.get('worldofdarkness', 'useSplatFonts') === false) {
			sheet.element[0].classList.add("noSplatFont");
		}
		else if (sheet.actor?.system?.settings?.usesplatfont === false) {
			sheet.element[0].classList.add("noSplatFont");
		}

		if (CONFIG.worldofdarkness.darkmode) {
			sheet.element[0].classList.add("wod-theme-dark");
		}
	}
});

// Add hook for ApplicationV2 dialogs (like migration wizard)
Hooks.on("renderApplicationV2", (app, html, data) => {
	// Check if this is a migration wizard dialog
	if (app.constructor.name === "DialogMigrationWizard" || 
	    app.element?.classList?.contains("migration-wizard-dialog")) {
		CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";
		
		if (CONFIG.worldofdarkness.darkmode) {
			app.element?.classList?.add("wod-theme-dark");
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
	sheet.element[0].classList.remove("wod-theme-dark");
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

function isIpadViewport() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Lista på kända iPad viewport-storlekar (senaste ~10 åren)
  const ipadSizes = [
    [768, 1024],  // iPad 9.7", mini
    [810, 1080],  // iPad 10.2"
    [820, 1180],  // iPad Air (10.9")
    [834, 1112],  // iPad Pro 10.5"
    [834, 1194],  // iPad Pro 11"
    [1024, 1366], // iPad Pro 12.9"
  ];

  // Kolla om width/height matchar någon kombination (oavsett rotation)
  return ipadSizes.some(([pw, ph]) =>
    (w === pw && h === ph) || (w === ph && h === pw)
  );
}