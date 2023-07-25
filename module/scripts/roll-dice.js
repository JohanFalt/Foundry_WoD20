import BonusHelper from "./bonus-helpers.js";
import CombatHelper from "./combat-helpers.js";

let _diceColor;
let _specialDiceType = "";

function _GetDiceColors(actor) {
	

	if (actor == undefined) {
		_diceColor = "black_";
	}		
	else if (actor.type == CONFIG.wod.sheettype.mortal) {
		_diceColor = "blue_";
	} 
	else if ((actor.type == CONFIG.wod.sheettype.werewolf) || (actor.type == "Changing Breed")) {
		_diceColor = "brown_";
	}
	else if (actor.type == CONFIG.wod.sheettype.mage) { 
		_diceColor = "purple_";
	}
	else if (actor.type == CONFIG.wod.sheettype.vampire) { 
		_diceColor = "red_";
	}
	else if (actor.type == CONFIG.wod.sheettype.changeling) { 
		_diceColor = "blue_";
		_specialDiceType = "black_";
	}
	else if ((actor.type == CONFIG.wod.sheettype.hunter) || (actor.type == CONFIG.wod.sheettype.demon)) { 
		_diceColor = "orange_";
	}
	else if (actor.type == CONFIG.wod.sheettype.spirit) { 
		_diceColor = "yellow_";
	}		
	else {
		_diceColor = "black_";
	}
}

/* global ChatMessage, Roll, game */
export class DiceRoll {
    constructor(actor) {
		this.actor = actor;  			// rolling actor
		this.origin = "";    			// where did the roll come from
		this.attribute = "";

		this.handlingOnes = false;		// how should Ones handle?
		this.numDices = 0;				// number dice called for
		this.targetlist = [];			// number of targets in a lists or results
		this.difficulty = 6;			// difficulty of the roll
		this.woundpenalty = 0;  				// wound penalty of the roll

		this.numSpecialDices = 0;		// how many of the numDices are to show a special type
		this.specialDiceText = "";		// what text should the dice have

		this.speciality = false;			// speciality roll?
		this.specialityText = "";

		this.templateHTML = "";				// this shown chat text
		this.systemText = "";			// if there are a system text to be shown		

		this.rollDamage = "";
    }
}

/* klassen som man använder för att skicka in information in i RollDice */
export class DiceRollContainer {
    constructor(actor) {
		this.actor = actor; 	// rolling actor
		this.attribute = "";
		this.dicetext = [];
		this.extraInfo = [];
		this.origin = "";

		this.numDices = 0;
		this.numSpecialDices = 0;
		this.woundpenalty = 0;
		this.difficulty	= 6;
		this.action = "";
		this.targetlist = [];

		this.speciality = false;
		this.specialityText = "";		
		this.systemText = "";
    }
}

// Function to roll dice
export async function NewRollDice(diceRoll) {

	const actor = diceRoll.actor;
	let difficulty = diceRoll.difficulty;
	let specialityText = diceRoll.specialityText;
	const systemText = diceRoll.systemText;
	let targetlist = diceRoll.targetlist;	

    let diceResult;

	// multi damage dices
	const allDiceResult = [];
    let rollInfo = "";	
	
	// dices to Dice So Nice :)
    const allDices = [];
	
	let rolledDices;
	let success;
	let bonusSuccesses = 0;
	let rolledOne = false;
	let rolledAnySuccesses = false;
	let canBotch = true;
	let rollResult = "";
	let info = [];
	let systemtext = [];
	

	difficulty = difficulty < CONFIG.wod.lowestDifficulty ? CONFIG.wod.lowestDifficulty : difficulty;

	if (actor != undefined) {
		if (await BonusHelper.CheckAttributeAutoBuff(actor, diceRoll.attribute)) {
			bonusSuccesses = await BonusHelper.GetAttributeAutoBuff(actor, diceRoll.attribute);			
		}
	}

	if ((diceRoll.origin == "soak") || (diceRoll.origin == "damage")) {
		canBotch = false;
	}

	// set correct dice colors
	_GetDiceColors(actor);

	if (targetlist.length == 0) {
		let target = {
			numDices: diceRoll.numDices
		}
		targetlist.push(target);
	}

	for (const target of targetlist) {
		success = bonusSuccesses;
		rolledAnySuccesses = success > 0;
		rolledDices = 0;
		diceResult = [];
		diceResult.dices = [];
		diceResult.successes = success;
		diceResult.rolledAnySuccesses = rolledAnySuccesses;

		let numberDices = target.numDices + diceRoll.woundpenalty;

		if (numberDices < 0) {
			numberDices = 0;
		}

		while (numberDices > rolledDices) {
			let chosenDiceColor = _diceColor;
			let roll = await new Roll("1d10");
			roll.evaluate({async:true});	
			allDices.push(roll);
			
			roll.terms[0].results.forEach((dice) => {
				rolledDices += 1;

				if (dice.result == 10) {				
					if ((CONFIG.wod.usespecialityAddSuccess) && (diceRoll.speciality)) {
						success += CONFIG.wod.specialityAddSuccess;
					}
					else if (CONFIG.wod.usetenAddSuccess) {
						success += CONFIG.wod.tenAddSuccess;
					}             
					else {
						success += 1;
					}   
					if (CONFIG.wod.useexplodingDice) {
						if ((CONFIG.wod.explodingDice == "speciality") && (diceRoll.speciality)) {
							rolledDices -= 1;
						}
						if (CONFIG.wod.explodingDice == "always") {
							rolledDices -= 1;
						}
					}

					rolledAnySuccesses = true;
				}
				else if (dice.result >= difficulty) {
					rolledAnySuccesses = true;
					success += 1;
				}
				else if (dice.result == 1) {
					if ((CONFIG.wod.handleOnes) && (canBotch)) {
						success--;
					}
		
					rolledOne = true;
				}

				if (diceRoll.numSpecialDices >= rolledDices) {
					chosenDiceColor = _specialDiceType;
				}

				let result = {
					value: parseInt(dice.result),
					color: chosenDiceColor				
				}

				diceResult.dices.push(result);
			});
		}

		if (success < 0) {
			success = 0;
		}

		if (success > 0) {
			rollResult = "success";
		}
		else if ((CONFIG.wod.handleOnes) && (rolledOne) && (!rolledAnySuccesses) && (canBotch)) {
			rollResult = "botch";
		}
		else if ((!CONFIG.wod.handleOnes) && (rolledOne) && (canBotch)) {
			rollResult = "botch";
		}
		else {
			rollResult = "fail";
		}	

		diceResult.successes = `${game.i18n.localize("wod.dice.successes")}: ${success}`;
		diceResult.rolledAnySuccesses = rolledAnySuccesses;
		diceResult.rollResult = rollResult;

		allDiceResult.push(diceResult);
	}

	for (const property of diceRoll.dicetext) {
		if (rollInfo != "") {
			rollInfo += " + ";
		}
		rollInfo += property;
	} 

	// if attack then there will be a damage code in the information
	if (diceRoll.damageCode != undefined) {
		if (rollInfo != "") {
			rollInfo += " ";
		}
		rollInfo += diceRoll.damageCode;
	}	

	// if any wound penalty show in message
	if ((diceRoll.woundpenalty < 0) && (actor != undefined) && (actor.system.health != undefined) && (actor.system.health.damage.woundlevel != "")) {
		info.push(`${game.i18n.localize(actor.system.health.damage.woundlevel)} (${diceRoll.woundpenalty})`);
	}

	if (diceRoll.speciality) {
		if (specialityText == "") {
			specialityText = game.i18n.localize("wod.dialog.usingspeciality");
		}
	}
	else {
		specialityText = "";
	}	

	difficulty = `${game.i18n.localize("wod.labels.difficulty")}: ${difficulty}`;

	if (diceRoll.origin != "damage") {
		if (success > 0) {
			rollResult = "success";
		}
		else if ((CONFIG.wod.handleOnes) && (rolledOne) && (!rolledAnySuccesses) && (canBotch)) {
			rollResult = "botch";
		}
		else if ((!CONFIG.wod.handleOnes) && (rolledOne) && (canBotch)) {
			rollResult = "botch";
		}
		else {
			rollResult = "fail";
		}	
	}

	for (const property of diceRoll.extraInfo) {
		info.push(property);
	}

	if (difficulty != "") {
		info.push(difficulty);
	}
	if (specialityText != "") {
		info.push(specialityText);
	}
	if (systemText != "") {
		systemtext.push(systemText);
	}	
	if (bonusSuccesses > 0) {
		let text = game.i18n.localize("wod.dice.addedautosucc");
		info.push(text.replace("{0}", bonusSuccesses));
	}

	/* needs dividing - dice info , extra info and system texts */

    const templateData = {
        data: {
            actor: diceRoll.actor,
            type: diceRoll.origin,
            action: diceRoll.action,
            title: rollInfo,
			info: info,		
			systemtext: systemtext,	
			multipleresult: allDiceResult
        }
    };

    // Render the chat card template
    const template = `systems/worldofdarkness/templates/dialogs/roll-template.html`;
    const html = await renderTemplate(template, templateData);

    const chatData = {
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: allDices,
        content: html,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
        rollMode: game.settings.get("core", "rollMode")        
    };
    ChatMessage.applyRollMode(chatData, "roll");
    ChatMessage.create(chatData);

    return success;
}

export async function InitiativeRoll(diceRoll) {
	const actor = diceRoll.actor;

	let allDiceResult = [];
	let diceResult = [];
	diceResult.dices = [];
	let info = [];

	let rollInfo = "";

	let foundToken = false;
	let foundEncounter = true;
	let tokenAdded = false;
	let rolledInitiative = false;
	let init = 0;
	let initAttribute = "";

	let token = await canvas.tokens.placeables.find(t => t.document.actor._id === actor._id);

	if(token) foundToken = true;

	if (game.combat == null) {
		foundEncounter = false;
	}

	// set correct dice colors
	_GetDiceColors(actor);

	let roll = new Roll("1d10");	
	roll.evaluate({async:true});
	roll.terms[0].results.forEach((dice) => {
		init += parseInt(dice.result) + parseInt(actor.system.initiative.total);

		let result = {
			value: parseInt(dice.result),
			color: _diceColor		
		}

		diceResult.dices.push(result);

		rollInfo = `${dice.result} + ${actor.system.initiative.total} = ${dice.result + actor.system.initiative.total}`;
	});

	allDiceResult.push(diceResult);

	if ((foundToken) && (foundEncounter)) {
		if (!CombatHelper._inTurn(token)) {
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
		initAttribute = game.i18n.localize(actor.system.advantages.willpower.label) + " " + actor.system.advantages.willpower.permanent;
	}

	//(into)
	if (!foundEncounter) {
		info.push(game.i18n.localize("wod.dice.noencounterfound"));
		//message += "<em>"+game.i18n.localize("wod.dice.noencounterfound")+"</em>";			
	}
	else {
		if (!foundToken) {
			info.push(game.i18n.localize("wod.dice.notokenfound"));
			//message += "<em>"+game.i18n.localize("wod.dice.notokenfound")+"</em><br />";				
		}
		else {
			if (!tokenAdded) {
				info.push(game.i18n.localize("wod.dice.characteradded"));
				allDiceResult = [];
				//message += "<em>"+game.i18n.localize("wod.dice.characteradded")+"</em><br />";
				//label = "";
				//init = "";
			}
			if (!rolledInitiative) {
				info.push(`${actor.name} ${game.i18n.localize("wod.dice.initiativealready")}`);
				allDiceResult = [];
				//message += "<em>" + actor.system.name + " "+game.i18n.localize("wod.dice.initiativealready")+"</em><br />";
				//label = "";
				//init = "";
			}
		}
	}

	const templateData = {
        data: {
            actor: diceRoll.actor,
            type: diceRoll.origin,
            action: game.i18n.localize("wod.dice.rollinginitiative"),
            title: rollInfo,
			info: info,			
			multipleresult: allDiceResult
        }
    };

    // Render the chat card template
    const template = `systems/worldofdarkness/templates/dialogs/roll-template.html`;
    const html = await renderTemplate(template, templateData);

    const chatData = {
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        //rolls: allDices,
        content: html,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
        rollMode: game.settings.get("core", "rollMode")        
    };
    ChatMessage.applyRollMode(chatData, "roll");
    ChatMessage.create(chatData);

	return true;
}

// Function to roll dice
/* export async function rollDiceMultiple(diceRoll) {
	console.log("WoD | rollDice");

	const actor = diceRoll.actor;
	const origin = diceRoll.origin;

	const handlingOnes = diceRoll.handlingOnes;

	const rollList = diceRoll.targetlist;

	let numSpecialDices = parseInt(diceRoll.numSpecialDices);
	const specialDiceText = diceRoll.specialDiceText;
	let difficulty = parseInt(diceRoll.difficulty);
	let wound = parseInt(diceRoll.woundpenalty);

	let label = diceRoll.templateHTML;
	const rollDamage = diceRoll.rollDamage;
	const systemText = diceRoll.systemText;
	const speciality = diceRoll.speciality;
	let specialityText = diceRoll.specialityText;	

	let canBotch = true;

	if ((origin == "soak") || (origin == "damage")) {
		canBotch = false;
	}

	let conditions = "";
	
	if (actor.system.conditions != undefined) {
		if (actor.system.conditions?.isignoringpain) {
			conditions += `<div>${game.i18n.localize("wod.combat.conditions.ignorepain")}</div>`;
		}

		if (actor.system.conditions?.isstunned) {
			conditions += `<div>${game.i18n.localize("wod.combat.conditions.stunned")}</div>`;
		}

		if (actor.system.conditions?.isfrenzy) {
			conditions += `<div>${game.i18n.localize("wod.combat.conditions.frenzy")}</div>`;
		}
	}

	difficulty = difficulty < 2 ? 2 : difficulty;	

	let roll;

	// check if there are multiple targets
	if (rollList.length > 0) {
		for (const rolldice of rollList) {

			let zeroDices = rolldice.numDices + wound <= 0;   
			let dice = zeroDices ? 0 : rolldice.numDices + wound;
			let difficultyResult = "";
			let success = 0;
			let successRoll = false;
			let rolledAnySuccesses = false;
			let rolledOne = false;			

			roll = new Roll(dice + "d10");
			roll.evaluate({async:true});	
			
			roll.terms[0].results.forEach((dice) => {
				if ((dice.result == 10) && (speciality)) {
					success += 2;
					rolledAnySuccesses = true;
				}
				else if (dice.result >= difficulty) {
					success++;
					rolledAnySuccesses = true;
				}
				else if (dice.result == 1) {
					if (handlingOnes) {
						success--;
					}
		
					rolledOne = true;
				}
			});

			if (success < 0) {
				success = 0;
			}
		
			successRoll = success > 0;

			if (!zeroDices) {
				if (successRoll) {
					difficultyResult = `( <span class="success">${game.i18n.localize("wod.dice.success")}</span> )`;
				}
				else if ((handlingOnes) && (rolledOne) && (!rolledAnySuccesses) && (canBotch)) {
					difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.botch")}</span> )`;
				}
				else if ((!handlingOnes) && (rolledOne) && (canBotch)) {
					difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.botch")}</span> )`;
				}
				else {
					difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.fail")}</span> )`;
				}		
		
				label += `<p class="roll-label result-success">${game.i18n.localize("wod.dice.successes")}: ${success}  ${difficultyResult}</p>`;		
		
				if (rollDamage != "") {
					label += rollDamage;
				}
			}
		
			if (!zeroDices) {
				let diceColor;
				let specialDiceType;
				
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
				else if (actor.type == CONFIG.wod.sheettype.changeling) { 
					diceColor = "blue_";
					specialDiceType = "black_";
				}
				else if ((actor.type == CONFIG.wod.sheettype.hunter) || (actor.type == CONFIG.wod.sheettype.demon)) { 
					diceColor = "orange_";
				}
				else if (actor.type == CONFIG.wod.sheettype.spirit) { 
					diceColor = "yellow_";
				}		
				else {
					diceColor = "black_";
				}
				
				roll.terms[0].results.forEach((dice) => {
					if (numSpecialDices > 0) {
						numSpecialDices = numSpecialDices - 1;
						label += `<img src="systems/worldofdarkness/assets/img/dice/${specialDiceType}${dice.result}.png" title="${specialDiceText}" class="rolldices" />`;
					}
					else {
						label += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" class="rolldices" />`;
					}			
				});
			}
		
			label += "</ br>";
		}		

		difficulty = `<div>${game.i18n.localize("wod.labels.difficulty")}: ${difficulty}</div>`;

		if ((actor.system?.health.damage.woundlevel != "") && (wound < 0)) {
			wound = `<div><strong>${game.i18n.localize(actor.system.health.damage.woundlevel)} (${wound})</strong></div>`;
		}
		else {
			wound = ``;
		}

		if (speciality) {
			if (specialityText == "") {
				specialityText = `<div>${game.i18n.localize("wod.dialog.usingspeciality")}</div>`;
			}
			else {
				specialityText = `<div>(${specialityText})</div>`;
			}
		}
		else {
			specialityText = "";
		}

		label = `<div>${label} ${wound} ${conditions} ${specialityText} ${difficulty}</div>`;

		if (systemText != "") {
			label += `<div>${systemText}</div>`;
		}

		roll.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			content: label,
		});
	}		

	return true;
} */


// Function to roll dice
/* export async function rollDice(diceRoll) {
	console.log("WoD | rollDice");

	const actor = diceRoll.actor;
	const origin = diceRoll.origin;

	let handlingOnes = diceRoll.handlingOnes;
	const numDices = parseInt(diceRoll.numDices);
	let numSpecialDices = parseInt(diceRoll.numSpecialDices);
	const specialDiceText = diceRoll.specialDiceText;
	let difficulty = parseInt(diceRoll.difficulty);
	let wound = parseInt(diceRoll.woundpenalty);

	const attribute = diceRoll.attribute;
	let label = diceRoll.templateHTML;
	const rollDamage = diceRoll.rollDamage;
	const systemText = diceRoll.systemText;
	const speciality = diceRoll.speciality;
	let specialityText = diceRoll.specialityText;	
  
	let zeroDices = numDices + wound <= 0;   
	let dice = zeroDices ? 0 : numDices + wound;
	let difficultyResult = "";
	let success = 0;
	let successRoll = false;
	let rolledAnySuccesses = false;
	let rolledOne = false;
	let roll;
	let conditions = "";	
	let canBotch = true;

	if (actor != undefined) {
		if (await BonusHelper.CheckAttributeAutoBuff(actor, attribute)) {
			success = await BonusHelper.GetAttributeAutoBuff(actor, attribute);
			rolledAnySuccesses = success > 0;
		}
	}

	if ((origin == "soak") || (origin == "damage")) {
		handlingOnes = false;
		canBotch = false;
	}

	roll = new Roll(dice + "d10");
	roll.evaluate({async:true});		

	difficulty = difficulty < CONFIG.wod.lowestDifficulty ? CONFIG.wod.lowestDifficulty : difficulty;

	roll.terms[0].results.forEach((dice) => {
		if ((dice.result == 10) && (speciality)) {
			success += 2;
			rolledAnySuccesses = true;
		}
		else if (dice.result >= difficulty) {
			success++;
			rolledAnySuccesses = true;
		}
		else if (dice.result == 1) {
			if (handlingOnes) {
				success--;
			}

			rolledOne = true;
		}
	});

	if (success < 0) {
		success = 0;
	}

	successRoll = success > 0;		
	
	if ((actor != undefined) && (actor.system.health != undefined) && (actor.system.health.damage.woundlevel != "") && (wound < 0)) {
		wound = `<div><strong>${game.i18n.localize(actor.system.health.damage.woundlevel)} (${wound})</strong></div>`;
	}
	else {
		wound = ``;
	}

	if (speciality) {
		if (specialityText == "") {
			specialityText = `<div>${game.i18n.localize("wod.dialog.usingspeciality")}</div>`;
		}
		else {
			specialityText = `<div>(${specialityText})</div>`;
		}
	}
	else {
		specialityText = "";
	}

	if (actor != undefined) {
		if (actor.system.conditions != undefined) {
			if (actor.system.conditions?.isignoringpain) {
				conditions += `<div>${game.i18n.localize("wod.combat.conditions.ignorepain")}</div>`;
			}

			if (actor.system.conditions?.isstunned) {
				conditions += `<div>${game.i18n.localize("wod.combat.conditions.stunned")}</div>`;
			}

			if (actor.system.conditions?.isfrenzy) {
				conditions += `<div>${game.i18n.localize("wod.combat.conditions.frenzy")}</div>`;
			}
		}
	}

	difficulty = `<div>${game.i18n.localize("wod.labels.difficulty")}: ${difficulty}</div>`;

	label = `<div>${label} ${wound} ${conditions} ${specialityText} ${difficulty}</div>`;

	if (systemText != "") {
		label += `<div>${systemText}</div>`;
	}

	if (!zeroDices) {
		if (successRoll) {
			difficultyResult = `( <span class="success">${game.i18n.localize("wod.dice.success")}</span> )`;
		}
		else if ((handlingOnes) && (rolledOne) && (!rolledAnySuccesses) && (canBotch)) {
			difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.botch")}</span> )`;
		}
		else if ((!handlingOnes) && (rolledOne) && (canBotch)) {
			difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.botch")}</span> )`;
		}
		else {
			difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.fail")}</span> )`;
		}		

		label += `<p class="roll-label result-success">${game.i18n.localize("wod.dice.successes")}: ${success}  ${difficultyResult}</p>`;		

		if (rollDamage != "") {
			label += rollDamage;
		}
	}

	if (!zeroDices) {
		let diceColor;
		let specialDiceType;
		
		if (actor == undefined) {
			diceColor = "black_";
		}		
		else if (actor.type == CONFIG.wod.sheettype.mortal) {
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
		else if (actor.type == CONFIG.wod.sheettype.changeling) { 
			//diceColor = "lightblue_";
			diceColor = "blue_";
			specialDiceType = "black_";
		}
		else if ((actor.type == CONFIG.wod.sheettype.hunter) || (actor.type == CONFIG.wod.sheettype.demon)) { 
			diceColor = "orange_";
		}
		else if (actor.type == CONFIG.wod.sheettype.spirit) { 
			diceColor = "yellow_";
		}		
		else {
			diceColor = "black_";
		}
		
		roll.terms[0].results.forEach((dice) => {
			if (numSpecialDices > 0) {
				numSpecialDices = numSpecialDices - 1;
				label += `<img src="systems/worldofdarkness/assets/img/dice/${specialDiceType}${dice.result}.png" title="${specialDiceText}" class="rolldices" />`;
			}
			else {
				label += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" class="rolldices" />`;
			}			
		});
	}

	label += "</ br>";

	roll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: label,
	});

	return success;
} */