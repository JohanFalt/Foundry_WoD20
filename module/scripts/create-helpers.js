import AbilityHelper from "./ability-helpers.js";
import BonusHelper from "./bonus-helpers.js";

export default class CreateHelper {
    
    static async SetMortalAbilities(actorCopy, actor, era) {
		console.log(`WoD | Set Mortal Abilities - ${era}`);

		// hide all
		for (const ability in actorCopy.system.abilities) {
			if (actorCopy.system.abilities[ability] != undefined) {
				if (actorCopy.system.abilities[ability].value == 0) {
					actorCopy.system.abilities[ability].isvisible = false;
				}
			}
		}

		for (const talent in game.worldofdarkness.abilities.mortal[era].talents) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.mortal[era].talents[talent]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.mortal[era].talents[talent]].isvisible = true;
			}
		}

		for (const skill in game.worldofdarkness.abilities.mortal[era].skills) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.mortal[era].skills[skill]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.mortal[era].skills[skill]].isvisible = true;
			}
		}

		for (const knowledge in game.worldofdarkness.abilities.mortal[era].knowledges) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.mortal[era].knowledges[knowledge]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.mortal[era].knowledges[knowledge]].isvisible = true;
			}
		}

		if (era == "victorian") {
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", "Ride", parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}

		if (era == "darkages") {
			await AbilityHelper.CreateAbility(actor, "wod.types.talentsecondability", game.i18n.localize("wod.abilities.legerdemain"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.archery"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.commerce"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.hearthwisdom"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.seneschal"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.theology"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}
	}	

	static async SetVampireAbilities(actorCopy, actor, era) {	
		console.log(`WoD | Set Vampire Abilities - ${era}`);

		// hide all
		for (const ability in actorCopy.system.abilities) {
			if (actorCopy.system.abilities[ability] != undefined) {
				if (actorCopy.system.abilities[ability].value == 0) {
					actorCopy.system.abilities[ability].isvisible = false;
				}
			}
		}

		for (const talent in game.worldofdarkness.abilities.vampire[era].talents) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.vampire[era].talents[talent]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.vampire[era].talents[talent]].isvisible = true;
			}
		}

		for (const skill in game.worldofdarkness.abilities.vampire[era].skills) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.vampire[era].skills[skill]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.vampire[era].skills[skill]].isvisible = true;
			}
		}

		for (const knowledge in game.worldofdarkness.abilities.vampire[era].knowledges) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.vampire[era].knowledges[knowledge]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.vampire[era].knowledges[knowledge]].isvisible = true;
			}
		}

		if (era == "victorian") {
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}

		if (era == "darkages") {
			await AbilityHelper.CreateAbility(actor, "wod.types.talentsecondability", game.i18n.localize("wod.abilities.legerdemain"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.archery"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.commerce"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.hearthwisdom"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.seneschal"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.theology"), parseInt(actor.system.settings.abilities.defaultmaxvalue));
		}
	}

	static async SetMageAbilities(actorCopy, era) {	
		console.log(`WoD | Set Mage Abilities - ${era}`);

		// hide all
		for (const ability in actorCopy.system.abilities) {
			if (actorCopy.system.abilities[ability] != undefined) {
				if (actorCopy.system.abilities[ability].value == 0) {
					actorCopy.system.abilities[ability].isvisible = false;
				}
			}
		}

		for (const talent in game.worldofdarkness.abilities.mage[era].talents) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.mage[era].talents[talent]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.mage[era].talents[talent]].isvisible = true;
			}
		}

		for (const skill in game.worldofdarkness.abilities.mage[era].skills) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.mage[era].skills[skill]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.mage[era].skills[skill]].isvisible = true;
			}
		}

		for (const knowledge in game.worldofdarkness.abilities.mage[era].knowledges) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.mage[era].knowledges[knowledge]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.mage[era].knowledges[knowledge]].isvisible = true;
			}
		}

		actorCopy.system.abilities.technology.type = "skill";
		actorCopy.system.abilities.research.type = "skill";
	}

	static async SetWerewolfAbilities(actorCopy, actor, era) {	
		console.log(`WoD | Set Werewolf Abilities - ${era}`);

		// hide all
		for (const ability in actorCopy.system.abilities) {
			if (actorCopy.system.abilities[ability] != undefined) {
				if (actorCopy.system.abilities[ability].value == 0) {
					actorCopy.system.abilities[ability].isvisible = false;
				}
			}
		}

		for (const talent in game.worldofdarkness.abilities.werewolf[era].talents) {
			var ability = game.worldofdarkness.abilities.werewolf[era].talents[talent];
			if (actorCopy.system.abilities[ability] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.werewolf[era].talents[talent]].isvisible = true;
			}
		}

		for (const skill in game.worldofdarkness.abilities.werewolf[era].skills) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.werewolf[era].skills[skill]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.werewolf[era].skills[skill]].isvisible = true;
			}
		}

		for (const knowledge in game.worldofdarkness.abilities.werewolf[era].knowledges) {
			if (actorCopy.system.abilities[game.worldofdarkness.abilities.werewolf[era].knowledges[knowledge]] != undefined) {
				actorCopy.system.abilities[game.worldofdarkness.abilities.werewolf[era].knowledges[knowledge]].isvisible = true;
			}
		}

		if (era == "victorian") {
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), 5);
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.culture"), 5);
		}

		if (era == "darkages") {
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.archery"), 5);
			await AbilityHelper.CreateAbility(actor, "wod.types.skillsecondability", game.i18n.localize("wod.abilities.ride"), 5);
			await AbilityHelper.CreateAbility(actor, "wod.types.knowledgesecondability", game.i18n.localize("wod.abilities.hearthwisdom"), 5);
		}
	}

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
			actorCopy.system.abilities.technology.type = "skill";
		}
		if (type == "wraith") {
			actorCopy.system.abilities.leadership.type = "skill";
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
	}
	
	static async SetMortalAttributes(actor) {
		console.log('WoD | Set Mortal Attributes');

		let willpower = -1;

		for (const attribute in actor.system.attributes) {
			actor.system.attributes[attribute].isvisible = true;
		}

		if (CONFIG.worldofdarkness.attributeSettings == "20th") {
			actor.system.attributes.composure.isvisible = false;
			actor.system.attributes.resolve.isvisible = false;
			actor.system.advantages.willpower.permanent = 0;
		}
		else if (CONFIG.worldofdarkness.attributeSettings == "5th") {
			actor.system.attributes.appearance.isvisible = false;
			actor.system.attributes.perception.isvisible = false;
			actor.system.advantages.willpower.permanent = 2;
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
	}

	static async SetWerewolfAttributes(actor) {
		console.log('WoD | Set Werewolf Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = true;

		actor.system.settings.hasrage = true;
		actor.system.settings.hasgnosis = true;

		actor.system.settings.powers.hasgifts = true;
	}

	static async SetShifterAttributes(actor, type) {
		console.log('WoD | Set Shifter Attributes');

		await this.SetWerewolfAttributes(actor);

		actor.system.changingbreed = type;
		actor.system.settings.hasrage = true;
		actor.system.settings.hasbloodpool = false;

		if ((type == "Ananasi") || (type == "Nuwisha")) {
			actor.system.settings.hasrage = false;
		}
		if (type == "Ananasi") {
			actor.system.settings.hasbloodpool = true;
		}
	}

	static async SetMageAttributes(actor) {
		console.log('WoD | Set Mage Attributes');

		actor.system.advantages.arete.permanent = 1;
		actor.system.advantages.arete.roll = 1;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;
	}

	static async SetChangelingAttributes(actor) {
		console.log('WoD | Set Changeling Attributes');

		actor.system.settings.soak.chimerical.bashing.isrollable = true;
		actor.system.settings.soak.chimerical.lethal.isrollable = true;
		actor.system.settings.soak.chimerical.aggravated.isrollable = false;
		
		actor.system.settings.hasglamour = true;
		actor.system.settings.hasbanality = true;

		actor.system.settings.powers.hasarts = true;
	}

	static async SetHunterAttributes(actor) {
		console.log('WoD | Set Hunter Attributes');

		actor.system.settings.hasconviction = true;
		actor.system.settings.hasvirtue = true;

		actor.system.settings.powers.hasedges = true;
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
	}

	static async SetWraithAttributes(actor) {
		console.log('WoD | Set Wraith Attributes');

		actor.system.settings.hascorpus = true;
		actor.system.settings.haspathos = true;

		actor.system.settings.powers.hasarcanois = true;
	}

	static async SetCreatureAttributes(actor) {
		console.log('WoD | Set Creature Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.powers.haspowers = true;
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
	}

	static async SetMortalVariant(actorData, variant) {
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

		actorData.system.settings.powers.hasdisciplines = false;
		actorData.system.settings.powers.hasgifts = false;
		actorData.system.settings.powers.hasarts = false;
		actorData.system.settings.powers.hasedges = false;
		actorData.system.settings.powers.haslores = false;
		actorData.system.settings.powers.hascharms = false;
		actorData.system.settings.powers.haspowers = false;

		if (actorData.type == CONFIG.worldofdarkness.sheettype.mortal) {
			if (variant == 'general') {
			}
			if (variant == 'autumnpeople') {
				actorData.system.settings.hasbanality = true;
			}
			if (variant == 'enchanted') {
				actorData.system.settings.hasglamour = true;
				actorData.system.settings.hasbanality = true;
			}
			if (variant == 'ghoul') {
				actorData.system.settings.haspath = true;
				actorData.system.settings.hasbloodpool = true;
				actorData.system.settings.hasvirtue = true;
				actorData.system.settings.powers.hasdisciplines = true;
			}
			if (variant == 'kinfolk') {
				actorData.system.settings.hasgnosis = true;
				actorData.system.settings.powers.hasgifts = true;
			}
			if (variant == 'truefaith') {
				actorData.system.settings.hasfaith = true;	
				actorData.system.settings.powers.haspowers = true;			
			}
		}
	}	

	static async SetCreatureVariant(actorData, variant) {
		actorData.system.settings.variant = variant;

		actorData.system.settings.haswillpower = true;
		actorData.system.settings.soak.bashing.isrollable = true;
		
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

		actorData.system.settings.powers.hasdisciplines = false;
		actorData.system.settings.powers.hasgifts = false;
		actorData.system.settings.powers.hasarts = false;
		actorData.system.settings.powers.hasedges = false;
		actorData.system.settings.powers.haslores = false;
		actorData.system.settings.powers.hascharms = false;
		actorData.system.settings.powers.haspowers = false;		

		if (actorData.type == CONFIG.worldofdarkness.sheettype.creature) {
			if (variant == 'general') {
				actorData.system.settings.powers.haspowers = true;
				
			}
			if (variant == 'chimera') {
				actorData.system.settings.hasglamour = true;
				actorData.system.settings.powers.haspowers = true;
				actorData.system.settings.powers.hasarts = true;
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
				actorData.system.settings.powers.haspowers = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
			}
			if (variant == 'anurana') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.hasgnosis = true;	
				actorData.system.settings.powers.haspowers = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
			}
			if (variant == 'samsa') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.hasgnosis = true;	
				actorData.system.settings.powers.hasgifts = true;
				actorData.system.settings.powers.haspowers = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
			}
			if (variant == 'kerasi') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.hasgnosis = true;	
				actorData.system.settings.powers.haspowers = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
			}
			if (variant == 'yeren') {
				actorData.system.settings.hasrage = true;
				actorData.system.settings.hasgnosis = true;	
				actorData.system.settings.powers.hasgifts = true;
				actorData.system.settings.powers.haspowers = true;
				actorData.system.settings.soak.lethal.isrollable = true;
				actorData.system.settings.soak.aggravated.isrollable = true;
			}
		}
	}

	static async SetVariantItems(actor, variant) {
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

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 4, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 1, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 3, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.manipulation"), "manipulation", -3, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);
		}
		if (variant == 'anurana') {
			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.anuran"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power"
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			let id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 1, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 1, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 1, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.appearance"), "appearance", -2, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.dagon"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power"
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 2, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 2, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 2, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);
		}
		if (variant == 'samsa') {
			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.ungeziefer"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power"
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			let id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 3, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 1, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 3, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);
		}
		if (variant == 'kerasi') {
			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.bandia"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power"
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			let id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 3, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 2, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.manipulation"), "manipulation", -2, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.appearance"), "appearance", -2, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateSoakBuff(id, game.i18n.localize("wod.labels.bonus.soakbonus"), 1, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.kiforu"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power"
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 5, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", -1, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 5, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.manipulation"), "manipulation", -4, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateSoakBuff(id, game.i18n.localize("wod.labels.bonus.soakbonus"), 3, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = {
				name: game.i18n.localize("wod.tab.shapechange") + " - " + game.i18n.localize("wod.shapes.faru"),
				type: "Power",
				system: {
					game: "werewolf",
					type: "wod.types.power"
				}
			};

			item = await actor.createEmbeddedDocuments("Item", [itemData]);

			id = item[0]._id;

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 4, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 4, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);
		}
		if (variant == 'yeren') {
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

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.strength"), "strength", 3, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.dexterity"), "dexterity", 2, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.stamina"), "stamina", 2, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAttributeBuff(id, game.i18n.localize("wod.attributes.bonus.appearance"), "appearance", -3, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);

			itemData = await BonusHelper.CreateAbilityBuff(id, game.i18n.localize("wod.labels.bonus.abilities.athletics"), "athletics", 2, true);
			await actor.createEmbeddedDocuments("Item", [itemData]);
		}
	}
}