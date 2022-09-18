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
		this.isCharacter = false;	
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

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.wod.sheettype.spirit) {
				actorData.system.settings.soak.bashing.isrollable = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
				actorData.system.settings.iscreated = true;
				this.actor.update(actorData);
			}	 	
		}

		const data = super.getData();

		data.config = CONFIG.wod;		
		data.userpermissions = ActionHelper._getUserPermissions(game.user);
		data.graphicsettings = ActionHelper._getGraphicSettings();

		console.log("WoD | Spirit Sheet getData");

		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = this.isGM;

		data.dtypes = ["String", "Number", "Boolean"];

		const charmlist = [];
		const giftlist = [];

        for (const i of data.items) {
			if (i.type == "Power") {
				if (i.system.type == "wod.types.charm") {
					charmlist.push(i);
				}
				if (i.system.type == "wod.types.gift") {
					giftlist.push(i);
				}
			}
		}

		data.actor.charmlist = charmlist.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.giftlist = giftlist.sort((a, b) => a.name.localeCompare(b.name));

		if (data.actor.type == CONFIG.wod.sheettype.spirit) {
			console.log(CONFIG.wod.sheettype.spirit);
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
		
		html
			.find(".macroBtn")
			.click(this._onRollSpiritDialog.bind(this));

		// ressource dots
		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));
		// html
		// 	.find(".resource-value > .resource-value-empty")
		// 	.click(this._onDotCounterEmpty.bind(this));

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));
		// html
		// 	.find(".resource-counter > .resource-value-empty")
		// 	.click(this._onDotCounterEmpty.bind(this));		

		// items
		// Edit Inventory Item
		html
			.find(".item-edit")
			.click(this._onItemEdit.bind(this));

		html
			.find(".item-delete")
			.click(this._onItemDelete.bind(this));

		// skicka till chat
		html
			.find(".send-chat")
			.click(this._onSendChat.bind(this));
	}

	async _onItemEdit(event) {
		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		var _a;
		event.preventDefault();
        event.stopPropagation();

		const itemId = $(event.currentTarget).data("item-id");
		const item = this.actor.getEmbeddedDocument("Item", itemId);		

		if (item instanceof Item) {
            (_a = item.sheet) === null || _a === void 0 ? void 0 : _a.render(true);
		}
	}

	async _onItemDelete(event) {
		if (this.locked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		event.preventDefault();
        event.stopPropagation();

		const itemId = $(event.currentTarget).data("item-id");
		let item = this.actor.getEmbeddedDocument("Item", itemId);

        if (!item)
            return;

        const performDelete = await new Promise((resolve) => {
            Dialog.confirm({
                title: game.i18n.format(game.i18n.localize("wod.labels.remove.item"), { name: item.name }),
                yes: () => resolve(true),
                no: () => resolve(false),
                content: game.i18n.format(game.i18n.localize("wod.labels.remove.removing") + " " + item.name, {
                    name: item.name,
                    actor: this.actor.name,
                }),
            });
        });

        if (!performDelete)
            return;

		console.log("WoD | Deleting item id: " + itemId);

		this.actor.deleteEmbeddedDocuments("Item", [itemId]);        
	}

	_onRollSpiritDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.key == "willpower") {
			// todo
			// helt ok!
		}
		else if (dataset.type != CONFIG.wod.sheettype.spirit) {
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

	_onDotCounterChange(event) {
		console.log("WoD | Spirit Sheet _onDotCounterChange");
		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.key == "willpower") {
			// todo
			// helt ok!
		}
		else if (dataset.type != CONFIG.wod.sheettype.spirit) {
			return;
		}

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

	// _onDotCounterEmpty(event) {
	// 	console.log("WoD | Spirit Sheet _onDotCounterEmpty");
		
	// 	event.preventDefault();

	// 	const element = event.currentTarget;
	// 	const parent = $(element.parentNode);
	// 	const fieldStrings = parent[0].dataset.name;
	// 	const fields = fieldStrings.split(".");
	// 	const steps = parent.find(".resource-value-empty");

	// 	steps.removeClass("active");
		
	// 	steps.each(function (i) {
	// 		if (i <= 0) {
	// 			$(this).addClass("active");
	// 		}
	// 	});
		
	// 	this._assignToActorField(fields, 0);
	// }
	
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
					i.system.points = value;
					break;
				}
			}
		}
		else if ((fields[2] === "rage") || (fields[2] === "gnosis") || (fields[2] === "willpower")) {
			if (actorData.system[fields[2]][fields[3]] == value) {
				actorData.system[fields[2]][fields[3]] = parseInt(actorData.system[fields[2]][fields[3]]) - 1;
			}
			else {
				actorData.system[fields[2]][fields[3]] = value;
			}
		}
		// else if (fields[2] === "rage") {
		// 	if (fields[3] === "permanent") {
		// 		actorData.system.rage.permanent = value;
		// 	}
		// 	else {
		// 		actorData.system.rage.temporary = value;
		// 	}

		// }
		// else if (fields[2] === "gnosis") {
		// 	if (fields[3] === "permanent") {
		// 		actorData.system.gnosis.permanent = value;
		// 	}
		// 	else {
		// 		actorData.system.gnosis.temporary = value;
		// 	}
		// }
		// else if (fields[2] === "willpower") {
		// 	if (fields[3] === "permanent") {
		// 		actorData.system.willpower.permanent = value;
		// 	}
		// 	else {
		// 		actorData.system.willpower.temporary = value;
		// 	}
		// }
		else if (fields[2] === "essence") {
			if (actorData.system.essence.temporary == value) {
				actorData.system.essence.temporary = parseInt(actorData.system.essence.temporary) - 1;
			}
			else {
				actorData.system.essence.temporary = value;
			}
		}
		else {
    		const lastField = fields.pop();
			fields.reduce((system, field) => system[field], actorData)[lastField] = value;
		}

		// rage
		if (actorData.system.rage.permanent > actorData.system.rage.max) {
			actorData.system.rage.permanent = actorData.system.rage.max;
		}
		
		if (actorData.system.rage.permanent < actorData.system.rage.temporary) {
			actorData.system.rage.temporary = actorData.system.rage.permanent;
		}
		
		// gnosis
		if (actorData.system.gnosis.permanent > actorData.system.gnosis.max) {
			actorData.system.gnosis.permanent = actorData.system.gnosis.max;
		}
		
		if (actorData.system.gnosis.permanent < actorData.system.gnosis.temporary) {
			actorData.system.gnosis.temporary = actorData.system.gnosis.permanent;
		}

		// willpower
		if (actorData.system.willpower.permanent > actorData.system.willpower.max) {
			actorData.system.willpower.permanent = actorData.system.willpower.max;
		}
		
		if (actorData.system.willpower.permanent < actorData.system.willpower.temporary) {
			actorData.system.willpower.temporary = actorData.system.willpower.permanent;
		}

		let advantageRollSetting = true;

		try {
			advantageRollSetting = CONFIG.wod.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		if (advantageRollSetting) {
			actorData.system.rage.roll = actorData.system.rage.permanent; 
			actorData.system.gnosis.roll = actorData.system.gnosis.permanent;
			actorData.system.willpower.roll = actorData.system.willpower.permanent; 
		}
		else {
			actorData.system.rage.roll = actorData.system.rage.permanent > actorData.system.rage.temporary ? actorData.system.rage.temporary : actorData.system.rage.permanent; 
			actorData.system.gnosis.roll = actorData.system.gnosis.permanent > actorData.system.gnosis.temporary ? actorData.system.gnosis.temporary : actorData.system.gnosis.permanent;
			actorData.system.willpower.roll = actorData.system.willpower.permanent > actorData.system.willpower.temporary ? actorData.system.willpower.temporary : actorData.system.willpower.permanent; 
		}

		actorData.system.initiative.base = parseInt(actorData.system.willpower.permanent);
		actorData.system.initiative.total = parseInt(actorData.system.initiative.base) + parseInt(actorData.system.initiative.bonus);

		actorData.system.soak.bashing = parseInt(actorData.system.willpower.permanent);
		actorData.system.soak.lethal = parseInt(actorData.system.willpower.permanent);
		actorData.system.soak.aggravated = parseInt(actorData.system.willpower.permanent);
		
		console.log("WoD | Spirit Sheet updated");
		this.actor.update(actorData);
	}		
}