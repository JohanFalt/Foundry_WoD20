import { NewRollDice } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

export class Soak {
    constructor(actor, difficulty) {
        this.canRoll = false;
        this.close = false;
        this.useChimerical = false;

        this.difficulty = difficulty;
        this.bonus = 0;
        this.damageKey = "bashing";
        this.attributeValue = 0;
        this.attributeBonus = 0;

        this.soaktype = "normal";
        if (actor.system.listdata.settings.haschimericalhealth != undefined) {
            this.useChimerical = actor.system.listdata.settings.haschimericalhealth;
        }

        this.sheettype = "";
    }
}

export class DialogSoakRoll extends FormApplication {
    constructor(actor, roll) {
        super(roll, {submitOnChange: true, closeOnSubmit: false});
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
            classes: ["wod20 wod-dialog soak-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-soak.hbs",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();
        data.actorData = this.actor.system;  
        data.actorData.type = this.actor.type; 
        data.config = CONFIG.worldofdarkness;

        if (data.actorData.type != CONFIG.worldofdarkness.sheettype.changingbreed) {
            data.object.sheettype = data.actorData.type.toLowerCase() + "Dialog";
        }
        else {
            data.object.sheettype = "werewolfDialog";
        }

        if (data.object.damageKey != "") {
            if (data.object.soaktype == "normal") {
                data.object.attributeValue = parseInt(data.actorData.soak[data.object.damageKey]);
                data.object.attributeBonus = parseInt(data.actorData.settings.soak[data.object.damageKey].bonus);
            }
            else if (data.object.soaktype == "chimerical") {
                data.object.attributeValue = parseInt(data.actorData.soak.chimerical[data.object.damageKey]);
                data.object.attributeBonus = parseInt(data.actorData.settings.soak.chimerical[data.object.damageKey].bonus);
            }
        }
        else {
            data.object.attributeValue = 0;
            data.object.attributeBonus = 0;
        }

        this.render();

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.dialog-difficulty-button')
            .click(this._setDifficulty.bind(this));   
            
        html
            .find('.dialog-attribute-button')
            .click(this._setDamageType.bind(this));

        html
            .find('.actionbutton')
            .click(this._soakRoll.bind(this));

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
        
        try {
            this.object.bonus = parseInt(formData["bonus"]);
        }
        catch {
            this.object.bonus = 0;
        }

        this.object.canRoll = this.object.damageKey != "" ? true : false;  
        this.object.useWillpower = formData["useWillpower"];

        this.getData();
    }

    close() {
        // do something for 'on close here'
        super.close()
    }

    _setDifficulty(event) {
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-difficulty-button");
        const index = parseInt(element.value);   

        this.object.difficulty = index;   
        this.object.canRoll = this.object.damageKey != "" ? true : false;         

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

    _setDamageType(event) {
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-attribute-button");
        const key = element.value;        

        if (key == "") {
            steps.removeClass("active");
            return;
        }

        const dataset = element.dataset;
        const type = dataset.type;

        this.object.damageKey = key;
        this.object.soaktype = type;

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == key) {
                $(this).addClass("active");
            }
        });
    }

    /* clicked to roll */
    _soakRoll(event) {
        if (this.object.close) {
            this.close();
            return;
        }

        this.object.canRoll = this.object.damageKey != "" ? true : false;     

        if (!this.object.canRoll) {
            ui.notifications.warn(game.i18n.localize("wod.dialog.soak.missingdamage"));
            return;
        }

        let template = [];
        let numDices = parseInt(this.object.attributeValue) + parseInt(this.object.bonus) + parseInt(this.object.attributeBonus);        
        let damage = `${game.i18n.localize(CONFIG.worldofdarkness.damageTypes[this.object.damageKey])}`;
        damage += ` (${this.object.attributeValue})`;

        if (this.object.attributeBonus > 0) {
            damage += ` + ${this.object.attributeBonus}`;
        }

        if (this.object.soaktype == "chimerical") {
            damage += ` ${game.i18n.localize('wod.health.chimerical')}`;
        }

        template.push(damage);

        const soakRoll = new DiceRollContainer(this.actor);
        soakRoll.action = game.i18n.localize("wod.dice.rollingsoak");
        soakRoll.attribute = "stamina";
        soakRoll.dicetext = template;
        soakRoll.bonus = parseInt(this.object.bonus);
        soakRoll.origin = "soak";
        soakRoll.numDices = numDices;
        soakRoll.woundpenalty = 0;
        soakRoll.difficulty = this.object.difficulty;     
        soakRoll.usewillpower = this.object.useWillpower;
        
        NewRollDice(soakRoll);

        this.object.close = true;
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    

}
