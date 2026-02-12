import { default as MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../../scripts/action-helpers.js";
import CreateHelper from "../../scripts/create-helpers.js";

export default class CreatureActorSheet extends MortalActorSheet {
	
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
		const data = await super.getData();
		const forms = [];

		if (data.actor.system.settings.powers.haslores) {
			for (const i of data.items) {
				if (i.type == "Trait") {
					if (i.system.type == "wod.types.apocalypticform") {
						const bonus = i.system.bonuslist;

						const form = {
							isactive: i.system.isactive,
							name: i.name,
							level: i.system.level,
							details: i.system.details,
							description: i.system.description,
							_id: i._id,
							bonuses: bonus
						}

						forms.push(form);
					}
				}
			}
		}		

		data.actor.system.listdata.forms = forms;

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.creature) {
			console.log(`${data.actor.name} - (${CONFIG.worldofdarkness.sheettype.creature})`);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		return "systems/worldofdarkness/templates/actor/creature-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

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

		html
			.find(".selectPowerMaxSetting")
			.change(event => this._onsheetChange(event));
	}

	_onRollCreatureDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.creature) {
			return;
		}

		ActionHelper.RollDialog(dataset, this.actor);
	}

	_onDotCounterCreatureChange(event) {
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

	async _onsheetChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		const source = dataset.source;
		const actorData = foundry.utils.duplicate(this.actor);

		if (source == "setpowermaxsetting") {
			let attribute = dataset.attribute;
			let value = 0;

			try {
				value = parseInt(element.value);	
			} catch (error) {
				value = 0;
			}		

			//actorData.system.attributes[attribute].bonus = value;
		}

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		this.render();
	}

	async _assignToCreature(fields, value) {
		const actorData = foundry.utils.duplicate(this.actor);

		if (fields[1] === "essence") {
			if (actorData.system.advantages[fields[1]][fields[2]] == value) {
				actorData.system.advantages[fields[1]][fields[2]] = parseInt(actorData.system.advantages[fields[1]][fields[2]]) - 1;
			}
			else {
				actorData.system.advantages[fields[1]][fields[2]] = parseInt(value);
			}

			actorData.system.settings.isupdated = false;
			await this.actor.update(actorData);
		}
	}
}
