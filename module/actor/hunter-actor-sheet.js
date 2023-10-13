import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js";
import CreateHelper from "../scripts/create-helpers.js";

export class HunterActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet hunter"],
			template: "systems/worldofdarkness/templates/actor/hunter-sheet.html"
		});
	}
  
	constructor(actor, options) {
		super(actor, options);
	}

	/** @override */
	async getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.hunter) {
				actorData.system.settings.iscreated = true;
				actorData.system.settings.version = game.data.system.version;
				actorData.system.settings.variant = "general";

				//await CreateHelper.SetHunterAbilities(actorData);
				await CreateHelper.SetAbilities(actorData, "hunter", "modern");
				await CreateHelper.SetMortalAttributes(actorData);
				await CreateHelper.SetHunterAttributes(actorData);				

				await this.actor.update(actorData);
			}	 	
		}

		const data = await super.getData();

		console.log("WoD | Hunter Sheet getData");

		if (actorData.type == CONFIG.wod.sheettype.hunter) {
			console.log(CONFIG.wod.sheettype.hunter);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		console.log("WoD | Hunter Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/hunter-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		ActionHelper.SetupDotCounters(html);

		console.log("WoD | Hunter Sheet activateListeners");

		// Rollable stuff
		html
			.find(".vrollable")
			.click(this._onRollHunterDialog.bind(this));

		html
			.find(".macroBtn")
			.click(this._onRollHunterDialog.bind(this));		
			
		// resource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterHunterChange.bind(this));
		
		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterHunterChange.bind(this));
	}

	_onRollHunterDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.hunter) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}
	
	async _onDotCounterHunterChange(event) {
		console.log("WoD | Hunter Sheet _onDotCounterChange");
		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.hunter) {
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
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");
	
			if (index < 0 || index > steps.length) {
				return;
			}
			
			await this._assignToActorField(fields, index + 1);
		}			

	/* 	steps.removeClass("active");
		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		}); */
	}

	async _assignToHunter(fields, value) {
		console.log("WoD | Hunter Sheet _assignToHunter");
		
		const actorData = duplicate(this.actor);

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

		await ActionHelper.handleCalculations(actorData);
		
		console.log("WoD | Hunter Sheet updated");
		this.actor.update(actorData);
		this.render(false);
	}	
}