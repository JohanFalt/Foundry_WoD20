import { NewRollDice } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

import CombatHelper from "./combat-helpers.js";
import BonusHelper from "./bonus-helpers.js";

import * as WeaponDialog from "../dialogs/dialog-weapon.js";
import * as PowerDialog from "../dialogs/dialog-power.js";
import * as TraitDialog from "../dialogs/dialog-trait.js";
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
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;   

		let item = false; 
		let templateHTML = "";	
		

		// the new roll system
		if ((dataset.rollitem == "true") && ((dataset.itemid != undefined) || (dataset.itemid != "undefined"))) {
			let itemData = await actor.getEmbeddedDocument("Item", dataset.itemid);
			item = foundry.utils.duplicate(itemData);

			if (item == undefined) {
				console.warn(`WoD | RollDialog - item ${dataset.itemid} not found`);
				return;
			}

			if (item.type == "Power") {
				if (await BonusHelper.CheckAttributeBonus(actor, item.system.dice1)) {
					let bonus = await BonusHelper.GetAttributeBonus(actor, item.system.dice1);
					item.system.difficulty = parseInt(item.system.difficulty) + parseInt(bonus);
				}
				else if (await BonusHelper.CheckAttributeBonus(actor, item.system.dice2)) {
					let bonus = await BonusHelper.GetAttributeBonus(actor, item.system.dice2);
					item.system.difficulty = parseInt(item.system.difficulty) + parseInt(bonus);
				}

				if (await BonusHelper.CheckAbilityDiff(actor, item.system.dice2)) {
                    let bonus = await BonusHelper.GetAbilityDiff(actor, item.system.dice2);
                    item.system.difficulty = parseInt(item.system.difficulty) + parseInt(bonus);
                }
			}

			if ((item.type == "Melee Weapon") || (item.type == "Ranged Weapon")) {
				if (await BonusHelper.CheckAttributeBonus(actor, item.system.attack.attribute)) {
					let bonus = await BonusHelper.GetAttributeBonus(actor, item.system.attack.attribute);
					item.system.difficulty = parseInt(item.system.difficulty) + parseInt(bonus);
				}

				if (await BonusHelper.CheckAbilityDiff(actor, item.system.attack.ability)) {
                    let bonus = await BonusHelper.GetAbilityDiff(actor, item.system.attack.ability);
                    item.system.difficulty = parseInt(item.system.difficulty) + parseInt(bonus);
                }
			}

			if (item.type == "Trait") {
				if (dataset.object == "Resonance") {
					const resonance = new TraitDialog.Resonance(item);
					let generalRollUse = new TraitDialog.DialogRoll(actor, resonance);
					generalRollUse.render(true);
				}
				else {
					const other = new TraitDialog.OtherTrait(item);
					let generalRollUse = new TraitDialog.DialogRoll(actor, other);
					generalRollUse.render(true);
				}

				return;
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
			//if (dataset.object == "Magicitem") {
			if (dataset.object == "Item") {
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

				if (!actor.system.settings.hasgnosis) {
					template.push(`${game.i18n.localize("wod.advantages.willpower")} (${actor.system.advantages.willpower.roll})`);
					fetishRoll.numDices = parseInt(actor.system.advantages.willpower.roll);
					fetishRoll.difficulty = 7;
				}
				else if ((actor.type != CONFIG.worldofdarkness.sheettype.werewolf) && (actor.type != CONFIG.worldofdarkness.sheettype.changingbreed)) {
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
				fetishRoll.usewillpower = false;

        		NewRollDice(fetishRoll);

				return;
			}	
			
			// used a Gift
			if (dataset.object == "Gift") {
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

			// used an Hekau
			if (dataset.object == "hekau") {
				const hekau = new PowerDialog.HekauPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, hekau);
				powerUse.render(true);

				return;
			}

			// used an Numina
			if (dataset.object == "numina") {
				const numina = new PowerDialog.NuminaPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, numina);
				powerUse.render(true);

				return;
			}

			// exalted powers
			if ((dataset.object == "exaltedcharm") || (dataset.object == "exaltedsorcery")) {
				const charm = new PowerDialog.ExaltedPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, charm);
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

			if (dataset.object == "SortHekauPower") {
				const hekau = new SortDialog.SortHekauPower(item);
				let powerUse = new SortDialog.DialogSortPower(actor, hekau);
				powerUse.render(true);

				return;
			}

			if (dataset.object == "SortNuminaPower") {
				const numina = new SortDialog.SortNuminaPower(item);
				let powerUse = new SortDialog.DialogSortPower(actor, numina);
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
				let difficulty = 6;

				if (await BonusHelper.CheckSoakDiff(actor)) {
					const bonus = await BonusHelper.GetSoakDiff(actor);
					difficulty = difficulty + bonus;
				}

				const soak = new Soak(actor, difficulty);
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
				activeRoll.usewillpower = false;      				
				
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
		paradoxRoll.usewillpower = false; 		// can't use willpower on Paradox
		
        NewRollDice(paradoxRoll);
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