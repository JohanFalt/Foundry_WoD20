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
			}]
		});
	}
  
	constructor(actor, options) {
		super(actor, options);

		this.locked = true;
		
		console.log("WoD | Creature Sheet constructor");
	}

	/** @override */
	getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.data.settings.created) {
			if (actorData.type == "Creature") {
				ActionHelper._setCreatureAbilities(actorData);
				actorData.data.settings.created = true;
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

		data.actor.powerlist = powerlist;
		data.actor.other = other;

		console.log("Creature");
		console.log(data.actor);

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

	_onDotCounterCreatureEmpty(event) {
		console.log("WoD | Creature Sheet _onDotCounterEmpty");
		
		event.preventDefault();
		const element = event.currentTarget;
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-empty");
		
		if (this.locked) {
			console.log("WoD | Sheet locked aborts");
			return;
		}

		steps.removeClass("active");
		
		steps.each(function (i) {
			if (i <= 0) {
				$(this).addClass("active");
			}
		});
		
		if ((fields[2] === "gnosis") || (fields[2] === "rage"))
		{
			this._assignToCreature(fields, 0);
		}
		else
		{
			this._onDotCounterEmpty(event);		
		}		
	}
	
	_onDotCounterCreatureChange(event) {
		console.log("WoD | Creature Sheet _onDotCounterCreatureChange");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if ((this.locked) && 
				((fieldStrings != "data.data.rage.temporary") && 
				(fieldStrings != "data.data.gnosis.temporary"))) {
			console.log("WoD | Sheet locked aborts");
			return;
		}
		if (fieldStrings == "data.data.willpower.permanent") {
			console.log("WoD | Sheet click on permanent willpower aborts");			
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

		if ((fields[2] === "gnosis") || (fields[2] === "rage")) {
			this._assignToCreature(fields, index + 1);
		}
	}

	_assignToCreature(fields, value) {
		console.log("WoD | Creature Sheet _assignToCreature");
		
		const actorData = duplicate(this.actor);

		if (fields[2] === "rage") {
			if (fields[3] === "permanent") {
				actorData.data.rage.permanent = value;
			}
			else {
				actorData.data.rage.temporary = value;
			}
		}		
		else if (fields[2] === "gnosis") {
			if (fields[3] === "permanent") {
				actorData.data.gnosis.permanent = value;
			}
			else {
				actorData.data.gnosis.temporary = value;
			}
		}
		
		ActionHelper.handleCalculations(actorData);
		ActionHelper.handleWerewolfCalculations(actorData);
		
		console.log("WoD | Creature Sheet updated");
		this.actor.update(actorData);
	}
}