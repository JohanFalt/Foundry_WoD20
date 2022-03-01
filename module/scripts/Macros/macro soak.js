const tokens = canvas.tokens.controlled;

if (tokens.length > 0) {
    tokens.forEach(rollSoak);
} 
else {
    printMessage('<h2>No Tokens were selected</h2>');
}

async function rollSoak(token) {
    let buttons = {};
    let template = `<form>
                        <div class="form-group">
                            <label>${game.i18n.localize("wod.labels.modifier")}</label>
                            <input type="text" id="inputMod" value="0">
                        </div>  
                        <div class="form-group">
                            <input type="radio" id="damageType" name="damageType" value="bashing">${game.i18n.localize("wod.health.bashing")}</input>
                            <input type="radio" id="damageType" name="damageType" value="lethal">${game.i18n.localize("wod.health.lethal")}</input>
                            <input type="radio" id="damageType" name="damageType" value="aggravated">${game.i18n.localize("wod.health.aggravated")}</input>
                        </div>
                    </form>`;

    buttons = {
        draw: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("wod.dice.roll"),
            callback: async (template) => {
                let actor = token.actor;
                const damageType = template.find("#damageType:checked")[0]?.value;
                const bonus = parseInt(template.find("#inputMod")[0]?.value);
                const dice = parseInt(actor.data.data.soak[damageType]) + parseInt(bonus);
                let successes = 0;
                let label = "";

                roll = new Roll(dice + "d10");
                roll.evaluate({async:true});

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
                    if (dice.result >= 6) {
                        successes++;
                    }

                    label += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" class="rolldices" />`;
                });

                //printMessage('<h2>' + actor.data.name + '</h2><strong>Rolling Soak (' + damageType + ')<br />Successes:</strong> ' + successes + '<br />' + label);
                printMessage('<h2>Rolling Soak</h2><strong>' + damageType + '<br />Successes:</strong> ' + successes + '<br />' + label);
            },
        },
        cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("wod.labels.cancel"),
        },
    };

    new Dialog({      
        title: game.i18n.localize("wod.labels.rolling"),
        content: template,
        buttons: buttons,
        default: "draw",
    }).render(true);    
}

function printMessage(message) {
    let chatData = {
        content : message,
        speaker : ChatMessage.getSpeaker({ actor: this.actor })
    };		

    ChatMessage.create(chatData,{});
}