import * as AbilityDialog from "../dialogs/dialog-edits.js";

export default class AbilityHelper {
    static async CreateAbility(actor, abilitytype, abilitynamn, maxvalue, ismeleeweapon = false, israngedeweapon = false, autoopen = false) {
		const existed = this.CheckAbilityExists(actor, abilitytype, abilitynamn);

		if (existed) {
			ui.notifications.warn(abilitynamn + ` ${game.i18n.localize("wod.labels.new.alreadyexists")}`);
			return;
		}

		const itemData = {
			name: abilitynamn,
			type: "Trait",
			system: {
				label: game.i18n.localize(abilitynamn),
				type: abilitytype,
				max: maxvalue,
				ismeleeweapon: ismeleeweapon,
				israngedeweapon: israngedeweapon
			}
		};

		let createdItem;

		if (actor.system.settings.iscreated) {
			createdItem = await actor.createEmbeddedDocuments("Item", [itemData]);
		}
		else {
			createdItem = await actor.updateSource({ items: [itemData]});
		}

		if (autoopen) {
			const item = await actor.getEmbeddedDocument("Item", createdItem[0]._id);
			var _a;
	
			if (item instanceof Item) {
				_a = item.sheet;
	
				if ((_a === null) || (_a === void 0)) {
					void 0;
				}                
				else {
					_a.render(true);  
				}
			}
		}		
	}

	static CreateAbility_nowait(actor, abilitytype, abilitynamn, maxvalue, ismeleeweapon, israngedeweapon) {
		const existed = this.CheckAbilityExists(actor, abilitytype, abilitynamn);

		if (existed) {
			return;
		}

		const itemData = {
			name: abilitynamn,
			type: "Trait",
			system: {
				label: game.i18n.localize(abilitynamn),
				type: abilitytype,
				max: maxvalue,
				ismeleeweapon: ismeleeweapon,
				israngedeweapon: israngedeweapon
			}
		};
		
		if (actor.system.settings.iscreated) {
			actor.createEmbeddedDocuments("Item", [itemData]);
		}
		else {
			actor.updateSource({ items: [itemData]});
		}
	}

	static CheckAbilityExists(actor, itemtype, itemname) {
		for (const i of actor.items) {
			if ((i.type == "Trait") && (i.system.type == itemtype) && (i.name == itemname)) {
				return true;
			}
		}

        return false;
	}

	static async EditAbility(event, actor) {
		const itemId = $(event.currentTarget).data("item-id");		
		let item;

		if ((CONFIG.worldofdarkness.talents[itemId] == undefined) && (CONFIG.worldofdarkness.skills[itemId] == undefined) && (CONFIG.worldofdarkness.knowledges[itemId] == undefined)) {
			item = await actor.getEmbeddedDocument("Item", itemId);
		}
		else {
			item = actor.system.abilities[itemId];
		}	
		
		const ability = new AbilityDialog.Ability(item);
		let abilityUse = new AbilityDialog.DialogAbility(actor, ability);
		abilityUse.render(true);
	}
}