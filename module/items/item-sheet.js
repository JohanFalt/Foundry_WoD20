export class WoDItemSheet extends ItemSheet {
	
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["itemsheet"]
		});
	}

	constructor(item, options) {
		super(item, options);

		this.locked = true;
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
		const data = super.getData();

		data.config = CONFIG.wod;
		data.config.attributeSettings = CONFIG.attributeSettings;
		data.config.rollSettings = CONFIG.rollSettings;
		data.config.handleOnes = CONFIG.handleOnes;
		data.isGM = game.user.isGM;	

		if (data.item.locked == undefined) {
			data.item.locked = true;
		}		

		const imgUrl = getImage(data.item);

		if (imgUrl != "") {
			data.item.data.img = imgUrl;
		}

		console.log(data.item);
		
		return data;
	}

	/** @override */
	activateListeners(html) {
		console.log("WoD | Item Sheet activateListeners");
  
		super.activateListeners(html);

		// lock button
		html
			.find(".lock-btn")
			.click(this._onToggleLocked.bind(this));

		html
			.find(".resource-value > .resource-value-step")
			.click(this._onDotCounterChange.bind(this));
		html
			.find(".resource-value > .resource-value-empty")
			.click(this._onDotCounterEmpty.bind(this));
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

		this._assignToActorField(fields, index + 1);
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
		
		this._assignToActorField(fields, 0);
	}

	_onToggleLocked(event) {
		event.preventDefault();
		this.item.locked = !this.item.locked;
		this._render();
	}

	_assignToActorField(fields, value) {
		const itemData = duplicate(this.item);

		if (fields[1] === "spheres") {
			itemData.data[fields[2]] = value;
			this.item.update(itemData);
		}		
	}	
}

function getImage(item) {
	if ((!item.data.img.startsWith("systems/")) && (!item.data.img.startsWith("icons/"))) {
		return "";
	}

	if (item.type == "Armor") {
		return "systems/worldofdarkness/assets/img/items/armor.svg";
	}

	if (item.type == "Fetish") {
		return "systems/worldofdarkness/assets/img/items/fetish.svg";
	}

	if ((item.type == "Melee Weapon") && (item.data.data.natural)) {
		return "systems/worldofdarkness/assets/img/items/naturalweapons.svg";
	}

	if ((item.type == "Melee Weapon") && (!item.data.data.natural)) {
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
		return "systems/worldofdarkness/assets/img/items/power.svg";
	}

	if (item.type == "Rote") {
		return "systems/worldofdarkness/assets/img/items/rote.svg";
	}

	return "";
}