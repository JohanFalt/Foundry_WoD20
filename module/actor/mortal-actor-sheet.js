import ActionHelper from "../scripts/action-helpers.js"
import { calculateHealth } from "../scripts/health.js";
//import { calculateTotals } from "../scripts/totals.js";

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

		if (!actorData.data.settings.created) {
			if (actorData.type == "Mortal") {
				ActionHelper._setMortalAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);
				actorData.data.settings.created = true;
				this.actor.update(actorData);
			}	 	
		}	

		const data = super.getData();

		console.log("WoD | Mortal Sheet getData");

		data.config = CONFIG.wod;		
		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = this.isGM;

		data.dtypes = ["String", "Number", "Boolean"];		

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
				if (i.data.natural) {
					naturalWeapons.push(i);
				}
				else if (!i.data.natural) {
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

					if (i.data.spent) {
						spentExp += parseInt(i.data.amount);
					}
				}
			}
		}		

		data.actor.health = calculateHealth(data.actor);

		data.actor.naturalWeapons = naturalWeapons;
		data.actor.meleeWeapons = meleeWeapons;
		data.actor.rangedWeapons = rangedWeapons;	
		data.actor.armors = armors;	
		data.actor.backgrounds = backgrounds;
		data.actor.merits = merits;
		data.actor.flaws = flaws;

		data.actor.expearned = expearned;
		data.actor.expspend = expspend;	
		
		data.actor.totalExp = totalExp;
		data.actor.spentExp = spentExp;
		data.actor.experience = totalExp - spentExp;

		if (actorData.type == "Mortal") {
			console.log("Mortal");
			console.log(data.actor);
		}			

		return data;
	}	

	/** @override */
	activateListeners(html) {
		console.log("WoD | Mortal Sheet activateListeners");
	  
		super.activateListeners(html);
		this._setupDotCounters(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;
		
		// lock button
		html
			.find(".lock-btn")
			.click(this._onToggleLocked.bind(this));

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

		// items
		// Edit Inventory Item
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
	}
	
	_onRollDialog(event) {		
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

		const ability = dataset.label;
		const abilityType = dataset.type;
		const actorData = duplicate(this.actor);
		const source = dataset.source;

		if (source == "ability") {
			actorData.data.abilities[abilityType][ability].visible = !actorData.data.abilities[abilityType][ability].visible;
		}
		if (source == "soak") {
			actorData.data.settings.soak[abilityType].roll = !actorData.data.settings.soak[abilityType].roll;

			if (actorData.data.settings.soak[abilityType].roll) {
				actorData.data.soak[abilityType] = actorData.data.attributes.stamina.total;
			}
			else {
				actorData.data.soak[abilityType] = 0;
			}
		}

		this.actor.update(actorData);
	}

	_setupDotCounters(html) {
		html.find(".resource-value").each(function () {
			const value = Number(this.dataset.value);
			$(this)
				.find(".resource-value-step")
				.each(function (i) {
					if (i + 1 <= value) {
						$(this).addClass("active");
					}
				});
		});
		
		html.find(".resource-value-static").each(function () {
			const value = Number(this.dataset.value);
			$(this)
				.find(".resource-value-static-step")
				.each(function (i) {
					if (i + 1 <= value) {
						$(this).addClass("active");
					}
				});
		});
	}
  
	_onDotCounterChange(event) {
		console.log("WoD | Mortal Sheet _onDotCounterChange");
		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if ((fieldStrings == "data.data.rage.temporary") ||
			(fieldStrings == "data.data.gnosis.temporary")) {
			return;
		}
		if ((this.locked) && (fieldStrings != "data.data.willpower.temporary")) {
			ui.notifications.info('Can not edit as sheet is locked!');
			return;
		}
		if ((fieldStrings == "data.data.willpower.permanent") && (CONFIG.attributeSettings == "5th")) {
			ui.notifications.info('Willpower is based on Composure + Resolve and can not be altered!');	
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
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-empty");
		
		if (this.locked) {
			//console.log("WoD | Sheet locked aborts");	
			ui.notifications.info('Can not edit as sheet is locked!');
			return;
		}

		steps.removeClass("active");
		
		steps.each(function (i) {
			if (i <= 0) {
				$(this).addClass("active");
			}
		});
		
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
			parseInt(actorData.data.health.damage.bashing) = 0;
		}

		if (parseInt(actorData.data.health.damage.lethal) < 0) {
			parseInt(actorData.data.health.damage.lethal) = 0;
		}

		if (parseInt(actorData.data.health.damage.aggravated) < 0) {
			parseInt(actorData.data.health.damage.aggravated) = 0;
		}

		ActionHelper.handleCalculations(actorData);
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

		ActionHelper.handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

		this.actor.update(actorData);
	}

	async _onItemEdit(event) {
		if (this.locked) {
			//console.log("WoD | Sheet locked aborts");	
			ui.notifications.info('Can not edit as sheet is locked!');
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

		if (item.data.data.active) {
			active = false;
		}
		else {
			active = true;
		}

		await item.update({"data.active" : active});

		console.log("WoD | Editing item id: " + itemId);
	}

	async _onItemDelete(event) {
		if (this.locked) {
			//console.log("WoD | Sheet locked aborts");	
			ui.notifications.info('Can not edit as sheet is locked!');
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
			if ((fields[2] === "willpower") && (CONFIG.attributeSettings == "5th")) {
				actorData.data.willpower.temporary = value;
			}
			else if ((fields[2] === "willpower") && (CONFIG.attributeSettings == "20th")) {
				actorData.data.willpower[fields[3]] = value;
			}
			else if (fields[2] === "gnosis") {
				return
			}
			else if (fields[2] === "rage") {
				return
			}
			else if (fields[2] === "renown") {
				return
			}
			
			else {			
				const lastField = fields.pop();
				fields.reduce((data, field) => data[field], actorData)[lastField] = value;
			}
		}

		ActionHelper.handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

		// if Willpower has been changed then Difference between Rage and Willpower need to be recalculated
		if ((fields[2] === "willpower") && (actorData.type == "Werewolf")) {
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