import AbilityHelper from "./ability-helpers.js";
import BonusHelper from "./bonus-helpers.js";

export default class CreateHelper {

	static async SetAbilities(actorCopy, type, era) {
		console.log(`WoD | Set ${type} Abilities - ${era}`);

		// hide all
		for (const ability in actorCopy.system.abilities) {
			if (actorCopy.system.abilities[ability] != undefined) {
				if (actorCopy.system.abilities[ability].value == 0) {
					actorCopy.system.abilities[ability].isvisible = false;
				}
			}
		}

		if (type == "demon") {
			if (game.settings.get('worldofdarkness', 'demonSystemSettings') == "20th") {
				era = "modern20";
			}
		}

		for (const talent in game.worldofdarkness.abilities[type][era].talents) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities[type][era].talents[talent]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities[type][era].talents[talent]].isvisible = true;
			}
		}

		for (const skill in game.worldofdarkness.abilities[type][era].skills) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities[type][era].skills[skill]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities[type][era].skills[skill]].isvisible = true;
			}
		}

		for (const knowledge in game.worldofdarkness.abilities[type][era].knowledges) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities[type][era].knowledges[knowledge]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities[type][era].knowledges[knowledge]].isvisible = true;
			}
		}

		if (type == "hunter") {
			actorCopy.system.abilities.technology.type = "skill";
		}
		if (type == "demon") {
			if (game.settings.get('worldofdarkness', 'demonSystemSettings') != "20th") {
				actorCopy.system.abilities.technology.type = "skill";
			}
		}
		if (type == "wraith") {
			actorCopy.system.abilities.leadership.type = "skill";
		}
		if (type == "orpheus") {
			actorCopy.system.abilities.technology.type = "skill";
		}
		if (type == "sorcerer") {
			actorCopy.system.abilities.technology.type = "skill";
		}
		if (type == "mummy") {
			actorCopy.system.abilities.technology.type = "skill";
		}

		return actorCopy;
	}
    
    static async SetMortalAbilities(actor, era) {
		console.log(`WoD | Set Mortal Abilities - ${era}`);		

		if (era == "victorian") {
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", "Ride", parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}

		if (era == "darkages") {
			await AbilityHelper.CreateAbility(actor, "wod.types.talentsecondability", game.i18n.localize("wod.abilities.legerdemain"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.archery"), parseInt(actor.system.settings.abilities.defaultmaxvalue), false, true);
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.commerce"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.hearthwisdom"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.seneschal"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.theology"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}

		if (era == "classical") {
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.archery"), parseInt(actor.system.settings.abilities.defaultmaxvalue), false, true);
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.commerce"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.hearthwisdom"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.philosophy"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.religion"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.ritualistics"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}

		if (era == "livinggods") {
			await AbilityHelper.CreateAbility(actor, "wod.types.talentsecondability", game.i18n.localize("wod.abilities.legerdemain"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.archery"), parseInt(actor.system.settings.abilities.defaultmaxvalue), false, true);
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.commerce"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.ancientmedicine"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.astrology"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
            await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.customs"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.hearthwisdom"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.mythology"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.seneschal"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.writing"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}
	}	

	static async SetOrpheusAbilities(actorCopy, actor) {
		console.log(`WoD | Set Orpheus Abilities - Modern`);
		const era = 'modern';

		await this.SetAbilities(actorCopy, "orpheus", era);
		actorCopy.system.abilities.technology.type = "skill";		
		
		AbilityHelper.CreateAbility_nowait(actor, "wod.types.talentsecondability", "Intrigue", parseInt(actor.system.settings.abilities.defaultmaxvalue));
		AbilityHelper.CreateAbility_nowait(actor, "wod.types.othertraits", "Dead-Eyes", 0);
		AbilityHelper.CreateAbility_nowait(actor, "wod.types.othertraits", "Detect Nature Group", 0);
		AbilityHelper.CreateAbility_nowait(actor, "wod.types.othertraits", "Incorporeal & Invisible", 0);
		AbilityHelper.CreateAbility_nowait(actor, "wod.types.othertraits", "Manifest", 0);
		AbilityHelper.CreateAbility_nowait(actor, "wod.types.othertraits", "Misery Loves Company", 0);
		AbilityHelper.CreateAbility_nowait(actor, "wod.types.othertraits", "Sense Lifeline", 0);
		AbilityHelper.CreateAbility_nowait(actor, "wod.types.othertraits", "Sever the Strand", 0);
		AbilityHelper.CreateAbility_nowait(actor, "wod.types.othertraits", "Thievery", 0);

		return actorCopy;
	}

	static async SetSorcererAbilities(actorCopy) {
		console.log(`WoD | Set Sorcerer Abilities - Modern`);
		const era = 'modern';

		await this.SetAbilities(actorCopy, "sorcerer", era);

		actorCopy.system.abilities.technology.type = "skill";
		actorCopy.system.abilities.research.type = "skill";

		return actorCopy;
	}

	static async SetVampireAbilities(actor, era) {	
		console.log(`WoD | Set Vampire Abilities`);

		if (era == "victorian") {
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}

		if (era == "darkages") {
			await AbilityHelper.CreateAbility(actor, "wod.types.talentsecondability", game.i18n.localize("wod.abilities.legerdemain"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.archery"), parseInt(actor.system.settings.abilities.defaultmaxvalue), false, true);
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.commerce"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.hearthwisdom"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.seneschal"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.theology"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}

		if (era == "classical") {
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.archery"), parseInt(actor.system.settings.abilities.defaultmaxvalue), false, true);
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.commerce"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.hearthwisdom"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.philosophy"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.religion"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.ritualistics"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}

		if (era == "livinggods") {
			await AbilityHelper.CreateAbility(actor, "wod.types.talentsecondability", game.i18n.localize("wod.abilities.legerdemain"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.archery"), parseInt(actor.system.settings.abilities.defaultmaxvalue), false, true);
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.commerce"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.ancientmedicine"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.astrology"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
            await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.customs"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.hearthwisdom"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.mythology"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.seneschal"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.writing"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}
	}

	static async SetChangelingAbilities(actor) {	
		console.log(`WoD | Set Changeling Abilities`);
		let exists = false;

		try {
			let itemData = {
				name: "actor",
				type: "Trait",					
				system: {
					iscreated: true,
					version: game.data.system.version,
					label: "wod.realms.actor",
					type: "wod.types.realms"
				}
			};
			exists = await AbilityHelper.CheckItemExists(actor, "Trait", "wod.types.realms", "actor");
			if (!exists) {
				await actor.updateSource({ items: [itemData]});
			}			
			
			itemData = {
				name: "fae",
				type: "Trait",
				system: {
					iscreated: true,
					version: game.data.system.version,
					label: "wod.realms.fae",
					type: "wod.types.realms"
				}
			};
			exists = await AbilityHelper.CheckItemExists(actor, "Trait", "wod.types.realms", "fae");
			if (!exists) {
				await actor.updateSource({ items: [itemData]});
			}
	
			itemData = {
				name: "nature",
				type: "Trait",
				system: {
					iscreated: true,
					version: game.data.system.version,
					label: "wod.realms.nature",
					type: "wod.types.realms"
				}
			};
			exists = await AbilityHelper.CheckItemExists(actor, "Trait", "wod.types.realms", "nature");
			if (!exists) {
				await actor.updateSource({ items: [itemData]});
			}
	
			itemData = {
				name: "prop",
				type: "Trait",
				system: {
					iscreated: true,
					version: game.data.system.version,
					label: "wod.realms.prop",
					type: "wod.types.realms"
				}
			};
			exists = await AbilityHelper.CheckItemExists(actor, "Trait", "wod.types.realms", "prop");
			if (!exists) {
				await actor.updateSource({ items: [itemData]});
			}
	
			itemData = {
				name: "scene",
				type: "Trait",
				system: {
					iscreated: true,
					version: game.data.system.version,
					label: "wod.realms.scene",
					type: "wod.types.realms"
				}
			};
			exists = await AbilityHelper.CheckItemExists(actor, "Trait", "wod.types.realms", "scene");
			if (!exists) {
				await actor.updateSource({ items: [itemData]});
			}
	
			itemData = {
				name: "time",
				type: "Trait",
				system: {
					iscreated: true,
					version: game.data.system.version,
					label: "wod.realms.time",
					type: "wod.types.realms"
				}
			};				
			exists = await AbilityHelper.CheckItemExists(actor, "Trait", "wod.types.realms", "time");
			if (!exists) {
				await actor.updateSource({ items: [itemData]});
			}
		}
		catch (err) {
            err.message = `Failed SetChangelingAbilities Actor ${actor.name}: ${err.message}`;
            console.error(err);
        }		
	}

	static async SetWerewolfAbilities(actor, era) {	
		console.log(`WoD | Set Werewolf Abilities - ${era}`);

		if (era == "victorian") {
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), 5);
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.culture"), 5);
		}

		if (era == "darkages") {
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.archery"), 5, false, true);
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), 5);
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.hearthwisdom"), 5);
		}
	}

	static async SetDemonAbilities(actor) {	
		console.log(`WoD | Set Demon Abilities`);

		try {
			const items = actor.items.filter(item => item.type === "Trait" && item.system.type === "wod.types.apocalypticform");
			const exists = items.length >= 8;

			if ((game.settings.get('worldofdarkness', 'demonCreateForms')) && (!exists))  {
				console.log(`CREATION: Adds missing Apocalyptic Forms to ${actor.name}`);

				const number = 8 - items.length;
				
				for (let i = 1; i <= number; i++) {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.apocalypticform"),
						type: "Trait",						
						system: {
							iscreated: true,
							version: game.data.system.version,
							level: 0,
							type: "wod.types.apocalypticform"
						}
					};
					await actor.updateSource({ items: [itemData]});
				}
			}
		}
		catch (err) {
            err.message = `Failed SetDemonAbilities Actor ${actor.name}: ${err.message}`;
            console.error(err);
        }		
	}

	static async SetCreatureAbilities(actor) {
		console.log('WoD | Set Creature Abilities');

		// hide all
		for (const ability in actor.system.abilities) {
			if (actor.system.abilities[ability] != undefined) {
				if (actor.system.abilities[ability].value == 0) {
					actor.system.abilities[ability].isvisible = false;
				}
			}
		}	

		return actor;
	}
	
	static async SetMortalAttributes(actor) {
		console.log('WoD | Set Mortal Attributes');

		let willpower = -1;

		for (const attribute in actor.system.attributes) {
			actor.system.attributes[attribute].isvisible = true;
		}

		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
			actor.system.attributes.appearance.isvisible = false;
			actor.system.attributes.perception.isvisible = false;

			if (CONFIG.worldofdarkness.fifthEditionWillpowerSetting == "20th") {
				actor.system.advantages.willpower.permanent = 0;
			}
			else {
				actor.system.advantages.willpower.permanent = 2;
			}			
		}
		else {
			actor.system.attributes.composure.isvisible = false;
			actor.system.attributes.resolve.isvisible = false;
			actor.system.advantages.willpower.permanent = 0;
		}
	
		if (CONFIG.worldofdarkness.rollSettings) {
			willpower = actor.system.advantages.willpower.permanent; 
		}
		else {
			willpower = actor.system.advantages.willpower.permanent > actor.system.advantages.willpower.temporary ? actor.system.advantages.willpower.temporary : actor.system.advantages.willpower.permanent; 
		}
	
		actor.system.advantages.willpower.roll = willpower;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.haswillpower = true;

		return actor;
	}

	static async SetVampireAttributes(actor) {
		console.log('WoD | Set Vampire Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.haspath = true;
		actor.system.settings.hasbloodpool = true;		
		actor.system.settings.hasvirtue = true;

		actor.system.settings.powers.hasdisciplines = true;

		return actor;
	}

	static async SetWerewolfAttributes(actor) {
		console.log('WoD | Set Werewolf Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = true;

		actor.system.settings.hasrage = true;
		actor.system.settings.hasgnosis = true;

		actor.system.settings.powers.hasgifts = true;

		return actor;
	}

	static async SetShifterAttributes(actor, type) {
		console.log('WoD | Set Shifter Attributes');

		actor = await this.SetWerewolfAttributes(actor);

		actor.system.changingbreed = type;
		actor.system.settings.hasrage = true;
		actor.system.settings.hasbloodpool = false;

		if ((type == "Ananasi") || (type == "Nuwisha")) {
			actor.system.settings.hasrage = false;
		}
		if (type == "Ananasi") {
			actor.system.settings.hasbloodpool = true;
		}

		return actor;
	}

	static async SetMageAttributes(actor) {
		console.log('WoD | Set Mage Attributes');

		actor.system.advantages.arete.permanent = 1;
		actor.system.advantages.arete.roll = 1;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.abilities.technology.type = "skill";
		actor.system.abilities.research.type = "skill";

		return actor;
	}

	static async SetChangelingAttributes(actor) {
		console.log('WoD | Set Changeling Attributes');

		actor.system.settings.soak.chimerical.bashing.isrollable = true;
		actor.system.settings.soak.chimerical.lethal.isrollable = true;
		actor.system.settings.soak.chimerical.aggravated.isrollable = false;
		
		actor.system.settings.hasglamour = true;
		actor.system.settings.hasbanality = true;

		actor.system.settings.powers.hasarts = true;

		return actor;
	}

	static async SetHunterAttributes(actor) {
		console.log('WoD | Set Hunter Attributes');

		actor.system.settings.hasconviction = true;
		actor.system.settings.hasvirtue = true;

		actor.system.settings.powers.hasedges = true;

		return actor;
	}

	static async SetDemonAttributes(actor) {
		console.log('WoD | Set Demon Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.hasvirtue = true;
		actor.system.settings.hasfaith = true;
		actor.system.settings.hastorment = true;
		
		actor.system.settings.powers.haslores = true;

		actor.system.advantages.virtues.selfcontrol.label = "wod.advantages.virtue.conviction";

		return actor;
	}

	static async SetWraithAttributes(actor) {
		console.log('WoD | Set Wraith Attributes');

		actor.system.settings.hascorpus = true;
		actor.system.settings.haspathos = true;

		actor.system.settings.powers.hasarcanois = true;

		return actor;
	}

	static async SetOrpheusAttributes(actor) {
		console.log('WoD | Set Orpheus Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = false;

		return actor;
	}

	static async SetSorcererAttributes(actor) {
		console.log('WoD | Set Sorcerer Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;

		return actor;
	}

	static async SetMummyAttributes(actor) {
		console.log('WoD | Set Mummy Attributes');

		actor.system.settings.hasbalance = true;
		actor.system.settings.hassekhem = true;
		actor.system.settings.powers.hashekau = true;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = false;

		return actor;
	}

	static async SetExaltedAttributes(actor) {
		console.log('WoD | Set Exalted Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = true;

		

		return actor;
	}

	static async SetCreatureAttributes(actor) {
		console.log('WoD | Set Creature Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.powers.haspowers = true;

		return actor;
	}

	static async SetSpiritAttributes(actor) {
		console.log('WoD | Set Spirit Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = true;
	}

	static async SetChangingVariant(actorData, variant) {
		actorData.system.settings.variant = variant;

		if (actorData.type == CONFIG.worldofdarkness.sheettype.changeling) {
			if ((actorData.system.settings.variant == 'nunnehi') || (actorData.system.settings.variant == 'menehune')) {
				actorData.system.advantages.glamour.label = 'wod.advantages.mana';
			}
			else {
				actorData.system.advantages.glamour.label = 'wod.advantages.glamour';
			}
		}

		return actorData;
	}

	static async SetVampireVariant(actorData, variant) {
		actorData.system.settings.variant = variant;

		if (actorData.system.settings.variant == 'general') {
			actorData.system.settings.hasbloodpool = true;	
			actorData.system.settings.hasvirtue = true;
			actorData.system.settings.haspath = true;
		}
		if (actorData.system.settings.variant == 'kindredeast') {
			actorData.system.settings.hasbloodpool = false;	
			actorData.system.settings.hasvirtue = false;
			actorData.system.settings.haspath = false;
		}

		return actorData;
	}

	static async SetExaltedVariant(actorData, variant) {
		actorData.system.settings.variant = variant;

		return actorData;
	}

	static async SetMortalVariant(actor, actorData, variant) {
		actorData.system.settings.variant = variant;

		actorData.system.settings.haswillpower = true;

		actorData.system.settings.hasrage = false;
		actorData.system.settings.hasgnosis = false;						
		actorData.system.settings.haspath = false;
		actorData.system.settings.hasbloodpool = false;
		actorData.system.settings.hasvirtue = false;
		actorData.system.settings.hasglamour = false;
		actorData.system.settings.hasbanality = false;
		actorData.system.settings.hasnightmare = false;
		actorData.system.settings.hasconviction = false;
		actorData.system.settings.hasfaith = false;
		actorData.system.settings.hastorment = false;
		actorData.system.settings.hasessence = false;
		actorData.system.settings.hasbalance = false;
		actorData.system.settings.hassekhem = false;

		actorData.system.settings.powers.hasdisciplines = false;
		actorData.system.settings.powers.hasgifts = false;
		actorData.system.settings.powers.hasarts = false;
		actorData.system.settings.powers.hasedges = false;
		actorData.system.settings.powers.haslores = false;
		actorData.system.settings.powers.hascharms = false;
		actorData.system.settings.powers.haspowers = false;
		actorData.system.settings.powers.hashekau = false;
		actorData.system.settings.powers.hasnumina = false;		

		actorData.system.settings.powers.hashorrors = false;
		actorData.system.settings.powers.hasstains = false;
		actorData.system.settings.hasvitality = false;
		actorData.system.settings.hasspite = false;

		actorData.system.settings.hasquintessence = false;		

		if (actorData.type == CONFIG.worldofdarkness.sheettype.mortal) {
			actorData.system.settings.variantsheet = "";

			if (variant == 'general') {
			}
			if (variant == 'orpheus') {
				actorData = await this.SetOrpheusAbilities(actorData, actor);
				actorData = await this.SetOrpheusAttributes(actorData);

				actorData.system.settings.hasvitality = true;
				actorData.system.settings.hasspite = true;
				actorData.system.settings.powers.hashorrors = true;
				actorData.system.settings.powers.hasstains = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.wraith;
			}
			if (variant == 'sorcerer') {
				actorData = await this.SetSorcererAbilities(actorData);
				actorData = await this.SetSorcererAttributes(actorData);

				actorData.system.settings.hasquintessence = true;
				actorData.system.settings.powers.hasnumina = true;

				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.mage;
			}
			if (variant == 'autumnpeople') {
				actorData.system.settings.hasbanality = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.changeling;
			}
			if (variant == 'enchanted') {
				actorData.system.settings.hasglamour = true;
				actorData.system.settings.hasbanality = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.changeling;
			}
			if (variant == 'ghoul') {
				actorData.system.settings.haspath = true;
				actorData.system.settings.hasbloodpool = true;
				actorData.system.settings.hasvirtue = true;
				actorData.system.settings.powers.hasdisciplines = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.vampire;
			}
			if (variant == 'kinfolk') {
				actorData.system.settings.hasgnosis = true;
				actorData.system.settings.powers.hasgifts = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.werewolf;
			}
			if (variant == 'truefaith') {
				actorData.system.settings.hasfaith = true;	
				actorData.system.settings.powers.haspowers = true;			
			}
		}

		return actorData;
	}	

	static async SetCreatureVariant(actorData, variant) {
		actorData.system.settings.variant = variant;

		actorData.system.settings.haswillpower = true;
		actorData.system.settings.soak.bashing.isrollable = true;
		actorData.system.settings.powers.haspowers = true;	
		
		actorData.system.settings.hasrage = false;
		actorData.system.settings.hasgnosis = false;						
		actorData.system.settings.haspath = false;
		actorData.system.settings.hasbloodpool = false;
		actorData.system.settings.hasvirtue = false;
		actorData.system.settings.hasglamour = false;
		actorData.system.settings.hasbanality = false;
		actorData.system.settings.hasnightmare = false;
		actorData.system.settings.hasconviction = false;
		actorData.system.settings.hasfaith = false;
		actorData.system.settings.hastorment = false;
		actorData.system.settings.hasessence = false;
		actorData.system.settings.hasbalance = false;
		actorData.system.settings.hassekhem = false;

		actorData.system.settings.powers.hasdisciplines = false;
		actorData.system.settings.powers.hasgifts = false;
		actorData.system.settings.powers.hasarts = false;
		actorData.system.settings.powers.hasedges = false;
		actorData.system.settings.powers.haslores = false;
		actorData.system.settings.powers.hascharms = false;
		actorData.system.settings.powers.hashekau = false;			

		if (actorData.type == CONFIG.worldofdarkness.sheettype.creature) {
			actorData.system.settings.variantsheet = "";

			if (variant == 'general') {
				
			}
			if (variant == 'chimera') {
				actorData.system.settings.hasglamour = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.changeling;
			}
			if (variant == 'familiar') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.hasgnosis = true;
				actorData.system.settings.hasessence = true;
				actorData.system.settings.powers.hascharms = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.mage;
			}
			if (variant == 'construct') {
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.mage;
			}
			if (variant == 'spirit') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.hasgnosis = true;	
				actorData.system.settings.hasessence = true;
				actorData.system.settings.powers.hasgifts = true;
				actorData.system.settings.powers.hascharms = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
			}
			if (variant == 'warwolves') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.werewolf;
			}
			if (variant == 'anurana') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.hasgnosis = true;	
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.werewolf;
			}
			if (variant == 'samsa') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.hasgnosis = true;	
				actorData.system.settings.powers.hasgifts = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.werewolf;
			}
			if (variant == 'kerasi') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.hasgnosis = true;	
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.werewolf;
			}
			if (variant == 'yeren') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.hasgnosis = true;	
				actorData.system.settings.powers.hasgifts = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.werewolf;
			}
			if (variant == 'earthbound') {
				actorData.system.settings.hasfaith = true;
				actorData.system.settings.hastorment = true;
				actorData.system.settings.hasbloodpool = true;
				actorData.system.settings.powers.haslores = true;
				actorData.system.settings.variantsheet = CONFIG.worldofdarkness.sheettype.demon;
			}
		}

		return actorData;
	}

	static async SetVariantItems(actor, variant, version) {
		let itemData;
		let item;

		if (variant == 'warwolves') {
			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.crinos"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power"
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			let id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 4, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 1, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 3, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.manipulation"), "manipulation", -3, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);
		}
		if (variant == 'anurana') {
			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.anuran"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power",
					version: version
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			let id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 1, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 1, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 1, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.appearance"), "appearance", -2, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.dagon"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power",
					version: version
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 2, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 2, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 2, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);
		}
		if (variant == 'samsa') {
			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.ungeziefer"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power",
					version: version
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			let id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 3, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 1, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 3, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);
		}
		if (variant == 'kerasi') {
			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.bandia"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power",
					version: version
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			let id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 3, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 2, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.manipulation"), "manipulation", -2, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.appearance"), "appearance", -2, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateSoakBuff(id, game.i18n.localize("wod.labels.bonus.soakbonus"), 1, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.kiforu"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power",
					version: version
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 5, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", -1, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 5, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.manipulation"), "manipulation", -4, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateSoakBuff(id, game.i18n.localize("wod.labels.bonus.soakbonus"), 3, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.faru"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power",
					version: version
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 4, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 4, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);
		}
		if (variant == 'yeren') {
			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.crinos"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power",
					verison: version
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			let id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 3, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 2, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 2, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.appearance"), "appearance", -3, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAbilityBuff(id, game.i18n.localize("wod.labels.bonus.abilities.athletics"), "athletics", 2, true, version);
			await actor.createEmbeddedDocuments("Item", [itemData]);
		}
	}

	static async CreateShape(actor, version) {
		if (!actor.system.settings.isshapecreated) {
			let itemData;

			itemData = await BonusHelper.CreateAttributeBuff("glabro", game.i18n.localize("wod.shapes.glabro") + " - " + game.i18n.localize("wod.attributes.bonus.strength"), "strength", 2, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("glabro", game.i18n.localize("wod.shapes.glabro") + " - " + game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 2, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("glabro", game.i18n.localize("wod.shapes.glabro") + " - " + game.i18n.localize("wod.attributes.bonus.manipulation"), "manipulation", -2, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("glabro", game.i18n.localize("wod.shapes.glabro") + " - " + game.i18n.localize("wod.attributes.bonus.appearance"), "appearance", -1, false, version);
			await actor.updateSource({ items: [itemData]});

			/* CRINOS */
			itemData = await BonusHelper.CreateAttributeBuff("crinos", game.i18n.localize("wod.shapes.crinos") + " - " + game.i18n.localize("wod.attributes.bonus.strength"), "strength", 4, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("crinos", game.i18n.localize("wod.shapes.crinos") + " - " + game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 3, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("crinos", game.i18n.localize("wod.shapes.crinos") + " - " + game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 1, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("crinos", game.i18n.localize("wod.shapes.crinos") + " - " + game.i18n.localize("wod.attributes.bonus.manipulation"), "manipulation", -3, false, version);
			await actor.updateSource({ items: [itemData]});

			/* HISPO */
			itemData = await BonusHelper.CreateAttributeBuff("hispo", game.i18n.localize("wod.shapes.hispo") + " - " + game.i18n.localize("wod.attributes.bonus.strength"), "strength", 3, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("hispo", game.i18n.localize("wod.shapes.hispo") + " - " + game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 2, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("hispo", game.i18n.localize("wod.shapes.hispo") + " - " + game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 3, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("hispo", game.i18n.localize("wod.shapes.hispo") + " " + game.i18n.localize("wod.attributes.bonus.manipulation"), "manipulation", -3, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeDiff("hispo", game.i18n.localize("wod.shapes.hispo") + " - " + game.i18n.localize("wod.attributes.diff.perception"), "perception", -1, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeDiff("hispo", game.i18n.localize("wod.shapes.hispo") + " - " + game.i18n.localize("wod.attributes.diff.wits"), "wits", -1, false, version);
			await actor.updateSource({ items: [itemData]});

			/* LUPUS */
			itemData = await BonusHelper.CreateAttributeBuff("lupus", game.i18n.localize("wod.shapes.lupus") + " - " + game.i18n.localize("wod.attributes.bonus.strength"), "strength", 1, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("lupus", game.i18n.localize("wod.shapes.lupus") + " - " + game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 2, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("lupus", game.i18n.localize("wod.shapes.lupus") + " - " + game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 2, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeBuff("lupus", game.i18n.localize("wod.shapes.lupus") + " " + game.i18n.localize("wod.attributes.bonus.manipulation"), "manipulation", -3, false, version);
			await actor.updateSource({ items: [itemData]});
			
			itemData = await BonusHelper.CreateAttributeDiff("lupus", game.i18n.localize("wod.shapes.lupus") + " - " + game.i18n.localize("wod.attributes.diff.perception"), "perception", -2, false, version);
			await actor.updateSource({ items: [itemData]});

			itemData = await BonusHelper.CreateAttributeDiff("lupus", game.i18n.localize("wod.shapes.lupus") + " - " + game.i18n.localize("wod.attributes.diff.wits"), "wits", -2, false, version);
			await actor.updateSource({ items: [itemData]});
		}
	}

	static async CreateItem(actor, itemData) {
		const createdItem = await actor.createEmbeddedDocuments("Item", [itemData]);
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

	static async CreateItemPower(type, setting) {
		let itemData = undefined;

		type = type.toLowerCase();

		if (type == "gift") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.gift"),
				type: "Power",
				system: {
					level: 1,
					game: "werewolf",
					type: "wod.types.gift"
				}
			};
		}
		if (type == "charm") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.charm"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.charm"
				}
			};
		}
		if (type == "rite") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.rite"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.rite"
				}
			};
		}
		if (type == "discipline") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.discipline"),
				type: "Power",
				system: {
					game: "vampire",
					type: "wod.types.discipline"
				}
			};
		}
		if (type == "disciplinepower") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.disciplinepower"),
				type: "Power",
				system: {
					level: 1,
					game: "vampire",
					type: "wod.types.disciplinepower"
				}
			};
		}
		if (type == "disciplinepath") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.disciplinepath"),
				type: "Power",
				system: {
					game: "vampire",
					type: "wod.types.disciplinepath"
				}
			};
		}
		if (type == "disciplinepathpower") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.disciplinepathpower"),
				type: "Power",
				system: {
					level: 1,
					game: "vampire",
					type: "wod.types.disciplinepathpower"
				}
			};
		}
		if (type == "ritual") { 	
			itemData = {
				name: game.i18n.localize("wod.labels.new.ritual"),
				type: "Power",
				system: {
					level: 1,
					game: setting,
					type: "wod.types.ritual"
				}
			};
		}
		if (type == "combination") {		
			itemData = {
				name: game.i18n.localize("wod.labels.new.combination"),
				type: "Power",
				system: {
					game: setting,
					type: "wod.types.combination"
				}
			};
		}
		if (type == "rote") {
			itemData = {
				name: `${game.i18n.localize("wod.labels.new.rote")}`,
				type: "Rote",
				system: {
				}
			};
		}
		if (type == "resonance") {
			itemData = {
				name: `${game.i18n.localize("wod.labels.new.resonance")}`,
				type: "Trait",
				system: {
					label: `${game.i18n.localize("wod.labels.new.resonance")}`,
					type: "wod.types.resonance"
				}
			};
		}
		if (type == "edge") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.edge"),
				type: "Power",
				system: {
					game: "hunter",
					type: "wod.types.edge"
				}
			};
		}
		if (type == "edgepower") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.edgepower"),
				type: "Power",
				system: {
					level: 1,
					game: "hunter",
					type: "wod.types.edgepower"
				}
			};
		}
		if (type == "lore") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.lore"),
				type: "Power",
				system: {
					game: "demon",
					type: "wod.types.lore"
				}
			};
		}
		if (type == "lorepower") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.lorepower"),
				type: "Power",
				system: {
					level: 1,
					game: "demon",
					type: "wod.types.lorepower"
				}
			};
		}
		if (type == "art") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.art"),
				type: "Power",
				system: {
					game: "changeling",
					type: "wod.types.art"
				}
			};
		}
		if (type == "artpower") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.artpower"),
				type: "Power",
				system: {
					level: 1,
					game: "changeling",
					property: {
						arttype: ""
					},
					type: "wod.types.artpower"
				}
			};
		}
		if (type == "sliver") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.sliver"),
				type: "Power",
				system: {
					game: "changeling",
					type: "wod.types.art"
				}
			};
		}
		if (type == "arcanoi") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.arcanoi"),
				type: "Power",
				system: {
					game: "wraith",
					type: "wod.types.arcanoi"
				}
			};
		}
		if (type == "arcanoipower") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.arcanoipower"),
				type: "Power",
				system: {
					level: 1,
					game: "wraith",
					type: "wod.types.arcanoipower"
				}
			};
		}
		if (type == "stain") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.stain"),
				type: "Power",
				system: {
					game: "orpheus",
					type: "wod.types.stain"
				}
			};
		}
		if (type == "horror") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.horror"),
				type: "Power",
				system: {
					game: "orpheus",
					type: "wod.types.horror"
				}
			};
		}
		if (type == "power") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.power"),
				type: "Power",
				system: {
					type: "wod.types.power"
				}
			};
		}
		if (type == "hekau") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.hekau"),
				type: "Power",
				system: {
					game: "mummy",
					type: "wod.types.hekau"
				}
			};
		}
		if (type == "hekaupower") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.hekaupower"),
				type: "Power",
				system: {
					level: 1,
					game: "mummy",
					type: "wod.types.hekaupower"
				}
			};
		}
		if (type == "numina") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.numina"),
				type: "Power",
				system: {
					game: "mage",
					type: "wod.types.numina"
				}
			};
		}
		if (type == "numinapower") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.numinapower"),
				type: "Power",
				system: {
					level: 1,
					game: "mage",
					type: "wod.types.numinapower"
				}
			};
		}
		if (type == "exaltedcharm") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.charm"),
				type: "Power",
				system: {
					level: 1,
					game: "exalted",
					type: "wod.types.exaltedcharm"
				}
			};
		}
		if (type == "exaltedsorcery") {
			itemData = {
				name: game.i18n.localize("wod.labels.new.ancientsorcery"),
				type: "Power",
				system: {
					level: 0,
					game: "exalted",
					type: "wod.types.exaltedsorcery"
				}
			};
		}

		return itemData;
	}

	/* Create the buttons for create Combat Items */
	static async CreateButtonsCombat(actor) {
		return {
			natural: {
				label: game.i18n.localize("wod.types.naturalweapon"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.naturalweapon"),
						type: "Melee Weapon",					
						system: {
							isnatural: true,
							isweapon: true,
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			melee: {
				label: game.i18n.localize("wod.types.meleeweapon"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.meleeweapon"),
						type: "Melee Weapon",
						system: {
							isnatural: false,
							isweapon: true,
							conceal: "NA",
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			ranged: {
				label: game.i18n.localize("wod.types.rangedweapon"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.rangedweapon"),
						type: "Ranged Weapon",
						system: {
							isweapon: true,
							conceal: "NA",
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			armor: {
				label: game.i18n.localize("wod.types.armor"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.armor"),
						type: "Armor",
						system: {
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			}
		}
	}

	/* Create the buttons for create Gear Items */
	static async CreateButtonsGear(actor) {
		return {
			treasure: {
				label: game.i18n.localize("wod.types.treasure"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.treasure"),
						type: "Item",
						system: {
							level: 1,
							type: "wod.types.treasure",
							ismagical: true,
							iscontainter: false,
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			device: {
				label: game.i18n.localize("wod.types.device"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.device"),
						type: "Item",
						system: {
							level: 1,
							type: "wod.types.device",
							ismagical: true,
							iscontainter: false,
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			talisman: {
				label: game.i18n.localize("wod.types.talisman"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.talisman"),
						type: "Item",
						system: {
							level: 1,
							type: "wod.types.talisman",
							ismagical: true,
							iscontainter: false,
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			periapt: {
				label: game.i18n.localize("wod.types.periapt"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.periapt"),
						type: "Item",
						system: {
							level: 1,
							type: "wod.types.periapt",
							ismagical: true,
							iscontainter: true,
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			matrix: {
				label: game.i18n.localize("wod.types.matrix"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.matrix"),
						type: "Item",
						system: {
							level: 1,
							type: "wod.types.matrix",
							ismagical: true,
							iscontainter: true,
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			trinket: {
				label: game.i18n.localize("wod.types.trinket"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.trinket"),
						type: "Item",
						system: {
							level: 1,
							type: "wod.types.trinket",
							ismagical: true,
							iscontainter: false,
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			fetish: {
				label: game.i18n.localize("wod.types.fetish"),
				callback: async () => {
					let itemData = {
						name: `${game.i18n.localize("wod.labels.new.fetish")}`,
						type: "Fetish",
						system: {
							level: 1,
							type: "wod.types.fetish",
							isrollable: true,
							ismagical: true,
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			talen: {
				label: game.i18n.localize("wod.types.talen"),
				callback: async () => {
					let itemData = {
						name: `${game.i18n.localize("wod.labels.new.talen")}`,
						type: "Fetish",
						system: {
							level: 1,
							type: "wod.types.talen",
							isrollable: true,
							ismagical: true,
							era: actor.system.settings.era
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			}

		}
	}

	/* Create the buttons for create Note Items */
	static async CreateButtonsNote(actor) {
		return {
			background: {
				label: game.i18n.localize("wod.types.background"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.background"),
						type: "Feature",
						system: {
							level: 1,
							type: "wod.types.background"
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			merit: {
				label: game.i18n.localize("wod.types.merit"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.merit"),
						type: "Feature",
						system: {
							level: 1,
							type: "wod.types.merit"
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			flaw: {
				label: game.i18n.localize("wod.types.flaw"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.flaw"),
						type: "Feature",
						system: {
							level: 1,
							type: "wod.types.flaw"
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			bloodbound: {
				label: game.i18n.localize("wod.types.bloodbound"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.bloodbound"),
						type: "Feature",
						system: {
							level: 1,
							type: "wod.types.bloodbound"
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			boon: {
				label: game.i18n.localize("wod.types.boon"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.boon"),
						type: "Feature",
						system: {
							level: 1,
							type: "wod.types.boon"
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			oath: {
				label: game.i18n.localize("wod.types.oath"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.oath"),
						type: "Feature",
						system: {
							level: 1,
							type: "wod.types.oath"
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			shapeform: {
				label: game.i18n.localize("wod.types.shapeform"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.shapeform"),
						type: "Trait",
						system: {
							iscreated: true,
							level: 0,
							type: "wod.types.shapeform"
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			other: {
				label: game.i18n.localize("wod.types.othertraits"),
				callback: async () => {
					let itemData = {
						name: game.i18n.localize("wod.labels.new.othertraits"),
						type: "Trait",
						system: {
							iscreated: true,
							level: 0,
							type: "wod.types.othertraits"
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			addexp: {
				label: game.i18n.localize("wod.labels.add.experience"),
				callback: async () => {
					let itemData = {
						name: `${game.i18n.localize("wod.labels.new.addexp")}`,
						type: "Experience",
						system: {
							amount: 0,
							type: "wod.types.expgained"
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			},
			spendexp: {
				label: game.i18n.localize("wod.labels.add.spentexp"),
				callback: async () => {
					let itemData = {
						name: `${game.i18n.localize("wod.labels.new.spentexp")}`,
						type: "Experience",
						system: {
							amount: 0,
							type: "wod.types.expspent"
						}
					};

					await this.CreateItem(actor, itemData);
					return;
				}
			}
		}
	}

	/* 
		Create the buttons for create Power Items 
		mortal
		vampire
		
	*/
	static async CreateButtonsPower(actor) {
		let buttons = {};		
		let system = actor.type.toLowerCase();

		if (actor.system.settings.variantsheet != "") {
			system = actor.system.settings.variantsheet.toLowerCase();
		}

		if (actor.system.settings.powers.hasgifts) {
			buttons.gift = {
				classes: "button fullSplatColor pointer savebutton",
				label: game.i18n.localize("wod.types.gift"),
				callback: async () => {
					let itemData = await this.CreateItemPower("gift", system);
					await this.CreateItem(actor, itemData);
					return;
				}
			};

			buttons.rite = {
				label: game.i18n.localize("wod.types.rite"),
				callback: async () => {
					let itemData = await this.CreateItemPower("rite", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if (actor.system.settings.powers.hasdisciplines) {
			buttons.discipline = {
				label: game.i18n.localize("wod.types.discipline"),
				callback: async () => {
					let itemData = await this.CreateItemPower("discipline", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.disciplinepower = {
				label: game.i18n.localize("wod.types.disciplinepower"),
				callback: async () => {
					let itemData = await this.CreateItemPower("disciplinepower", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.disciplinepath = {
				label: game.i18n.localize("wod.types.disciplinepath"),
				callback: async () => {
					let itemData = await this.CreateItemPower("disciplinepath", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.disciplinepathpower = {
				label: game.i18n.localize("wod.types.disciplinepathpower"),
				callback: async () => {
					let itemData = await this.CreateItemPower("disciplinepathpower", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.ritual = {
				label: game.i18n.localize("wod.types.ritual"),
				callback: async () => {
					let itemData = await this.CreateItemPower("ritual", "vampire");

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.combination = {
				label: game.i18n.localize("wod.types.combination"),
				callback: async () => {
					let itemData = await this.CreateItemPower("combination", "vampire");

					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if (actor.system.settings.powers.haslores) {
			buttons.lore = {
				label: game.i18n.localize("wod.types.lore"),
				callback: async () => {
					let itemData = await this.CreateItemPower("lore", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.lorepower = {
				label: game.i18n.localize("wod.types.lorepower"),
				callback: async () => {
					let itemData = await this.CreateItemPower("lorepower", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.ritual = {
				label: game.i18n.localize("wod.types.ritual"),
				callback: async () => {
					let itemData = await this.CreateItemPower("ritual", "demon");

					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if (actor.system.settings.powers.hasedges) {
			buttons.edge = {
				label: game.i18n.localize("wod.types.edge"),
				callback: async () => {
					let itemData = await this.CreateItemPower("edge", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.edgepower = {
				label: game.i18n.localize("wod.types.edgepower"),
				callback: async () => {
					let itemData = await this.CreateItemPower("edgepower", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if (actor.system.settings.powers.hashekau) {
			buttons.hekau = {
				label: game.i18n.localize("wod.types.hekau"),
				callback: async () => {
					let itemData = await this.CreateItemPower("hekau", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.hekaupower = {
				label: game.i18n.localize("wod.types.hekaupower"),
				callback: async () => {
					let itemData = await this.CreateItemPower("hekaupower", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if ((actor.system.settings.powers.hashorrors) || (actor.system.settings.powers.hasstains)) {
			if (actor.system.settings.powers.hashorrors) {
				buttons.horror = {
					label: game.i18n.localize("wod.types.horror"),
					callback: async () => {
						let itemData = await this.CreateItemPower("horror", system);
	
						await this.CreateItem(actor, itemData);
						return;
					}
				};
			}
			if (actor.system.settings.powers.hasstains) {
				buttons.stain = {
					label: game.i18n.localize("wod.types.stain"),
					callback: async () => {
						let itemData = await this.CreateItemPower("stain", system);
	
						await this.CreateItem(actor, itemData);
						return;
					}
				};
			}
		}
		
		if (actor.type == CONFIG.worldofdarkness.sheettype.mage) {
			buttons.rote = {
				label: game.i18n.localize("wod.types.rote"),
				callback: async () => {
					let itemData = await this.CreateItemPower("rote", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.resonance = {
				label: game.i18n.localize("wod.types.resonance"),
				callback: async () => {
					let itemData = await this.CreateItemPower("resonance", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if (actor.type == CONFIG.worldofdarkness.sheettype.changeling) {
			if (actor.system.settings.variant != 'inanimae') {
				buttons.art = {
					label: game.i18n.localize("wod.types.art"),
					callback: async () => {
						let itemData = await this.CreateItemPower("art", system);
	
						await this.CreateItem(actor, itemData);
						return;
					}
				};
				buttons.artpower = {
					label: game.i18n.localize("wod.types.artpower"),
					callback: async () => {
						let itemData = await this.CreateItemPower("artpower", system);
	
						await this.CreateItem(actor, itemData);
						return;
					}
				};
			}
			else {
				buttons.sliver = {
					label: game.i18n.localize("wod.types.sliver"),
					callback: async () => {
						let itemData = await this.CreateItemPower("sliver", system);
	
						await this.CreateItem(actor, itemData);
						return;
					}
				};
			}
		}

		if (actor.type == CONFIG.worldofdarkness.sheettype.demon) {
			buttons.apocalypticform = {
				label: game.i18n.localize("wod.types.apocalypticform"),
				callback: async () => {
					let itemData = {
						name: `${game.i18n.localize("wod.labels.new.apocalypticform")}`,
						type: "Trait",
						system: {
							iscreated: true,
							level: 0,
							type: "wod.types.apocalypticform"
						}
					};
					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if (actor.type == CONFIG.worldofdarkness.sheettype.wraith) {
			buttons.arcanoi = {
				label: game.i18n.localize("wod.types.arcanoi"),
				callback: async () => {
					let itemData = await this.CreateItemPower("arcanoi", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.arcanoipower = {
				label: game.i18n.localize("wod.types.arcanoipower"),
				callback: async () => {
					let itemData = await this.CreateItemPower("arcanoipower", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.passion = {
				label: game.i18n.localize("wod.types.passion"),
				callback: async () => {
					let itemData = {
						name: `${game.i18n.localize("wod.labels.new.passion")}`,
						type: "Trait",
						system: {
							iscreated: true,
							level: 0,
							type: "wod.types.passion"
						}
					};
					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.fetter = {
				label: game.i18n.localize("wod.types.fetter"),
				callback: async () => {
					let itemData = {
						name: `${game.i18n.localize("wod.labels.new.fetter")}`,
						type: "Trait",
						system: {
							iscreated: true,
							level: 0,
							type: "wod.types.fetter"
						}
					};
					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if (actor.type == CONFIG.worldofdarkness.sheettype.exalted) {
			buttons.exaltedcharm = {
				label: game.i18n.localize("wod.types.exaltedcharm"),
				callback: async () => {
					let itemData = await this.CreateItemPower("exaltedcharm", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.exaltedsorcery = {
				label: game.i18n.localize("wod.types.exaltedsorcery"),
				callback: async () => {
					let itemData = await this.CreateItemPower("exaltedsorcery", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if (actor.system.settings.powers.hasnumina) {
			buttons.numina = {
				label: game.i18n.localize("wod.types.numina"),
				callback: async () => {
					let itemData = await this.CreateItemPower("numina", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			buttons.numinapower = {
				label: game.i18n.localize("wod.types.numinapower"),
				callback: async () => {
					let itemData = await this.CreateItemPower("numinapower", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
			
		}

		if (actor.system.settings.powers.hascharms) {
			buttons.charm = {
				label: game.i18n.localize("wod.types.charm"),
				callback: async () => {
					let itemData = await this.CreateItemPower("charm", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if (actor.system.settings.powers.haspowers) {
			buttons.power = {
				label: game.i18n.localize("wod.types.power"),
				callback: async () => {
					let itemData = await this.CreateItemPower("power", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		if ((actor.type == CONFIG.worldofdarkness.sheettype.mortal) && (actor.system.settings.variant == "sorcerer")) {
			buttons.resonance = {
				label: game.i18n.localize("wod.types.resonance"),
				callback: async () => {
					let itemData = await this.CreateItemPower("resonance", system);

					await this.CreateItem(actor, itemData);
					return;
				}
			};
		}

		return buttons;
	}
}