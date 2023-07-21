import * as AbilityDialog from "../dialogs/dialog-edits.js";

export default class AbilityHelper {
    static CreateAbility(actor, abilitytype, abilitynamn, maxvalue, ismeleeweapon, israngedeweapon) {
		const existed = this.CheckAbilityExists(actor, abilitytype, abilitynamn);

		if (existed) {
			return;
		}

		const itemData = {
			name: abilitynamn,
			type: "Trait",
			system: {
				label: abilitynamn,
				type: abilitytype,
				max: maxvalue,
				ismeleeweapon: ismeleeweapon,
				israngedeweapon: israngedeweapon
			}
		};
		actor.createEmbeddedDocuments("Item", [itemData]);
	}

	static CheckAbilityExists(actor, itemtype, itemname) {
		for (const i of actor.items) {
			if ((i.type == "Trait") && (i.system.type == itemtype) && (i.name == itemname)) {
				return true;
			}
		}

        return false;
	}

	static EditAbility(event, actor) {
		const itemId = $(event.currentTarget).data("item-id");		
		let item;

		if ((CONFIG.wod.talents[itemId] == undefined) && (CONFIG.wod.skills[itemId] == undefined) && (CONFIG.wod.knowledges[itemId] == undefined)) {
			item = actor.getEmbeddedDocument("Item", itemId);
		}
		else {
			item = actor.system.abilities[itemId];
		}	
		
		const ability = new AbilityDialog.Ability(item);
		let abilityUse = new AbilityDialog.DialogAbility(actor, ability);
		abilityUse.render(true);
	}
}