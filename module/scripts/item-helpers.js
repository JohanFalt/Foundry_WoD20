export default class ItemHelper {
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
		if ((removedItem.system.type == "wod.types.discipline") 
					|| (removedItem.system.type == "wod.types.disciplinepath") 
					|| (removedItem.system.type == "wod.types.art")) {
			for (const item of actor.items) {
				if (item.system.parentid == removedItem._id) {
					const itemData = duplicate(item);
                	itemData.system.parentid = "";
                	await item.update(itemData);
				}
			}
		}
	}

    static async _sortAbilities(actor, config) {
		actor.system.listdata.ability_talents = [];
        actor.system.listdata.ability_skills = [];
        actor.system.listdata.ability_knowledges = [];

        for (const i in config.talents) {
			if (actor.system.abilities.talent[i].isvisible) {
				let talent = actor.system.abilities.talent[i];
				talent._id = i;
				talent.issecondary = false;
				talent.name = game.i18n.localize(talent.label);

				actor.system.listdata.ability_talents.push(talent);
			}
		}

		for (const i in config.skills) {
			if (actor.system.abilities.skill[i].isvisible) {
				let skill = actor.system.abilities.skill[i];
				skill._id = i;
				skill.issecondary = false;
				skill.name = game.i18n.localize(skill.label);		

				actor.system.listdata.ability_skills.push(skill);
			}
		}

		for (const i in config.knowledges) {
			if (actor.system.abilities.knowledge[i].isvisible) {
				let knowledge = actor.system.abilities.knowledge[i];
				knowledge._id = i;
				knowledge.issecondary = false;
				knowledge.name = game.i18n.localize(knowledge.label);

				actor.system.listdata.ability_knowledges.push(knowledge);
			}
		}
    }

	static async _sortItems(actor) {
		actor.system.listdata.combat = [];

		actor.system.listdata.combat.naturalWeapons = [];
		actor.system.listdata.combat.meleeWeapons = [];
		actor.system.listdata.combat.rangedWeapons = [];
		actor.system.listdata.combat.armors = [];

		actor.system.listdata.gear = [];

		actor.system.listdata.gear.fetishlist = [];
		actor.system.listdata.gear.talenlist = [];
		actor.system.listdata.gear.treasures = [];

		actor.system.listdata.features = [];

		actor.system.listdata.features.backgrounds = [];
		actor.system.listdata.features.merits = [];
		actor.system.listdata.features.flaws = [];
		actor.system.listdata.features.bloodbounds = [];

		actor.system.listdata.experiences = [];

		actor.system.listdata.experiences.expearned = [];
		actor.system.listdata.experiences.expspend = [];
		actor.system.listdata.experiences.totalExp = 0;
		actor.system.listdata.experiences.spentExp = 0;
		actor.system.listdata.experiences.experience = 0;

		actor.system.listdata.traits = [];

		actor.system.listdata.traits.othertraits = [];

		actor.system.listdata.powers = [];

		actor.system.listdata.meleeAbilities = [];
		actor.system.listdata.rangedAbilities = [];

		if (actor.system.settings.powers.hasgifts) {
			this._createGiftStructure(actor);
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

		// If no items then Power structure needs to be created regardless...
		for (const item of actor.items) {
			await this._sortCombat(item, actor);
			await this._sortGear(item, actor);
			await this._sortFeatures(item, actor);
			await this._sortExperiences(item, actor);
			await this._sortTraits(item, actor);				
			await this._sortPowers(item, actor);
		}						

		actor.system.listdata.meleeAbilities.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.rangedAbilities.sort((a, b) => a.name.localeCompare(b.name));

		// Weapons
		actor.system.listdata.combat.naturalWeapons.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.combat.meleeWeapons.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.combat.rangedWeapons.sort((a, b) => a.name.localeCompare(b.name));

		// Armor
		actor.system.listdata.combat.armors.sort((a, b) => a.name.localeCompare(b.name));

		// Gear
		actor.system.listdata.gear.fetishlist.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.gear.talenlist.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.gear.treasures.sort((a, b) => a.name.localeCompare(b.name));

		// Notes
		actor.system.listdata.features.backgrounds.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.features.merits.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.features.flaws.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.features.bloodbounds.sort((a, b) => a.name.localeCompare(b.name));
		
		actor.system.listdata.traits.othertraits.sort((a, b) => a.name.localeCompare(b.name));		

		// Powers
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

		// Experience Points
		actor.system.listdata.experiences.experience = actor.system.listdata.experiences.totalExp - actor.system.listdata.experiences.spentExp;
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
		if (item.type == "Fetish") {
			if (item.system.type == "wod.types.fetish") {
				actor.system.listdata.gear.fetishlist.push(item);
			}
			if (item.system.type == "wod.types.talen") {
				actor.system.listdata.gear.talenlist.push(item);
			}			
		}
		if (item.type == "Item") {
			if (item.system.type == "wod.types.treasure") {
				actor.system.listdata.gear.treasures.push(item);
			}
		}
	}

	static async _sortFeatures(item, actor) {
		if (item.type == "Feature") {
			if (item.system.type == "wod.types.background") {
				actor.system.listdata.features.backgrounds.push(item);
			}
			if (item.system.type == "wod.types.merit") {
				actor.system.listdata.features.merits.push(item);
			}
			if (item.system.type == "wod.types.flaw") {
				actor.system.listdata.features.flaws.push(item);
			}
			if (item.system.type == "wod.types.bloodbound") {
				actor.system.listdata.features.bloodbounds.push(item);
			}
		}
	}

	static async _sortExperiences(item, actor) {
		if (item.type == "Experience") {
			if (item.system.type == "wod.types.expgained") {
				actor.system.listdata.experiences.expearned.push(item);
				actor.system.listdata.experiences.totalExp += parseInt(item.system.amount);
			}
			if (item.system.type == "wod.types.expspent") {
				actor.system.listdata.experiences.expspend.push(item);

				if (item.system.isspent) {
					actor.system.listdata.experiences.spentExp += parseInt(item.system.amount);
				}
			}
		}
	}

	static async _sortTraits(item, actor) {
		if (item.type == "Trait") {
			if (item.system.type == "wod.types.talentsecondability") {
				const trait = {
					issecondary: true,
					isvisible: true,
					label: item.system.label,
					max: item.system.max,
					name: item.name,
					speciality: item.system.speciality,
					value: item.system.value,
					_id: item._id
				}

				actor.system.listdata.ability_talents.push(trait);

				if (item.system.ismeleeweapon) {
					actor.system.listdata.meleeAbilities.push(item);
				}
				if (item.system.israngedeweapon) {
					actor.system.listdata.rangedAbilities.push(item);
				}
			}
			if (item.system.type == "wod.types.skillsecondability") {
				const trait = {
					issecondary: true,
					isvisible: true,
					label: item.system.label,
					max: item.system.max,
					name: item.name,
					speciality: item.system.speciality,
					value: item.system.value,
					_id: item._id
				}

				actor.system.listdata.ability_skills.push(trait);

				if (item.system.ismeleeweapon) {
					actor.system.listdata.meleeAbilities.push(item);
				}
				if (item.system.israngedeweapon) {
					actor.system.listdata.rangedAbilities.push(item);
				}
			}
			if (item.system.type == "wod.types.knowledgesecondability") {
				const trait = {
					issecondary: true,
					isvisible: true,
					label: item.system.label,
					max: item.system.max,
					name: item.name,
					speciality: item.system.speciality,
					value: item.system.value,
					_id: item._id
				}

				actor.system.listdata.ability_knowledges.push(trait);

				if (item.system.ismeleeweapon) {
					actor.system.listdata.meleeAbilities.push(item);
				}
				if (item.system.israngedeweapon) {
					actor.system.listdata.rangedAbilities.push(item);
				}
			}
			if (item.system.type == "wod.types.othertraits") {
				actor.system.listdata.traits.othertraits.push(item);
			}
		}
	}

	static async _sortPowers(item, actor) {
		if (item.type == "Power") {
			if (actor.system.settings.powers.hasgifts) {
				this._sortGifts(item, actor);
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
		}			
	}

	static async _sortGifts(item, actor) {
		if (item.system.type == "wod.types.gift") {
			actor.system.listdata.powers.gifts.giftlist.push(item);

			if (item.system.level == 1) {						
				actor.system.listdata.powers.gifts.powerlist1.push(item);

				if (item.system.isactive) {
					actor.system.listdata.powers.gifts.powercombat.push(item);
				}
			}			
			if (item.system.level == 2) {
				actor.system.listdata.powers.gifts.powerlist2.push(item);

				if (item.system.isactive) {
					actor.system.listdata.powers.gifts.powercombat.push(item);
				}
			}
			if (item.system.level == 3) {
				actor.system.listdata.powers.gifts.powerlist3.push(item);

				if (item.system.isactive) {
					actor.system.listdata.powers.gifts.powercombat.push(item);
				}
			}
			if (item.system.level == 4) {
				actor.system.listdata.powers.gifts.powerlist4.push(item);

				if (item.system.isactive) {
					actor.system.listdata.powers.gifts.powercombat.push(item);
				}
			}
			if (item.system.level == 5) {
				actor.system.listdata.powers.gifts.powerlist5.push(item);

				if (item.system.isactive) {
					actor.system.listdata.powers.gifts.powercombat.push(item);
				}
			}
			if (item.system.level == 6) {
				actor.system.listdata.powers.gifts.powerlist6.push(item);

				if (item.system.isactive) {
					actor.system.listdata.powers.gifts.powercombat.push(item);
				}
			}
		}				
		if (item.system.type == "wod.types.rite") {
			actor.system.listdata.powers.gifts.ritelist.push(item);
		}			
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
		actor.system.listdata.powers.disciplines.listeddisciplinepowers.sort((a, b) => a.system.level.localeCompare(b.system.level));	

		// add the correct discipline in the right list
		for (const discipline of actor.system.listdata.powers.disciplines.listeddisciplines) {
			actor.system.listdata.powers.disciplines.disciplinelist.push(discipline);

			for (const power of actor.system.listdata.powers.disciplines.listeddisciplinepowers) {
				if (power.system.parentid == discipline._id) {
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
				const item = actor.getEmbeddedDocument("Item", power._id);
				const itemData = duplicate(item);
                itemData.system.parentid = "";
                await item.update(itemData);
			}
		}

		actor.system.listdata.powers.disciplines.listedpaths.sort((a, b) => a.name.localeCompare(b.name));
		actor.system.listdata.powers.disciplines.listedpathpowers.sort((a, b) => a.system.level.localeCompare(b.system.level));	

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
		actor.system.listdata.powers.arts.listedartpowers.sort((a, b) => a.system.level.localeCompare(b.system.level));	

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
		actor.system.listdata.powers.edges.listededgepowers.sort((a, b) => a.system.level.localeCompare(b.system.level));	

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
}

function _createList(list) {
	if (list == undefined) {
		list = [];
	}

	return list;
}