import ActionHelper from "../scripts/action-helpers.js";
import CreateHelper from "../scripts/create-helpers.js";
import BioHelper from "../scripts/bio-helpers.js";
import AbilityHelper from "../scripts/ability-helpers.js";
import AttributeHelper from "../scripts/attribute-helpers.js";
import SphereHelper from "../scripts/sphere-helpers.js";
import ItemHelper from "../scripts/item-helpers.js";
import MessageHelper from "../scripts/message-helpers.js";

import { calculateHealth } from "../scripts/health.js";
import * as selectbox from "../scripts/spec-select.js";

export class MortalActorSheet extends ActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet mortal"],
			template: "systems/worldofdarkness/templates/actor/mortal-sheet.html",
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "core",
			},
			{
				navSelector: ".sheet-setting-tabs",
				contentSelector: ".sheet-setting-body",
				initial: "attributes",
			}]
		});
	}
  
	constructor(actor, options) {
		super(actor, options);

		this.isGM = game.user.isGM;	
		this.isLimited = actor.limited;
		this.locked = true;
		this.isCharacter = true;
	}	
	
	/** @override */
	get template() {
		console.log("WoD | Mortal Sheet get template");		
		return "systems/worldofdarkness/templates/actor/mortal-sheet.html";
	}
	
	/** @override */
	async getData() {
		const actorData = duplicate(this.actor);		

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.worldofdarkness.sheettype.mortal) {
				actorData.system.settings.iscreated = true;		
				actorData.system.settings.version = game.data.system.version;
				actorData.system.settings.era = CONFIG.worldofdarkness.era[CONFIG.worldofdarkness.defaultMortalEra];
				
				await CreateHelper.SetMortalAbilities(actorData, this.actor, CONFIG.worldofdarkness.defaultMortalEra);
				await CreateHelper.SetMortalAttributes(actorData);
			}	 	
		}
		else {
			if (!this.actor.limited) {
				await ActionHelper.handleCalculations(actorData);				
			}
		}	

		await this.actor.update(actorData);

		console.log("WoD | Mortal Sheet getData");
		const data = await super.getData();

		CONFIG.worldofdarkness.sheetsettings.useSplatFonts = this.actor.system.settings.usesplatfont;	
		
		data.config = CONFIG.worldofdarkness;	
		//data.game = game.worldofdarkness;			
		data.worldofdarkness = game.worldofdarkness;
		data.userpermissions = ActionHelper._getUserPermissions(game.user);
		data.graphicsettings = ActionHelper._getGraphicSettings();

		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = this.isGM;

		await ItemHelper.sortActorItems(data.actor, data.config);

		data.actor.system.appearance = await TextEditor.enrichHTML(data.actor.system.appearance, {async: true});
		data.actor.system.background = await TextEditor.enrichHTML(data.actor.system.background, {async: true});
		data.actor.system.gear = await TextEditor.enrichHTML(data.actor.system.gear, {async: true});

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.mage) {
			data.actor.system.focus.paradigm = await TextEditor.enrichHTML(data.actor.system.focus.paradigm, {async: true});
			data.actor.system.focus.practice = await TextEditor.enrichHTML(data.actor.system.focus.practice, {async: true});
			data.actor.system.focus.instruments = await TextEditor.enrichHTML(data.actor.system.focus.instruments, {async: true});
		}

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.changeling) {
			data.actor.system.threshold = await TextEditor.enrichHTML(data.actor.system.threshold, {async: true});
			data.actor.system.legacyseelie = await TextEditor.enrichHTML(data.actor.system.legacyseelie, {async: true});
			data.actor.system.legacyunseelie = await TextEditor.enrichHTML(data.actor.system.legacyunseelie, {async: true});
		}

		data.actor.system.listdata.health = await calculateHealth(data.actor, data.config.sheettype.mortal);

		data.actor.system.listdata.settings = [];
		data.actor.system.listdata.settings.haschimericalhealth = false;

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.mortal) {
			console.log(CONFIG.worldofdarkness.sheettype.mortal);
			console.log(data.actor);
		}	

		if ((data.actor.system.settings.variant == "") && ((this.actor.type == CONFIG.worldofdarkness.sheettype.creature)||
											(this.actor.type == CONFIG.worldofdarkness.sheettype.wraith)||
											(this.actor.type == CONFIG.worldofdarkness.sheettype.changeling)||
											(this.actor.type == CONFIG.worldofdarkness.sheettype.mortal))) {
			ActionHelper.openVariantDialog(this.actor);
		}
		else if (((data.actor.system?.changingbreed == "") || (data.actor.system?.changingbreed == "general")) && (this.actor.type == CONFIG.worldofdarkness.sheettype.changingbreed)) {
			ActionHelper.openVariantDialog(this.actor);
		}

		return data;
	}	

	/** @override */
	activateListeners(html) {
		console.log("WoD | Mortal Sheet activateListeners");
	  
		super.activateListeners(html);

		//Custom select text boxes
		selectbox.registerCustomSelectBoxes(html, this);

		ActionHelper.SetupDotCounters(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;
		
		// lock button
		html
			.find(".lock-btn")
			.click(this._onToggleLocked.bind(this));

		html
			.find('.inputdata')
			.change(event => this._onsheetChange(event));

		// Click collapsed
		html
			.find('.collapsible.button')
			.click(event => ItemHelper._onTableCollapse(event, this.actor._id));		

		// Receive collapsed state from flags
		html.find('.collapsible.button').toArray().filter(ele => {
			if (ele.dataset.sheet == CONFIG.worldofdarkness.sheettype.mortal){
				if (this.actor && this.actor.id && game.user.flags.wod && game.user.flags.wod[this.actor.id] && game.user.flags.wod[this.actor.id][ele.dataset.type] && !game.user.flags.wod[this.actor.id][ele.dataset.type].collapsed) {
					$(ele).removeClass("fa-angles-right");
					$(ele).addClass("fa-angles-down");

					$(ele).parent().parent().parent().siblings('.'+ele.dataset.type).removeClass("hide");
					$(ele).parent().parent().parent().siblings('.'+ele.dataset.type).addClass("show");
				}
				else {
					$(ele).removeClass("fa-angles-down");
					$(ele).addClass("fa-angles-right");

					$(ele).parent().parent().parent().siblings('.'+ele.dataset.type).removeClass("show");
					$(ele).parent().parent().parent().siblings('.'+ele.dataset.type).addClass("hide");
				}
			}
		});

		// resource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));

		// health
		html
			.find(".health > .resource-counter > .resource-value-step")
			.click(this._onSquareCounterChange.bind(this));
		html
			.find(".health > .resource-counter > .resource-value-step")
			.on('contextmenu', this._onSquareCounterClear.bind(this));

		// set era Dark Ages
		html
			.find(".sheet_darkages")
			.click(this._setDarkAges.bind(this));	

		// set era Modern
		html
			.find(".sheet_modern")
			.click(this._setModern.bind(this));

		// set era Victorian
		html
			.find(".sheet_victorian")
			.click(this._setVictorian.bind(this));

		// set variant
		html
			.find(".variantbutton")
			.click(this._setVariant.bind(this));

		// Rollable stuff
		html
			.find(".vrollable")
			.click(this._onRollDialog.bind(this));

		html
			.find(".switch")
			.click(this._switchSetting.bind(this));

		html
			.find(".macroBtn")
			.click(this._onRollDialog.bind(this));			

		// items
		html
			.find('.item-create')
			.click(this._onItemCreate.bind(this));

		html
			.find(".item-edit")
			.click(this._onItemEdit.bind(this));

		html
			.find(".item-active")
			.click(this._onItemActive.bind(this));
			
		html
			.find(".item-delete")
			.click(this._onItemDelete.bind(this));

		html
            .find('.item-property')
            .click(this._onProperty.bind(this));

		html
			.find(".clearPower")
			.click(this._clearPower.bind(this));

		// skicka till chat
		html
			.find(".send-chat")
			.click(this._onSendChat.bind(this));		
	}

	async _setDarkAges(event) {
		event.preventDefault();

		if (this.actor.system.settings.era == CONFIG.worldofdarkness.era.darkages) {
			const performDelete = await new Promise((resolve) => {
				Dialog.confirm({
					title: game.i18n.localize("wod.era.changeera"),
					yes: () => resolve(true),
					no: () => resolve(false),
					content: game.i18n.localize("wod.era.changeerahint")
				});
			});

			if (!performDelete)
            	return;
		}        

		const element = event.currentTarget;
		const dataset = element.dataset;
		let found = false;

		const actorData = duplicate(this.actor);

		if (dataset.type == CONFIG.worldofdarkness.sheettype.vampire) {
			found = true;
			await CreateHelper.SetVampireAbilities(actorData, this.actor, "darkages");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.werewolf) {
			found = true;
			await CreateHelper.SetWerewolfAbilities(actorData, this.actor, "darkages");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mortal) {
			found = true;
			await CreateHelper.SetMortalAbilities(actorData, this.actor, "darkages");
		}
		
		if (found) {
			actorData.system.settings.era = CONFIG.worldofdarkness.era.darkages;
			await this.actor.update(actorData);
			ui.notifications.info(game.i18n.localize("wod.labels.settings.setdarkages"));
		}
	}

	async _setVictorian(event) {
		event.preventDefault();

		if (this.actor.system.settings.era == CONFIG.worldofdarkness.era.victorian) {
			const performDelete = await new Promise((resolve) => {
				Dialog.confirm({
					title: game.i18n.localize("wod.era.changeera"),
					yes: () => resolve(true),
					no: () => resolve(false),
					content: game.i18n.localize("wod.era.changeerahint")
				});
			});

			if (!performDelete)
            	return;
		}

		const element = event.currentTarget;
		const dataset = element.dataset;
		let found = false;

		const actorData = duplicate(this.actor);

		if (dataset.type == CONFIG.worldofdarkness.sheettype.vampire) {
			found = true;
			await CreateHelper.SetVampireAbilities(actorData, this.actor, "victorian");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.werewolf) {
			found = true;
			await CreateHelper.SetWerewolfAbilities(actorData, this.actor, "victorian");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mage) {
			found = true;
			await CreateHelper.SetMageAbilities(actorData, "victorian");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mortal) {
			found = true;
			await CreateHelper.SetMortalAbilities(actorData, this.actor, "victorian");
		}
		
		if (found) {
			actorData.system.settings.era = CONFIG.worldofdarkness.era.victorian;

			await this.actor.update(actorData);
			

			if (dataset.type == CONFIG.worldofdarkness.sheettype.werewolf) { 
				ui.notifications.info(game.i18n.localize("wod.labels.settings.setwildwest"));
			}
			else {
				ui.notifications.info(game.i18n.localize("wod.labels.settings.setvictorian"));
			}
		}
	}

	async _setModern(event) {
		event.preventDefault();

		if (this.actor.system.settings.era == CONFIG.worldofdarkness.era.modern) {
			const performDelete = await new Promise((resolve) => {
				Dialog.confirm({
					title: game.i18n.localize("wod.era.changeera"),
					yes: () => resolve(true),
					no: () => resolve(false),
					content: game.i18n.localize("wod.era.changeerahint")
				});
			});

			if (!performDelete)
            	return;
		}

		const element = event.currentTarget;
		const dataset = element.dataset;
		let found = false;

		const actorData = duplicate(this.actor);

		if (dataset.type == CONFIG.worldofdarkness.sheettype.vampire) {
			found = true;
			await CreateHelper.SetVampireAbilities(actorData, this.actor, "modern");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.werewolf) {
			found = true;
			await CreateHelper.SetWerewolfAbilities(actorData, this.actor, "modern");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mage) {
			found = true;
			await CreateHelper.SetMageAbilities(actorData, "modern");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mortal) {
			found = true;
			await CreateHelper.SetMortalAbilities(actorData, this.actor, "modern");
		}
		
		if (found) {
			actorData.system.settings.era = CONFIG.worldofdarkness.era.modern;

			await this.actor.update(actorData);
			ui.notifications.info(game.i18n.localize("wod.labels.settings.setmodern"));
		}
	}	

	async _setVariant(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		const actorData = duplicate(this.actor);

		if (this.actor.type == CONFIG.worldofdarkness.sheettype.changeling) {
			await CreateHelper.SetChangingVariant(actorData, dataset.value);
		}
		if (this.actor.type == CONFIG.worldofdarkness.sheettype.wraith) {
			actorData.system.settings.variant = dataset.value;
		}
		if (this.actor.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
			await CreateHelper.SetShifterAttributes(actorData, dataset.value);
		}
		if (this.actor.type == CONFIG.worldofdarkness.sheettype.mortal) {
			await CreateHelper.SetMortalVariant(actorData, dataset.value);
		}
		if (this.actor.type == CONFIG.worldofdarkness.sheettype.creature) {
			await CreateHelper.SetCreatureVariant(actorData, dataset.value);			
		}
		
        await this.actor.update(actorData);
		await CreateHelper.SetVariantItems(this.actor, dataset.value);
	}

	async _onDropItemCreate(itemData) {
		if ((itemData.type == "Power") && (itemData.system.parentid != "")) {
			itemData.system.parentid = await ItemHelper.GetPowerId(itemData, this.actor);
		}

		super._onDropItemCreate(itemData);
	}

	async _onsheetChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		const source = dataset.source;
		const actorData = duplicate(this.actor);

		if (source == "attribute") {
			let attribute = dataset.attribute;
			let value = 0;

			try {
				value = parseInt(element.value);	
			} catch (error) {
				value = 0;
			}		

			actorData.system.attributes[attribute].bonus = value;
		}	
		// if you are altering a secondary ability's speciality
		else if (source == "ability") {
			const itemid = dataset.abilityid;
			const item = await this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = duplicate(item);
			itemData.system.speciality = element.value;
			await item.update(itemData);
			return;
		}
		// has shifted from what chapeshifter type to another an then you need to check what that does with the permissions
		/* else if (source == "shiftertype") {
			var e = document.getElementById("system.changingbreed");
			var type = e.value;

			await CreateHelper.SetShifterAttributes(actorData, type);
		} */
		else if (source == "frenzy") {
			let value = 0;

			try {
				value = parseInt(element.value);
			} catch (error) {
				value = 0;
			}

			actorData.system.advantages.rage.bonus = value;
		}
		else if (source == "soak") {
			let value = 0;
			const type = dataset.type;

			try {
				value = parseInt(element.value);
			} catch (error) {
				value = 0;
			}

			actorData.system.settings.soak[type].bonus = value;
		}
		else if (source == "initiative") {
			let value = 0;

			try {
				value = parseInt(element.value);
			} catch (error) {
				value = 0;
			}

			actorData.system.initiative.bonus = value;			
		}

		await ActionHelper.handleCalculations(actorData);

		await this.actor.update(actorData);
		this.render();
	}

	_onRollDialog(event) {		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.mortal) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);		
	}

	_onChatRoll(event) {		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.actorid != this.actor.id) {
			console.log(`WoD | aborting _onChatRoll - ${dataset.actorid} vs ${this.actor.id} (${this.actor.name})`);
			return;
		}

		ActionHelper.RollDialog(event, this.actor);		
	}

	/* Lock / unlock the sheet */
	async _onToggleLocked(event) {
		event.preventDefault();

		this.locked = !this.locked;

		this._render();
	}

	async _switchSetting(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.mortal) {
			return;
		}

		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		const ability = dataset.label;
		const actorData = duplicate(this.actor);
		const source = dataset.source;
		const type = dataset.switchtype;

		if (source == "ability") {
			actorData.system.abilities[ability].isvisible = !actorData.system.abilities[ability].isvisible;
		}
		// updates if a secondary ability is to be visible or not.
		if (source == "secondaryability") {
			const itemid = dataset.itemid;
			const item = await this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = duplicate(item);
			itemData.system.isvisible = !item.system.isvisible;
			await item.update(itemData);
			this.render();
			return;
		}
		if (source == "advantages") {
			actorData.system.settings[type] = !actorData.system.settings[type];
		}
		if (source == "soak") {
			actorData.system.settings.soak[type].isrollable = !actorData.system.settings.soak[type].isrollable;		
		}
		if (source == "usesplatfont") {
			actorData.system.settings.usesplatfont = !actorData.system.settings.usesplatfont;
		}
		if (source == "powers") {
			actorData.system.settings.powers[type] = !actorData.system.settings.powers[type];		
		}		

		await ActionHelper.handleCalculations(actorData);
		await ActionHelper.handleWoundLevelCalculations(actorData);

		await this.actor.update(actorData);
	}
  
	/* Alter dots e.g attributes, abilities */
	async _onDotCounterChange(event) {
		console.log("WoD | Mortal Sheet _onDotCounterChange");
		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.mortal) {
			return;
		}

		const parent = $(element.parentNode);	
		const steps = parent.find(".resource-value-step");	
		const index = Number(dataset.index);		

		let itemid = undefined;

		// e.g secondary abilites
		if (dataset.itemid != undefined) {
			itemid = dataset.itemid;
		}
		// e.g powers like disciplines
		else if (parent[0].dataset.itemid != undefined) {
			itemid = parent[0].dataset.itemid
		}

		if (itemid != undefined) {
			if (this.locked) {
				ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				return;
		   	}

			let item = await this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = duplicate(item);
			if ((index == 0) && (itemData.system.value == 1)) {
				itemData.system.value = 0;
			}
			else {
				itemData.system.value = parseInt(index + 1);
			}

			await item.update(itemData);

			return;
		}
		else {
			const abilityType = parent[0].dataset.ability;				
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");

			let isSpirit = false;

			if ((this.actor.type == CONFIG.worldofdarkness.sheettype.creature) && (this.actor.system.settings.variant == "spirit")) {
				isSpirit = true;
			}
	
			if (index < 0 || index > steps.length) {
				return;
			}
			
			if (fields[2] == "health") {
				return;
			}

			if ((this.locked) && (fields[2] != "temporary")) {
				 ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				 return;
			}
			if (((fieldStrings == "advantages.willpower.permanent") && (CONFIG.worldofdarkness.attributeSettings == "5th")) && (!isSpirit)) {
				ui.notifications.error(game.i18n.localize("wod.advantages.willpowerchange"));	
				return;
			}			
	
			if (abilityType == "secondary") {
				await this._updateSecondaryAbility(parent[0].dataset.key, index + 1);
			}
			else {
				await this._assignToActorField(fields, index + 1);
			}
		}	

		steps.removeClass("active");
		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		});
	}
	
	/* Clicked health boxes */
	async _onSquareCounterChange(event) {
		console.log("WoD | Update Health Levels");

		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const states = parseCounterStates("/:bashing,x:lethal,*:aggravated");
		const dataset = element.dataset;
		const type = dataset.type;

		const allStates = ["", ...Object.keys(states)];
		const currentState = allStates.indexOf(oldState);

		if (type != CONFIG.worldofdarkness.sheettype.mortal) {
			return;
		}
		
		if (currentState < 0) {
			return;
		}
		
		const actorData = duplicate(this.actor);

		if (oldState == "") {
			actorData.system.health.damage.bashing = parseInt(actorData.system.health.damage.bashing) + 1;
		}
		else if (oldState == "/") { 
			actorData.system.health.damage.bashing = parseInt(actorData.system.health.damage.bashing) - 1;
			actorData.system.health.damage.lethal = parseInt(actorData.system.health.damage.lethal) + 1;			
		}
		else if (oldState == "x") { 
			actorData.system.health.damage.lethal = parseInt(actorData.system.health.damage.lethal) - 1;
			actorData.system.health.damage.aggravated = parseInt(actorData.system.health.damage.aggravated) + 1;
		}
		else if (oldState == "*") { 
			actorData.system.health.damage.aggravated = parseInt(actorData.system.health.damage.aggravated) - 1;
		}

		if (parseInt(actorData.system.health.damage.bashing) < 0) {
			actorData.system.health.damage.bashing = 0;
		}

		if (parseInt(actorData.system.health.damage.lethal) < 0) {
			actorData.system.health.damage.lethal = 0;
		}

		if (parseInt(actorData.system.health.damage.aggravated) < 0) {
			actorData.system.health.damage.aggravated = 0;
		}

		await ActionHelper.handleCalculations(actorData);
		await ActionHelper.handleWoundLevelCalculations(actorData);

		await this.actor.update(actorData);
	}

	/* Clear health boxes */
	async _onSquareCounterClear(event) {
		console.log("WoD | Clear Health Level");

		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.mortal) {
			return;
		}

		const actorData = duplicate(this.actor);

		if (oldState == "") {
			return
		}
		else if (oldState == "/") { 
			actorData.system.health.damage.bashing = parseInt(actorData.system.health.damage.bashing) - 1;
		}
		else if (oldState == "x") { 
			actorData.system.health.damage.lethal = parseInt(actorData.system.health.damage.lethal) - 1;
		}
		else if (oldState == "*") { 
			actorData.system.health.damage.aggravated = parseInt(actorData.system.health.damage.aggravated) - 1;
		}

		await ActionHelper.handleCalculations(actorData);
		await ActionHelper.handleWoundLevelCalculations(actorData);

		await this.actor.update(actorData);
	}	

	/**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
	async _onItemCreate(event) {
		event.preventDefault();
		const type = $(event.currentTarget).data("type");
		const itemtype = $(event.currentTarget).data("itemtype");

		let itemData = undefined;		
		let found = false;

		if (itemtype == "Armor") {
			found = true;
			itemData = {
				name: `${game.i18n.localize("wod.labels.new.armor")}`,
				type: itemtype,
				system: {
					era: this.actor.system.settings.era
				}
			};
		}
		if (itemtype == "Weapon") {
			if (type == "natural") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.naturalweapon")}`,
					type: "Melee Weapon",					
					system: {
						isnatural: true,
						isweapon: true,
						era: this.actor.system.settings.era
					}
				};
			}
			if (type == "melee") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.meleeweapon")}`,
					type: "Melee Weapon",
					system: {
						isnatural: false,
						isweapon: true,
						conceal: "NA",
						era: this.actor.system.settings.era
					}
				};
			}
			if (type == "ranged") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.rangedweapon")}`,
					type: "Ranged Weapon",
					system: {
						isweapon: true,
						conceal: "NA",
						era: this.actor.system.settings.era
					}
				};
			}			
		}
		if (itemtype == "Feature") {
			let itemkind = "";
			let name = "";
			let level = 1;

			if (type == "bloodbound") {
				found = true;
				name = game.i18n.localize("wod.labels.new.bloodbound");
				itemkind = "wod.types.bloodbound";
			}
			if (type == "boon") {
				found = true;
				name = game.i18n.localize("wod.labels.new.boon");
				itemkind = "wod.types.boon";
				level = "";
			}
			if (type == "oath") {
				found = true;
				name = game.i18n.localize("wod.labels.new.oath");
				itemkind = "wod.types.oath";
			}
			if (type == "background") {
				found = true;
				name = game.i18n.localize("wod.labels.new.background");
				itemkind = "wod.types.background";
			}
			if (type == "merit") {
				found = true;
				name = game.i18n.localize("wod.labels.new.merit");
				itemkind = "wod.types.merit";
			}
			if (type == "flaw") {
				found = true;
				name = game.i18n.localize("wod.labels.new.flaw");
				itemkind = "wod.types.flaw";
			}
			
			

			itemData = {
				name: name,
				type: itemtype,
				system: {
					level: level,
					type: itemkind
				}
			};
		}
		if (itemtype == "Item") {
			let itemkind = "";
			let name = "";
			let iscontainter = false;

			if (type == "treasure") {
				found = true;
				name = game.i18n.localize("wod.labels.new.treasure");
				itemkind = "wod.types.treasure"
			}
			if (type == "device") {
				found = true;
				name = game.i18n.localize("wod.labels.new.device");
				itemkind = "wod.types.device"
			}
			if (type == "talisman") {
				found = true;
				name = game.i18n.localize("wod.labels.new.talisman");
				itemkind = "wod.types.talisman"
			}
			if (type == "periapt") {
				found = true;
				name = game.i18n.localize("wod.labels.new.periapt");
				itemkind = "wod.types.periapt"
				iscontainter = true;
			}
			if (type == "matrix") {
				found = true;
				name = game.i18n.localize("wod.labels.new.matrix");
				itemkind = "wod.types.matrix"
				iscontainter = true;
			}
			if (type == "trinket") {
				found = true;
				name = game.i18n.localize("wod.labels.new.trinket");
				itemkind = "wod.types.trinket"
			}

			itemData = {
				name: name,
				type: itemtype,
				system: {
					level: 1,
					type: itemkind,
					ismagical: true,
					iscontainter: iscontainter,
					era: this.actor.system.settings.era
				}
			};
		}
		if (itemtype == "Fetish") {
			if (type == "fetish") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.fetish")}`,
					type: itemtype,
					system: {
						level: 1,
						type: "wod.types.fetish",
						isrollable: true,
						ismagical: true,
						era: this.actor.system.settings.era
					}
				};
			}
			if (type == "talen") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.talen")}`,
					type: itemtype,
					system: {
						level: 1,
						type: "wod.types.talen",
						isrollable: true,
						ismagical: true,
						era: this.actor.system.settings.era
					}
				};
			}
		}
		if (itemtype == "Power") {
			itemData = await ItemHelper.CreateItemPower(event, type, itemData, itemtype);			

			found = itemData != undefined;
		}
		if (itemtype == "Rote") {
			found = true;
			itemData = {
				name: `${game.i18n.localize("wod.labels.new.rote")}`,
				type: itemtype,
				system: {
				}
			};
		}
		if (itemtype == "Trait") {
			if (type == "talentability") {
				await AbilityHelper.CreateAbility(this.actor, "wod.types.talentsecondability", game.i18n.localize("wod.labels.new.ability"), parseInt(this.actor.system.settings.abilities.defaultmaxvalue));
				return;
			}
			if (type == "skillability") {
				await AbilityHelper.CreateAbility(this.actor, "wod.types.skillsecondability", game.i18n.localize("wod.labels.new.ability"), parseInt(this.actor.system.settings.abilities.defaultmaxvalue));
				return;
			}
			if (type == "knowledgeability") {
				await AbilityHelper.CreateAbility(this.actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.labels.new.ability"), parseInt(this.actor.system.settings.abilities.defaultmaxvalue));
				return;
			}
			if (type == "resonance") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.resonance")}`,
					type: itemtype,
					system: {
						label: `${game.i18n.localize("wod.labels.new.resonance")}`,
						type: "wod.types.resonance"
					}
				};
			}
			if (type == "passion") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.passion")}`,
					type: itemtype,
					system: {
						label: `${game.i18n.localize("wod.labels.new.passion")}`,
						type: "wod.types.passion"
					}
				};
			}
			if (type == "fetter") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.fetter")}`,
					type: itemtype,
					system: {
						label: `${game.i18n.localize("wod.labels.new.fetter")}`,
						type: "wod.types.fetter"
					}
				};
			}
			if (type == "apocalypticform") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.apocalypticform")}`,
					type: itemtype,
					data: {
						iscreated: true,
						level: 0,
						type: "wod.types.apocalypticform"
					}
				};
			}
			if (type == "other") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.othertraits")}`,
					type: itemtype,
					system: {
						label: `${game.i18n.localize("wod.labels.new.othertraits")}`,
						type: "wod.types.othertraits"
					}
				};
			}
		}
		if (itemtype == "Bonus") {
			found = true;
			const id = $(event.currentTarget).data("parentid");

			itemData = {
				name: `${game.i18n.localize("wod.labels.new.bonus")}`,
				type: itemtype,				
				system: {
					parentid: id
				}
			};
		}
		if (itemtype == "Experience") {
			if (type == "add") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.addexp")}`,
					type: itemtype,
					system: {
						amount: 0,
						type: "wod.types.expgained"
					}
				};
			}
			if (type == "spent") {
				found = true;
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.spentexp")}`,
					type: itemtype,
					system: {
						amount: 0,
						type: "wod.types.expspent"
					}
				};
			}
		}

		if (found) {
			return await this.actor.createEmbeddedDocuments("Item", [itemData]);
		}
		else {
			ui.notifications.warn(game.i18n.localize("wod.labels.new.notfound"));
			return;
		}
		
	}

	async _onItemEdit(event) {
		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		var _a;

		event.preventDefault();
        event.stopPropagation();

		const itemtype = $(event.currentTarget).data("type");
		const itemId = $(event.currentTarget).data("item-id");

		if (itemtype == "Bio") {
			BioHelper.EditBio(event, this.actor);
			return;
		}
		if (itemtype == "Attribute") {
			AttributeHelper.EditAttribute(event, this.actor);
			return;
		}
		if (itemtype == "Ability") {
			AbilityHelper.EditAbility(event, this.actor);
			return;
		}
		if (itemtype == "Sphere") {
			SphereHelper.EditSphere(event, this.actor);
			return;
		}		

		const item = await this.actor.getEmbeddedDocument("Item", itemId);		
		item.sheetType = this.actor.type;

		if (item instanceof Item) {
            (_a = item.sheet) === null || _a === void 0 ? void 0 : _a.render(true);
		}
	}

	async _onItemActive(event) {		
		event.preventDefault();
        event.stopPropagation();

		const itemId = $(event.currentTarget).data("item-id");
		const type = $(event.currentTarget).data("type");
		const item = await this.actor.getEmbeddedDocument("Item", itemId);		

		if (type == "isactive") {
			let active = false;

			if (item.system.isactive) {
				active = false;
			}
			else {
				active = true;
			}

			await item.update({"data.isactive" : active});
		}
		if (type == "isequipped") {
			let equipped = false;

			if (item.system.isequipped) {
				equipped = false;
			}
			else {
				equipped = true;
			}

			await item.update({"data.isequipped" : equipped});			
		}

		const actorData = duplicate(this.actor);

		await ActionHelper.handleCalculations(actorData);
		await ActionHelper.handleWoundLevelCalculations(actorData);

		await this.actor.update(actorData);
	}

	async _onItemDelete(event) {
		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		event.preventDefault();
        event.stopPropagation();

		const itemId = $(event.currentTarget).data("item-id");
		let item = await this.actor.getEmbeddedDocument("Item", itemId);

        if (!item)
            return;

        const performDelete = await new Promise((resolve) => {
            Dialog.confirm({
                title: game.i18n.format(game.i18n.localize("wod.labels.remove.item"), { name: item.name }),
                yes: () => resolve(true),
                no: () => resolve(false),
                content: game.i18n.format(game.i18n.localize("wod.labels.remove.removing") + " " + item.name, {
                    name: item.name,
                    actor: this.actor.name,
                }),
            });
        });

        if (!performDelete)
            return;

		console.log("WoD | Deleting item id: " + itemId);

		// FIRST remove all bonuses connected to the item
		await ItemHelper.removeItemBonus(this.actor, item);
		// If removing a main power the secondary powers needs to be emptied of parentId.
		await ItemHelper.cleanItemList(this.actor, item);
		// If removing an item you need to check if there are bonuses to it and remove them as well.
		await ItemHelper.removeConnectedItems(this.actor, item);
		await this.actor.deleteEmbeddedDocuments("Item", [itemId]);        
	}

	async _onProperty(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		const type = dataset.type;
		const itemId = dataset.itemid;
		
		if (type == "bonus") {
			let item = await this.actor.getEmbeddedDocument("Item", itemId);
			const itemData = duplicate(item);

			let bonus = {
				name: game.i18n.localize("wod.labels.new.bonus"),
				settingtype: "",
				type: "",
				value: 0,
				isactive: item.system.isactive
			}

			itemData.system.bonuslist.push(bonus);
			await item.update(itemData);

			return;
		}	

		return;		
	}

	async _clearPower(event) {
		const itemId = $(event.currentTarget).data("item-id");
		const powertype = $(event.currentTarget).data("powertype");
		let item = await this.actor.getEmbeddedDocument("Item", itemId);

		const performDelete = await new Promise((resolve) => {
            Dialog.confirm({
                title: game.i18n.format("wod.labels.power.disconnect", { name: item.name }),
                yes: () => resolve(true),
                no: () => resolve(false),
                content: game.i18n.format(game.i18n.localize("wod.labels.power.disconnectlabel") + " " + item.name, {
                    name: item.name,
                    actor: this.actor.name,
                }),
            });
        });

		if (!performDelete)
            return;

		if (powertype == "power") {
			const itemData = duplicate(item);
			itemData.system.parentid = "";
			await item.update(itemData);	
		}
		else if (powertype == "main") {
			await ItemHelper.cleanItemList(this.actor, item);
		}
	}

	async _onSendChat(event) {
		const element = event.currentTarget;
		const itemid = element.dataset.itemid || "";
		let item = await this.actor.getEmbeddedDocument("Item", itemid);
		const headline = item.name;
		const description = item.system.description;
		const system = item.system.details;

		const templateData = {
			data: {
				actor: this.actor,
				type: "send",
				action: headline,
				message: "",
				description: description,
				system: system
			}
		};
	
		// Render the chat card template
		const template = `systems/worldofdarkness/templates/dialogs/roll-template.html`;
		const html = await renderTemplate(template, templateData);
	
		const chatData = {
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: html,
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			rollMode: game.settings.get("core", "rollMode")        
		};
		ChatMessage.applyRollMode(chatData, "roll");
		ChatMessage.create(chatData);
	}

	async _updateSecondaryAbility(itemId, value) {
		const item = await this.actor.getEmbeddedDocument("Item", itemId);

		const itemData = duplicate(item);

		if ((value == 1) && (itemData.system.value == 1)) {
			itemData.system.value = 0;
		}
		else {
			itemData.system.value = parseInt(value);
		}

		await item.update(itemData);
	}	
	  
	/**
	* If any changes are done to the Actor values.
	*/
	async _assignToActorField(fields, value) {
		console.log("WoD | Mortal Sheet _assignToActorField");
		
		const actorData = duplicate(this.actor);
		let area = fields[0];	
		const ability = fields[1];	

		if (area === "advantages") {			
			const abilityType = fields[2];

			if (ability === "willpower") {
				let isSpirit = false;

				if ((this.actor.type == CONFIG.worldofdarkness.sheettype.creature) && (this.actor.system.settings.variant == "spirit")) {
					isSpirit = true;
				}

				if (abilityType === "temporary") {
					if (actorData.system.advantages.willpower.temporary == value) {
						actorData.system.advantages.willpower.temporary = parseInt(actorData.system.advantages.willpower.temporary) - 1;
					}
					else {
						actorData.system.advantages.willpower.temporary = parseInt(value);
					}
				}
				else if ((CONFIG.worldofdarkness.attributeSettings == "20th") || (isSpirit)) {
					if (abilityType === "permanent") {
						if (actorData.system.advantages.willpower.permanent == value) {
							actorData.system.advantages.willpower.permanent = parseInt(actorData.system.advantages.willpower.permanent) - 1;
						}
						else {
							actorData.system.advantages.willpower.permanent = parseInt(value);
						}
					}
				}				
			}	
			else if (fields.length == 3) {
				const field = fields[2];

				if (actorData.system.advantages[ability][field] == value) {
					actorData.system.advantages[ability][field] = parseInt(actorData.system.advantages[ability][field]) - 1;
				}
				else {
					actorData.system.advantages[ability][field] = parseInt(value);
				}
			}
			else if (fields.length == 4) {
				const field = fields[3];

				if (actorData.system.advantages[ability][abilityType][field] == value) {
					actorData.system.advantages[ability][abilityType][field] = parseInt(actorData.system.advantages[ability][abilityType][field]) - 1;
				}
				else {
					actorData.system.advantages[ability][abilityType][field] = parseInt(value);
				}
			}
		}		
		// attribute or ability
		else {			
			if (area == "abilities") {
				const abilityType = fields[1];

				if (actorData.system[area][abilityType].value == value) {
					actorData.system[area][abilityType].value = parseInt(actorData.system[area][abilityType].value) - 1;
				}
				else {
					actorData.system[area][abilityType].value = parseInt(value);
				}		
			}
			else if (area == "attributes") {

				if (actorData.system[area][ability].value == value) {
					actorData.system[area][ability].value = parseInt(actorData.system[area][ability].value) - 1;
				}
				else {
					actorData.system[area][ability].value = parseInt(value);
				}
			}				
		}

		await ActionHelper.handleCalculations(actorData);
		await ActionHelper.handleWoundLevelCalculations(actorData);				
		
		console.log("WoD | Mortal Sheet updated");
		await this.actor.update(actorData);
	}		
}

function parseCounterStates(states) {
	return states.split(",").reduce((obj, state) => {
	  	const [k, v] = state.split(":");
	  	obj[k] = v;
	  	return obj;
	}, {});
}