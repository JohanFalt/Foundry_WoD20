const tokens = canvas.tokens.controlled;

if (tokens.length > 0) {
    roll(tokens[0]);
} 
else {
    printMessage('<h2>No Tokens were selected</h2>');
}

async function roll(token) {

    let selector = "";

    for (let i = 3; i <= 10; i++) {
        if (i == 6) {
            selector += `<input type="radio" id="inputDif" name="inputDif" value="${i}" checked>${i}</input>`;
        }
        else {
            selector += `<input type="radio" id="inputDif" name="inputDif" value="${i}">${i}</input>`;
        }
    }

    let buttons = {};
    let template = `<form>
                        <div class="form-group">
                            <label>${game.i18n.localize("wod.labels.numdices")}</label>
                            <input type="text" id="dices" value="0">
                        </div>  
                        <div class="form-group">
						<label>${game.i18n.localize("wod.labels.difficulty")}</label>
						`
						+ selector + 
						`
                        </div> 
                        <div class="form-group">
                            <input id="specialty" type="checkbox">${game.i18n.localize("wod.labels.specialty")}</input>
                        </div>
					</div>
                    </form>`;

    buttons = {
        draw: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("wod.dice.roll"),
            callback: async (template) => {
                let actor = token.actor;
                const dice = template.find("#dices")[0]?.value;
                let difficulty = parseInt(template.find("#inputDif:checked")[0]?.value || 0);
                const specialty = template.find("#specialty")[0]?.checked || false;
                let successes = 0;
                let label = "";
                let rolledOne = false;
                let successRoll = false;

                roll = new Roll(dice + "d10");
                roll.evaluate({async:true});

                const diceColor = "black_";
                
                roll.terms[0].results.forEach((dice) => {
                    if ((dice.result == 10) && (specialty)) {
                        successes += 2;
                    }
                    else if (dice.result >= difficulty) {
                        successes++;
                    }
                    else if (dice.result == 1) {
                        rolledOne = true;
                    }

                    label += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" class="rolldices" />`;
                });

                successRoll = successes > 0;

                if (successRoll) {
                    difficultyResult = `( <span class="success">${game.i18n.localize("wod.dice.success")}</span> )`;
                }
                else if (rolledOne) {
                    difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.botch")}</span> )`;
                }
                else {
                    difficultyResult = `( <span class="danger">${game.i18n.localize("wod.dice.fail")}</span> )`;
                }
                
                label += `<p class="roll-label result-success">${game.i18n.localize("wod.dice.successes")}: ${successes} ${difficultyResult}</p>`;

                if (specialty) {
                    label += `<p class="roll-label result-success">Speciality used</p>`;
                }

                printMessage('<h2>' + actor.data.name + '</h2><strong>Rolling Dice</strong><br />' + label);
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
        user : game.user._id,
        content : message,
        blind: true,
        whisper : ChatMessage.getWhisperRecipients("GM")
    };

    ChatMessage.create(chatData,{});    
}