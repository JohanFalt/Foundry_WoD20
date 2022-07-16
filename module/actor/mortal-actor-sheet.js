import ActionHelper from "../scripts/action-helpers.js";
import { calculateTotals } from "../scripts/totals.js";
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
	getData() {
		const actorData = duplicate(this.actor);		

		if (!actorData.data.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.mortal) {
				ActionHelper._setMortalAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);

				actorData.data.settings.soak.bashing.isrollable = true;
				actorData.data.settings.soak.lethal.isrollable = false;
				actorData.data.settings.soak.aggravated.isrollable = false;
				actorData.data.settings.iscreated = true;
				this.actor.update(actorData);
			}	 	
		}	

		console.log("WoD | Mortal Sheet getData");
		const data = super.getData();		

		CONFIG.wod.sheetsettings.useSplatFonts = this.actor.data.data.settings.usesplatfont;	
		
		data.config = CONFIG.wod;				
		data.userpermissions = ActionHelper._getUserPermissions(game.user);
		data.graphicsettings = ActionHelper._getGraphicSettings();

		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = this.isGM;

		data.dtypes = ["String", "Number", "Boolean"];	
		
		let ability_talents = [];

		for (const i in data.config.alltalents) {
			if (this.actor.data.data.abilities.talent[i].isvisible) {
				let talent = this.actor.data.data.abilities.talent[i];
				talent._id = i;
				talent.name = game.i18n.localize(talent.label);
				ability_talents.push(talent);
			}
		}

		let ability_skills = [];

		for (const i in data.config.allskills) {
			if (this.actor.data.data.abilities.skill[i].isvisible) {
				let skill = this.actor.data.data.abilities.skill[i];
				skill._id = i;
				skill.name = game.i18n.localize(skill.label);				
				ability_skills.push(skill);
			}
		}

		let ability_knowledges = [];

		for (const i in data.config.allknowledges) {
			if (this.actor.data.data.abilities.knowledge[i].isvisible) {
				let knowledge = this.actor.data.data.abilities.knowledge[i];
				knowledge._id = i;
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

		const expearned = [];
		const expspend = [];

		let totalExp = 0;
		let spentExp = 0;

		for (const i of data.items) {
			if (i.type == "Melee Weapon") {
				if (i.data.isnatural) {
					naturalWeapons.push(i);
				}
				else if (!i.data.isnatural) {
					meleeWeapons.push(i);
				}
			}
			else if (i.type == "Ranged Weapon") {
				rangedWeapons.push(i);
			}
			else if (i.type == "Armor") {
				armors.push(i);
			}
			else if (i.type == "Feature") {
				if (i.data.type == "wod.types.background") {
					backgrounds.push(i);
				}
				else if (i.data.type == "wod.types.merit") {
					merits.push(i);
				}
				else if (i.data.type == "wod.types.flaw") {
					flaws.push(i);
				}
			}
			else if (i.type == "Experience") {
				if (i.data.type == "wod.types.expgained") {
					expearned.push(i);
					totalExp += parseInt(i.data.amount);
				}
				else if (i.data.type == "wod.types.expspent") {
					expspend.push(i);

					if (i.data.isspent) {
						spentExp += parseInt(i.data.amount);
					}
				}
			}
		}		

		data.actor.health = calculateHealth(data.actor);

		data.actor.ability_talents = ability_talents.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.ability_skills = ability_skills.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.ability_knowledges = ability_knowledges.sort((a, b) => a.name.localeCompare(b.name));

		data.actor.naturalWeapons = naturalWeapons.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.meleeWeapons = meleeWeapons.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.rangedWeapons = rangedWeapons.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.armors = armors.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.backgrounds = backgrounds.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.merits = merits.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.flaws = flaws.sort((a, b) => a.name.localeCompare(b.name));

		//data.actor.expearned = expearned.sort((a, b) => b.data.description.localeCompare(a.description));
		data.actor.expearned = expearned;
		//data.actor.expspend = expspend.sort((a, b) => b.name.localeCompare(a.description));	
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
		Hooks.on("renderChatMessage", (app, html, messageData) => {
			html
				.on("click", ".vrollable", this._onRollDialog.bind(this));
		});

	}
	
	async _onsheetChange(event) {
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

			actorData.data.attributes[attribute].bonus = value;
			ActionHelper._handleCalculations(actorData);			
		}	
		if (source == "frenzy") {
			let value = 0;

			try {
				value = parseInt(element.value);
			} catch (error) {
				value = 0;
			}

			actorData.data.rage.bonus = value;
		}
		if (source == "soak") {
			let value = 0;
			const type = dataset.type;

			try {
				value = parseInt(element.value);
			} catch (error) {
				value = 0;
			}

			actorData.data.settings.soak[type].bonus = value;
		}
		if (source == "initiative") {
			let value = 0;
			const type = dataset.type;

			try {
				value = parseInt(element.value);
			} catch (error) {
				value = 0;
			}

			actorData.data.initiative.bonus = value;
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

	_onToggleLocked(event) {
		event.preventDefault();
		this.locked = !this.locked;
		this._render();
	}

	_switchSetting(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.mortal) {
			return;
		}

		const ability = dataset.label;
		const abilityType = dataset.switchtype;
		const actorData = duplicate(this.actor);
		const source = dataset.source;

		if (source == "ability") {
			actorData.data.abilities[abilityType][ability].isvisible = !actorData.data.abilities[abilityType][ability].isvisible;
		}
		if (source == "soak") {
			actorData.data.settings.soak[abilityType].isrollable = !actorData.data.settings.soak[abilityType].isrollable;

			if (actorData.data.settings.soak[abilityType].isrollable) {
				actorData.data.soak[abilityType] = actorData.data.attributes.stamina.total;
			}
			else {
				actorData.data.soak[abilityType] = 0;
			}
		}
		if (source == "usesplatfont") {
			actorData.data.settings.usesplatfont = !actorData.data.settings.usesplatfont;
		}

		this.actor.update(actorData);
	}
  
	_onDotCounterChange(event) {
		console.log("WoD | Mortal Sheet _onDotCounterChange");
		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.mortal) {
			return;
		}
		
		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if (fields[2] == "health") {
			return;
		}
		if ((this.locked) && (fieldStrings != "data.data.willpower.temporary")) {
		 	ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
		 	return;
		}
		if ((fieldStrings == "data.data.willpower.permanent") && (CONFIG.wod.attributeSettings == "5th")) {
			ui.notifications.error(game.i18n.localize("wod.advantages.willpowerchange"));	
			return;
		}

		if (index < 0 || index > steps.length) {
			return;
		}

		steps.removeClass("active");

		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		});

		this._assignToActorField(fields, index + 1);
	}

	_onDotCounterEmpty(event) {
		console.log("WoD | Mortal Sheet _onDotCounterEmpty");
		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.mortal) {
			return;
		}		

		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-empty");
		
		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		steps.removeClass("active");		
		this._assignToActorField(fields, 0);
	}
	
	_onSquareCounterChange(event) {
		console.log("WoD | Update Health Levels");

		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const states = parseCounterStates("/:bashing,x:lethal,*:aggravated");

		const allStates = ["", ...Object.keys(states)];
		const currentState = allStates.indexOf(oldState);
		
		if (currentState < 0) {
			return;
		}
		
		const actorData = duplicate(this.actor);

		if (oldState == "") {
			actorData.data.health.damage.bashing = parseInt(actorData.data.health.damage.bashing) + 1;
		}
		else if (oldState == "/") { 
			actorData.data.health.damage.bashing = parseInt(actorData.data.health.damage.bashing) - 1;
			actorData.data.health.damage.lethal = parseInt(actorData.data.health.damage.lethal) + 1;			
		}
		else if (oldState == "x") { 
			actorData.data.health.damage.lethal = parseInt(actorData.data.health.damage.lethal) - 1;
			actorData.data.health.damage.aggravated = parseInt(actorData.data.health.damage.aggravated) + 1;
		}
		else if (oldState == "*") { 
			actorData.data.health.damage.aggravated = parseInt(actorData.data.health.damage.aggravated) - 1;
		}

		if (parseInt(actorData.data.health.damage.bashing) < 0) {
			actorData.data.health.damage.bashing = 0;
		}

		if (parseInt(actorData.data.health.damage.lethal) < 0) {
			actorData.data.health.damage.lethal = 0;
		}

		if (parseInt(actorData.data.health.damage.aggravated) < 0) {
			actorData.data.health.damage.aggravated = 0;
		}

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

		this.actor.update(actorData);
	}

	_onSquareCounterClear(event) {
		console.log("WoD | Clear Health Level");

		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const actorData = duplicate(this.actor);

		if (oldState == "") {
			return
		}
		else if (oldState == "/") { 
			actorData.data.health.damage.bashing = parseInt(actorData.data.health.damage.bashing) - 1;
		}
		else if (oldState == "x") { 
			actorData.data.health.damage.lethal = parseInt(actorData.data.health.damage.lethal) - 1;
		}
		else if (oldState == "*") { 
			actorData.data.health.damage.aggravated = parseInt(actorData.data.health.damage.aggravated) - 1;
		}

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

		this.actor.update(actorData);
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

		if (itemtype == "Feature") {
			if (type == "bloodbound") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.bloodbound")}`,
					type: itemtype,
					data: {
						level: 1,
						type: "wod.types.bloodbound"
					}
				};
			}
			if (type == "background") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.background")}`,
					type: itemtype,
					data: {
						level: 1,
						type: "wod.types.background"
					}
				};
			}
			if (type == "merit") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.merit")}`,
					type: itemtype,
					data: {
						level: 1,
						type: "wod.types.merit"
					}
				};
			}
			if (type == "flaw") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.flaw")}`,
					type: itemtype,
					data: {
						level: 1,
						type: "wod.types.flaw"
					}
				};
			}
		}
		if (itemtype == "Experience") {
			if (type == "add") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.addexp")}`,
					type: itemtype,
					data: {
						amount: 0,
						type: "wod.types.expgained"
					}
				};
			}
			if (type == "spent") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.spentexp")}`,
					type: itemtype,
					data: {
						amount: 0,
						type: "wod.types.expspent"
					}
				};
			}
		}

		return this.actor.createEmbeddedDocuments("Item", [itemData]);
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
		const item = this.actor.items.get(itemId);
		let active = false;

		if (item.data.data.isactive) {
			active = false;
		}
		else {
			active = true;
		}

		item.update({"data.isactive" : active});

		console.log("WoD | Editing item id: " + itemId);
	}

	async _onItemDelete(event) {
		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		event.preventDefault();
        event.stopPropagation();

		const itemId = $(event.currentTarget).data("item-id");
		let item = this.actor.getEmbeddedDocument("Item", itemId);

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

		this.actor.deleteEmbeddedDocuments("Item", [itemId]);        
	}

	_onSendChat(event) {
		const element = event.currentTarget;
		const message = element.dataset.message || "";
		const headline = element.dataset.headline || "";

		ActionHelper.printMessage(headline, message, this.actor);
	}
	  
	/**
	* If any changes are done to the Actor values.
	*/
	_assignToActorField(fields, value) {
		console.log("WoD | Mortal Sheet _assignToActorField");
		
		const actorData = duplicate(this.actor);

		// update actor owned items
		if (fields.length === 2 && fields[0] === "items") {
			for (const i of actorData.items) {
				if (fields[1] === i._id) {
					i.data.points = value;
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
					if (actorData.data.willpower.temporary == value) {
						actorData.data.willpower.temporary = parseInt(actorData.data.willpower.temporary) - 1;
					}
					else {
						actorData.data.willpower.temporary = value;
					}
				}
				else if (CONFIG.wod.attributeSettings == "20th") {
					if (fields[3] === "permanent") {
						if (actorData.data.willpower.permanent == value) {
							actorData.data.willpower.permanent = parseInt(actorData.data.willpower.permanent) - 1;
						}
						else {
							actorData.data.willpower.permanent = value;
						}
					}
				}				
			}			
			else {			
				const lastField = fields.pop();
				fields.reduce((data, field) => data[field], actorData)[lastField] = value;
			}
		}

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

		// if Willpower has been changed then Difference between Rage and Willpower need to be recalculated
		if ((fields[2] === "willpower") && ((actorData.type == CONFIG.wod.sheettype.werewolf) || (actorData.type == "Changing Breed"))) {
			ActionHelper.handleWerewolfCalculations(actorData);
		}
		
		console.log("WoD | Mortal Sheet updated");
		this.actor.update(actorData);
	}		
}

function parseCounterStates(states) {
	return states.split(",").reduce((obj, state) => {
	  const [k, v] = state.split(":");
	  obj[k] = v;
	  return obj;
	}, {});
  }