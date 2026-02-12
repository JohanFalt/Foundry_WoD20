import DropHelper from "../../scripts/drop-helpers.js";
import ActionHelper from "../../scripts/action-helpers.js";
import CreateHelper from "../../scripts/create-helpers.js";
import BioHelper from "../../scripts/bio-helpers.js";
import AbilityHelper from "../../scripts/ability-helpers.js";
import AttributeHelper from "../../scripts/attribute-helpers.js";
import SphereHelper from "../../scripts/sphere-helpers.js";
import ItemHelper from "../../scripts/item-helpers.js";
import SelectHelper from "../../scripts/select-helpers.js"
import CombatHelper from "../../scripts/combat-helpers.js";


import { calculateHealth } from "../../scripts/health.js";
import * as selectbox from "../../scripts/spec-select.js";

export default class MortalActorSheet extends foundry.appv1.sheets.ActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
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
		this.variantOpen = false;
	}	
	
	/** @override */
	get template() {
		return "systems/worldofdarkness/templates/actor/mortal-sheet.html";
	}

	/** @override */
	async getData() {
		const data = await super.getData();			
		
		data.config = CONFIG.worldofdarkness;	
		data.worldofdarkness = game.worldofdarkness;
		data.userpermissions = ActionHelper._getUserPermissions(game.user);
		data.graphicsettings = ActionHelper._getGraphicSettings();
		data.listData = SelectHelper.SetupItem(this.actor, true);

		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = this.isGM;		

		await ItemHelper.sortActorItems(data.actor, data.config);

		data.actor.system.appearance = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.appearance, {async: true});
		data.actor.system.background = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.background, {async: true});
		data.actor.system.gear = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.gear, {async: true});

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.mage) {
			data.actor.system.focus.paradigm = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.focus.paradigm, {async: true});
			data.actor.system.focus.practice = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.focus.practice, {async: true});
			data.actor.system.focus.instruments = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.focus.instruments, {async: true});
		}

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.changeling) {
			data.actor.system.threshold = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.threshold, {async: true});
			data.actor.system.legacyseelie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.legacyseelie, {async: true});
			data.actor.system.legacyunseelie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.legacyunseelie, {async: true});
		}

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.mummy) {
			data.actor.system.rebirth = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.rebirth, {async: true});
		}

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.exalted) {
			data.actor.system.intimacy = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.intimacy, {async: true});
			data.actor.system.animapowers = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.system.animapowers, {async: true});
		}

		data.actor.system.listdata.health = await calculateHealth(data.actor, data.config.sheettype.mortal);

		data.actor.system.listdata.settings = [];
		data.actor.system.listdata.settings.haschimericalhealth = false;

		if ((data.actor.system.settings.variant == "") && ((this.actor.type == CONFIG.worldofdarkness.sheettype.creature)||
											(this.actor.type == CONFIG.worldofdarkness.sheettype.wraith)||
											(this.actor.type == CONFIG.worldofdarkness.sheettype.vampire)||
											(this.actor.type == CONFIG.worldofdarkness.sheettype.changeling)||
											(this.actor.type == CONFIG.worldofdarkness.sheettype.mortal)||
											(this.actor.type == CONFIG.worldofdarkness.sheettype.exalted))) {
			if (!this.variantOpen) {
				this.variantOpen = true;
				ActionHelper.openVariantDialog(this.actor);
			}			
		}
		else if (((data.actor.system?.changingbreed == "") || (data.actor.system?.changingbreed == "general")) && (this.actor.type == CONFIG.worldofdarkness.sheettype.changingbreed)) {
			if (!this.variantOpen) {
				this.variantOpen = true;
				ActionHelper.openVariantDialog(this.actor);
			}
		}

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.mortal) {
			console.log(`${data.actor.name} - (${CONFIG.worldofdarkness.sheettype.mortal})`);
			console.log(data.actor);
		}

		return data;
	}	

	/** @override */
	activateListeners(html) {
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
			.find('.unfold.button')
			.click(event => ItemHelper._onTableCollapse(event, this.actor._id));		

		// Receive collapsed state from flags
		html.find('.unfold.button').toArray().filter(ele => {
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

		// drag and drop
		html.find('.draggable').each((i, element) => {
            DropHelper.HandleDragDrop(this, this.actor, html, element);
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

		// set era Classical Ages
		html
			.find(".sheet_classical")
			.click(this._setClassical.bind(this));

		// set era Age of Living Gods
		html
			.find(".sheet_livinggods")
			.click(this._setLivingGods.bind(this));

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
			
		const collapsibles = html[0].querySelectorAll(".collapsible");

		collapsibles.forEach(icon => {
			icon.addEventListener("click", () => {
				const itemId = icon.dataset.itemid;
				const bonusDiv = html[0].querySelector(`.description[data-itemid="${itemId}"]`);
				if (!bonusDiv) return;

				const isOpen = bonusDiv.style.maxHeight && bonusDiv.style.maxHeight !== "0px";

				if (isOpen) {
					bonusDiv.style.maxHeight = "0";
					icon.classList.remove("fa-compress");
					icon.classList.add("fa-expand");
					bonusDiv.classList.remove("collapsible-open");					
				} 
				else {
					bonusDiv.style.maxHeight = bonusDiv.scrollHeight + "px";
					bonusDiv.classList.add("collapsible-open");
					icon.classList.remove("fa-expand");
					icon.classList.add("fa-compress");
				}
			});
		});
	}

	async _onDrop(event) {
		const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);		

		// Handle different data types
		switch (data.type) {
			case 'Item':
				return this._onDropItem(event, data)
		}
	}

	/** @override */
    /**
        * If an item is dropped at the sheet.
        * @param _event
        * @param data - the dropped item
    */
    async _onDropItem(_event, _data) {
		if (!_data.uuid) return false;
		if (!this.actor.isOwner) return false;

		await DropHelper.OnDropItem(_event, _data, this.actor);
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

		let actorData = foundry.utils.duplicate(this.actor);
		actorData = await CreateHelper.SetAbilities(actorData, dataset.type.toLowerCase(), "darkages");

		if (dataset.type == CONFIG.worldofdarkness.sheettype.vampire) {
			found = true;
			await CreateHelper.SetVampireAbilities(this.actor, "darkages");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.werewolf) {
			found = true;
			await CreateHelper.SetWerewolfAbilities(this.actor, "darkages");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mortal) {
			found = true;
			await CreateHelper.SetMortalAbilities(this.actor, "darkages");
		}
		
		if (found) {
			actorData.system.settings.era = CONFIG.worldofdarkness.era.darkages;
			actorData.system.settings.isupdated = false;
			await this.actor.update(actorData);
			ui.notifications.info(game.i18n.localize("wod.labels.settings.setdarkages"));
		}
	}

	async _setLivingGods(event) {
		event.preventDefault();

		if (this.actor.system.settings.era == CONFIG.worldofdarkness.era.livinggods) {
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

		let actorData = foundry.utils.duplicate(this.actor);
		actorData = await CreateHelper.SetAbilities(actorData, dataset.type.toLowerCase(), "livinggods");

		if (dataset.type == CONFIG.worldofdarkness.sheettype.vampire) {
			found = true;
			await CreateHelper.SetVampireAbilities(this.actor, "livinggods");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mortal) {
			found = true;
			await CreateHelper.SetMortalAbilities(this.actor, "livinggods");
		}
		
		if (found) {
			actorData.system.settings.era = CONFIG.worldofdarkness.era.livinggods;
			actorData.system.settings.isupdated = false;
			await this.actor.update(actorData);
			ui.notifications.info(game.i18n.localize("wod.labels.settings.setlivinggods"));
		}
	}
	
	async _setClassical(event) {
		event.preventDefault();

		if (this.actor.system.settings.era == CONFIG.worldofdarkness.era.classical) {
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

		let actorData = foundry.utils.duplicate(this.actor);
		actorData = await CreateHelper.SetAbilities(actorData, dataset.type.toLowerCase(), "classical");

		if (dataset.type == CONFIG.worldofdarkness.sheettype.vampire) {
			found = true;
			await CreateHelper.SetVampireAbilities(this.actor, "classical");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mortal) {
			found = true;
			await CreateHelper.SetMortalAbilities(this.actor, "classical");
		}
		
		if (found) {
			actorData.system.settings.era = CONFIG.worldofdarkness.era.classical;
			actorData.system.settings.isupdated = false;
			await this.actor.update(actorData);
			ui.notifications.info(game.i18n.localize("wod.labels.settings.setclassical"));
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

		let actorData = foundry.utils.duplicate(this.actor);
		actorData = await CreateHelper.SetAbilities(actorData, dataset.type.toLowerCase(), "victorian");

		if (dataset.type == CONFIG.worldofdarkness.sheettype.vampire) {
			found = true;
			await CreateHelper.SetVampireAbilities(this.actor, "victorian");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.werewolf) {
			found = true;
			await CreateHelper.SetWerewolfAbilities(this.actor, "victorian");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mage) {
			found = true;
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mortal) {
			found = true;
			await CreateHelper.SetMortalAbilities(this.actor, "victorian");
		}
		
		if (found) {
			actorData.system.settings.era = CONFIG.worldofdarkness.era.victorian;
			actorData.system.settings.isupdated = false;
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

		let actorData = foundry.utils.duplicate(this.actor);
		actorData = await CreateHelper.SetAbilities(actorData, dataset.type.toLowerCase(), "modern");

		if (dataset.type == CONFIG.worldofdarkness.sheettype.vampire) {
			found = true;
			await CreateHelper.SetVampireAbilities(this.actor, "modern");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.werewolf) {
			found = true;
			await CreateHelper.SetWerewolfAbilities(this.actor, "modern");
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mage) {
			found = true;
		}

		if (dataset.type == CONFIG.worldofdarkness.sheettype.mortal) {
			found = true;
			await CreateHelper.SetMortalAbilities(this.actor, "modern");
		}
		
		if (found) {
			actorData.system.settings.era = CONFIG.worldofdarkness.era.modern;
			actorData.system.settings.isupdated = false;

			await this.actor.update(actorData);
			ui.notifications.info(game.i18n.localize("wod.labels.settings.setmodern"));
		}
	}	

	async _setVariant(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		let actorData = foundry.utils.duplicate(this.actor);

		if (this.actor.type == CONFIG.worldofdarkness.sheettype.changeling) {
			actorData = await CreateHelper.SetChangingVariant(actorData, dataset.value);
		}
		if (this.actor.type == CONFIG.worldofdarkness.sheettype.vampire) {
			actorData = await CreateHelper.SetVampireVariant(actorData, dataset.value);
		}
		if (this.actor.type == CONFIG.worldofdarkness.sheettype.wraith) {
			actorData.system.settings.variant = dataset.value;
		}
		if (this.actor.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
			actorData = await CreateHelper.SetShifterAttributes(actorData, dataset.value);
		}
		if (this.actor.type == CONFIG.worldofdarkness.sheettype.mortal) {
			actorData = await CreateHelper.SetMortalVariant(this.actor, actorData, dataset.value);
		}
		if (this.actor.type == CONFIG.worldofdarkness.sheettype.exalted) {
			actorData = await CreateHelper.SetExaltedVariant(actorData, dataset.value);			
		}
		if (this.actor.type == CONFIG.worldofdarkness.sheettype.creature) {
			actorData = await CreateHelper.SetCreatureVariant(actorData, dataset.value);			
		}

		actorData.system.settings.isupdated = false;		
        await this.actor.update(actorData);
		await CreateHelper.SetVariantItems(this.actor, dataset.value, game.data.system.version);
	}

	async _onsheetChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		const source = dataset.source;
		const actorData = foundry.utils.duplicate(this.actor);

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
			const itemData = foundry.utils.duplicate(item);
			itemData.system.speciality = element.value;
			await item.update(itemData);
			return;
		}
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
		else if (source == "item") {
			const itemid = dataset.itemid;
			const item = await this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = foundry.utils.duplicate(item);

			const fields = dataset.type.split(".");

			if (parseInt(element.value) > itemData.system[fields[0]].max) {
				element.value = itemData.system[fields[0]].max;
			}

			itemData.system[fields[0]][fields[1]] = parseInt(element.value);
			await item.update(itemData);

			this.render();
			return;
		}

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		//this.render();
	}

	_onRollDialog(event) {		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.mortal) {
			return;
		}

		ActionHelper.RollDialog(dataset, this.actor);		
	}

	_onChatRoll(event) {		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.actorid != this.actor.id) {
			console.warn(`WoD | aborting _onChatRoll - ${dataset.actorid} vs ${this.actor.id} (${this.actor.name})`);
			return;
		}

		ActionHelper.RollDialog(dataset, this.actor);		
	}

	/* Lock / unlock the sheet */
	async _onToggleLocked(event) {
		event.preventDefault();

		// make sure it is a click
		if (event.detail === 0) return; // detail === 0 means keyboard-triggered click

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
		const actorData = foundry.utils.duplicate(this.actor);
		const source = dataset.source;
		const type = dataset.switchtype;

		if (source == "ability") {
			actorData.system.abilities[ability].isvisible = !actorData.system.abilities[ability].isvisible;
		}
		// updates if a secondary ability is to be visible or not.
		if (source == "secondaryability") {
			const itemid = dataset.itemid;
			const item = await this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = foundry.utils.duplicate(item);
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

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		this.render();
	}
  
	/* Alter dots e.g attributes, abilities */
	async _onDotCounterChange(event) {
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
			const itemData = foundry.utils.duplicate(item);
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
			if (((fieldStrings == "advantages.willpower.permanent") && 
						(CONFIG.worldofdarkness.attributeSettings == "5th") && 
						(CONFIG.worldofdarkness.fifthEditionWillpowerSetting == "5th") &&
						(!isSpirit))) {
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
		
		const actorData = foundry.utils.duplicate(this.actor);

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

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		this.render();
	}

	/* Clear health boxes */
	async _onSquareCounterClear(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.mortal) {
			return;
		}

		const actorData = foundry.utils.duplicate(this.actor);

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

		if (parseInt(actorData.system.health.damage.bashing) < 0) {
			actorData.system.health.damage.bashing = 0;
		}

		if (parseInt(actorData.system.health.damage.lethal) < 0) {
			actorData.system.health.damage.lethal = 0;
		}

		if (parseInt(actorData.system.health.damage.aggravated) < 0) {
			actorData.system.health.damage.aggravated = 0;
		}

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		this.render();
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
		
		if (itemtype == "All") {
			// Define the actor's gamesystem, defaulting to "mortal" if it's not in the systems list
			let system = this.actor.type;
			let buttons = {};
			let sheettype;

			if (this.actor.system.settings.variantsheet != "") {
				system = this.actor.system.settings.variantsheet;
			}

			let origin = $(event.currentTarget).data("origin");
			
			if (this.actor.type != CONFIG.worldofdarkness.sheettype.changingbreed) {
				sheettype = this.actor.type.toLowerCase();
			}
			else {
				sheettype = CONFIG.worldofdarkness.sheettype.werewolf;
			}

			system = sheettype;

			// Render the template
			const itemselectionTemplate = 'systems/worldofdarkness/templates/dialogs/dialog-new-item.hbs';
			const itemselectionData = {
				tab: origin,
				sheettype: sheettype,
				actor: this.actor
			}
			const itemselectionContent = await foundry.applications.handlebars.renderTemplate(itemselectionTemplate, itemselectionData);

			if (origin == "core") {
				buttons = {
					talent: {
						classes: "button fullSplatColor pointer",
						label: game.i18n.localize("wod.types.talentsecondability"),
						callback: async () => {
							await AbilityHelper.CreateAbility(this.actor, "wod.types.talentsecondability", game.i18n.localize("wod.labels.new.ability"), parseInt(this.actor.system.settings.abilities.defaultmaxvalue), false, false, true);
							return;
						}
					},
					skill: {
						classes: "button fullSplatColor pointer",
						label: game.i18n.localize("wod.types.skillsecondability"),
						callback: async () => {
							await AbilityHelper.CreateAbility(this.actor, "wod.types.skillsecondability", game.i18n.localize("wod.labels.new.ability"), parseInt(this.actor.system.settings.abilities.defaultmaxvalue), false, false, true);
							return;
						}
					},
					knowledge: {
						classes: "button fullSplatColor pointer",
						label: game.i18n.localize("wod.types.knowledgesecondability"),
						callback: async () => {
							await AbilityHelper.CreateAbility(this.actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.labels.new.ability"), parseInt(this.actor.system.settings.abilities.defaultmaxvalue), false, false, true);
							return;
						}
					}
				}				
			}
			if (origin == "combat") {
				buttons = await CreateHelper.CreateButtonsCombat(this.actor);
			}
			if (origin == "gear") {
				buttons = await CreateHelper.CreateButtonsGear(this.actor);
			}
			if (origin == "note") {
				buttons = await CreateHelper.CreateButtonsNote(this.actor);
			}
			if (origin == "power") {
				buttons = await CreateHelper.CreateButtonsPower(this.actor);
			}

			new Dialog(
				{
				  title: game.i18n.localize("wod.labels.new.create"),
				  content: itemselectionContent,
				  buttons
				},
				{
				  classes: ['wod20', system.toLowerCase(), 'wod-dialog', 'wod-create']
				}
			  ).render(true);

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
		const itemid = $(event.currentTarget).data("item-id");

		if (itemtype == "Bio") {
			BioHelper.EditBio(event, this.actor);
			return;
		}
		if (itemtype == "Attribute") {
			AttributeHelper.EditAttribute(this.actor, itemid);
			return;
		}
		if (itemtype == "Ability") {
			AbilityHelper.EditAbility(this.actor, itemid);
			return;
		}
		if (itemtype == "Sphere") {
			SphereHelper.EditSphere(this.actor, itemid);
			return;
		}		

		const item = await this.actor.getEmbeddedDocument("Item", itemid);		
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

			let itemData = foundry.utils.duplicate(item);
			itemData.system.isactive = active;

			if (itemData.system.bonuslist.length > 0) {
				for (let i = 0; i <= itemData.system.bonuslist.length - 1; i++) {
					itemData.system.bonuslist[i].isactive = active;
				}
			}

			await item.update(itemData);
		}
		if (type == "isequipped") {
			let equipped = false;

			if (item.system.isequipped) {
				equipped = false;
			}
			else {
				equipped = true;
			}

			await item.update({"system.isequipped" : equipped});			
		}

		const actorData = foundry.utils.duplicate(this.actor);
		actorData.system.movement = await CombatHelper.CalculateMovement(actorData);
		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		this.render();
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

		// FIRST remove all bonuses connected to the item
		await ItemHelper.removeItemBonus(this.actor, item);
		// If removing a main power the secondary powers needs to be emptied of parentId.
		await ItemHelper.cleanItemList(this.actor, item);
		// If removing an item you need to check if there are bonuses to it and remove them as well.
		await ItemHelper.removeConnectedItems(this.actor, item);
		await this.actor.deleteEmbeddedDocuments("Item", [itemId]);  
		this.render();      
	}

	async _onProperty(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		const type = dataset.type;
		const itemId = dataset.itemid;
		
		if (type == "bonus") {
			let item = await this.actor.getEmbeddedDocument("Item", itemId);
			const itemData = foundry.utils.duplicate(item);

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
			const itemData = foundry.utils.duplicate(item);
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
		const template = `systems/worldofdarkness/templates/dialogs/roll-template.hbs`;
		const html = await foundry.applications.handlebars.renderTemplate(template, templateData);
	
		const chatData = {
			content: html,
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			rollMode: game.settings.get("core", "rollMode")        
		};
		ChatMessage.applyRollMode(chatData, "roll");
		ChatMessage.create(chatData);
	}

	async _updateSecondaryAbility(itemId, value) {
		const item = await this.actor.getEmbeddedDocument("Item", itemId);

		const itemData = foundry.utils.duplicate(item);

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
		const actorData = foundry.utils.duplicate(this.actor);
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
				else if ((CONFIG.worldofdarkness.attributeSettings == "20th") || 
							((CONFIG.worldofdarkness.attributeSettings == "5th") && (CONFIG.worldofdarkness.fifthEditionWillpowerSetting == "20th")) ||
							(isSpirit)) {				
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
		// renown (only v1 sheets)
		else if (area === "renown") {	
			if (fields.length == 3) {
				const field = fields[2];

				if (actorData.system[area][ability][field] == value) {
					actorData.system[area][ability][field] = parseInt(actorData.system[area][ability][field]) - 1;
				}
				else {
					actorData.system[area][ability][field] = parseInt(value);
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
		
		actorData.system.settings.isupdated = false;
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

