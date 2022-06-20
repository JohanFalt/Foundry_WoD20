import { MortalActorSheet } from "./mortal-actor-sheet.js";
import ActionHelper from "../scripts/action-helpers.js";
// import { Frenzy } from "../dialogs/dialog-checkfrenzy.js";
// import { DialogCheckFrenzy } from "../dialogs/dialog-checkfrenzy.js";

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
		
		console.log("WoD | Werewolf Sheet constructor");
	}

	/** @override */
	getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.data.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.werewolf) {
				ActionHelper._setWerewolfAbilities(actorData);
				ActionHelper._setMortalAttributes(actorData);
				ActionHelper._setWerewolfAttributes(actorData);

				actorData.data.settings.soak.lethal.isrollable = true;
				actorData.data.settings.soak.aggravated.isrollable = true;
				actorData.data.settings.iscreated = true;
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
		const powerlist6 = [];
		const powercombat = [];
		const ritelist = [];
		const fetishlist = [];
		const talenlist = [];
		const other = [];
		let presentform = "";

		console.log("WoD | Werewolf Sheet handling shift data");

		if (data.actor.data.data.shapes.glabro.isactive) {
			presentform = data.actor.data.data.shapes.glabro.label;
		}
		else if (data.actor.data.data.shapes.crinos.isactive) {
			presentform = data.actor.data.data.shapes.crinos.label;
		}
		else if (data.actor.data.data.shapes.hispo.isactive) {
			presentform = data.actor.data.data.shapes.hispo.label;
		}
		else if (data.actor.data.data.shapes.lupus.isactive) {
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

					if (i.data.isactive) {
						powercombat.push(i);
					}
				}			
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 2)) {
					powerlist2.push(i);

					if (i.data.isactivee) {
						powercombat.push(i);
					}
				}
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 3)) {
					powerlist3.push(i);

					if (i.data.isactive) {
						powercombat.push(i);
					}
				}
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 4)) {
					powerlist4.push(i);

					if (i.data.isactive) {
						powercombat.push(i);
					}
				}
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 5)) {
					powerlist5.push(i);

					if (i.data.isactive) {
						powercombat.push(i);
					}
				}
				else if ((i.data.type == "wod.types.gift") && (i.data.level == 6)) {
					powerlist6.push(i);

					if (i.data.isactive) {
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
			if (i.type == "Fetish") {
				if (i.data.type == "wod.types.fetish") {
					fetishlist.push(i);
				}
				else if (i.data.type == "wod.types.talen") {
					talenlist.push(i);
				}	
				else {
					other.push(i);
				}
			}
			
		}

		data.actor.presentform = presentform;
		data.actor.powerlist1 = powerlist1.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.powerlist2 = powerlist2.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.powerlist3 = powerlist3.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.powerlist4 = powerlist4.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.powerlist5 = powerlist5.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.powerlist6 = powerlist6.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.powercombat = powercombat.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.ritelist = ritelist.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.fetishlist = fetishlist.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.talenlist = talenlist.sort((a, b) => a.name.localeCompare(b.name));

		data.actor.other = other;	

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
		ActionHelper._setupDotCounters(html);

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

	_onRollWerewolfDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type != CONFIG.wod.sheettype.werewolf) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}
	
	_onDotCounterWerewolfEmpty(event) {
		console.log("WoD | Werewolf Sheet _onDotCounterEmpty");
		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const type = dataset.type;

		if (type != CONFIG.wod.sheettype.werewolf) {
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

		this._assignToWerewolf(fields, 0);			
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
				((fieldStrings != "data.data.rage.temporary") && 
				(fieldStrings != "data.data.gnosis.temporary") && 
				(fieldStrings != "data.data.glory.temporary") && 
				(fieldStrings != "data.data.honor.temporary") && 
				(fieldStrings != "data.data.wisdom.temporary"))) {
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

	_onShiftForm(event) {
		console.log("WoD | Werewolf onShiftForm");

		event.preventDefault();

		const actorData = duplicate(this.actor);

		if (actorData.type != CONFIG.wod.sheettype.werewolf) {
			return
		}

		const element = event.currentTarget;
		const dataset = element.dataset;
		const fromForm = this.actor.presentform;
		const toForm = dataset.form;

		for (const i in actorData.data.shapes) {
			if (actorData.data.shapes[i].label == fromForm)  {
				actorData.data.shapes[i].isactive = false;
			}

			if (actorData.data.shapes[i].label == toForm) {
				actorData.data.shapes[i].isactive = true;
			}			
		}		

		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWerewolfCalculations(actorData);

		console.log("WoD | Werewolf Sheet updated");
		this.actor.update(actorData);
	}
	
	_assignToWerewolf(fields, value) {
		console.log("WoD | Werewolf Sheet _assignToWerewolf");
		
		const actorData = duplicate(this.actor);

		if ((fields[2] === "rage") || (fields[2] === "gnosis")) {
			if (fields[3] === "permanent") {
				actorData.data[fields[2]].permanent = value;
			}
			else {
				actorData.data[fields[2]].temporary = value;
			}
		}		
		// else if (fields[2] === "gnosis") {
		// 	if (fields[3] === "permanent") {
		// 		actorData.data.gnosis.permanent = value;
		// 	}
		// 	else {
		// 		actorData.data.gnosis.temporary = value;
		// 	}
		// }
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
		
		ActionHelper._handleCalculations(actorData);
		ActionHelper.handleWerewolfCalculations(actorData);
		
		console.log("WoD | Werewolf Sheet updated");
		this.actor.update(actorData);
	}	
}