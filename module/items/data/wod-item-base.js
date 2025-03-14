/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class WoDItem extends Item {

    /**
   * Augment the basic Item data model with additional dynamic data.
   */
    prepareData() {
        super.prepareData();
    }

    /**
   * @override
   * Handle data that happens before the creation of a new item document
  */
    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);
        // if (!data.img || data.img == "icons/svg/item-bag.svg") {
        //   this.updateSource({ img: CONFIG.exaltedthird.itemIcons[data.type] }); 
        // }
    }

    /**
   * @override
   * Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.
   * @param data - The initial data object provided to the document creation request
   * @param options - Additional options which modify the creation request
   * @param userId - The id of the User requesting the document update
  */
    async _onCreate(data, options, userId) {
        await super._onCreate(data, options, userId);
    }

    async _preUpdate(updateData, options, user) {
        await super._preUpdate(updateData, options, user);
        //const equipmentChart = CONFIG.exaltedthird.equipmentStats;
        //const artifactEquipmentChart = CONFIG.exaltedthird.artifactEquipmentStats;        
    }

	static migrateData(source) {
	    source = super.migrateData(source)
	    //if (source.type === "badType") source.type = "goodType"
	    return source;
	}
}