/* global ChatMessage, Roll, game */

// Function to roll dice
export function rollDice(numDice, actor, label = "", difficulty = 0, specialty, specialityText, wound, systemText) {
	console.log("WoD | rollDice");
  
	let zeroDices = numDice + wound <= 0;   
	let dice = zeroDices ? 0 : parseInt(numDice + wound);
	let difficultyResult = "<span></span>";
	let success = 0;
	let successRoll = false;
	let rolledOne = false;
	let roll;
	let conditions = "";

	roll = new Roll(dice + "d10");
	roll.evaluate({async:true});		

	difficulty = difficulty < 3 ? 3 : difficulty;

	roll.terms[0].results.forEach((dice) => {
		if ((dice.result == 10) && (specialty)) {
			success += 2;
		}
		else if (dice.result >= difficulty) {
			success++;
		}
		else if (dice.result == 1) {
			rolledOne = true;
		}
	});

	successRoll = success > 0;		

	if (actor.data.data.health.damage.woundlevel != "") {
		wound = `<br /><strong>${game.i18n.localize(actor.data.data.health.damage.woundlevel)} (${wound})</strong>`;
	}
	else {
		wound = ``;
	}

	if (specialty) {
		specialityText = `<br /><span>(${specialityText})</span>`;
	}
	else {
		specialityText = "";
	}

	if (actor.data.data.conditions != undefined) {
		if (actor.data.data.conditions?.ignorepain) {
			conditions += `<br />${game.i18n.localize("wod.combat.conditions.ignorepain")}`;
		}

		if (actor.data.data.conditions?.stunned) {
			conditions += `<br />${game.i18n.localize("wod.combat.conditions.stunned")}`;
		}

		if (actor.data.data.conditions?.frenzy) {
			conditions += `<br />${game.i18n.localize("wod.combat.conditions.frenzy")}`;
		}
	}

	difficulty = `<br /><span>${game.i18n.localize("wod.labels.difficulty")}: ${difficulty}</span>`;

	label = `<p class="roll-label uppercase">${label} ${wound} ${conditions} ${specialityText} ${difficulty}</p>`;

	if (systemText != "") {
		label += `<p class="roll-label uppercase">${systemText}</p>`;
	}

	if (!zeroDices) {
		if (successRoll) {
			difficultyResult = `( <span class="success">${game.i18n.localize("wod.dice.success")}</span> )`;
		}
		else if (rolledOne) {
			difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.botch")}</span> )`;
		}
		else {
			difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.fail")}</span> )`;
		}
		
		

		label += `<p class="roll-label result-success">${game.i18n.localize("wod.dice.successes")}: ${success}  ${difficultyResult}</p>`;		
	}

	if (!zeroDices) {
		let diceColor;
		
		if (actor.type == "Mortal") {
			diceColor = "blue_";
		} 
		else if (actor.type == "Werewolf") {
			diceColor = "brown_";
		}
		else if (actor.type == "Vampire") { 
			diceColor = "red_";
		}
		else if (actor.type == "Spirit") { 
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
}