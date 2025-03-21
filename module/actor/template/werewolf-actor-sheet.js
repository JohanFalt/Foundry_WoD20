import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../../scripts/action-helpers.js";
import TokenHelper from "../../scripts/token-helpers.js";

export class WerewolfActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet werewolf"],
			template: "systems/worldofdarkness/templates/actor/werewolf-sheet.html"
		});
	}
  
	constructor(actor, options) {
		super(actor, options);			
	}

	/** @override */
	async getData() {
		const data = await super.getData();

		let presentform = "";

		if (data.actor.system.shapes.glabro.isactive) {
			presentform = data.actor.system.shapes.glabro.label;
		}
		else if (data.actor.system.shapes.crinos.isactive) {
			presentform = data.actor.system.shapes.crinos.label;
		}
		else if (data.actor.system.shapes.hispo.isactive) {
			presentform = data.actor.system.shapes.hispo.label;
		}
		else if (data.actor.system.shapes.lupus.isactive) {
			presentform = data.actor.system.shapes.lupus.label;
		}
		else {
			presentform = data.actor.system.shapes.homid.label;
		}

		data.actor.system.settings.presentform = presentform;

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.werewolf) {
			console.log(`${data.actor.name} - (${CONFIG.worldofdarkness.sheettype.werewolf})`);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		return "systems/worldofdarkness/templates/actor/werewolf-sheet.html";
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
			.click(this._onRollWerewolfDialog.bind(this));

		html
			.find(".macroBtn")
			.click(this._onRollWerewolfDialog.bind(this));			
		
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterWerewolfChange.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterWerewolfChange.bind(this));
		
		// shift form
		html
			.find(".shape-selector")
			.click(this._onShiftForm.bind(this));
	}

	_onRollWerewolfDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.werewolf) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}
	
	_onDotCounterWerewolfChange(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.werewolf) {
			return;
		}

		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if ((this.locked) && 
				((fieldStrings != "rage.temporary") && 
				(fieldStrings != "gnosis.temporary") && 
				(fieldStrings != "renown.glory.temporary") && 
				(fieldStrings != "renown.honor.temporary") && 
				(fieldStrings != "renown.wisdom.temporary"))) {
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

		this._assignToWerewolf(fields, index + 1);
	}

	async _onShiftForm(event) {
		event.preventDefault();

		const actorData = foundry.utils.duplicate(this.actor);

		if (actorData.type != CONFIG.worldofdarkness.sheettype.werewolf) {
			return;
		}

		const element = event.currentTarget;
		const dataset = element.dataset;
		const fromForm = this.actor.system.settings.presentform;
		const toForm = dataset.form;

		for (const i in actorData.system.shapes) {
			actorData.system.shapes[i].isactive = false;

			if (actorData.system.shapes[i].label == toForm) {
				actorData.system.shapes[i].isactive = true;
			}			
		}		

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		await TokenHelper.formShift(this.actor, fromForm, toForm);
	}
	
	async _assignToWerewolf(fields, value) {
		const actorData = foundry.utils.duplicate(this.actor);

		if ((fields[0] === "advantages") || (fields[0] === "renown")) {
			let renowntype = fields[1];

			if (renowntype === "rank") {
				if (actorData.system.renown[renowntype] == value) {
					actorData.system.renown[renowntype] = parseInt(actorData.system.renown[renowntype]) - 1;
				}
				else {
					actorData.system.renown[renowntype] = value;
				}
			}
			else if (fields[2] != undefined) {
				if (actorData.system.renown[renowntype][fields[2]] == value) {
					actorData.system.renown[renowntype][fields[2]] = parseInt(actorData.system.renown[renowntype][fields[2]]) - 1;
				}
				else {
					actorData.system.renown[renowntype][fields[2]] = value;
				}
			}
		}
		
		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
	}	
}
