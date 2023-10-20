import ActionHelper from "../scripts/action-helpers.js"
import CreateHelper from "../scripts/create-helpers.js";
import MessageHelper from "../scripts/message-helpers.js"

export class SpiritActorSheet extends ActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-sheet spirit"],
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

		this.locked = false;
		this.isCharacter = false;	
		ui.notifications.warn("The spirit sheet is deprecated, use Creature instead!", {permanent: false});
	}	
	
	/** @override */
	get template() {
		console.log("WoD | Spirit Sheet get template");
		
		return "systems/worldofdarkness/templates/actor/spirit-sheet.html";
	}
	
	/** @override */
	async getData() {
		const actorData = duplicate(this.actor);

		if (!actorData.system.settings.iscreated) {
			if (actorData.type == CONFIG.worldofdarkness.sheettype.spirit) {
				actorData.system.settings.iscreated = true;
				actorData.system.settings.version = game.data.system.version;

				await CreateHelper.SetSpiritAttributes(actorData);
				await this.actor.update(actorData);
			}	 	
		}

		const data = super.getData();

		data.config = CONFIG.worldofdarkness;		
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

		data.actor.system.listdata = [];
		data.actor.system.listdata.powers = [];
		data.actor.system.listdata.powers.charms = [];
		data.actor.system.listdata.powers.gifts = [];
		data.actor.system.listdata.powers.charms.charmlist = charmlist.sort((a, b) => a.name.localeCompare(b.name));
		data.actor.system.listdata.powers.gifts.giftlist = giftlist.sort((a, b) => a.name.localeCompare(b.name));

		data.actor.system.listdata.settings = [];
		data.actor.system.listdata.settings.haschimericalhealth = false;

		if (data.actor.type == CONFIG.worldofdarkness.sheettype.spirit) {
			console.log(CONFIG.worldofdarkness.sheettype.spirit);
			console.log(data.actor);
		}	
		
		return data;
	}	

	/** @override */
	activateListeners(html) {
		console.log("WoD | Spirit Sheet activateListeners");
	  
		super.activateListeners(html);
		ActionHelper.SetupDotCounters(html);

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

		// temporary squares
		html
			.find(".resource-counter > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));

		// items
		html
			.find('.item-create')
			.click(this._onItemCreate.bind(this));

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

		html
			.find(".createrCreature")
			.click(this.ConvertSpiritToCreature.bind(this));			
	}

	/**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
	async _onItemCreate(event) {
		event.preventDefault();

		const header = event.currentTarget;
		const type = header.dataset.type;
		const itemtype = header.dataset.itemtype;
		let itemData;

		if (itemtype == "Power") {
			if (type == "charm") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.charm")}`,
					type: itemtype,
					system: {
						type: "wod.types.charm"
					}
				};
			}
			if (type == "gift") {
				itemData = {
					name: `${game.i18n.localize("wod.labels.new.gift")}`,
					type: itemtype,
					system: {
						game: "werewolf",
						level: 1,
						type: "wod.types.gift"
					}
				};
			}
		}

		return await this.actor.createEmbeddedDocuments("Item", [itemData]);
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
		const item = await this.actor.getEmbeddedDocument("Item", itemId);		

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
		let item = await this.actor.getEmbeddedDocument("Item", itemId);

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

		await this.actor.deleteEmbeddedDocuments("Item", [itemId]);        
	}

	_onRollSpiritDialog(event) {		
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.key == "willpower") {
			// todo
			// helt ok!
		}
		else if (dataset.type != CONFIG.worldofdarkness.sheettype.spirit) {
			return;
		}

		ActionHelper.RollDialog(event, this.actor);
	}

	async _onSendChat(event) {
		const element = event.currentTarget;
		const itemid = element.dataset.itemid || "";
		let item = await this.actor.getEmbeddedDocument("Item", itemid);
		const headline = item.name;
		const description = item.system.description;
		const system = item.system.details;

		const templateData = {
			data: {
				actor: this.actor,
				type: "send",
				action: headline,
				message: "",
				description: description,
				system: system
			}
		};
	
		// Render the chat card template
		const template = `systems/worldofdarkness/templates/dialogs/roll-template.html`;
		const html = await renderTemplate(template, templateData);
	
		const chatData = {
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: html,
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			rollMode: game.settings.get("core", "rollMode")        
		};
		ChatMessage.applyRollMode(chatData, "roll");
		ChatMessage.create(chatData);
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
		else if (dataset.type != CONFIG.worldofdarkness.sheettype.spirit) {
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
		else if ((fields[1] === "rage") || (fields[1] === "gnosis") || (fields[1] === "willpower")) {
			if (actorData.system.advantages[fields[1]][fields[2]] == value) {
				actorData.system.advantages[fields[1]][fields[2]] = parseInt(actorData.system.advantages[fields[1]][fields[2]]) - 1;
			}
			else {
				actorData.system.advantages[fields[1]][fields[2]] = value;
			}
		}
		else if (fields[1] === "essence") {
			if (actorData.system.advantages.essence.temporary == value) {
				actorData.system.advantages.essence.temporary = parseInt(actorData.system.advantages.essence.temporary) - 1;
			}
			else {
				actorData.system.advantages.essence.temporary = value;
			}
		}
		else {
    		const lastField = fields.pop();
			fields.reduce((system, field) => system[field], actorData)[lastField] = value;
		}

		// rage
		if (actorData.system.advantages.rage.permanent > actorData.system.advantages.rage.max) {
			actorData.system.advantages.rage.permanent = actorData.system.advantages.rage.max;
		}
		
		if (actorData.system.advantages.rage.permanent < actorData.system.advantages.rage.temporary) {
			actorData.system.advantages.rage.temporary = actorData.system.advantages.rage.permanent;
		}
		
		// gnosis
		if (actorData.system.advantages.gnosis.permanent > actorData.system.advantages.gnosis.max) {
			actorData.system.advantages.gnosis.permanent = actorData.system.advantages.gnosis.max;
		}
		
		if (actorData.system.advantages.gnosis.permanent < actorData.system.advantages.gnosis.temporary) {
			actorData.system.advantages.gnosis.temporary = actorData.system.advantages.gnosis.permanent;
		}

		// willpower
		if (actorData.system.advantages.willpower.permanent > actorData.system.advantages.willpower.max) {
			actorData.system.advantages.willpower.permanent = actorData.system.advantages.willpower.max;
		}
		
		if (actorData.system.advantages.willpower.permanent < actorData.system.advantages.willpower.temporary) {
			actorData.system.advantages.willpower.temporary = actorData.system.advantages.willpower.permanent;
		}

		let advantageRollSetting = true;

		try {
			advantageRollSetting = CONFIG.worldofdarkness.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		if (advantageRollSetting) {
			actorData.system.advantages.rage.roll = actorData.system.advantages.rage.permanent; 
			actorData.system.advantages.gnosis.roll = actorData.system.advantages.gnosis.permanent;
			actorData.system.advantages.willpower.roll = actorData.system.advantages.willpower.permanent; 
		}
		else {
			actorData.system.advantages.rage.roll = actorData.system.advantages.rage.permanent > actorData.system.advantages.rage.temporary ? actorData.system.advantages.rage.temporary : actorData.system.advantages.rage.permanent; 
			actorData.system.advantages.gnosis.roll = actorData.system.advantages.gnosis.permanent > actorData.system.advantages.gnosis.temporary ? actorData.system.advantages.gnosis.temporary : actorData.system.advantages.gnosis.permanent;
			actorData.system.advantages.willpower.roll = actorData.system.advantages.willpower.permanent > actorData.system.advantages.willpower.temporary ? actorData.system.advantages.willpower.temporary : actorData.system.advantages.willpower.permanent; 
		}

		actorData.system.initiative.base = parseInt(actorData.system.advantages.willpower.permanent);
		actorData.system.initiative.total = parseInt(actorData.system.initiative.base) + parseInt(actorData.system.initiative.bonus);

		actorData.system.soak.bashing = parseInt(actorData.system.advantages.willpower.permanent);
		actorData.system.soak.lethal = parseInt(actorData.system.advantages.willpower.permanent);
		actorData.system.soak.aggravated = parseInt(actorData.system.advantages.willpower.permanent);
		
		console.log("WoD | Spirit Sheet updated");
		this.actor.update(actorData);
	}	
	
	async ConvertSpiritToCreature(event) {
		const actorData = duplicate(this.actor);

		try {
			let x = await Actor.create({
				name: actorData.name,
				type: "Creature",
				effects: actorData.effects,
				flags: actorData.flags,
				folder: actorData.folder,
				img: actorData.img,
				ownership: actorData.ownership
			});	  

			let newActor = game.actors.get(x._id);
			const newActorData = duplicate(newActor);
			await CreateHelper.SetCreatureVariant(newActorData, 'spirit');

			newActorData.system.advantages.rage.permanent = parseInt(actorData.system.advantages.rage.permanent);
			newActorData.system.advantages.rage.temporary = parseInt(actorData.system.advantages.rage.temporary);
			newActorData.system.advantages.rage.max = parseInt(actorData.system.advantages.rage.max);
			newActorData.system.advantages.rage.roll = parseInt(actorData.system.advantages.rage.roll);

			newActorData.system.advantages.gnosis.permanent = parseInt(actorData.system.advantages.gnosis.permanent);
			newActorData.system.advantages.gnosis.temporary = parseInt(actorData.system.advantages.gnosis.temporary);
			newActorData.system.advantages.gnosis.max = parseInt(actorData.system.advantages.gnosis.max);
			newActorData.system.advantages.gnosis.roll = parseInt(actorData.system.advantages.gnosis.roll);

			newActorData.system.advantages.willpower.permanent = parseInt(actorData.system.advantages.willpower.permanent);
			newActorData.system.advantages.willpower.temporary = parseInt(actorData.system.advantages.willpower.temporary);
			newActorData.system.advantages.willpower.max = parseInt(actorData.system.advantages.willpower.max);
			newActorData.system.advantages.willpower.roll = parseInt(actorData.system.advantages.willpower.roll);

			newActorData.system.advantages.essence.temporary = parseInt(actorData.system.advantages.essence.temporary);
			newActorData.system.advantages.essence.max = parseInt(actorData.system.advantages.essence.max);

			await newActor.update(newActorData);	
			
			for (const item of actorData.items) {
				if (item.type == "Power") {
					let itemData = duplicate(item);
					await newActor.createEmbeddedDocuments("Item", [itemData]);
				}
			}

			actorData.name = actorData.name + "_old";
			await this.actor.update(actorData);		  
		} 
		catch (error) {
			console.error('Error converting spirit:', error);
		}
	}
}