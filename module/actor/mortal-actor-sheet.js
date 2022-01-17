import { rollDice } from "../scripts/roll-dice.js";
import { calculateHealth } from "../scripts/health.js";

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
		this.locked = true;
		this.isCharacter = true;
		
		console.log("WoD | Mortal Sheet constructor");
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
		console.log("WoD | Mortal Sheet getData");
		
		const data = super.getData();

		data.config = CONFIG.wod;		
		data.locked = this.locked;
		data.isCharacter = this.isCharacter;

		data.dtypes = ["String", "Number", "Boolean"];

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

		data.actor.health = calculateHealth(data.actor);

		data.actor.naturalWeapons = naturalWeapons;
		data.actor.meleeWeapons = meleeWeapons;
		data.actor.rangedWeapons = rangedWeapons;	
		data.actor.armors = armors;	
		
		console.log(data.actor);

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
		function getAbility(ability, property, key) {
			let value = "";
			
			if (key == "") {
				return value;
			}
			
			value = ability.talent[key]?.[property];
			
			if (value == undefined) {
				value = ability.skill[key]?.[property];
				
				if (value == undefined) {
					value = ability.knowledge[key]?.[property];
				}
			}			
			
			return value;
		}
	
		console.log("WoD | Mortal Sheet _onRollDialog");
	
		event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;
    
		let options1 = "";
		let options2 = "";
		let options3 = "";
		let healthOptions = "";		
		
		let wounded = "";
		let specialty = "";
		let selectAbility = "";

		if (dataset.noability=="true") {
			selectAbility =  "";
			specialty =  "";
			wounded = "";
		}
		else { 
			for (const [key, value] of Object.entries(this.actor.data.data.health)) {
				healthOptions = healthOptions.concat(`<option value="${key}">${game.i18n.localize(value.label)}</option>`);
			}
			
			specialty =  `<input id="specialty" type="checkbox">${game.i18n.localize("wod.labels.specialty")}</input>`
			wounded = `<div class="form-group">
						<label>${game.i18n.localize("wod.labels.selectwound")}</label>
						<select id="woundSelect">${healthOptions}</select>
					</div>`
		
			if (dataset.ability == "true") {
				for (const [key, value] of Object.entries(this.actor.data.data.attributes)) {
					options1 = options1.concat(`<option value="${key}">${game.i18n.localize(value.label)}</option>`);
				}
				
				selectAbility =  `<div class="form-group">
								<label>${game.i18n.localize("wod.labels.selectattribute")}</label>
								<select id="attributeSelect">${options1}</select>
							</div>`;
			}
			else if (dataset.attribute == "true") {
				/*for (const [key, value] of Object.entries(this.actor.data.data.abilities.talent)) {
					options1 = options1.concat(`<option value="${key}">${game.i18n.localize(value.label)}</option>`);
				}
				
				for (const [key, value] of Object.entries(this.actor.data.data.abilities.skill)) {
					options2 = options2.concat(`<option value="${key}">${game.i18n.localize(value.label)}</option>`);
				}
				
				for (const [key, value] of Object.entries(this.actor.data.data.abilities.knowledge)) {
					options3 = options3.concat(`<option value="${key}">${game.i18n.localize(value.label)}</option>`);
				}
				
				selectAbility =  `<div class="form-group">
								<label>${game.i18n.localize("wod.labels.ability")}</label>
								<select id="abilitySelect">${options1}${options2}${options3}</select>
							</div>`;*/
			}			
		}
		
		const template = `
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
					<input type="text" min="0" id="inputDif" value="6">
				</div>
				` + wounded + specialty +`
			</form>`;

		let buttons = {};
		buttons = {
      
			draw: {
				icon: '<i class="fas fa-check"></i>',
				label: game.i18n.localize("wod.dice.roll"),
				callback: async (html) => {
					const attribute = html.find("#attributeSelect")[0]?.value;				
					const attributeVal = dataset.ability == "true" ? this.actor.data.data.attributes[attribute].value : 0;
					const attributeName = dataset.ability == "true" ? game.i18n.localize(this.actor.data.data.attributes[attribute].label) : "";
					
					const woundPenalty = html.find("#woundSelect")[0]?.value !== undefined ? html.find("#woundSelect")[0]?.value : "";					
					const woundPenaltyVal = this.actor.data.data.conditions.ignorepain == true ? 0 : (woundPenalty == "" ? 0 : this.actor.data.data.health[woundPenalty]?.penalty);					
					const woundName = woundPenalty == "" ? "" : game.i18n.localize(this.actor.data.data.health[woundPenalty]?.label);
					
					const modifier = parseInt(html.find("#inputMod")[0].value || 0);
					const difficulty = parseInt(html.find("#inputDif")[0].value || 0);
					const specialty = parseInt(html.find("#specialty")[0]?.checked || false);
					const numDice = dataset.noability == "true" ? parseInt(dataset.roll) + modifier : (dataset.ability == "true" ? attributeVal + parseInt(dataset.roll) + modifier : parseInt(dataset.roll) + modifier);
			  
					rollDice(
						numDice,
						this.actor,
						dataset.noability =="true" ? `${dataset.label}` : (dataset.ability == "true" ? `${dataset.label} + ${attributeName}` : `${dataset.label}`),
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

	_onItemDelete(event) {
		if (this.locked) {
			console.log("WoD | Sheet locked aborts");
			return;
		}

		event.preventDefault();
        event.stopPropagation();

		const itemId = $(event.currentTarget).data("item-id");
		let item = this.actor.getEmbeddedDocument("Item", itemId);

        if (!item)
            return;

		const performDelete = true;

        /*const performDelete = await new Promise((resolve) => {
            Dialog.confirm({
                title: game.i18n.format("swnr.deleteTitle", { name: item.name }),
                yes: () => resolve(true),
                no: () => resolve(false),
                content: game.i18n.format("swnr.deleteContent", {
                    name: item.name,
                    actor: this.actor.name,
                }),
            });
        });*/

        if (!performDelete)
            return;

		this.actor.deleteEmbeddedDocuments("Item", [itemId]);

        /*li.slideUp(200, () => {
            requestAnimationFrame(() => {
                //this.actor.deleteEmbeddedDocuments("Item", [li.data("item-id")]);
				
            });
        });*/
	}

	/*getItemDefaultName(type, data) {
		if (type === "SpecialityAttribute") {
			return `${game.i18n.localize("wod.types.speciality")}`;
		}

		if (type === "Melee Weapon") {
			return `${game.i18n.localize("wod.types.meleeweapon")}`;
		}

		return `${game.i18n.localize("VTM5E." + type.capitalize())}`;
	}*/
	  
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

		// health 
		actorData.data.health.max = actorData.data.health.bruised.value + 
										actorData.data.health.hurt.value + 
										actorData.data.health.injured.value + 
										actorData.data.health.wounded.value + 
										actorData.data.health.mauled.value + 
										actorData.data.health.crippled.value + 
										actorData.data.health.incapacitated.value;
		
		// willpower
		actorData.data.willpower.permanent = actorData.data.attributes.composure.value + actorData.data.attributes.resolve.value;
		
		if (actorData.data.willpower.permanent > actorData.data.willpower.max) {
			actorData.data.willpower.permanent = actorData.data.willpower.max;
		}
		
		if (actorData.data.willpower.permanent < actorData.data.willpower.temporary) {
			actorData.data.willpower.temporary = actorData.data.willpower.permanent;
		}

		actorData.data.willpower.roll = actorData.data.willpower.permanent > actorData.data.willpower.temporary ? actorData.data.willpower.temporary : actorData.data.willpower.permanent; 
		
		console.log("WoD | Mortal Sheet updated");
		this.actor.update(actorData);
	}
}

function parseCounterStates(states) {
	return states.split(",").reduce((obj, state) => {
	  const [k, v] = state.split(":");
	  obj[k] = v;
	  return obj;
	}, {});
  }