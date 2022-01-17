export class WoDItemSheet extends ItemSheet {
	
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			/*classes: [],
			template: "systems/worldofdarkness/templates/actor/mortal-sheet.html",
			height: 700,
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "core",
			}],*/
		});
	}

	/** @override */
	get template() {
		let sheet = this.item.data.type;
		sheet = sheet.toLowerCase().replace(" ", "");

		return `systems/worldofdarkness/templates/sheets/${sheet}-sheet.html`;
	}

	getData() {
		const data = super.getData();
		const ItemData = data.item.data;

		data.config = CONFIG.wod;

		console.log(ItemData);

		return data;
	}
	
}