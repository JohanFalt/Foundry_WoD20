/**
 * V20 Dice Roller
 * Author: Job
 * Based on 'Roll a changling dice pool roll' by Caerandir and Roll20's 'V20 Dice Roller' by Havoc
 */

new Dialog({
	title: `V20 Dice Roller`,
	content: `
		<form>
			<div style="display: flex; width: 100%; margin-bottom: 10px">
				<label for="numberOfDice" style="white-space: nowrap; margin-right: 10px; padding-top:4px">Number of d10:</label>
				<input type="number" id="numberOfDice" name="numberOfDice" min="1" max="20" autofocus />
			</div>
			<div style="display: flex; width: 100%; margin-bottom: 10px">
				<label for="diificulty" style="white-space: nowrap; margin-right: 10px; padding-top:4px">Difficulty:</label>
			</div>
			<div style="display: flex; width: 100%; margin-bottom: 10px">
			      	<input type="radio" id="d2" name="difficulty" value="2" />
			      	<label for="normal" style="white-space: nowrap; margin-left: 4px; margin-right: 7px; padding-top:4px">2</label>
			      	<input type="radio" id="d3" name="difficulty" value="3" />
			      	<label for="normal" style="white-space: nowrap; margin-left: 4px; margin-right: 7px; padding-top:4px">3</label>
			      	<input type="radio" id="d4" name="difficulty" value="4" />
			      	<label for="normal" style="white-space: nowrap; margin-left: 4px; margin-right: 7px; padding-top:4px">4</label>
			      	<input type="radio" id="d5" name="difficulty" value="5" />
			      	<label for="normal" style="white-space: nowrap; margin-left: 4px; margin-right: 7px; padding-top:4px">5</label>
			      	<input type="radio" id="d6" name="difficulty" value="6" checked="checked" />
			      	<label for="normal" style="white-space: nowrap; margin-left: 4px; margin-right: 7px; padding-top:4px">6</label>
			      	<input type="radio" id="d7" name="difficulty" value="7" />
			      	<label for="normal" style="white-space: nowrap; margin-left: 4px; margin-right: 7px; padding-top:4px">7</label>
			      	<input type="radio" id="d8" name="difficulty" value="8" />
			      	<label for="normal" style="white-space: nowrap; margin-left: 4px; margin-right: 7px; padding-top:4px">8</label>
			      	<input type="radio" id="d9" name="difficulty" value="9" />
			      	<label for="normal" style="white-space: nowrap; margin-left: 4px; margin-right: 7px; padding-top:4px">9</label>
			      	<input type="radio" id="d10" name="difficulty" value="10" />
			      	<label for="normal" style="white-space: nowrap; margin-left: 4px; margin-right: 7px; padding-top:4px">10</label>
			</div>			
			<div style="display: flex; width: 100%; margin-bottom: 10px">
				<label for="specialty" style="white-space: nowrap; margin-right: 10px; padding-top:4px">Specialty?</label>
				<input type="checkbox" id="specialty" name="specialty" />
			</div>
			<div style="display: flex; width: 100%; margin-bottom: 10px">
				<label for="willpower" style="white-space: nowrap; margin-right: 10px; padding-top:4px">Willpower?</label>
				<input type="checkbox" id="willpower" name="willpower" />
			</div>
			<div style="display: flex; width: 100%; margin-bottom: 10px">
			      	<input type="radio" id="roll" name="rollMode" value="roll" checked="checked" />
			      	<label for="normal" style="white-space: nowrap; margin-left: 5px; margin-right: 10px; padding-top:4px">Normal roll</label>
			      	<input type="radio" id="gmroll" name="rollMode" value="gmroll" />
			      	<label for="gm" style="white-space: nowrap; margin-left: 5px; margin-right: 10px; padding-top:4px">GM roll</label>
			      	<input type="radio" id="blindroll" name="rollMode" value="blindroll" />
			      	<label for="blind" style="white-space: nowrap; margin-left: 5px; margin-right: 10px; padding-top:4px">Blind roll</label>
			      	<input type="radio" id="selfroll" name="rollMode" value="selfroll" />
			      	<label for="self" style="white-space: nowrap; margin-left: 5px; margin-right: 10px; padding-top:4px">Self roll</label>
			</div>			
			<div style="display: flex; width: 100%; margin-bottom: 10px">
				<p>Normal roll: Visible to everyone<br />
				GM roll: Visible to rolling player & GM<br />
				Blind roll: Result only visible to GM<br />
				Self roll: Only visible to player</p>
			</div>
		</form>
	`,
	buttons: {
		yes: {
			icon: "<i class='fas fa-check'></i>",
			label: `Roll!`,
			callback: (html) => {
			    let tableTemplate = "<table style='max-width: 250px; background-image:url(http://i.imgur.com/y1oNOQn.jpg); background-size: 100% 100%; background-repeat: no-repeat;font-family: \"Century Gothic\", CenturyGothic, AppleGothic, sans-serif;'>"
                        + "<tr>"
                            + "<td style='text-align: center; font-size: 1.17em; font-weight: bolder; padding-top: 20px; padding-right: 20px; padding-left: 20px'>"
                                + "<<TITLE>>Roll"
                            + "</td>"
                        + "</tr>"
                        + "<tr>"
                            + "<td style='padding-left: 20px; padding-right: 20px'>"
                                + "<b>Rolling </b><<DICENUMBER>><b> dice.</b><br><b>Difficulty:</b> <<DIFFICULTY>>"
                            + "</td>"
                        + "</tr>"
                        + "<<HASSPECIALITY>>"
                        + "<<HASWILLPOWER>>"
                        + "<tr>"
                            + "<td style='padding-left: 20px; padding-right: 20px'>"
                                + "<b>Roll:</b> <<DICEROLL>>"
                                + "<br><b>Successes:</b> <<GOODROLLS>> <b>Ones:</b> <<ONEROLLS>>"
                                + "<br><b>Total:</b> <<TOTALROLL>>"
                            + "</td>"
                        + "</tr>"
                        + "<tr>"
                            + "<td style='padding-left: 20px; padding-right: 20px; padding-bottom: 20px'>"
                                + "<<RESULT>>"
                            + "</td>"
                        + "</tr>"
                    + "</table>";
                let hasSpecialTemplate = "<tr><td style='padding-left: 20px; padding-right: 20px'><b>Specialty:</b> 10 counts as two successes.</td></tr>";
                let successDiceTemplate = "<span style=\"color:green\"><b><<DIE>> </b></span>";
                let botchDiceTemplate = '<img src="http://i.imgur.com/ytXjID6.png" title="BOTCH" height="20" width="10" style="border: none"/> ';
                let oneSuccessResultTemplate = '<span style="color:green"><b>MARGINAL SUCCESS</b></span>';
                let twoSuccessResultTemplate = '<span style="color:green"><b>MODERATE SUCCESS</b></span>';
                let threeSuccessResultTemplate = '<span style="color:green"><b>COMPLETE SUCCESS</b></span>';
                let fourSuccessResultTemplate = '<span style="color:green"><b>EXCEPTIONAL SUCCESS</b></span>';
                let fiveSuccessResultTemplate = '<span style="color:green"><b>PHENOMENAL SUCCESS</b></span>';
                let failureResultTemplate = '<span style="color:red"><b>FAILURE</b></span>';
                let botchResultTemplate = '<img src="http://i.imgur.com/ytXjID6.png" title="BOTCH" height="20" width="10" style="border: none"/><span style="color:red"><b>BOTCH!!!</b></span><img src="http://i.imgur.com/ytXjID6.png" title="BOTCH" height="20" width="10" style="border: none"/>';
			    let hasWillpowerTemplate = '<tr><td style="padding-left: 20px; padding-right: 20px; padding-bottom: 10px"><b>Willpower Used:</b> At least 1 success guaranteed.</td></tr>';
			    
			    let num = html.find('#numberOfDice').val();
                let diff = html.find('[name="difficulty"]:checked').val();
                let spec = html.find('input#specialty')[0].checked;
                let wp = html.find('input#willpower')[0].checked;
                let suc = 0;
                let one = 0;

                if(num) {
                    if(num > 20) num = 20;
                    let r = new Roll(num + "d10");
                    r.evaluate({async:true});
    
                    let tableCreation = tableTemplate;
                    
                    if(game.user.isGM && !token) {
                        tableCreation = tableCreation.replace("<<TITLE>>", "Storyteller ");
                    } else {
                        tableCreation = tableCreation.replace("<<TITLE>>", ChatMessage.getSpeaker().alias + " ");
                    }
                    tableCreation = tableCreation.replace("<<DICENUMBER>>", num);
                    tableCreation = tableCreation.replace("<<DIFFICULTY>>", diff);
    
                    if(spec) {
                        tableCreation = tableCreation.replace("<<HASSPECIALITY>>", hasSpecialTemplate);
                    } else {
                        tableCreation = tableCreation.replace("<<HASSPECIALITY>>", "");
                    }
                    if(wp) {
                        suc = suc + 1;
                        tableCreation = tableCreation.replace("<<HASWILLPOWER>>", hasWillpowerTemplate);
                    } else {
                        tableCreation = tableCreation.replace("<<HASWILLPOWER>>", "");
                    }
                    let strrolls = "";
                    let checked = false;
                    let results = r.dice[0].results;
    
                    results.forEach(i => {
                        checked = false;
                        if(i.result >= diff) {
                            checked = true;
                            suc = suc + 1;
                            strrolls = strrolls + successDiceTemplate.replace("<<DIE>>", i.result);
                        }
                        if(i.result == 1) {
                            checked = true;
                            one = one + 1;
                            strrolls = strrolls + botchDiceTemplate;
                        }
                        if(i.result == 10 && spec) suc = suc + 1;
                        if (!checked) strrolls = strrolls + i.result + ' ';
                    });
    
                    tableCreation = tableCreation.replace("<<DICEROLL>>", strrolls);
    
                    let temp = suc - one;
                    tableCreation = tableCreation.replace("<<GOODROLLS>>", suc);
                    tableCreation = tableCreation.replace("<<ONEROLLS>>", one);
                    tableCreation = tableCreation.replace("<<TOTALROLL>>", temp);
                    
                    // Display results
                    if((suc > one && suc > 0) || wp) { 
                        if(temp == 1 || (wp && temp < 1)) tableCreation = tableCreation.replace("<<RESULT>>", oneSuccessResultTemplate);
                        if(temp == 2) tableCreation = tableCreation.replace("<<RESULT>>", twoSuccessResultTemplate);
                        if(temp == 3) tableCreation = tableCreation.replace("<<RESULT>>", threeSuccessResultTemplate);
                        if(temp == 4) tableCreation = tableCreation.replace("<<RESULT>>", fourSuccessResultTemplate);
                        if(temp > 4) tableCreation = tableCreation.replace("<<RESULT>>", fiveSuccessResultTemplate);
                    } else if(suc < one && suc == 0 && !wp) {
                        tableCreation = tableCreation.replace("<<RESULT>>", botchResultTemplate);
                    } else {
                        tableCreation = tableCreation.replace("<<RESULT>>", failureResultTemplate);
                    }
    
                    let chatOptions = {
                        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                        roll: r,
                        rollMode: html.find('[name="rollMode"]:checked').val(),
                        content: tableCreation,
                        speaker: ChatMessage.getSpeaker()
                    };
                    ChatMessage.create(chatOptions);
                } else {
					return ui.notifications.info("Please enter number of d10.");
                }
			}
		},
		no: {
			icon: "<i class='fas fa-times'></i>",
			label: `Cancel`
		},
	},
	default: "yes",
	render: html => html.find('#numberOfDice').focus()
}).render(true);