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
	getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.data.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.creature) {
				ActionHelper._setCreatureAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);
				ActionHelper._setWerewolfAttributes(actorData);
				ActionHelper._setCreatureAttributes(actorData);

				actorData.data.settings.iscreated = true;
				this.actor.update(actorData);
			}	 	
		}

		const data = super.getData();

		console.log("WoD | Creature Sheet getData");

		const powerlist = [];
		const other = [];

		for (const i of data.items) {
			if (i.type == "Power") {
				if (i.data.type == "wod.types.power") {
					powerlist.push(i);
				}
				else {
					other.push(i);
				}
			}
			else if (i.type == "Experience") {
				other.push(i);
			}
		}

		data.actor.powerlist = powerlist.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.other = other;

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

		const actorData = duplicate(this.actor);
		const source = dataset.source;
		const type = dataset.switchtype;

		if (source == "advantages") {
			if (type == "rage") {
				actorData.data.settings.hasrage = !actorData.data.settings.hasrage;
			}
			if (type == "gnosis") {
				actorData.data.settings.hasgnosis = !actorData.data.settings.hasgnosis;
			}
			if (type == "willpower") {
				actorData.data.settings.haswillpower = !actorData.data.settings.haswillpower;
			}
			if (type == "essence") {
				actorData.data.settings.hasessence = !actorData.data.settings.hasessence;
			}
			if (type == "bloodpool") {
				actorData.data.settings.hasbloodpool = !actorData.data.settings.hasbloodpool;
			}
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
		
		steps.each(function (i) {
			if (i <= 0) {
				$(this).addClass("active");
			}
		});
		
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
				((fieldStrings != "data.data.rage.temporary") && 
				(fieldStrings != "data.data.gnosis.temporary"))) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}
		// if (fieldStrings == "data.data.willpower.permanent") {
		// 	return;
		// }

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

		if ((fields[2] === "rage") || (fields[2] === "gnosis")) {
			if (actorData.data[fields[2]][fields[3]] == value) {
				actorData.data[fields[2]][fields[3]] = parseInt(actorData.data[fields[2]][fields[3]]) - 1;
			}
			else {
				actorData.data[fields[2]][fields[3]] = value;
			}
		}
		
		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWerewolfCalculations(actorData);
		
		console.log("WoD | Creature Sheet updated");
		this.actor.update(actorData);
	}
}