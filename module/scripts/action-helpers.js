import { rollDice } from "./roll-dice.js";
import { DiceRoll } from "../scripts/roll-dice.js";
import { calculateTotals } from "./totals.js";

import { MeleeWeapon } from "../dialogs/dialog-weapon.js";
import { RangedWeapon } from "../dialogs/dialog-weapon.js";
import { Damage } from "../dialogs/dialog-weapon.js";
import { DialogWeapon } from "../dialogs/dialog-weapon.js";
import { Treasure } from "../dialogs/dialog-item.js";
import { DialogItem } from "../dialogs/dialog-item.js";

import { DialogGeneralRoll, GeneralRoll } from "../dialogs/dialog-generalroll.js";

import { Rote } from "../dialogs/dialog-aretecasting.js";
import { Gift } from "../dialogs/dialog-power.js";
import { CharmGift } from "../dialogs/dialog-power.js";
import { Charm } from "../dialogs/dialog-power.js";
import { Power } from "../dialogs/dialog-power.js";
import { DisciplinePower } from "../dialogs/dialog-power.js";
import { PathPower } from "../dialogs/dialog-power.js";
import { RitualPower } from "../dialogs/dialog-power.js";
import { ArtPower } from "../dialogs/dialog-power.js";
import { DialogAreteCasting } from "../dialogs/dialog-aretecasting.js";
import { DialogPower } from "../dialogs/dialog-power.js";

import { SortDisciplinePower } from "../dialogs/dialog-sortpower.js";
import { SortPathPower } from "../dialogs/dialog-sortpower.js";
import { SortArtPower } from "../dialogs/dialog-sortpower.js";
import { DialogSortPower } from "../dialogs/dialog-sortpower.js";

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

    static RollDialog(event, actor) {
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

			// used a Weapon
			if (dataset.object == "Melee") {
				const weapon = new MeleeWeapon(item);
				let weaponUse = new DialogWeapon(actor, weapon);
				weaponUse.render(true);

				return;
			}

			if (dataset.object == "Ranged") {
				const weapon = new RangedWeapon(item);
				let weaponUse = new DialogWeapon(actor, weapon);
				weaponUse.render(true);

				return;
			}

			if (dataset.object == "Damage") {
				item.system.extraSuccesses = 0;
				const damage = new Damage(item);
				let weaponUse = new DialogWeapon(actor, damage);
				weaponUse.render(true);

				return;
			}

			// used a Item
			if (dataset.object == "Treasure") {
				const treasure = new Treasure(item);
				let treasureUse = new DialogItem(actor, treasure);
				treasureUse.render(true);

				return;
			}

			// used a Fetish
			if (dataset.object == "Fetish") {
				templateHTML = `<h2>${game.i18n.localize("wod.dice.activate")} ${item.system.name}</h2> <strong>${game.i18n.localize("wod.advantages.gnosis")} (${actor.system.gnosis.roll})</strong>`;

				const fetishRoll = new DiceRoll(actor);
				fetishRoll.handlingOnes = CONFIG.wod.handleOnes;
				fetishRoll.numDices = parseInt(actor.system.gnosis.roll);
				fetishRoll.difficulty = parseInt(item.system.difficulty);
				fetishRoll.templateHTML = templateHTML;
				fetishRoll.origin = "paradox";
				fetishRoll.systemText = item.system.details;

				rollDice(fetishRoll);

				return;
			}	
			
			// used a Gift
			if ((dataset.object == "Gift") && (dataset.type == CONFIG.wod.sheettype.spirit)) {
				const gift = new CharmGift(item);
				let giftUse = new DialogPower(actor, gift);
				giftUse.render(true);

				return;
			}
			else if (dataset.object == "Gift") {
				const gift = new Gift(item);
				let giftUse = new DialogPower(actor, gift);
				giftUse.render(true);

				return;
			}

			// used a Rite
			if (dataset.object == "Rite") {
				const rite = new Gift(item);
				let riteUse = new DialogPower(actor, rite);
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
				const charm = new Charm(item);
				let charmUse = new DialogPower(actor, charm);
				charmUse.render(true);

				return;
			}

			// used a Power
			if (dataset.object == "Power") {
				const power = new Power(item);
				let powerUse = new DialogPower(actor, power);
				powerUse.render(true);

				return;
			}

			// used a DisciplinePower
			if (dataset.object == "Discipline") {
				const discipline = new DisciplinePower(item);
				let powerUse = new DialogPower(actor, discipline);
				powerUse.render(true);

				return;
			}

			// used a PathPower
			if (dataset.object == "Path") {
				const path = new PathPower(item);
				let powerUse = new DialogPower(actor, path);
				powerUse.render(true);

				return;
			}

			// used a Ritual
			if (dataset.object == "Ritual") {
				const ritual = new RitualPower(item);
				let powerUse = new DialogPower(actor, ritual);
				powerUse.render(true);

				return;
			}

			// used a Art
			if (dataset.object == "Art") {
				const art = new ArtPower(item);
				let powerUse = new DialogPower(actor, art);
				powerUse.render(true);

				return;
			}

			// placing Disicpline Power in correct discipline
			if (dataset.object == "SortDisciplinePower") {
				const discipline = new SortDisciplinePower(item);
				let powerUse = new DialogSortPower(actor, discipline);
				powerUse.render(true);

				return;
			}

			if (dataset.object == "SortPathPower") {
				const discipline = new SortPathPower(item);
				let powerUse = new DialogSortPower(actor, discipline);
				powerUse.render(true);

				return;
			}			

			if (dataset.object == "SortArtPower") {
				const cantrip = new SortArtPower(item);
				let powerUse = new DialogSortPower(actor, cantrip);
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
				this.RollInitiative(event, actor);

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

			console.log(dataset);
			ui.notifications.error("Macro roll missing function");

			return;
		}

		console.log(dataset);
		ui.notifications.error("Roll missing function");

		return;
    }	

	static async RollInitiative(event, actor) {
		event.preventDefault();		

		let foundToken = false;
		let foundEncounter = true;
		let tokenAdded = false;
		let rolledInitiative = false;
		let formula = "1d10";
		let init = 0;
		let label = "";
		let message = "";
		let diceColor;
		let initAttribute = "";

		let token = await canvas.tokens.placeables.find(t => t.data.actorId === actor.id);
		if(token) foundToken = true;

		if (game.combat == null) {
			foundEncounter = false;
	   	}

		let roll = new Roll(formula);		

		roll.evaluate({async:true});
		roll.terms[0].results.forEach((dice) => {
			init += parseInt(dice.result);
		});

		init += parseInt(parseInt(actor.system.initiative.total));

		if ((foundToken) && (foundEncounter)) {
			if (!this._inTurn(token)) {
				await token.toggleCombat();

				if (token.combatant.data.initiative == undefined) {      
					await token.combatant.update({initiative: init});
					rolledInitiative = true;
				}
				
				tokenAdded = true;
			}
		}	

		if (actor.type != CONFIG.wod.sheettype.spirit) {
			if (parseInt(actor.system.attributes.dexterity.total) >= parseInt(actor.system.attributes.wits.total)) {
				initAttribute = game.i18n.localize(actor.system.attributes.dexterity.label) + " " + actor.system.attributes.dexterity.total;
			}
			else {
				initAttribute = game.i18n.localize(actor.system.attributes.wits.label) + " " + actor.system.attributes.wits.total;
			}			
		}
		else {
			initAttribute = game.i18n.localize(actor.system.willpower.label) + " " + actor.system.willpower.permanent;
		}

		if (actor.type == CONFIG.wod.sheettype.mortal) {
			diceColor = "blue_";
		} 
		else if ((actor.type == CONFIG.wod.sheettype.werewolf) || (actor.type == "Changing Breed")) {
			diceColor = "brown_";
		}
		else if (actor.type == CONFIG.wod.sheettype.mage) { 
			diceColor = "purple_";
		}
		else if (actor.type == CONFIG.wod.sheettype.vampire) { 
			diceColor = "red_";
		}
		else if (actor.type == CONFIG.wod.sheettype.spirit) { 
			diceColor = "yellow_";
		}
		else {
			diceColor = "black_";
		}	

		roll.terms[0].results.forEach((dice) => {
			label += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" class="rolldices" />`;
		});
		
		if (!foundEncounter) {
			message += "<em>"+game.i18n.localize("wod.dice.noencounterfound")+"</em>";			
		}
		else {
			if (!foundToken) {
				message += "<em>"+game.i18n.localize("wod.dice.notokenfound")+"</em><br />";				
			}
			else {
				if (!tokenAdded) {
					message += "<em>"+game.i18n.localize("wod.dice.characteradded")+"</em><br />";
					label = "";
					init = "";
				}
				if (!rolledInitiative) {
					message += "<em>" + actor.system.name + " "+game.i18n.localize("wod.dice.initiativealready")+"</em><br />";
					label = "";
					init = "";
				}
			}
		}

		this.printMessage('', '<h2>'+game.i18n.localize("wod.dice.rollinginitiative")+'</h2><strong>'+game.i18n.localize("wod.dice.totalvalue") + ': ' + init + '</strong><br />'+initAttribute+'<p>' + label + '</p>' + '<p>' + message + '</p>', actor);			
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

 	static _inTurn(token) {
		for (let count = 0; count < game.combat.combatants.size; count++) {
			if (token.id == game.combat.combatants.contents[count].token.id) {
				return true;
			}
		}
	
		return false;
	}

    static _handleCalculations(actorData) {		

		let advantageRollSetting = true;

		try {
			advantageRollSetting = CONFIG.wod.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		// attributes totals
		actorData = calculateTotals(actorData);

		// willpower
		if (CONFIG.wod.attributeSettings == "5th") {
			actorData.system.willpower.permanent = parseInt(actorData.system.attributes.composure.value) + parseInt(actorData.system.attributes.resolve.value);
		}
		
		if (actorData.system.willpower.permanent > actorData.system.willpower.max) {
			actorData.system.willpower.permanent = actorData.system.willpower.max;
		}
		
		if (actorData.system.willpower.permanent < actorData.system.willpower.temporary) {
			actorData.system.willpower.temporary = actorData.system.willpower.permanent;
		}

		if (advantageRollSetting) {
			actorData.system.willpower.roll = actorData.system.willpower.permanent;
		}
		else {
			actorData.system.willpower.roll = actorData.system.willpower.permanent > actorData.system.willpower.temporary ? actorData.system.willpower.temporary : actorData.system.willpower.permanent; 
		}		

		console.log("WoD | Sheet calculations done");
	}

    static handleWoundLevelCalculations(actorData) {
		let totalNormWoundLevels = parseInt(actorData.system.health.damage.bashing) + parseInt(actorData.system.health.damage.lethal) + parseInt(actorData.system.health.damage.aggravated);
		let totalChimericalWoundLevels = 0;
		
		if (actorData.system.health.damage.chimerical != undefined) {
			totalChimericalWoundLevels = parseInt(actorData.system.health.damage.chimerical.bashing) + parseInt(actorData.system.health.damage.chimerical.lethal) + parseInt(actorData.system.health.damage.chimerical.aggravated);
		}

		let totalWoundLevels = totalNormWoundLevels < totalChimericalWoundLevels ? totalChimericalWoundLevels : totalNormWoundLevels;

		if (totalWoundLevels == 0) {
			actorData.system.health.damage.woundlevel = "";
			actorData.system.health.damage.woundpenalty = 0;

			return
		}

		for (const i in CONFIG.wod.woundLevels) {
			totalWoundLevels = totalWoundLevels - parseInt(actorData.system.health[i].value);

			if (totalWoundLevels <= 0) {
				actorData.system.health.damage.woundlevel = actorData.system.health[i].label;
				actorData.system.health.damage.woundpenalty = actorData.system.health[i].penalty;

				return
			}
		}		
	}

	static _handleChangelingCalculations(actorData) {
		console.log("WoD | handleChangelingCalculations");

		// glamour
		if (actorData.system.glamour.permanent > actorData.system.glamour.max) {
			actorData.system.glamour.permanent = actorData.system.glamour.max;
		}
		
		if (actorData.system.glamour.permanent < actorData.system.glamour.temporary) {
			actorData.system.glamour.temporary = actorData.system.glamour.permanent;
		}

		// nightmare
		if (actorData.system.nightmare.temporary > actorData.system.nightmare.max) {
			actorData.system.nightmare.temporary = actorData.system.nightmare.max;
		}

		// banality
		if (actorData.system.banality.permanent > actorData.system.banality.max) {
			actorData.system.banality.permanent = actorData.system.banality.max;
		}

		let advantageRollSetting = true;

		try {
			advantageRollSetting = CONFIG.wod.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		if (advantageRollSetting) {
			actorData.system.glamour.roll = actorData.system.glamour.permanent; 			
			actorData.system.banality.roll = actorData.system.banality.permanent;
		}
		else {
			actorData.system.glamour.roll = actorData.system.glamour.permanent > actorData.system.glamour.temporary ? actorData.system.glamour.temporary : actorData.system.glamour.permanent; 
			actorData.system.banality.roll = actorData.system.banality.permanent > actorData.system.banality.temporary ? actorData.system.banality.temporary : actorData.system.banality.permanent;
		}

		actorData.system.nightmare.roll = actorData.system.nightmare.temporary;
	}

	static handleVampireCalculations(actorData) {
		console.log("WoD | handleVampireCalculations");

		actorData.system.path.roll = parseInt(actorData.system.path.value);
		actorData.system.virtues.conscience.roll = parseInt(actorData.system.virtues.conscience.value);
		actorData.system.virtues.selfcontrol.roll = parseInt(actorData.system.virtues.selfcontrol.value);
		actorData.system.virtues.courage.roll = parseInt(actorData.system.virtues.courage.value);	
		
		if (actorData.system.path.value == 1) {
			actorData.system.path.bearing = 2;
		}
		else if ((actorData.system.path.value >= 2) && (actorData.system.path.value <= 3)) {
			actorData.system.path.bearing = 1;
		}
		else if ((actorData.system.path.value >= 4) && (actorData.system.path.value <= 7)) {
			actorData.system.path.bearing = 0;
		}
		else if ((actorData.system.path.value >= 8) && (actorData.system.path.value <= 9)) {
			actorData.system.path.bearing = -1;
		}
		else if (actorData.system.path.value == 10) {
			actorData.system.path.bearing = -2;
		}
	}

	static handleMageCalculations(actorData) {
		console.log("WoD | handleMageCalculations");

		actorData.system.arete.roll = parseInt(actorData.system.arete.permanent);
		actorData.system.paradox.roll = parseInt(actorData.system.paradox.temporary) + parseInt(actorData.system.paradox.permanent);
	}

	static handleWerewolfCalculations(actorData) {
		console.log("WoD | handleWerewolfCalculations");
		
		let advantageRollSetting = true;

		// shift
		if ((actorData.type == CONFIG.wod.sheettype.werewolf) || (actorData.type == "Changing Breed")) {
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

		if (actorData.type == "Changing Breed") {
			if ((actorData.system.changingbreed == "Ananasi") || (actorData.system.changingbreed == "Nuwisha")) {
				actorData.system.rage.permanent = 0;
				actorData.system.rage.temporary = 0;
			}
		}

		// rage
		if (actorData.system.rage.permanent > actorData.system.rage.max) {
			actorData.system.rage.permanent = actorData.system.rage.max;
		}
		
		if (actorData.system.rage.permanent < actorData.system.rage.temporary) {
			ui.notifications.warn(game.i18n.localize("wod.advantages.ragewarning"));
		}
		
		// gnosis
		if (actorData.system.gnosis.permanent > actorData.system.gnosis.max) {
			actorData.system.gnosis.permanent = actorData.system.gnosis.max;
		}
		
		if (actorData.system.gnosis.permanent < actorData.system.gnosis.temporary) {
			actorData.system.gnosis.temporary = actorData.system.gnosis.permanent;
		}		

		try {
			advantageRollSetting = CONFIG.wod.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		if (advantageRollSetting) {
			actorData.system.rage.roll = actorData.system.rage.permanent; 
			actorData.system.gnosis.roll = actorData.system.gnosis.permanent;
			actorData.system.willpower.roll = actorData.system.willpower.permanent; 
		}
		else {
			actorData.system.rage.roll = actorData.system.rage.permanent > actorData.system.rage.temporary ? actorData.system.rage.temporary : actorData.system.rage.permanent; 
			actorData.system.gnosis.roll = actorData.system.gnosis.permanent > actorData.system.gnosis.temporary ? actorData.system.gnosis.temporary : actorData.system.gnosis.permanent;
			actorData.system.willpower.roll = actorData.system.willpower.permanent > actorData.system.willpower.temporary ? actorData.system.willpower.temporary : actorData.system.willpower.permanent; 
		}		

		if (actorData.system.rage.roll > actorData.system.willpower.roll) {
			const rageDiff = parseInt(actorData.system.rage.roll) - parseInt(actorData.system.willpower.roll);

			actorData.system.attributes.charisma.total = parseInt(actorData.system.attributes.charisma.total) - rageDiff;
			actorData.system.attributes.manipulation.total = parseInt(actorData.system.attributes.manipulation.total) - rageDiff;
		}
	}			

	static printMessage(headline, message, actor){
		message = headline + message;
		message = message.replaceAll("'", '"');

		let chatData = {
			content : message,
			speaker : ChatMessage.getSpeaker({ actor: actor })
		};		
	
		ChatMessage.create(chatData,{});    
	}

	static _ignoresPain(actor) {
		let ignoresPain = false;

		if (actor.system.conditions?.isignoringpain)
		{
			ignoresPain = true;
		}

		if (actor.system.conditions?.isfrenzy)
		{
			ignoresPain = true;
		}

		return ignoresPain;
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
			actor.system.willpower.permanent = 0;
		}
		else if (CONFIG.wod.attributeSettings == "5th") {
			actor.system.attributes.appearance.isvisible = false;
			actor.system.attributes.perception.isvisible = false;
			actor.system.willpower.permanent = 2;
		}
	
		if (CONFIG.wod.rollSettings) {
			willpower = actor.system.willpower.permanent; 
		}
		else {
			willpower = actor.system.willpower.permanent > actor.system.willpower.temporary ? actor.system.willpower.temporary : actor.system.willpower.permanent; 
		}
	
		actor.system.willpower.roll = willpower;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;
	}

	static _setVampireAttributes(actor) {
		actor.system.bloodpool.temporary = 0;
		actor.system.bloodpool.max = 10;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = false;
	}

	static _setWerewolfAttributes(actor) {
		let rage = -1;
		let gnosis = -1;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = true;

		if (CONFIG.wod.rollSettings) {
			rage = actor.system.rage.permanent; 
			gnosis = actor.system.gnosis.permanent;
		}
		else {
			rage = actor.system.rage.permanent > actor.system.rage.temporary ? actor.system.rage.temporary : actor.system.rage.permanent; 
			gnosis = actor.system.gnosis.permanent > actor.system.gnosis.temporary ? actor.system.gnosis.temporary : actor.system.gnosis.permanent;
		}

		actor.system.rage.roll = rage;
		actor.system.gnosis.roll = gnosis;
	}

	static _setMageAttributes(actor) {
		actor.system.arete.permanent = 1;
		actor.system.arete.roll = 1;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;
	}

	static _setCreatureAttributes(actor) {
		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;
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
		
		// if (((itemAdministratorLevel == "gm") || (itemAdministratorLevel == "assistant")) && user.isGM) {
		// 	permissions.itemAdministrator = true;
		// }
		// if ((itemAdministratorLevel == "trusted") && user.isTrusted) {
		// 	permissions.itemAdministrator = true;
		// }		
		// if (itemAdministratorLevel == "player") {
		// 	permissions.itemAdministrator = true;
		// }

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

	/**
	 * Get a specific item on an actor
	 * @param id
	 * @param itemlist
	 * 
	 */
	// static _getItem(id, itemlist)
	// {
	// 	if (id == undefined) {
	// 		return false;
	// 	}

	// 	for (const i of itemlist) {
	// 		if (i._id == id) {
	// 			return i;
	// 		}
	// 	}

	// 	return false;
	// }
}




