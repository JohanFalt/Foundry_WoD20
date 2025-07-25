import { default as MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../../scripts/action-helpers.js";
import CreateHelper from "../../scripts/create-helpers.js";

export default class ExaltedActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet exalted"],
			template: "systems/worldofdarkness/templates/actor/exalted-sheet.html"
		});
	}
  
	constructor(actor, options) {
		super(actor, options);
	}

	/** @override */
	async getData() {
		const data = await super.getData();

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.exalted) {
			console.log(`${data.actor.name} - (${CONFIG.worldofdarkness.sheettype.exalted})`);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		return "systems/worldofdarkness/templates/actor/exalted-sheet.html";
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
			.click(this._onRollExaltedDialog.bind(this));

		// resource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterExaltedChange.bind(this));
		
		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterExaltedChange.bind(this));
	}	

	_onRollExaltedDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.exalted) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}

	async _onDotCounterExaltedChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.exalted) {
			return;
		}

		const parent = $(element.parentNode);	
		const steps = parent.find(".resource-value-step");	
		const index = Number(dataset.index);		

		let itemid = undefined;

		// e.g powers like disciplines
		if (parent[0].dataset.itemid != undefined) {
			itemid = parent[0].dataset.itemid;
		}
		// isfavorite function for secondary abilities
		else if ((itemid == undefined) && (dataset.key != undefined)) {
			itemid = dataset.key;
		}

		if (itemid != undefined) {
			if (this.locked) {
				ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				return;
		   	}

			let item = await this.actor.getEmbeddedDocument("Item", itemid);

			if (item != undefined) {
				const itemData = foundry.utils.duplicate(item);

				if (dataset.ability == "secondary") {
					itemData.system[dataset.field] = !itemData.system[dataset.field];
				}
				else if ((index == 0) && (itemData.system.value == 1)) {
					itemData.system.value = 0;
				}
				else {
					itemData.system.value = parseInt(index + 1);
				}
	
				await item.update(itemData);
	
				return;
			}			
		}
		// favored box
		if (dataset.attribute == "true") {
			const actorData = foundry.utils.duplicate(this.actor);
			actorData.system.attributes[dataset.key].isfavorited = !this.actor.system.attributes[dataset.key].isfavorited;
			await this.actor.update(actorData);
			this.render();
		}
		else if (dataset.ability == "true") {
			const actorData = foundry.utils.duplicate(this.actor);
			actorData.system.abilities[dataset.key].isfavorited = !this.actor.system.abilities[dataset.key].isfavorited;
			await this.actor.update(actorData);
			this.render();
		}
		else {
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");
	
			if (index < 0 || index > steps.length) {
				return;
			}
			
			await this._assignToActorField(fields, index + 1);
		}			
	}
	
	async _assignToExalted(fields, value) {
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