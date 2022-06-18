import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js"

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
		
		console.log("WoD | Vampire Sheet constructor");
	}

	/** @override */
	getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.data.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.vampire) {
				ActionHelper._setVampireAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);
				ActionHelper._setVampireAttributes(actorData);

				actorData.data.settings.soak.lethal.isrollable = true;
				actorData.data.settings.soak.aggravated.isrollable = false;
				actorData.data.settings.iscreated = true;
				this.actor.update(actorData);
			}	 	
		}

		const data = super.getData();

		console.log("WoD | Vampire Sheet getData");

		const disciplinelist = [];
		const tempdisclist = [];
		const unlisteddisclist = [];
		let unlisted = false;

		const pathlist = [];
		const temppathlist = [];
		const unlistedpathlist = [];
		let unlistedpath = false;

		const rituallist = [];
		
		const templist = [];	
		const temp2list = [];

		for (const i of data.items) {
			if (i.type == "Power") {
				if (i.data.type == "wod.types.discipline") {
					tempdisclist.push(i);
				}
				if (i.data.type == "wod.types.disciplinepower") {
					if (i.data.parentid != "") {
						i.data.level = i.data.level.toString();
						templist.push(i);
					}
					else {
						unlisteddisclist.push(i);
						unlisted = true;
					}					
				}
				if (i.data.type == "wod.types.disciplinepath") {
					temppathlist.push(i);
				}
				if (i.data.type == "wod.types.disciplinepathpower") {
					if (i.data.parentid != "") {
						i.data.level = i.data.level.toString();
						temp2list.push(i);
					}
					else {
						unlistedpathlist.push(i);
						unlistedpath = true;
					}					
				}
				if (i.data.type == "wod.types.ritual") {
					rituallist.push(i);
				}
			}
		}

		tempdisclist.sort((a, b) => a.name.localeCompare(b.name));
		templist.sort((a, b) => a.data.level.localeCompare(b.data.level));	
		unlisteddisclist.sort((a, b) => a.name.localeCompare(b.name));	

		for (const discipline of tempdisclist) {
			disciplinelist.push(discipline);

			for (const power of templist) {
				if (power.data.parentid == discipline._id) {
					disciplinelist.push(power);
				}
			}
		}		

		data.actor.disciplinelist = disciplinelist;
		data.actor.listeddisciplines = tempdisclist;
		data.actor.unlisteddisciplines = unlisteddisclist;
		data.actor.hasunlisteddisciplines = unlisted;

		temppathlist.sort((a, b) => a.name.localeCompare(b.name));
		temp2list.sort((a, b) => a.data.level.localeCompare(b.data.level));	
		unlistedpathlist.sort((a, b) => a.name.localeCompare(b.name));	

		for (const path of temppathlist) {
			pathlist.push(path);

			for (const power of temp2list) {
				if (power.data.parentid == path._id) {
					pathlist.push(power);
				}
			}
		}

		data.actor.pathlist = pathlist;
		data.actor.listedpaths = temppathlist;
		data.actor.unlistedpaths = unlistedpathlist;
		data.actor.hasunlistedpaths = unlistedpath;

		data.actor.rituallist = rituallist.sort((a, b) => a.name.localeCompare(b.name));

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
		ActionHelper._setupDotCounters(html);

		console.log("WoD | Vampire Sheet activateListeners");

		// Resource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterVampireChange.bind(this));
		html
			.find(".resource-value > .resource-value-empty")
			.click(this._onDotCounterVampireEmpty.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterVampireChange.bind(this));
		html
			.find(".resource-counter > .resource-value-empty")
			.click(this._onDotCounterVampireEmpty.bind(this));

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

		actorData.data.virtues.conscience.label = "wod.advantages.virtue.conscience";
		actorData.data.virtues.selfcontrol.label = "wod.advantages.virtue.selfcontrol";
		actorData.data.virtues.courage.label = "wod.advantages.virtue.courage";

		if (selectedPath === "wod.advantages.path.blood") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
		}
		if (selectedPath === "wod.advantages.path.bones") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
		}
		if (selectedPath === "wod.advantages.path.caine") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.data.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.cathari") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.data.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.feralheart") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.data.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.accord") {
		}
		if (selectedPath === "wod.advantages.path.lilith") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.data.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.metamorphosis") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.data.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.night") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.data.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.paradox") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
		}
		if (selectedPath === "wod.advantages.path.innervoice") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
			actorData.data.virtues.selfcontrol.label = "wod.advantages.virtue.instinct";
		}
		if (selectedPath === "wod.advantages.path.typhon") {
			actorData.data.virtues.conscience.label = "wod.advantages.virtue.conviction";
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

		const selectedGeneration = parseInt(element.value);

		let traitMax = 5;
		let disciplineMax = traitMax;
		let bloodpoolMax = 10;
		let bloodSpending = 1;

		if (selectedGeneration == 15) {
			bloodpoolMax = 6;
			disciplineMax = 3;
		}
		if (selectedGeneration == 14) {
			bloodpoolMax = 8;
			disciplineMax = 4;
		}
		if (selectedGeneration == 13) {
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
			bloodSpending = 2;
		}
		if (selectedGeneration == 8) {
			bloodpoolMax = 15;
			bloodSpending = 3;
		}
		if (selectedGeneration == 7) {
			bloodpoolMax = 20;
			bloodSpending = 4;
			traitMax = 6;
			disciplineMax = traitMax;
		}
		if (selectedGeneration == 6) {
			bloodpoolMax = 30;
			bloodSpending = 6;
			traitMax = 7;
			disciplineMax = traitMax;
		}
		if (selectedGeneration == 5) {
			bloodpoolMax = 40;
			bloodSpending = 8;
			traitMax = 8;
			disciplineMax = traitMax;
		}
		if (selectedGeneration == 4) {
			bloodpoolMax = 50;
			bloodSpending = 10;
			traitMax = 9;
			disciplineMax = traitMax;
		}

		const actorData = duplicate(this.actor);

		// attributes max
		for (const i in actorData.data.attributes) {
			actorData.data.attributes[i].max = traitMax;

			if (actorData.data.attributes[i].value > traitMax) {
				actorData.data.attributes[i].value = traitMax;
			}
		}

		// ability max
		for (const i in actorData.data.abilities.talent) {
			actorData.data.abilities.talent[i].max = traitMax;

			if (actorData.data.abilities.talent[i].value > traitMax) {
				actorData.data.abilities.talent[i].value = traitMax;
			}
		}

		for (const i in actorData.data.abilities.skill) {
			actorData.data.abilities.skill[i].max = traitMax;

			if (actorData.data.abilities.skill[i].value > traitMax) {
				actorData.data.abilities.skill[i].value = traitMax;
			}
		}

		for (const i in actorData.data.abilities.knowledge) {
			actorData.data.abilities.knowledge[i].max = traitMax;

			if (actorData.data.abilities.knowledge[i].value > traitMax) {
				actorData.data.abilities.knowledge[i].value = traitMax;
			}
		}

		// virtues
		for (const i in actorData.data.virtues) {
			actorData.data.virtues[i].max = traitMax;

			if (actorData.data.virtues[i].value > traitMax) {
				actorData.data.virtues[i].value = traitMax;
				actorData.data.virtues[i].roll = traitMax;
			}

		}

		// blood pool
		actorData.data.bloodpool.max = bloodpoolMax;
		actorData.data.bloodpool.perturn = bloodSpending;

		if (actorData.data.bloodpool.temporary > bloodpoolMax) {
			actorData.data.bloodpool.temporary = bloodpoolMax;
		}

		// to recalculate total values
		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleVampireCalculations(actorData);

		console.log("WoD | Vampire Sheet updated");
		await this.actor.update(actorData);

		// discipline
		for (const item of this.actor.items) {
			if ((item.type == "Power") && (item.data.data.type == "wod.types.discipline")) {
				const itemData = duplicate(item);
				itemData.data.max = parseInt(traitMax);
				await item.update(itemData);
			}
			if ((item.type == "Power") && (item.data.data.type == "wod.types.disciplinepower")) {
				const itemData = duplicate(item);
				itemData.data.value = 0;
				itemData.data.max = 0;
				await item.update(itemData);
			}
		}
	}

	_onDotCounterVampireEmpty(event) {
		console.log("WoD | Vampire Sheet _onDotCounterVampireEmpty");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.vampire) {
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

		this._assignToVampire(fields, 0);			
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

		// updated item
		if (parent[0].dataset.itemid != undefined) {
			if (this.locked) {
				ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				return;
			}

			const itemid = parent[0].dataset.itemid;

			for (const item of this.actor.items) {
				if (item.data._id == itemid) {
					const itemData = duplicate(item);
					itemData.data.value = parseInt(index) + 1;
					await item.update(itemData);
					break;
				}
			}
		}
		// updated actor
		else {
			const fieldStrings = parent[0].dataset.name;
			const fields = fieldStrings.split(".");
			

			if ((this.locked) && ((fieldStrings != "data.data.bloodpool.temporary"))) {
				ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				return;
			}
			
			if (index < 0 || index > steps.length) {
				return;
			}

			this._assignToVampire(fields, index + 1);
		}
		
		steps.removeClass("active");
		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		});		
	}

	_assignToVampire(fields, value) {
		console.log("WoD |Vampire Sheet _assignToVampire");
		
		const actorData = duplicate(this.actor);

		if (fields[2] === "path") {
			actorData.data.path.value = value;
		}	
		else if (fields[2] === "virtues")	 {
			actorData.data.virtues[fields[3]].value = value;
		}
		else if (fields[2] === "bloodpool")	 {
			actorData.data.bloodpool.temporary = value;
		}
		
		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleVampireCalculations(actorData);
		
		console.log("WoD | Vampire Sheet updated");
		this.actor.update(actorData);
	}
}