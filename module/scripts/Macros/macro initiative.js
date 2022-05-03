const tokens = canvas.tokens.controlled;

if (tokens.length > 0){
    tokens.forEach(rollInitiative);
} else {
    printMessage('<h2>No Tokens were selected</h2>');
}

async function rollInitiative(token) {
    let actor = token.actor;
    const bonus = parseInt(actor.data.data.initiative.total);
    let formula = "1d10";
    let init = 0;
    let label = "";

    roll = new Roll(formula);

	roll.evaluate({async:true});
    roll.terms[0].results.forEach((dice) => {
        init += parseInt(dice.result);
	});

    init += parseInt(bonus);

    if (game.combat == null) {
        printMessage('<h2>No encounter found</h2>');
        return true;
    }

    if (!inTurn(token)) {
        await token.toggleCombat();

        if (token.combatant.data.initiative == undefined) {      
            await token.combatant.update({initiative: init});
        }
        else {
            printMessage(actor.data.name + '<h2>Has initiative already</h2>');
        }

        let diceColor;
		
		if (actor.type == "Mortal") {
			diceColor = "blue_";
		} 
		else if ((actorData.type == "Werewolf") || (actorData.type == "Changing Breed")) {
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
            label += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" class="rolldices" />`;
        });

        printMessage('<h2>Rolling Initiative</h2>' + init + '<br />' + label);
    }  
    else {
        printMessage(actor.data.name + "<h2>Already added</h2>");
    }

    inUse = false;
}

function inTurn(token) {
    for (let count = 0; count < game.combat.combatants.size; count++) {
        if (token.id == game.combat.combatants.contents[count].token.id) {
            return true;
        }
    }

    return false;
}

function printMessage(message){
    let chatData = {
        content : message,
        speaker : ChatMessage.getSpeaker({ actor: this.actor })
    };		

    ChatMessage.create(chatData,{});  
}