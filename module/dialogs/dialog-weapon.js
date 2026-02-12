import CombatHelper from "../scripts/combat-helpers.js";
import BonusHelper from "../scripts/bonus-helpers.js";

import { DiceRoller } from "../scripts/roll-dice.js";
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
        this.dodgebonus = 0;
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
        this.dodgebonus = 0;
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
        this.dodgebonus = 0;
        this.accuracy = parseInt(item.system.damage["bonus"]);
        this.difficulty = 6;
        this.damageType = item.system.damage["type"];
        this.damageCode = game.i18n.localize(CONFIG.worldofdarkness.damageTypes[this.damageType]);

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
        * Extend and override the default options used by the WoD Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["wod20 wod-dialog weapon-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-weapon.hbs",
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
        data.config = CONFIG.worldofdarkness;

        if (this.actor.type == "PC") {
            data.actorData.type = this.actor.system.settings.game;
            data.object.sheettype = data.actorData.type.toLowerCase() + "Dialog";

            const abilities = Object.values(this.actor.system.abilities ?? {});

            data.config.meleeAbilities = abilities
                                .filter(item => item.type === "Ability" && item.system.settings.isvisible && item.system.settings.ismeleeweapon)
                                .sort((a, b) => game.i18n.localize(a.system.label).localeCompare(game.i18n.localize(b.system.label)));

            data.config.rangedAbilities = abilities
                                .filter(item => item.type === "Ability" && item.system.settings.isvisible && item.system.settings.israngedeweapon)
                                .sort((a, b) => game.i18n.localize(a.system.label).localeCompare(game.i18n.localize(b.system.label)));
        }
        else {
            data.actorData.type = this.actor.type;

            if (this.actor.system?.listdata?.meleeAbilities.length > 0) 
                data.config.meleeAbilities = this.actor.system.listdata.meleeAbilities;

            if (this.actor.system?.listdata?.rangedAbilities.length > 0) 
                data.config.rangedAbilities = this.actor.system.listdata.rangedAbilities;

            if (data.actorData.type != CONFIG.worldofdarkness.sheettype.changingbreed) {
                data.object.sheettype = data.actorData.type.toLowerCase() + "Dialog";
            }
            else {
                data.object.sheettype = "werewolfDialog";
            }       
        }        

        let actortype = this.actor.type.toLowerCase();

        if (this.actor?.system?.settings?.splat !== undefined) {
            actortype = this.actor.system.settings.splat;
        }

        if (CONFIG.worldofdarkness.alwaysspeciality[actortype] == undefined) {
            actortype = CONFIG.worldofdarkness.sheettype.vampire.toLowerCase();
        }

        // is dice1 an Attributes
        if ((this.actor.system?.attributes != undefined) && (data.actorData.attributes[data.object.dice1]?.value != undefined)) {
            data.object.attributeValue = parseInt(data.actorData.attributes[data.object.dice1].total);
            data.object.attributeName = game.i18n.localize(data.actorData.attributes[data.object.dice1].label);

            if (parseInt(data.actorData.attributes[data.object.dice1].value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
                data.object.hasSpeciality = true;
                attributeSpeciality = data.actorData.attributes[data.object.dice1].speciality;
            }            
        }
        // is dice1 an Advantage
        else if (data.actorData[data.object.dice1]?.roll != undefined) { 
            data.object.attributeValue = parseInt(data.actorData[data.object.dice1].roll);
            data.object.attributeName = game.i18n.localize(data.actorData[data.object.dice1].label);

            // om willpower
            if ((this.actor.system[data.object.dice1].label == "wod.advantages.willpower") && (CONFIG.worldofdarkness.attributeSettings == "5th")) {
                if (parseInt(data.actorData.attributes?.composure.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
                    data.object.hasSpeciality = true;
                    attributeSpeciality = data.actorData.attributes.composure.speciality;
                }

                if ((parseInt(data.actorData.attributes?.resolve.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) && (data.actorData.attributes?.resolve.speciality != "")) {
                    data.object.hasSpeciality = true;

                    if (attributeSpeciality != "") {
                        attributeSpeciality += ", ";
                    }

                    attributeSpeciality += data.actorData.attributes.resolve.speciality;
                }
            }
        }

        if (this.actor.type == "PC") {
            // Only try to get ability if dice2 is set and not empty
            if (data.object.dice2 && data.object.dice2 !== "" && this.actor.api) {
                const abilityItem = this.actor.api.getAbility(data.object.dice2);
                if (abilityItem) {
                    data.object.abilityValue = parseInt(abilityItem.system.value);
                    data.object.abilityName = game.i18n.localize(abilityItem.system.label);
                    
                    if ((parseInt(abilityItem.system.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) || 
                        (CONFIG.worldofdarkness.alwaysspeciality[actortype].includes(abilityItem.system.id))) {
                        data.object.hasSpeciality = true;
                        abilitySpeciality = abilityItem.system.speciality;
                    }
                }
            }
        }
        else if ((this.actor.system?.abilities != undefined) && (data.actorData.abilities[data.object.dice2]?.value != undefined)) {
            data.object.abilityValue = parseInt(data.actorData.abilities[data.object.dice2].value);

            if (data.actorData.abilities[data.object.dice2] == undefined) {
                data.object.abilityName = game.i18n.localize(data.actorData.abilities[data.object.dice2].label);
            }
            else {
                data.object.abilityName = (data.actorData.abilities[data.object.dice2].altlabel == "") ? game.i18n.localize(data.actorData.abilities[data.object.dice2].label) : data.actorData.abilities[data.object.dice2].altlabel;            
            }

            if ((parseInt(data.actorData.abilities[data.object.dice2].value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) || (CONFIG.worldofdarkness.alwaysspeciality[actortype].includes(data.actorData.abilities[data.object.dice2]._id))) {
                data.object.hasSpeciality = true;
                abilitySpeciality = data.actorData.abilities[data.object.dice2].speciality;
            }
        }
        else if (data.object.dice2 == "custom") {
            if (this.object.secondaryabilityid != "") {
                const item = await this.actor.getEmbeddedDocument("Item", this.object.secondaryabilityid);

                if (!item) {
                    return;
                }
                
                this.object.abilityValue = parseInt(item.system.value);
                this.object.abilityName = item.system.label;

                if (parseInt(item.system.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
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
        this.object.useWillpower = formData["useWillpower"];

        if (this.object.useSpeciality && CONFIG.worldofdarkness.usespecialityReduceDiff && !this.object.usedReducedDiff) {
            this.object.difficulty -= parseInt(CONFIG.worldofdarkness.specialityReduceDiff);
            this.object.usedReducedDiff = true;
        }
        else if (!this.object.useSpeciality && CONFIG.worldofdarkness.usespecialityReduceDiff && this.object.usedReducedDiff){
            this.object.difficulty += parseInt(CONFIG.worldofdarkness.specialityReduceDiff);
            this.object.usedReducedDiff = false;
        }

        try {
            this.object.bonus = parseInt(formData["bonus"]);
        }
        catch {
            this.object.bonus = 0;
        }

        try {
            this.object.dodgebonus = parseInt(formData["dodgebonus"]);
        }
        catch {
            this.object.dodgebonus = 0;
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
        const item = await this.actor.getEmbeddedDocument("Item", abilityId);

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
        weaponRoll.ability = this.object.dice2;

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

            if (this.object.extraSuccesses > 0) {
                template.push(this.object.extraSuccesses);
            }

            weaponRoll.damageCode = `(${this.object.damageCode})`;

            if (CONFIG.worldofdarkness.usePenaltyDamage) {
                if (CombatHelper.ignoresPain(this.actor)) {
                    woundPenaltyVal = 0;			}				
                else {
                    woundPenaltyVal = parseInt(this.actor.system.health.damage.woundpenalty);
                }
            }

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

        let difficulty = this.object.difficulty;

        if (await BonusHelper.CheckAttackDiff(this.actor, this.object.weaponType)) {
            const mod = await BonusHelper.GetAttackDiff(this.actor, this.object.weaponType);

            difficulty += mod;
            weaponRoll.extraInfo.push(game.i18n.localize("wod.dialog.weapon.attackdiffchat") + ` ${mod}`);
        }
        if (await BonusHelper.CheckAttackBuff(this.actor, this.object.weaponType)) {
            const mod = await BonusHelper.GetAttackBuff(this.actor, this.object.weaponType);

            numDices += mod;
            weaponRoll.extraInfo.push(game.i18n.localize("wod.dialog.weapon.attackbonuschat") + ` ${mod}`);
        }

        weaponRoll.numDices = numDices;
        weaponRoll.difficulty = difficulty;          
        weaponRoll.dicetext = template;
        weaponRoll.usewillpower = this.object.useWillpower;
        weaponRoll.woundpenalty = parseInt(woundPenaltyVal);
        
        if (weaponRoll.origin == "attack") {            
            weaponRoll.systemText = this.object.system;
            weaponRoll.speciality = this.object.useSpeciality;
            weaponRoll.specialityText = specialityText;
        }        
        else {
            if (!CONFIG.worldofdarkness.usePenaltyDamage) {
                weaponRoll.woundpenalty = 0;
            }
            weaponRoll.speciality = false;
            weaponRoll.systemText = "";
        }

        if ((weaponRoll.origin == "attack") && (this.object.rollattack)) {
            weaponRoll.bonus = parseInt(this.object.bonus);

            let item = await this.actor.getEmbeddedDocument("Item", this.object._id);            
            
            // Uppdatera rolldamage från det hämtade objektet för att säkerställa aktuellt värde
            this.object.rolldamage = item.system.damage?.isrollable ?? false;

            if (this.object.dice2 == "custom") {
                const itemData = foundry.utils.duplicate(item);
                itemData.system.attack.secondaryabilityid = this.object.secondaryabilityid;
                await item.update(itemData);
            }

            const numberOfSuccesses = await DiceRoller(weaponRoll);   
            
            // DEBUGGING: Logga värden för att identifiera problem
            console.log("Attack roll - numberOfSuccesses:", numberOfSuccesses);
            console.log("Attack roll - this.object.rolldamage:", this.object.rolldamage);
            console.log("Attack roll - item.system.damage:", item.system.damage);
            
            if ((numberOfSuccesses > 0) && (this.object.rolldamage)) {
                // add number of successes to Damage roll
                item.system.extraSuccesses = parseInt(numberOfSuccesses) - 1;
                item.system.numberoftargets = this.object.numberoftargets;
                item.system.modename = this.object.modename;
                const damageData = new Damage(item);
                let rollDamage = new DialogWeapon(this.actor, damageData);
                rollDamage.render(true);
            }
            else {
                // DEBUGGING: Logga varför damage inte triggas
                console.log("Damage roll not triggered - numberOfSuccesses:", numberOfSuccesses, 
                           "rolldamage:", this.object.rolldamage);
            }
        } 
        else {
            weaponRoll.bonus = parseInt(this.object.bonus) +  parseInt(this.object.dodgebonus);

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
                         numDices: parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + weaponRoll.bonus
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
                DiceRoller(weaponRoll);
            }
            else {
                DiceRoller(weaponRoll);
            }
        }
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }   
}

