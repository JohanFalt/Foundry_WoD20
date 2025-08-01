import { default as MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../../scripts/action-helpers.js";
import CreateHelper from "../../scripts/create-helpers.js";
import { calculateHealth } from "../../scripts/health.js";

export default class WraithActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet wraith"],
			template: "systems/worldofdarkness/templates/actor/wraith-sheet.html"
		});
	}
  
	constructor(actor, options) {
		super(actor, options);
	}

	/** @override */
	async getData() {
		const data = await super.getData();

		data.actor.system.listdata.health = await calculateHealth(this.actor, CONFIG.worldofdarkness.sheettype.wraith);

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.wraith) {
			console.log(`${data.actor.name} - (${CONFIG.worldofdarkness.sheettype.wraith})`);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		return "systems/worldofdarkness/templates/actor/wraith-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		ActionHelper.SetupDotCounters(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Rollable stuff
		html
			.find(".vrollable")
			.click(this._onRollWraithDialog.bind(this));

		// resource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterWraithChange.bind(this));
		
		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterWraithChange.bind(this));

		// wraith handling of corpus
		html
			.find(".wraith.health .resource-counter > .resource-value-step")
			.click(this._onSquareCounterWraithChange.bind(this));
			
		html
			.find(".wraith.health .resource-counter > .resource-value-step")
			.on('contextmenu', this._onSquareCounterClear.bind(this));
	}	

	_onRollWraithDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.wraith) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}

	async _onDotCounterWraithChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.wraith) {
			return;
		}

		const parent = $(element.parentNode);	
		const steps = parent.find(".resource-value-step");	
		const index = Number(dataset.index);		

		let itemid = undefined;

		// e.g powers like disciplines
		if (parent[0].dataset.itemid != undefined) {
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
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");

			if (fields[1] == "corpus") {
				return;
			}
	
			if (index < 0 || index > steps.length) {
				return;
			}
			
			await this._assignToActorField(fields, index + 1);
		}			
	}

	/* Clicked health boxes */
	async _onSquareCounterWraithChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const states = parseCounterStates("/:bashing,x:lethal,*:aggravated");
		const dataset = element.dataset;
		const type = dataset.type;

		const allStates = ["", ...Object.keys(states)];
		const currentState = allStates.indexOf(oldState);

		if (type != CONFIG.worldofdarkness.sheettype.wraith) {
			return;
		}
		
		if (currentState < 0) {
			return;
		}
		
		const actorData = foundry.utils.duplicate(this.actor);

		if (oldState == "") {
			actorData.system.health.damage.corpus.bashing = parseInt(actorData.system.health.damage.corpus.bashing) + 1;
		}
		else if (oldState == "/") { 
			actorData.system.health.damage.corpus.bashing = parseInt(actorData.system.health.damage.corpus.bashing) - 1;
			actorData.system.health.damage.corpus.lethal = parseInt(actorData.system.health.damage.corpus.lethal) + 1;			
		}
		else if (oldState == "x") { 
			actorData.system.health.damage.corpus.lethal = parseInt(actorData.system.health.damage.corpus.lethal) - 1;
			actorData.system.health.damage.corpus.aggravated = parseInt(actorData.system.health.damage.corpus.aggravated) + 1;
		}
		else if (oldState == "*") { 
			actorData.system.health.damage.corpus.aggravated = parseInt(actorData.system.health.damage.corpus.aggravated) - 1;
		}

		if (parseInt(actorData.system.health.damage.corpus.bashing) < 0) {
			actorData.system.health.damage.corpus.bashing = 0;
		}

		if (parseInt(actorData.system.health.damage.corpus.lethal) < 0) {
			actorData.system.health.damage.corpus.lethal = 0;
		}

		if (parseInt(actorData.system.health.damage.corpus.aggravated) < 0) {
			actorData.system.health.damage.corpus.aggravated = 0;
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

		if (type != CONFIG.worldofdarkness.sheettype.wraith) {
			return;
		}

		const actorData = foundry.utils.duplicate(this.actor);

		if (oldState == "") {
			return
		}
		else if (oldState == "/") { 
			actorData.system.health.damage.corpus.bashing = parseInt(actorData.system.health.damage.corpus.bashing) - 1;
		}
		else if (oldState == "x") { 
			actorData.system.health.damage.corpus.lethal = parseInt(actorData.system.health.damage.corpus.lethal) - 1;
		}
		else if (oldState == "*") { 
		 	actorData.system.health.damage.corpus.aggravated = parseInt(actorData.system.health.damage.corpus.aggravated) - 1;
		}

		if (parseInt(actorData.system.health.damage.corpus.bashing) < 0) {
			actorData.system.health.damage.corpus.bashing = 0;
		}

		if (parseInt(actorData.system.health.damage.corpus.lethal) < 0) {
			actorData.system.health.damage.corpus.lethal = 0;
		}

		if (parseInt(actorData.system.health.damage.corpus.aggravated) < 0) {
			actorData.system.health.damage.corpus.aggravated = 0;
		}

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		this.render();
	}
	
	async _assignToWraith(fields, value) {
		const actorData = foundry.utils.duplicate(this.actor);

		let area = fields[0];	
		const ability = fields[1];	

		if (area === "advantages") {			
			const abilityType = fields[2];

			if (fields.length == 3) {
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

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		this.render();
	}
}

function parseCounterStates(states) {
	return states.split(",").reduce((obj, state) => {
	  	const [k, v] = state.split(":");
	  	obj[k] = v;
	  	return obj;
	}, {});
}
