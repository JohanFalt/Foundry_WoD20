import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../../scripts/action-helpers.js";
import CreateHelper from "../../scripts/create-helpers.js";
import BonusHelper from "../../scripts/bonus-helpers.js";

export class MageActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet mage"],
			template: "systems/worldofdarkness/templates/actor/mage-sheet.html"
		});
	}
  
	constructor(actor, options) {
		super(actor, options);
	}

	/** @override */
	async getData() {
		const data = await super.getData();
		const rotes = [];
		const resonance = [];

		for (const i of data.items) {
			if (i.type == "Rote") {
			 	rotes.push(i);
			}
		}

		data.actor.system.listdata.rotes = rotes.sort((a, b) => a.name.localeCompare(b.name));

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.mage) {
			console.log(`${data.actor.name} - (${CONFIG.worldofdarkness.sheettype.mage})`);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		return "systems/worldofdarkness/templates/actor/mage-sheet.html";
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
			.click(this._onRollMageDialog.bind(this));

		html
			.find(".macroBtn")
			.click(this._onRollMageDialog.bind(this));

		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterMageChange.bind(this));

		// quintessence
		html
			.find(".quintessence > .resource-counter > .resource-value-step")
			.click(this._onQuintessenceChange.bind(this));
		html
			.find(".quintessenceBtn")
			.click(this._onQuintessenceChange.bind(this));
		html
			.find(".quintessence > .resource-counter > .resource-value-step")
			.on('contextmenu', this._onParadoxChange.bind(this));
		html
			.find(".paradoxBtn")
			.click(this._onParadoxChange.bind(this));
	}

	_onRollMageDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.mage) {
			return;
		}			
		
		ActionHelper.RollDialog(event, this.actor);
	}
	
	async _onDotCounterMageChange(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.mage) {
			return;
		}

		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		const parent = $(element.parentNode);
		const index = Number(dataset.index);
		const steps = parent.find(".resource-value-step");

		if (index < 0 || index > steps.length) {
			return;
		}		

		if (dataset.itemid != undefined) {
			const itemid = dataset.itemid;

			let item = await this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = foundry.utils.duplicate(item);

			if ((index == 0) && (itemData.system.value == 1)) {
				itemData.system.value = 0;
			}
			else {
				itemData.system.value = parseInt(index + 1);
			}
			//itemData.system.value = parseInt(index + 1);
			await item.update(itemData);
		}
		else {
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");				
	
			this._assignToMage(fields, index + 1);
		}	
		
		steps.removeClass("active");

		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		});
	}

	async _onQuintessenceChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const states = parseCounterStates("Ψ:quintessence,x:paradox,*:permanent_paradox");

		const allStates = ["", ...Object.keys(states)];
		const currentState = allStates.indexOf(oldState);
		
		if (currentState < 0) {
			return;
		}
		
		const actorData = foundry.utils.duplicate(this.actor);

		if (oldState == "") {
			if ((parseInt(actorData.system.quintessence.temporary) + parseInt(actorData.system.paradox.temporary) + parseInt(actorData.system.paradox.permanent)) < 20) {
				actorData.system.quintessence.temporary = parseInt(actorData.system.quintessence.temporary) + 1;
			}			
		}
		else if (oldState == "Ψ") { 
			if (parseInt(actorData.system.quintessence.temporary) > 0) {
				actorData.system.quintessence.temporary = parseInt(actorData.system.quintessence.temporary) - 1;			
			}			
		}
		else {
			return;
		}

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
	}

	async _onParadoxChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		let oldState = element.dataset.state || "";
		const states = parseCounterStates("Ψ:quintessence,x:paradox,*:permanent_paradox");

		const allStates = ["", ...Object.keys(states)];
		const currentState = allStates.indexOf(oldState);
		
		if (currentState < 0) {
			return;
		}

		const actorData = foundry.utils.duplicate(this.actor);

		if (oldState == "") {
			if ((parseInt(actorData.system.quintessence.temporary) + parseInt(actorData.system.paradox.temporary) + parseInt(actorData.system.paradox.permanent) + 1) > 20) {
				oldState = "Ψ";
			}
		}		

		if (oldState == "") {
			if (parseInt(actorData.system.paradox.temporary) + parseInt(actorData.system.paradox.permanent) < 20) {
				actorData.system.paradox.temporary = parseInt(actorData.system.paradox.temporary) + 1;	
			}			
		}
		else if (oldState == "x") {
			if (parseInt(actorData.system.paradox.temporary) > 0) {
				actorData.system.paradox.temporary = parseInt(actorData.system.paradox.temporary) - 1;
			}			
		}
		else if (oldState == "*") {
			return;
		}
		else if ((oldState == "Ψ") && (parseInt(actorData.system.quintessence.temporary) + parseInt(actorData.system.paradox.temporary) + parseInt(actorData.system.paradox.permanent) + 1 > 20)) { 
			if ((parseInt(actorData.system.paradox.temporary) + parseInt(actorData.system.paradox.permanent) < 20)) {
				actorData.system.quintessence.temporary = parseInt(actorData.system.quintessence.temporary) - 1;	
				actorData.system.paradox.temporary = parseInt(actorData.system.paradox.temporary) + 1;		
			}
		}
		else if (oldState == "Ψ") {
			actorData.system.quintessence.temporary = parseInt(actorData.system.quintessence.temporary) - 1;
		}
		else {
			return;
		}

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
	}	

	async _assignToMage(fields, value) {
		const actorData = foundry.utils.duplicate(this.actor);

		if (fields[1] === "arete") {
			if (actorData.system.advantages.arete.permanent == value) {
				actorData.system.advantages.arete.permanent = parseInt(actorData.system.advantages.arete.permanent) - 1;
			}
			else {
				actorData.system.advantages.arete.permanent = value;
			}
		}
		if (fields[2] === "spheres") {
			if (actorData.system.spheres[fields[3]].value == value) {
				actorData.system.spheres[fields[3]].value = parseInt(actorData.system.spheres[fields[3]].value) - 1;
			}
			else {
				actorData.system.spheres[fields[3]].value = value;
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
