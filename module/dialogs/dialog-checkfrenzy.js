import { rollDice } from "../scripts/roll-dice.js";

export class Frenzy {
    constructor(data) {
        this.canRoll = false;
        this.close = false;
        this.selectedMoon = undefined;
        this.rageBonus = 0;
        this.totalDifficulty = 0;
        this.successesRequired = 4;

        
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
            classes: ["checkfrenzy-dialog", "werewolfDialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-checkfrenzy.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();

        this.object.isCrinos = this.actor.data.data.shapes.crinos.active;
        this.object.hasAuspice = this.actor.data.data.auspice; 

        //data.config = CONFIG.wod;
        //data.actorData = this.actor.data.data;

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

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

        this.object.selectedMoon = formData["moon"];
        this.object.rageBonus = parseInt(formData["rageMod"]);
        this.object.canRoll = this._calculateDifficulty(false);
    }
    

    /* clicked on check Frenzy */
    _checkFrenzy(event) {
        let templateHTML = "";
        let frenzyBonus = 0;

        this.object.canRoll = this._calculateDifficulty(true);

        if (this.object.canRoll) {
            templateHTML = `<h2>${game.i18n.localize("wod.dialog.checkfrenzy.headline")}</h2>`;
            templateHTML += `${game.i18n.localize("wod.dice.frenzysuccesses")}: ${this.object.successesRequired}`;

            try {
                frenzyBonus = parseInt(this.actor.data.data.rage.bonus);
            }
            catch (e) {
                frenzyBonus = 0
            }

            rollDice(
                CONFIG.handleOnes,
                parseInt(this.actor.data.data.rage.roll) + frenzyBonus + parseInt(this.object.rageBonus),
                this.actor,
                templateHTML,
                parseInt(this.object.totalDifficulty));   
                
            this.object.close = true;
        }
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    

    _calculateDifficulty(showMessage) {
        let baseDifficulty = -1;
        let difficulty = -1;
        let successesRequired = 0;

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
            this.object.successesRequired = 4;

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
            successesRequired = 1;					
        }
        else {
            difficulty = baseDifficulty;
        }

        this.object.totalDifficulty = difficulty;
        this.object.successesRequired = 4 + successesRequired

        return true;
    }
}
