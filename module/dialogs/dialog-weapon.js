import CombatHelper from "../scripts/combat-helpers.js";
import BonusHelper from "../scripts/bonus-helpers.js";

import { NewRollDice } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

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
        this.weaponType = "Melee Weapon";

        this.dice1 = item.system.attack["attribute"];
        this.dice2 = item.system.attack["ability"];
        this.bonus =  parseInt(item.system.attack["accuracy"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.accuracy = parseInt(item.system.attack["accuracy"]);

        this.usedReducedDiff = false;
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
        this.weaponType = "Ranged Weapon";

        this.dice1 = item.system.attack["attribute"];
        this.dice2 = item.system.attack["ability"];
        this.bonus =  parseInt(item.system.attack["accuracy"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.accuracy = parseInt(item.system.attack["accuracy"]);

        this.usedReducedDiff = false;
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
        this.weaponType = "Damage";

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
            classes: ["wod20 wod-dialog weapon-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-weapon.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    async getData() {
        const data = super.getData();

        let attributeSpeciality = "";
        let abilitySpeciality = "";
        let specialityText = "";

        data.actorData = this.actor.system;
        data.actorData.type = this.actor.type;
        data.config = CONFIG.wod;
        data.config.meleeAbilities = this.actor.system.listdata.meleeAbilities;
        data.config.rangedAbilities = this.actor.system.listdata.rangedAbilities;

        if (data.actorData.type != CONFIG.wod.sheettype.changingbreed) {
            data.object.sheettype = data.actorData.type.toLowerCase() + "Dialog";
        }
        else {
            data.object.sheettype = "werewolfDialog";
        }

        // is dice1 an Attributes
        if ((this.actor.system?.attributes != undefined) && (data.actorData.attributes[data.object.dice1]?.value != undefined)) {
            data.object.attributeValue = parseInt(data.actorData.attributes[data.object.dice1].total);
            data.object.attributeName = game.i18n.localize(data.actorData.attributes[data.object.dice1].label);

            if (parseInt(data.actorData.attributes[data.object.dice1].value) >= 4) {
                data.object.hasSpeciality = true;
                attributeSpeciality = data.actorData.attributes[data.object.dice1].speciality;
            }            
        }
        // is dice1 an Advantage
        else if (data.actorData[data.object.dice1]?.roll != undefined) { 
            data.object.attributeValue = parseInt(data.actorData[data.object.dice1].roll);
            data.object.attributeName = game.i18n.localize(data.actorData[data.object.dice1].label);

            // om willpower
            if ((this.actor.system[data.object.dice1].label == "wod.advantages.willpower") && (CONFIG.wod.attributeSettings == "5th")) {
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
        }

        if ((this.actor.system?.abilities != undefined) && (data.actorData.abilities[data.object.dice2]?.value != undefined)) {
            data.object.abilityValue = parseInt(data.actorData.abilities[data.object.dice2].value);
            data.object.abilityName = game.i18n.localize(data.actorData.abilities[data.object.dice2].label);

            if (parseInt(data.actorData.abilities[data.object.dice2].value) >= 4) {
                data.object.hasSpeciality = true;
                abilitySpeciality = data.actorData.abilities[data.object.dice2].speciality;
            }
        }
        else if (data.object.dice2 == "custom") {
            if (this.object.secondaryabilityid != "") {
                const item = this.actor.getEmbeddedDocument("Item", this.object.secondaryabilityid);
                this.object.abilityValue = parseInt(item.system.value);
                this.object.abilityName = item.system.label;

                if (parseInt(item.system.value) >= 4) {
                    data.object.hasSpeciality = true;
                    abilitySpeciality = item.system.speciality;
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

        if (await BonusHelper.CheckAttributeDiceBuff(this.actor, data.object.dice1)) {
            let bonus = await BonusHelper.GetAttributeDiceBuff(this.actor, data.object.dice1);
            data.object.attributeValue += parseInt(bonus);
        }

        if (await BonusHelper.CheckAbilityBuff(this.actor, data.object.dice2)) {
            let bonus = await BonusHelper.GetAbilityBuff(this.actor, data.object.dice2);
            this.object.abilityValue += parseInt(bonus);
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

        if (this.object.useSpeciality && CONFIG.wod.usespecialityReduceDiff && !this.object.usedReducedDiff) {
            this.object.difficulty -= CONFIG.wod.specialityReduceDiff;
            this.object.usedReducedDiff = true;
        }
        else if (!this.object.useSpeciality && CONFIG.wod.usespecialityReduceDiff && this.object.usedReducedDiff){
            this.object.difficulty += CONFIG.wod.specialityReduceDiff;
            this.object.usedReducedDiff = false;
        }

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

        if (!this.object.canRoll) {
            ui.notifications.warn(game.i18n.localize("wod.dialog.missingdifficulty"));
            return;
        }    

        let template = [];
        let numDices = 0;

        const weaponRoll = new DiceRollContainer(this.actor);
        weaponRoll.attribute = this.object.dice1;

        if (this.object.weaponType == "Damage") {
            let prevtext = false;

            weaponRoll.origin = "damage";
            weaponRoll.action = `${this.object.name} (${game.i18n.localize("wod.dialog.weapon.damage")})`;

            if (this.object.attributeName != "") {
                template.push(`${this.object.attributeName} (${this.object.attributeValue})`);
                prevtext = true;
            }

            if (this.object.abilityValue > 0) {
                template.push(this.object.abilityValue);
                prevtext = true;
            }

            if (this.object.bonus != 0) {
                template.push(this.object.bonus);
                prevtext = true;
            }

            if (this.object.extraSuccesses > 0) {
                template.push(this.object.extraSuccesses);
            }

            weaponRoll.damageCode = `(${this.object.damageCode})`;

            // if several targets number of dices will be different
            if (this.object.numberoftargets == 1) {
                numDices = parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + parseInt(this.object.bonus) + parseInt(this.object.extraSuccesses);
            }
        }
        else {
            weaponRoll.origin = "attack";
            weaponRoll.action = `${this.object.name} (${game.i18n.localize("wod.dialog.weapon.attack")})`;
            template.push(`${this.object.attributeName} (${this.object.attributeValue})`);

            if (this.object.abilityName != "") {
                template.push(`${this.object.abilityName} (${this.object.abilityValue})`);
            }

            if (this.object.modename != "single") {
                if (this.object.modename == "burst") {
                    weaponRoll.extraInfo.push(game.i18n.localize("wod.dialog.weapon.usingburst"));
                }
                if (this.object.modename == "fullauto") {
                    weaponRoll.extraInfo.push(game.i18n.localize("wod.dialog.weapon.usingauto"));
                }
                if (this.object.modename == "spray") {
                    weaponRoll.extraInfo.push(game.i18n.localize("wod.dialog.weapon.usingspray"));
                }
            }
    
            if (CombatHelper.ignoresPain(this.actor)) {
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
        weaponRoll.dicetext = template;
        weaponRoll.bonus = parseInt(this.object.bonus);
        
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

            const numberOfSuccesses = await NewRollDice(weaponRoll);   
            
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

                let spraytext = `${game.i18n.localize("wod.dialog.weapon.sprayresult")}`;
                spraytext = spraytext.replace("[0]", this.object.numberoftargets);
                spraytext = spraytext.replace("[1]", numberTargets);

                weaponRoll.extraInfo.push(spraytext);
                weaponRoll.targetlist = targetlist;
                NewRollDice(weaponRoll);
            }
            else {
                NewRollDice(weaponRoll);
            }
        }
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }   
}

