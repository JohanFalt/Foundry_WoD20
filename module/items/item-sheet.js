import ActionHelper from "../scripts/action-helpers.js";
import BonusHelper from "../scripts/bonus-helpers.js"
import SelectHelper from "../scripts/select-helpers.js"

export class WoDItemSheet extends ItemSheet {
	
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: [`wod20 wod-item`]
		});
	}

	constructor(item, options) {
		super(item, options);

		this.locked = true;
		this.isCharacter = false;	
		this.isGM = game.user.isGM;	
		this.game = game;
	}

	/** @override */
	get template() {
		let sheet = this.item.type;
		sheet = sheet.toLowerCase().replace(" ", "");

		return `systems/worldofdarkness/templates/sheets/${sheet}-sheet.html`;
	}

	/** @override */
	async getData() {
		const itemData = foundry.utils.duplicate(this.item);		

		if (!itemData.system.iscreated) {
			itemData.system.version = game.data.system.version;
			itemData.system.iscreated = true;
			this.item.update(itemData);
		}

		if (itemData.type == "Bonus") {
			if ((itemData.name == game.i18n.localize("wod.labels.new.bonus")) && (itemData.system.type != "")) {
				itemData.name = game.i18n.localize(CONFIG.worldofdarkness.bonus[itemData.system.type]);
				await this.item.update(itemData);
			}
		}

		const data = await super.getData();

		data.config = CONFIG.worldofdarkness;
		data.worldofdarkness = game.worldofdarkness;
		data.userpermissions = ActionHelper._getUserPermissions(game.user);
		data.graphicsettings = ActionHelper._getGraphicSettings();
		data.listData = SelectHelper.SetupItem(this.item);

		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = game.user.isGM;	
		data.canEdit = this.item.isOwner || game.user.isGM;		

		if (this.item.actor != null) {
			data.hasActor = true;
			data.actor = this.item.actor;
		}
		else {
			data.hasActor = false;
		}

		data.showClearText = false;

		const imgUrl = getImage(data.item);

		if (this.item.sheetType == undefined) {
			data.sheettype = "";
		}
		else if (this.item.sheetType != CONFIG.worldofdarkness.sheettype.changingbreed) {
            data.sheettype = this.item.sheetType.toLowerCase() + "Item";
        }
        else {
            data.sheettype = "werewolfItem";
        }

		if (imgUrl != "") {
			data.item.img = imgUrl;
		}		

		if ((data.item.system.type == "wod.types.apocalypticform") && (data.hasActor)) {
			const items = [];	

			for (const i of this.actor.items) {
				if ((i.type == "Bonus") && (i.system.parentid == data.item._id)) {
					items.push(i);
				}
			}

			data.bonus = items;
		}		

		if (data.item.system?.description != undefined) {
			data.item.system.description = await TextEditor.enrichHTML(data.item.system.description, {async: true});
		}
		if (data.item.system?.details != undefined) {
			data.item.system.details = await TextEditor.enrichHTML(data.item.system.details, {async: true});
		}

		console.log(data.item.type);
		console.log(data.item);

		if (data.bonus != undefined) {
			console.log("Connected bonus traits");
			console.log(data.value);
		}
		
		return data;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// lock button
		html
			.find(".lock-btn")
			.click(this._onToggleLocked.bind(this));

		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));

		html
            .find('.item-bonusvalue-button')
            .click(this._setBonus.bind(this));

		html
            .find('.dialog-attribute-button')
            .click(this._setAttribute.bind(this));

		html
            .find('.item-property')
            .click(this._setProperty.bind(this));

		// items
		html
			.find(".item-create")
			.click(this._onItemCreate.bind(this));

		html
			.find(".item-edit")
			.click(this._onItemEdit.bind(this));

		html
			.find(".item-delete")
			.click(this._onItemDelete.bind(this));
	}

	async _onToggleLocked(event) {
		event.preventDefault();

		this.locked = !this.locked;

		this._render();
	}

	async _setBonus(event) {
        event.preventDefault();

        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".item-bonusvalue-button");
        const bonus = element.value;   

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == bonus) {
                $(this).addClass("active");
            }
        });

		const itemData = foundry.utils.duplicate(this.item);
		itemData.system.value = parseInt(bonus);
		await this.item.update(itemData);
		this.render();
    }

	async _setAttribute(event) {
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-attribute-button");
        const attribute = element.value;

		steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == attribute) {
                $(this).addClass("active");
            }
        });

		const itemData = foundry.utils.duplicate(this.item);
		itemData.system.settingtype = attribute;
		await this.item.update(itemData);
		this.render();
    }

	async _setProperty(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		const type = dataset.type;
		const game = dataset.game;
		const id = dataset.typeid;
		const itemData = foundry.utils.duplicate(this.item);
		
		if (type == "combination") {
			if (itemData.system.property[id] != undefined) {
				var e = document.getElementById("combination_name_"+id);
				const discipline = e.value;

				e = document.getElementById("combination_rating_"+id);
				const rating = e.value;

				let property = {
					discipline: discipline,
					value: parseInt(rating)
				}

				itemData.system.property[id] = property;
				await this.item.update(itemData);
				this.render();
				return;
			}
			/* else {
				ui.notifications.error(`Property row on item do not exist, rowId: ${id}`);
			} */
		}	

		return;		
	}

	async _onItemCreate(event) {
		event.preventDefault();

		const type = $(event.currentTarget).data("type");
		const game = $(event.currentTarget).data("game");
		const itemData = foundry.utils.duplicate(this.item);

		if ((type == "combination") && (game == "vampire")) {
			let property = {
				discipline: "",
				value: 0
			}
			itemData.system.property.push(property);
		}	
		if (type == "bonus") {
			let bonus = {
				name: "",
				settingtype: "",
				type: "",
				value: 0,
				isactive: this.item.system.isactive
			}

			itemData.system.bonuslist.push(bonus);			
		}

		await this.item.update(itemData);
		this.render();
	}

	async _onItemEdit(event) {
		event.preventDefault();
        event.stopPropagation();

		const type = $(event.currentTarget).data("type");
		const id = $(event.currentTarget).data("id");	
		
		if (type == "bonus") {
			await BonusHelper.EditBonus(this.actor, this.item, id);
		}

		this.render();
	}

	async _onItemDelete(event) {
		event.preventDefault();

		if (this.locked) {
			ui.notifications.warn(this.game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		const itemId = $(event.currentTarget).data("item-id");
		const type = $(event.currentTarget).data("type");

		if (type == "bonus") {
			const itemData = foundry.utils.duplicate(this.item);
			itemData.system.bonuslist.splice(itemId, 1);
			await this.item.update(itemData);
		}
		else if (type == "combination") {
			const itemData = foundry.utils.duplicate(this.item);
			itemData.system.property.splice(itemId, 1);
			await this.item.update(itemData);
		}
		
		this.render();  
	}

	_onDotCounterChange(event) {
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

		if (fields[1] === "spheres") {
			const itemData = foundry.utils.duplicate(this.item);
			
			if ((itemData.system[fields[2]] == 1) && (index == 0)) {
				this._assignToItemField(fields, 0);

				return;
			}
		}
		
		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		});

		this._assignToItemField(fields, index + 1);
	}

	_assignToItemField(fields, value) {
		const itemData = foundry.utils.duplicate(this.item);		

		if (fields[1] === "spheres") {
			itemData.system[fields[2]] = value;
			this.item.update(itemData);
		}		
	}	
}

export function getImage(item) {
	if ((!item.img.startsWith("systems/")) && (!item.img.startsWith("icons/"))) {
		return "";
	}

	if (item.type == "Armor") {
		return "systems/worldofdarkness/assets/img/items/armor.svg";
	}

	if (item.type == "Fetish") {
		return "systems/worldofdarkness/assets/img/items/fetish.svg";
	}

	if (item.type == "Item") {
		
	}

	if ((item.type == "Melee Weapon") && (item.system.isnatural)) {
		return "systems/worldofdarkness/assets/img/items/naturalweapons.svg";
	}

	if ((item.type == "Melee Weapon") && (!item.system.isnatural)) {
		return "systems/worldofdarkness/assets/img/items/meleeweapons.svg";
	}

	if (item.type == "Ranged Weapon") {
		return "systems/worldofdarkness/assets/img/items/rangedweapons.svg";
	}

	if (item.type == "Feature") {
		return "systems/worldofdarkness/assets/img/items/feature.svg";
	}

	if (item.type == "Experience") {
		return "systems/worldofdarkness/assets/img/items/feature.svg";
	}

	if (item.type == "Power") {
		if ((item.system.type == "wod.types.discipline") || (item.system.type == "wod.types.disciplinepath")) {
			return "systems/worldofdarkness/assets/img/items/mainpower_vampire.svg";
		}

		if ((item.system.type == "wod.types.disciplinepower") || (item.system.type == "wod.types.disciplinepathpower")) {
			return "systems/worldofdarkness/assets/img/items/power_vampire.svg";
		}

		if ((item.system.type == "wod.types.ritual") && (item.system.game == "vampire")) {
			return "systems/worldofdarkness/assets/img/items/ritual_vampire.svg";
		}

		if (item.system.type == "wod.types.art") {
			return "systems/worldofdarkness/assets/img/items/mainpower_changeling.svg";
		}

		if (item.system.type == "wod.types.artpower") {
			return "systems/worldofdarkness/assets/img/items/power_changeling.svg";
		}

		if (item.system.type == "wod.types.edge") {
			return "systems/worldofdarkness/assets/img/items/mainpower_hunter.svg";
		}

		if (item.system.type == "wod.types.edgepower") {
			return "systems/worldofdarkness/assets/img/items/power_hunter.svg";
		}

		if (item.system.type == "wod.types.lore") {
			return "systems/worldofdarkness/assets/img/items/mainpower_demon.svg";
		}

		if (item.system.type == "wod.types.lorepower") {
			return "systems/worldofdarkness/assets/img/items/power_demon.svg";
		}

		if (item.system.type == "wod.types.arcanoi") {
			return "systems/worldofdarkness/assets/img/items/mainpower_wraith.svg";
		}

		if (item.system.type == "wod.types.arcanoipower") {
			return "systems/worldofdarkness/assets/img/items/power_wraith.svg";
		}

		if ((item.system.type == "wod.types.ritual") && (item.system.game == "demon")) {
			return "systems/worldofdarkness/assets/img/items/ritual_demon.svg";
		}

		if (item.system.type == "wod.types.gift") {
			return "systems/worldofdarkness/assets/img/items/power_werewolf.svg";
		}

		if (item.system.type == "wod.types.rite") {
			return "systems/worldofdarkness/assets/img/items/ritual_werewolf.svg";
		}

		return "systems/worldofdarkness/assets/img/items/power.svg";
	}

	if (item.type == "Rote") {
		return "systems/worldofdarkness/assets/img/items/rote_mage.svg";
	}

	return "";
}
