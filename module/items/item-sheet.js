export class WoDItemSheet extends ItemSheet {
	
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["itemsheet"]
		});
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
		const ItemData = data.item.data;

		data.config = CONFIG.wod;
		data.config.attributeSettings = CONFIG.attributeSettings;
		data.config.rollSettings = CONFIG.rollSettings;
		data.config.handleOnes = CONFIG.handleOnes;
		data.isGM = game.user.isGM;	

		if (data.item.locked == undefined) {
			data.item.locked = true;
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
	}

	_onToggleLocked(event) {
		event.preventDefault();
		this.item.locked = !this.item.locked;
		this._render();
	}
}