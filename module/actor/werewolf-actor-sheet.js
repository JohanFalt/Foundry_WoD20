import { MortalActorSheet } from "./mortal-actor-sheet.js";

export class WerewolfActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["werewolf"],
			template: "systems/worldofdarkness/templates/actor/werewolf-sheet.html",
			height: 870,
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "core",
			}],
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

		const shiftmods = [];
		const shiftdiffs = [];
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

		for (const i in data.config.attributes) {
			const shiftmod = handleWerewolfShiftAttributeData(data.config.attributes[i], presentform);
			shiftmods.push(shiftmod);
		}		

		for (const i in data.config.attributes) {
			const shiftdiff = handleWerewolfShiftAbilityData(data.config.attributes[i], presentform);
			shiftdiffs.push(shiftdiff);
		}

		data.actor.presentform = presentform;
		data.actor.shiftmods = shiftmods;
		data.actor.shiftdiffs = shiftdiffs;

		return data;
	}

	/** @override */
	get template() {
		console.log("WoD | Werewolf Sheet get template");
		
		//if (!game.user.isGM && this.actor.limited)
		//	return "systems/worldofdarkness/templates/actor/limited-sheet.html";
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
			if (actorData.data.shapes[i].label == toForm)
			{
				actorData.data.shapes[i].active = true;
			}

			if (actorData.data.shapes[i].label == fromForm)
			{
				actorData.data.shapes[i].active = false;
			}
		}

		this.handleCalculations(actorData);

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

			if (fields[4] === "permanent") {
				actorData.data.renown[renowntype].permanent = value;
			}
			else {
				actorData.data.renown[renowntype].temporary = value;
			}
		}
		
		this.handleWerewolfCalculations(actorData);
		
		console.log("WoD | Werewolf Sheet updated");
		this.actor.update(actorData);
	}	

	handleWerewolfCalculations(actorData) {
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
}

