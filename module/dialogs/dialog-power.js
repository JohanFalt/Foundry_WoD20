import { rollDice } from "../scripts/roll-dice.js";
import { DiceRoll } from "../scripts/roll-dice.js";
import ActionHelper from "../scripts/action-helpers.js"

export class Gift {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this.name = item["name"];
        this.type = item.system["type"];
        this.dice1 = item.system["dice1"];
        this.dice2 = item.system["dice2"];
        this.bonus = parseInt(item.system["bonus"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.description = item.system["description"];
        this.system = item.system["system"];

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "werewolfDialog";
    }
}

export class Charm {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this.name = item["name"];
        this.type = item.system["type"];
        this.dice1 = item.system["dice1"];
        this.dice2 = item.system["dice2"];
        this.bonus = parseInt(item.system["bonus"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.description = "";
        this.system = item.system["description"];

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "spiritDialog";
    }
}

export class CharmGift {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this.name = item["name"];
        this.type = item.system["type"];
        this.dice1 = ActionHelper._transformToSpiritAttributes(item.system["dice1"]);
        this.dice2 = "";
        this.bonus = parseInt(item.system["bonus"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.description = "";
        this.system = item.system["description"];

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "spiritDialog";
    }
}

export class Power {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this.name = item["name"];
        this.type = item.system["type"];
        this.dice1 = item.system["dice1"];
        this.dice2 = item.system["dice2"];
        this.bonus = parseInt(item.system["bonus"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.description = "";
        this.system = item.system["description"];

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "creatureDialog";
    }
}

export class DisciplinePower {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this.name = item["name"];
        this.type = item.system["type"];
        this.dice1 = item.system["dice1"];
        this.dice2 = item.system["dice2"];
        this.bonus = parseInt(item.system["bonus"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.description = item.system["description"];
        this.system = item.system["system"];

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "vampireDialog";
    }
}

export class PathPower {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this.name = item["name"];
        this.type = item.system["type"];
        this.dice1 = item.system["dice1"];
        this.dice2 = item.system["dice2"];
        this.bonus = parseInt(item.system["bonus"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.description = item.system["description"];
        this.system = item.system["system"];

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "vampireDialog";
    }
}

export class RitualPower {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this.name = item["name"];
        this.type = item.system["type"];
        this.dice1 = item.system["dice1"];
        this.dice2 = item.system["dice2"];
        this.bonus = parseInt(item.system["bonus"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.description = item.system["description"];
        this.system = item.system["system"];

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "vampireDialog";
    }
}

export class DialogPower extends FormApplication {
    constructor(actor, power) {
        super(power, {submitOnChange: true, closeOnSubmit: false});
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
            classes: ["power-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-power.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();

        data.actorData = this.actor.system;
        data.config = CONFIG.wod;

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
        // virtues
        else if ((this.actor.system.virtues != undefined) && (this.actor.system.virtues[data.object.dice1]?.roll != undefined)) {
            data.object.attributeValue = parseInt(this.actor.system.virtues[data.object.dice1].roll);
            data.object.attributeName = game.i18n.localize(this.actor.system.virtues[data.object.dice1].label);
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
        // virtues
        else if ((this.actor.system.virtues != undefined) && (this.actor.system.virtues[data.object.dice2]?.roll != undefined)) {
            data.object.abilityValue = parseInt(this.actor.system.virtues[data.object.dice2].roll);
            data.object.abilityName = game.i18n.localize(this.actor.system.virtues[data.object.dice2].label);
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
            .click(this._rollPower.bind(this));

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

    _rollPower(event) {
        if (this.object.close) {
            this.close();
            return;
        }

        this.object.canRoll = this.object.difficulty > -1 ? true : false;
        let woundPenaltyVal = 0;

        if (!this.object.canRoll) {
            ui.notifications.warn(game.i18n.localize("wod.dialog.missingdifficulty"));
            return;
        }

        let templateHTML = `<h2>${this.object.name}</h2>`;
        templateHTML += `<strong>${this.object.attributeName} (${this.object.attributeValue})`;

        if (this.object.abilityName != "") {
            templateHTML += ` + ${this.object.abilityName} (${this.object.abilityValue})`;
        }

        if (this.object.bonus > 0) {
            templateHTML += ` + ${this.object.bonus}`;
        }

        templateHTML += `</strong>`;

        const numDices = parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + parseInt(this.object.bonus);
        let specialityText = "";
        this.object.close = true;

        if (this.object.useSpeciality) {
            specialityText = this.object.specialityText;
        }

        if (ActionHelper._ignoresPain(this.actor)) {
            woundPenaltyVal = 0;
        }				
        else {
            woundPenaltyVal = parseInt(this.actor.system.health.damage.woundpenalty);
        }
        
        const powerRoll = new DiceRoll(this.actor);
        powerRoll.handlingOnes = CONFIG.wod.handleOnes;    
        powerRoll.origin = "power";
        powerRoll.numDices = numDices;
        powerRoll.woundpenalty = parseInt(woundPenaltyVal);
        powerRoll.difficulty = parseInt(this.object.difficulty);          
        powerRoll.templateHTML = templateHTML;        
        powerRoll.systemText = this.object.system;
        powerRoll.speciality = this.object.useSpeciality;
        powerRoll.specialityText = specialityText;

        rollDice(powerRoll);
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    

}
