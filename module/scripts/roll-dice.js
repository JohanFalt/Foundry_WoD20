/* global ChatMessage, Roll, game */

// Function to roll dice
export function rollDice(numDice, actor, label = "", difficulty = 0, specialty, wound) {
	console.log("WoD | rollDice");
  
	let zeroDices = numDice + wound <= 0;   
	let dice = zeroDices ? 0 : parseInt(numDice + wound);
	let difficultyResult = "<span></span>";
	let success = 0;
	let successRoll = false;
	let rolledOne = false;
	let roll;
	
  
	if (!zeroDices) {
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
	}

	successRoll = success > 0;		
	
	if (successRoll) {
		difficultyResult = `( <span class="success">${game.i18n.localize("wod.dice.success")}</span> )`;
	}
	else if (rolledOne) {
		difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.botch")}</span> )`;
	}
	else {
		difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.fail")}</span> )`;
	}

	label = `<p class="roll-label uppercase">${label}</p>`;
	label += `<p class="roll-label result-success">${game.i18n.localize("wod.dice.successes")}: ${success} ${difficultyResult}</p>`;

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
		else {
			diceColor = "black_";
		}
		
		roll.terms[0].results.forEach((dice) => {
			label += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" alt="Normal Fail" class="rolldices" />`;
		});
	}

	label = label + "</ br>";

	roll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: label,
	});
}