import { rollDice } from "./roll-dice.js";
import { calculateTotals } from "./totals.js";

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
			if ((dataset.label == "Willpower") && (CONFIG.attributeSettings == "5th")) {
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
			let list;

			if (CONFIG.attributeSettings == "5th") {
				list = CONFIG.wod.attributes;
			}
			else if (CONFIG.attributeSettings == "20th") {
				list = CONFIG.wod.attributes20;
			}

			for (const i in list) {
				if (actor.data.data.attributes[i].value >= 4) {
					options1 = options1.concat(`<option value="${i}">${game.i18n.localize(list[i])} (${actor.data.data.attributes[i].speciality})</option>`);
				}
				else {
					options1 = options1.concat(`<option value="${i}">${game.i18n.localize(list[i])}</option>`);
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
					let handlingOnes = true;

					const modifier = parseInt(html.find("#inputMod")[0]?.value || 0);
					let modifierText = "";
					let difficulty = parseInt(html.find("#inputDif:checked")[0]?.value || 0);
					const specialty = html.find("#specialty")[0]?.checked || false;
					let woundPenaltyVal = parseInt(html.find("#woundPenalty")[0]?.value || 0);

					try {
						handlingOnes = CONFIG.handleOnes;
					} 
					catch (e) {
						handlingOnes = true;
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

						if (actor.data.data.abilities.talent[dataset.label]?.value != undefined) {
							abilityName = game.i18n.localize(actor.data.data.abilities.talent[dataset.label].label);
						}
						else if (actor.data.data.abilities.skill[dataset.label]?.value != undefined) {
							abilityName = game.i18n.localize(actor.data.data.abilities.skill[dataset.label].label);
						}
						else if (actor.data.data.abilities.knowledge[dataset.label]?.value != undefined) {
							abilityName = game.i18n.localize(actor.data.data.abilities.knowledge[dataset.label].label);
						}

						numDice = attributeVal + parseInt(dataset.roll) + modifier;
						diceUsed = `<h2>${abilityName}</h2> <strong>${abilityName} (${dataset.roll}) + ${attributeName} (${attributeVal}) ${modifierText}</strong>`;
					} 
					else if (dataset.attribute == "true") {
						attribute = dataset.label.toLowerCase();
						attributeVal = dataset.roll;
						specialityText = dataset.speciality;
						attributeName = game.i18n.localize(actor.data.data.attributes[attribute].label);
						numDice = parseInt(dataset.roll) + modifier;
						//diceUsed = `<h2>${dataset.label}</h2> <strong>${dataset.label} (${dataset.roll}) ${modifierText}</strong>`;
						diceUsed = `<h2>${attributeName}</h2> <strong>${attributeName} (${dataset.roll}) ${modifierText}</strong>`;
					}
					else if (dataset.noability == "true") {
						//woundPenaltyVal = 0;
						numDice = parseInt(dataset.roll) + modifier;
						diceUsed = `<h2>${dataset.label}</h2> <strong>${dataset.label} (${dataset.roll}) ${modifierText}</strong>`;

						if ((dataset.label == "Willpower") && (CONFIG.attributeSettings == "5th")) {
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
						handlingOnes = false;
						
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
						systemText,
						handlingOnes
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

	static async RollInitiative(event, actor) {
		event.preventDefault();		

		let foundToken = false;
		let foundEncounter = true;
		let tokenAdded = false;
		let rolledInitiative = false;
		let formula = "1d10";
		let init = 0;
		let label = "";
		let message = "";
		let diceColor;

		let token = await canvas.tokens.placeables.find(t => t.data.actorId === actor.id);
		if(token) foundToken = true;

		if (game.combat == null) {
			foundEncounter = false;
	   	}

		let roll = new Roll(formula);		

		roll.evaluate({async:true});
		roll.terms[0].results.forEach((dice) => {
			init += parseInt(dice.result);
		});

		init += parseInt(parseInt(actor.data.data.initiative.total));

		if ((foundToken) && (foundEncounter)) {
			if (!this.inTurn(token)) {
				await token.toggleCombat();

				if (token.combatant.data.initiative == undefined) {      
					await token.combatant.update({initiative: init});
					rolledInitiative = true;
				}
				
				tokenAdded = true;
			}
		}		
			
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
			label += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" class="rolldices" />`;
		});
		
		if (!foundEncounter) {
			message += "<em>No encounter found in Combat Tracker</em>";			
		}
		else {
			if (!foundToken) {
				message += "<em>No Token found in scene</em><br />";				
			}
			else {
				if (!tokenAdded) {
					message += "<em>Character already added to Combat Tracker</em><br />";
					label = "";
					init = "";
				}
				if (!rolledInitiative) {
					message += "<em>" + actor.data.name + " has initiative already</em><br />";
					label = "";
					init = "";
				}
			}
		}

		if (label != "") {
			label = "<br />" + label;
		}
		if (message != "") {
			message = "<br />" + message;
		}

		this.printMessage('', '<h2>Rolling Initiative</h2>' + init + label + message, actor);			
	}

	static RollSoak(event, actor) {
		event.preventDefault();

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
					const damageType = template.find("#damageType:checked")[0]?.value;
					const bonus = parseInt(template.find("#inputMod")[0]?.value);
					const dice = parseInt(actor.data.data.soak[damageType]) + parseInt(bonus);
					let successes = 0;
					let label = "";

					let roll = new Roll(dice + "d10");
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

					this.printMessage('', '<h2>Rolling Soak</h2><strong>' + damageType + '<br />Successes:</strong> ' + successes + '<br />' + label, actor);
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

	static RollDices(event, actor) {
		event.preventDefault();

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
					const numDice = parseInt(template.find("#dices")[0]?.value);
					let difficulty = parseInt(template.find("#inputDif:checked")[0]?.value || 0);
					const specialty = template.find("#specialty")[0]?.checked || false;
					let handlingOnes = true;

					try {
						handlingOnes = game.settings.get('worldofdarkness', 'theRollofOne');
					} 
					catch (e) {
						handlingOnes = true;
					}

					rollDice(
						numDice,
						actor,
						game.i18n.localize("wod.dice.rollingdice"),
						difficulty,
						specialty,
						"",
						0,
						"",
						handlingOnes
					);
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

 	static inTurn(token) {
		for (let count = 0; count < game.combat.combatants.size; count++) {
			if (token.id == game.combat.combatants.contents[count].token.id) {
				return true;
			}
		}
	
		return false;
	}

    static handleCalculations(actorData) {		

		let advantageRollSetting = true;

		try {
			advantageRollSetting = CONFIG.rollSettings;
		} 
		catch (e) {
			advantageRollSetting = true;
		}

		// attributes totals
		actorData = calculateTotals(actorData);

		// willpower
		if (CONFIG.attributeSettings == "5th") {
			actorData.data.willpower.permanent = parseInt(actorData.data.attributes.composure.value) + parseInt(actorData.data.attributes.resolve.value);
		}
		
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
		if (actorData.type == "Werewolf") {
			if ((!actorData.data.shapes.homid.active) &&
				(!actorData.data.shapes.glabro.active) &&
				(!actorData.data.shapes.crinos.active) &&
				(!actorData.data.shapes.hispo.active) &&
				(!actorData.data.shapes.lupus.active)) {
				actorData.data.shapes.homid.active = true;
			}
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
			advantageRollSetting = CONFIG.rollSettings;
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
	

	static _setMortalAbilities(actor) {
		for (const talent in CONFIG.wod.alltalents) {
			if ((actor.data.abilities.talent[talent].label == "wod.abilities.gestures") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.intuition") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.primalurge") ||
					(actor.data.abilities.talent[talent].label == "wod.abilities.seduction") ||
					(actor.data.abilities.talent[talent].label == "wod.abilities.diplomacy")) {
				actor.data.abilities.talent[talent].visible = false;
			}
			else {
				actor.data.abilities.talent[talent].visible = true;
			}			
		}

		for (const skill in CONFIG.wod.allskills) {
			if ((actor.data.abilities.skill[skill].label == "wod.abilities.pilot") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.meditation") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.archery")) {
				actor.data.abilities.skill[skill].visible = false;
			}
			else {
				actor.data.abilities.skill[skill].visible = true;
			}			
		}

		for (const knowledge in CONFIG.wod.allknowledges) {
			if ((actor.data.abilities.knowledge[knowledge].label == "wod.abilities.culture") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.cosmology") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.hearthwisdom") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.herbalism") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.legends") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.rituals")) {
				actor.data.abilities.knowledge[knowledge].visible = false;
			}
			else {
				actor.data.abilities.knowledge[knowledge].visible = true;
			}		
		}
	}


	static _setWerewolfAbilities(actor) {		
		for (const talent in CONFIG.wod.alltalents) {
			if ((actor.data.abilities.talent[talent].label == "wod.abilities.art") ||	
					(actor.data.abilities.talent[talent].label == "wod.abilities.diplomacy") ||	
					(actor.data.abilities.talent[talent].label == "wod.abilities.gestures") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.intuition") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.seduction")) {
				actor.data.abilities.talent[talent].visible = false;
			}
			else {
				actor.data.abilities.talent[talent].visible = true;
			}			
		}

		for (const skill in CONFIG.wod.allskills) {
			if ((actor.data.abilities.skill[skill].label == "wod.abilities.archery") ||
			(actor.data.abilities.skill[skill].label == "wod.abilities.meditation") ||
					(actor.data.abilities.skill[skill].label == "wod.abilities.pilot")) {
				actor.data.abilities.skill[skill].visible = false;
			}
			else {
				actor.data.abilities.skill[skill].visible = true;
			}			
		}

		for (const knowledge in CONFIG.wod.allknowledges) {
			if ((actor.data.abilities.knowledge[knowledge].label == "wod.abilities.bureaucracy") ||
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.cosmology") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.culture") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.finance") ||
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.hearthwisdom") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.herbalism") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.legends") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.politics")) {
				actor.data.abilities.knowledge[knowledge].visible = false;
			}
			else {
				actor.data.abilities.knowledge[knowledge].visible = true;
			}		
		}
	}


	static _setVampireAbilities(actor) {
		for (const talent in CONFIG.wod.alltalents) {
			if ((actor.data.abilities.talent[talent].label == "wod.abilities.gestures") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.intuition") || 
					(actor.data.abilities.talent[talent].label == "wod.abilities.primalurge") ||
					(actor.data.abilities.talent[talent].label == "wod.abilities.seduction") ||
					(actor.data.abilities.talent[talent].label == "wod.abilities.diplomacy")) {
				actor.data.abilities.talent[talent].visible = false;
			}
			else {
				actor.data.abilities.talent[talent].visible = true;
			}			
		}

		for (const skill in CONFIG.wod.allskills) {
			if ((actor.data.abilities.skill[skill].label == "wod.abilities.pilot") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.meditation") || 
					(actor.data.abilities.skill[skill].label == "wod.abilities.archery")) {
				actor.data.abilities.skill[skill].visible = false;
			}
			else {
				actor.data.abilities.skill[skill].visible = true;
			}			
		}

		for (const knowledge in CONFIG.wod.allknowledges) {
			if ((actor.data.abilities.knowledge[knowledge].label == "wod.abilities.culture") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.cosmology") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.hearthwisdom") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.herbalism") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.legends") || 
					(actor.data.abilities.knowledge[knowledge].label == "wod.abilities.rituals")) {
				actor.data.abilities.knowledge[knowledge].visible = false;
			}
			else {
				actor.data.abilities.knowledge[knowledge].visible = true;
			}		
		}
	}


	static _setCreatureAbilities(actor) {
		for (const talent in CONFIG.wod.alltalents) {
			actor.data.abilities.talent[talent].visible = false;
		}

		for (const skill in CONFIG.wod.allskills) {
			actor.data.abilities.skill[skill].visible = false;
		}

		for (const knowledge in CONFIG.wod.allknowledges) {
			actor.data.abilities.knowledge[knowledge].visible = false;
		}		
	}

	
	static _setMortalAttributes(actor) {

		let rage = -1;
		let gnosis = -1;
		let willpower = -1;

		if ((actor.type == "Mortal") || (actor.type == "Werewolf") || (actor.type == "Creature")) {
			for (const attribute in actor.data.attributes) {
				actor.data.attributes[attribute].visible = true;
			}

			if (CONFIG.attributeSettings == "20th") {
				actor.data.attributes.composure.visible = false;
				actor.data.attributes.resolve.visible = false;
				actor.data.willpower.permanent = 0;
			}
			else if (CONFIG.attributeSettings == "5th") {
				actor.data.attributes.appearance.visible = false;
				actor.data.attributes.perception.visible = false;
				actor.data.willpower.permanent = 2;
			}
	  
			if (CONFIG.rollSettings) {
			  if (actor.type != "Mortal") {
				rage = actor.data.rage.permanent; 
				gnosis = actor.data.gnosis.permanent;
			  }
			  
			  willpower = actor.data.willpower.permanent; 
			}
			else {
			  if (actor.type != "Mortal") {
				rage = actor.data.rage.permanent > actor.data.rage.temporary ? actor.data.rage.temporary : actor.data.rage.permanent; 
				gnosis = actor.data.gnosis.permanent > actor.data.gnosis.temporary ? actor.data.gnosis.temporary : actor.data.gnosis.permanent;
			  }
			  
			  willpower = actor.data.willpower.permanent > actor.data.willpower.temporary ? actor.data.willpower.temporary : actor.data.willpower.permanent; 
			}
	  
			if (actor.type != "Mortal") {
				actor.data.rage.roll = rage;
				actor.data.gnosis.roll = gnosis;
			}
	  
			actor.data.willpower.roll = willpower;
		  }
	}
}