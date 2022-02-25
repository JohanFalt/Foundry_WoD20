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

		if ((dataset.noability=="true") || (dataset.rolldamage=="true")) {
			if (dataset.label == "Willpower") {
				if ((dataset.speciality1 != undefined) && (dataset.speciality2 != undefined) && (dataset.speciality1 != "") && (dataset.speciality2 != ""))
				{
					specialityText = dataset.speciality1 + ", " + dataset.speciality2;
				}
				else if ((dataset.speciality1 != undefined) && (dataset.speciality1 != ""))
				{
					specialityText = dataset.speciality1;
				}
				else if ((dataset.speciality2 != undefined) && (dataset.speciality2 != ""))
				{
					specialityText = dataset.speciality2;
				}			
			}
			else {
				specialty = "";
			}
		}
		else { 
			if (actor.data.data.health.damage.woundlevel != "") {
				wounded = `<div class="form-group"><label>${game.i18n.localize("wod.labels.woundlevel")}</label>${game.i18n.localize(actor.data.data.health.damage.woundlevel)} (${actor.data.data.health.damage.woundpenalty})</div>`
			}		
			
			if (dataset.rollitem == "true") {
				if (actor.data.data.attributes[dataset.dice1]?.value != undefined) {
					attributeVal = parseInt(actor.data.data.attributes[dataset.dice1].total);
					attributeName = game.i18n.localize(actor.data.data.attributes[dataset.dice1].label);
				}
				else if (actor.data.data[dataset.dice1]?.roll != undefined) { 
					attributeVal = parseInt(actor.data.data[dataset.dice1].roll);
					attributeName = game.i18n.localize(actor.data.data[dataset.dice1].label);
				}

				if (actor.data.data.abilities.talent[dataset.dice2]?.value != undefined) {
					abilityVal = parseInt(actor.data.data.abilities.talent[dataset.dice2].value);
					abilityName = game.i18n.localize(actor.data.data.abilities.talent[dataset.dice2].label);
				}
				else if (actor.data.data.abilities.skill[dataset.dice2]?.value != undefined) {
					abilityVal = parseInt(actor.data.data.abilities.skill[dataset.dice2].value);
					abilityName = game.i18n.localize(actor.data.data.abilities.skill[dataset.dice2].label);
				}
				else if (actor.data.data.abilities.knowledge[dataset.dice2]?.value != undefined) {
					abilityVal = parseInt(actor.data.data.abilities.knowledge[dataset.dice2].value);
					abilityName = game.i18n.localize(actor.data.data.abilities.knowledge[dataset.dice2].label);
				}	

				if ((attributeVal >= 4) && (abilityVal >= 4)) {
					specialityText = actor.data.data.attributes[dataset.dice1].speciality + ", ";

					if (actor.data.data.abilities.talent[dataset.dice2]?.speciality != undefined) {
						specialityText += actor.data.data.abilities.talent[dataset.dice2]?.speciality;
					}
					else if (actor.data.data.abilities.skill[dataset.dice2]?.speciality != undefined) {
						specialityText += actor.data.data.abilities.skill[dataset.dice2]?.speciality;
					}
					else if (actor.data.data.abilities.knowledge[dataset.dice2]?.speciality != undefined) {
						specialityText += actor.data.data.abilities.knowledge[dataset.dice2]?.speciality;
					}
				}
				else if (attributeVal >= 4) {
					specialityText = actor.data.data.attributes[dataset.dice1].speciality;
				}
				else if (abilityVal >= 4) {
					if (actor.data.data.abilities.talent[dataset.dice2]?.speciality != undefined) {
						specialityText = actor.data.data.abilities.talent[dataset.dice2]?.speciality;
					}
					else if (actor.data.data.abilities.skill[dataset.dice2]?.speciality != undefined) {
						specialityText = actor.data.data.abilities.skill[dataset.dice2]?.speciality;
					}
					else if (actor.data.data.abilities.knowledge[dataset.dice2]?.speciality != undefined) {
						specialityText = actor.data.data.abilities.knowledge[dataset.dice2]?.speciality;
					}
				}

				hiddenForms = `<input type="hidden" id="attributeVal" value="${attributeVal}" />`;
				hiddenForms += `<input type="hidden" id="attributeName" value="${attributeName}" />`;
				hiddenForms += `<input type="hidden" id="abilityVal" value="${abilityVal}" />`;
				hiddenForms += `<input type="hidden" id="abilityName" value="${abilityName}" />`;
				hiddenForms += `<input type="hidden" id="specialityText" value="${specialityText}" />`;
				hiddenForms += `<input type="hidden" id="systemText" value="${dataset?.system || ""}" />`;
			}
			else {
				if (dataset.speciality?.length > 0) {
					specialityText = `<span>(` + dataset.speciality + `)</span>`;
				}
			}
		
			if (dataset.ability == "true") {
				let options1 = "";

				for (const [key, value] of Object.entries(actor.data.data.attributes)) {
					options1 = options1.concat(`<option value="${key}">${game.i18n.localize(value.label)}</option>`);
				}
				
				selectAbility =  `<div class="form-group">
								<label>${game.i18n.localize("wod.labels.selectattribute")}</label>
								<select id="attributeSelect">${options1}</select>
							</div>`;
			}
			else if (dataset.rollitem == "true") {
				difficulty = dataset.diff;
			}
		}

		// set final difficulty
		if (dataset.rolldamage=="true") {
		}
		else {
			for (let i = 3; i <= 10; i++) {
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
					`<div>` + specialty + ` ` + specialityText + `</div>
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
					let woundPenaltyVal = 0;
					let numDice = 0;
					let diceUsed = "";
					let specialityText = "";
					let systemText = "";

					const modifier = parseInt(html.find("#inputMod")[0]?.value || 0);
					let modifierText = "";
					let difficulty = parseInt(html.find("#inputDif:checked")[0]?.value || 0);
					const specialty = html.find("#specialty")[0]?.checked || false;

					if (actor.data.data.conditions.ignorepain) {
						woundPenaltyVal = 0;
					}
					else {
						woundPenaltyVal = actor.data.data.health.damage.woundpenalty;
					}

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
						woundPenaltyVal = 0;
						numDice = parseInt(dataset.roll) + modifier;
						diceUsed = `<h2>${dataset.label}</h2> <strong>${dataset.label} (${dataset.roll}) ${modifierText}</strong>`;

						if ((parseInt(actor.data.data.attributes.composure.value) >= 4) && (parseInt(actor.data.data.attributes.resolve.value) >= 4)) {
							specialityText = actor.data.data.attributes.composure.speciality + ", " + actor.data.data.attributes.resolve.speciality;
						}
						else if (parseInt(actor.data.data.attributes.composure.value) >= 4) {
							specialityText = actor.data.data.attributes.composure.speciality
						}
						else if (parseInt(actor.data.data.attributes.resolve.value) >= 4) {
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

						diceUsed = `<h2>${dataset.label} ${rollType}</h2> <strong>${attributeName} (${attributeVal}) + ${abilityName} (${abilityVal}) ${modifierText}</strong>`;
					}	
					else if (dataset.rolldamage=="true") {
						let bonusVal = parseInt(dataset.dice2);
						let damageCode = game.i18n.localize(CONFIG.wod.damageTypes[dataset.type]);

						woundPenaltyVal = 0;
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

		actorData.data.willpower.roll = actorData.data.willpower.permanent > actorData.data.willpower.temporary ? actorData.data.willpower.temporary : actorData.data.willpower.permanent; 

		console.log("WoD | Mortal Sheet calculations done");
	}

    static handleWouldLevelCalculations(actorData) {
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
}