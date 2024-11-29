export class Bonus {
    constructor(actor, item, id) {
        this.actor = actor;
        this.item = item;
        this.bonusId = id;
        this.bonus = item.system.bonuslist[id];
        this.cansave = false;
    }
}

export class DialogBonus extends FormApplication {
    
    static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-dialog item-dialog"],
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
		});
	}

    constructor(actor, bonus) {
        super(bonus, {submitOnChange: true, closeOnSubmit: false});
        this.actor = actor;
        this.isDialog = true;
        
        this.options.title = game.i18n.localize("wod.labels.edit.bonus");
    }

    /** @override */
	get template() {
        return "systems/worldofdarkness/templates/dialogs/dialog-bonus.html";
	}    

    async getData() {
        const data = super.getData();

        data.config = CONFIG.worldofdarkness;
        data.object.sheettype = "mortalDialog";

        if ((this.actor?.type != undefined) && (this.actor?.type != CONFIG.worldofdarkness.sheettype.changingbreed)) {
            data.object.sheettype = this.actor.type.toLowerCase() + "Dialog";
        }
        else if (this.actor?.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
            data.object.sheettype = "werewolfDialog";
        }

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.inputdata')
            .change(event => this._onsheetChange(event));

        html
			.find('.selectdata')
			.change(event => this._onsheetChange(event));

        html
            .find('.actionbutton')
            .click(this._actionForm.bind(this));

        html
            .find('.savebutton')
            .click(this._saveForm.bind(this));
    }

    async _updateObject(event, formData){
        if (this.object.close) {
            this.close();
            return;
        }
    }

    async _onsheetChange(event) {
        event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		const source = dataset.source;
        let id = dataset.formid;
        const dtype = dataset.dtype;

        if (id == undefined) {
            id = source;
        }

        var e = document.getElementById(id);
		var value = e.value;

        if ((dtype == "Number") && (value == "")) {
            value = 0;
        }
        else if (dtype == "Number") {
            try{
                value = parseInt(value);

                if (isNaN(value)) {
                    value = 0;
                }
            }
            catch
            {
                value = 0;
            }
        }
        
        this.object.bonus[source] = value;

        if (source == "type") {
            this.object.bonus.value = 0;
        }
        if ((this.object.bonus.name == "") && (source == "type")) {
            let name = "wod.labels.new.bonus";

            this.object.bonus.name = game.i18n.localize(name);
        }

        this.object.cansave = true;

		this.render();
    }

    _actionForm(event) {
        event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

		const source = dataset.source;
        let value = dataset.value;
        const dtype = dataset.dtype;

        if ((dtype == "Number") && (value == "")) {
            value = 0;
        }
        else if (dtype == "Number") {
            try{
                value = parseInt(value);

                if (isNaN(value)) {
                    value = 0;
                }
            }
            catch
            {
                value = 0;
            }
        }
        
        this.object.bonus[source] = value;
        this.render();
    }

    async _saveForm(event) {
        if (this.object.close) {
            this.close();
            return;
        }

        event.preventDefault();
        
        if (this.object.item == undefined) {
             ui.notifications.warn(game.i18n.localize("wod.labels.bonus.savefail"));
             return;
        }

        let nameInput = document.getElementById("bonus_name");
		let name = nameInput.value;

        if (name != this.object.bonus.name) {
            this.object.bonus.name = name;
        }

        let valueInput = document.getElementById("bonus_value");

        if (valueInput != null) {
            let value = valueInput.value;

            if (parseInt(value) != parseInt(this.object.bonus.value)) {
                this.object.bonus.value = parseInt(value);
            }
        }		

        //const itemData = foundry.utils.duplicate(item);
        const itemData = foundry.utils.duplicate(this.object.item);

        let bonus = {
            name: this.object.bonus.name,
            settingtype: this.object.bonus.settingtype,
            type: this.object.bonus.type,
            value: parseInt(this.object.bonus.value),
            isactive: this.object.bonus.isactive
        }

        itemData.system.bonuslist[this.object.bonusId] = bonus
        await this.object.item.update(itemData);

        ui.notifications.info(game.i18n.localize("wod.labels.bonus.savesuccess"));

        this.object.cansave = false;
    } 
}
