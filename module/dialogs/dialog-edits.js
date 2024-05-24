export class Bio {
    constructor(item) {
        this.typeform = "bio";
        this.name = item.label;
        this.id = item.id;
        this.custom = item.custom;
    }
}

export class Attribute {
    constructor(item) {
        this.typeform = "attribute";
        this.name = item.label;
        this.speciality = item.speciality;
        this.id = item.id;
    }
}

export class Ability {
    constructor(item) {
        this.typeform = "ability";

        if(item.type == "Trait") {
            this.altlabel = "";
            this.issecondary = true;
            this.label = item.system.label;
            this.maxvalue = parseInt(item.system.max);
            this.name = item.name;
            this.speciality = item.system.speciality;
            this.type = item.system.type;
            this.value = parseInt(item.system.value);
            this.id = item._id;
            this.close = false;
        }
        else {
            this.altlabel = item.altlabel;
            this.issecondary = false;
            this.label = item.label;
            this.maxvalue = parseInt(item.max);
            this.name = item.name;
            this.speciality = item.speciality;
            this.type = item.type;
            this.value = parseInt(item.value);
            this.id = item._id;
            this.close = false;
        }        
    }
}

export class Sphere {
    constructor(item) {
        this.typeform = "sphere";
        this.name = item.label;
        this.speciality = item.speciality;
        this.istechnocracy = item.istechnocracy;
        this.id = item.id;
        this.value = parseInt(item.value);
    }
}

export class DialogBio extends FormApplication {
    
    static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-dialog"],
            closeOnSubmit: false,
            submitOnChange: false,
            resizable: true
		});
	}

    constructor(actor, item) {
        super(item, {submitOnChange: false, closeOnSubmit: false});
        this.actor = actor;
        this.isDialog = true;
        
        this.options.title = `${this.actor.name}`;
    }

    /** @override */
	get template() {
        return "systems/worldofdarkness/templates/dialogs/dialog-attribute.html";
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

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.actionbutton')
            .click(this._save.bind(this));
    }

    async _updateObject(event, formData) {
        event.preventDefault();       
    }

    async _save(event) {  
        this.object.custom = document.getElementById("custom").value;
        const actorData = duplicate(this.actor);

        //tribe
        if (this.object.id.length == 1) {
            const property = this.object.id[0]; 
            actorData.system.custom[property] = this.object.custom;
        }
        //advantages.path.label
        else {
            const area = this.object.id[0];	
            const property = this.object.id[1];
            const value = this.object.id[2];
            
            actorData.system[area][property].custom = this.object.custom;
        }
        await this.actor.update(actorData);
        this.close();
    }
}

export class DialogAttribute extends FormApplication {
    
    static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-dialog"],
            closeOnSubmit: false,
            submitOnChange: false,
            resizable: true
		});
	}

    constructor(actor, item) {
        super(item, {submitOnChange: false, closeOnSubmit: false});
        this.actor = actor;
        this.isDialog = true;
        
        this.options.title = `${this.actor.name}`;
    }

    /** @override */
	get template() {
        return "systems/worldofdarkness/templates/dialogs/dialog-attribute.html";
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

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.actionbutton')
            .click(this._save.bind(this));
    }

    async _updateObject(event, formData) {
        event.preventDefault();       
    }

    async _save(event) {  
        this.object.speciality = document.getElementById("speciality").value;

        const actorData = duplicate(this.actor);
        actorData.system.attributes[this.object.id].speciality = this.object.speciality;
        await this.actor.update(actorData);
        this.close();
    }
}

export class DialogAbility extends FormApplication {
    
    static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-dialog"],
            closeOnSubmit: false,
            submitOnChange: false,
            resizable: true
		});
	}

    constructor(actor, item) {
        super(item, {submitOnChange: false, closeOnSubmit: false});
        this.actor = actor;
        this.isDialog = true;
        
        this.options.title = `${this.actor.name}`;
    }

    /** @override */
	get template() {
        return "systems/worldofdarkness/templates/dialogs/dialog-attribute.html";
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

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.actionbutton')
            .click(this._save.bind(this));
    }

    async _updateObject(event, formData) {
        event.preventDefault();       
    }

    async _save(event) {  
        if (this.object.issecondary) {
            this.object.label = document.getElementById("label").value;
            this.object.speciality = document.getElementById("speciality").value;
        }
        else {
            this.object.altlabel = document.getElementById("altlabel").value;
            this.object.speciality = document.getElementById("speciality").value;
        }

        if (this.object.issecondary) {
            let item = await this.actor.getEmbeddedDocument("Item", this.object.id);
            const itemData = duplicate(item);
		    itemData.system.label = this.object.label;
            itemData.system.speciality = this.object.speciality;
		    await item.update(itemData);
        }
        else {
            const actorData = duplicate(this.actor);
            actorData.system.abilities[this.object.id].altlabel = this.object.altlabel;
            actorData.system.abilities[this.object.id].speciality = this.object.speciality;
            await this.actor.update(actorData);            
        }

        this.close();
    }
}

export class DialogSphere extends FormApplication {
    
    static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["wod20 wod-dialog"],
            closeOnSubmit: false,
            submitOnChange: false,
            resizable: true
		});
	}

    constructor(actor, item) {
        super(item, {submitOnChange: false, closeOnSubmit: false});
        this.actor = actor;
        this.isDialog = true;
        
        this.options.title = `${this.actor.name}`;
    }

    /** @override */
	get template() {
        return "systems/worldofdarkness/templates/dialogs/dialog-attribute.html";
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

        return data;
    }

    async _updateObject(event, formData) {
        event.preventDefault();       
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.actionbutton')
            .click(this._save.bind(this));
    }

    async _save(event) {  
        this.object.speciality = document.getElementById("speciality").value;
        this.object.istechnocracy = document.getElementById("technocracy").checked;

        const actorData = duplicate(this.actor);
        actorData.system.spheres[this.object.id].speciality = this.object.speciality;
        actorData.system.spheres[this.object.id].istechnocracy = this.object.istechnocracy;
        actorData.system.spheres[this.object.id].label = await this.setSphereName(this.object.id, this.object.istechnocracy);
        await this.actor.update(actorData);

        this.close();
    }

    async setSphereName(sphere, istechnocracy) {
        let label = "";

        switch(sphere) {
            case "correspondence":
                label = "wod.spheres.correspondence";
                break;
            case "entropy":
                label = "wod.spheres.entropy";
                break;
            case "forces":
                label = "wod.spheres.forces";
                break;
            case "life":
                label = "wod.spheres.life";
                break;
            case "matter":
                label = "wod.spheres.matter";
                break;
            case "mind":
                label = "wod.spheres.mind";
                break;
            case "prime":
                label = "wod.spheres.prime";
                break;
            case "spirit":
                label = "wod.spheres.spirit";
                break;
            case "time":
                label = "wod.spheres.time";
                break;
            default:
                break;
        }

        if (istechnocracy) {
            switch(sphere) {
                case "correspondence":
                    label = "wod.spheres.data";
                    break;
                case "entropy":
                    label = "wod.spheres.entropicstate";
                    break;
                case "forces":
                    label = "wod.spheres.forcebased";
                    break;
                case "life":
                    label = "wod.spheres.lifescience";
                    break;
                case "matter":
                    label = "wod.spheres.material";
                    break;
                case "mind":
                    label = "wod.spheres.psychodynamics";
                    break;
                case "prime":
                    label = "wod.spheres.primal";
                    break;
                case "spirit":
                    label = "wod.spheres.dimensional";
                    break;
                case "time":
                    label = "wod.spheres.temporalscience";
                    break;
                default:
                    break;
            }
        }

        return label;
    }
}
