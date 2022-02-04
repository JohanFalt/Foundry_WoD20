import { rollDice } from "../scripts/roll-dice.js";
import { calculateHealth } from "../scripts/health.js";
import { calculateTotals } from "../scripts/totals.js";

export class MortalActorSheet extends ActorSheet {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["mortal"],
			template: "systems/worldofdarkness/templates/actor/mortal-sheet.html",
			height: 700,
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "core",
			}],
		});
	}
  
	constructor(actor, options) {
		super(actor, options);

		console.log("WoD | Mortal Sheet constructor");

		this.locked = true;
		this.isCharacter = true;		
	}	
	
	/** @override */
	get template() {
		console.log("WoD | Mortal Sheet get template");
		
		//if (!game.user.isGM && this.actor.limited)
		//	return "systems/worldofdarkness/templates/actor/limited-sheet.html";
		return "systems/worldofdarkness/templates/actor/mortal-sheet.html";
	}
	
	/** @override */
	getData() {
		const data = super.getData();

		console.log("WoD | Mortal Sheet getData");

		data.config = CONFIG.wod;		
		data.locked = this.locked;
		data.isCharacter = this.isCharacter;

		data.dtypes = ["String", "Number", "Boolean"];

		const mods = [];
		const diffs = [];

		for (const i in data.config.attributes) {
			const mod = {"type": data.config.attributes[i], "value": 0};
			mods.push(mod);

			const diff = {"type": data.config.attributes[i], "value": 0};
			diffs.push(diff);
		}

		// Organize actor items
		const naturalWeapons = [];
		const meleeWeapons = [];
		const rangedWeapons = [];
		const armors = [];

		for (const i of data.items) {
			if (i.data.label == "wod.types.meleeweapon" && i.data.natural) {
				naturalWeapons.push(i);
			}
			if (i.data.label == "wod.types.meleeweapon" && !i.data.natural) {
				meleeWeapons.push(i);
			}
			if (i.data.label == "wod.types.rangedweapon") {
				rangedWeapons.push(i);
			}
			if (i.data.label == "wod.types.armor") {
				armors.push(i);
			}
		}		

		data.actor.mods = mods;
		data.actor.diffs = diffs;

		data.actor.health = calculateHealth(data.actor);

		data.actor.naturalWeapons = naturalWeapons;
		data.actor.meleeWeapons = meleeWeapons;
		data.actor.rangedWeapons = rangedWeapons;	
		data.actor.armors = armors;	
		
		//console.log(data.actor);

		return data;
	}	

	/** @override */
	activateListeners(html) {
		console.log("WoD | Mortal Sheet activateListeners");
	  
		super.activateListeners(html);
		this._setupDotCounters(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;
		
		// lock button
		html
			.find(".lock-btn")
			.click(this._onToggleLocked.bind(this));

		// ressource dots
		html
		  .find(".resource-value > .resource-value-step")
		  .click(this._onDotCounterChange.bind(this));
		html
		  .find(".resource-value > .resource-value-empty")
		  .click(this._onDotCounterEmpty.bind(this));

		// temporary squares
		html
		  .find(".resource-counter > .resource-value-step")
		  .click(this._onDotCounterChange.bind(this));
		html
		  .find(".resource-counter > .resource-value-empty")
		  .click(this._onDotCounterEmpty.bind(this));

		// health
		html
			.find(".health > .resource-counter > .resource-value-step")
			.click(this._onSquareCounterChange.bind(this));
		html
			.find(".health > .resource-counter > .resource-value-step")
			.on('contextmenu', this._onSquareCounterClear.bind(this));

		// Rollable stuff
		html
		  .find(".vrollable")
		  .click(this._onRollDialog.bind(this));

		// items
		html
			.find(".item-create")
			.click(this._onItemCreate.bind(this));

		html
			.find(".item-delete")
			.click(this._onItemDelete.bind(this));
	}
	
	_onRollDialog(event) {		
		console.log("WoD | Mortal Sheet _onRollDialog");
	
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;    
		
		let wounded = "";
		let specialty = `<input id="specialty" type="checkbox">${game.i18n.localize("wod.labels.specialty")}</input>`;
		let selectAbility = "";
		let difficulty = 6;
		let selector = "";
		let template = "";

		// show wounded, selectAbility
		if ((dataset.noability=="true") || (dataset.rolldamage=="true")) {
		}
		else { 
			if (this.actor.data.data.health.damage.woundlevel != "") {
				wounded = `<div class="form-group"><label>${game.i18n.localize("wod.labels.selectwound")}</label>${game.i18n.localize(this.actor.data.data.health.damage.woundlevel)} (${this.actor.data.data.health.damage.woundpenalty})</div>`
			}			
		
			if (dataset.ability == "true") {
				let options1 = "";

				for (const [key, value] of Object.entries(this.actor.data.data.attributes)) {
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
					` + specialty +`
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
					+ selectAbility + 
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
					` + wounded + specialty +`
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

					const modifier = parseInt(html.find("#inputMod")[0]?.value || 0);
					let modifierText = "";
					let difficulty = parseInt(html.find("#inputDif:checked")[0]?.value || 0);
					const specialty = html.find("#specialty")[0]?.checked || false;

					if (this.actor.data.data.conditions.ignorepain) {
						woundPenaltyVal = 0;
					}
					else {
						woundPenaltyVal = this.actor.data.data.health.damage.woundpenalty;
					}

					if (modifier > 0) {
						modifierText = `+${modifier}`;
					}
					else if (modifier < 0) {
						modifierText = `${modifier}`;
					}

					if (dataset.ability == "true") {
						attribute = html.find("#attributeSelect")[0]?.value;
						attributeVal = parseInt(this.actor.data.data.attributes[attribute].total);
						
						attributeName = game.i18n.localize(this.actor.data.data.attributes[attribute].label);
						numDice = attributeVal + parseInt(dataset.roll) + modifier;
						diceUsed = `${dataset.label} (${dataset.roll}) + ${attributeName} (${attributeVal}) ${modifierText}`;
					} 
					else if (dataset.attribute == "true") {
						attribute = dataset.label.toLowerCase();
						attributeVal = dataset.roll;
						attributeName = "";
						numDice = parseInt(dataset.roll) + modifier;
						diceUsed = `${dataset.label} (${dataset.roll}) ${modifierText}`;
					}
					else if (dataset.noability == "true") {
						woundPenaltyVal = 0;
						numDice = parseInt(dataset.roll) + modifier;
						diceUsed = `${dataset.label} (${dataset.roll}) ${modifierText}`;
					}
					else if (dataset.rollitem == "true") {

						if (this.actor.data.data.attributes[dataset.dice1]?.value != undefined) {
							attributeVal = parseInt(this.actor.data.data.attributes[dataset.dice1].total);
							attributeName = game.i18n.localize(this.actor.data.data.attributes[dataset.dice1].label);
						}
						else if (this.actor.data.data[dataset.dice1]?.roll != undefined) { 
							attributeVal = parseInt(this.actor.data.data[dataset.dice1].roll);
							attributeName = game.i18n.localize(this.actor.data.data[dataset.dice1].label);
						}

						if (this.actor.data.data.abilities.talent[dataset.dice2]?.value != undefined) {
							abilityVal = parseInt(this.actor.data.data.abilities.talent[dataset.dice2].value);
							abilityName = game.i18n.localize(this.actor.data.data.abilities.talent[dataset.dice2].label);
						}
						else if (this.actor.data.data.abilities.skill[dataset.dice2]?.value != undefined) {
							abilityVal = parseInt(this.actor.data.data.abilities.skill[dataset.dice2].value);
							abilityName = game.i18n.localize(this.actor.data.data.abilities.skill[dataset.dice2].label);
						}
						else if (this.actor.data.data.abilities.knowledge[dataset.dice2]?.value != undefined) {
							abilityVal = parseInt(this.actor.data.data.abilities.knowledge[dataset.dice2].value);
							abilityName = game.i18n.localize(this.actor.data.data.abilities.knowledge[dataset.dice2].label);
						}		
						
						numDice = attributeVal + abilityVal + modifier;
						diceUsed = `${dataset.label}<br />${attributeName} (${attributeVal}) + ${abilityName} (${abilityVal}) ${modifierText}`;
					}	
					else if (dataset.rolldamage=="true") {
						let bonusVal = parseInt(dataset.dice2);
						let damageCode = game.i18n.localize(CONFIG.wod.damageTypes[dataset.type]);

						woundPenaltyVal = 0;
						difficulty = 6;
						attributeVal = parseInt(this.actor.data.data.attributes[dataset.dice1]?.total || 0);
						attributeName = game.i18n.localize(this.actor.data.data.attributes[dataset.dice1]?.label || "");
						numDice = attributeVal + bonusVal + modifier;
						
						if (attributeVal > 0) {
							diceUsed = `${dataset.label}<br />${attributeName} (${attributeVal}) + ${bonusVal} ${modifierText}<br />${damageCode}`;
						}
						else {
							diceUsed = `${dataset.label}<br />${bonusVal} ${modifierText}<br />${damageCode}`;
						}
					}	
					
					rollDice(
						numDice,
						this.actor,
						diceUsed,
						difficulty,
						specialty,
						woundPenaltyVal
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

	_onToggleLocked(event) {
		console.log("WoD | Mortal Sheet _onToggleLocked");
		
		event.preventDefault();
		this.locked = !this.locked;
		this._render();
	}

	_setupDotCounters(html) {
		html.find(".resource-value").each(function () {
			const value = Number(this.dataset.value);
			$(this)
				.find(".resource-value-step")
				.each(function (i) {
					if (i + 1 <= value) {
						$(this).addClass("active");
					}
				});
		});
		
		html.find(".resource-value-static").each(function () {
			const value = Number(this.dataset.value);
			$(this)
				.find(".resource-value-static-step")
				.each(function (i) {
					if (i + 1 <= value) {
						$(this).addClass("active");
					}
				});
		});
	}
  
	_onDotCounterChange(event) {
		console.log("WoD | Mortal Sheet _onDotCounterChange");
		
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
		const index = Number(dataset.index);
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-step");

		if ((this.locked) && (fieldStrings != "data.data.willpower.temporary")) {
			console.log("WoD | Sheet locked aborts");
			return;
		}
		if (fieldStrings == "data.data.willpower.permanent") {
			console.log("WoD | Sheet click on permanent willpower aborts");			
			return;
		}

		if (index < 0 || index > steps.length) {
			return;
		}

		steps.removeClass("active");

		steps.each(function (i) {
			if (i <= index) {
				$(this).addClass("active");
			}
		});

		this._assignToActorField(fields, index + 1);
	}

	_onDotCounterEmpty(event) {
		console.log("WoD | Mortal Sheet _onDotCounterEmpty");
		
		event.preventDefault();

		const element = event.currentTarget;
		const parent = $(element.parentNode);
		const fieldStrings = parent[0].dataset.name;
		const fields = fieldStrings.split(".");
		const steps = parent.find(".resource-value-empty");
		
		if (this.locked) {
			console.log("WoD | Sheet locked aborts");
			return;
		}

		steps.removeClass("active");
		
		steps.each(function (i) {
			if (i <= 0) {
				$(this).addClass("active");
			}
		});
		
		this._assignToActorField(fields, 0);
	}

	
	_onSquareCounterChange(event) {
		console.log("WoD | Update Health Levels");

		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const states = parseCounterStates("/:bashing,x:lethal,*:aggravated");

		const allStates = ["", ...Object.keys(states)];
		const currentState = allStates.indexOf(oldState);
		
		if (currentState < 0) {
			return;
		}
		
		const actorData = duplicate(this.actor);

		if (oldState == "") {
			actorData.data.health.damage.bashing = parseInt(actorData.data.health.damage.bashing) + 1;
		}
		else if (oldState == "/") { 
			actorData.data.health.damage.bashing = parseInt(actorData.data.health.damage.bashing) - 1;
			actorData.data.health.damage.lethal = parseInt(actorData.data.health.damage.lethal) + 1;			
		}
		else if (oldState == "x") { 
			actorData.data.health.damage.lethal = parseInt(actorData.data.health.damage.lethal) - 1;
			actorData.data.health.damage.aggravated = parseInt(actorData.data.health.damage.aggravated) + 1;
		}
		else if (oldState == "*") { 
			actorData.data.health.damage.aggravated = parseInt(actorData.data.health.damage.aggravated) - 1;
		}

		if (parseInt(actorData.data.health.damage.bashing) < 0) {
			parseInt(actorData.data.health.damage.bashing) = 0;
		}

		if (parseInt(actorData.data.health.damage.lethal) < 0) {
			parseInt(actorData.data.health.damage.lethal) = 0;
		}

		if (parseInt(actorData.data.health.damage.aggravated) < 0) {
			parseInt(actorData.data.health.damage.aggravated) = 0;
		}

		this.handleCalculations(actorData);
		this.handleWouldLevelCalculations(actorData);

		this.actor.update(actorData);
	}

	_onSquareCounterClear(event) {
		console.log("WoD | Clear Health Level");

		event.preventDefault();

		const element = event.currentTarget;
		const oldState = element.dataset.state || "";
		const actorData = duplicate(this.actor);

		if (oldState == "") {
			return
		}
		else if (oldState == "/") { 
			actorData.data.health.damage.bashing = parseInt(actorData.data.health.damage.bashing) - 1;
		}
		else if (oldState == "x") { 
			actorData.data.health.damage.lethal = parseInt(actorData.data.health.damage.lethal) - 1;
		}
		else if (oldState == "*") { 
			actorData.data.health.damage.aggravated = parseInt(actorData.data.health.damage.aggravated) - 1;
		}

		this.handleCalculations(actorData);
		this.handleWouldLevelCalculations(actorData);

		this.actor.update(actorData);
	}

	_onItemCreate(event) {
		event.preventDefault();

		let element = event.currentTarget;
		let itemType = element.dataset.type;

		let itemData = {};

		itemData = {
			name: itemType,
			type: itemType,
			_id: ""
		}

		return this.actor.createEmbeddedDocuments('Item', [itemData])
	}

	async _onItemDelete(event) {
		if (this.locked) {
			console.log("WoD | Sheet locked aborts");
			return;
		}

		event.preventDefault();
        event.stopPropagation();

		const itemId = $(event.currentTarget).data("item-id");
		const li = $(event.currentTarget).parents(".item");
		let item = this.actor.getEmbeddedDocument("Item", itemId);

        if (!item)
            return;

        const performDelete = await new Promise((resolve) => {
            Dialog.confirm({
                title: game.i18n.format(game.i18n.localize("wod.labels.remove.item"), { name: item.name }),
                yes: () => resolve(true),
                no: () => resolve(false),
                content: game.i18n.format(game.i18n.localize("wod.labels.remove.removing") + " " + item.name, {
                    name: item.name,
                    actor: this.actor.name,
                }),
            });
        });

        if (!performDelete)
            return;

		this.actor.deleteEmbeddedDocuments("Item", [itemId]);        
	}
	  
	/**
	* If any changes are done to the Actor values.
	*/
	_assignToActorField(fields, value) {
		console.log("WoD | Mortal Sheet _assignToActorField");
		
		const actorData = duplicate(this.actor);

		// update actor owned items
		if (fields.length === 2 && fields[0] === "items") {
			for (const i of actorData.items) {
				if (fields[1] === i._id) {
					i.data.points = value;
					break;
				}
			}
		}
		else if (fields[2] === "health") {
			return
		} 
		else {
			if (fields[2] === "willpower") {
				actorData.data.willpower.temporary = value;
			}
			else if (fields[2] === "gnosis") {
				return
			}
			else if (fields[2] === "rage") {
				return
			}
			else if (fields[2] === "renown") {
				return
			}
			
			else {			
				const lastField = fields.pop();
				fields.reduce((data, field) => data[field], actorData)[lastField] = value;
			}
		}

		this.handleCalculations(actorData);
		this.handleWouldLevelCalculations(actorData);
		
		console.log("WoD | Mortal Sheet updated");
		this.actor.update(actorData);
	}

	handleCalculations(actorData) {
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

	handleWouldLevelCalculations(actorData) {
		let woundLevel = "";
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
}

function parseCounterStates(states) {
	return states.split(",").reduce((obj, state) => {
	  const [k, v] = state.split(":");
	  obj[k] = v;
	  return obj;
	}, {});
  }