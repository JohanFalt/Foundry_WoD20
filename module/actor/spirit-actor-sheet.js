import ActionHelper from "../scripts/action-helpers.js"
import { calculateHealth } from "../scripts/health.js";

export class SpiritActorSheet extends ActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["spirit"],
			template: "systems/worldofdarkness/templates/actor/spirit-sheet.html",
			height: 790,
			tabs: []
		});
	}
  
	constructor(actor, options) {
		super(actor, options);

		console.log("WoD | Spirit Sheet constructor");

		this.locked = false;
		this.isCharacter = true;		
	}	
	
	/** @override */
	get template() {
		console.log("WoD | Spirit Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/spirit-sheet.html";
	}
	
	/** @override */
	getData() {
		const data = super.getData();

		console.log("WoD | Spirit Sheet getData");

		data.config = CONFIG.wod;		
		data.locked = this.locked;
		data.isCharacter = this.isCharacter;

		data.dtypes = ["String", "Number", "Boolean"];

        data.actor.health = calculateHealth(data.actor);
		
		return data;
	}	

	/** @override */
	activateListeners(html) {
		console.log("WoD | Spirit Sheet activateListeners");
	  
		super.activateListeners(html);
		this._setupDotCounters(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;
		
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

		html
			.find(".send-chat")
			.click(this._onSendChat.bind(this));
	}
	
	_onRollDialog(event) {		
		ActionHelper.RollDialog(event, this.actor);		
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
		console.log("WoD | Spirit Sheet _onDotCounterChange");
		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if ((this.locked) && (fieldStrings != "data.data.willpower.temporary")) {
			console.log("WoD | Sheet locked aborts");
			return;
		}
		if (fieldStrings == "data.data.willpower.permanent") {
			console.log("WoD | Sheet click on permanent willpower aborts");			
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
		console.log("WoD | Spirit Sheet _onDotCounterEmpty");
		
		event.preventDefault();

		const element = event.currentTarget;
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-empty");
		
		if (this.locked) {
			console.log("WoD | Sheet locked aborts");
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
		ActionHelper.handleWouldLevelCalculations(actorData);

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
		ActionHelper.handleWouldLevelCalculations(actorData);

		this.actor.update(actorData);
	}

	async _onItemEdit(event) {
		if (this.locked) {
			console.log("WoD | Sheet locked aborts");
			return;
		}

		var _a;
		event.preventDefault();
        event.stopPropagation();

		const itemId = $(event.currentTarget).data("item-id");
		const item = this.actor.getEmbeddedDocument("Item", itemId);
		

		if (item instanceof Item)
            (_a = item.sheet) === null || _a === void 0 ? void 0 : _a.render(true);
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
			console.log("WoD | Sheet locked aborts");
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
		console.log("WoD | Spirit Sheet _assignToActorField");
		
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
    		const lastField = fields.pop();
			fields.reduce((data, field) => data[field], actorData)[lastField] = value;
		}

		ActionHelper.handleCalculations(actorData);
		ActionHelper.handleWouldLevelCalculations(actorData);
		
		console.log("WoD | Spirit Sheet updated");
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