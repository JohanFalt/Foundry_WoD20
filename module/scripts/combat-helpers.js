import MessageHelper from "./message-helpers.js"
import BonusHelper from "./bonus-helpers.js";

import { InitiativeRoll } from "./roll-dice.js";
import { DiceRollContainer } from "./roll-dice.js";

export default class CombatHelper {

    static async RollInitiative(actor) {
		const generalRoll = new DiceRollContainer(actor);
        generalRoll.origin = "initiative";
        InitiativeRoll(generalRoll);

		return;
	}

    static ignoresPain(actor) {
		let ignoresPain = false;

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

		if ((actor.type == CONFIG.worldofdarkness.sheettype.werewolf) || (actor.type == CONFIG.worldofdarkness.sheettype.changingbreed) ) {
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
			movement.walk = movement.walk * (await BonusHelper.GetMovementBuff(actor, "walk"));
		}
		if (await BonusHelper.CheckMovementBuff(actor, "jog") == true) {
			movement.jog = movement.jog * (await BonusHelper.GetMovementBuff(actor, "jog"));
		}
		if (await BonusHelper.CheckMovementBuff(actor, "run") == true) {
			movement.run = movement.run * (await BonusHelper.GetMovementBuff(actor, "run"));
		}

		return movement;
	}

	static async CalculateMovementv2(actor) {
		let movement = actor.system.movement;

		movement.walk.value = 7;
		movement.jog.value = parseInt(actor.system.attributes.dexterity.total) + 12;
		movement.run.value = parseInt(actor.system.attributes.dexterity.total) * 3 + 20;
		movement.vjump.value = 2;
		movement.hjump.value = 4;
		movement.fly.isactive = false;
		movement.fly.value = 0;

		if (actor.system.settings.splat == CONFIG.worldofdarkness.splat.werewolf) {
			let shape = actor?.items.filter(item => item.type === "Trait" && item.system.type === "wod.types.shapeform" && item.system.isvisible && item.system.isactive && item.system.label == "wod.shapes.glabro");
			if (shape.length > 0) {
				movement.vjump.value = 3;
				movement.hjump.value = 4;
			}

			shape = actor?.items.filter(item => item.type === "Trait" && item.system.type === "wod.types.shapeform" && item.system.isvisible && item.system.isactive && item.system.label == "wod.shapes.crinos");
			if (shape.length > 0) {
				movement.walk.value = movement.walk.value + 2;
				movement.jog.value = movement.jog.value + 2;
				movement.run.value = movement.run.value + 2;
				movement.vjump.value = 4;
				movement.hjump.value = 5;
			}

			shape = actor?.items.filter(item => item.type === "Trait" && item.system.type === "wod.types.shapeform" && item.system.isvisible && item.system.isactive && item.system.label == "wod.shapes.hispo");
			if (shape.length > 0) {
				movement.walk.value = movement.walk.value * 1.5;
				movement.jog.value = movement.jog.value * 1.5;
				movement.run.value = movement.run.value * 1.5;
				movement.vjump.value = 5;
				movement.hjump.value = 6;
			}

			shape = actor?.items.filter(item => item.type === "Trait" && item.system.type === "wod.types.shapeform" && item.system.isvisible && item.system.isactive && item.system.label == "wod.shapes.lupus");
			if (shape.length > 0) {
				movement.walk.value = movement.walk.value * 2;
				movement.jog.value = movement.jog.value * 2;
				movement.run.value = movement.run.value * 2;
				movement.vjump.value = 4;
				movement.hjump.value = 7;
			}
		}

		if (await BonusHelper.CheckMovementBuff(actor, "walk") == true) {
			movement.walk.value = movement.walk.value * (await BonusHelper.GetMovementBuff(actor, "walk"));
		}
		if (await BonusHelper.CheckMovementBuff(actor, "jog") == true) {
			movement.jog.value = movement.jog.value * (await BonusHelper.GetMovementBuff(actor, "jog"));
		}
		if (await BonusHelper.CheckMovementBuff(actor, "run") == true) {
			movement.run.value = movement.run.value * (await BonusHelper.GetMovementBuff(actor, "run"));
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

	/**
	 * Total wound boxes on the actor health track.
	 * Sums per-level `total` fields — do not use persisted `traits.health.totalhealthlevels.max`,
	 * which can remain at the default (7) after the track is extended.
	 *
	 * @param {object} system - Actor system data (or duplicate thereof)
	 * @returns {number}
	 */
	static GetMaxHealthLevels(system) {
		let maxLevels = 0;

		for (const level in CONFIG.worldofdarkness.woundLevels) {
			maxLevels += parseInt(system?.health?.[level]?.total) || 0;
		}

		return Math.max(0, maxLevels);
	}

	/**
	 * How much damage of a given type can still be applied to the health track.
	 * Empty boxes can always be filled.
	 * Excess bashing upgrades existing bashing → lethal (V20/W20 Applying Damage).
	 * Excess aggravated converts existing bashing/lethal → aggravated when the track is full.
	 * Excess lethal past a full track is not converted here (death/torpor elsewhere).
	 *
	 * @param {{bashing?: number, lethal?: number, aggravated?: number}} damage
	 * @param {string} damageType - "bashing" | "lethal" | "aggravated"
	 * @param {number} maxLevels
	 * @returns {number}
	 */
	static GetApplicableDamageCapacity(damage, damageType, maxLevels) {
		const bashing = parseInt(damage?.bashing) || 0;
		const lethal = parseInt(damage?.lethal) || 0;
		const aggravated = parseInt(damage?.aggravated) || 0;
		const max = Math.max(0, parseInt(maxLevels) || 0);
		const empty = Math.max(0, max - bashing - lethal - aggravated);

		if (damageType === "bashing") {
			// Fill empty as bashing, then upgrade every bashing box (including newly filled) to lethal.
			return empty + (bashing + empty);
		}

		if (damageType === "aggravated") {
			// Fill empty, then convert any remaining bashing/lethal boxes to aggravated.
			return empty + bashing + lethal;
		}

		// Lethal only fills empty boxes; further damage is death/torpor, not an upgrade.
		return empty;
	}

	/**
	 * Apply damage per V20/W20 Applying Damage.
	 * 1. Fill empty health levels with the incoming type.
	 * 2. Excess bashing upgrades existing bashing wounds to lethal.
	 * 3. Excess aggravated converts existing lethal, then bashing, to aggravated
	 *    (aggravated is marked above lesser wounds).
	 * Excess lethal when the track is full is discarded here (death/torpor elsewhere).
	 * Mutates `damage` in place.
	 *
	 * @param {{bashing: number, lethal: number, aggravated: number}} damage
	 * @param {string} damageType - "bashing" | "lethal" | "aggravated"
	 * @param {number} amount
	 * @param {number} maxLevels
	 * @returns {number} number of damage units applied (fills + upgrades)
	 */
	static ApplyDamageWithOverflow(damage, damageType, amount, maxLevels) {
		let bashing = parseInt(damage?.bashing) || 0;
		let lethal = parseInt(damage?.lethal) || 0;
		let aggravated = parseInt(damage?.aggravated) || 0;
		let remaining = Math.max(0, parseInt(amount) || 0);
		let applied = 0;
		const max = Math.max(0, parseInt(maxLevels) || 0);

		if (remaining <= 0 || max <= 0) {
			return 0;
		}

		// 1. Fill empty health levels with the incoming type.
		const empty = Math.max(0, max - bashing - lethal - aggravated);
		if (empty > 0) {
			const fill = Math.min(remaining, empty);
			if (damageType === "bashing") {
				bashing += fill;
			}
			else if (damageType === "lethal") {
				lethal += fill;
			}
			else {
				aggravated += fill;
			}
			remaining -= fill;
			applied += fill;
		}

		// 2. Excess bashing upgrades existing bashing → lethal (least-severe wounds).
		if (damageType === "bashing" && remaining > 0 && bashing > 0) {
			const n = Math.min(remaining, bashing);
			bashing -= n;
			lethal += n;
			remaining -= n;
			applied += n;
		}

		// 3. Excess aggravated converts lethal, then bashing, to aggravated.
		if (damageType === "aggravated" && remaining > 0) {
			if (lethal > 0) {
				const n = Math.min(remaining, lethal);
				lethal -= n;
				aggravated += n;
				remaining -= n;
				applied += n;
			}
			if (remaining > 0 && bashing > 0) {
				const n = Math.min(remaining, bashing);
				bashing -= n;
				aggravated += n;
				remaining -= n;
				applied += n;
			}
		}

		// Any leftover (lethal overflow, or aggravated when all boxes are already aggravated)
		// is not applied to the track — books resolve that as death/torpor/Final Death.

		damage.bashing = bashing;
		damage.lethal = lethal;
		damage.aggravated = aggravated;
		return applied;
	}
}