import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js";
import { Rote } from "../dialogs/dialog-aretecasting.js";
import { DialogAreteCasting } from "../dialogs/dialog-aretecasting.js";

export class MageActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["mage"],
			template: "systems/worldofdarkness/templates/actor/mage-sheet.html",
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

		this.locked = true;
		this.isCharacter = true;	
		this.isGM = game.user.isGM;	
		
		console.log("WoD | Mage Sheet constructor");
	}

	/** @override */
	getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.mage) {
				ActionHelper._setMageAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);
				ActionHelper._setMageAttributes(actorData);
				
				actorData.system.settings.iscreated = true;
				this.actor.update(actorData);
			}	 	
		}

		const data = super.getData();

		console.log("WoD | Mage Sheet getData");

		const rotes = [];
		const fetishlist = [];
		const talenlist = [];
		const resonance = [];

		for (const i of data.items) {
			if (i.type == "Rote") {
				rotes.push(i);
			}
			if (i.type == "Fetish") {
				if (i.system.type == "wod.types.fetish") {
					fetishlist.push(i);
				}
				if (i.system.type == "wod.types.talen") {
					talenlist.push(i);
				}
			}
			if (i.type == "Trait") {
				if (i.system.type == "wod.types.resonance") {
					resonance.push(i);
				}
			}
		}

		data.actor.rotes = rotes.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.fetishlist = fetishlist.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.talenlist = talenlist.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.resonance = resonance.sort((a, b) => a.name.localeCompare(b.name));

		if (actorData.type == CONFIG.wod.sheettype.mage) {
			console.log(CONFIG.wod.sheettype.mage);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		console.log("WoD | Mage Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/mage-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);		
		ActionHelper._setupDotCounters(html);

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
		html
			.find(".resource-value > .resource-value-empty")
			.click(this._onDotCounterMageEmpty.bind(this));

		// quintessence
		html
			.find(".quintessence > .resource-counter > .resource-value-step")
			.click(this._onQuintessenceChange.bind(this));
		html
			.find(".quintessence > .resource-counter > .resource-value-step")
			.on('contextmenu', this._onParadoxChange.bind(this));

		console.log("WoD | Mage Sheet activateListeners");
	}

	_onRollMageDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.mage) {
			return;
		}			

		// if (dataset.rollparadox == "true") {
		// 	ActionHelper.RollParadox(event, this.actor);

		// 	return;
		// }	
		
		ActionHelper.RollDialog(event, this.actor);
	}

	async _onDotCounterMageEmpty(event) {
		console.log("WoD | Mage Sheet _onDotCounterEmpty");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.mage) {
			return;
		}

		const parent = $(element.parentNode);		
		const steps = parent.find(".resource-value-empty");
		
		if (this.locked) {
			return;
		}

		steps.removeClass("active");

		if (dataset.itemid != undefined) {
			const itemid = dataset.itemid;

			let item = this.actor.getEmbeddedDocument("Item", itemid);

			const itemData = duplicate(item);
			itemData.system.value = 0;
			await item.update(itemData);
		}
		else {
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");

			this._assignToMage(fields, 0);
		}
	}
	
	async _onDotCounterMageChange(event) {
		console.log("WoD | Mage Sheet _onDotCounterMageChange");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.mage) {
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

			let item = this.actor.getEmbeddedDocument("Item", itemid);
			const itemData = duplicate(item);
			itemData.system.value = parseInt(index + 1);
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

	_onQuintessenceChange(event) {
		console.log("WoD | Update Quintessence");

		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const states = parseCounterStates("Ψ:quintessence,x:paradox,*:permanent_paradox");

		const allStates = ["", ...Object.keys(states)];
		const currentState = allStates.indexOf(oldState);
		
		if (currentState < 0) {
			return;
		}
		
		const actorData = duplicate(this.actor);

		if (oldState == "") {
			actorData.system.quintessence.temporary = parseInt(actorData.system.quintessence.temporary) + 1;
		}
		// else if (oldState == "x") {
		// 	actorData.system.paradox.temporary = parseInt(actorData.system.paradox.temporary) - 1;
		// }
		else if (oldState == "Ψ") { 
			actorData.system.quintessence.temporary = parseInt(actorData.system.quintessence.temporary) - 1;			
		}
		else {
			return;
		}

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleMageCalculations(actorData);

		this.actor.update(actorData);
	}

	_onParadoxChange(event) {
		console.log("WoD | Update Paradox");

		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const states = parseCounterStates("Ψ:quintessence,x:paradox,*:permanent_paradox");

		const allStates = ["", ...Object.keys(states)];
		const currentState = allStates.indexOf(oldState);
		
		if (currentState < 0) {
			return;
		}
		
		const actorData = duplicate(this.actor);

		if (oldState == "") {
			actorData.system.paradox.temporary = parseInt(actorData.system.paradox.temporary) + 1;
		}
		else if (oldState == "x") {
			actorData.system.paradox.temporary = parseInt(actorData.system.paradox.temporary) - 1;
		}
		else if (oldState == "*") {
			return;
		}
		else if ((oldState == "Ψ") && (parseInt(actorData.system.quintessence.temporary) + parseInt(actorData.system.paradox.temporary) + parseInt(actorData.system.paradox.permanent) + 1 > 20)) { 
			actorData.system.quintessence.temporary = parseInt(actorData.system.quintessence.temporary) - 1;	
			actorData.system.paradox.temporary = parseInt(actorData.system.paradox.temporary) + 1;		
		}
		else if (oldState == "Ψ") {
			actorData.system.quintessence.temporary = parseInt(actorData.system.quintessence.temporary) - 1;
		}
		else {
			return;
		}

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleMageCalculations(actorData);

		this.actor.update(actorData);
	}	

	_assignToMage(fields, value) {
		console.log("WoD | Mage Sheet _assignToMage");
		
		const actorData = duplicate(this.actor);

		if (fields[2] === "arete") {
			if (actorData.system.arete.permanent == value) {
				actorData.system.arete.permanent = parseInt(actorData.system.arete.permanent) - 1;
			}
			else {
				actorData.system.arete.permanent = value;
			}
		}
		if (fields[1] === "spheres") {
			actorData.system.spheres[fields[2]].value = value;
		}

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleMageCalculations(actorData);
		
		console.log("WoD | Mage Sheet updated");
		this.actor.update(actorData);
	}
}

function parseCounterStates(states) {
	return states.split(",").reduce((obj, state) => {
	  const [k, v] = state.split(":");
	  obj[k] = v;
	  return obj;
	}, {});
}
