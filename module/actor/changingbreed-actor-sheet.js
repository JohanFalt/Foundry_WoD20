import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js"
import CreateHelper from "../scripts/create-helpers.js";

export class ChangingBreedActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet werewolf"],
			template: "systems/worldofdarkness/templates/actor/changingbreed-sheet.html"
		});
	}
  
	constructor(actor, options) {
		super(actor, options);
	}

	/** @override */
	async getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == "Changing Breed") {
				actorData.system.settings.iscreated = true;
				actorData.system.settings.version = game.data.system.version;

				await CreateHelper.SetWerewolfAbilities(actorData, this.actor, "modern");		
				
				await CreateHelper.SetMortalAttributes(actorData);
				// since no shifter type has been selected only set as werewolf so far
				await CreateHelper.SetWerewolfAttributes(actorData);					
				
				await this.actor.update(actorData); 
			}	 	
		}		

		const data = await super.getData();

		console.log("WoD | Changing breed Sheet getData");

		let presentform = "";

		console.log("WoD | Changing breed Sheet handling shift data");

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

		console.log("WoD | Changing breed Sheet handling gift lists");

		data.actor.system.settings.presentform = presentform;

		if (actorData.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
			console.log(CONFIG.worldofdarkness.sheettype.changingbreed);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		console.log("WoD | Changing breed Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/changingbreed-sheet.html";
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		ActionHelper.SetupDotCounters(html);

		console.log("WoD | Changing breed Sheet activateListeners");

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
		const type = dataset.type;

		if ((type != CONFIG.worldofdarkness.sheettype.changingbreed) && (type != CONFIG.worldofdarkness.sheettype.werewolf)) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}
	
	_onDotCounterWerewolfChange(event) {
		console.log("WoD | Changing breed Sheet _onDotCounterWerewolfChange");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if ((type != CONFIG.worldofdarkness.sheettype.werewolf) && (type != CONFIG.worldofdarkness.sheettype.changingbreed)) {
			return;
		}

		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if ((this.locked) && 
				((fieldStrings != "data.system.advantages.rage.temporary") && 
				(fieldStrings != "data.system.advantages.gnosis.temporary") && 
				(fieldStrings != "data.system.advantages.bloodpool.temporary") &&
				(fieldStrings != "data.system.advantages.glory.temporary") && 
				(fieldStrings != "data.system.advantages.honor.temporary") && 
				(fieldStrings != "data.system.advantages.wisdom.temporary"))) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}
		if (fieldStrings == "data.system.advantages.willpower.permanent") {
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
		console.log("WoD | Changing breed onShiftForm");

		event.preventDefault();

		const actorData = duplicate(this.actor);

		if (actorData.type != CONFIG.worldofdarkness.sheettype.changingbreed) {
			ui.notifications.error('Not Changing breed aborts!');
			return
		}

		const element = event.currentTarget;
		const dataset = element.dataset;
		const fromForm = this.actor.system.settings.presentform;
		const toForm = dataset.form;

		for (const i in actorData.system.shapes) {
			if (actorData.system.shapes[i].label == fromForm)  {
				actorData.system.shapes[i].isactive = false;
			}

			if (actorData.system.shapes[i].label == toForm) {
				actorData.system.shapes[i].isactive = true;
			}			
		}		

		await ActionHelper.handleCalculations(actorData);

		console.log("WoD | Changing breed Sheet updated");
		this.actor.update(actorData);
	}

	async _assignToWerewolf(fields, value) {
		console.log("WoD | Changing breed Sheet _assignToWerewolf");
		
		const actorData = duplicate(this.actor);

		if (fields[0] === "renown") {
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
		
		await ActionHelper.handleCalculations(actorData);
		
		console.log("WoD | Changing Breed Sheet updated");
		this.actor.update(actorData);
	}
}