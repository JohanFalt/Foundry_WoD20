import AbilityHelper from "./ability-helpers.js";

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

		for (const talent in game.wod.abilities.mortal[era].talents) {
			if (actorCopy.system.abilities[game.wod.abilities.mortal[era].talents[talent]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.mortal[era].talents[talent]].isvisible = true;
			}
		}

		for (const skill in game.wod.abilities.mortal[era].skills) {
			if (actorCopy.system.abilities[game.wod.abilities.mortal[era].skills[skill]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.mortal[era].skills[skill]].isvisible = true;
			}
		}

		for (const knowledge in game.wod.abilities.mortal[era].knowledges) {
			if (actorCopy.system.abilities[game.wod.abilities.mortal[era].knowledges[knowledge]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.mortal[era].knowledges[knowledge]].isvisible = true;
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

		for (const talent in game.wod.abilities.vampire[era].talents) {
			if (actorCopy.system.abilities[game.wod.abilities.vampire[era].talents[talent]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.vampire[era].talents[talent]].isvisible = true;
			}
		}

		for (const skill in game.wod.abilities.vampire[era].skills) {
			if (actorCopy.system.abilities[game.wod.abilities.vampire[era].skills[skill]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.vampire[era].skills[skill]].isvisible = true;
			}
		}

		for (const knowledge in game.wod.abilities.vampire[era].knowledges) {
			if (actorCopy.system.abilities[game.wod.abilities.vampire[era].knowledges[knowledge]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.vampire[era].knowledges[knowledge]].isvisible = true;
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

		for (const talent in game.wod.abilities.mage[era].talents) {
			if (actorCopy.system.abilities[game.wod.abilities.mage[era].talents[talent]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.mage[era].talents[talent]].isvisible = true;
			}
		}

		for (const skill in game.wod.abilities.mage[era].skills) {
			if (actorCopy.system.abilities[game.wod.abilities.mage[era].skills[skill]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.mage[era].skills[skill]].isvisible = true;
			}
		}

		for (const knowledge in game.wod.abilities.mage[era].knowledges) {
			if (actorCopy.system.abilities[game.wod.abilities.mage[era].knowledges[knowledge]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.mage[era].knowledges[knowledge]].isvisible = true;
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

		for (const talent in game.wod.abilities.werewolf[era].talents) {
			var ability = game.wod.abilities.werewolf[era].talents[talent];
			if (actorCopy.system.abilities[ability] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.werewolf[era].talents[talent]].isvisible = true;
			}
		}

		for (const skill in game.wod.abilities.werewolf[era].skills) {
			if (actorCopy.system.abilities[game.wod.abilities.werewolf[era].skills[skill]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.werewolf[era].skills[skill]].isvisible = true;
			}
		}

		for (const knowledge in game.wod.abilities.werewolf[era].knowledges) {
			if (actorCopy.system.abilities[game.wod.abilities.werewolf[era].knowledges[knowledge]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities.werewolf[era].knowledges[knowledge]].isvisible = true;
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

		for (const talent in game.wod.abilities[type][era].talents) {
			if (actorCopy.system.abilities[game.wod.abilities[type][era].talents[talent]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities[type][era].talents[talent]].isvisible = true;
			}
		}

		for (const skill in game.wod.abilities[type][era].skills) {
			if (actorCopy.system.abilities[game.wod.abilities[type][era].skills[skill]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities[type][era].skills[skill]].isvisible = true;
			}
		}

		for (const knowledge in game.wod.abilities[type][era].knowledges) {
			if (actorCopy.system.abilities[game.wod.abilities[type][era].knowledges[knowledge]] != undefined) {
				actorCopy.system.abilities[game.wod.abilities[type][era].knowledges[knowledge]].isvisible = true;
			}
		}

		if (type == "hunter") {
			actorCopy.system.abilities.technology.type = "skill";
		}
		if (type == "demon") {
			actorCopy.system.abilities.technology.type = "skill";
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

		if (CONFIG.wod.attributeSettings == "20th") {
			actor.system.attributes.composure.isvisible = false;
			actor.system.attributes.resolve.isvisible = false;
			actor.system.advantages.willpower.permanent = 0;
		}
		else if (CONFIG.wod.attributeSettings == "5th") {
			actor.system.attributes.appearance.isvisible = false;
			actor.system.attributes.perception.isvisible = false;
			actor.system.advantages.willpower.permanent = 2;
		}
	
		if (CONFIG.wod.rollSettings) {
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
}