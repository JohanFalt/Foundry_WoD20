import { rollDice } from "../scripts/roll-dice.js";
import { calculateTotals } from "../scripts/totals.js";

export default class ActionHelper {
    static RollDialog(event, actor) {
        console.log("WoD | Mortal Sheet _onRollDialog");
	
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;    

		let hiddenForms = "";

		let attributeVal = 0;
		let attributeName = "";
		let abilityVal = 0;
		let abilityName = "";
		
		let wounded = "";
		let specialty = `<input id="specialty" type="checkbox">${game.i18n.localize("wod.labels.specialty")}</input>`;
		let selectAbility = "";
		let difficulty = 6;
		let selector = "";
		let template = "";
		let specialityText = "";

		let woundPenaltyVal = 0;

		// specialityText
		if (dataset.noability=="true") {
			if (dataset.label == "Willpower") {
				if ((actor.data.data.attributes.composure.value >= 4) &&
						(actor.data.data.attributes.composure.speciality != "")) {
					specialityText = actor.data.data.attributes.composure.speciality;
				}

				if ((actor.data.data.attributes.resolve.value >= 4) &&
						(actor.data.data.attributes.resolve.speciality != "")) {
					specialityText = specialityText != "" ? specialityText + ", " + actor.data.data.attributes.resolve.speciality : actor.data.data.attributes.resolve.speciality;
				}
			}
			// hide speciallity box
			else {
				specialty = "";
			}
		}
		else if (dataset.attribute == "true") {
			if (actor.data.data.attributes[dataset.label].value >= 4) {
				specialityText = actor.data.data.attributes[dataset.label].speciality;
			}
		}
		else if (dataset.ability == "true") {
			if (actor.data.data.abilities.talent[dataset.label]?.value != undefined) {
				specialityText = actor.data.data.abilities.talent[dataset.label].speciality;
			}
			else if (actor.data.data.abilities.skill[dataset.label]?.value != undefined) {
				specialityText = actor.data.data.abilities.skill[dataset.label].speciality;
			}
			else if (actor.data.data.abilities.knowledge[dataset.label]?.value != undefined) {
				specialityText = actor.data.data.abilities.knowledge[dataset.label].speciality;
			}	

			let options1 = "";

			for (const i in CONFIG.wod.attributes) {
				if (actor.data.data.attributes[i].value >= 4) {
					options1 = options1.concat(`<option value="${i}">${game.i18n.localize(CONFIG.wod.attributes[i])} (${actor.data.data.attributes[i].speciality})</option>`);
				}
				else {
					options1 = options1.concat(`<option value="${i}">${game.i18n.localize(CONFIG.wod.attributes[i])}</option>`);
				}				
			}
				
			selectAbility =  `<div class="form-group">
									<label>${game.i18n.localize("wod.labels.selectattribute")}</label>
									<select id="attributeSelect">${options1}</select>
								</div>`;
		}

		// items
		if (dataset.rollitem == "true") {
			let specText1 = "";
			let specText2 = "";

			difficulty = dataset.diff;

			// is dice1 an Attribute
			if (actor.data.data.attributes[dataset.dice1]?.value != undefined) {
				attributeVal = parseInt(actor.data.data.attributes[dataset.dice1].total);
				attributeName = game.i18n.localize(actor.data.data.attributes[dataset.dice1].label);
			}
			// is dice1 an Advantage
			else if (actor.data.data[dataset.dice1]?.roll != undefined) { 
				attributeVal = parseInt(actor.data.data[dataset.dice1].roll);
				attributeName = game.i18n.localize(actor.data.data[dataset.dice1].label);
			}

			// is dice2 a Talent
			if (actor.data.data.abilities.talent[dataset.dice2]?.value != undefined) {
				abilityVal = parseInt(actor.data.data.abilities.talent[dataset.dice2].value);
				abilityName = game.i18n.localize(actor.data.data.abilities.talent[dataset.dice2].label);
			}
			// is dice2 a Skill
			else if (actor.data.data.abilities.skill[dataset.dice2]?.value != undefined) {
				abilityVal = parseInt(actor.data.data.abilities.skill[dataset.dice2].value);
				abilityName = game.i18n.localize(actor.data.data.abilities.skill[dataset.dice2].label);
			}
			// is dice2 a Knowledge
			else if (actor.data.data.abilities.knowledge[dataset.dice2]?.value != undefined) {
				abilityVal = parseInt(actor.data.data.abilities.knowledge[dataset.dice2].value);
				abilityName = game.i18n.localize(actor.data.data.abilities.knowledge[dataset.dice2].label);
			}	

			// if ((attributeVal >= 4) && (abilityVal >= 4)) {
			// 	if (actor.data.data.attributes[dataset.dice1]?.speciality != undefined) {
			// 		specialityText = actor.data.data.attributes[dataset.dice1].speciality + ", ";
			// 	}

			// 	if (actor.data.data.abilities.talent[dataset.dice2]?.speciality != undefined) {
			// 		specialityText += actor.data.data.abilities.talent[dataset.dice2].speciality;
			// 	}
			// 	else if (actor.data.data.abilities.skill[dataset.dice2]?.speciality != undefined) {
			// 		specialityText += actor.data.data.abilities.skill[dataset.dice2].speciality;
			// 	}
			// 	else if (actor.data.data.abilities.knowledge[dataset.dice2]?.speciality != undefined) {
			// 		specialityText += actor.data.data.abilities.knowledge[dataset.dice2].speciality;
			// 	}
			// }
			// else if (attributeVal >= 4) {
			// 	if (actor.data.data.attributes[dataset.dice1]?.speciality != undefined) {
			// 		specialityText = actor.data.data.attributes[dataset.dice1].speciality;
			// 	}
			// }
			// else if (abilityVal >= 4) {
			// 	if (actor.data.data.abilities.talent[dataset.dice2]?.speciality != undefined) {
			// 		specialityText = actor.data.data.abilities.talent[dataset.dice2].speciality;
			// 	}
			// 	else if (actor.data.data.abilities.skill[dataset.dice2]?.speciality != undefined) {
			// 		specialityText = actor.data.data.abilities.skill[dataset.dice2].speciality;
			// 	}
			// 	else if (actor.data.data.abilities.knowledge[dataset.dice2]?.speciality != undefined) {
			// 		specialityText = actor.data.data.abilities.knowledge[dataset.dice2].speciality;
			// 	}
			// }

			if (attributeVal >= 4) {
				if (actor.data.data.attributes[dataset.dice1]?.speciality != undefined) {
					specText1 = actor.data.data.attributes[dataset.dice1].speciality;
				}
			}
			
			if (abilityVal >= 4) {
				if (actor.data.data.abilities.talent[dataset.dice2]?.speciality != undefined) {
					specText2 = actor.data.data.abilities.talent[dataset.dice2].speciality;
				}
				else if (actor.data.data.abilities.skill[dataset.dice2]?.speciality != undefined) {
					specText2 = actor.data.data.abilities.skill[dataset.dice2].speciality;
				}
				else if (actor.data.data.abilities.knowledge[dataset.dice2]?.speciality != undefined) {
					specText2 = actor.data.data.abilities.knowledge[dataset.dice2].speciality;
				}
			}

			if ((specText1 != "") && (specText2 != "")) {
				specialityText = specText1 + ', ' + specText2;
			}
			else if (specText1 != "") {
				specialityText = specText1;
			}
			else if (specText2 != "") {
				specialityText = specText2;
			}

			hiddenForms += `<input type="hidden" id="attributeVal" value="${attributeVal}" />`;
			hiddenForms += `<input type="hidden" id="attributeName" value="${attributeName}" />`;
			hiddenForms += `<input type="hidden" id="abilityVal" value="${abilityVal}" />`;
			hiddenForms += `<input type="hidden" id="abilityName" value="${abilityName}" />`;
			hiddenForms += `<input type="hidden" id="specialityText" value="${specialityText}" />`;
			hiddenForms += `<input type="hidden" id="systemText" value="${dataset?.system || ""}" />`;
		}
		
		// damage
		if (actor.data.data.health.damage.woundlevel != "") {
			if (this._ignoresPain(actor)) {
				woundPenaltyVal = 0;			}				
			else {
				woundPenaltyVal = actor.data.data.health.damage.woundpenalty;
			}

			wounded = `<div class="form-group"><label>${game.i18n.localize("wod.labels.woundlevel")}</label>${game.i18n.localize(actor.data.data.health.damage.woundlevel)} (${woundPenaltyVal})</div>`

			if ((dataset.noability == "true") || (dataset.rolldamage == "true")) {
				woundPenaltyVal = 0;
				wounded = "";
			}

			hiddenForms += `<input type="hidden" id="woundPenalty" value="${woundPenaltyVal}" />`;				
		}

		// set final difficulty
		if (dataset.rolldamage !="true") {
			for (let i = 2; i <= 10; i++) {
				if (i == difficulty) {
					selector += `<input type="radio" id="inputDif" name="inputDif" value="${i}" checked>${i}</input>`;
				}
				else {
					selector += `<input type="radio" id="inputDif" name="inputDif" value="${i}">${i}</input>`;
				}
			}
		}

		if (dataset.noability=="true") {
			template = `
				<form>
					<div class="form-group">
						<label>${game.i18n.localize("wod.labels.modifier")}</label>
						<input type="text" id="inputMod" value="0">
					</div>  
					<div class="form-group">
						<label>${game.i18n.localize("wod.labels.difficulty")}</label>
						`
						+ selector + 
						`
					</div>
					` + specialty + ` ` + specialityText + `</div>
				</form>`;
		} 
		else if (dataset.rolldamage=="true") {
			template = `
				<form>
					<div class="form-group">
						<label>${game.i18n.localize("wod.labels.modifier")}</label>
						<input type="text" id="inputMod" value="0">
					</div> 
				</form>`;
		}
		else {
			template = `
				<form>
					`
					+ hiddenForms + selectAbility + 
					`
					<div class="form-group">
						<label>${game.i18n.localize("wod.labels.modifier")}</label>
						<input type="text" id="inputMod" value="0">
					</div>  
					<div class="form-group">
						<label>${game.i18n.localize("wod.labels.difficulty")}</label>
						`
						+ selector + 
						`
					</div>
					` + wounded + 
					`<div>` + specialty + ` <span id="specialityText">` + specialityText + `</span></div>
				</form>`;
		}		

		let buttons = {};
		buttons = {
      
			draw: {
				icon: '<i class="fas fa-check"></i>',
				label: game.i18n.localize("wod.dice.roll"),
				callback: async (html) => {
					let attribute = "";
					let attributeVal = 0;
					let attributeName = "";
					let abilityVal = 0;
					let abilityName = "";					
					let numDice = 0;
					let diceUsed = "";
					let specialityText = "";
					let systemText = "";

					const modifier = parseInt(html.find("#inputMod")[0]?.value || 0);
					let modifierText = "";
					let difficulty = parseInt(html.find("#inputDif:checked")[0]?.value || 0);
					const specialty = html.find("#specialty")[0]?.checked || false;
					let woundPenaltyVal = parseInt(html.find("#woundPenalty")[0]?.value || 0);

					if (modifier > 0) {
						modifierText = `+${modifier}`;
					}
					else if (modifier < 0) {
						modifierText = `${modifier}`;
					}

					if (dataset.ability == "true") {
						attribute = html.find("#attributeSelect")[0]?.value;
						attributeVal = parseInt(actor.data.data.attributes[attribute].total);

						if ((attributeVal >= 4) && (parseInt(dataset.roll) >= 4)) {
							specialityText = actor.data.data.attributes[attribute].speciality + ", " + dataset.speciality;
						}
						else if (attributeVal >= 4) {
							specialityText = actor.data.data.attributes[attribute].speciality;
						}
						else if (parseInt(dataset.roll) >= 4) {
							specialityText = dataset.speciality;
						}
						
						attributeName = game.i18n.localize(actor.data.data.attributes[attribute].label);
						numDice = attributeVal + parseInt(dataset.roll) + modifier;
						diceUsed = `<h2>${dataset.label}</h2> <strong>${dataset.label} (${dataset.roll}) + ${attributeName} (${attributeVal}) ${modifierText}</strong>`;
					} 
					else if (dataset.attribute == "true") {
						attribute = dataset.label.toLowerCase();
						attributeVal = dataset.roll;
						specialityText = dataset.speciality;
						attributeName = "";
						numDice = parseInt(dataset.roll) + modifier;
						diceUsed = `<h2>${dataset.label}</h2> <strong>${dataset.label} (${dataset.roll}) ${modifierText}</strong>`;
					}
					else if (dataset.noability == "true") {
						//woundPenaltyVal = 0;
						numDice = parseInt(dataset.roll) + modifier;
						diceUsed = `<h2>${dataset.label}</h2> <strong>${dataset.label} (${dataset.roll}) ${modifierText}</strong>`;

						if ((parseInt(actor.data.data.attributes?.composure.value) >= 4) && (parseInt(actor.data.data.attributes?.resolve.value) >= 4)) {
							specialityText = actor.data.data.attributes.composure.speciality + ", " + actor.data.data.attributes.resolve.speciality;
						}
						else if (parseInt(actor.data.data.attributes?.composure.value) >= 4) {
							specialityText = actor.data.data.attributes.composure.speciality
						}
						else if (parseInt(actor.data.data.attributes?.resolve.value) >= 4) {
							specialityText = actor.data.data.attributes.resolve.speciality;
						}
					}
					else if (dataset.rollitem == "true") {
						attributeVal = parseInt(html.find("#attributeVal")[0]?.value || 0);
						attributeName = html.find("#attributeName")[0]?.value || "";

						abilityVal = parseInt(html.find("#abilityVal")[0]?.value || 0);
						abilityName = html.find("#abilityName")[0]?.value || "";

						specialityText = html.find("#specialityText")[0]?.value || "";

						systemText = html.find("#systemText")[0]?.value || "";
						
						numDice = attributeVal + abilityVal + modifier;

						const rollType = (dataset.type == "attack") ? "(attack)" : "";

						diceUsed = `<h2>${dataset.label} ${rollType}</h2> <strong>${attributeName} (${attributeVal})`;

						if (abilityName != "") {
							diceUsed += ` + ${abilityName} (${abilityVal})`;
						}

						diceUsed += ` ${modifierText}</strong>`;
					}	
					else if (dataset.rolldamage=="true") {
						let bonusVal = parseInt(dataset.dice2);
						let damageCode = game.i18n.localize(CONFIG.wod.damageTypes[dataset.type]);

						//woundPenaltyVal = 0;
						difficulty = 6;
						attributeVal = parseInt(actor.data.data.attributes[dataset.dice1]?.total || 0);
						attributeName = game.i18n.localize(actor.data.data.attributes[dataset.dice1]?.label || "");
						numDice = attributeVal + bonusVal + modifier;
						
						if (attributeVal > 0) {
							diceUsed = `<h2>${dataset.label} (damage)</h2> <strong>${attributeName} (${attributeVal}) + ${bonusVal} ${modifierText}<br />${damageCode}</strong>`;
						}
						else {
							diceUsed = `<h2>${dataset.label} (damage)</h2> <strong>${bonusVal} ${modifierText}<br />${damageCode}</strong>`;
						}
					}	
					
					rollDice(
						numDice,
						actor,
						diceUsed,
						difficulty,
						specialty,
						specialityText,
						woundPenaltyVal,
						systemText
					);
				},
			},
			cancel: {
				icon: '<i class="fas fa-times"></i>',
				label: game.i18n.localize("wod.labels.cancel"),
			},
		};

		new Dialog({      
			title: game.i18n.localize("wod.labels.rolling") + ` ${dataset.label}...`,
			content: template,
			buttons: buttons,
			default: "draw",
		}).render(true);
    }

    static handleCalculations(actorData) {		

		let advantageRollSetting = true;

		try {
			advantageRollSetting = game.settings.get('worldofdarkness', 'advantageRolls');
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		// attributes totals
		actorData = calculateTotals(actorData);

		// willpower
		actorData.data.willpower.permanent = parseInt(actorData.data.attributes.composure.value) + parseInt(actorData.data.attributes.resolve.value);
		
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

	static handleWerewolfCalculations(actorData) {
		console.log("WoD | Werewolf handleWerewolfCalculations");		

		// shift
		if ((!actorData.data.shapes.homid.active) &&
			(!actorData.data.shapes.glabro.active) &&
			(!actorData.data.shapes.crinos.active) &&
			(!actorData.data.shapes.hispo.active) &&
			(!actorData.data.shapes.lupus.active)) {
			actorData.data.shapes.homid.active = true;
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

		let advantageRollSetting = true;

		try {
			advantageRollSetting = game.settings.get('worldofdarkness', 'advantageRolls');
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

		console.log("WoD | Werewolf Sheet calculations done");
	}	

	static printMessage(headline, message, actor){
		/*let chatData = {
			user : game.user._id,
			content : message,
			blind: true,
			whisper : ChatMessage.getWhisperRecipients("GM")
		};

		ChatMessage.create(chatData,{});    */

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

		if (actor.data.data.conditions?.ignorepain)
		{
			ignoresPain = true;
		}

		if (actor.data.data.conditions?.frenzy)
		{
			ignoresPain = true;
		}

		return ignoresPain;
	}

	static _changeAttributeSelect(actor) {
		let attributeSepcText = "";
		let abilitySpecText = html.find("#abilitySpecialityText")[0]?.value || "";

		let attribute = html.find("#attributeSelect")[0]?.value;

		if (attribute >= 4) {
			attributeSepcText = actor.data.data.attributes[attribute].speciality;
		}
	}
}