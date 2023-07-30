import { NewRollDice } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

export class Shape {
    constructor(actor) {
        this.canRoll = false;
        this.close = false;

        this.difficulty = -1;
        this.bonus = 0;
        this.successesRequired = 0;
        this.numSuccesses = 0;
        this.selectedShape = "";
    }
}

export class DialogShapeChange extends FormApplication {
    constructor(actor, shape) {
        super(shape, {submitOnChange: true, closeOnSubmit: false});
        this.actor = actor;
        this.isDialog = true;
        
        this.options.title = `${this.actor.name} - ${game.i18n.localize("wod.dialog.shapechange.headline")}`;
    }

    /**
        * Extend and override the default options used by the 5e Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["wod20 wod-dialog shapechange-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-shapechange.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();       
        
        data.config = CONFIG.wod;
        data.actorData = this.actor.system;

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.dialog-difficulty-button')
            .click(this._setDifficulty.bind(this));

        html
            .find('.dialog-shapechange-button')
            .click(this._setShape.bind(this));

        html
            .find('.actionbutton')
            .click(this._shiftform.bind(this));

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

        this.object.bonus = parseInt(formData["shiftMod"]);
        this.object.canRoll = await this._calculateDifficulty();

        this.render(false);
    }

    _setDifficulty(event) {
        event.preventDefault();

        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-difficulty-button");
        const diff = element.value;   

        this.object.difficulty = parseInt(diff);            
        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == diff) {
                $(this).addClass("active");
            }
        });
    }

    async _setShape(event) {
        event.preventDefault();

        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-shapechange-button");
        const shape = element.value;   

        this.object.selectedShape = shape;

        this.object.canRoll = await this._calculateDifficulty(); 
        this.object.successesRequired = await this._calculateSuccessesRequired();
        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == shape) {
                $(this).addClass("active");
            }
        });

        this.render();
    }
    

    /* clicked on check shift form */
    async _shiftform(event) {
        let template = [];
        let extraInfo = [];
        let attribute = game.i18n.localize(this.actor.system.attributes.stamina.label);
        let ability = (this.actor.system.abilities.primalurge.altlabel == "" ? game.i18n.localize(this.actor.system.abilities.primalurge.label) : this.actor.system.abilities.primalurge.altlabel);

        this.object.canRoll = this.object.difficulty > -1 ? true : false;

        template.push(`${attribute} (${this.actor.system.attributes.stamina.total})`);
        template.push(`${ability} (${this.actor.system.abilities.primalurge.value})`);

        extraInfo.push(`${game.i18n.localize("wod.dialog.numbersuccesses")}: ${this.object.numSuccesses}`);
        extraInfo.push(`${game.i18n.localize("wod.dialog.neededsuccesses")}: ${this.object.successesRequired}`);        

        if (this.object.canRoll) {            
            const shiftRoll = new DiceRollContainer(this.actor);
            shiftRoll.action = game.i18n.localize("wod.dialog.shapechange.headline");
            shiftRoll.attribute = "stamina";
            shiftRoll.dicetext = template;
            shiftRoll.bonus = parseInt(this.object.bonus);
            shiftRoll.extraInfo = extraInfo;
            shiftRoll.origin = "general";
            shiftRoll.numDices = parseInt(this.actor.system.attributes.stamina.total) + parseInt(this.actor.system.abilities.primalurge.value) + parseInt(this.object.bonus);
            shiftRoll.woundpenalty = parseInt(this.actor.system.health.damage.woundpenalty);
            shiftRoll.difficulty = parseInt(this.object.difficulty);                     
            
            const successes = await NewRollDice(shiftRoll);
            this.object.numSuccesses += parseInt(successes);

            if (this.object.numSuccesses >= this.object.successesRequired) {
                this.object.close = true;
            }
            else {
                this.render();
            }
        }
        else {
            ui.notifications.warn(game.i18n.localize("wod.dialog.shapechange.noshape"));
        }
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    

    async _calculateDifficulty() {
        if (this.object.selectedShape == "homid") {
            this.object.difficulty = 6;
        }
        else if (this.object.selectedShape == "glabro") {
            this.object.difficulty = 7;
        }
        else if (this.object.selectedShape == "crinos") {
            this.object.difficulty = 6;
        }
        else if (this.object.selectedShape == "hispo") {
            this.object.difficulty = 7;
        }
        else if (this.object.selectedShape == "lupus") {
            this.object.difficulty = 6;
        }
        else {
            this.object.difficulty = 0;            
            return false;
        }	

        return true;
    }

    async _calculateSuccessesRequired() {
        let mod = 0;

        if (this.actor.system.shapes.homid.isactive) {
            mod = 0;
        }
        else if (this.actor.system.shapes.glabro.isactive) {
            mod = 1;
        }
        else if (this.actor.system.shapes.crinos.isactive) {
            mod = 2;
        }
        else if (this.actor.system.shapes.hispo.isactive) {
            mod = 3;
        }
        else if (this.actor.system.shapes.lupus.isactive) {
            mod = 4;
        }

        if (this.object.selectedShape == "homid") {
            mod = mod - 0;
        }
        else if (this.object.selectedShape == "glabro") {
            mod = mod - 1;
        }
        else if (this.object.selectedShape == "crinos") {
            mod = mod - 2;
        }
        else if (this.object.selectedShape == "hispo") {
            mod = mod - 3;
        }
        else if (this.object.selectedShape == "lupus") {
            mod = mod - 4;
        }

        if (mod < 0) {
            mod = mod * -1;
        }

        return mod;
    }
}

