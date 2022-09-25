import ActionHelper from "../scripts/action-helpers.js";
import MessageHelper from "../scripts/message-helpers.js"
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
				navSelector: ".sheet-spec-tabs",
				contentSelector: ".sheet-spec-body",
				initial: "normal",
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
		
		this.locked = true;
		this.isCharacter = true;	
		this.isGM = game.user.isGM;	
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
				ActionHelper._setMortalAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);

				actorData.system.settings.soak.bashing.isrollable = true;
				actorData.system.settings.soak.lethal.isrollable = false;
				actorData.system.settings.soak.aggravated.isrollable = false;
				actorData.system.settings.iscreated = true;
				this.actor.update(actorData);
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

		/* data = {
			config: CONFIG.wod,
			userpermissions: ActionHelper._getUserPermissions(game.user),
			graphicsettings: ActionHelper._getGraphicSettings(),
			locked: this.locked,
			isCharacter: this.isCharacter,
			isGM: this.isGM
		}; */

		data.dtypes = ["String", "Number", "Boolean"];	
		
		let ability_talents = [];

		const bloodbounds = [];

		for (const i in data.config.talents) {
			if (this.actor.system.abilities.talent[i].isvisible) {
				let talent = this.actor.system.abilities.talent[i];
				talent._id = i;
				talent.issecondary = false;
				talent.name = game.i18n.localize(talent.label);
				ability_talents.push(talent);
			}
		}

		let ability_skills = [];

		for (const i in data.config.skills) {
			if (this.actor.system.abilities.skill[i].isvisible) {
				let skill = this.actor.system.abilities.skill[i];
				skill._id = i;
				skill.issecondary = false;
				skill.name = game.i18n.localize(skill.label);		

				ability_skills.push(skill);
			}
		}

		let ability_knowledges = [];

		for (const i in data.config.knowledges) {
			if (this.actor.system.abilities.knowledge[i].isvisible) {
				let knowledge = this.actor.system.abilities.knowledge[i];
				knowledge._id = i;
				knowledge.issecondary = false;
				knowledge.name = game.i18n.localize(knowledge.label);
				ability_knowledges.push(knowledge);
			}
		}

		// Organize actor items
		const naturalWeapons = [];
		const meleeWeapons = [];
		const rangedWeapons = [];
		const armors = [];
		const backgrounds = [];
		const merits = [];
		const flaws = [];
		const other = [];

		// traits
		const meleeAbilities = [];
		const rangedAbilities = [];

		const expearned = [];
		const expspend = [];

		let totalExp = 0;
		let spentExp = 0;

		for (const i of data.items) {
			if (i.type == "Melee Weapon") {
				if (i.system.isnatural) {
					naturalWeapons.push(i);
				}
				if (!i.system.isnatural) {
					meleeWeapons.push(i);
				}
			}
			if (i.type == "Ranged Weapon") {
				rangedWeapons.push(i);
			}
			if (i.type == "Armor") {
				armors.push(i);
			}
			if (i.type == "Feature") {
				if (i.system.type == "wod.types.background") {
					backgrounds.push(i);
				}
				if (i.system.type == "wod.types.merit") {
					merits.push(i);
				}
				if (i.system.type == "wod.types.flaw") {
					flaws.push(i);
				}
				if (i.system.type == "wod.types.bloodbound") {
					bloodbounds.push(i);
				}
			}
			if (i.type == "Experience") {
				if (i.system.type == "wod.types.expgained") {
					expearned.push(i);
					totalExp += parseInt(i.system.amount);
				}
				if (i.system.type == "wod.types.expspent") {
					expspend.push(i);

					if (i.system.isspent) {
						spentExp += parseInt(i.system.amount);
					}
				}
			}
			if (i.type == "Trait") {
				if (i.system.type == "wod.types.talentsecondability") {
					const data = {
						issecondary: true,
						isvisible: true,
						label: i.system.label,
						max: i.system.max,
						name: i.name,
						speciality: i.system.speciality,
						value: i.system.value,
						_id: i._id
					}

					ability_talents.push(data);

					if (i.system.ismeleeweapon) {
						meleeAbilities.push(i);
					}
					if (i.system.israngedeweapon) {
						rangedAbilities.push(i);
					}
				}
				if (i.system.type == "wod.types.skillsecondability") {
					const data = {
						issecondary: true,
						isvisible: true,
						label: i.system.label,
						max: i.system.max,
						name: i.name,
						speciality: i.system.speciality,
						value: i.system.value,
						_id: i._id
					}

					ability_skills.push(data);

					if (i.system.ismeleeweapon) {
						meleeAbilities.push(i);
					}
					if (i.system.israngedeweapon) {
						rangedAbilities.push(i);
					}
				}
				if (i.system.type == "wod.types.knowledgesecondability") {
					const data = {
						issecondary: true,
						isvisible: true,
						label: i.system.label,
						max: i.system.max,
						name: i.name,
						speciality: i.system.speciality,
						value: i.system.value,
						_id: i._id
					}

					ability_knowledges.push(data);

					if (i.system.ismeleeweapon) {
						meleeAbilities.push(i);
					}
					if (i.system.israngedeweapon) {
						rangedAbilities.push(i);
					}
				}
				if (i.system.type == "wod.types.othertraits") {
					other.push(i);
				}
			}
		}		

		data.actor.system.listdata = [];

		if (data.actor.system.listdata.settings == undefined) {
			data.actor.system.listdata.settings = [];
		}

		data.actor.system.listdata.health = calculateHealth(data.actor, CONFIG.wod.sheettype.mortal);
		//data.actor.system.listdata.enrichedAppearance = await TextEditor.enrichHTML(data.actor.system.appearance, {async: true});
		data.actor.system.listdata.enrichedAppearance = await TextEditor.decodeHTML(data.actor.system.appearance, {async: true});
		data.actor.system.listdata.settings.haschimericalhealth = false;

		/* Abilities */
		data.actor.ability_talents = ability_talents.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.ability_skills = ability_skills.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.ability_knowledges = ability_knowledges.sort((a, b) => a.name.localeCompare(b.name));

		data.actor.meleeAbilities = meleeAbilities.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.rangedAbilities = rangedAbilities.sort((a, b) => a.name.localeCompare(b.name));

		/* Weapons */
		data.actor.naturalWeapons = naturalWeapons.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.meleeWeapons = meleeWeapons.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.rangedWeapons = rangedWeapons.sort((a, b) => a.name.localeCompare(b.name));

		/* Armor */
		data.actor.armors = armors.sort((a, b) => a.name.localeCompare(b.name));

		/* Notes */
		data.actor.backgrounds = backgrounds.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.merits = merits.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.flaws = flaws.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.bloodbounds = bloodbounds.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.othertraits = other.sort((a, b) => a.name.localeCompare(b.name));

		/* Experience Points */
		data.actor.expearned = expearned;
		data.actor.expspend = expspend;
		
		data.actor.totalExp = totalExp;
		data.actor.spentExp = spentExp;
		data.actor.experience = totalExp - spentExp;

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

		ActionHelper._setupDotCounters(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;
		
		// lock button
		html
			.find(".lock-btn")
			.click(this._onToggleLocked.bind(this));

		html
			.find('.inputdata')
			.change(event => this._onsheetChange(event));

		// ressource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));
		html
			.find(".resource-value > .resource-value-empty")
			.click(this._onDotCounterEmpty.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));
		html
			.find(".resource-counter > .resource-value-empty")
			.click(this._onDotCounterEmpty.bind(this));

		// health
		html
			.find(".health > .resource-counter > .resource-value-step")
			.click(this._onSquareCounterChange.bind(this));
		html
			.find(".health > .resource-counter > .resource-value-step")
			.on('contextmenu', this._onSquareCounterClear.bind(this));

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

		// skicka till chat
		html
			.find(".send-chat")
			.click(this._onSendChat.bind(this));		

		// setup chat hook for damage roll
		/* Hooks.on("renderChatMessage", (app, html, messageData) => {
			html
				.find(".vrollable")
				.click(this._onChatRoll.bind(this));
		}); */
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
			ActionHelper._handleCalculations(actorData);			
		}	
		else if (source == "ability") {
			const itemid = dataset.abilityid;
			const item = this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = duplicate(item);
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

			actorData.system.rage.bonus = value;
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
			ActionHelper._handleCalculations(actorData);
		}

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

		const actorData = duplicate(this.actor);
		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

		await this.actor.update(actorData);

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
		const abilityType = dataset.switchtype;
		const actorData = duplicate(this.actor);
		const source = dataset.source;

		if (source == "ability") {
			actorData.system.abilities[abilityType][ability].isvisible = !actorData.system.abilities[abilityType][ability].isvisible;
		}
		if (source == "soak") {
			actorData.system.settings.soak[abilityType].isrollable = !actorData.system.settings.soak[abilityType].isrollable;
		}
		if (source == "usesplatfont") {
			actorData.system.settings.usesplatfont = !actorData.system.settings.usesplatfont;
		}
		if (source == "powers") {
			if (abilityType == "disciplines") {
				actorData.system.settings.powers.hasdisciplines = !actorData.system.settings.powers.hasdisciplines;
			}
			if (abilityType == "gifts") {
				actorData.system.settings.powers.hasgifts = !actorData.system.settings.powers.hasgifts;
			}
			if (abilityType == "charms") {
				actorData.system.settings.powers.hascharms = !actorData.system.settings.powers.hascharms;
			}
			if (abilityType == "powers") {
				actorData.system.settings.powers.haspowers = !actorData.system.settings.powers.haspowers;
			}
		}

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

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

		if (dataset.itemid != undefined) {
			if (this.locked) {
				ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				return;
		   	}

		   	const itemid = dataset.itemid;

			let item = this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = duplicate(item);
			itemData.system.value = parseInt(index + 1);
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
			if ((this.locked) && (fieldStrings != "data.system.willpower.temporary")) {
				 ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				 return;
			}
			if ((fieldStrings == "data.system.willpower.permanent") && (CONFIG.wod.attributeSettings == "5th")) {
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

	/* Clear dots from value. Attributes/Abilities */
	async _onDotCounterEmpty(event) {
		console.log("WoD | Mortal Sheet _onDotCounterEmpty");
		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.mortal) {
			return;
		}		

		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		const steps = parent.find(".resource-value-empty");

		if (dataset.itemid != undefined) {
		   const itemid = dataset.itemid;

			let item = this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = duplicate(item);
			itemData.system.value = 0;
			await item.update(itemData);
		}
		else {
			const parent = $(element.parentNode);
			const abilityType = parent[0].dataset.ability;			
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");		
	
			if (abilityType == "secondary") {
				await this._updateSecondaryAbility(parent[0].dataset.key, 0);
			}
			else {	
				await this._assignToActorField(fields, 0);
			}
		}

		steps.removeClass("active");
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

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

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

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

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
						type: "wod.types.gift"
					}
				};
			}
			if (type == "rite") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.rite")}`,
					type: itemtype,
					system: {
						type: "wod.types.rite"
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
						type: "wod.types.talentsecondability"
					}
				};
			}
			if (type == "skillability") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.ability")}`,
					type: itemtype,
					system: {
						label: `${game.i18n.localize("wod.labels.new.ability")}`,
						type: "wod.types.skillsecondability"
					}
				};
			}
			if (type == "knowledgeability") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.ability")}`,
					type: itemtype,
					system: {
						label: `${game.i18n.localize("wod.labels.new.ability")}`,
						type: "wod.types.knowledgesecondability"
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

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

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

		await this.actor.deleteEmbeddedDocuments("Item", [itemId]);        
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
		itemData.system.value = parseInt(value);

		await item.update(itemData);
	}
	  
	/**
	* If any changes are done to the Actor values.
	*/
	async _assignToActorField(fields, value) {
		console.log("WoD | Mortal Sheet _assignToActorField");
		
		const actorData = duplicate(this.actor);

		// update actor owned items
		if (fields.length === 2 && fields[0] === "items") {
			for (const i of actorData.items) {
				if (fields[1] === i._id) {
					i.system.points = value;
					break;
				}
			}
		}
		else if (fields[2] === "health") {
			return
		} 
		else {
			if (fields[2] === "willpower") {
				if (fields[3] === "temporary") {
					if (actorData.system.willpower.temporary == value) {
						actorData.system.willpower.temporary = parseInt(actorData.system.willpower.temporary) - 1;
					}
					else {
						actorData.system.willpower.temporary = value;
					}
				}
				else if (CONFIG.wod.attributeSettings == "20th") {
					if (fields[3] === "permanent") {
						if (actorData.system.willpower.permanent == value) {
							actorData.system.willpower.permanent = parseInt(actorData.system.willpower.permanent) - 1;
						}
						else {
							actorData.system.willpower.permanent = value;
						}
					}
				}				
			}			
			else {			
				const lastField = fields.pop();
				fields.reduce((system, field) => system[field], actorData)[lastField] = value;
			}
		}

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

		// if Willpower has been changed then Difference between Rage and Willpower need to be recalculated
		if ((fields[2] === "willpower") && ((actorData.type == CONFIG.wod.sheettype.werewolf) || (actorData.type == "Changing Breed"))) {
			ActionHelper.handleWerewolfCalculations(actorData);
		}
		
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