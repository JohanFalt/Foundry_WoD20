import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../../scripts/action-helpers.js";
import BonusHelper from "../../scripts/bonus-helpers.js";
import CreateHelper from "../../scripts/create-helpers.js";

export class DemonActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet demon"],
			template: "systems/worldofdarkness/templates/actor/demon-sheet.html"
		});
	}
  
	constructor(actor, options) {
		super(actor, options);
	}

	/** @override */
	async getData() {
		const data = await super.getData();
		const forms = [];

		for (const i of data.items) {
			if (i.type == "Trait") {
				if (i.system.type == "wod.types.apocalypticform") {
					const bonus = i.system.bonuslist;

					const form = {
						isactive: i.system.isactive,
						name: i.name,
						level: i.system.level,
						details: i.system.details,
						description: i.system.description,
						_id: i._id,
						bonuses: bonus
					}

					forms.push(form);
				}
			}
		}

		data.actor.system.listdata.forms = forms;

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.demon) {
			console.log(`${data.actor.name} - (${CONFIG.worldofdarkness.sheettype.demon})`);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		return "systems/worldofdarkness/templates/actor/demon-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		ActionHelper.SetupDotCounters(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Receive collapsed state from flags
		html.find('.collapsible.button').toArray().filter(ele => {
			if (this.actor && this.actor.id && game.user.flags.wod && game.user.flags.wod[this.actor.id] && game.user.flags.wod[this.actor.id][ele.dataset.type] && !game.user.flags.wod[this.actor.id][ele.dataset.type].collapsed) {
				$(ele).removeClass("fa-angles-right");
				$(ele).addClass("fa-angles-down");

				$(ele).parent().parent().siblings('.'+ele.dataset.type).removeClass("hide");
				$(ele).parent().parent().siblings('.'+ele.dataset.type).addClass("show");
			}
			else {
				$(ele).removeClass("fa-angles-down");
				$(ele).addClass("fa-angles-right");

				$(ele).parent().parent().siblings('.'+ele.dataset.type).removeClass("show");
				$(ele).parent().parent().siblings('.'+ele.dataset.type).addClass("hide");
			}
		});

		// Rollable stuff
		html
			.find(".vrollable")
			.click(this._onRollDemonDialog.bind(this));

		html
			.find(".macroBtn")
			.click(this._onRollDemonDialog.bind(this));		
			
		// resource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterDemonChange.bind(this));
		
		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterDemonChange.bind(this));
	}

	_onRollDemonDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.demon) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}
	
	async _onDotCounterDemonChange(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.demon) {
			return;
		}

		const parent = $(element.parentNode);	
		const steps = parent.find(".resource-value-step");	
		const index = Number(dataset.index);		

		let itemid = undefined;

		// e.g powers like disciplines
		if (parent[0].dataset.itemid != undefined) {
			itemid = parent[0].dataset.itemid
		}

		if (itemid != undefined) {
			if (this.locked) {
				ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				return;
		   	}

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
		else {
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");
	
			if (index < 0 || index > steps.length) {
				return;
			}
			
			await this._assignToDemon(fields, index + 1);
		}			
	}

	async _assignToDemon(fields, value) {
		const actorData = foundry.utils.duplicate(this.actor);

		let area = fields[0];	
		const ability = fields[1];	

		if (area === "advantages") {			
			const abilityType = fields[2];

			if (fields.length == 3) {
				const field = fields[2];

				if (actorData.system.advantages[ability][field] == value) {
					actorData.system.advantages[ability][field] = parseInt(actorData.system.advantages[ability][field]) - 1;
				}
				else {
					actorData.system.advantages[ability][field] = parseInt(value);
				}
			}
			else if (fields.length == 4) {
				const field = fields[3];

				if (actorData.system.advantages[ability][abilityType][field] == value) {
					actorData.system.advantages[ability][abilityType][field] = parseInt(actorData.system.advantages[ability][abilityType][field]) - 1;
				}
				else {
					actorData.system.advantages[ability][abilityType][field] = parseInt(value);
				}
			}
		}

		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		//this.render();
	}	
}
