import ActionHelper from "../scripts/action-helpers.js";
import { rollDice } from "../scripts/roll-dice.js";
import { DiceRoll } from "../scripts/roll-dice.js";

export class MeleeWeapon {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this._id = item["_id"];
        this.name = item["name"];
        this.type = item.system["type"];

        this.dice1 = item.system.attack["attribute"];
        this.dice2 = item.system.attack["ability"];
        this.bonus =  parseInt(item.system.attack["accuracy"]);
        this.difficulty = parseInt(item.system["difficulty"]);

        this.rollattack = item.system.attack["isrollable"];
        this.rolldamage = item.system.damage["isrollable"];

        this.system = item.system["description"];

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "";
    }
}

export class RangedWeapon {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this._id = item["_id"];
        this.name = item["name"];
        this.type = item.system["type"];

        this.dice1 = item.system.attack["attribute"];
        this.dice2 = item.system.attack["ability"];
        this.bonus =  parseInt(item.system.attack["accuracy"]);
        this.difficulty = parseInt(item.system["difficulty"]);

        this.rollattack = item.system.attack["isrollable"];
        this.rolldamage = item.system.damage["isrollable"];

        this.system = item.system["description"];

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "";

        // "range": 0,
		// 	"rate": 0,
		// 	"mode": {
		// 		"hasreload": false,
		// 		"hasburst": false,
		// 		"hasfullauto": false,
		// 		"hasspray": false
		// 	},
    }
}

export class Damage {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this.name = item["name"];
        this.type = "Damage";

        this.dice1 = item.system.damage["attribute"];
        this.dice2 = "";        
        this.bonus = parseInt(item.system.damage["bonus"]);
        this.difficulty = 6;
        this.damageType = item.system.damage["type"];
        this.damageCode = game.i18n.localize(CONFIG.wod.damageTypes[this.damageType]);

        if (item.system.extraSuccesses != undefined) {
            this.extraSuccesses = parseInt(item.system.extraSuccesses);
        }
        else {
            this.extraSuccesses = 0;
        }

        this.system = item.system["description"];

        this.canRoll = true;
        this.close = false;
        this.sheettype = "";
    }
}

export class DialogWeapon extends FormApplication {
    constructor(actor, weapon) {
        super(weapon, {submitOnChange: true, closeOnSubmit: false});
        this.actor = actor;
        this.isDialog = true;        
        this.options.title = `${this.actor.name}`;
    }


    /**
        * Extend and override the default options used by the 5e Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["weapon-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-weapon.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();

        data.actorData = this.actor.system;
        data.config = CONFIG.wod;

        if (data.actorData.type != CONFIG.wod.changingbreed) {
            data.object.sheettype = data.actorData.type.toLowerCase() + "Dialog";
        }
        else {
            data.object.sheettype = "werewolfDialog";
        }

        // is dice1 an Attributes
        if ((this.actor.system?.attributes != undefined) && (this.actor.system.attributes[data.object.dice1]?.value != undefined)) {
            data.object.attributeValue = parseInt(this.actor.system.attributes[data.object.dice1].total);
            data.object.attributeName = game.i18n.localize(this.actor.system.attributes[data.object.dice1].label);

            if (parseInt(this.actor.system.attributes[data.object.dice1].value) >= 4) {
                data.object.hasSpeciality = true;

                if (data.object.specialityText != "") {
                    data.object.specialityText += ", ";
                }
                data.object.specialityText += this.actor.system.attributes[data.object.dice1].speciality;
            }
        }
        // is dice1 an Advantage
        else if (this.actor.system[data.object.dice1]?.roll != undefined) { 
            data.object.attributeValue = parseInt(this.actor.system[data.object.dice1].roll);
            data.object.attributeName = game.i18n.localize(this.actor.system[data.object.dice1].label);

            // om willpower
            if ((this.actor.system[data.object.dice1].label == "wod.advantages.willpower") && (CONFIG.wod.attributeSettings == "5th")) {
                if (parseInt(this.actor.system.attributes?.composure.value) >= 4) {
                    data.object.hasSpeciality = true;

                    if (data.object.specialityText != "") {
                        data.object.specialityText += ", ";
                    }
                    data.object.specialityText += this.actor.system.attributes.composure.speciality;
                }
                if (parseInt(this.actor.system.attributes?.resolve.value) >= 4) {
                    data.object.hasSpeciality = true;

                    if (data.object.specialityText != "") {
                        data.object.specialityText += ", ";
                    }
                    data.object.specialityText += this.actor.system.attributes.resolve.speciality;
                }
            }
        }

        // is dice2 a Talent
        if ((this.actor.system?.abilities != undefined) && (this.actor.system.abilities.talent[data.object.dice2]?.value != undefined)) {
            data.object.abilityValue = parseInt(this.actor.system.abilities.talent[data.object.dice2].value);
            data.object.abilityName = game.i18n.localize(this.actor.system.abilities.talent[data.object.dice2].label);

            if (parseInt(this.actor.system.abilities.talent[data.object.dice2].value) >= 4) {
                data.object.hasSpeciality = true;

                if (data.object.specialityText != "") {
                    data.object.specialityText += ", ";
                }
                data.object.specialityText += this.actor.system.abilities.talent[data.object.dice2].speciality;
            }
        }
        // is dice2 a Skill
        else if ((this.actor.system?.abilities != undefined) && (this.actor.system.abilities.skill[data.object.dice2]?.value != undefined)) {
            data.object.abilityValue = parseInt(this.actor.system.abilities.skill[data.object.dice2].value);
            data.object.abilityName = game.i18n.localize(this.actor.system.abilities.skill[data.object.dice2].label);

            if (parseInt(this.actor.system.abilities.skill[data.object.dice2].value) >= 4) {
                data.object.hasSpeciality = true;

                if (data.object.specialityText != "") {
                    data.object.specialityText += ", ";
                }
                data.object.specialityText += this.actor.system.abilities.skill[data.object.dice2].speciality;
            }
        }
        // is dice2 a Knowledge
        else if ((this.actor.system?.abilities != undefined) && (this.actor.system.abilities.knowledge[data.object.dice2]?.value != undefined)) {
            data.object.abilityValue = parseInt(this.actor.system.abilities.knowledge[data.object.dice2].value);
            data.object.abilityName = game.i18n.localize(this.actor.system.abilities.knowledge[data.object.dice2].label);

            if (parseInt(this.actor.system.abilities.knowledge[data.object.dice2].value) >= 4) {
                data.object.hasSpeciality = true;

                if (data.object.specialityText != "") {
                    data.object.specialityText += ", ";
                }
                data.object.specialityText += this.actor.system.abilities.knowledge[data.object.dice2].speciality;
            }
        }        

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.dialog-difficulty-button')
            .click(this._setDifficulty.bind(this));        

        html
            .find('.actionbutton')
            .click(this._rollAttack.bind(this));

        html
            .find('.closebutton')
            .click(this._closeForm.bind(this));
    }

    async _updateObject(event, formData){
        if (this.object.close) {
            this.close();
            return;
        }

        event.preventDefault();       
        
        this.object.useSpeciality = formData["specialty"];

        try {
            this.object.bonus = parseInt(formData["bonus"]);
        }
        catch {
            this.object.bonus = 0;
        }

        this.object.canRoll = this.object.difficulty > -1 ? true : false;
    }

    _setDifficulty(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-difficulty-button");
        const index = parseInt(element.value);   

        this.object.difficulty = index;   
        this.object.canRoll = this.object.difficulty > -1 ? true : false;     

        if (index < 0) {
            return;
        }

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == index) {
                $(this).addClass("active");
            }
        });
    }

    async _rollAttack(event) {
        if (this.object.close) {
            this.close();
            return;
        }

        this.object.canRoll = this.object.difficulty > -1 ? true : false;
        let woundPenaltyVal = 0;
        let templateHTML = "";

        if (!this.object.canRoll) {
            ui.notifications.warn(game.i18n.localize("wod.dialog.missingdifficulty"));
            return;
        }    
        
        const weaponRoll = new DiceRoll(this.actor);
        weaponRoll.handlingOnes = CONFIG.wod.handleOnes;    
        
        let numDices = 0;

        if (this.object.type == "Damage") {
            weaponRoll.origin = "damage";

            templateHTML = `<h2>${this.object.name} (${game.i18n.localize("wod.dialog.weapon.damage")})</h2>`;

            templateHTML += `<strong>${this.object.attributeName} (${this.object.attributeValue})`;

            if (this.object.abilityValue > 0) {
                templateHTML += ` + ${this.object.abilityValue}`;
            }

            if (this.object.bonus > 0) {
                templateHTML += ` + ${this.object.bonus}`;
            }

            if (this.object.extraSuccesses > 0) {
                templateHTML += ` + ${this.object.extraSuccesses}`;
            }

            templateHTML += ` ${this.object.damageCode}</strong>`;            

            numDices = parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + parseInt(this.object.bonus) + parseInt(this.object.extraSuccesses);
        }
        else {
            weaponRoll.origin = "attack";

            templateHTML = `<h2>${this.object.name} (${game.i18n.localize("wod.dialog.weapon.attack")})</h2>`;

            templateHTML += `<strong>${this.object.attributeName} (${this.object.attributeValue})`;

            if (this.object.abilityName != "") {
                templateHTML += ` + ${this.object.abilityName} (${this.object.abilityValue})`;
            }

            if (this.object.bonus > 0) {
                templateHTML += ` + ${this.object.bonus}`;
            }
    
            templateHTML += `</strong>`;     

            templateHTML += `<div class="chat-rollbutton pointer vrollable" 
                                data-type="Mortal"
                                data-object="Damage"
                                data-rollitem="true" 
                                data-itemid="${this.object._id}">
                                    ${game.i18n.localize("wod.dialog.weapon.rolldamage")}
                            </div>`;
            
            if (ActionHelper._ignoresPain(this.actor)) {
                woundPenaltyVal = 0;			}				
            else {
                woundPenaltyVal = parseInt(this.actor.system.health.damage.woundpenalty);
            }

            numDices = parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + parseInt(this.object.bonus);
        }            
        
        let specialityText = "";
        this.object.close = true;

        if (this.object.useSpeciality) {
            specialityText = this.object.specialityText;
        }

        weaponRoll.numDices = numDices;
        weaponRoll.difficulty = parseInt(this.object.difficulty);          
        weaponRoll.templateHTML = templateHTML;      
        
        if (weaponRoll.origin == "attack") {
            weaponRoll.woundpenalty = parseInt(woundPenaltyVal);
            weaponRoll.systemText = this.object.system;
            weaponRoll.speciality = this.object.useSpeciality;
            weaponRoll.specialityText = specialityText;
        }        
        else {
            weaponRoll.woundpenalty = 0;
            weaponRoll.speciality = false;
            weaponRoll.systemText = "";
        }

        if ((weaponRoll.origin == "attack") && (this.object.rollattack)) {
            const numberOfSuccesses = await rollDice(weaponRoll);     
            
            if (numberOfSuccesses > 0) {
                let item = this.actor.getEmbeddedDocument("Item", this.object._id);

                // add number of successes to Damage roll
                item.system.extraSuccesses = parseInt(numberOfSuccesses) - 1;
                const damageData = new Damage(item);
                let rollDamage = new DialogWeapon(this.actor, damageData);
                rollDamage.render(true);
            }
        } 
        else {
            rollDice(weaponRoll);
        }
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    

}
