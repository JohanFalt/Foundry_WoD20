import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js";
import BonusHelper from "../scripts/bonus-helpers.js";

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

		this.isCharacter = false;	
		// this.isGM = game.user.isGM;
		
		console.log("WoD | Creature Sheet constructor");
	}

	/** @override */
	async getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.creature) {
				actorData.system.settings.iscreated = true;
				actorData.system.settings.version = game.data.system.version;

				ActionHelper._setCreatureAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);
				ActionHelper._setCreatureAttributes(actorData);

				this.actor.update(actorData);
			}	 	
		}

		const data = await super.getData();

		console.log("WoD | Creature Sheet getData");

		// const powerlist = [];

		/* for (const i of this.actor.items) {
			if (i.type == "Power") {
				if (i.system.type == "wod.types.power") {
					i.bonuses = BonusHelper.getBonuses(this.actor.items, i._id);
					powerlist.push(i);
				}
			}
		}

		data.actor.powerlist = powerlist.sort((a, b) => a.name.localeCompare(b.name)); */

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

		/* html
			.find(".switch")
			.click(this._switchCreatureSetting.bind(this)); */

		// ressource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterCreatureChange.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterCreatureChange.bind(this));
	}

	/* _switchCreatureSetting(event) {
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
			if (abilityType == "arts") {
				actorData.system.settings.powers.hasarts = !actorData.system.settings.powers.hasarts;
			}
			actorData.system.settings.powers.haspowers = true;
		}

		this.actor.update(actorData);
	} */

	_onRollCreatureDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.creature) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
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
		
		const actorData = duplicate(this.actor);

		//if ((fields[2] === "rage") || (fields[2] === "gnosis") || (fields[2] === "essence") || (fields[2] === "bloodpool") || (fields[2] === "glamour") || (fields[2] === "banality")) {
			if (fields[1] === "essence") {
			if (actorData.system.advantages[fields[1]][fields[2]] == value) {
				actorData.system.advantages[fields[1]][fields[2]] = parseInt(actorData.system.advantages[fields[1]][fields[2]]) - 1;
			}
			else {
				actorData.system.advantages[fields[1]][fields[2]] = parseInt(value);
			}
		}
		
		await ActionHelper.handleCalculations(actorData);
		await ActionHelper.handleCreatureCalculations(actorData);
		
		console.log("WoD | Creature Sheet updated");
		this.actor.update(actorData);
	}
}