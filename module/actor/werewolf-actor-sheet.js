import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js";
import CreateHelper from "../scripts/create-helpers.js";
import TokenHelper from "../scripts/token-helpers.js";

export class WerewolfActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet werewolf"],
			template: "systems/worldofdarkness/templates/actor/werewolf-sheet.html",
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
		console.log("WoD | Werewolf Sheet constructor");		
		this._createShape(actor);
	}

	/** @override */
	async getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.werewolf) {
				actorData.system.settings.iscreated = true;
				actorData.system.settings.version = game.data.system.version;

				await CreateHelper.SetWerewolfAbilities(actorData, this.actor, "modern");
				await CreateHelper.SetMortalAttributes(actorData);
				await CreateHelper.SetWerewolfAttributes(actorData);	
				
				console.log(`CREATION: Adds form bonus to ${this.actor.name}`);
				await this.actor.update(actorData);
			}				 	
		}

		const data = await super.getData();

		console.log("WoD | Werewolf Sheet getData");

		let presentform = "";

		console.log("WoD | Werewolf Sheet handling shift data");

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

		data.actor.presentform = presentform;

		if (actorData.type == CONFIG.wod.sheettype.werewolf) {
			console.log(CONFIG.wod.sheettype.werewolf);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		console.log("WoD | Werewolf Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/werewolf-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		ActionHelper.SetupDotCounters(html);

		console.log("WoD | Werewolf Sheet activateListeners");

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

	_createShape(actor) {
		if (!actor.system.settings.isshapecreated) {
			for (const item of actor.items) {
				if (item.type == "Bonus") {
					if ((item.system.parentid == "hispo") || (item.system.parentid == "lupus")) {
						actor.deleteEmbeddedDocuments("Item", [item._id]);                    
					}
				}
			}

			let itemData = {
				name: "Perception diff hispo",
				type: "Bonus",			
				data: {
					iscreated: true,
					isactive: false,
					version: game.data.system.version,
					parentid: "hispo",
					settingtype: "perception",
					type: "attribute_diff",
					value: -1
				}
			};
			actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = {
				name: "Perception diff lupus",
				type: "Bonus",			
				data: {
					iscreated: true,
					isactive: false,
					version: game.data.system.version,
					parentid: "lupus",
					settingtype: "perception",
					type: "attribute_diff",
					value: -2
				}
			};
			actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = {
				name: "Wits diff hispo",
				type: "Bonus",			
				data: {
					iscreated: true,
					isactive: false,
					version: game.data.system.version,
					parentid: "hispo",
					settingtype: "wits",
					type: "attribute_diff",
					value: -1
				}
			};
			actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = {
				name: "Wits diff lupus",
				type: "Bonus",			
				data: {
					iscreated: true,
					isactive: false,
					version: game.data.system.version,
					parentid: "lupus",
					settingtype: "wits",
					type: "attribute_diff",
					value: -2
				}
			};
			actor.createEmbeddedDocuments("Item", [itemData]);

			const actorData = duplicate(actor);
			actorData.system.settings.version = game.data.system.version;
			actorData.system.settings.isshapecreated = true;
			actor.update(actorData);
		}
	}

	_onRollWerewolfDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.werewolf) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}
	
	_onDotCounterWerewolfChange(event) {
		console.log("WoD | Werewolf Sheet _onDotCounterWerewolfChange");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.werewolf) {
			return;
		}

		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if ((this.locked) && 
				((fieldStrings != "rage.temporary") && 
				(fieldStrings != "gnosis.temporary") && 
				(fieldStrings != "renown.glory.temporary") && 
				(fieldStrings != "renown.honor.temporary") && 
				(fieldStrings != "renown.wisdom.temporary"))) {
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

		this._assignToWerewolf(fields, index + 1);
	}

	async _onShiftForm(event) {
		console.log("WoD | Werewolf onShiftForm");

		event.preventDefault();

		const actorData = duplicate(this.actor);

		if (actorData.type != CONFIG.wod.sheettype.werewolf) {
			return;
		}

		const element = event.currentTarget;
		const dataset = element.dataset;
		const fromForm = this.actor.presentform;
		const toForm = dataset.form;

		for (const i in actorData.system.shapes) {
			actorData.system.shapes[i].isactive = false;

			/* if (actorData.system.shapes[i].label == fromForm)  {
				actorData.system.shapes[i].isactive = false;
			} */

			if (actorData.system.shapes[i].label == toForm) {
				actorData.system.shapes[i].isactive = true;
			}			
		}		

		await ActionHelper.handleCalculations(actorData);
		//await TokenHelper.formShift(actorData, fromForm, toForm);		

		console.log("WoD | Werewolf Sheet updated");
		await this.actor.update(actorData);

		await TokenHelper.formShift(this.actor, fromForm, toForm);
	}
	
	async _assignToWerewolf(fields, value) {
		console.log("WoD | Werewolf Sheet _assignToWerewolf");
		
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
		
		console.log("WoD | Werewolf Sheet updated");
		this.actor.update(actorData);
	}	
}