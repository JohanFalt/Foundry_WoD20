import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js"

export class WerewolfActorSheet extends MortalActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["werewolf"],
			template: "systems/worldofdarkness/templates/actor/werewolf-sheet.html",
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
		const actorData = duplicate(this.actor);

		if (!actorData.data.settings.created) {
			if (actorData.type == "Werewolf") {
				ActionHelper._setWerewolfAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);

				actorData.data.settings.soak.lethal.roll = true;
				actorData.data.settings.soak.aggravated.roll = true;
				actorData.data.settings.created = true;
				this.actor.update(actorData);
			}	 	
		}

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

					if (i.data.active) {
						powercombat.push(i);
					}
				}			
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 2)) {
					powerlist2.push(i);

					if (i.data.active) {
						powercombat.push(i);
					}
				}
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 3)) {
					powerlist3.push(i);

					if (i.data.active) {
						powercombat.push(i);
					}
				}
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 4)) {
					powerlist4.push(i);

					if (i.data.active) {
						powercombat.push(i);
					}
				}
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 5)) {
					powerlist5.push(i);

					if (i.data.active) {
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

		console.log("Werewolf");
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
			//console.log("WoD | Sheet locked aborts");	
			//ui.notifications.info('werewolf Can not edit as sheet is locked!');
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
			//console.log("WoD | Sheet locked aborts");	
			//ui.notifications.info('werewolf Can not edit as sheet is locked!');
			return;
		}
		if (fieldStrings == "data.data.willpower.permanent") {
			//console.log("WoD | Sheet click on permanent willpower aborts");	
			//ui.notifications.info('werewolf Can not edit as sheet is locked!');
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

		if ((fields[2] === "gnosis") || (fields[2] === "rage") || (fields[2] === "renown")) {
			this._assignToWerewolf(fields, index + 1);
		}
	}

	_onShiftForm(event) {
		console.log("WoD | Werewolf onShiftForm");

		event.preventDefault();

		const actorData = duplicate(this.actor);

		if (actorData.type != "Werewolf") {
			//console.log("WoD | Not Werewolf aborts");
			ui.notifications.info('Not Werewolf aborts!');
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
		ActionHelper.handleWerewolfCalculations(actorData);

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
		ActionHelper.handleWerewolfCalculations(actorData);
		
		console.log("WoD | Werewolf Sheet updated");
		this.actor.update(actorData);
	}	
}