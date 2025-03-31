import BonusHelper from "./bonus-helpers.js";

export default class ItemHelper {
	static async GetPowerId(item, actor) {
		let id = "";

		if ((item.system.type == "wod.types.disciplinepower") || 
				(item.system.type == "wod.types.disciplinepathpower") ||
				(item.system.type == "wod.types.artpower") ||
				(item.system.type == "wod.types.edgepower") ||
				(item.system.type == "wod.types.lorepower") ||
				(item.system.type == "wod.types.arcanoipower")) {
			for (const i of actor.items) {
				if (i.name.toLowerCase() == item.system.parentid.toLowerCase()) {
					id = i._id;
					break;
				}
			}
		}

		return id;
	}

    static async sortActorItems(actor, config) {     
		actor.system.listdata = [];

		if (actor.system.listdata.settings == undefined) {
			actor.system.listdata.settings = [];
	   	}

        await this._sortAbilities(actor, config);
		await this._sortItems(actor);  	

		// ability lists are effected by both activated abilities and what items you have.
		actor.system.listdata.ability_talents = actor.system.listdata.ability_talents.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.ability_skills = actor.system.listdata.ability_skills.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.ability_knowledges = actor.system.listdata.ability_knowledges.sort((a, b) => a.name.localeCompare(b.name)); 		
    }

	// If removing a main power the secondary powers needs to be emptied of parentId
	static async cleanItemList(actor, removedItem) {
		for (const item of actor.items) {
			if (item.system.parentid == removedItem._id) {
				const itemData = foundry.utils.duplicate(item);
				itemData.system.parentid = "";
				await item.update(itemData);
			}
		}
	}

	static async removeItemBonus(actor, removedItem) {
		for (const item of actor.items) {
			if ((item.system.parentid == removedItem._id) && (item.type == "Bonus")) {
				await actor.deleteEmbeddedDocuments("Item", [item._id]);
			}
		}
	}

	static async removeConnectedItems(actor, removedItem) {
		for (const item of actor.items) {
			if (item.system.parentid == removedItem._id) {
				await actor.deleteEmbeddedDocuments("Item", [item._id]);
			}
		}
	}

    static async _sortAbilities(actor, config) {
		actor.system.listdata.ability_talents = [];
        actor.system.listdata.ability_skills = [];
        actor.system.listdata.ability_knowledges = [];
		actor.system.listdata.secondary_talents = [];
        actor.system.listdata.secondary_skills = [];
        actor.system.listdata.secondary_knowledges = [];

		for (const name in actor.system.abilities) {
			if (actor.system.abilities[name].isvisible) {
				let ability = actor.system.abilities[name];
				ability._id = name;
				ability.issecondary = false;
				ability.name = game.i18n.localize(ability.label);


				ability.label = game.i18n.localize(ability.label);

				

				if (actor.system.abilities[name].type == "talent") {
					actor.system.listdata.ability_talents.push(ability);
				}

				if (actor.system.abilities[name].type == "skill") {
					actor.system.listdata.ability_skills.push(ability);
				}

				if (actor.system.abilities[name].type == "knowledge") {
					actor.system.listdata.ability_knowledges.push(ability);
				}
			}
		}
    }

	static async _sortItems(actor) {
		actor.system.listdata.combat = [];

		actor.system.listdata.combat.naturalWeapons = [];
		actor.system.listdata.combat.meleeWeapons = [];
		actor.system.listdata.combat.rangedWeapons = [];
		actor.system.listdata.combat.armors = [];	

		//actor.system.listdata.experiences = [];

		//actor.system.listdata.experiences.expearned = [];
		//actor.system.listdata.experiences.expspend = [];
		//actor.system.listdata.experiences.totalExp = 0;
		//actor.system.listdata.experiences.spentExp = 0;
		//actor.system.listdata.experiences.experience = 0;

		actor.system.listdata.traits = [];

		actor.system.listdata.traits.passions = [];
		actor.system.listdata.traits.fetters = [];
		//actor.system.listdata.traits.othertraits = [];

		actor.system.listdata.powers = [];

		actor.system.listdata.meleeAbilities = [];
		actor.system.listdata.rangedAbilities = [];

		actor.system.listdata.bonus = [];

		if (actor.system.settings.powers.haspowers) {
			this._createSpecialPowersStructure(actor);
		}

		if (actor.system.settings.powers.hasgifts) {
			this._createGiftStructure(actor);
		}

		if (actor.system.settings.powers.hascharms) {
			this._createCharmStructure(actor);
		}

		if (actor.system.settings.powers.hasdisciplines) {
			this._createDisciplineStructure(actor);
		}

		if (actor.system.settings.powers.hasarts) {
			this._createArtStructure(actor);
		}

		if (actor.system.settings.powers.hasedges) {
			this._createEdgeStructure(actor);
		}

		if (actor.system.settings.powers.haslores) {
			this._createLoreStructure(actor);
		}

		if (actor.system.settings.powers.hasarcanois) {
			this._createArcanoiStructure(actor);
		}

		if (actor.system.settings.powers.hasstains) {
			this._createStainStructure(actor);
		}

		if (actor.system.settings.powers.hashorrors) {
			this._createHorrorStructure(actor);
		}

		// If no items then Power structure needs to be created regardless...
		for (const item of actor.items) {
			await this._sortCombat(item, actor);
			//await this._sortGear(item, actor);
			//await this._sortFeatures(item, actor);
			//await this._sortExperiences(item, actor);
			await this._sortTraits(item, actor);				
			await this._sortPowers(item, actor);
			await this._sortBonus(item, actor);
		}						

		actor.system.listdata.meleeAbilities.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.rangedAbilities.sort((a, b) => a.name.localeCompare(b.name));

		// Weapons
		actor.system.listdata.combat.naturalWeapons.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.combat.meleeWeapons.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.combat.rangedWeapons.sort((a, b) => a.name.localeCompare(b.name));

		// Armor
		actor.system.listdata.combat.armors.sort((a, b) => a.name.localeCompare(b.name));

		// Powers
		if (actor.system.settings.powers.haspowers) {
			await this._organizeSpecialPowers(actor);
		}

		if (actor.system.settings.powers.hasgifts) {
			await this._organizeGifts(actor);		
		}

		if (actor.system.settings.powers.hasdisciplines) {
			await this._organizeDisciplines(actor);
		}

		if (actor.system.settings.powers.hasarts) {
			await this._organizeArts(actor);
		}

		if (actor.system.settings.powers.hasedges) {
			await this._organizeEdges(actor);
		}

		if (actor.system.settings.powers.haslores) {
			await this._organizeLores(actor);
		}

		if (actor.system.settings.powers.hasarcanois) {
			await this._organizeArcanois(actor);
		}

		if (actor.system.settings.powers.hasstains) {
			await this._organizeStains(actor);
		}

		if (actor.system.settings.powers.hashorrors) {
			await this._organizeHorrors(actor);
		}

		// Experience Points
		//actor.system.listdata.experiences.experience = actor.system.listdata.experiences.totalExp - actor.system.listdata.experiences.spentExp;
	}

	static async _sortCombat(item, actor) {
		if (item.type == "Melee Weapon") {
			if (item.system.isnatural) {
				actor.system.listdata.combat.naturalWeapons.push(item);
			}
			if (!item.system.isnatural) {
				actor.system.listdata.combat.meleeWeapons.push(item);
			}
		}
		if (item.type == "Ranged Weapon") {
			actor.system.listdata.combat.rangedWeapons.push(item);
		}
		if (item.type == "Armor") {
			actor.system.listdata.combat.armors.push(item);
		}
	}

	static async _sortGear(item, actor) {
		// if (item.type == "Fetish") {
		// 	// item.system.bonuses = BonusHelper.getBonuses(actor.items, item._id);

		// 	if (item.system.type == "wod.types.fetish") {
		// 		actor.system.listdata.gear.fetishlist.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.talen") {
		// 		actor.system.listdata.gear.talenlist.push(item);
		// 	}			
		// }
		// if (item.type == "Item") {
		// 	// item.system.bonuses = BonusHelper.getBonuses(actor.items, item._id);

		// 	if (item.system.type == "wod.types.treasure") {
		// 		actor.system.listdata.gear.treasures.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.device") {
		// 		actor.system.listdata.gear.devices.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.talisman") {
		// 		actor.system.listdata.gear.talismans.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.periapt") {
		// 		actor.system.listdata.gear.periapts.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.matrix") {
		// 		actor.system.listdata.gear.matrixs.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.trinket") {
		// 		actor.system.listdata.gear.trinkets.push(item);
		// 	}
		// }
	}

	static async _sortFeatures(item, actor) {
		// if (item.type == "Feature") {
		// 	// item.system.bonuses = BonusHelper.getBonuses(actor.items, item._id);

		// 	if (item.system.type == "wod.types.background") {
		// 		actor.system.listdata.features.backgrounds.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.merit") {
		// 		actor.system.listdata.features.merits.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.flaw") {
		// 		actor.system.listdata.features.flaws.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.bloodbound") {
		// 		actor.system.listdata.features.bloodbounds.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.boon") {
		// 		actor.system.listdata.features.boons.push(item);
		// 	}
		// 	if (item.system.type == "wod.types.oath") {
		// 		actor.system.listdata.features.oaths.push(item);
		// 	}
		// }
	}

	static async _sortExperiences(item, actor) {
		// if (item.type == "Experience") {
		// 	if (item.system.type == "wod.types.expgained") {
		// 		actor.system.listdata.experiences.expearned.push(item);
		// 		actor.system.listdata.experiences.totalExp += parseInt(item.system.amount);
		// 	}
		// 	if (item.system.type == "wod.types.expspent") {
		// 		actor.system.listdata.experiences.expspend.push(item);

		// 		if (item.system.isspent) {
		// 			actor.system.listdata.experiences.spentExp += parseInt(item.system.amount);
		// 		}
		// 	}
		// }
	}

	static async _sortBonus(item, actor) {
		if (item.type == "Bonus") {
			actor.system.listdata.bonus.push(item); 
		}
	}

	static async _sortTraits(item, actor) {
		if (item.type == "Trait") {
			if (item.system.type == "wod.types.talentsecondability") {
				const trait = {
					issecondary: true,
					label: item.system.label,
					max: item.system.max,
					name: item.name,
					speciality: item.system.speciality,
					value: item.system.value,
					isvisible: item.system.isvisible,
					isfavorited: item.system.isfavorited,
					_id: item._id
				}

				if (item.system.isvisible) {
					actor.system.listdata.ability_talents.push(trait);
				}

				if (item.system.ismeleeweapon) {
					actor.system.listdata.meleeAbilities.push(item);
				}
				if (item.system.israngedeweapon) {
					actor.system.listdata.rangedAbilities.push(item);
				}

				actor.system.listdata.secondary_talents.push(trait);
			}
			if (item.system.type == "wod.types.skillsecondability") {
				const trait = {
					issecondary: true,
					label: item.system.label,
					max: item.system.max,
					name: item.name,
					speciality: item.system.speciality,
					value: item.system.value,
					isvisible: item.system.isvisible,
					isfavorited: item.system.isfavorited,
					_id: item._id
				}

				if (item.system.isvisible) {
					actor.system.listdata.ability_skills.push(trait);
				}
	
				if (item.system.ismeleeweapon) {
					actor.system.listdata.meleeAbilities.push(item);
				}
				if (item.system.israngedeweapon) {
					actor.system.listdata.rangedAbilities.push(item);
				}

				actor.system.listdata.secondary_skills.push(trait);
			}
			if (item.system.type == "wod.types.knowledgesecondability") {
				const trait = {
					issecondary: true,
					label: item.system.label,
					max: item.system.max,
					name: item.name,
					speciality: item.system.speciality,
					value: item.system.value,
					isvisible: item.system.isvisible,
					isfavorited: item.system.isfavorited,
					_id: item._id
				}

				if (item.system.isvisible) {
					actor.system.listdata.ability_knowledges.push(trait);
				}

				if (item.system.ismeleeweapon) {
					actor.system.listdata.meleeAbilities.push(item);
				}
				if (item.system.israngedeweapon) {
					actor.system.listdata.rangedAbilities.push(item);
				}

				actor.system.listdata.secondary_knowledges.push(trait);
			}
			if (item.system.type == "wod.types.passion") {
				actor.system.listdata.traits.passions.push(item);
			}
			if (item.system.type == "wod.types.fetter") {
				actor.system.listdata.traits.fetters.push(item);
			}
		}
	}

	static async _sortPowers(item, actor) {
		if (item.type == "Power") {
			if (actor.system.settings.powers.haspowers) {
				this._sortSpecialPowers(item, actor);
			}
			if (actor.system.settings.powers.hasgifts) {
				this._sortGifts(item, actor);
			}
			if (actor.system.settings.powers.hascharms) {
				this._sortCharms(item, actor);
			}
			if (actor.system.settings.powers.hasdisciplines) {
				this._sortDisciplines(item, actor);
			}
			if (actor.system.settings.powers.hasarts) {
				this._sortArts(item, actor);
			}
			if (actor.system.settings.powers.hasedges) {
				this._sortEdges(item, actor);
			}
			if (actor.system.settings.powers.haslores) {
				this._sortLores(item, actor);
			}			
			if (actor.system.settings.powers.hasarcanois) {
				this._sortArcanois(item, actor);
			}
			if (actor.system.settings.powers.hasstains) {
				this._sortStains(item, actor);
			}
			if (actor.system.settings.powers.hashorrors) {
				this._sortHorrors(item, actor);
			}
		}			
	}

	static async _sortSpecialPowers(item, actor) {
		if (item.system.type == "wod.types.power") {
			actor.system.listdata.powers.powerlist.push(item);			
		}			
	}

	static async _sortGifts(item, actor) {
		if (item.system.type == "wod.types.gift") {
			actor.system.listdata.powers.gifts.giftlist.push(item);

			if (item.system.isactive) {
				actor.system.listdata.powers.gifts.powercombat.push(item);
			}			
						
			if (item.system.level == 2) {				
				actor.system.listdata.powers.gifts.powerlist2.push(item);				
			}
			else if (item.system.level == 3) {
				actor.system.listdata.powers.gifts.powerlist3.push(item);
			}
			else if (item.system.level == 4) {
				actor.system.listdata.powers.gifts.powerlist4.push(item);
			}
			else if (item.system.level == 5) {
				actor.system.listdata.powers.gifts.powerlist5.push(item);
			}
			else if (item.system.level == 6) {
				actor.system.listdata.powers.gifts.powerlist6.push(item);
			}
			else {	
				actor.system.listdata.powers.gifts.powerlist1.push(item);
			}
		}				
		if (item.system.type == "wod.types.rite") {
			actor.system.listdata.powers.gifts.ritelist.push(item);
		}			
	}		

	static async _sortCharms(item, actor) {
		if (item.system.type == "wod.types.charm") {
			actor.system.listdata.powers.charms.charmlist.push(item);
		}
	}

	static _createSpecialPowersStructure(actor) {
		actor.system.listdata.powers.powerlist = _createList(actor.system.listdata.powers.powerlist);
	}

	static _createGiftStructure(actor) {
		actor.system.listdata.powers.gifts = _createList(actor.system.listdata.powers.gifts);
		// Gifts
		actor.system.listdata.powers.gifts.powerlist1 = _createList(actor.system.listdata.powers.gifts.powerlist1);
		actor.system.listdata.powers.gifts.powerlist2 = _createList(actor.system.listdata.powers.gifts.powerlist2);
		actor.system.listdata.powers.gifts.powerlist3 = _createList(actor.system.listdata.powers.gifts.powerlist3);
		actor.system.listdata.powers.gifts.powerlist4 = _createList(actor.system.listdata.powers.gifts.powerlist4);
		actor.system.listdata.powers.gifts.powerlist5 = _createList(actor.system.listdata.powers.gifts.powerlist5);
		actor.system.listdata.powers.gifts.powerlist6 = _createList(actor.system.listdata.powers.gifts.powerlist6);

		// All Gifts
		actor.system.listdata.powers.gifts.giftlist = _createList(actor.system.listdata.powers.gifts.giftlist);

		// Rites
		actor.system.listdata.powers.gifts.ritelist = _createList(actor.system.listdata.powers.gifts.ritelist);

		// Activate Gifts
		actor.system.listdata.powers.gifts.powercombat = _createList(actor.system.listdata.powers.gifts.powercombat);
	}

	static _createHorrorStructure(actor) {
		actor.system.listdata.powers.horrors = _createList(actor.system.listdata.powers.horrors);
	}

	static _createStainStructure(actor) {
		actor.system.listdata.powers.stains = _createList(actor.system.listdata.powers.stains);
	}

	static _createCharmStructure(actor) {
		actor.system.listdata.powers.charms = _createList(actor.system.listdata.powers.charms);
		actor.system.listdata.powers.charms.charmlist = _createList(actor.system.listdata.powers.charms.charmlist);
	}

	static async _organizeSpecialPowers(actor) {
		actor.system.listdata.powers.powerlist.sort((a, b) => a.name.localeCompare(b.name));
	}

	static async _organizeGifts(actor) {
		actor.system.listdata.powers.gifts.powerlist1.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.gifts.powerlist2.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.gifts.powerlist3.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.gifts.powerlist4.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.gifts.powerlist5.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.gifts.powerlist6.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.gifts.giftlist.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.gifts.powercombat.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.gifts.ritelist.sort((a, b) => a.name.localeCompare(b.name));
	}

	static async _sortDisciplines(item, actor) {
		if (item.system.type == "wod.types.discipline") {
			actor.system.listdata.powers.disciplines.listeddisciplines.push(item);
		}
		if (item.system.type == "wod.types.disciplinepower") {
			if (item.system.parentid != "") {
				item.system.level = item.system.level.toString();
				actor.system.listdata.powers.disciplines.listeddisciplinepowers.push(item);
			}
			else {
				item.system.parentid == "";
				actor.system.listdata.powers.disciplines.unlisteddisciplines.push(item);
			}					
		}
		if (item.system.type == "wod.types.combination") {
			actor.system.listdata.powers.disciplines.combinationlist.push(item);
		}

		if (item.system.type == "wod.types.disciplinepath") {
			actor.system.listdata.powers.disciplines.listedpaths.push(item);
		}
		if (item.system.type == "wod.types.disciplinepathpower") {
			if (item.system.parentid != "") {
				item.system.level = item.system.level.toString();
				actor.system.listdata.powers.disciplines.listedpathpowers.push(item);
			}
			else {
				actor.system.listdata.powers.disciplines.unlistedpaths.push(item);
			}					
		}

		if (item.system.type == "wod.types.ritual") {
			actor.system.listdata.powers.disciplines.rituallist.push(item);
		}
	}

	static _createDisciplineStructure(actor) {
		actor.system.listdata.powers.disciplines = _createList(actor.system.listdata.powers.disciplines);
		// Disciplines
		actor.system.listdata.powers.disciplines.disciplinelist = _createList(actor.system.listdata.powers.disciplines.disciplinelist);
		actor.system.listdata.powers.disciplines.listeddisciplines = _createList(actor.system.listdata.powers.disciplines.listeddisciplines);
		actor.system.listdata.powers.disciplines.listeddisciplinepowers = _createList(actor.system.listdata.powers.disciplines.listeddisciplinepowers);
		actor.system.listdata.powers.disciplines.unlisteddisciplines = _createList(actor.system.listdata.powers.disciplines.unlisteddisciplines);	
		actor.system.listdata.powers.disciplines.combinationlist = _createList(actor.system.listdata.powers.disciplines.combinationlist);	

		// Paths
		actor.system.listdata.powers.disciplines.pathlist = _createList(actor.system.listdata.powers.disciplines.pathlist);
		actor.system.listdata.powers.disciplines.listedpaths = _createList(actor.system.listdata.powers.disciplines.listedpaths);
		actor.system.listdata.powers.disciplines.listedpathpowers = _createList(actor.system.listdata.powers.disciplines.listedpathpowers);
		actor.system.listdata.powers.disciplines.unlistedpaths = _createList(actor.system.listdata.powers.disciplines.unlistedpaths);

		// Rituals
		actor.system.listdata.powers.disciplines.rituallist = _createList(actor.system.listdata.powers.disciplines.rituallist);
	}

	static async _organizeDisciplines(actor) {
		actor.system.listdata.powers.disciplines.listeddisciplines.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.disciplines.listeddisciplinepowers.sort((a, b) => a.system.level.toString().localeCompare(b.system.level.toString()));	

		// add the correct discipline in the right list
		for (const discipline of actor.system.listdata.powers.disciplines.listeddisciplines) {
			// discipline.bonuses = BonusHelper.getBonuses(actor.items, discipline._id);			
			actor.system.listdata.powers.disciplines.disciplinelist.push(discipline);

			for (const power of actor.system.listdata.powers.disciplines.listeddisciplinepowers) {
				if (power.system.parentid == discipline._id) {
					// power.bonuses = BonusHelper.getBonuses(actor.items, power._id);
					actor.system.listdata.powers.disciplines.disciplinelist.push(power);
				}
			}
		}

		// Now! It is possible that some powers don't have a listed parentId, if it has remove it's connection
		for (const power of actor.system.listdata.powers.disciplines.listeddisciplinepowers) {
			let found = false;

			for (const discipline of actor.system.listdata.powers.disciplines.listeddisciplines) {
				if (power.system.parentid == discipline._id) {
					found = true;
					break;
				}
			}

			if (!found) {
				const item = await actor.getEmbeddedDocument("Item", power._id);
				const itemData = foundry.utils.duplicate(item);
                itemData.system.parentid = "";
                await item.update(itemData);
			}
		}

		actor.system.listdata.powers.disciplines.listedpaths.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.disciplines.listedpathpowers.sort((a, b) => a.system.level.toString().localeCompare(b.system.level.toString()));	
		actor.system.listdata.powers.disciplines.combinationlist.sort((a, b) => a.name.localeCompare(b.name));

		// add the correct path in the right list
		for (const path of actor.system.listdata.powers.disciplines.listedpaths) {
			actor.system.listdata.powers.disciplines.pathlist.push(path);

			for (const power of actor.system.listdata.powers.disciplines.listedpathpowers) {
				if (power.system.parentid == path._id) {
					actor.system.listdata.powers.disciplines.pathlist.push(power);
				}
			}
		}

		actor.system.listdata.powers.disciplines.rituallist.sort((a, b) => a.name.localeCompare(b.name));

		actor.system.listdata.powers.disciplines.hasunlisteddisciplines = actor.system.listdata.powers.disciplines.unlisteddisciplines.length > 0 ? true : false;
		actor.system.listdata.powers.disciplines.hasunlistedpaths = actor.system.listdata.powers.disciplines.unlistedpaths.length > 0 ? true : false;
	}

	static async _sortArts(item, actor) {
		if (item.system.type == "wod.types.art") {
			actor.system.listdata.powers.arts.listedarts.push(item);
		}
		if (item.system.type == "wod.types.artpower") {
			if (item.system.parentid != "") {
				item.system.level = item.system.level.toString();
				actor.system.listdata.powers.arts.listedartpowers.push(item);
			}
			else {
				item.system.parentid == "";
				actor.system.listdata.powers.arts.unlistedarts.push(item);
			}					
		}
	}

	static _createArtStructure(actor) {
		actor.system.listdata.powers.arts = _createList(actor.system.listdata.powers.arts);
		// Arts
		actor.system.listdata.powers.arts.artlist = _createList(actor.system.listdata.powers.arts.artlist);
		actor.system.listdata.powers.arts.listedarts = _createList(actor.system.listdata.powers.arts.listedarts);
		actor.system.listdata.powers.arts.listedartpowers = _createList(actor.system.listdata.powers.arts.listedartpowers);
		actor.system.listdata.powers.arts.unlistedarts = _createList(actor.system.listdata.powers.arts.unlistedarts);
	}

	static async _organizeArts(actor) {
		actor.system.listdata.powers.arts.listedarts.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.arts.listedartpowers.sort((a, b) => a.system.level.toString().localeCompare(b.system.level.toString()));	

		// add the correct art in the right list
		for (const art of actor.system.listdata.powers.arts.listedarts) {
			actor.system.listdata.powers.arts.artlist.push(art);

			for (const power of actor.system.listdata.powers.arts.listedartpowers) {
				if (power.system.parentid == art._id) {
					actor.system.listdata.powers.arts.artlist.push(power);
				}
			}
		}

		actor.system.listdata.powers.arts.hasunlistedarts = actor.system.listdata.powers.arts.unlistedarts.length > 0 ? true : false;
	}

	static async _sortEdges(item, actor) {
		if (item.system.type == "wod.types.edge") {
			actor.system.listdata.powers.edges.listededges.push(item);
		}
		if (item.system.type == "wod.types.edgepower") {
			if (item.system.parentid != "") {
				item.system.level = item.system.level.toString();
				actor.system.listdata.powers.edges.listededgepowers.push(item);
			}
			else {
				item.system.parentid == "";
				actor.system.listdata.powers.edges.unlistededges.push(item);
			}					
		}
	}

	static _createEdgeStructure(actor) {
		actor.system.listdata.powers.edges = _createList(actor.system.listdata.powers.edges);
		// Edges
		actor.system.listdata.powers.edges.edgelist = _createList(actor.system.listdata.powers.edges.edgelist);
		actor.system.listdata.powers.edges.listededges = _createList(actor.system.listdata.powers.edges.listededges);
		actor.system.listdata.powers.edges.listededgepowers = _createList(actor.system.listdata.powers.edges.listededgepowers);
		actor.system.listdata.powers.edges.unlistededges = _createList(actor.system.listdata.powers.edges.unlistededges);
	}	

	static async _organizeEdges(actor) {
		actor.system.listdata.powers.edges.listededges.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.edges.listededgepowers.sort((a, b) => a.system.level.toString().localeCompare(b.system.level.toString()));	

		// add the correct edge in the right list
		for (const edge of actor.system.listdata.powers.edges.listededges) {
			actor.system.listdata.powers.edges.edgelist.push(edge);

			for (const power of actor.system.listdata.powers.edges.listededgepowers) {
				if (power.system.parentid == edge._id) {
					actor.system.listdata.powers.edges.edgelist.push(power);
				}
			}
		}

		actor.system.listdata.powers.edges.hasunlistededges = actor.system.listdata.powers.edges.unlistededges.length > 0 ? true : false;
	}

	static _createLoreStructure(actor) {
		actor.system.listdata.powers.lores = _createList(actor.system.listdata.powers.lores);

		// all Lores listed
		actor.system.listdata.powers.lores.listedlores = _createList(actor.system.listdata.powers.lores.listedlores);

		// all Lore Powers listed
		actor.system.listdata.powers.lores.listedlorepowers = _createList(actor.system.listdata.powers.lores.listedlorepowers);

		// all Lore Powers not connected to a Lore
		actor.system.listdata.powers.lores.unlistedlores = _createList(actor.system.listdata.powers.lores.unlistedlores);

		// all Lores and Lore Powers collected
		actor.system.listdata.powers.lores.lorelist = _createList(actor.system.listdata.powers.lores.lorelist);

		// Rituals
		actor.system.listdata.powers.lores.rituallist = _createList(actor.system.listdata.powers.lores.rituallist);
	}

	static async _sortLores(item, actor) {		
		if (item.system.type == "wod.types.lore") {
			actor.system.listdata.powers.lores.listedlores.push(item);
		}
		if (item.system.type == "wod.types.lorepower") {			

			if (item.system.parentid != "") {
				item.system.level = item.system.level.toString();
				actor.system.listdata.powers.lores.listedlorepowers.push(item);
			}
			else {
				item.system.parentid == "";
				actor.system.listdata.powers.lores.unlistedlores.push(item);
			}					
		}
		if (item.system.type == "wod.types.ritual") {
			actor.system.listdata.powers.lores.rituallist.push(item);
		}
	}

	static async _organizeLores(actor) {
		actor.system.listdata.powers.lores.listedlores.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.lores.listedlorepowers.sort((a, b) => a.system.level.toString().localeCompare(b.system.level.toString()));	
		actor.system.listdata.powers.lores.rituallist.sort((a, b) => a.name.localeCompare(b.name));

		// add the correct lore in the right list
		for (const lore of actor.system.listdata.powers.lores.listedlores) {
			actor.system.listdata.powers.lores.lorelist.push(lore);

			for (const power of actor.system.listdata.powers.lores.listedlorepowers) {
				if (power.system.parentid == lore._id) {
					actor.system.listdata.powers.lores.lorelist.push(power);
				}
			}
		}

		actor.system.listdata.powers.lores.hasunlistedlores = actor.system.listdata.powers.lores.unlistedlores.length > 0 ? true : false;		
	}

	static _createArcanoiStructure(actor) {
		actor.system.listdata.powers.arcanois = _createList(actor.system.listdata.powers.arcanois);

		// all Arcanoi listed
		actor.system.listdata.powers.arcanois.listedarcanois = _createList(actor.system.listdata.powers.arcanois.listedarcanois);

		// all Arcanoi Powers listed
		actor.system.listdata.powers.arcanois.listedarcanoipowers = _createList(actor.system.listdata.powers.arcanois.listedarcanoipowers);

		// all Arcanoi Powers not connected to an Arcanoi
		actor.system.listdata.powers.arcanois.unlistedarcanois = _createList(actor.system.listdata.powers.arcanois.unlistedarcanois);

		// all Arcanois and Arcanoi Powers collected
		actor.system.listdata.powers.arcanois.arcanoilist = _createList(actor.system.listdata.powers.arcanois.arcanoilist);
	}

	static async _sortArcanois(item, actor) {		
		if (item.system.type == "wod.types.arcanoi") {
			actor.system.listdata.powers.arcanois.listedarcanois.push(item);
		}
		if (item.system.type == "wod.types.arcanoipower") {			

			if (item.system.parentid != "") {
				item.system.level = item.system.level.toString();
				actor.system.listdata.powers.arcanois.listedarcanoipowers.push(item);
			}
			else {
				item.system.parentid == "";
				actor.system.listdata.powers.arcanois.unlistedarcanois.push(item);
			}					
		}
		if (item.system.type == "wod.types.ritual") {
			actor.system.listdata.powers.arcanois.rituallist.push(item);
		}
	}

	static async _organizeArcanois(actor) {
		actor.system.listdata.powers.arcanois.listedarcanois.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.arcanois.listedarcanoipowers.sort((a, b) => a.system.level.toString().localeCompare(b.system.level.toString()));	

		// add the correct arcanoi in the right list
		for (const arcanoi of actor.system.listdata.powers.arcanois.listedarcanois) {
			actor.system.listdata.powers.arcanois.arcanoilist.push(arcanoi);

			for (const power of actor.system.listdata.powers.arcanois.listedarcanoipowers) {
				if (power.system.parentid == arcanoi._id) {
					actor.system.listdata.powers.arcanois.arcanoilist.push(power);
				}
			}
		}

		actor.system.listdata.powers.arcanois.hasunlistedarcanois = actor.system.listdata.powers.arcanois.unlistedarcanois.length > 0 ? true : false;		
	}

	static async _sortStains(item, actor) {		
		if (item.system.type == "wod.types.stain") {
			actor.system.listdata.powers.stains.push(item);
		}
	}

	static async _organizeStains(actor) {
		actor.system.listdata.powers.stains.sort((a, b) => a.name.localeCompare(b.name));
	}

	static async _sortHorrors(item, actor) {		
		if (item.system.type == "wod.types.horror") {
			actor.system.listdata.powers.horrors.push(item);
		}
	}

	static async _organizeHorrors(actor) {
		actor.system.listdata.powers.horrors.sort((a, b) => a.name.localeCompare(b.name));
	}

	/**
   * Handle collapsing of item lists, mainly bonus lists.
   */
	static _onTableCollapse(event, actorId) {
		const element = event.currentTarget;
		const dataset = element.dataset;

		let isApacalypticForm = false;

		if (dataset.type.includes("apocalypticform")) {
			isApacalypticForm = true;
		}

		const et = $(event.currentTarget);

		if (et.hasClass('fa-angles-right')) { // collapsed
			et.removeClass("fa-angles-right");
			et.addClass("fa-angles-down");

			if (isApacalypticForm) {
				et.parent().parent().siblings('.'+dataset.type).removeClass("hide");
				et.parent().parent().siblings('.'+dataset.type).addClass("show");
			}
			else {
				et.parent().parent().parent().siblings('.'+dataset.type).removeClass("hide");
				et.parent().parent().parent().siblings('.'+dataset.type).addClass("show");
			}
		  
		  	// Update user flags, so that collapsed state is saved
			let updateData = {'flags':{'wod':{[actorId]:{[dataset.type]:{collapsed: false}}}}};
			game.user.update(updateData);
		  
		} 
		else { // not collapsed
		  	et.removeClass("fa-angles-down");
		  	et.addClass("fa-angles-right");

			if (isApacalypticForm) {
				et.parent().parent().siblings('.'+dataset.type).removeClass("show");
				et.parent().parent().siblings('.'+dataset.type).addClass("hide");
			}
			else {
				et.parent().parent().parent().siblings('.'+dataset.type).removeClass("show");
				et.parent().parent().parent().siblings('.'+dataset.type).addClass("hide");
			}
		  
		  	// Update user flags, so that collapsed state is saved
			let updateData = {'flags':{'wod':{[actorId]:{[dataset.type]:{collapsed: true}}}}};
			game.user.update(updateData);
		}
	}

	

	static GetAllItems(actor) {
		let items = actor.items.filter(item => item.type === "Item" || item.type === "Fetish");

		return items.sort((a, b) => {
			return a.system.type.localeCompare(b.system.type) || a.name.localeCompare(b.name);
		});
	}

	static GetAllNotes(actor) {
		let items = actor.items.filter(item => item.type === "Feature" || (item.type == "Trait" && (item.system.type == "wod.types.othertraits") || (item.system.type == "wod.types.shapeform") || (item.system.type == "wod.types.aspect")));

		return items.sort((a, b) => {
			return a.system.type.localeCompare(b.system.type) || a.name.localeCompare(b.name);
		});
	}

	static GetEarnedExperience(actor) {
		let items = actor.items.filter(item => item.type === "Experience" && (item.system.type == "wod.types.expgained"));

		// return items.sort((a, b) => {
		// 	return a.system.type.localeCompare(b.system.type) || a.name.localeCompare(b.name);
		// });
		return [...items].reverse();
	}

	static GetSpendExperience(actor) {
		let items = actor.items.filter(item => item.type === "Experience" && (item.system.type == "wod.types.expspent"));

		// return items.sort((a, b) => {
		// 	return a.system.type.localeCompare(b.system.type) || a.name.localeCompare(b.name);
		// });
		return [...items].reverse();
	}
}

function _createList(list) {
	if (list == undefined) {
		list = [];
	}

	return list;
}
