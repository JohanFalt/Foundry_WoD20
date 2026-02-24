import * as BonusDialog from "../dialogs/dialog-bonus.js";

export default class BonusHelper {
    /**
     * Retrieves all bonus items from a list that match a specific parent id
     * @param {Array} itemList - The list of items to search through
     * @param {string} id - Parent id to match against
     * @returns {Array} List of bonus items that match the parent id
     */
    static getBonuses(itemList, id) {
        let bonusList = [];

        for (const i of itemList) {
            if ((i.type == "Bonus") && (i.system.parentid == id)) {
                bonusList.push(i);
            }
        }

        return bonusList;
    }

    /**
     * Creates an attribute difference bonus item that modifies an attribute
     * @param {string} id - Parent id for the bonus item
     * @param {string} name - Name of the bonus item
     * @param {string} attribute - The attribute to modify
     * @param {number} value - The bonus value (can be negative)
     * @param {boolean} isactive - Whether the bonus is active or not
     * @param {string} version - Version of the bonus item
     * @returns {Object} ItemData object for attribute difference bonus
     */
    static async CreateAttributeDiff(id, name, attribute, value, isactive, version) {
        let itemData;

        itemData = {
            name: name,
            type: "Bonus",				
            system: {
                parentid: id,
                settingtype: attribute,
                type: "attribute_diff",
                value: value,
                isactive: isactive,
                version: version
            }
        };

        return itemData;
    }

    /**
     * Creates an attribute buff bonus item that adds bonus to an attribute
     * @param {string} id - Parent id for the bonus item
     * @param {string} name - Name of the bonus item
     * @param {string} attribute - The attribute to receive bonus
     * @param {number} value - The bonus value
     * @param {boolean} isactive - Whether the bonus is active or not
     * @param {string} version - Version of the bonus item
     * @returns {Object} ItemData object for attribute buff bonus
     */
    static async CreateAttributeBuff(id, name, attribute, value, isactive, version) {
        let itemData;

        itemData = {
            name: name,
            type: "Bonus",				
            system: {
                parentid: id,
                settingtype: attribute,
                type: "attribute_buff",
                value: value,
                isactive: isactive,
                version: version
            }
        };

        return itemData;
    }

    /**
     * Creates an attribute fixed value bonus item that sets an attribute to a specific value
     * @param {string} id - Parent id for the bonus item
     * @param {string} name - Name of the bonus item
     * @param {string} attribute - The attribute to set to fixed value
     * @param {number} value - The fixed value
     * @param {boolean} isactive - Whether the bonus is active or not
     * @param {string} version - Version of the bonus item
     * @returns {Object} ItemData object for attribute fixed value bonus
     */
    static async CreateAttributeFixedValue(id, name, attribute, value, isactive, version) {
        let itemData;

        itemData = {
            name: name,
            type: "Bonus",				
            system: {
                parentid: id,
                settingtype: attribute,
                type: "attribute_fixed_value",
                value: value,
                isactive: isactive,
                version: version
            }
        };

        return itemData;
    }

    /**
     * Creates an ability buff bonus item that adds bonus to an ability
     * @param {string} id - Parent id for the bonus item
     * @param {string} name - Name of the bonus item
     * @param {string} ability - The ability to receive bonus
     * @param {number} value - The bonus value
     * @param {boolean} isactive - Whether the bonus is active or not
     * @param {string} version - Version of the bonus item
     * @returns {Object} ItemData object for ability buff bonus
     */
    static async CreateAbilityBuff(id, name, ability, value, isactive, version) {
        let itemData;

        itemData = {
            name: name,
            type: "Bonus",				
            system: {
                parentid: id,
                settingtype: ability,
                type: "ability_buff",
                value: value,
                isactive: isactive,
                version: version
            }
        };

        return itemData;
    }

    /**
     * Creates an attack buff bonus item that adds bonus to attack
     * @param {string} id - Parent id for the bonus item
     * @param {string} name - Name of the bonus item
     * @param {number} value - The bonus value
     * @param {boolean} isactive - Whether the bonus is active or not
     * @param {string} version - Version of the bonus item
     * @returns {Object} ItemData object for attack buff bonus
     */
    static async CreateAttackBuff(id, name, value, isactive, version) {
        let itemData;

        itemData = {
            name: name,
            type: "Bonus",				
            system: {
                parentid: id,
                type: "attack_buff",
                value: value,
                isactive: isactive,
                version: version
            }
        };

        return itemData;
    }

    /**
     * Creates an attack difference bonus item that modifies attack
     * @param {string} id - Parent id for the bonus item
     * @param {string} name - Name of the bonus item
     * @param {number} value - The bonus value (can be negative)
     * @param {boolean} isactive - Whether the bonus is active or not
     * @param {string} version - Version of the bonus item
     * @returns {Object} ItemData object for attack difference bonus
     */
    static async CreateAttackDiff(id, name, value, isactive, version) {
        let itemData;

        itemData = {
            name: name,
            type: "Bonus",				
            system: {
                parentid: id,
                type: "attack_diff",
                value: value,
                isactive: isactive,
                version: version
            }
        };

        return itemData;
    }

    /**
     * Creates a soak buff bonus item that adds bonus to soak
     * @param {string} id - Parent id for the bonus item
     * @param {string} name - Name of the bonus item
     * @param {number} value - The bonus value
     * @param {boolean} isactive - Whether the bonus is active or not
     * @param {string} version - Version of the bonus item
     * @returns {Object} ItemData object for soak buff bonus
     */
    static async CreateSoakBuff(id, name, value, isactive, version) {
        let itemData;

        itemData = {
            name: name,
            type: "Bonus",				
            system: {
                parentid: id,
                type: "soak_buff",
                value: value,
                isactive: isactive,
                version: version,
                settingtype: 'all'
            }
        };

        return itemData;
    }

    /**
     * Creates a soak difference bonus item that modifies soak
     * @param {string} id - Parent id for the bonus item
     * @param {string} name - Name of the bonus item
     * @param {number} value - The bonus value (can be negative)
     * @param {boolean} isactive - Whether the bonus is active or not
     * @param {string} version - Version of the bonus item
     * @returns {Object} ItemData object for soak difference bonus
     */
    static async CreateSoakDiff(id, name, value, isactive, version) {
        let itemData;

        itemData = {
            name: name,
            type: "Bonus",				
            system: {
                parentid: id,
                type: "soak_diff",
                value: value,
                isactive: isactive,
                version: version
            }
        };

        return itemData;
    }

    /**
     * Creates a frenzy buff bonus item that adds bonus to frenzy
     * @param {string} id - Parent id for the bonus item
     * @param {string} name - Name of the bonus item
     * @param {number} value - The bonus value
     * @param {boolean} isactive - Whether the bonus is active or not
     * @param {string} version - Version of the bonus item
     * @returns {Object} ItemData object for frenzy buff bonus
     */
    static async CreateFrenzyBuff(id, name, value, isactive, version) {
        let itemData;

        itemData = {
            name: name,
            type: "Bonus",				
            system: {
                parentid: id,
                type: "frenzy_buff",
                value: value,
                isactive: isactive,
                version: version
            }
        };

        return itemData;
    }

    /**
     * Creates a frenzy difference bonus item that modifies frenzy
     * @param {string} id - Parent id for the bonus item
     * @param {string} name - Name of the bonus item
     * @param {number} value - The bonus value (can be negative)
     * @param {boolean} isactive - Whether the bonus is active or not
     * @param {string} version - Version of the bonus item
     * @returns {Object} ItemData object for frenzy difference bonus
     */
    static async CreateFrenzyDiff(id, name, value, isactive, version) {
        let itemData;

        itemData = {
            name: name,
            type: "Bonus",				
            system: {
                parentid: id,
                type: "frenzy_diff",
                value: value,
                isactive: isactive,
                version: version
            }
        };

        return itemData;
    }

    /**
     * Checks if an actor has an active attribute difference bonus for a specific attribute
     * @param {Object} actor - The actor to check
     * @param {string} attribute - The attribute to check
     * @returns {boolean} True if the actor has an active attribute difference bonus, otherwise false
     */
    static async CheckAttributeBonus(actor, attribute) {
        if (attribute === "") {
            return false;
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_diff") && (i.system.settingtype == attribute)) {
				return true;
			}
            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attribute_diff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == attribute)) {
                        return true;
                    }
				}
			}
		}

        return false;
    } 
    
    /**
     * Checks if an actor has an active attribute buff bonus for a specific attribute
     * @param {Object} actor - The actor to check
     * @param {string} attribute - The attribute to check
     * @returns {boolean} True if the actor has an active attribute buff bonus, otherwise false
     */
    static async CheckAttributeBuff(actor, attribute) {
        if (attribute === "") {
            return false;
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_buff") && (i.system.settingtype == attribute)) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attribute_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == attribute)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    /**
     * Checks if an actor has an active attribute fixed value bonus for a specific attribute
     * @param {Object} actor - The actor to check
     * @param {string} attribute - The attribute to check
     * @returns {boolean} True if the actor has an active attribute fixed value bonus, otherwise false
     */
    static async CheckAttributeFixedValue(actor, attribute) {
        if (attribute === "") {
            return false;
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_fixed_value") && (i.system.settingtype == attribute)) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attribute_fixed_value") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == attribute)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    /**
     * Checks if an actor has an active attribute dice buff bonus for a specific attribute
     * @param {Object} actor - The actor to check
     * @param {string} attribute - The attribute to check
     * @returns {boolean} True if the actor has an active attribute dice buff bonus, otherwise false
     */
    static async CheckAttributeDiceBuff(actor, attribute) {
        if (attribute === "") {
            return false;
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_dice_buff") && (i.system.settingtype == attribute)) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attribute_dice_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == attribute)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    /**
     * Checks if an actor has an active attribute auto buff bonus for a specific attribute
     * @param {Object} actor - The actor to check
     * @param {string} attribute - The attribute to check
     * @returns {boolean} True if the actor has an active attribute auto buff bonus, otherwise false
     */
    static async CheckAttributeAutoBuff(actor, attribute) {
        if (attribute === "") {
            return false;
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_auto_buff") && (i.system.settingtype == attribute)) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attribute_auto_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == attribute)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }    

    /**
     * Checks if an actor has an active ability difference bonus for a specific ability
     * @param {Object} actor - The actor to check
     * @param {string} ability - The ability to check
     * @returns {boolean} True if the actor has an active ability difference bonus, otherwise false
     */
    static async CheckAbilityDiff(actor, ability) {
        if (ability === "") {
            return false;
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_diff") && (i.system.settingtype == ability)) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x]?.type == "ability_diff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == ability)) {
                        return true;
                    }

                    if ((i.system.bonuslist[x]?.type == "ability_diff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.talents[ability])) {
                        return true;
                    }

                    if ((i.system.bonuslist[x]?.type == "ability_diff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.skills[ability])) {
                        return true;
                    }

                    if ((i.system.bonuslist[x]?.type == "ability_diff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.knowledges[ability])) {
                        return true;
                    }
				}
			}
		}

        return false;
    } 
    
    /**
     * Checks if an actor has an active ability buff bonus for a specific ability
     * @param {Object} actor - The actor to check
     * @param {string} ability - The ability to check
     * @returns {boolean} True if the actor has an active ability buff bonus, otherwise false
     */
    static async CheckAbilityBuff(actor, ability) {
        if (ability === "") {
            return false;
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_buff") && (i.system.settingtype == ability)) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "ability_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == ability)) {
                        return true;
                    }

                    if ((i.system.bonuslist[x]?.type == "ability_buff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.talents[ability])) {
                        return true;
                    }

                    if ((i.system.bonuslist[x]?.type == "ability_buff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.skills[ability])) {
                        return true;
                    }

                    if ((i.system.bonuslist[x]?.type == "ability_buff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.knowledges[ability])) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    /**
     * Checks if an actor has an active attack difference bonus for a specific weapon type
     * @param {Object} actor - The actor to check
     * @param {string} weapontype - The weapon type to check
     * @returns {boolean} True if the actor has an active attack difference bonus, otherwise false
     */
    static async CheckAttackDiff(actor, weapontype) {
        if (weapontype === "") {
            return false;
        }

        if (weapontype === "Melee Weapon")  {
            weapontype = "TYPES.Item.Melee Weapon";
        }
        if (weapontype === "Ranged Weapon")  {
            weapontype = "TYPES.Item.Ranged Weapon";
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attack_diff") && (i.system.settingtype == weapontype)) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x]?.type == "attack_diff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == weapontype)) {
                        return true;
                    }
				}
			}
		}

        return false;
    } 
    
    /**
     * Checks if an actor has an active attack buff bonus for a specific weapon type
     * @param {Object} actor - The actor to check
     * @param {string} weapontype - The weapon type to check
     * @returns {boolean} True if the actor has an active attack buff bonus, otherwise false
     */
    static async CheckAttackBuff(actor, weapontype) {
        if (weapontype === "") {
            return false;
        }

        if (weapontype === "Melee Weapon")  {
            weapontype = "TYPES.Item.Melee Weapon";
        }
        if (weapontype === "Ranged Weapon")  {
            weapontype = "TYPES.Item.Ranged Weapon";
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attack_buff") && (i.system.settingtype == weapontype)) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attack_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == weapontype)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    /**
     * Checks if an actor has an active initiative buff bonus
     * @param {Object} actor - The actor to check
     * @returns {boolean} True if the actor has an active initiative buff bonus, otherwise false
     */
    static async CheckInitiativeBuff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "initiative_buff")) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "initiative_buff") && (i.system.bonuslist[x].isactive)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    /**
     * Checks if an actor has an active soak buff bonus
     * @param {Object} actor - The actor to check
     * @param {string} damagetype - The damage type to check (optional)
     * @returns {boolean} True if the actor has an active soak buff bonus, otherwise false
     */
    static async CheckSoakBuff(actor, damagetype="") {
        for (const i of actor.items) {
            if (damagetype !== "") {
                if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_buff") && (i.system.settingtype == damagetype)) {
                    return true;
                }
            }
            else {
                if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_buff")) {
                    return true;
                }
            }			

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
                for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if (damagetype !== "") {
                        if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_buff") && (i.system.settingtype == damagetype)) {
                            return true;
                        }
                    }
                    else {
                        if ((i.system.bonuslist[x].type == "soak_buff") && (i.system.bonuslist[x].isactive)) {
                            return true;
                        }
                    }
				}
			}
		}

        return false;
    }

    /**
     * Checks if an actor has an active soak difference bonus
     * @param {Object} actor - The actor to check
     * @returns {boolean} True if the actor has an active soak difference bonus, otherwise false
     */
    static async CheckSoakDiff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_diff")) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "soak_diff") && (i.system.bonuslist[x].isactive)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    /**
     * Checks if an actor has an active frenzy difference bonus
     * @param {Object} actor - The actor to check
     * @returns {boolean} True if the actor has an active frenzy difference bonus, otherwise false
     */
    static async CheckFrenzyDiff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "frenzy_diff")) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x]?.type == "frenzy_diff") && (i.system.bonuslist[x]?.isactive)) {
                        return true;
                    }
				}
			}
		}

        return false;
    } 
    
    /**
     * Checks if an actor has an active frenzy buff bonus
     * @param {Object} actor - The actor to check
     * @returns {boolean} True if the actor has an active frenzy buff bonus, otherwise false
     */
    static async CheckFrenzyBuff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "frenzy_buff")) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "frenzy_buff") && (i.system.bonuslist[x].isactive)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    /**
     * Checks if an actor has an active health level buff bonus
     * @param {Object} actor - The actor to check
     * @returns {boolean} True if the actor has an active health level buff bonus, otherwise false
     */
    static async CheckHealthlevelsBuff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "health_buff")) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "health_buff") && (i.system.bonuslist[x].isactive)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    /**
     * Checks if an actor has an active movement buff bonus for a specific movement type
     * @param {Object} actor - The actor to check
     * @param {string} movementtype - The movement type to check
     * @returns {boolean} True if the actor has an active movement buff bonus, otherwise false
     */
    static async CheckMovementBuff(actor, movementtype) {
        if (movementtype === "") {
            return false;
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "movement_buff") && (i.system.settingtype == movementtype)) {
				return true;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "movement_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == movementtype)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    /**
     * Gets the total value of all active attribute difference bonuses for a specific attribute
     * @param {Object} actor - The actor to check
     * @param {string} attribute - The attribute to get bonus for
     * @returns {number} Total value of all active attribute difference bonuses
     */
    static async GetAttributeBonus(actor, attribute) {
        if (attribute === "") {
            return 0;
        }

        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_diff") && (i.system.settingtype == attribute)) {
				bonus += parseInt(i.system.value);
			}   
            
            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attribute_diff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == attribute)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active attribute buff bonuses for a specific attribute
     * @param {Object} actor - The actor to check
     * @param {string} attribute - The attribute to get bonus for
     * @returns {number} Total value of all active attribute buff bonuses
     */
    static async GetAttributeBuff(actor, attribute) {
        if (attribute === "") {
            return 0;
        }

        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_buff") && (i.system.settingtype == attribute)) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attribute_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == attribute)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active attribute buff bonuses for a specific attribute
     * @param {Object} actor - The actor to check
     * @param {string} attribute - The attribute to get bonus for
     * @returns {number} Total value of all active attribute buff bonuses
     */
    static async GetFixedAttributeBuff(actor, attribute) {
        if (attribute === "") {
            return false;
        }

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_fixed_value") && (i.system.settingtype == attribute)) {
				return i.system.value;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attribute_fixed_value") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == attribute)) {
                        return i.system.bonuslist[x].value;
                    }
				}
			}
		}

        return false; 
    }

    /**
     * Gets the total value of all active attribute dice buff bonuses for a specific attribute
     * @param {Object} actor - The actor to check
     * @param {string} attribute - The attribute to get bonus for
     * @returns {number} Total value of all active attribute dice buff bonuses
     */
    static async GetAttributeDiceBuff(actor, attribute) {
        if (attribute === "") {
            return 0;
        }

        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_dice_buff") && (i.system.settingtype == attribute)) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attribute_dice_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == attribute)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active attribute auto buff bonuses for a specific attribute
     * @param {Object} actor - The actor to check
     * @param {string} attribute - The attribute to get bonus for
     * @returns {number} Total value of all active attribute auto buff bonuses
     */
    static async GetAttributeAutoBuff(actor, attribute) {
        if (attribute === "") {
            return 0;
        }

        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_auto_buff") && (i.system.settingtype == attribute)) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attribute_auto_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == attribute)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active ability difference bonuses for a specific ability
     * @param {Object} actor - The actor to check
     * @param {string} ability - The ability to get bonus for
     * @returns {number} Total value of all active ability difference bonuses
     */
    static async GetAbilityDiff(actor, ability) {
        if (ability === "") {
            return 0;
        }

        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_diff") && (i.system?.settingtype == ability)) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x]?.type == "ability_diff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == ability)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
                    else if ((i.system.bonuslist[x]?.type == "ability_diff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.talents[ability])) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
                    else if ((i.system.bonuslist[x]?.type == "ability_diff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.skills[ability])) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
                    else if ((i.system.bonuslist[x]?.type == "ability_diff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.knowledges[ability])) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active ability buff bonuses for a specific ability
     * @param {Object} actor - The actor to check
     * @param {string} ability - The ability to get bonus for
     * @returns {number} Total value of all active ability buff bonuses
     */
    static async GetAbilityBuff(actor, ability) {
        if (ability === "") {
            return 0;
        }

        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_buff") && (i.system.settingtype == ability)) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
               continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "ability_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == ability)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
                    else if ((i.system.bonuslist[x]?.type == "ability_buff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.talents[ability])) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
                    else if ((i.system.bonuslist[x]?.type == "ability_buff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.skills[ability])) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
                    else if ((i.system.bonuslist[x]?.type == "ability_buff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == CONFIG.worldofdarkness.knowledges[ability])) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active attack buff bonuses for a specific weapon type
     * @param {Object} actor - The actor to check
     * @param {string} weapontype - The weapon type to get bonus for
     * @returns {number} Total value of all active attack buff bonuses
     */
    static async GetAttackBuff(actor, weapontype) {
        if (weapontype === "") {
            return 0;
        }

        if (weapontype === "Melee Weapon")  {
            weapontype = "TYPES.Item.Melee Weapon";
        }
        if (weapontype === "Ranged Weapon")  {
            weapontype = "TYPES.Item.Ranged Weapon";
        }

        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attack_buff") && (i.system.settingtype == weapontype)) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "attack_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == weapontype)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active attack difference bonuses for a specific weapon type
     * @param {Object} actor - The actor to check
     * @param {string} weapontype - The weapon type to get bonus for
     * @returns {number} Total value of all active attack difference bonuses
     */
    static async GetAttackDiff(actor, weapontype) {
        if (weapontype === "") {
            return 0;
        }

        if (weapontype === "Melee Weapon")  {
            weapontype = "TYPES.Item.Melee Weapon";
        }
        if (weapontype === "Ranged Weapon")  {
            weapontype = "TYPES.Item.Ranged Weapon";
        }

        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attack_diff") && (i.system.settingtype == weapontype)) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x]?.type == "attack_diff") && (i.system.bonuslist[x]?.isactive) && (i.system.bonuslist[x]?.settingtype == weapontype)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active initiative buff bonuses
     * @param {Object} actor - The actor to check
     * @returns {number} Total value of all active initiative buff bonuses
     */
    static async GetInitiativeBuff(actor) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "initiative_buff")) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "initiative_buff") && (i.system.bonuslist[x].isactive)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }    

    

    /**
     * Gets the total value of all active soak buff bonuses
     * @param {Object} actor - The actor to check
     * @param {string} damagetype - The damage type to get bonus for
     * @returns {number} Total value of all active soak buff bonuses
     */
    static async GetSoakBuff(actor, damagetype) {
        let bonus = 0;

        if (damagetype === "") {
            damagetype = "all";
        }

        for (const i of actor.items) {
            if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_buff") && (i.system.settingtype == damagetype)) {
                bonus += parseInt(i.system.value);
            }

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    //if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_buff") && (i.system.settingtype == damagetype)) {
                    if ((i.system.bonuslist[x].type == "soak_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == damagetype)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active soak difference bonuses
     * @param {Object} actor - The actor to check
     * @returns {number} Total value of all active soak difference bonuses
     */
    static async GetSoakDiff(actor) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_diff")) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "soak_diff") && (i.system.bonuslist[x].isactive)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active frenzy buff bonuses
     * @param {Object} actor - The actor to check
     * @returns {number} Total value of all active frenzy buff bonuses
     */
    static async GetFrenzyBuff(actor) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "frenzy_buff")) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "frenzy_buff") && (i.system.bonuslist[x].isactive)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active frenzy difference bonuses
     * @param {Object} actor - The actor to check
     * @returns {number} Total value of all active frenzy difference bonuses
     */
    static async GetFrenzyDiff(actor) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "frenzy_diff")) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x]?.type == "frenzy_diff") && (i.system.bonuslist[x]?.isactive)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active health level buff bonuses for a specific health level
     * @param {Object} actor - The actor to check
     * @param {string} healthlevel - The health level to get bonus for
     * @returns {number} Total value of all active health level buff bonuses
     */
    static async GetHealthlevelsBuff(actor, healthlevel) {
        if (healthlevel === "") {
            return 0;
        }

        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "health_buff") && (i.system.settingtype == healthlevel)) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "health_buff") && (i.system.bonuslist[x].settingtype == healthlevel) && (i.system.bonuslist[x].isactive)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets the total value of all active movement buff bonuses for a specific movement type
     * @param {Object} actor - The actor to check
     * @param {string} movementtype - The movement type to get bonus for
     * @returns {number} Total value of all active movement buff bonuses
     */
    static async GetMovementBuff(actor, movementtype) {
        if (movementtype === "") {
            return 0;
        }

        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "movement_buff") && (i.system.settingtype == movementtype)) {
				bonus += parseFloat(i.system.value) || 0;
			}

            if (i.system.bonuslist === undefined) {
                continue;
            } 

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "movement_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == movementtype)) {
                        bonus += parseFloat(i.system.bonuslist[x].value) || 0;
                    }
				}
			}
		}

        return bonus; 
    }

    /**
     * Gets all bonus items of a specific type from an actor and adds them to a list
     * @param {Object} actor - The actor to get bonuses from
     * @param {Array} bonuslist - The list to add bonuses to
     * @param {string} type - The type of bonus to retrieve
     * @returns {Array} The list with all bonus items of the specified type
     */   

    static GetAllAttributeBonus(actor, bonuslist, type) {
        if (!actor?.items || !Array.isArray(bonuslist)) {
            return bonuslist;
        }

        for (const i of actor.items) {
            // Check direct bonus items
            if (i.type === "Bonus" && i.system?.type === type) {
                const bonusItem = foundry.utils.duplicate(i);
                bonusItem.origin = "";
                bonuslist.push(bonusItem);
            }
            
            // Check bonuslist array
            const bonuslistArray = i.system?.bonuslist;
            if (!Array.isArray(bonuslistArray) || bonuslistArray.length === 0) {
                continue;
            }

            for (const bonusEntry of bonuslistArray) {
                if (bonusEntry?.type === type) {
                    // Use parseFloat for movement_buff to support decimal multipliers
                    const value = (type === "movement_buff") 
                        ? (parseFloat(bonusEntry.value) || 0)
                        : (parseInt(bonusEntry.value) || 0);
                    
                    const itemData = {
                        name: bonusEntry.name,
                        type: "Bonus",
                        _id: i._id,
                        system: {
                            isremovable: false,
                            iscreated: true,
                            isactive: bonusEntry.isactive,
                            version: i.system.version,
                            parentid: i._id,
                            settingtype: bonusEntry.settingtype,
                            type: type,
                            value: value
                        }
                    };

                    const item = new Item(itemData);
                    item.origin = i.name;
                    bonuslist.push(item);
                }
            }
        }

        return bonuslist;
    }

    /**
     * Opens a dialog to edit a bonus item
     * @param {Object} actor - The actor that the bonus item belongs to
     * @param {Object} item - The bonus item to edit
     * @param {string} id - ID of the bonus item
     * @returns {void}
     */
    static async EditBonus(actor, item, id) {
		const bonus = new BonusDialog.Bonus(actor, item, id);
		let bonusUse = new BonusDialog.DialogBonus(actor, bonus);
		bonusUse.render(true);

        return;
    }
}