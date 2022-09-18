/* global ChatMessage, Roll, game */
export class DiceRoll {
    constructor(actor) {
		this.actor = actor;  			// rolling actor
		this.origin = "";    			// where did the roll come from

		this.handlingOnes = false;		// how should Ones handle?
		this.numDices = 0;				// number dice called for
		this.targetlist = [];			// number of targets in a lists or results
		this.difficulty = 6;			// difficulty of the roll
		this.woundpenalty = 0;  				// wound penalty of the roll

		this.numSpecialDices = 0;		// how many of the numDices are to show a special type
		this.specialDiceText = "";		// what text should the dice have

		this.speciality = false;			// speciallity roll?
		this.specialityText = "";

		this.templateHTML = "";				// this shown chat text
		this.systemText = "";			// if there are a system text to be shown		

		this.rollDamage = "";
    }
}

// Function to roll dice
export async function rollDice(diceRoll) {
	console.log("WoD | rollDice");

	const actor = diceRoll.actor;
	const origin = diceRoll.origin;

	const handlingOnes = diceRoll.handlingOnes;
	const numDices = parseInt(diceRoll.numDices);
	let numSpecialDices = parseInt(diceRoll.numSpecialDices);
	const specialDiceText = diceRoll.specialDiceText;
	let difficulty = parseInt(diceRoll.difficulty);
	let wound = parseInt(diceRoll.woundpenalty);

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

	if ((origin == "soak") || (origin == "damage")) {
		canBotch = false;
	}

	roll = new Roll(dice + "d10");
	roll.evaluate({async:true});		

	difficulty = difficulty < 3 ? 3 : difficulty;

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

	if ((actor.system.health.damage.woundlevel != "") && (wound < 0)) {
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
			diceColor = "lightblue_";
			specialDiceType = "black_";
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
}

// Function to roll dice
export async function rollDiceMultiple(diceRoll) {
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

	difficulty = difficulty < 3 ? 3 : difficulty;	

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
					diceColor = "lightblue_";
					specialDiceType = "black_";
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

		if ((actor.system.health.damage.woundlevel != "") && (wound < 0)) {
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
}