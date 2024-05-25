import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js";
import CreateHelper from "../scripts/create-helpers.js";

export class CreatureActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet creature"],
			template: "systems/worldofdarkness/templates/actor/creature-sheet.html"
		});
	}
  
	constructor(actor, options) {
		super(actor, options);

		this.isCharacter = false;
	}

	/** @override */
	async getData() {
		const actorData = foundry.utils.duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.worldofdarkness.sheettype.creature) {
				actorData.system.settings.iscreated = true;
				actorData.system.settings.version = game.data.system.version;

				await CreateHelper.SetCreatureAbilities(actorData);
				await CreateHelper.SetMortalAttributes(actorData);
				await CreateHelper.SetCreatureAttributes(actorData);

				await this.actor.update(actorData);
			}	 	
		}

		const data = await super.getData();

		console.log("WoD | Creature Sheet getData");

		if (actorData.type == CONFIG.worldofdarkness.sheettype.creature) {
			console.log(CONFIG.worldofdarkness.sheettype.creature);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		console.log("WoD | Creature Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/creature-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		console.log("WoD | Creature Sheet activateListeners");

		// Rollable stuff
		html
			.find(".vrollable")
			.click(this._onRollCreatureDialog.bind(this));

		// ressource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterCreatureChange.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterCreatureChange.bind(this));
	}

	_onRollCreatureDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.creature) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}

	_onDotCounterCreatureChange(event) {
		console.log("WoD | Creature Sheet _onDotCounterCreatureChange");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.creature) {
			return;
		}

		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if ((this.locked) && 
				((fieldStrings != "advantages.rage.temporary") && 
				(fieldStrings != "advantages.gnosis.temporary") &&
				(fieldStrings != "advantages.glamour.temporary") &&
				(fieldStrings != "advantages.banality.temporary") &&
				(fieldStrings != "advantages.essence.temporary") && 
				(fieldStrings != "advantages.bloodpool.temporary"))) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
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

		this._assignToCreature(fields, index + 1);
	}

	async _assignToCreature(fields, value) {
		console.log("WoD | Creature Sheet _assignToCreature");
		
		const actorData = foundry.utils.duplicate(this.actor);

		if (fields[1] === "essence") {
			if (actorData.system.advantages[fields[1]][fields[2]] == value) {
				actorData.system.advantages[fields[1]][fields[2]] = parseInt(actorData.system.advantages[fields[1]][fields[2]]) - 1;
			}
			else {
				actorData.system.advantages[fields[1]][fields[2]] = parseInt(value);
			}

			await ActionHelper.handleCalculations(actorData);
		
			console.log("WoD | Creature Sheet updated");
			this.actor.update(actorData);
		}
	}
}
