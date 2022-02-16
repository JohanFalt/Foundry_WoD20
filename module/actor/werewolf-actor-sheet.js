import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js"

export class WerewolfActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["werewolf"],
			template: "systems/worldofdarkness/templates/actor/werewolf-sheet.html",
			height: 940,
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "core",
			},
			{
				navSelector: ".sheet-spec-tabs",
				contentSelector: ".sheet-spec-body",
				initial: "normal",
			}]
		});
	}
  
	constructor(actor, options) {
		super(actor, options);
		
		console.log("WoD | Werewolf Sheet constructor");
	}

	/** @override */
	getData() {
		const data = super.getData();

		console.log("WoD | Werewolf Sheet getData");

		const powerlist1 = [];
		const powerlist2 = [];
		const powerlist3 = [];
		const powerlist4 = [];
		const powerlist5 = [];
		const powercombat = [];
		const ritelist = [];
		const other = [];
		let presentform = "";

		console.log("WoD | Werewolf Sheet handling shift data");

		if (data.actor.data.data.shapes.glabro.active) {
			presentform = data.actor.data.data.shapes.glabro.label;
		}
		else if (data.actor.data.data.shapes.crinos.active) {
			presentform = data.actor.data.data.shapes.crinos.label;
		}
		else if (data.actor.data.data.shapes.hispo.active) {
			presentform = data.actor.data.data.shapes.hispo.label;
		}
		else if (data.actor.data.data.shapes.lupus.active) {
			presentform = data.actor.data.data.shapes.lupus.label;
		}
		else {
			presentform = data.actor.data.data.shapes.homid.label;
		}

		console.log("WoD | Werewolf Sheet handling gift lists");

		for (const i of data.items) {
			if (i.type == "Power") {
				if ((i.data.type == "wod.types.gift") && (i.data.level == 1)) {
					powerlist1.push(i);

					if ((i.data.combat)&&(i.data.active)) {
						powercombat.push(i);
					}
				}			
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 2)) {
					powerlist2.push(i);

					if ((i.data.combat)&&(i.data.active)) {
						powercombat.push(i);
					}
				}
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 3)) {
					powerlist3.push(i);

					if ((i.data.combat)&&(i.data.active)) {
						powercombat.push(i);
					}
				}
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 4)) {
					powerlist4.push(i);

					if ((i.data.combat)&&(i.data.active)) {
						powercombat.push(i);
					}
				}
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 5)) {
					powerlist5.push(i);

					if ((i.data.combat)&&(i.data.active)) {
						powercombat.push(i);
					}
				}
				else if (i.data.type == "wod.types.rite") {
					ritelist.push(i);
				}
				else {
					other.push(i);
				}
			}
		}

		data.actor.presentform = presentform;
		data.actor.powerlist1 = powerlist1;
		data.actor.powerlist2 = powerlist2;
		data.actor.powerlist3 = powerlist3;
		data.actor.powerlist4 = powerlist4;
		data.actor.powerlist5 = powerlist5;
		data.actor.powercombat = powercombat;
		data.actor.ritelist = ritelist;

		data.actor.other = other;	

		console.log(data.actor);

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

		console.log("WoD | Werewolf Sheet activateListeners");
		
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterWerewolfChange.bind(this));
		html
			.find(".resource-value > .resource-value-empty")
			.click(this._onDotCounterWerewolfEmpty.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterWerewolfChange.bind(this));
		html
			.find(".resource-counter > .resource-value-empty")
			.click(this._onDotCounterWerewolfEmpty.bind(this));

		html
			.find(".resource-counter > .resource-value-empty")
			.click(this._onDotCounterWerewolfEmpty.bind(this));
		
		// shift form
		html
			.find(".shape-selector")
			.click(this._onShiftForm.bind(this));
	}
	
	_onDotCounterWerewolfEmpty(event) {
		console.log("WoD | Werewolf Sheet _onDotCounterEmpty");
		
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
		
		if ((fields[2] === "gnosis") || (fields[2] === "rage") || (fields[2] === "renown"))
		{
			this._assignToWerewolf(fields, 0);
		}
		else
		{
			this._onDotCounterEmpty(event);		
		}		
	}
	
	_onDotCounterWerewolfChange(event) {
		console.log("WoD | Werewolf Sheet _onDotCounterWerewolfChange");
		
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
				(fieldStrings != "data.data.gnosis.temporary") && 
				(fieldStrings != "data.data.glory.temporary") && 
				(fieldStrings != "data.data.honor.temporary") && 
				(fieldStrings != "data.data.wisdom.temporary"))) {
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

		if ((fields[2] === "gnosis") || (fields[2] === "rage") || (fields[2] === "renown"))
		{
			this._assignToWerewolf(fields, index + 1);
		}
		else
		{
			this._onDotCounterChange(event);
		}
	}

	_onShiftForm(event) {
		console.log("WoD | Werewolf onShiftForm");

		event.preventDefault();

		const actorData = duplicate(this.actor);

		if (actorData.type != "Werewolf") {
			console.log("WoD | Not Werewolf aborts");
			return
		}

		const element = event.currentTarget;
		const dataset = element.dataset;
		const fromForm = this.actor.presentform;
		const toForm = dataset.form;

		for (const i in actorData.data.shapes) {
			if (actorData.data.shapes[i].label == fromForm)  {
				actorData.data.shapes[i].active = false;
			}

			if (actorData.data.shapes[i].label == toForm) {
				actorData.data.shapes[i].active = true;
			}			
		}		

		ActionHelper.handleCalculations(actorData);
		this.handleWerewolfCalculations(actorData);

		console.log("WoD | Werewolf Sheet updated");
		this.actor.update(actorData);
	}
	
	_assignToWerewolf(fields, value) {
		console.log("WoD | Werewolf Sheet _assignToWerewolf");
		
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
		else if (fields[2] === "renown") {
			let renowntype = fields[3];

			if (renowntype === "rank") {
				actorData.data.renown[renowntype] = value;
			}
			else if (fields[4] === "permanent") {
				actorData.data.renown[renowntype].permanent = value;
			}
			else {
				actorData.data.renown[renowntype].temporary = value;
			}
		}
		
		ActionHelper.handleCalculations(actorData);
		this.handleWerewolfCalculations(actorData);
		
		console.log("WoD | Werewolf Sheet updated");
		this.actor.update(actorData);
	}	

	handleWerewolfCalculations(actorData) {
		console.log("WoD | Werewolf handleWerewolfCalculations");		

		// shift
		if ((!actorData.data.shapes.homid.active) &&
			(!actorData.data.shapes.glabro.active) &&
			(!actorData.data.shapes.crinos.active) &&
			(!actorData.data.shapes.hispo.active) &&
			(!actorData.data.shapes.lupus.active)) {
			actorData.data.shapes.homid.active = true;
		}

		// rage
		if (actorData.data.rage.permanent > actorData.data.rage.max) {
			actorData.data.rage.permanent = actorData.data.rage.max;
		}
		
		if (actorData.data.rage.permanent < actorData.data.rage.temporary) {
			actorData.data.rage.temporary = actorData.data.rage.permanent;
		}
		
		// gnosis
		if (actorData.data.gnosis.permanent > actorData.data.gnosis.max) {
			actorData.data.gnosis.permanent = actorData.data.gnosis.max;
		}
		
		if (actorData.data.gnosis.permanent < actorData.data.gnosis.temporary) {
			actorData.data.gnosis.temporary = actorData.data.gnosis.permanent;
		}

		actorData.data.rage.roll = actorData.data.rage.permanent > actorData.data.rage.temporary ? actorData.data.rage.temporary : actorData.data.rage.permanent; 
		actorData.data.gnosis.roll = actorData.data.gnosis.permanent > actorData.data.gnosis.temporary ? actorData.data.gnosis.temporary : actorData.data.gnosis.permanent; 

		console.log("WoD | Werewolf Sheet calculations done");
	}	
}

/*function handleWerewolfShiftCalculations(actorData, toForm) {
	// attributes totals
	for (const i in actorData.data.attributes) {
		const shift = handleWerewolfShiftAttributeData(actorData.data.attributes[i].label, toForm);
		//const shiftdiff = handleWerewolfShiftAbilityData(actorData.data.attributes[i], toForm);

		actorData.data.attributes[i].total = actorData.data.attributes[i].total + shift.value;
	}
}

function handleWerewolfShiftAttributeData(attribute, presentForm) {
	let data = {"type": attribute, "value": 0};

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.strength") {
			data = {"type": attribute, "value": 2};
		}

		if (attribute == "wod.attributes.stamina") {
			data = {"type": attribute, "value": 2};
		}

		if (attribute == "wod.attributes.manipulation") {
			data = {"type": attribute, "value": -2};
		}
	}		

	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = {"type": attribute, "value": 4};
		}

		if (attribute == "wod.attributes.dexterity") {
			data = {"type": attribute, "value": 1};
		}

		if (attribute == "wod.attributes.stamina") {
			data = {"type": attribute, "value": 3};
		}

		if (attribute == "wod.attributes.manipulation") {
			data = {"type": attribute, "value": -3};
		}
	}

	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.strength") {
			data = {"type": attribute, "value": 3};
		}

		if (attribute == "wod.attributes.dexterity") {
			data = {"type": attribute, "value": 2};
		}

		if (attribute == "wod.attributes.stamina") {
			data = {"type": attribute, "value": 3};
		}

		if (attribute == "wod.attributes.manipulation") {
			data = {"type": attribute, "value": -3};
		}
	}

	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = {"type": attribute, "value": 1};
		}

		if (attribute == "wod.attributes.dexterity") {
			data = {"type": attribute, "value": 2};
		}

		if (attribute == "wod.attributes.stamina") {
			data = {"type": attribute, "value": 2};
		}

		if (attribute == "wod.attributes.manipulation") {
			data = {"type": attribute, "value": -3};
		}
	}

	return data;
}

function handleWerewolfShiftAbilityData(attribute, presentForm) {
	let data = {"type": attribute, "value": 0};

	if (presentForm == "wod.shapes.glabro")
	{
	}		

	if (presentForm == "wod.shapes.crinos")
	{
	}

	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.wits") {
			data = {"type": attribute, "value": -1};
		}
	}

	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.wits") {
			data = {"type": attribute, "value": -2};
		}
	}

	return data;
}*/