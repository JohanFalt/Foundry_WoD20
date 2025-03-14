import { NewRollDice } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

export class Resonance {
    constructor(item) {
        this.attributeValue = parseInt(item.system["value"]);
        this.attributeName = item["name"];

        this.abilityValue = 0;
        this.abilityName = "";

        this.usedReducedDiff = false;
        this.hasSpeciality = false;
        this.specialityText = "";

        this.name = item["name"];
        this.type = item["type"];
        this.dice1 = "";
        this.dice2 = "";
        this.bonus = 0;
        this.difficulty = 6;
        this.description = item.system["description"];
        this.details = "";

        this.canRoll = true;
        this.close = false;
        this.sheettype = "mageDialog";
    }
}

export class OtherTrait {
    constructor(item) {
        this.attributeValue = parseInt(item.system["value"]);
        this.attributeName = item["name"];

        this.abilityValue = 0;
        this.abilityName = "";

        this.usedReducedDiff = false;
        this.hasSpeciality = false;
        this.specialityText = "";

        this.name = item["name"];
        this.type = item["type"];
        this.dice1 = item.system["dice1"];
        this.dice2 = item.system["dice2"];
        this.bonus = parseInt(item.system["bonus"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.description = item.system["description"];
        this.details = item.system["details"];

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "";
    }
}

export class DialogRoll extends FormApplication {
    
    static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-dialog item-dialog"],
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
		});
	}

    constructor(actor, item) {
        super(item, {submitOnChange: true, closeOnSubmit: false});
        this.actor = actor;
        this.isDialog = true;
        
        this.options.title = `${this.actor.name}`;
    }

    /** @override */
	get template() {
        return "systems/worldofdarkness/templates/dialogs/dialog-item.hbs";
	}    

    async getData() {
        const data = super.getData();

        data.actorData = this.actor.system;
        data.config = CONFIG.worldofdarkness;

        if (this.actor.type != CONFIG.worldofdarkness.sheettype.changingbreed) {
            data.object.sheettype = this.actor.type.toLowerCase() + "Dialog";
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
        else if ((this.actor.system?.advantages[data.object.dice1] != undefined) && (this.actor.system.advantages[data.object.dice1]?.roll != undefined)) {
            data.object.attributeValue = parseInt(this.actor.system.advantages[data.object.dice1].roll);
            data.object.attributeName = game.i18n.localize(this.actor.system.advantages[data.object.dice1].label);

            // om willpower
            if ((this.actor.system.advantages[data.object.dice1].label == "wod.advantages.willpower") && (CONFIG.worldofdarkness.attributeSettings == "5th")) {
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
        else if ((this.actor.system?.advantages.virtues != undefined) && (this.actor.system.advantages.virtues[data.object.dice1]?.roll != undefined)) {
            data.object.attributeValue = parseInt(this.actor.system.advantages.virtues[data.object.dice1].roll);
            data.object.attributeName = game.i18n.localize(this.actor.system.advantages.virtues[data.object.dice1].label);
        }
        else if (data.object.dice1 == "path") {
            data.object.attributeValue = parseInt(this.actor.system.advantages.path?.roll);
            data.object.attributeName = game.i18n.localize(this.actor.system.advantages.path?.label);
        }
        else if ((data.object.dice1 == "art") && (data.object.type == "wod.types.artpower")) {
            if (!this.object.isUnleashing) {
                const art = await this.actor.getEmbeddedDocument("Item", data.object.parentid);
                data.object.attributeValue = art.system.value;
                data.object.attributeName = art.name;
            }
            else {
                data.object.attributeValue = parseInt(this.actor.system.advantages.glamour.roll);
                data.object.attributeName = game.i18n.localize(this.actor.system.advantages.glamour.label);
                data.object.difficulty = 7;

                for (const realm of data.object.selectedRealms) {
                    realm.isselected = false;
                }
            }
        }

        if ((this.actor.system?.abilities != undefined) && (this.actor.system.abilities[data.object.dice2]?.value != undefined)) {
            data.object.abilityValue = parseInt(this.actor.system.abilities[data.object.dice2].value);
            data.object.abilityName = game.i18n.localize(this.actor.system.abilities[data.object.dice2].label);

            if ((parseInt(this.actor.system.abilities[data.object.dice2].value) >= 4) || (CONFIG.worldofdarkness.alwaysspeciality.includes(this.actor.system.abilities[data.object.dice2]._id))) {
                data.object.hasSpeciality = true;

                if (data.object.specialityText != "") {
                    data.object.specialityText += ", ";
                }
                data.object.specialityText += this.actor.system.abilities[data.object.dice2].speciality;
            }
        }             
        // virtues
        else if ((this.actor.system.advantages.virtues != undefined) && (this.actor.system.advantages.virtues[data.object.dice2]?.roll != undefined)) {
            data.object.abilityValue = parseInt(this.actor.system.advantages.virtues[data.object.dice2].roll);
            data.object.abilityName = game.i18n.localize(this.actor.system.advantages.virtues[data.object.dice2].label);
        }    
        else if (data.object.dice2 == "path") {
            data.object.abilityValue = parseInt(this.actor.system.advantages.path?.roll);
            data.object.abilityName = game.i18n.localize(this.actor.system.advantages.path?.label);
        } 
        else if ((data.object.dice1 == "art") && (data.object.type == "wod.types.artpower")) {
            if (!this.object.isUnleashing) {
                const realm = data.object._lowestRank();
                data.object.bonus = parseInt(realm);
            }
            else {
                data.object.abilityValue = parseInt(this.actor.system.advantages.nightmare.roll);
                data.object.abilityName = game.i18n.localize(this.actor.system.advantages.nightmare.label);
                data.object.bonus = 0;
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
        
        // add the lowest number of dices from selected Realms
        if (this.object.type == "wod.types.artpower") {
            this.object.isUnleashing = formData["isUnleashing"];
        }
        
        this.object.useSpeciality = formData["specialty"];
        this.object.useWillpower = formData["useWillpower"];

        if (this.object.useSpeciality && CONFIG.worldofdarkness.usespecialityReduceDiff && !this.object.usedReducedDiff) {
            this.object.difficulty -= parseInt(CONFIG.worldofdarkness.specialityReduceDiff);
            this.object.usedReducedDiff = true;
        }
        else if (!this.object.useSpeciality && CONFIG.worldofdarkness.usespecialityReduceDiff && this.object.usedReducedDiff){
            this.object.difficulty += parseInt(CONFIG.worldofdarkness.specialityReduceDiff);
            this.object.usedReducedDiff = false;
        }

        this.object.canRoll = this.object.difficulty > -1 ? true : false;

        this.render();
    }

    close() {
        // do something for 'on close here'
        super.close()
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
        let numSpecialDices = 0;
        let specialDiceText = "";
        let template = [];

        if (!this.object.canRoll) {
            ui.notifications.warn(game.i18n.localize("wod.dialog.missingdifficulty"));
            return;
        }

        template.push(`${this.object.attributeName} (${this.object.attributeValue})`);

        if (this.object.abilityName != "") {
            template.push(`${this.object.abilityName} (${this.object.abilityValue})`);
        }

        const numDices = parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + parseInt(this.object.bonus);
        let specialityText = "";
        this.object.close = true;

        if (this.object.useSpeciality) {
            specialityText = this.object.specialityText;
        }

        // always ignore pain
        const dialogRoll = new DiceRollContainer(this.actor);
        dialogRoll.action = this.object.name;
        dialogRoll.attribute = this.object.dice1;
        dialogRoll.ability = this.object.dice2;
        dialogRoll.dicetext = template;
        dialogRoll.bonus = parseInt(this.object.bonus);
        dialogRoll.origin = "item";
        dialogRoll.numDices = numDices;
        dialogRoll.numSpecialDices = numSpecialDices;
        dialogRoll.specialDiceText = specialDiceText;
        dialogRoll.woundpenalty = 0;
        dialogRoll.difficulty = parseInt(this.object.difficulty);          
        dialogRoll.speciality = this.object.useSpeciality;
        dialogRoll.specialityText = specialityText;      
        dialogRoll.systemText = this.object.details;  
        dialogRoll.usewillpower = this.object.useWillpower;
        
        NewRollDice(dialogRoll);
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    

}
