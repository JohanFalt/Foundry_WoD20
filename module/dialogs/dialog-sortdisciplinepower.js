export class SortDisciplinePower {
    constructor(item) {
        this._id = item["_id"];
        this.name = item["name"];
        this.level = item.system["level"];
        this.description = item.system["description"];
        this.system = item.system["system"];
        this.parentid = item.system["parentid"];
        this.disciplinelist = [];

        this.isDiscipline = true;
        this.isPath = false;
        this.canSave = false;
        this.close = false;
        this.sheettype = "vampireDialog";
    }
}

export class SortPathPower {
    constructor(item) {
        this._id = item["_id"];
        this.name = item["name"];
        this.level = item.system["level"];
        this.description = item.system["description"];
        this.system = item.system["system"];
        this.parentid = item.system["parentid"];
        this.disciplinelist = [];

        this.isDiscipline = false;
        this.isPath = true;
        this.canSave = false;
        this.close = false;
        this.sheettype = "vampireDialog";
    }
}

export class DialogSortDisciplinePower extends FormApplication {
    constructor(actor, power) {
        super(power, {submitOnChange: true, closeOnSubmit: false});
        this.actor = actor;
        
        this.options.title = `${this.actor.name}`;
    }


    /**
        * Extend and override the default options used by the 5e Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["sortdiscipline-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-sortdisciplinepower.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();

        data.actorData = this.actor.system;

        if (this.object.isDiscipline) {
            this.object.disciplinelist = this.actor.listeddisciplines;
        }
        if (this.object.isPath) {
            this.object.disciplinelist = this.actor.listedpaths;
        }

        data.config = CONFIG.wod;    

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.dialog-discipline-button')
            .click(this._setDiscipline.bind(this));        

        html
            .find('.actionbutton')
            .click(this._save.bind(this));

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
    }

    _setDiscipline(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-discipline-button");
        const id = element.value;   

        this.object.parentid = id;   
        this.object.canSave = true;

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == id) {
                $(this).addClass("active");
            }
        });
    }

    async _save(event) {
        if (!this.object.canSave) {
            return;
        }
    
        for (const item of this.actor.items) {
            if (item._id == this.object._id) {
                const itemData = duplicate(item);

                itemData.system.parentid = this.object.parentid;
                await item.update(itemData);

                this.close();
                return;
            }
        }
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    
}
