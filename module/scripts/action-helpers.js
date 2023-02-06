import { rollDice, DiceRoll } from "./roll-dice.js";

import { calculateTotals } from "./totals.js";

import CombatHelper from "./combat-helpers.js";
import BonusHelper from "./bonus-helpers.js";

import * as WeaponHelper from "../dialogs/dialog-weapon.js";
import * as PowerHelper from "../dialogs/dialog-power.js";
import * as SortHelper from "../dialogs/dialog-sortpower.js";

import * as ItemHelper from "../dialogs/dialog-item.js";
//import { Treasure } from "../dialogs/dialog-item.js";
//import { DialogItem } from "../dialogs/dialog-item.js";

import { DialogGeneralRoll, GeneralRoll } from "../dialogs/dialog-generalroll.js";

import { Rote } from "../dialogs/dialog-aretecasting.js";
import { DialogAreteCasting } from "../dialogs/dialog-aretecasting.js";

import { VampireFrenzy } from "../dialogs/dialog-checkfrenzy.js";
import { WerewolfFrenzy } from "../dialogs/dialog-checkfrenzy.js";
import { DialogCheckFrenzy } from "../dialogs/dialog-checkfrenzy.js";

import { Shape } from "../dialogs/dialog-shapechange.js";
import { DialogShapeChange } from "../dialogs/dialog-shapechange.js";

import { Soak } from "../dialogs/dialog-soak.js";
import { DialogSoakRoll } from "../dialogs/dialog-soak.js";

export class UserPermissions {
    constructor(user) {
        this.changeActorImage = false;
        this.changeItemImage = false;
		this.itemAdministrator = user.isGM;
    }
}

export class GraphicSettings {
    constructor() {
        this.useLinkPlatform = false;
    }
}

export default class ActionHelper {

    static async RollDialog(event, actor) {
        console.log("WoD | Mortal Sheet _onRollDialog");
	
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;   

		let item = false; 
		let templateHTML = "";	

		// the new roll system
		if ((dataset.rollitem == "true") && ((dataset.itemid != undefined) || (dataset.itemid != "undefined"))) {
			item = actor.getEmbeddedDocument("Item", dataset.itemid);

			if (item == undefined) {
				console.log(`WoD | RollDialog - item ${dataset.itemid} not found`);
				return;
			}

			if (item.type == "Power") {
				if (await BonusHelper.CheckAttributeBonus(actor, item.dice1)) {
					let bonus = await BonusHelper.GetAttributeBonus(actor, item.dice1);
					item.difficulty += parseInt(bonus);
				}
				else if (await BonusHelper.CheckAttributeBonus(actor, item.dice2)) {
					let bonus = await BonusHelper.GetAttributeBonus(actor, item.dice2);
					item.difficulty += parseInt(bonus);
				}

				if (await BonusHelper.CheckAbilityBonus(actor, item.dice2)) {
                    let bonus = await BonusHelper.GetAbilityBonus(actor, item.dice2);
                    item.difficulty += parseInt(bonus);
                }
			}
			if ((item.type == "Melee Weapon") || (item.type == "Ranged Weapon")) {
				if (await BonusHelper.CheckAttributeBonus(actor, item.system.attack.attribute)) {
					let bonus = await BonusHelper.GetAttributeBonus(actor, item.system.attack.attribute);
					item.system.difficulty += parseInt(bonus);
				}

				if (await BonusHelper.CheckAbilityBonus(actor, item.system.attack.ability)) {
                    let bonus = await BonusHelper.GetAbilityBonus(actor, item.system.attack.ability);
                    item.system.difficulty += parseInt(bonus);
                }
			}

			// used a Weapon
			if (dataset.object == "Melee") {
				const weapon = new WeaponHelper.MeleeWeapon(item);
				let weaponUse = new WeaponHelper.DialogWeapon(actor, weapon);
				weaponUse.render(true);

				return;
			}

			if (dataset.object == "Ranged") {
				const weapon = new WeaponHelper.RangedWeapon(item);
				let weaponUse = new WeaponHelper.DialogWeapon(actor, weapon);
				weaponUse.render(true);

				return;
			}

			if (dataset.object == "Damage") {
				item.system.extraSuccesses = 0;
				const damage = new WeaponHelper.Damage(item);
				let weaponUse = new WeaponHelper.DialogWeapon(actor, damage);
				weaponUse.render(true);

				return;
			}

			// used a Item
			if (dataset.object == "Treasure") {
				const treasure = new ItemHelper.Treasure(item);
				let treasureUse = new ItemHelper.DialogItem(actor, treasure);
				treasureUse.render(true);

				return;
			}

			// used a Fetish
			if (dataset.object == "Fetish") {
				templateHTML = `<h2>${game.i18n.localize("wod.dice.activate")} ${item.name}</h2> <strong>${game.i18n.localize("wod.advantages.gnosis")} (${actor.system.advantages.gnosis.roll})</strong>`;

				const fetishRoll = new DiceRoll(actor);
				fetishRoll.handlingOnes = CONFIG.wod.handleOnes;
				fetishRoll.numDices = parseInt(actor.system.advantages.gnosis.roll);
				fetishRoll.difficulty = parseInt(item.system.difficulty);
				fetishRoll.templateHTML = templateHTML;
				fetishRoll.systemText = item.system.details;

				rollDice(fetishRoll);

				return;
			}	
			
			// used a Gift
			if ((dataset.object == "Gift") && (dataset.type == CONFIG.wod.sheettype.spirit)) {
				const gift = new PowerHelper.CharmGift(item);
				let giftUse = new PowerHelper.DialogPower(actor, gift);
				giftUse.render(true);

				return;
			}
			else if (dataset.object == "Gift") {
				const gift = new PowerHelper.Gift(item);
				let giftUse = new PowerHelper.DialogPower(actor, gift);
				giftUse.render(true);

				return;
			}

			// used a Rite
			if (dataset.object == "Rite") {
				const rite = new PowerHelper.Gift(item);
				let riteUse = new PowerHelper.DialogPower(actor, rite);
				riteUse.render(true);

				return;
			}
			
			// used a Rote
			if (dataset.object == "Rote") {
				const rote = new Rote(item);
				let areteCasting = new DialogAreteCasting(actor, rote);
				areteCasting.render(true);

				return;
			}

			// used a Charm
			if (dataset.object == "Charm") {
				const charm = new PowerHelper.Charm(item);
				let charmUse = new PowerHelper.DialogPower(actor, charm);
				charmUse.render(true);

				return;
			}

			// used a Power
			if (dataset.object == "Power") {
				const power = new PowerHelper.Power(item);
				let powerUse = new PowerHelper.DialogPower(actor, power);
				powerUse.render(true);

				return;
			}

			// used a DisciplinePower
			if (dataset.object == "Discipline") {
				const discipline = new PowerHelper.DisciplinePower(item);
				let powerUse = new PowerHelper.DialogPower(actor, discipline);
				powerUse.render(true);

				return;
			}

			// used a PathPower
			if (dataset.object == "Path") {
				const path = new PowerHelper.PathPower(item);
				let powerUse = new PowerHelper.DialogPower(actor, path);
				powerUse.render(true);

				return;
			}

			// used a Ritual
			if (dataset.object == "Ritual") {
				const ritual = new PowerHelper.RitualPower(item);
				let powerUse = new PowerHelper.DialogPower(actor, ritual);
				powerUse.render(true);

				return;
			}

			// used an Art
			if (dataset.object == "Art") {
				const art = new PowerHelper.ArtPower(item);
				let powerUse = new PowerHelper.DialogPower(actor, art);
				powerUse.render(true);

				return;
			}

			// used an Edge
			if (dataset.object == "Edge") {
				const edge = new PowerHelper.EdgePower(item);
				let powerUse = new PowerHelper.DialogPower(actor,edge);
				powerUse.render(true);

				return;
			}

			// used an Lore
			if (dataset.object == "Lore") {
				const lore = new PowerHelper.LorePower(item);
				let powerUse = new PowerHelper.DialogPower(actor,lore);
				powerUse.render(true);

				return;
			}

			// placing Disicpline Power in correct discipline
			if (dataset.object == "SortDisciplinePower") {
				const discipline = new SortHelper.SortDisciplinePower(item);
				let powerUse = new SortHelper.DialogSortPower(actor, discipline);
				powerUse.render(true);

				return;
			}

			if (dataset.object == "SortPathPower") {
				const discipline = new SortHelper.SortPathPower(item);
				let powerUse = new SortHelper.DialogSortPower(actor, discipline);
				powerUse.render(true);

				return;
			}			

			if (dataset.object == "SortArtPower") {
				const cantrip = new SortHelper.SortArtPower(item);
				let powerUse = new SortHelper.DialogSortPower(actor, cantrip);
				powerUse.render(true);

				return;
			}

			if (dataset.object == "SortEdgePower") {
				const edge = new SortHelper.SortEdgePower(item);
				let powerUse = new SortHelper.DialogSortPower(actor, edge);
				powerUse.render(true);

				return;
			}

			if (dataset.object == "SortLorePower") {
				const lore = new SortHelper.SortLorePower(item);
				let powerUse = new SortHelper.DialogSortPower(actor, lore);
				powerUse.render(true);

				return;
			}

			ui.notifications.error("Item Roll missing function - " + dataset.object);

			return;
		}
		else if (dataset.attribute == "true") {
			const roll = new GeneralRoll(dataset.key, "attribute");
			let generalRollUse = new DialogGeneralRoll(actor, roll);
			generalRollUse.render(true);

			return;
		}
		else if (dataset.ability == "true") {
			const roll = new GeneralRoll(dataset.key, "ability");
			let generalRollUse = new DialogGeneralRoll(actor, roll);
			generalRollUse.render(true);

			return;
		}
		else if (dataset.noability == "true") {
			if (dataset.key == "paradox") {
				this.RollParadox(event, actor);

				return;
			}

			const roll = new GeneralRoll(dataset.key, "noability");
			let generalRollUse = new DialogGeneralRoll(actor, roll);
			generalRollUse.render(true);

			return;
		}
		else if (dataset.macroimage == "true") {
			if (dataset.rollinitiative == "true") {
				CombatHelper.RollInitiative(event, actor);

				return;
			}

			if (dataset.rollsoak == "true") {
				const soak = new Soak(actor);
				let soakUse = new DialogSoakRoll(actor, soak);
				soakUse.render(true);

				return;
			}

			if (dataset.rolldices == "true") {
				const roll = new GeneralRoll(dataset.key, "dice");
				let generalRollUse = new DialogGeneralRoll(actor, roll);
				generalRollUse.render(true);

				return;
			}

			if (dataset.rollaretecatsing == "true") {
				let rote = new Rote(undefined);
				let areteCasting = new DialogAreteCasting(actor, rote);
				areteCasting.render(true);
	
				return;
			}

			if (dataset.rollfrenzy == "true") {
				let frenzy = undefined;

				if (dataset.type == CONFIG.wod.sheettype.vampire) {
					frenzy = new VampireFrenzy(dataset);
				}
				if (dataset.type == CONFIG.wod.sheettype.werewolf) {
					frenzy = new WerewolfFrenzy(actor, dataset);
				}

				let checkFrenzy = new DialogCheckFrenzy(actor, frenzy);
				checkFrenzy.render(true);

				return;
			}

			if (dataset.rollshapechange == "true") {
				const shape = new Shape(actor);
				let shapeChange = new DialogShapeChange(actor, shape);
				shapeChange.render(true);

				return;
			}

			if (dataset.rollremainactive == "true") {
				templateHTML = `<h2>${game.i18n.localize("wod.dice.rollingremainactive")}</h2> <strong>${game.i18n.localize("wod.advantages.rage")} (${actor.system.advantages.rage.permanent})</strong>`;

				const activeRoll = new DiceRoll(actor);
				activeRoll.handlingOnes = CONFIG.wod.handleOnes;
				activeRoll.numDices = parseInt(actor.system.advantages.rage.permanent);
				activeRoll.difficulty = 8;
				activeRoll.templateHTML = templateHTML;
				activeRoll.systemText = game.i18n.localize("wod.dice.rollingremainactivetext");

				rollDice(activeRoll);

				return;
			}			

			console.log(dataset);
			ui.notifications.error("Macro roll missing function");

			return;
		}

		console.log(dataset);
		ui.notifications.error("Roll missing function");

		return;
    }	

	static RollParadox(event, actor) {
		event.preventDefault();

		const numDice = parseInt(actor.system.paradox.roll);
		const difficulty = 6;		
		let rollHTML = `<h2>${game.i18n.localize("wod.advantages.paradox")}</h2>`;
		rollHTML += `${game.i18n.localize("wod.advantages.paradox")} (${actor.system.paradox.roll})`;

		const paradoxRoll = new DiceRoll(actor);
        paradoxRoll.handlingOnes = CONFIG.wod.handleOnes;
        paradoxRoll.numDices = parseInt(numDice);
        paradoxRoll.difficulty = parseInt(difficulty);
        paradoxRoll.templateHTML = rollHTML;
        paradoxRoll.origin = "paradox";

		rollDice(paradoxRoll);
	}

    static async handleCalculations(actorData) {		

		let advantageRollSetting = true;

		try {
			advantageRollSetting = CONFIG.wod.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		// attributes totals
		actorData = await calculateTotals(actorData);

		// abilities max
		actorData = await this._setAbilityMaxValue(actorData);

		// willpower
		if (CONFIG.wod.attributeSettings == "5th") {
			actorData.system.advantages.willpower.permanent = parseInt(actorData.system.attributes.composure.value) + parseInt(actorData.system.attributes.resolve.value);
		}
		
		if (actorData.system.advantages.willpower.permanent > actorData.system.advantages.willpower.max) {
			actorData.system.advantages.willpower.permanent = actorData.system.advantages.willpower.max;
		}
		
		if (actorData.system.advantages.willpower.permanent < actorData.system.advantages.willpower.temporary) {
			actorData.system.advantages.willpower.temporary = actorData.system.advantages.willpower.permanent;
		}

		if (advantageRollSetting) {
			actorData.system.advantages.willpower.roll = actorData.system.advantages.willpower.permanent;
		}
		else {
			actorData.system.advantages.willpower.roll = actorData.system.advantages.willpower.permanent > actorData.system.advantages.willpower.temporary ? actorData.system.advantages.willpower.temporary : actorData.system.advantages.willpower.permanent; 
		}		

		console.log("WoD | Sheet calculations done");

		// make sure all bonuses connected to an item have the same status as the item itself.
		for (const item of actorData.items) {
			for (const bonus of actorData.items) {
				if ((bonus.type == "Bonus") && (bonus.system.parentid == item._id)) {
					bonus.system.isactive = item.system.isactive;
				}
			}
		}

		if ((actorData.system.settings.hasrage) || (actorData.system.settings.hasgnosis)) {
			await this._handleWerewolfCalculations(actorData);
		}
		if ((actorData.system.settings.haspath) || (actorData.system.settings.hasbloodpool) || (actorData.system.settings.hasvirtue)) {
			await this._handleVampireCalculations(actorData);
		}
		if (actorData.system.settings.hasglamour) {
			await this._handleChangelingCalculations(actorData);
		}
		if (actorData.system.settings.hasconviction) {
			await this._handleHunterCalculations(actorData);
		}
		if ((actorData.system.settings.hasfaith) || (actorData.system.settings.hastorment)) {
			await this._handleDemonCalculations(actorData);
		}

		actorData.system.movement = await CombatHelper.CalculateMovement(actorData);
	}

    static async handleWoundLevelCalculations(actorData) {
		let totalNormWoundLevels = parseInt(actorData.system.health.damage.bashing) + parseInt(actorData.system.health.damage.lethal) + parseInt(actorData.system.health.damage.aggravated);
		let totalChimericalWoundLevels = 0;
		
		if (actorData.system.health.damage.chimerical != undefined) {
			totalChimericalWoundLevels = parseInt(actorData.system.health.damage.chimerical.bashing) + parseInt(actorData.system.health.damage.chimerical.lethal) + parseInt(actorData.system.health.damage.chimerical.aggravated);
		}

		let totalWoundLevels = totalNormWoundLevels < totalChimericalWoundLevels ? totalChimericalWoundLevels : totalNormWoundLevels;

		// calculate total amount of health levels
		actorData.system.traits.health.totalhealthlevels.max = 0;

		for (const i in CONFIG.wod.woundLevels) {
			actorData.system.traits.health.totalhealthlevels.max += parseInt(actorData.system.health[i].total);
		}

		actorData.system.traits.health.totalhealthlevels.value = actorData.system.traits.health.totalhealthlevels.max - totalWoundLevels;

		if (totalWoundLevels == 0) {
			actorData.system.health.damage.woundlevel = "";
			actorData.system.health.damage.woundpenalty = 0;

			return
		}		

		// check wound level and wound penalty
		for (const i in CONFIG.wod.woundLevels) {
			totalWoundLevels = totalWoundLevels - parseInt(actorData.system.health[i].total);

			if (totalWoundLevels <= 0) {
				actorData.system.health.damage.woundlevel = actorData.system.health[i].label;
				actorData.system.health.damage.woundpenalty = actorData.system.health[i].penalty;

				return
			}
		}		
	}

	static async _handleChangelingCalculations(actorData) {
		console.log("WoD | handleChangelingCalculations");

		// glamour
		if (actorData.system.advantages.glamour.permanent > actorData.system.advantages.glamour.max) {
			actorData.system.advantages.glamour.permanent = actorData.system.advantages.glamour.max;
		}
		
		if (actorData.system.advantages.glamour.permanent < actorData.system.advantages.glamour.temporary) {
			actorData.system.advantages.glamour.temporary = actorData.system.advantages.glamour.permanent;
		}

		// nightmare
		if (actorData.system.advantages.nightmare.temporary > actorData.system.advantages.nightmare.max) {
			actorData.system.advantages.nightmare.temporary = actorData.system.advantages.nightmare.max;
		}

		// banality
		if (actorData.system.advantages.banality.permanent > actorData.system.advantages.banality.max) {
			actorData.system.advantages.banality.permanent = actorData.system.advantages.banality.max;
		}

		let advantageRollSetting = true;

		try {
			advantageRollSetting = CONFIG.wod.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		if (advantageRollSetting) {
			actorData.system.advantages.glamour.roll = actorData.system.advantages.glamour.permanent; 			
			actorData.system.advantages.banality.roll = actorData.system.advantages.banality.permanent;
		}
		else {
			actorData.system.advantages.glamour.roll = actorData.system.advantages.glamour.permanent > actorData.system.advantages.glamour.temporary ? actorData.system.advantages.glamour.temporary : actorData.system.advantages.glamour.permanent; 
			actorData.system.advantages.banality.roll = actorData.system.advantages.banality.permanent > actorData.system.advantages.banality.temporary ? actorData.system.advantages.banality.temporary : actorData.system.advantages.banality.permanent;
		}

		actorData.system.advantages.nightmare.roll = actorData.system.advantages.nightmare.temporary;
	}

	static async _handleHunterCalculations(actorData) {
		console.log("WoD | handleHunterCalculations");

		let primary = actorData.system.primaryvirtue;

		if (primary == "wod.advantages.virtue.mercy") {
			primary = "mercy";
		}
		else if (primary == "wod.advantages.virtue.vision") {
			primary = "vision";
		}
		else if (primary == "wod.advantages.virtue.zeal") {
			primary = "zeal";
		}

		// virtues
		if (primary != "") {			
			if (actorData.system.advantages.virtues.mercy.permanent > actorData.system.advantages.virtues[primary].permanent) {
				actorData.system.advantages.virtues.mercy.permanent = actorData.system.advantages.virtues[primary].permanent;
			}

			if (actorData.system.advantages.virtues.mercy.spent > actorData.system.advantages.virtues.mercy.permanent) {
				actorData.system.advantages.virtues.mercy.spent = actorData.system.advantages.virtues.mercy.permanent;
			}

			if (actorData.system.advantages.virtues.vision.permanent > actorData.system.advantages.virtues[primary].permanent) {
				actorData.system.advantages.virtues.vision.permanent = actorData.system.advantages.virtues[primary].permanent;
			}

			if (actorData.system.advantages.virtues.vision.spent > actorData.system.advantages.virtues.vision.permanent) {
				actorData.system.advantages.virtues.vision.spent = actorData.system.advantages.virtues.vision.permanent;
			}

			if (actorData.system.advantages.virtues.zeal.permanent > actorData.system.advantages.virtues[primary].permanent) {
				actorData.system.advantages.virtues.zeal.permanent = actorData.system.advantages.virtues[primary].permanent;
			}

			if (actorData.system.advantages.virtues.zeal.spent > actorData.system.advantages.virtues.zeal.permanent) {
				actorData.system.advantages.virtues.zeal.spent = actorData.system.advantages.virtues.zeal.permanent;
			}
		}
		else {
			console.warn("WoD | _handleHunterCalculations - Primary virtue not selected.");
		}
		
		actorData.system.advantages.virtues.mercy.roll = parseInt(actorData.system.advantages.virtues.mercy.permanent);
		actorData.system.advantages.virtues.vision.roll = parseInt(actorData.system.advantages.virtues.vision.permanent);
		actorData.system.advantages.virtues.zeal.roll = parseInt(actorData.system.advantages.virtues.zeal.permanent);		
	}

	static async _handleDemonCalculations(actorData) {
		console.log("WoD | handleDemonCalculations");	

		// faith
		if (actorData.system.settings.hasfaith) {
			if (actorData.system.advantages.faith.permanent > actorData.system.advantages.faith.max) {
				actorData.system.advantages.faith.permanent = actorData.system.advantages.faith.max;
			}
			
			if (actorData.system.advantages.faith.permanent < actorData.system.advantages.faith.temporary) {
				actorData.system.advantages.faith.temporary = actorData.system.advantages.faith.permanent;
			}

			actorData.system.advantages.faith.roll = parseInt(actorData.system.advantages.faith.permanent);	
		} 

		// torment
		if (actorData.system.settings.hastorment) {
			if (actorData.system.advantages.torment.permanent > actorData.system.advantages.torment.max) {
				actorData.system.advantages.torment.permanent = actorData.system.advantages.torment.max;
			}

			if (actorData.system.advantages.torment.temporary > actorData.system.advantages.torment.max) {
				actorData.system.advantages.torment.temporary = actorData.system.advantages.torment.max;
			}
		}
	}

	static async _handleVampireCalculations(actorData) {
		console.log("WoD | handleVampireCalculations");

		actorData.system.advantages.path.roll = parseInt(actorData.system.advantages.path.permanent);
		actorData.system.advantages.virtues.conscience.roll = parseInt(actorData.system.advantages.virtues.conscience.permanent);
		actorData.system.advantages.virtues.selfcontrol.roll = parseInt(actorData.system.advantages.virtues.selfcontrol.permanent);
		actorData.system.advantages.virtues.courage.roll = parseInt(actorData.system.advantages.virtues.courage.permanent);	
		
		if (actorData.system.advantages.path.permanent == 1) {
			actorData.system.advantages.path.bearing = 2;
		}
		else if ((actorData.system.advantages.path.permanent >= 2) && (actorData.system.advantages.path.permanent <= 3)) {
			actorData.system.advantages.path.bearing = 1;
		}
		else if ((actorData.system.advantages.path.permanent >= 4) && (actorData.system.advantages.path.permanent <= 7)) {
			actorData.system.advantages.path.bearing = 0;
		}
		else if ((actorData.system.advantages.path.permanent >= 8) && (actorData.system.advantages.path.permanent <= 9)) {
			actorData.system.advantages.path.bearing = -1;
		}
		else if (actorData.system.advantages.path.permanent == 10) {
			actorData.system.advantages.path.bearing = -2;
		}
	}

	static async handleMageCalculations(actorData) {
		console.log("WoD | handleMageCalculations");

		actorData.system.advantages.arete.roll = parseInt(actorData.system.advantages.arete.permanent);
		actorData.system.paradox.roll = parseInt(actorData.system.paradox.temporary) + parseInt(actorData.system.paradox.permanent);
	}

	static async _handleWerewolfCalculations(actorData) {
		console.log("WoD | handleWerewolfCalculations");
		
		let advantageRollSetting = true;

		// shift
		if ((actorData.type == CONFIG.wod.sheettype.werewolf) || (actorData.type == CONFIG.wod.sheettype.changingbreed)) {
			if ((!actorData.system.shapes.homid.isactive) &&
				(!actorData.system.shapes.glabro.isactive) &&
				(!actorData.system.shapes.crinos.isactive) &&
				(!actorData.system.shapes.hispo.isactive) &&
				(!actorData.system.shapes.lupus.isactive)) {
				actorData.system.shapes.homid.isactive = true;				
			}

			if (actorData.system.shapes.homid.isactive) {
				actorData.system.shapes.glabro.isactive = false;
				actorData.system.shapes.crinos.isactive = false;
				actorData.system.shapes.hispo.isactive = false;
				actorData.system.shapes.lupus.isactive = false;
			}
			else if (actorData.system.shapes.glabro.isactive) {
				actorData.system.shapes.homid.isactive = false;
				actorData.system.shapes.crinos.isactive = false;
				actorData.system.shapes.hispo.isactive = false;
				actorData.system.shapes.lupus.isactive = false;
			}
			else if (actorData.system.shapes.crinos.isactive) {
				actorData.system.shapes.homid.isactive = false;
				actorData.system.shapes.glabro.isactive = false;
				actorData.system.shapes.hispo.isactive = false;
				actorData.system.shapes.lupus.isactive = false;
			}
			else if (actorData.system.shapes.hispo.isactive) {
				actorData.system.shapes.homid.isactive = false;
				actorData.system.shapes.glabro.isactive = false;
				actorData.system.shapes.crinos.isactive = false;
				actorData.system.shapes.lupus.isactive = false;
			}
			else if (actorData.system.shapes.lupus.isactive) {
				actorData.system.shapes.homid.isactive = false;
				actorData.system.shapes.glabro.isactive = false;
				actorData.system.shapes.crinos.isactive = false;
				actorData.system.shapes.hispo.isactive = false;
			}

			//actorData.system.listdata.movement = CombatHelper.CalculateMovement(actorData);
		}

		// rage
		if (actorData.system.advantages.rage.permanent > actorData.system.advantages.rage.max) {
			actorData.system.advantages.rage.permanent = actorData.system.advantages.rage.max;
		}
		
		if (actorData.system.advantages.rage.permanent < actorData.system.advantages.rage.temporary) {
			//ui.notifications.warn(game.i18n.localize("wod.advantages.ragewarning"));
		}
		
		// gnosis
		if (actorData.system.advantages.gnosis.permanent > actorData.system.advantages.gnosis.max) {
			actorData.system.advantages.gnosis.permanent = actorData.system.advantages.gnosis.max;
		}
		
		if (actorData.system.advantages.gnosis.permanent < actorData.system.advantages.gnosis.temporary) {
			actorData.system.advantages.gnosis.temporary = actorData.system.advantages.gnosis.permanent;
		}		

		try {
			advantageRollSetting = CONFIG.wod.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		if (advantageRollSetting) {
			actorData.system.advantages.rage.roll = actorData.system.advantages.rage.permanent; 
			actorData.system.advantages.gnosis.roll = actorData.system.advantages.gnosis.permanent;
			actorData.system.advantages.willpower.roll = actorData.system.advantages.willpower.permanent; 
		}
		else {
			actorData.system.advantages.rage.roll = actorData.system.advantages.rage.permanent > actorData.system.advantages.rage.temporary ? actorData.system.advantages.rage.temporary : actorData.system.advantages.rage.permanent; 
			actorData.system.advantages.gnosis.roll = actorData.system.advantages.gnosis.permanent > actorData.system.advantages.gnosis.temporary ? actorData.system.advantages.gnosis.temporary : actorData.system.advantages.gnosis.permanent;
			actorData.system.advantages.willpower.roll = actorData.system.advantages.willpower.permanent > actorData.system.advantages.willpower.temporary ? actorData.system.advantages.willpower.temporary : actorData.system.advantages.willpower.permanent; 
		}		

		actorData.system.attributes.charisma.total = parseInt(actorData.system.attributes.charisma.total);
		actorData.system.attributes.manipulation.total = parseInt(actorData.system.attributes.manipulation.total);

		if (actorData.system.advantages.rage.roll > actorData.system.advantages.willpower.roll) {
			const rageDiff = parseInt(actorData.system.advantages.rage.roll) - parseInt(actorData.system.advantages.willpower.roll);

			actorData.system.attributes.charisma.total = parseInt(actorData.system.attributes.charisma.total) - rageDiff;
			actorData.system.attributes.manipulation.total = parseInt(actorData.system.attributes.manipulation.total) - rageDiff;
		}

		for (const item of actorData.items) {
			if (item.type == "Bonus") {
				if ((item.system.parentid == "hispo") || (item.system.parentid == "lupus")) {
					item.system.isactive = false;
				}

				if ((actorData.system.shapes.hispo.isactive) && (item.system.parentid == "hispo")) {
					if ((item.system.settingtype == "perception") && (CONFIG.wod.attributeSettings == "20th")) {
						item.system.isactive = true;
					}

					if ((item.system.settingtype == "wits") && (CONFIG.wod.attributeSettings == "5th")) {
						item.system.isactive = true;
					}					
				}

				if ((actorData.system.shapes.lupus.isactive) && (item.system.parentid == "lupus")) {
					if ((item.system.settingtype == "perception") && (CONFIG.wod.attributeSettings == "20th")) {
						item.system.isactive = true;
					}

					if ((item.system.settingtype == "wits") && (CONFIG.wod.attributeSettings == "5th")) {
						item.system.isactive = true;
					}
				}
			}
		}
	}		
	
	static async handleCreatureCalculations(actorData) {
		console.log("WoD | handleCreatureCalculations");		
	}

	static _setMortalAbilities(actor) {
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.art") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}	

	static _setVampireAbilities(actor) {		
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {

			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.finance") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}				
		}
	}

	static _setMageAbilities(actor) {		
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.art") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}	
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.martialarts") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.meditation") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.research") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.technology")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}	
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.cosmology") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.esoterica") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}						
		}
	}

	static _setWerewolfAbilities(actor) {		
		for (const talent in CONFIG.wod.talents) {
			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership")	|| 
					(actor.system.abilities.talent[talent].label == "wod.abilities.primalurge") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||	
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||	
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny")	|| 
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {
			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||	
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") ||	
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult")	|| 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.rituals") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static _setChangelingAbilities(actor) {
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.kenning") ||
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.gremayre") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static _setHunterAbilities(actor) {
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.dodge") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intuition") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.demolitions") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.security") ||	
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.technology")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.bureaucracy") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.finance") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.linguistics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.research") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static _setDemonAbilities(actor) {
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.dodge") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intuition") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.demolitions") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.security") ||	
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.technology")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.finance") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.linguistics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.religion") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.research") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static _setCreatureAbilities(actor) {
		for (const talent in CONFIG.wod.talents) {
			actor.system.abilities.talent[talent].isvisible = false;
		}

		for (const skill in CONFIG.wod.skills) {
			actor.system.abilities.skill[skill].isvisible = false;
		}

		for (const knowledge in CONFIG.wod.knowledges) {
			actor.system.abilities.knowledge[knowledge].isvisible = false;
		}		
	}
	
	static _setMortalAttributes(actor) {
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

	static _setVampireAttributes(actor) {
		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.haspath = true;
		actor.system.settings.hasbloodpool = true;		
		actor.system.settings.hasvirtue = true;

		actor.system.settings.powers.hasdisciplines = true;
	}

	static _setWerewolfAttributes(actor) {
		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = true;

		actor.system.settings.hasrage = true;
		actor.system.settings.hasgnosis = true;

		actor.system.settings.powers.hasgifts = true;
	}

	static setShifterAttributes(actor, type) {
		this._setWerewolfAttributes(actor);

		if ((type == "Ananasi") || (type == "Nuwisha")) {
			actor.system.settings.hasrage = false;
		}
		if (type == "Ananasi") {
			actor.system.settings.hasbloodpool = true;
		}
	}

	static _setMageAttributes(actor) {
		actor.system.advantages.arete.permanent = 1;
		actor.system.advantages.arete.roll = 1;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;
	}

	static _setChangelingAttributes(actor) {
		actor.system.settings.soak.chimerical.bashing.isrollable = true;
		actor.system.settings.soak.chimerical.lethal.isrollable = true;
		actor.system.settings.soak.chimerical.aggravated.isrollable = false;
		
		actor.system.settings.hasglamour = true;
		actor.system.settings.hasbanality = true;

		actor.system.settings.powers.hasarts = true;
	}

	static _setHunterAttributes(actor) {
		actor.system.settings.hasconviction = true;
		actor.system.settings.hasvirtue = true;

		actor.system.settings.powers.hasedges = true;
	}

	static _setDemonAttributes(actor) {
		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.hasvirtue = true;
		actor.system.settings.hasfaith = true;
		actor.system.settings.hastorment = true;
		
		actor.system.settings.powers.haslores = true;
	}

	static _setCreatureAttributes(actor) {
		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.powers.haspowers = true;
	}

	static _setSpiritAttributes(actor) {
		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = true;
	}

	static _setupDotCounters(html) {
		html.find(".resource-value").each(function () {
			const value = Number(this.dataset.value);
			$(this)
				.find(".resource-value-step")
				.each(function (i) {
					if (i + 1 <= value) {
						$(this).addClass("active");
					}
				});
		});
	}

	static async _setAbilityMaxValue(actorData) {
		if (actorData.type == CONFIG.wod.sheettype.vampire) {
			return actorData;
		}

		if (!isNumber(actorData.system.settings.abilities.defaultmaxvalue)) {
			actorData.system.settings.abilities.defaultmaxvalue = 5;
		}

		for (const i in actorData.system.abilities.talent) {
			if (actorData.system.abilities.talent[i].max != actorData.system.settings.abilities.defaultmaxvalue) {
				actorData.system.abilities.talent[i].max = parseInt(actorData.system.settings.abilities.defaultmaxvalue);
			}
		}
	
		for (const i in actorData.system.abilities.skill) {
			if (actorData.system.abilities.skill[i].max != actorData.system.settings.abilities.defaultmaxvalue) {
				actorData.system.abilities.skill[i].max = parseInt(actorData.system.settings.abilities.defaultmaxvalue);
			}
		}
	
		for (const i in actorData.system.abilities.knowledge) {
			if (actorData.system.abilities.knowledge[i].max != actorData.system.settings.abilities.defaultmaxvalue) {
				actorData.system.abilities.knowledge[i].max = parseInt(actorData.system.settings.abilities.defaultmaxvalue);
			}
		}

		for (const item of actorData.items) {
			if ((item.type == "Trait") && ((item.system.type == "wod.types.talentsecondability") || (item.system.type == "wod.types.skillsecondability") || (item.system.type == "wod.types.knowledgesecondability"))) {
				if (item.system.max != parseInt(actorData.system.settings.abilities.defaultmaxvalue)) {
					item.system.max = parseInt(actorData.system.settings.abilities.defaultmaxvalue);
				}
			}
		}

		return actorData;
	}


/**
 * Sets the usersettings used in the System
 * @param user   The logged in user of Foundry
 * 
 */
	static _getUserPermissions(user) {
		// set default values
		const permissions = new UserPermissions(user);

		// check existing setting values
		const itemAdministratorLevel = game.settings.get('worldofdarkness', 'itemAdministratorLevel');
		const changeActorImage = game.settings.get('worldofdarkness', 'changeActorImagePermission');
		const changeItemImage = game.settings.get('worldofdarkness', 'changeItemImagePermission');

		// update default values from user permission
		if ((changeActorImage) || user.isGM) {
			permissions.changeActorImage = true;
		}

		if ((changeItemImage) || user.isGM) {
			permissions.changeItemImage = true;
		}

		let requiredRole = 0;

		if (itemAdministratorLevel == "gm") {
			requiredRole = 4;
		}
		if (itemAdministratorLevel == "assistant") {
			requiredRole = 3;
		}
		if (itemAdministratorLevel == "trusted") {
			requiredRole = 2;
		}
		if (itemAdministratorLevel == "player") {
			requiredRole = 1;
		}

		permissions.itemAdministrator = game.user.role >= requiredRole;

		return permissions;
	}

	static _getGraphicSettings(user) {
		// set default values
		const settings = new GraphicSettings(user);

		// check existing setting values
		const useLinkPlatform = game.settings.get('worldofdarkness', 'useLinkPlatform');

		// update default values from user permission
		if (useLinkPlatform) {
			settings.useLinkPlatform = useLinkPlatform;
		}

		return settings;
	}

	/**
	 * Transform a normal attribute to a spriti one
	 * @param attribute
	 * 
	 */
	static _transformToSpiritAttributes(attribute) {
		const list = CONFIG.wod.advantages;

		for (const i in list) {
			if (i == attribute) {
				return attribute;
			}
		}

		if (attribute == "strength") {
			return "rage";
		}
		else if ((attribute == "dexterity") || (attribute == "stamina")) {
			return "willpower";
		}
		else {
			return "gnosis";
		}
	}
}

function isNumber(data) {
	let value = parseInt(data);

	return !isNaN(parseFloat(value)) && !isNaN(value - 0);
}
