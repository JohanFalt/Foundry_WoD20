import ActionHelper from "../scripts/action-helpers.js"

export class SpiritActorSheet extends ActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["spirit"],
			template: "systems/worldofdarkness/templates/actor/spirit-sheet.html",
			height: 790,
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

		console.log("WoD | Spirit Sheet constructor");

		this.locked = false;
		this.isCharacter = true;	
		this.isGM = game.user.isGM;	
	}	
	
	/** @override */
	get template() {
		console.log("WoD | Spirit Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/spirit-sheet.html";
	}
	
	/** @override */
	getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.data.settings.iscreated) {
			if (actorData.type == "Spirit") {
				actorData.data.settings.soak.lethal.isrollable = true;
				actorData.data.settings.soak.aggravated.isrollable = true;
				actorData.data.settings.iscreated = true;
				this.actor.update(actorData);
			}	 	
		}

		const data = super.getData();

		console.log("WoD | Spirit Sheet getData");

		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = this.isGM;

		data.dtypes = ["String", "Number", "Boolean"];

		const charmlist = [];
		const giftlist = [];
		const other = [];

        for (const i of data.items) {
			if (i.type == "Power") {
				if (i.data.type == "wod.types.charm") {
					charmlist.push(i);
				}
			}
			else {
				other.push(i);
			}
		}

		data.actor.charmlist = charmlist.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.giftlist = giftlist.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.other = other;	

		if (data.actor.type == "Spirit") {
			console.log("Spirit");
			console.log(data.actor);
		}	
		
		return data;
	}	

	/** @override */
	activateListeners(html) {
		console.log("WoD | Spirit Sheet activateListeners");
	  
		super.activateListeners(html);
		ActionHelper._setupDotCounters(html);

		// Rollable stuff
		html
			.find(".vrollable")
			.click(this._onRollSpiritDialog.bind(this));

		// ressource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));
		html
			.find(".resource-value > .resource-value-empty")
			.click(this._onDotCounterEmpty.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));
		html
			.find(".resource-counter > .resource-value-empty")
			.click(this._onDotCounterEmpty.bind(this));		

		html
			.find(".macroBtn")
			//.click(this._rollMacro.bind(this));	
			.click(this._onRollSpiritDialog.bind(this));		

		// skicka till chat
		html
			.find(".send-chat")
			.click(this._onSendChat.bind(this));
	}

	_onRollSpiritDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if ((dataset.label == "Rage") || (dataset.label == "Gnosis") || (dataset.label == "Willpower")) {
			// todo
			// helt ok!
		}
		else if (dataset.type != "Spirit") {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}

	_onSendChat(event) {
		const element = event.currentTarget;
		const message = element.dataset.message || "";
		const headline = element.dataset.headline || "";

		ActionHelper.printMessage(headline, message, this.actor);
	}

	// async _rollMacro(event) {
	// 	event.preventDefault();
	// 	const element = event.currentTarget;
	// 	const dataset = element.dataset;

	// 	const source = dataset.source;

	// 	if (source == "initiative") {
	// 		await ActionHelper.RollInitiative(event, this.actor);
	// 	}
	// 	if (source == "soak") {
	// 		await ActionHelper.RollSoak(event, this.actor);
	// 	}
	// 	if (source == "dices") {
	// 		await ActionHelper.RollDices(event, this.actor);
	// 	}
	// }

	_onDotCounterChange(event) {
		console.log("WoD | Spirit Sheet _onDotCounterChange");
		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if (index < 0 || index > steps.length) {
			return;
		}

		steps.removeClass("active");

		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		});

		this._assignToActorField(fields, index + 1);
	}

	_onDotCounterEmpty(event) {
		console.log("WoD | Spirit Sheet _onDotCounterEmpty");
		
		event.preventDefault();

		const element = event.currentTarget;
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-empty");

		steps.removeClass("active");
		
		steps.each(function (i) {
			if (i <= 0) {
				$(this).addClass("active");
			}
		});
		
		this._assignToActorField(fields, 0);
	}
	
 	/**
	* If any changes are done to the Actor values.
	*/
	_assignToActorField(fields, value) {
		console.log("WoD | Spirit Sheet _assignToActorField");
		
		const actorData = duplicate(this.actor);

		// update actor owned items
		if (fields.length === 2 && fields[0] === "items") {
			for (const i of actorData.items) {
				if (fields[1] === i._id) {
					i.data.points = value;
					break;
				}
			}
		}
		else if (fields[2] === "rage") {
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
		else if (fields[2] === "willpower") {
			if (fields[3] === "permanent") {
				actorData.data.willpower.permanent = value;
			}
			else {
				actorData.data.willpower.temporary = value;
			}
		}
		else if (fields[2] === "essence") {
			actorData.data.essence.temporary = value;
		}
		else {
    		const lastField = fields.pop();
			fields.reduce((data, field) => data[field], actorData)[lastField] = value;
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

		// willpower
		if (actorData.data.willpower.permanent > actorData.data.willpower.max) {
			actorData.data.willpower.permanent = actorData.data.willpower.max;
		}
		
		if (actorData.data.willpower.permanent < actorData.data.willpower.temporary) {
			actorData.data.willpower.temporary = actorData.data.willpower.permanent;
		}

		let advantageRollSetting = true;

		try {
			advantageRollSetting = CONFIG.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		if (advantageRollSetting) {
			actorData.data.rage.roll = actorData.data.rage.permanent; 
			actorData.data.gnosis.roll = actorData.data.gnosis.permanent;
			actorData.data.willpower.roll = actorData.data.willpower.permanent; 
		}
		else {
			actorData.data.rage.roll = actorData.data.rage.permanent > actorData.data.rage.temporary ? actorData.data.rage.temporary : actorData.data.rage.permanent; 
			actorData.data.gnosis.roll = actorData.data.gnosis.permanent > actorData.data.gnosis.temporary ? actorData.data.gnosis.temporary : actorData.data.gnosis.permanent;
			actorData.data.willpower.roll = actorData.data.willpower.permanent > actorData.data.willpower.temporary ? actorData.data.willpower.temporary : actorData.data.willpower.permanent; 
		}

		actorData.data.initiative.base = parseInt(actorData.data.willpower.permanent);
		actorData.data.initiative.total = parseInt(actorData.data.initiative.base) + parseInt(actorData.data.initiative.bonus);

		actorData.data.soak.bashing = parseInt(actorData.data.willpower.permanent);
		actorData.data.soak.lethal = parseInt(actorData.data.willpower.permanent);
		actorData.data.soak.aggravated = parseInt(actorData.data.willpower.permanent);
		
		console.log("WoD | Spirit Sheet updated");
		this.actor.update(actorData);
	}		
}