/* global ChatMessage, Roll, game */
export class DiceRoll {
    constructor(actor) {
		this.actor = actor;  			// rolling actor
		this.origin = "";    			// where did the roll come from

		this.handlingOnes = false;		// how should Ones handle?
		this.numDices = 0;				// number dice called for
		this.difficulty = 6;			// difficulty of the roll
		this.woundpenalty = 0;  				// wound penalty of the roll

		this.speciality = false;			// speciallity roll?
		this.specialityText = "";

		this.templateHTML = "";				// this shown chat text
		this.systemText = "";			// if there are a system text to be shown		

		this.rollDamage = "";
    }
}

// Function to roll dice
//export async function rollDice(handlingOnes, numDice, actor, label = "", difficulty = 0, systemText = "", specialty = false, specialityText = "", wound = 0) {
export async function rollDice(diceRoll) {
	console.log("WoD | rollDice");

	const actor = diceRoll.actor;
	const origin = diceRoll.origin;

	const handlingOnes = diceRoll.handlingOnes;
	const numDices = parseInt(diceRoll.numDices);
	let difficulty = parseInt(diceRoll.difficulty);
	let wound = parseInt(diceRoll.woundpenalty);

	console.log("handlingOnes: " + handlingOnes);
	console.log("numDices:" + numDices);
	console.log("difficulty: " + difficulty);
	
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
			console.log("Rolled 10: +2 successes");
			success += 2;
			rolledAnySuccesses = true;
		}
		else if (dice.result >= difficulty) {
			console.log("Rolled success: +1 successes");
			success++;
			rolledAnySuccesses = true;
		}
		else if (dice.result == 1) {
			if (handlingOnes) {
				console.log("Rolled 1: -1 successes");
				success--;
			}

			rolledOne = true;
		}

		console.log("Number successes:" + success);
	});

	if (success < 0) {
		success = 0;
	}

	successRoll = success > 0;		

	if ((actor.data.data.health.damage.woundlevel != "") && (wound < 0)) {
		wound = `<div><strong>${game.i18n.localize(actor.data.data.health.damage.woundlevel)} (${wound})</strong></div>`;
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

	if (actor.data.data.conditions != undefined) {
		if (actor.data.data.conditions?.isignoringpain) {
			conditions += `<div>${game.i18n.localize("wod.combat.conditions.ignorepain")}</div>`;
		}

		if (actor.data.data.conditions?.isstunned) {
			conditions += `<div>${game.i18n.localize("wod.combat.conditions.stunned")}</div>`;
		}

		if (actor.data.data.conditions?.isfrenzy) {
			conditions += `<div>${game.i18n.localize("wod.combat.conditions.frenzy")}</div>`;
		}
	}

	difficulty = `<div>${game.i18n.localize("wod.labels.difficulty")}: ${difficulty}</div>`;

	label = `<p class="roll-label uppercase">${label} ${wound} ${conditions} ${specialityText} ${difficulty}</p>`;

	if (systemText != "") {
		label += `<p class="roll-label uppercase">${systemText}</p>`;
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
			label += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" alt="Normal Fail" class="rolldices" />`;
		});
	}

	label += "</ br>";

	roll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: label,
	});

	return success;
}