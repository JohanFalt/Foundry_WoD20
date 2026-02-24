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

    async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		
		try {
			const updates = {};

			// Ensure system object exists in updates
			if (!data.system) {
				data.system = {};
			}

			if (!data.system.iscreated) {
				updates["system.iscreated"] = true;
				updates["system.version"] = game.data.system.version;

				if (data.type === "Ability") {
					if (!data.system.id || data.system.id === "") {
						updates["system.id"] = (data.name || "").toLowerCase().replace(/\s+/g, '');
					}
					if (!data.system.type || data.system.type === "") {
						updates["system.type"] = "wod.abilities.ability";
					}
				}	
				
				if ((data.type === "Advantage") && (options?.parent !== null) && (options?.parent !== undefined)) {
					updates["system.settings.order"] = options.parent.items.filter(i => i.type === "Advantage").length;
				}		

				const imgUrl = _getImage(data);
				if (imgUrl != "") {
					updates.img = imgUrl;
				}

				// Apply updates using updateSource (Foundry v10+)
				if (Object.keys(updates).length > 0) {
					this.updateSource(updates);
				}
			}
		}
		catch (err) {
			err.message = `Failed _preCreate Item ${data?.name}: ${err.message}`;
			console.error(err);
		}
	}

	async _onCreate(data, options, userId) {
		await super._onCreate(data, options, userId);
	}

	async _preUpdate(updateData, options, user) {
		try {
			if (!updateData.system) {
				updateData.system = {};
			}

			if (updateData.type === "Ability") {
				updateData = await this._handleAbilitiesCalculations(updateData);
			}

			if (updateData.type === "Advantage") {
				updateData = await this._handleAdvantagesCalculations(updateData);
			}                

			if (updateData.type === "Sphere") {
				updateData = await this._handlePowerCalculations(updateData);
			}  

			if (updateData.type === "Power") {
				updateData = await this._handlePowerCalculations(updateData);
			} 

			// Call super._preUpdate to allow parent class to process
			return await super._preUpdate(updateData, options, user);
		}
		catch (err) {
			ui.notifications.error(`Cannot update Item ${updateData.name}. Please check console for details.`);
			err.message = `Cannot update Item ${updateData.name}: ${err.message}`;
			console.error(err);
			console.log(updateData);
			return false; // Prevent update if there's an error
		}
	}

	async _onUpdate(updateData, options, user) {
		await super._onUpdate(updateData, options, user);
	}

	static migrateData(source) {
	    source = super.migrateData(source)
	    //if (source.type === "badType") source.type = "goodType"
	    return source;
	}

	async _handleAbilitiesCalculations(itemData) {
        try {
            const item = this;
			let actor = null;
			
			if ((item.actor !== undefined) && (item.actor !== null)) {
				actor = game.actors.get(item.actor._id);

				if (actor === undefined) {
					actor = item.actor;
				}
			}

			let traitMax = 5;

			if (actor !== null) {
				traitMax = actor.system.settings.abilities.defaultmaxvalue;
			}

			if (itemData.system.max === traitMax) {
				return itemData;
			}

            itemData.system.max = traitMax;

			if (itemData.system.value > traitMax) {
				itemData.system.value = traitMax;
			}
        }
        catch (err) {
            err.message = `Failed _handleAbilitiesCalculations Item ${item.name}: ${err.message}`;
            console.error(err);
        }

        return itemData;
    }

    async _handleAdvantagesCalculations(itemData) {
        try {
			const item = this;
			let actor = null;
			
			if ((item.actor !== undefined) && (item.actor !== null)) {
				actor = game.actors.get(item.actor._id);
			}

            let traitMax = 5;
			// let bloodpoolMax = 10;
			// let bloodSpending = 1;
			let advantageRollSetting = true;  

			try {
                advantageRollSetting = CONFIG.worldofdarkness.rollSettings;
            } 
            catch (e) {
                advantageRollSetting = true;
            }


			if (actor !== null) {
				traitMax = actor.system.settings.powers.defaultmaxvalue;
			}

			if ((itemData.system?.id === "willpower") && (actor !== null)) {
			 	if ((CONFIG.worldofdarkness.attributeSettings === "5th") && (CONFIG.worldofdarkness.fifthEditionWillpowerSetting === "5th") && (actor !== null)) {
					if (actor.system.settings.variant !== "spirit") {
						itemData.system.permanent = parseInt(actor.system.attributes.composure.value) + parseInt(actor.system.attributes.resolve.value);
					}			 		
			 	}
			}

			if (itemData.system?.group == "virtue") {       
				itemData.system.max = traitMax;
			}

			if (itemData.system?.id == "path") {          
				let bearing = 0;

				if (itemData.system.permanent <= 1) {
					bearing = 2;
				}
				else if ((itemData.system.permanent >= 2) && (itemData.system.permanent <= 3)) {
					bearing = 1;
				}
				else if ((itemData.system.permanent >= 4) && (itemData.system.permanent <= 7)) {
					bearing = 0;
				}
				else if ((itemData.system.permanent >= 8) && (itemData.system.permanent <= 9)) {
					bearing = -1;
				}
				else if (itemData.system.permanent == 10) {
					bearing = -2;
				}

				itemData.system.bearing = bearing;
			} 

			if ((itemData.system?.settings?.usepermanent) && (itemData.system?.settings?.usetemporary)) {
			 	if (itemData.system.permanent > itemData.system.max) {
			 	    itemData.system.permanent = itemData.system.max;
			 	}
				
			 	if ((itemData.system.permanent < itemData.system.temporary) && (!itemData.system.settings.highertemporary)) {
			 	    itemData.system.temporary = itemData.system.permanent;
			 	}
			}

			// Set roll for advantages that use roll
			if (itemData.system?.settings?.useroll) {
				itemData.system.roll = 0;

			 	if ((itemData.system.settings.usepermanent) && (itemData.system.settings.usetemporary)) {
					if (itemData.system.settings.usebothrolls) {
						itemData.system.roll = itemData.system.permanent + itemData.system.temporary;
					}
			 		else if (advantageRollSetting) {
			 			itemData.system.roll = itemData.system.permanent;
			 		}
			 		else if ((itemData.system.settings.usepermanent) && (itemData.system.settings.usetemporary)) {
			 			itemData.system.roll = itemData.system.permanent > itemData.system.temporary ? itemData.system.temporary : itemData.system.permanent; 
			 		}
			 	}
			 	else if (itemData.system.settings.usepermanent) {
			 		itemData.system.roll = itemData.system.permanent;
			 	}
			 	else if (itemData.system.settings.usetemporary) {
			 		itemData.system.roll = itemData.system.temporary;
			 	}
			} 
        }
        catch (err) {
            err.message = `Failed _handleAdvantagesCalculations Item ${itemData.name}: ${err.message}`;
            console.error(err);
        }				

        return itemData;
    }

	async _handlePowerCalculations(itemData) {
        try {
            const item = this;			
			let actor = null;
			
			if ((item.actor !== undefined) && (item.actor !== null)) {
				actor = game.actors.get(item.actor._id);
			}

			let traitMax = 5;

			if (actor !== null) {
				traitMax = actor.system.settings.powers.defaultmaxvalue;
			}

			if (itemData.system.max === traitMax) {
				return itemData;
			}

            itemData.system.max = traitMax;

			if (itemData.system.value > traitMax) {
				itemData.system.value = traitMax;
			}
        }
        catch (err) {
            err.message = `Failed _handlePowerCalculations Item ${item.name}: ${err.message}`;
            console.error(err);
        }

        return itemData;
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

	if (item.type == "Splat") {
		return "systems/worldofdarkness/assets/img/items/skills.svg";
	}

	if (item.type == "Ability") {
		return "systems/worldofdarkness/assets/img/items/feature.svg";
	}

	if (item.type == "Advantage") {
		return "systems/worldofdarkness/assets/img/items/feature.svg";
	}

	if (item.type == "Sphere") {
		return "systems/worldofdarkness/assets/img/items/mainpower_mage.svg";
	}

	if (item.type == "Power") {
		if ((item.system.type == "wod.types.discipline") /*|| (item.system.type == "wod.types.disciplinepath")*/) {
			return "systems/worldofdarkness/assets/img/items/mainpower_vampire.svg";
		}

		if ((item.system.type == "wod.types.disciplinepower") /*|| (item.system.type == "wod.types.disciplinepathpower")*/ || (item.system.type == "wod.types.combination")) {
			return "systems/worldofdarkness/assets/img/items/power_vampire.svg";
		}

		if ((item.system.type == "wod.types.ritual") && (item.system.game == CONFIG.worldofdarkness.sheettype.vampire.toLowerCase())) {
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