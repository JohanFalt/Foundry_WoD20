/**
 * System hooks for World of Darkness
 * All hooks are registered here to keep wod.js cleaner
 */

// Helper function to clear language and theme classes
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

// Helper function to construct option groups for select elements
export function constructOptGroup(select, groupLabel, optValues) {
	const options = select.querySelectorAll(":scope > option");
	const optgroup = document.createElement("optgroup");
	optgroup.label = groupLabel;
	optgroup.append(...Array.from(options).filter((option) => !optValues || optValues.includes(option.value)));
	if (optgroup.children.length == 0) {
		return "";
	}
	return optgroup;
}

/**
 * Register all system hooks
 * @param {Object} constants - Constants needed by hooks (SheetTypes, AdversaryTypes, etc.)
 * @param {boolean} isTablet - Whether the viewport is a tablet
 */
export function registerHooks(constants, isTablet) {
	const { SheetTypes, AdversaryTypes, PowerCreationItemTypes, CharacterCreationItemTypes, EquipmentItemTypes } = constants;

	/**
	 * Hook: createItem
	 * Triggered when an item is created in the world.
	 * Displays a notification to the receiving player when an item is shared via copyFile flag.
	 */
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

	/**
	 * Hook: renderActorSheetV2
	 * Triggered when an ActorSheetV2 (PC actors using ApplicationV2) is rendered.
	 * Applies language classes, splat-specific classes (mortal, vampire, werewolf, mage),
	 * font settings, and dark mode theme class.
	 */
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
		} 

		if (!sheet.actor.system.settings.usesplatfont) {
			sheet.classList.add("noSplatFont");
		}

		if (CONFIG.worldofdarkness.darkmode) {
			sheet.classList.add("wod-theme-dark");
		}	
	});

	/**
	 * Hook: renderActorSheet
	 * Triggered when a legacy ActorSheet (non-PC actors using appv1 API) is rendered.
	 * Applies language classes, actor type classes (mortal, creature with variants),
	 * font settings, and dark mode theme class.
	 * Also handles tablet viewport detection.
	 */
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

	/**
	 * Hook: renderItemSheet
	 * Triggered when a legacy ItemSheet (using appv1 API) is rendered.
	 * Applies language classes, font settings based on actor or global settings,
	 * and dark mode theme class.
	 */
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

	/**
	 * Hook: renderItemSheetV2
	 * Triggered when an ItemSheetV2 (using ApplicationV2) is rendered.
	 * Only processes WoD item sheets (identified by "wod-item" class).
	 * Applies language classes, font settings, and dark mode theme class.
	 */
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

	/**
	 * Hook: renderFormApplication
	 * Triggered when a FormApplication dialog is rendered.
	 * Handles both regular dialogs (isDialog flag) and settings dialogs (wod20rule-dialog class).
	 * Applies language classes, font settings, and dark mode theme class.
	 */
	Hooks.on("renderFormApplication", (sheet) => { 
		// Check if this is a WoD dialog (either isDialog or has wod20rule-dialog class for settings)
		const isWoDDialog = sheet.isDialog || 
		                    sheet.element?.[0]?.classList?.contains("wod20rule-dialog");
		
		if (isWoDDialog) {
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

	/**
	 * Hook: renderApplicationV2
	 * Triggered when an ApplicationV2 dialog or sheet is rendered.
	 * Handles migration wizard, power selection dialog, item sheets, and actor sheets.
	 * Identifies WoD applications by CSS classes and applies dark mode theme class.
	 */
	Hooks.on("renderApplicationV2", (app, html, data) => {
		CONFIG.worldofdarkness.darkmode = game.settings.get('core', 'uiConfig').colorScheme.applications === "dark";
		
		// Check if this is a WoD ApplicationV2 dialog/sheet
		// Check by class names that WoD uses
		if (app.element?.classList?.contains("wod-dialog") || 
		    app.element?.classList?.contains("migration-wizard-dialog") ||
		    app.element?.classList?.contains("power-selection-dialog") ||
		    app.element?.classList?.contains("wod-item") ||
		    app.element?.classList?.contains("wod-sheet") ||
		    app.element?.classList?.contains("wod20")) {
			
			if (CONFIG.worldofdarkness.darkmode) {
				app.element.classList.add("wod-theme-dark");
			}
		}
	});

	/**
	 * Hook: renderDialog
	 * Triggered when a Dialog API dialog is rendered (legacy dialog system).
	 * Organizes select options into optgroups for item creation dialogs.
	 * Applies dark mode theme class to WoD dialogs (wod-dialog, wod-create classes).
	 */
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
		
		// Add dark mode class for WoD dialogs
		if (container.classList.contains("wod-dialog") || container.classList.contains("wod-create")) {
			if (CONFIG.worldofdarkness.darkmode) {
				container.classList.add("wod-theme-dark");
			}
		}
	});

	/**
	 * Hook: dragRuler.ready
	 * Triggered once when the dragRuler module is ready.
	 * Registers a custom speed provider for World of Darkness movement speeds.
	 * Provides walk, jog, and run speed ranges with color coding for token movement visualization.
	 */
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
}

