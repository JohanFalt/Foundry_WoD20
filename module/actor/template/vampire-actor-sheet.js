import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../../scripts/action-helpers.js";
import CreateHelper from "../../scripts/create-helpers.js";

export class VampireActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet vampire"],
			template: "systems/worldofdarkness/templates/actor/vampire-sheet.html"
		});
	}
  
	constructor(actor, options) {
		super(actor, options);
	}

	/** @override */
	async getData() {
		if (!this.actor.limited) {
			const disciplineMax = await calculteMaxDiscipline(parseInt(this.actor.system.generation) - parseInt(this.actor.system.generationmod));
			await keepAbilitiesDisciplinesCorrect(disciplineMax, this.actor);		
		}

		const data = await super.getData();

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.vampire) {
			console.log(`${data.actor.name} - (${CONFIG.worldofdarkness.sheettype.vampire})`);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		return "systems/worldofdarkness/templates/actor/vampire-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		ActionHelper.SetupDotCounters(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Resource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterVampireChange.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterVampireChange.bind(this));

		// Rollable stuff
		html
			.find(".vrollable")
			.click(this._onRollVampireDialog.bind(this));

		html
			.find(".macroBtn")
			.click(this._onRollVampireDialog.bind(this));	

		// Select generation
		html
			.find(".selectGeneration")
			.change(this._onSelectGeneration.bind(this));

		// Temp generation
		html
			.find('.pointer.selectGeneration')
			.click(this._onSelectGeneration.bind(this));		
	}	

	_onRollVampireDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.worldofdarkness.sheettype.vampire) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);		
	}

	/* makes the alternations on the sheet based on generation */
	async _onSelectGeneration(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;		

		if (dataset.type != CONFIG.worldofdarkness.sheettype.vampire) {
			return;
		}

		const actorData = foundry.utils.duplicate(this.actor);
		let selectedGeneration = actorData.system.generation;
		let generationModifier = 0;
		let error = false;				

		if (dataset.source == "reduce") {
			generationModifier = actorData.system.generationmod + 1;
		}
		else if (dataset.source == "clear") {
			generationModifier = 0;
		}
		else {
			try {
				selectedGeneration = parseInt(element.value);
	
				if (isNaN(selectedGeneration)) {
					error = true;
				}
			}
			catch(e){
				error = true;
			}
		}

		if (error) {
			ui.notifications.warn(game.i18n.localize("wod.labels.bio.wronggeneration"));
			return;
		}

		selectedGeneration = selectedGeneration - generationModifier;

		if (selectedGeneration < 4) {
			ui.notifications.warn(game.i18n.localize("wod.labels.bio.wrongtempgeneration"));
			return;
		}

		actorData.system.generationmod = generationModifier;
		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		this.render();
	}
	
	async _onDotCounterVampireChange(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.worldofdarkness.sheettype.vampire) {
			return;
		}

		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const steps = parent.find(".resource-value-step");

		steps.removeClass("active");
		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		});		
	}
}

async function calculteMaxDiscipline(selectedGeneration) {
	let disciplineMax = 5;

	if (selectedGeneration == 15) {
		disciplineMax = 3;
	}
	if (selectedGeneration == 14) {
		disciplineMax = 4;
	}
	if (selectedGeneration == 7) {
		disciplineMax = 6;
	}
	if (selectedGeneration == 6) {
		disciplineMax = 7;
	}
	if (selectedGeneration == 5) {
		disciplineMax = 8;
	}
	if (selectedGeneration == 4) {
		disciplineMax = 9;
	}

	return disciplineMax;
}

async function keepAbilitiesDisciplinesCorrect(disciplineMax, actor) {	
	for (const item of actor.items) {
		// secondary abilities
		if ((item.type == "Trait") && ((item.system.type == "wod.types.talentsecondability") || (item.system.type == "wod.types.skillsecondability") || (item.system.type == "wod.types.knowledgesecondability"))) {
			const itemData = foundry.utils.duplicate(item);

			if (itemData.system.max != parseInt(disciplineMax)) {
				itemData.system.max = parseInt(disciplineMax);
				await item.update(itemData);
			}
		}
		// disciplines and paths
		if ((item.type == "Power") && ((item.system.type == "wod.types.discipline") || (item.system.type == "wod.types.disciplinepath"))) {
			const itemData = foundry.utils.duplicate(item);

			if (itemData.system.max != parseInt(disciplineMax)) {
				itemData.system.max = parseInt(disciplineMax);
				await item.update(itemData);
			}			
		}		
		// disipline powers and path powers
		if ((item.type == "Power") && (item.system.type == "wod.types.disciplinepower") || (item.system.type == "wod.types.disciplinepathpower")) {
			const itemData = foundry.utils.duplicate(item);

			if (itemData.system.max != 0) {
				itemData.system.value = 0;
				itemData.system.max = 0;
				await item.update(itemData);
			}
		}
		// rituals
		if ((item.type == "Power") && (item.system.type == "wod.types.ritual")) {
			const itemData = foundry.utils.duplicate(item);

			if (itemData.system.max != 0) {
				itemData.system.value = 0;
				itemData.system.max = 0;
				await item.update(itemData);
			}
		}
	}
}
