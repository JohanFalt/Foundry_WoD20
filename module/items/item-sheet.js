import ActionHelper from "../scripts/action-helpers.js";

export class WoDItemSheet extends ItemSheet {
	
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["itemsheet"]
		});
	}

	constructor(item, options) {
		super(item, options);

		this.locked = false;
		this.isCharacter = false;	
		this.isGM = game.user.isGM;	
		
		console.log("WoD | Item Sheet constructor");
	}

	/** @override */
	get template() {
		let sheet = this.item.data.type;
		sheet = sheet.toLowerCase().replace(" ", "");

		return `systems/worldofdarkness/templates/sheets/${sheet}-sheet.html`;
	}

	/** @override */
	getData() {
		const itemData = duplicate(this.item);

		if (!itemData.data.iscreated) {
			itemData.data.version = game.data.system.data.version;
			itemData.data.iscreated = true;
			this.item.update(itemData);
		}

		if ((itemData.type == "Power") && ((itemData.data.type == "wod.types.discipline")||(itemData.data.type == "wod.types.disciplinepath"))) {
			itemData.data.isrollable = false;
			this.item.update(itemData);
		}

		const data = super.getData();

		data.config = CONFIG.wod;
		data.userpermissions = ActionHelper._getUserPermissions(game.user);

		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = game.user.isGM;	

		const imgUrl = getImage(data.item);

		if (imgUrl != "") {
			data.item.data.img = imgUrl;
		}

		console.log(data.item.type);
		console.log(data.item);
		
		return data;
	}

	/** @override */
	activateListeners(html) {
		console.log("WoD | Item Sheet activateListeners");
  
		super.activateListeners(html);

		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));
		html
			.find(".resource-value > .resource-value-empty")
			.click(this._onDotCounterEmpty.bind(this));

		html
			.find(".clearDiscipline")
			.click(this._clearDiscipline.bind(this));
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

		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		});

		this._assignToItemField(fields, index + 1);
	}

	_onDotCounterEmpty(event) {
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
		
		this._assignToItemField(fields, 0);
	}

	_clearDiscipline(event) {
		const itemData = duplicate(this.item);
		itemData.data.parentid = "";
		this.item.update(itemData);
		this.render(false);
	}

	_assignToItemField(fields, value) {
		const itemData = duplicate(this.item);		

		if (fields[1] === "spheres") {
			itemData.data[fields[2]] = value;
			this.item.update(itemData);
		}		
	}	
}

export function getImage(item) {
	if ((!item.data.img.startsWith("systems/")) && (!item.data.img.startsWith("icons/"))) {
		return "";
	}

	if (item.type == "Armor") {
		return "systems/worldofdarkness/assets/img/items/armor.svg";
	}

	if (item.type == "Fetish") {
		return "systems/worldofdarkness/assets/img/items/fetish.svg";
	}

	if ((item.type == "Melee Weapon") && (item.data.data.isnatural)) {
		return "systems/worldofdarkness/assets/img/items/naturalweapons.svg";
	}

	if ((item.type == "Melee Weapon") && (!item.data.data.isnatural)) {
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
		if ((item.data.data.type == "wod.types.discipline") || (item.data.data.type == "wod.types.disciplinepath")) {
			return "systems/worldofdarkness/assets/img/items/mainpower_vampire.svg";
		}

		if ((item.data.data.type == "wod.types.disciplinepower") || (item.data.data.type == "wod.types.disciplinepathpower")) {
			return "systems/worldofdarkness/assets/img/items/power_vampire.svg";
		}

		if (item.data.data.type == "wod.types.ritual") {
			return "systems/worldofdarkness/assets/img/items/ritual_vampire.svg";
		}

		if (item.data.data.type == "wod.types.gift") {
			return "systems/worldofdarkness/assets/img/items/power_werewolf.svg";
		}

		if (item.data.data.type == "wod.types.rite") {
			return "systems/worldofdarkness/assets/img/items/ritual_werewolf.svg";
		}

		return "systems/worldofdarkness/assets/img/items/power.svg";
	}

	if (item.type == "Rote") {
		return "systems/worldofdarkness/assets/img/items/rote_mage.svg";
	}

	return "";
}