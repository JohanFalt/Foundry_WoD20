import CreateHelper from "../scripts/create-helpers.js";

export class Variant {
    constructor(actor) {
        this.canRoll = false;
        this.close = false;

        if (actor.type == CONFIG.worldofdarkness.sheettype.changeling) {
            this.variant = actor.system.settings.variant;
        }
        if (actor.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
            this.variant = actor.system.changingbreed;
        }
        
        this.type = actor.type;
    }
}

export class DialogVariant extends FormApplication {
    constructor(actor, variant) {
        super(variant, {submitOnChange: true, closeOnSubmit: false});
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
            classes: ["wod20 wod-dialog dialog-top"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-variant.hbs",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();

        data.actorData = this.actor.system;
        data.config = CONFIG.worldofdarkness;    

        if (this.actor.type != CONFIG.worldofdarkness.sheettype.changingbreed) {
            data.sheettype = this.actor.type.toLowerCase() + "Dialog";
        }
        else {
            data.sheettype = "werewolfDialog";
        }

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.actionbutton')
            .click(this._select.bind(this));

        html
            .find('.savebutton')
            .click(this._save.bind(this));
    }

    async _updateObject(event, formData){
        if (this.object.close) {
            this.close();
            return;
        }

        event.preventDefault();       
    }

    close() {
        // do something for 'on close here'
        super.close()
    }

    async _select(event) {
        event.preventDefault();
        const element = event.currentTarget;
		const dataset = element.dataset;

        this.object.variant = dataset.value;
        this.render();
    }

    async _save(event) {
        if (this.object.variant == "") {
            ui.notifications.warn(game.i18n.localize("wod.dialog.variant.notype"));
            return;
        }

        const actorData = foundry.utils.duplicate(this.actor);

        if (this.object.type == CONFIG.worldofdarkness.sheettype.changeling) {
            await CreateHelper.SetChangingVariant(actorData, this.object.variant);
        }
        else if (this.object.type == CONFIG.worldofdarkness.sheettype.vampire) {
            await CreateHelper.SetVampireVariant(actorData, this.object.variant);
        }
        else if (this.object.type == CONFIG.worldofdarkness.sheettype.wraith) {
            actorData.system.settings.variant = this.object.variant;
        }
        else if (this.object.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
            await CreateHelper.SetShifterAttributes(actorData, this.object.variant);
        }
        else if (this.object.type == CONFIG.worldofdarkness.sheettype.mortal) {
			await CreateHelper.SetMortalVariant(this.actor, actorData, this.object.variant);
		}
        else if (this.object.type == CONFIG.worldofdarkness.sheettype.creature) {
			await CreateHelper.SetCreatureVariant(actorData, this.object.variant);
		}
        else {
            actorData.system.settings.variant = this.object.variant;
        }

        actorData.system.settings.isupdated = false;
        await this.actor.update(actorData);
        await CreateHelper.SetVariantItems(this.actor, this.object.variant, game.data.system.version);

        this.close();
    }
}
