import { DiceRoller } from "../scripts/roll-dice.js";
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
        this.shapes = {};
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
        * Extend and override the default options
        * @returns {Object}
    */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["wod20 wod-dialog shapechange-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-shapechange.hbs",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();       
        
        data.config = CONFIG.worldofdarkness;
        data.actorData = this.actor.system;
        data.actorType = this.actor.type === "PC" ? this.actor.system.settings.splat : this.actor.type.toLowerCase();

        if (this.actor.type === "PC") {
            // Build shapes structure from shape items for PC actors
            // This structure needs to match Legacy actor structure for template compatibility
            data.actorData.shapes = {};
            
            // Get all shape items (Trait items with system.type === "wod.types.shapeform")
            const shapeItems = this.actor.items.filter(item => 
                item.type === "Trait" && 
                item.system?.type === "wod.types.shapeform"
            );
            
            // Sort shapes by system.order
            shapeItems.sort((a, b) => {
                const orderA = a.system?.order ?? 0;
                const orderB = b.system?.order ?? 0;
                return orderA - orderB;
            });
            
            // Build shapes object matching Legacy actor structure
            // Shape names are mapped to lowercase keys (e.g., "Homid" -> "homid")
            for (const shapeItem of shapeItems) {
                const shapeKey = shapeItem.name.toLowerCase();
                data.actorData.shapes[shapeKey] = {
                    isactive: shapeItem.system?.isactive ?? false
                };
            }
            
            // Store shapes in this.object.shapes for easy access in methods
            this.object.shapes = data.actorData.shapes;
        }
        else {
            // For Legacy actors, copy shapes from actor.system to object.shapes
            this.object.shapes = this.actor.system.shapes || {};
        }

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
        this.object.useWillpower = formData["useWillpower"];
        this.object.canRoll = await this._calculateDifficulty();

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
        let attributevalue = this.actor.system.attributes.stamina.total;
        let ability = "";
        let abilityvalue = 0;
        let woundpenalty = this.actor.system.health.damage.woundpenalty;

        if (this.actor.type === "PC" && this.actor.api) {      
            const primalurge = this.actor.api.getAbility("primalurge");
            
            ability = game.i18n.localize(primalurge?.system?.label) ?? "";
            abilityvalue = primalurge?.system?.value ?? 0;
        }
        else {
            ability = (this.actor.system.abilities.primalurge.altlabel == "" ? game.i18n.localize(this.actor.system.abilities.primalurge.label) : this.actor.system.abilities.primalurge.altlabel);
            abilityvalue = this.actor.system.abilities.primalurge.value;
        }

        this.object.canRoll = this.object.difficulty > -1 ? true : false;

        template.push(`${attribute} (${attributevalue})`);
        template.push(`${ability} (${abilityvalue})`);

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
            shiftRoll.numDices = parseInt(attributevalue) + parseInt(abilityvalue) + parseInt(this.object.bonus);
            shiftRoll.woundpenalty = parseInt(woundpenalty);
            shiftRoll.difficulty = parseInt(this.object.difficulty);  
            shiftRoll.usewillpower = this.object.useWillpower;                    
            
            const successes = await DiceRoller(shiftRoll);
            
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
        if (this.object.shapes.homid?.isactive) {
            this.object.difficulty = 6;
        }
        else if (this.object.shapes.glabro?.isactive) {
            this.object.difficulty = 7;
        }
        else if (this.object.shapes.crinos?.isactive) {
            this.object.difficulty = 6;
        }
        else if (this.object.shapes.hispo?.isactive) {
            this.object.difficulty = 7;
        }
        else if (this.object.shapes.lupus?.isactive) {
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

        if (this.object.shapes.homid?.isactive) {
            mod = 0;
        }
        else if (this.object.shapes.glabro?.isactive) {
            mod = 1;
        }
        else if (this.object.shapes.crinos?.isactive) {
            mod = 2;
        }
        else if (this.object.shapes.hispo?.isactive) {
            mod = 3;
        }
        else if (this.object.shapes.lupus?.isactive) {
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

