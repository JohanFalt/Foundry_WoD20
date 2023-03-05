import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js";
import CreateHelper from "../scripts/create-helpers.js";

export class VampireActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["vampire"],
			template: "systems/worldofdarkness/templates/actor/vampire-sheet.html",
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
		
		console.log("WoD | Vampire Sheet constructor");
	}

	/** @override */
	async getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.vampire) {
				actorData.system.settings.iscreated = true;
				actorData.system.settings.version = game.data.system.version;

				await CreateHelper.SetVampireAbilities(actorData);
				await CreateHelper.SetMortalAttributes(actorData);
				await CreateHelper.SetVampireAttributes(actorData);				
				
				await this.actor.update(actorData);
			}	 	
		}

		if (!this.actor.limited) {
			const disciplineMax = await calculteMaxDiscipline(parseInt(this.actor.system.generation));
			await keepAbilitiesDisciplinesCorrect(disciplineMax, this.actor);		
		}

		const data = await super.getData();

		console.log("WoD | Vampire Sheet getData");

		if (actorData.type == CONFIG.wod.sheettype.vampire) {
			console.log(CONFIG.wod.sheettype.vampire);
			console.log(data.actor);
		}

		return data;
	}

	/** @override */
	get template() {
		console.log("WoD | Vampire Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/vampire-sheet.html";
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		ActionHelper.SetupDotCounters(html);

		console.log("WoD | Vampire Sheet activateListeners");

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

		// Select path
		html
			.find(".selectedPath")
			.change(this._onSelectPath.bind(this));

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

		if (dataset.type != CONFIG.wod.sheettype.vampire) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);		
	}

	/* makes the alternations on the sheet based on path */
	_onSelectPath(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;				

		if (dataset.type != CONFIG.wod.sheettype.vampire) {
			return;
		}

		const selectedPath = element.value;
		const actorData = duplicate(this.actor);

		actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conscience";
		actorData.system.advantages.virtues.selfcontrol.label = "wod.advantages.virtue.selfcontrol";
		actorData.system.advantages.virtues.courage.label = "wod.advantages.virtue.courage";

		if (selectedPath === "wod.advantages.path.blood") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
		}
		if (selectedPath === "wod.advantages.path.bones") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
		}
		if (selectedPath === "wod.advantages.path.caine") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.system.advantages.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.cathari") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.system.advantages.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.feralheart") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.system.advantages.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.accord") {
		}
		if (selectedPath === "wod.advantages.path.lilith") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.system.advantages.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.metamorphosis") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.system.advantages.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.night") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.system.advantages.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.paradox") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
		}
		if (selectedPath === "wod.advantages.path.innervoice") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.system.advantages.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.typhon") {
			actorData.system.advantages.virtues.conscience.label = "wod.advantages.virtue.conviction";
		}

		console.log("WoD | Vampire Sheet updated");
		this.actor.update(actorData);
	}

	/* makes the alternations on the sheet based on generation */
	async _onSelectGeneration(event) {
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;		

		if (dataset.type != CONFIG.wod.sheettype.vampire) {
			return;
		}

		const actorData = duplicate(this.actor);
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

		const bloodpoolMax = calculteMaxBlood(selectedGeneration);
		const bloodSpending = calculteMaxBloodSpend(selectedGeneration);
		const traitMax = calculteMaxTrait(selectedGeneration);
		const disciplineMax = calculteMaxDiscipline(selectedGeneration);		

		// attributes max
		for (const i in actorData.system.attributes) {
			actorData.system.attributes[i].max = traitMax;

			if (actorData.system.attributes[i].value > traitMax) {
				actorData.system.attributes[i].value = traitMax;
			}
		}

		// ability max
		for (const i in actorData.system.abilities.talent) {
			actorData.system.abilities.talent[i].max = traitMax;

			if (actorData.system.abilities.talent[i].value > traitMax) {
				actorData.system.abilities.talent[i].value = traitMax;
			}
		}

		for (const i in actorData.system.abilities.skill) {
			actorData.system.abilities.skill[i].max = traitMax;

			if (actorData.system.abilities.skill[i].value > traitMax) {
				actorData.system.abilities.skill[i].value = traitMax;
			}
		}

		for (const i in actorData.system.abilities.knowledge) {
			actorData.system.abilities.knowledge[i].max = traitMax;

			if (actorData.system.abilities.knowledge[i].value > traitMax) {
				actorData.system.abilities.knowledge[i].value = traitMax;
			}
		}

		// virtues
		for (const i in actorData.system.advantages.virtues) {
			actorData.system.advantages.virtues[i].max = 5;
		}

		// blood pool
		actorData.system.advantages.bloodpool.max = bloodpoolMax;
		actorData.system.advantages.bloodpool.perturn = bloodSpending;

		if (actorData.system.advantages.bloodpool.temporary > bloodpoolMax) {
			actorData.system.advantages.bloodpool.temporary = bloodpoolMax;
		}

		actorData.system.generation = selectedGeneration + generationModifier;
		actorData.system.generationmod = generationModifier;

		// to recalculate total values
		await ActionHelper.handleCalculations(actorData);

		console.log("WoD | Vampire Sheet updated");
		await this.actor.update(actorData);
		await keepAbilitiesDisciplinesCorrect(disciplineMax, this.actor);
		this.render(false);
	}
	
	async _onDotCounterVampireChange(event) {
		console.log("WoD | Vampire Sheet _onDotCounterVampireChange");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.vampire) {
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

function calculteMaxBlood(selectedGeneration) {
	let bloodpoolMax = 10;

	if (selectedGeneration == 15) {
		bloodpoolMax = 6;
	}
	if (selectedGeneration == 14) {
		bloodpoolMax = 8;
	}
	if (selectedGeneration == 12) {
		bloodpoolMax = 11;
	}
	if (selectedGeneration == 11) {
		bloodpoolMax = 12;
	}
	if (selectedGeneration == 10) {
		bloodpoolMax = 13;
	}
	if (selectedGeneration == 9) {
		bloodpoolMax = 14;
	}
	if (selectedGeneration == 8) {
		bloodpoolMax = 15;
	}
	if (selectedGeneration == 7) {
		bloodpoolMax = 20;
	}
	if (selectedGeneration == 6) {
		bloodpoolMax = 30;
	}
	if (selectedGeneration == 5) {
		bloodpoolMax = 40;
	}
	if (selectedGeneration == 4) {
		bloodpoolMax = 50;
	}

	return bloodpoolMax;
}

function calculteMaxBloodSpend(selectedGeneration) {
	let bloodSpending = 1;

	if (selectedGeneration == 9) {
		bloodSpending = 2;
	}
	if (selectedGeneration == 8) {
		bloodSpending = 3;
	}
	if (selectedGeneration == 7) {
		bloodSpending = 4;
	}
	if (selectedGeneration == 6) {
		bloodSpending = 6;
	}
	if (selectedGeneration == 5) {
		bloodSpending = 8;
	}
	if (selectedGeneration == 4) {
		bloodSpending = 10;
	}

	return bloodSpending;
}

function calculteMaxTrait(selectedGeneration) {
	let traitMax = 5;

	if (selectedGeneration == 7) {
		traitMax = 6;
	}
	if (selectedGeneration == 6) {
		traitMax = 7;
	}
	if (selectedGeneration == 5) {
		traitMax = 8;
	}
	if (selectedGeneration == 4) {
		traitMax = 9;
	}

	return traitMax;
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
			const itemData = duplicate(item);

			if (itemData.system.max != parseInt(disciplineMax)) {
				itemData.system.max = parseInt(disciplineMax);
				await item.update(itemData);
			}
		}
		// disciplines and paths
		if ((item.type == "Power") && ((item.system.type == "wod.types.discipline") || (item.system.type == "wod.types.disciplinepath"))) {
			const itemData = duplicate(item);

			if (itemData.system.max != parseInt(disciplineMax)) {
				itemData.system.max = parseInt(disciplineMax);
				await item.update(itemData);
			}			
		}		
		// disipline powers and path powers
		if ((item.type == "Power") && (item.system.type == "wod.types.disciplinepower") || (item.system.type == "wod.types.disciplinepathpower")) {
			const itemData = duplicate(item);

			if (itemData.system.max != 0) {
				itemData.system.value = 0;
				itemData.system.max = 0;
				await item.update(itemData);
			}
		}
		// rituals
		if ((item.type == "Power") && (item.system.type == "wod.types.ritual")) {
			const itemData = duplicate(item);

			if (itemData.system.max != 0) {
				itemData.system.value = 0;
				itemData.system.max = 0;
				await item.update(itemData);
			}
		}
	}
}