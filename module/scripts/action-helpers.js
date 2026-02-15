import { calculateTotals } from "../scripts/totals.js";

import { DiceRoller } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

import CreateHelper from "../scripts/create-helpers.js";
import CombatHelper from "./combat-helpers.js";
import BonusHelper from "./bonus-helpers.js";
import ItemHelper from "./item-helpers.js";
import DropHelper from "./drop-helpers.js";

import AttributeHelper from "./attribute-helpers.js";
import SphereHelper from "./sphere-helpers.js";

import * as WeaponDialog from "../dialogs/dialog-weapon.js";
import * as PowerDialog from "../dialogs/dialog-power.js";
import * as TraitDialog from "../dialogs/dialog-trait.js";
import * as SortDialog from "../dialogs/dialog-sortpower.js";
import * as VariantDialog from "../dialogs/dialog-variant.js";

import * as ItemDialog from "../dialogs/dialog-item.js";
import { DialogPowerSelection } from "../dialogs/dialog-power-selection.js";

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

    //static async RollDialog(event, actor) {
	static async RollDialog(dataset, actor) {
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

        		DiceRoller(fetishRoll);

				return;
			}	
			
			// used a Gift
			if (dataset.object == "wod.types.gift") {
				const gift = new PowerDialog.Gift(item);
				let giftUse = new PowerDialog.DialogPower(actor, gift);
				giftUse.render(true);

				return;
			}

			// used a Rite
			if (dataset.object == "wod.types.rite") {
				const rite = new PowerDialog.Gift(item);
				let riteUse = new PowerDialog.DialogPower(actor, rite);
				riteUse.render(true);

				return;
			}
			
			// used a Rote
			if (dataset.object == "wod.types.rote") {
				const rote = new Rote(item);
				let areteCasting = new DialogAreteCasting(actor, rote);
				areteCasting.render(true);

				return;
			}

			// used a Charm
			if (dataset.object == "wod.types.charm") {
				const charm = new PowerDialog.Charm(item);
				let charmUse = new PowerDialog.DialogPower(actor, charm);
				charmUse.render(true);

				return;
			}

			// used a Power
			if (dataset.object == "wod.types.power") {
				const power = new PowerDialog.Power(item);
				let powerUse = new PowerDialog.DialogPower(actor, power);
				powerUse.render(true);

				return;
			}

			// used a DisciplinePower
			if ((dataset.object == "wod.types.disciplinepower") || (dataset.object == "wod.types.combination")) {
				const discipline = new PowerDialog.DisciplinePower(item);
				let powerUse = new PowerDialog.DialogPower(actor, discipline);
				powerUse.render(true);

				return;
			}

			// used a PathPower
			// if (dataset.object == "wod.types.disciplinepathpower") {
			// 	const path = new PowerDialog.PathPower(item);
			// 	let powerUse = new PowerDialog.DialogPower(actor, path);
			// 	powerUse.render(true);

			// 	return;
			// }

			// used a Ritual
			if (dataset.object == "wod.types.ritual") {
				const ritual = new PowerDialog.RitualPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, ritual);
				powerUse.render(true);

				return;
			}

			// used an Art
			if (dataset.object == "wod.types.artpower") {
				const art = new PowerDialog.ArtPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, art);
				powerUse.render(true);

				return;
			}

			// used an Edge
			if (dataset.object == "wod.types.edgepower") {
				const edge = new PowerDialog.EdgePower(item);
				let powerUse = new PowerDialog.DialogPower(actor,edge);
				powerUse.render(true);

				return;
			}

			// used an Lore
			if (dataset.object == "wod.types.lorepower") {
				const lore = new PowerDialog.LorePower(item);
				let powerUse = new PowerDialog.DialogPower(actor,lore);
				powerUse.render(true);

				return;
			}

			// used an Arcanoi
			if (dataset.object == "wod.types.arcanoipower") {
				const arcanoi = new PowerDialog.ArcanoiPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, arcanoi);
				powerUse.render(true);

				return;
			}

			// used an Hekau
			if (dataset.object == "wod.types.hekaupower") {
				const hekau = new PowerDialog.HekauPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, hekau);
				powerUse.render(true);

				return;
			}

			// used an Numina
			if (dataset.object == "wod.types.numinapower") {
				const numina = new PowerDialog.NuminaPower(item);
				let powerUse = new PowerDialog.DialogPower(actor, numina);
				powerUse.render(true);

				return;
			}

			// used an Horror
			if (dataset.object == "wod.types.horror") {
				const horror = new PowerDialog.Horror(item);
				let powerUse = new PowerDialog.DialogPower(actor, horror);
				powerUse.render(true);

				return;
			}

			// exalted powers
			if ((dataset.object == "wod.types.exaltedcharm") || (dataset.object == "wod.types.exaltedsorcery")) {
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
				CombatHelper.RollInitiative(actor);

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

				if (dataset.type.toLowerCase() == CONFIG.worldofdarkness.sheettype.vampire.toLowerCase()) {
					frenzy = new VampireFrenzy(dataset);
				}
				if (dataset.type.toLowerCase() == CONFIG.worldofdarkness.sheettype.werewolf.toLowerCase()) {
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
				let numdices = 0;				

				if (actor.type === "PC") {
					numdices = parseInt(actor.system.advantages.rage.system.permanent);
				}
				else {
					numdices = parseInt(actor.system.advantages.rage.permanent);
				}

				template.push(`${game.i18n.localize("wod.advantages.rage")} (${numdices})`);

				const activeRoll = new DiceRollContainer(actor);
				activeRoll.action = game.i18n.localize("wod.dice.rollingremainactive");
				activeRoll.dicetext = template;
				activeRoll.bonus = 0;
				activeRoll.origin = "general";
				activeRoll.numDices = numdices;
				activeRoll.woundpenalty = 0;
				activeRoll.difficulty = 8;    
				activeRoll.usewillpower = false;      				
				
				DiceRoller(activeRoll);

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
		const paradoxRoll = new DiceRollContainer(actor);		

		if (actor.type === "PC") {
			template.push(`${game.i18n.localize("wod.advantages.paradox")} (${actor.system.advantages.paradox.system.roll})`);
			paradoxRoll.numDices = parseInt(actor.system.advantages.paradox.system.roll);
		}
		else {
			template.push(`${game.i18n.localize("wod.advantages.paradox")} (${actor.system.paradox.roll})`);
			paradoxRoll.numDices = parseInt(actor.system.paradox.roll);
		}

		paradoxRoll.action = game.i18n.localize("wod.advantages.paradox");
        paradoxRoll.dicetext = template;
		paradoxRoll.bonus = 0;
        paradoxRoll.origin = "general";
		paradoxRoll.woundpenalty = 0;
        paradoxRoll.difficulty = 6;      
		paradoxRoll.usewillpower = false; 		// can't use willpower on Paradox
		
        DiceRoller(paradoxRoll);
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

	static SetupDotCounters_v2(element) {
		if (!element) return;

		const root = element instanceof HTMLElement
			? element
			: element?.[0] instanceof HTMLElement
				? element[0]
				: null;

		if (!root) return;

		const containers = root.querySelectorAll(".resource-value");
		containers.forEach(container => {
			const value = Number(container.dataset.value ?? 0);
			const steps = container.querySelectorAll(".resource-value-step");
			steps.forEach((step, index) => {
				if (index + 1 <= value) {
					step.classList.add("active");
				} else {
					step.classList.remove("active");
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

/* Unlock sheet */
export const OnActorLock  = async function (event, target) {
	event.preventDefault()

	const actor = this.actor;
	actor.update({ 
		'system.locked': !actor.system.locked 
	});
}

/* Alter a boolean value on actor */
export const OnActorSwitch = async function (event, target) {
	event.preventDefault();

	// Top-level variables	
	const property = target.getAttribute("data-type");
	const path = `${property}`;

	const actorData = foundry.utils.duplicate(this.actor);	
	const current = foundry.utils.getProperty(actorData, path);

	// Säkerställ att egenskapen finns och är boolean innan toggling
	if (typeof current !== "boolean") {
		return;
	}

	foundry.utils.setProperty(actorData, path, !current);

	actorData.system.settings.isupdated = false;
	await this.actor.update(actorData);
	this.render();
}

/* Health */
export const OnSquareCounterChange = async function (event, target) {
  	event.preventDefault();

	//const element = event.currentTarget;
	const dataset = target.dataset;

	const oldState = dataset.state || "";
	const states = parseCounterStates("/:bashing,x:lethal,*:aggravated");
	
	const allStates = ["", ...Object.keys(states)];
	const currentState = allStates.indexOf(oldState);

	if (currentState < 0) {
		return;
	}

	const actorData = foundry.utils.duplicate(this.actor);

	if (oldState == "") {
		actorData.system.health.damage.bashing = parseInt(actorData.system.health.damage.bashing) + 1;
	}
	else if (oldState == "/") { 
		actorData.system.health.damage.bashing = parseInt(actorData.system.health.damage.bashing) - 1;
		actorData.system.health.damage.lethal = parseInt(actorData.system.health.damage.lethal) + 1;			
	}
	else if (oldState == "x") { 
		actorData.system.health.damage.lethal = parseInt(actorData.system.health.damage.lethal) - 1;
		actorData.system.health.damage.aggravated = parseInt(actorData.system.health.damage.aggravated) + 1;
	}
	else if (oldState == "*") { 
		actorData.system.health.damage.aggravated = parseInt(actorData.system.health.damage.aggravated) - 1;
	}

	if (parseInt(actorData.system.health.damage.bashing) < 0) {
		actorData.system.health.damage.bashing = 0;
	}

	if (parseInt(actorData.system.health.damage.lethal) < 0) {
		actorData.system.health.damage.lethal = 0;
	}

	if (parseInt(actorData.system.health.damage.aggravated) < 0) {
		actorData.system.health.damage.aggravated = 0;
	}

	actorData.system.settings.isupdated = false;
	await this.actor.update(actorData);
	this.render();
}

/* Clear health boxes */
//async _onSquareCounterClear(event) {
export const OnSquareCounterClear = async function (event) {
	event.preventDefault();

	const element = event.currentTarget;
	const oldState = element.dataset.state || "";
	const dataset = element.dataset;
	const type = dataset.type;

	if (type != CONFIG.worldofdarkness.sheettype.mortal) {
		return;
	}

	const actorData = foundry.utils.duplicate(this.actor);

	if (oldState == "") {
		return
	}
	else if (oldState == "/") { 
		actorData.system.health.damage.bashing = parseInt(actorData.system.health.damage.bashing) - 1;
	}
	else if (oldState == "x") { 
		actorData.system.health.damage.lethal = parseInt(actorData.system.health.damage.lethal) - 1;
	}
	else if (oldState == "*") { 
		actorData.system.health.damage.aggravated = parseInt(actorData.system.health.damage.aggravated) - 1;
	}

	actorData.system.settings.isupdated = false;
	await this.actor.update(actorData);
	this.render();
}

export const OnDotCounterChange = async function (event, target) {
	event.preventDefault();

	if (!target) return;

	const dataset = target.dataset;
	let parent = $(target).closest(dataset.state !== undefined ? '.resource-counter' : '.resource-value');
	if (!parent.length) return;

	const parent_dataset = parent[0].dataset;
	const steps = parent.find('span.resource-value-step');	
	const index = Number(dataset.index);
	const path = (parent_dataset.name || "").split(".");
	const itemid = dataset.itemid ?? parent_dataset.itemid;

	if (this.locked) {
		ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
		return;
	}

	let newValue = (index === 0 && getNested(this.actor.system, path) === 1) ? 0 : index + 1;

	if (itemid) {
		let item = await this.actor.getEmbeddedDocument("Item", itemid);
		const itemData = foundry.utils.duplicate(item);

		// Handle if temporary value of an Advantage can't be higher then permanent.
		if ((item.type === "Advantage") && 
				(item.system?.settings?.highertemporary === false) && 
				(item.system?.settings?.usepermanent === true) && 
				(item.system?.settings?.usetemporary === true)) {
			if ((parent_dataset.name === "system.permanent") && (newValue < item.system.temporary)) {
				itemData.system.temporary = parseInt(newValue);
			}
			if ((parent_dataset.name === "system.temporary") && (newValue > item.system.permanent)) {
				newValue = parseInt(item.system.permanent);
			}
		}
		
		setNested(itemData, path, newValue);		

		await item.update(itemData);
	} else {
		if (index < 0 || index >= steps.length) return;
		const actorData = foundry.utils.duplicate(this.actor);
		setNested(actorData, path, newValue);
		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
	}

	steps.removeClass("active");
	steps.each(function (i) {
		if (i <= index) $(this).addClass("active");
	});
}

export const OnUseMacro = async function (event, target) {
	event.preventDefault();
	if (!target) return;
	const dataset = target.dataset;

	ActionHelper.RollDialog(dataset, this.actor);
}

export const OnItemCreate = async function (event, target) {
	event.preventDefault();

	let origin = target.getAttribute("data-origin");

	let buttons = {};
	let system = this.actor.type;
	let splatname = ( this.actor.system.settings.variantsheet === "" ? this.actor.system.settings.splat.toLowerCase() : this.actor.system.settings.variantsheet.toLowerCase());
	let sheettype = ( splatname === "pc" ? "mortal" : splatname);

	if (sheettype == CONFIG.worldofdarkness.sheettype.changingbreed) {
		sheettype = CONFIG.worldofdarkness.sheettype.werewolf;
	}

	system = sheettype;

	// Render the template
	const itemselectionTemplate = 'systems/worldofdarkness/templates/dialogs/dialog-new-item.hbs';
	
	let itemselectionData = {
		tab: origin,
		sheettype: sheettype,
		actor: this.actor
	}

	if (origin == "bio") {
		buttons = await CreateHelper.CreateButtonsBio(this.actor);
	}
	if (origin == "core") {
		buttons = await CreateHelper.CreateButtonsCore(this.actor);
	}
	if (origin == "combat") {
		buttons = await CreateHelper.CreateButtonsCombat(this.actor);
	}
	if (origin == "power") {
		// Endast för PC Actor - använd ApplicationV2 formulär
		if (this.actor.type === "PC") {
			const buttonData = await CreateHelper.CreateButtonsPowerv2(this.actor);
			const powerSelectionDialog = new DialogPowerSelection(this.actor, buttonData);
			powerSelectionDialog.render(true);
			return; // Avsluta här för PC Actor
		}
		
		// Legacy actors - fortsätt med Dialog API (befintlig kod)
		buttons = await CreateHelper.CreateButtonsPowerv2(this.actor);
	}
	if (origin == "gear") {
		buttons = await CreateHelper.CreateButtonsGear(this.actor);
	}
	if (origin == "feature") {
		buttons = await CreateHelper.CreateButtonsNotev2(this.actor);
	}
	if (origin == "effect") {
		let itemData = {
			name: game.i18n.localize("wod.labels.new.bonus"),
			type: "Bonus",					
			system: {
				label: game.i18n.localize("wod.labels.new.bonus"),
				settings: {
					isvisible: true,
					isremovable: true
				}
			}
		};

		await CreateHelper.CreateItem(this.actor, itemData);
		return;
	}

	const itemselectionContent = await foundry.applications.handlebars.renderTemplate(itemselectionTemplate, itemselectionData);

	const dialog = new Dialog({
		title: game.i18n.localize("wod.labels.new.create"),
		content: itemselectionContent,
		buttons
	},
	{
		classes: ['wod20', system.toLowerCase(), 'wod-dialog', 'wod-create']
	}
	);
	
	dialog.render(true);
}

export const OnItemEdit = async function (event, target) {
	event.preventDefault();

	if (this.locked) {
		ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
		return;
	}

	// Top-level variables
	const actor = this.actor;

	const itemtype = target.getAttribute("data-type");
	const itemid = target.getAttribute('data-itemid');

	if (itemtype == "Attribute") {
		AttributeHelper.EditAttribute(this.actor, itemid);
		return;
	}
	// if (itemtype == "Sphere") {
	// 	SphereHelper.EditSphere(this.actor, itemid);
	// 	return;
	// }

	const item = actor.getEmbeddedDocument('Item', itemid);
	item.sheet.render(true);
}

export const OnItemActive = async function (event, target) {
	event.preventDefault();

	// Top-level variables
	const itemtype = target.getAttribute("data-type");
	const itemid = target.getAttribute('data-itemid');

	const item = this.actor.getEmbeddedDocument('Item', itemid);
	const itemData = foundry.utils.duplicate(item);
	itemData.system[itemtype] = !itemData.system[itemtype];

	let active = false;

	if (item.system.isactive) {
		active = false;
	}
	else {
		active = true;
	}

	if (itemData.system.bonuslist.length > 0) {
		for (let i = 0; i <= itemData.system.bonuslist.length - 1; i++) {
			itemData.system.bonuslist[i].isactive = active;
		}
	}

	await item.update(itemData);

	let actorData = foundry.utils.duplicate(this.actor);
	actorData = await calculateTotals(actorData);
	await this.actor.update(actorData);
	this.render();
}

export const OnItemSwitch = async function (event, target) {
	event.preventDefault();

	// Top-level variables	
	const property = target.getAttribute("data-type");
	const path = `system.${property}`;

	const itemid = target.getAttribute('data-itemid');

	if (!itemid) {
		const actorData = foundry.utils.duplicate(this.actor);
		const current = foundry.utils.getProperty(actorData, path);

		// Säkerställ att egenskapen finns och är boolean innan toggling
		if (typeof current !== "boolean") {
			return;
		}

		foundry.utils.setProperty(actorData, path, !current);
		actorData.system.settings.isupdated = false;
		await this.actor.update(actorData);
		this.render();
		return;
	}

	const item = this.actor.getEmbeddedDocument('Item', itemid);	

	if(!item) {
		return;
	}

	const itemData = foundry.utils.duplicate(item);	
	const current = foundry.utils.getProperty(itemData, path);

	// Säkerställ att egenskapen finns och är boolean innan toggling
	if (typeof current !== "boolean") {
		return;
	}

	foundry.utils.setProperty(itemData, path, !current);

	if (itemData.system?.bonuslist?.length > 0) {
		let isactive = false;

		if (itemData.system.isactive !== undefined) {
			isactive = item.system.isactive;
		}
		else if (itemData.system.settings.isactive !== undefined) {
			isactive = itemData.system.settings.isactive;
		}

		for (let i = 0; i <= itemData.system.bonuslist.length - 1; i++) {
			itemData.system.bonuslist[i].isactive = isactive;
		}
	}

	await item.update(itemData);

	let actorData = foundry.utils.duplicate(this.actor);
	actorData = await calculateTotals(actorData);
	actorData.system.settings.isupdated = false;
	await this.actor.update(actorData);
	this.render();
}

export const OnItemDelete = async function (event, target) {
	event.preventDefault();
	event.stopPropagation();

	if (this.locked) {
		ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
		return;
	}

	// Top-level variables
	const itemid = target.getAttribute('data-itemid');	
	const item = await this.actor.getEmbeddedDocument("Item", itemid);

	if (!item)
		return;

	const performDelete = await new Promise((resolve) => {
		Dialog.confirm({
			title: game.i18n.format(game.i18n.localize("wod.labels.remove.item"), { name: item.name }),
			yes: () => resolve(true),
			no: () => resolve(false),
			content: game.i18n.format(game.i18n.localize("wod.labels.remove.removing") + " " + item.name, {
				name: item.name,
				actor: this.actor.name,
			}),
		});
	});

	if (!performDelete)
		return;

	// Standard item deletion for non-splat items
	// FIRST remove all bonuses connected to the item
	await ItemHelper.removeItemBonus(this.actor, item);
	// If removing a main power the secondary powers needs to be emptied of parentId.
	await ItemHelper.cleanItemList(this.actor, item);
	// If removing an item you need to check if there are bonuses to it and remove them as well.
	await ItemHelper.removeConnectedItems(this.actor, item);
	await this.actor.deleteEmbeddedDocuments("Item", [itemid]);  

	let actorData = foundry.utils.duplicate(this.actor);
	actorData = await calculateTotals(actorData);
	await this.actor.update(actorData);
	this.render(); 
}

export const OnRemoveSplat = async function (event, target) {
	event.preventDefault();
	event.stopPropagation();

	if (this.locked) {
		ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
		return;
	}

	// Show warning dialog - alltid visa varning oavsett om splat item finns
	const performDelete = await new Promise((resolve) => {
		Dialog.confirm({
			title: game.i18n.localize("wod.labels.remove.splatwarning") || "Remove Splat Item?",
			yes: () => resolve(true),
			no: () => resolve(false),
			content: game.i18n.localize("wod.labels.remove.splatwarningtext") || 
				`Removing this splat item will delete all splat-related abilities, advantages, features, and powers. This action cannot be undone. Are you sure you want to continue?`
		});
	});

	if (!performDelete) {
		return;
	}

	// Hitta splat item om det finns (för att ta bort det)
	const splatItem = this.actor.items.find(i => i.type === "Splat");
	
	// Remove splat and all related data (fungerar även utan splat item)
	await DropHelper.RemoveSplatFromActor(this.actor, splatItem || null);
	
	// Delete the splat item itself om det finns
	// if (splatItem) {
	// 	await this.actor.deleteEmbeddedDocuments("Item", [splatItem.id]);
	// }

	// // Recalculate totals and render
	// let actorData = foundry.utils.duplicate(this.actor);
	// actorData = await calculateTotals(actorData);
	// await this.actor.update(actorData);
	this.render();
}

// Adds or remove a value (always number) from an existing one
export const OnQuintessenceHandling = async function (event, target) {
	event.preventDefault();

	const itemid = target.getAttribute('data-itemid');	
	const field = target.getAttribute('data-field');
	const value = parseInt(target.getAttribute('data-value'));
	const item = await this.actor.getEmbeddedDocument("Item", itemid);

	if (item.system[field] === undefined) {
		return;
	}

	const itemData = foundry.utils.duplicate(item);
	itemData.system[field] = itemData.system[field] + value;

	if (itemData.system[field] < 0) {
		itemData.system[field] = 0;
	}

	if (item.system.id === "quintessence") {
		let paradox = await this.actor.items.filter(item => item.type === "Advantage" && item.system.id === 'paradox');

		if (paradox.length > 0) {
			paradox = paradox[0];

			if ((parseInt(itemData.system.temporary) + parseInt(paradox.system.temporary) + parseInt(paradox.system.permanent)) > 20) {
				return;
			}
		}
		else if (parseInt(itemData.system.temporary) > 20) {
			return;
		}	
	}
	if (item.system.id === "paradox") {
		let quintessence = await this.actor.items.filter(item => item.type === "Advantage" && item.system.id === 'quintessence');

		if (quintessence.length > 0) {
			quintessence = quintessence[0];

			if (((parseInt(itemData.system.temporary) + parseInt(itemData.system.permanent) + parseInt(quintessence.system.temporary)) > 20)) {
				const quintessenceData = foundry.utils.duplicate(quintessence);

				const overflowValue = parseInt(itemData.system.temporary) + parseInt(itemData.system.permanent) + parseInt(quintessence.system.temporary) - 20;

				if (parseInt(quintessence.system.temporary) >= overflowValue) {
					quintessenceData.system.temporary -= overflowValue;
					await quintessence.update(quintessenceData);
				}
				else {
					return;
				}				
			}
		}
		else if ((parseInt(itemData.system.temporary) + parseInt(itemData.system.permanent)) > 20) {
			return;
		}		
	}

	await item.update(itemData);

	let actorData = foundry.utils.duplicate(this.actor);
	actorData = await calculateTotals(actorData);
	await this.actor.update(actorData);
	this.render();
}

// Shared quintessence wheel click handler (V2 Item-based)
export const OnQuintessenceWheelClick = async function (event, target) {
	event.preventDefault();
	
	const oldState = target.dataset.state || "";
	const quintessenceId = target.dataset.quintessenceid;
	const paradoxId = target.dataset.paradoxid;
	
	const quintessence = this.actor.items.get(quintessenceId);
	const paradox = this.actor.items.get(paradoxId);
	
	if (!quintessence || !paradox) return;
	
	const result = calculateQuintessenceChange(
		oldState,
		parseInt(quintessence.system.temporary),
		parseInt(paradox.system.temporary),
		parseInt(paradox.system.permanent)
	);
	
	if (result && result.quintessenceTemporary !== undefined) {
		const quintessenceData = foundry.utils.duplicate(quintessence);
		quintessenceData.system.temporary = result.quintessenceTemporary;
		await quintessence.update(quintessenceData);
	}
	
	this.render();
};

// Shared paradox wheel click handler (V2 Item-based)
export const OnParadoxWheelClick = async function (event, target) {
	event.preventDefault();
	
	const oldState = target.dataset.state || "";
	const quintessenceId = target.dataset.quintessenceid;
	const paradoxId = target.dataset.paradoxid;
	
	const quintessence = this.actor.items.get(quintessenceId);
	const paradox = this.actor.items.get(paradoxId);
	
	if (!quintessence || !paradox) return;
	
	const result = calculateParadoxChange(
		oldState,
		parseInt(quintessence.system.temporary),
		parseInt(paradox.system.temporary),
		parseInt(paradox.system.permanent)
	);
	
	if (result) {
		if (result.quintessenceTemporary !== undefined) {
			const quintessenceData = foundry.utils.duplicate(quintessence);
			quintessenceData.system.temporary = result.quintessenceTemporary;
			await quintessence.update(quintessenceData);
		}
		if (result.paradoxTemporary !== undefined) {
			const paradoxData = foundry.utils.duplicate(paradox);
			paradoxData.system.temporary = result.paradoxTemporary;
			await paradox.update(paradoxData);
		}
	}
	
	this.render();
};

// Shared logic for calculating quintessence wheel changes
// Returns { quintessenceTemporary } or null if no change
export function calculateQuintessenceChange(oldState, quintessenceTemporary, paradoxTemporary, paradoxPermanent) {
	const total = quintessenceTemporary + paradoxTemporary + paradoxPermanent;
	
	if (oldState === "") {
		if (total < 20) {
			return { quintessenceTemporary: quintessenceTemporary + 1 };
		}
	}
	else if (oldState === "Ψ") {
		if (quintessenceTemporary > 0) {
			return { quintessenceTemporary: quintessenceTemporary - 1 };
		}
	}
	
	return null;
}

// Shared logic for calculating paradox wheel changes
// Returns { quintessenceTemporary, paradoxTemporary } or null if no change
export function calculateParadoxChange(oldState, quintessenceTemporary, paradoxTemporary, paradoxPermanent) {
	let effectiveState = oldState;
	const total = quintessenceTemporary + paradoxTemporary + paradoxPermanent;
	
	// Check if we need to consume quintessence first
	if (effectiveState === "" && (total + 1) > 20) {
		effectiveState = "Ψ";
	}
	
	if (effectiveState === "") {
		if (paradoxTemporary + paradoxPermanent < 20) {
			return { paradoxTemporary: paradoxTemporary + 1 };
		}
	}
	else if (effectiveState === "x") {
		if (paradoxTemporary > 0) {
			return { paradoxTemporary: paradoxTemporary - 1 };
		}
	}
	else if (effectiveState === "*") {
		return null; // Can't change permanent
	}
	else if (effectiveState === "Ψ" && (total + 1) > 20) {
		if (paradoxTemporary + paradoxPermanent < 20) {
			return { 
				quintessenceTemporary: quintessenceTemporary - 1,
				paradoxTemporary: paradoxTemporary + 1
			};
		}
	}
	else if (effectiveState === "Ψ") {
		return { quintessenceTemporary: quintessenceTemporary - 1 };
	}
	
	return null;
}

/**
 * Uppdatera token ikon baserat på aktiv shapeform för PC Actors
 * @param {Actor} actor - The actor to update token icon for
 * @param {Item} shapeformItem - Den aktiverade shapeform item
 */
async function _updateShapeformTokenIcon(actor, shapeformItem) {
	if (!actor || !shapeformItem || (actor.type !== "PC" && actor.type !== "pc")) return;
	
	const iconUrl = shapeformItem?.system?.icon?.trim();
	const isSvg = iconUrl?.toLowerCase().endsWith('.svg');
	
	// Create unique status ID based on icon URL
	let statusId = "wod_shapeform_icon";
	if (isSvg) {
		const fileName = iconUrl.split('/').pop().replace('.svg', '');
		statusId = `wod_shapeform_${fileName}`;
		
		// Register status effect dynamically if it doesn't exist
		if (!Array.isArray(CONFIG.statusEffects)) {
			CONFIG.statusEffects = [];
		}
		if (!CONFIG.statusEffects.find(s => s.id === statusId)) {
			CONFIG.statusEffects.push({
				id: statusId,
				name: shapeformItem.name || "Shapeform",
				img: iconUrl
			});
		}
	}
	
	// Helper function to convert effects to array
	const getEffectsArray = () => {
		if (!actor.effects) return [];
		if (actor.effects instanceof foundry.utils.Collection) return Array.from(actor.effects.values());
		if (Array.isArray(actor.effects)) return actor.effects;
		if (actor.effects.size !== undefined) return Array.from(actor.effects);
		return [];
	};
	
	// Helper function to find shapeform status keys in an effect
	const getShapeformStatusKeys = (statuses) => {
		if (!statuses) return [];
		const keys = [];
		if (statuses instanceof Set) {
			statuses.forEach(key => {
				if (typeof key === 'string' && key.startsWith('wod_shapeform_')) keys.push(key);
			});
		} else if (Array.isArray(statuses)) {
			statuses.forEach(key => {
				if (typeof key === 'string' && key.startsWith('wod_shapeform_')) keys.push(key);
			});
		} else if (typeof statuses === 'object') {
			Object.keys(statuses).forEach(key => {
				if (key.startsWith('wod_shapeform_') && statuses[key]) keys.push(key);
			});
		}
		return keys;
	};
	
	// Remove all existing shapeform icons
	const effectsArray = getEffectsArray();
	const activeShapeformStatuses = new Set();
	
	for (const effect of effectsArray) {
		getShapeformStatusKeys(effect.statuses).forEach(key => activeShapeformStatuses.add(key));
	}
	
	// Deactivate existing status effects
	if (actor.toggleStatusEffect && activeShapeformStatuses.size > 0) {
		await Promise.all(Array.from(activeShapeformStatuses).map(async (statusKey) => {
			try {
				await actor.toggleStatusEffect(statusKey, {active: false});
			} catch (error) {
				// Fallback: Remove effect directly if toggleStatusEffect fails
				const effect = effectsArray.find(e => {
					if (!e.statuses) return false;
					const keys = getShapeformStatusKeys(e.statuses);
					return keys.includes(statusKey);
				});
				if (effect) await effect.delete();
			}
		}));
	} else {
		// Fallback: Remove effects via flags
		const effectsToDelete = effectsArray.filter(e => e.flags?.worldofdarkness?.shapeformIcon === true);
		await Promise.all(effectsToDelete.map(e => e.delete()));
	}
	
	// Create new icon if URL exists and is SVG
	if (isSvg) {
		try {
			// Update CONFIG.statusEffects with correct icon
			const statusEffect = CONFIG.statusEffects.find(s => s.id === statusId);
			if (statusEffect && statusEffect.img !== iconUrl) {
				statusEffect.img = iconUrl;
				statusEffect.name = shapeformItem.name || "Shapeform";
			}
			
			// Create ActiveEffect
			if (actor.toggleStatusEffect) {
				await actor.toggleStatusEffect(statusId, {active: true});
				
				// Update icon if it differs
				const updatedEffects = getEffectsArray();
				const createdEffect = updatedEffects.find(e => {
					if (!e || !e.statuses) return false;
					
					// If statuses is an array
					if (Array.isArray(e.statuses)) {
						return e.statuses.includes(statusId);
					}
					// If statuses is an object
					if (typeof e.statuses === 'object') {
						return e.statuses[statusId] === true;
					}
					return false;
				});
				
				// Check that createdEffect exists and has update method before calling it
				if (createdEffect && typeof createdEffect.update === 'function' && createdEffect.icon !== iconUrl) {
					await createdEffect.update({icon: iconUrl});
				}
			} else {
				// Fallback: Create ActiveEffect directly
				await actor.createEmbeddedDocuments("ActiveEffect", [{
					name: shapeformItem.name || "Shapeform",
					icon: iconUrl,
					statuses: { [statusId]: true },
					disabled: false,
					origin: actor.uuid,
					flags: { 
						worldofdarkness: { 
							shapeformIcon: true,
							shapeformId: shapeformItem._id 
						} 
					}
				}]);
			}
		} catch (error) {
			console.error("Failed to create shapeform icon status effect:", error);
			// Fallback: Try to create ActiveEffect directly
			try {
				await actor.createEmbeddedDocuments("ActiveEffect", [{
					name: shapeformItem.name || "Shapeform",
					icon: iconUrl,
					statuses: { [statusId]: true },
					disabled: false,
					origin: actor.uuid,
					flags: { 
						worldofdarkness: { 
							shapeformIcon: true,
							shapeformId: shapeformItem._id 
						} 
					}
				}]);
			} catch (fallbackError) {
				console.error("Fallback ActiveEffect creation also failed:", fallbackError);
			}
		}
	}
	
	// Update tokens on scene
	if (canvas?.ready && canvas.tokens) {
		const tokens = canvas.tokens.placeables.filter(token => token.document.actorId === actor.id);
		tokens.forEach(token => token.draw());
	}
	
	// ============================================
	// NEW: Token Image update
	// ============================================
	// Get tokenimage, fallback to actor.img if not set
	const tokenImageUrl = shapeformItem?.system?.tokenimage?.trim() || actor.img;
	
	// Update all tokens on scene that belong to this actor
	if (canvas?.ready && canvas.tokens) {
		const tokens = canvas.tokens.placeables.filter(token => token.document.actorId === actor.id);
		
		// Update each token's image
		await Promise.all(tokens.map(async (token) => {
			try {
				await token.document.update({
					texture: {
						src: tokenImageUrl
					}
				});
			} catch (error) {
				console.error(`Failed to update token image for token ${token.id}:`, error);
			}
		}));
		
		// Redraw tokens to show changes
		tokens.forEach(token => token.draw());
	}
}

export const OnFormActivate = async function (event, target) {
	event.preventDefault();

	const itemid = target.getAttribute('data-itemid');
	const item = await this.actor.getEmbeddedDocument("Item", itemid);	
	const itemData = foundry.utils.duplicate(item);
	itemData.system.isactive = true;

	if (itemData.system.bonuslist.length > 0) {
		(itemData.system.bonuslist || []).forEach(bonus => {
			if (bonus) bonus.isactive = true;
		});
	}

	await item.update(itemData);

	const forms = this.actor.items.filter(item => item.system.type === "wod.types.shapeform" && item._id != itemid);
	
	for (const item of forms) {
		if (item.system.isactive) {
			const formData = foundry.utils.duplicate(item);
			formData.system.isactive = false;

			if (formData.system.bonuslist.length > 0) {
				(formData.system.bonuslist || []).forEach(bonus => {
					if (bonus) bonus.isactive = false;
				});
			}

			await item.update(formData);
		}
	}

	// Update token icon for PC Actors
	await _updateShapeformTokenIcon(this.actor, item);

	// Check if any form is active after update
	const activeForm = this.actor.items.find(item => 
		item.system.type === "wod.types.shapeform" && item.system.isactive
	);

	// If no form is active, reset token images to actor's default image
	if (!activeForm) {
		if (canvas?.ready && canvas.tokens) {
			const tokens = canvas.tokens.placeables.filter(token => token.document.actorId === this.actor.id);
			await Promise.all(tokens.map(async (token) => {
				try {
					await token.document.update({
						texture: {
							src: this.actor.img
						}
					});
				} catch (error) {
					console.error(`Failed to reset token image:`, error);
				}
			}));
			tokens.forEach(token => token.draw());
		}
	}

	let actorData = foundry.utils.duplicate(this.actor);
	actorData = await calculateTotals(actorData);
	await this.actor.update(actorData);
	this.render();
}

export const OnPowerClear = async function (event, target) {
	event.preventDefault();

	const itemid = target.getAttribute('data-itemid');
	const powertype = target.getAttribute('data-powertype');
	let item = await this.actor.getEmbeddedDocument("Item", itemid);

	const performDelete = await new Promise((resolve) => {
		Dialog.confirm({
			title: game.i18n.format("wod.labels.power.disconnect", { name: item.name }),
			yes: () => resolve(true),
			no: () => resolve(false),
			content: game.i18n.format(game.i18n.localize("wod.labels.power.disconnectlabel") + " " + item.name, {
				name: item.name,
				actor: this.actor.name,
			}),
		});
	});

	if (!performDelete)
		return;

	if (powertype == "power") {
		const itemData = foundry.utils.duplicate(item);
		itemData.system.parentid = "";
		await item.update(itemData);	
	}
	else if (powertype == "main") {
		await ItemHelper.cleanItemList(this.actor, item);
	}
}

export const OnPowerSort = async function (event, target) {
	event.preventDefault();

	const itemid = target.getAttribute('data-itemid');
	const itemtype = target.getAttribute('data-object');
	let item = await this.actor.getEmbeddedDocument("Item", itemid);

	if (!item)
		return;

	let powerUse;
	let power;

	if (itemtype === "SortDisciplinePower") {
		power = new SortDialog.SortDisciplinePower(item);
	}
	// else if (itemtype === "SortPathPower") {
	// 	power = new SortDialog.SortPathPower(item);
	// }
	else if (itemtype === "SortNuminaPower") {
		power = new SortDialog.SortNuminaPower(item);
	}
	else if (itemtype === "SortArtPower") {
		power = new SortDialog.SortArtPower(item);
	}
	else if (itemtype === "SortEdgePower") {
		power = new SortDialog.SortEdgePower(item);
	}
	else if (itemtype === "SortLorePower") {
		power = new SortDialog.SortLorePower(item);
	}
	else if (itemtype === "SortArcanoiPower") {
		power = new SortDialog.SortArcanoiPower(item);
	}
	else if (itemtype === "SortHekauPower") {
		power = new SortDialog.SortHekauPower(item);
	}	
	else {
		console.warn("WoD | Unknown power type for sorting in OnPowerSort.");
		return;
	}
	
	powerUse = new SortDialog.DialogSortPower(this.actor, power);
	powerUse.render(true);
}


export const SendChat = async function (event, target) {
	event.preventDefault();

	const itemid = target.getAttribute('data-itemid');
	const item = this.actor.getEmbeddedDocument('Item', itemid);

	const headline = item.name;
	const description = item.system.description;
	let system;

	if (item.system.details === undefined) {
		system = "";
	}
	else {
		system = item.system.details;
	}

	const templateData = {
		data: {
			actor: this.actor,
			type: "send",
			action: headline,
			message: "",
			description: description,
			system: system
		}
	};

	// Render the chat card template
	const template = `systems/worldofdarkness/templates/dialogs/roll-template.hbs`;
	const html = await foundry.applications.handlebars.renderTemplate(template, templateData);

	const chatData = {
		content: html,
		speaker: ChatMessage.getSpeaker({ actor: this.actor }),
		rollMode: game.settings.get("core", "rollMode")        
	};
	ChatMessage.applyRollMode(chatData, "roll");
	ChatMessage.create(chatData);
}



export const OnGenerationChange = async function (event, target) {
	event.preventDefault();

	const source = target.getAttribute('data-source');
	const fieldKey = target.getAttribute('data-field-key');

	if (!source || !fieldKey) {
		return;
	}

	const actor = this.actor;
	const actorData = foundry.utils.duplicate(actor);
	
	// Get current generation value and mod from splatfields
	const generationField = actorData.system.bio.splatfields[fieldKey];
	if (!generationField) {
		return;
	}

	let selectedGeneration = parseInt(generationField.value) || 13;
	let generationModifier = parseInt(generationField.mod) || 0;

	// Handle reduce or clear
	if (source === "reduce") {
		generationModifier = generationModifier + 1;
	}
	else if (source === "clear") {
		generationModifier = 0;
	}
	else {
		return;
	}

	// Calculate effective generation (generation - modifier)
	const effectiveGeneration = selectedGeneration - generationModifier;

	// Validate: effective generation cannot be less than 4
	if (effectiveGeneration < 4) {
		ui.notifications.warn(game.i18n.localize("wod.labels.bio.wrongtempgeneration"));
		return;
	}

	// Update the generation modifier
	actorData.system.bio.splatfields[fieldKey].mod = generationModifier;
	actorData.system.settings.isupdated = false;
	
	await actor.update(actorData);
	await actor._setItems();
	this.render();
}

export const RollDice = async function (event, target) {
	event.preventDefault();

	if (!target) return;

	const dataset = target.dataset;
	ActionHelper.RollDialog(dataset, this.actor);	
};

export const OnEditImage = async function (event, target) {
	event.preventDefault();

	// Check if sheet is locked
	if (this.locked) {
		ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
		return;
	}

	// Check permissions for actor image editing
	const userPermissions = ActionHelper._getUserPermissions(game.user);
	if (!userPermissions.changeActorImage) {
		return;
	}

	// Top-level variables
	const actor = this.actor;
	const FilePicker = foundry.applications.apps.FilePicker.implementation;

	// Get the field to edit from data-edit attribute, default to "img"
	const editField = target?.dataset?.edit || "img";

	await new FilePicker({
		type: 'image',
		current: foundry.utils.getProperty(actor, editField) || actor.img,
		callback: async (path) => {
			const updateData = {};
			updateData[editField] = path;
			await actor.update(updateData);
		},
		top: this.position.top + 40,
		left: this.position.left + 10
	}).browse();
};

function setNested(obj, pathArray, value) {
	let current = obj;
	for (let i = 0; i < pathArray.length - 1; i++) {
		if (!current[pathArray[i]]) current[pathArray[i]] = {};
		current = current[pathArray[i]];
	}

	const lastKey = pathArray[pathArray.length - 1];

	if (current[lastKey] === value && typeof value === "number") {
		current[lastKey] = Math.max(0, value - 1); // undvik negativa värden
	} else {
		current[lastKey] = value;
	}
}


function getNested(obj, pathArray) {
	return pathArray.reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
}


function parseCounterStates(states) {
	return states.split(",").reduce((obj, state) => {
	  	const [k, v] = state.split(":");
	  	obj[k] = v;
	  	return obj;
	}, {});
}