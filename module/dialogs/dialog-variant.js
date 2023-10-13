import CreateHelper from "../scripts/create-helpers.js";

export class Variant {
    constructor(actor) {
        this.canRoll = false;
        this.close = false;

        if (actor.type == CONFIG.wod.sheettype.changeling) {
            this.variant = actor.system.settings.variant;
        }
        if (actor.type == CONFIG.wod.sheettype.changingbreed) {
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
        * Extend and override the default options used by the 5e Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["wod20 wod-dialog dialog-top"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-variant.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();

        data.actorData = this.actor.system;
        data.config = CONFIG.wod;    

        if (this.actor.type != CONFIG.wod.sheettype.changingbreed) {
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

        const actorData = duplicate(this.actor);

        if (this.object.type == CONFIG.wod.sheettype.changeling) {
            await CreateHelper.SetChangingVariant(actorData, this.object.variant);
        }
        else if (this.object.type == CONFIG.wod.sheettype.wraith) {
            actorData.system.settings.variant = this.object.variant;
        }
        else if (this.object.type == CONFIG.wod.sheettype.changingbreed) {
            await CreateHelper.SetShifterAttributes(actorData, this.object.variant);
        }
        else if (this.object.type == CONFIG.wod.sheettype.mortal) {
			await CreateHelper.SetMortalVariant(actorData, this.object.variant);
		}
        else if (this.object.type == CONFIG.wod.sheettype.creature) {
			await CreateHelper.SetCreatureVariant(this.actor, actorData, this.object.variant);
		}
        else {
            actorData.system.settings.variant = this.object.variant;
        }

        await this.actor.update(actorData);
        await CreateHelper.SetVariantItems(this.actor, this.object.variant);

        this.close();
    }

    /* clicked to close form */
    /* _closeForm(event) {
        this.object.close = true;
    }     */
}
