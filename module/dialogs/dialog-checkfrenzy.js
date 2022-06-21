import { rollDice } from "../scripts/roll-dice.js";
import { DiceRoll } from "../scripts/roll-dice.js";

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

        if (actor.data.data.renown.rank == 5) {
            this.successesRequired = 5;
        }
        else {
            this.successesRequired = 4;     
        }
        
        this.isCrinos = actor.data.data.shapes.crinos.isactive;
        this.hasAuspice = actor.data.data.auspice; 
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
        
        this.options.title = `${this.actor.name} - ${game.i18n.localize("wod.dialog.checkfrenzy.headline")}`;
    }

    /**
        * Extend and override the default options used by the 5e Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["checkfrenzy-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-checkfrenzy.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();       
        
        data.config = CONFIG.wod;
        data.actorData = this.actor.data.data;

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

        if (this.object.type == CONFIG.wod.sheettype.werewolf) {
            this.object.canRoll = this._calculateDifficulty(false);
        }
        else if (this.object.type == CONFIG.wod.sheettype.vampire) {
            this.object.canRoll = false;
        }

        this.render(false);
    }

    _setDifficulty(event) {
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-difficulty-button");
        const index = element.value;   

        this.object.totalDifficulty = index;                

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == index) {
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
        let templateHTML = `<h2>${game.i18n.localize("wod.dialog.checkfrenzy.headline")}</h2>`;
        let frenzyBonus = 0;
        let numDices = 0;

        try {
            frenzyBonus = parseInt(this.actor.data.data.rage.bonus);
        }
        catch (e) {
            frenzyBonus = 0
        }

        if (this.object.type == CONFIG.wod.sheettype.werewolf) {
            this.object.canRoll = this._calculateDifficulty(true);
            templateHTML += `${game.i18n.localize("wod.dialog.checkfrenzy.frenzysuccesses")}: ${this.object.successesRequired}`;
            numDices = parseInt(this.actor.data.data.rage.roll) + frenzyBonus + parseInt(this.object.rageBonus);
            this.object.close = true;
        }
        else if (this.object.type == CONFIG.wod.sheettype.vampire) {
            this.object.canRoll = this.object.totalDifficulty > -1 ? true : false;
            templateHTML += `${game.i18n.localize("wod.dialog.checkfrenzy.numbersuccesses")}: ${this.object.numSuccesses}`;
            numDices = parseInt(this.actor.data.data.virtues.selfcontrol.roll) + frenzyBonus + parseInt(this.object.rageBonus);
        }

        if (this.object.canRoll) {
            
            const frenzyRoll = new DiceRoll(this.actor);
            frenzyRoll.handlingOnes = CONFIG.wod.handleOnes;    
            frenzyRoll.origin = "frenzy";
            frenzyRoll.numDices = numDices;
            frenzyRoll.difficulty = parseInt(this.object.totalDifficulty);          
            frenzyRoll.templateHTML = templateHTML;        

            const successes = await rollDice(frenzyRoll);

            // const successes = await rollDice(
            //                                 CONFIG.handleOnes,
            //                                 numDices,
            //                                 this.actor,
            //                                 templateHTML,
            //                                 parseInt(this.object.totalDifficulty));   

            this.object.numSuccesses += parseInt(successes);
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

        if (this.actor.data.data.renown.rank == 3) {
            difficulty = baseDifficulty + 1;
        }
        if (this.actor.data.data.renown.rank == 4) {
            difficulty = baseDifficulty + 2;
        }
        if (this.actor.data.data.renown.rank == 5) {
            difficulty = baseDifficulty + 2;	
        }
        else {
            difficulty = baseDifficulty;
        }

        this.object.totalDifficulty = difficulty;

        return true;
    }
}
