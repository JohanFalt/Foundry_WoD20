import { NewRollDice } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";
import CombatHelper from "../scripts/combat-helpers.js";
import BonusHelper from "../scripts/bonus-helpers.js";

export class GeneralRoll {
    constructor(key, type, actor) {
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

        this.usedReducedDiff = false;
        this.useSpeciality = false;
        this.hasSpeciality = false;

        //data.object.ignorepain = CombatHelper.ignoresPain(this.actor);

        if (actor != undefined) {
            this.ignorepain = CombatHelper.ignoresPain(actor);
        }
        else {
            this.ignorepain = false;
        }
        
        this.usepain = true;        

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
        this.isDialog = true;  
        this.isFreeRole = actor == undefined;

        if (!this.isFreeRole) {
            this.options.title = `${this.actor.name}`;        
        }
    }

    /**
        * Extend and override the default options used by the 5e Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["wod20 wod-dialog general-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-generalroll.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    async getData() {
        const data = super.getData();
        const attributeKey = data.object.attributeKey;
        const abilityKey = data.object.abilityKey;

        let attributeSpeciality = "";
        let abilitySpeciality = "";
        let specialityText = "";

        if (!this.isFreeRole) {
            data.actorData = this.actor.system;   
            data.actorData.type = this.actor.type;            

            if (data.actorData.type != CONFIG.wod.sheettype.changingbreed) {
                data.object.sheettype = data.actorData.type.toLowerCase() + "Dialog";
            }
            else {
                data.object.sheettype = "werewolfDialog";
            }
        }
        else {
            data.object.ignorepain = true;    
            data.object.usepain = false;    
            
            data.object.sheettype = "mortalDialog";
        }
        
        data.config = CONFIG.wod;
        data.object.hasSpeciality = false; 
        data.object.specialityText = "";        

        if (this.object.type == "attribute") {
            if (await BonusHelper.CheckAttributeBonus(this.actor, this.object.attributeKey)) {
                let bonus = await BonusHelper.GetAttributeBonus(this.actor, this.object.attributeKey);
                this.object.difficulty += parseInt(bonus);
            }            
        }                

        if (data.object.type == "dice") {
            data.object.hasSpeciality = this.object.useSpeciality;
        }
        else {
            if (attributeKey != "") {
                if (data.object.type == "noability") {
                    if ((attributeKey == "conscience") || (attributeKey == "selfcontrol") || (attributeKey == "courage")) {
                        data.object.attributeName = game.i18n.localize(data.actorData.advantages.virtues[attributeKey].label);
                        data.object.attributeValue = parseInt(data.actorData.advantages.virtues[attributeKey].roll);
                        data.object.name = data.object.attributeName; 
                    }
                    else {
                        if ((attributeKey == "willpower") && (CONFIG.wod.attributeSettings == "5th")) {
                            if (parseInt(data.actorData.attributes?.composure.value) >= 4) {
                                data.object.hasSpeciality = true;
                                attributeSpeciality = data.actorData.attributes.composure.speciality;
                            }
            
                            if ((parseInt(data.actorData.attributes?.resolve.value) >= 4) && (data.actorData.attributes?.resolve.speciality != "")) {
                                data.object.hasSpeciality = true;
    
                                if (attributeSpeciality != "") {
                                    attributeSpeciality += ", ";
                                }
    
                                attributeSpeciality += data.actorData.attributes.resolve.speciality;
                            }  
                        } 
                        
                        data.object.attributeName = game.i18n.localize(data.actorData.advantages[attributeKey].label);
                        data.object.attributeValue = parseInt(data.actorData.advantages[attributeKey].roll);
                        data.object.name = data.object.attributeName;
                    }         
                }            
                else {
                    data.object.attributeValue = parseInt(data.actorData.attributes[attributeKey].total);

                    if (parseInt(data.actorData.attributes[attributeKey].value) >= 4) {
                        data.object.hasSpeciality = true;
                        attributeSpeciality = data.actorData.attributes[attributeKey].speciality;
                    }

                    if (await BonusHelper.CheckAttributeDiceBuff(this.actor, attributeKey)) {
                        let bonus = await BonusHelper.GetAttributeDiceBuff(this.actor, attributeKey);
                        data.object.attributeValue += parseInt(bonus);
                    }
                }
            }

            if (abilityKey != "") {
                let ability = undefined;

                if ((data.actorData.abilities[abilityKey] != undefined) && (data.actorData.abilities[abilityKey].isvisible)) {
                    ability = data.actorData.abilities[abilityKey];
                    ability.issecondary = false;
                }
                else {
                    const item = await this.actor.getEmbeddedDocument("Item", abilityKey);

                    ability = {
						issecondary: true,
						isvisible: true,
						label: item.system.label,
						max: item.system.max,
						name: item.name,
						speciality: item.system.speciality,
						value: item.system.value,
						_id: abilityKey
					}
                }

                if (await BonusHelper.CheckAbilityBonus(this.actor, ability._id)) {
                    let bonus = await BonusHelper.GetAbilityBonus(this.actor, ability._id);
                    this.object.difficulty += parseInt(bonus);
                }              
                
                data.object.abilityValue = parseInt(ability.value);

                if (await BonusHelper.CheckAbilityBuff(this.actor, ability._id)) {
                    let bonus = await BonusHelper.GetAbilityBuff(this.actor, ability._id);
                    data.object.abilityValue += parseInt(bonus);
                }

                ability.label = (data.actorData.abilities[abilityKey].altlabel == "") ? ability.label : data.actorData.abilities[abilityKey].altlabel;
                
                data.object.abilityName = (!ability.issecondary) ? game.i18n.localize(ability.label) : ability.label;
                data.object.name = data.object.abilityName;
                
                if (parseInt(ability.value) >= 4) {
                    data.object.hasSpeciality = true;
                    abilitySpeciality = ability.speciality;
                }
            }
        }        

        if (data.object.hasSpeciality) {
            if ((attributeSpeciality != "") && (abilitySpeciality != "")) {
                specialityText = attributeSpeciality + ", " + abilitySpeciality;
            }
            else if (attributeSpeciality != "") {
                specialityText = attributeSpeciality;
            }
            else if (abilitySpeciality != "") {
                specialityText = abilitySpeciality;
            }
        }

        data.object.specialityText = specialityText;

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

        if (this.object.useSpeciality && CONFIG.wod.usespecialityReduceDiff && !this.object.usedReducedDiff) {
            this.object.difficulty -= CONFIG.wod.specialityReduceDiff;
            this.object.usedReducedDiff = true;
        }
        else if (!this.object.useSpeciality && CONFIG.wod.usespecialityReduceDiff && this.object.usedReducedDiff){
            this.object.difficulty += CONFIG.wod.specialityReduceDiff;
            this.object.usedReducedDiff = false;
        }
        
        this.object.usepain = formData["usepain"];

        try {
            this.object.bonus = parseInt(formData["bonus"]);
        }
        catch {
            this.object.bonus = 0;
        }

        this.object.canRoll = this.object.difficulty > -1 ? true : false;

        this.render();
    }

    _setDifficulty(event) {
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

    _setNumDices(event) {
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

    async _setAttribute(event) {
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-attribute-button");
        const key = element.value;

        if (key == "") {
            steps.removeClass("active");
            return;
        }

        this.object.attributeKey = element.value;
        this.object.difficulty = 6;

        if (await BonusHelper.CheckAttributeBonus(this.actor, this.object.attributeKey)) {            
            let bonus = await BonusHelper.GetAttributeBonus(this.actor, this.object.attributeKey);
            this.object.difficulty += parseInt(bonus);
        }

        if (CONFIG.wod.attributeSettings == "20th") {                
            this.object.attributeName = game.i18n.localize(CONFIG.wod.attributes20[key]);
        }
        else if (CONFIG.wod.attributeSettings == "5th") {
            this.object.attributeName = game.i18n.localize(CONFIG.wod.attributes[key]);
        }

        this.object.attributeValue = this.actor.system.attributes[key].total;

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == key) {
                $(this).addClass("active");
            }
        });

        this.render(false);
    }

    /* clicked to roll */
    _generalRoll(event) {
        if (this.object.close) {
            this.close();
            return;
        }

        this.object.canRoll = this.object.difficulty > -1 ? true : false;     
        let woundPenaltyVal = 0;
        let template = [];
        let specialityText = "";
        let rollName = this.object.name;

        if (rollName == "") {
            rollName = game.i18n.localize("wod.dice.rollingdice");
        }

        const numDices = parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + parseInt(this.object.bonus);

        if (!this.object.canRoll) {
            ui.notifications.warn(game.i18n.localize("wod.dialog.missingdifficulty"));
            return;
        }

        if (this.object.type == "dice") {
            woundPenaltyVal = 0;
        }
        else {            
            template.push(`${this.object.attributeName} (${this.object.attributeValue})`);

            if (this.object.abilityName != "") {
                template.push(`${this.object.abilityName} (${this.object.abilityValue})`);
            }

            this.object.close = true;

            if (!this.object.hasSpeciality) {
                this.object.useSpeciality = false;
            }

            if (this.object.useSpeciality) {
                specialityText = this.object.specialityText;
            }

            if (this.object.ignorepain) {
                woundPenaltyVal = 0;	
            }				
            else if ((this.object.type == "dice") || (this.object.type == "noability")) {
                woundPenaltyVal = 0;
            }
            else if (!this.object.usepain) {
                woundPenaltyVal = 0;
            }
            else {
                woundPenaltyVal = parseInt(this.actor.system.health.damage.woundpenalty);
            }
        }

        const generalRoll = new DiceRollContainer(this.actor);
        generalRoll.action = rollName;
        generalRoll.attribute = this.object.attributeKey;
        generalRoll.dicetext = template;
        generalRoll.bonus = parseInt(this.object.bonus);
        generalRoll.origin = "general";
        generalRoll.numDices = numDices;
        generalRoll.woundpenalty = parseInt(woundPenaltyVal);
        generalRoll.difficulty = parseInt(this.object.difficulty);          
        generalRoll.speciality = this.object.useSpeciality;
        generalRoll.specialityText = specialityText;
        
        NewRollDice(generalRoll);

        this.object.close = true;
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    

}
