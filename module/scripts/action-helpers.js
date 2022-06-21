import { rollDice } from "./roll-dice.js";
import { DiceRoll } from "../scripts/roll-dice.js";
import { calculateTotals } from "./totals.js";
import { MeleeWeapon } from "../dialogs/dialog-weapon.js";
import { RangedWeapon } from "../dialogs/dialog-weapon.js";
import { Damage } from "../dialogs/dialog-weapon.js";
import { DialogWeapon } from "../dialogs/dialog-weapon.js";
import { DialogGeneralRoll, GeneralRoll } from "../dialogs/dialog-generalroll.js";
import { Rote } from "../dialogs/dialog-aretecasting.js";
import { Gift } from "../dialogs/dialog-power.js";
import { Charm } from "../dialogs/dialog-power.js";
import { Power } from "../dialogs/dialog-power.js";
import { DisciplinePower } from "../dialogs/dialog-power.js";
import { PathPower } from "../dialogs/dialog-power.js";
import { RitualPower } from "../dialogs/dialog-power.js";
import { DialogAreteCasting } from "../dialogs/dialog-aretecasting.js";
import { DialogPower } from "../dialogs/dialog-power.js";
import { SortDisciplinePower } from "../dialogs/dialog-sortdisciplinepower.js";
import { SortPathPower } from "../dialogs/dialog-sortdisciplinepower.js";
import { DialogSortDisciplinePower } from "../dialogs/dialog-sortdisciplinepower.js";
import { VampireFrenzy } from "../dialogs/dialog-checkfrenzy.js";
import { WerewolfFrenzy } from "../dialogs/dialog-checkfrenzy.js";
import { DialogCheckFrenzy } from "../dialogs/dialog-checkfrenzy.js";
import { Soak } from "../dialogs/dialog-soak.js";
import { DialogSoakRoll } from "../dialogs/dialog-soak.js";

export class UserPermissions {
    constructor(user) {
        this.changeActorImage = false;
        this.changeItemImage = false;
		this.itemAdministrator = user.isGM;
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
		if ((dataset.rollitem == "true") && (dataset.itemid != undefined)) {
			item = getItem(dataset.itemid, actor.data.items);

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
				const damage = new Damage(item);
				let weaponUse = new DialogWeapon(actor, damage);
				weaponUse.render(true);

				return;
			}

			// used a Fetish
			if (dataset.object == "Fetish") {
				templateHTML = `<h2>${game.i18n.localize("wod.dice.activate")} ${item.data.name}</h2> <strong>${game.i18n.localize("wod.advantages.gnosis")} (${actor.data.data.gnosis.roll})</strong>`;

				const fetishRoll = new DiceRoll(actor);
				fetishRoll.handlingOnes = CONFIG.wod.handleOnes;
				fetishRoll.numDices = parseInt(actor.data.data.gnosis.roll);
				fetishRoll.difficulty = parseInt(item.data.data.difficulty);
				fetishRoll.templateHTML = templateHTML;
				fetishRoll.origin = "paradox";
				fetishRoll.systemText = item.data.data.details;

				rollDice(fetishRoll);

				return;
			}	
			
			// used a Gift
			if (dataset.object == "Gift") {
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

			// placing Disicpline Power in correct discipline
			if (dataset.object == "SortDisciplinePower") {
				const discipline = new SortDisciplinePower(item);
				let powerUse = new DialogSortDisciplinePower(actor, discipline);
				powerUse.render(true);

				return;
			}

			if (dataset.object == "SortPathPower") {
				const discipline = new SortPathPower(item);
				let powerUse = new DialogSortDisciplinePower(actor, discipline);
				powerUse.render(true);

				return;
			}			

			ui.notifications.error("Item Roll missing function");

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

			ui.notifications.error("Macro roll missing function");

			return;
		}

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

		init += parseInt(parseInt(actor.data.data.initiative.total));

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
		else if (actor.type == "Spirit") { 
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
					message += "<em>" + actor.data.name + " "+game.i18n.localize("wod.dice.initiativealready")+"</em><br />";
					label = "";
					init = "";
				}
			}
		}

		if (label != "") {
			label = "<br />" + label;
		}
		if (message != "") {
			message = "<br />" + message;
		}

		this.printMessage('', '<h2>'+game.i18n.localize("wod.dice.rollinginitiative")+'</h2>' + init + label + message, actor);			
	}

	static RollParadox(event, actor) {
		event.preventDefault();

		const numDice = parseInt(actor.data.data.paradox.roll);
		const difficulty = 6;		
		let rollHTML = `<h2>${game.i18n.localize("wod.advantages.paradox")}</h2>`;
		rollHTML += `${game.i18n.localize("wod.advantages.paradox")} (${actor.data.data.paradox.roll})`;

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
			actorData.data.willpower.permanent = parseInt(actorData.data.attributes.composure.value) + parseInt(actorData.data.attributes.resolve.value);
		}
		
		if (actorData.data.willpower.permanent > actorData.data.willpower.max) {
			actorData.data.willpower.permanent = actorData.data.willpower.max;
		}
		
		if (actorData.data.willpower.permanent < actorData.data.willpower.temporary) {
			actorData.data.willpower.temporary = actorData.data.willpower.permanent;
		}

		if (advantageRollSetting) {
			actorData.data.willpower.roll = actorData.data.willpower.permanent;
		}
		else {
			actorData.data.willpower.roll = actorData.data.willpower.permanent > actorData.data.willpower.temporary ? actorData.data.willpower.temporary : actorData.data.willpower.permanent; 
		}		

		console.log("WoD | Sheet calculations done");
	}

    static handleWoundLevelCalculations(actorData) {
		let totalWoundLevels = parseInt(actorData.data.health.damage.bashing) + parseInt(actorData.data.health.damage.lethal) + parseInt(actorData.data.health.damage.aggravated);

		if (totalWoundLevels == 0) {
			actorData.data.health.damage.woundlevel = "";
			actorData.data.health.damage.woundpenalty = 0;

			return
		}

		for (const i in CONFIG.wod.woundLevels) {
			totalWoundLevels = totalWoundLevels - parseInt(actorData.data.health[i].value);

			if (totalWoundLevels == 0) {
				actorData.data.health.damage.woundlevel = actorData.data.health[i].label;
				actorData.data.health.damage.woundpenalty = actorData.data.health[i].penalty;

				return
			}
		}		
	}

	static handleVampireCalculations(actorData) {
		console.log("WoD | handleVampireCalculations");

		actorData.data.path.roll = parseInt(actorData.data.path.value);
		actorData.data.virtues.conscience.roll = parseInt(actorData.data.virtues.conscience.value);
		actorData.data.virtues.selfcontrol.roll = parseInt(actorData.data.virtues.selfcontrol.value);
		actorData.data.virtues.courage.roll = parseInt(actorData.data.virtues.courage.value);	
		
		if (actorData.data.path.value == 1) {
			actorData.data.path.bearing = 2;
		}
		else if ((actorData.data.path.value >= 2) && (actorData.data.path.value <= 3)) {
			actorData.data.path.bearing = 1;
		}
		else if ((actorData.data.path.value >= 4) && (actorData.data.path.value <= 7)) {
			actorData.data.path.bearing = 0;
		}
		else if ((actorData.data.path.value >= 8) && (actorData.data.path.value <= 9)) {
			actorData.data.path.bearing = -1;
		}
		else if (actorData.data.path.value == 10) {
			actorData.data.path.bearing = 2;
		}
	}

	static handleMageCalculations(actorData) {
		console.log("WoD | handleMageCalculations");

		actorData.data.arete.roll = parseInt(actorData.data.arete.permanent);
		actorData.data.paradox.roll = parseInt(actorData.data.paradox.temporary) + parseInt(actorData.data.paradox.permanent);
	}

	static handleWerewolfCalculations(actorData) {
		console.log("WoD | handleWerewolfCalculations");
		
		let advantageRollSetting = true;

		// shift
		if ((actorData.type == CONFIG.wod.sheettype.werewolf) || (actorData.type == "Changing Breed")) {
			if ((!actorData.data.shapes.homid.isactive) &&
				(!actorData.data.shapes.glabro.isactive) &&
				(!actorData.data.shapes.crinos.isactive) &&
				(!actorData.data.shapes.hispo.isactive) &&
				(!actorData.data.shapes.lupus.isactive)) {
				actorData.data.shapes.homid.isactive = true;
			}
		}

		if (actorData.type == "Changing Breed") {
			if ((actorData.data.changingbreed == "Ananasi") || (actorData.data.changingbreed == "Nuwisha")) {
				actorData.data.rage.permanent = 0;
				actorData.data.rage.temporary = 0;
			}
		}

		// rage
		if (actorData.data.rage.permanent > actorData.data.rage.max) {
			actorData.data.rage.permanent = actorData.data.rage.max;
		}
		
		if (actorData.data.rage.permanent < actorData.data.rage.temporary) {
			actorData.data.rage.temporary = actorData.data.rage.permanent;
		}
		
		// gnosis
		if (actorData.data.gnosis.permanent > actorData.data.gnosis.max) {
			actorData.data.gnosis.permanent = actorData.data.gnosis.max;
		}
		
		if (actorData.data.gnosis.permanent < actorData.data.gnosis.temporary) {
			actorData.data.gnosis.temporary = actorData.data.gnosis.permanent;
		}		

		try {
			advantageRollSetting = CONFIG.wod.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		if (advantageRollSetting) {
			actorData.data.rage.roll = actorData.data.rage.permanent; 
			actorData.data.gnosis.roll = actorData.data.gnosis.permanent;
			actorData.data.willpower.roll = actorData.data.willpower.permanent; 
		}
		else {
			actorData.data.rage.roll = actorData.data.rage.permanent > actorData.data.rage.temporary ? actorData.data.rage.temporary : actorData.data.rage.permanent; 
			actorData.data.gnosis.roll = actorData.data.gnosis.permanent > actorData.data.gnosis.temporary ? actorData.data.gnosis.temporary : actorData.data.gnosis.permanent;
			actorData.data.willpower.roll = actorData.data.willpower.permanent > actorData.data.willpower.temporary ? actorData.data.willpower.temporary : actorData.data.willpower.permanent; 
		}		

		if (actorData.data.rage.roll > actorData.data.willpower.roll) {
			const rageDiff = parseInt(actorData.data.rage.roll) - parseInt(actorData.data.willpower.roll);

			console.log("WoD | Rage: " + actorData.data.rage.roll);
			console.log("WoD | Willpower: " + actorData.data.willpower.roll);
			console.log("WoD | rageDiff: " + rageDiff);			

			actorData.data.attributes.charisma.total = parseInt(actorData.data.attributes.charisma.total) - rageDiff;
			actorData.data.attributes.manipulation.total = parseInt(actorData.data.attributes.manipulation.total) - rageDiff;
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

		if (actor.data.data.conditions?.isignoringpain)
		{
			ignoresPain = true;
		}

		if (actor.data.data.conditions?.isfrenzy)
		{
			ignoresPain = true;
		}

		return ignoresPain;
	}		

	static _setMortalAbilities(actor) {
		for (const talent in CONFIG.wod.alltalents) {

			if ((actor.data.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.data.abilities.talent[talent].label == "wod.abilities.art") ||	
					(actor.data.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.data.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.data.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.allskills) {
			
			if ((actor.data.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.data.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.data.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.allknowledges) {

			if ((actor.data.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.data.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.data.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static _setVampireAbilities(actor) {		
		for (const talent in CONFIG.wod.alltalents) {

			if ((actor.data.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.data.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.data.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.data.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.allskills) {

			if ((actor.data.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.performance") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.data.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.data.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.allknowledges) {

			if ((actor.data.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.finance") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.data.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.data.abilities.knowledge[knowledge].isvisible = false;
			}				
		}
	}

	static _setMageAbilities(actor) {		
		for (const talent in CONFIG.wod.alltalents) {

			if ((actor.data.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.data.abilities.talent[talent].label == "wod.abilities.art") ||	
					(actor.data.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.data.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.data.abilities.talent[talent].isvisible = false;
			}	
		}

		for (const skill in CONFIG.wod.allskills) {
			
			if ((actor.data.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.martialarts") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.meditation") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.research") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.survival") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.technology")) {
				actor.data.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.data.abilities.skill[skill].isvisible = false;
			}	
		}

		for (const knowledge in CONFIG.wod.allknowledges) {

			if ((actor.data.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.cosmology") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.esoterica") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.science")) {
				actor.data.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.data.abilities.knowledge[knowledge].isvisible = false;
			}						
		}
	}

	static _setWerewolfAbilities(actor) {		
		for (const talent in CONFIG.wod.alltalents) {
			if ((actor.data.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.data.abilities.talent[talent].label == "wod.abilities.athletics") ||	
					(actor.data.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.leadership")	|| 
					(actor.data.abilities.talent[talent].label == "wod.abilities.primalurge") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.data.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.data.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.allskills) {
			if ((actor.data.abilities.skill[skill].label == "wod.abilities.animalken") ||	
					(actor.data.abilities.skill[skill].label == "wod.abilities.craft") ||	
					(actor.data.abilities.skill[skill].label == "wod.abilities.drive") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.etiquette") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.firearms") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.larceny")	|| 
					(actor.data.abilities.skill[skill].label == "wod.abilities.melee") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.performance") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.stealth") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.data.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.data.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.allknowledges) {
			if ((actor.data.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||	
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.computer") ||	
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.occult")	|| 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.rituals") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.data.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.data.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static _setCreatureAbilities(actor) {
		for (const talent in CONFIG.wod.alltalents) {
			actor.data.abilities.talent[talent].isvisible = false;
		}

		for (const skill in CONFIG.wod.allskills) {
			actor.data.abilities.skill[skill].isvisible = false;
		}

		for (const knowledge in CONFIG.wod.allknowledges) {
			actor.data.abilities.knowledge[knowledge].isvisible = false;
		}		
	}
	
	static _setMortalAttributes(actor) {
		let willpower = -1;

		for (const attribute in actor.data.attributes) {
			actor.data.attributes[attribute].isvisible = true;
		}

		if (CONFIG.wod.attributeSettings == "20th") {
			actor.data.attributes.composure.isvisible = false;
			actor.data.attributes.resolve.isvisible = false;
			actor.data.willpower.permanent = 0;
		}
		else if (CONFIG.wod.attributeSettings == "5th") {
			actor.data.attributes.appearance.isvisible = false;
			actor.data.attributes.perception.isvisible = false;
			actor.data.willpower.permanent = 2;
		}
	
		if (CONFIG.wod.rollSettings) {
			willpower = actor.data.willpower.permanent; 
		}
		else {
			willpower = actor.data.willpower.permanent > actor.data.willpower.temporary ? actor.data.willpower.temporary : actor.data.willpower.permanent; 
		}
	
		actor.data.willpower.roll = willpower;
	}

	static _setVampireAttributes(actor) {
		actor.data.bloodpool.temporary = 0;
		actor.data.bloodpool.max = 10;
	}

	static _setWerewolfAttributes(actor) {
		let rage = -1;
		let gnosis = -1;

		if (CONFIG.wod.rollSettings) {
			rage = actor.data.rage.permanent; 
			gnosis = actor.data.gnosis.permanent;
		}
		else {
			rage = actor.data.rage.permanent > actor.data.rage.temporary ? actor.data.rage.temporary : actor.data.rage.permanent; 
			gnosis = actor.data.gnosis.permanent > actor.data.gnosis.temporary ? actor.data.gnosis.temporary : actor.data.gnosis.permanent;
		}

		actor.data.rage.roll = rage;
		actor.data.gnosis.roll = gnosis;
	}

	static _setMageAttributes(actor) {
		actor.data.arete.permanent = 1;
		actor.data.arete.roll = 1;
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
		
		if (((itemAdministratorLevel == "gm") || (itemAdministratorLevel == "assistant")) && user.isGM) {
			permissions.itemAdministrator = true;
		}
		if ((itemAdministratorLevel == "trusted") && user.isTrusted) {
			permissions.itemAdministrator = true;
		}		

		return permissions;
	}
}

// get a specific item on an actor
function getItem(id, itemlist)
{
	if (id == undefined) {
		return false;
	}

	for (const i of itemlist) {
		if (i.data._id == id) {
			return i;
		}
	}

	return false;
}
