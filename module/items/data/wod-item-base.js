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
        //    this.updateSource({ img: CONFIG.exaltedthird.itemIcons[data.type] }); 
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

        try {
            let data = foundry.utils.duplicate(this);

            const imgUrl = _getImage(data);

            if (imgUrl != "") {
                data.img = imgUrl;

                await this.update(data);
            }	
        }
        catch (err) {
            err.message = `Failed _onCreate Item ${data.name}: ${err.message}`;
            console.error(err);
        } 
    }

	async _onUpdate(updateData, options, user) {
		super._onUpdate(updateData, options, user);   
		let item;

		try {
			item = this;
			let updated = false;
			updateData = foundry.utils.duplicate(item);

			// if (updateData.type == "Power") {
			// 	const imgUrl = _getImage(updateData);

			// 	if (updateData.img.startsWith('systems/worldofdarkness/')) {
			// 		updateData.img = imgUrl;
			// 		updated = true;
			// 	}            
			// }

			if (updateData?.flags?.copyFile !== undefined) {
				updateData.flags.copyFile = null;
				updated = true;
			}

			if (updated) {
				//updateData.system.settings.isupdated = true;
				await item.update(updateData);
			}				
		}
		catch (err) {
			ui.notifications.error(`Cannot update Item ${item?.name}. Please check console for details.`);
			err.message = `Cannot update Item ${item?.name}: ${err.message}`;
			console.error(err);
			console.log(item);
		}
	}

	static migrateData(source) {
	    source = super.migrateData(source)
	    //if (source.type === "badType") source.type = "goodType"
	    return source;
	}
}

function _getImage(item) {
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

		if ((item.system.type == "wod.types.disciplinepower") || (item.system.type == "wod.types.disciplinepathpower") || (item.system.type == "wod.types.combination")) {
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

		if ((item.system.type == "wod.types.arcanoi")||(item.system.type == "wod.types.stain")||(item.system.type == "wod.types.horror")) {
			return "systems/worldofdarkness/assets/img/items/mainpower_wraith.svg";
		}

		if (item.system.type == "wod.types.arcanoipower") {
			return "systems/worldofdarkness/assets/img/items/power_wraith.svg";
		}

		if (item.system.type == "wod.types.hekau") {
			return "systems/worldofdarkness/assets/img/items/mainpower_mummy.svg";
		}

		if (item.system.type == "wod.types.hekaupower") {
			return "systems/worldofdarkness/assets/img/items/power_mummy.svg";
		}

		if ((item.system.type == "wod.types.exaltedcharm") || (item.system.type == "wod.types.exaltedsorcery")) {
			return "systems/worldofdarkness/assets/img/items/power_exalted.svg";
		}

		if (item.system.type == "wod.types.numina") {
			return "systems/worldofdarkness/assets/img/items/mainpower_mage.svg";
		}

		if (item.system.type == "wod.types.numinapower") {
			return "systems/worldofdarkness/assets/img/items/power_mage.svg";
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