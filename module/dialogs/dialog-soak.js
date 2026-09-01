import { DiceRoller } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";
import CombatHelper from "../scripts/combat-helpers.js";

export class Soak {
    constructor(actor, difficulty) {
        this.canRoll = false;
        this.close = false;
        this.useChimerical = false;

        this.difficulty = difficulty;
        this.bonus = 0;
        this.incomingDamage = 0;
        this.damageKey = "bashing";
        this.attributeValue = 0;
        this.attributeBonus = 0;

        this.soaktype = "normal";

        if (actor.type === "PC") {
            this.useChimerical = actor.system.settings.usechimerical;
        }
        else {
            if (actor.system.listdata.settings.haschimericalhealth != undefined) {
                this.useChimerical = actor.system.listdata.settings.haschimericalhealth;
            }
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

        // Determine sheettype for dialog CSS classes
        let actortype = this.actor.type.toLowerCase();
        
        // For PC actors, use splat or variantsheet to determine type
        if (this.actor.type === "PC") {
            if (this.actor?.system?.settings?.splat && this.actor.system.settings.splat !== "") {
                actortype = this.actor.system.settings.splat.toLowerCase();
            }
            else if (this.actor?.system?.settings?.variantsheet && this.actor.system.settings.variantsheet !== "") {
                actortype = this.actor.system.settings.variantsheet.toLowerCase();
            }
        }

        if ((actortype != CONFIG.worldofdarkness.sheettype.changingbreed.toLowerCase()) && (actortype != CONFIG.worldofdarkness.splat.changingbreed.toLowerCase())) {
            data.object.sheettype = actortype + "Dialog";
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

        try {
            this.object.incomingDamage = parseInt(formData["incomingDamage"]);
            if (isNaN(this.object.incomingDamage) || this.object.incomingDamage < 0) {
                this.object.incomingDamage = 0;
            }
        }
        catch {
            this.object.incomingDamage = 0;
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

    /**
     * Total health boxes on the soak track (normal or chimerical).
     * @returns {number}
     */
    _getMaxHealthLevels() {
        return CombatHelper.GetMaxHealthLevels(this.actor.system);
    }

    /**
     * Current damage counts for the soak track.
     * @param {boolean} chimerical - Use chimerical damage track when true
     * @returns {{bashing: number, lethal: number, aggravated: number}}
     */
    _getDamageTrack(chimerical = false) {
        if (chimerical) {
            const chim = this.actor.system.health?.damage?.chimerical || {};
            return {
                bashing: parseInt(chim.bashing) || 0,
                lethal: parseInt(chim.lethal) || 0,
                aggravated: parseInt(chim.aggravated) || 0
            };
        }

        return {
            bashing: parseInt(this.actor.system.health?.damage?.bashing) || 0,
            lethal: parseInt(this.actor.system.health?.damage?.lethal) || 0,
            aggravated: parseInt(this.actor.system.health?.damage?.aggravated) || 0
        };
    }

    /**
     * How much incoming damage of the selected type can still be applied
     * (empty boxes; bashing→lethal upgrades; aggravated converting bashing/lethal).
     * @param {boolean} chimerical
     * @returns {number}
     */
    _getApplicableDamageCapacity(chimerical = false) {
        return CombatHelper.GetApplicableDamageCapacity(
            this._getDamageTrack(chimerical),
            this.object.damageKey,
            this._getMaxHealthLevels()
        );
    }

    /**
     * Apply unsoaked damage per V20/W20 Applying Damage (fill, then bashing→lethal upgrades).
     * PC uses PCActorAPI for normal damage; chimerical and legacy update system.health directly.
     */
    async _applyUnsoakedDamage(damageType, amount) {
        if (amount <= 0) {
            return 0;
        }

        const chimerical = this.object.soaktype === "chimerical";
        const capacity = this._getApplicableDamageCapacity(chimerical);
        amount = Math.min(amount, capacity);

        if (amount <= 0) {
            return 0;
        }

        if (chimerical) {
            const actorData = foundry.utils.duplicate(this.actor);
            const track = actorData.system.health.damage.chimerical;
            CombatHelper.ApplyDamageWithOverflow(track, damageType, amount, this._getMaxHealthLevels());
            actorData.system.settings.isupdated = false;
            await this.actor.update(actorData);
            return amount;
        }

        if (this.actor.type === "PC") {
            await this.actor.api.modifyHealth(damageType, amount);
            return amount;
        }

        const actorData = foundry.utils.duplicate(this.actor);
        CombatHelper.ApplyDamageWithOverflow(
            actorData.system.health.damage,
            damageType,
            amount,
            this._getMaxHealthLevels()
        );
        actorData.system.settings.isupdated = false;
        await this.actor.update(actorData);
        return amount;
    }

    /* clicked to roll */
    async _soakRoll(event) {
        event.preventDefault();

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

        const applicableCapacity = this._getApplicableDamageCapacity(this.object.soaktype === "chimerical");

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
        soakRoll.incomingDamage = parseInt(this.object.incomingDamage) || 0;
        soakRoll.maxApplicableDamage = applicableCapacity;
        
        const successes = await DiceRoller(soakRoll);

        const incoming = soakRoll.incomingDamage;
        if (incoming > 0) {
            const damageAfterSoak = Math.min(
                Math.max(0, incoming - successes),
                applicableCapacity
            );
            await this._applyUnsoakedDamage(this.object.damageKey, damageAfterSoak);
        }

        this.object.close = true;
        this.close();
    }

    /* clicked to close form */
    _closeForm(event) {
        event.preventDefault();
        this.object.close = true;
        this.close();
    }    

}
