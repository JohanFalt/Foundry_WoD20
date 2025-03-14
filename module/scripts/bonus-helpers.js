import * as BonusDialog from "../dialogs/dialog-bonus.js";

export default class BonusHelper {
    static getBonuses(itemList, id) {
        let bonusList = [];

        for (const i of itemList) {
            if ((i.type == "Bonus") && (i.system.parentid == id)) {
                bonusList.push(i);
            }
        }

        return bonusList;
    }

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
                version: version
            }
        };

        return itemData;
    }

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

    static async CheckAttributeBonus(actor, attribute) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_diff") && (i.system.settingtype == attribute)) {
				return true;
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
    
    static async CheckAttributeBuff(actor, attribute) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_buff") && (i.system.settingtype == attribute)) {
				return true;
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

    static async CheckAttributeDiceBuff(actor, attribute) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_dice_buff") && (i.system.settingtype == attribute)) {
				return true;
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

    static async CheckAttributeAutoBuff(actor, attribute) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_auto_buff") && (i.system.settingtype == attribute)) {
				return true;
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

    static async CheckAbilityDiff(actor, ability) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_diff") && (i.system.settingtype == ability)) {
				return true;
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
    
    static async CheckAbilityBuff(actor, ability) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_buff") && (i.system.settingtype == ability)) {
				return true;
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

    static async CheckInitiativeBuff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "initiative_buff")) {
				return true;
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

    static async CheckSoakBuff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_buff")) {
				return true;
			}

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "soak_buff") && (i.system.bonuslist[x].isactive)) {
                        return true;
                    }
				}
			}
		}

        return false;
    }

    static async CheckSoakDiff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_diff")) {
				return true;
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

    static async CheckHealthlevelsBuff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "health_buff")) {
				return true;
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

    static async CheckMovementBuff(actor, movementtype) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "movement_buff") && (i.system.settingtype == movementtype)) {
				return true;
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

    static async GetAttributeBonus(actor, attribute) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_diff") && (i.system.settingtype == attribute)) {
				bonus += parseInt(i.system.value);
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

    static async GetAttributeBuff(actor, attribute) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_buff") && (i.system.settingtype == attribute)) {
				bonus += parseInt(i.system.value);
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

    static async GetAttributeDiceBuff(actor, attribute) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_dice_buff") && (i.system.settingtype == attribute)) {
				bonus += parseInt(i.system.value);
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

    static async GetAttributeAutoBuff(actor, attribute) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_auto_buff") && (i.system.settingtype == attribute)) {
				bonus += parseInt(i.system.value);
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

    static async GetAbilityDiff(actor, ability) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_diff") && (i.system?.settingtype == ability)) {
				bonus += parseInt(i.system.value);
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

    static async GetAbilityBuff(actor, ability) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_buff") && (i.system.settingtype == ability)) {
				bonus += parseInt(i.system.value);
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

    static async GetInitiativeBuff(actor) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "initiative_buff")) {
				bonus += parseInt(i.system.value);
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

    static async GetSoakBuff(actor) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_buff")) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "soak_buff") && (i.system.bonuslist[x].isactive)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    static async GetSoakDiff(actor) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_diff")) {
				bonus += parseInt(i.system.value);
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

    static async GetHealthlevelsBuff(actor, healthlevel) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "health_buff") && (i.system.settingtype == healthlevel)) {
				bonus += parseInt(i.system.value);
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

    static async GetMovementBuff(actor, movementtype) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "movement_buff") && (i.system.settingtype == movementtype)) {
				bonus += parseInt(i.system.value);
			}

            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == "movement_buff") && (i.system.bonuslist[x].isactive) && (i.system.bonuslist[x].settingtype == movementtype)) {
                        bonus += parseInt(i.system.bonuslist[x].value);
                    }
				}
			}
		}

        return bonus; 
    }

    static GetAllAttributeBonus(actor, bonuslist, type) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.type == type)) {
                i.origin = "";
				bonuslist.push(i);
			}   
            
            if (i.system.bonuslist.length > 0) {
				for (let x = 0; x <= i.system.bonuslist.length - 1; x++) {
                    if ((i.system.bonuslist[x].type == type)) {
                        let itemData = {
                            name: i.system.bonuslist[x].name,
                            type: "Bonus",	
                            _id: i._id,
                            system: {
                                isremovable: false,
                                iscreated: true,
                                isactive: i.system.bonuslist[x].isactive,
                                version: i.system.version,
                                parentid: i._id,
                                settingtype: i.system.bonuslist[x].settingtype,
                                type: type,
                                value: parseInt(i.system.bonuslist[x].value)
                            }
                        };
    
                        let item = new Item(itemData);
                        item.origin = i.name;
                        bonuslist.push(item);
                    }
				}
			}
		}

        return bonuslist; 
    }

    static async EditBonus(actor, item, id) {
		const bonus = new BonusDialog.Bonus(actor, item, id);
		let bonusUse = new BonusDialog.DialogBonus(actor, bonus);
		bonusUse.render(true);

        return;
    }
}