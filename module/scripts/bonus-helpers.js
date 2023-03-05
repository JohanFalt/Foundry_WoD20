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

    static async CheckAttributeBonus(actor, attribute) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_diff") && (i.system.settingtype == attribute)) {
				return true;
			}
		}

        return false;
    } 
    
    static async CheckAttributeBuff(actor, attribute) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_buff") && (i.system.settingtype == attribute)) {
				return true;
			}
		}

        return false;
    }

    static async CheckAttributeDiceBuff(actor, attribute) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_dice_buff") && (i.system.settingtype == attribute)) {
				return true;
			}
		}

        return false;
    }

    static async CheckAttributeAutoBuff(actor, attribute) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_auto_buff") && (i.system.settingtype == attribute)) {
				return true;
			}
		}

        return false;
    }    

    static async CheckAbilityBonus(actor, ability) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_diff") && (i.system.settingtype == ability)) {
				return true;
			}
		}

        return false;
    } 
    
    static async CheckAbilityBuff(actor, ability) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_buff") && (i.system.settingtype == ability)) {
				return true;
			}
		}

        return false;
    }

    static async CheckInitiativeBuff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "initiative_buff")) {
				return true;
			}
		}

        return false;
    }

    static async CheckSoakBuff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "soak_buff")) {
				return true;
			}
		}

        return false;
    }

    static async CheckHealthlevelsBuff(actor) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "health_buff")) {
				return true;
			}
		}

        return false;
    }

    static async CheckMovementBuff(actor, movementtype) {
        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "movement_buff") && (i.system.settingtype == movementtype)) {
				return true;
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
		}

        return bonus; 
    }

    static async GetAttributeBuff(actor, attribute) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_buff") && (i.system.settingtype == attribute)) {
				bonus += parseInt(i.system.value);
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
		}

        return bonus; 
    }

    static async GetAttributeAutoBuff(actor, attribute) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "attribute_auto_buff") && (i.system.settingtype == attribute)) {
				bonus += parseInt(i.system.value);
			}
		}

        return bonus; 
    }

    static async GetAbilityBonus(actor, ability) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "ability_diff") && (i.system.settingtype == ability)) {
				bonus += parseInt(i.system.value);
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
		}

        return bonus; 
    }

    static async GetInitiativeBuff(actor) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "initiative_buff")) {
				bonus += parseInt(i.system.value);
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
		}

        return bonus; 
    }

    static async GetHealthlevelsBuff(actor) {
        let bonus = 0;

        for (const i of actor.items) {
			if ((i.type == "Bonus") && (i.system.isactive) && (i.system.type == "health_buff")) {
				bonus += parseInt(i.system.value);
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
		}

        return bonus; 
    }
}