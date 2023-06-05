import ActionHelper from "../scripts/action-helpers.js";
import CreateHelper from "../scripts/create-helpers.js";
import ItemHelper from "../scripts/item-helpers.js";
import MessageHelper from "../scripts/message-helpers.js";

import { calculateHealth } from "../scripts/health.js";
import * as selectbox from "../scripts/spec-select.js";

export class MortalActorSheet extends ActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["mortal"],
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

		console.log("WoD | Mortal Sheet constructor");
			
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
			if (actorData.type == CONFIG.wod.sheettype.mortal) {
				actorData.system.settings.iscreated = true;		
				actorData.system.settings.version = game.data.system.version;
				
				await CreateHelper.SetMortalAbilities(actorData);
				await CreateHelper.SetMortalAttributes(actorData);

				await this.actor.update(actorData);
			}	 	
		}
		else {
			if (!this.actor.limited) {
				await ActionHelper.handleCalculations(actorData);
				await this.actor.update(actorData);
			}
		}	

		console.log("WoD | Mortal Sheet getData");
		const data = await super.getData();	

		CONFIG.wod.sheetsettings.useSplatFonts = this.actor.system.settings.usesplatfont;	
		
		data.config = CONFIG.wod;				
		data.userpermissions = ActionHelper._getUserPermissions(game.user);
		data.graphicsettings = ActionHelper._getGraphicSettings();

		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = this.isGM;

		await ItemHelper.sortActorItems(data.actor, data.config);

		data.actor.system.appearance = await TextEditor.enrichHTML(data.actor.system.appearance, {async: true});
		data.actor.system.background = await TextEditor.enrichHTML(data.actor.system.background, {async: true});
		data.actor.system.gear = await TextEditor.enrichHTML(data.actor.system.gear, {async: true});

		if (data.actor.type == CONFIG.wod.sheettype.mage) {
			data.actor.system.focus.paradigm = await TextEditor.enrichHTML(data.actor.system.focus.paradigm, {async: true});
			data.actor.system.focus.practice = await TextEditor.enrichHTML(data.actor.system.focus.practice, {async: true});
			data.actor.system.focus.instruments = await TextEditor.enrichHTML(data.actor.system.focus.instruments, {async: true});
		}

		if (data.actor.type == CONFIG.wod.sheettype.changeling) {
			data.actor.system.threshold = await TextEditor.enrichHTML(data.actor.system.threshold, {async: true});
			data.actor.system.legacyseelie = await TextEditor.enrichHTML(data.actor.system.legacyseelie, {async: true});
			data.actor.system.legacyunseelie = await TextEditor.enrichHTML(data.actor.system.legacyunseelie, {async: true});
		}

		data.actor.system.listdata.health = await calculateHealth(data.actor, data.config.sheettype.mortal);

		data.actor.system.listdata.settings = [];
		data.actor.system.listdata.settings.haschimericalhealth = false;

		if (actorData.type == CONFIG.wod.sheettype.mortal) {
			console.log(CONFIG.wod.sheettype.mortal);
			console.log(data.actor);
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
			if (ele.dataset.sheet == CONFIG.wod.sheettype.mortal){
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

		html
			.find(".sheet_darkages")
			.click(this._setDarkAges.bind(this));	

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
			.find(".clearPower")
			.click(this._clearPower.bind(this));

		// skicka till chat
		html
			.find(".send-chat")
			.click(this._onSendChat.bind(this));		
	}

	async _setDarkAges(event) {
		const actorData = duplicate(this.actor);
		await CreateHelper.SetVampireDarkagesAbilities(actorData, this.actor);
		this.actor.update(actorData);
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
			const item = this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = duplicate(item);
			itemData.system.speciality = element.value;
			await item.update(itemData);
			return;
		}
		// has shifted from what chapeshifter type to another an then you need to check what that does with the permissions
		else if (source == "shiftertype") {
			var e = document.getElementById("system.changingbreed");
			var type = e.value;

			await CreateHelper.SetShifterAttributes(actorData, type);
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

		await ActionHelper.handleCalculations(actorData);

		await this.actor.update(actorData);
		this.render();
	}

	_onRollDialog(event) {		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.mortal) {
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

		if (dataset.type != CONFIG.wod.sheettype.mortal) {
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
			actorData.system.abilities[type][ability].isvisible = !actorData.system.abilities[type][ability].isvisible;
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

		if (type != CONFIG.wod.sheettype.mortal) {
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

			let item = this.actor.getEmbeddedDocument("Item", itemid);
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
			if ((fieldStrings == "advantages.willpower.permanent") && (CONFIG.wod.attributeSettings == "5th")) {
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

		if (type != CONFIG.wod.sheettype.mortal) {
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

		if (type != CONFIG.wod.sheettype.mortal) {
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

		const header = event.currentTarget;
		const type = header.dataset.type;
		const itemtype = header.dataset.itemtype;
		let itemData;

		if (itemtype == "Armor") {
			itemData = {
				name: `${game.i18n.localize("wod.labels.new.armor")}`,
				type: itemtype,
				system: {
				}
			};
		}
		if (itemtype == "Weapon") {
			if (type == "natural") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.naturalweapon")}`,
					type: "Melee Weapon",
					system: {
						isnatural: true
					}
				};
			}
			if (type == "melee") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.meleeweapon")}`,
					type: "Melee Weapon",
					system: {
						isnatural: false
					}
				};
			}
			if (type == "ranged") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.rangedweapon")}`,
					type: "Ranged Weapon",
					system: {
					}
				};
			}			
		}
		if (itemtype == "Feature") {
			if (type == "bloodbound") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.bloodbound")}`,
					type: itemtype,
					system: {
						level: 1,
						type: "wod.types.bloodbound"
					}
				};
			}
			if (type == "background") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.background")}`,
					type: itemtype,
					system: {
						level: 1,
						type: "wod.types.background"
					}
				};
			}
			if (type == "merit") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.merit")}`,
					type: itemtype,
					system: {
						level: 1,
						type: "wod.types.merit"
					}
				};
			}
			if (type == "flaw") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.flaw")}`,
					type: itemtype,
					system: {
						level: 1,
						type: "wod.types.flaw"
					}
				};
			}
		}
		if (itemtype == "Item") {
			if (type == "treasure") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.treasure")}`,
					type: itemtype,
					system: {
						level: 1,
						type: "wod.types.treasure"
					}
				};
			}
		}
		if (itemtype == "Fetish") {
			if (type == "fetish") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.fetish")}`,
					type: itemtype,
					system: {
						level: 1,
						type: "wod.types.fetish"
					}
				};
			}
			if (type == "talen") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.talen")}`,
					type: itemtype,
					system: {
						level: 1,
						type: "wod.types.talen"
					}
				};
			}
		}
		if (itemtype == "Power") {
			const level = parseInt(header.dataset.level);

			if (type == "gift") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.gift")}`,
					type: itemtype,
					system: {
						level: level,
						game: "werewolf",
						type: "wod.types.gift"
					}
				};
			}
			if (type == "rite") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.rite")}`,
					type: itemtype,
					system: {
						game: "werewolf",
						type: "wod.types.rite"
					}
				};
			}
			if (type == "discipline") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.discipline")}`,
					type: itemtype,
					system: {
						game: "vampire",
						type: "wod.types.discipline"
					}
				};
			}
			if (type == "disciplinepower") {
				const id = header.dataset.parentid;

				itemData = {
					name: `${game.i18n.localize("wod.labels.new.disciplinepower")}`,
					type: itemtype,
					system: {
						level: 1,
						game: "vampire",
						parentid: id,
						type: "wod.types.disciplinepower"
					}
				};
			}
			if (type == "disciplinepath") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.disciplinepath")}`,
					type: itemtype,
					system: {
						game: "vampire",
						type: "wod.types.disciplinepath"
					}
				};
			}
			if (type == "disciplinepathpower") {
				const id = header.dataset.parentid;

				itemData = {
					name: `${game.i18n.localize("wod.labels.new.disciplinepathpower")}`,
					type: itemtype,
					system: {
						level: 1,
						game: "vampire",
						parentid: id,
						type: "wod.types.disciplinepathpower"
					}
				};
			}
			if (type == "ritual") {
				const source = header.dataset.game;

				itemData = {
					name: `${game.i18n.localize("wod.labels.new.ritual")}`,
					type: itemtype,
					system: {
						level: 1,
						game: source,
						type: "wod.types.ritual"
					}
				};
			}
			if (type == "edge") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.edge")}`,
					type: itemtype,
					system: {
						game: "hunter",
						type: "wod.types.edge"
					}
				};
			}
			if (type == "edgepower") {
				const id = header.dataset.parentid;

				itemData = {
					name: `${game.i18n.localize("wod.labels.new.edgepower")}`,
					type: itemtype,
					system: {
						level: 1,
						game: "hunter",
						parentid: id,
						type: "wod.types.edgepower"
					}
				};
			}
			if (type == "art") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.art")}`,
					type: itemtype,
					system: {
						game: "changeling",
						type: "wod.types.art"
					}
				};
			}
			if (type == "artpower") {
				const id = header.dataset.parentid;

				itemData = {
					name: `${game.i18n.localize("wod.labels.new.artpower")}`,
					type: itemtype,
					system: {
						level: 1,
						game: "changeling",
						parentid: id,
						type: "wod.types.artpower"
					}
				};
			}
			if (type == "lore") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.lore")}`,
					type: itemtype,
					system: {
						game: "demon",
						type: "wod.types.lore"
					}
				};
			}
			if (type == "lorepower") {
				const id = header.dataset.parentid;

				itemData = {
					name: `${game.i18n.localize("wod.labels.new.lorepower")}`,
					type: itemtype,
					system: {
						level: 1,
						game: "demon",
						parentid: id,
						type: "wod.types.lorepower"
					}
				};
			}
		}
		if (itemtype == "Rote") {
			itemData = {
				name: `${game.i18n.localize("wod.labels.new.rote")}`,
				type: itemtype,
				system: {
				}
			};
		}
		if (itemtype == "Trait") {
			if (type == "talentability") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.ability")}`,
					type: itemtype,
					system: {
						label: `${game.i18n.localize("wod.labels.new.ability")}`,
						type: "wod.types.talentsecondability",
						max: parseInt(this.actor.system.settings.abilities.defaultmaxvalue)
					}
				};
			}
			if (type == "skillability") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.ability")}`,
					type: itemtype,
					system: {
						label: `${game.i18n.localize("wod.labels.new.ability")}`,
						type: "wod.types.skillsecondability",
						max: parseInt(this.actor.system.settings.abilities.defaultmaxvalue)
					}
				};
			}
			if (type == "knowledgeability") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.ability")}`,
					type: itemtype,
					system: {
						label: `${game.i18n.localize("wod.labels.new.ability")}`,
						type: "wod.types.knowledgesecondability",
						max: parseInt(this.actor.system.settings.abilities.defaultmaxvalue)
					}
				};
			}
			if (type == "resonance") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.resonance")}`,
					type: itemtype,
					system: {
						label: `${game.i18n.localize("wod.labels.new.resonance")}`,
						type: "wod.types.resonance"
					}
				};
			}
			if (type == "other") {
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
			const id = header.dataset.parentid;

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

		return await this.actor.createEmbeddedDocuments("Item", [itemData]);
	}

	async _onItemEdit(event) {
		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		var _a;

		event.preventDefault();
        event.stopPropagation();

		const itemId = $(event.currentTarget).data("item-id");
		const item = this.actor.getEmbeddedDocument("Item", itemId);		
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
		const item = this.actor.getEmbeddedDocument("Item", itemId);		

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

	_onSendChat(event) {
		const element = event.currentTarget;
		const message = element.dataset.message || "";
		const headline = element.dataset.headline || "";

		MessageHelper.printMessage(headline, message, this.actor);
	}

	async _updateSecondaryAbility(itemId, value) {
		const item = this.actor.getEmbeddedDocument("Item", itemId);

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
				if (abilityType === "temporary") {
					if (actorData.system.advantages.willpower.temporary == value) {
						actorData.system.advantages.willpower.temporary = parseInt(actorData.system.advantages.willpower.temporary) - 1;
					}
					else {
						actorData.system.advantages.willpower.temporary = parseInt(value);
					}
				}
				else if (CONFIG.wod.attributeSettings == "20th") {
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
				const abilityType = fields[2];

				if (actorData.system[area][ability][abilityType].value == value) {
					actorData.system[area][ability][abilityType].value = parseInt(actorData.system[area][ability][abilityType].value) - 1;
				}
				else {
					actorData.system[area][ability][abilityType].value = parseInt(value);
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