import { default as MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../../scripts/action-helpers.js";
import CreateHelper from "../../scripts/create-helpers.js";
import { calculateHealth } from "../../scripts/health.js";

export default class ChangelingActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet changeling"],
			template: "systems/worldofdarkness/templates/actor/changeling-sheet.html"
		});
	}
  
	constructor(actor, options) {
		super(actor, options);
	}

	/** @override */
	async getData() {
		const data = await super.getData();
		const realms = [];

		// gather all realms
		for (const i of this.actor.items) {
			if (i.type == "Trait") {
				if (i.system.type == "wod.types.realms") {
					let isaffinity = false;

					if (i.system.label == this.actor.system.affinityrealm) {
						isaffinity = true;
					}

					const data = {
						isvisible: true,
						isaffinity: isaffinity,
						label: i.system.label,
						max: i.system.max,
						speciality: i.system.speciality,
						value: i.system.value,
						_id: i._id
					}

					realms.push(data);
				}
			}
		}

		data.actor.system.listdata.chimericalhealth = await calculateHealth(data.actor, CONFIG.worldofdarkness.sheettype.changeling);
		data.actor.system.listdata.settings = [];
		data.actor.system.listdata.settings.haschimericalhealth = true;

		data.actor.system.listdata.powers.arts.realms = realms.sort((a, b) => a.label.localeCompare(b.label));

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.changeling) {
			console.log(`${data.actor.name} - (${CONFIG.worldofdarkness.sheettype.changeling})`);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		return "systems/worldofdarkness/templates/actor/changeling-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		ActionHelper.SetupDotCounters(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// health
		html
			.find(".health > .resource-counter > .resource-value-step")
			.click(this._onSquareChimericalChange.bind(this));
		html
			.find(".health > .resource-counter > .resource-value-step")
			.on('contextmenu', this._onSquareChimericalClear.bind(this));

		// Resource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterChangelingChange.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterChangelingChange.bind(this));

		// Rollable stuff
		html
			.find(".vrollable")
			.click(this._onRollChangelingDialog.bind(this));

		html
			.find(".switch")
			.click(this._switchChangelingSetting.bind(this));
			
		html
			.find(".willpower > .resource-value > .resource-value-step")
			.on('contextmenu', this._handleImbalance.bind(this));
	}	

	_onRollChangelingDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.changeling) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);		
	}

	async _switchChangelingSetting(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.changeling) {
			return;
		}

		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		const abilityType = dataset.switchtype;
		const actorData = foundry.utils.duplicate(this.actor);
		const source = dataset.source;

		if (source == "soak") {
			actorData.system.settings.soak.chimerical[abilityType].isrollable = !actorData.system.settings.soak.chimerical[abilityType].isrollable;
			actorData.system.settings.isupdated = false;
			await this.actor.update(actorData);
		}		
	}
	
	async _onDotCounterChangelingChange(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.changeling) {
			return;
		}

		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const steps = parent.find(".resource-value-step");

		// updated item
		if (parent[0].dataset.itemid != undefined) {
			if (this.locked) {
				ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				return;
			}

			const itemid = parent[0].dataset.itemid;
			let item = await this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = foundry.utils.duplicate(item);

			if ((index == 0) && (itemData.system.value == 1)) {
				itemData.system.value = 0;
			}
			else {
				itemData.system.value = parseInt(index + 1);
			}

			await item.update(itemData);			
		}
		// updated actor
		else {
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");	

			if (fields[2] == "health") {
				return;
			}

			if ((this.locked) && 
				((fieldStrings != "data.system.advantages.glamour.temporary") && 
				(fieldStrings != "data.system.advantages.nightmare.temporary") && 
				(fieldStrings != "data.system.advantages.banality.temporary"))) {
				ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				return;
			}

			if (index < 0 || index > steps.length) {
				return;
			}			

			this._assignToChangeling(fields, index + 1);
		}
		
		steps.removeClass("active");
		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		});		
	}

	async _onSquareChimericalChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const states = parseCounterStates("/:bashing,x:lethal,*:aggravated");
		const dataset = element.dataset;
		const type = dataset.type;

		const allStates = ["", ...Object.keys(states)];
		const currentState = allStates.indexOf(oldState);

		if (type != CONFIG.worldofdarkness.sheettype.changeling) {
			return;
		}
		
		if (currentState < 0) {
			return;
		}
		
		const actorData = foundry.utils.duplicate(this.actor);

		if (oldState == "") {
			actorData.system.health.damage.chimerical.bashing = parseInt(actorData.system.health.damage.chimerical.bashing) + 1;
		}
		else if (oldState == "/") { 
			actorData.system.health.damage.chimerical.bashing = parseInt(actorData.system.health.damage.chimerical.bashing) - 1;
			actorData.system.health.damage.chimerical.lethal = parseInt(actorData.system.health.damage.chimerical.lethal) + 1;			
		}
		else if (oldState == "x") { 
			actorData.system.health.damage.chimerical.lethal = parseInt(actorData.system.health.damage.chimerical.lethal) - 1;
			actorData.system.health.damage.chimerical.aggravated = parseInt(actorData.system.health.damage.chimerical.aggravated) + 1;
		}
		else if (oldState == "*") { 
			actorData.system.health.damage.chimerical.aggravated = parseInt(actorData.system.health.damage.chimerical.aggravated) - 1;
		}

		if (parseInt(actorData.system.health.damage.chimerical.bashing) < 0) {
			actorData.system.health.damage.chimerical.bashing = 0;
		}

		if (parseInt(actorData.system.health.damage.chimerical.lethal) < 0) {
			actorData.system.health.damage.chimerical.lethal = 0;
		}

		if (parseInt(actorData.system.health.damage.chimerical.aggravated) < 0) {
			actorData.system.health.damage.chimerical.aggravated = 0;
		}

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
	}

	async _onSquareChimericalClear(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.changeling) {
			return;
		}

		const actorData = foundry.utils.duplicate(this.actor);

		if (oldState == "") {
			return
		}
		else if (oldState == "/") { 
			actorData.system.health.damage.chimerical.bashing = parseInt(actorData.system.health.damage.chimerical.bashing) - 1;
		}
		else if (oldState == "x") { 
			actorData.system.health.damage.chimerical.lethal = parseInt(actorData.system.health.damage.chimerical.lethal) - 1;
		}
		else if (oldState == "*") { 
			actorData.system.health.damage.chimerical.aggravated = parseInt(actorData.system.health.damage.chimerical.aggravated) - 1;
		}

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
	}

	async _handleImbalance(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;
		let index = parseInt(dataset.index);

		if ((type == CONFIG.worldofdarkness.sheettype.mortal) && (dataset.key != "willpower")) {
		  	return;
		}

		index += 1

		const actorData = foundry.utils.duplicate(this.actor);

		if ((index == 1) && (actorData.system.advantages.willpower.imbalance == 1)) {
			actorData.system.advantages.willpower.imbalance = 0;
		}
		else if (index > actorData.system.advantages.willpower.permanent) {
			actorData.system.advantages.willpower.imbalance = actorData.system.advantages.willpower.permanent;
		}
		else {
			actorData.system.advantages.willpower.imbalance = index;
		}

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
	}

	async _assignToChangeling(fields, value) {
		const actorData = foundry.utils.duplicate(this.actor);

		if (fields[2] === "glamour") {
			if (fields[3] === "temporary") {
				if (actorData.system.advantages.glamour.temporary == value) {
					actorData.system.advantages.glamour.temporary = parseInt(actorData.system.advantages.glamour.temporary) - 1;
				}
				else {
					actorData.system.advantages.glamour.temporary = value;
				}
			}
			if (fields[3] === "permanent") {
				if (actorData.system.advantages.glamour.permanent == value) {
					actorData.system.advantages.glamour.permanent = parseInt(actorData.system.advantages.glamour.permanent) - 1;
				}
				else {
					actorData.system.advantages.glamour.permanent = value;
				}
			}
	
		}			
		else if (fields[2] === "banality") {
			if (fields[3] === "temporary") {
				if (actorData.system.advantages.banality.temporary == value) {
					actorData.system.advantages.banality.temporary = parseInt(actorData.system.advantages.banality.temporary) - 1;
				}
				else {
					actorData.system.advantages.banality.temporary = value;
				}
			}
			if (fields[3] === "permanent") {
				if (actorData.system.advantages.banality.permanent == value) {
					actorData.system.advantages.banality.permanent = parseInt(actorData.system.advantages.banality.permanent) - 1;
				}
				else {
					actorData.system.advantages.banality.permanent = value;
				}
			}
	
		}
		else if (fields[2] === "nightmare")	 {
			if (actorData.system.advantages.nightmare.temporary == value) {
				actorData.system.advantages.nightmare.temporary = parseInt(actorData.system.advantages.nightmare.temporary) - 1;
			}	
			else {
				actorData.system.advantages.nightmare.temporary = value;
			}
		}
		
		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
	}
}

function parseCounterStates(states) {
	return states.split(",").reduce((obj, state) => {
	  const [k, v] = state.split(":");
	  obj[k] = v;
	  return obj;
	}, {});
  }
