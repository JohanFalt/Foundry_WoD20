import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js"

export class CreatureActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["creature"],
			template: "systems/worldofdarkness/templates/actor/creature-sheet.html",
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "core",
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

		this.locked = true;
		this.isCharacter = false;	
		this.isGM = game.user.isGM;
		
		console.log("WoD | Creature Sheet constructor");
	}

	/** @override */
	async getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.creature) {
				ActionHelper._setCreatureAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);
				ActionHelper._setWerewolfAttributes(actorData);
				ActionHelper._setCreatureAttributes(actorData);

				actorData.system.settings.iscreated = true;
				actorData.system.settings.powers.haspowers = true;
				this.actor.update(actorData);
			}	 	
		}

		const data = await super.getData();

		console.log("WoD | Creature Sheet getData");

		const powerlist = [];

		for (const i of actorData.items) {
			if (i.type == "Power") {
				if (i.system.type == "wod.types.power") {
					powerlist.push(i);
				}
			}
			else if (i.type == "Experience") {
				// is to use?
			}
		}

		data.actor.powerlist = powerlist.sort((a, b) => a.name.localeCompare(b.name));

		if (actorData.type == CONFIG.wod.sheettype.creature) {
			console.log(CONFIG.wod.sheettype.creature);
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

		html
			.find(".switch")
			.click(this._switchCreatureSetting.bind(this));

		// ressource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterCreatureChange.bind(this));
		html
			.find(".resource-value > .resource-value-empty")
			.click(this._onDotCounterCreatureEmpty.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterCreatureChange.bind(this));
		html
			.find(".resource-counter > .resource-value-empty")
			.click(this._onDotCounterCreatureEmpty.bind(this));
	}

	_switchCreatureSetting(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.creature) {
			return;
		}

		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		const actorData = duplicate(this.actor);
		const source = dataset.source;
		const type = dataset.switchtype;

		if (source == "advantages") {
			if (type == "rage") {
				actorData.system.settings.hasrage = !actorData.system.settings.hasrage;
			}
			if (type == "gnosis") {
				actorData.system.settings.hasgnosis = !actorData.system.settings.hasgnosis;
			}
			if (type == "willpower") {
				actorData.system.settings.haswillpower = !actorData.system.settings.haswillpower;
			}
			if (type == "essence") {
				actorData.system.settings.hasessence = !actorData.system.settings.hasessence;
			}
			if (type == "bloodpool") {
				actorData.system.settings.hasbloodpool = !actorData.system.settings.hasbloodpool;
			}
			if (type == "glamour") {
				actorData.system.settings.hasglamour = !actorData.system.settings.hasglamour;
			}
			if (type == "banality") {
				actorData.system.settings.hasbanality = !actorData.system.settings.hasbanality;
			}
		}
		if (source == "powers") {
			if (abilityType == "disciplines") {
				actorData.system.settings.powers.hasdisciplines = !actorData.system.settings.powers.hasdisciplines;
			}
			if (abilityType == "gifts") {
				actorData.system.settings.powers.hasgifts = !actorData.system.settings.powers.hasgifts;
			}
			if (abilityType == "charms") {
				actorData.system.settings.powers.hascharms = !actorData.system.settings.powers.hascharms;
			}
			actorData.system.settings.powers.haspowers = true;
		}

		this.actor.update(actorData);
	}

	_onRollCreatureDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		// if ((dataset.key == "rage") || (dataset.key == "gnosis")) {
		// 	// todo
		// 	// helt ok!
		// }
		// else 
		if (dataset.type != CONFIG.wod.sheettype.creature) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}

	_onDotCounterCreatureEmpty(event) {
		console.log("WoD | Creature Sheet _onDotCounterEmpty");
		
		event.preventDefault();
		const element = event.currentTarget;
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-empty");
		
		if (this.locked) {
			return;
		}

		steps.removeClass("active");
		
		this._onDotCounterEmpty(event);		
	}

	_onDotCounterCreatureChange(event) {
		console.log("WoD | Creature Sheet _onDotCounterCreatureChange");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.creature) {
			return;
		}

		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if ((this.locked) && 
				((fieldStrings != "data.system.rage.temporary") && 
				(fieldStrings != "data.system.gnosis.temporary") &&
				(fieldStrings != "data.system.glamour.temporary") &&
				(fieldStrings != "data.system.banality.temporary") &&
				(fieldStrings != "data.system.essence.temporary") && 
				(fieldStrings != "data.system.bloodpool.temporary"))) {
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

	_assignToCreature(fields, value) {
		console.log("WoD | Creature Sheet _assignToCreature");
		
		const actorData = duplicate(this.actor);

		if ((fields[2] === "rage") || (fields[2] === "gnosis") || (fields[2] === "essence") || (fields[2] === "bloodpool") || (fields[2] === "glamour") || (fields[2] === "banality")) {
			if (actorData.system[fields[2]][fields[3]] == value) {
				actorData.system[fields[2]][fields[3]] = parseInt(actorData.system[fields[2]][fields[3]]) - 1;
			}
			else {
				actorData.system[fields[2]][fields[3]] = value;
			}
		}
		
		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleCreatureCalculations(actorData);
		
		console.log("WoD | Creature Sheet updated");
		this.actor.update(actorData);
	}
}