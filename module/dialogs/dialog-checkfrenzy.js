import { DiceRoller } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

export class WerewolfFrenzy {
    constructor(actor, data) {
        this.canRoll = false;
        this.close = false;
        this.selectedMoon = undefined;
        this.rageBonus = 0;
        this.totalDifficulty = 0;
        this.type = data.type;
        this.numSuccesses = 0;
        this.sheettype = "werewolfDialog";

        if (actor.system.renown.rank == 6) {
            this.successesRequired = 6;
        }
        else if (actor.system.renown.rank == 5) {
            this.successesRequired = 5;
        }
        else {
            this.successesRequired = 4;     
        }
        
        this.isCrinos = actor.system.shapes.crinos.isactive;
        this.hasAuspice = actor.system.auspice; 
    }
}

export class VampireFrenzy {
    constructor(data) {
        this.canRoll = false;
        this.close = false;
        this.rageBonus = 0;
        this.totalDifficulty = 6;   
        this.type = data.type;
        this.numSuccesses = 0;
        this.sheettype = "vampireDialog";
    }
}


export class DialogCheckFrenzy extends FormApplication {
    constructor(actor, frenzy) {
        super(frenzy, {submitOnChange: true, closeOnSubmit: false});
        this.actor = actor;
        this.isDialog = true;
        
        this.options.title = `${this.actor.name} - ${game.i18n.localize("wod.dialog.checkfrenzy.headline")}`;
    }

    /**
        * Extend and override the default options used by the WoD Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["wod20 wod-dialog checkfrenzy-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-checkfrenzy.hbs",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();       
        
        data.config = CONFIG.worldofdarkness;
        data.actorData = this.actor.system;

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.dialog-difficulty-button')
            .click(this._setDifficulty.bind(this));

        html
            .find('.dialog-moon-button')
            .click(this._setMoon.bind(this));

        html
            .find('.actionbutton')
            .click(this._checkFrenzy.bind(this));

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

        this.object.rageBonus = parseInt(formData["rageMod"]);

        if (this.object.type == CONFIG.worldofdarkness.sheettype.werewolf) {
            this.object.canRoll = this._calculateDifficulty(false);
        }
        else if (this.object.type == CONFIG.worldofdarkness.sheettype.vampire) {
            this.object.canRoll = false;
        }

        this.render();
    }

    close() {
        // do something for 'on close here'
        super.close()
    }

    _setDifficulty(event) {
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-difficulty-button");
        const index = element.value;   

        this.object.totalDifficulty = parseInt(index);     
        steps.removeClass("active");

        steps.each(function (i) {
            if (parseInt(this.value) == index) {
                $(this).addClass("active");
            }
        });
    }

    _setMoon(event) {
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-moon-button");
        const index = element.value;   

        this.object.selectedMoon = index;

        this.object.canRoll = this._calculateDifficulty(false); 

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == index) {
                $(this).addClass("active");
            }
        });
    }    

    /* clicked on check Frenzy */
    async _checkFrenzy(event) {
        let frenzyBonus = 0;
        let numDices = 0;
        let template = [];

        try {
            frenzyBonus = parseInt(this.actor.system.advantages.rage.bonus);
        }
        catch (e) {
            frenzyBonus = 0
        }

        if (this.object.type == CONFIG.worldofdarkness.sheettype.werewolf) {
            this.object.canRoll = this._calculateDifficulty(true);
            template.push(`${game.i18n.localize("wod.dialog.neededsuccesses")}: ${this.object.successesRequired}`);
            numDices = parseInt(this.actor.system.advantages.rage.roll) + frenzyBonus + parseInt(this.object.rageBonus);
            this.object.close = true;
        }
        else if (this.object.type == CONFIG.worldofdarkness.sheettype.vampire) {
            this.object.canRoll = this.object.totalDifficulty > -1 ? true : false;
            template.push(`${game.i18n.localize("wod.dialog.numbersuccesses")}: ${this.object.numSuccesses}`);
            numDices = parseInt(this.actor.system.advantages.virtues.selfcontrol.roll) + frenzyBonus + parseInt(this.object.rageBonus);            
        }

        if (this.object.canRoll) {            
            const frenzyRoll = new DiceRollContainer(this.actor);
            frenzyRoll.action = game.i18n.localize("wod.dialog.checkfrenzy.headline");
            frenzyRoll.dicetext = template;
            frenzyRoll.bonus = frenzyBonus;
            frenzyRoll.origin = "general";
            frenzyRoll.numDices = numDices;
            frenzyRoll.woundpenalty = 0;
            frenzyRoll.usewillpower = false;
            frenzyRoll.difficulty = parseInt(this.object.totalDifficulty);       

            this.object.numSuccesses += await DiceRoller(frenzyRoll);            
        }
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    

    _calculateDifficulty(showMessage) {
        let baseDifficulty = -1;
        let difficulty = -1;

        if (this.object.selectedMoon == "new") {
            if ((this.object.hasAuspice == "Ragabash") || (this.object.isCrinos)) {
                baseDifficulty = 7;
            }
            else {
                baseDifficulty = 8;
            }
        }
        else if (this.object.selectedMoon == "crescent") {
            if ((this.object.hasAuspice == "Theurge") || (this.object.isCrinos)) {
                baseDifficulty = 6;
            }
            else {
                baseDifficulty = 7;
            }
        }
        else if (this.object.selectedMoon == "half") {
            if ((this.object.hasAuspice == "Philodox") || (this.object.isCrinos)) {
                baseDifficulty = 5;
            }
            else {
                baseDifficulty = 6;
            }
        }
        else if (this.object.selectedMoon == "gibbous") {
            if ((this.object.hasAuspice == "Galliard") || (this.object.isCrinos)) {
                baseDifficulty = 4;
            }
            else {
                baseDifficulty = 5;
            }
        }
        else if (this.object.selectedMoon == "full") {
            if ((this.object.hasAuspice == "Ahroun") || (this.object.isCrinos)) {
                baseDifficulty = 3;
            }
            else {
                baseDifficulty = 4;
            }
        }
        else {
            this.object.totalDifficulty = 0;

            if (showMessage) {
                ui.notifications.warn(game.i18n.localize("wod.dialog.checkfrenzy.nomoonphase"));
            }

            return false;
        }				

        if (this.actor.system.renown.rank == 3) {
            difficulty = baseDifficulty + 1;
        }
        else if (this.actor.system.renown.rank >= 4) {
            difficulty = baseDifficulty + 2;
        }
        else {
            difficulty = baseDifficulty;
        }

        this.object.totalDifficulty = difficulty;

        return true;
    }
}
