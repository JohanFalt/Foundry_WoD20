import MessageHelper from "./message-helpers.js"
import BonusHelper from "./bonus-helpers.js";

import { InitiativeRoll } from "./roll-dice.js";
import { DiceRollContainer } from "./roll-dice.js";

export default class CombatHelper {

    static async RollInitiative(event, actor) {
		event.preventDefault();		

		const generalRoll = new DiceRollContainer(actor);
        generalRoll.origin = "initiative";
        InitiativeRoll(generalRoll);

		return;
	}

    static ignoresPain(actor) {
		let ignoresPain = false;

		if (actor.type == CONFIG.worldofdarkness.sheettype.spirit) {
			ignoresPain = true;
		}

		if (actor.system.conditions?.isignoringpain) {
			ignoresPain = true;
		}

		if (actor.system.conditions?.isfrenzy) {
			ignoresPain = true;
		}

		return ignoresPain;
	}

	static async CalculateMovement(actor) {
		let movement = {};

		movement.walk = 7;
		movement.jog = parseInt(actor.system.attributes.dexterity.total) + 12;
		movement.run = parseInt(actor.system.attributes.dexterity.total) * 3 + 20;
		movement.vjump = 2;
		movement.hjump = 4;
		movement.fly = 0;

		if ((actor.type == CONFIG.worldofdarkness.sheettype.werewolf) || (actor.type == CONFIG.worldofdarkness.sheettype.changingbreed)) {
			if (actor.system.shapes.glabro.isactive) {
				movement.vjump = 3;
				movement.hjump = 4;
			}
			if (actor.system.shapes.crinos.isactive) {
				movement.walk = movement.walk + 2;
				movement.jog = movement.jog + 2;
				movement.run = movement.run + 2;
				movement.vjump = 4;
				movement.hjump = 5;
			}
			if (actor.system.shapes.hispo.isactive) {
				movement.walk = movement.walk * 1.5;
				movement.jog = movement.jog * 1.5;
				movement.run = movement.run * 1.5;
				movement.vjump = 5;
				movement.hjump = 6;
			}
			if (actor.system.shapes.lupus.isactive) {
				movement.walk = movement.walk * 2;
				movement.jog = movement.jog * 2;
				movement.run = movement.run * 2;
				movement.vjump = 4;
				movement.hjump = 7;
			}
		}

		if (await BonusHelper.CheckMovementBuff(actor, "walk") == true) {
			movement.walk = movement.walk * parseInt(await BonusHelper.GetMovementBuff(actor, "walk"));
		}
		if (await BonusHelper.CheckMovementBuff(actor, "jog") == true) {
			movement.jog = movement.jog * parseInt(await BonusHelper.GetMovementBuff(actor, "jog"));
		}
		if (await BonusHelper.CheckMovementBuff(actor, "run") == true) {
			movement.run = movement.run * parseInt(await BonusHelper.GetMovementBuff(actor, "run"));
		}

		return movement;
	}

    static _inTurn(token) {
		for (let count = 0; count < game.combat.combatants.size; count++) {
			if (token.id == game.combat.combatants.contents[count].token.id) {
				return true;
			}
		}
	
		return false;
	}
}