import { NewRollDice } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

import { calculateTotals } from "./totals.js";

import CombatHelper from "./combat-helpers.js";
import BonusHelper from "./bonus-helpers.js";

import * as WeaponDialog from "../dialogs/dialog-weapon.js";
import * as PowerDialog from "../dialogs/dialog-power.js";
import * as SortDialog from "../dialogs/dialog-sortpower.js";
import * as VariantDialog from "../dialogs/dialog-variant.js";

import * as ItemDialog from "../dialogs/dialog-item.js";

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
			item = await actor.getEmbeddedDocument("Item", dataset.itemid);

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
				const weapon = new WeaponDialog.MeleeWeapon(item);
				let weaponUse = new WeaponDialog.DialogWeapon(actor, weapon);
				weaponUse.render(true);

				return;
			}

			if (dataset.object == "Ranged") {
				const weapon = new WeaponDialog.RangedWeapon(item);
				let weaponUse = new WeaponDialog.DialogWeapon(actor, weapon);
				weaponUse.render(true);

				return;
			}

			if (dataset.object == "Damage") {
				item.system.extraSuccesses = 0;
				const damage = new WeaponDialog.Damage(item);
				let weaponUse = new WeaponDialog.DialogWeapon(actor, damage);
				weaponUse.render(true);

				return;
			}

			// used a Item
			if (dataset.object == "Magicitem") {
				const treasure = new ItemDialog.Magicitem(item);
				let treasureUse = new ItemDialog.DialogItem(actor, treasure);
				treasureUse.render(true);

				return;
			}

			// used a Fetish
			if ((dataset.object == "Fetish") || (dataset.object == "Talen")) {

				let template = [];				

				const fetishRoll = new DiceRollContainer(actor);	
				fetishRoll.action = game.i18n.localize("wod.dice.activate");	
				fetishRoll.origin = "general";

				if (actor.type == CONFIG.worldofdarkness.sheettype.mage) {
					template.push(`${game.i18n.localize("wod.advantages.willpower")} (${actor.system.advantages.willpower.roll})`);
					fetishRoll.numDices = parseInt(actor.system.advantages.willpower.roll);
					fetishRoll.difficulty = 7; 
				}
				else {
					template.push(`${game.i18n.localize("wod.advantages.gnosis")} (${actor.system.advantages.gnosis.roll})`);
					fetishRoll.numDices = parseInt(actor.system.advantages.gnosis.roll);
					fetishRoll.difficulty = parseInt(item.system.difficulty); 
				}

				fetishRoll.dicetext = template;
				fetishRoll.bonus = 0;				
				fetishRoll.woundpenalty = 0;				
				fetishRoll.systemText = item.system.details;

        		NewRollDice(fetishRoll);

				return;
			}	
			
			// used a Gift
			if ((dataset.object == "Gift") && (dataset.type == CONFIG.worldofdarkness.sheettype.spirit)) {
				const gift = new PowerDialog.CharmGift(item);
				let giftUse = new PowerDialog.DialogPower(actor, gift);
				giftUse.render(true);

				return;
			}
			else if (dataset.object == "Gift") {
				const gift = new PowerDialog.Gift(item);
				let giftUse = new PowerDialog.DialogPower(actor, gift);
				giftUse.render(true);

				return;
			}

			// used a Rite
			if (dataset.object == "Rite") {
				const rite = new PowerDialog.Gift(item);
				let riteUse = new PowerDialog.DialogPower(actor, rite);
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
				const charm = new PowerDialog.Charm(item);
				let charmUse = new PowerDialog.DialogPower(actor, charm);
				charmUse.render(true);

				return;
			}

			// used a Power
			if (dataset.object == "Power") {
				const power = new PowerDialog.Power(item);
				let powerUse = new PowerDialog.DialogPower(actor, power);
				powerUse.render(true);

				return;
			}

			// used a DisciplinePower
			if (dataset.object == "Discipline") {
				const discipline = new PowerDialog.DisciplinePower(item);
				let powerUse = new PowerDialog.DialogPower(actor, discipline);
				powerUse.render(true);

				return;
			}

			// used a PathPower
			if (dataset.object == "Path") {
				const path = new PowerDialog.PathPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, path);
				powerUse.render(true);

				return;
			}

			// used a Ritual
			if (dataset.object == "Ritual") {
				const ritual = new PowerDialog.RitualPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, ritual);
				powerUse.render(true);

				return;
			}

			// used an Art
			if (dataset.object == "Art") {
				const art = new PowerDialog.ArtPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, art);
				powerUse.render(true);

				return;
			}

			// used an Edge
			if (dataset.object == "Edge") {
				const edge = new PowerDialog.EdgePower(item);
				let powerUse = new PowerDialog.DialogPower(actor,edge);
				powerUse.render(true);

				return;
			}

			// used an Lore
			if (dataset.object == "Lore") {
				const lore = new PowerDialog.LorePower(item);
				let powerUse = new PowerDialog.DialogPower(actor,lore);
				powerUse.render(true);

				return;
			}

			// used an Arcanoi
			if (dataset.object == "Arcanoi") {
				const arcanoi = new PowerDialog.ArcanoiPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, arcanoi);
				powerUse.render(true);

				return;
			}

			// placing Disicpline Power in correct discipline
			if (dataset.object == "SortDisciplinePower") {
				const discipline = new SortDialog.SortDisciplinePower(item);
				let powerUse = new SortDialog.DialogSortPower(actor, discipline);
				powerUse.render(true);

				return;
			}

			if (dataset.object == "SortPathPower") {
				const discipline = new SortDialog.SortPathPower(item);
				let powerUse = new SortDialog.DialogSortPower(actor, discipline);
				powerUse.render(true);

				return;
			}			

			if (dataset.object == "SortArtPower") {
				const cantrip = new SortDialog.SortArtPower(item);
				let powerUse = new SortDialog.DialogSortPower(actor, cantrip);
				powerUse.render(true);

				return;
			}

			if (dataset.object == "SortEdgePower") {
				const edge = new SortDialog.SortEdgePower(item);
				let powerUse = new SortDialog.DialogSortPower(actor, edge);
				powerUse.render(true);

				return;
			}

			if (dataset.object == "SortLorePower") {
				const lore = new SortDialog.SortLorePower(item);
				let powerUse = new SortDialog.DialogSortPower(actor, lore);
				powerUse.render(true);

				return;
			}

			if (dataset.object == "SortArcanoiPower") {
				const arcanoi = new SortDialog.SortArcanoiPower(item);
				let powerUse = new SortDialog.DialogSortPower(actor, arcanoi);
				powerUse.render(true);

				return;
			}

			ui.notifications.error("Item Roll missing function - " + dataset.object);

			return;
		}
		else if (dataset.attribute == "true") {
			const roll = new GeneralRoll(dataset.key, "attribute", actor);
			let generalRollUse = new DialogGeneralRoll(actor, roll);
			generalRollUse.render(true);

			return;
		}
		else if (dataset.ability == "true") {
			const roll = new GeneralRoll(dataset.key, "ability", actor);
			let generalRollUse = new DialogGeneralRoll(actor, roll);
			generalRollUse.render(true);

			return;
		}
		else if (dataset.noability == "true") {
			if (dataset.key == "paradox") {
				this.RollParadox(event, actor);

				return;
			}

			const roll = new GeneralRoll(dataset.key, "noability", actor);
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

				if (dataset.type == CONFIG.worldofdarkness.sheettype.vampire) {
					frenzy = new VampireFrenzy(dataset);
				}
				if (dataset.type == CONFIG.worldofdarkness.sheettype.werewolf) {
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
				let template = [];
				template.push(`${game.i18n.localize("wod.advantages.rage")} (${actor.system.advantages.rage.permanent})`);

				const activeRoll = new DiceRollContainer(actor);
				activeRoll.action = game.i18n.localize("wod.dice.rollingremainactive");
				activeRoll.dicetext = template;
				activeRoll.bonus = 0;
				activeRoll.origin = "general";
				activeRoll.numDices = parseInt(actor.system.advantages.rage.permanent);
				activeRoll.woundpenalty = 0;
				activeRoll.difficulty = 8;          				
				
				NewRollDice(activeRoll);

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

	static openVariantDialog(actor) {
		const variant = new VariantDialog.Variant(actor);
		let dialog = new VariantDialog.DialogVariant(actor, variant);
		dialog.render(true);
	}

	static RollParadox(event, actor) {
		event.preventDefault();

		let template = [];
		template.push(`${game.i18n.localize("wod.advantages.paradox")} (${actor.system.paradox.roll})`);

		const paradoxRoll = new DiceRollContainer(actor);
        paradoxRoll.action = game.i18n.localize("wod.advantages.paradox");
        paradoxRoll.dicetext = template;
		paradoxRoll.bonus = 0;
        paradoxRoll.origin = "general";
        paradoxRoll.numDices = parseInt(actor.system.paradox.roll);
		paradoxRoll.woundpenalty = 0;
        paradoxRoll.difficulty = 6;          
        NewRollDice(paradoxRoll);
	}

    static async handleCalculations(actorData) {	
		let advantageRollSetting = true;

		try {
			advantageRollSetting = CONFIG.worldofdarkness.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		// attributes totals
		actorData = await calculateTotals(actorData);

		// abilities max
		actorData = await this._setAbilityMaxValue(actorData);

		// willpower
		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
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

		for (const i in CONFIG.worldofdarkness.woundLevels) {
			actorData.system.traits.health.totalhealthlevels.max += parseInt(actorData.system.health[i].total);
		}

		actorData.system.traits.health.totalhealthlevels.value = actorData.system.traits.health.totalhealthlevels.max - totalWoundLevels;

		if (totalWoundLevels == 0) {
			actorData.system.health.damage.woundlevel = "";
			actorData.system.health.damage.woundpenalty = 0;

			return
		}		

		// check wound level and wound penalty
		for (const i in CONFIG.worldofdarkness.woundLevels) {
			totalWoundLevels = totalWoundLevels - parseInt(actorData.system.health[i].total);

			if (totalWoundLevels <= 0) {
				actorData.system.health.damage.woundlevel = actorData.system.health[i].label;
				actorData.system.health.damage.woundpenalty = parseInt(actorData.system.health[i].penalty);

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
			advantageRollSetting = CONFIG.worldofdarkness.rollSettings;
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
		let wererwolfrageSettings = true;

		try {
			advantageRollSetting = CONFIG.worldofdarkness.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		try {
			wererwolfrageSettings = CONFIG.worldofdarkness.wererwolfrageSettings;
		} 
		catch (e) {
			wererwolfrageSettings = true;
		}

		// shift
		if ((actorData.type == CONFIG.worldofdarkness.sheettype.werewolf) || (actorData.type == CONFIG.worldofdarkness.sheettype.changingbreed)) {
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
		}

		// rage
		if (actorData.system.advantages.rage.permanent > actorData.system.advantages.rage.max) {
			actorData.system.advantages.rage.permanent = actorData.system.advantages.rage.max;
		}
		
		// gnosis
		if (actorData.system.advantages.gnosis.permanent > actorData.system.advantages.gnosis.max) {
			actorData.system.advantages.gnosis.permanent = actorData.system.advantages.gnosis.max;
		}
		
		if (actorData.system.advantages.gnosis.permanent < actorData.system.advantages.gnosis.temporary) {
			actorData.system.advantages.gnosis.temporary = actorData.system.advantages.gnosis.permanent;
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

		if (wererwolfrageSettings) {
			if (actorData.system.advantages.rage.roll > actorData.system.advantages.willpower.roll) {
				const rageDiff = parseInt(actorData.system.advantages.rage.roll) - parseInt(actorData.system.advantages.willpower.roll);
	
				actorData.system.attributes.charisma.total = parseInt(actorData.system.attributes.charisma.total) - rageDiff;
				actorData.system.attributes.manipulation.total = parseInt(actorData.system.attributes.manipulation.total) - rageDiff;
			}
		}		

		for (const item of actorData.items) {
			if (item.type == "Bonus") {
				if ((item.system.parentid == "hispo") || (item.system.parentid == "lupus")) {
					item.system.isactive = false;
				}

				if (actorData.system.shapes != undefined) {
					if ((actorData.system.shapes.hispo.isactive) && (item.system.parentid == "hispo")) {
						if ((item.system.settingtype == "perception") && (CONFIG.worldofdarkness.attributeSettings == "20th")) {
							item.system.isactive = true;
						}

						if ((item.system.settingtype == "wits") && (CONFIG.worldofdarkness.attributeSettings == "5th")) {
							item.system.isactive = true;
						}					
					}

					if ((actorData.system.shapes.lupus.isactive) && (item.system.parentid == "lupus")) {
						if ((item.system.settingtype == "perception") && (CONFIG.worldofdarkness.attributeSettings == "20th")) {
							item.system.isactive = true;
						}

						if ((item.system.settingtype == "wits") && (CONFIG.worldofdarkness.attributeSettings == "5th")) {
							item.system.isactive = true;
						}
					}
				}
			}
		}
	}		
	
	static async handleCreatureCalculations(actorData) {
		console.log("WoD | handleCreatureCalculations");		
	}	

	static SetupDotCounters(html) {
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
		if (actorData.type == CONFIG.worldofdarkness.sheettype.vampire) {
			return actorData;
		}

		try {
			if (!isNumber(actorData.system.settings.abilities.defaultmaxvalue)) {
				actorData.system.settings.abilities.defaultmaxvalue = 5;
			}
	
			for (const i in actorData.system.abilities) {
				if (actorData.system.abilities[i].max != actorData.system.settings.abilities.defaultmaxvalue) {
					actorData.system.abilities[i].max = parseInt(actorData.system.settings.abilities.defaultmaxvalue);
				}
			}
	
			for (const item of actorData.items) {
				if ((item.type == "Trait") && ((item.system.type == "wod.types.talentsecondability") || (item.system.type == "wod.types.skillsecondability") || (item.system.type == "wod.types.knowledgesecondability"))) {
					if (item.system.max != parseInt(actorData.system.settings.abilities.defaultmaxvalue)) {
						item.system.max = parseInt(actorData.system.settings.abilities.defaultmaxvalue);
					}
				}
			}
		}
		catch (e) {
			ui.notifications.error("Cannot set abilities to max rating. Please check console for details.");
			err.message = `Cannot set abilities to max rating for Actor ${actorData.name}: ${err.message}`;
            console.error(err);
			console.log(actorData);
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
		const list = CONFIG.worldofdarkness.advantages;

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
