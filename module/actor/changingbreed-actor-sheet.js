import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js"

export class ChangingBreedActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["werewolf"],
			template: "systems/worldofdarkness/templates/actor/changingbreed-sheet.html",
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

		/* this.isCharacter = true;	
		this.isGM = game.user.isGM; */
		
		console.log("WoD | Changing Breed Sheet constructor");
	}

	/** @override */
	async getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == "Changing Breed") {
				actorData.system.settings.iscreated = true;
				actorData.system.settings.version = game.data.system.version;

				ActionHelper._setWerewolfAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);
				// since no shifter type has been selected only set as werewolf so far
				ActionHelper._setWerewolfAttributes(actorData);					
				
				this.actor.update(actorData); 
			}	 	
		}		

		const data = await super.getData();

		console.log("WoD | Changing Breed Sheet getData");

		let presentform = "";

		console.log("WoD | Changing Breed Sheet handling shift data");

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

		console.log("WoD | Changing Breed Sheet handling gift lists");

		data.actor.presentform = presentform;

		if (actorData.type == CONFIG.wod.sheettype.changingbreed) {
			console.log(CONFIG.wod.sheettype.changingbreed);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		console.log("WoD | Changing Breed Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/changingbreed-sheet.html";
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		ActionHelper._setupDotCounters(html);

		console.log("WoD | Changing Breed Sheet activateListeners");

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

		if ((type != CONFIG.wod.sheettype.werewolf) && (type != CONFIG.wod.sheettype.changingbreed)) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}
	
	_onDotCounterWerewolfChange(event) {
		console.log("WoD | Changing Breed Sheet _onDotCounterWerewolfChange");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if ((type != CONFIG.wod.sheettype.werewolf) && (type != CONFIG.wod.sheettype.changingbreed)) {
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
		console.log("WoD | Changing Breed onShiftForm");

		event.preventDefault();

		const actorData = duplicate(this.actor);

		if (actorData.type != "Changing Breed") {
			ui.notifications.error('Not Changing Breed aborts!');
			return
		}

		const element = event.currentTarget;
		const dataset = element.dataset;
		const fromForm = this.actor.presentform;
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

		console.log("WoD | Changing Breed Sheet updated");
		this.actor.update(actorData);
	}

	async _assignToWerewolf(fields, value) {
		console.log("WoD | Changing Breed Sheet _assignToWerewolf");
		
		const actorData = duplicate(this.actor);

		/* if ((fields[2] === "rage") || (fields[2] === "gnosis")) {
			if (actorData.system[fields[2]][fields[3]] == value) {
				actorData.system[fields[2]][fields[3]] = parseInt(actorData.system[fields[2]][fields[3]]) - 1;
			}
			else {
				actorData.system[fields[2]][fields[3]] = value;
			}
		}	 */	
		//else 
		/* if (fields[2] === "bloodpool") {
			if (actorData.system.advantages.bloodpool.temporary == value) {
				actorData.system.advantages.bloodpool.temporary = parseInt(actorData.system.advantages.bloodpool.temporary) - 1;
			}	
			else {
				actorData.system.advantages.bloodpool.temporary = value;
			}
		}	
		else  */
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
		
		console.log("WoD | Werewolf Sheet updated");
		this.actor.update(actorData);
	}
}