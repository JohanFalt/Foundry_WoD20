import ActionHelper from "../scripts/action-helpers.js";
import { rollDice } from "../scripts/roll-dice.js";
import { rollDiceMultiple } from "../scripts/roll-dice.js";
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
        this.type = item["type"];

        this.dice1 = item.system.attack["attribute"];
        this.dice2 = item.system.attack["ability"];
        this.bonus =  parseInt(item.system.attack["accuracy"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.accuracy = parseInt(item.system.attack["accuracy"]);

        this.hasburst = false;
        this.hasfullauto = false;
        this.hasspray = false;
        this.modename = "single";
        this.modebonus = 0;
        this.modedifficulty = 0;
        this.basedifficulty = parseInt(item.system["difficulty"]);

        this.rollattack = item.system.attack["isrollable"];
        this.rolldamage = item.system.damage["isrollable"];

        this.system = item.system["description"];

        this.secondaryabilityid = this.dice2 == "custom" ? item.system.attack["secondaryabilityid"] : "";

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
        this.type = item["type"];

        this.dice1 = item.system.attack["attribute"];
        this.dice2 = item.system.attack["ability"];
        this.bonus =  parseInt(item.system.attack["accuracy"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.accuracy = parseInt(item.system.attack["accuracy"]);

        this.hasburst = item.system.mode["hasburst"];
        this.hasfullauto = item.system.mode["hasfullauto"];
        this.hasspray = item.system.mode["hasspray"];
        this.modename = "single";
        this.modebonus = 0;
        this.numberoftargets = 1;
        this.modedifficulty = 0;
        this.basedifficulty = parseInt(item.system["difficulty"]);

        this.rollattack = item.system.attack["isrollable"];
        this.rolldamage = item.system.damage["isrollable"];

        this.system = item.system["description"];

        this.secondaryabilityid = this.dice2 == "custom" ? item.system.attack["secondaryabilityid"] : "";

        this.canRoll = this.difficulty > -1 ? true : false;
        this.close = false;
        this.sheettype = "";
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
        this.accuracy = parseInt(item.system.damage["bonus"]);
        this.difficulty = 6;
        this.damageType = item.system.damage["type"];
        this.damageCode = game.i18n.localize(CONFIG.wod.damageTypes[this.damageType]);

        this.hasburst = false;
        this.hasfullauto = false;
        this.hasspray = false;
        this.modename = "single";
        this.numberoftargets = 1;
        this.modebonus = 0;
        this.modedifficulty = 0;
        this.basedifficulty = 6;

        if (item.system.extraSuccesses != undefined) {
            this.extraSuccesses = parseInt(item.system.extraSuccesses);
        }
        else {
            this.extraSuccesses = 0;
        }

        // if spray mode has been activated
        if ((item.system.modename != undefined) && (item.system.modename == "spray")) {
            this.modename = "spray";
            this.numberoftargets = parseInt(item.system.numberoftargets);
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
        data.actorData.type = this.actor.type;
        data.config = CONFIG.wod;
        data.config.meleeAbilities = this.actor.meleeAbilities;
        data.config.rangedAbilities = this.actor.rangedAbilities;

        if (data.actorData.type != CONFIG.wod.sheettype.changingbreed) {
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
        else if (data.object.dice2 == "custom") {
            if (this.object.secondaryabilityid != "") {
                const item = this.actor.getEmbeddedDocument("Item", this.object.secondaryabilityid);
                this.object.abilityValue = parseInt(item.system.value);
                this.object.abilityName = item.system.label;

                if (parseInt(item.system.value) >= 4) {
                    data.object.hasSpeciality = true;
    
                    if (data.object.specialityText != "") {
                        data.object.specialityText += ", ";
                    }
                    data.object.specialityText += item.system.speciality;
                }
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
            .find('.dialog-numbertargets-button')
            .click(this._setNumberTargets.bind(this));

        html
            .find('.dialog-secondaryability-button')
            .click(this._setSecondaryAbility.bind(this));

        html
            .find('.dialog-mode-button')
            .click(this._setMode.bind(this));            

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

        this.object.difficulty = index + this.object.modedifficulty;   
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

    _setNumberTargets(event) {
        event.preventDefault();

        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-numbertargets-button");
        const index = parseInt(element.value);   

        this.object.numberoftargets = index;   

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

    _setMode(event) {
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-mode-button");

        const key = element.value;

        this.object.modebonus = 0;
        this.object.modedifficulty = 0;

        if (key == "") {
            steps.removeClass("active");            
            return;
        }

        if (key == "single") {
            this.object.modebonus = 0;
            this.object.modedifficulty = 0;
            this.object.numberoftargets = 1;
        }
        if (key == "burst") {
            this.object.modebonus = 3;        
            this.object.modedifficulty = 1; 
            this.object.numberoftargets = 1;
        }
        if (key == "fullauto") {
            this.object.modebonus = 10;        
            this.object.modedifficulty = 2;    
            this.object.numberoftargets = 1;
        }
        if (key == "spray") {
            this.object.modebonus = 10;         
            this.object.modedifficulty = 2;   
            this.object.numberoftargets = 1;
        }

        this.object.modename = key;

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == key) {
                $(this).addClass("active");
            }
        });

        this.object.difficulty = parseInt(this.object.basedifficulty) + parseInt(this.object.modedifficulty);
        this.object.bonus = parseInt(this.object.accuracy) + this.object.modebonus;

        this.render();
    }

    async _setSecondaryAbility(event) {
        event.preventDefault();

        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-secondaryability-button");
        const key = element.value;

        if (key == "") {
            steps.removeClass("active");
            return;
        }

        const abilityId = key;
        const item = this.actor.getEmbeddedDocument("Item", abilityId);

        this.object.abilityValue = parseInt(item.system.value);
        this.object.abilityName = item.system.label;
        this.object.secondaryabilityid = item._id;

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == key) {
                $(this).addClass("active");
            }
        });

        this.render();
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
            let prevtext = false;

            weaponRoll.origin = "damage";

            templateHTML = `<h2>${this.object.name} (${game.i18n.localize("wod.dialog.weapon.damage")})</h2>`;

            templateHTML += `<strong>`;

            if (this.object.attributeName != "") {
                templateHTML += `${this.object.attributeName} (${this.object.attributeValue})`;
                prevtext = true;
            }

            if (this.object.abilityValue > 0) {
                if (prevtext) {
                    templateHTML += ` + `;
                }

                templateHTML += `${this.object.abilityValue}`;
                prevtext = true;
            }

            if (this.object.bonus > 0) {
                if (prevtext) {
                    templateHTML += ` + `;
                }

                templateHTML += `${this.object.bonus}`;
                prevtext = true;
            }

            if (this.object.extraSuccesses > 0) {
                if (prevtext) {
                    templateHTML += ` + `;
                }

                templateHTML += `${this.object.extraSuccesses}`;
            }

            templateHTML += ` ${this.object.damageCode}</strong>`;            

            // if several targets number of dices will be different
            if (this.object.numberoftargets == 1) {
                numDices = parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + parseInt(this.object.bonus) + parseInt(this.object.extraSuccesses);
            }
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

            if (this.object.modename != "single") {
                if (this.object.modename == "burst") {
                    templateHTML += `<br />${game.i18n.localize("wod.dialog.weapon.usingburst")}`;
                }
                if (this.object.modename == "fullauto") {
                    templateHTML += `<br />${game.i18n.localize("wod.dialog.weapon.usingauto")}`;
                }
                if (this.object.modename == "spray") {
                    templateHTML += `<br />${game.i18n.localize("wod.dialog.weapon.usingspray")}`;
                }
            }
    
            templateHTML += `</strong>`;     

            // templateHTML += `<div class="chat-rollbutton pointer vrollable" 
            //                     data-type="Mortal"
            //                     data-object="Damage"
            //                     data-rollitem="true" 
            //                     data-actorid="${this.actor.id}"
            //                     data-itemid="${this.object._id}">
            //                         ${game.i18n.localize("wod.dialog.weapon.rolldamage")}
            //                 </div>`;
            
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
            let item = this.actor.getEmbeddedDocument("Item", this.object._id);

            if (this.object.dice2 == "custom") {
                const itemData = duplicate(item);
                itemData.system.attack.secondaryabilityid = this.object.secondaryabilityid;
                await item.update(itemData);
            }

            const numberOfSuccesses = await rollDice(weaponRoll);     
            
            if (numberOfSuccesses > 0) {
                // add number of successes to Damage roll
                item.system.extraSuccesses = parseInt(numberOfSuccesses) - 1;
                item.system.numberoftargets = this.object.numberoftargets;
                item.system.modename = this.object.modename;
                const damageData = new Damage(item);
                let rollDamage = new DialogWeapon(this.actor, damageData);
                rollDamage.render(true);
            }
        } 
        else {
            // if you have selected multiple targets and thus are to roll several damage rolls with one "session"
            if ((this.object.numberoftargets > 1) && (this.object.modename == "spray")) {
                let numberTargets = this.object.numberoftargets;
                let maxnumberTargets = parseInt(this.object.extraSuccesses) + 1;

                if (numberTargets > maxnumberTargets) {
                    numberTargets = maxnumberTargets;
                }
                
                const targetlist = [];
                let rolledSuccesses = maxnumberTargets;

                // create the "bag of number of dices"
                for (let i = 0; i <= numberTargets - 1; i++) {
                    let target = {
                         numDices: parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + parseInt(this.object.bonus)
                    }

                    targetlist.push(target);
                }

                // what "bag of number of dices" I'm to put successes in
                let list = 0;

                // as you never add the first success as extra damage remove number of targets dices from the main success pool
                rolledSuccesses = rolledSuccesses - numberTargets;

                // put the right number of successes in the right "bag of number of dices"
                while (rolledSuccesses > 0) {
                    targetlist[list].numDices += 1;
                    rolledSuccesses -= 1;

                    if (list == numberTargets - 1) {
                        list = 0;
                    }
                    else {
                        list += 1;
                    }
                }

                let spraytext = `<br />${game.i18n.localize("wod.dialog.weapon.sprayresult")}`;
                spraytext = spraytext.replace("[0]", this.object.numberoftargets);
                spraytext = spraytext.replace("[1]", numberTargets);

                weaponRoll.templateHTML += spraytext;
                weaponRoll.targetlist = targetlist;

                rollDiceMultiple(weaponRoll);
            }
            else {
                rollDice(weaponRoll);
            }
        }
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }   
}

