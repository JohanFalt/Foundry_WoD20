import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js";
import { calculateHealth } from "../scripts/health.js";

export class ChangelingActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["changeling"],
			template: "systems/worldofdarkness/templates/actor/changeling-sheet.html",
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
		
		console.log("WoD | Changeling Sheet constructor");

		// let tour = new Tour({
		// 	"namespace": "changeling",
		// 	"id": "basic-tour",
		// 	"title": "Basic Tour",
		// 	"steps": [
		// 	  {
		// 		"selector": "[data-tab=\"chat\"]",
		// 		"title": "Dreaming Tab",
		// 		"content": "Displays messages between Users."
		// 	  }			
		// 	]
		//   });
		//   tour.start();
	}

	/** @override */
	async getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.changeling) {
				const version = game.data.system.version;

				actorData.system.settings.soak.chimerical.bashing.isrollable = true;
				actorData.system.settings.soak.chimerical.lethal.isrollable = true;
				actorData.system.settings.soak.chimerical.aggravated.isrollable = false;

                ActionHelper._setChangelingAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);    
				
				console.log(`CREATION: Adds Realms to ${this.actor.name}`);
				
				let itemData = {
					name: "actor",
					type: "Trait",
					
					data: {
						iscreated: true,
						version: version,
						label: "wod.realms.actor",
						type: "wod.types.realms"
					}
				};
				await this.actor.createEmbeddedDocuments("Item", [itemData]);

				itemData = {
					name: "fae",
					type: "Trait",
					data: {
						iscreated: true,
						version: version,
						label: "wod.realms.fae",
						type: "wod.types.realms"
					}
				};
				await this.actor.createEmbeddedDocuments("Item", [itemData]);

				itemData = {
					name: "nature",
					type: "Trait",
					data: {
						iscreated: true,
						version: version,
						label: "wod.realms.nature",
						type: "wod.types.realms"
					}
				};
				await this.actor.createEmbeddedDocuments("Item", [itemData]);

				itemData = {
					name: "prop",
					type: "Trait",
					data: {
						iscreated: true,
						version: version,
						label: "wod.realms.prop",
						type: "wod.types.realms"
					}
				};
				await this.actor.createEmbeddedDocuments("Item", [itemData]);

				itemData = {
					name: "scene",
					type: "Trait",
					data: {
						iscreated: true,
						version: version,
						label: "wod.realms.scene",
						type: "wod.types.realms"
					}
				};
				await this.actor.createEmbeddedDocuments("Item", [itemData]);

				itemData = {
					name: "time",
					type: "Trait",
					data: {
						iscreated: true,
						version: version,
						label: "wod.realms.time",
						type: "wod.types.realms"
					}
				};				
				await this.actor.createEmbeddedDocuments("Item", [itemData]);

				actorData.system.settings.iscreated = true;
				this.actor.update(actorData);
			}	 	
		}

		const data = super.getData();

		console.log("WoD | Changeling Sheet getData");

		const realms = [];
		const treasures = [];

		const artlist = [];
		const tempartlist = [];
		const unlistedartlist = [];
		const templist = [];
		let unlisted = false;

		for (const i of data.items) {
			if (i.type == "Item") {
				if (i.system.type == "wod.types.treasure") {
					treasures.push(i);
				}
			}
			if (i.type == "Power") {
				if (i.system.type == "wod.types.art") {
					tempartlist.push(i);
				}
				if (i.system.type == "wod.types.artpower") {
					if (i.system.parentid != "") {
						i.system.level = i.system.level.toString();
						templist.push(i);
					}
					else {
						unlistedartlist.push(i);
						unlisted = true;
					}					
				}
			}
			if (i.type == "Trait") {
				if (i.system.type == "wod.types.realms") {
					let isaffinity = false;

					if (i.system.label == actorData.system.affinityrealm) {
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

		data.actor.system.listdata.chimericalhealth = calculateHealth(data.actor, CONFIG.wod.sheettype.changeling);
		data.actor.system.listdata.settings.haschimericalhealth = true;

		// sort arts
		tempartlist.sort((a, b) => a.name.localeCompare(b.name));
		templist.sort((a, b) => a.system.level.localeCompare(b.system.level));			

		for (const art of tempartlist) {
			artlist.push(art);

			for (const power of templist) {
				if (power.system.parentid == art._id) {
					artlist.push(power);
				}
			}
		}		

		data.actor.system.listdata.artlist = artlist;
		data.actor.system.listdata.listedarts = tempartlist;
		data.actor.system.listdata.unlistedarts = unlistedartlist.sort((a, b) => a.name.localeCompare(b.name));	
		data.actor.system.listdata.hasunlistedarts = unlisted;
		data.actor.system.listdata.realms = realms.sort((a, b) => a.label.localeCompare(b.label));
		data.actor.system.listdata.treasures = treasures.sort((a, b) => a.name.localeCompare(b.name));

		if (actorData.type == CONFIG.wod.sheettype.changeling) {
			console.log(CONFIG.wod.sheettype.changeling);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		console.log("WoD | Changeling Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/changeling-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		ActionHelper._setupDotCounters(html);

		console.log("WoD | Changeling Sheet activateListeners");

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
		html
			.find(".resource-value > .resource-value-empty")
			.click(this._onDotCounterChangelingEmpty.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterChangelingChange.bind(this));
		html
			.find(".resource-counter > .resource-value-empty")
			.click(this._onDotCounterChangelingEmpty.bind(this));

		// Rollable stuff
		html
			.find(".vrollable")
			.click(this._onRollChangelingDialog.bind(this));

		html
			.find(".switch")
			.click(this._switchChangelingSetting.bind(this));

		// html
		// 	.find(".macroBtn")
		// 	.click(this._onRollChangelingDialog.bind(this));		
			
		html
			.find(".willpower > .resource-value > .resource-value-step")
			.on('contextmenu', this._handleImbalance.bind(this));
	}	

	_onRollChangelingDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.changeling) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);		
	}

	async _switchChangelingSetting(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.changeling) {
			return;
		}

		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		const abilityType = dataset.switchtype;
		const actorData = duplicate(this.actor);
		const source = dataset.source;

		if (source == "soak") {
			actorData.system.settings.soak.chimerical[abilityType].isrollable = !actorData.system.settings.soak.chimerical[abilityType].isrollable;
		}

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

		await this.actor.update(actorData);
	}

	async _onDotCounterChangelingEmpty(event) {
		console.log("WoD | Changeling Sheet _onDotCounterChangelingEmpty");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.changeling) {
			return;
		}

		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-empty");
		
		if (this.locked) {
			return;
		}

		steps.removeClass("active");

		// updated item
		if (parent[0].dataset.itemid != undefined) {
			const itemid = parent[0].dataset.itemid;

			let item = this.actor.getEmbeddedDocument("Item", itemid);

			const itemData = duplicate(item);
			itemData.system.value = 0;
			await item.update(itemData);			
		}
		// updated actor
		else {
			this._assignToChangeling(fields, 0);
		}					
	}		
	
	async _onDotCounterChangelingChange(event) {
		console.log("WoD | Changeling Sheet _onDotCounterChangelingChange");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.changeling) {
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

			let item = this.actor.getEmbeddedDocument("Item", itemid);

			const itemData = duplicate(item);
			itemData.system.value = parseInt(index) + 1;
			await item.update(itemData);			
		}
		// updated actor
		else {
			
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");	

			if ((this.locked) && 
				((fieldStrings != "data.system.glamour.temporary") && 
				(fieldStrings != "data.system.nightmare.temporary") && 
				(fieldStrings != "data.system.banality.temporary"))) {
				ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				return;
			}

			if (index < 0 || index > steps.length) {
				return;
			}

			if (fields[2] == "health") {
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
		console.log("WoD | Update Health Levels");

		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const states = parseCounterStates("/:bashing,x:lethal,*:aggravated");
		const dataset = element.dataset;
		const type = dataset.type;

		const allStates = ["", ...Object.keys(states)];
		const currentState = allStates.indexOf(oldState);

		if (type != CONFIG.wod.sheettype.changeling) {
			return;
		}
		
		if (currentState < 0) {
			return;
		}
		
		const actorData = duplicate(this.actor);

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

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

		await this.actor.update(actorData);
	}

	async _onSquareChimericalClear(event) {
		console.log("WoD | Clear Health Level");

		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.changeling) {
			return;
		}

		const actorData = duplicate(this.actor);

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

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWoundLevelCalculations(actorData);

		await this.actor.update(actorData);
	}

	async _handleImbalance(event) {
		console.log("WoD | Clear Health Level");

		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;
		let index = parseInt(dataset.index);

		// if (type != CONFIG.wod.sheettype.changeling) {
		//  	return;
		// }

		if ((type == CONFIG.wod.sheettype.mortal) && (dataset.key != "willpower")) {
		  	return;
		}

		index += 1

		const actorData = duplicate(this.actor);

		if ((index == 1) && (actorData.system.willpower.imbalance == 1)) {
			actorData.system.willpower.imbalance = 0;
		}
		else if (index > actorData.system.willpower.permanent) {
			actorData.system.willpower.imbalance = actorData.system.willpower.permanent;
		}
		else {
			actorData.system.willpower.imbalance = index;
		}

		ActionHelper._handleCalculations(actorData);
		ActionHelper._handleChangelingCalculations(actorData);
		
		console.log("WoD | Changeling Sheet updated");
		await this.actor.update(actorData);
	}

	_assignToChangeling(fields, value) {
		console.log("WoD | Changeling Sheet _assignToChangeling");
		
		const actorData = duplicate(this.actor);

		if (fields[2] === "glamour") {
			if (fields[3] === "temporary") {
				if (actorData.system.glamour.temporary == value) {
					actorData.system.glamour.temporary = parseInt(actorData.system.glamour.temporary) - 1;
				}
				else {
					actorData.system.glamour.temporary = value;
				}
			}
			if (fields[3] === "permanent") {
				if (actorData.system.glamour.permanent == value) {
					actorData.system.glamour.permanent = parseInt(actorData.system.glamour.permanent) - 1;
				}
				else {
					actorData.system.glamour.permanent = value;
				}
			}
	
		}			
		else if (fields[2] === "banality") {
			if (fields[3] === "temporary") {
				if (actorData.system.banality.temporary == value) {
					actorData.system.banality.temporary = parseInt(actorData.system.banality.temporary) - 1;
				}
				else {
					actorData.system.banality.temporary = value;
				}
			}
			if (fields[3] === "permanent") {
				if (actorData.system.banality.permanent == value) {
					actorData.system.banality.permanent = parseInt(actorData.system.banality.permanent) - 1;
				}
				else {
					actorData.system.banality.permanent = value;
				}
			}
	
		}
		else if (fields[2] === "nightmare")	 {
			if (actorData.system.nightmare.temporary == value) {
				actorData.system.nightmare.temporary = parseInt(actorData.system.nightmare.temporary) - 1;
			}	
			else {
				actorData.system.nightmare.temporary = value;
			}
		}
		
		ActionHelper._handleCalculations(actorData);
		ActionHelper._handleChangelingCalculations(actorData);
		
		console.log("WoD | Changeling Sheet updated");
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
