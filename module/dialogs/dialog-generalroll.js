import { rollDice } from "../scripts/roll-dice.js";
import { DiceRoll } from "../scripts/roll-dice.js";
import ActionHelper from "../scripts/action-helpers.js"

export class GeneralRoll {
    constructor(key, type) {
        this.canRoll = false;
        this.close = false;

        this.difficulty = 6;
        this.bonus = 0;
        this.key = key;
        this.type = type;
        this.name = "";

        this.attributeKey = "";
        this.attributeName = "";
        this.attributeValue = 0;

        this.abilityKey = "";
        this.abilityName = "";
        this.abilityValue = 0;

        this.useSpeciality = false;
        this.hasSpeciality = false;
        this.specialityText = "";

        this.sheettype = "";

        if (type == "attribute") {
            this.attributeKey = key;

            if (CONFIG.wod.attributeSettings == "20th") {                
                this.attributeName = game.i18n.localize(CONFIG.wod.attributes20[key]);
            }
            else if (CONFIG.wod.attributeSettings == "5th") {
                this.attributeName = game.i18n.localize(CONFIG.wod.attributes[key]);
            }

            this.name = this.attributeName;
        }
        else if (type == "ability") {
            this.abilityKey = key;

            if (CONFIG.wod.talents[key] != undefined) {
                this.abilityName = game.i18n.localize(CONFIG.wod.alltalents[key]);
            }
            else if (CONFIG.wod.skills[key] != undefined) {
                this.abilityName = game.i18n.localize(CONFIG.wod.allskills[key]);
            }
            else if (CONFIG.wod.knowledges[key] != undefined) {
                this.abilityName = game.i18n.localize(CONFIG.wod.allknowledges[key]);
            }

            this.name = this.abilityName;
        }
        else if (type == "noability") {
            this.attributeKey = key;            
        }
        else if (type == "dice") {
            this.key = "dice";
            this.attributeValue = 3;
        }
    }
}

export class DialogGeneralRoll extends FormApplication {
    constructor(actor, roll) {
        super(roll, {submitOnChange: true, closeOnSubmit: false});
        this.actor = actor;       
        this.options.title = `${this.actor.name}`;
    }

    /**
        * Extend and override the default options used by the 5e Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["general-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-generalroll.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();
        const attributeKey = data.object.attributeKey;
        const abilityKey = data.object.abilityKey;

        data.actorData = this.actor.data;   
        data.config = CONFIG.wod;
        data.object.hasSpeciality = false; 
        data.object.specialityText = "";

        if (data.actorData.type != CONFIG.wod.changingbreed) {
            data.object.sheettype = data.actorData.type.toLowerCase() + "Dialog";
        }
        else {
            data.object.sheettype = "werewolfDialog";
        }

        let specialityText = "";

        if (data.object.type == "dice") {
            data.object.hasSpeciality = this.object.useSpeciality;
        }
        else {
            if (attributeKey != "") {
                if (data.object.type == "noability") {
                    if ((attributeKey == "conscience") || (attributeKey == "selfcontrol") || (attributeKey == "courage")) {
                        data.object.attributeName = game.i18n.localize(data.actorData.data.virtues[attributeKey].label);
                        data.object.attributeValue = parseInt(data.actorData.data.virtues[attributeKey].roll);
                    }
                    else {
                        data.object.attributeName = game.i18n.localize(data.actorData.data[attributeKey].label);
                        data.object.attributeValue = parseInt(data.actorData.data[attributeKey].roll);
                    }
                    
                    data.object.name = data.object.attributeName;

                    if ((attributeKey == "willpower") && (CONFIG.wod.attributeSettings == "5th")) {
                        if (parseInt(data.actorData.data.attributes.composure.value) >= 4) {
                            data.object.hasSpeciality = true;
                            specialityText = data.actorData.data.attributes.composure.speciality;
                        }
        
                        if ((parseInt(data.actorData.data.attributes.resolve.value) >= 4) && (data.actorData.data.attributes.resolve.speciality != "")) {
                            data.object.hasSpeciality = true;
                            specialityText = data.actorData.data.attributes.resolve.speciality;
                        }
                    }                
                }            
                else {
                    data.object.attributeValue = parseInt(data.actorData.data.attributes[attributeKey].total);

                    if (parseInt(data.actorData.data.attributes[attributeKey].value) >= 4) {
                        data.object.hasSpeciality = true;
                        specialityText = data.actorData.data.attributes[attributeKey].speciality;
                    }
                }
            }

            if (abilityKey != "") {
                let ability = undefined;

                if (data.actorData.data.abilities.talent[abilityKey] != undefined) {
                    ability = data.actorData.data.abilities.talent[abilityKey];
                }
                else if (data.actorData.data.abilities.skill[abilityKey] != undefined) {
                    ability = data.actorData.data.abilities.skill[abilityKey];
                }
                else if (data.actorData.data.abilities.knowledge[abilityKey] != undefined) {
                    ability = data.actorData.data.abilities.knowledge[abilityKey];
                }

                data.object.abilityValue = parseInt(ability.value);

                if (parseInt(ability.value) >= 4) {
                    data.object.hasSpeciality = true;
                    specialityText = ability.speciality;
                }
            }
        }        

        data.object.specialityText = specialityText;

        this.render(false);

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.dialog-numdices-button')
            .click(this._setNumDices.bind(this));

        html
            .find('.dialog-difficulty-button')
            .click(this._setDifficulty.bind(this));   
            
        html
            .find('.dialog-attribute-button')
            .click(this._setAttribute.bind(this));

        html
            .find('.actionbutton')
            .click(this._generalRoll.bind(this));

        html
            .find('.closebutton')
            .click(this._closeForm.bind(this));
    }

    async _updateObject(event, formData) {
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
        //event.preventDefault();

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

        //this.getData();
    }

    _setNumDices(event) {
        //event.preventDefault();

        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-numdices-button");
        const index = parseInt(element.value);   

        this.object.attributeValue = index;   
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

        //this.getData();
    }

    _setAttribute(event) {
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-attribute-button");
        const key = element.value;

        if (key == "") {
            steps.removeClass("active");
            return;
        }

        this.object.attributeKey = element.value;

        if (CONFIG.wod.attributeSettings == "20th") {                
            this.object.attributeName = game.i18n.localize(CONFIG.wod.attributes20[key]);
        }
        else if (CONFIG.wod.attributeSettings == "5th") {
            this.object.attributeName = game.i18n.localize(CONFIG.wod.attributes[key]);
        }

        this.object.attributeValue = this.actor.data.data.attributes[key].total;

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == key) {
                $(this).addClass("active");
            }
        });

        this.getData();
    }

    /* clicked to roll */
    _generalRoll(event) {
        if (this.object.close) {
            this.close();
            return;
        }

        this.object.canRoll = this.object.difficulty > -1 ? true : false;     
        let woundPenaltyVal = 0;
        let templateHTML = "";
        let specialityText = "";

        const numDices = parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + parseInt(this.object.bonus);

        if (!this.object.canRoll) {
            ui.notifications.warn(game.i18n.localize("wod.dialog.missingdifficulty"));
            return;
        }

        if (this.object.type == "dice") {
            woundPenaltyVal = 0;

            templateHTML = `<h2>${game.i18n.localize("wod.dice.rollingdice")}</h2>`;
        }
        else {            
            templateHTML = `<h2>${this.object.name}</h2>`;
            templateHTML += `<strong>${this.object.attributeName} (${this.object.attributeValue})`;

            if (this.object.abilityName != "") {
                templateHTML += ` + ${this.object.abilityName} (${this.object.abilityValue})`;
            }

            if (this.object.bonus > 0) {
                templateHTML += ` + ${this.object.bonus}`;
            }

            templateHTML += `</strong>`;            
            
            this.object.close = true;

            if (!this.object.hasSpeciality) {
                this.object.useSpeciality = false;
            }

            if (this.object.useSpeciality) {
                specialityText = this.object.specialityText;
            }

            if (ActionHelper._ignoresPain(this.actor)) {
                woundPenaltyVal = 0;	
            }				
            else if ((this.object.type == "dice") || (this.object.type == "noability")) {
                woundPenaltyVal = 0;
            }
            else {
                woundPenaltyVal = parseInt(this.actor.data.data.health.damage.woundpenalty);
            }
        }

        const generalRoll = new DiceRoll(this.actor);
        generalRoll.handlingOnes = CONFIG.handleOnes;    
        generalRoll.origin = "general";
        generalRoll.numDices = numDices;
        generalRoll.woundpenalty = parseInt(woundPenaltyVal);
        generalRoll.difficulty = parseInt(this.object.difficulty);          
        generalRoll.templateHTML = templateHTML;        
        generalRoll.speciality = this.object.useSpeciality;
        generalRoll.specialityText = specialityText;

        rollDice(generalRoll);

        // rollDice(
        //     CONFIG.handleOnes,
        //     numDices,
        //     this.actor,
        //     templateHTML,
        //     parseInt(this.object.difficulty),
        //     this.object.system,
        //     this.object.useSpeciality,
        //     specialityText,
        //     woundPenaltyVal);   

        this.object.close = true;
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    

}
